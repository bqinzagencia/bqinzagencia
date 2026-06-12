// lib/filtroMensajes.js
// Filtro de mensajes irrelevantes o abusivos para chatbot y wasapbot
// Protege los créditos de la empresa rechazando mensajes que no tienen
// relación con la actividad del negocio o que son spam/trolling.
// Implementación igual a la de Intercom, Tidio y HubSpot Chat.

// ── Patrones de spam / troll / prueba ────────────────────────
const SPAM_PATTERNS = [
  /^(hola+|holaa+|holaaa+|ey+|oye+|hey+|hi+|hello+)[\s!?]*$/i,
  /^(jaja|jeje|lol|xd|:v|uwu|owo|💀|😂|🤣)+$/i,
  /^[a-z]{1,2}[\s!?]*$/i,                          // "a", "q", "k"
  /^[^a-záéíóúüña-z0-9]{1,5}$/i,                  // solo emojis o símbolos
  /^(test|testing|prueba|probando|123|abc|aaa+|bbb+|xxx+)[\s!?]*$/i,
  /^[.]{1,10}$|^[-_*]{1,10}$/,                     // solo puntos o guiones
  /fuck|puta|mierda|idiota|pendejo|gonorrea|hijueputa|malparido|hp\b/i,
  /\bporno?\b|\bsexo?\b|\bnudes?\b|\bpics?\b/i,
  /(dame dinero|préstame|me puedes dar|regálame)/i,
  /^(no sé|no se|no entiendo|que|qué|si|sí|no|ok|dale|listo|bien|bueno)[\s!?,.]*$/i,
  /^[0-9\s]+$/,                                     // solo números sin contexto
];

// ── Palabras clave que indican intención real ─────────────────
// Si el mensaje contiene alguna de estas, SIEMPRE pasa el filtro
const INTENT_KEYWORDS = [
  // Compra / servicio
  'precio', 'costo', 'cuanto', 'cuánto', 'valor', 'tarifa', 'cotiz',
  'quiero', 'necesito', 'busco', 'comprar', 'pedir', 'ordenar', 'encargar',
  'disponib', 'hay ', 'tienen', 'tienes', 'venden', 'ofrecen',
  // Contacto / ubicación
  'dirección', 'direccion', 'donde', 'dónde', 'ubicacion', 'ubicación',
  'horario', 'hora', 'abierto', 'cerrado', 'atienden', 'trabajan',
  'whatsapp', 'teléfono', 'telefono', 'contacto', 'llamar',
  // Información
  'información', 'informacion', 'info', 'detalles', 'como', 'cómo',
  'servicio', 'producto', 'menu', 'menú', 'catálogo', 'catalogo',
  'cita', 'turno', 'reserva', 'agenda', 'agendar', 'cita',
  // Pedido
  'pedido', 'domicilio', 'entrega', 'delivery', 'llevar', 'recog',
  'factura', 'pago', 'nequi', 'daviplata', 'transferencia', 'efectivo',
  // Problema / soporte
  'problema', 'queja', 'reclamo', 'devolución', 'garantía', 'error',
  'ayuda', 'ayúdame', 'auxilio', 'urgente', 'emergencia',
  // Saludo con contexto
  'buenos días', 'buenas tardes', 'buenas noches', 'buen día',
];

// ── Evaluador principal ───────────────────────────────────────
export function evaluarMensaje(texto, industria = '', historialLen = 0) {
  if (!texto || typeof texto !== 'string') return { pasar: false, razon: 'vacio' };

  const t = texto.trim();

  // Muy corto (menos de 3 chars) — ignorar
  if (t.length < 3) return { pasar: false, razon: 'muy_corto' };

  // Siempre pasar si tiene intención clara
  const tLower = t.toLowerCase();
  const tieneIntencion = INTENT_KEYWORDS.some(kw => tLower.includes(kw));
  if (tieneIntencion) return { pasar: true };

  // En conversación avanzada (más de 2 turnos) ser más permisivo
  // El cliente ya demostró interés, responder respuestas cortas como "sí", "ok"
  if (historialLen >= 2) return { pasar: true };

  // Verificar patrones de spam
  const esSpam = SPAM_PATTERNS.some(p => p.test(t));
  if (esSpam) return { pasar: false, razon: 'spam_pattern' };

  // Texto muy corto sin intención clara (menos de 8 chars)
  if (t.length < 8) return { pasar: false, razon: 'sin_contexto' };

  // Por defecto: pasar (no bloquear si no hay evidencia clara)
  return { pasar: true };
}

// ── Respuesta amigable cuando se bloquea ─────────────────────
export function respuestaFiltro(nombreEmpresa = 'este negocio') {
  const opciones = [
    `¡Hola! 👋 Estoy aquí para ayudarte con información sobre ${nombreEmpresa}. ¿En qué puedo ayudarte hoy?`,
    `Hola, soy el asistente de ${nombreEmpresa}. Cuéntame, ¿en qué te puedo ayudar?`,
    `¡Buen día! ¿Tienes alguna pregunta sobre nuestros servicios o productos?`,
  ];
  return opciones[Math.floor(Math.random() * opciones.length)];
}
