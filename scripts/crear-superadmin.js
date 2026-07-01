// scripts/crear-superadmin.js
// Script de UNA SOLA EJECUCIÓN: crea el documento admins/{uid} necesario
// para que las reglas de seguridad de Firestore (firestore.rules) reconozcan
// a esta cuenta como superadmin al navegar el panel desde el cliente.
//
// Ejecutar una vez con:  node scripts/crear-superadmin.js
const fs = require('fs');
const path = require('path');

function cargarEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  // Normalizamos saltos de línea de Windows (\r\n) a \n antes de partir,
  // por si ese \r residual estaba rompiendo la detección de fin de línea.
  const contenido = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
  contenido.split('\n').forEach(linea => {
    linea = linea.trim();
    if (!linea || linea.startsWith('#')) return;
    const idx = linea.indexOf('=');
    if (idx === -1) return;
    const clave = linea.slice(0, idx).trim();
    let valor   = linea.slice(idx + 1).trim();
    if (valor.startsWith('"') && valor.endsWith('"')) valor = valor.slice(1, -1);
    process.env[clave] = valor;
  });
}
cargarEnvLocal();

// ── DEBUG temporal: confirmar qué se leyó realmente ──
console.log('DEBUG projectId:', JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
console.log('DEBUG clientEmail:', JSON.stringify(process.env.FIREBASE_CLIENT_EMAIL));
console.log('DEBUG privateKey existe:', !!process.env.FIREBASE_PRIVATE_KEY);
console.log('DEBUG privateKey primeros 40 chars:', JSON.stringify((process.env.FIREBASE_PRIVATE_KEY||'').slice(0,40)));
console.log('DEBUG privateKey longitud:', (process.env.FIREBASE_PRIVATE_KEY||'').length);

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
console.log('DEBUG privateKey tras reemplazo, primeros 40 chars:', JSON.stringify(privateKey.slice(0,40)));

if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ Faltan variables de entorno.');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});
const db = getFirestore(app);

const UID_SUPERADMIN = 'mSSjc9utiZVHZfLNN57HRLeyDd92'; // Óscar (obqinz@gmail.com)

async function main() {
  await db.collection('admins').doc(UID_SUPERADMIN).set({
    rol: 'superadmin',
    email: 'obqinz@gmail.com',
    creadoEn: new Date(),
  });
  console.log('✅ Documento admins/' + UID_SUPERADMIN + ' creado correctamente.');
  process.exit(0);
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
