// pages/api/whatsapp-baileys.js
// Flujo completo: chat + pedidos conversacionales
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { enviarEmailCita, enviarEmailSoporte, enviarEmailPedido } from '../../lib/emailWasapbot';

const openai         = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET  = process.env.SERVER_SECRET    || 'agenciame2026secreto_nexoia';
const SOPORTE_NUMERO = process.env.SOPORTE_WHATSAPP || '573105056616';

// Historial de conversacion por cliente
const historiales = new Map();
// Estado de pedido en curso por cliente: { items:[], paso:'menu'|'pidiendo'|'confirmando' }
const pedidosEnCurso = new Map();

// ── Helpers ──────────────────────────────────────────────────
const PIDE_MENU_RE    = /\b(menu|menú|carta|catalogo|catálogo|platos?|productos?|foto|fotos|muestrame|muéstrame|qué (tienen|tienes|hay)|qué (ofrecen|ofrece)|ver (el )?menu|ver (el )?catalogo|que tienen|que hay)\b/i;
const CONFIRMA_RE     = /\b(si|sí|confirmar|confirmo|correcto|listo|dale|va|ok|enviar pedido|hacer pedido|eso es todo|eso es|si señor|de una)\b/i;
const CANCELA_RE      = /\b(no|cancelar|cancela|olvidalo|olvídalo|salir|no gracias)\b/i;
const VER_PEDIDO_RE   = /\b(ver (mi )?pedido|resumen|total|cuanto (es|sale|vale|cuesta)|mi pedido|que llevo|que tengo)\b/i;

function formatearPesos(n) {
  return Number(n || 0).toLocaleString('es-CO');
}

function calcularTotal(items) {
  return items.reduce((acc, it) => acc + (Number(it.precio || 0) * it.cantidad), 0);
}

function resumenPedido(items) {
  if (!items.length) return 'Tu pedido está vacío.';
  return items.map(it => `• ${it.cantidad}x ${it.nombre} — $${formatearPesos(Number(it.precio || 0) * it.cantidad)} COP`).join('\n');
}

