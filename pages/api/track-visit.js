// pages/api/track-visit.js
// Recibe eventos de pageview y tiempo en página desde _app.js
// Guarda en Firestore: analytics/visits/{fecha}/sessions/{sessionId}
// Estructura diaria para consultas eficientes por rango de fechas.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // Filtrar bots por User-Agent del servidor
  const ua = req.headers['user-agent'] || '';
  if (/bot|crawl|spider|lighthouse/i.test(ua)) return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, path, sessionId, visitorId, isNew, seconds, ref } = body;
    if (!type || !sessionId) return res.status(400).end();

    const hoy   = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    const dayRef = adminDb.collection('analytics').doc('visits').collection('dias').doc(fecha);

    if (type === 'pageview') {
      const sessionRef = dayRef.collection('sessions').doc(sessionId);
      const snap = await sessionRef.get();
      if (!snap.exists) {
        // Nueva sesión del día
        await sessionRef.set({
          visitorId, isNew: isNew || false,
          entrada: path, ref: ref || '',
          paginasVistas: [path], pageviews: 1,
          tiempoTotal: 0, rebote: true,
          creadoEn: FieldValue.serverTimestamp(),
          actualizadoEn: FieldValue.serverTimestamp(),
        });
        // Contadores del día
        await dayRef.set({
          sesiones: FieldValue.increment(1),
          usuarios: FieldValue.increment(1),
          nuevosUsuarios: isNew ? FieldValue.increment(1) : FieldValue.increment(0),
          pageviews: FieldValue.increment(1),
          fecha,
        }, { merge: true });
        // Visitantes únicos por visitorId
        const visitorRef = dayRef.collection('visitors').doc(visitorId);
        const vSnap = await visitorRef.get();
        if (!vSnap.exists) {
          await visitorRef.set({ primera: fecha, sesiones: 1 });
        } else {
          await visitorRef.update({ sesiones: FieldValue.increment(1) });
          // Ya contado como usuario — decrementar el incremento de usuarios
          await dayRef.update({ usuarios: FieldValue.increment(-1) });
        }
      } else {
        // Sesión ya existente — nueva página vista
        const data = snap.data();
        const paginas = data.paginasVistas || [];
        if (!paginas.includes(path)) paginas.push(path);
        await sessionRef.update({
          paginasVistas: paginas, pageviews: FieldValue.increment(1),
          rebote: false, actualizadoEn: FieldValue.serverTimestamp(),
        });
        await dayRef.update({ pageviews: FieldValue.increment(1) });
      }
      // Páginas más vistas
      const pageRef = dayRef.collection('pages').doc(path.replace(/\//g, '_') || 'home');
      await pageRef.set({ path, views: FieldValue.increment(1) }, { merge: true });
    }

    if (type === 'time' && seconds > 0 && seconds < 3600) {
      const sessionRef = dayRef.collection('sessions').doc(sessionId);
      await sessionRef.update({
        tiempoTotal: FieldValue.increment(seconds),
        actualizadoEn: FieldValue.serverTimestamp(),
      }).catch(() => {}); // sesión puede no existir si se recarga
      await dayRef.update({ tiempoTotalSegundos: FieldValue.increment(seconds) }).catch(() => {});
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('track-visit error:', err.message);
    return res.status(200).end(); // siempre 200 para no afectar al usuario
  }
}
