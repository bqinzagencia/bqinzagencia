// pages/api/wa-activar.js
const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'https://bqinzagencia-whatsapp-server-production.up.railway.app';
const SECRET    = process.env.WHATSAPP_SERVER_SECRET || 'bqinzagencia2026.';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  // Log para debug
  console.log('[wa-activar] empresaId:', empresaId);
  console.log('[wa-activar] WA_SERVER:', WA_SERVER);
  console.log('[wa-activar] SECRET length:', SECRET?.length);

  try {
    const url = `${WA_SERVER}/sesion/iniciar`;
    console.log('[wa-activar] llamando:', url);

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-server-secret': SECRET,
      },
      body: JSON.stringify({ empresaId }),
      signal: AbortSignal.timeout(8000),
    });

    const rText = await r.text();
    console.log('[wa-activar] Railway status:', r.status);
    console.log('[wa-activar] Railway body:', rText.substring(0, 200));

    if (!r.ok) {
      return res.status(500).json({
        error: `Error ${r.status}`,
        detalle: rText.substring(0, 300),
        url,
        secretLen: SECRET?.length,
      });
    }

    const rData = JSON.parse(rText);

    // Polling rapido: 5 intentos de 1s para obtener QR
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      try {
        const qr = await fetch(`${WA_SERVER}/sesion/${empresaId}/qr`, {
          headers: { 'x-server-secret': SECRET },
          signal: AbortSignal.timeout(4000),
        });
        const d = await qr.json();
        if (d.status === 'connected') return res.json({ ok: true, status: 'connected', numero: d.numero });
        if (d.qrBase64) return res.json({ ok: true, status: 'qr_ready', qrBase64: d.qrBase64 });
      } catch (e) {
        console.log('[wa-activar] poll error:', e.message);
      }
    }

    return res.json({ ok: true, status: 'starting' });

  } catch (err) {
    console.error('[wa-activar] catch:', err.message);
    return res.status(500).json({ error: err.message, url: `${WA_SERVER}/sesion/iniciar` });
  }
}
