// pages/api/wasapbot-servicios.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(400).json({ error: 'Solo POST' });
  const { empresaId, servicios, horario, preguntas, tipoCatalogo, permitePedidos } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    // preguntas puede llegar como array de objetos, array de strings, o string
    let preguntasArr = [];
    if (Array.isArray(preguntas)) {
      preguntasArr = preguntas
        .map(p => typeof p === 'string' ? { pregunta: p.trim(), respuesta: '' } : p)
        .filter(p => p?.pregunta);
    } else if (typeof preguntas === 'string' && preguntas.trim()) {
      preguntasArr = preguntas.split('\n')
        .filter(Boolean)
        .map(p => ({ pregunta: p.trim(), respuesta: '' }));
    }

    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        servicios:      servicios || [],
        tipoCatalogo:   tipoCatalogo || 'servicios',
        permitePedidos: permitePedidos || false,
        'horarios.general': horario || '',
        'info.preguntasFrecuentes': preguntasArr,
        actualizadoEn: FieldValue.serverTimestamp(),
      }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error('wasapbot-servicios:', err);
    return res.status(500).json({ error: err.message });
  }
}
