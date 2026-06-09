// pages/api/widget-chat.js
import * as admin from 'firebase-admin';

function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : '',
      }),
    });
  }
  return admin.firestore();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age',       '86400');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Metodo no permitido' });

  const {
    messages,
    empresaId,
    clienteNombre,
    clienteTel,
    canal       = 'web',
    guardarLead,
    lead,
  } = req.body;

  if (!empresaId) return res.status(400).json({ error: 'Falta empresaId' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  try {
    const db = getAdminDb();

    // ── Guardar lead desde el formulario inicial (antes del primer mensaje) ──
    if (guardarLead && lead) {
      await db.collection('empresas').doc(empresaId).collection('contactos').doc().set({
        nombre:   lead.nombre   || 'Sin nombre',
        telefono: lead.telefono || '',
        email:    lead.email    || '',
        canal:    lead.canal    || 'web',          // 'web' o 'whatsapp'
        fuente:   'widget-' + (lead.canal || 'web'),
        estado:   'nuevo',
        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ ok: true });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Faltan mensajes' });
    }

    // ── Cargar datos de la empresa ──
    const empresaSnap = await db.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empresaSnap.data();

    // ── Cargar base de conocimiento ──
    let promptConocimiento = '';
    try {
      const cSnap = await db
        .collection('empresas').doc(empresaId)
        .collection('config').doc('conocimiento').get();
      if (cSnap.exists && cSnap.data().promptGenerado) {
        promptConocimiento = cSnap.data().promptGenerado;
      }
    } catch (e) {}

    // ── System prompt ──
    const nombreCliente = clienteNombre || 'el cliente';
    const canalLabel    = canal === 'whatsapp' ? 'WhatsApp' : 'chat web';

    const systemPrompt = [
      'Eres el asistente virtual de ' + (empresa.nombreEmpresa || 'la empresa') +
        ', un negocio de ' + (empresa.industria || 'servicios') + ' en Colombia.',
      'Estás atendiendo por ' + canalLabel + ' al cliente ' + nombreCliente +
        (clienteTel ? ' (tel: ' + clienteTel + ')' : '') + '.',
      promptConocimiento ||
        'Atiende a los clientes de ' + (empresa.nombreEmpresa || 'la empresa') +
        ' con amabilidad y profesionalismo.',
      'Reglas: responde en español colombiano, tono amigable, máximo 3-4 líneas por respuesta.',
      'Si el cliente quiere agendar, pide servicio y fecha preferida.',
      'Si no sabes algo, sugiere llamar o escribir directamente.',
    ].filter(Boolean).join('\n');

    // ── Llamada a OpenAI ──
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        max_tokens:  220,
        temperature: 0.7,
        messages:    [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-8),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data  = await response.json();
    const reply = data.choices[0]?.message?.content || 'Lo siento, intenta de nuevo.';

    // ── Guardar conversación en Firestore con canal ──
    try {
      await db.collection('empresas').doc(empresaId).collection('conversaciones').doc().set({
        nombreCliente: clienteNombre || 'Visitante',
        telefono:      clienteTel    || '',
        canal:         canal,                      // 'web' o 'whatsapp'
        ultimoTexto:   messages[messages.length - 1]?.content || '',
        ultimaRespuesta: reply,
        ultimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
        totalMensajes: messages.length,
      }, { merge: true });
    } catch (e) {}

    return res.status(200).json({ reply });

  } catch (e) {
    console.error('[Widget Chat]', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
}
