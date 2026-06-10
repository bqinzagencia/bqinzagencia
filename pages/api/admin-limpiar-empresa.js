// pages/api/admin-limpiar-empresa.js
// Endpoint privado para limpiar datos huerfanos de empresas
// Solo accesible con ADMIN_METRICS_SECRET

import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'uid requerido' });

  try {
    // 1. Obtener perfil del usuario
    const userSnap = await adminDb.collection('usuarios').doc(uid).get();
    if (!userSnap.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    const userData = userSnap.data();
    const empresasIds = userData.empresas || [];

    // 2. Por cada empresaId: verificar si existe y borrar si esta huerfana
    const resultados = [];
    for (const empresaId of empresasIds) {
      const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
      if (!empSnap.exists) {
        // Ya no existe, solo limpiar referencia
        resultados.push({ id: empresaId, accion: 'referencia_limpiada' });
        continue;
      }
      const emp = empSnap.data();
      // Si ownerUid es null o diferente, es huerfana
      const esHuerfana = !emp.ownerUid || emp.ownerUid !== uid;
      resultados.push({
        id:       empresaId,
        nombre:   emp.nombreEmpresa,
        owner:    emp.ownerUid,
        huerfana: esHuerfana,
      });
    }

    return res.json({ ok: true, uid, empresas: resultados, totalIds: empresasIds.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
