// pages/api/chatbot-servicios.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { chatbotId, servicios, horario, preguntas, permitePedidos } = req.body;
  if (!chatbotId) return res.status(400).json({ error: 'chatbotId requerido' });

  try {
    await adminDb.collection('chatbots').doc(chatbotId)
      .collection('config').doc('conocimiento').set({
        servicios: servicios||[],
        horarios:  { general: horario||'' },
        permitePedidos: permitePedidos||false,
        info: { preguntasFrecuentes: preguntas||[] },
        actualizadoEn: FieldValue.serverTimestamp(),
      }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
