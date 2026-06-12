// pages/api/wa-activar.js
import axios from 'axios';
import { db as adminDb } from '../../lib/firebaseAdmin';

const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET    = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    // 1. Iniciar sesion en Railway
    await axios.post(`${WA_SERVER}/sesion/iniciar`,
      { empresaId },
      { headers: { 'x-server-secret': SECRET }, timeout: 10000 }
    );

    // 2. Esperar y obtener QR o estado
    await new Promise(r => setTimeout(r, 3000));
    const qrResp = await axios.get(`${WA_SERVER}/sesion/${empresaId}/qr`,
      { headers: { 'x-server-secret': SECRET }, timeout: 20000 }
    );

    if (qrResp.data.status === 'connected') {
      const numero = qrResp.data.numero;
      // Guardar numero del dueno en Firestore para notificaciones de citas
      if (numero) {
        await adminDb.collection('empresas').doc(empresaId).update({
          whatsappOwner: numero,
          'whatsapp.status': 'connected',
          'whatsapp.numero': numero,
        }).catch(() => {});
      }
      return res.json({ ok: true, status: 'connected', numero });
    }

    if (qrResp.data.qrBase64) {
      return res.json({ ok: true, status: 'qr_ready', qrBase64: qrResp.data.qrBase64 });
    }

    return res.json({ ok: true, status: 'starting' });
  } catch (err) {
    console.error('wa-activar error:', err.message);
    return res.status(500).json({ error: 'Error al conectar con el servidor WhatsApp. Intenta de nuevo.' });
  }
}
