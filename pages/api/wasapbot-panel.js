// pages/api/wasapbot-panel.js
// Retorna datos del panel del cliente WasapBot
// Nota: este endpoint es publico (no requiere auth) ya que el panel de WasapBot
//       es accesible via URL con ID. Solo expone empresas con producto='wasapbot'.
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id requerido' });

  try {
    const [empSnap, convSnap, tokenSnap, conocimientoSnap] = await Promise.all([
      adminDb.collection('empresas').doc(id).get(),
      adminDb.collection('empresas').doc(id).collection('conversaciones').orderBy('ultimoMensaje','desc').limit(20).get().catch(()=>null),
      adminDb.collection('wasapbot_tokens').doc(id).get().catch(()=>null),
      adminDb.collection('empresas').doc(id).collection('config').doc('conocimiento').get().catch(()=>null),
    ]);

    if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });

    const empData = empSnap.data();

    // Seguridad: solo exponer empresas registradas via WasapBot
    if (empData.producto !== 'wasapbot') {
      return res.status(403).json({ error: 'Acceso no permitido' });
    }

    const empresa      = { id, ...empData };
    const convs        = convSnap ? convSnap.docs.map(d=>({ id:d.id, ...d.data() })) : [];
    const conocimiento = conocimientoSnap?.exists ? conocimientoSnap.data() : {};

    // Tokens — si no hay doc, valores por defecto plan trial
    const tokenData = tokenSnap?.exists ? tokenSnap.data() : { usados:0, total:15000, plan:'wasapbot' };

    return res.json({ ok:true, empresa, convs, tokens:tokenData, conocimiento });
  } catch (err) {
    console.error('wasapbot-panel:', err);
    return res.status(500).json({ error: err.message });
  }
}
