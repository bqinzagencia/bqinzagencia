// pages/api/stripe-crear-sesion.js
// Crea una sesión de pago con Stripe Checkout (estándar en España/Europa)
// Reemplaza Wompi (Colombia) por Stripe (España)

import Stripe from 'stripe';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const PRECIOS_EUR = {
  basico:   { monto: 4900,  nombre: 'Plan Básico WasapBot'   }, // 49€/mes en céntimos
  estandar: { monto: 8900,  nombre: 'Plan Estándar WasapBot' }, // 89€/mes
  pro:      { monto: 14900, nombre: 'Plan Pro WasapBot'       }, // 149€/mes
  prueba_5k:{ monto: 100,   nombre: 'Prueba Técnica'          }, // 1€
};

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

    // Guardar referencia en Firestore antes de redirigir
    await adminDb.collection('pagos').doc(referencia).set({
      referencia,
      empresaId,
      planId,
      monto: planInfo.monto,
      moneda: 'EUR',
      estado: 'pendiente',
      creadoEn: FieldValue.serverTimestamp(),
    });

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: planInfo.nombre,
            description: `WasapBot ${planId} — tu asistente de WhatsApp con IA`,
          },
          unit_amount: planInfo.monto,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: {
        referencia,
        empresaId,
        planId,
        nombreEmpresa: nombreEmpresa || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/pago-exitoso?empresa=${empresaId}&plan=${planId}&ref=${referencia}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wasapbot/planes?id=${empresaId}`,
    });

    return res.json({ ok: true, url: session.url, referencia });
  } catch (err) {
    console.error('stripe-crear-sesion error:', err);
    return res.status(500).json({ error: err.message });
  }
}
