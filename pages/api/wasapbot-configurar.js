// pages/api/wasapbot-configurar.js
// Configura el bot de WhatsApp con el System Prompt generado por IA según el tipo de empresa

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

// ── Propuestas de valor por sector ────────────────────────────────────────────
const PROPUESTAS = {
  estetica:          'Tratamientos faciales y corporales de alta calidad, resultados visibles desde la primera sesión',
  salon:             'Especialistas en corte, color y tratamientos capilares. Tu cabello en las mejores manos',
  spa:               'Escapa del estrés con nuestros masajes y tratamientos de bienestar en un ambiente de total relajación',
  dental:            'Tu sonrisa perfecta con tecnología avanzada. Revisiones, limpiezas e implantes con garantía',
  restaurante:       'Cocina de autor con ingredientes frescos. Reserva tu mesa y disfruta de una experiencia única',
  clinica:           'Atención médica personalizada y rápida. Tu salud en manos de los mejores especialistas',
  gimnasio:          'Transforma tu cuerpo con nuestros entrenamientos personalizados y clases grupales 7 días',
  inmobiliaria:      'Encontramos la propiedad ideal para ti. Compra, alquiler y gestión sin complicaciones',
  tienda:            'Los mejores productos al mejor precio. Atención personalizada y envío rápido a toda España',
  educacion:         'Formación de calidad adaptada a tu ritmo. Cursos presenciales y online con certificación',
  veterinaria:       'El mejor cuidado para tu mascota. Consultas, vacunas y urgencias con amor y profesionalidad',
  otro:              'Servicio profesional y personalizado. Calidad garantizada y atención al cliente excepcional',
};

// ── Servicios por sector ──────────────────────────────────────────────────────
const SERVICIOS_DEFAULT = {
  estetica:          ['Limpieza facial profunda', 'Depilación láser', 'Tratamiento antiedad', 'Peeling', 'Microblading'],
  salon:             ['Corte y peinado', 'Coloración y mechas', 'Keratina', 'Manicura y pedicura', 'Tratamiento capilar'],
  spa:               ['Masaje relajante 60min', 'Masaje deportivo', 'Circuito spa', 'Aromaterapia', 'Envoltura corporal'],
  dental:            ['Revisión y limpieza', 'Ortodoncia invisible', 'Blanqueamiento', 'Implantes', 'Urgencias dentales'],
  restaurante:       ['Menú del día', 'Carta', 'Reserva de mesa para grupos', 'Eventos privados', 'Delivery'],
  clinica:           ['Consulta médica general', 'Especialidades', 'Análisis clínicos', 'Revisión anual', 'Urgencias'],
  gimnasio:          ['Membresía mensual', 'Entrenamiento personal', 'Clases yoga/pilates', 'Crossfit', 'Nutrición'],
  inmobiliaria:      ['Compra de piso', 'Alquiler residencial', 'Locales comerciales', 'Tasación gratuita', 'Gestión alquiler'],
  tienda:            ['Consulta de stock', 'Pedido online', 'Envío a domicilio', 'Devoluciones', 'Asesoramiento'],
  educacion:         ['Clases particulares', 'Cursos grupales', 'Matrículas', 'Formación online', 'Tutorías'],
  veterinaria:       ['Consulta general', 'Vacunaciones', 'Cirugía', 'Peluquería canina', 'Urgencias 24h'],
  otro:              ['Consulta inicial gratuita', 'Servicio principal', 'Pack completo', 'Asesoría personalizada'],
};

// ── Tonos por sector ──────────────────────────────────────────────────────────
const TONOS = {
  estetica:    'cálido, cercano y profesional. Usa emojis con moderación (💆✨)',
  salon:       'amigable, fashionista y entusiasta. Usa emojis con moderación (✂️💅)',
  spa:         'sereno, cálido y relajante. Evita prisas. Usa emojis suaves (🌿💆)',
  dental:      'profesional, tranquilizador y claro. Transmite confianza (🦷😊)',
  restaurante: 'dinámico, apetecible y hospitalario. Usa emojis de comida con moderación (🍽️)',
  clinica:     'profesional, empático y claro. Prioriza la tranquilidad del paciente (❤️)',
  gimnasio:    'motivador, energético y directo. Usa emojis de fitness (💪🏋️)',
  inmobiliaria:'profesional, confiable y orientado a resultados (🏠)',
  tienda:      'amigable, servicial y orientado al cliente (🛒✨)',
  educacion:   'motivador, cercano y formativo (📚🎓)',
  veterinaria: 'cálido, amigable con mascotas y profesional (🐾❤️)',
  otro:        'profesional, amigable y orientado al cliente',
};

