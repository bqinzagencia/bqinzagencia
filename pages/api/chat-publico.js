// pages/api/chat-publico.js
// Chat publico sitio web — guarda conversaciones, citas y leads — NEXOIA

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
    'Cuando el cliente quiera agendar, pide: nombre, servicio y fecha/hora.',
    'Al confirmar cita di: "Listo [nombre], te agendo [servicio] para [fecha] a las [hora]. Te esperamos!"',
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

    let citaGuardada = null;
    let leadGuardado = null;

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
          ultimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
          creadoEn: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Detectar cita
        const replyLower = reply.toLowerCase();
        const esConfirmacion = ['listo', 'te agendo', 'agendé', 'te esperamos', 'quedas agendad'].some(p => replyLower.includes(p));
        const esCita = ['cita', 'pm', 'am', 'sabado', 'sábado', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'mañana'].some(p => replyLower.includes(p));

        if (esConfirmacion && esCita) {
          const extractRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              max_tokens: 120,
              temperature: 0,
              messages: [
                { role: 'system', content: 'Extrae datos de la cita. JSON sin markdown: {"nombre":"","servicio":"","fecha":"","hora":"","telefono":""}' },
                ...messages.slice(-6),
                { role: 'assistant', content: reply },
              ],
            }),
          });
          const extData = await extractRes.json();
          const extText = (extData.choices[0]?.message?.content || '').trim();
          if (extText.startsWith('{')) {
            const citaData = JSON.parse(extText);
            if (citaData.nombre) {
              let fechaHora = new Date();
              fechaHora.setDate(fechaHora.getDate() + 7);
              const hm = (citaData.hora || '').match(/(\d+):?(\d+)?\s*(am|pm)?/i);
              if (hm) {
                let h = parseInt(hm[1]);
                const m = parseInt(hm[2] || '0');
                if (hm[3] && hm[3].toLowerCase() === 'pm' && h < 12) h += 12;
                fechaHora.setHours(h, m, 0, 0);
              }
              await db.collection('empresas').doc(empresaId).collection('citas').add({
                nombreCliente: citaData.nombre,
                servicio: citaData.servicio || 'Consulta',
                fecha: citaData.fecha || '',
                hora: citaData.hora || '',
                telefono: citaData.telefono || '',
                fechaHora,
                estado: 'confirmada',
                canal: 'Sitio Web',
                creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                notas: 'Agendada desde sitio web. ' + (citaData.fecha || '') + ' ' + (citaData.hora || ''),
              });
              citaGuardada = citaData;

              // Agregar al CRM
              const existe = await db.collection('empresas').doc(empresaId).collection('contactos')
                .where('nombre', '==', citaData.nombre).limit(1).get();
              if (existe.empty) {
                await db.collection('empresas').doc(empresaId).collection('contactos').add({
                  nombre: citaData.nombre,
                  telefono: citaData.telefono || '',
                  estado: 'cliente',
                  fuente: 'Sitio Web',
                  creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                  notas: 'Agendó via sitio web: ' + (citaData.servicio || ''),
                });
                leadGuardado = { nombre: citaData.nombre };
              }
            }
          }
        } else {
          // Capturar lead si da datos sin agendar
          const menciona = messages.some(m => /me llamo|soy |mi nombre|llámame|mi cel|mi tel/i.test(m.content || ''));
          if (messages.length >= 3 && menciona) {
            const ldRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                max_tokens: 80,
                temperature: 0,
                messages: [
                  { role: 'system', content: 'Extrae nombre y telefono del cliente. JSON: {"nombre":"","telefono":""}. Si no aparecen usa string vacio.' },
                  ...messages.slice(-6),
                ],
              }),
            });
            const ldData = await ldRes.json();
            const ldText = (ldData.choices[0]?.message?.content || '').trim();
            if (ldText.startsWith('{')) {
              const ld = JSON.parse(ldText);
              if (ld.nombre) {
                const existe = await db.collection('empresas').doc(empresaId).collection('contactos')
                  .where('nombre', '==', ld.nombre).limit(1).get();
                if (existe.empty) {
                  await db.collection('empresas').doc(empresaId).collection('contactos').add({
                    nombre: ld.nombre,
                    telefono: ld.telefono || '',
                    estado: 'nuevo',
                    fuente: 'Sitio Web',
                    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
                    notas: 'Lead capturado desde sitio web',
                  });
                  leadGuardado = ld;
                }
              }
            }
          }
        }
      } catch (dbErr) {
        console.error('[SitioWeb DB]', dbErr.message);
      }
    }

    return res.status(200).json({ reply, citaGuardada, leadGuardado });
  } catch (e) {
    console.error('[chat-publico]', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
