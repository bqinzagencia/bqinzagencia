// lib/firebaseAdmin.js
// Firebase Admin SDK para uso en API routes (server-side)
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  // Intentar con FIREBASE_SERVICE_ACCOUNT primero (JSON completo)
  // Si no, usar las variables individuales
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = cert(serviceAccount);
  } else {
    credential = cert({
      type: 'service_account',
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    });
  }

  return initializeApp({ credential });
}

export const adminApp = getAdminApp();
export const db = getFirestore(adminApp);
