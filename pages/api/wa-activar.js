// pages/api/wa-activar.js
// NOTA: El servidor de Railway (Baileys/QR) fue retirado el 15/08/2026.
// La conexión de WhatsApp de clientes ahora se hace vía Meta Cloud API,
// no por QR. Este endpoint queda desactivado temporalmente hasta que
// esté listo el flujo de "Embedded Signup" (conexión oficial de Meta).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  return res.status(503).json({
    ok: false,
    status: 'no_disponible',
    mensaje: 'La conexión automática de WhatsApp está temporalmente en mantenimiento mientras migramos a la nueva plataforma oficial de Meta. Contáctanos y lo activamos manualmente mientras tanto.',
  });
}
