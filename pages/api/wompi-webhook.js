// pages/api/wompi-webhook.js
// Recibe eventos de Wompi y activa el plan automáticamente
// URL a registrar en Wompi: https://www.agenciame.com/api/wompi-webhook

import crypto from 'crypto';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || '';
const WA_SERVER           = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SERVER_SECRET       = process.env.SERVER_SECRET       || 'agenciame2026secreto_nexoia';
const SOPORTE_EMPRESA_ID  = process.env.SOPORTE_EMPRESA_ID  || '';
const SOPORTE_NUMERO      = process.env.SOPORTE_WHATSAPP    || '573105056616';

// Cuántos días activa cada plan WasapBot
const DIAS_PLAN = { basico: 30, estandar: 30, pro: 30, emprendedor: 30, profesional: 30, agencia: 30 };

export const config = { api: { bodyParser: false } };

async function leerBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await leerBody(req);

  // 1. Verificar firma del evento Wompi
  if (WOMPI_EVENTS_SECRET) {
    const signature = req.headers['x-event-checksum'] || '';
    const expected  = crypto
      .createHash('sha256')
      .update(rawBody + WOMPI_EVENTS_SECRET)
      .digest('hex');
    if (signature !== expected) {
      console.error('Wompi webhook: firma inválida');
      return res.status(401).json({ error: 'Firma inválida' });
    }
  }

  let evento;
  try { evento = JSON.parse(rawBody); } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  // 2. Solo procesar transacciones aprobadas
  const tipo         = evento?.event;
  const transaccion  = evento?.data?.transaction;

  if (tipo !== 'transaction.updated' || !transaccion) {
    return res.json({ ok: true, ignorado: true });
  }

  const { reference, status, amount_in_cents, currency, payment_method_type, id: txId } = transaccion;

  console.log(`Wompi webhook: ${reference} → ${status}`);

  // 3. Actualizar estado del pago en Firestore
  try {
    await adminDb.collection('pagos').doc(reference).update({
      estado:              status,
      transaccionId:       txId || null,
      metodoPago:          payment_method_type || null,
      actualizadoEn:       FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('Error actualizando pago:', e.message);
  }

  if (status !== 'APPROVED') {
    return res.json({ ok: true, status });
  }

  // 4. Obtener datos del pago
  let pagoData;
  try {
    const pagoSnap = await adminDb.collection('pagos').doc(reference).get();
    if (!pagoSnap.exists) throw new Error('Pago no encontrado: ' + reference);
    pagoData = pagoSnap.data();
  } catch (e) {
    console.error('Error leyendo pago:', e.message);
    return res.status(500).json({ error: e.message });
  }

  const { empresaId, planId } = pagoData;

  // 5. Activar plan en Firestore
  try {
    const ahora      = new Date();
    const dias        = DIAS_PLAN[planId] || 30;
    const planHasta  = new Date(ahora.getTime() + dias * 86400000);

    await adminDb.collection('empresas').doc(empresaId).update({
      plan:          planId,
      planWasapbot:  planId,   // campo específico para WasapBot
      planActivo:    true,
      producto:      'wasapbot', // asegurar que es producto wasapbot
      planHasta:     planHasta,
      ultimoPago:    FieldValue.serverTimestamp(),
      ultimoPagoRef: reference,
    });

    console.log(`Plan ${planId} activado para empresa ${empresaId} hasta ${planHasta.toISOString()}`);
  } catch (e) {
    console.error('Error activando plan:', e.message);
    return res.status(500).json({ error: e.message });
  }

  // 6. Notificar a Alexander por WhatsApp
  try {
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    const empresa     = empresaSnap.data();
    const monto       = (amount_in_cents / 100).toLocaleString('es-CO');
    const metodo      = { PSE: 'PSE', CARD: 'Tarjeta', NEQUI: 'Nequi', BANCOLOMBIA_TRANSFER: 'Bancolombia' }[payment_method_type] || payment_method_type;

    const mensaje = `💰 *Nuevo pago recibido — agencIAme*\n\n*Empresa:* ${empresa?.nombreEmpresa || empresaId}\n*Plan:* ${planId}\n*Monto:* $${monto} COP\n*Método:* ${metodo}\n*Referencia:* ${reference}\n\n✅ Plan activado automáticamente`;

    if (SOPORTE_EMPRESA_ID) {
      await fetch(`${WA_SERVER}/enviar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
        body:    JSON.stringify({ empresaId: SOPORTE_EMPRESA_ID, numero: SOPORTE_NUMERO, texto: mensaje }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error enviando notificación WA:', e.message);
  }

  return res.json({ ok: true, activado: true, planId, empresaId });
}
