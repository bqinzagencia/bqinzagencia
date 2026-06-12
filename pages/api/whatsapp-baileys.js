// pages/api/whatsapp-baileys.js
// Flujo completo: chat + pedidos + inventario del día + filtro anti-charlatanes
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { enviarEmailCita, enviarEmailSoporte, enviarEmailPedido } from '../../lib/emailWasapbot';
import { evaluarMensaje } from '../../lib/filtroMensajes';

const openai         = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET  = process.env.SERVER_SECRET    || 'agenciame2026secreto_nexoia';
const SOPORTE_NUMERO = process.env.SOPORTE_WHATSAPP || '573105056616';
const historiales    = new Map();
const pedidosEnCurso = new Map();

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtP(n) { return Number(n || 0).toLocaleString('es-CO'); }
function calcTotal(items) { return items.reduce((a, it) => a + Number(it.precio || 0) * it.cantidad, 0); }
function resumenPedido(items) {
  return items.map(it => `• ${it.cantidad}x ${it.nombre} — $${fmtP(Number(it.precio||0)*it.cantidad)} COP`).join('\n');
}

const PIDE_MENU_RE  = /\b(menu|menú|carta|catalogo|catálogo|platos?|productos?|foto|fotos|muestrame|muéstrame|qué (tienen|tienes|hay)|qué (ofrecen|ofrece)|ver (el )?menu|ver (el )?catalogo|que tienen|que hay)\b/i;
const CONFIRMA_RE   = /\b(si|sí|confirmar|confirmo|correcto|listo|dale|va|ok|enviar pedido|hacer pedido|eso es todo|eso es|si señor|de una)\b/i;
const CANCELA_RE    = /\b(cancelar|cancela|olvidalo|olvídalo|salir|no gracias)\b/i;
const VER_PEDIDO_RE = /\b(ver (mi )?pedido|resumen|total|cuanto (es|sale|vale|cuesta)|mi pedido|que llevo|que tengo)\b/i;

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
        await enviarEmailInventario({ emailNegocio:emp.email, nombreNegocio:emp.nombreEmpresa||'tu negocio', alertas, panelUrl:`https://agenciame.com/wasapbot/panel/inventario/${empresaId}` }).catch(()=>{});
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

    // ── 2. Verificar plan activo (sin trial gratuito) ─────────
    const planActivo = empresa.planActivo === true;
    if (!planActivo) {
      return res.json({
        respuesta: `Hola 👋 El servicio de *${nombreEmpresa}* está en proceso de configuración.\n\nPronto estaremos disponibles para atenderte. ¡Gracias por tu paciencia! 🙏`,
        imagenes: [],
      });
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
    const sesionKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(sesionKey)) historiales.set(sesionKey, []);
    const historial = historiales.get(sesionKey);

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
          if (item.precio) linea += ` — $${fmtP(item.precio)} COP`;
          if (tieneInventario && item.stockActual <= 5) linea += ` _(${item.stockActual} disponibles)_`;
          return linea;
        }).join('\n\n');
        const respMenu = `🍽️ *Menú de ${nombreEmpresa}*\n\n${listaMenu}\n\n📝 ¿Qué deseas pedir? Escribe el número o el nombre:\n_Ej: "1 bandeja y 2 limonadas"_\n\nEscribe *"ver pedido"* para ver tu selección\nEscribe *"cancelar"* para salir`;
        const imagenes = itemsConFoto.slice(0,6).map(s => ({ url:s.foto, caption:`*${s.nombre}*${s.precio?`\n💰 $${fmtP(s.precio)} COP`:''}${s.descripcion?`\n${s.descripcion}`:''}` }));
        await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respMenu);
        return res.json({ respuesta: respMenu, imagenes });
      }

      if (pedido.paso === 'pidiendo' || pedido.paso === 'confirmando') {
        if (VER_PEDIDO_RE.test(texto)) {
          const total = calcTotal(pedido.items);
          const resp  = pedido.items.length > 0
            ? `🛒 *Tu pedido:*\n\n${resumenPedido(pedido.items)}\n\n💵 *Total: $${fmtP(total)} COP*\n\n¿Agregar algo más o escribir *"confirmar"*?`
            : `Tu pedido está vacío. Dime qué quieres pedir.`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }
        if (CANCELA_RE.test(texto) && pedido.paso === 'confirmando') {
          pedidosEnCurso.set(sesionKey, { items:[], paso:'idle' });
          const resp = `Pedido cancelado ❌\n\n¿En qué más puedo ayudarte?`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
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
          let respConf = `✅ *¡Pedido confirmado!* 🎉\n\n📋 *#${pedidoRef.id.slice(-6).toUpperCase()}*\n${resumenPedido(pedido.items)}\n\n💵 *Total: $${fmtP(total)} COP*\n\n`;
          if (nequi) respConf += `💳 *Pago por Nequi:*\n📱 ${nequi}\n\n`;
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
          const resp = `✅ Agregado: *${agregados}*\n\n🛒 *Tu pedido:*\n${resumenPedido(nuevosItems)}\n\n💵 *Total: $${fmtP(nuevoTotal)} COP*\n\n¿Deseas algo más?\n• Escribe *"confirmar"* para finalizar\n• O sigue eligiendo del menú`;
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
    else if (conocimiento?.horarios) {
      const dias = Object.entries(conocimiento.horarios).filter(([,v])=>v?.activo).map(([d,v])=>`${d}: ${v.desde||'?'}-${v.hasta||'?'}`);
      if (dias.length) horarioTexto = dias.join(', ');
    }

    const ahoraCol  = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Bogota'}));
    const diaActual = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahoraCol.getDay()];
    const horaStr   = `${String(ahoraCol.getHours()).padStart(2,'0')}:${String(ahoraCol.getMinutes()).padStart(2,'0')}`;
    const fechaStr  = `${String(ahoraCol.getDate()).padStart(2,'0')}/${String(ahoraCol.getMonth()+1).padStart(2,'0')}/${ahoraCol.getFullYear()}`;

    const menuTexto = menuDisponible.length > 0
      ? menuDisponible.map(s=>`• ${s.nombre}${s.precio?` — $${fmtP(s.precio)} COP`:''}${s.descripcion?` — ${s.descripcion}`:''}`).join('\n')
      : 'Catalogo en actualización.';

    const systemPrompt = `Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria||'negocio'} en ${empresa.ciudad||'Colombia'}.
Fecha y hora: ${diaActual} ${fechaStr} ${horaStr}.
${horarioTexto?`HORARIO: ${horarioTexto}`:''}

REGLA PRINCIPAL: Responde ÚNICAMENTE preguntas relacionadas con el negocio (servicios, precios, horarios, ubicación, pedidos, citas). Si el mensaje no tiene relación con el negocio, redirígelo amablemente.

MENU/CATALOGO (solo estos items, nunca inventes):
${menuTexto}

${permitePedidos?'El negocio acepta pedidos. El sistema guiará al cliente automáticamente cuando pida el menú.':''}

REGLAS:
1. NUNCA inventes productos o precios.
2. Si no dio nombre, pídelo una vez.
3. Máximo 3 párrafos, tono amigable, español colombiano.
4. Cita: CITA_DETECTADA: {"nombre":"X","servicio":"X","fecha":"DD/MM/YYYY","hora":"HH:MM"}
5. Asesor: SOPORTE_SOLICITADO: {"nombre":"X","motivo":"X"}${nombreCliente?`\nNOMBRE: ${nombreCliente}.`:''}
${conocimiento?.info?.direccion?`DIRECCIÓN: ${conocimiento.info.direccion}`:''}`;

    const completion = await openai.chat.completions.create({
      model:'gpt-4o-mini', max_tokens:400,
      messages:[{role:'system',content:systemPrompt},...historial],
    });
    const respuesta    = completion.choices[0]?.message?.content || '';
    historial.push({ role:'assistant', content:respuesta });

    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
      await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`).set({ usado:FieldValue.increment(tokensUsados), empresaId, mes:mesKey },{merge:true}).catch(()=>{});
    }

    const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:50000 };
    const tokLimit    = PLAN_TOKENS[empresa.planWasapbot||empresa.plan||'wasapbot'] || 50000;
    const mesKey2     = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const tokSnap     = await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey2}`).get().catch(()=>null);
    if (tokSnap?.exists && (tokSnap.data().usado||0) > tokLimit)
      return res.json({ respuesta:`El servicio de ${nombreEmpresa} ha alcanzado su límite mensual.`, imagenes:[] });

    const nombreDetectado = extraerNombre(texto);
    if (nombreDetectado && (!nombreCliente||nombreCliente.startsWith('WhatsApp ')))
      await contactosRef.doc(contactoId).update({ nombre:nombreDetectado }).catch(()=>{});

    await adminDb.collection('empresas').doc(empresaId).update({
      tokensUsados:FieldValue.increment(tokensUsados), conversaciones:FieldValue.increment(1), ultimaActividad:FieldValue.serverTimestamp(),
    }).catch(()=>{});

    let respuestaLimpia = respuesta.replace(/\n?CITA_DETECTADA:.*$/m,'').replace(/\n?SOPORTE_SOLICITADO:.*$/m,'').trim();

    if (/SOPORTE_SOLICITADO/.test(respuesta)||/soporte|asesor|humano|persona real/i.test(texto)) {
      try {
        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, mensaje:texto, estado:'pendiente', creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailSoporte({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nombreCliente||`+${numeroCliente}`, telefono:numeroCliente, mensaje:texto, empresaId });
      } catch {}
    }

    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const c = JSON.parse(citaMatch[1]);
        const nomCita = c.nombre||nombreCliente||`WhatsApp ${numeroCliente}`;
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({ nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fechaHora:parsearFechaHora(c.fecha,c.hora), fecha:c.fecha||'', hora:c.hora||'', estado:'pendiente', canal:'whatsapp', fuente:'whatsapp-bot', notas:'Agendado por WasapBot', contactoId, creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailCita({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fecha:c.fecha||'?', hora:c.hora||'?', empresaId });
      } catch (e) { console.error('cita error:', e.message); }
    }

    let imagenes = [];
    if (PIDE_MENU_RE.test(texto) && itemsConFoto.length > 0) {
      imagenes = itemsConFoto.slice(0,6).map(s=>({ url:s.foto, caption:`*${s.nombre}*${s.precio?`\n💰 $${fmtP(s.precio)} COP`:''}${s.descripcion?`\n${s.descripcion}`:''}` }));
    }

    await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respuestaLimpia);
    return res.json({ respuesta: respuestaLimpia, imagenes });

  } catch (err) {
    console.error('whatsapp-baileys error:', err);
    return res.status(500).json({ error: err.message });
  }
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
