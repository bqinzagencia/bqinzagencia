// pages/api/paypal-capturar-orden.js
// Captura el pago aprobado por el usuario y activa el plan en Firestore.
// Se llama desde el frontend justo después de que PayPal confirma la aprobación (onApprove).

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const PAYPAL_CLIENT_ID     = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API           = 'https://api-m.paypal.com';

const WA_SERVER      = process.env.NEXT_PUBLIC_WA_SERVER || 'REEMPLAZAR_URL_RAILWAY';
const SERVER_SECRET  = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';
const SOPORTE_ID     = process.env.SOPORTE_EMPRESA_ID    || '';
const SOPORTE_NUM    = process.env.SOPORTE_WHATSAPP      || 'REEMPLAZAR_NUMERO';

async function obtenerAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || 'No se pudo autenticar con PayPal');
  return d.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Falta orderId' });

  try {
    const accessToken = await obtenerAccessToken();

    // Capturar el pago en PayPal
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const captureData = await captureRes.json();

    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      console.error('paypal-capturar-orden error:', captureData);
      return res.status(400).json({ error: 'El pago no se pudo completar' });
    }

    const purchaseUnit = captureData.purchase_units?.[0];
    const customData   = JSON.parse(purchaseUnit?.payments?.captures?.[0]?.custom_id || purchaseUnit?.custom_id || '{}');
    const { empresaId, planId, referencia } = customData;

    if (!empresaId || !planId) {
      console.error('paypal-capturar-orden: faltan metadatos', customData);
      return res.status(400).json({ error: 'Faltan datos de la orden' });
    }

    // Activar plan en Firestore
    const ahora     = new Date();
    const planHasta  = new Date(ahora.getTime() + 30 * 86400000);
    const montoCapturado = purchaseUnit?.payments?.captures?.[0]?.amount?.value || '0';

    await adminDb.collection('empresas').doc(empresaId).update({
      plan:           planId,
      planWasapbot:   planId,
      planActivo:     true,
      producto:       'wasapbot',
      planHasta:      planHasta,
      ultimoPago:     FieldValue.serverTimestamp(),
      ultimoPagoRef:  referencia || orderId,
      paypalOrderId:  orderId,
    });

    if (referencia) {
      await adminDb.collection('pagos').doc(referencia).update({
        estado:        'APPROVED',
        paypalOrderId: orderId,
        actualizadoEn: FieldValue.serverTimestamp(),
      }).catch(() => {});
    }

    // Notificar por WhatsApp (igual que Stripe)
    try {
      const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
      const empresa     = empresaSnap.data();

      const mensaje = `💰 *Nuevo pago recibido — bqinzagencia*\n\n*Empresa:* ${empresa?.nombreEmpresa || empresaId}\n*Plan:* ${planId}\n*Monto:* ${montoCapturado}€\n*Método:* PayPal\n*Referencia:* ${referencia || orderId}\n\n✅ Plan activado automáticamente`;

      if (SOPORTE_ID) {
        await fetch(`${WA_SERVER}/enviar`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
          body:    JSON.stringify({ empresaId: SOPORTE_ID, numero: SOPORTE_NUM, texto: mensaje }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error notificación WA:', e.message);
    }

    console.log(`Plan ${planId} activado para ${empresaId} vía PayPal`);
    return res.json({ ok: true, empresaId, planId, referencia });
  } catch (err) {
    console.error('paypal-capturar-orden error:', err);
    return res.status(500).json({ error: err.message });
  }
}
