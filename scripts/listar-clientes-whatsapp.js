// scripts/listar-clientes-whatsapp.js
// Lista todas las empresas con WhatsApp conectado (vía Baileys/Railway),
// para saber si hay clientes activos antes de apagar el servidor de Railway.
// Ejecutar con: node scripts/listar-clientes-whatsapp.js
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
const PROPIA = '48SqTngvOTxYIIFIoXE9'; // bqinzagencia (ya migrada a Meta)

async function main() {
  const snap = await db.collection('empresas').get();
  console.log(`\nTotal empresas en la base de datos: ${snap.size}\n`);

  let conWhatsapp = 0;
  snap.forEach(doc => {
    const d = doc.data();
    const numero = d.whatsapp?.numero;
    const conectado = d.whatsapp?.conectado;
    const esPropia = doc.id === PROPIA;

    if (numero || conectado) {
      conWhatsapp++;
      console.log(`- [${doc.id}] ${d.nombreEmpresa || '(sin nombre)'} ${esPropia ? '⭐ (TU PROPIA AGENCIA, ya migrada)' : ''}`);
      console.log(`    numero: ${numero || '—'} | conectado: ${conectado} | plan: ${d.plan || d.planWasapbot || '—'} | planActivo: ${d.planActivo}`);
    }
  });

  console.log(`\n=== Total con WhatsApp conectado: ${conWhatsapp} (incluyendo tu propia agencia) ===\n`);
  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
