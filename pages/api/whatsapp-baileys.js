// pages/api/whatsapp-baileys.js
// Flujo completo: chat + pedidos + inventario del día + filtro anti-charlatanes
// + resumen del dia para el dueño (numero telefonoDueno en doc empresas/{id})
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { enviarEmailCita, enviarEmailSoporte, enviarEmailPedido } from '../../lib/emailWasapbot';
import { evaluarMensaje } from '../../lib/filtroMensajes';
import { getConfigIndustria, horarioSemanalDefault } from '../../lib/wasapbotConfig';
import { verificarDisponibilidad, horariosDisponibles, normalizarFecha, formatearHora12, horarioSemanalATexto } from '../../lib/disponibilidad';

const openai         = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET  = process.env.SERVER_SECRET    || 'bqinzagencia2026';
const SOPORTE_NUMERO = process.env.SOPORTE_WHATSAPP || '34674421919';
const historiales    = new Map();
const pedidosEnCurso = new Map();

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtP(n) { return Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function calcTotal(items) { return items.reduce((a, it) => a + Number(it.precio || 0) * it.cantidad, 0); }
function resumenPedido(items) {
  return items.map(it => `• ${it.cantidad}x ${it.nombre} — ${fmtP(Number(it.precio||0)*it.cantidad)}€`).join('\n');
}

const PIDE_MENU_RE  = /\b(menu|menú|carta|catalogo|catálogo|platos?|productos?|foto|fotos|muestrame|muéstrame|qué (tienen|tienes|hay)|qué (ofrecen|ofrece)|ver (el )?menu|ver (el )?catalogo|que tienen|que hay)\b/i;
const CONFIRMA_RE   = /\b(si|sí|confirmar|confirmo|correcto|listo|dale|va|ok|enviar pedido|hacer pedido|eso es todo|eso es|si señor|de una)\b/i;
const CANCELA_RE    = /\b(cancelar|cancela|olvidalo|olvídalo|salir|no gracias)\b/i;
const VER_PEDIDO_RE = /\b(ver (mi )?pedido|resumen|total|cuanto (es|sale|vale|cuesta)|mi pedido|que llevo|que tengo)\b/i;

// Frases del DUEÑO para pedir el resumen del día (no consumen tokens de IA)
const RESUMEN_RE = /\b(resumen (del|de) (d[ií]a|hoy)|c[oó]mo va(n)? (el negocio|las ventas|el inventario|hoy)|reporte (del )?d[ií]a|c[uú]anto (vend[ií]|llevamos|hemos vendido)|ventas de hoy)\b/i;

async function getMenuDisponible(empresaId) {
  const diaKey = hoyKey();
  try {
    const diaSnap = await adminDb.collection('empresas').doc(empresaId).collection('menuDia').doc(diaKey).get();
    if (diaSnap.exists && diaSnap.data().abierto === true) {
      const items = (diaSnap.data().items || []).filter(it => it.activo !== false && it.stockActual > 0).sort((a, b) => (a.orden||0)-(b.orden||0));
      return { items, tieneInventario: true, diaKey };
    }
  } catch {}
  try {
    const catSnap = await adminDb.collection('empresas').doc(empresaId).collection('config').doc('conocimiento').get();
    const items = catSnap.exists ? (catSnap.data().servicios || []).filter(s => s.nombre?.trim()) : [];
    return { items, tieneInventario: false, diaKey };
  } catch {}
  return { items: [], tieneInventario: false, diaKey };
}

// ── Resumen del día para el dueño ─────────────────────────────
// Devuelve { inicio, fin } como Date en UTC correspondientes a las
// 00:00 y 24:00 de "hoy" en horario de España (Europe/Madrid, con horario de verano).
function inicioFinDiaEspana() {
  const ahoraEsp = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const y = ahoraEsp.getFullYear(), m = ahoraEsp.getMonth(), d = ahoraEsp.getDate();
  // Construimos inicio/fin del día en hora local de España usando el propio
  // objeto Date local (evita asumir un offset UTC fijo, ya que España cambia
  // de horario en verano/invierno).
  const inicio = new Date(y, m, d, 0, 0, 0);
  const fin    = new Date(y, m, d + 1, 0, 0, 0);
  return { inicio, fin };
}

async function generarResumenDia(empresaId, nombreEmpresa, diaKey) {
  const { inicio, fin } = inicioFinDiaEspana();

  // 1. Ventas / pedidos de hoy
  let totalVentas = 0, numPedidos = 0;
  try {
    const pedidosSnap = await adminDb.collection('empresas').doc(empresaId).collection('pedidos')
      .where('creadoEn', '>=', inicio).where('creadoEn', '<', fin).get();
    for (const doc of pedidosSnap.docs) {
      const p = doc.data();
      if (p.estado === 'cancelado') continue;
      totalVentas += Number(p.total || 0);
      numPedidos++;
    }
  } catch (e) { console.error('generarResumenDia pedidos:', e.message); }

  // 2. Citas agendadas para hoy
  let numCitas = 0;
  try {
    const citasSnap = await adminDb.collection('empresas').doc(empresaId).collection('citas')
      .where('fechaHora', '>=', inicio).where('fechaHora', '<', fin).get();
    for (const doc of citasSnap.docs) {
      const c = doc.data();
      if (['pendiente','confirmada','completada'].includes(c.estado)) numCitas++;
    }
  } catch (e) { console.error('generarResumenDia citas:', e.message); }

  // 3. Stock bajo (solo si el negocio maneja inventario diario)
  let stockBajo = [];
  try {
    const menuSnap = await adminDb.collection('empresas').doc(empresaId).collection('menuDia').doc(diaKey).get();
    if (menuSnap.exists) {
      stockBajo = (menuSnap.data().items || [])
        .filter(it => typeof it.stockActual === 'number' && it.stockActual <= 3 && it.activo !== false);
    }
  } catch (e) { console.error('generarResumenDia stock:', e.message); }

  let txt = `📊 *Resumen de hoy — ${nombreEmpresa}*\n\n`;

  if (numPedidos > 0) {
    txt += `💰 Ventas: ${fmtP(totalVentas)}€ en ${numPedidos} pedido${numPedidos===1?'':'s'}.\n`;
  } else {
    txt += `💰 Aún no hay pedidos registrados hoy.\n`;
  }

  if (numCitas > 0) {
    txt += `📅 Citas agendadas para hoy: ${numCitas}.\n`;
  }

  if (stockBajo.length > 0) {
    txt += `\n⚠️ *Stock bajo:*\n` + stockBajo.map(it => `• ${it.nombre} — quedan ${it.stockActual}`).join('\n');
  } else {
    txt += `\n✅ Sin alertas de stock bajo.`;
  }

  return txt;
}

async function descontarInventario(empresaId, pedidoItems, diaKey) {
  try {
    const docRef = adminDb.collection('empresas').doc(empresaId).collection('menuDia').doc(diaKey);
    const snap   = await docRef.get();
    if (!snap.exists) return;
    const menuItems = snap.data().items || [];
    const alertas   = [];
    let cambios     = false;
    for (const pedItem of pedidoItems) {
      const idx = menuItems.findIndex(mi => mi.nombre.toLowerCase() === pedItem.nombre.toLowerCase() || mi.itemId === pedItem.itemId);
      if (idx === -1) continue;
      const nuevo = Math.max(0, (menuItems[idx].stockActual||0) - (pedItem.cantidad||1));
      menuItems[idx].stockActual = nuevo;
      cambios = true;
      if (nuevo === 0) { menuItems[idx].activo = false; alertas.push({ nombre:menuItems[idx].nombre, tipo:'agotado', stock:0 }); }
      else if (nuevo <= 3 && !menuItems[idx].alertaEnviada) { menuItems[idx].alertaEnviada = true; alertas.push({ nombre:menuItems[idx].nombre, tipo:'bajo', stock:nuevo }); }
    }
    if (cambios) await docRef.update({ items: menuItems });
    if (alertas.length > 0) {
      const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
      const emp = empSnap.data();
      if (emp?.email) {
        const { enviarEmailInventario } = await import('../../lib/emailWasapbot');
        await enviarEmailInventario({ emailNegocio:emp.email, nombreNegocio:emp.nombreEmpresa||'tu negocio', alertas, panelUrl:`https://bqinzagencia.com/wasapbot/panel/inventario/${empresaId}` }).catch(()=>{});
      }
    }
  } catch (e) { console.error('descontarInventario:', e.message); }
}

function parsearSeleccion(texto, menu) {
  const seleccion = [];
  const textoL    = texto.toLowerCase();
  const nums      = texto.match(/\b(\d+)\b/g) || [];
  for (const numStr of nums) {
    const idx = parseInt(numStr) - 1;
    if (idx >= 0 && idx < menu.length) {
      const cantRe  = new RegExp(`(\\d+)\\s*(?:x\\s*)?(?:del?\\s*)?(?:plato\\s*)?\\b${numStr}\\b`);
      const cMatch  = texto.match(cantRe);
      const cantidad = (cMatch && parseInt(cMatch[1]) !== idx+1) ? parseInt(cMatch[1]) : 1;
      if (!seleccion.find(s => s.nombre === menu[idx].nombre)) seleccion.push({ ...menu[idx], cantidad });
    }
  }
  if (seleccion.length === 0) {
    for (const item of menu) {
      const nombreL = item.nombre.toLowerCase().split(' ')[0];
      if (textoL.includes(nombreL)) {
        const cantRe = new RegExp(`(\\d+)\\s*(?:x\\s*)?${nombreL}`, 'i');
        const m = texto.match(cantRe);
        const cant = m ? parseInt(m[1]) : 1;
        if (!seleccion.find(s => s.nombre === item.nombre)) seleccion.push({ ...item, cantidad: cant });
      }
    }
  }
  return seleccion;
}

async function registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respuesta) {
  try {
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, canal:'whatsapp', ultimoTexto:texto, ultimoMensaje:FieldValue.serverTimestamp(), contactoId }, { merge:true });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'cliente', texto, creadoEn:FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'agente', texto:respuesta, creadoEn:FieldValue.serverTimestamp() });
  } catch {}
}

