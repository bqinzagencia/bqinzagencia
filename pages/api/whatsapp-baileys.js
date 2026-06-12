// pages/api/whatsapp-baileys.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { enviarEmailCita, enviarEmailSoporte } from '../../lib/emailWasapbot';

const openai         = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET  = process.env.SERVER_SECRET    || 'agenciame2026secreto_nexoia';
const SOPORTE_NUMERO = process.env.SOPORTE_WHATSAPP || '573105056616';
const historiales    = new Map();

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
      return res.json({ respuesta: null, imagenes: [] });
    }
    const empresa       = empresaSnap.data();
    const nombreEmpresa = empresa.nombreEmpresa || 'nuestro negocio';
    const emailNegocio  = empresa.email || null;

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
            respuesta: `Hola 👋 El periodo de prueba de *${nombreEmpresa}* (1 hora) ha finalizado.\n\nActiva tu plan en:\n👉 https://agenciame.com/wasapbot\n\n¿Dudas? *+${SOPORTE_NUMERO}* 🟢`,
            imagenes: [],
          });
        const mins = Math.ceil((3600000 - msDesde) / 60000);
        if (mins < 10) req._trialAviso = `\n\n_⏳ Quedan ~${mins} min de prueba gratuita._`;
      }
    }

    // ── 3. Conocimiento del negocio ──────────────────────────
    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get();
    const conocimiento = conocimientoSnap.exists ? conocimientoSnap.data() : null;

    const todosLosItems = (conocimiento?.servicios || []).filter(s => s.nombre?.trim());
    const itemsConFoto  = todosLosItems.filter(s => s.foto?.startsWith('http'));
    const hayMenu       = todosLosItems.length > 0;
    const hayFotos      = itemsConFoto.length > 0;

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

    // ── 5. Historial ─────────────────────────────────────────
    const hKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(hKey)) historiales.set(hKey, []);
    const historial = historiales.get(hKey);
    historial.push({ role:'user', content:texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    // ── 6. Detectar si pide catalogo/menu/fotos ──────────────
    // NOTA: Esta deteccion es independiente del GPT — siempre enviamos fotos
    // cuando el cliente las pide, sin importar lo que responda el GPT
    const PIDE_FOTOS_REGEX = /\b(menu|menú|carta|catalogo|catálogo|platos?|productos?|foto|fotos|muestrame|muéstrame|qué (tienen|tienes|hay)|qué (ofrecen|ofrece)|ver (el )?menu|ver (el )?catalogo|que tienen|que hay)\b/i;
    const clientePideFotos = PIDE_FOTOS_REGEX.test(texto);

    // ── 7. Horario ───────────────────────────────────────────
    let horarioTexto = '';
    if (conocimiento?.horarios?.general) {
      horarioTexto = conocimiento.horarios.general;
    } else if (conocimiento?.horarios) {
      const dias = Object.entries(conocimiento.horarios)
        .filter(([,v]) => v?.activo)
        .map(([dia,v]) => `${dia}: ${v.desde||'?'}-${v.hasta||'?'}`);
      if (dias.length) horarioTexto = dias.join(', ');
    }

    // ── 8. Hora Colombia ─────────────────────────────────────
    const ahoraCol = new Date(new Date().toLocaleString('en-US',{timeZone:'America/Bogota'}));
    const diaActual = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahoraCol.getDay()];
    const horaStr   = `${String(ahoraCol.getHours()).padStart(2,'0')}:${String(ahoraCol.getMinutes()).padStart(2,'0')}`;
    const fechaStr  = `${String(ahoraCol.getDate()).padStart(2,'0')}/${String(ahoraCol.getMonth()+1).padStart(2,'0')}/${ahoraCol.getFullYear()}`;

    // ── 9. System Prompt ─────────────────────────────────────
    // Lista del menú SIN la etiqueta [tiene foto] — eso era un bug
    let menuTexto = '';
    if (hayMenu) {
      menuTexto = todosLosItems.map(s => {
        let linea = `• ${s.nombre}`;
        if (s.precio) linea += ` — $${s.precio} COP`;
        if (s.descripcion) linea += ` — ${s.descripcion}`;
        return linea;
      }).join('\n');
    }

    let systemPrompt = `Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria||'negocio'} en ${empresa.ciudad||'Colombia'}.
Fecha y hora en Colombia: ${diaActual} ${fechaStr} ${horaStr}.

${horarioTexto ? `HORARIO DE ATENCION: ${horarioTexto}` : ''}

CATALOGO/MENU REGISTRADO EN EL PANEL:
${hayMenu
  ? `${menuTexto}

REGLA CRITICA: SOLO menciona estos items. NUNCA inventes productos, precios ni descripciones que no esten en esta lista.
${hayFotos
    ? `Cuando el cliente pida el menu, carta, fotos o catalogo: lista los platos brevemente y di "A continuacion te envio las fotos 📸". NO digas que no puedes enviar fotos — el sistema las enviara automaticamente despues de tu texto.`
    : `Si piden fotos de los platos, di que las fotos estan siendo preparadas y ofrece el listado de precios.`}`
  : `El negocio aun no ha registrado su catalogo. Si preguntan por productos o menu, di amablemente que el catalogo esta siendo actualizado.`}

SALUDO INICIAL (solo en el primer mensaje):
"¡Bienvenido/a a ${nombreEmpresa}! Soy tu asistente virtual 🤖 ¿En qué te puedo ayudar hoy?"

REGLAS GENERALES:
1. NUNCA inventes items que no esten en el catalogo de arriba.
2. Si el cliente no ha dado su nombre, pidelo amablemente UNA sola vez.
3. Responde en maximo 3 parrafos cortos, tono amigable.
4. Al confirmar cita escribe exactamente al final: CITA_DETECTADA: {"nombre":"X","servicio":"X","fecha":"DD/MM/YYYY","hora":"HH:MM"}
5. Si piden asesor humano escribe exactamente al final: SOPORTE_SOLICITADO: {"nombre":"X","motivo":"X"}
6. Idioma: espanol colombiano sin tildes.`;

    if (nombreCliente) systemPrompt += `\n\nNOMBRE DEL CLIENTE: ${nombreCliente} (no vuelvas a pedirlo).`;
    else systemPrompt += `\n\nEL CLIENTE AUN NO HA DADO SU NOMBRE.`;

    if (conocimiento?.info?.direccion) systemPrompt += `\nDIRECCION: ${conocimiento.info.direccion}`;
    if (conocimiento?.info?.formasPago?.length) systemPrompt += `\nFORMAS DE PAGO: ${conocimiento.info.formasPago.join(', ')}`;
    if (conocimiento?.info?.preguntasFrecuentes?.length) {
      const faqs = conocimiento.info.preguntasFrecuentes.filter(f=>f.pregunta)
        .map(f=>`P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n');
      systemPrompt += `\n\nFAQS:\n${faqs}`;
    }

    // ── 10. GPT ──────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 500,
      messages: [{ role:'system', content:systemPrompt }, ...historial],
    });
    const respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role:'assistant', content:respuesta });

    // ── 11. Tokens ───────────────────────────────────────────
    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
      await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`)
        .set({ usado:FieldValue.increment(tokensUsados), empresaId, mes:mesKey }, { merge:true }).catch(()=>{});
    }
    const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:15000 };
    const tokLimit    = PLAN_TOKENS[empresa.planWasapbot||empresa.plan||'wasapbot'] || 15000;
    const mesKey2     = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const tokSnap     = await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey2}`).get().catch(()=>null);
    if (tokSnap?.exists && (tokSnap.data().usado||0) > tokLimit)
      return res.json({ respuesta:`El servicio de ${nombreEmpresa} ha alcanzado su limite mensual.`, imagenes:[] });

    // ── 12. Capturar nombre ──────────────────────────────────
    const nombreDetectado = extraerNombre(texto);
    if (nombreDetectado && (!nombreCliente || nombreCliente.startsWith('WhatsApp ')))
      await contactosRef.doc(contactoId).update({ nombre:nombreDetectado }).catch(()=>{});

    try {
      await adminDb.collection('empresas').doc(empresaId).update({
        tokensUsados:FieldValue.increment(tokensUsados), conversaciones:FieldValue.increment(1), ultimaActividad:FieldValue.serverTimestamp(),
      });
    } catch {}

    // ── 13. Limpiar respuesta ────────────────────────────────
    let respuestaLimpia = respuesta
      .replace(/\n?CITA_DETECTADA:.*$/m, '')
      .replace(/\n?SOPORTE_SOLICITADO:.*$/m, '')
      .trim();
    if (req._trialAviso) respuestaLimpia += req._trialAviso;

    // ── 14. Soporte ──────────────────────────────────────────
    if (/SOPORTE_SOLICITADO/.test(respuesta) || /soporte|asesor|humano|persona real/i.test(texto)) {
      try {
        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, mensaje:texto, estado:'pendiente', creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailSoporte({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nombreCliente||`+${numeroCliente}`, telefono:numeroCliente, mensaje:texto, empresaId });
      } catch {}
    }

    // ── 15. Cita ─────────────────────────────────────────────
    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const c = JSON.parse(citaMatch[1]);
        const nomCita = c.nombre || nombreCliente || `WhatsApp ${numeroCliente}`;
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({ nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fechaHora:parsearFechaHora(c.fecha,c.hora), fecha:c.fecha||'', hora:c.hora||'', estado:'pendiente', canal:'whatsapp', fuente:'whatsapp-bot', notas:'Agendado por WasapBot', contactoId, creadoEn:FieldValue.serverTimestamp() });
        await enviarEmailCita({ emailNegocio, nombreNegocio:nombreEmpresa, nombreCliente:nomCita, telefono:numeroCliente, servicio:c.servicio||'Consulta', fecha:c.fecha||'?', hora:c.hora||'?', empresaId });
      } catch (e) { console.error('cita error:', e.message); }
    }

    // ── 16. Conversacion ─────────────────────────────────────
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({ nombreCliente:nombreCliente||`WhatsApp ${numeroCliente}`, telefono:numeroCliente, canal:'whatsapp', ultimoTexto:texto, ultimoMensaje:FieldValue.serverTimestamp(), contactoId }, { merge:true });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'cliente', texto, creadoEn:FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'agente', texto:respuestaLimpia, creadoEn:FieldValue.serverTimestamp() });

    // ── 17. IMAGENES ─────────────────────────────────────────
    // Se envian cuando el cliente pide el menu/catalogo/fotos
    // y el negocio tiene items con foto en el panel
    let imagenes = [];
    if (clientePideFotos && hayFotos) {
      imagenes = itemsConFoto.slice(0, 6).map(s => ({
        url:     s.foto,
        caption: `*${s.nombre}*${s.precio ? `\n💰 $${s.precio} COP` : ''}${s.descripcion ? `\n${s.descripcion}` : ''}`,
      }));
      console.log(`[${empresaId}] Enviando ${imagenes.length} fotos a ${numeroCliente}:`, imagenes.map(i=>i.url));
    } else if (clientePideFotos && !hayFotos) {
      console.log(`[${empresaId}] Cliente pide fotos pero no hay items con foto en el panel`);
    }

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
    const partes = (fecha||'').match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (!partes) return new Date();
    const anio = partes[3] ? parseInt(partes[3]) : new Date().getFullYear();
    const hp   = (hora||'').match(/(\d{1,2}):?(\d{2})?/);
    return new Date(anio<100?2000+anio:anio, parseInt(partes[2])-1, parseInt(partes[1]), hp?parseInt(hp[1]):9, hp?.[2]?parseInt(hp[2]):0);
  } catch { return new Date(); }
}
