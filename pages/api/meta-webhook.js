// pages/api/meta-webhook.js
// Webhook oficial de WhatsApp Cloud API (Meta). Sustituye al servidor
// Baileys de Railway: Meta llama aquí directamente cuando llega un mensaje.
//
// GET  -> verificación del webhook (handshake que pide Meta al guardar la URL)
// POST -> mensajes entrantes reales
//
// Reutiliza el "cerebro" que ya existe en /api/whatsapp-baileys (OpenAI,
// pedidos, citas, filtros, etc.) llamándolo por HTTP interno — así no se
// duplica ni se toca esa lógica, que ya funciona en producción.
//
// NUEVO: cada mensaje entrante y su respuesta se guardan también en
// soporte_ia_conversaciones (misma colección que usa el panel Admin >
// Soporte IA), marcados con canal: 'whatsapp', para poder verlos ahí.

import axios from 'axios';
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { enviarRespuestaCompletaMeta } from '../../lib/metaWhatsapp';

const VERIFY_TOKEN   = process.env.META_VERIFY_TOKEN;
const SERVER_SECRET  = process.env.SERVER_SECRET || 'bqinzagencia2026';
const BRAIN_URL       = `${process.env.AGENCIAME_API_URL || 'https://bqinzagencia.com'}/api/whatsapp-baileys`;

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method === 'GET') return handleVerify(req, res);
  if (req.method === 'POST') return handleIncoming(req, res);
  return res.status(405).end();
}

// ── Verificación del webhook (Meta la llama una vez, al guardar la URL) ──
function handleVerify(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Token de verificación inválido');
}

// ── Mensajes entrantes reales ─────────────────────────────────────────
async function handleIncoming(req, res) {
  try {
    const entry   = req.body?.entry?.[0];
    const change  = entry?.changes?.[0];
    const value   = change?.value;
    const mensaje = value?.messages?.[0];

    // Puede llegar un "status" (entregado/leído) en vez de un mensaje real — ignorar.
    if (!mensaje) return res.status(200).json({ ok: true, skip: 'no-message' });

    const phoneNumberId = value?.metadata?.phone_number_id;
    const numeroCliente  = mensaje.from; // en formato internacional sin '+', ej. "34674421919"
    const texto          = mensaje.text?.body || '';
    const messageId       = mensaje.id;

    if (!phoneNumberId || !numeroCliente || !texto || !messageId) {
      return res.status(200).json({ ok: true, skip: 'missing-fields' });
    }

    // ── Anti-duplicados: Meta puede reenviar el mismo mensaje ──
    const dedupeRef = adminDb.collection('meta_mensajes_procesados').doc(messageId);
    const dedupeSnap = await dedupeRef.get();
    if (dedupeSnap.exists) return res.status(200).json({ ok: true, skip: 'duplicate' });
    await dedupeRef.set({ procesadoEn: new Date() });

    // ── ¿Qué empresa corresponde a este número de Meta? ──
    const empresa = await resolverEmpresa(phoneNumberId);
    if (!empresa) {
      console.error('meta-webhook: no hay empresa vinculada a phone_number_id', phoneNumberId);
      return res.status(200).json({ ok: true, skip: 'sin-empresa' });
    }
    const { id: empresaId, nombre: empresaNombre } = empresa;

    // ── Llamar al cerebro existente (misma ruta que usa Railway/Baileys) ──
    const brainResp = await axios.post(
      BRAIN_URL,
      { empresaId, numeroCliente, texto },
      { headers: { 'x-server-secret': SERVER_SECRET }, timeout: 25000 }
    );

    const { respuesta, imagenes } = brainResp.data || {};
    if (respuesta) {
      await enviarRespuestaCompletaMeta({ phoneNumberId, to: numeroCliente, texto: respuesta, imagenes });
    }

    // ── Guardar la conversación para que aparezca en Admin > Soporte IA ──
    await guardarConversacionWhatsapp({
      empresaId,
      empresaNombre,
      numeroCliente,
      textoUsuario: texto,
      textoIA: respuesta || null,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('meta-webhook error:', err.response?.data || err.message);
    // Igualmente respondemos 200 a Meta para que no reintente indefinidamente
    return res.status(200).json({ ok: false, error: 'internal' });
  }
}

// Busca la empresa cuyo whatsapp.metaPhoneNumberId coincide con el phone_number_id
// que mandó Meta. Guardamos ese campo en Firestore al registrar cada número.
async function resolverEmpresa(phoneNumberId) {
  const snap = await adminDb.collection('empresas')
    .where('whatsapp.metaPhoneNumberId', '==', phoneNumberId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() || {};
  return { id: doc.id, nombre: data.nombre || data.nombreEmpresa || 'Empresa' };
}

// Guarda/actualiza la conversación de WhatsApp en soporte_ia_conversaciones,
// la misma colección que ya lee el panel Admin > Soporte IA. Un documento
// por cliente+empresa, para que el historial se vaya acumulando.
async function guardarConversacionWhatsapp({ empresaId, empresaNombre, numeroCliente, textoUsuario, textoIA }) {
  const convId = `wa_${empresaId}_${numeroCliente}`;
  const ref = adminDb.collection('soporte_ia_conversaciones').doc(convId);

  const nuevosMensajes = [{ rol: 'user', texto: textoUsuario, ts: new Date() }];
  if (textoIA) nuevosMensajes.push({ rol: 'ai', texto: textoIA, ts: new Date() });

  await ref.set({
    empresaId,
    empresaNombre,
    canal: 'whatsapp',
    modo: 'soporte',
    ip: numeroCliente, // se reutiliza el campo "ip" del panel para mostrar el número
    mensajes: FieldValue.arrayUnion(...nuevosMensajes),
    actualizadoEn: new Date(),
  }, { merge: true });

  // totalMensajes hay que recalcularlo aparte porque arrayUnion no nos da la longitud final
  const snap = await ref.get();
  const total = (snap.data()?.mensajes || []).length;
  await ref.update({ totalMensajes: total });
}