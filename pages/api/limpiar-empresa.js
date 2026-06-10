// pages/api/limpiar-empresa.js
// Limpia todos los contactos y conversaciones basura de una empresa
// Solo para uso admin

import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-admin-secret'] || req.body.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, coleccion } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  const cols = coleccion ? [coleccion] : ['contactos', 'conversaciones', 'citas'];
  let total = 0;

  for (const col of cols) {
    try {
      const snap = await adminDb.collection('empresas').doc(empresaId).collection(col).get();
      for (const d of snap.docs) {
        // Borrar subcolecciones de conversaciones (mensajes)
        if (col === 'conversaciones') {
          try {
            const msgs = await adminDb.collection('empresas').doc(empresaId).collection('conversaciones').doc(d.id).collection('mensajes').get();
            for (const m of msgs.docs) {
              await m.ref.delete();
            }
          } catch {}
        }
        await d.ref.delete();
        total++;
      }
    } catch (e) {
      console.error(`Error limpiando ${col}:`, e.message);
    }
  }

  return res.json({ ok: true, eliminados: total, colecciones: cols });
}
