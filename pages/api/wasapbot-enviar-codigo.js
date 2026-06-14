// pages/api/wasapbot-enviar-codigo.js
// Envia un codigo de 6 digitos al correo escrito manualmente en /wasapbot/activar.
// Se usa SOLO cuando el negocio NO se identifica con Google (que ya viene
// verificado por el proveedor). El codigo se guarda en Firestore con
// expiracion de 10 minutos y maximo 5 intentos de verificacion.
import { db as adminDb } from '../../lib/firebaseAdmin';
import nodemailer from 'nodemailer';

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

  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  const emailKey = email.toLowerCase().trim();
  const codigo   = String(Math.floor(100000 + Math.random() * 900000));
  const ahora    = Date.now();

  try {
    await adminDb.collection('verificacionesEmail').doc(emailKey).set({
      codigo,
      email: emailKey,
      creadoEn: ahora,
      expiraEn: ahora + 10 * 60 * 1000, // 10 minutos
      intentos: 0,
      verificado: false,
    });

    const transporter = crearTransporter();
    await transporter.sendMail({
      from: `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to: emailKey,
      subject: `Tu código de verificación: ${codigo} — agencIAme`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)"><tr><td style="background:linear-gradient(135deg,#06080D 0%,#0f1420 100%);padding:28px 32px;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#ffffff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:13px;font-weight:700">WasapBot</span></div></td></tr><tr><td style="padding:36px 32px;text-align:center"><p style="margin:0 0 8px;font-size:14px;color:#6B7280">Tu código de verificación es:</p><div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#111827;margin:16px 0;font-family:monospace">${codigo}</div><p style="margin:16px 0 0;font-size:13px;color:#9CA3AF">Este código expira en 10 minutos. Si no solicitaste esto, ignora este correo.</p></td></tr><tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center"><p style="margin:0;font-size:11px;color:#9CA3AF">agencIAme WasapBot · soportesistemas@soporteia.net</p></td></tr></table></td></tr></table></body></html>`,
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error('wasapbot-enviar-codigo:', e.message);
    return res.status(500).json({ error: 'No se pudo enviar el correo. Verifica que esté bien escrito.' });
  }
}
