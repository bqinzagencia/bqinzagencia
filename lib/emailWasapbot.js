// lib/emailWasapbot.js
// Envio de emails para WasapBot usando nodemailer + Gmail
// Variables de entorno necesarias:
//   EMAIL_USER = soportesistemas@soporteia.net
//   EMAIL_PASS = (app password de Gmail)

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

/**
 * Notifica al negocio cuando el bot agenda una nueva cita
 */
export async function enviarEmailCita({ emailNegocio, nombreNegocio, nombreCliente, telefono, servicio, fecha, hora, empresaId }) {
  if (!emailNegocio) return;
  try {
    const transporter = crearTransporter();
    const panelUrl = `https://agenciame.com/wasapbot/panel/${empresaId}`;

    await transporter.sendMail({
      from:    `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to:      emailNegocio,
      subject: `📅 Nueva cita agendada — ${nombreNegocio}`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#06080D 0%,#0f1420 100%);padding:28px 32px;text-align:center">
          <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;letter-spacing:-0.5px">
            agenc<span style="color:#FF6B00">IA</span>me
            <span style="color:#25D366;font-family:Arial,sans-serif;font-size:13px;font-weight:700;background:rgba(37,211,102,0.15);padding:3px 10px;border-radius:99px;margin-left:6px">WasapBot</span>
          </div>
        </td></tr>

        <!-- Icon + title -->
        <tr><td style="padding:32px 32px 8px;text-align:center">
          <div style="width:64px;height:64px;border-radius:50%;background:#E8FFF0;border:2px solid #25D366;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px">📅</div>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f1420">¡Nueva cita agendada!</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#6B7280">Tu bot de WhatsApp acaba de confirmar una cita para <strong>${nombreNegocio}</strong></p>
        </td></tr>

        <!-- Cita card -->
        <tr><td style="padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1.5px solid #E5E7EB;border-radius:12px;overflow:hidden">
            <tr><td style="padding:20px 24px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Cliente</span><br>
                    <span style="font-size:15px;font-weight:600;color:#111827">${nombreCliente}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">WhatsApp</span><br>
                    <span style="font-size:15px;font-weight:600;color:#111827">+${telefono}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Servicio</span><br>
                    <span style="font-size:15px;font-weight:600;color:#111827">${servicio}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Fecha</span><br>
                    <span style="font-size:15px;font-weight:600;color:#111827">${fecha}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0">
                    <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Hora</span><br>
                    <span style="font-size:22px;font-weight:700;color:#25D366">${hora}</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 32px 32px;text-align:center">
          <a href="${panelUrl}" style="display:inline-block;background:linear-gradient(135deg,#25D366,#1aad4e);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.2px">
            Ver todas mis citas →
          </a>
          <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF">
            Accede a tu panel para confirmar, cancelar o reagendar esta cita.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-top:1px solid #F3F4F6;padding:20px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#9CA3AF">
            Este email fue enviado automáticamente por agencIAme WasapBot.<br>
            ¿Necesitas ayuda? Escríbenos a <a href="mailto:soportesistemas@soporteia.net" style="color:#25D366">soportesistemas@soporteia.net</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error('emailWasapbot - enviarEmailCita:', err.message);
  }
}

/**
 * Notifica al negocio cuando un cliente pide asesor humano
 */
export async function enviarEmailSoporte({ emailNegocio, nombreNegocio, nombreCliente, telefono, mensaje, empresaId }) {
  if (!emailNegocio) return;
  try {
    const transporter = crearTransporter();
    const panelUrl = `https://agenciame.com/wasapbot/panel/${empresaId}`;

    await transporter.sendMail({
      from:    `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to:      emailNegocio,
      subject: `🆘 Cliente solicita asesor — ${nombreNegocio}`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
        <tr><td style="background:linear-gradient(135deg,#06080D,#0f1420);padding:28px 32px;text-align:center">
          <div style="font-family:Georgia,serif;font-size:22px;color:#fff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:13px;font-weight:700">WasapBot</span></div>
        </td></tr>
        <tr><td style="padding:32px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🙋</div>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f1420">Un cliente pide hablar con una persona</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#6B7280">En <strong>${nombreNegocio}</strong></p>
        </td></tr>
        <tr><td style="padding:0 32px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:12px">
            <tr><td style="padding:20px 24px">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Cliente</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827">${nombreCliente} · +${telefono}</p>
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px">Ultimo mensaje</p>
              <p style="margin:0;font-size:14px;color:#374151;font-style:italic">"${mensaje}"</p>
            </td></tr>
          </table>
          <div style="text-align:center;margin-top:24px">
            <a href="https://wa.me/${telefono}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;margin-right:8px">
              Responder por WhatsApp
            </a>
            <a href="${panelUrl}" style="display:inline-block;background:#F3F4F6;color:#374151;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">
              Ver en el panel
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#F9FAFB;border-top:1px solid #F3F4F6;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:11px;color:#9CA3AF">agencIAme WasapBot · <a href="mailto:soportesistemas@soporteia.net" style="color:#25D366">soportesistemas@soporteia.net</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (err) {
    console.error('emailWasapbot - enviarEmailSoporte:', err.message);
  }
}
