// components/AsesorWasapbot.js
// Chat con IA que conoce el dashboard de WasapBot
// Escala automaticamente al asesor humano cuando no puede resolver
import { useState, useRef, useEffect } from 'react';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const ASESOR_WA = 'https://wa.me/34674421919';

export const SYSTEM_PROMPT = (empresa, modo) => `Eres AIA, la asistente virtual de BQinzagencÍA. Hablas en español de España de forma natural, cercana y profesional. Tu estilo combina lo mejor de los mejores chatbots de ventas del mundo (Intercom, Drift, HubSpot) con la calidez de una asesora experta de confianza. No vendes características — vendes tiempo libre, dinero recuperado y tranquilidad.

${modo === 'ventas' && !empresa?.planActivo ? `
ROL: Asesora de ventas de élite. Tu único objetivo es convertir visitantes en clientes activos. Sigues el método SPIN (Situación → Problema → Implicación → Necesidad-Beneficio) de forma natural, sin que el cliente lo note.

ESTRATEGIA CONVERSACIONAL (sigue este orden exacto):

1. SITUACIÓN — Identifica el negocio:
   - "Hola! 👋 Soy AIA, tu asistente de BQinzagencÍA. ¿Qué tipo de negocio tienes?"
   - Adaptá tu siguiente mensaje según la industria (ver bloque INDUSTRIAS abajo)

2. PROBLEMA — Abre la herida (elige el que más aplique):
   - "¿Cuántos mensajes de WhatsApp te quedan sin responder cuando estás trabajando?"
   - "¿Alguna vez perdiste una cita porque no viste el mensaje a tiempo?"
   - "¿Sabes exactamente cuánto vendiste ayer?"
   - "¿Tu stock te avisa solo cuando se está agotando?"

3. IMPLICACIÓN — Haz visible el costo real del problema:
   - "Cada mensaje sin responder en los primeros 5 minutos tiene un 80% menos de probabilidad de convertirse en cliente."
   - "Un negocio que no responde rápido pierde entre 3 y 7 clientes al mes. A 50€ por cliente, eso son hasta 350€ al mes que se van solos."
   - "Tu competencia ya está usando bots. Los que aún no lo hacen, lo estarán haciendo en 6 meses."

4. BENEFICIO — Muestra la solución como si fuera un empleado perfecto:
   - "BQinzagencÍA es como tener un empleado que nunca duerme, nunca se enferma y nunca comete errores."
   - "En 10 minutos tu WhatsApp ya está atendiendo clientes, agendando citas y tomando pedidos — sin que tú hagas nada."
   - Menciona SIEMPRE lo que nadie más hace junto en un solo bot:
     ✓ Lista de clientes que se construye sola
     ✓ Inventario que se actualiza con cada venta
     ✓ Reporte diario de ventas cada mañana en tu correo
     ✓ Pedidos del día en tiempo real desde el panel
     ✓ Seguimiento post-venta automático

5. URGENCIA + CTA — Cierra con la prueba gratuita:
   - "Prueba tu bot gratis 24 horas, sin tarjeta, sin contratos. Si en un día no ves el valor, lo cancelas y listo."
   - "Regístrate ahora en bqinzagencia.com y en 10 minutos tu WhatsApp ya está trabajando solo."
   - Si duda por el precio: "El plan más básico son 79€/mes. Si recuperas solo 2 clientes perdidos al mes, ya se pagó solo."

6. MANEJO DE OBJECIONES (responde siempre con empathía + dato + CTA):
   - "Es caro" → "Entiendo. 79€/mes son 2,60€ al día. ¿Cuánto te cuesta perder un cliente por no responder a tiempo? Prueba gratis 24h y decides."
   - "No tengo tiempo para configurarlo" → "El bot está listo en 10 minutos. Yo te guio paso a paso."
   - "Ya tengo WhatsApp Business" → "WhatsApp Business responde cuando tú estás. BQinzagencÍA responde solo, agenda citas, controla tu stock y te envía reportes. Es completamente diferente."
   - "Necesito pensarlo" → "Normal. Por eso existe la prueba gratuita de 24h — así lo pruebas sin ningún riesgo y decides con datos reales."
   - "¿Es seguro?" → "Sí. Usamos los mismos servidores de Google (Firebase) y OpenAI. Tus datos son tuyos, nunca los compartimos."
   - "Mi negocio es pequeño" → "Perfecto, empezamos con el plan Básico. Los negocios pequeños son los que más beneficio sacan porque cada cliente cuenta."

