// pages/api/contacto-empresa.js
// Recibe el formulario de contacto de la web pública de cada cliente
import * as admin from 'firebase-admin';

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId, nombre, telefono, mensaje } = req.body;
  if (!empresaId || !nombre || !telefono) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const db = getDb();
    // Guardar lead en Firestore
    await db.collection('empresas').doc(empresaId).collection('leads').add({
      nombre, telefono, mensaje: mensaje || '',
      canal: 'Web', estado: 'nuevo',
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
    // También guardar en CRM como contacto
    await db.collection('empresas').doc(empresaId).collection('clientes').add({
      nombre, telefono, notas: mensaje || '',
      origen: 'Web pública', estado: 'prospecto',
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[contacto-empresa]', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
