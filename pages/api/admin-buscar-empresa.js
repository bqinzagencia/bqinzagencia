// pages/api/admin-buscar-empresa.js
// Endpoint puntual de diagnóstico y fix manual:
//  - GET  ?id=...&q=...   -> busca por ID exacto y/o texto en nombre/email
//  - POST { empresaId, set: {...} } -> aplica un merge de campos puntual
//    (ej: { producto: 'wasapbot' } para reparar empresas-afiliado que
//    quedaron sin el campo que exige whatsapp-baileys.js para activarse)
import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default async function handler(req, res) {
  const secret = req.headers['x-admin-secret'] || req.query.secret || req.body?.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  try {
    if (req.method === 'GET') {
      const { id, q } = req.query;
      const resultado = { porId: null, porTexto: [] };

      if (id) {
        const snap = await adminDb.collection('empresas').doc(id).get();
        if (snap.exists) {
          const data = snap.data();
          const agentesSnap = await adminDb.collection('empresas').doc(id).collection('agentes').get();
          resultado.porId = {
            id: snap.id,
            nombreEmpresa: data.nombreEmpresa,
            email: data.email,
            industria: data.industria,
            plan: data.plan,
            producto: data.producto || null,
            planWasapbot: data.planWasapbot || null,
            planActivo: data.planActivo,
            whatsappActivo: data.whatsapp?.activo ?? null,
            esAfiliado: data.esAfiliado || false,
            ciudad: data.ciudad,
            telefono: data.telefono,
            ownerUid: data.ownerUid,
            creadoEn: data.creadoEn,
            agentes: agentesSnap.docs.map(a => ({ id: a.id, nombre: a.data().nombre, activo: a.data().activo, canales: a.data().canales })),
          };
        }
      }

      if (q) {
        const qLower = q.toLowerCase();
        const snap = await adminDb.collection('empresas').get();
        resultado.porTexto = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(e =>
            (e.nombreEmpresa || '').toLowerCase().includes(qLower) ||
            (e.email || '').toLowerCase().includes(qLower)
          )
          .map(e => ({
            id: e.id,
            nombreEmpresa: e.nombreEmpresa,
            email: e.email,
            industria: e.industria,
            plan: e.plan,
            producto: e.producto || null,
            planActivo: e.planActivo,
            ciudad: e.ciudad,
            ownerUid: e.ownerUid,
            creadoEn: e.creadoEn,
          }));
      }

      return res.json({ ok: true, ...resultado });
    }

    if (req.method === 'POST') {
      const { empresaId, set } = req.body;
      if (!empresaId || !set || typeof set !== 'object') {
        return res.status(400).json({ error: 'Envía empresaId y set:{...campos a actualizar}' });
      }
      await adminDb.collection('empresas').doc(empresaId).set(set, { merge: true });
      const snap = await adminDb.collection('empresas').doc(empresaId).get();
      return res.json({ ok: true, empresaId, actualizado: snap.data() });
    }

    return res.status(405).end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