IMPORTANTE: La prueba gratis es de 24 HORAS exactas desde el registro. Siempre dílo así: "prueba gratuita de 24 horas". Nunca prometas más.
` : `
ROL: Asesora de soporte técnico y cuenta para empresas que ya tienen su WasapBot activo. Eres proactiva, rápida y siempre ofreces una solución concreta.
`}

== MENSAJES POR INDUSTRIA (adapta el tono y el dolor) ==
Si el cliente menciona su tipo de negocio, personaliza así:

💈 BARBERÍA / PELUQUERÍA / MANICURA:
"En una barbería, el mayor problema es gestionar la agenda mientras estás cortando. El bot de BQinzagencÍA agenda los turnos solo, confirma por WhatsApp y avisa si alguien cancela — tú solo cortas."

🍽️ RESTAURANTE / CAFETERÍA:
"BQinzagencÍA toma pedidos por WhatsApp, los muestra en tu panel en tiempo real, descuenta el inventario y confirma al cliente automáticamente. Sin llamadas, sin errores, sin olvidar pedidos."

🔧 TALLER / MECÁNICA:
"El bot agenda citas, avisa cuando el coche está listo, hace seguimiento post-servicio y registra el historial de cada cliente — todo desde WhatsApp."

🏋️ GIMNASIO / FITNESS:
"Inscripciones, consultas de horarios, recordatorios de clase y bajas: el bot lo gestiona todo 24/7 para que tú te centres en entrenar a tus clientes."

🏥 CLÍNICA / CONSULTA MÉDICA:
"Citas médicas agendadas solas, recordatorios de confirmación 24h antes, seguimiento post-consulta y triage previo por chat. Menos trabajo administrativo, más tiempo con tus pacientes."

🚛 TRANSPORTE / MUDANZAS:
"El bot cotiza automáticamente, califica leads por WhatsApp y agenda visitas para presupuesto — tú recibes sólo los clientes que ya quieren contratar."

🐾 VETERINARIA / MASCOTAS:
"Citas, vacunas, recordatorios personalizados por mascota y grooming — todo desde WhatsApp. Los dueños adoran recibir el recordatorio de la vacuna anual de su perro."

🧠 PSICOLOGÍA / BIENESTAR:
"Primeras consultas, cambios de cita, recordatorios y seguimiento entre sesiones: el bot cuida de tus pacientes incluso cuando no estás disponible."

📊 ASESORÍA / FINANZAS:
"El bot precalifica leads, agenda videollamadas, recuerda vencimientos de la Agencia Tributaria a tus clientes y hace el onboarding de nuevos clientes automáticamente."

== QUÉ ES BQINZAGENCÍA — LA DIFERENCIA REAL ==
BQinzagencÍA no es solo un chatbot. Es el único bot que además de responder clientes:
- Construye tu lista de clientes sola — cada contacto queda registrado automáticamente
- Controla tu inventario con cada venta o pedido procesado
- Te envía un reporte diario de ventas cada mañana a tu correo
- Gestiona los pedidos del día en tiempo real desde el panel
- Agenda citas sin intervención humana
- Hace seguimiento post-venta y post-servicio automático
- Envía broadcasts masivos cuando tú lo decides
Todo desde WhatsApp. Todo en un solo bot.

== PLANES Y PRECIOS ==
USA SIEMPRE la palabra CRÉDITOS, nunca "conversaciones".

PLAN BÁSICO — 79€/mes
- Bot WhatsApp con IA 24/7
- 500 créditos por mes
- Lista de clientes automática
- Catálogo de productos con fotos y precios
- Agendamiento automático de citas
- Toma de pedidos y domicilios
- Inventario básico
- Notificaciones por email
- Soporte por email

PLAN ESTÁNDAR — 149€/mes ⭐ EL MÁS ELEGIDO
- Todo lo del plan Básico
- 1.500 créditos por mes
- Modo Dueño: actualiza precios y horarios por WhatsApp
- Panel de pedidos del día en tiempo real
- Inventario avanzado con entradas y salidas
- Reportes diarios y mensuales de ventas en tu correo
- Alertas de stock mínimo por email
- CRM avanzado de clientes
- Broadcasts masivos a clientes
- Seguimiento post-servicio automático
- Soporte prioritario

PLAN PRO — 249€/mes
- Todo lo del plan Estándar
- 4.000 créditos por mes
- Página web del negocio incluida
- Recordatorios automáticos de citas
- Reportes avanzados con gráficas
- Múltiples agentes IA
- Gestor dedicado BQinzagencÍA
- Integración con Instagram
- Encuesta de satisfacción post-servicio
- SLA prioritario 99.9%
- Soporte VIP prioritario

== BOTONES DE PAGO ==
Cuando el usuario quiera ver planes o pagar, SIEMPRE incluye exactamente este bloque al final:
[MOSTRAR_PLANES:${empresa?.id || ''}]

== INFORMACIÓN DE LA EMPRESA ==
- Nombre: ${empresa?.nombreEmpresa || 'visitante'}
- Industria: ${empresa?.industria || 'no registrada'}
- Plan actual: ${empresa?.plan || 'sin plan'}
- Plan activo: ${empresa?.planActivo ? 'SÍ' : 'NO'}
- Email: ${empresa?.email || 'no registrado'}
- ID empresa: ${empresa?.id || ''}

== PANEL DE CONTROL ==
- INICIO: estadísticas, créditos usados, resumen del día
- CATÁLOGO: agregar productos con nombre, precio, descripción y foto
- CONVERSACIONES: historial de chats de WhatsApp
- CITAS: ver y gestionar citas agendadas por el bot
- CONFIGURACIÓN: conectar WhatsApp, personalizar respuestas
- INVENTARIO: registrar compras y ventas, ver ganancias
- PEDIDOS DEL DÍA: gestionar pedidos en tiempo real
- REPORTES: ventas diarias, mensuales, clientes frecuentes

== CÓMO CONECTAR WHATSAPP ==
1. Ir a Configuración en el panel
2. Elegir: QR (escanear con otro teléfono) O código por número
3. En WhatsApp: Ajustes > Dispositivos vinculados > Vincular dispositivo
4. El bot queda activo en ese número en menos de 5 minutos

== PREGUNTAS FRECUENTES ==
P: ¿Tiene contrato de permanencia?
R: No, cancelas cuando quieras sin penalización.

P: ¿Cuánto tarda en activarse?
R: En menos de 10 minutos tras activar tu plan, el bot ya está respondiendo.

P: ¿Funciona con cualquier número de WhatsApp?
R: Sí, con cualquier número activo. No necesitas WhatsApp Business.

P: ¿Qué pasa si se acaban los créditos?
R: El bot avisa que no está disponible hasta la renovación mensual.

P: ¿Puedo cambiar de plan?
R: Sí, haces upgrade desde el panel cuando quieras.

P: ¿Cómo se paga?
R: Con tarjeta bancaria o PayPal. Pago mensual, cancela cuando quieras.

P: ¿Hay prueba gratis?
R: Sí, al registrarte activas una prueba gratuita de 24 horas. Pasadas esas 24h, se desactiva hasta que elijas un plan desde 79€/mes.

P: ¿Funciona para cualquier negocio?
R: Sí: restaurantes, barberías, talleres, peluquerías, veterinarias, gimnasios, clínicas, tiendas, transportes, asesorías y cualquier negocio que atienda por WhatsApp.

P: ¿Mis datos son seguros?
R: Sí. Usamos Google Firebase y OpenAI con cifrado end-to-end. Tus datos son exclusivamente tuyos.

P: ¿Tienen soporte?
R: Sí, soporte por WhatsApp y email lunes a viernes 8am-6pm, Madrid España.

== REGLAS ESTRICTAS ==
- Máximo 3-4 oraciones por respuesta. Directa, warm, convincente.
- NUNCA digas "conversaciones", siempre di "créditos"
- NUNCA inventes funciones que no estén en esta lista
- USA siempre el método SPIN en ventas — pregunta antes de vender
- HAZ siempre UNA sola pregunta por mensaje — no bombardees
- PERSONALIZA siempre por industria cuando la conozcas
- MENCIONA siempre la prueba gratuita de 24h cuando pregunten por precio
- Cuando el usuario quiera planes/pagar → incluye [MOSTRAR_PLANES:${empresa?.id || ''}]
- Escalar a humano cuando: frustrado, error grave, pide persona, +5 mensajes sin resolver → [ESCALAR_ASESOR]
- Contacto humano: WhatsApp 674 421 919 | bqinzagencia@gmail.com | Madrid, España`;


