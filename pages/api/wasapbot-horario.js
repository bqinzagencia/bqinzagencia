// pages/api/wasapbot-horario.js
// Guarda el horario semanal de atencion de la empresa (config/conocimiento.horarios.semanal)
// sin pisar otros campos de "conocimiento" (servicios, horarios.general, etc.)
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(400).json({ error: 'Solo POST' });
  const { empresaId, horarioSemanal } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });
  if (!horarioSemanal || typeof horarioSemanal !== 'object') {
    return res.status(400).json({ error: 'horarioSemanal requerido' });
  }

  try {
    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        horarios: { semanal: horarioSemanal },
        actualizadoEn: FieldValue.serverTimestamp(),
      }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error('wasapbot-horario:', err);
    return res.status(500).json({ error: err.message });
  }
}
