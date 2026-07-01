// pages/api/admin-activar-whatsapp-empresa.js
// Fix puntual: activa whatsapp.activo=true en una empresa ya creada,
// sin tener que recrearla ni volver a generar el QR.

import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

  try {
    await adminDb.collection('empresas').doc(empresaId).update({
      'whatsapp.activo': true,
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