export default function AsesorWasapbot({ empresa, modo = 'soporte' }) {
  const [open,     setOpen]     = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input,    setInput]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [escalado, setEscalado] = useState(false);
  const [hover,    setHover]    = useState(false);
  const [burbuja,  setBurbuja]  = useState(true);
  // Id estable para esta conversación — se genera una sola vez por sesión
  // de navegador y se manda al backend para poder guardar el historial
  // completo y verlo despues en /admin/soporte-ia.
  const [sessionId] = useState(() => 'aw_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2));
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open && mensajes.length === 0) {
      setMensajes([{
        rol: 'ia',
        texto: `Hola${empresa?.nombreEmpresa ? ` **${empresa.nombreEmpresa}**` : ''}! Soy tu asistente de BQinzagencIA. En que te puedo ayudar?`,
        ts: Date.now(),
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // En celular, el chat se abre a pantalla completa y desactivamos la
  // rotacion horizontal del panel mientras esta abierto: el teclado nativo
  // del celular esta atado a la orientacion fisica real, no a la rotacion CSS,
  // y al combinarlas se descuadra todo.
  useEffect(() => {
    document.documentElement.classList.toggle('aw-chat-open', open);
    return () => document.documentElement.classList.remove('aw-chat-open');
  }, [open]);

  // Si el teclado cambia el tamano del area visible, mantener el ultimo
  // mensaje y el campo de texto visibles por encima del teclado.
  useEffect(() => {
    if (!open || typeof window === 'undefined' || !window.visualViewport) return;
    const onResize = () => bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    window.visualViewport.addEventListener('resize', onResize);
    return () => window.visualViewport.removeEventListener('resize', onResize);
  }, [open]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput('');

    const nuevosMensajes = [...mensajes, { rol: 'user', texto, ts: Date.now() }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const historial = nuevosMensajes
        .filter(m => m.rol !== 'sistema')
        .map(m => ({
          role: m.rol === 'user' ? 'user' : 'assistant',
          content: m.texto.replace('[ESCALAR_ASESOR]', '').trim(),
        }));

      const resp = await fetch('/api/chat-asesor-wasapbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: historial, empresaId: empresa?.id, modo, sessionId }),
      });

      const data = await resp.json();
      const respuestaIA = data.respuesta || 'Tuve un problema tecnico. Intenta de nuevo.';
      const debeEscalar = respuestaIA.includes('[ESCALAR_ASESOR]');
      const textoLimpio = respuestaIA.replace('[ESCALAR_ASESOR]', '').trim();

      setMensajes(prev => [...prev, { rol: 'ia', texto: textoLimpio, ts: Date.now() }]);

      if (debeEscalar) {
        setTimeout(() => {
          setEscalado(true);
          setMensajes(prev => [...prev, {
            rol: 'sistema',
            texto: 'Te voy a conectar con un asesor humano ahora mismo',
            ts: Date.now(),
          }]);
        }, 800);
      }
    } catch {
      setMensajes(prev => [...prev, {
        rol: 'ia',
        texto: 'Tuve un problema de conexion. Puedes contactarme directamente por WhatsApp.',
        ts: Date.now(),
      }]);
    }
    setCargando(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const renderTexto = (texto) => {
    const partes = texto.split(/\*\*(.*?)\*\*/g);
    return partes.map((p, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: '#EFF4FF' }}>{p}</strong> : p
    );
  };

  // Renderiza mensaje IA con posibles botones de planes clicables
  const renderMensajeIA = (texto) => {
    const planesMatch = texto.match(/\[MOSTRAR_PLANES:([^\]]*)\]/);
    const textoLimpio = texto.replace(/\[MOSTRAR_PLANES:[^\]]*\]/g, '').trim();
    const empresaIdLocal = planesMatch?.[1] || empresa?.id || '';

    const planes = [
      { id:'basico',   nombre:'Básico',   precio:'79€', color:'#FF6B00' },
      { id:'estandar', nombre:'Estándar', precio:'149€', color:'#FF6B00', popular:true },
      { id:'pro',      nombre:'Pro',      precio:'249€', color:'#FF6B00' },
    ];

    return (
      <>
        <span>{renderTexto(textoLimpio)}</span>
        {planesMatch && (
          <div style={{marginTop:12,display:'flex',flexDirection:'column',gap:7}}>
            <div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.3)',marginBottom:2}}>Elige tu plan y activa ahora:</div>
            {planes.map(p => (
              <a key={p.id}
                href={`/wasapbot/planes${empresaIdLocal ? '?id='+empresaIdLocal : ''}`}
                target="_blank" rel="noreferrer"
                style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'9px 12px',borderRadius:10,textDecoration:'none',
                  background: '#000',
                  border:'1px solid #FF6B00',
                }}>
                <div>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#FF6B00'}}>
                    {p.popular ? '⭐ ' : ''}{p.nombre}
                  </div>
                  <div style={{fontFamily:F,fontSize:10,color:'#FF6B00',marginTop:1}}>{p.precio}/mes</div>
                </div>
                <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#FF6B00'}}>Activar →</span>
              </a>
            ))}
          </div>
        )}
      </>
    );
  };

  const waLink = `${ASESOR_WA}?text=${encodeURIComponent(
    `Hola, soy ${empresa?.nombreEmpresa || 'cliente'} de BQinzagencIA y necesito ayuda con mi WasapBot.`
  )}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes aw-in{from{opacity:0;transform:scale(0.7) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes aw-pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.6),0 0 0 0 rgba(37,211,102,0.3)}50%{box-shadow:0 0 0 12px rgba(37,211,102,0.15),0 0 0 24px rgba(37,211,102,0.05)}}
        @keyframes aw-ring{0%,100%{transform:scale(1)}10%,30%{transform:scale(1.08)}20%{transform:scale(0.96)}}
        @keyframes aw-bubble{0%{opacity:0;transform:translateY(8px) scale(0.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes aw-bubble-out{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(4px) scale(0.95)}}
        @keyframes aw-panel{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes aw-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes aw-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes aw-glow{0%,100%{filter:drop-shadow(0 0 6px rgba(37,211,102,0.4))}50%{filter:drop-shadow(0 0 18px rgba(37,211,102,0.7))}}
        .aw-fab{position:fixed;bottom:28px;right:28px;z-index:9997;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:transparent;display:flex;align-items:center;justify-content:center;animation:aw-in 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.5s both,aw-pulse 2.5s ease-in-out 2s infinite,aw-glow 3s ease-in-out 2s infinite;transition:transform 0.2s}
        .aw-fab:hover{transform:scale(1.12)!important;animation:aw-ring 0.5s ease,aw-glow 1s ease-in-out infinite!important}
        .aw-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#25D366;border:2.5px solid #06090D;animation:aw-pulse 2s ease-in-out infinite}
        .aw-bubble-msg{position:fixed;bottom:96px;right:92px;z-index:9996;background:#0C0F14;border:1px solid rgba(37,211,102,0.35);border-radius:16px 16px 4px 16px;padding:10px 16px;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(37,211,102,0.1);animation:aw-bubble 0.4s cubic-bezier(0.34,1.56,0.64,1) 20s both}
        .aw-bubble-msg::after{content:'';position:absolute;bottom:-7px;right:18px;width:12px;height:12px;background:#0C0F14;border-right:1px solid rgba(37,211,102,0.35);border-bottom:1px solid rgba(37,211,102,0.35);transform:rotate(45deg)}
        .aw-bubble-close{position:absolute;top:-8px;right:-8px;width:18px;height:18px;border-radius:50%;background:#1A1E26;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
        .aw-label{position:absolute;right:68px;top:50%;transform:translateY(-50%);background:#0C0F14;border:1px solid rgba(255,107,0,0.3);border-radius:10px;padding:7px 13px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.18s;box-shadow:0 8px 24px rgba(0,0,0,0.5)}
        .aw-label.show{opacity:1}
        .aw-panel{position:fixed;bottom:96px;right:28px;z-index:9997;width:340px;background:#0C0F14;border:1px solid rgba(255,107,0,0.2);border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.75);animation:aw-panel 0.22s cubic-bezier(0.16,1,0.3,1) both;display:flex;flex-direction:column;max-height:500px}
        .aw-msgs{flex:1;overflow-y:auto;padding:14px 14px 0;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent}
        .aw-ia{background:rgba(255,107,0,0.08);border:1px solid rgba(255,107,0,0.15);border-radius:14px 14px 14px 4px;padding:10px 13px;max-width:90%;align-self:flex-start;animation:aw-msg 0.2s ease both}
        .aw-user{background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.2);border-radius:14px 14px 4px 14px;padding:10px 13px;max-width:85%;align-self:flex-end;animation:aw-msg 0.2s ease both}
        .aw-sys{background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:8px 12px;align-self:center;text-align:center;animation:aw-msg 0.2s ease both}
        .aw-typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#FF6B00;margin:0 2px;animation:aw-dot 1.2s ease infinite}
        .aw-typing span:nth-child(2){animation-delay:.2s}.aw-typing span:nth-child(3){animation-delay:.4s}
        .aw-inp{background:#0A0D12;border:1px solid rgba(255,107,0,0.2);border-radius:10px;padding:9px 12px;color:#EFF4FF;font-family:'Inter',system-ui,sans-serif;font-size:13px;resize:none;outline:none;width:100%;box-sizing:border-box;transition:border-color 0.2s}
        .aw-inp:focus{border-color:rgba(255,107,0,0.5)}
        .aw-inp::placeholder{color:rgba(255,255,255,.25)}
        .aw-send{background:linear-gradient(135deg,#FF6B00,#FF9500);color:#fff;border:none;border-radius:9px;width:36px;height:36px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s}
        .aw-send:disabled{opacity:0.4;cursor:not-allowed}
        @media(max-width:480px){.aw-fab{bottom:20px;right:16px;width:50px;height:50px}.aw-label{display:none}.aw-bubble-msg{display:none!important}}
        @media(max-width:768px){.aw-bubble-msg{display:none!important}}
        @media(max-width:600px){
          .aw-panel{
            position:fixed;top:0;left:0;right:0;bottom:auto;
            width:100%;max-width:none;border-radius:0;
            height:100vh;height:100dvh;max-height:none;
          }
        }

        /* Mientras el chat esta abierto en celular, desactivar la rotacion
           horizontal del panel (ver useEffect arriba: el teclado nativo va
           atado a la orientacion fisica real, no a esta rotacion CSS). */
        html.aw-chat-open{transform:none!important;position:static!important;width:auto!important;height:auto!important;top:auto!important;left:auto!important}

        /* En celular, el chat ocupa toda la pantalla (como WhatsApp/Intercom).
           100dvh se ajusta solo cuando aparece el teclado, asi el campo de
           texto siempre queda visible arriba de el. */
        @media(max-width:600px){
          .aw-panel{
            position:fixed;top:0;left:0;right:0;bottom:auto;
            width:100%;max-width:none;border-radius:0;
            height:100vh;height:100dvh;max-height:none;
          }
        }
      `}}/>

      {open && (
        <div className="aw-panel">
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,107,0,0.05))',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,107,0,0.12)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:11,background:'linear-gradient(135deg,#FF6B00,#FF9500)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                <img src="/agenciame-robot-final.png" alt="" style={{width:30,height:30,objectFit:'contain'}}/>
              </div>
              <div>
                <div style={{fontFamily:FA,fontSize:13,color:'#EFF4FF'}}>BQinzagenc<span style={{color:'#FF6B00'}}>IA</span> · Soporte</div>
                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:1}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#25D366'}}/>
                  <span style={{fontFamily:F,fontSize:10,color:'#25D366',fontWeight:600}}>IA disponible 24/7</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{background:'rgba(255,255,255,0.06)',border:'none',borderRadius:'50%',width:28,height:28,cursor:'pointer',color:'#8A9BB5',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>

          {/* Mensajes */}
          <div className="aw-msgs">
            {mensajes.map((m, i) => (
              <div key={i} className={m.rol==='user'?'aw-user':m.rol==='sistema'?'aw-sys':'aw-ia'}>
                <p style={{fontFamily:F,fontSize:12.5,color:m.rol==='sistema'?'#F59E0B':m.rol==='user'?'rgba(255,255,255,.85)':'rgba(255,255,255,.7)',lineHeight:1.55,margin:0}}>
                  {m.rol === 'ia' ? renderMensajeIA(m.texto) : renderTexto(m.texto)}
                </p>
              </div>
            ))}
            {cargando && (
              <div className="aw-ia">
                <div className="aw-typing"><span/><span/><span/></div>
              </div>
            )}
            {escalado && (
              <div style={{display:'flex',flexDirection:'column',gap:8,padding:'4px 0 8px',animation:'aw-msg 0.3s ease both'}}>
                <a href={waLink} target="_blank" rel="noreferrer"
                  style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'rgba(37,211,102,0.12)',border:'1px solid rgba(37,211,102,0.3)',borderRadius:12,padding:'11px',fontFamily:F,fontSize:13,fontWeight:700,color:'#25D366',textDecoration:'none'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 1C5.93 1 1 5.93 1 12c0 1.97.518 3.82 1.426 5.427L1 23l5.734-1.498A10.956 10.956 0 0012 23c6.07 0 11-4.93 11-11S18.07 1 12 1z"/></svg>
                  Hablar con asesor por WhatsApp
                </a>
                <button onClick={() => { setEscalado(false); setMensajes(prev => [...prev, { rol:'ia', texto:'Claro, sigamos. En que mas te puedo ayudar?', ts:Date.now() }]); }}
                  style={{background:'none',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'9px',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)',cursor:'pointer'}}>
                  Continuar con la IA
                </button>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          {!escalado && (
            <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:8,alignItems:'flex-end',flexShrink:0}}>
              <textarea ref={inputRef} className="aw-inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="Escribe tu pregunta..." rows={1} style={{maxHeight:80}}/>
              <button className="aw-send" onClick={enviar} disabled={cargando||!input.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          )}

          <div style={{padding:'6px 14px 10px',fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.15)',textAlign:'center',flexShrink:0}}>
            BQinzagencIA · Lun-Vie 8am-6pm · Madrid, España
          </div>
        </div>
      )}

      {/* Burbuja "¿En qué te puedo ayudar?" */}
      {burbuja && !open && (
        <div className="aw-bubble-msg">
          <button className="aw-bubble-close" onClick={e=>{e.stopPropagation();setBurbuja(false)}}>✕</button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#25D366',flexShrink:0,boxShadow:'0 0 6px #25D366'}}/>
            <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>¿En qué te puedo ayudar? 👋</span>
          </div>
          <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.4)',margin:'4px 0 0',lineHeight:1.4}}>Soy AIA, tu asistente de BQinzagencIA</p>
        </div>
      )}

      {/* FAB — oculto mientras el chat esta abierto: el panel ya tiene su
          propio boton de cerrar en el header, y en celular el panel ocupa
          toda la pantalla, asi que dejar el FAB fijo encima tapaba el
          boton de enviar. */}
      {!open && (
        <button className="aw-fab" onClick={()=>{setOpen(o=>!o);setBurbuja(false)}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
          <div className="aw-badge"/>
          <img src="/agenciame-robot-final.png" alt="BQinzagencIA" style={{width:54,height:54,objectFit:'contain'}}/>
          <div className={`aw-label${hover?' show':''}`}>
            <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF'}}>Soporte IA</div>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginTop:1}}>Respuesta inmediata</div>
          </div>
        </button>
      )}
    </>
  );
}
