// pages/api/chat.js
// Motor de chat con OpenAI + deteccion automatica de citas + captura de leads — NEXOIA

import * as admin from 'firebase-admin';
import { evaluarMensaje, respuestaFiltro } from '../../lib/filtroMensajes';

function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      }),
    });
  }
  return admin.firestore();
}

async function extraerDatosCita(messages, reply, apiKey) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Extrae los datos de la cita de esta conversacion. Responde SOLO con JSON valido sin markdown: {"nombre":"string","servicio":"string","fecha":"string","hora":"string","telefono":"string"}. Si algun campo no aparece usa string vacio.' },
          ...messages.slice(-6),
          { role: 'assistant', content: reply },
        ],
      }),
    });
    const data = await res.json();
    const text = (data.choices[0]?.message?.content || '').trim();
    if (text.startsWith('{')) return JSON.parse(text);
  } catch (e) {
    console.error('[NEXOIA] Error extrayendo cita:', e.message);
  }
  return null;
}

async function extraerDatosLead(messages, apiKey) {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Extrae nombre y telefono del cliente de esta conversacion si los mencionó. Responde SOLO con JSON: {"nombre":"string","telefono":"string"}. Si no aparecen usa string vacio.' },
          ...messages.slice(-8),
        ],
      }),
    });
    const data = await res.json();
    const text = (data.choices[0]?.message?.content || '').trim();
    if (text.startsWith('{')) return JSON.parse(text);
  } catch (e) {}
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { messages, agente, empresa } = req.body;
  if (!messages || !agente) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  // ── FILTRO ANTI-CHARLATANES ──────────────────────────────
  // Evita que mensajes sin relacion con el negocio (spam, saludos
  // sueltos, pruebas, groserias, etc.) consuman tokens de OpenAI.
  // Igual al filtro ya usado en /api/chatbot-responder.js
  const ultimoMensaje = messages[messages.length - 1]?.content || '';
  const historialLen  = Math.max(messages.length - 1, 0);
  const evaluacion    = evaluarMensaje(ultimoMensaje, empresa?.industria, historialLen);
  if (!evaluacion.pasar) {
    return res.status(200).json({
      reply: respuestaFiltro(empresa?.nombreEmpresa),
      filtrado: true,
    });
  }

  // Cargar base de conocimiento
  let promptConocimiento = '';
  try {
    if (empresa && empresa.id) {
      const db = getAdminDb();
      const snap = await db.collection('empresas').doc(empresa.id).collection('config').doc('conocimiento').get();
      if (snap.exists && snap.data().promptGenerado) promptConocimiento = snap.data().promptGenerado;
    }
  } catch (e) {}

  const systemPrompt = [
    'Eres ' + agente.nombre + ', asistente de IA ' + (agente.personalidad || 'amigable y profesional') + ' de ' + (empresa ? empresa.nombreEmpresa : 'la empresa') + '.',
    promptConocimiento || ('Empresa: ' + (empresa ? empresa.nombreEmpresa : '') + ', ' + (empresa ? empresa.industria : '') + ', ' + (empresa ? empresa.ciudad : '') + '.'),
    agente.prompt ? 'Instrucciones adicionales: ' + agente.prompt : '',
    'Reglas: responde en espanol colombiano, tono calido, maximo 3-4 lineas.',
    'Cuando el cliente pida cita: solicita nombre, servicio y fecha/hora.',
    'Al confirmar cita di: "Listo [nombre], te agendo [servicio] para [fecha] a las [hora]. Te esperamos!"',
    'Si el cliente da su nombre o telefono, usalo en la conversacion.',
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error ? err.error.message : 'Error de OpenAI' });
    }

    const data = await response.json();
    const reply = data.choices[0] ? data.choices[0].message.content : 'Lo siento, no pude procesar tu mensaje.';

    let citaGuardada = null;
    let leadGuardado = null;

    if (empresa && empresa.id) {
      const db = getAdminDb();
      const empresaId = empresa.id;
      const lastUserMsg = messages[messages.length - 1]?.content || '';

      // Guardar conversacion
      try {
        await db.collection('empresas').doc(empresaId).collection('conversaciones').add({
          agenteId: agente.id || '',
          agenteNombre: agente.nombre || '',
          canal: 'Chat Web',
          nombre: lastUserMsg.substring(0, 40),
          ultimoMensajeTexto: reply.substring(0, 80),
          mensajeUsuario: lastUserMsg,
          mensajeAgente: reply,
          ultimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
          creadoEn: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) { console.error('[NEXOIA] Error guardando conversacion:', e.message); }

      // Detectar cita
      const replyLower = reply.toLowerCase();
      const palabrasConfirmacion = ['listo', 'te agendo', 'agendé', 'reservé', 'confirmé', 'te esperamos', 'quedas agendad', 'he agendado'];
      const palabrasCita = ['cita', 'turno', 'servicio', 'pm', 'am', 'sabado', 'sábado', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'domingo', 'mañana', 'manana'];
      const tieneConfirmacion = palabrasConfirmacion.some(p => replyLower.includes(p));
      const tieneCita = palabrasCita.some(p => replyLower.includes(p));

      if (tieneConfirmacion && tieneCita) {
        const citaData = await extraerDatosCita(messages, reply, OPENAI_API_KEY);
        if (citaData && citaData.nombre) {
          try {
            let fechaHora = new Date();
            fechaHora.setDate(fechaHora.getDate() + 7);
            const horaMatch = (citaData.hora || '').match(/(\d+):?(\d+)?\s*(am|pm)?/i);
            if (horaMatch) {
              let h = parseInt(horaMatch[1]);
              const m = parseInt(horaMatch[2] || '0');
              const ap = horaMatch[3];
              if (ap && ap.toLowerCase() === 'pm' && h < 12) h += 12;
              fechaHora.setHours(h, m, 0, 0);
            }
            await db.collection('empresas').doc(empresaId).collection('citas').add({
              nombreCliente: citaData.nombre,
              servicio: citaData.servicio || 'Consulta general',
              fecha: citaData.fecha || '',
              hora: citaData.hora || '',
              telefono: citaData.telefono || '',
              fechaHora: fechaHora,
              estado: 'confirmada',
              canal: 'Chat Web',
              agenteId: agente.id || '',
              agenteNombre: agente.nombre || '',
              creadoEn: admin.firestore.FieldValue.serverTimestamp(),
              notas: 'Agendada por ' + agente.nombre + '. Fecha: ' + (citaData.fecha || '') + ' ' + (citaData.hora || ''),
            });
            citaGuardada = citaData;

            // Agregar al CRM automaticamente
            const contactosSnap = await db.collection('empresas').doc(empresaId).collection('contactos')
              .where('nombre', '==', citaData.nombre).limit(1).get();
            if (contactosSnap.empty) {
              await db.collection('empresas').doc(empresaId).collection('contactos').add({
                nombre: citaData.nombre,
                telefono: citaData.telefono || '',
                estado: 'cliente',
                fuente: 'Chat IA',
                agenteId: agente.id || '',
                creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                notas: 'Agendó cita: ' + (citaData.servicio || '') + ' para ' + (citaData.fecha || '') + ' ' + (citaData.hora || ''),
              });
              leadGuardado = { nombre: citaData.nombre, telefono: citaData.telefono };
            }
          } catch (e) { console.error('[NEXOIA] Error guardando cita:', e.message); }
        }
      } else {
        // Intentar capturar lead si el cliente dio datos sin agendar
        const conversacionLarga = messages.length >= 3;
        const menciona = messages.some(m => /me llamo|soy|mi nombre|mi cel|mi tel|al \d|llamar/i.test(m.content || ''));
        if (conversacionLarga && menciona) {
          const leadData = await extraerDatosLead(messages, OPENAI_API_KEY);
          if (leadData && leadData.nombre) {
            try {
              const existSnap = await db.collection('empresas').doc(empresaId).collection('contactos')
                .where('nombre', '==', leadData.nombre).limit(1).get();
              if (existSnap.empty) {
                await db.collection('empresas').doc(empresaId).collection('contactos').add({
                  nombre: leadData.nombre,
                  telefono: leadData.telefono || '',
                  estado: 'nuevo',
                  fuente: 'Chat IA',
                  agenteId: agente.id || '',
                  creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                  notas: 'Capturado automaticamente desde chat web',
                });
                leadGuardado = leadData;
              }
            } catch (e) {}
          }
        }
      }
    }

    return res.status(200).json({ reply, citaGuardada, leadGuardado });
  } catch (e) {
    console.error('[NEXOIA Chat] Error:', e.message);
    return res.status(500).json({ error: 'Error interno: ' + e.message });
  }
}
