// pages/api/admin-soporte-ia.js
// Lista las conversaciones del chat "Soporte IA" (componente AsesorWasapbot,
// el botón flotante) guardadas en soporte_ia_conversaciones, más un resumen
// de uso diario a partir del contador soporte_ia_uso que ya existía.
// DELETE permite borrar conversaciones puntuales (ids) o limpieza masiva
// por antigüedad (olderThanDays).
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {

  if (req.method === 'GET') {
    try {
      const convSnap = await adminDb.collection('soporte_ia_conversaciones')
        .orderBy('actualizadoEn', 'desc')
        .limit(300)
        .get();
      const conversaciones = convSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Uso diario: sumamos el contador soporte_ia_uso (uno por empresa/visitante y día)
      const usoSnap = await adminDb.collection('soporte_ia_uso').get();
      const porDia = {};
      usoSnap.docs.forEach(d => {
        const data  = d.data();
        const fecha = data.fecha || 'sin-fecha';
        porDia[fecha] = (porDia[fecha] || 0) + (data.count || 0);
      });
      const usoPorDia = Object.entries(porDia)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 30)
        .map(([fecha, count]) => ({ fecha, count }));

      return res.json({ ok: true, conversaciones, usoPorDia });
    } catch (err) {
      console.error('admin-soporte-ia GET:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { ids, olderThanDays } = req.body || {};

      // ── Borrado puntual: uno o varios ids ──
      if (Array.isArray(ids) && ids.length > 0) {
        const batch = adminDb.batch();
        ids.forEach(id => batch.delete(adminDb.collection('soporte_ia_conversaciones').doc(id)));
        await batch.commit();
        return res.json({ ok: true, eliminadas: ids.length });
      }

      // ── Limpieza masiva por antigüedad ──
      if (olderThanDays) {
        const cutoff = new Date(Date.now() - Number(olderThanDays) * 24 * 60 * 60 * 1000);
        const snap = await adminDb.collection('soporte_ia_conversaciones')
          .where('actualizadoEn', '<', cutoff)
          .get();
        if (snap.empty) return res.json({ ok: true, eliminadas: 0 });

        // Firestore permite max 500 escrituras por batch
        const chunks = [];
        for (let i = 0; i < snap.docs.length; i += 450) chunks.push(snap.docs.slice(i, i + 450));
        for (const chunk of chunks) {
          const batch = adminDb.batch();
          chunk.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
        return res.json({ ok: true, eliminadas: snap.size });
      }

      return res.status(400).json({ error: 'Envía ids:[...] u olderThanDays:N' });
    } catch (err) {
      console.error('admin-soporte-ia DELETE:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