// Detecta si el texto contiene números seguidos de nombre de plato
// Ej: "1 bandeja, 2 limonadas" o "quiero 1 bandeja y 1 jugo"
function parsearSeleccion(texto, menu) {
  const seleccion = [];
  const textoLower = texto.toLowerCase();

  for (const item of menu) {
    const nombreLower = item.nombre.toLowerCase();
    // Buscar el item en el texto
    if (!textoLower.includes(nombreLower.split(' ')[0])) continue;

    // Buscar cantidad antes del nombre
    const regex = new RegExp(`(\\d+)\\s*(?:x\\s*)?${nombreLower.split(' ')[0]}`, 'i');
    const match = texto.match(regex);
    const cantidad = match ? parseInt(match[1]) : 1;
    seleccion.push({ ...item, cantidad });
  }

  return seleccion;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-server-secret'] !== SERVER_SECRET)
    return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto } = req.body;
  if (!empresaId || !numeroCliente || !texto)
    return res.status(400).json({ error: 'Faltan campos' });

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
    // Número Nequi del negocio (el dueño lo configura en el panel)
    const nequi         = empresa.nequi || empresa.whatsapp?.numero || null;

    // ── 2. Trial 1 hora ──────────────────────────────────────
    const planActivo = empresa.planActivo === true && empresa.plan && empresa.plan !== 'wasapbot';
    if (!planActivo && empresa.producto === 'wasapbot') {
      const creadoEn = empresa.creadoEn?.toDate
        ? empresa.creadoEn.toDate()
        : empresa.creadoEn ? new Date(empresa.creadoEn) : null;
      if (creadoEn) {
        const msDesde = Date.now() - creadoEn.getTime();
        if (msDesde > 3600000)
          return res.json({
            respuesta: `Hola 👋 El periodo de prueba de *${nombreEmpresa}* ha finalizado.\n\nActiva tu plan en:\n👉 https://agenciame.com/wasapbot`,
            imagenes: [],
          });
        const mins = Math.ceil((3600000 - msDesde) / 60000);
        if (mins < 10) req._trialAviso = `\n\n_⏳ Quedan ~${mins} min de prueba gratuita._`;
      }
    }

    // ── 3. Conocimiento ──────────────────────────────────────
    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get();
    const conocimiento  = conocimientoSnap.exists ? conocimientoSnap.data() : null;
    const todosLosItems = (conocimiento?.servicios || []).filter(s => s.nombre?.trim());
    const itemsConFoto  = todosLosItems.filter(s => s.foto?.startsWith('http'));
    const permitePedidos = conocimiento?.permitePedidos === true ||
      (empresa.industria && ['restaurante','reposteria','tienda','farmacia'].includes(empresa.industria));

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

    // ── 5. Clave de sesion ───────────────────────────────────
    const sesionKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(sesionKey)) historiales.set(sesionKey, []);
    const historial = historiales.get(sesionKey);

    // ── 6. FLUJO DE PEDIDOS ──────────────────────────────────
    // Solo para negocios con permitePedidos=true y que tengan items
    if (permitePedidos && todosLosItems.length > 0) {

      const pedido = pedidosEnCurso.get(sesionKey) || { items: [], paso: 'idle' };

      // Cliente pide el menu — iniciar flujo
      if (PIDE_MENU_RE.test(texto) && pedido.paso === 'idle') {
        pedidosEnCurso.set(sesionKey, { items: [], paso: 'pidiendo' });

        // Construir lista numerada del menu
        const listaMenu = todosLosItems.map((item, i) =>
          `*${i + 1}.* ${item.nombre}${item.precio ? ` — $${formatearPesos(item.precio)} COP` : ''}${item.descripcion ? `\n    _${item.descripcion}_` : ''}`
        ).join('\n\n');

        const respMenu = `🍽️ *Menú de ${nombreEmpresa}*\n\n${listaMenu}\n\n` +
          `📝 Escríbeme qué deseas pedir. Puedes decir:\n` +
          `_"1 bandeja paisa y 2 limonadas"_\n` +
          `_"quiero el 3 y el 5"_\n\n` +
          `Para ver tu pedido escribe *"ver pedido"*\n` +
          `Para cancelar escribe *"cancelar"*`;

        // Enviar fotos del menu
        const imagenes = itemsConFoto.slice(0, 6).map(s => ({
          url:     s.foto,
          caption: `*${s.nombre}*${s.precio ? `\n💰 $${formatearPesos(s.precio)} COP` : ''}${s.descripcion ? `\n${s.descripcion}` : ''}`,
        }));

        await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respMenu);
        return res.json({ respuesta: respMenu, imagenes });
      }

      // Cliente está en modo pidiendo — procesar seleccion
      if (pedido.paso === 'pidiendo' || pedido.paso === 'confirmando') {

        // Ver resumen del pedido
        if (VER_PEDIDO_RE.test(texto)) {
          const total   = calcularTotal(pedido.items);
          const resumen = resumenPedido(pedido.items);
          const resp    = pedido.items.length > 0
            ? `🛒 *Tu pedido actual:*\n\n${resumen}\n\n💵 *Total: $${formatearPesos(total)} COP*\n\n¿Deseas agregar algo más o confirmar tu pedido?\nEscribe *"confirmar"* para finalizar o sigue pidiendo.`
            : `Tu pedido está vacío. Dime qué deseas pedir del menú.`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }

        // Cancelar pedido
        if (CANCELA_RE.test(texto) && pedido.paso === 'confirmando') {
          pedidosEnCurso.set(sesionKey, { items: [], paso: 'idle' });
          const resp = `Pedido cancelado ❌\n\n¿En qué más puedo ayudarte?`;
          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }

        // CONFIRMAR pedido final
        if (CONFIRMA_RE.test(texto) && pedido.paso === 'confirmando' && pedido.items.length > 0) {
          const total = calcularTotal(pedido.items);

          // Guardar pedido en Firestore
          const pedidoRef = await adminDb.collection('empresas').doc(empresaId)
            .collection('pedidos').add({
              nombreCliente: nombreCliente || `WhatsApp ${numeroCliente}`,
              telefono:      numeroCliente,
              items:         pedido.items,
              total,
              estado:        'pendiente',
              canal:         'whatsapp',
              contactoId,
              creadoEn:      FieldValue.serverTimestamp(),
            });

          // Resetear pedido
          pedidosEnCurso.set(sesionKey, { items: [], paso: 'idle' });

          // Email al negocio
          await enviarEmailPedido({
            emailNegocio,
            nombreNegocio: nombreEmpresa,
            nombreCliente: nombreCliente || `+${numeroCliente}`,
            telefono:      numeroCliente,
            items:         pedido.items,
            total,
            nequi,
            empresaId,
            pedidoId:      pedidoRef.id,
          }).catch(() => {});

          // Respuesta al cliente
          const resumen = resumenPedido(pedido.items);
          let respConf = `✅ *¡Pedido confirmado!* 🎉\n\n` +
            `📋 *Pedido #${pedidoRef.id.slice(-6).toUpperCase()}*\n${resumen}\n\n` +
            `💵 *Total: $${formatearPesos(total)} COP*\n\n`;

          if (nequi) {
            respConf += `💳 *Pago por Nequi:*\n📱 ${nequi}\n\n`;
          }

          respConf += `⏳ Tu pedido está *en proceso*. Te avisamos cuando esté listo.\n\n` +
            `_¿Algo más en lo que pueda ayudarte?_`;

          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respConf);

          // Actualizar contadores
          try {
            await adminDb.collection('empresas').doc(empresaId).update({
              pedidosTotal:    FieldValue.increment(1),
              ultimaActividad: FieldValue.serverTimestamp(),
            });
          } catch {}

          return res.json({ respuesta: respConf, imagenes: [] });
        }

        // Procesar items seleccionados por numero o nombre
        const seleccionPorNombre = parsearSeleccion(texto, todosLosItems);
        const seleccionPorNumero = [];

        // Detectar seleccion por numero: "quiero el 1, 2 y 3" o "1 y 2"
        const numerosEnTexto = texto.match(/\b(\d+)\b/g);
        if (numerosEnTexto) {
          for (const numStr of numerosEnTexto) {
            const idx = parseInt(numStr) - 1;
            if (idx >= 0 && idx < todosLosItems.length) {
              // Ver si hay cantidad antes del numero
              const cantRegex = new RegExp(`(\\d+)\\s*(?:x\\s*)?${numStr}`, 'i');
              const cantMatch = texto.match(cantRegex);
              const cantidad  = cantMatch && parseInt(cantMatch[1]) !== idx + 1 ? parseInt(cantMatch[1]) : 1;
              seleccionPorNumero.push({ ...todosLosItems[idx], cantidad });
            }
          }
        }

        const seleccion = seleccionPorNombre.length > 0 ? seleccionPorNombre : seleccionPorNumero;

        if (seleccion.length > 0) {
          // Agregar al pedido acumulado
          const nuevosItems = [...pedido.items];
          for (const sel of seleccion) {
            const existe = nuevosItems.findIndex(it => it.nombre === sel.nombre);
            if (existe >= 0) {
              nuevosItems[existe].cantidad += sel.cantidad;
            } else {
              nuevosItems.push(sel);
            }
          }
          const nuevoTotal = calcularTotal(nuevosItems);
          pedidosEnCurso.set(sesionKey, { items: nuevosItems, paso: 'confirmando' });

          const agregados = seleccion.map(s => `${s.cantidad}x ${s.nombre}`).join(', ');
          const resumen   = resumenPedido(nuevosItems);

          const resp = `✅ Agregado: *${agregados}*\n\n` +
            `🛒 *Tu pedido hasta ahora:*\n${resumen}\n\n` +
            `💵 *Total: $${formatearPesos(nuevoTotal)} COP*\n\n` +
            `¿Deseas agregar algo más?\n` +
            `• Escribe *"confirmar"* para finalizar el pedido\n` +
            `• O sigue eligiendo del menú`;

          await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, resp);
          return res.json({ respuesta: resp, imagenes: [] });
        }

        // Si está en modo pidiendo pero no entendió la seleccion — ayuda
        if (pedido.paso === 'pidiendo' || pedido.paso === 'confirmando') {
          // No interrumpir si el mensaje no tiene relacion con el pedido
          // Dejar que lo maneje el GPT normal pero mantener el estado
        }
      }
    }

    // ── 7. Flujo normal con GPT ──────────────────────────────
    historial.push({ role:'user', content:texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    // Horario
    let horarioTexto = '';
    if (conocimiento?.horarios?.general) horarioTexto = conocimiento.horarios.general;
    else if (conocimiento?.horarios) {
      const dias = Object.entries(conocimiento.horarios).filter(([,v])=>v?.activo)
        .map(([dia,v])=>`${dia}: ${v.desde||'?'}-${v.hasta||'?'}`);
      if (dias.length) horarioTexto = dias.join(', ');
    }

    // Hora Colombia
    const ahoraCol  = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Bogota'}));
    const diaActual = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahoraCol.getDay()];
    const horaStr   = `${String(ahoraCol.getHours()).padStart(2,'0')}:${String(ahoraCol.getMinutes()).padStart(2,'0')}`;
    const fechaStr  = `${String(ahoraCol.getDate()).padStart(2,'0')}/${String(ahoraCol.getMonth()+1).padStart(2,'0')}/${ahoraCol.getFullYear()}`;

    // Menu para el prompt
    const menuTexto = todosLosItems.map(s => {
      let l = `• ${s.nombre}`;
      if (s.precio) l += ` — $${formatearPesos(s.precio)} COP`;
      if (s.descripcion) l += ` — ${s.descripcion}`;
      return l;
    }).join('\n');

    const systemPrompt = `Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria||'negocio'} en ${empresa.ciudad||'Colombia'}.
Fecha y hora en Colombia: ${diaActual} ${fechaStr} ${horaStr}.
${horarioTexto ? `HORARIO: ${horarioTexto}` : ''}

CATALOGO REGISTRADO (SOLO usa estos items, NUNCA inventes otros):
${menuTexto || 'Catalogo en actualizacion.'}

${permitePedidos ? `SISTEMA DE PEDIDOS: Este negocio acepta pedidos por WhatsApp. Cuando el cliente pida el menu, dile que puede escribir los nombres o numeros de lo que desea. El sistema lo guiara automaticamente.` : ''}

SALUDO INICIAL (solo en el primer mensaje): "Bienvenido/a a ${nombreEmpresa}! Soy tu asistente 🤖 ¿En que te puedo ayudar?"

REGLAS:
1. NUNCA inventes productos o precios que no esten en el catalogo.
2. Si el cliente no ha dado su nombre, pidelo amablemente una vez.
3. Maximo 3 parrafos cortos, tono amigable.
4. Al confirmar cita: CITA_DETECTADA: {"nombre":"X","servicio":"X","fecha":"DD/MM/YYYY","hora":"HH:MM"}
5. Si piden asesor: SOPORTE_SOLICITADO: {"nombre":"X","motivo":"X"}
6. Idioma: espanol colombiano.${nombreCliente ? `\nNOMBRE DEL CLIENTE: ${nombreCliente}.` : ''}
${conocimiento?.info?.direccion ? `DIRECCION: ${conocimiento.info.direccion}` : ''}
${conocimiento?.info?.formasPago?.length ? `FORMAS DE PAGO: ${conocimiento.info.formasPago.join(', ')}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 400,
      messages: [{ role:'system', content:systemPrompt }, ...historial],
    });
    const respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role:'assistant', content:respuesta });

    // Tokens
    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
      await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`)
        .set({ usado:FieldValue.increment(tokensUsados), empresaId, mes:mesKey }, { merge:true }).catch(()=>{});
    }

    // Capturar nombre
    const nombreDetectado = extraerNombre(texto);
    if (nombreDetectado && (!nombreCliente || nombreCliente.startsWith('WhatsApp ')))
      await contactosRef.doc(contactoId).update({ nombre:nombreDetectado }).catch(()=>{});

    try {
      await adminDb.collection('empresas').doc(empresaId).update({
        tokensUsados:FieldValue.increment(tokensUsados), conversaciones:FieldValue.increment(1), ultimaActividad:FieldValue.serverTimestamp(),
      });
    } catch {}

    let respuestaLimpia = respuesta
      .replace(/\n?CITA_DETECTADA:.*$/m, '')
      .replace(/\n?SOPORTE_SOLICITADO:.*$/m, '')
      .trim();
    if (req._trialAviso) respuestaLimpia += req._trialAviso;

    // Soporte
    if (/SOPORTE_SOLICITADO/.test(respuesta) || /soporte|asesor|humano|persona real/i.test(texto)) {
      try {
        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, mensaje:texto, estado:'pendiente', creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailSoporte({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nombreCliente||`+${numeroCliente}`, telefono:numeroCliente, mensaje:texto, empresaId });
      } catch {}
    }

    // Cita
    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const c = JSON.parse(citaMatch[1]);
        const nomCita = c.nombre || nombreCliente || `WhatsApp ${numeroCliente}`;
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({ nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fechaHora:parsearFechaHora(c.fecha,c.hora), fecha:c.fecha||'', hora:c.hora||'', estado:'pendiente', canal:'whatsapp', fuente:'whatsapp-bot', notas:'Agendado por WasapBot', contactoId, creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailCita({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fecha:c.fecha||'?', hora:c.hora||'?', empresaId });
      } catch (e) { console.error('cita error:', e.message); }
    }

    // Fotos si piden menu
    let imagenes = [];
    if (PIDE_MENU_RE.test(texto) && itemsConFoto.length > 0) {
      imagenes = itemsConFoto.slice(0, 6).map(s => ({
        url:     s.foto,
        caption: `*${s.nombre}*${s.precio ? `\n💰 $${formatearPesos(s.precio)} COP` : ''}${s.descripcion ? `\n${s.descripcion}` : ''}`,
      }));
    }

    await registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respuestaLimpia);
    return res.json({ respuesta: respuestaLimpia, imagenes });

  } catch (err) {
    console.error('whatsapp-baileys error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Helpers ──────────────────────────────────────────────────
async function registrarMensaje(adminDb, empresaId, numeroCliente, nombreCliente, contactoId, texto, respuesta) {
  try {
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, canal:'whatsapp', ultimoTexto:texto, ultimoMensaje:FieldValue.serverTimestamp(), contactoId }, { merge:true });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'cliente', texto, creadoEn:FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'agente', texto:respuesta, creadoEn:FieldValue.serverTimestamp() });
  } catch {}
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
    const partes = (fecha||'').match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (!partes) return new Date();
    const anio = partes[3] ? parseInt(partes[3]) : new Date().getFullYear();
    const hp   = (hora||'').match(/(\d{1,2}):?(\d{2})?/);
    return new Date(anio<100?2000+anio:anio, parseInt(partes[2])-1, parseInt(partes[1]), hp?parseInt(hp[1]):9, hp?.[2]?parseInt(hp[2]):0);
  } catch { return new Date(); }
}
