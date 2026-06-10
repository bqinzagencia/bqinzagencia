// pages/api/soporte-mensaje.js
// Recibe mensaje de soporte desde el dashboard y lo envia al WhatsApp de Alexander

const WA_SERVER    = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SERVER_SECRET = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';
const SOPORTE_EMPRESA_ID = process.env.SOPORTE_EMPRESA_ID || '';
const SOPORTE_NUMERO     = process.env.SOPORTE_WHATSAPP   || '573105056616';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId, nombreEmpresa, email, mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });

  try {
    const texto = `🆘 *Solicitud de soporte — agencIAme*\n\n*Empresa:* ${nombreEmpresa || empresaId}\n*Email:* ${email || 'sin email'}\n*Mensaje:*\n${mensaje}`;

    // Guardar en Firestore
    const { db: adminDb } = await import('../../lib/firebaseAdmin');
    const { FieldValue }  = await import('firebase-admin/firestore');

    await adminDb.collection('soportes').add({
      empresaId,
      nombreEmpresa,
      email,
      mensaje,
      estado:   'pendiente',
      creadoEn: FieldValue.serverTimestamp(),
    });

    // Enviar por WhatsApp si hay empresa de soporte configurada
    if (SOPORTE_EMPRESA_ID) {
      await fetch(`${WA_SERVER}/enviar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
        body:    JSON.stringify({ empresaId: SOPORTE_EMPRESA_ID, numero: SOPORTE_NUMERO, texto }),
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('soporte-mensaje error:', err);
    return res.status(500).json({ error: err.message });
  }
}
