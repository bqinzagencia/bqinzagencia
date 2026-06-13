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
      if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
      const empData = empSnap.data();
      // Tolerar empresas antiguas sin campo "producto" (fueron creadas antes de implementar el campo)
      const productoValido = empData.producto === 'wasapbot' || !empData.producto || empData.producto === '';
      if (!productoValido)
        return res.status(403).json({ error: 'Acceso no permitido' });

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
      // Verificar que la empresa existe y es wasapbot
      const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
      if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
      if (empSnap.data().producto !== 'wasapbot')
        return res.status(403).json({ error: 'Acceso no permitido' });

      // Actualizar estado de una cita
      if (accion === 'actualizarCita') {
        if (!citaId || !estado)
          return res.status(400).json({ error: 'citaId y estado requeridos' });

        const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estadosValidos.includes(estado))
          return res.status(400).json({ error: 'Estado no válido' });

        await adminDb.collection('empresas').doc(empresaId)
          .collection('citas').doc(citaId)
          .update({ estado, actualizadoEn: FieldValue.serverTimestamp() });

        return res.json({ ok: true, citaId, estado });
      }

      return res.status(400).json({ error: 'Acción no reconocida' });

    } catch (err) {
      console.error('wasapbot-panel POST:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
