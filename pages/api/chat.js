// pages/api/chat.js
// Motor de chat con OpenAI + deteccion automatica de citas — NEXOIA

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

  const { messages, agente, empresa } = req.body;
  if (!messages || !agente) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  // Cargar base de conocimiento si existe
  let promptConocimiento = '';
  try {
    if (empresa && empresa.id) {
      const db = getAdminDb();
      const snapConocimiento = await db.collection('empresas').doc(empresa.id).collection('config').doc('conocimiento').get();
      if (snapConocimiento.exists) {
        const dataC = snapConocimiento.data();
        if (dataC.promptGenerado) promptConocimiento = dataC.promptGenerado;
      }
    }
  } catch (e) {
    console.log('[NEXOIA] Sin base de conocimiento:', e.message);
  }

  const systemPrompt = [
    'Eres ' + agente.nombre + ', asistente de IA ' + (agente.personalidad || 'amigable y profesional') + ' de ' + (empresa ? empresa.nombreEmpresa : 'la empresa') + '.',
    promptConocimiento ? promptConocimiento : 'Empresa: ' + (empresa ? empresa.nombreEmpresa : '') + ', ' + (empresa ? empresa.industria : '') + ', ' + (empresa ? empresa.ciudad : '') + '.',
    agente.prompt ? 'Instrucciones adicionales: ' + agente.prompt : '',
    'Reglas: responde en espanol colombiano, maximo 3 lineas, tono calido.',
    'Cuando el cliente pida cita: solicita nombre, servicio, fecha y hora.',
    'Al confirmar una cita di exactamente: "Listo [nombre], te agendo [servicio] para [fecha] a las [hora]."',
  ].filter(Boolean).join('\n');

  try {
    // 1. Respuesta principal del agente
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

    // 2. Detectar si se confirmo una cita
    let citaGuardada = null;
    const palabrasConfirmacion = ['agendo', 'agendé', 'agende', 'reservé', 'reserve', 'confirmé', 'confirme', 'quedaste', 'quedas', 'listo', 'perfecto', 'te espera', 'he agendado', 'he reservado', 'tu cita', 'está agendad', 'esta agendad', 'te esperamos', 'nos vemos'];
    const palabrasCita = ['cita', 'turno', 'reserva', 'corte', 'servicio', 'pm', 'am', 'sabado', 'sábado', 'domingo', 'lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'mañana', 'manana'];

    const replyLower = reply.toLowerCase();
    const tieneConfirmacion = palabrasConfirmacion.some(p => replyLower.includes(p));
    const tieneCita = palabrasCita.some(p => replyLower.includes(p));

    console.log('[NEXOIA] tieneConfirmacion:', tieneConfirmacion, 'tieneCita:', tieneCita, 'reply:', reply.substring(0, 80));

    if (tieneConfirmacion && tieneCita) {
      // Segunda llamada para extraer datos estructurados
      try {
        const extractRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 150,
            temperature: 0,
            messages: [
              {
                role: 'system',
                content: 'Extrae los datos de la cita de esta conversacion. Responde UNICAMENTE con JSON valido, sin texto adicional, sin markdown. Formato exacto: {"nombre":"string","servicio":"string","fecha":"string","hora":"string"}. Si algun campo no aparece usa string vacio.'
              },
              ...messages.slice(-6),
              { role: 'assistant', content: reply }
            ],
          }),
        });

        const extractData = await extractRes.json();
        const extractText = extractData.choices[0] ? extractData.choices[0].message.content.trim() : '';

        if (extractText && extractText.startsWith('{')) {
          const citaData = JSON.parse(extractText);
          if (citaData.nombre && empresa && empresa.id) {
            const db = getAdminDb();
            // Construir fechaHora como Date para que la Agenda lo muestre
            let fechaHora = new Date();
            fechaHora.setDate(fechaHora.getDate() + 7); // por defecto proxima semana
            const hora = citaData.hora || '10:00';
            const horaMatch = hora.match(/(\d+):(\d+)?\s*(am|pm)?/i);
            if (horaMatch) {
              let h = parseInt(horaMatch[1]);
              const m = parseInt(horaMatch[2] || '0');
              const ampm = horaMatch[3];
              if (ampm && ampm.toLowerCase() === 'pm' && h < 12) h += 12;
              if (ampm && ampm.toLowerCase() === 'am' && h === 12) h = 0;
              fechaHora.setHours(h, m, 0, 0);
            }
            await db.collection('empresas').doc(empresa.id).collection('citas').add({
              nombreCliente: citaData.nombre,
              nombre: citaData.nombre,
              servicio: citaData.servicio || 'Consulta general',
              fecha: citaData.fecha || '',
              hora: citaData.hora || '',
              fechaHora: fechaHora,
              estado: 'confirmada',
              canal: 'Chat Web',
              agenteId: agente.id || '',
              agenteNombre: agente.nombre || '',
              creadoEn: admin.firestore.FieldValue.serverTimestamp(),
              notas: 'Agendada automaticamente por ' + agente.nombre + '. Fecha indicada: ' + (citaData.fecha || '') + ' ' + (citaData.hora || ''),
            });
            citaGuardada = citaData;
            console.log('[NEXOIA] Cita guardada:', JSON.stringify(citaData));
          }
        }
      } catch (extractErr) {
        console.error('[NEXOIA] Error extrayendo cita:', extractErr.message);
      }
    }

    return res.status(200).json({ reply, citaGuardada });
  } catch (e) {
    console.error('[NEXOIA Chat API] Error:', e.message);
    return res.status(500).json({ error: 'Error interno: ' + e.message });
  }
}
