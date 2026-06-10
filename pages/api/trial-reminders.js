// pages/api/trial-reminders.js
// Cron job: envía recordatorios por email a usuarios cuyo trial expira en 3, 2 y 1 día
// Llama a este endpoint desde un cron externo (Vercel Cron, GitHub Actions, cron-job.org)
// GET /api/trial-reminders?secret=TU_CRON_SECRET

import * as admin from 'firebase-admin';

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

async function sendEmail(to, subject, html) {
  // Usa el servicio de email configurado — aquí usamos el endpoint propio de la app
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.bqinzagencia.com'}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-token': process.env.INTERNAL_API_TOKEN || '' },
    body: JSON.stringify({ to, subject, html }),
  });
  return res.ok;
}

function emailTemplate({ nombre, diasRestantes, planes }) {
  const urgencia = diasRestantes === 1
    ? '⏰ ¡Último día! Tu prueba gratuita termina mañana'
    : diasRestantes === 2
      ? '⚠️ Tu periodo de prueba termina en 2 días'
      : '📅 Tu prueba gratuita termina en 3 días';

  const cta = diasRestantes === 1
    ? 'Activa tu plan ahora y no pierdas tu cuenta'
    : 'Elige tu plan y sigue creciendo sin límites';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${urgencia}</title>
</head>
<body style="margin:0;padding:0;background:#080B0F;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080B0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111318;border-radius:20px;border:1px solid rgba(255,107,0,0.2);overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1C1410,#111318);padding:32px 40px;border-bottom:1px solid rgba(255,107,0,0.15);">
            <div style="font-family:Arial Black,sans-serif;font-size:26px;font-weight:900;letter-spacing:-1px;">
              <span style="color:#ffffff">BQinz</span><span style="color:#FF6B00">agenc</span><span style="color:#ffffff">IA</span>
            </div>
            <p style="color:#6B7280;font-size:13px;margin:6px 0 0;">Tu agente de IA para centros de estética · España</p>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="padding:36px 40px;">
            <h1 style="color:#FAFAF8;font-size:24px;font-weight:800;margin:0 0 12px;line-height:1.3;">${urgencia}</h1>
            <p style="color:#9CA3AF;font-size:16px;line-height:1.7;margin:0 0 28px;">
              Hola <strong style="color:#FAFAF8">${nombre}</strong>,<br><br>
              ${diasRestantes === 1
                ? 'Mañana finaliza tu acceso gratuito a BQinzagencIA. No pierdas tu agente IA, tus citas registradas ni la configuración que ya tienes lista.'
                : `Tu periodo de prueba gratuita de 7 días termina en <strong style="color:#FF6B00">${diasRestantes} días</strong>. Para seguir disfrutando de todos los beneficios de tu agente IA sin interrupciones, activa uno de los planes disponibles.`
              }
            </p>

            <!-- Planes -->
            <div style="background:#080B0F;border-radius:14px;padding:24px;margin-bottom:28px;border:1px solid rgba(255,255,255,0.06);">
              <p style="color:#FF6B00;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">PLANES DISPONIBLES</p>
              ${[
                { name: 'Starter', price: '89€/mes', desc: '500 conv/mes · WhatsApp IA · Recordatorios · Bizum' },
                { name: 'Básico ⭐', price: '199€/mes', desc: '1.500 conv/mes · Agente de Voz 200 min · CRM · Stripe' },
                { name: 'Pro', price: '569€/mes', desc: 'Ilimitado · 5 centros · Holded · Manager dedicado' },
              ].map(p => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <div>
                    <div style="color:#FAFAF8;font-weight:700;font-size:14px;">${p.name}</div>
                    <div style="color:#6B7280;font-size:12px;">${p.desc}</div>
                  </div>
                  <div style="color:#FF6B00;font-weight:800;font-size:16px;white-space:nowrap;margin-left:16px;">${p.price}</div>
                </div>
              `).join('')}
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="https://www.bqinzagencia.com/dashboard/configuracion?upgrade=true"
                style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;border-radius:100px;padding:16px 40px;font-weight:800;font-size:16px;letter-spacing:0.3px;">
                ${cta} →
              </a>
            </div>

            <p style="color:#4B5563;font-size:12px;text-align:center;line-height:1.6;margin:0;">
              Sin permanencia · Cancela cuando quieras · IVA no incluido<br>
              Si decides no continuar, tu cuenta se pausará automáticamente sin cargos.
            </p>
          </td>
        </tr>

        <!-- Footer legal -->
        <tr>
          <td style="background:#0A0D12;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="color:#3A4150;font-size:11px;margin:0;line-height:1.6;">
              BQinzagencIA · ${new Date().getFullYear()} · España 🇪🇸<br>
              Plataforma sujeta al RGPD. Tus datos están seguros en servidores europeos.<br>
              <a href="https://www.bqinzagencia.com/privacidad" style="color:#4B5563;text-decoration:none;">Política de Privacidad</a> ·
              <a href="https://www.bqinzagencia.com/cookies" style="color:#4B5563;text-decoration:none;">Cookies</a> ·
              <a href="https://www.bqinzagencia.com/baja?email=${encodeURIComponent(nombre)}" style="color:#4B5563;text-decoration:none;">Darse de baja</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Verificar token de seguridad del cron
  const secret = req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const db = getDb();
    const ahora = new Date();
    const enviados = [];

    // Buscar empresas en trial activo
    const snap = await db.collection('empresas')
      .where('trialActivo', '==', true)
      .where('planActivo', '==', false)
      .get();

    for (const doc of snap.docs) {
      const empresa = doc.data();
      if (!empresa.trialInicio || !empresa.email) continue;

      const inicio = empresa.trialInicio.toDate ? empresa.trialInicio.toDate() : new Date(empresa.trialInicio);
      const fin = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
      const msRestantes = fin - ahora;
      const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));

      if (![1, 2, 3].includes(diasRestantes)) continue;

      // Verificar que no se haya enviado ya este recordatorio hoy
      const yaEnviado = empresa[`reminder_${diasRestantes}d_enviado`];
      if (yaEnviado) continue;

      const nombre = empresa.nombreContacto || empresa.nombreEmpresa || 'usuario';
      const subject = diasRestantes === 1
        ? '⏰ Último día — Tu acceso a BQinzagencIA termina mañana'
        : diasRestantes === 2
          ? '⚠️ Tu prueba gratuita termina en 2 días — Elige tu plan'
          : '📅 Tu periodo de prueba termina en 3 días — BQinzagencIA';

      const html = emailTemplate({ nombre, diasRestantes });
      const ok = await sendEmail(empresa.email, subject, html);

      if (ok) {
        // Marcar como enviado
        await doc.ref.update({ [`reminder_${diasRestantes}d_enviado`]: true });
        enviados.push({ empresa: empresa.nombreEmpresa, email: empresa.email, diasRestantes });
        console.log(`[Trial Reminder] ✅ Email enviado a ${empresa.email} (${diasRestantes}d restantes)`);
      }
    }

    return res.status(200).json({ ok: true, enviados, total: enviados.length });
  } catch (e) {
    console.error('[Trial Reminder] Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
