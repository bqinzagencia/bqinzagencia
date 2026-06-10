// pages/api/metrics-admin.js
// Endpoint privado para el panel de métricas de Alexander
// Solo accesible con el SECRET correcto

import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener todas las empresas
    const empresasSnap = await adminDb.collection('empresas').get();
    const empresas = [];
    let conversacionesHoyTotal = 0;
    let conversacionesTotalGeneral = 0;
    let lecturasEstimadas = empresasSnap.size * 10; // estimacion

    for (const doc of empresasSnap.docs) {
      const data = doc.data();

      // Contar conversaciones de hoy
      const convsSnap = await adminDb
        .collection('empresas').doc(doc.id)
        .collection('conversaciones')
        .where('ultimoMensaje', '>=', hoy)
        .get();

      const convsHoyEmpresa = convsSnap.size;
      conversacionesHoyTotal += convsHoyEmpresa;

      // Contar total de conversaciones
      const todasConvsSnap = await adminDb
        .collection('empresas').doc(doc.id)
        .collection('conversaciones')
        .get();

      const totalConvsEmpresa = todasConvsSnap.size;
      conversacionesTotalGeneral += totalConvsEmpresa;
      lecturasEstimadas += todasConvsSnap.size * 3;

      empresas.push({
        id:             doc.id,
        nombre:         data.nombreEmpresa || 'Sin nombre',
        industria:      data.industria || 'otro',
        plan:           data.plan || 'emprendedor',
        conversaciones: totalConvsEmpresa,
        convsHoy:       convsHoyEmpresa,
        whatsappActivo: data.whatsapp?.status === 'connected',
        trialHasta:     data.trialHasta?.toDate ? data.trialHasta.toDate().toISOString() : null,
        creadoEn:       data.creadoEn?.toDate ? data.creadoEn.toDate().toISOString() : null,
      });
    }

    // Ordenar por conversaciones
    empresas.sort((a, b) => b.conversaciones - a.conversaciones);

    return res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      conversacionesHoy:   conversacionesHoyTotal,
      conversacionesTotal: conversacionesTotalGeneral,
      lecturasHoy:         lecturasEstimadas,
      totalEmpresas:       empresasSnap.size,
      empresas,
    });

  } catch (err) {
    console.error('metrics-admin error:', err);
    return res.status(500).json({ error: err.message });
  }
}
