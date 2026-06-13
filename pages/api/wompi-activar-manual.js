// pages/api/wompi-activar-manual.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'nexoti2026admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { secret, empresaId, planId, referencia } = req.body;

  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  if (!empresaId || !planId) {
    return res.status(400).json({ error: 'empresaId y planId requeridos' });
  }

  try {
    // Verificar primero si el documento existe
    const empRef  = adminDb.collection('empresas').doc(empresaId);
    const empSnap = await empRef.get();

    if (!empSnap.exists) {
      // Buscar por ownerUid o email para encontrar la empresa real
      const snap = await adminDb.collection('empresas').get();
      const todas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({
        error: 'Empresa no encontrada con ese ID',
        empresaId,
        sugerencia: 'Revisa el ID correcto en Firebase Console',
        totalEmpresas: todas.length,
        primeras3: todas.slice(0, 3).map(e => ({
          id: e.id,
          nombre: e.nombreEmpresa,
          email: e.email,
          producto: e.producto,
          planActivo: e.planActivo,
        })),
      });
    }

    const ahora     = new Date();
    const planHasta = new Date(ahora.getTime() + 30 * 86400000);

    // Usar set con merge para no fallar si hay campos faltantes
    await empRef.set({
      plan:          planId,
      planActivo:    true,
      planHasta:     planHasta,
      ultimoPago:    FieldValue.serverTimestamp(),
      ultimoPagoRef: referencia || 'manual',
    }, { merge: true });

    if (referencia) {
      await adminDb.collection('pagos').doc(referencia).set({
        estado:              'APPROVED',
        empresaId,
        planId,
        activadoManualmente: true,
        actualizadoEn:       FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const empActualizada = await empRef.get();
    return res.json({
      ok:      true,
      mensaje: `Plan ${planId} activado`,
      empresa: empActualizada.data()?.nombreEmpresa,
      planActivo: empActualizada.data()?.planActivo,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
