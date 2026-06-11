// pages/api/wasapbot-servicios.js
// Guarda servicios y preguntas frecuentes del WasapBot
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId, servicios, horario, preguntas } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    const preguntasArr = preguntas
      ? preguntas.split('\n').filter(Boolean).map(p => ({ pregunta: p.trim(), respuesta: '' }))
      : [];

    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        servicios: servicios || [],
        horarios: { general: horario || '' },
        info: {
          preguntasFrecuentes: preguntasArr,
        },
        actualizadoEn: FieldValue.serverTimestamp(),
      }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error('wasapbot-servicios:', err);
    return res.status(500).json({ error: err.message });
  }
}
