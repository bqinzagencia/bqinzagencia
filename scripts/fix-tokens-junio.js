// scripts/fix-tokens-junio.js
// Resetea junio a 0 para que no interfiera
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const empresaId = '48SqTngvOTxYIIFIoXE9';

async function main() {
  // Resetear junio
  await db.collection('wasapbot_tokens').doc(`${empresaId}_2026-06`).set({
    usado: 0, empresaId, mes: '2026-06',
    resetAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✅ Junio reseteado a 0');

  // Confirmar julio
  const jul = await db.collection('wasapbot_tokens').doc(`${empresaId}_2026-07`).get();
  console.log('✅ Julio actual:', jul.data());

  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
