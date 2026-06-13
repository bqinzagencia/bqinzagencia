// pages/api/wompi-activar-manual.js
// Activa el plan manualmente cuando el webhook no llegó
// Solo para Alexander (administrador)
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'nexoti2026admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { secret, empresaId, planId, referencia } = req.body;

  // Verificar que es el administrador
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  if (!empresaId || !planId) {
    return res.status(400).json({ error: 'empresaId y planId requeridos' });
  }

  try {
    const ahora     = new Date();
    const planHasta = new Date(ahora.getTime() + 30 * 86400000);

    await adminDb.collection('empresas').doc(empresaId).update({
      plan:          planId,
      planActivo:    true,
      planHasta:     planHasta,
      ultimoPago:    FieldValue.serverTimestamp(),
      ultimoPagoRef: referencia || 'manual',
    });

    // Actualizar el pago en Firestore si existe
    if (referencia) {
      await adminDb.collection('pagos').doc(referencia).set({
        estado:     'APPROVED',
        empresaId,
        planId,
        activadoManualmente: true,
        actualizadoEn: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return res.json({ ok: true, mensaje: `Plan ${planId} activado para empresa ${empresaId}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
