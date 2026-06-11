// pages/api/chatbot-responder.js
// Procesa mensajes del widget y responde con OpenAI
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PLAN_TOKENS = { starter:30000, business:100000, agency:400000 };

export default async function handler(req, res) {
  // CORS
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

    // 2. Verificar tokens
    const planKey    = cb.plan || 'starter';
    const limite     = (PLAN_TOKENS[planKey] || 30000) + (cb.tokensExtra || 0);
    const usados     = cb.tokensUsados || 0;
    if (usados >= limite) {
      return res.json({ respuesta: 'Este chat ha alcanzado su limite de mensajes del mes. Para mas informacion contacta directamente al negocio.' });
    }

    // 3. Cargar conocimiento
    const conocSnap = await adminDb.collection('chatbots').doc(chatbotId)
      .collection('config').doc('conocimiento').get();
    const conoc = conocSnap.exists ? conocSnap.data() : {};

    // 4. System prompt
    let systemPrompt = `Eres el asistente de chat web de "${cb.nombre || cb.nombreEmpresa}", negocio de ${cb.industria || 'servicios'} en ${cb.ciudad || 'Colombia'}.

INSTRUCCIONES:
- Responde en espanol colombiano natural y amigable
- Respuestas concisas (max 3 oraciones)
- Si el cliente quiere un producto/servicio, confirma y pregunta datos para completar
- Si pide hablar con una persona, di que le informaras al equipo
- Usa el nombre del negocio cuando sea relevante`;

    if (conoc.info?.descripcionNegocio) {
      systemPrompt += `\n\nSOBRE EL NEGOCIO: ${conoc.info.descripcionNegocio}`;
    }

    if (conoc.servicios?.length > 0) {
      const svcs = conoc.servicios.filter(s=>s.nombre).slice(0,10)
        .map(s => `- ${s.nombre}${s.precio ? ': $' + Number(s.precio).toLocaleString('es-CO') + ' COP' : ''}${s.descripcion ? ' (' + s.descripcion + ')' : ''}`)
        .join('\n');
      systemPrompt += `\n\nSERVICIOS/PRODUCTOS:\n${svcs}`;
    }

    if (conoc.horarios?.general) {
      systemPrompt += `\nHORARIO: ${conoc.horarios.general}`;
    }

    if (cb.whatsapp) {
      systemPrompt += `\nWHATSAPP DIRECTO: ${cb.whatsapp}`;
    }

    if (conoc.info?.preguntasFrecuentes?.length > 0) {
      const faqs = conoc.info.preguntasFrecuentes.filter(f=>f.pregunta)
        .slice(0,5).map(f => `P: ${f.pregunta}`).join('\n');
      systemPrompt += `\n\nPREGUNTAS FRECUENTES:\n${faqs}`;
    }

    // Si permite pedidos
    if (conoc.permitePedidos) {
      systemPrompt += `\n\nSISTEMA DE PEDIDOS: Este negocio acepta pedidos por chat. Cuando el cliente pida productos, acumula el pedido y al final pregunta: nombre, telefono y si es para llevar o domicilio. Al confirmar agrega en nueva linea: PEDIDO_CONFIRMADO: {"items":["item1","item2"],"total":"MONTO","cliente":"NOMBRE","telefono":"TEL"}`;
    }

    // 5. OpenAI
    const msgs = [{ role:'system', content:systemPrompt }];
    if (historial?.length) {
      historial.slice(-8).forEach(function(m) {
        msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
      });
    }
    msgs.push({ role:'user', content:texto });

    const completion = await openai.chat.completions.create({
      model:      'gpt-4o-mini',
      max_tokens: 300,
      messages:   msgs,
      temperature: 0.7,
    });

    let respuesta = completion.choices[0]?.message?.content || '';
    const tokensUsados2 = completion.usage?.total_tokens || 0;

    // 6. Procesar PEDIDO_CONFIRMADO
    let pedidoData = null;
    const pedidoMatch = respuesta.match(/PEDIDO_CONFIRMADO:\s*(\{[^}]+\})/);
    if (pedidoMatch) {
      try {
        pedidoData = JSON.parse(pedidoMatch[1]);
        respuesta  = respuesta.replace(/\n?PEDIDO_CONFIRMADO:.*$/m, '').trim();
        // Guardar pedido
        await adminDb.collection('chatbots').doc(chatbotId)
          .collection('pedidos').add({
            ...pedidoData,
            sessionId,
            creadoEn: FieldValue.serverTimestamp(),
          });
      } catch {}
    }

    // 7. Actualizar estadisticas
    await adminDb.collection('chatbots').doc(chatbotId).update({
      tokensUsados:   FieldValue.increment(tokensUsados2),
      conversaciones: FieldValue.increment(1),
    }).catch(() => {});

    // 8. Guardar conversacion
    const convRef = adminDb.collection('chatbots').doc(chatbotId)
      .collection('conversaciones').doc(sessionId);
    await convRef.set({
      sessionId,
      ultimoTexto:   texto,
      ultimoMensaje: FieldValue.serverTimestamp(),
    }, { merge: true });
    await convRef.collection('mensajes').add({
      rol:'usuario', texto, creadoEn: FieldValue.serverTimestamp(),
    });
    await convRef.collection('mensajes').add({
      rol:'bot', texto:respuesta, creadoEn: FieldValue.serverTimestamp(),
    });

    // 9. Sugerir opciones si quedan productos
    let opciones = [];
    if (conoc.servicios?.length > 0 && respuesta.toLowerCase().includes('ayud')) {
      opciones = conoc.servicios.filter(s=>s.nombre).slice(0,3).map(s=>s.nombre);
    }

    return res.json({ respuesta, opciones, pedido: pedidoData });

  } catch (err) {
    console.error('chatbot-responder:', err);
    return res.status(500).json({ error: err.message, respuesta: 'Error al procesar tu mensaje. Intenta de nuevo.' });
  }
}
