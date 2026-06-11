// pages/api/chatbot-config.js
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { chatbotId, colorChat, posicion, saludo, avatarUrl } = req.body;
  if (!chatbotId) return res.status(400).json({ error: 'chatbotId requerido' });

  try {
    await adminDb.collection('chatbots').doc(chatbotId).update({
      colorChat: colorChat||'#2563EB',
      posicion:  posicion||'derecha',
      saludo:    saludo||'Hola, en que puedo ayudarte?',
      avatarUrl: avatarUrl||'',
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
