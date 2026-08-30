// pages/api/telegram-webhook.js
// Webhook de Telegram Bot API. Funciona en paralelo a WhatsApp, sin depender
// de ninguna verificación de Meta: cada negocio crea su propio bot gratis
// hablando con @BotFather dentro de Telegram, y ese token se guarda en
// Firestore (empresa.telegram.botToken).
//
// Un mismo endpoint sirve para TODOS los bots de todas las empresas: al
// registrar el webhook de cada bot en Telegram, se incluye ?empresaId=XXX
// en la URL, así este handler sabe siempre a qué negocio pertenece el
// mensaje que acaba de llegar (Telegram reenvía la URL tal cual, con el
// query string incluido).
//
// Reutiliza el mismo "cerebro" que ya usan WhatsApp y el chat web
// (/api/whatsapp-baileys) — no se duplica la lógica de OpenAI, pedidos,
// citas, etc. Y guarda cada conversación en soporte_ia_conversaciones
// (canal: 'telegram') para que aparezca también en Admin > Soporte IA.

import axios from 'axios';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const SERVER_SECRET = process.env.SERVER_SECRET || 'bqinzagencia2026';
const BRAIN_URL      = `${process.env.AGENCIAME_API_URL || 'https://bqinzagencia.com'}/api/whatsapp-baileys`;

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const empresaId = req.query.empresaId;
    if (!empresaId) return res.status(200).json({ ok: true, skip: 'sin-empresaId-en-url' });

    const mensaje = req.body?.message;
    const texto   = mensaje?.text;
    const chatId  = mensaje?.chat?.id;
    const updateId = req.body?.update_id;

    // Puede llegar otro tipo de update (edición, callback de botón, etc.) — ignorar.
    if (!mensaje || !texto || !chatId) {
      return res.status(200).json({ ok: true, skip: 'no-es-mensaje-de-texto' });
    }

    // ── Anti-duplicados ──
    const dedupeRef = adminDb.collection('telegram_updates_procesados').doc(String(updateId));
    const dedupeSnap = await dedupeRef.get();
    if (dedupeSnap.exists) return res.status(200).json({ ok: true, skip: 'duplicate' });
    await dedupeRef.set({ procesadoEn: new Date() });

    // ── Datos de la empresa (necesitamos el botToken para poder responder) ──
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) {
      console.error('telegram-webhook: no existe la empresa', empresaId);
      return res.status(200).json({ ok: true, skip: 'sin-empresa' });
    }
    const empresa = empresaSnap.data() || {};
    const botToken = empresa.telegram?.botToken;
    if (!botToken) {
      console.error('telegram-webhook: empresa sin telegram.botToken', empresaId);
      return res.status(200).json({ ok: true, skip: 'sin-bot-token' });
    }

    // El "número de cliente" en Telegram es el chat_id (siempre es el mismo
    // para la misma persona, sirve igual que el número de teléfono en WhatsApp).
    const numeroCliente = String(chatId);

    // ── Llamar al cerebro existente (misma ruta que usa WhatsApp) ──
    const brainResp = await axios.post(
      BRAIN_URL,
      { empresaId, numeroCliente, texto },
      { headers: { 'x-server-secret': SERVER_SECRET }, timeout: 25000 }
    );

    const { respuesta, imagenes } = brainResp.data || {};
    if (respuesta) {
      await enviarRespuestaTelegram({ botToken, chatId, texto: respuesta, imagenes });
    }

    await guardarConversacionTelegram({
      empresaId,
      empresaNombre: empresa.nombreEmpresa || empresa.nombre || 'Empresa',
      numeroCliente,
      textoUsuario: texto,
      textoIA: respuesta || null,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err.response?.data || err.message);
    // Respondemos 200 igual, para que Telegram no reintente en bucle.
    return res.status(200).json({ ok: false, error: 'internal' });
  }
}

async function enviarRespuestaTelegram({ botToken, chatId, texto, imagenes }) {
  const base = `https://api.telegram.org/bot${botToken}`;

  // Telegram limita ~4096 caracteres por mensaje — se corta en trozos si hiciera falta.
  const trozos = texto.match(/[\s\S]{1,4000}/g) || [texto];
  for (const trozo of trozos) {
    await axios.post(`${base}/sendMessage`, { chat_id: chatId, text: trozo }).catch((e) =>
      console.error('telegram sendMessage error:', e.response?.data || e.message)
    );
  }

  if (Array.isArray(imagenes) && imagenes.length) {
    for (const url of imagenes) {
      await axios.post(`${base}/sendPhoto`, { chat_id: chatId, photo: url }).catch((e) =>
        console.error('telegram sendPhoto error:', e.response?.data || e.message)
      );
    }
  }
}

// Mismo patrón que guardarConversacionWhatsapp en meta-webhook.js, pero
// marcando canal: 'telegram' para diferenciarlas en el panel.
async function guardarConversacionTelegram({ empresaId, empresaNombre, numeroCliente, textoUsuario, textoIA }) {
  const convId = `tg_${empresaId}_${numeroCliente}`;
  const ref = adminDb.collection('soporte_ia_conversaciones').doc(convId);

  const nuevosMensajes = [{ rol: 'user', texto: textoUsuario, ts: new Date() }];
  if (textoIA) nuevosMensajes.push({ rol: 'ai', texto: textoIA, ts: new Date() });

  await ref.set({
    empresaId,
    empresaNombre,
    canal: 'telegram',
    modo: 'soporte',
    ip: numeroCliente,
    mensajes: FieldValue.arrayUnion(...nuevosMensajes),
    actualizadoEn: new Date(),
  }, { merge: true });

  const snap = await ref.get();
  const total = (snap.data()?.mensajes || []).length;
  await ref.update({ totalMensajes: total });

  const usoKey = `${empresaId}_${hoyKey()}`;
  await adminDb.collection('soporte_ia_uso').doc(usoKey).set({
    fecha: hoyKey(),
    count: FieldValue.increment(1),
  }, { merge: true }).catch(() => {});
}
