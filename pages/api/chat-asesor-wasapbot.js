// pages/api/chat-asesor-wasapbot.js
// Chat IA de agencIAme — modo ventas (visitantes) y modo soporte (clientes)

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../../components/AsesorWasapbot';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LIMITE_VISITANTE = 15;
const LIMITE_SIN_PLAN  = 20;
const LIMITE_CON_PLAN  = 60;

const MSG_LIMITE = 'Por hoy llegamos al límite de mensajes. Si necesitas más ayuda escríbenos por WhatsApp. [ESCALAR_ASESOR]';

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { mensajes, empresaId, modo = 'soporte' } = req.body;
  if (!mensajes || !Array.isArray(mensajes)) {
    return res.status(400).json({ error: 'Faltan mensajes' });
  }

  try {
    let empresa = null;
    let limiteKey = `visitante_${req.headers['x-forwarded-for'] || 'anon'}_${hoyKey()}`;
    let limite = LIMITE_VISITANTE;

    // Si hay empresaId, verificar en Firestore
    if (empresaId) {
      const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
      if (empSnap.exists) {
        empresa = empSnap.data();
        limiteKey = `${empresaId}_${hoyKey()}`;
        limite = empresa.planActivo === true ? LIMITE_CON_PLAN : LIMITE_SIN_PLAN;
      }
    }

    // Tope diario
    const usoRef  = adminDb.collection('soporte_ia_uso').doc(limiteKey);
    const usoSnap = await usoRef.get();
    const usado   = usoSnap.exists ? (usoSnap.data().count || 0) : 0;
    if (usado >= limite) {
      return res.json({ ok: true, respuesta: MSG_LIMITE });
    }

    // System prompt completo
    const systemPrompt = SYSTEM_PROMPT(empresa, modo);

    const msgs = [
      { role: 'system', content: systemPrompt },
      ...mensajes.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      temperature: 0.6,
      messages: msgs,
    });

    const respuesta = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    // Registrar uso
    await usoRef.set({
      fecha: hoyKey(),
      count: FieldValue.increment(1),
    }, { merge: true }).catch(() => {});

    return res.json({ ok: true, respuesta });

  } catch (err) {
    console.error('chat-asesor-wasapbot error:', err.message);
    return res.status(500).json({
      error: err.message,
      respuesta: 'Error de conexion. Puedes escribirnos al WhatsApp 310-505-6616.',
    });
  }
}
