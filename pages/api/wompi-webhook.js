// ARCHIVO DESACTIVADO — Este proyecto usa Stripe (España/Europa)
// Ver pages/api/stripe-webhook.js
export default function handler(req, res) {
  return res.status(410).json({ error: 'Wompi no disponible en este proyecto. Usar Stripe.' });
}
