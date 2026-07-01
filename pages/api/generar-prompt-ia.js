// pages/api/generar-prompt-ia.js
// Genera un prompt profesional para el agente WhatsApp de una empresa
// usando GPT-4o-mini basándose en la información que ya tiene en su panel.
import { db as adminDb } from '../../lib/firebaseAdmin';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId, datosManuales } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

  try {
    // Leer datos de la empresa
    const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empSnap.data();

    // Leer conocimiento (catálogo, horarios)
    const conocSnap = await adminDb.collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get();
    const conocimiento = conocSnap.exists ? conocSnap.data() : {};

    // Leer agente actual si existe
    const agentesSnap = await adminDb.collection('empresas').doc(empresaId)
      .collection('agentes').where('activo', '==', true).get();
    const agenteActual = agentesSnap.docs[0]?.data() || {};

    // Construir contexto
    const servicios = (conocimiento.servicios || [])
      .filter(s => s.nombre?.trim())
      .map(s => `- ${s.nombre}${s.precio ? ` (${s.precio}€)` : ''}${s.descripcion ? `: ${s.descripcion}` : ''}`)
      .join('\n');

    const horario = conocimiento.horarios?.general || '';

    const contexto = `
EMPRESA: ${empresa.nombreEmpresa || 'Sin nombre'}
INDUSTRIA: ${empresa.industria || 'otro'}
CIUDAD: ${empresa.ciudad || 'España'}
EMAIL: ${empresa.email || ''}
TELÉFONO: ${empresa.telefono || ''}

PRODUCTOS/SERVICIOS:
${servicios || 'Sin servicios configurados'}

HORARIO: ${horario || 'No especificado'}

INFORMACIÓN ADICIONAL DEL DUEÑO:
${datosManuales || 'Sin información adicional'}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `Eres un experto en crear prompts de IA para bots de WhatsApp de negocios españoles.
Tu tarea es generar un prompt profesional, completo y persuasivo para el agente de WhatsApp de un negocio.
El prompt debe:
1. Describir claramente qué es el negocio y qué ofrece
2. Listar productos/servicios con precios si los hay
3. Incluir el horario de atención
4. Definir el tono del bot (profesional, cercano, en español de España)
5. Incluir instrucciones de cómo manejar consultas, citas o pedidos
6. Mencionar formas de contacto/pago si aplica
7. Ser específico para la industria del negocio

Formato: texto directo sin markdown excesivo, máximo 600 palabras, estructurado en secciones claras con títulos en mayúsculas.
IMPORTANTE: Escribe en español de España (usa "móvil" no "celular", "vosotros" si aplica, precios en €).`
        },
        {
          role: 'user',
          content: `Genera un prompt profesional para el agente WhatsApp de este negocio:\n\n${contexto}`
        }
      ]
    });

    const promptGenerado = completion.choices[0]?.message?.content || '';

    // Guardar en el agente si existe
    if (agentesSnap.docs[0]) {
      await agentesSnap.docs[0].ref.update({
        promptGeneradoIA: promptGenerado,
        promptGeneradoEn: new Date(),
      });
    }

    return res.json({ ok: true, prompt: promptGenerado });

  } catch (err) {
    console.error('generar-prompt-ia error:', err);
    return res.status(500).json({ error: err.message });
  }
}
