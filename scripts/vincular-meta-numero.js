// scripts/vincular-meta-numero.js
// Vincula el phone_number_id de Meta Cloud API con el registro de la empresa
// en Firestore, para que /api/meta-webhook sepa a qué empresa responder.
// Ejecutar con: node scripts/vincular-meta-numero.js
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

// ── Datos confirmados en la pantalla de Meta (Paso 2 > Registrar número) ──
const EMPRESA_ID       = '48SqTngvOTxYIIFIoXE9'; // BQinzagencIA (confirmado con check-empresa.js)
const META_PHONE_NUMBER_ID   = '1069357869602374';     // Identificador del número de teléfono (+34 674 42 19 19)
const META_WABA_ID           = '2096102897916280';     // Identificador de la cuenta de WhatsApp Business

async function main() {
  await db.collection('empresas').doc(EMPRESA_ID).set({
    whatsapp: {
      metaPhoneNumberId: META_PHONE_NUMBER_ID,
      metaWabaId: META_WABA_ID,
      proveedor: 'meta_cloud_api',
      numero: '34674421919',
    },
  }, { merge: true });

  console.log('✅ Vinculado correctamente.');
  console.log('   empresaId:', EMPRESA_ID);
  console.log('   metaPhoneNumberId:', META_PHONE_NUMBER_ID);

  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
