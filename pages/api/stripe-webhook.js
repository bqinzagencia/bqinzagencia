// pages/api/stripe-webhook.js
// Recibe eventos de Stripe y activa el plan automáticamente
// URL a registrar en Stripe Dashboard: https://tudominio.com/api/stripe-webhook

import { buffer } from 'micro';
import Stripe from 'stripe';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const WA_SERVER      = process.env.WHATSAPP_SERVER_URL   || 'REEMPLAZAR_URL_RAILWAY';
const SERVER_SECRET  = process.env.SERVER_SECRET          || 'REEMPLAZAR_SECRET';
const SOPORTE_ID     = process.env.SOPORTE_EMPRESA_ID    || '';
const SOPORTE_NUM    = process.env.SOPORTE_WHATSAPP      || 'REEMPLAZAR_NUMERO';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook firma inválida:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Solo procesar pagos completados
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { referencia, empresaId, planId } = session.metadata || {};

    if (!empresaId || !planId) {
      console.error('Stripe webhook: faltan metadatos', session.metadata);
      return res.json({ ok: true, ignorado: true });
    }

    try {
      // Activar plan en Firestore
      const ahora    = new Date();
      const planHasta = new Date(ahora.getTime() + 30 * 86400000);

      await adminDb.collection('empresas').doc(empresaId).update({
        plan:          planId,
        planWasapbot:  planId,
        planActivo:    true,
        producto:      'wasapbot',
        planHasta:     planHasta,
        ultimoPago:    FieldValue.serverTimestamp(),
        ultimoPagoRef: referencia || session.id,
        stripeSessionId: session.id,
      });

      // Actualizar estado del pago
      if (referencia) {
        await adminDb.collection('pagos').doc(referencia).update({
          estado:        'APPROVED',
          stripeSession: session.id,
          actualizadoEn: FieldValue.serverTimestamp(),
        }).catch(() => {});
      }

      // Notificar por WhatsApp
      try {
        const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
        const empresa     = empresaSnap.data();
        const monto       = ((session.amount_total || 0) / 100).toFixed(2);

        const mensaje = `💰 *Nuevo pago recibido — bqinzagencia*\n\n*Empresa:* ${empresa?.nombreEmpresa || empresaId}\n*Plan:* ${planId}\n*Monto:* ${monto}€\n*Método:* Tarjeta (Stripe)\n*Referencia:* ${referencia || session.id}\n\n✅ Plan activado automáticamente`;

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

      console.log(`Plan ${planId} activado para ${empresaId}`);
    } catch (err) {
      console.error('Error activando plan:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.json({ ok: true });
}
