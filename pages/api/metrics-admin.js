// pages/api/metrics-admin.js
// Panel de métricas BQinzagencIA — datos web + empresas + WhatsApp + costes
import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

function fechaStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Borra el documento de empresa y sus subcolecciones principales.
// Las conversaciones tienen su propia subcolección "mensajes" anidada, así
// que se vacían documento por documento antes de borrar la conversación.
async function borrarSubcoleccion(ref, conMensajes=false) {
  const snap = await ref.get();
  if (snap.empty) return;
  const batch = adminDb.batch();
  for (const doc of snap.docs) {
    if (conMensajes) {
      const mensajesSnap = await doc.ref.collection('mensajes').get();
      mensajesSnap.docs.forEach(m => batch.delete(m.ref));
    }
    batch.delete(doc.ref);
  }
  await batch.commit();
}

async function eliminarEmpresaCompleta(empresaId) {
  const empresaRef = adminDb.collection('empresas').doc(empresaId);
  await borrarSubcoleccion(empresaRef.collection('conversaciones'), true);
  await borrarSubcoleccion(empresaRef.collection('citas'));
  await borrarSubcoleccion(empresaRef.collection('contactos'));
  await borrarSubcoleccion(empresaRef.collection('agentes'));
  await borrarSubcoleccion(empresaRef.collection('pedidos'));
  await borrarSubcoleccion(empresaRef.collection('menuDia'));
  await borrarSubcoleccion(empresaRef.collection('soportes'));
  await borrarSubcoleccion(empresaRef.collection('config'));
  await empresaRef.delete();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const secret = req.headers['x-admin-secret'] || req.query.secret || req.body?.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  // ── POST: acciones administrativas rápidas desde el panel de métricas ──
  // Activar plan tras un pago manual de PayPal, o bloquear/desbloquear una
  // empresa, sin necesitar el panel admin viejo (que usa otro sistema de planes).
  if (req.method === 'POST') {
    const { accion, empresaId, planId, bloqueada, motivo } = req.body || {};
    if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

    try {
      if (accion === 'activarPlan') {
        if (!['basico','estandar','pro'].includes(planId)) return res.status(400).json({ error: 'planId inválido' });
        const planHasta = new Date(Date.now() + 30 * 86400000);
        await adminDb.collection('empresas').doc(empresaId).update({
          plan:           planId,
          planWasapbot:   planId,
          planActivo:     true,
          producto:       'wasapbot',
          esPruebaGratis: false,
          planHasta,
          ultimoPago:     new Date(),
          activadoManualmentePor: 'super-admin',
        });
        return res.json({ ok: true });
      }

      if (accion === 'setBloqueo') {
        await adminDb.collection('empresas').doc(empresaId).update({
          bloqueada: !!bloqueada,
          motivoBloqueo: bloqueada ? (motivo || 'Bloqueada por el administrador') : '',
        });
        return res.json({ ok: true });
      }

      if (accion === 'eliminarEmpresa') {
        await eliminarEmpresaCompleta(empresaId);
        return res.json({ ok: true });
      }

      if (accion === 'eliminarEmpresas') {
        const { empresaIds } = req.body || {};
        if (!Array.isArray(empresaIds) || empresaIds.length === 0) return res.status(400).json({ error: 'empresaIds requerido' });
        let eliminadas = 0;
        for (const id of empresaIds) {
          try { await eliminarEmpresaCompleta(id); eliminadas++; } catch (e) { console.error('eliminarEmpresas', id, e.message); }
        }
        return res.json({ ok: true, eliminadas });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });
    } catch (err) {
      console.error('metrics-admin POST:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const ahora  = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const hoy    = fechaStr(ahora);

    // ── 1. Métricas web (tracking propio) ─────────────────────────────────
    const webMetricas = { sesionesHoy:0, usuariosHoy:0, pageviewsHoy:0, nuevosHoy:0, tiempoHoy:0, reboteHoy:0, totalSesionesHoy:0 };
    const ultimos14   = [];

    // Hoy
    const diaHoySnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).get();
    if (diaHoySnap.exists) {
      const d = diaHoySnap.data();
      webMetricas.sesionesHoy  = d.sesiones     || 0;
      webMetricas.usuariosHoy  = d.usuarios     || 0;
      webMetricas.pageviewsHoy = d.pageviews    || 0;
      webMetricas.nuevosHoy    = d.nuevosUsuarios|| 0;
      webMetricas.tiempoHoy    = d.tiempoTotalSegundos || 0;
      webMetricas.totalSesionesHoy = d.sesiones || 0;
    }

    // Tasa de rebote de hoy (% sesiones con solo 1 pageview)
    if (webMetricas.sesionesHoy > 0) {
      const sessSnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).collection('sessions').where('rebote','==',true).get();
      webMetricas.reboteHoy = Math.round(sessSnap.size / webMetricas.sesionesHoy * 100);
    }

    // Últimos 14 días
    for (let i = 13; i >= 0; i--) {
      const d = new Date(ahora); d.setDate(d.getDate() - i);
      const key = fechaStr(d);
      const snap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(key).get();
      const data = snap.exists ? snap.data() : {};
      ultimos14.push({ fecha: key, sesiones: data.sesiones||0, usuarios: data.usuarios||0, pageviews: data.pageviews||0 });
    }

    // Páginas más vistas hoy
    const paginasSnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).collection('pages').orderBy('views','desc').limit(10).get().catch(()=>({docs:[]}));
    const paginasTop = paginasSnap.docs.map(d => ({ path: d.data().path, views: d.data().views }));

    // ── 2. Empresas ────────────────────────────────────────────────────────
    const empresasSnap = await adminDb.collection('empresas').get();
    const empresas = [];
    let conversacionesHoyTotal = 0;
    let conversacionesTotal    = 0;

    for (const doc of empresasSnap.docs) {
      const data = doc.data();
      const hoyDate = new Date(ahora); hoyDate.setHours(0,0,0,0);

      const [convsHoySnap, todasConvsSnap] = await Promise.all([
        adminDb.collection('empresas').doc(doc.id).collection('conversaciones').where('ultimoMensaje','>=',hoyDate).get().catch(()=>({size:0})),
        adminDb.collection('empresas').doc(doc.id).collection('conversaciones').get().catch(()=>({size:0})),
      ]);

      conversacionesHoyTotal += convsHoySnap.size;
      conversacionesTotal    += todasConvsSnap.size;

      const trialHasta = data.trialHasta;
      const trialDate  = trialHasta instanceof Object && trialHasta._seconds
        ? new Date(trialHasta._seconds * 1000)
        : trialHasta ? new Date(trialHasta) : null;

      empresas.push({
        id:             doc.id,
        nombre:         data.nombreEmpresa || 'Sin nombre',
        email:          data.email || '',
        industria:      data.industria || 'otro',
        plan:           data.planWasapbot || data.plan || 'sin_plan',
        planActivo:     data.planActivo || false,
        producto:       data.producto || null,
        esAfiliado:     data.esAfiliado || false,
        esPruebaGratis: data.esPruebaGratis || false,
        conversaciones: todasConvsSnap.size,
        convsHoy:       convsHoySnap.size,
        tokensUsados:   data.tokensUsados || 0,
        whatsappActivo: data.whatsapp?.status === 'connected',
        whatsappNumero: data.whatsapp?.numero || null,
        trialHasta:     trialDate ? trialDate.toISOString() : null,
        ciudad:         data.ciudad || '',
        creadoEn:       data.creadoEn?._seconds ? new Date(data.creadoEn._seconds*1000).toISOString() : null,
        bloqueada:      data.bloqueada || false,
        motivoBloqueo:  data.motivoBloqueo || '',
      });
    }
    empresas.sort((a,b) => b.conversaciones - a.conversaciones);

    // ── 3. Totales semana y mes ────────────────────────────────────────────
    const sesiones7  = ultimos14.slice(-7).reduce((s,d)=>s+d.sesiones, 0);
    const usuarios7  = ultimos14.slice(-7).reduce((s,d)=>s+d.usuarios, 0);
    const pageviews7 = ultimos14.slice(-7).reduce((s,d)=>s+d.pageviews, 0);
    const sesiones30 = ultimos14.reduce((s,d)=>s+d.sesiones, 0); // usamos 14d como proxy

    return res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      // Web
      web: {
        hoy: {
          sesiones:    webMetricas.sesionesHoy,
          usuarios:    webMetricas.usuariosHoy,
          pageviews:   webMetricas.pageviewsHoy,
          nuevos:      webMetricas.nuevosHoy,
          tiempoMedio: webMetricas.sesionesHoy > 0 ? Math.round(webMetricas.tiempoHoy / webMetricas.sesionesHoy) : 0,
          rebote:      webMetricas.reboteHoy,
        },
        semana: { sesiones: sesiones7, usuarios: usuarios7, pageviews: pageviews7 },
        mes:    { sesiones: sesiones30 },
        ultimos14,
        paginasTop,
      },
      // Empresas
      totalEmpresas:       empresasSnap.size,
      conversacionesHoy:   conversacionesHoyTotal,
      conversacionesTotal,
      lecturasHoy:         empresasSnap.size * 15,
      empresas,
    });

  } catch (err) {
    console.error('metrics-admin error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Helper POST handler para acciones de agencia
async function handlePost(req, res, adminDb, FieldValue) {
  const { accion, empresaId, telefonoDueno, tokensLimite } = req.body;

  if (accion === 'getAgenciaConfig') {
    const AGENCIA_ID = empresaId || '48SqTngvOTxYIIFIoXE9';
    const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const [empSnap, tokSnap] = await Promise.all([
      adminDb.collection('empresas').doc(AGENCIA_ID).get(),
      adminDb.collection('wasapbot_tokens').doc(`${AGENCIA_ID}_${mesKey}`).get(),
    ]);
    const emp = empSnap.exists ? empSnap.data() : {};
    return res.json({
      ok: true,
      telefonoDueno: emp.telefonoDueno || '',
      tokensLimite:  emp.tokensLimiteAgencia || 400000,
      tokensUsadosMes: tokSnap.exists ? (tokSnap.data().usado || 0) : 0,
      mesKey,
    });
  }

  if (accion === 'updateAgenciaConfig') {
    const AGENCIA_ID = empresaId || '48SqTngvOTxYIIFIoXE9';
    await adminDb.collection('empresas').doc(AGENCIA_ID).update({
      ...(telefonoDueno !== undefined ? { telefonoDueno: String(telefonoDueno) } : {}),
      ...(tokensLimite  !== undefined ? { tokensLimiteAgencia: Number(tokensLimite) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return res.json({ ok: true });
  }
}
