// scripts/check-empresa.js
// Ejecutar con: node scripts/check-empresa.js
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
const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;

async function main() {
  // 1. Datos de la empresa
  const emp = await db.collection('empresas').doc(empresaId).get();
  const d = emp.data();
  console.log('\n=== EMPRESA ===');
  console.log('nombreEmpresa:', d.nombreEmpresa);
  console.log('planActivo:', d.planActivo);
  console.log('planWasapbot:', d.planWasapbot);
  console.log('plan:', d.plan);
  console.log('producto:', d.producto);
  console.log('esPruebaGratis:', d.esPruebaGratis);
  console.log('pruebaGratisFinalizada:', d.pruebaGratisFinalizada);
  console.log('tokensUsados:', d.tokensUsados);
  console.log('telefonoDueno:', d.telefonoDueno);

  // 2. Tokens del mes actual
  const tokDoc = await db.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`).get();
  console.log('\n=== TOKENS MES', mesKey, '===');
  if (tokDoc.exists) {
    console.log(tokDoc.data());
  } else {
    console.log('No existe documento de tokens para este mes');
  }

  // 3. Tokens mes anterior (junio)
  const tokJun = await db.collection('wasapbot_tokens').doc(`${empresaId}_2026-06`).get();
  console.log('\n=== TOKENS JUNIO 2026 ===');
  if (tokJun.exists) {
    console.log(tokJun.data());
  } else {
    console.log('No existe');
  }

  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
