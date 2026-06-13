// pages/api/wasapbot-panel.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {

  // ── GET: cargar datos del panel ──
  if (req.method === 'GET') {
    const { id, subcol } = req.query;
    if (!id) return res.status(400).json({ error: 'id requerido' });

    try {
      const empSnap = await adminDb.collection('empresas').doc(id).get();

      // Si el documento no existe, buscar por cualquier campo que coincida
      if (!empSnap.exists) {
        return res.status(404).json({ error: 'Empresa no encontrada', id });
      }

      const empData = empSnap.data();

      // ── Sin restricción de producto — cualquier empresa puede usar el panel WasapBot ──
      // (el acceso ya está controlado por el login que verifica ownerUid o email)

      // Subcollección de citas
      if (subcol === 'citas') {
        const citasSnap = await adminDb.collection('empresas').doc(id)
          .collection('citas')
          .orderBy('creadoEn', 'desc')
          .limit(100)
          .get().catch(() => null);
        const citas = citasSnap
          ? citasSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          : [];
        return res.json({ ok: true, citas });
      }

      // Datos principales
      const [convSnap, tokenSnap, conocimientoSnap] = await Promise.all([
        adminDb.collection('empresas').doc(id)
          .collection('conversaciones')
          .orderBy('ultimoMensaje', 'desc')
          .limit(20).get().catch(() => null),
        adminDb.collection('wasapbot_tokens').doc(id).get().catch(() => null),
        adminDb.collection('empresas').doc(id)
          .collection('config').doc('conocimiento').get().catch(() => null),
      ]);

      const convs        = convSnap ? convSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
      const conocimiento = conocimientoSnap?.exists ? conocimientoSnap.data() : {};
      const tokenData    = tokenSnap?.exists ? tokenSnap.data() : { usados: 0, total: 15000, plan: 'wasapbot' };

      return res.json({ ok: true, empresa: { id, ...empData }, convs, tokens: tokenData, conocimiento });

    } catch (err) {
      console.error('wasapbot-panel GET:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: acciones (actualizar estado de cita) ──
  if (req.method === 'POST') {
    const { accion, empresaId, citaId, estado } = req.body;

    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      if (accion === 'actualizarCita') {
        if (!citaId || !estado) return res.status(400).json({ error: 'citaId y estado requeridos' });

        const estados = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estados.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

        await adminDb.collection('empresas').doc(empresaId)
          .collection('citas').doc(citaId)
          .update({ estado, actualizadoEn: FieldValue.serverTimestamp() });

        return res.json({ ok: true });
      }

      // Guardar configuración general (nequi, etc.)
      if (accion === 'guardarConfig') {
        const { campos } = req.body;
        if (!campos) return res.status(400).json({ error: 'campos requerido' });
        await adminDb.collection('empresas').doc(empresaId).update({
          ...campos,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });

    } catch (err) {
      console.error('wasapbot-panel POST:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
