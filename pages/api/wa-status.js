// pages/api/wa-status.js
// Consulta el estado actual de la sesion WhatsApp de una empresa
import axios from 'axios';

const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET    = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { empresaId } = req.query;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    const resp = await axios.get(`${WA_SERVER}/sesion/${empresaId}/status`,
      { headers: { 'x-server-secret': SECRET }, timeout: 8000 }
    );
    const data = resp.data;

    // Si hay QR nuevo en Firestore, tambien lo retornamos
    if (data.status === 'qr_ready') {
      // Intentar obtener QR actualizado
      try {
        const qrResp = await axios.get(`${WA_SERVER}/sesion/${empresaId}/qr`,
          { headers: { 'x-server-secret': SECRET }, timeout: 5000 }
        );
        if (qrResp.data.qrBase64) data.qrBase64 = qrResp.data.qrBase64;
      } catch {}
    }

    return res.json(data);
  } catch (err) {
    return res.json({ status: 'unknown', error: err.message });
  }
}
