// scripts/reset-tokens-sin-nombre.js
// Ejecutar con: node scripts/reset-tokens-sin-nombre.js
//
// Busca la empresa "Sin nombre" (la de la agencia) y resetea sus tokens del mes actual.

const path = require('path');

// Cargar variables de entorno del proyecto
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const admin = require('firebase-admin');

// Inicializar Firebase Admin
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

async function main() {
  const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
  console.log('Mes actual:', mesKey);

  // Buscar empresa "Sin nombre" o la que sea propiedad de bqinzagencia
  const snap = await db.collection('empresas')
    .where('producto', '==', 'wasapbot')
    .get();

  const empresas = snap.docs.map(d => ({
    id: d.id,
    nombre: d.data().nombreEmpresa || 'Sin nombre',
    plan: d.data().planWasapbot || d.data().plan,
    email: d.data().email || '',
    tokensUsados: d.data().tokensUsados || 0,
  }));

  console.log('\n=== Empresas WasapBot ===');
  empresas.forEach((e, i) => console.log(`${i+1}. [${e.id}] ${e.nombre} — Plan: ${e.plan} — Email: ${e.email}`));

  // Buscar "Sin nombre" o la que tenga email de Oscar
  const sinNombre = empresas.find(e =>
    !e.nombre || e.nombre === 'Sin nombre' || e.email === 'obqinz@gmail.com' || e.email === 'oborreroquinonez@gmail.com'
  );

  if (!sinNombre) {
    console.log('\n⚠️  No se encontró "Sin nombre". Reseteando todas las empresas Pro...');
    const pros = empresas.filter(e => e.plan === 'pro');
    for (const emp of pros) {
      const docId = `${emp.id}_${mesKey}`;
      await db.collection('wasapbot_tokens').doc(docId).set({
        usado: 0, empresaId: emp.id, mes: mesKey, resetAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✓ Reseteado: ${emp.nombre} [${emp.id}]`);
    }
    return;
  }

  console.log(`\n→ Reseteando tokens de: ${sinNombre.nombre} [${sinNombre.id}]`);
  const docId = `${sinNombre.id}_${mesKey}`;
  await db.collection('wasapbot_tokens').doc(docId).set({
    usado: 0,
    empresaId: sinNombre.id,
    mes: mesKey,
    resetAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Tokens reseteados correctamente para el mes ${mesKey}`);
  console.log(`   Documento: wasapbot_tokens/${docId}`);

  // También resetear el campo tokensUsados del documento empresa
  await db.collection('empresas').doc(sinNombre.id).update({
    tokensUsados: 0,
  });
  console.log(`✅ Campo tokensUsados en empresas/${sinNombre.id} reseteado a 0`);

  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
