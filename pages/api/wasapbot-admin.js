// pages/api/wasapbot-admin.js
// API para control de clientes WasapBot desde el panel admin
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:15000, prueba_5k:15000 };

export default async function handler(req, res) {
  const secret = req.headers['x-admin-secret'];
  if (secret !== 'borrero_nexoia_admin_2026' && secret !== SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // GET — listar clientes WasapBot
  if (req.method === 'GET') {
    try {
      const snap = await adminDb.collection('empresas')
        .where('producto', '==', 'wasapbot').get();

      const clientes = snap.docs.map(d => {
        const data = d.data();
        const planTokens = (PLAN_TOKENS[data.planWasapbot || data.plan] || 50000) + (data.tokensExtra || 0);
        const tokensUsados = data.tokensUsados || 0;
        return {
          id:           d.id,
          nombre:       data.nombreEmpresa || 'Sin nombre',
          industria:    data.industria || 'otro',
          plan:         data.planWasapbot || data.plan || 'basico',
          tokensUsados,
          tokensExtra:  data.tokensExtra || 0,
          tokensPlan:   planTokens,
          pctTokens:    Math.round(tokensUsados / planTokens * 100),
          conversaciones: data.conversaciones || 0,
          whatsappActivo: data.whatsapp?.status === 'connected',
          ultimaActividad: data.ultimaActividad || null,
          creadoEn:     data.creadoEn || null,
          email:        data.email || '',
        };
      });

      // Ordenar por % de tokens usado
      clientes.sort((a, b) => b.pctTokens - a.pctTokens);

      return res.json({ ok: true, clientes });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — ampliar tokens o cambiar plan
  if (req.method === 'POST') {
    const { accion, empresaId, tokens, plan } = req.body;

    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      if (accion === 'ampliar') {
        const extra = parseInt(tokens) || 0;
        await adminDb.collection('empresas').doc(empresaId).update({
          tokensExtra: FieldValue.increment(extra),
          tokensAmpliadoEn: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true, mensaje: `${extra} tokens adicionales agregados` });
      }

      if (accion === 'cambiar_plan') {
        if (!['basico','estandar','pro'].includes(plan)) {
          return res.status(400).json({ error: 'Plan invalido' });
        }
        await adminDb.collection('empresas').doc(empresaId).update({
          planWasapbot: plan,
          planActivo:   true,
          planCambiadoEn: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true, mensaje: `Plan cambiado a ${plan}` });
      }

      if (accion === 'reset_tokens') {
        await adminDb.collection('empresas').doc(empresaId).update({
          tokensUsados:  0,
          tokensExtra:   0,
          resetTokensEn: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true, mensaje: 'Tokens reseteados' });
      }

      return res.status(400).json({ error: 'Accion no reconocida' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
