// pages/api/chat-publico.js
// Chat publico para el widget en el sitio web de cada empresa

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { messages, empresaNombre, industria, conocimiento } = req.body;
  if (!messages) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  const systemPrompt = [
    'Eres el asistente virtual de ' + (empresaNombre || 'la empresa') + ', un negocio de ' + (industria || 'servicios') + ' en Colombia.',
    conocimiento ? conocimiento : '',
    'Reglas: responde en espanol colombiano, tono amigable y profesional, maximo 3-4 lineas.',
    'Si el cliente quiere agendar, pide: nombre, servicio y fecha preferida.',
    'Si no sabes algo, dilo con honestidad y sugiere llamar o escribir por WhatsApp.',
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-8)],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Lo siento, intenta de nuevo.';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
