// ── AGREGAR AL FINAL de lib/emailWasapbot.js ────────────────
// (Este archivo reemplaza el lib/emailWasapbot.js completo con la funcion nueva al final)
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

export async function enviarEmailCita({ emailNegocio, nombreNegocio, nombreCliente, telefono, servicio, fecha, hora, empresaId }) {
  if (!emailNegocio) return;
  try {
    const transporter = crearTransporter();
    const panelUrl = `https://agenciame.com/wasapbot/panel/${empresaId}`;
    await transporter.sendMail({
      from: `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to: emailNegocio,
      subject: `📅 Nueva cita agendada — ${nombreNegocio}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)"><tr><td style="background:linear-gradient(135deg,#06080D 0%,#0f1420 100%);padding:28px 32px;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#ffffff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:13px;font-weight:700">WasapBot</span></div></td></tr><tr><td style="padding:32px 32px 8px;text-align:center"><div style="font-size:48px;margin-bottom:12px">📅</div><h1 style="margin:0;font-size:22px;font-weight:700;color:#0f1420">Nueva cita agendada</h1><p style="margin:8px 0 0;font-size:14px;color:#6B7280">Para <strong>${nombreNegocio}</strong></p></td></tr><tr><td style="padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1.5px solid #E5E7EB;border-radius:12px"><tr><td style="padding:20px 24px"><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase">Cliente</p><p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827">${nombreCliente} · +${telefono}</p><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase">Servicio</p><p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827">${servicio}</p><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase">Fecha y Hora</p><p style="margin:0;font-size:20px;font-weight:700;color:#25D366">${fecha} — ${hora}</p></td></tr></table></td></tr><tr><td style="padding:0 32px 32px;text-align:center"><a href="${panelUrl}" style="display:inline-block;background:linear-gradient(135deg,#25D366,#1aad4e);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700">Ver en mi panel →</a></td></tr><tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center"><p style="margin:0;font-size:12px;color:#9CA3AF">agencIAme WasapBot · <a href="mailto:soportesistemas@soporteia.net" style="color:#25D366">soportesistemas@soporteia.net</a></p></td></tr></table></td></tr></table></body></html>`,
    });
  } catch (err) { console.error('emailWasapbot - enviarEmailCita:', err.message); }
}

export async function enviarEmailSoporte({ emailNegocio, nombreNegocio, nombreCliente, telefono, mensaje, empresaId }) {
  if (!emailNegocio) return;
  try {
    const transporter = crearTransporter();
    const panelUrl = `https://agenciame.com/wasapbot/panel/${empresaId}`;
    await transporter.sendMail({
      from: `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to: emailNegocio,
      subject: `🆘 Cliente solicita asesor — ${nombreNegocio}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,#06080D,#0f1420);padding:28px 32px;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#fff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:13px">WasapBot</span></div></td></tr><tr><td style="padding:32px;text-align:center"><div style="font-size:40px;margin-bottom:12px">🙋</div><h1 style="margin:0;font-size:20px;font-weight:700;color:#0f1420">Cliente pide hablar con una persona</h1></td></tr><tr><td style="padding:0 32px 32px"><table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:12px"><tr><td style="padding:20px 24px"><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase">Cliente</p><p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827">${nombreCliente} · +${telefono}</p><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase">Ultimo mensaje</p><p style="margin:0;font-size:14px;color:#374151;font-style:italic">"${mensaje}"</p></td></tr></table><div style="text-align:center;margin-top:24px"><a href="https://wa.me/${telefono}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;margin-right:8px">Responder por WhatsApp</a><a href="${panelUrl}" style="display:inline-block;background:#F3F4F6;color:#374151;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">Ver en el panel</a></div></td></tr><tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center"><p style="margin:0;font-size:11px;color:#9CA3AF">agencIAme WasapBot · <a href="mailto:soportesistemas@soporteia.net" style="color:#25D366">soportesistemas@soporteia.net</a></p></td></tr></table></td></tr></table></body></html>`,
    });
  } catch (err) { console.error('emailWasapbot - enviarEmailSoporte:', err.message); }
}

