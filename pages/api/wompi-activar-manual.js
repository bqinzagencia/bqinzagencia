// pages/api/wompi-activar-manual.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'nexoti2026admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { secret, empresaId, planId, referencia, email } = req.body;

  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    // LISTAR todas las empresas
    if (empresaId === 'LISTAR' || empresaId === 'TODAS' || empresaId === 'buscar') {
      const snap = await adminDb.collection('empresas').get();
      const todas = snap.docs.map(d => ({
        id:         d.id,
        nombre:     d.data().nombreEmpresa,
        email:      d.data().email,
        producto:   d.data().producto,
        planActivo: d.data().planActivo,
      }));
      return res.json({ totalEmpresas: todas.length, empresas: todas });
    }

    // ACTIVAR POR EMAIL — más confiable que por ID
    if (email) {
      const snap = await adminDb.collection('empresas')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snap.empty) {
        return res.status(404).json({ error: `No hay empresa con email: ${email}` });
      }

      const empDoc  = snap.docs[0];
      const empId   = empDoc.id;
      const ahora   = new Date();
      const planHasta = new Date(ahora.getTime() + 30 * 86400000);

      await empDoc.ref.update({
        plan:          planId || 'estandar',
        planWasapbot:  planId || 'estandar',
        planActivo:    true,
        producto:      'wasapbot',
        planHasta:     planHasta,
        ultimoPago:    FieldValue.serverTimestamp(),
        ultimoPagoRef: referencia || 'manual',
      });

      if (referencia) {
        await adminDb.collection('pagos').doc(referencia).set({
          estado: 'APPROVED', empresaId: empId, planId,
          activadoManualmente: true,
          actualizadoEn: FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      return res.json({
        ok:        true,
        mensaje:   `Plan ${planId} activado`,
        empresaId: empId,
        empresa:   empDoc.data().nombreEmpresa,
        planActivo: true,
      });
    }

    // ACTIVAR POR ID
    if (!empresaId || !planId) {
      return res.status(400).json({ error: 'Envía email o empresaId + planId' });
    }

    const empRef  = adminDb.collection('empresas').doc(empresaId);
    const empSnap = await empRef.get();

    if (!empSnap.exists) {
      return res.status(404).json({
        error: `Empresa no encontrada: ${empresaId}`,
        tip:   'Usa el campo "email" en lugar de empresaId para buscar por correo',
      });
    }

    const ahora     = new Date();
    const planHasta = new Date(ahora.getTime() + 30 * 86400000);

    await empRef.update({
      plan: planId, planActivo: true, planHasta,
      ultimoPago: FieldValue.serverTimestamp(),
      ultimoPagoRef: referencia || 'manual',
    });

    return res.json({ ok: true, mensaje: `Plan ${planId} activado`, planActivo: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
