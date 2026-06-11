// pages/api/wa-status.js
// Polling: consulta estado y QR actual de la sesion WhatsApp

const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';
const SECRET    = process.env.WHATSAPP_SERVER_SECRET || 'bqinzagencia2026.';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { empresaId } = req.query;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    const r = await fetch(
      `${WA_SERVER}/sesion/${empresaId}/qr`,
      {
        headers: { 'x-server-secret': SECRET },
        signal: AbortSignal.timeout(8000), // 8s max
      }
    );
    const d = await r.json();
    return res.json(d);
  } catch (err) {
    console.error('[wa-status]', err.message);
    return res.status(500).json({ error: 'Servidor WhatsApp no disponible' });
  }
}
