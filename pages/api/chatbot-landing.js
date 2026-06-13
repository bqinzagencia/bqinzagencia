// pages/api/chatbot-landing.js
// Chatbot de demostración para la página principal de BQinzagencIA

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Faltan mensajes' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'API no configurada' });

  const systemPrompt = `Eres el asistente virtual de BQinzagencIA, una agencia española especializada en automatización con IA para centros de estética, salones de belleza, spas, clínicas dentales y medicina estética.

Tu misión: Informar a posibles clientes sobre los servicios, resolver dudas y motivarles a registrarse.

SOBRE BQINZAGENCIA:
- Automatizamos citas, WhatsApp 24/7, llamadas con IA de voz, recordatorios y cobro de señales
- Especialidades: Estética, Salón de Belleza, Spa & Masajes, Clínica Dental, Medicina Estética
- Resultados: -65% no-shows, +38% citas recuperadas, 8-12 llamadas perdidas al día recuperadas
- Planes: Starter 89€/mes, Básico 199€/mes, Pro 569€/mes
- Sin permanencia, cancela cuando quieras
- Configuración en menos de 24 horas
- Soporte en España: bqinzagencia@gmail.com

REGLAS IMPORTANTES:
- Responde SIEMPRE en español, máximo 3-4 líneas por respuesta
- Sé amigable, entusiasta y profesional
- Si preguntan por precio, menciona los tres planes disponibles
- Nunca menciones días gratis ni pruebas gratuitas
- Si quieren una demo, invítales a registrarse
- Nunca inventes datos que no conozcas
- Termina siempre con una pregunta o CTA breve`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('[Chatbot landing] OpenAI error:', err);
      return res.status(500).json({ reply: 'Lo siento, hay un problema técnico. Escríbenos a hola@bqinzagencia.com 📧' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No pude procesar tu mensaje, inténtalo de nuevo.';
    return res.status(200).json({ reply });
  } catch (e) {
    console.error('[Chatbot landing] Error:', e.message);
    return res.status(500).json({ reply: 'Error de conexión. Por favor inténtalo de nuevo.' });
  }
}
