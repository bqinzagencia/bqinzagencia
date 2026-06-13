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

  try {
    // Si empresaId es 'LISTAR' — listar todas las empresas
    if (empresaId === 'LISTAR' || empresaId === 'TODAS' || empresaId === 'buscar') {
      const snap = await adminDb.collection('empresas').get();
      const todas = snap.docs.map(d => ({
        id:         d.id,
        nombre:     d.data().nombreEmpresa,
        email:      d.data().email,
        producto:   d.data().producto,
        planActivo: d.data().planActivo,
        ownerUid:   d.data().ownerUid,
      }));
      return res.json({ totalEmpresas: todas.length, empresas: todas });
    }

    if (!empresaId || !planId) {
      return res.status(400).json({ error: 'empresaId y planId requeridos' });
    }

    const empRef  = adminDb.collection('empresas').doc(empresaId);
    const empSnap = await empRef.get();

    if (!empSnap.exists) {
      return res.status(404).json({
        error: `Empresa no encontrada: ${empresaId}`,
        tip: 'Usa empresaId: "LISTAR" para ver todas las empresas',
      });
    }

    const ahora     = new Date();
    const planHasta = new Date(ahora.getTime() + 30 * 86400000);

    await empRef.update({
      plan:          planId,
      planActivo:    true,
      planHasta:     planHasta,
      ultimoPago:    FieldValue.serverTimestamp(),
      ultimoPagoRef: referencia || 'manual',
    });

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
      ok:         true,
      mensaje:    `Plan ${planId} activado`,
      empresa:    empActualizada.data()?.nombreEmpresa,
      planActivo: empActualizada.data()?.planActivo,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
