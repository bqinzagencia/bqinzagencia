// pages/api/wompi-activar-pago-aprobado.js
// Activa el plan SOLO si Wompi confirma el pago como APPROVED
// Verifica directamente con la API de Wompi — nunca confía en el navegador

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WOMPI_PRIV = process.env.WOMPI_PRIV_KEY || '';

const DIAS_PLAN = {
  basico: 30, estandar: 30, pro: 30,
  emprendedor: 30, profesional: 30, agencia: 30,
  prueba_5k: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { referencia, empresaId, planId } = req.body;

  if (!referencia || !empresaId || !planId) {
    return res.status(400).json({ error: 'Faltan datos: referencia, empresaId, planId' });
  }

  // Validar que la referencia tenga el formato correcto (AGME-XXXXXXXX-PLAN-TIMESTAMP)
  // Esto evita que alguien invente una referencia aleatoria
  if (!referencia.startsWith('AGME-')) {
    return res.status(400).json({ error: 'Referencia inválida' });
  }

  try {
    // 1. Verificar en Firestore que esta referencia fue creada por nosotros
    //    y que corresponde a esta empresa y plan
    const pagoRef  = adminDb.collection('pagos').doc(referencia);
    const pagoSnap = await pagoRef.get();

    if (!pagoSnap.exists) {
      return res.status(404).json({ error: 'Referencia no encontrada. El pago no fue iniciado correctamente.' });
    }

    const pagoGuardado = pagoSnap.data();

    // Verificar que la referencia pertenece a esta empresa y plan
    if (pagoGuardado.empresaId !== empresaId) {
      console.error(`[FRAUDE] empresaId no coincide: ${pagoGuardado.empresaId} vs ${empresaId}`);
      return res.status(403).json({ error: 'Los datos del pago no coinciden.' });
    }
    if (pagoGuardado.planId !== planId) {
      console.error(`[FRAUDE] planId no coincide: ${pagoGuardado.planId} vs ${planId}`);
      return res.status(403).json({ error: 'Los datos del pago no coinciden.' });
    }

    // Si ya fue activado antes (por el webhook o por un intento anterior), devolver ok
    if (pagoGuardado.yaActivado && pagoGuardado.estado === 'APPROVED') {
      return res.json({ ok: true, mensaje: 'Plan ya estaba activo', yaExistia: true });
    }

    // 2. VERIFICACIÓN CRÍTICA: consultar a Wompi directamente con la llave privada
    //    para confirmar que el pago realmente fue aprobado
    if (!WOMPI_PRIV) {
      console.error('[activar-pago-aprobado] WOMPI_PRIV_KEY no configurada');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const wompiResp = await fetch(
      `https://production.wompi.co/v1/transactions?reference=${referencia}`,
      {
        headers: {
          'Authorization': `Bearer ${WOMPI_PRIV}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!wompiResp.ok) {
      console.error('[activar-pago-aprobado] Error consultando Wompi:', wompiResp.status);
      return res.status(502).json({ error: 'No se pudo verificar el pago con Wompi' });
    }

    const wompiData = await wompiResp.json();
    const transacciones = wompiData?.data || [];

    // Buscar una transacción APPROVED para esta referencia
    const txAprobada = transacciones.find(tx => tx.status === 'APPROVED');

    if (!txAprobada) {
      const estados = transacciones.map(tx => tx.status).join(', ') || 'ninguna transacción';
      console.warn(`[activar-pago-aprobado] Pago NO aprobado para ${referencia}: ${estados}`);
      return res.status(402).json({
        error: 'El pago no está aprobado según Wompi',
        estado: estados,
      });
    }

    // 3. Verificar que el monto cobrado corresponde al plan
    const montoCobrado  = txAprobada.amount_in_cents;
    const montoEsperado = pagoGuardado.monto * 100;

    if (montoCobrado < montoEsperado) {
      console.error(`[FRAUDE] Monto incorrecto: cobrado ${montoCobrado} vs esperado ${montoEsperado}`);
      return res.status(403).json({ error: 'El monto del pago no corresponde al plan.' });
    }

    // 4. Todo verificado — activar el plan
    const ahora     = new Date();
    const dias      = DIAS_PLAN[planId] || 30;
    const planHasta = new Date(ahora.getTime() + dias * 86400000);

    await adminDb.collection('empresas').doc(empresaId).update({
      plan:          planId,
      planWasapbot:  planId,
      planActivo:    true,
      producto:      'wasapbot',
      planHasta:     planHasta,
      ultimoPago:    FieldValue.serverTimestamp(),
      ultimoPagoRef: referencia,
    });

    // 5. Marcar el pago en Firestore como activado
    await pagoRef.update({
      estado:         'APPROVED',
      yaActivado:     true,
      activadoEn:     FieldValue.serverTimestamp(),
      transaccionId:  txAprobada.id,
      metodoPago:     txAprobada.payment_method_type || null,
    });

    console.log(`[activar-pago-aprobado] ✅ Plan ${planId} activado para empresa ${empresaId} | TX: ${txAprobada.id}`);

    return res.json({ ok: true, mensaje: `Plan ${planId} activado`, planHasta: planHasta.toISOString() });

  } catch (err) {
    console.error('[activar-pago-aprobado] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
