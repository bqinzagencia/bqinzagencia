// pages/api/whatsapp/webhook.js
// Agente IA de WhatsApp Business — BQinzagencIA
// Recibe mensajes, responde con IA y agenda citas automáticamente en Firebase

import * as admin from 'firebase-admin';

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

async function sendWhatsAppMessage(to, text, phoneNumberId) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  });
  if (!res.ok) console.error('[WA] Error enviando:', await res.text());
  return res.ok;
}

async function getHistorial(db, empresaId, waId) {
  try {
    const snap = await db.collection('empresas').doc(empresaId)
      .collection('conversaciones_wa').doc(waId)
      .collection('mensajes').orderBy('ts', 'asc').limitToLast(14).get();
    return snap.docs.map(d => ({ role: d.data().role, content: d.data().content }));
  } catch { return []; }
}

async function guardarMensaje(db, empresaId, waId, role, content, nombre) {
  try {
    const ref = db.collection('empresas').doc(empresaId).collection('conversaciones_wa').doc(waId);
    await ref.set({ waId, nombre: nombre || waId, ultimoMensaje: content, ultimaActividad: admin.firestore.FieldValue.serverTimestamp(), canal: 'WhatsApp' }, { merge: true });
    await ref.collection('mensajes').add({ role, content, ts: admin.firestore.FieldValue.serverTimestamp() });
  } catch (e) { console.error('[WA] guardarMensaje:', e.message); }
}

async function getAgenteConfig(db, empresaId) {
  try {
    const snap = await db.collection('empresas').doc(empresaId).collection('agentes').where('activo', '==', true).limit(1).get();
    const agente = snap.empty ? { nombre: 'Asistente IA', personalidad: 'amigable y profesional', prompt: '' } : snap.docs[0].data();
    const conocSnap = await db.collection('empresas').doc(empresaId).collection('config').doc('conocimiento').get();
    const conocimiento = conocSnap.exists ? conocSnap.data().promptGenerado || '' : '';
    return { agente, conocimiento };
  } catch { return { agente: { nombre: 'Asistente IA', personalidad: 'amigable y profesional', prompt: '' }, conocimiento: '' }; }
}

function buildSystemPrompt(agente, empresa, conocimiento) {
  return `Eres ${agente.nombre || 'Asistente IA'}, el asistente virtual de WhatsApp de ${empresa?.nombreEmpresa || 'la empresa'}, ${empresa?.industria || ''} en ${empresa?.ciudad || 'España'}.

PERSONALIDAD: ${agente.personalidad || 'amigable, profesional y empático'}
HORARIO: ${empresa?.horario || 'Lunes a Sábado 9:00-20:00h'}
TELÉFONO: ${empresa?.telefono || ''}

${conocimiento ? `BASE DE CONOCIMIENTO:\n${conocimiento}\n` : ''}
${agente.prompt ? `INSTRUCCIONES ESPECÍFICAS:\n${agente.prompt}\n` : ''}

REGLAS:
1. Responde en español, máximo 3-4 líneas (es WhatsApp)
2. Usa emojis con moderación (1-2 por mensaje)
3. Para reservar cita necesitas: nombre completo, servicio, fecha y hora
4. Al confirmar cita di EXACTAMENTE: "✅ Perfecto [nombre], te agendo [servicio] para [fecha] a las [hora]h."
5. Informa precios y servicios con detalle cuando pregunten
6. Termina siempre con una pregunta o CTA
7. Si no sabes algo, invita a llamar directamente`;
}

