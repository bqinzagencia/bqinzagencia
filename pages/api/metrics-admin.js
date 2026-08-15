// pages/api/metrics-admin.js
import { db as adminDb } from '../../lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

function fechaStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

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

  if (req.method === 'POST') {
    const { accion, empresaId, planId, bloqueada, motivo, telefonoDueno, tokensLimite } = req.body || {};
    const accionesSinEmpresaId = ['eliminarEmpresas', 'getAgenciaConfig', 'resetTokensDueno', 'updateAgenciaConfig'];
    if (!empresaId && !accionesSinEmpresaId.includes(accion)) {
      return res.status(400).json({ error: 'Falta empresaId' });
    }

    try {
      if (accion === 'activarPlan') {
        if (!['basico','estandar','pro'].includes(planId)) return res.status(400).json({ error: 'planId inválido' });
        const planHasta = new Date(Date.now() + 30 * 86400000);
        await adminDb.collection('empresas').doc(empresaId).update({
          plan: planId, planWasapbot: planId, planActivo: true, producto: 'wasapbot',
          esPruebaGratis: false, planHasta, ultimoPago: new Date(),
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

      if (accion === 'renombrarEmpresa') {
        const { nuevoNombre } = req.body || {};
        if (!nuevoNombre) return res.status(400).json({ error: 'Falta nuevoNombre' });
        await adminDb.collection('empresas').doc(empresaId).update({ nombreEmpresa: nuevoNombre });
        return res.json({ ok: true });
      }

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
          telefonoDueno:     emp.telefonoDueno || '',
          tokensLimite:      emp.tokensLimiteDueno || emp.tokensLimiteAgencia || 50000,
          tokensUsadosDueno: emp.tokensUsadosDueno || 0,
          tokensUsadosMes:   tokSnap.exists ? (tokSnap.data().usado || 0) : 0,
          mesKey,
        });
      }

      if (accion === 'updateAgenciaConfig') {
        const AGENCIA_ID = empresaId || '48SqTngvOTxYIIFIoXE9';
        await adminDb.collection('empresas').doc(AGENCIA_ID).update({
          ...(telefonoDueno !== undefined ? { telefonoDueno: String(telefonoDueno) } : {}),
          ...(tokensLimite  !== undefined ? { tokensLimiteDueno: Number(tokensLimite), tokensLimiteAgencia: Number(tokensLimite) } : {}),
          updatedAt: adminDb.collection('_').doc('_').firestore.FieldValue?.serverTimestamp?.() || new Date(),
        }).catch(async () => {
          const { FieldValue } = await import('firebase-admin/firestore');
          await adminDb.collection('empresas').doc(AGENCIA_ID).update({
            ...(telefonoDueno !== undefined ? { telefonoDueno: String(telefonoDueno) } : {}),
            ...(tokensLimite  !== undefined ? { tokensLimiteDueno: Number(tokensLimite) } : {}),
          });
        });
        return res.json({ ok: true });
      }

      if (accion === 'resetTokensDueno') {
        const AGENCIA_ID = empresaId || '48SqTngvOTxYIIFIoXE9';
        await adminDb.collection('empresas').doc(AGENCIA_ID).update({ tokensUsadosDueno: 0 });
        return res.json({ ok: true });
      }

      if (accion === 'resetTokensMes') {
        const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
        await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`).set({
          usado: 0, empresaId, mes: mesKey,
        });
        return res.json({ ok: true, mesKey });
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

    // ── 1. Métricas web ────────────────────────────────────────────────────
    const webMetricas = { sesionesHoy:0, usuariosHoy:0, pageviewsHoy:0, nuevosHoy:0, tiempoHoy:0, reboteHoy:0 };
    const ultimos14 = [];

    const diaHoySnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).get();
    if (diaHoySnap.exists) {
      const d = diaHoySnap.data();
      webMetricas.sesionesHoy  = d.sesiones      || 0;
      webMetricas.usuariosHoy  = d.usuarios      || 0;
      webMetricas.pageviewsHoy = d.pageviews     || 0;
      webMetricas.nuevosHoy    = d.nuevosUsuarios || 0;
      webMetricas.tiempoHoy    = d.tiempoTotalSegundos || 0;
    }

    if (webMetricas.sesionesHoy > 0) {
      const sessSnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).collection('sessions').where('rebote','==',true).get().catch(()=>({size:0}));
      webMetricas.reboteHoy = Math.round(sessSnap.size / webMetricas.sesionesHoy * 100);
    }

    for (let i = 13; i >= 0; i--) {
      const d = new Date(ahora); d.setDate(d.getDate() - i);
      const key = fechaStr(d);
      const snap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(key).get();
      const data = snap.exists ? snap.data() : {};
      ultimos14.push({ fecha: key, sesiones: data.sesiones||0, usuarios: data.usuarios||0, pageviews: data.pageviews||0 });
    }

    const paginasSnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy).collection('pages').orderBy('views','desc').limit(10).get().catch(()=>({docs:[]}));
    const paginasTop = paginasSnap.docs.map(d => ({ path: d.data().path, views: d.data().views }));

    // Tiempo real: sesiones activas en últimos 5 min
    // IMPORTANTE: usar Date.now() UTC puro para comparar contra Firestore Timestamps
    // No usar `ahora` (hora Madrid local) porque tiene offset y desfasa el filtro 2h en verano
    const ahoraNow  = Date.now();
    const ahora5min = new Date(ahoraNow - 5 * 60 * 1000);
    const sesionesSnap = await adminDb.collection('analytics').doc('visits').collection('dias').doc(hoy)
      .collection('sessions').limit(200).get().catch(()=>({docs:[]}));

    const usuariosRT = sesionesSnap.docs
      .filter(d => {
        const s = d.data();
        const ts = s.actualizadoEn || s.creadoEn;
        if (!ts) return false;
        const t = ts._seconds ? new Date(ts._seconds * 1000) : (ts.toDate ? ts.toDate() : null);
        return t && t >= ahora5min;
      })
      .map(d => {
        const s = d.data();
        const tsRaw = s.actualizadoEn || s.creadoEn;
        const t = tsRaw?._seconds ? new Date(tsRaw._seconds * 1000) : new Date();
        return {
          paginaActual:  (s.paginasVistas || []).slice(-1)[0] || '/',
          paginasVistas: s.paginasVistas?.length || 1,
          segsAtras:     Math.round((ahoraNow - t.getTime()) / 1000),
          isNew:         s.isNew  || false,
          pais:          s.pais   || '',
          ciudad:        s.ciudad || '',
        };
      });
    usuariosRT.sort((a,b) => a.segsAtras - b.segsAtras);

    // ── 2. Empresas ────────────────────────────────────────────────────────
    const empresasSnap = await adminDb.collection('empresas').get();
    const empresas = [];
    const mesKey   = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}`;
    let conversacionesHoyTotal = 0;
    let conversacionesTotal    = 0;

    for (const doc of empresasSnap.docs) {
      const data = doc.data();
      if (!data.producto || data.producto !== 'wasapbot') continue;

      const tokSnap    = await adminDb.collection('wasapbot_tokens').doc(`${doc.id}_${mesKey}`).get().catch(()=>null);
      const tokUsados  = tokSnap?.exists ? (tokSnap.data().usado || 0) : (data.tokensUsados || 0);
      const convSnap   = await adminDb.collection('empresas').doc(doc.id).collection('conversaciones').get().catch(()=>null);
      const totalConvs = convSnap ? convSnap.size : (data.conversaciones || 0);
      const hoyStr     = fechaStr(ahora);
      const convHoySnap = await adminDb.collection('empresas').doc(doc.id).collection('conversaciones')
        .where('ultimoMensaje', '>=', new Date(hoyStr + 'T00:00:00')).get().catch(()=>null);
      const convsHoy = convHoySnap ? convHoySnap.size : 0;

      conversacionesTotal    += totalConvs;
      conversacionesHoyTotal += convsHoy;

      const trialDate = data.trialHasta?._seconds ? new Date(data.trialHasta._seconds*1000) : (data.trialHasta ? new Date(data.trialHasta) : null);
      empresas.push({
        id:             doc.id,
        nombre:         data.nombreEmpresa || 'Sin nombre',
        email:          data.email         || '',
        plan:           data.planWasapbot  || data.plan || 'wasapbot',
        planActivo:     data.planActivo    || false,
        esPruebaGratis: data.esPruebaGratis|| false,
        bloqueada:      data.bloqueada     || false,
        motivoBloqueo:  data.motivoBloqueo || '',
        tokensUsados:   tokUsados,
        conversaciones: totalConvs,
        convsHoy,
        ciudad:         data.ciudad        || '',
        industria:      data.industria     || 'otro',
        whatsappActivo: data.whatsapp?.activo || false,
        trialHasta:     trialDate ? trialDate.toISOString() : null,
        creadoEn:       data.creadoEn?._seconds ? new Date(data.creadoEn._seconds*1000).toISOString() : null,
      });
    }
    empresas.sort((a,b) => b.conversaciones - a.conversaciones);

    const sesiones7  = ultimos14.slice(-7).reduce((s,d)=>s+d.sesiones,0);
    const usuarios7  = ultimos14.slice(-7).reduce((s,d)=>s+d.usuarios,0);
    const pageviews7 = ultimos14.slice(-7).reduce((s,d)=>s+d.pageviews,0);

    return res.json({
      ok: true,
      timestamp: new Date().toISOString(),
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
        mes:    { sesiones: ultimos14.reduce((s,d)=>s+d.sesiones,0) },
        ultimos14,
        paginasTop,
        usuariosRT,
      },
      totalEmpresas:       empresasSnap.size,
      conversacionesHoy:   conversacionesHoyTotal,
      conversacionesTotal,
      lecturasHoy:         empresasSnap.size * 15,
      empresas,
    });

  } catch (err) {
    console.error('metrics-admin GET error:', err);
    return res.status(500).json({ error: err.message });
  }
}
