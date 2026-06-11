// pages/api/soporte-mensaje.js
// Recibe mensajes del boton Soporte y Asesor
// Los guarda en Firestore y los envia por WhatsApp al 3105056616

const WA_SERVER         = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SERVER_SECRET     = process.env.SERVER_SECRET       || 'agenciame2026secreto_nexoia';
const SOPORTE_EMPRESA_ID = process.env.SOPORTE_EMPRESA_ID || 'WN5UQBDMp1MSiuBdAfeJ';
const SOPORTE_NUMERO    = process.env.SOPORTE_WHATSAPP    || '573105056616';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId, nombreEmpresa, email, mensaje, tipo = 'soporte' } = req.body;
  if (!mensaje?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });

  try {
    const { db: adminDb } = await import('../../lib/firebaseAdmin');
    const { FieldValue }  = await import('firebase-admin/firestore');

    // 1. Guardar en Firestore
    await adminDb.collection('soportes').add({
      empresaId:     empresaId || null,
      nombreEmpresa: nombreEmpresa || 'Desconocido',
      email:         email || null,
      mensaje,
      tipo,
      estado:        'pendiente',
      creadoEn:      FieldValue.serverTimestamp(),
    });

    // 2. Armar mensaje WhatsApp
    const emoji   = tipo === 'asesor' ? '🤝' : '🆘';
    const titulo  = tipo === 'asesor' ? 'Solicitud de asesor' : 'Solicitud de soporte';
    const textoWA = `${emoji} *${titulo} — agencIAme*\n\n*Empresa:* ${nombreEmpresa || 'Desconocida'}\n*Email:* ${email || 'sin email'}\n*Mensaje:*\n${mensaje}`;

    // 3. Enviar por WhatsApp
    const waResp = await fetch(`${WA_SERVER}/enviar`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
      body:    JSON.stringify({
        empresaId: SOPORTE_EMPRESA_ID,
        numero:    SOPORTE_NUMERO,
        texto:     textoWA,
      }),
    });

    const waData = await waResp.json().catch(() => ({}));
    console.log('WA envio:', waData);

    return res.json({ ok: true });
  } catch (err) {
    console.error('soporte-mensaje error:', err);
    return res.status(500).json({ error: err.message });
  }
}
