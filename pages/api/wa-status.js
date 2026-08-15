// pages/api/wa-status.js
// NOTA: El servidor de Railway (Baileys/QR) fue retirado el 15/08/2026.
// Este endpoint queda desactivado temporalmente hasta el flujo de
// "Embedded Signup" con Meta Cloud API.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  return res.json({
    status: 'no_disponible',
    mensaje: 'La conexión automática de WhatsApp está temporalmente en mantenimiento.',
  });
}
