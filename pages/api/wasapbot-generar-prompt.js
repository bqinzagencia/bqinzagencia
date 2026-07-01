// pages/api/wasapbot-generar-prompt.js
// Genera automáticamente un prompt profesional para el agente IA de WhatsApp
// basado en los datos de la empresa (industria, ciudad, servicios existentes).
// El cliente lo puede usar tal cual o editarlo desde el panel.
import { db as adminDb } from '../../lib/firebaseAdmin';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

  try {
    const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empSnap.data();

    // Leer servicios/productos ya configurados en el catálogo
    const conocSnap = await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get().catch(() => null);
    const serviciosExistentes = conocSnap?.exists
      ? (conocSnap.data().servicios || []).filter(s => s.nombre?.trim())
      : [];

    const serviciosTexto = serviciosExistentes.length > 0
      ? serviciosExistentes.map(s =>
          `- ${s.nombre}${s.precio ? `: ${s.precio}€` : ''}${s.duracionMin ? ` (${s.duracionMin} min)` : ''}${s.descripcion ? ` — ${s.descripcion}` : ''}`
        ).join('\n')
      : '(sin servicios configurados aún — el agente deberá completarlos)';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Genera un prompt profesional en español de España para configurar un agente de IA de WhatsApp para el siguiente negocio:

NOMBRE: ${empresa.nombreEmpresa || 'Negocio'}
INDUSTRIA: ${empresa.industria || 'otro'}
CIUDAD: ${empresa.ciudad || 'España'}
EMAIL: ${empresa.email || ''}

SERVICIOS/PRODUCTOS YA CONFIGURADOS:
${serviciosTexto}

El prompt debe:
1. Definir la personalidad del agente (profesional, cercano, español de España)
2. Incluir los servicios y precios listados arriba
3. Definir una estrategia de atención clara (saludo → identificar necesidad → ofrecer servicio → agendar/cerrar)
4. Incluir reglas de tono (máximo 2-3 frases, usar €, tuteo, no inventar)
5. Terminar con una sección de manejo de objeciones básicas
6. Estar listo para pegar directamente en el campo "Prompt del agente"

Formato: texto plano, sin markdown, máximo 400 palabras. En español de España.`
      }],
    });

    const promptGenerado = completion.choices[0]?.message?.content || '';
    return res.json({ ok: true, prompt: promptGenerado.trim() });

  } catch (err) {
    console.error('wasapbot-generar-prompt error:', err);
    return res.status(500).json({ error: err.message });
  }
}
