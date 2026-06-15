// pages/api/chat-asesor-wasapbot.js
// Endpoint que conecta el chat de soporte (AsesorWasapbot) con la IA (OpenAI)
//
// Este chat de soporte SI esta disponible para empresas sin plan activo
// (las ayuda a configurarse y a decidir si activan un plan), pero con:
//  1. Tope diario de mensajes por empresa (evita abuso/gasto de creditos
//     por scripts o personas malintencionadas).
//  2. Alcance limitado a temas de agencIAme/WasapBot via el system prompt
//     (si preguntan algo sin relacion, el bot redirige sin "actuar" como
//     un asistente general gratuito).
//  3. La empresa se verifica en Firestore con el empresaId — no se confia
//     en el objeto "empresa" que pudiera mandar el cliente.

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mensajes de soporte IA permitidos por empresa por dia (hora Colombia).
// Sin plan activo: igual puede usar el chat de soporte (para configurarse
// y decidir si activa un plan), pero con un tope menor. Con plan activo,
// un poco mas de margen.
const LIMITE_SIN_PLAN = 20;
const LIMITE_CON_PLAN = 60;

const MSG_LIMITE = 'Por hoy llegamos al límite de mensajes de soporte para tu cuenta. Si necesitas ayuda urgente, escríbenos directo por WhatsApp y te respondemos enseguida. [ESCALAR_ASESOR]';

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { mensajes, empresaId } = req.body;
  if (!mensajes || !Array.isArray(mensajes)) {
    return res.status(400).json({ error: 'Faltan mensajes' });
  }
  if (!empresaId) {
    return res.status(400).json({ error: 'Falta empresaId' });
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  try {
    // ── 1. Verificar la empresa real en Firestore (no confiar en el cliente) ──
    const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empSnap.exists) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    const empresa = empSnap.data();

    // ── 2. Tope diario de mensajes de soporte (aplica con o sin plan) ──
    const fechaKey = hoyKey();
    const usoRef   = adminDb.collection('soporte_ia_uso').doc(`${empresaId}_${fechaKey}`);
    const usoSnap  = await usoRef.get();
    const usado    = usoSnap.exists ? (usoSnap.data().count || 0) : 0;
    const limite   = empresa.planActivo === true ? LIMITE_CON_PLAN : LIMITE_SIN_PLAN;

    if (usado >= limite) {
      return res.json({ ok: true, respuesta: MSG_LIMITE });
    }

    // ── 3. System prompt ──
    const systemPrompt = `Eres el asistente de soporte de agencIAme para la plataforma WasapBot.
Eres amable, claro y directo. Respondes en espanol colombiano natural.

REGLA PRINCIPAL: SOLO ayudas con temas de agencIAme, el panel/dashboard, WasapBot, los planes y la configuracion de la plataforma. Si te preguntan algo SIN relacion con esto (tareas externas, temas generales, otros productos, "hazme esto", preguntas de cultura general, etc.), responde amablemente que solo puedes ayudar con temas de agencIAme/WasapBot, y sugiere contactar soporte humano si necesitan algo distinto. No actues como un asistente de proposito general.

EMPRESA CON LA QUE HABLAS:
- Nombre: ${empresa?.nombreEmpresa || 'Cliente'}
- Industria: ${empresa?.industria || 'negocio'}
- Plan actual: ${empresa?.plan || empresa?.planWasapbot || 'sin plan'}
- Plan activo: ${empresa?.planActivo ? 'Si' : 'No - necesita activar un plan para usar las funciones'}
- Email: ${empresa?.email || 'no registrado'}

TU CONOCIMIENTO DEL PANEL:
- INICIO: estadisticas de conversaciones del dia/semana/total y consumo del plan
- MENU/CATALOGO: donde agregan platos o productos con nombre, precio, descripcion y foto. El bot usa esto para responder a clientes por WhatsApp
- CONVERSACIONES: historial de chats de WhatsApp con clientes (requiere plan activo)
- CITAS/AGENDA: el bot agenda citas automaticamente por WhatsApp (requiere plan activo)
- CONFIGURACION: para conectar WhatsApp con codigo QR o codigo por numero de telefono
- INVENTARIO Y VENTAS: registrar entradas (compras) y salidas (ventas), ver ganancias diarias y mensuales (requiere plan)
- MENU DEL DIA: abrir el menu diario con porciones disponibles, el bot solo ofrece lo que tiene stock (requiere plan)
- PEDIDOS DEL DIA: ver y gestionar pedidos en tiempo real, configurar numero Nequi para pagos (requiere plan)

COMO CONECTAR WHATSAPP:
1. Ir a Configuracion en el panel lateral
2. Elegir QR (escanear con otro telefono que tenga WhatsApp) o codigo por numero
3. En WhatsApp del celular a conectar: Ajustes -> Dispositivos vinculados -> Vincular dispositivo

PLANES DISPONIBLES:
- Basico $189.000/mes: bot IA 24/7, 500 conversaciones, catalogo, citas, inventario basico
- Estandar $390.000/mes: todo lo basico + 1500 convs, panel de pedidos, reportes, broadcasts
- Pro $690.000/mes: todo estandar + 4000 convs, pagina web automatica, CRM avanzado, recordatorios de citas

REGLAS IMPORTANTES:
- Se MUY breve: maximo 3-4 oraciones por respuesta
- Usa lenguaje simple y directo, sin tecnicismos
- Si el problema es de facturacion, pago no acreditado o error grave del sistema, escala
- Si llevas mas de 4 mensajes sin poder resolver el problema, escala
- Si el usuario dice que quiere hablar con una persona real o asesor, escala
- ESCALAR: cuando detectes que debes trasladar al asesor humano, agrega al FINAL de tu respuesta exactamente esto: [ESCALAR_ASESOR]
- NO escales por preguntas simples de uso del panel`;

    const msgs = [
      { role: 'system', content: systemPrompt },
      ...mensajes.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      temperature: 0.6,
      messages: msgs,
    });

    const respuesta = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    // ── 4. Registrar el mensaje en el contador diario ──
    await usoRef.set({ empresaId, fecha: fechaKey, count: FieldValue.increment(1) }, { merge: true }).catch(() => {});

    return res.json({ ok: true, respuesta });
  } catch (err) {
    console.error('chat-asesor-wasapbot error:', err.message);
    return res.status(500).json({ error: err.message, respuesta: 'Error de conexion. Contactame por WhatsApp al 310-505-6616.' });
  }
}