async function detectarYGuardarCita(db, empresaId, historial, reply, waId, nombre, agenteNombre) {
  const lower = reply.toLowerCase();
  if (!['✅', 'te agendo', 'agendé', 'reservé', 'confirmad', 'quedas apuntad'].some(p => lower.includes(p))) return null;
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini', max_tokens: 200, temperature: 0,
        messages: [
          { role: 'system', content: 'Extrae datos de la cita. Solo JSON: {"nombre":"","telefono":"","servicio":"","fecha":"","hora":""}. Sin markdown.' },
          ...historial.slice(-8), { role: 'assistant', content: reply },
        ],
      }),
    });
    const d = await r.json();
    let txt = d.choices?.[0]?.message?.content?.trim().replace(/```json|```/g, '').trim() || '';
    if (!txt.startsWith('{')) return null;
    const cita = JSON.parse(txt);
    if (!cita.nombre) return null;

    let fechaHora = new Date(); fechaHora.setDate(fechaHora.getDate() + 1);
    const m = (cita.hora || '').match(/(\d+):?(\d{0,2})\s*(am|pm)?/i);
    if (m) { let h = parseInt(m[1]); const min = parseInt(m[2] || '0'); if (m[3]?.toLowerCase() === 'pm' && h < 12) h += 12; fechaHora.setHours(h, min, 0, 0); }

    await db.collection('empresas').doc(empresaId).collection('citas').add({
      nombreCliente: cita.nombre, telefono: cita.telefono || waId,
      servicio: cita.servicio || 'Consulta general', fecha: cita.fecha || '',
      hora: cita.hora || '', fechaHora, estado: 'confirmada', canal: 'WhatsApp',
      waId, agenteNombre, notas: `Agendada automáticamente vía WhatsApp IA`,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[WA] ✅ Cita: ${cita.nombre} — ${cita.servicio} — ${cita.fecha} ${cita.hora}`);
    return cita;
  } catch (e) { console.error('[WA] detectarCita:', e.message); return null; }
}

async function getEmpresaPorPhoneId(db, phoneNumberId) {
  try {
    const snap = await db.collection('empresas').where('whatsappPhoneId', '==', phoneNumberId).limit(1).get();
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    const demo = await db.collection('empresas').where('planActivo', '==', true).limit(1).get();
    if (!demo.empty) return { id: demo.docs[0].id, ...demo.docs[0].data() };
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  // Verificación Meta (GET)
  if (req.method === 'GET') {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('[WA] ✅ Webhook verificado');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Token inválido' });
  }

  if (req.method !== 'POST') return res.status(405).end();
  res.status(200).end(); // Responder 200 inmediatamente a Meta

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value?.messages?.length) continue;

        const phoneNumberId = value.metadata?.phone_number_id;
        const msg = value.messages[0];
        if (msg.type !== 'text') continue; // solo texto por ahora

        const waId = msg.from;
        const texto = msg.text?.body?.trim();
        const nombreCliente = value.contacts?.[0]?.profile?.name || waId;
        if (!texto) continue;

        console.log(`[WA] 📩 ${nombreCliente}: ${texto}`);
        const db = getDb();

        const empresa = await getEmpresaPorPhoneId(db, phoneNumberId);
        if (!empresa) { console.log('[WA] Sin empresa para:', phoneNumberId); continue; }

        const { agente, conocimiento } = await getAgenteConfig(db, empresa.id);
        const historial = await getHistorial(db, empresa.id, waId);
        await guardarMensaje(db, empresa.id, waId, 'user', texto, nombreCliente);

        const historialActual = [...historial, { role: 'user', content: texto }];
        const systemPrompt = buildSystemPrompt(agente, empresa, conocimiento);

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 350, temperature: 0.72, messages: [{ role: 'system', content: systemPrompt }, ...historialActual] }),
        });

        if (!openaiRes.ok) {
          const errTxt = await openaiRes.text();
          console.error('[WA] OpenAI HTTP error:', openaiRes.status, errTxt);
          // Fallback: respuesta genérica en lugar del mensaje de error
          const fallback = `¡Hola! Soy el asistente de ${empresa.nombreEmpresa || 'la empresa'}. Ahora mismo estoy actualizando mi sistema. Por favor, llámanos al ${empresa.telefono || '+34 674 421 919'} y te atendemos enseguida. 📞`;
          await sendWhatsAppMessage(waId, fallback, phoneNumberId);
          continue;
        }

        const openaiData = await openaiRes.json();
        console.log('[WA] OpenAI response status:', openaiData.error || 'ok');
        const reply = openaiData.choices?.[0]?.message?.content?.trim();
        if (!reply) continue;

        await guardarMensaje(db, empresa.id, waId, 'assistant', reply, agente.nombre);
        await detectarYGuardarCita(db, empresa.id, historialActual, reply, waId, nombreCliente, agente.nombre);
        await sendWhatsAppMessage(waId, reply, phoneNumberId);
        console.log(`[WA] ✅ → ${nombreCliente}: ${reply.substring(0, 60)}`);
      }
    }
  } catch (e) { console.error('[WA] Error general:', e.message); }
}

export const config = { api: { bodyParser: true } };
