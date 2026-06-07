// pages/api/chat-publico.js
// Chat publico para sitio web — guarda conversaciones y citas — NEXOIA

import * as admin from 'firebase-admin';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { messages, empresaId, empresaNombre, industria, conocimiento } = req.body;
  if (!messages) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  const systemPrompt = [
    'Eres el asistente virtual de ' + (empresaNombre || 'la empresa') + ', negocio de ' + (industria || 'servicios') + ' en Colombia.',
    conocimiento || '',
    'Reglas: responde en espanol colombiano, tono amigable, maximo 3-4 lineas.',
    'Si el cliente quiere agendar cita, pide: nombre, servicio y fecha/hora preferida.',
    'Al confirmar una cita di exactamente: "Listo [nombre], te agendo [servicio] para [fecha] a las [hora]. Te esperamos!"',
    'Si no sabes algo, sugiere llamar o escribir por WhatsApp.',
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 250,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Lo siento, intenta de nuevo.';

    // Guardar conversacion en Firestore si hay empresaId
    let citaGuardada = null;
    if (empresaId) {
      try {
        const db = getAdminDb();
        const lastUserMsg = messages[messages.length - 1]?.content || '';

        // Guardar conversacion
        await db.collection('empresas').doc(empresaId).collection('conversaciones').add({
          canal: 'Sitio Web',
          nombre: lastUserMsg.substring(0, 40),
          ultimoMensajeTexto: reply.substring(0, 80),
          mensajeUsuario: lastUserMsg,
          mensajeAgente: reply,
          creadoEn: admin.firestore.FieldValue.serverTimestamp(),
          ultimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Detectar si se confirmo una cita
        const replyLower = reply.toLowerCase();
        const palabrasConfirmacion = ['listo', 'te agendo', 'agendé', 'reservé', 'confirmé', 'te esperamos', 'quedas agendad'];
        const palabrasCita = ['cita', 'turno', 'servicio', 'pm', 'am', 'sabado', 'sábado', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'domingo', 'mañana'];

        const tieneConfirmacion = palabrasConfirmacion.some(p => replyLower.includes(p));
        const tieneCita = palabrasCita.some(p => replyLower.includes(p));

        if (tieneConfirmacion && tieneCita) {
          // Extraer datos de la cita con OpenAI
          const extractRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 120,
              temperature: 0,
              messages: [
                { role: 'system', content: 'Extrae los datos de la cita. Responde SOLO con JSON valido sin markdown: {"nombre":"string","servicio":"string","fecha":"string","hora":"string"}. Si algun campo no aparece usa string vacio.' },
                ...messages.slice(-6),
                { role: 'assistant', content: reply },
              ],
            }),
          });
          const extractData = await extractRes.json();
          const extractText = (extractData.choices[0]?.message?.content || '').trim();

          if (extractText.startsWith('{')) {
            const citaData = JSON.parse(extractText);
            if (citaData.nombre) {
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
                fechaHora: fechaHora,
                estado: 'confirmada',
                canal: 'Sitio Web',
                creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                notas: 'Agendada desde el sitio web. Fecha indicada: ' + (citaData.fecha || '') + ' ' + (citaData.hora || ''),
              });
              citaGuardada = citaData;
              console.log('[NEXOIA SitioWeb] Cita guardada:', JSON.stringify(citaData));
            }
          }
        }
      } catch (dbErr) {
        console.error('[NEXOIA SitioWeb] Error DB:', dbErr.message);
      }
    }

    return res.status(200).json({ reply, citaGuardada });
  } catch (e) {
    console.error('[chat-publico] Error:', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
