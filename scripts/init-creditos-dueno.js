// scripts/init-creditos-dueno.js
// Inicializa tokensLimiteDueno y tokensUsadosDueno en la empresa de la agencia
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
  await db.collection('empresas').doc(empresaId).update({
    tokensLimiteDueno:  50000,  // tope inicial — puedes cambiarlo desde métricas
    tokensUsadosDueno:  0,      // contador separado del dueño
    tokensLimiteAgencia: 50000, // alias para compatibilidad
  });
  console.log('✅ Campos inicializados:');
  console.log('   tokensLimiteDueno:  50.000');
  console.log('   tokensUsadosDueno:  0');
  console.log('\nAhora desde métricas puedes subir el tope cuando quieras.');
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
