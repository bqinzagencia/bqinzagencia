// pages/api/chatbot-crear.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { nombre, industria, descripcion, email, horario, ciudad, whatsapp } = req.body;
  if (!nombre || !industria || !email) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const ref = adminDb.collection('chatbots').doc();
    await ref.set({
      nombre, industria, descripcion: descripcion||'', email,
      horario: horario||'', ciudad: ciudad||'', whatsapp: whatsapp||'',
      producto:    'chatbot',
      plan:        'starter',
      planActivo:  false,
      trialHasta:  new Date(Date.now() + 7 * 86400000),
      tokensUsados: 0,
      conversaciones: 0,
      colorChat:   '#2563EB',
      posicion:    'derecha',
      saludo:      `Hola, bienvenido a ${nombre}. En que puedo ayudarte?`,
      activo:      true,
      creadoEn:    FieldValue.serverTimestamp(),
    });

    await adminDb.collection('chatbots').doc(ref.id)
      .collection('config').doc('conocimiento').set({
        info: { descripcionNegocio: descripcion||'', email, horario:horario||'' },
        servicios: [], creadoEn: FieldValue.serverTimestamp(),
      });

    return res.json({ ok: true, chatbotId: ref.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
