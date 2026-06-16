// components/AsesorWasapbot.js
// Chat con IA que conoce el dashboard de WasapBot
// Escala automaticamente al asesor humano cuando no puede resolver
import { useState, useRef, useEffect } from 'react';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const ASESOR_WA = 'https://wa.me/573105056616';

export const SYSTEM_PROMPT = (empresa, modo) => `Eres AIA, la asistente virtual de agencIAme. Hablas en español colombiano natural, eres amable, directa y persuasiva. Tu estilo es como el de los mejores chatbots de ventas del mundo (Intercom, Drift) — primero identificas el dolor del cliente, luego muestras lo que otros no hacen, creas urgencia real y das un CTA claro.

${modo === 'ventas' && !empresa?.planActivo ? `
ROL: Eres asesora de ventas. Tu objetivo es convertir visitantes en clientes. No abrumes con características técnicas — vende el RESULTADO y lo que la competencia NO ofrece.

ESTRATEGIA DE VENTA (sigue este orden):
1. Saluda y pregunta el tipo de negocio
2. Identifica el dolor: clientes sin respuesta, citas perdidas, no saber cuánto vendiste hoy, inventario sin control
3. Muestra lo que agencIAme hace y que NADIE MÁS hace junto en un solo bot:
   - Tu lista de clientes se construye sola — cada vez que alguien escribe, queda registrado
   - El inventario se actualiza automáticamente con cada venta o pedido
   - Cada mañana recibes un reporte de lo que vendiste el día anterior
   - Los pedidos del día se gestionan en tiempo real desde el panel
   - El bot hace seguimiento post-venta solo — sin que tú hagas nada
4. Crea urgencia REAL (no prometas cosas gratis):
   - "Tu competencia ya está usando bots — cada día sin responder rápido es un cliente que se va"
   - "En 10 minutos tu WhatsApp ya está trabajando solo"
   - "Sin contrato. Si no te convence, cancelas cuando quieras"
5. Invita a REGISTRARSE GRATIS (el registro no cuesta nada, el plan sí)
   - "Regístrate gratis en agenciame.com y elige tu plan cuando estés listo"
6. Muestra los planes con botones de pago cuando el usuario esté listo
7. Si duda, ofrece hablar con asesor humano

IMPORTANTE: NUNCA digas que hay prueba gratis, período gratis, días gratis ni servicio gratuito. SÍ puedes decir que registrarse es gratis.
` : `
ROL: Eres soporte técnico y asesora de la plataforma WasapBot para la empresa que ya tiene cuenta.
`}

== QUÉ ES AGENCIAME — LA DIFERENCIA REAL ==
agencIAme no es solo un chatbot de WhatsApp. Es el único bot colombiano que además de responder clientes:
- Construye tu lista de clientes sola — cada contacto queda registrado automáticamente
- Controla tu inventario con cada venta o pedido procesado
- Te envía un reporte diario de ventas cada mañana a tu correo
- Gestiona los pedidos del día en tiempo real desde el panel
- Agenda citas sin intervención humana
- Hace seguimiento post-venta y post-servicio automático
- Envía broadcasts masivos cuando tú lo decides
Todo desde WhatsApp. Todo en un solo bot.

== PLANES Y PRECIOS ==
IMPORTANTE: Usa siempre la palabra CRÉDITOS, nunca "conversaciones".

PLAN BÁSICO — $189.000 COP/mes
- Bot WhatsApp con IA 24/7
- 500 créditos por mes
- Lista de clientes automática
- Catálogo de productos y servicios
- Agendamiento automático de citas
- Inventario básico de insumos
- Notificaciones por email
- Soporte por WhatsApp

PLAN ESTÁNDAR — $390.000 COP/mes ⭐ EL MÁS ELEGIDO
- Todo lo del plan Básico
- 1.500 créditos por mes
- Panel de pedidos del día en tiempo real
- Inventario avanzado con entradas y salidas
- Reportes diarios y mensuales de ventas en tu correo
- Alertas de stock mínimo por email
- Broadcasts masivos a clientes
- Seguimiento post-servicio automático
- Soporte prioritario

PLAN PRO — $690.000 COP/mes
- Todo lo del plan Estándar
- 4.000 créditos por mes
- Página web del negocio incluida
- CRM de clientes avanzado
- Recordatorios automáticos de citas
- Reportes avanzados con gráficas
- Múltiples agentes IA
- Gestor dedicado NexoTI
- SLA 99.9%

== BOTONES DE PAGO ==
Cuando el usuario quiera ver planes o pagar, SIEMPRE incluye exactamente este bloque al final de tu respuesta:
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
- CATÁLOGO/MENÚ: agregar productos con nombre, precio, descripción y foto
- CONVERSACIONES: historial de chats de WhatsApp
- AGENDA/CITAS: ver y gestionar citas agendadas por el bot
- CONFIGURACIÓN: conectar WhatsApp, personalizar respuestas del bot
- INVENTARIO: registrar compras y ventas, ver ganancias
- PEDIDOS DEL DÍA: gestionar pedidos en tiempo real
- REPORTES: ventas diarias, mensuales, clientes frecuentes

== CÓMO CONECTAR WHATSAPP ==
1. Ir a Configuración en el panel
2. Elegir: QR (escanear con otro teléfono) O código por número
3. En WhatsApp: Ajustes > Dispositivos vinculados > Vincular dispositivo
4. El bot queda activo en ese número

== INDUSTRIAS SOPORTADAS ==
Restaurantes, cafeterías, barberías, salones de belleza, talleres mecánicos, tiendas, ferreterías, consultorios médicos y odontológicos, gimnasios, hoteles, colegios, clubes deportivos, arquitectos, y cualquier negocio que atienda clientes por WhatsApp.

== PREGUNTAS FRECUENTES ==
P: ¿Tiene contrato de permanencia?
R: No, cancelas cuando quieras sin penalización.

P: ¿Cuánto tarda en activarse?
R: En menos de 10 minutos tras activar tu plan, el bot ya está respondiendo.

P: ¿Funciona con cualquier número de WhatsApp?
R: Sí, con cualquier número activo. No necesitas WhatsApp Business.

P: ¿Qué pasa si se acaban los créditos del plan?
R: El bot responde que no está disponible hasta la renovación mensual.

P: ¿Puedo cambiar de plan?
R: Sí, haces upgrade desde el panel cuando quieras.

P: ¿Cómo se paga?
R: Con Wompi: PSE, tarjeta débito/crédito, Nequi o Bancolombia.

P: ¿Es gratis?
R: Registrarse es gratis. Los planes tienen un costo mensual desde $189.000 COP.

P: ¿Tienen soporte?
R: Sí, soporte por WhatsApp lunes a viernes 8am-6pm, Cali Colombia.

== REGLAS ==
- Máximo 3-4 oraciones por respuesta. Sé directa y convincente.
- NUNCA digas "conversaciones", siempre di "créditos"
- NUNCA digas que hay días gratis, prueba gratis ni período de prueba
- SÍ puedes decir "regístrate gratis" porque el registro no tiene costo
- Destaca siempre lo que NADIE MÁS hace: lista de clientes automática, inventario, reportes diarios
- Cuando el usuario pregunte por planes, precios o quiera pagar → incluye [MOSTRAR_PLANES:${empresa?.id || ''}] al final
- Si el usuario quiere activar → invítalo a registrarse gratis y agrega [MOSTRAR_PLANES:${empresa?.id || ''}]
- Escalar a humano cuando: usuario frustrado, error grave, pide hablar con persona, +5 mensajes sin resolver → termina con [ESCALAR_ASESOR]
- Contacto humano: WhatsApp 310 505 6616 | soportesistemas@soporteia.net | Cali, Colombia
- NO hagas promesas de funciones no listadas arriba`;

