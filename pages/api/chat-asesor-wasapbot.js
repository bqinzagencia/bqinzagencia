// pages/api/chat-asesor-wasapbot.js
// Endpoint que conecta el chat del asesor con la IA (OpenAI)

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { mensajes, empresa } = req.body;
  if (!mensajes || !Array.isArray(mensajes)) {
    return res.status(400).json({ error: 'Faltan mensajes' });
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: 'API key no configurada' });
  }

  const systemPrompt = `Eres el asistente de soporte de agencIAme para la plataforma WasapBot.
Eres amable, claro y directo. Respondes en espanol colombiano natural.

EMPRESA CON LA QUE HABLAS:
- Nombre: ${empresa?.nombreEmpresa || 'Cliente'}
- Industria: ${empresa?.industria || 'negocio'}
- Plan actual: ${empresa?.plan || 'sin plan'}
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

  try {
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

    return res.json({ ok: true, respuesta });
  } catch (err) {
    console.error('chat-asesor-wasapbot error:', err.message);
    return res.status(500).json({ error: err.message, respuesta: 'Error de conexion. Contactame por WhatsApp al 310-505-6616.' });
  }
}