// ── Base de conocimiento fija de Bqinz AgenciA (planes, precios, pagos) ──
// Se inyecta en el systemPrompt SOLO cuando la propia empresa es la agencia
// (empresa.esAgenciaPropia === true o empresa.industria === 'agencia_ia'),
// para que el bot de WhatsApp de Bqinz AgenciA pueda informar y vender sus
// propios planes sin depender de Firestore "conocimiento".
const BASE_CONOCIMIENTO_AGENCIA = `
BASE DE CONOCIMIENTO DE PLANES Y PRECIOS (IVA incluido, sin permanencia):
- Plan Básico (79€/mes): Bot de WhatsApp 24/7, lista de clientes automática, catálogo de productos, agendamiento de citas, inventario básico y notificaciones por email.
- Plan Estándar (149€/mes) — el más popular: añade panel de pedidos, inventario avanzado, reportes de ventas, transmisiones (broadcasts) masivas y soporte prioritario.
- Plan Pro (249€/mes): suma página web incluida, recordatorios de citas, CRM avanzado de clientes, múltiples agentes de IA y un gestor dedicado.

PRUEBA GRATUITA: Ofrecemos una prueba gratuita de 24 horas para que el cliente pruebe el bot sin compromiso, sin necesidad de tarjeta. Si preguntan por una prueba gratis, confírmalo y anímales a activarla.

FORMAS DE PAGO: Actualmente solo aceptamos pago por PayPal. Prioriza siempre informar esta opción cuando se pregunte cómo pagar. No menciones Bizum, tarjeta ni efectivo como formas de pago disponibles.`;

