// pages/api/wasapbot-verificar-codigo.js
// Verifica el codigo de 6 digitos enviado por wasapbot-enviar-codigo.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, codigo } = req.body || {};
  if (!email || !codigo) return res.status(400).json({ error: 'Faltan datos' });

  const emailKey = email.toLowerCase().trim();
  const ref = adminDb.collection('verificacionesEmail').doc(emailKey);

  try {
    const snap = await ref.get();
    if (!snap.exists) return res.status(400).json({ error: 'Solicita un código primero' });
    const data = snap.data();

    if (Date.now() > data.expiraEn) {
      return res.status(400).json({ error: 'El código expiró, solicita uno nuevo' });
    }
    if ((data.intentos || 0) >= 5) {
      return res.status(429).json({ error: 'Demasiados intentos. Solicita un código nuevo.' });
    }
    if (String(data.codigo) !== String(codigo).trim()) {
      await ref.update({ intentos: FieldValue.increment(1) });
      return res.status(400).json({ error: 'Código incorrecto' });
    }

    await ref.update({ verificado: true, verificadoEn: Date.now() });
    return res.json({ ok: true });
  } catch (e) {
    console.error('wasapbot-verificar-codigo:', e.message);
    return res.status(500).json({ error: 'Error al verificar el código' });
  }
}
