// pages/api/wasapbot/activar.js
// API para activar el WasapBot de un cliente nuevo
// Versión corregida: maneja FIREBASE_PRIVATE_KEY con o sin \n literales

let _db = null;

function getDb() {
  // Evitar reinicializar
  if (_db) return _db;

  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    // Limpiar la private key — Vercel la guarda con \n literales
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

    // Si viene con \n literales (como string escapado), los convertimos
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Si no empieza con -----BEGIN, algo está mal
    if (!privateKey.startsWith('-----BEGIN')) {
      // Intentar decodificar si viene en base64
      try {
        const decoded = Buffer.from(privateKey, 'base64').toString('utf8');
        if (decoded.startsWith('-----BEGIN')) privateKey = decoded;
      } catch {}
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  _db = require('firebase-admin').firestore();
  return _db;
}

const PROMPTS_POR_SECTOR = {
  restaurante:    `Eres el asistente de WhatsApp de este restaurante. Ayudas con: menú del día, precios, horarios, reservas de mesa y pedidos para llevar. Para reservar necesitas: nombre, número de personas, fecha y hora. Habla de forma cercana y usa emojis con moderación.`,
  barberia:       `Eres el asistente de WhatsApp de esta barbería. Ayudas con: servicios (corte, barba, cejas), precios y agenda. Para agendar necesitas: nombre, servicio, fecha y hora. Habla de forma relajada y moderna.`,
  estetica:       `Eres el asistente de WhatsApp de este centro de estética. Ayudas con: tratamientos, precios y citas. Para citas necesitas: nombre, servicio, fecha y hora. Sé elegante y profesional.`,
  salon:          `Eres el asistente de WhatsApp de este salón de belleza. Ayudas con: cortes, tintes, tratamientos y reservas. Para reservar: nombre, servicio, fecha y hora.`,
  clinica_dental: `Eres el asistente de WhatsApp de esta clínica dental. Para citas necesitas: nombre completo, motivo, si es paciente nuevo, fecha y hora preferida. Sé tranquilizador y profesional.`,
  veterinaria:    `Eres el asistente de WhatsApp de esta clínica veterinaria. Para citas necesitas: nombre del dueño, nombre/especie de la mascota, motivo y fecha.`,
  taller:         `Eres el asistente de WhatsApp de este taller mecánico. Para citas necesitas: nombre, tipo de vehículo (marca, modelo), servicio requerido, fecha y hora.`,
  inmobiliaria:   `Eres el asistente de WhatsApp de esta inmobiliaria. Para visitas necesitas: nombre, propiedad de interés, presupuesto aproximado y disponibilidad.`,
  gimnasio:       `Eres el asistente de WhatsApp de este gimnasio. Para inscripciones necesitas: nombre, objetivo y disponibilidad horaria.`,
  farmacia:       `Eres el asistente de WhatsApp de esta farmacia. Para medicamentos con receta indica que es necesario presentarla. Sé responsable y preciso.`,
  hotel:          `Eres el asistente de WhatsApp de este hotel. Para reservas necesitas: fechas de entrada/salida, número de personas, tipo de habitación.`,
  contabilidad:   `Eres el asistente de WhatsApp de este despacho de contabilidad. Para consultas necesitas: nombre, tipo de empresa o situación fiscal, y la consulta.`,
  otro:           `Eres el asistente de WhatsApp de este negocio. Respondes consultas, informas sobre productos/servicios y gestionas citas o pedidos. Sé amigable y profesional.`,
};

async function generarPromptPersonalizado(sector, nombreEmpresa, descripcion, openaiKey) {
  const base = PROMPTS_POR_SECTOR[sector] || PROMPTS_POR_SECTOR.otro;
  if (!descripcion?.trim() || !openaiKey) return base;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 350,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: 'Genera un prompt de sistema conciso (máximo 200 palabras) para el bot de WhatsApp de un negocio. En español. Práctico y específico. Solo el prompt, sin explicaciones.',
          },
          {
            role: 'user',
            content: `Negocio: "${nombreEmpresa}"\nSector: ${sector}\nDescripción: ${descripcion}\n\nBase:\n${base}\n\nPersonaliza con los detalles de este negocio.`,
          },
        ],
      }),
    });
    const data = await res.json();
    const prompt = data.choices?.[0]?.message?.content?.trim();
    return prompt || base;
  } catch {
    return base;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre, email, telefono, nombreEmpresa, sector, descripcion, ciudad, plan } = req.body;

  if (!email || !telefono || !nombreEmpresa || !sector) {
    return res.status(400).json({ error: 'Faltan datos obligatorios: email, teléfono, nombre del negocio y sector.' });
  }

  const telefonoNorm = telefono.replace(/[\s+\-()]/g, '');
  const emailNorm = email.toLowerCase().trim();

  try {
    const db = getDb();
    const admin = require('firebase-admin');

    // Verificar si ya existe este email
    const existente = await db.collection('wasapbot_clientes')
      .where('email', '==', emailNorm).limit(1).get();

    if (!existente.empty) {
      return res.status(200).json({
        success: true,
        empresaId: existente.docs[0].id,
        existente: true,
        mensaje: 'Ya tienes un bot activo con este email.',
      });
    }

    // Generar prompt con IA
    const promptGenerado = await generarPromptPersonalizado(
      sector, nombreEmpresa, descripcion, process.env.OPENAI_API_KEY
    );

    const ahora = admin.firestore.FieldValue.serverTimestamp();

    // Crear en wasapbot_clientes
    const docRef = await db.collection('wasapbot_clientes').add({
      nombre: nombre?.trim() || '',
      email: emailNorm,
      telefono: telefonoNorm,
      nombreEmpresa: nombreEmpresa.trim(),
      sector,
      descripcion: descripcion?.trim() || '',
      ciudad: ciudad?.trim() || '',
      plan: plan || 'starter',
      promptGenerado,
      botActivo: false,
      whatsappConectado: false,
      estado: 'pendiente_whatsapp',
      mensajesUsados: 0,
      creadoEn: ahora,
    });

    // Crear empresa en la colección principal (para que el webhook la reconozca)
    await db.collection('empresas').doc(docRef.id).set({
      nombreEmpresa: nombreEmpresa.trim(),
      email: emailNorm,
      telefono: telefonoNorm,
      industria: sector,
      ciudad: ciudad?.trim() || '',
      plan: plan || 'starter',
      planActivo: true,
      canal: 'wasapbot',
      creadoEn: ahora,
    });

    // Crear agente configurado con el prompt generado
    await db.collection('empresas').doc(docRef.id).collection('agentes').add({
      nombre: `Bot ${nombreEmpresa}`,
      personalidad: 'amigable, profesional y útil',
      prompt: promptGenerado,
      sector,
      activo: true,
      creadoEn: ahora,
    });

    console.log(`[WasapBot] ✅ Nuevo cliente: ${nombreEmpresa} (${sector}) — ${emailNorm}`);

    return res.status(200).json({
      success: true,
      empresaId: docRef.id,
      mensaje: `Bot configurado para ${nombreEmpresa}`,
      sector,
    });

  } catch (e) {
    console.error('[WasapBot] Error:', e.message);

    // Error específico de Firebase Admin key
    if (e.message?.includes('private_key') || e.message?.includes('credential')) {
      return res.status(500).json({
        error: 'Error de configuración del servidor. Contacta con soporte: bqinzagencia@gmail.com',
        detalle: 'Firebase credentials error',
      });
    }

    return res.status(500).json({ error: 'Error al activar el bot. Inténtalo de nuevo.' });
  }
}
