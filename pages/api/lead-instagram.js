// pages/api/lead-instagram.js
// Endpoint que recibe leads de ManyChat/Instagram y los guarda en Firestore
// URL: POST /api/lead-instagram
// Protegido con header x-api-key o query param api_key

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const API_KEY = process.env.LEADS_API_KEY || 'bqinz_leads_2026';

export default async function handler(req, res) {
  // CORS para ManyChat
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validar API key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (apiKey !== API_KEY) return res.status(401).json({ error: 'No autorizado' });

  const {
    nombre        = '',
    instagram     = '',
    mensaje       = '',
    telefono      = '',
    email         = '',
    fuente        = 'instagram',   // instagram | whatsapp | tiktok | web
    reel          = '',            // ID o título del reel que generó el lead
    ciudad        = '',
    negocio       = '',            // tipo de negocio que mencionó
    interes       = 'demo',        // demo | info | precio
  } = req.body;

  if (!nombre && !instagram && !telefono) {
    return res.status(400).json({ error: 'Se necesita al menos nombre, instagram o teléfono' });
  }

  try {
    const leadRef = adminDb.collection('leads').doc();
    await leadRef.set({
      nombre:    nombre.trim(),
      instagram: instagram.trim(),
      telefono:  telefono.trim(),
      email:     email.trim(),
      mensaje:   mensaje.trim(),
      fuente,
      reel:      reel.trim(),
      ciudad:    ciudad.trim(),
      negocio:   negocio.trim(),
      interes,
      estado:    'nuevo',          // nuevo | contactado | demo | convertido | perdido
      notas:     '',
      creadoEn:  FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    });

    // Log del sistema
    await adminDb.collection('systemLogs').add({
      tipo:     'lead_nuevo',
      mensaje:  `Nuevo lead de ${fuente}: ${nombre || instagram || telefono}`,
      leadId:   leadRef.id,
      creadoEn: FieldValue.serverTimestamp(),
    });

    return res.json({
      ok: true,
      leadId: leadRef.id,
      mensaje: `Lead guardado correctamente`,
    });
  } catch (err) {
    console.error('lead-instagram error:', err);
    return res.status(500).json({ error: err.message });
  }
}