export async function enviarEmailPedido({ emailNegocio, nombreNegocio, nombreCliente, telefono, items, total, nequi, empresaId, pedidoId }) {
  if (!emailNegocio) return;
  try {
    const transporter = crearTransporter();
    const panelUrl = `https://agenciame.com/wasapbot/panel/pedidos/${empresaId}`;
    const itemsHTML = items.map(it =>
      `<tr><td style="padding:8px 0;font-size:14px;color:#111827;border-bottom:1px solid #F3F4F6">${it.cantidad}x ${it.nombre}</td><td style="padding:8px 0;font-size:14px;color:#111827;text-align:right;border-bottom:1px solid #F3F4F6">$${Number(it.precio||0).toLocaleString('es-CO')} COP</td></tr>`
    ).join('');
    await transporter.sendMail({
      from: `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to: emailNegocio,
      subject: `🛒 Nuevo pedido #${pedidoId?.slice(-6).toUpperCase()} — ${nombreNegocio}`,
      html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)"><tr><td style="background:linear-gradient(135deg,#06080D,#0f1420);padding:28px 32px;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#ffffff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:13px;font-weight:700">WasapBot</span></div></td></tr><tr><td style="padding:28px 32px 8px;text-align:center"><div style="font-size:48px;margin-bottom:12px">🛒</div><h1 style="margin:0;font-size:24px;font-weight:700;color:#0f1420">Nuevo pedido recibido</h1><p style="margin:8px 0 0;font-size:14px;color:#6B7280">Pedido #<strong>${pedidoId?.slice(-6).toUpperCase()}</strong> — <strong>${nombreNegocio}</strong></p></td></tr><tr><td style="padding:20px 32px"><div style="background:#F0FFF4;border:1.5px solid #86EFAC;border-radius:12px;padding:16px 20px;margin-bottom:16px"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#166534;text-transform:uppercase">Cliente</p><p style="margin:0;font-size:16px;font-weight:700;color:#111827">${nombreCliente}</p><p style="margin:4px 0 0;font-size:13px;color:#374151">WhatsApp: <a href="https://wa.me/${telefono}" style="color:#25D366">+${telefono}</a></p></div><div style="background:#F8FAFC;border:1.5px solid #E5E7EB;border-radius:12px;padding:20px 24px;margin-bottom:16px"><table width="100%" cellpadding="0" cellspacing="0">${itemsHTML}<tr><td style="padding-top:12px;font-size:15px;font-weight:700;color:#111827">TOTAL</td><td style="padding-top:12px;font-size:20px;font-weight:800;color:#25D366;text-align:right">$${Number(total||0).toLocaleString('es-CO')} COP</td></tr></table></div>${nequi?`<div style="background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:12px;padding:16px 20px;margin-bottom:16px;text-align:center"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1E40AF;text-transform:uppercase">Pago por Nequi</p><p style="margin:0;font-size:24px;font-weight:800;color:#1D4ED8">📱 ${nequi}</p></div>`:''}<div style="text-align:center"><a href="https://wa.me/${telefono}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:700;margin-right:8px">Confirmar al cliente</a><a href="${panelUrl}" style="display:inline-block;background:#F3F4F6;color:#374151;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:600">Ver pedidos</a></div></td></tr><tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center"><p style="margin:0;font-size:11px;color:#9CA3AF">agencIAme WasapBot</p></td></tr></table></td></tr></table></body></html>`,
    });
  } catch (err) { console.error('emailWasapbot - enviarEmailPedido:', err.message); }
}

// ── Email de alerta de inventario bajo / agotado ─────────────
export async function enviarEmailInventario({ emailNegocio, nombreNegocio, alertas, panelUrl }) {
  if (!emailNegocio || !alertas?.length) return;
  try {
    const transporter = crearTransporter();

    const agotados  = alertas.filter(a => a.tipo === 'agotado');
    const bajoStock = alertas.filter(a => a.tipo === 'bajo');

    const rowsAgotados = agotados.map(a =>
      `<tr><td style="padding:8px 12px;font-size:14px;color:#111827;border-bottom:1px solid #FEE2E2">🔴 ${a.nombre}</td><td style="padding:8px 12px;font-size:14px;font-weight:700;color:#EF4444;text-align:right;border-bottom:1px solid #FEE2E2">AGOTADO</td></tr>`
    ).join('');

    const rowsBajo = bajoStock.map(a =>
      `<tr><td style="padding:8px 12px;font-size:14px;color:#111827;border-bottom:1px solid #FEF3C7">🟡 ${a.nombre}</td><td style="padding:8px 12px;font-size:14px;font-weight:700;color:#F59E0B;text-align:right;border-bottom:1px solid #FEF3C7">Solo ${a.stock} restante${a.stock !== 1 ? 's' : ''}</td></tr>`
    ).join('');

    const asunto = agotados.length > 0
      ? `🔴 Producto agotado — ${nombreNegocio}`
      : `🟡 Stock bajo — ${nombreNegocio}`;

    await transporter.sendMail({
      from: `"agencIAme WasapBot" <${process.env.EMAIL_USER || 'soportesistemas@soporteia.net'}>`,
      to: emailNegocio,
      subject: asunto,
      html: `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">

<tr><td style="background:linear-gradient(135deg,#06080D,#0f1420);padding:24px 32px;text-align:center">
  <div style="font-family:Georgia,serif;font-size:20px;color:#ffffff">agenc<span style="color:#FF6B00">IA</span>me <span style="color:#25D366;font-size:12px">WasapBot</span></div>
</td></tr>

<tr><td style="padding:28px 32px 8px;text-align:center">
  <div style="font-size:48px;margin-bottom:12px">${agotados.length > 0 ? '🔴' : '🟡'}</div>
  <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f1420">
    ${agotados.length > 0 ? 'Producto agotado en tu menú' : 'Stock bajo en tu inventario'}
  </h1>
  <p style="margin:8px 0 0;font-size:14px;color:#6B7280">
    ${nombreNegocio} — actualiza tu inventario para seguir recibiendo pedidos
  </p>
</td></tr>

<tr><td style="padding:20px 32px">
  ${agotados.length > 0 ? `
  <div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:12px;margin-bottom:16px;overflow:hidden">
    <div style="padding:12px 16px;background:#FEE2E2;font-size:11px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:1px">
      🔴 Agotados — El bot ya no los muestra
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rowsAgotados}
    </table>
  </div>` : ''}

  ${bajoStock.length > 0 ? `
  <div style="background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:12px;margin-bottom:16px;overflow:hidden">
    <div style="padding:12px 16px;background:#FEF3C7;font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px">
      🟡 Bajo stock — Quedan pocas porciones
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rowsBajo}
    </table>
  </div>` : ''}

  <div style="text-align:center;margin-top:20px">
    <a href="${panelUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF6B00,#FF9500);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700">
      Actualizar inventario →
    </a>
  </div>
</td></tr>

<tr><td style="background:#F9FAFB;padding:16px 32px;text-align:center">
  <p style="margin:0;font-size:11px;color:#9CA3AF">agencIAme WasapBot · <a href="mailto:soportesistemas@soporteia.net" style="color:#25D366">soportesistemas@soporteia.net</a></p>
</td></tr>

</table></td></tr></table>
</body></html>`,
    });
  } catch (err) { console.error('emailWasapbot - enviarEmailInventario:', err.message); }
}