// ── Generar System Prompt con IA ──────────────────────────────────────────────
async function generarSystemPrompt(tipo, nombreEmpresa, descripcion) {
  const propuesta = PROPUESTAS[tipo] || PROPUESTAS.otro;
  const servicios = SERVICIOS_DEFAULT[tipo] || SERVICIOS_DEFAULT.otro;
  const tono = TONOS[tipo] || TONOS.otro;

  const promptMeta = `Eres un Ingeniero de Prompts especialista en chatbots de WhatsApp para empresas españolas.

Genera un System Prompt completo y optimizado para el agente IA de WhatsApp de la siguiente empresa:

DATOS DE LA EMPRESA:
- Nombre: ${nombreEmpresa}
- Sector: ${tipo}
- Propuesta de valor: ${propuesta}
- Servicios principales: ${servicios.join(', ')}
- Descripción adicional: ${descripcion || 'No proporcionada'}
- País: España
- Tono de comunicación: ${tono}

REQUISITOS DEL SYSTEM PROMPT QUE DEBES GENERAR:
1. Rol claro del bot (asistente de ${nombreEmpresa})
2. Personalidad y tono adaptado al sector
3. Mensaje de bienvenida inicial (máximo 3 líneas, con CTA)
4. Flujo de reserva de cita: recoger nombre, servicio, fecha y hora
5. Respuesta a preguntas frecuentes del sector
6. Información de contacto y horario (usa placeholders genéricos si no se proporcionan)
7. Regla de escalado: cuándo derivar a humano
8. Formato de respuesta: conciso, máximo 4 líneas por mensaje

Genera SOLO el System Prompt, sin explicaciones ni comentarios. Empieza con "Eres..."`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.6,
        messages: [{ role: 'user', content: promptMeta }],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || generarPromptFallback(tipo, nombreEmpresa, propuesta, servicios, tono);
  } catch {
    return generarPromptFallback(tipo, nombreEmpresa, propuesta, servicios, tono);
  }
}

// ── Prompt de fallback si OpenAI falla ───────────────────────────────────────
function generarPromptFallback(tipo, nombreEmpresa, propuesta, servicios, tono) {
  return `Eres el asistente virtual de WhatsApp de ${nombreEmpresa}, ${tipo} en España.

PERSONALIDAD: ${tono}
PROPUESTA DE VALOR: ${propuesta}
SERVICIOS: ${servicios.join(', ')}

MENSAJE DE BIENVENIDA (úsalo cuando el cliente escriba por primera vez):
"👋 ¡Hola! Soy el asistente de *${nombreEmpresa}*. ${propuesta}. ¿En qué puedo ayudarte hoy? 👇"

FLUJO DE RESERVA:
1. Pregunta el servicio deseado
2. Pregunta nombre completo
3. Pregunta fecha y hora preferida
4. Confirma: "✅ Perfecto [nombre], te apunto para [servicio] el [fecha] a las [hora]h. ¡Te esperamos!"

REGLAS:
- Máximo 4 líneas por mensaje (es WhatsApp, no email)
- Termina siempre con una pregunta o acción sugerida
- Si no sabes algo, di que consultarás con el equipo
- Nunca confirmes precios exactos sin verificar
- Si el cliente está molesto o insiste en hablar con una persona, di: "Entendido, ahora mismo aviso a nuestro equipo para que te contacte en breve 🙏"
- Responde únicamente en español`;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empresaId, botTipo, nombreEmpresa, descripcion } = req.body;
  if (!empresaId || !botTipo || !nombreEmpresa) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const db = getDb();

    // Generar System Prompt personalizado con IA
    const systemPrompt = await generarSystemPrompt(botTipo, nombreEmpresa, descripcion);
    const servicios = SERVICIOS_DEFAULT[botTipo] || SERVICIOS_DEFAULT.otro;

    // Guardar configuración en Firestore
    await db.collection('empresas').doc(empresaId).set({
      botTipo,
      nombreEmpresa,
      descripcionBot: descripcion || '',
      botSystemPrompt: systemPrompt,
      webServicios: servicios,
      plantillaWeb: botTipo,
      botConfiguradoEn: admin.firestore.FieldValue.serverTimestamp(),
      botActivo: false, // Se activa cuando conecten el WhatsApp
    }, { merge: true });

    // Guardar agente en subcolección
    await db.collection('empresas').doc(empresaId)
      .collection('agentes').doc('principal').set({
        nombre: `Asistente de ${nombreEmpresa}`,
        activo: true,
        tipo: botTipo,
        promptGenerado: systemPrompt,
        personalidad: TONOS[botTipo] || 'amigable y profesional',
        descripcion: descripcion || PROPUESTAS[botTipo] || '',
        servicios,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

    console.log(`[WasapBot] ✅ Configurado para ${nombreEmpresa} (${botTipo})`);
    return res.status(200).json({ ok: true, systemPrompt });
  } catch (e) {
    console.error('[WasapBot] Error:', e.message);
    return res.status(500).json({ error: 'Error interno: ' + e.message });
  }
}
