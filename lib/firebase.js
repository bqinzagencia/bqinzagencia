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
  GoogleAuthProvider, GithubAuthProvider,
  signInWithPopup, OAuthProvider
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

// ─── SOCIAL AUTH ─────────────────────────────────────────
export const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const loginWithGithub = () => signInWithPopup(auth, new GithubAuthProvider());
export const loginWithMicrosoft = () => signInWithPopup(auth, new OAuthProvider('microsoft.com'));

// ─── EMPRESAS (multi-empresa por usuario) ───────────────────────────────────
// Estructura: empresas/{empresaId} con campo ownerUid
// usuarios/{uid}.empresas = [empresaId1, empresaId2, ...]
// usuarios/{uid}.empresaActiva = empresaId

export async function crearEmpresa(uid, datos) {
  // Generar ID unico para la empresa
  const empresaRef = doc(collection(db, 'empresas'));
  const empresaId  = empresaRef.id;

  // Crear documento de empresa
  await setDoc(empresaRef, {
    ...datos,
    ownerUid: uid,
    plan: 'emprendedor',
    planActivo: true,
    trialHasta: new Date(Date.now() + 14 * 86400000),
    creadoEn: serverTimestamp(),
    agentesActivos: 0,
    conversacionesHoy: 0,
    leadsTotal: 0,
  });

  // Actualizar perfil del usuario
  const userRef = doc(db, 'usuarios', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const empresasActuales = userSnap.data().empresas || [];
    await updateDoc(userRef, {
      empresas: [...empresasActuales, empresaId],
      empresaActiva: empresaId,
    });
  } else {
    await setDoc(userRef, {
      uid,
      email: datos.email,
      empresas: [empresaId],
      empresaActiva: empresaId,
      creadoEn: serverTimestamp(),
    });
  }

  return empresaId;
}

export async function getEmpresa(empresaId) {
  if (!empresaId) return null;
  const snap = await getDoc(doc(db, 'empresas', empresaId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getEmpresaActiva(uid) {
  // Obtener la empresa activa del usuario
  const userSnap = await getDoc(doc(db, 'usuarios', uid));
  if (!userSnap.exists()) {
    // Fallback: buscar empresa legacy con uid como ID (compatibilidad)
    const legacySnap = await getDoc(doc(db, 'empresas', uid));
    if (legacySnap.exists()) return { id: legacySnap.id, ...legacySnap.data() };
    return null;
  }
  const userData = userSnap.data();
  const empresaId = userData.empresaActiva;
  if (!empresaId) return null;
  return getEmpresa(empresaId);
}

export async function getEmpresasDeUsuario(uid) {
  const userSnap = await getDoc(doc(db, 'usuarios', uid));
  if (!userSnap.exists()) {
    // Fallback legacy
    const legacySnap = await getDoc(doc(db, 'empresas', uid));
    if (legacySnap.exists()) return [{ id: legacySnap.id, ...legacySnap.data() }];
    return [];
  }
  const ids = userSnap.data().empresas || [];
  // Filtrar IDs que realmente existen en Firestore (limpieza de baja anterior)
  const empresas = await Promise.all(ids.map(id => getEmpresa(id)));
  const validas = empresas.filter(Boolean);
  // Si habia IDs invalidos, limpiarlos del perfil
  if (validas.length < ids.length) {
    const idsValidos = validas.map(e => e.id);
    await updateDoc(doc(db, 'usuarios', uid), { empresas: idsValidos }).catch(() => {});
  }
  return validas;
}

export async function cambiarEmpresaActiva(uid, empresaId) {
  await updateDoc(doc(db, 'usuarios', uid), { empresaActiva: empresaId });
}

export async function desvincularEmpresa(uid, empresaId) {
  // 1. Quitar empresa del array del usuario
  const userRef  = doc(db, 'usuarios', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    const nuevasEmpresas = (data.empresas || []).filter(id => id !== empresaId);
    const nuevaActiva    = data.empresaActiva === empresaId
      ? (nuevasEmpresas[0] || null)
      : data.empresaActiva;
    await updateDoc(userRef, {
      empresas:      nuevasEmpresas,
      empresaActiva: nuevaActiva,
    });
  }

  // 2. Eliminar subcolecciones de la empresa
  const subColecciones = ['agentes', 'contactos', 'conversaciones', 'citas', 'config'];
  for (const col of subColecciones) {
    try {
      const snap = await getDocs(collection(db, 'empresas', empresaId, col));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'empresas', empresaId, col, d.id));
      }
    } catch {}
  }

  // 3. Eliminar documento principal de la empresa
  try {
    await deleteDoc(doc(db, 'empresas', empresaId));
  } catch {}
}

export async function updateEmpresa(empresaId, datos) {
  await updateDoc(doc(db, 'empresas', empresaId), datos);
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
