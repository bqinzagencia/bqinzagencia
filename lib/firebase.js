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
  sendEmailVerification,
  GoogleAuthProvider, GithubAuthProvider,
  signInWithPopup, OAuthProvider
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
export const storage = getStorage(app);

// ─── STORAGE: subida de fotos de catálogo ───────────────────────
// Sube una imagen al bucket de Firebase Storage, bajo la ruta
// empresas/{empresaId}/catalogo/{nombreArchivoUnico}, y devuelve la URL
// pública de descarga lista para guardar en Firestore (campo `foto`).
// Valida tipo y tamaño antes de subir para evitar archivos no deseados.
const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

export async function subirFotoCatalogo(empresaId, archivo) {
  if (!archivo) throw new Error('No se seleccionó ningún archivo');
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    throw new Error('Formato no válido. Usa una imagen JPG, PNG, WEBP o GIF.');
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    throw new Error('La imagen pesa demasiado. Máximo 5MB.');
  }
  const extension   = archivo.name.split('.').pop() || 'jpg';
  const nombreUnico = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.${extension}`;
  const storageRef  = ref(storage, `empresas/${empresaId}/catalogo/${nombreUnico}`);
  await uploadBytes(storageRef, archivo);
  return await getDownloadURL(storageRef);
}

// Borra una foto previamente subida (cuando el usuario la reemplaza o
// elimina el item del catálogo), a partir de su URL pública de descarga.
// Falla en silencio si la URL no corresponde a un archivo de Storage
// (ej. una URL externa que alguien hubiera pegado antes de este cambio).
export async function borrarFotoCatalogo(urlDescarga) {
  try {
    if (!urlDescarga || !urlDescarga.includes('firebasestorage')) return;
    const storageRef = ref(storage, urlDescarga);
    await deleteObject(storageRef);
  } catch {}
}

// ─── AUTH HELPERS ────────────────────────────────────────
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

// Envia el correo de verificacion de Firebase (link de confirmacion).
// Se usa justo despues de registrarse con correo/contraseña, y tambien
// para el boton "reenviar correo" del banner de verificacion.
export const enviarVerificacionEmail = (user) =>
  sendEmailVerification(user);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── SOCIAL AUTH ─────────────────────────────────────────
export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
};
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
  // Usar set con merge:true para crear si no existe o actualizar si existe
  await setDoc(doc(db, 'empresas', empresaId), datos, { merge: true });
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
// Lista de correos con acceso fijo de superadmin, como respaldo seguro que
// no depende de que exista un documento en Firestore (admins/{uid}). Si en
// el futuro se añade ese documento, también sigue funcionando: basta con
// cualquiera de las dos condiciones.
const SUPERADMIN_EMAILS = [
  'oborreroquinonez@gmail.com',
  'bqinzagencia@gmail.com',
];

export async function isSuperAdmin(uid, email = '') {
  if (email && SUPERADMIN_EMAILS.includes(email.toLowerCase())) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists() && snap.data().rol === 'superadmin';
  } catch {
    return false;
  }
}

// ─── CONFIG GLOBAL (credenciales API + reglas de negocio) ──
// Documento único: config/global
export async function getConfigGlobal() {
  const snap = await getDoc(doc(db, 'config', 'global'));
  return snap.exists() ? snap.data() : {};
}

export async function updateConfigGlobal(datos) {
  await setDoc(doc(db, 'config', 'global'), datos, { merge: true });
}

// ─── ACCIONES ADMIN SOBRE EMPRESAS ──────────────────────────
export async function setEstadoEmpresa(empresaId, planActivo) {
  await updateDoc(doc(db, 'empresas', empresaId), { planActivo });
}

export async function eliminarEmpresaAdmin(empresaId) {
  const subColecciones = ['agentes', 'contactos', 'conversaciones', 'citas', 'config'];
  for (const col of subColecciones) {
    try {
      const snap = await getDocs(collection(db, 'empresas', empresaId, col));
      for (const d of snap.docs) await deleteDoc(doc(db, 'empresas', empresaId, col, d.id));
    } catch {}
  }
  await deleteDoc(doc(db, 'empresas', empresaId));
}

// ─── BLOQUEO (distinto de suspender) ─────────────────────────
// planActivo controla la facturación/vencimiento normal.
// bloqueada es un corte manual del admin (impago, abuso, fraude, etc.)
// con motivo registrado, independiente de si el plan está al día.
export async function setBloqueoEmpresa(empresaId, bloqueada, motivo = '', adminEmail = '') {
  const datos = bloqueada
    ? { bloqueada: true, motivoBloqueo: motivo, bloqueadaEn: serverTimestamp(), bloqueadaPor: adminEmail }
    : { bloqueada: false, motivoBloqueo: '', desbloqueadaEn: serverTimestamp(), desbloqueadaPor: adminEmail };
  await updateDoc(doc(db, 'empresas', empresaId), datos);
}

// ─── EDICIÓN ADMIN DE DATOS DE EMPRESA ───────────────────────
// Para edición inline desde el panel admin (nombre, plan, ciudad, email, etc.)
export async function updateEmpresaAdmin(empresaId, datos) {
  await updateDoc(doc(db, 'empresas', empresaId), datos);
}

// ─── USUARIOS / COLABORADORES POR EMPRESA ────────────────────
// Recorre la colección 'usuarios' y devuelve los que tienen esta empresa
// en su array `empresas`. No es lo más barato a gran escala, pero para
// el volumen actual (panel admin, pocas decenas de usuarios) es correcto
// y evita mantener un índice inverso solo para esto.
export async function getUsuariosDeEmpresa(empresaId) {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => Array.isArray(u.empresas) && u.empresas.includes(empresaId));
}

// Vincula un usuario existente (por uid) a una empresa, ej. para dar acceso
// a un colaborador. No crea el usuario — debe existir ya en 'usuarios'
// (es decir, debe haberse registrado al menos una vez en la plataforma).
export async function agregarUsuarioAEmpresa(uid, empresaId) {
  const userRef  = doc(db, 'usuarios', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('No existe ningún usuario con ese UID. Debe registrarse primero en la plataforma.');
  const data = userSnap.data();
  const empresasActuales = data.empresas || [];
  if (empresasActuales.includes(empresaId)) return; // ya vinculado
  await updateDoc(userRef, {
    empresas: [...empresasActuales, empresaId],
    empresaActiva: data.empresaActiva || empresaId,
  });
}

// Busca un usuario por email exacto en la colección 'usuarios'.
// Útil para que el admin añada colaboradores por correo en vez de UID.
export async function buscarUsuarioPorEmail(email) {
  const snap = await getDocs(query(collection(db, 'usuarios'), where('email', '==', email.trim().toLowerCase())));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function quitarUsuarioDeEmpresa(uid, empresaId) {
  const userRef  = doc(db, 'usuarios', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const data = userSnap.data();
  const nuevasEmpresas = (data.empresas || []).filter(id => id !== empresaId);
  const nuevaActiva    = data.empresaActiva === empresaId ? (nuevasEmpresas[0] || null) : data.empresaActiva;
  await updateDoc(userRef, { empresas: nuevasEmpresas, empresaActiva: nuevaActiva });
}

// ─── NOTAS INTERNAS DEL ADMIN ─────────────────────────────────
// Subcolección empresas/{id}/notasAdmin — historial de notas, no se borran,
// solo se acumulan (igual que un CRM). Cada nota guarda quién la escribió.
export async function getNotasAdmin(empresaId) {
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'notasAdmin'), orderBy('creadoEn', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function agregarNotaAdmin(empresaId, texto, adminEmail = '') {
  return await addDoc(collection(db, 'empresas', empresaId, 'notasAdmin'), {
    texto, autor: adminEmail, creadoEn: serverTimestamp(),
  });
}

export async function eliminarNotaAdmin(empresaId, notaId) {
  await deleteDoc(doc(db, 'empresas', empresaId, 'notasAdmin', notaId));
}

// Revisa todas las empresas y marca como INACTIVO las que superaron
// su fecha de renovación sin un pago registrado después de esa fecha.
// Se llama desde el panel admin al cargar (barato: 1 query, todo en memoria).
export async function chequearVencimientos(empresas) {
  const ahora = Date.now();
  const vencidas = empresas.filter(e => {
    if (!e.proximaRenovacion || !e.planActivo) return false;
    const fechaRenov = e.proximaRenovacion.toDate ? e.proximaRenovacion.toDate().getTime() : new Date(e.proximaRenovacion).getTime();
    return fechaRenov < ahora;
  });
  await Promise.all(vencidas.map(e => updateDoc(doc(db, 'empresas', e.id), { planActivo: false, estadoVencido: true })));
  return vencidas.map(e => e.id);
}

// ─── LOGS / ALERTAS DE SISTEMA ───────────────────────────────
// Coleccion: systemLogs/{autoId}  { tipo, mensaje, empresaId?, creadoEn }
export async function getSystemLogs(limite = 20) {
  const snap = await getDocs(
    query(collection(db, 'systemLogs'), orderBy('creadoEn', 'desc'), limit(limite))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function registrarLogError(tipo, mensaje, empresaId = null) {
  await addDoc(collection(db, 'systemLogs'), {
    tipo, mensaje, empresaId, creadoEn: serverTimestamp(),
  });
}

// ── LEADS DE MARKETING (Instagram/ManyChat/TikTok) ────────────────────
export async function getLeads(limite = 100) {
  const snap = await getDocs(
    query(collection(db, 'leads'), orderBy('creadoEn', 'desc'), limit(limite))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateLead(leadId, datos) {
  await updateDoc(doc(db, 'leads', leadId), { ...datos, actualizadoEn: serverTimestamp() });
}

export async function eliminarLead(leadId) {
  await deleteDoc(doc(db, 'leads', leadId));
}
