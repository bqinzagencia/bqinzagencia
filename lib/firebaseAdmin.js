// lib/firebaseAdmin.js
import admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.apps[0];

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(sa);
    } catch (e) {
      console.error('[FirebaseAdmin] Error parseando FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  if (!credential && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  // ── Fallback: si no hay credenciales Admin, usar Application Default ──
  // Esto evita que el build de Vercel falle; las páginas devolverán notFound
  if (!credential) {
    console.warn('[FirebaseAdmin] Sin credenciales Admin — usando modo degradado');
    try {
      return admin.initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'bqinzagencia' });
    } catch {
      return admin.apps[0];
    }
  }

  return admin.initializeApp({ credential });
}

try {
  getFirebaseAdmin();
} catch (e) {
  console.warn('[FirebaseAdmin] No se pudo inicializar:', e.message);
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export default admin;
