// pages/api/wompi-verificar.js
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { ref, empresaId } = req.query;
  if (!ref) return res.status(400).json({ error: 'ref requerida' });

  try {
    // Buscar el pago por referencia
    const pagoSnap = await adminDb.collection('pagos').doc(ref).get();

    if (!pagoSnap.exists) {
      // Si no encontró el pago por referencia, verificar directamente en la empresa
      // Esto ocurre cuando el webhook aún no llegó o no está configurado
      if (empresaId) {
        const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
        if (empSnap.exists) {
          const emp = empSnap.data();
          if (emp?.planActivo) {
            return res.json({ estado: 'APPROVED', planActivo: true, plan: emp.plan });
          }
        }
      }
      return res.json({ estado: 'NOT_FOUND' });
    }

    const pago = pagoSnap.data();

    // Si el pago está aprobado, verificar también en la empresa
    if (pago.estado === 'APPROVED') {
      const empId = pago.empresaId || empresaId;
      if (empId) {
        const empSnap = await adminDb.collection('empresas').doc(empId).get();
        const emp     = empSnap.exists ? empSnap.data() : null;
        return res.json({
          estado:     'APPROVED',
          planActivo: emp?.planActivo === true,
          plan:       emp?.plan,
          empresaId:  empId,
        });
      }
      return res.json({ estado: 'APPROVED', planActivo: false });
    }

    return res.json({
      estado:    pago.estado || 'PENDING',
      empresaId: pago.empresaId || empresaId,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
