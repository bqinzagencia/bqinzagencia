// pages/api/stripe-crear-pago.js
// Crea una sesión de pago con Stripe (pasarela estándar en España)
// Docs: https://stripe.com/docs/api/checkout/sessions

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { planId, empresaId, nombreEmpresa, email, monto } = req.body;
  if (!planId || !empresaId || !monto) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const referencia = `BQZ-${empresaId.slice(0, 8)}-${planId.toUpperCase()}-${Date.now()}`;

    // Guardar referencia en Firestore
    await adminDb.collection('pagos').doc(referencia).set({
      referencia,
      empresaId,
      planId,
      monto,
      moneda: 'EUR',
      estado: 'pendiente',
      creadoEn: FieldValue.serverTimestamp(),
    });

    if (!STRIPE_SECRET) {
      // Sin Stripe configurado → redirigir a WhatsApp
      return res.json({ ok: true, tipo: 'whatsapp', referencia });
    }

    // Crear sesión de Stripe Checkout
    const stripe = require('stripe')(STRIPE_SECRET);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Plan ${planId} — bqinzagencia` },
          unit_amount: monto * 100, // en céntimos
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: email,
      client_reference_id: referencia,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/pago-exitoso?empresa=${empresaId}&plan=${planId}&ref=${referencia}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/planes?id=${empresaId}`,
      metadata: { empresaId, planId, referencia },
    });

    return res.json({ ok: true, tipo: 'stripe', url: session.url, referencia });
  } catch (err) {
    console.error('stripe-crear-pago error:', err);
    return res.status(500).json({ error: err.message });
  }
}
