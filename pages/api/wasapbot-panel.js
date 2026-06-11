// pages/api/wasapbot-panel.js
// Retorna datos del panel del cliente WasapBot
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id requerido' });

  try {
    const [empSnap, convSnap, tokenSnap] = await Promise.all([
      adminDb.collection('empresas').doc(id).get(),
      adminDb.collection('empresas').doc(id).collection('conversaciones').orderBy('ultimoMensaje','desc').limit(20).get().catch(()=>null),
      adminDb.collection('wasapbot_tokens').doc(id).get().catch(()=>null),
    ]);

    if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });

    const empresa = { id, ...empSnap.data() };
    const convs   = convSnap ? convSnap.docs.map(d=>({ id:d.id, ...d.data() })) : [];

    // Tokens — si no hay doc, valores por defecto plan basico
    const tokenData = tokenSnap?.exists ? tokenSnap.data() : { usados:0, total:50000, plan:'basico' };

    return res.json({ ok:true, empresa, convs, tokens:tokenData });
  } catch (err) {
    console.error('wasapbot-panel:', err);
    return res.status(500).json({ error: err.message });
  }
}
