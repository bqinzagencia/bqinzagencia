// pages/api/track-visit.js — v2 simplificado y robusto
// Elimina las queries pesadas (visitors, rebote) para evitar timeouts.
// Solo actualiza contadores del día y registra la sesión.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  // Siempre responder 200 rápido para no bloquear al usuario
  res.status(200).json({ ok: true });

  if (req.method !== 'POST') return;

  const ua = req.headers['user-agent'] || '';
  if (/bot|crawl|spider|lighthouse|prerender|headless/i.test(ua)) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body) return;
    const { type, path, sessionId, visitorId, isNew, seconds } = body;
    if (!type || !sessionId) return;

    // Fecha en zona horaria de Madrid
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
    const dayRef = adminDb.collection('analytics').doc('visits').collection('dias').doc(fecha);
    const sessionRef = dayRef.collection('sessions').doc(sessionId);

    if (type === 'pageview') {
      const snap = await sessionRef.get();

      if (!snap.exists) {
        // Nueva sesión — crear y sumar contadores del día en paralelo
        await Promise.all([
          sessionRef.set({
            visitorId: visitorId || 'anon',
            isNew: isNew || false,
            entrada: path,
            paginasVistas: [path],
            pageviews: 1,
            tiempoTotal: 0,
            rebote: true,
            creadoEn: FieldValue.serverTimestamp(),
            actualizadoEn: FieldValue.serverTimestamp(),
          }),
          dayRef.set({
            fecha,
            sesiones:      FieldValue.increment(1),
            usuarios:      FieldValue.increment(1),
            nuevosUsuarios: isNew ? FieldValue.increment(1) : FieldValue.increment(0),
            pageviews:     FieldValue.increment(1),
          }, { merge: true }),
          // Páginas más vistas
          dayRef.collection('pages').doc((path || 'home').replace(/\//g, '_') || 'home').set(
            { path: path || '/', views: FieldValue.increment(1) }, { merge: true }
          ),
        ]);
      } else {
        // Sesión existente — solo actualizar pageviews
        const data = snap.data();
        const paginas = data.paginasVistas || [];
        if (!paginas.includes(path)) paginas.push(path);
        await Promise.all([
          sessionRef.update({
            paginasVistas: paginas,
            pageviews: FieldValue.increment(1),
            rebote: paginas.length > 1 ? false : data.rebote,
            actualizadoEn: FieldValue.serverTimestamp(),
          }),
          dayRef.update({ pageviews: FieldValue.increment(1) }),
          dayRef.collection('pages').doc((path || 'home').replace(/\//g, '_') || 'home').set(
            { path: path || '/', views: FieldValue.increment(1) }, { merge: true }
          ),
        ]);
      }
    }

    if (type === 'time' && seconds > 0 && seconds < 3600) {
      await Promise.all([
        sessionRef.update({
          tiempoTotal: FieldValue.increment(seconds),
          actualizadoEn: FieldValue.serverTimestamp(),
        }).catch(() => {}),
        dayRef.update({
          tiempoTotalSegundos: FieldValue.increment(seconds),
        }).catch(() => {}),
      ]);
    }

  } catch (err) {
    // Log silencioso — nunca afectar al usuario
    console.error('track-visit:', err.message);
  }
}
