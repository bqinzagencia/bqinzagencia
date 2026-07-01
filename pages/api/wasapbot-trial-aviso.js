// pages/api/wasapbot-trial-aviso.js
// Tarea programada (Vercel Cron): avisa por WhatsApp a las empresas en
// PRUEBA GRATIS DE 24H cuando quedan ~2 horas para que su trial finalice.
// No desactiva nada aquí — solo avisa. La desactivación real (planActivo:false)
// ocurre en pages/api/whatsapp-baileys.js cuando se cumplen las 24h o se
// agota el tope de tokens del trial.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WA_SERVER = process.env.NEXT_PUBLIC_WA_SERVER || process.env.WHATSAPP_SERVER_URL || 'https://bqinzagencia-whatsapp-server-production.up.railway.app';
const WA_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || process.env.SERVER_SECRET || 'bqinzagencia2026.';

// Ventana de aviso: hasta 2h30 antes del vencimiento, para no depender de
// que el cron corra exactamente en un instante concreto.
const VENTANA_AVISO_MAX_MS = 2.5 * 60 * 60 * 1000;

export default async function handler(req, res) {
  // Vercel Cron llama por GET; protegemos igual con el secreto del propio
  // cron (header que configura Vercel) o con el SERVER_SECRET como respaldo
  // para pruebas manuales.
  const authHeader = req.headers['authorization'] || '';
  const esVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const esLlamadaManual = req.headers['x-server-secret'] === (process.env.SERVER_SECRET || 'bqinzagencia2026');
  if (!esVercelCron && !esLlamadaManual) return res.status(401).json({ error: 'No autorizado' });

  try {
    const ahora = Date.now();
    const snap = await adminDb.collection('empresas')
      .where('esPruebaGratis', '==', true)
      .where('planActivo', '==', true)
      .where('trialAvisoEnviado', '==', false)
      .get();

    let avisados = 0;
    for (const doc of snap.docs) {
      const empresa = doc.data();
      const trialHasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : (empresa.trialHasta ? new Date(empresa.trialHasta) : null);
      if (!trialHasta) continue;

      const msRestantes = trialHasta.getTime() - ahora;
      // Avisamos si quedan entre 0 y 2h30 (cubre el caso de que el cron
      // tarde en pasar por la ventana exacta).
      if (msRestantes <= 0 || msRestantes > VENTANA_AVISO_MAX_MS) continue;

      const numeroWA = empresa.whatsapp?.numero || empresa.whatsappOwner || empresa.telefonoDueno;
      if (!numeroWA) continue;

      const horasRestantes = Math.max(1, Math.round(msRestantes / (60 * 60 * 1000)));
      const mensaje = `⏳ *Tu prueba gratuita está por terminar*\n\nHola! Tu asistente de *${empresa.nombreEmpresa || 'tu negocio'}* en BQinzAgencIA seguirá activo aproximadamente ${horasRestantes}h más.\n\nPara que no se interrumpa, activa uno de nuestros planes desde tu panel cuando quieras. Sin permanencia, desde 79€/mes. 🚀`;

      try {
        await fetch(`${WA_SERVER}/enviar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-server-secret': WA_SECRET },
          body: JSON.stringify({ empresaId: doc.id, numero: numeroWA, texto: mensaje }),
        });
        await adminDb.collection('empresas').doc(doc.id).update({
          trialAvisoEnviado: true,
          trialAvisoEnviadoEn: FieldValue.serverTimestamp(),
        });
        avisados++;
      } catch (e) {
        console.error(`Aviso trial fallido para ${doc.id}:`, e.message);
      }
    }

    return res.json({ ok: true, revisadas: snap.size, avisados });
  } catch (err) {
    console.error('wasapbot-trial-aviso error:', err);
    return res.status(500).json({ error: err.message });
  }
}
