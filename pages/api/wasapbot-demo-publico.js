// pages/api/wasapbot-demo-publico.js
// Endpoint público y seguro — solo devuelve el nombre del negocio para el demo.
// No expone email, plan, teléfono ni ningún dato sensible.
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  try {
    const snap = await adminDb.collection('empresas').doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Negocio no encontrado' });

    const d = snap.data();
    // Solo devolvemos lo mínimo necesario para el demo — nada sensible
    return res.json({
      ok: true,
      nombre: d.nombreEmpresa || 'Tu negocio',
      industria: d.industria || 'otro',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
