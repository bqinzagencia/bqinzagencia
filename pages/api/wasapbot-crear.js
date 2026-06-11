// pages/api/wasapbot-crear.js
// Crea empresa + agente para el producto WasapBot independiente
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { nombre, industria, descripcion, email, horario, ciudad } = req.body;
  if (!nombre || !industria || !email) return res.status(400).json({ error: 'Faltan datos requeridos' });

  try {
    const empresaRef = adminDb.collection('empresas').doc();
    const empresaId  = empresaRef.id;
    const ahora      = new Date();

    // Trial de 1 hora desde el momento de registro
    const trialHasta = new Date(ahora.getTime() + 1 * 60 * 60 * 1000);

    await empresaRef.set({
      nombreEmpresa:  nombre,
      industria,
      email,
      ciudad:         ciudad || '',
      plan:           'wasapbot',
      planActivo:     false,
      trialHasta,                         // 1 hora exacta desde registro
      producto:       'wasapbot',
      creadoEn:       FieldValue.serverTimestamp(),
      whatsapp:       { status: 'disconnected' },
      tokensUsados:   0,
      conversaciones: 0,
    });

    // Base de conocimiento inicial
    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        info: {
          descripcionNegocio: descripcion || `${nombre} — ${industria}`,
          email,
        },
        servicios:  [],
        horarios:   horario ? { general: horario } : {},
        creadoEn:   FieldValue.serverTimestamp(),
      });

    // Agente por defecto
    await adminDb.collection('empresas').doc(empresaId)
      .collection('agentes').add({
        nombre:   `Asistente de ${nombre}`,
        activo:   true,
        canal:    'whatsapp',
        creadoEn: FieldValue.serverTimestamp(),
      });

    return res.json({ ok: true, empresaId, trialHasta: trialHasta.toISOString() });
  } catch (err) {
    console.error('wasapbot-crear:', err);
    return res.status(500).json({ error: err.message });
  }
}
