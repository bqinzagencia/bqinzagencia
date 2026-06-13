// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, sendPasswordResetEmail,
  GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─── AUTH HELPERS ────────────────────────────────────────
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const isNew = result._tokenResponse?.isNewUser;
  if (isNew) {
    const { uid, email, displayName } = result.user;
    await setDoc(doc(db, 'empresas', uid), {
      email,
      nombreEmpresa: displayName || 'Mi Centro',
      telefono: '',
      ciudad: '',
      industria: 'estetica',
      plan: 'emprendedor',
      planActivo: true,
      trialHasta: new Date(Date.now() + 14 * 86400000),
      creadoEn: serverTimestamp(),
      agentesActivos: 0,
      conversacionesHoy: 0,
      leadsTotal: 0,
    });
  }
  return result;
};

// ─── EMPRESAS ────────────────────────────────────────────
export async function crearEmpresa(uid, datos) {
  await setDoc(doc(db, 'empresas', uid), {
    ...datos,
    plan: 'emprendedor',
    planActivo: true,
    trialHasta: new Date(Date.now() + 14 * 86400000),
    creadoEn: serverTimestamp(),
    agentesActivos: 0,
    conversacionesHoy: 0,
    leadsTotal: 0,
  });
}

export async function getEmpresa(uid) {
  const snap = await getDoc(doc(db, 'empresas', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── FIX: setDoc con merge:true funciona aunque el doc no exista todavía ──
export async function updateEmpresa(uid, datos) {
  await setDoc(doc(db, 'empresas', uid), {
    ...datos,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getTodasEmpresas() {
  const snap = await getDocs(
    query(collection(db, 'empresas'), orderBy('creadoEn', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── AGENTES ─────────────────────────────────────────────
export async function getAgentes(empresaId) {
  const snap = await getDocs(collection(db, 'empresas', empresaId, 'agentes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function crearAgente(empresaId, datos) {
  return await addDoc(collection(db, 'empresas', empresaId, 'agentes'), {
    ...datos,
    activo: true,
    conversaciones: 0,
    creadoEn: serverTimestamp(),
  });
}

export async function updateAgente(empresaId, agenteId, datos) {
  await updateDoc(doc(db, 'empresas', empresaId, 'agentes', agenteId), datos);
}

export async function deleteAgente(empresaId, agenteId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'agentes', agenteId));
}

// ─── CONTACTOS / CRM ─────────────────────────────────────
export async function getContactos(empresaId) {
  const snap = await getDocs(
    query(
      collection(db, 'empresas', empresaId, 'contactos'),
      orderBy('creadoEn', 'desc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function crearContacto(empresaId, datos) {
  return await addDoc(collection(db, 'empresas', empresaId, 'contactos'), {
    ...datos,
    creadoEn: serverTimestamp(),
    estado: 'nuevo',
  });
}

export async function updateContacto(empresaId, contactoId, datos) {
  await updateDoc(
    doc(db, 'empresas', empresaId, 'contactos', contactoId),
    datos
  );
}

// ─── CONVERSACIONES (unifica WhatsApp + web) ──────────────────────────────────
export async function getConversaciones(empresaId, limite = 50) {
  // Leer de ambas colecciones y unificar
  const [snap1, snap2] = await Promise.all([
    getDocs(query(collection(db, 'empresas', empresaId, 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'), limit(limite))),
    getDocs(query(collection(db, 'empresas', empresaId, 'conversaciones_wa'),
      orderBy('ultimaActividad', 'desc'), limit(limite))),
  ]);

  const conv1 = snap1.docs.map(d => ({ id: d.id, canal: 'web', ...d.data() }));
  const conv2 = snap2.docs.map(d => ({
    id: d.id,
    canal: 'whatsapp',
    nombreCliente: d.data().nombre || d.data().waId || 'WhatsApp',
    ultimoTexto: d.data().ultimoMensaje || '',
    ultimoMensaje: d.data().ultimaActividad || null,
    waId: d.data().waId || '',
    ...d.data(),
  }));

  // Unir y ordenar por fecha
  return [...conv1, ...conv2]
    .sort((a, b) => {
      const ta = a.ultimoMensaje?.toMillis ? a.ultimoMensaje.toMillis() :
                 a.ultimaActividad?.toMillis ? a.ultimaActividad.toMillis() : 0;
      const tb = b.ultimoMensaje?.toMillis ? b.ultimoMensaje.toMillis() :
                 b.ultimaActividad?.toMillis ? b.ultimaActividad.toMillis() : 0;
      return tb - ta;
    })
    .slice(0, limite);
}

export function escucharConversaciones(empresaId, cb) {
  let conv1 = [];
  let conv2 = [];

  const merge = () => {
    const merged = [...conv1, ...conv2].sort((a, b) => {
      const ta = a.ultimoMensaje?.toMillis?.() || a.ultimaActividad?.toMillis?.() || 0;
      const tb = b.ultimoMensaje?.toMillis?.() || b.ultimaActividad?.toMillis?.() || 0;
      return tb - ta;
    });
    cb(merged);
  };

  const unsub1 = onSnapshot(
    query(collection(db, 'empresas', empresaId, 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'), limit(30)),
    snap => { conv1 = snap.docs.map(d => ({ id: d.id, canal: 'web', ...d.data() })); merge(); }
  );

  const unsub2 = onSnapshot(
    query(collection(db, 'empresas', empresaId, 'conversaciones_wa'),
      orderBy('ultimaActividad', 'desc'), limit(30)),
    snap => {
      conv2 = snap.docs.map(d => ({
        id: 'wa_' + d.id,
        canal: 'whatsapp',
        nombreCliente: d.data().nombre || d.data().waId || 'WhatsApp',
        ultimoTexto: d.data().ultimoMensaje || '',
        ultimoMensaje: d.data().ultimaActividad || null,
        waId: d.data().waId || d.id,
        ...d.data(),
      }));
      merge();
    }
  );

  return () => { unsub1(); unsub2(); };
}

// ─── CITAS / AGENDA ───────────────────────────────────────
export async function getCitas(empresaId) {
  const snap = await getDocs(
    query(
      collection(db, 'empresas', empresaId, 'citas'),
      orderBy('fechaHora', 'asc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function crearCita(empresaId, datos) {
  return await addDoc(collection(db, 'empresas', empresaId, 'citas'), {
    ...datos,
    estado: 'confirmada',
    creadoEn: serverTimestamp(),
  });
}

export async function updateCita(empresaId, citaId, datos) {
  await updateDoc(doc(db, 'empresas', empresaId, 'citas', citaId), datos);
}

// ─── SUPER ADMIN ──────────────────────────────────────────
export async function isSuperAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() && snap.data().rol === 'superadmin';
}
