// pages/api/wasapbot-solicitar-conexion.js
// Sustituye a la conexión automática por QR/pairing (Baileys, retirado).
// Guarda la solicitud del cliente para que el equipo la active manualmente
// en Meta Business Suite (como se hace ahora con cada número nuevo).
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { empresaId, nombre, email, telefono } = req.body || {};

    if (!empresaId || !telefono || String(telefono).trim().length < 8) {
      return res.status(400).json({ ok: false, error: 'Faltan datos o el teléfono no es válido' });
    }

    const telefonoLimpio = String(telefono).replace(/\D/g, '');
    const ahora = new Date();

    // 1. Marcar la empresa con el estado de conexión pendiente
    await adminDb.collection('empresas').doc(empresaId).set({
      whatsapp: {
        estadoConexion: 'pendiente_manual',
        telefonoSolicitado: telefonoLimpio,
        solicitadoEn: ahora,
      },
    }, { merge: true });

    // 2. Guardar también en una lista aparte para verla fácil desde el admin
    await adminDb.collection('wasapbot_solicitudes_conexion').add({
      empresaId,
      nombre: nombre || '',
      email: email || '',
      telefono: telefonoLimpio,
      atendida: false,
      creadoEn: ahora,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('wasapbot-solicitar-conexion:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}