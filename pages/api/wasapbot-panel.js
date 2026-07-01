// pages/api/wasapbot-panel.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {

  // ── GET: cargar datos del panel ──
  if (req.method === 'GET') {
    const { id, subcol } = req.query;
    if (!id) return res.status(400).json({ error: 'id requerido' });

    try {
      const empSnap = await adminDb.collection('empresas').doc(id).get();

      if (!empSnap.exists) {
        return res.status(404).json({ error: 'Empresa no encontrada', id });
      }

      const empData = empSnap.data();

      if (subcol === 'citas') {
        const citasSnap = await adminDb.collection('empresas').doc(id)
          .collection('citas')
          .orderBy('creadoEn', 'desc')
          .limit(100)
          .get().catch(() => null);
        const citas = citasSnap
          ? citasSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          : [];
        return res.json({ ok: true, citas });
      }

      const [convSnap, tokenSnap, conocimientoSnap, agenteSnap] = await Promise.all([
        adminDb.collection('empresas').doc(id)
          .collection('conversaciones')
          .orderBy('ultimoMensaje', 'desc')
          .limit(20).get().catch(() => null),
        adminDb.collection('wasapbot_tokens').doc(id).get().catch(() => null),
        adminDb.collection('empresas').doc(id)
          .collection('config').doc('conocimiento').get().catch(() => null),
        adminDb.collection('empresas').doc(id)
          .collection('agentes').doc('whatsapp_principal').get().catch(() => null),
      ]);

      const convs        = convSnap ? convSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
      const conocimiento = conocimientoSnap?.exists ? conocimientoSnap.data() : {};
      const tokenData    = tokenSnap?.exists ? tokenSnap.data() : { usados: 0, total: 15000, plan: 'wasapbot' };
      const agente       = agenteSnap?.exists ? agenteSnap.data() : { prompt: '', personalidad: '' };

      return res.json({ ok: true, empresa: { id, ...empData }, convs, tokens: tokenData, conocimiento, agente });

    } catch (err) {
      console.error('wasapbot-panel GET:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: acciones ──
  if (req.method === 'POST') {
    const { accion, empresaId, citaId, estado } = req.body;

    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      if (accion === 'actualizarCita') {
        if (!citaId || !estado) return res.status(400).json({ error: 'citaId y estado requeridos' });

        const estados = ['pendiente', 'confirmada', 'cancelada', 'completada'];
        if (!estados.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

        const update = { estado, actualizadoEn: FieldValue.serverTimestamp() };

        if (estado === 'completada') {
          update.completadoEn       = FieldValue.serverTimestamp();
          update.seguimientoEnviado = false;
        }

        if (estado !== 'completada') {
          update.completadoEn       = null;
          update.seguimientoEnviado = false;
        }

        if (estado === 'cancelada') {
          update.recordatorioEnviado = true;
        }
        if (estado === 'pendiente' || estado === 'confirmada') {
          update.recordatorioEnviado = false;
        }

        await adminDb.collection('empresas').doc(empresaId)
          .collection('citas').doc(citaId)
          .update(update);

        return res.json({ ok: true });
      }

      if (accion === 'guardarConfig') {
        const { campos } = req.body;
        if (!campos) return res.status(400).json({ error: 'campos requerido' });
        await adminDb.collection('empresas').doc(empresaId).update({
          ...campos,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true });
      }

      if (accion === 'guardarWeb') {
        const { tituloWeb, descripcionWeb, fotoWebPortada, webActivaWasapbot } = req.body;
        const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
        if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
        const empData = empSnap.data();
        const planActual = empData.planWasapbot || empData.plan;
        if (planActual !== 'pro') return res.status(403).json({ error: 'La página web es exclusiva del plan Pro' });

        let slugWeb = empData.slugWeb;
        if (!slugWeb) {
          const base = (tituloWeb || empData.nombreEmpresa || 'negocio')
            .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
            .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
          let candidato = base || 'negocio';
          let intento = 0;
          while (true) {
            const choque = await adminDb.collection('empresas').where('slugWeb','==',candidato).limit(1).get();
            if (choque.empty) break;
            intento++; candidato = `${base}-${intento}`;
          }
          slugWeb = candidato;
        }

        await adminDb.collection('empresas').doc(empresaId).update({
          tituloWeb: tituloWeb || '',
          descripcionWeb: descripcionWeb || '',
          fotoWebPortada: fotoWebPortada || '',
          webActivaWasapbot: !!webActivaWasapbot,
          slugWeb,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true, slugWeb });
      }

      if (accion === 'registrarLeadWeb') {
        const { nombre, telefono, correo, mensaje, itemInteres } = req.body;
        if (!nombre || !telefono) return res.status(400).json({ error: 'nombre y telefono requeridos' });
        await adminDb.collection('empresas').doc(empresaId).collection('contactos').add({
          nombre, telefono, correo: correo||'', mensaje: mensaje||'', itemInteres: itemInteres||'',
          canal: 'web', fuente: 'landing-publica', estado: 'nuevo', creadoEn: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true });
      }

      // ── Reset tokens del mes (para cuando renuevan plan) ──
      if (accion === 'resetTokensMes') {
        const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
        await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`).set({
          usado: 0, empresaId, mes: mesKey, resetAt: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true, mesKey });
      }

      // ── Guardar el prompt del agente IA de WhatsApp ──
      // Se guarda en empresas/{id}/agentes/whatsapp_principal con
      // activo:true y canales:['whatsapp'], que es exactamente lo que
      // busca whatsapp-baileys.js para inyectar el prompt en el systemPrompt.
      if (accion === 'guardarPromptAgente') {
        const { prompt, personalidad } = req.body;
        await adminDb.collection('empresas').doc(empresaId)
          .collection('agentes').doc('whatsapp_principal')
          .set({
            activo: true,
            canales: ['whatsapp'],
            prompt: prompt || '',
            personalidad: personalidad || '',
            actualizadoEn: FieldValue.serverTimestamp(),
          }, { merge: true });
        return res.json({ ok: true });
      }

      // ── Actualizar industria desde el onboarding de activación ──
      if (accion === 'actualizarIndustria') {
        const { industria } = req.body;
        if (!industria) return res.status(400).json({ error: 'industria requerida' });
        await adminDb.collection('empresas').doc(empresaId).update({
          industria,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });

    } catch (err) {
      console.error('wasapbot-panel POST:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE ──
  if (req.method === 'DELETE') {
    const { accion, empresaId, citaId, conversacionId } = req.body;
    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      if (accion === 'eliminarCita') {
        if (!citaId) return res.status(400).json({ error: 'citaId requerido' });
        await adminDb.collection('empresas').doc(empresaId).collection('citas').doc(citaId).delete();
        return res.json({ ok: true });
      }

      if (accion === 'eliminarCitasCanceladas') {
        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('citas').where('estado', '==', 'cancelada').get();
        const batch = adminDb.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return res.json({ ok: true, eliminadas: snap.size });
      }

      if (accion === 'eliminarConversacion') {
        if (!conversacionId) return res.status(400).json({ error: 'conversacionId requerido' });
        const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones').doc(conversacionId);
        const mensajesSnap = await convRef.collection('mensajes').get();
        const batch = adminDb.batch();
        mensajesSnap.docs.forEach(doc => batch.delete(doc.ref));
        batch.delete(convRef);
        await batch.commit();
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });

    } catch (err) {
      console.error('wasapbot-panel DELETE:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
