// pages/api/admin-reset-empresa.js
// Limpia subcolecciones de una empresa especifica
// Solo para uso del administrador con SECRET correcto

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

async function borrarSubcoleccion(empresaId, coleccion) {
  let borrados = 0;
  const snap = await adminDb
    .collection('empresas').doc(empresaId)
    .collection(coleccion).limit(100).get();

  for (const d of snap.docs) {
    // Si es conversaciones, borrar mensajes anidados
    if (coleccion === 'conversaciones') {
      const msgs = await adminDb
        .collection('empresas').doc(empresaId)
        .collection('conversaciones').doc(d.id)
        .collection('mensajes').limit(200).get();
      for (const m of msgs.docs) await m.ref.delete();
    }
    await d.ref.delete();
    borrados++;
  }
  return borrados;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, uid, colecciones } = req.body;
  if (!empresaId && !uid) return res.status(400).json({ error: 'empresaId o uid requerido' });

  // Si viene uid, limpiar la empresa legacy (uid como empresaId)
  const targetId = empresaId || uid;
  const cols = colecciones || ['conversaciones', 'contactos', 'citas'];
  const resultados = {};

  try {
    for (const col of cols) {
      resultados[col] = await borrarSubcoleccion(targetId, col);
    }
    return res.json({ ok: true, targetId, borrados: resultados });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
