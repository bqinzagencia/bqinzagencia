// pages/api/admin-borrar-empresa.js
// Borra completamente una empresa y sus subcolecciones
import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

async function borrarSubcolecciones(empresaId) {
  const cols = ['agentes', 'contactos', 'conversaciones', 'citas', 'config', 'soportes'];
  for (const col of cols) {
    try {
      const snap = await adminDb.collection('empresas').doc(empresaId).collection(col).get();
      for (const d of snap.docs) {
        // borrar subsubcolecciones de conversaciones
        if (col === 'conversaciones') {
          const msgs = await d.ref.collection('mensajes').get();
          for (const m of msgs.docs) await m.ref.delete();
        }
        await d.ref.delete();
      }
    } catch {}
  }
  await adminDb.collection('empresas').doc(empresaId).delete().catch(() => {});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, todos, conservar } = req.body;

  try {
    // Borrar UNA empresa
    if (empresaId) {
      await borrarSubcolecciones(empresaId);
      return res.json({ ok: true, borrado: empresaId });
    }

    // Borrar TODAS excepto las de conservar[]
    if (todos) {
      const snap = await adminDb.collection('empresas').get();
      const conservarIds = conservar || [];
      const borrados = [];
      for (const doc of snap.docs) {
        if (!conservarIds.includes(doc.id)) {
          await borrarSubcolecciones(doc.id);
          borrados.push(doc.id);
        }
      }
      return res.json({ ok: true, borrados, conservadas: conservarIds });
    }

    return res.status(400).json({ error: 'Envía empresaId o todos:true' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
