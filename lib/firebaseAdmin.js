// lib/firebaseAdmin.js
// Firebase Admin SDK para API routes de Next.js / Vercel

import admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.apps[0];

  let credential;

  // Opción 1: JSON completo en una variable (Railway/Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(sa);
    } catch (e) {
      console.error('[FirebaseAdmin] Error parseando FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  // Opción 2: Variables individuales (Vercel)
  if (!credential && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID     || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  if (!credential) {
    throw new Error('Firebase Admin: no se encontraron credenciales. Configura FIREBASE_SERVICE_ACCOUNT o FIREBASE_PRIVATE_KEY en Vercel.');
  }

  return admin.initializeApp({ credential });
}

// Inicializar
getFirebaseAdmin();

export const db = admin.firestore();
export default admin;