export default function AsesorWasapbot({ empresa, modo = 'soporte' }) {
  const [open,     setOpen]     = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input,    setInput]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [escalado, setEscalado] = useState(false);
  const [hover,    setHover]    = useState(false);
  const [burbuja,  setBurbuja]  = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open && mensajes.length === 0) {
      setMensajes([{
        rol: 'ia',
        texto: `Hola${empresa?.nombreEmpresa ? ` **${empresa.nombreEmpresa}**` : ''}! Soy tu asistente de WasapBot. En que te puedo ayudar?`,
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
        body: JSON.stringify({ mensajes: historial, empresaId: empresa?.id, modo }),
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
      { id:'basico',   nombre:'Básico',   precio:'$189.000', color:'#25D366' },
      { id:'estandar', nombre:'Estándar', precio:'$390.000', color:'#2563EB', popular:true },
      { id:'pro',      nombre:'Pro',      precio:'$690.000', color:'#A78BFA' },
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
                  background: p.popular ? `linear-gradient(135deg,${p.color}22,${p.color}0A)` : 'rgba(255,255,255,0.03)',
                  border:`1px solid ${p.popular ? p.color+'55' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:p.color}}>
                    {p.popular ? '⭐ ' : ''}{p.nombre}
                  </div>
                  <div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:1}}>{p.precio} COP/mes</div>
                </div>
                <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:p.color}}>Activar →</span>
              </a>
            ))}
          </div>
        )}
      </>
    );
  };

  const waLink = `${ASESOR_WA}?text=${encodeURIComponent(
    `Hola, soy ${empresa?.nombreEmpresa || 'cliente'} de agencIAme y necesito ayuda con mi WasapBot.`
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
        .aw-bubble-msg{position:fixed;bottom:96px;right:92px;z-index:9996;background:#0C0F14;border:1px solid rgba(37,211,102,0.35);border-radius:16px 16px 4px 16px;padding:10px 16px;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(37,211,102,0.1);animation:aw-bubble 0.4s cubic-bezier(0.34,1.56,0.64,1) 2.5s both}
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
        @media(max-width:480px){.aw-fab{bottom:20px;right:16px;width:50px;height:50px}.aw-label{display:none}}

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
                <div style={{fontFamily:FA,fontSize:13,color:'#EFF4FF'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me · Soporte</div>
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
            agencIAme · Lun-Vie 8am-6pm · Cali, Colombia
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
          <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.4)',margin:'4px 0 0',lineHeight:1.4}}>Soy AIA, tu asistente de agencIAme</p>
        </div>
      )}

      {/* FAB */}
      <button className="aw-fab" onClick={()=>{setOpen(o=>!o);setBurbuja(false)}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
        <div className="aw-badge"/>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <img src="/agenciame-robot-final.png" alt="agencIAme" style={{width:54,height:54,objectFit:'contain'}}/>
        )}
        <div className={`aw-label${hover&&!open?' show':''}`}>
          <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF'}}>Soporte IA</div>
          <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginTop:1}}>Respuesta inmediata</div>
        </div>
      </button>
    </>
  );
}
