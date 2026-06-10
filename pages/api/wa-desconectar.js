// pages/api/wa-desconectar.js
// Desconecta la sesion WhatsApp de una empresa
import axios from 'axios';

const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET    = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    await axios.post(`${WA_SERVER}/sesion/${empresaId}/desconectar`,
      {},
      { headers: { 'x-server-secret': SECRET }, timeout: 10000 }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
