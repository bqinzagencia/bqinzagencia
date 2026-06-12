// pages/api/whatsapp-baileys.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { enviarEmailCita, enviarEmailSoporte } from '../../lib/emailWasapbot';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET     = process.env.SERVER_SECRET     || 'agenciame2026secreto_nexoia';
const SOPORTE_NUMERO    = process.env.SOPORTE_WHATSAPP  || '573105056616';
const SOPORTE_EMPRESA_ID = process.env.SOPORTE_EMPRESA_ID || '';
const historiales       = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-server-secret'];
  if (secret !== SERVER_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto } = req.body;
  if (!empresaId || !numeroCliente || !texto)
    return res.status(400).json({ error: 'Faltan campos requeridos' });

  try {
    // 1. Datos empresa
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) {
      historiales.delete(`${empresaId}_${numeroCliente}`);
      return res.json({ respuesta: null });
    }
    const empresa       = empresaSnap.data();
    const nombreEmpresa = empresa.nombreEmpresa || 'nuestro negocio';
    const emailNegocio  = empresa.email || null;

    // 2. Trial 1 hora
    const planActivo = empresa.planActivo === true && empresa.plan && empresa.plan !== 'wasapbot';
    if (!planActivo && empresa.producto === 'wasapbot') {
      const ahora       = new Date();
      const UNA_HORA_MS = 60 * 60 * 1000;
      const creadoEn    = empresa.creadoEn?.toDate ? empresa.creadoEn.toDate()
        : (empresa.creadoEn ? new Date(empresa.creadoEn) : null);
      if (creadoEn) {
        const msDesde = ahora - creadoEn;
        if (msDesde > UNA_HORA_MS) {
          return res.json({
            respuesta:
              `Hola 👋 El periodo de prueba gratuito de *${nombreEmpresa}* (1 hora) ha finalizado.\n\n` +
              `Para seguir recibiendo respuestas automáticas activa un plan en:\n` +
              `👉 https://agenciame.com/wasapbot\n\n` +
              `¿Dudas? Escríbenos al *+${SOPORTE_NUMERO}* 🟢`,
          });
        }
        const msRestantes = UNA_HORA_MS - msDesde;
        if (msRestantes < 10 * 60 * 1000) {
          const mins = Math.ceil(msRestantes / 60000);
          req._trialAviso = `\n\n_⏳ Quedan ~${mins} min de tu prueba gratuita. Activa tu plan en agenciame.com/wasapbot_`;
        }
      }
    }

    // 3. Conocimiento
    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get();
    const conocimiento = conocimientoSnap.exists ? conocimientoSnap.data() : null;

    // 4. Contacto
    const contactosRef  = adminDb.collection('empresas').doc(empresaId).collection('contactos');
    const contactoQuery = await contactosRef.where('telefono', '==', numeroCliente).limit(1).get();
    let contactoId, nombreCliente = null;

    if (contactoQuery.empty) {
      const doc = await contactosRef.add({
        telefono: numeroCliente, nombre: `WhatsApp ${numeroCliente}`,
        canal: 'whatsapp', fuente: 'whatsapp-bot', estado: 'nuevo',
        creadoEn: FieldValue.serverTimestamp(),
      });
      contactoId = doc.id;
    } else {
      const docSnap = contactoQuery.docs[0];
      contactoId    = docSnap.id;
      nombreCliente = docSnap.data().nombre;
      if (!nombreCliente || nombreCliente.startsWith('WhatsApp ') || nombreCliente === numeroCliente)
        nombreCliente = null;
    }

    // 5. Historial
    const historialKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(historialKey)) historiales.set(historialKey, []);
    const historial = historiales.get(historialKey);
    if (historial.length > 20) historial.splice(0, historial.length - 10);
    historial.push({ role: 'user', content: texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    // 6. Soporte humano detectado por palabras clave
    const pideSoporte = /soporte|asesor|humano|persona|hablar con alguien|representante/i.test(texto);

    // 7. Hora Colombia + horario negocio
    const ahoraCol   = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const diaActual  = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][ahoraCol.getDay()];
    const horaActual = `${String(ahoraCol.getHours()).padStart(2,'0')}:${String(ahoraCol.getMinutes()).padStart(2,'0')}`;
    const fechaActual = `${String(ahoraCol.getDate()).padStart(2,'0')}/${String(ahoraCol.getMonth()+1).padStart(2,'0')}/${ahoraCol.getFullYear()}`;

    let horarioTexto = '';
    if (conocimiento?.horarios) {
      const hs = conocimiento.horarios;
      if (hs.general) {
        horarioTexto = hs.general;
      } else {
        const dias = Object.entries(hs)
          .filter(([, v]) => v?.activo)
          .map(([dia, v]) => `${dia}: ${v.desde || '?'}-${v.hasta || '?'}`);
        if (dias.length) horarioTexto = dias.join(', ');
      }
    }

    // 8. System prompt
    let systemPrompt = `Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria || 'negocio'} en ${empresa.ciudad || 'Colombia'}.
Fecha y hora actual en Colombia: ${diaActual} ${fechaActual} ${horaActual}.

SALUDO INICIAL (solo en el primer mensaje del cliente):
"Bienvenido/a a ${nombreEmpresa}. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"

${horarioTexto ? `HORARIO DE ATENCION: ${horarioTexto}` : ''}

REGLAS DE AGENDAMIENTO:
${horarioTexto
  ? `- SOLO agenda citas dentro del horario: ${horarioTexto}.
- Si el cliente pide cita FUERA del horario o en dia no laborable, NO la agendes. Dile amablemente los horarios disponibles.
- Antes de confirmar una cita verifica que la fecha y hora esten dentro del horario de atencion.
- Si el cliente dice "lo antes posible" ofrece el proximo horario disponible dentro del rango de atencion.`
  : '- Agenda citas segun la disponibilidad del negocio.'}

REGLAS GENERALES:
1. NOMBRE OBLIGATORIO: Si el cliente no ha dado su nombre, pidelo en cada respuesta hasta obtenerlo. Di: "¿Me puedes dar tu nombre completo para atenderte mejor?"
2. Responde de forma concisa (max 3 parrafos), amigable y profesional.
3. Usa emojis moderadamente (max 2 por mensaje).
4. Cuando confirmes una cita valida, agrega en nueva linea al final de tu respuesta:
   CITA_DETECTADA: {"nombre":"NOMBRE_CLIENTE","servicio":"NOMBRE_SERVICIO","fecha":"DD/MM/YYYY","hora":"HH:MM"}
5. Idioma: espanol colombiano.
6. Si el cliente pide hablar con una persona, di que avisas al equipo y agrega en nueva linea:
   SOPORTE_SOLICITADO: {"nombre":"NOMBRE_CLIENTE","motivo":"MOTIVO_BREVE"}`;

    if (nombreCliente) {
      systemPrompt += `\n\nNOMBRE DEL CLIENTE: ${nombreCliente} — NO vuelvas a pedirlo.`;
    } else {
      systemPrompt += `\n\nEL CLIENTE NO HA DADO SU NOMBRE AUN. Pidelo amablemente.`;
    }

    if (conocimiento) {
      if (conocimiento.servicios?.length > 0) {
        const svcs = conocimiento.servicios.filter(s => s.nombre)
          .map(s => `- ${s.nombre}: $${s.precio || 'consultar'} COP${s.duracion ? ` (${s.duracion} min)` : ''}`)
          .join('\n');
        systemPrompt += `\n\nSERVICIOS:\n${svcs}`;
      }
      if (conocimiento.info?.descripcionNegocio)
        systemPrompt += `\n\nDESCRIPCION: ${conocimiento.info.descripcionNegocio}`;
      if (conocimiento.info?.direccion)
        systemPrompt += `\nDIRECCION: ${conocimiento.info.direccion}`;
      if (conocimiento.info?.formasPago?.length)
        systemPrompt += `\nFORMAS DE PAGO: ${conocimiento.info.formasPago.join(', ')}`;
      if (conocimiento.info?.preguntasFrecuentes?.length > 0) {
        const faqs = conocimiento.info.preguntasFrecuentes
          .filter(f => f.pregunta)
          .map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n');
        systemPrompt += `\n\nFAQS:\n${faqs}`;
      }
    }

    // 9. GPT
    const completion = await openai.chat.completions.create({
      model:      'gpt-4o-mini',
      max_tokens: 500,
      messages:   [{ role: 'system', content: systemPrompt }, ...historial],
    });
    let respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role: 'assistant', content: respuesta });

    // 10. Tokens
    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const now    = new Date();
      const mesKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`)
        .set({ usado: FieldValue.increment(tokensUsados), empresaId, mes: mesKey }, { merge: true }).catch(() => {});
    }

    // Limite mensual
    const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:15000 };
    const planId   = empresa.planWasapbot || empresa.plan || 'wasapbot';
    const tokLimit = PLAN_TOKENS[planId] || 15000;
    const now2     = new Date();
    const mesKey2  = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}`;
    const tokSnap  = await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey2}`).get().catch(() => null);
    const tokActual = tokSnap?.exists ? (tokSnap.data().usado || 0) : 0;
    if (tokActual > tokLimit)
      return res.json({ respuesta: `El servicio de respuestas automáticas de ${nombreEmpresa} ha alcanzado su límite mensual.` });

    // 11. Capturar nombre
    const nombreEnMensaje = extraerNombre(texto);
    if (nombreEnMensaje && (!nombreCliente || nombreCliente.startsWith('WhatsApp '))) {
      await contactosRef.doc(contactoId).update({ nombre: nombreEnMensaje });
      nombreCliente = nombreEnMensaje;
    }

    // Contadores
    try {
      await adminDb.collection('empresas').doc(empresaId).update({
        tokensUsados:    FieldValue.increment(tokensUsados),
        conversaciones:  FieldValue.increment(1),
        ultimaActividad: FieldValue.serverTimestamp(),
      });
    } catch {}

    // 12. Limpiar etiquetas
    let respuestaLimpia = respuesta
      .replace(/\n?CITA_DETECTADA:.*$/m, '')
      .replace(/\n?SOPORTE_SOLICITADO:.*$/m, '')
      .trim();
    if (req._trialAviso) respuestaLimpia += req._trialAviso;

    // 13. Soporte humano → email al negocio
    const soporteMatch = respuesta.match(/SOPORTE_SOLICITADO:\s*(\{[^}]+\})/);
    if (soporteMatch || pideSoporte) {
      try {
        // Guardar en Firestore
        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({
          nombreCliente: nombreCliente || `WhatsApp ${numeroCliente}`,
          telefono:      numeroCliente,
          mensaje:       texto,
          estado:        'pendiente',
          creadoEn:      FieldValue.serverTimestamp(),
        });

        // Email al negocio — GRATIS, sin costo adicional
        await enviarEmailSoporte({
          emailNegocio,
          nombreNegocio: nombreEmpresa,
          nombreCliente: nombreCliente || `+${numeroCliente}`,
          telefono:      numeroCliente,
          mensaje:       texto,
          empresaId,
        });
      } catch {}
    }

    // 14. Cita detectada → Firestore + email al negocio
    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const citaData   = JSON.parse(citaMatch[1]);
        const nombreCita = citaData.nombre || nombreCliente || `WhatsApp ${numeroCliente}`;

        if (citaData.nombre && (!nombreCliente || nombreCliente.startsWith('WhatsApp ')))
          await contactosRef.doc(contactoId).update({ nombre: citaData.nombre });

        // Guardar cita
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({
          nombreCliente: nombreCita,
          telefono:      numeroCliente,
          servicio:      citaData.servicio || 'Consulta',
          fechaHora:     parsearFechaHora(citaData.fecha, citaData.hora),
          fecha:         citaData.fecha || '',
          hora:          citaData.hora  || '',
          estado:        'pendiente',   // pendiente hasta que el negocio confirme
          canal:         'whatsapp',
          fuente:        'whatsapp-bot',
          notas:         'Agendado por WasapBot',
          contactoId,
          creadoEn:      FieldValue.serverTimestamp(),
        });

        // Email al negocio — notificacion inmediata GRATIS
        await enviarEmailCita({
          emailNegocio,
          nombreNegocio: nombreEmpresa,
          nombreCliente: nombreCita,
          telefono:      numeroCliente,
          servicio:      citaData.servicio || 'Consulta',
          fecha:         citaData.fecha || '?',
          hora:          citaData.hora  || '?',
          empresaId,
        });

      } catch (eCita) {
        console.error('Error guardando cita:', eCita.message);
      }
    }

    // 15. Conversacion
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({
      nombreCliente: nombreCliente || `WhatsApp ${numeroCliente}`,
      telefono: numeroCliente, canal: 'whatsapp',
      ultimoTexto: texto, ultimoMensaje: FieldValue.serverTimestamp(), contactoId,
    }, { merge: true });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'cliente', texto, creadoEn: FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol:'agente', texto: respuestaLimpia, creadoEn: FieldValue.serverTimestamp() });

    return res.json({ respuesta: respuestaLimpia });

  } catch (err) {
    console.error('Error whatsapp-baileys:', err);
    return res.status(500).json({ error: err.message });
  }
}

function extraerNombre(texto) {
  const patrones = [
    /(?:me llamo|soy|mi nombre es|habla|te escribe)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i,
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)(?:,| aqui| acá| aca| buenos| buen)/i,
  ];
  for (const p of patrones) {
    const m = texto.match(p);
    if (m?.[1]?.length > 2 && m[1].length < 40) return m[1].trim();
  }
  return null;
}

function parsearFechaHora(fecha, hora) {
  try {
    if (!fecha) return new Date();
    const ahora  = new Date();
    const partes = fecha.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (partes) {
      const dia  = parseInt(partes[1]);
      const mes  = parseInt(partes[2]) - 1;
      const anio = partes[3] ? parseInt(partes[3]) : ahora.getFullYear();
      const hp   = hora?.match(/(\d{1,2}):?(\d{2})?/);
      return new Date(anio < 100 ? 2000 + anio : anio, mes, dia,
        hp ? parseInt(hp[1]) : 9, hp?.[2] ? parseInt(hp[2]) : 0);
    }
  } catch {}
  return new Date();
}
