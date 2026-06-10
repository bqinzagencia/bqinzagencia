// lib/firebaseAdmin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Reemplazar \n literales por saltos de linea reales antes de parsear
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT
        .replace(/\\n/g, '\n');
      const sa = JSON.parse(raw);
      // Asegurar que private_key tenga saltos de linea reales
      if (sa.private_key) {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      credential = cert(sa);
    } catch (e) {
      console.error('Error parseando FIREBASE_SERVICE_ACCOUNT:', e.message);
      // Fallback a variables individuales
      credential = cert({
        projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      });
    }
  } else {
    credential = cert({
      projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    });
  }

  return initializeApp({ credential });
}

export const adminApp = getAdminApp();
export const db = getFirestore(adminApp);
