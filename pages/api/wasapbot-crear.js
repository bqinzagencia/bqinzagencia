// pages/api/wasapbot-crear.js
// Crea empresa para WasapBot — SIN trial gratuito, requiere plan activo
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { nombre, industria, descripcion, email, horario, ciudad, producto } = req.body;
  if (!nombre || !industria || !email) return res.status(400).json({ error: 'Faltan datos requeridos' });

  try {
    const empresaRef = adminDb.collection('empresas').doc();
    const empresaId  = empresaRef.id;

    await empresaRef.set({
      nombreEmpresa:  nombre,
      industria,
      email,
      ciudad:         ciudad || '',
      plan:           'wasapbot',
      planActivo:     false,        // Requiere activar plan para usar el bot
      trialHasta:     null,         // Sin trial gratuito para WasapBot
      producto:       producto || 'wasapbot',
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
        servicios:      [],
        horarios:       horario ? { general: horario } : {},
        permitePedidos: false,
        creadoEn:       FieldValue.serverTimestamp(),
      });

    // Agente por defecto
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
