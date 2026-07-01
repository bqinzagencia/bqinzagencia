// pages/api/soporte-mensaje.js
// Recibe mensajes del boton Soporte y Asesor (panel WasapBot / dashboard)
// Los guarda en Firestore y los notifica por dos canales independientes:
//  1. WhatsApp al 3105056616 (vía sesion Baileys de soporte)
//  2. Correo a soporte (respaldo si la sesion de WhatsApp esta caida)

import nodemailer from 'nodemailer';

const WA_SERVER          = process.env.WHATSAPP_SERVER_URL    || 'https://agenciame-whatsapp-server-production.up.railway.app';
const SERVER_SECRET      = process.env.SERVER_SECRET          || 'agenciame2026secreto_nexoia';
const SOPORTE_EMPRESA_ID = process.env.SOPORTE_EMPRESA_ID      || 'WN5UQBDMp1MSiuBdAfeJ';
const SOPORTE_NUMERO     = process.env.SOPORTE_WHATSAPP        || '573105056616';
const SOPORTE_EMAIL      = process.env.SOPORTE_EMAIL_DESTINO   || 'bqinzagencia@gmail.com';

function crearTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'soportesistemas@soporteia.net',
      pass: process.env.EMAIL_PASS,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId, nombreEmpresa, email, mensaje, tipo = 'soporte' } = req.body;
  if (!mensaje?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });

  // 'asesor' (dashboard general) y 'asesor-wasapbot' (panel WasapBot) son lo mismo
  const esAsesor = tipo === 'asesor' || tipo === 'asesor-wasapbot';
  const emoji    = esAsesor ? '🤝' : '🆘';
  const titulo   = esAsesor ? 'Solicitud de asesor' : 'Solicitud de soporte';

  try {
    const { db: adminDb } = await import('../../lib/firebaseAdmin');
    const { FieldValue }  = await import('firebase-admin/firestore');

    // 1. Guardar en Firestore — queda como respaldo aunque ambos canales fallen
    await adminDb.collection('soportes').add({
      empresaId:     empresaId || null,
      nombreEmpresa: nombreEmpresa || 'Desconocido',
      email:         email || null,
      mensaje,
      tipo,
      estado:        'pendiente',
      creadoEn:      FieldValue.serverTimestamp(),
    });

    const textoWA = `${emoji} *${titulo} — BQinzagencIA*\n\n*Empresa:* ${nombreEmpresa || 'Desconocida'}\n*Email:* ${email || 'sin email'}\n*Mensaje:*\n${mensaje}`;

    // 2. Canal 1 — WhatsApp (sesion Baileys de soporte)
    let waOk = false;
    try {
      const waResp = await fetch(`${WA_SERVER}/enviar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
        body:    JSON.stringify({
          empresaId: SOPORTE_EMPRESA_ID,
          numero:    SOPORTE_NUMERO,
          texto:     textoWA,
        }),
      });
      const waData = await waResp.json().catch(() => ({}));
      waOk = waResp.ok && waData?.ok !== false;
      console.log('soporte-mensaje WA:', waData);
    } catch (e) {
      console.error('soporte-mensaje WA error:', e.message);
    }

    // 3. Canal 2 — Correo, siempre se envía como respaldo independiente del WhatsApp
    try {
      const transporter = crearTransporter();
      await transporter.sendMail({
        from:    `"BQinzagencIA — Soporte" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
        to:      SOPORTE_EMAIL,
        subject: `${emoji} ${titulo} — ${nombreEmpresa || 'Desconocida'}${waOk ? '' : ' ⚠️ WhatsApp no enviado'}`,
        text:
          `Empresa: ${nombreEmpresa || 'Desconocida'}\n` +
          `EmpresaId: ${empresaId || '—'}\n` +
          `Email del cliente: ${email || 'sin email'}\n` +
          `Canal WhatsApp: ${waOk ? 'OK' : 'FALLÓ — revisar sesión Baileys de soporte'}\n\n` +
          `Mensaje:\n${mensaje}`,
      });
    } catch (e) {
      console.error('soporte-mensaje email error:', e.message);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('soporte-mensaje error:', err);
    return res.status(500).json({ error: err.message });
  }
}
