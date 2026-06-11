// pages/api/wompi-crear-pago.js
// Crea una referencia de pago firmada para Wompi
// Docs: https://docs.wompi.co/docs/en/widget-checkout-web

import crypto from 'crypto';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WOMPI_PRIV        = process.env.WOMPI_PRIV_KEY        || '';
const WOMPI_INTEG_KEY   = process.env.WOMPI_INTEGRITY_KEY   || '';
const WOMPI_PUB         = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { planId, empresaId, nombreEmpresa, email, monto } = req.body;
  if (!planId || !empresaId || !monto) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    // 1. Generar referencia única
    const referencia = `AGME-${empresaId.slice(0, 8)}-${planId.toUpperCase()}-${Date.now()}`;
    const montoEnCentavos = monto * 100;
    const moneda = 'COP';

    // 2. Guardar referencia en Firestore (para verificar en webhook)
    await adminDb.collection('pagos').doc(referencia).set({
      referencia,
      empresaId,
      planId,
      monto,
      moneda,
      estado:    'pendiente',
      creadoEn:  FieldValue.serverTimestamp(),
    });

    // 3. Generar firma de integridad (SHA-256)
    // Formato: referencia + monto_en_centavos + moneda + integrity_key
    let firma = '';
    if (WOMPI_INTEG_KEY) {
      const cadena = `${referencia}${montoEnCentavos}${moneda}${WOMPI_INTEG_KEY}`;
      firma = crypto.createHash('sha256').update(cadena).digest('hex');
    }

    return res.json({ ok: true, referencia, firma, montoEnCentavos });
  } catch (err) {
    console.error('wompi-crear-pago error:', err);
    return res.status(500).json({ error: err.message });
  }
}
