// pages/api/wasapbot-crear.js
// Crea empresa + agente para el producto WasapBot independiente
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { nombre, industria, descripcion, email } = req.body;
  if (!nombre || !industria || !email) return res.status(400).json({ error: 'Faltan datos requeridos' });

  try {
    // Crear empresa en Firestore
    const empresaRef = adminDb.collection('empresas').doc();
    const empresaId  = empresaRef.id;

    await empresaRef.set({
      nombreEmpresa:  nombre,
      industria,
      email,
      plan:           'wasapbot',
      planActivo:     false,
      trialHasta:     new Date(Date.now() + 14 * 86400000),
      producto:       'wasapbot',
      creadoEn:       FieldValue.serverTimestamp(),
      ciudad:         '',
      whatsapp:       { status: 'disconnected' },
    });

    // Crear base de conocimiento con descripcion
    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        info: {
          descripcionNegocio: descripcion || `${nombre} — ${industria}`,
          email,
        },
        servicios:  [],
        horarios:   {},
        creadoEn:   FieldValue.serverTimestamp(),
      });

    // Crear agente por defecto
    await adminDb.collection('empresas').doc(empresaId)
      .collection('agentes').add({
        nombre:   `Asistente de ${nombre}`,
        activo:   true,
        canal:    'whatsapp',
        creadoEn: FieldValue.serverTimestamp(),
      });

    return res.json({ ok: true, empresaId });
  } catch (err) {
    console.error('wasapbot-crear:', err);
    return res.status(500).json({ error: err.message });
  }
}
