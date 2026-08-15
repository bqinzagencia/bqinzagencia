// lib/metaWhatsapp.js
// Envío de mensajes vía WhatsApp Cloud API (Meta oficial) — reemplaza a Baileys.
import axios from 'axios';

const API_VERSION = process.env.META_API_VERSION || 'v21.0';
const TOKEN        = process.env.META_WHATSAPP_TOKEN;

function graphUrl(phoneNumberId) {
  return `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
}

// Envía un mensaje de texto simple.
export async function enviarTextoMeta({ phoneNumberId, to, texto }) {
  if (!TOKEN) throw new Error('Falta META_WHATSAPP_TOKEN en las variables de entorno');
  if (!texto) return null;

  return axios.post(
    graphUrl(phoneNumberId),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: texto, preview_url: false },
    },
    { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, timeout: 15000 }
  );
}

// Envía una imagen por URL con caption opcional.
export async function enviarImagenMeta({ phoneNumberId, to, url, caption }) {
  if (!TOKEN) throw new Error('Falta META_WHATSAPP_TOKEN en las variables de entorno');
  if (!url) return null;

  return axios.post(
    graphUrl(phoneNumberId),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: url, caption: caption || '' },
    },
    { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, timeout: 15000 }
  );
}

// Envía texto + imágenes en orden (mismo formato { url, caption } que usa whatsapp-baileys.js).
export async function enviarRespuestaCompletaMeta({ phoneNumberId, to, texto, imagenes = [] }) {
  const errores = [];

  if (texto) {
    try { await enviarTextoMeta({ phoneNumberId, to, texto }); }
    catch (e) { errores.push(`texto: ${e.response?.data ? JSON.stringify(e.response.data) : e.message}`); }
  }

  for (const img of imagenes) {
    try { await enviarImagenMeta({ phoneNumberId, to, url: img.url, caption: img.caption }); }
    catch (e) { errores.push(`imagen(${img.url}): ${e.response?.data ? JSON.stringify(e.response.data) : e.message}`); }
  }

  if (errores.length) console.error('enviarRespuestaCompletaMeta errores:', errores);
  return { ok: errores.length === 0, errores };
}
