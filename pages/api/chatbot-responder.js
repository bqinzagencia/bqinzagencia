// pages/api/chatbot-responder.js
// Chat web con trial 7 días + filtro anti-charlatanes
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { evaluarMensaje, respuestaFiltro } from '../../lib/filtroMensajes';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PLAN_TOKENS = { starter:30000, business:100000, agency:400000 };
const TRIAL_DIAS  = 7; // Trial de 7 días para chat web

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { chatbotId, sessionId, texto, historial } = req.body;
  if (!chatbotId || !texto) return res.status(400).json({ error: 'Faltan datos' });

  try {
    // 1. Cargar chatbot
    const snap = await adminDb.collection('chatbots').doc(chatbotId).get();
    if (!snap.exists) return res.status(404).json({ error: 'ChatBot no encontrado' });
    const cb = snap.data();

    // 2. Verificar trial (7 días) o plan activo
    const ahora    = new Date();
    const trial    = cb.trialHasta?.toDate ? cb.trialHasta.toDate() : cb.trialHasta ? new Date(cb.trialHasta) : null;
    const enTrial  = trial && ahora < trial;
    const planOk   = cb.planActivo === true;

    if (!enTrial && !planOk) {
      return res.json({
        respuesta: `El periodo de prueba de ${cb.nombre || 'este chat'} ha finalizado. Contacta al negocio directamente para más información.`,
        bloqueado: true,
      });
    }

    // 3. Verificar límite de tokens
    const limite  = (PLAN_TOKENS[cb.plan || 'starter'] || 30000) + (cb.tokensExtra || 0);
    if ((cb.tokensUsados || 0) >= limite) {
      return res.json({ respuesta: 'Este chat ha alcanzado su límite de mensajes del mes. Contacta directamente al negocio.' });
    }

    // ── 4. FILTRO ANTI-CHARLATANES ────────────────────────────
    const historialLen = historial?.length || 0;
    const evaluacion   = evaluarMensaje(texto, cb.industria, historialLen);

    if (!evaluacion.pasar) {
      // No consumir tokens — responder con mensaje guía gratuito
      return res.json({
        respuesta: respuestaFiltro(cb.nombre || cb.nombreEmpresa),
        filtrado:  true,
      });
    }

    // 5. Cargar conocimiento
    const conocSnap = await adminDb.collection('chatbots').doc(chatbotId)
      .collection('config').doc('conocimiento').get();
    const conoc = conocSnap.exists ? conocSnap.data() : {};

    // 6. System prompt
    let systemPrompt = `Eres el asistente de chat web de "${cb.nombre || cb.nombreEmpresa}", negocio de ${cb.industria || 'servicios'} en ${cb.ciudad || 'Colombia'}.

MISIÓN: Ayudar ÚNICAMENTE con preguntas relacionadas con el negocio (servicios, precios, horarios, ubicación, pedidos, citas). 

REGLAS CRÍTICAS:
- Si el mensaje NO tiene relación con el negocio, responde amablemente que solo puedes ayudar con temas del negocio.
- Respuestas concisas (max 3 oraciones).
- Idioma: español colombiano natural.
- Si pide hablar con persona, avisa que lo comunicarás al equipo.`;

    if (conoc.info?.descripcionNegocio) systemPrompt += `\n\nNEGOCIO: ${conoc.info.descripcionNegocio}`;

    if (conoc.servicios?.length > 0) {
      const svcs = conoc.servicios.filter(s=>s.nombre).slice(0,10)
        .map(s => `- ${s.nombre}${s.precio ? ': $'+Number(s.precio).toLocaleString('es-CO')+' COP':''}`).join('\n');
      systemPrompt += `\n\nSERVICIOS:\n${svcs}`;
    }

    if (conoc.horarios?.general) systemPrompt += `\nHORARIO: ${conoc.horarios.general}`;
    if (cb.whatsapp) systemPrompt += `\nWHATSAPP: ${cb.whatsapp}`;

    if (conoc.permitePedidos) {
      systemPrompt += `\n\nPEDIDOS: Acepta pedidos por chat. Al confirmar: PEDIDO_CONFIRMADO: {"items":["item1"],"total":"MONTO","cliente":"NOMBRE","telefono":"TEL"}`;
    }

    // 7. OpenAI
    const msgs = [{ role:'system', content:systemPrompt }];
    (historial || []).slice(-8).forEach(m => {
      msgs.push({ role: m.role==='user'?'user':'assistant', content: m.content });
    });
    msgs.push({ role:'user', content:texto });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 300, temperature: 0.6, messages: msgs,
    });

    let respuesta     = completion.choices[0]?.message?.content || '';
    const tokensUsados = completion.usage?.total_tokens || 0;

    // 8. Procesar PEDIDO_CONFIRMADO
    let pedidoData = null;
    const pedidoMatch = respuesta.match(/PEDIDO_CONFIRMADO:\s*(\{[^}]+\})/);
    if (pedidoMatch) {
      try {
        pedidoData = JSON.parse(pedidoMatch[1]);
        respuesta  = respuesta.replace(/\n?PEDIDO_CONFIRMADO:.*$/m, '').trim();
        await adminDb.collection('chatbots').doc(chatbotId).collection('pedidos').add({
          ...pedidoData, sessionId, creadoEn: FieldValue.serverTimestamp(),
        });
      } catch {}
    }

    // 9. Actualizar stats
    await adminDb.collection('chatbots').doc(chatbotId).update({
      tokensUsados:   FieldValue.increment(tokensUsados),
      conversaciones: FieldValue.increment(1),
    }).catch(() => {});

    // 10. Guardar conversación
    const convRef = adminDb.collection('chatbots').doc(chatbotId).collection('conversaciones').doc(sessionId);
    await convRef.set({ sessionId, ultimoTexto:texto, ultimoMensaje:FieldValue.serverTimestamp() }, { merge:true });
    await convRef.collection('mensajes').add({ rol:'usuario', texto, creadoEn:FieldValue.serverTimestamp() });
    await convRef.collection('mensajes').add({ rol:'bot', texto:respuesta, creadoEn:FieldValue.serverTimestamp() });

    return res.json({ respuesta, pedido: pedidoData });

  } catch (err) {
    console.error('chatbot-responder:', err);
    return res.status(500).json({ error: err.message, respuesta: 'Error al procesar. Intenta de nuevo.' });
  }
}
