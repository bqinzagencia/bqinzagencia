// pages/api/widget-chat.js
// API para el widget embebible en sitios externos — NEXOIA

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
  // CORS — permitir cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { messages, empresaId } = req.body;
  if (!messages || !empresaId) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  try {
    const db = getAdminDb();

    // Cargar datos de la empresa
    const empresaSnap = await db.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empresaSnap.data();

    // Cargar base de conocimiento
    let promptConocimiento = '';
    try {
      const cSnap = await db.collection('empresas').doc(empresaId).collection('config').doc('conocimiento').get();
      if (cSnap.exists && cSnap.data().promptGenerado) promptConocimiento = cSnap.data().promptGenerado;
    } catch(e) {}

    const systemPrompt = [
      'Eres el asistente virtual de ' + (empresa.nombreEmpresa || 'la empresa') + ', un negocio de ' + (empresa.industria || 'servicios') + ' en Colombia.',
      promptConocimiento || ('Atiende clientes de ' + (empresa.nombreEmpresa || 'la empresa') + ' con amabilidad y profesionalismo.'),
      'Reglas: responde en espanol colombiano, tono amigable, maximo 3-4 lineas por respuesta.',
      'Si el cliente quiere una cita o reserva, pide nombre, servicio y fecha preferida.',
      'Si no sabes algo, sugiere llamar o escribir por WhatsApp.',
    ].filter(Boolean).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-8)],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Lo siento, intenta de nuevo.';
    return res.status(200).json({ reply });

  } catch (e) {
    console.error('[Widget Chat]', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
