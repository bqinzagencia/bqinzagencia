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
  onAuthStateChanged, sendPasswordResetEmail
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

export async function updateEmpresa(uid, datos) {
  await updateDoc(doc(db, 'empresas', uid), datos);
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

// ─── CONVERSACIONES ───────────────────────────────────────
export async function getConversaciones(empresaId, limite = 50) {
  const snap = await getDocs(
    query(
      collection(db, 'empresas', empresaId, 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'),
      limit(limite)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function escucharConversaciones(empresaId, cb) {
  return onSnapshot(
    query(
      collection(db, 'empresas', empresaId, 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'),
      limit(30)
    ),
    (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
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
