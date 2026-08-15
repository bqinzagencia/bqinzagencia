// pages/api/wasapbot-crear-demo.js
// Crea una empresa de demo en Firestore sin necesidad de correo ni verificación.
// Solo para uso interno del admin de BQinzagencIA.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { nombreNegocio, industria, nombreProspecto, instagram } = req.body;
  if (!nombreNegocio) return res.status(400).json({ error: 'nombreNegocio requerido' });

  try {
    const docRef = await adminDb.collection('empresas').add({
      nombreEmpresa:     nombreNegocio,
      industria:         industria || 'otro',
      producto:          'wasapbot',
      plan:              'wasapbot',
      planWasapbot:      'wasapbot',
      planActivo:        false,
      esDemo:            true,
      nombreProspecto:   nombreProspecto || '',
      instagram:         instagram || '',
      email:             '',
      ciudad:            '',
      creadoEn:          FieldValue.serverTimestamp(),
      creadoPor:         'admin-demo',
    });

    const link = `https://bqinzagencia.com/wasapbot/demo/${docRef.id}`;
    return res.json({ ok: true, empresaId: docRef.id, link });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
