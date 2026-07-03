// pages/api/wasapbot-crear.js
// Crea empresa para WasapBot — con prueba gratis de 24h (tokens limitados)
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { enviarEmailNuevoRegistro } from '../../lib/emailWasapbot';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { nombre, industria, descripcion, email, horario, ciudad, producto, ownerUid } = req.body;
  if (!nombre || !industria || !email) return res.status(400).json({ error: 'Faltan datos requeridos' });

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido' });
  }

  // Bloquear dominios falsos o desechables
  const dominiosFalsos = [
    'tucorreo.com', 'correo.com', 'email.com', 'test.com', 'prueba.com',
    'ejemplo.com', 'example.com', 'fake.com', 'nomail.com', 'noemail.com',
    'sinmail.com', 'temporal.com', 'temp.com', 'mimail.com', 'micorreo.com',
    'tuemail.com', 'miemail.com', 'correofalso.com', 'mailinator.com',
    'guerrillamail.com', 'throwaway.email', 'yopmail.com', 'trashmail.com',
    'tempmail.com', 'sharklasers.com', 'spam4.me', 'dispostable.com',
  ];
  const dominio = email.trim().split('@')[1]?.toLowerCase();
  if (dominiosFalsos.includes(dominio)) {
    return res.status(400).json({ error: 'Por favor usa un correo real. No se permiten correos temporales o de prueba.' });
  }

  try {
    const empresaRef = adminDb.collection('empresas').doc();
    const empresaId  = empresaRef.id;

    await empresaRef.set({
      nombreEmpresa:  nombre,
      industria,
      email,
      ciudad:         ciudad || '',
      plan:           'wasapbot',
      planActivo:     true,
      producto:       producto || 'wasapbot',
      // ── Prueba gratis 24h ──
      // No es un plan de pago: es una ventana de evaluacion de 24h desde el
      // registro, con un tope de tokens bajo para controlar el gasto de OpenAI.
      // Pasadas las 24h (o agotado el tope), el bot deja de responder con IA
      // hasta que el cliente contrate un plan — lo haya usado o no.
      esPruebaGratis: true,
      trialHasta:     new Date(Date.now() + 24 * 60 * 60 * 1000),
      trialAvisoEnviado: false,
      ownerUid:       ownerUid || null,   // ← uid del usuario registrado
      creadoEn:       FieldValue.serverTimestamp(),
      whatsapp:       { status: 'disconnected' },
      tokensUsados:   0,
      conversaciones: 0,
    });

    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').set({
        info: { descripcionNegocio: descripcion || `${nombre} — ${industria}`, email },
        servicios:      [],
        horarios:       horario ? { general: horario } : {},
        permitePedidos: false,
        creadoEn:       FieldValue.serverTimestamp(),
      });

    await adminDb.collection('empresas').doc(empresaId)
      .collection('agentes').add({
        nombre:   `Asistente de ${nombre}`,
        activo:   true,
        canal:    'whatsapp',
        creadoEn: FieldValue.serverTimestamp(),
      });

    // Registrar relación usuario → empresa en colección usuarios
    if (ownerUid) {
      await adminDb.collection('usuarios').doc(ownerUid).set({
        wasapbotEmpresaId: empresaId,
        email,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    // Notificar a Alexander por WhatsApp cuando se registra una nueva empresa
    try {
      const WA_SERVER   = process.env.WHATSAPP_SERVER_URL || 'REEMPLAZAR_URL_RAILWAY';
      const WA_SECRET   = process.env.SERVER_SECRET       || 'REEMPLAZAR_SECRET';
      const SOPORTE_ID  = process.env.SOPORTE_EMPRESA_ID  || '';
      const SOPORTE_NUM = process.env.SOPORTE_WHATSAPP    || 'REEMPLAZAR_NUMERO';

      const mensaje = `🆕 *Nueva empresa registrada — bqinzagencia*\n\n*Negocio:* ${nombre}\n*Industria:* ${industria}\n*Email:* ${email}\n*Ciudad:* ${ciudad || 'no especificada'}\n*ID:* ${empresaId}\n\n⚠️ Aún sin plan activo — pendiente de pago`;

      if (SOPORTE_ID) {
        await fetch(`${WA_SERVER}/enviar`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-server-secret': WA_SECRET },
          body:    JSON.stringify({ empresaId: SOPORTE_ID, numero: SOPORTE_NUM, texto: mensaje }),
        }).catch(e => console.error('Notificacion WA registro fallida:', e.message));
      }
    } catch (e) {
      console.error('Error notificacion registro:', e.message);
    }

    // Notificar a Oscar por email cuando se registra una nueva empresa
    enviarEmailNuevoRegistro({ nombre, email, industria, ciudad, empresaId }).catch(() => {});

    return res.json({ ok: true, empresaId });
  } catch (err) {
    console.error('wasapbot-crear:', err);
    return res.status(500).json({ error: err.message });
  }
}
