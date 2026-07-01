// pages/api/paypal-crear-orden.js
// Crea una orden de pago con PayPal (pago único mensual, igual estructura que Stripe)

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const PAYPAL_CLIENT_ID     = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API = 'https://api-m.paypal.com'; // Live. Sandbox sería api-m.sandbox.paypal.com

const PRECIOS_EUR = {
  basico:    { monto: '79.00',  nombre: 'Plan Básico WasapBot'   },
  estandar:  { monto: '149.00', nombre: 'Plan Estándar WasapBot' },
  pro:       { monto: '249.00', nombre: 'Plan Pro WasapBot'      },
  prueba_5k: { monto: '1.00',   nombre: 'Prueba Técnica'         },
};

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

  const { planId, empresaId, nombreEmpresa, email } = req.body;
  if (!planId || !empresaId || !email) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const planInfo = PRECIOS_EUR[planId];
  if (!planInfo) return res.status(400).json({ error: 'Plan no válido' });

  try {
    const referencia = `BQINZ-${empresaId.slice(0, 8)}-${planId.toUpperCase()}-${Date.now()}`;

    // Guardar referencia en Firestore antes de crear la orden
    await adminDb.collection('pagos').doc(referencia).set({
      referencia,
      empresaId,
      planId,
      monto: Math.round(parseFloat(planInfo.monto) * 100),
      moneda: 'EUR',
      metodo: 'paypal',
      estado: 'pendiente',
      creadoEn: FieldValue.serverTimestamp(),
    });

    const accessToken = await obtenerAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: referencia,
          description: `${planInfo.nombre} — WasapBot ${planId}`,
          custom_id: JSON.stringify({ empresaId, planId, referencia }),
          amount: {
            currency_code: 'EUR',
            value: planInfo.monto,
          },
        }],
        application_context: {
          brand_name: 'BQinzagencIA',
          locale: 'es-ES',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/pago-exitoso?empresa=${empresaId}&plan=${planId}&ref=${referencia}&metodo=paypal`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/planes?id=${empresaId}`,
        },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error('paypal-crear-orden error:', orderData);
      throw new Error(orderData.message || 'No se pudo crear la orden de PayPal');
    }

    return res.json({ ok: true, orderId: orderData.id, referencia });
  } catch (err) {
    console.error('paypal-crear-orden error:', err);
    return res.status(500).json({ error: err.message });
  }
}
