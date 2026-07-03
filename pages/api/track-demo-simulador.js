// pages/api/track-demo-simulador.js — métricas del simulador demo público (landing)
// Mismo patrón de privacidad que track-visit.js: sin datos personales, solo contadores.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  res.status(200).json({ ok: true });

  if (req.method !== 'POST') return;

  const ua = req.headers['user-agent'] || '';
  if (/bot|crawl|spider|lighthouse|prerender|headless/i.test(ua)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body) return;
    const { evento, industria, pregunta, tipo } = body;
    if (!evento) return;

    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const dayRef = adminDb.collection('analytics').doc('demoSimulador').collection('dias').doc(fecha);

    const eventosValidos = ['apertura', 'industria_seleccionada', 'pregunta_rapida', 'cierre_confirmado', 'cta_registro_visto', 'cta_click_registro'];
    if (!eventosValidos.includes(evento)) return;

    const updates = { fecha, [evento]: FieldValue.increment(1) };
    await dayRef.set(updates, { merge: true });

    if (industria) {
      await dayRef.collection('porIndustria').doc(industria).set({
        industria, [evento]: FieldValue.increment(1),
      }, { merge: true });
    }
  } catch (err) {
    console.error('track-demo-simulador:', err.message);
  }
}
