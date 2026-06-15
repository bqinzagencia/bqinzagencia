// components/AsesorWasapbot.js
// Chat con IA que conoce el dashboard de WasapBot
// Escala automaticamente al asesor humano cuando no puede resolver
import { useState, useRef, useEffect } from 'react';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const ASESOR_WA = 'https://wa.me/573105056616';

export const SYSTEM_PROMPT = (empresa) => `Eres el asistente de soporte de agencIAme para la plataforma WasapBot.
Eres amable, claro y directo. Respondes en espanol colombiano natural.

EMPRESA CON LA QUE HABLAS:
- Nombre: ${empresa?.nombreEmpresa || 'Cliente'}
- Industria: ${empresa?.industria || 'negocio'}
- Plan actual: ${empresa?.plan || 'sin plan'}
- Plan activo: ${empresa?.planActivo ? 'Si' : 'No - necesita activar un plan'}
- Email: ${empresa?.email || 'no registrado'}

TU CONOCIMIENTO DEL PANEL:
- INICIO: estadisticas, conversaciones del dia/semana/total, consumo del plan
- MENU/CATALOGO: agregar platos o productos con nombre, precio, descripcion y foto. El bot usa esto para responder clientes
- CONVERSACIONES: historial de chats de WhatsApp (requiere plan activo)
- CITAS/AGENDA: el bot agenda automaticamente por WhatsApp (requiere plan activo)
- CONFIGURACION: conectar WhatsApp con codigo QR o codigo por numero
- INVENTARIO Y VENTAS: registrar compras y ventas, ver ganancias (requiere plan)
- MENU DEL DIA: abrir menu diario con stock de porciones (requiere plan)
- PEDIDOS DEL DIA: gestionar pedidos en tiempo real, configurar Nequi (requiere plan)

PLANES DISPONIBLES:
- Basico 189.000/mes: bot IA 24/7, 500 convs, catalogo, citas, inventario basico
- Estandar 390.000/mes: todo lo basico + 1500 convs, pedidos, reportes, broadcasts
- Pro 690.000/mes: todo estandar + 4000 convs, pagina web, CRM, recordatorios

COMO CONECTAR WHATSAPP:
1. Ir a Configuracion en el panel
2. Elegir QR (escanear con otro telefono) o codigo por numero
3. En WhatsApp: Ajustes -> Dispositivos vinculados -> Vincular dispositivo

REGLAS:
- Se breve: maximo 3-4 oraciones por respuesta
- Si el problema es tecnico grave o llevas mas de 4 mensajes sin resolver, escala
- ESCALAR: cuando no puedas resolver, termina con exactamente: [ESCALAR_ASESOR]
- Razones para escalar: facturacion, errores graves, usuario frustrado, usuario lo pide
- NO escales por preguntas simples de uso`;

export default function AsesorWasapbot({ empresa }) {
  const [open,     setOpen]     = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input,    setInput]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [escalado, setEscalado] = useState(false);
  const [hover,    setHover]    = useState(false);
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
        body: JSON.stringify({ mensajes: historial, empresaId: empresa?.id }),
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

  const waLink = `${ASESOR_WA}?text=${encodeURIComponent(
    `Hola, soy ${empresa?.nombreEmpresa || 'cliente'} de agencIAme y necesito ayuda con mi WasapBot.`
  )}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes aw-in{from{opacity:0;transform:scale(0.7) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes aw-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,0,0.55),0 6px 24px rgba(255,107,0,0.35)}60%{box-shadow:0 0 0 12px rgba(255,107,0,0),0 6px 24px rgba(255,107,0,0.35)}}
        @keyframes aw-panel{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes aw-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes aw-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .aw-fab{position:fixed;bottom:28px;right:28px;z-index:9997;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:transparent;display:flex;align-items:center;justify-content:center;animation:aw-in 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.5s both;transition:transform 0.2s;filter:drop-shadow(0 4px 16px rgba(37,211,102,0.25))}
        .aw-fab:hover{transform:scale(1.12)!important}
        .aw-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#25D366;border:2.5px solid #06090D}
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
                  {renderTexto(m.texto)}
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

      {/* FAB */}
      <button className="aw-fab" onClick={()=>setOpen(o=>!o)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
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
