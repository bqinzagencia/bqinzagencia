// pages/api/whatsapp-baileys.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';
const historiales = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-server-secret'];
  if (secret !== SERVER_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto, msgId } = req.body;
  if (!empresaId || !numeroCliente || !texto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // 1. Obtener datos de la empresa
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) {
      // Empresa eliminada — limpiar historial y sesion
      historiales.delete(`${empresaId}_${numeroCliente}`);
      return res.json({ respuesta: null });
    }
    const empresa = empresaSnap.data();

    // 2. Verificar trial
    if (empresa.trialHasta) {
      const hasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : new Date(empresa.trialHasta);
      if (new Date() > hasta) {
        return res.json({
          respuesta: `Hola! El periodo de prueba de ${empresa.nombreEmpresa} ha vencido. Contacta al administrador para continuar.`,
        });
      }
    }

    // 3. Obtener base de conocimiento
    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento')
      .get();
    const conocimiento = conocimientoSnap.exists ? conocimientoSnap.data() : null;

    // 4. Buscar o crear contacto en CRM
    const contactosRef = adminDb.collection('empresas').doc(empresaId).collection('contactos');
    const contactoQuery = await contactosRef.where('telefono', '==', numeroCliente).limit(1).get();

    let contactoId;
    let nombreCliente = null;

    if (contactoQuery.empty) {
      // Crear contacto nuevo — nombre pendiente de captura
      const nuevoContacto = await contactosRef.add({
        telefono:    numeroCliente,
        nombre:      `WhatsApp ${numeroCliente}`,
        canal:       'whatsapp',
        fuente:      'whatsapp-bot',
        estado:      'nuevo',
        creadoEn:    FieldValue.serverTimestamp(),
      });
      contactoId = nuevoContacto.id;
    } else {
      const docSnap = contactoQuery.docs[0];
      contactoId    = docSnap.id;
      nombreCliente = docSnap.data().nombre;
      // Si el nombre sigue siendo el numero, intentar actualizarlo
      if (!nombreCliente || nombreCliente.startsWith('WhatsApp ') || nombreCliente === numeroCliente) {
        nombreCliente = null;
      }
    }

    // 5. Historial de conversacion — clave unica por empresa+numero
    const historialKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(historialKey)) historiales.set(historialKey, []);
    const historial = historiales.get(historialKey);
    // Limpiar historial si tiene mas de 20 mensajes (evita acumulacion)
    if (historial.length > 20) historial.splice(0, historial.length - 10);
    historial.push({ role: 'user', content: texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    // 6. System prompt
    let systemPrompt = `Eres el asistente virtual de WhatsApp de "${empresa.nombreEmpresa}", negocio de ${empresa.industria || 'servicios'} en ${empresa.ciudad || 'Colombia'}.

REGLAS IMPORTANTES:
- Si el cliente NO ha dado su nombre todavia, pidelo amablemente al inicio
- Responde de forma concisa (max 3 parrafos cortos), amigable y profesional
- Usa emojis moderadamente
- Si el cliente quiere AGENDAR una cita: confirma el servicio, fecha y hora. Al final de tu respuesta agrega exactamente esta linea en una nueva linea:
  CITA_DETECTADA: {"nombre":"NOMBRE_CLIENTE","servicio":"SERVICIO","fecha":"FECHA","hora":"HORA"}
- Si el cliente da su nombre, usalo en la respuesta
- Idioma: espanol colombiano`;

    if (nombreCliente) {
      systemPrompt += `\n\nNombre del cliente: ${nombreCliente}`;
    } else {
      systemPrompt += `\n\nEl cliente aun no ha dado su nombre. Pidelo de forma natural si no lo has hecho.`;
    }

    if (conocimiento) {
      if (conocimiento.servicios?.length > 0) {
        const svcs = conocimiento.servicios
          .filter(s => s.nombre)
          .map(s => `- ${s.nombre}: $${s.precio || 'consultar'} COP${s.duracion ? ` (${s.duracion} min)` : ''}`)
          .join('\n');
        systemPrompt += `\n\nSERVICIOS:\n${svcs}`;
      }
      if (conocimiento.info?.descripcionNegocio) {
        systemPrompt += `\n\nDESCRIPCION: ${conocimiento.info.descripcionNegocio}`;
      }
      if (conocimiento.info?.direccion) {
        systemPrompt += `\nDIRECCION: ${conocimiento.info.direccion}`;
      }
      if (conocimiento.horarios) {
        const hDias = Object.entries(conocimiento.horarios)
          .filter(([, v]) => v.activo)
          .map(([dia, v]) => `${dia}: ${v.desde}-${v.hasta}`)
          .join(', ');
        if (hDias) systemPrompt += `\nHORARIOS: ${hDias}`;
      }
      if (conocimiento.info?.formasPago?.length) {
        systemPrompt += `\nPAGOS: ${conocimiento.info.formasPago.join(', ')}`;
      }
      if (conocimiento.info?.preguntasFrecuentes?.length > 0) {
        const faqs = conocimiento.info.preguntasFrecuentes
          .filter(f => f.pregunta)
          .map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`)
          .join('\n');
        systemPrompt += `\n\nFAQs:\n${faqs}`;
      }
    }

    // 7. Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historial,
      ],
    });

    let respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role: 'assistant', content: respuesta });

    // 8. Detectar si el cliente dio su nombre en el mensaje
    const nombreEnMensaje = extraerNombre(texto);
    if (nombreEnMensaje && (!nombreCliente || nombreCliente.startsWith('WhatsApp '))) {
      await contactosRef.doc(contactoId).update({ nombre: nombreEnMensaje });
      nombreCliente = nombreEnMensaje;
    }

    // 9. Detectar cita agendada en la respuesta
    let respuestaLimpia = respuesta;
    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const citaData = JSON.parse(citaMatch[1]);
        const nombreCita = citaData.nombre || nombreCliente || `WhatsApp ${numeroCliente}`;

        // Actualizar nombre del contacto si lo capturamos
        if (citaData.nombre && (!nombreCliente || nombreCliente.startsWith('WhatsApp '))) {
          await contactosRef.doc(contactoId).update({ nombre: citaData.nombre });
        }

        // Crear cita en Firestore
        const fechaHora = parsearFechaHora(citaData.fecha, citaData.hora);
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({
          nombreCliente:  nombreCita,
          telefono:       numeroCliente,
          servicio:       citaData.servicio || 'Consulta',
          fechaHora:      fechaHora,
          fecha:          citaData.fecha || '',
          hora:           citaData.hora  || '',
          estado:         'confirmada',
          canal:          'whatsapp',
          fuente:         'whatsapp-bot',
          notas:          `Cita agendada por WhatsApp Bot`,
          contactoId,
          creadoEn:       FieldValue.serverTimestamp(),
        });

        // Quitar la linea CITA_DETECTADA de la respuesta
        respuestaLimpia = respuesta.replace(/\n?CITA_DETECTADA:.*$/m, '').trim();
        console.log(`[${empresaId}] Cita creada para ${nombreCita}: ${citaData.servicio} - ${citaData.fecha} ${citaData.hora}`);
      } catch (e) {
        console.error('Error procesando cita:', e.message);
        respuestaLimpia = respuesta.replace(/\n?CITA_DETECTADA:.*$/m, '').trim();
      }
    }

    // 10. Guardar conversacion
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey  = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({
      nombreCliente:  nombreCliente || `WhatsApp ${numeroCliente}`,
      telefono:       numeroCliente,
      canal:          'whatsapp',
      ultimoTexto:    texto,
      ultimoMensaje:  FieldValue.serverTimestamp(),
      contactoId,
    }, { merge: true });

    await convRef.doc(convKey).collection('mensajes').add({
      rol: 'cliente', texto, creadoEn: FieldValue.serverTimestamp(),
    });
    await convRef.doc(convKey).collection('mensajes').add({
      rol: 'agente', texto: respuestaLimpia, creadoEn: FieldValue.serverTimestamp(),
    });

    return res.json({ respuesta: respuestaLimpia });

  } catch (err) {
    console.error('Error whatsapp-baileys:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extraerNombre(texto) {
  // Patrones comunes para dar nombre en WhatsApp
  const patrones = [
    /(?:me llamo|soy|mi nombre es|habla)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i,
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)(?:,| aqui| acá| aca)/i,
  ];
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match && match[1] && match[1].length > 2) return match[1].trim();
  }
  return null;
}

function parsearFechaHora(fecha, hora) {
  try {
    if (!fecha) return FieldValue.serverTimestamp();
    // Intentar parsear fecha en formato DD/MM/YYYY o texto
    const ahora = new Date();
    const partes = fecha.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (partes) {
      const dia = parseInt(partes[1]);
      const mes = parseInt(partes[2]) - 1;
      const anio = partes[3] ? parseInt(partes[3]) : ahora.getFullYear();
      const horaPartes = hora?.match(/(\d{1,2}):?(\d{2})?/);
      const horas   = horaPartes ? parseInt(horaPartes[1]) : 9;
      const minutos = horaPartes?.[2] ? parseInt(horaPartes[2]) : 0;
      return new Date(anio < 100 ? 2000 + anio : anio, mes, dia, horas, minutos);
    }
  } catch {}
  return new Date();
}
