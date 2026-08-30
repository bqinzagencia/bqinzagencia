// pages/api/telegram-conectar.js
// Recibe el token de un bot de Telegram que un cliente creó él mismo con
// @BotFather, lo valida contra la API de Telegram, guarda el token en
// Firestore y registra automáticamente el webhook — así el cliente no
// tiene que tocar ninguna URL a mano, solo pegar el token en el panel.

import axios from 'axios';
import { db as adminDb } from '../../lib/firebaseAdmin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bqinzagencia.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method-not-allowed' });

  try {
    const { empresaId, botToken } = req.body || {};
    if (!empresaId || !botToken) {
      return res.status(400).json({ ok: false, error: 'Falta empresaId o botToken' });
    }

    const tokenLimpio = String(botToken).trim();

    // Formato esperado: 123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    if (!/^\d+:[A-Za-z0-9_-]{30,}$/.test(tokenLimpio)) {
      return res.status(400).json({ ok: false, error: 'Ese token no tiene el formato esperado. Cópialo tal cual te lo dio @BotFather.' });
    }

    // ── 1. Validar el token contra la API de Telegram ──
    let botInfo;
    try {
      const getMeResp = await axios.get(`https://api.telegram.org/bot${tokenLimpio}/getMe`);
      if (!getMeResp.data?.ok) throw new Error('respuesta no ok');
      botInfo = getMeResp.data.result;
    } catch (e) {
      return res.status(400).json({ ok: false, error: 'Ese token no es válido. Revísalo en @BotFather y vuelve a intentarlo.' });
    }

    // ── 2. Registrar el webhook automáticamente ──
    const webhookUrl = `${SITE_URL}/api/telegram-webhook?empresaId=${empresaId}`;
    const setWebhookResp = await axios.get(`https://api.telegram.org/bot${tokenLimpio}/setWebhook`, {
      params: { url: webhookUrl },
    });
    if (!setWebhookResp.data?.ok) {
      return res.status(400).json({ ok: false, error: 'No se pudo registrar el webhook con Telegram. Intenta de nuevo en unos minutos.' });
    }

    // ── 3. Guardar en Firestore ──
    await adminDb.collection('empresas').doc(empresaId).set({
      telegram: {
        botToken: tokenLimpio,
        botUsername: botInfo.username || null,
        botNombre: botInfo.first_name || null,
        conectadoEn: new Date(),
        activo: true,
      },
    }, { merge: true });

    return res.status(200).json({ ok: true, botUsername: botInfo.username });
  } catch (err) {
    console.error('telegram-conectar error:', err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: 'Error interno. Intenta de nuevo.' });
  }
}
