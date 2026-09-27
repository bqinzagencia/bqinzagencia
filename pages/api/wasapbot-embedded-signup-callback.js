// pages/api/wasapbot-embedded-signup-callback.js
// Recibe el "code", phone_number_id y waba_id que devuelve el flujo de
// WhatsApp Embedded Signup (botón "Conectar con Facebook" en /wasapbot/activar).
// 1. Intercambia el code por un token de acceso (token de sistema, 60 días).
// 2. Suscribe la app a los webhooks de la WABA del cliente (para que
//    meta-webhook.js empiece a recibir sus mensajes).
// 3. Registra el número de teléfono en la Cloud API (obligatorio una vez).
// 4. Guarda phone_number_id, waba_id y el token en Firestore, vinculado a
//    la empresa — con esto el cliente queda 100% conectado sin intervención manual.
import axios from 'axios';
import { db as adminDb } from '../../lib/firebaseAdmin';

const META_APP_ID     = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const GRAPH = 'https://graph.facebook.com/v22.0';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { empresaId, code, phoneNumberId, wabaId } = req.body || {};

    if (!empresaId || !code || !phoneNumberId || !wabaId) {
      return res.status(400).json({ ok: false, error: 'Faltan datos del flujo de Embedded Signup' });
    }

    // 1. Intercambiar el code por un token de acceso
    const tokenResp = await axios.get(`${GRAPH}/oauth/access_token`, {
      params: {
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        code,
      },
    });
    const accessToken = tokenResp.data?.access_token;
    if (!accessToken) throw new Error('Meta no devolvió un token de acceso');

    // 2. Suscribir la app a los webhooks de esta WABA del cliente
    await axios.post(
      `${GRAPH}/${wabaId}/subscribed_apps`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // 3. Registrar el número en la Cloud API (necesario la primera vez)
    // Un PIN de 6 dígitos que el propio sistema define para este número.
    const pinRegistro = String(Math.floor(100000 + Math.random() * 900000));
    await axios.post(
      `${GRAPH}/${phoneNumberId}/register`,
      { messaging_product: 'whatsapp', pin: pinRegistro },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ).catch(err => {
      // Si el número ya estaba registrado, Meta devuelve error — no es bloqueante
      console.warn('wasapbot-embedded-signup-callback: registro de número', err.response?.data || err.message);
    });

    // 4. Guardar todo en Firestore, vinculado a la empresa
    await adminDb.collection('empresas').doc(empresaId).set({
      whatsapp: {
        estadoConexion: 'conectado',
        metaPhoneNumberId: phoneNumberId,
        metaWabaId: wabaId,
        metaAccessToken: accessToken, // token de sistema, ~60 días
        conectadoEn: new Date(),
      },
    }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error('wasapbot-embedded-signup-callback:', err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: err.response?.data?.error?.message || err.message });
  }
}
