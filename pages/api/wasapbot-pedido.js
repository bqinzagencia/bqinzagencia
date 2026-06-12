// pages/api/wasapbot-pedido.js
// Guarda y gestiona pedidos del WasapBot
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { empresaId, pedido } = req.body;
    if (!empresaId || !pedido) return res.status(400).json({ error: 'Faltan campos' });

    try {
      const ref = await adminDb.collection('empresas').doc(empresaId)
        .collection('pedidos').add({
          ...pedido,
          estado: 'pendiente',
          creadoEn: FieldValue.serverTimestamp(),
        });
      return res.json({ ok: true, pedidoId: ref.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    const { id, fecha } = req.query;
    if (!id) return res.status(400).json({ error: 'id requerido' });
    try {
      let query = adminDb.collection('empresas').doc(id)
        .collection('pedidos').orderBy('creadoEn', 'desc');

      // Filtrar por fecha si viene (formato YYYY-MM-DD)
      if (fecha) {
        const inicio = new Date(fecha + 'T00:00:00-05:00');
        const fin    = new Date(fecha + 'T23:59:59-05:00');
        query = query.where('creadoEn', '>=', inicio).where('creadoEn', '<=', fin);
      } else {
        query = query.limit(50);
      }

      const snap = await query.get();
      const pedidos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({ ok: true, pedidos });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    const { empresaId, pedidoId, estado } = req.body;
    if (!empresaId || !pedidoId || !estado) return res.status(400).json({ error: 'Faltan campos' });
    try {
      await adminDb.collection('empresas').doc(empresaId)
        .collection('pedidos').doc(pedidoId)
        .update({ estado, actualizadoEn: FieldValue.serverTimestamp() });
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
