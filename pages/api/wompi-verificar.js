// pages/api/wompi-verificar.js
// Verifica el estado de un pago por referencia
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { ref } = req.query;
  if (!ref) return res.status(400).json({ error: 'ref requerida' });

  try {
    const pagoSnap = await adminDb.collection('pagos').doc(ref).get();
    if (!pagoSnap.exists) return res.json({ estado: 'NOT_FOUND' });

    const pago = pagoSnap.data();

    // Si el plan ya fue activado verificar en la empresa
    if (pago.empresaId && pago.estado === 'APPROVED') {
      const empSnap = await adminDb.collection('empresas').doc(pago.empresaId).get();
      const emp     = empSnap.data();
      return res.json({
        estado:     pago.estado,
        planActivo: emp?.planActivo === true,
        plan:       emp?.plan,
        empresaId:  pago.empresaId,
      });
    }

    return res.json({ estado: pago.estado || 'PENDING', empresaId: pago.empresaId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
