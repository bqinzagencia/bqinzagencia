// pages/api/wasapbot-config.js
// Guarda configuracion extra del negocio (nequi, etc.)
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId, nequi } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });
  try {
    const update = {};
    if (nequi !== undefined) update.nequi = nequi;
    await adminDb.collection('empresas').doc(empresaId).update(update);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
