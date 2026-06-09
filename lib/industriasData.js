// lib/industriasData.js
export const INDUSTRIAS_DETALLE = {
  taller: {
    slug: 'taller',
    nombre: 'Talleres & Mecánica',
    emoji: '🔧',
    color: '#FF6B6B',
    colorBg: 'rgba(255,107,107,0.08)',
    colorBorder: 'rgba(255,107,107,0.2)',
    tagline: 'Tu taller en piloto automático',
    descripcion: 'Automatiza citas, presupuestos y seguimiento de vehículos. Tu agente IA atiende clientes por WhatsApp las 24 horas, agenda revisiones y envía recordatorios automáticos.',
    heroStats: [
      { valor: '3x', label: 'Más citas agendadas' },
      { valor: '80%', label: 'Menos llamadas perdidas' },
      { valor: '24/7', label: 'Atención continua' },
    ],
    funciones: [
      { icon: '📅', titulo: 'Agendamiento automático de citas', desc: 'Tu agente recibe solicitudes por WhatsApp, consulta disponibilidad y agenda la cita sin que intervengas. El cliente recibe confirmación inmediata.' },
      { icon: '🚗', titulo: 'Historial de vehículos', desc: 'Registra automáticamente cada vehículo: placa, modelo, año, servicios realizados y próximo mantenimiento recomendado.' },
      { icon: '💰', titulo: 'Presupuestos automáticos', desc: 'El agente genera cotizaciones preliminares basadas en la descripción del problema. Envía al cliente y espera aprobación.' },
      { icon: '🔔', titulo: 'Recordatorios de mantenimiento', desc: 'Sistema de recordatorios automáticos: "Tu vehículo necesita revisión de aceite en 500 km". Fideliza clientes sin esfuerzo.' },
      { icon: '💬', titulo: 'Seguimiento de reparaciones', desc: 'Notifica al cliente el estado de su vehículo: recibido, en diagnóstico, en reparación, listo para recoger.' },
      { icon: '⭐', titulo: 'Reseñas automáticas', desc: 'Al terminar el servicio, el agente pide reseña en Google y guarda feedback en tu CRM para mejorar continuamente.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola, necesito cambio de aceite para mi Mazda 3 2020' },
      { rol: 'agente', texto: '¡Hola! Con gusto te ayudo 👋 El cambio de aceite para tu Mazda 3 2020 tiene un valor aproximado de $80.000 COP e incluye filtro. ¿Te gustaría agendar una cita?' },
      { rol: 'cliente', texto: 'Sí, ¿tienen disponibilidad mañana?' },
      { rol: 'agente', texto: 'Claro, mañana tenemos disponible: 8:00am, 10:30am y 2:00pm. ¿Cuál prefieres? 😊' },
      { rol: 'cliente', texto: '10:30 am perfecto' },
      { rol: 'agente', texto: '✅ ¡Listo! Cita confirmada para mañana a las 10:30am. Te enviaré un recordatorio 1 hora antes. ¿Cuál es tu placa para registrar el vehículo?' },
    ],
    casos: [
      { nombre: 'AutoCenter Medellín', resultado: 'Pasó de 8 a 23 citas semanales en el primer mes' },
      { nombre: 'Taller Don Pedro', resultado: 'Redujo llamadas perdidas en un 85%' },
      { nombre: 'Mecánica Express Cali', resultado: 'Recuperó 40 clientes inactivos con recordatorios IA' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'profesional',
  },

  peluqueria: {
    slug: 'peluqueria',
    nombre: 'Peluquerías & Spa',
    emoji: '✂️',
    color: '#EC4899',
    colorBg: 'rgba(236,72,153,0.08)',
    colorBorder: 'rgba(236,72,153,0.2)',
    tagline: 'Tu agenda llena, tú enfocada en crear',
    descripcion: 'Olvídate de responder mensajes todo el día. Tu agente IA gestiona reservas, confirma citas, recuerda a los clientes y fideliza tu base con mensajes personalizados.',
    heroStats: [
      { valor: '4h', label: 'Ahorradas por día' },
      { valor: '95%', label: 'Tasa de confirmación' },
      { valor: '2x', label: 'Más reseñas Google' },
    ],
    funciones: [
      { icon: '📅', titulo: 'Reservas 24/7 por WhatsApp', desc: 'Tus clientes reservan a cualquier hora, incluso de madrugada. El agente conoce tu agenda y nunca doble-agenda.' },
      { icon: '💆', titulo: 'Catálogo de servicios con precios', desc: 'El agente informa precios, duración y disponibilidad de cada servicio: corte, color, keratina, manicure, masajes.' },
      { icon: '🔔', titulo: 'Recordatorios automáticos', desc: 'WhatsApp automático 24h y 1h antes de la cita. Reduce las no-shows hasta un 70%.' },
      { icon: '🎂', titulo: 'Fidelización de clientes', desc: 'El sistema recuerda cumpleaños y envía descuentos especiales automáticamente a tus clientes frecuentes.' },
      { icon: '📸', titulo: 'Portafolio digital', desc: 'Integra tu Instagram al agente para que los clientes vean tu trabajo antes de reservar.' },
      { icon: '💳', titulo: 'Gestión de pagos', desc: 'Informa métodos de pago, genera links de pago con Wompi y registra transacciones en tu CRM.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Buenas, ¿cuánto vale el balayage?' },
      { rol: 'agente', texto: '¡Hola! El balayage tiene un valor desde $180.000 COP dependiendo del largo y el efecto. ⏱️ Dura aproximadamente 3 horas. ¿Te gustaría ver ejemplos de nuestro trabajo?' },
      { rol: 'cliente', texto: 'Sí por favor, y también quiero saber disponibilidad para el sábado' },
      { rol: 'agente', texto: 'Aquí te dejo nuestro Instagram con trabajos recientes 👉 @estudio_elegance\n\nPara el sábado tenemos: 9:00am, 11:00am y 1:00pm disponibles. ¿Cuál te queda mejor? 💇‍♀️' },
      { rol: 'cliente', texto: '11am porfa, soy Patricia' },
      { rol: 'agente', texto: '✅ ¡Patricia, tu cita de balayage está confirmada para el sábado a las 11am! Te recuerdo el viernes. ¿Tienes alguna pregunta sobre el cuidado previo?' },
    ],
    casos: [
      { nombre: 'Studio Glam Bogotá', resultado: 'Llena el 100% de la agenda cada semana sin esfuerzo' },
      { nombre: 'Spa Natura Cali', resultado: 'Aumentó ventas de tratamientos premium en 60%' },
      { nombre: 'Peluquería Vogue', resultado: 'Eliminó por completo las citas no atendidas' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'emprendedor',
  },

  inmobiliaria: {
    slug: 'inmobiliaria',
    nombre: 'Inmobiliarias',
    emoji: '🏠',
    color: '#3B82F6',
    colorBg: 'rgba(59,130,246,0.08)',
    colorBorder: 'rgba(59,130,246,0.2)',
    tagline: 'Tu agente inmobiliario que nunca descansa',
    descripcion: 'Filtra prospectos automáticamente, muestra propiedades, responde preguntas técnicas y agenda visitas. Tus asesores solo atienden clientes listos para comprar o arrendar.',
    heroStats: [
      { valor: '5x', label: 'Más leads calificados' },
      { valor: '60%', label: 'Menos tiempo en filtrado' },
      { valor: '24/7', label: 'Atención de prospectos' },
    ],
    funciones: [
      { icon: '🏘️', titulo: 'Catálogo de propiedades inteligente', desc: 'El agente pregunta: presupuesto, zona, habitaciones y tipo. Filtra y muestra solo las propiedades que encajan con el prospecto.' },
      { icon: '📋', titulo: 'Calificación automática de leads', desc: 'Clasifica prospectos por nivel de urgencia, capacidad económica e intención de compra. Tu equipo enfoca esfuerzos donde vale.' },
      { icon: '📅', titulo: 'Agenda de visitas automática', desc: 'El agente coordina visitas, confirma al prospecto y al asesor, y envía la dirección y detalles automáticamente.' },
      { icon: '📊', titulo: 'Seguimiento post-visita', desc: 'Después de cada visita, el agente hace seguimiento: ¿qué te pareció? ¿tienes preguntas? ¿quieres hacer oferta?' },
      { icon: '📄', titulo: 'Información técnica de inmuebles', desc: 'Estrato, área, precio, administración, parqueadero, piso, antigüedad. El agente responde todo sin que el asesor intervenga.' },
      { icon: '🔔', titulo: 'Alertas de nuevas propiedades', desc: 'Notifica automáticamente a prospectos registrados cuando entra una propiedad que coincide con su búsqueda.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola, busco apartamento en arriendo en el sur de Cali, máximo 1.5 millones' },
      { rol: 'agente', texto: '¡Hola! Perfecto, tengo varias opciones en el sur de Cali dentro de tu presupuesto 🏠\n\n¿Cuántas habitaciones necesitas y en qué barrio prefieres?' },
      { rol: 'cliente', texto: '2 habitaciones, de preferencia en Ciudad Jardín o El Ingenio' },
      { rol: 'agente', texto: 'Excelente elección! Tengo 3 opciones disponibles ahora mismo:\n\n🏠 Apto Ciudad Jardín - 2 hab, 2 baños, $1.400.000/mes, piso 4\n🏠 Apto El Ingenio - 2 hab, 1 baño, $1.250.000/mes, parqueadero\n🏠 Apto Sur - 2 hab, 2 baños, $1.480.000/mes, vista despejada\n\n¿Cuál te llama más la atención para agendar visita?' },
      { rol: 'cliente', texto: 'El de Ciudad Jardín, ¿podemos ver el fin de semana?' },
      { rol: 'agente', texto: '✅ ¡Claro! El sábado tenemos disponible 10am o 3pm para la visita. ¿Cuál prefieres? Te confirmo con el asesor de inmediato 📅' },
    ],
    casos: [
      { nombre: 'Inversión Finca Raíz Bogotá', resultado: 'Triplicó visitas agendadas en el primer mes' },
      { nombre: 'Propiedades del Valle', resultado: 'Redujo tiempo de calificación de leads de 2 días a 2 minutos' },
      { nombre: 'Inmobiliaria Pacífico', resultado: 'Vendió 8 inmuebles en 45 días con leads del agente IA' },
    ],
    planes: ['Profesional', 'Agencia'],
    planRecomendado: 'profesional',
  },

  restaurante: {
    slug: 'restaurante',
    nombre: 'Restaurantes & Comidas',
    emoji: '🍕',
    color: '#EAB308',
    colorBg: 'rgba(234,179,8,0.08)',
    colorBorder: 'rgba(234,179,8,0.2)',
    tagline: 'Más pedidos, menos llamadas',
    descripcion: 'Tu restaurante toma pedidos por WhatsApp automáticamente, gestiona reservas de mesas, informa el menú del día y hace seguimiento de domicilios sin que muevas un dedo.',
    heroStats: [
      { valor: '35%', label: 'Más pedidos por WhatsApp' },
      { valor: '0', label: 'Llamadas perdidas' },
      { valor: '2 seg', label: 'Tiempo de respuesta' },
    ],
    funciones: [
      { icon: '🍽️', titulo: 'Toma de pedidos por WhatsApp', desc: 'El agente muestra el menú, toma el pedido, confirma la dirección y el método de pago. Todo sin intervención humana.' },
      { icon: '📋', titulo: 'Menú digital interactivo', desc: 'Menú siempre actualizado con fotos, precios, ingredientes y alérgenos. Se actualiza en minutos desde el panel.' },
      { icon: '🪑', titulo: 'Reservas de mesas', desc: 'Gestiona reservas de mesas para grupos, eventos especiales y fechas importantes con confirmación automática.' },
      { icon: '🛵', titulo: 'Seguimiento de domicilios', desc: 'Notifica al cliente cuando su pedido está en preparación, listo y en camino. Reduce llamadas de "¿dónde está mi pedido?"' },
      { icon: '⏰', titulo: 'Tiempo de espera en tiempo real', desc: 'El agente informa tiempos de espera estimados según el volumen actual de pedidos.' },
      { icon: '🎉', titulo: 'Promociones automáticas', desc: 'Envía promos del día, combos especiales y descuentos a clientes frecuentes automáticamente.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola quiero pedir domicilio' },
      { rol: 'agente', texto: '¡Hola! 🍕 Bienvenido a Pizza Express. ¿Ya conoces nuestro menú o quieres verlo?' },
      { rol: 'cliente', texto: 'Sí, una pizza familiar de pepperoni y una gaseosa' },
      { rol: 'agente', texto: '¡Perfecto! Tu pedido:\n🍕 Pizza familiar pepperoni - $42.000\n🥤 Gaseosa 1.5L - $6.000\n\nTotal: $48.000\n\n¿Cuál es tu dirección de entrega? 📍' },
      { rol: 'cliente', texto: 'Calle 15 # 28-40, apto 302' },
      { rol: 'agente', texto: '✅ Pedido confirmado! Tiempo estimado: 35-40 minutos.\n\n¿Pagas en efectivo o por Nequi/Daviplata? 💳' },
    ],
    casos: [
      { nombre: 'Pizza Express Cali', resultado: 'Aumentó pedidos WhatsApp de 20 a 85 por día' },
      { nombre: 'Restaurante La Cazuela', resultado: 'Eliminó el 90% de llamadas telefónicas en hora pico' },
      { nombre: 'Sushi Delivery Bogotá', resultado: 'Incrementó ticket promedio 25% con sugerencias IA' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'emprendedor',
  },

  tienda: {
    slug: 'tienda',
    nombre: 'Tiendas & Retail',
    emoji: '🛒',
    color: '#10B981',
    colorBg: 'rgba(16,185,129,0.08)',
    colorBorder: 'rgba(16,185,129,0.2)',
    tagline: 'Tu vendedor digital que nunca cierra',
    descripcion: 'Tu tienda vende las 24 horas sin contratar más personal. El agente IA muestra productos, verifica disponibilidad, procesa pedidos y hace seguimiento postventa automáticamente.',
    heroStats: [
      { valor: '24/7', label: 'Ventas activas' },
      { valor: '40%', label: 'Más conversiones' },
      { valor: '3x', label: 'Más clientes atendidos' },
    ],
    funciones: [
      { icon: '🛍️', titulo: 'Catálogo digital con búsqueda inteligente', desc: 'El cliente describe lo que busca y el agente encuentra el producto exacto entre todo tu inventario.' },
      { icon: '📦', titulo: 'Verificación de inventario en tiempo real', desc: 'El agente consulta stock antes de confirmar. Si no hay, ofrece alternativas similares automáticamente.' },
      { icon: '💰', titulo: 'Asistente de ventas con upselling', desc: 'Sugiere productos complementarios: "Con esa impresora también llevas cartuchos de larga duración".' },
      { icon: '🚚', titulo: 'Gestión de pedidos y entregas', desc: 'Registra pedidos, coordina envíos, genera guías y notifica al cliente el estado de su compra.' },
      { icon: '🔄', titulo: 'Postventa automático', desc: 'Seguimiento después de la compra: ¿llegó bien? ¿necesitas factura? ¿quieres dejar una reseña?' },
      { icon: '📊', titulo: 'Reportes de productos más vendidos', desc: 'Tu panel muestra qué productos se consultan más, cuáles generan más ventas y cuáles necesitan restock.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Buenas, ¿tienen cartuchos para impresora HP Deskjet 2775?' },
      { rol: 'agente', texto: '¡Hola! Sí, tenemos cartuchos para tu HP Deskjet 2775 🖨️\n\n✅ Cartucho negro HP 664 - $28.000 (en stock)\n✅ Cartucho color HP 664 - $35.000 (en stock)\n✅ Pack combo negro+color - $58.000 (ahorra $5.000)\n\n¿Cuál prefieres?' },
      { rol: 'cliente', texto: 'El combo, ¿hacen domicilio?' },
      { rol: 'agente', texto: '¡Claro! Domicilio disponible. ¿Cuál es tu ubicación para calcular el costo de envío? 📍\n\nTambién puedes pasar a recogerte hoy, estamos abiertos hasta las 7pm.' },
    ],
    casos: [
      { nombre: 'Papelería Central Cali', resultado: 'Atendió 3x más clientes con el mismo personal' },
      { nombre: 'Ferretería Los Andes', resultado: 'Ventas online crecieron 150% en 60 días' },
      { nombre: 'Distribuidora TecnoPlus', resultado: 'Redujo tiempo de atención por cliente de 8 min a 90 seg' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'profesional',
  },

  papeleria: {
    slug: 'papeleria',
    nombre: 'Papelerías & Servicios',
    emoji: '📋',
    color: '#8B5CF6',
    colorBg: 'rgba(139,92,246,0.08)',
    colorBorder: 'rgba(139,92,246,0.2)',
    tagline: 'Cotizaciones instantáneas, clientes satisfechos',
    descripcion: 'Genera cotizaciones automáticas de impresión, diseño y servicios en segundos. Tu agente IA atiende solicitudes, hace seguimiento de pedidos y fideliza clientes recurrentes.',
    heroStats: [
      { valor: '10 seg', label: 'Cotización automática' },
      { valor: '70%', label: 'Menos tiempo en atención' },
      { valor: '2x', label: 'Más pedidos por WhatsApp' },
    ],
    funciones: [
      { icon: '💰', titulo: 'Cotizaciones automáticas de impresión', desc: 'El cliente indica qué necesita (hojas, tamaño, color, cantidad) y el agente calcula y envía la cotización en segundos.' },
      { icon: '🎨', titulo: 'Solicitud de diseño gráfico', desc: 'Recibe briefings de diseño, confirma el encargo, hace seguimiento y entrega el archivo cuando está listo.' },
      { icon: '📂', titulo: 'Gestión de pedidos', desc: 'Registra cada pedido, asigna número de seguimiento y notifica al cliente cuando está listo para recoger o enviar.' },
      { icon: '🖨️', titulo: 'Catálogo de servicios con precios', desc: 'Impresión, plastificado, espiral, empaste, copias, ploteos, tarjetas de presentación. Todo con precios y tiempos.' },
      { icon: '🔔', titulo: 'Avisos de pedido listo', desc: '"Tu pedido de 200 volantes ya está listo para recoger en nuestra sede" — automático, sin que hagas nada.' },
      { icon: '📊', titulo: 'Clientes frecuentes con descuentos', desc: 'El sistema identifica clientes recurrentes y aplica descuentos automáticos según su historial de compras.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Buenas, necesito 500 volantes a color tamaño carta para una evento' },
      { rol: 'agente', texto: '¡Hola! Para 500 volantes a color tamaño carta:\n\n📄 Papel bond 90g: $85.000\n📄 Papel couché brillante: $120.000\n📄 Papel couché mate: $115.000\n\n⏱️ Tiempo de entrega: 2-3 horas\n\n¿Tienes el diseño listo o necesitas que lo hagamos? 🎨' },
      { rol: 'cliente', texto: 'Ya tengo el diseño, lo envío ahora. ¿Cuándo estarían listos?' },
      { rol: 'agente', texto: '¡Perfecto! Envía el archivo en PDF o AI a este mismo chat. Si los pides antes de las 11am, los tienes listos hoy en la tarde. ¿Confirmas el pedido en papel couché brillante? 🖨️' },
    ],
    casos: [
      { nombre: 'Copy Rápido Medellín', resultado: 'Cotizaciones automáticas ahorraron 4 horas diarias' },
      { nombre: 'Papelería Universitaria', resultado: 'Atendió 5x más clientes en temporada escolar' },
      { nombre: 'Servicios Gráficos Sur', resultado: 'Cero pedidos perdidos por falta de atención' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'emprendedor',
  },

  gimnasio: {
    slug: 'gimnasio',
    nombre: 'Gimnasios & Fitness',
    emoji: '🏋️',
    color: '#F97316',
    colorBg: 'rgba(249,115,22,0.08)',
    colorBorder: 'rgba(249,115,22,0.2)',
    tagline: 'Más miembros, menos gestión',
    descripcion: 'Tu gimnasio gestiona inscripciones, clases, pagos y seguimiento de miembros de forma automática. El agente IA motiva, recuerda y fideliza a tus clientes.',
    heroStats: [
      { valor: '90%', label: 'Menos no-shows en clases' },
      { valor: '3x', label: 'Más renovaciones' },
      { valor: '0', label: 'Pagos olvidados' },
    ],
    funciones: [
      { icon: '🏃', titulo: 'Inscripciones y planes', desc: 'El agente informa planes, precios y beneficios. El cliente se inscribe directamente por WhatsApp sin ir al gimnasio.' },
      { icon: '📅', titulo: 'Reserva de clases grupales', desc: 'Yoga, spinning, funcional, zumba — el cliente reserva su lugar en la clase con un mensaje. Cupos limitados gestionados automáticamente.' },
      { icon: '💳', titulo: 'Recordatorios de pago', desc: '"Hola Juan, tu membresía vence en 3 días. ¿Renovamos?" — Reduce mora y abandono con recordatorios amigables.' },
      { icon: '📊', titulo: 'Seguimiento de progreso', desc: 'Registra medidas, peso y metas de cada miembro. El agente hace seguimiento mensual y motiva con mensajes personalizados.' },
      { icon: '🎯', titulo: 'Programas personalizados', desc: 'El agente comparte rutinas y planes nutricionales según el objetivo del miembro: pérdida de peso, masa muscular, resistencia.' },
      { icon: '🏆', titulo: 'Gamificación y fidelización', desc: 'Medallas virtuales, rachas de asistencia y retos mensuales que mantienen a los miembros comprometidos.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola, quiero inscribirme al gimnasio ¿qué planes tienen?' },
      { rol: 'agente', texto: '¡Hola! Bienvenido a PowerGym 💪 Tenemos estos planes:\n\n🥇 Mensual: $120.000 - Acceso ilimitado\n🥈 Trimestral: $320.000 - Ahorra $40.000\n🥉 Semestral: $550.000 - Ahorra $170.000\n\nTodos incluyen: pesas, cardio, clases grupales y asesoría inicial. ¿Cuál te interesa?' },
      { rol: 'cliente', texto: 'El mensual, ¿puedo empezar hoy?' },
      { rol: 'agente', texto: '¡Claro que sí! 🎉 Para activar tu membresía necesito:\n\n1️⃣ Tu nombre completo\n2️⃣ Foto del documento de identidad\n3️⃣ Pago de $120.000 (Nequi: 300-xxx-xxxx)\n\nUna vez confirmes el pago, tienes acceso inmediato. ¿Tienes algún objetivo específico para tu entrenamiento? 🏋️' },
    ],
    casos: [
      { nombre: 'PowerGym Cali', resultado: 'Aumentó retención de miembros del 45% al 78%' },
      { nombre: 'FitCenter Bogotá', resultado: 'Automatizó cobros y redujo mora al 5%' },
      { nombre: 'CrossFit Pacífico', resultado: 'Llenó clases al 100% con sistema de reservas IA' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'profesional',
  },

  salud: {
    slug: 'salud',
    nombre: 'Salud & Clínicas',
    emoji: '🏥',
    color: '#14B8A6',
    colorBg: 'rgba(20,184,166,0.08)',
    colorBorder: 'rgba(20,184,166,0.2)',
    tagline: 'Atención médica eficiente y sin filas',
    descripcion: 'Agenda médica automatizada, recordatorios de citas, pre-triage inteligente e historial del paciente. Tus médicos se enfocan en la consulta, no en la administración.',
    heroStats: [
      { valor: '60%', label: 'Menos inasistencias' },
      { valor: '5 seg', label: 'Agenda una cita' },
      { valor: '100%', label: 'Citas confirmadas' },
    ],
    funciones: [
      { icon: '👨‍⚕️', titulo: 'Agenda médica inteligente', desc: 'El paciente agenda con el especialista que necesita, en el horario disponible, sin llamar ni esperar en fila.' },
      { icon: '🩺', titulo: 'Pre-triage por chat', desc: 'El agente hace preguntas básicas antes de la cita: síntomas, duración, medicamentos actuales. El médico llega preparado.' },
      { icon: '📋', titulo: 'Historial del paciente', desc: 'Registra visitas anteriores, diagnósticos, medicamentos y alergias. El agente usa esta info para respuestas más precisas.' },
      { icon: '🔔', titulo: 'Recordatorios de citas y medicamentos', desc: 'Recordatorio 24h y 2h antes de la cita. También puede recordar toma de medicamentos según prescripción.' },
      { icon: '📄', titulo: 'Entrega de resultados', desc: 'Notifica cuando los resultados de exámenes están listos y los envía digitalmente por WhatsApp de forma segura.' },
      { icon: '🏥', titulo: 'Información de servicios y tarifas', desc: 'Consultas, especialidades, precios, convenios con seguros. El agente responde todo sin saturar la recepción.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Buenas, necesito cita con médico general' },
      { rol: 'agente', texto: '¡Hola! Con gusto te ayudo a agendar tu cita 🏥\n\nPara orientarte mejor: ¿cuál es el motivo de consulta? (síntoma principal)' },
      { rol: 'cliente', texto: 'Llevo 3 días con dolor de garganta y fiebre' },
      { rol: 'agente', texto: 'Entendido. Para mañana tenemos disponible con:\n\n👨‍⚕️ Dr. Ramírez: 8:00am, 10:00am, 3:00pm\n👩‍⚕️ Dra. Torres: 9:00am, 11:30am, 4:00pm\n\nTarifas: Consulta general $45.000. ¿Cuál médico y horario prefieres?' },
      { rol: 'cliente', texto: 'Con la Dra Torres a las 9am' },
      { rol: 'agente', texto: '✅ ¡Cita confirmada! Dra. Torres, mañana 9:00am.\n\nTe recuerdo que debes traer:\n📋 Documento de identidad\n💊 Lista de medicamentos actuales\n\nTe enviaré un recordatorio mañana a las 7am. ¿Tienes alguna alergia conocida a medicamentos?' },
    ],
    casos: [
      { nombre: 'Clínica Bienestar Cali', resultado: 'Redujo inasistencias del 35% al 8%' },
      { nombre: 'Consultorio Dr. Herrera', resultado: 'Triplicó la capacidad de agenda sin contratar más personal' },
      { nombre: 'Centro Médico Pacífico', resultado: 'Satisfacción del paciente subió de 7.2 a 9.4/10' },
    ],
    planes: ['Profesional', 'Agencia'],
    planRecomendado: 'profesional',
  },

  ajedrez: {
    slug: 'ajedrez',
    nombre: 'Escuelas de Ajedrez & Deporte',
    emoji: '♟️',
    color: '#C0962C',
    colorBg: 'rgba(192,150,44,0.08)',
    colorBorder: 'rgba(192,150,44,0.2)',
    tagline: 'Estrategia, mente y comunidad',
    descripcion: 'Gestiona clases de ajedrez para niños y adultos, presenciales y virtuales. Organiza torneos, vende libros y productos, y mantiene a tu comunidad ajedrecística conectada.',
    heroStats: [
      { valor: '2x', label: 'Más inscripciones' },
      { valor: '100%', label: 'Torneos organizados' },
      { valor: '24/7', label: 'Información disponible' },
    ],
    funciones: [
      { icon: '♟️', titulo: 'Clases para niños y adultos', desc: 'El agente informa horarios, niveles (iniciación, intermedio, avanzado) y modalidades. Los estudiantes se inscriben directamente por chat.' },
      { icon: '🌐', titulo: 'Clases virtuales y presenciales', desc: 'Gestiona ambas modalidades. Envía el link de Zoom para virtuales y la dirección para presenciales automáticamente.' },
      { icon: '🏆', titulo: 'Torneos de ajedrez', desc: 'Inscripciones a torneos, información de premios, categorías y cronograma. El agente maneja registro y pagos.' },
      { icon: '🎖️', titulo: 'Premios y reconocimientos', desc: 'Informa premios, medallas, trofeos y reconocimientos FIDE. Notifica resultados automáticamente a los participantes.' },
      { icon: '📚', titulo: 'Venta de libros y material', desc: 'Catálogo de libros de ajedrez: aperturas, defensas, finales, táctica. El agente toma pedidos y coordina entrega.' },
      { icon: '📊', titulo: 'Seguimiento de progreso', desc: 'Registra el avance de cada estudiante: rating ELO, partidas jugadas, torneos participados y logros alcanzados.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola, quiero inscribir a mi hijo de 8 años en clases de ajedrez' },
      { rol: 'agente', texto: '¡Hola! Qué buena decisión 🎓 El ajedrez desarrolla concentración, lógica y creatividad en los niños.\n\nPara niños de 6-10 años tenemos:\n♟️ Iniciación Infantil - Sábados 9am-11am - $120.000/mes\n♟️ Nivel Básico - Martes y Jueves 4pm-5:30pm - $180.000/mes\n\n¿Presencial o virtual?' },
      { rol: 'cliente', texto: 'Presencial, ¿dónde quedan?' },
      { rol: 'agente', texto: 'Estamos en Cl 15 # 28-40, barrio Granada, Cali 📍\n\nLas clases las dicta el MI Alexander Borrero, rating FIDE 2035.\n\n¿Quieres separar el cupo? Solo necesito el nombre del niño y un número de contacto para confirmar.' },
    ],
    casos: [
      { nombre: 'Club Chess Masters del Pacífico', resultado: 'Triplicó inscripciones con agendamiento automático' },
      { nombre: 'Academia de Ajedrez Bogotá', resultado: 'Organizó 12 torneos sin intervención manual' },
      { nombre: 'Escuela de Estrategia Medellín', resultado: 'Vendió 180 libros en el primer mes desde el catálogo digital' },
    ],
    planes: ['Emprendedor', 'Profesional'],
    planRecomendado: 'emprendedor',
  },

  arquitectura: {
    slug: 'arquitectura',
    nombre: 'Arquitectura & Construcción',
    emoji: '🏗️',
    color: '#B5A16E',
    colorBg: 'rgba(181,161,110,0.08)',
    colorBorder: 'rgba(181,161,110,0.2)',
    tagline: 'Diseño, visión y resultados',
    descripcion: 'Presenta tu portafolio de proyectos, captura prospectos calificados, agenda consultorías y gestiona el seguimiento de cada proyecto. Tu agente IA trabaja mientras tú diseñas.',
    heroStats: [
      { valor: '5x', label: 'Más prospectos' },
      { valor: '60%', label: 'Menos tiempo en cotizaciones' },
      { valor: '24/7', label: 'Portafolio disponible' },
    ],
    funciones: [
      { icon: '🏛️', titulo: 'Portafolio de proyectos interactivo', desc: 'El agente muestra proyectos realizados por tipo: residencial, comercial, institucional, remodelación. Con fotos y descripción.' },
      { icon: '📐', titulo: 'Consultoría y presupuestos', desc: 'Califica el prospecto, recopila información del proyecto (área, tipo, presupuesto aproximado) y agenda la visita de diagnóstico.' },
      { icon: '🏗️', titulo: 'Seguimiento de obras', desc: 'Notifica al cliente el avance de su obra: etapa actual, porcentaje de avance, próximos hitos y materiales requeridos.' },
      { icon: '🎨', titulo: 'Presentación de diseños', desc: 'Comparte renders, planos y propuestas de diseño directamente por chat. El cliente aprueba o solicita cambios.' },
      { icon: '📋', titulo: 'Cotizaciones de materiales', desc: 'El agente ayuda a estimar materiales para remodelaciones menores y conecta con proveedores aliados.' },
      { icon: '📑', titulo: 'Gestión documental', desc: 'Recordatorios de permisos de construcción, licencias, entregas de documentos y cumplimiento de cronograma.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Hola, necesito remodelar mi cocina y sala comedor, ¿cuánto podría costar?' },
      { rol: 'agente', texto: '¡Hola! Con gusto te ayudo a presupuestar tu remodelación 🏛️\n\nPara darte una estimación precisa necesito algunos datos:\n\n📐 ¿Cuántos m² aproximadamente tiene el área?\n🏠 ¿Es apartamento o casa?\n✨ ¿Remodelación básica o con cambio total de acabados?' },
      { rol: 'cliente', texto: 'Apartamento, cocina de unos 12m2 y sala de 20m2. Cambio total de acabados' },
      { rol: 'agente', texto: 'Entendido. Para 32m² con cambio total de acabados, el rango estimado es:\n\n📊 Remodelación estándar: $45M - $65M COP\n📊 Remodelación premium: $70M - $100M COP\n\nEsto incluye: pisos, cielos, paredes, cocina integral y electricidad. ¿Te gustaría agendar una visita de diagnóstico sin costo? 📅' },
    ],
    casos: [
      { nombre: 'Estudio Arquitectónico Cali', resultado: 'Capturó 40 prospectos calificados en el primer mes' },
      { nombre: 'Constructora del Pacífico', resultado: 'Redujo tiempo de cotización de 3 días a 4 horas' },
      { nombre: 'Diseño & Build Bogotá', resultado: 'Cerró 8 proyectos de remodelación con leads del agente IA' },
    ],
    planes: ['Profesional', 'Agencia'],
    planRecomendado: 'profesional',
  },

  restaurante_barrio: {
    slug: 'restaurante_barrio',
    nombre: 'Restaurante de Barrio',
    emoji: '🍲',
    color: '#E85D04',
    colorBg: 'rgba(232,93,4,0.08)',
    colorBorder: 'rgba(232,93,4,0.2)',
    tagline: 'Sabor de casa, tecnología de punta',
    descripcion: 'Ofrece tu menú diario con fotos, recibe pedidos de domicilio por WhatsApp, publica el menú de la semana y fideliza a tus clientes habituales del barrio.',
    heroStats: [
      { valor: '3x', label: 'Más pedidos domicilio' },
      { valor: '0', label: 'Pedidos perdidos' },
      { valor: '5 seg', label: 'Ver menú del día' },
    ],
    funciones: [
      { icon: '🍽️', titulo: 'Menú del día con fotos', desc: 'Publica el menú diario con fotos de los platos. Los clientes ven el menú desde tu sitio web o WhatsApp.' },
      { icon: '🛵', titulo: 'Pedidos de domicilio', desc: 'El agente toma el pedido, confirma la dirección y el pago. Domicilios al barrio sin complicaciones.' },
      { icon: '📅', titulo: 'Menú semanal', desc: 'Programa el menú de toda la semana. Los clientes saben de antemano qué hay y pueden pedir con anticipación.' },
      { icon: '💰', titulo: 'Precios claros', desc: 'Sopa, plato fuerte, jugo y postre — el agente informa precios del corrientazo y platos a la carta.' },
      { icon: '🤝', titulo: 'Clientes frecuentes', desc: 'Registra pedidos habituales. "Hola Carlos, ¿el de siempre para hoy?" — fidelización automática.' },
      { icon: '📣', titulo: 'Anuncios del día', desc: 'Notifica especiales del día, platos agotados y promociones a tu lista de clientes frecuentes.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: '¿Qué hay hoy de almuerzo?' },
      { rol: 'agente', texto: '¡Hola! El menú de hoy 🍽️\n\n🥣 Sopa: Sancocho de costilla\n🍛 Plato fuerte: Bandeja paisa completa\n🥤 Jugo: Lulo o mora\n🍮 Postre: Flan\n\n💰 Menú completo: $12.000\n🛵 Domicilio disponible\n\n¿Te lo llevamos o prefieres pasar a recoger?' },
      { rol: 'cliente', texto: 'Domicilio por favor, soy de la Calle 12 con 8' },
      { rol: 'agente', texto: '✅ Perfecto! Para tu zona el domicilio tiene un recargo de $2.000.\n\nTotal: $14.000\n\n¿Pagas en efectivo o Nequi/Daviplata? 💳\nTiempo estimado: 20-25 minutos 🛵' },
    ],
    casos: [
      { nombre: 'Caseta Doña Rosa, Cali', resultado: 'Pasó de 15 a 45 domicilios diarios' },
      { nombre: 'Fritanga El Paisa, Medellín', resultado: 'Clientes frecuentes aumentaron 80% en 2 meses' },
      { nombre: 'Almuerzo Ejecutivo, Bogotá', resultado: 'Cero pedidos perdidos desde que usa el agente IA' },
    ],
    planes: ['Emprendedor'],
    planRecomendado: 'emprendedor',
  },

  aduana: {
    slug: 'aduana',
    nombre: 'Agencias de Aduana',
    emoji: '🛃',
    color: '#0EA5E9',
    colorBg: 'rgba(14,165,233,0.08)',
    colorBorder: 'rgba(14,165,233,0.2)',
    tagline: 'Tu operación aduanera en tiempo real',
    descripcion: 'Automatiza consultas de aranceles, seguimiento de declaraciones, estado de mercancías y comunicación con importadores y exportadores. Tu agente IA reduce tiempos y errores en cada operación.',
    heroStats: [
      { valor: '80%', label: 'Menos consultas telefónicas' },
      { valor: '24/7', label: 'Seguimiento de declaraciones' },
      { valor: '3x', label: 'Más clientes atendidos' },
    ],
    funciones: [
      { icon: '📄', titulo: 'Seguimiento de declaraciones de importación/exportación', desc: 'El agente consulta el estado de cada declaración aduanera en tiempo real y notifica al importador o exportador automáticamente.' },
      { icon: '📊', titulo: 'Consulta de aranceles y partidas arancelarias', desc: 'El cliente describe el producto y el agente orienta sobre la posición arancelaria, arancel aplicable y restricciones.' },
      { icon: '📦', titulo: 'Estado de mercancías en puerto', desc: 'Informa si la mercancía está en tránsito, en bodega, en inspección DIAN o lista para retiro. Integra información de SPIA, TCBuen y SPRBUN.' },
      { icon: '📅', titulo: 'Alertas de vencimiento de documentos', desc: 'Notifica automáticamente vencimientos de registros, licencias de importación, certificados de origen y vistos buenos.' },
      { icon: '🤝', titulo: 'Gestión de clientes importadores/exportadores', desc: 'CRM especializado: registra cada cliente, sus operaciones habituales, requisitos especiales y historial de declaraciones.' },
      { icon: '📈', titulo: 'Liquidación de tributos aduaneros', desc: 'El agente explica cómo se liquidan aranceles, IVA, antidumping y otros tributos según la mercancía y su origen.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Buenos días, necesito saber el estado de mi declaración 1234-2026' },
      { rol: 'agente', texto: '¡Buenos días! Consultando el estado de la declaración 1234-2026 📦

✅ Estado: Levante concedido
📅 Fecha de levante: 06/06/2026
🏢 Bodega: TC Buenáventura - Zona 3
🗣️ Tributos cancelados: $4.820.000 COP

Tu mercancía está lista para retiro. ¿Necesitas la guia de retiro o el DUS digitalizado?' },
      { rol: 'cliente', texto: 'Sí por favor, y cuánto tiempo tenemos para retirar' },
      { rol: 'agente', texto: 'Te envío los documentos ahora mismo 📎

Para el retiro de mercancías en TCBuen tienes 15 días calendario antes de que genere bodegaje. La fecha límite es el 21/06/2026.

¿Quieres que te coordine el transporte de retiro o tienes transportador propio?' },
      { rol: 'cliente', texto: 'Tengo transportador, gracias' },
      { rol: 'agente', texto: 'Perfecto 👍 Recuerda llevar:

✅ Declaración de importación original
✅ Poder del apoderado
✅ Carnet DIAN del declarante
✅ Orden de retiro firmada

Cualquier novedad me avisas. ¡Buen día! 🚀' },
    ],
    casos: [
      { nombre: 'Sidecomex Cali', resultado: 'Redujo consultas telefónicas de clientes en un 75%' },
      { nombre: 'Agencia Aduanera del Pacífico', resultado: 'Automatizó alertas de vencimiento para 120 clientes activos' },
      { nombre: 'Comercio Exterior Sur', resultado: 'Cero errores de notificación en temporadas de alto volumen' },
    ],
    planes: ['Profesional', 'Agencia'],
    planRecomendado: 'profesional',
  },

  portuaria: {
    slug: 'portuaria',
    nombre: 'Operadoras Portuarias',
    emoji: '🚢',
    color: '#0F766E',
    colorBg: 'rgba(15,118,110,0.08)',
    colorBorder: 'rgba(15,118,110,0.2)',
    tagline: 'Operaciones portuarias sin fricción',
    descripcion: 'Gestiona solicitudes de servicios portuarios, seguimiento de contenedores, programación de buques, coordinación de estiba y comunicación con navieras, agentes y transportadores.',
    heroStats: [
      { valor: '90%', label: 'Menos llamadas operativas' },
      { valor: '24/7', label: 'Seguimiento de contenedores' },
      { valor: '5x', label: 'Más rápido en coordinación' },
    ],
    funciones: [
      { icon: '🚢', titulo: 'Seguimiento de contenedores en tiempo real', desc: 'El agente informa la ubicación exacta del contenedor: en buque, en muelle, en patio, en inspección o entregado.' },
      { icon: '📅', titulo: 'Programación de llegada de buques (ETA)', desc: 'Notifica automáticamente a agentes y transportadores la fecha y hora estimada de arribo (ETA) y cualquier cambio.' },
      { icon: '📄', titulo: 'Solicitud de servicios portuarios', desc: 'Descargue, almacenamiento, movilización, pesaje, inspección fitosanitaria, vaciado de contenedor — el agente gestiona cada solicitud.' },
      { icon: '📦', titulo: 'Control de inventario en patio', desc: 'Consulta de contenedores en patio: BL number, booking, naviera, consignatario, fecha de ingreso y vencimiento de almacenamiento.' },
      { icon: '💰', titulo: 'Liquidación de servicios y bodegaje', desc: 'El agente calcula tarifas de almacenamiento, movilización y servicios adicionales según los días transcurridos.' },
      { icon: '🤝', titulo: 'Coordinación con navieras y transportadores', desc: 'Gestiona comunicación con CMA-CGM, MSC, Maersk y transportadores locales para retiro y entrega de contenedores.' },
    ],
    flujoChat: [
      { rol: 'cliente', texto: 'Necesito el estado del contenedor MSKU4521890' },
      { rol: 'agente', texto: '¡Hola! Consultando el contenedor MSKU4521890 🚢

📦 Contenedor: MSKU4521890
🚢 Naviera: MSC Mediterranean
📅 Llegada: 05/06/2026 - Puerto de Buenaventura
🏢 Ubicación actual: Patio 3 - Fila C-12
⚠️ Almacenamiento: 3 días acumulados (vence el 12/06/2026)

Estado: Disponible para retiro con documentos completos. ¿Necesitas el PIN de salida?' },
      { rol: 'cliente', texto: 'Sí, y cuánto hay que pagar de almacenamiento' },
      { rol: 'agente', texto: 'Liquidación de almacenamiento MSKU4521890:

📅 Periodo libre: 2 días (06/06 - 07/06)
💰 Día 3 en patio: $180.000 USD = $750.000 COP

ℹ️ Si retiras antes del 12/06, el total es: $750.000 COP
⚠️ A partir del 13/06 se generan $180.000 adicionales/día

Puedes pagar en caja o transferencia. PIN de salida se genera después del pago. ¿Procedo?' },
      { rol: 'cliente', texto: 'Ok voy a pagar, gracias' },
      { rol: 'agente', texto: '¡Perfecto! Cuando realices el pago envíame el comprobante y te genero el PIN de salida de inmediato 📎

Recuerda que el transportador debe traer:
✅ Orden de entrega firmada
✅ Cédula del conductor
✅ Tarjeta de propiedad del vehículo
✅ SOAT vigente

¡Buen día! 🚀' },
    ],
    casos: [
      { nombre: 'SPRBUN Buenaventura', resultado: 'Redujo llamadas de consulta de estado en 80%' },
      { nombre: 'TCBuenáventura', resultado: 'Automó notificaciones de vencimiento para 300 contenedores/mes' },
      { nombre: 'Operadora Logística del Pacífico', resultado: 'Coordinación con navieras 5x más rápida' },
    ],
    planes: ['Profesional', 'Agencia'],
    planRecomendado: 'agencia',
  },

};

export const SLUGS_VALIDOS = Object.keys(INDUSTRIAS_DETALLE);
