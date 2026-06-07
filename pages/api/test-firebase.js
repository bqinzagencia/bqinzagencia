// pages/api/test-firebase.js
// Endpoint de diagnostico — ELIMINAR despues de probar

import * as admin from 'firebase-admin';

export default async function handler(req, res) {
  const results = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NO DEFINIDO',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? process.env.FIREBASE_CLIENT_EMAIL.substring(0, 30) + '...' : 'NO DEFINIDO',
    privateKeyStart: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 40) : 'NO DEFINIDO',
    adminApps: admin.apps.length,
    firebaseOk: false,
    error: null,
  };

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
        }),
      });
    }
    const db = admin.firestore();
    await db.collection('test').doc('ping').set({ ping: new Date().toISOString() });
    results.firebaseOk = true;
  } catch (e) {
    results.error = e.message;
  }

  return res.status(200).json(results);
}
