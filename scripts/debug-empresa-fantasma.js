// scripts/debug-empresa-fantasma.js
// Diagnostico de SOLO LECTURA: busca empresas en Firestore sin "nombreEmpresa"
// (las que /admin/metricas muestra como "Sin nombre"), imprime TODOS sus campos
// y revisa si algun usuario o pago las referencia (para saber quien/que las crea).
//
// No modifica nada en Firestore.
//
// Uso (desde la raiz del proyecto, en CMD):
//   node scripts/debug-empresa-fantasma.js

const fs = require('fs');
const path = require('path');

// --- Cargar variables de entorno desde .env.local manualmente (sin dotenv) ---
function cargarEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('No se encontro .env.local en la raiz del proyecto:', envPath);
    process.exit(1);
  }
  const contenido = fs.readFileSync(envPath, 'utf8');
  for (const linea of contenido.split('\n')) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const key = l.slice(0, idx).trim();
    let val = l.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
cargarEnvLocal();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: cert({
    projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

function limpiar(data) {
  // Convierte Timestamps de Firestore a string ISO para que se vean legibles
  return JSON.parse(JSON.stringify(data, (_k, v) => {
    if (v && typeof v.toDate === 'function') return v.toDate().toISOString();
    return v;
  }));
}

async function main() {
  console.log('Proyecto Firebase:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Revisando coleccion "empresas"...\n');

  const snap = await db.collection('empresas').get();
  console.log(`Total documentos en "empresas": ${snap.size}\n`);

  const sospechosas = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const nombre = data.nombreEmpresa;
    if (!nombre || !String(nombre).trim()) {
      sospechosas.push({ id: doc.id, data });
    }
  }

  if (sospechosas.length === 0) {
    console.log('✅ No se encontro ninguna empresa sin "nombreEmpresa". El doc fantasma no existe ahorita.');
    return;
  }

  console.log(`⚠️ Encontradas ${sospechosas.length} empresa(s) SIN nombreEmpresa (apareceran como "Sin nombre"):\n`);

  for (const { id, data } of sospechosas) {
    console.log('───────────────────────────────────────────');
    console.log('ID del documento:', id);
    console.log('URL Firestore: https://console.firebase.google.com/project/' + process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '/firestore/data/~2Fempresas~2F' + id);
    console.log('Campos:', JSON.stringify(limpiar(data), null, 2));

    // Subcolecciones presentes (config, agentes, conversaciones, etc.)
    const subcols = await doc.ref.listCollections();
    console.log('Subcolecciones:', subcols.map(c => c.id).join(', ') || '(ninguna)');

    // ¿Algun usuario tiene esta empresa como activa o en su lista?
    const porActiva = await db.collection('usuarios').where('empresaActiva', '==', id).get();
    if (!porActiva.empty) {
      console.log('→ Referenciada como empresaActiva por usuarios:', porActiva.docs.map(d => d.id).join(', '));
    }
    const porArray = await db.collection('usuarios').where('empresas', 'array-contains', id).get();
    if (!porArray.empty) {
      console.log('→ Referenciada en array "empresas" por usuarios:', porArray.docs.map(d => d.id).join(', '));
    }
    const porWasapbot = await db.collection('usuarios').where('wasapbotEmpresaId', '==', id).get();
    if (!porWasapbot.empty) {
      console.log('→ Referenciada como wasapbotEmpresaId por usuarios:', porWasapbot.docs.map(d => d.id).join(', '));
    }

    // ¿Hay pagos (Wompi) asociados a este empresaId?
    const pagos = await db.collection('pagos').where('empresaId', '==', id).get();
    if (!pagos.empty) {
      console.log('→ Pagos (coleccion "pagos") relacionados:', pagos.docs.map(d => d.id).join(', '));
    }

    console.log('');
  }

  console.log('───────────────────────────────────────────');
  console.log('Copia y pega toda esta salida para que Claude identifique de donde sale.');
}

main().then(() => process.exit(0)).catch(e => { console.error('Error:', e); process.exit(1); });