function esAgenciaPropia(empresa) {
  if (!empresa) return false;
  if (empresa.esAgenciaPropia === true) return true;
  if (empresa.industria === 'agencia_ia') return true;
  const nombre = String(empresa.nombreEmpresa || '').toLowerCase().replace(/[^a-z]/g, '');
  return nombre.includes('bqinzagenc'); // cubre "Bqinz AgenciA", "Bqinz Agencia", variantes de mayusculas
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-server-secret'] !== SERVER_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto } = req.body;
  if (!empresaId || !numeroCliente || !texto) return res.status(400).json({ error: 'Faltan campos' });

  try {
    // ── 1. Empresa ───────────────────────────────────────────
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) {
      historiales.delete(`${empresaId}_${numeroCliente}`);
      pedidosEnCurso.delete(`${empresaId}_${numeroCliente}`);
      return res.json({ respuesta: null, imagenes: [] });
    }
    const empresa       = empresaSnap.data();
    const nombreEmpresa = empresa.nombreEmpresa || 'nuestro negocio';
    const emailNegocio  = empresa.email || null;
    const nequi         = empresa.nequi || null;

    // ── 2. Verificar plan WasapBot pago O prueba gratis de 24h ──
    // planActivo + producto/planWasapbot cubre clientes de pago.
    // esPruebaGratis + trialHasta cubre la prueba de 24h: pasado ese plazo
    // se desactiva la empresa de forma persistente (lo haya usado o no),
    // y queda bloqueada hasta que contrate un plan real.
    const esPlanWasapbot = empresa.producto === 'wasapbot' || empresa.planWasapbot;
    let planActivo = empresa.planActivo === true && esPlanWasapbot;

    if (planActivo && empresa.esPruebaGratis) {
      const trialHasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : (empresa.trialHasta ? new Date(empresa.trialHasta) : null);
      if (trialHasta && Date.now() > trialHasta.getTime()) {
        // Prueba gratis cumplida: desactivar de forma persistente.
        planActivo = false;
        await adminDb.collection('empresas').doc(empresaId).update({
          planActivo: false, pruebaGratisFinalizada: true,
        }).catch(()=>{});
      }
    }

    // Si es empresa del dashboard agencIAme sin plan wasapbot específico → no responder
    // Las empresas de demo pueden usar el bot sin plan activo
    const esDemo = empresa.esDemo === true;
    if (!planActivo && !esDemo) {
      // Modo configuración — responde sin IA para no consumir tokens
      // El cliente sabe que el negocio existe pero está en configuración
      // (o que su prueba gratuita de 24h ya finalizó)
      const yaUsoPrueba = empresa.esPruebaGratis === true;
      const respConfig = empresa.mensajeConfiguracion ||
        (yaUsoPrueba
          ? `Hola, gracias por escribirnos 👋\n\nTu *prueba gratuita de 24 horas* en *${nombreEmpresa}* ha finalizado.\n\nPara seguir usando tu asistente virtual, activa uno de nuestros planes desde tu panel. 🚀`
          : `Hola, gracias por escribirnos 👋\n\n*${nombreEmpresa}* está en proceso de configuración de su asistente virtual.\n\nEn breve podremos atenderte mejor. Si necesitas algo urgente, comunícate directamente con nosotros.\n\n¡Gracias por tu paciencia! 🙏`);
      // Registrar el contacto en Firestore aunque no haya plan
      try {
        const contactosRef = adminDb.collection('empresas').doc(empresaId).collection('contactos');
        const cQuery = await contactosRef.where('telefono','==',numeroCliente).limit(1).get();
        if (cQuery.empty) {
          await contactosRef.add({ telefono:numeroCliente, nombre:`WhatsApp ${numeroCliente}`, canal:'whatsapp', fuente:'whatsapp-bot', estado:'nuevo', creadoEn:FieldValue.serverTimestamp() });
        }
      } catch {}
      return res.json({ respuesta: respConfig, imagenes: [] });
    }

    // ── 2.5. Resumen del día para el DUEÑO ───────────────────
    const telefonoDueno = String(empresa.telefonoDueno || '').replace(/\D/g, '');
    const numeroLimpio  = String(numeroCliente || '').replace(/\D/g, '');
    if (telefonoDueno && numeroLimpio === telefonoDueno && RESUMEN_RE.test(texto)) {
      const resumenTxt = await generarResumenDia(empresaId, nombreEmpresa, hoyKey());
      return res.json({ respuesta: resumenTxt, imagenes: [] });
    }

    // ── 2.6. Check de tokens ANTES de llamar a GPT ───────────
    if (!esDemo) {
      const esDueno = telefonoDueno && numeroLimpio === telefonoDueno;
      const PLAN_TOKENS_CHECK = { basico:50000, estandar:150000, pro:400000, wasapbot:0, emprendedor:50000, profesional:150000, prueba_5k:45000 };
      const mesKeyCheck = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
      if (esDueno) {
        const tokLimitDueno = Number(empresa.tokensLimiteDueno || 50000);
        const tokUsadoDueno = Number(empresa.tokensUsadosDueno || 0);
        if (tokLimitDueno > 0 && tokUsadoDueno > tokLimitDueno) {
          return res.json({ respuesta:`Has alcanzado tu límite mensual de créditos de agencia. Puedes ajustarlo en el panel de métricas.`, imagenes:[] });
        }
      } else {
        const tokLimitCheck = empresa.esPruebaGratis ? 45000 : (PLAN_TOKENS_CHECK[empresa.planWasapbot||empresa.plan||'wasapbot'] || 50000);
        if (tokLimitCheck > 0) {
          const tokSnapCheck = await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKeyCheck}`).get().catch(()=>null);
          const tokUsadoCheck = tokSnapCheck?.exists ? (tokSnapCheck.data().usado || 0) : 0;
          if (tokUsadoCheck > tokLimitCheck) {
            if (empresa.esPruebaGratis) {
              await adminDb.collection('empresas').doc(empresaId).update({ planActivo: false, pruebaGratisFinalizada: true }).catch(()=>{});
              return res.json({ respuesta:`Has alcanzado el límite de tu *prueba gratuita* en ${nombreEmpresa}. Para seguir usando tu asistente, activa uno de nuestros planes desde tu panel. 🚀`, imagenes:[] });
            }
            return res.json({ respuesta:`El servicio de ${nombreEmpresa} ha alcanzado su límite mensual.`, imagenes:[] });
          }
        }
      }
    }

    // ── 3. Menú disponible ───────────────────────────────────
    const { items: menuDisponible, tieneInventario, diaKey } = await getMenuDisponible(empresaId);
    const itemsConFoto   = menuDisponible.filter(s => s.foto?.startsWith('http'));
    const permitePedidos = ['restaurante','reposteria','tienda','farmacia'].includes(empresa.industria);

    // ── 4. Contacto ──────────────────────────────────────────
    const contactosRef = adminDb.collection('empresas').doc(empresaId).collection('contactos');
    const cQuery       = await contactosRef.where('telefono','==',numeroCliente).limit(1).get();
    let contactoId, nombreCliente = null;
    if (cQuery.empty) {
      const doc  = await contactosRef.add({ telefono:numeroCliente, nombre:`WhatsApp ${numeroCliente}`, canal:'whatsapp', fuente:'whatsapp-bot', estado:'nuevo', creadoEn:FieldValue.serverTimestamp() });
      contactoId = doc.id;
    } else {
      const snap    = cQuery.docs[0];
      contactoId    = snap.id;
      nombreCliente = snap.data().nombre;
      if (!nombreCliente || nombreCliente.startsWith('WhatsApp ')) nombreCliente = null;
    }

    // ── 5. Sesión / historial ────────────────────────────────
    // Firestore es la fuente de verdad para el historial Y el pedido en curso.
    // Vercel es serverless y reinicia entre peticiones, así que nunca
    // confiamos en los Maps en memoria para estado crítico.
    const sesionKey = `${empresaId}_${numeroCliente}`;
    const sesionRef = adminDb.collection('wasapbot_sesiones').doc(sesionKey);

    // Cargar sesión persistida en Firestore
    let historial = [];
    let pedidoPersistido = null;
    try {
      const sesSnap = await sesionRef.get();
      if (sesSnap.exists) {
        const sesData = sesSnap.data();
        historial = sesData.historial || [];
        pedidoPersistido = sesData.pedidoEnCurso || null;
      } else {
        // Primera vez: reconstruir historial desde conversaciones
        const convKey = `wa_${numeroCliente}`;
        const msgsSnap = await adminDb.collection('empresas').doc(empresaId)
          .collection('conversaciones').doc(convKey).collection('mensajes')
          .orderBy('creadoEn', 'desc').limit(10).get();
        historial = msgsSnap.docs.reverse().map(d => {
          const m = d.data();
          return { role: m.rol === 'agente' ? 'assistant' : 'user', content: m.texto || '' };
        });
      }
    } catch (e) { console.error('cargar sesion Firestore:', e.message); }

    // Sincronizar Maps en memoria (por si hay varias peticiones rápidas)
    if (!historiales.has(sesionKey)) historiales.set(sesionKey, historial);
    if (pedidoPersistido && !pedidosEnCurso.has(sesionKey)) pedidosEnCurso.set(sesionKey, pedidoPersistido);

    // Helper para guardar sesión en Firestore después de cada turno
    async function guardarSesion() {
      try {
        await sesionRef.set({
          empresaId,
          numeroCliente,
          historial: historiales.get(sesionKey) || [],
          pedidoEnCurso: pedidosEnCurso.get(sesionKey) || null,
          actualizadoEn: FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (e) { console.error('guardarSesion:', e.message); }
    }

    // ── 6. FILTRO ANTI-CHARLATANES ───────────────────────────
    // Se aplica antes de cualquier llamada a GPT para no consumir tokens
    // Excepción: si el cliente está en medio de un pedido activo, siempre pasa
    const pedidoActivo = pedidosEnCurso.get(sesionKey);
    const enPedido     = pedidoActivo && pedidoActivo.paso !== 'idle';

    if (!enPedido) {
      const evaluacion = evaluarMensaje(texto, empresa.industria || '', historial.length);
      if (!evaluacion.pasar) {
        // Respuesta guía sin consumir tokens
        const respGuia = historial.length === 0
          ? `👋 Hola, soy el asistente virtual de *${nombreEmpresa}*.\n\n¿En qué te puedo ayudar? Cuéntame qué necesitas.`
          : `Estoy aquí para ayudarte con información sobre *${nombreEmpresa}*. ¿Tienes alguna pregunta sobre nuestros servicios? 😊`;
        await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respGuia);
        return res.json({ respuesta: respGuia, imagenes: [], filtrado: true });
      }
    }

    // ── 7. FLUJO DE PEDIDOS ──────────────────────────────────
    if (permitePedidos && menuDisponible.length > 0) {
      const pedido = pedidosEnCurso.get(sesionKey) || { items: [], paso: 'idle' };

      if (PIDE_MENU_RE.test(texto) && pedido.paso === 'idle') {
        pedidosEnCurso.set(sesionKey, { items:[], paso:'pidiendo', diaKey });
        const listaMenu = menuDisponible.map((item, i) => {
          let linea = `*${i+1}.* ${item.nombre}`;
          if (item.precio) linea += ` — ${fmtP(item.precio)}€`;
          if (tieneInventario && item.stockActual <= 5) linea += ` _(${item.stockActual} disponibles)_`;
          return linea;
        }).join('\n\n');
        const respMenu = `🍽️ *Menú de ${nombreEmpresa}*\n\n${listaMenu}\n\n📝 ¿Qué deseas pedir? Escribe el número o el nombre:\n_Ej: "1 bandeja y 2 limonadas"_\n\nEscribe *"ver pedido"* para ver tu selección\nEscribe *"cancelar"* para salir`;
        const imagenes = itemsConFoto.slice(0,6).map(s => ({ url:s.foto, caption:`*${s.nombre}*${s.precio?`\n💰 ${fmtP(s.precio)}€`:''}${s.descripcion?`\n${s.descripcion}`:''}` }));
        await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respMenu);
        return res.json({ respuesta: respMenu, imagenes });
      }

      if (pedido.paso === 'pidiendo' || pedido.paso === 'confirmando') {
        if (VER_PEDIDO_RE.test(texto)) {
          const total = calcTotal(pedido.items);
          const resp  = pedido.items.length > 0
            ? `🛒 *Tu pedido:*\n\n${resumenPedido(pedido.items)}\n\n💵 *Total: ${fmtP(total)}€*\n\n¿Agregar algo más o escribir *"confirmar"*?`
            : `Tu pedido está vacío. Dime qué quieres pedir.`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }
        if (CANCELA_RE.test(texto) && pedido.paso === 'confirmando') {
          pedidosEnCurso.set(sesionKey, { items:[], paso:'idle' });
          const resp = `Pedido cancelado ❌\n\n¿En qué más puedo ayudarte?`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          await guardarSesion();
          return res.json({ respuesta: resp, imagenes: [] });
        }
        if (CONFIRMA_RE.test(texto) && pedido.paso === 'confirmando' && pedido.items.length > 0) {
          const total = calcTotal(pedido.items);
          const pedidoRef = await adminDb.collection('empresas').doc(empresaId).collection('pedidos').add({
            nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente,
            items:pedido.items, total, estado:'pendiente', canal:'whatsapp', contactoId, creadoEn:FieldValue.serverTimestamp(),
          });
          await descontarInventario(empresaId, pedido.items, pedido.diaKey||diaKey);
          pedidosEnCurso.set(sesionKey, { items:[], paso:'idle' });
          await enviarEmailPedido({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nombreCliente||`+${numeroCliente}`, telefono:numeroCliente, items:pedido.items, total, nequi, empresaId, pedidoId:pedidoRef.id }).catch(()=>{});
          let respConf = `✅ *¡Pedido confirmado!* 🎉\n\n📋 *#${pedidoRef.id.slice(-6).toUpperCase()}*\n${resumenPedido(pedido.items)}\n\n💵 *Total: ${fmtP(total)}€*\n\n`;
          if (nequi) respConf += `💳 *Pago por Bizum:*\n📱 ${nequi}\n\n`;
          respConf += `⏳ Tu pedido está *en proceso*. ¡Gracias! 🙏`;
          await adminDb.collection('empresas').doc(empresaId).update({ pedidosTotal:FieldValue.increment(1), ultimaActividad:FieldValue.serverTimestamp() }).catch(()=>{});
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respConf);
          return res.json({ respuesta: respConf, imagenes: [] });
        }
        const seleccion = parsearSeleccion(texto, menuDisponible);
        if (seleccion.length > 0) {
          const nuevosItems = [...pedido.items];
          for (const sel of seleccion) {
            const existe = nuevosItems.findIndex(it => it.nombre === sel.nombre);
            if (existe >= 0) nuevosItems[existe].cantidad += sel.cantidad;
            else nuevosItems.push(sel);
          }
          const nuevoTotal = calcTotal(nuevosItems);
          pedidosEnCurso.set(sesionKey, { items:nuevosItems, paso:'confirmando', diaKey });
          const agregados = seleccion.map(s=>`${s.cantidad}x ${s.nombre}`).join(', ');
          const resp = `✅ Agregado: *${agregados}*\n\n🛒 *Tu pedido:*\n${resumenPedido(nuevosItems)}\n\n💵 *Total: ${fmtP(nuevoTotal)}€*\n\n¿Deseas algo más?\n• Escribe *"confirmar"* para finalizar\n• O sigue eligiendo del menú`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }
      }
    }

    // ── 8. Flujo GPT ─────────────────────────────────────────
    historial.push({ role:'user', content:texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    let horarioTexto = '';
    const conocimiento = await adminDb.collection('empresas').doc(empresaId).collection('config').doc('conocimiento').get().then(s=>s.exists?s.data():null).catch(()=>null);
    if (conocimiento?.horarios?.general) horarioTexto = conocimiento.horarios.general;
    else if (conocimiento?.horarios?.semanal) horarioTexto = horarioSemanalATexto(conocimiento.horarios.semanal);
    else if (conocimiento?.horarios) {
      const dias = Object.entries(conocimiento.horarios).filter(([,v])=>v?.activo).map(([d,v])=>`${d}: ${v.desde||'?'}-${v.hasta||'?'}`);
      if (dias.length) horarioTexto = dias.join(', ');
    }

    // ── Agente IA configurado desde el panel (Mis Agentes IA → Editar) ──
    // Se busca el agente activo con canal 'whatsapp' para esta empresa.
    // Su campo `prompt` (texto libre escrito por el dueño del negocio en el
    // panel) se inyecta en el systemPrompt como conocimiento específico,
    // ADEMAS de las reglas fijas de España/euros/brevedad (que no se pueden
    // sobreescribir desde el panel, para mantener formato consistente).
    let promptAgente = '';
    let personalidadAgente = '';
    try {
      const agentesSnap = await adminDb.collection('empresas').doc(empresaId).collection('agentes')
        .where('activo', '==', true).get();
      const agenteWA = agentesSnap.docs
        .map(d => d.data())
        .find(a => Array.isArray(a.canales) && a.canales.includes('whatsapp'));
      if (agenteWA) {
        promptAgente       = agenteWA.prompt || '';
        personalidadAgente = agenteWA.personalidad || '';
      }
    } catch (e) { console.error('lectura agente whatsapp:', e.message); }

    const ahoraEsp  = new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Madrid'}));
    const diaActual = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahoraEsp.getDay()];
    const horaStr   = `${String(ahoraEsp.getHours()).padStart(2,'0')}:${String(ahoraEsp.getMinutes()).padStart(2,'0')}`;
    const fechaStr  = `${String(ahoraEsp.getDate()).padStart(2,'0')}/${String(ahoraEsp.getMonth()+1).padStart(2,'0')}/${ahoraEsp.getFullYear()}`;

    const menuTexto = menuDisponible.length > 0
      ? menuDisponible.map(s=>`• ${s.nombre}${s.precio?` — ${fmtP(s.precio)}€`:''}${s.descripcion?` — ${s.descripcion}`:''}`).join('\n')
      : 'Catálogo en actualización.';

    const esAgencia = esAgenciaPropia(empresa);

    // ── Regla extra exclusiva del negocio "maquinaria" ────────────
    // Para citas/visitas de maquinaria, el bot SIEMPRE debe capturar nombre,
    // teléfono y correo del interesado antes de confirmar la cita previa —
    // son datos clave para el seguimiento comercial de venta de equipos.
    const esMaquinaria = empresa.industria === 'maquinaria';
    const reglaMaquinaria = esMaquinaria ? `
REGLA EXTRA OBLIGATORIA PARA ESTE NEGOCIO (MAQUINARIA):
- Antes de confirmar cualquier cita previa o visita para ver una máquina, DEBES tener: nombre completo, teléfono de contacto y correo electrónico del interesado. Si falta alguno, pídelo antes de continuar — no agendes sin estos 3 datos.
- Indica siempre la ubicación exacta de la máquina (la que aparece en su descripción del catálogo) cuando el cliente pregunte por una en concreto.
- Las visitas a ver la maquinaria son SIEMPRE con cita previa — nunca digas que se puede ir sin avisar.
` : '';

    const systemPrompt = `SÉ UN AGENTE DE ATENCIÓN AL CLIENTE EXPERTO, PROFESIONAL Y REFORZADO PARA EL MERCADO ESPAÑOL.
Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria||'negocio'} en ${empresa.ciudad||'España'}.
Tu único objetivo es atender a los usuarios, resolver sus dudas sobre el negocio basándote ESTRICTAMENTE en la información proporcionada y guiarlos hacia la reserva de un servicio o la contratación de un plan.
Fecha y hora: ${diaActual} ${fechaStr} ${horaStr}.
${horarioTexto?`HORARIO: ${horarioTexto}`:''}

REGLAS CRÍTICAS DE COMPORTAMIENTO Y ESTILO (MERCADO ESPAÑOL):
1. IDIOMA Y TONO: Habla siempre en español de España (castellano neutro/profesional). Utiliza un tono educado, cercano pero corporativo, ágil y resolutivo. Evita expresiones latinoamericanas como "celular", "carro", "computadora" o "platicar". Usa "móvil", "coche", "ordenador" o "hablar/conversar".
2. TRATAMIENTO: Trata al cliente de "tú" de forma natural y respetuosa, a menos que el contexto o su forma de hablar exijan "usted".
3. DIVISA: Todos los precios deben mostrarse obligatoriamente en Euros utilizando el símbolo "€" (por ejemplo: 79€). Nunca hables de dólares, pesos ni de otras monedas.
4. BREVEDAD: Sé extremadamente conciso. Tus respuestas en WhatsApp no deben superar los 2 o 3 párrafos cortos (máximo 60-80 palabras por respuesta). Ve directo al grano.
5. NO INVENTAR: Si el usuario pregunta algo que NO está en tu base de conocimiento, responde amablemente que no dispones de ese dato en este momento y ofrécele dejar una nota para que un agente humano le contacte por WhatsApp.
6. ORTOGRAFÍA: Aplica correctamente las reglas del español. En particular, usa "e" en vez de "y" cuando la palabra siguiente empieza por el sonido "i" (ejemplo: "reforma de baño e instalación", no "reforma de baño y instalación"); usa "u" en vez de "o" cuando la palabra siguiente empieza por el sonido "o" (ejemplo: "7 u 8", no "7 o 8").

CONTEXTO DE CONVERSACIÓN: Si el cliente responde con una palabra corta como "sí", "no", "ok", "dale", "claro", debes interpretarla SIEMPRE en el contexto del último mensaje que enviaste. NUNCA respondas como si fuera el inicio de una nueva conversación cuando hay historial previo.

REGLA PRINCIPAL: Responde ÚNICAMENTE preguntas relacionadas con el negocio (servicios, precios, horarios, ubicación, pedidos, citas). Si el mensaje no tiene relación con el negocio, redirígelo amablemente.

MENU/CATALOGO (solo estos items, nunca inventes):
${menuTexto}
${promptAgente ? `
INFORMACIÓN ESPECÍFICA DEL NEGOCIO (configurada por el dueño en su panel — úsala como fuente principal de verdad):\n${promptAgente}` : (esAgencia ? BASE_CONOCIMIENTO_AGENCIA : '')}
${personalidadAgente ? `\nPERSONALIDAD DEL AGENTE: ${personalidadAgente}.` : ''}

${permitePedidos?'El negocio acepta pedidos. El sistema guiará al cliente automáticamente cuando pida el menú.':''}

FLUJO DE ATENCIÓN Y CONVERSIÓN:
1. NUNCA inventes productos, servicios o precios que no estén en la base de conocimiento.
2. Si no dio nombre, pídelo una sola vez, sin insistir más.
3. Si el cliente confirma que quiere contratar o reservar, solicita de forma ordenada: nombre, plan o servicio deseado, y día/hora aproximada. Una vez obtenidos, indícale que su solicitud está siendo procesada.
4. Incluye siempre una llamada a la acción clara al final cuando tenga sentido, del tipo: "¿Te viene bien que agendemos una cita para esta semana?" o "¿Te gustaría activar alguno de estos planes?".
${reglaMaquinaria}
5. Cita: cuando tengas nombre, servicio, fecha y hora del cliente, emite OBLIGATORIAMENTE en la misma respuesta el tag:
CITA_DETECTADA: {"nombre":"X","servicio":"X","fecha":"DD/MM/YYYY","hora":"HH:MM"${esMaquinaria ? ',"telefono":"X","correo":"X"' : ''}}
REGLAS ESTRICTAS DEL TAG:
- SIEMPRE en la última línea de tu respuesta
- NUNCA omitirlo cuando tengas los 4 datos
- La fecha SIEMPRE en formato DD/MM/YYYY (convierte "miércoles" a la fecha real)
- La hora SIEMPRE en formato HH:MM (convierte "11am" a "11:00", "4pm" a "16:00")
- Tu texto visible al cliente debe ser SOLO: "Voy a verificar disponibilidad para el [día] a las [hora]. Un momento..."
- NO confirmes la cita en el texto, el sistema lo hará automáticamente
Ejemplo correcto:
Voy a verificar disponibilidad para el miércoles a las 11:00. Un momento...
CITA_DETECTADA: {"nombre":"Juan","servicio":"corte de pelo","fecha":"25/06/2026","hora":"11:00"}
6. Asesor: SOPORTE_SOLICITADO: {"nombre":"X","motivo":"X"}${nombreCliente?`\nNOMBRE: ${nombreCliente}.`:''}
${conocimiento?.info?.direccion?`DIRECCIÓN: ${conocimiento.info.direccion}`:''}`;

    const completion = await openai.chat.completions.create({
      model:'gpt-4o-mini', max_tokens:600,
      messages:[{role:'system',content:systemPrompt},...historial],
    });
    const respuesta    = completion.choices[0]?.message?.content || '';
    historial.push({ role:'assistant', content:respuesta });

    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
      await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`).set({ usado:FieldValue.increment(tokensUsados), empresaId, mes:mesKey },{merge:true}).catch(()=>{});
    }

    const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:0, emprendedor:50000, profesional:150000, prueba_5k:45000 };
    const tokLimit = empresa.esPruebaGratis ? 45000 : (PLAN_TOKENS[empresa.planWasapbot||empresa.plan||'wasapbot'] || 50000);
    // Usar siempre la clave del mes actual — nunca mezclar meses
    const mesKey2 = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const tokDocId = `${empresaId}_${mesKey2}`;
    const tokSnap  = await adminDb.collection('wasapbot_tokens').doc(tokDocId).get().catch(()=>null);
    const tokUsadoMes = tokSnap?.exists ? (tokSnap.data().usado || 0) : 0;
    if (tokLimit > 0 && tokUsadoMes > tokLimit) {
      if (empresa.esPruebaGratis) {
        // Tope de tokens del trial agotado: desactivar de forma persistente,
        // igual que al cumplirse las 24h — lo haya usado o no.
        await adminDb.collection('empresas').doc(empresaId).update({
          planActivo: false, pruebaGratisFinalizada: true,
        }).catch(()=>{});
        return res.json({ respuesta:`Has alcanzado el límite de tu *prueba gratuita* en ${nombreEmpresa}. Para seguir usando tu asistente, activa uno de nuestros planes desde tu panel. 🚀`, imagenes:[] });
      }
      return res.json({ respuesta:`El servicio de ${nombreEmpresa} ha alcanzado su límite mensual.`, imagenes:[] });
    }

    const nombreDetectado = extraerNombre(texto);
    if (nombreDetectado && (!nombreCliente||nombreCliente.startsWith('WhatsApp ')))
      await contactosRef.doc(contactoId).update({ nombre:nombreDetectado }).catch(()=>{});

    await adminDb.collection('empresas').doc(empresaId).update(
      telefonoDueno && numeroLimpio === telefonoDueno
        ? { tokensUsadosDueno: FieldValue.increment(tokensUsados), ultimaActividad: FieldValue.serverTimestamp() }
        : { tokensUsados: FieldValue.increment(tokensUsados), conversaciones: FieldValue.increment(1), ultimaActividad: FieldValue.serverTimestamp() }
    ).catch(()=>{});

    let respuestaLimpia = respuesta.replace(/\n?CITA_DETECTADA:.*$/m,'').replace(/\n?SOPORTE_SOLICITADO:.*$/m,'').trim();

    if (/SOPORTE_SOLICITADO/.test(respuesta)||/soporte|asesor|humano|persona real/i.test(texto)) {
      try {
        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, mensaje:texto, estado:'pendiente', creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailSoporte({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nombreCliente||`+${numeroCliente}`, telefono:numeroCliente, mensaje:texto, empresaId });
      } catch {}
    }

    // ── Resolver fechas relativas ("viernes", "mañana", "el lunes") antes
    // de pasarlas a verificarDisponibilidad, que solo acepta DD/MM/YYYY.
    function resolverFechaRelativa(fechaStr) {
      if (!fechaStr) return null;
      const s = fechaStr.trim().toLowerCase();
      const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
      const DIAS = { domingo:0, lunes:1, martes:2, miércoles:3, miercoles:3, jueves:4, viernes:5, sábado:6, sabado:6 };
      if (s === 'hoy') return `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`;
      if (s === 'mañana' || s === 'manana') {
        const d = new Date(hoy); d.setDate(d.getDate()+1);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      }
      if (s === 'pasado mañana' || s === 'pasado manana') {
        const d = new Date(hoy); d.setDate(d.getDate()+2);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      }
      for (const [nombre, numDia] of Object.entries(DIAS)) {
        if (s.includes(nombre)) {
          const d = new Date(hoy);
          const diff = (numDia - hoy.getDay() + 7) % 7 || 7; // si es hoy mismo, va al próximo
          d.setDate(d.getDate() + diff);
          return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        }
      }
      return fechaStr; // ya viene en formato DD/MM/YYYY u otro
    }

    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    console.log('DEBUG respuesta GPT:', JSON.stringify(respuesta));
    console.log('DEBUG citaMatch:', citaMatch ? citaMatch[1] : 'NO ENCONTRADO');
    if (citaMatch) {
      try {
        const c = JSON.parse(citaMatch[1]);
        c.fecha = resolverFechaRelativa(c.fecha); // convierte "viernes", "mañana", etc. a DD/MM/YYYY
        const nomCita = c.nombre||nombreCliente||`WhatsApp ${numeroCliente}`;
        const cfgInd  = getConfigIndustria(empresa.industria || 'otro');

        if (cfgInd.tieneCitas) {
          // ── Verificar disponibilidad real antes de agendar (evita solapamientos) ──
          const horarioSemanal   = conocimiento?.horarios?.semanal || horarioSemanalDefault();
          const duracionServicio = buscarDuracionServicio(conocimiento?.servicios, c.servicio);
          const fechaKeySolicitada = normalizarFecha(c.fecha);

          let ocupados = [];
          if (fechaKeySolicitada) {
            const ocupSnap = await adminDb.collection('empresas').doc(empresaId).collection('citas')
              .where('fechaKey','==',fechaKeySolicitada).get();
            ocupados = ocupSnap.docs
              .map(d=>d.data())
              .filter(o=>['pendiente','confirmada'].includes(o.estado))
              .map(o=>({ hora:o.hora, duracionMin:o.duracionMin }));
          }

          const disp = verificarDisponibilidad({ horarioSemanal, fecha:c.fecha, hora:c.hora, duracionMin:duracionServicio, ocupados });

          if (disp.disponible) {
            await adminDb.collection('empresas').doc(empresaId).collection('citas').add({
              nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta',
              fechaHora:parsearFechaHora(c.fecha,c.hora), fecha:c.fecha||'', hora:c.hora||'',
              fechaKey:disp.fechaKey, duracionMin:duracionServicio,
              estado:'pendiente', canal:'whatsapp', fuente:'whatsapp-bot', notas:'Agendado por WasapBot',
              contactoId, creadoEn:FieldValue.serverTimestamp(),
              recordatorioEnviado:false, seguimientoEnviado:false, completadoEn:null,
              ...(c.telefono?{telefonoContacto:c.telefono}:{}),
              ...(c.correo?{correoContacto:c.correo}:{}),
            });
            await enviarEmailCita({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fecha:c.fecha||'?', hora:c.hora||'?', empresaId });
            // Reemplazar la respuesta provisional de GPT ("voy a verificar...")
            // con la confirmación real ahora que el sistema confirmó disponibilidad.
            respuestaLimpia = `✅ *¡Cita confirmada, ${nomCita}!* 🎉\n\n🗓️ *${c.servicio||'Consulta'}*\n📅 ${c.fecha||'?'} a las ${c.hora||'?'}\n📍 ${nombreEmpresa}\n\nRecibió un correo de confirmación. Si necesitas cambiar o cancelar, escríbenos. 🙏`;
          } else {
            // No se crea la cita — se reemplaza la respuesta de la IA por una
            // que informa al cliente y ofrece horarios alternativos reales.
            respuestaLimpia = mensajeNoDisponible(disp, { horarioSemanal, fecha:c.fecha, duracionMin:duracionServicio, ocupados, nombreCliente:c.nombre });
          }
        } else {
          // Industrias sin agenda de citas (ej. restaurante/tienda con pedidos):
          // comportamiento anterior, sin chequeo de disponibilidad.
          await adminDb.collection('empresas').doc(empresaId).collection('citas').add({
            nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta',
            fechaHora:parsearFechaHora(c.fecha,c.hora), fecha:c.fecha||'', hora:c.hora||'',
            estado:'pendiente', canal:'whatsapp', fuente:'whatsapp-bot', notas:'Agendado por WasapBot',
            contactoId, creadoEn:FieldValue.serverTimestamp(),
            recordatorioEnviado:false, seguimientoEnviado:false, completadoEn:null,
          });
          await enviarEmailCita({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fecha:c.fecha||'?', hora:c.hora||'?', empresaId });
        }
      } catch (e) { console.error('cita error:', e.message); }
    }

    let imagenes = [];
    if (PIDE_MENU_RE.test(texto) && itemsConFoto.length > 0) {
      imagenes = itemsConFoto.slice(0,6).map(s=>({ url:s.foto, caption:`*${s.nombre}*${s.precio?`\n💰 ${fmtP(s.precio)}€`:''}${s.descripcion?`\n${s.descripcion}`:''}` }));
    }

    await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respuestaLimpia);
    await guardarSesion();
    return res.json({ respuesta: respuestaLimpia, imagenes });

  } catch (err) {
    console.error('whatsapp-baileys error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Disponibilidad de citas ───────────────────────────────────
// Busca la duracion (minutos) configurada para el servicio detectado por la IA.
// Hace match exacto primero y luego por inclusion (en ambos sentidos), ya que
// el nombre que dice el cliente/IA puede no coincidir 100% con el del catalogo.
function buscarDuracionServicio(servicios, nombreServicio) {
  const DEFAULT_DURACION = 30;
  if (!Array.isArray(servicios) || !nombreServicio) return DEFAULT_DURACION;
  const target = String(nombreServicio).toLowerCase().trim();
  if (!target) return DEFAULT_DURACION;

  let match = servicios.find(s => String(s?.nombre||'').toLowerCase().trim() === target);
  if (!match) {
    match = servicios.find(s => {
      const n = String(s?.nombre||'').toLowerCase().trim();
      return n && (n.includes(target) || target.includes(n));
    });
  }
  const dur = parseInt(match?.duracionMin, 10);
  return (dur > 0) ? dur : DEFAULT_DURACION;
}

// Construye el mensaje que se envia al cliente cuando el horario solicitado
// NO esta disponible (cerrado / fuera de horario / ya ocupado), ofreciendo
// alternativas reales calculadas con horariosDisponibles().
function mensajeNoDisponible(disp, { horarioSemanal, fecha, duracionMin, ocupados, nombreCliente }) {
  const saludo = nombreCliente ? `${nombreCliente}, ` : '';

  if (disp.motivo === 'fecha_invalida' || disp.motivo === 'hora_invalida') {
    return `Disculpa, no entendí bien la fecha u hora 🙏 ¿Podrías indicarme el día (ej: 20/06) y la hora que prefieres?`;
  }
  if (disp.motivo === 'cerrado') {
    return `${saludo}ese día no abrimos 🙏 ¿Te gustaría agendar para otro día?`;
  }

  const libres = horariosDisponibles({ horarioSemanal, fecha, duracionMin, ocupados }).slice(0, 6);
  const listaLibres = libres.map(formatearHora12).join(', ');

  if (disp.motivo === 'ocupado') {
    return libres.length > 0
      ? `${saludo}ese horario ya está ocupado 😕. Para ese día tengo disponible: ${listaLibres}. ¿Cuál te queda mejor?`
      : `${saludo}ese horario ya está ocupado y no quedan más espacios disponibles ese día 😕. ¿Quieres que busquemos otro día?`;
  }
  if (disp.motivo === 'fuera_horario') {
    return libres.length > 0
      ? `${saludo}ese horario está fuera de nuestra atención 🙏. Ese día tengo disponible: ${listaLibres}. ¿Cuál te queda mejor?`
      : `${saludo}ese horario está fuera de nuestra atención y no quedan espacios libres ese día 🙏. ¿Quieres agendar para otro día?`;
  }
  return `Disculpa, no pude agendar ese horario 🙏 ¿Podríamos intentar con otro día u hora?`;
}

function extraerNombre(texto) {
  const pats = [
    /(?:me llamo|soy|mi nombre es|habla|te escribe)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i,
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)(?:,| aqui| acá)/i,
  ];
  for (const p of pats) {
    const m = texto.match(p);
    if (m?.[1]?.length > 2 && m[1].length < 40) return m[1].trim();
  }
  return null;
}

function parsearFechaHora(fecha, hora) {
  try {
    const p = (fecha||'').match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (!p) return new Date();
    const anio = p[3]?parseInt(p[3]):new Date().getFullYear();
    const hp   = (hora||'').match(/(\d{1,2}):?(\d{2})?/);
    return new Date(anio<100?2000+anio:anio, parseInt(p[2])-1, parseInt(p[1]), hp?parseInt(hp[1]):9, hp?.[2]?parseInt(hp[2]):0);
  } catch { return new Date(); }
}
