// pages/api/wasapbot-broadcast.js
// Envía un mensaje masivo (broadcast) a los contactos de WhatsApp de una
// empresa — disponible solo para planes Estándar y Pro (no Básico, no
// prueba gratis). Pensado especialmente para avisos de reposición de
// stock o promociones, caso de uso clave para tiendas de TikTok Shop.
//
// Diseñado para el límite de 10s de las funciones serverless en el plan
// Hobby de Vercel: en vez de enviar TODOS los contactos en una sola
// llamada (lo que cortaría a mitad de camino con listas grandes), cada
// llamada procesa un LOTE pequeño y devuelve si quedan más por enviar.
// El panel debe seguir llamando a este mismo endpoint con accion:'continuar'
// hasta que la respuesta diga completado:true.
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const WA_SERVER = process.env.NEXT_PUBLIC_WA_SERVER || process.env.WHATSAPP_SERVER_URL || 'https://bqinzagencia-whatsapp-server-production.up.railway.app';
const WA_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || process.env.SERVER_SECRET || 'bqinzagencia2026.';

const PLANES_CON_BROADCAST  = ['estandar', 'pro'];
const LIMITE_CONTACTOS_TOTAL = 500;   // tope global por broadcast
const TAMANO_LOTE            = 8;     // contactos enviados por cada llamada (~10s)

async function enviarUno(empresaId, numero, texto) {
  try {
    await fetch(`${WA_SERVER}/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-server-secret': WA_SECRET },
      body: JSON.stringify({ empresaId, numero, texto }),
    });
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { accion, empresaId, mensaje, soloEstados, broadcastId } = req.body || {};
  if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

  try {
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empresaSnap.data();
    if (empresa.bloqueada) return res.status(403).json({ error: 'Cuenta bloqueada' });

    const planActual = empresa.planWasapbot || empresa.plan;
    if (!PLANES_CON_BROADCAST.includes(planActual)) {
      return res.status(403).json({ error: 'Los broadcasts masivos están disponibles desde el plan Estándar. Activa tu plan para usar esta función.' });
    }

    const broadcastsRef = adminDb.collection('empresas').doc(empresaId).collection('broadcasts');

    // ── Paso 1: crear el broadcast y la lista de números pendientes ──
    if (accion !== 'continuar') {
      if (!mensaje) return res.status(400).json({ error: 'Falta el mensaje' });
      if (mensaje.length > 1000) return res.status(400).json({ error: 'El mensaje es demasiado largo (máx. 1000 caracteres)' });

      let contactosQuery = adminDb.collection('empresas').doc(empresaId).collection('contactos');
      if (Array.isArray(soloEstados) && soloEstados.length > 0) {
        contactosQuery = contactosQuery.where('estado', 'in', soloEstados.slice(0, 10));
      }
      const contactosSnap = await contactosQuery.limit(LIMITE_CONTACTOS_TOTAL).get();
      const numeros = [...new Set(contactosSnap.docs.map(d => d.data().telefono).filter(Boolean))];
      if (numeros.length === 0) return res.status(400).json({ error: 'No hay contactos para enviar el broadcast' });

      const nuevoRef = await broadcastsRef.add({
        mensaje,
        pendientes:  numeros,
        totalContactos: numeros.length,
        enviados: 0,
        fallidos: 0,
        estado: 'enviando',
        creadoEn: FieldValue.serverTimestamp(),
      });

      return await procesarLote(nuevoRef, empresaId, res);
    }

    // ── Paso 2+: continuar un broadcast ya empezado ──
    if (!broadcastId) return res.status(400).json({ error: 'Falta broadcastId' });
    const ref = broadcastsRef.doc(broadcastId);
    return await procesarLote(ref, empresaId, res);

  } catch (err) {
    console.error('wasapbot-broadcast error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function procesarLote(ref, empresaId, res) {
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Broadcast no encontrado' });
  const data = snap.data();

  const pendientes = data.pendientes || [];
  const loteActual  = pendientes.slice(0, TAMANO_LOTE);
  const resto       = pendientes.slice(TAMANO_LOTE);

  let enviadosLote = 0, fallidosLote = 0;
  for (const numero of loteActual) {
    const ok = await enviarUno(empresaId, numero, data.mensaje);
    if (ok) enviadosLote++; else fallidosLote++;
  }

  const enviados  = (data.enviados || 0) + enviadosLote;
  const fallidos  = (data.fallidos || 0) + fallidosLote;
  const completado = resto.length === 0;

  await ref.update({
    pendientes: resto,
    enviados,
    fallidos,
    estado: completado ? 'completado' : 'enviando',
    ...(completado ? { completadoEn: FieldValue.serverTimestamp() } : {}),
  });

  return res.json({
    ok: true,
    broadcastId: ref.id,
    totalContactos: data.totalContactos,
    enviados,
    fallidos,
    restantes: resto.length,
    completado,
  });
}
