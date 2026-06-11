// pages/api/wa-desconectar.js
// Desconecta la sesion WhatsApp de una empresa

const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';
const SECRET    = process.env.WHATSAPP_SERVER_SECRET || 'bqinzagencia2026.';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    const r = await fetch(`${WA_SERVER}/sesion/${empresaId}/desconectar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-server-secret': SECRET },
    });
    const d = await r.json();
    return res.json(d);
  } catch (err) {
    console.error('[wa-desconectar]', err.message);
    return res.status(500).json({ error: 'Error al desconectar' });
  }
}
