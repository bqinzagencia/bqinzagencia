// pages/api/admin-actualizar-prompt-agente.js
// Actualiza el prompt de un agente ya creado, sin tocar el resto de su configuracion.

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, agenteId, prompt } = req.body;
  if (!empresaId || !prompt) return res.status(400).json({ error: 'Faltan empresaId o prompt' });

  try {
    // 1. Actualizar el documento del agente (si se pasa agenteId)
    if (agenteId) {
      await adminDb.collection('empresas').doc(empresaId)
        .collection('agentes').doc(agenteId)
        .update({ prompt });
    }

    // 2. Actualizar tambien promptGenerado en config/conocimiento,
    //    que es lo que realmente lee whatsapp-baileys.js junto con
    //    los demas campos de info/servicios/horarios.
    await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento')
      .set({ promptGenerado: prompt, actualizadoEn: FieldValue.serverTimestamp() }, { merge: true });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
