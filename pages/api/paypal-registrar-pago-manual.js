// pages/api/paypal-registrar-pago-manual.js
// Registra un pago de PayPal hecho 100% client-side (sin pasar por nuestra
// API REST de PayPal, que actualmente esta bloqueada por PayPal del lado
// de la cuenta). NO activa el plan automaticamente — solo deja constancia
// del pago y notifica por WhatsApp para activarlo manualmente desde el panel
// mientras se resuelve el acceso completo a la API.

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WA_SERVER     = process.env.NEXT_PUBLIC_WA_SERVER || 'REEMPLAZAR_URL_RAILWAY';
const SERVER_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';
const SOPORTE_ID    = process.env.SOPORTE_EMPRESA_ID    || '';
const SOPORTE_NUM   = process.env.SOPORTE_WHATSAPP      || '34674421919';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderId, empresaId, nombreEmpresa, email, planId, monto } = req.body;
  if (!orderId || !empresaId) return res.status(400).json({ error: 'Faltan datos' });

  try {
    await adminDb.collection('pagos').doc(orderId).set({
      orderId, empresaId, nombreEmpresa: nombreEmpresa || '', email: email || '',
      planId, monto, moneda: 'EUR', metodo: 'paypal_manual',
      estado: 'pendiente_activacion',
      creadoEn: FieldValue.serverTimestamp(),
    });

    const mensaje = `💰 *Pago PayPal recibido — requiere activación manual*\n\n*Empresa:* ${nombreEmpresa || empresaId}\n*Plan:* ${planId}\n*Monto:* ${monto}€\n*Email:* ${email}\n*Order ID:* ${orderId}\n\n⚠️ Activa el plan manualmente desde el panel admin (la activación automática está temporalmente deshabilitada por un problema en la cuenta de PayPal).`;

    if (SOPORTE_ID) {
      await fetch(`${WA_SERVER}/enviar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
        body:    JSON.stringify({ empresaId: SOPORTE_ID, numero: SOPORTE_NUM, texto: mensaje }),
      }).catch(() => {});
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('paypal-registrar-pago-manual error:', err);
    return res.status(500).json({ error: err.message });
  }
}
