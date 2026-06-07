// pages/api/chat.js
// Motor de chat con OpenAI — NEXOIA

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { messages, agente, empresa } = req.body;
  if (!messages || !agente) return res.status(400).json({ error: 'Faltan parametros' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  const systemPrompt = [
    'Eres ' + agente.nombre + ', un asistente de IA ' + (agente.personalidad || 'amigable y profesional') + ' de ' + (empresa?.nombreEmpresa || 'la empresa') + '.',
    '',
    'INFORMACION DE LA EMPRESA:',
    '- Nombre: ' + (empresa?.nombreEmpresa || 'la empresa'),
    '- Industria: ' + (empresa?.industria || 'negocios'),
    '- Ciudad: ' + (empresa?.ciudad || 'Colombia'),
    '- Telefono: ' + (empresa?.telefono || ''),
    '',
    'TIPO DE AGENTE: ' + (agente.tipo || 'atencion'),
    agente.prompt ? '\nINSTRUCCIONES ESPECIFICAS:\n' + agente.prompt : '',
    '',
    'REGLAS:',
    '- Responde SIEMPRE en español colombiano, tono calido y cercano.',
    '- Se conciso, maximo 3-4 lineas por respuesta.',
    '- Si el cliente quiere agendar, pide: nombre, servicio y fecha preferida.',
    '- Si no sabes algo, dilo con honestidad.',
    '- Nunca inventes precios ni disponibilidad.',
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
    return res.status(200).json({ reply });
  } catch (e) {
    console.error('[Chat API] Error:', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
