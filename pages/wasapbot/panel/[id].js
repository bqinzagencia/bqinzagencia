// pages/wasapbot/panel/[id].js
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getConfigIndustria, DIAS_SEMANA, horarioSemanalDefault } from '../../../lib/wasapbotConfig';
import { auth, subirFotoCatalogo, borrarFotoCatalogo } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';
import * as Ic from '../../../components/Icons';

const AsesorWasapbot = dynamic(() => import('../../../components/AsesorWasapbot'), { ssr: false });

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const WA     = process.env.NEXT_PUBLIC_WA_SERVER || 'REEMPLAZAR_URL_RAILWAY';
const SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';

const META_APP_ID    = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID = '1588866396584083';

const PLANES = {
  prueba_5k:{ nombre:'Prueba 24h',     tokens:45000,  convs:300,  color:'#F59E0B', precio:'Gratis' },
  basico:   { nombre:'Básico',   tokens:50000,  convs:500,  color:'#25D366', precio:'79€'  },
  estandar: { nombre:'Estándar', tokens:150000, convs:1500, color:'#2563EB', precio:'149€' },
  pro:      { nombre:'Pro',      tokens:400000, convs:4000, color:'#A78BFA', precio:'249€' },
  wasapbot: { nombre:'Sin plan', tokens:0,      convs:0,    color:'#6B7280', precio:'Gratis'   },
};

const ESTADO_CITA = {
  pendiente:  { label:'Pendiente',  bg:'rgba(245,158,11,0.1)',  color:'#F59E0B', border:'rgba(245,158,11,0.3)'  },
  confirmada: { label:'Confirmada', bg:'rgba(37,211,102,0.1)',  color:'#25D366', border:'rgba(37,211,102,0.3)'  },
  cancelada:  { label:'Cancelada',  bg:'rgba(239,68,68,0.1)',   color:'#EF4444', border:'rgba(239,68,68,0.3)'   },
  completada: { label:'Completada', bg:'rgba(96,165,250,0.1)',  color:'#60A5FA', border:'rgba(96,165,250,0.3)'  },
};

function Guia({ texto, icono=Ic.Lightbulb, visible=true }) {
  if (!visible) return null;
  const IconoComp = icono;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:8,background:'rgba(37,211,102,0.05)',border:'1px dashed rgba(37,211,102,0.25)',borderRadius:8,padding:'8px 12px',marginTop:6}}>
      <IconoComp size={14} style={{flexShrink:0,marginTop:1,color:'#25D366',opacity:0.85}}/>
      <span style={{fontFamily:F,fontSize:11,color:'rgba(37,211,102,0.75)',lineHeight:1.6}}>{texto}</span>
    </div>
  );
}

// Mapa emoji→icono para el modal de bienvenida (pasos de industria)
const BIENVENIDA_ICONO = {
  '🍽️': Ic.ClipboardList, '📦': Ic.Package,    '🛒': Ic.ShoppingCart, '📱': Ic.Smartphone,
  '🔧': Ic.Settings,      '📅': Ic.Calendar,   '💈': Ic.Edit,          '🐾': Ic.Compass,
  '✂️': Ic.Edit,           '🎂': Ic.Tag,           '🏪': Ic.Home,        '💊': Ic.Plus,          '🧠': Ic.Lightbulb,
  '📷': Ic.Camera,        '📊': Ic.BarChart,    '🚛': Ic.ArrowUpRight,  '💪': Ic.TrendingUp,
  '🏥': Ic.FileText,      '📚': Ic.ClipboardList,'💻': Ic.Hash,          '🏠': Ic.MapPin,
  '💼': Ic.DollarSign,
};

function ModalBienvenidaWasapbot({ nombre, cfg, onCerrar }) {
  const [paso, setPaso] = useState(0);
  const d = cfg.dashboard;
  const pasos = [
    { icono: Ic.Zap,          titulo:`¡Bienvenido, ${nombre||'emprendedor'}!`, texto:'Tu WasapBot está listo. En unos minutos lo tendrás configurado para que responda a tus clientes las 24 horas. Te voy a guiar paso a paso.', color:'#25D366' },
    ...d.bienvenida.map(p=>({ ...p, icono: BIENVENIDA_ICONO[p.emoji] || Ic.Lightbulb, color:'#60A5FA' })),
    { icono: Ic.ArrowUpRight, titulo:'¡Listo para arrancar!', texto:'Las casillas vacías tienen anotaciones en verde que te guían. A medida que las llenas, las anotaciones desaparecen automáticamente. ¡Empecemos!', color:'#25D366' },
  ];
  const p = pasos[paso];
  const PIcono = p.icono;
  const ultimo = paso === pasos.length - 1;
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes pulse-wb{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)}70%{box-shadow:0 0 0 12px rgba(37,211,102,0)}}`}</style>
      <div style={{background:'#0C0F14',border:`1px solid ${p.color}33`,borderRadius:24,padding:'40px 36px',maxWidth:480,width:'100%',animation:'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',boxShadow:`0 40px 80px rgba(0,0,0,0.6),0 0 40px ${p.color}15`}}>
        <div style={{display:'flex',gap:6,marginBottom:32}}>
          {pasos.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=paso?p.color:'rgba(255,255,255,0.08)',transition:'background 0.4s'}}/>)}
        </div>
        <div style={{width:72,height:72,borderRadius:'50%',background:`${p.color}15`,border:`2px solid ${p.color}40`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,animation:'pulse-wb 2.5s ease-in-out infinite',color:p.color}}><PIcono size={32} strokeWidth={1.5}/></div>
        <h2 style={{fontFamily:FA,fontSize:26,fontWeight:400,color:'#EFF4FF',marginBottom:12,lineHeight:1.2}}>{p.titulo}</h2>
        <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.8,marginBottom:36,fontWeight:300}}>{p.texto}</p>
        <div style={{display:'flex',gap:10}}>
          {paso>0&&<button onClick={()=>setPaso(p=>p-1)} style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'12px 20px',fontFamily:F,fontSize:13,cursor:'pointer'}}>← Anterior</button>}
          <button onClick={()=>ultimo?onCerrar():setPaso(p=>p+1)} style={{flex:1,background:`linear-gradient(135deg,${p.color},${p.color}BB)`,color:'#fff',border:'none',borderRadius:10,padding:'12px 20px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer'}}>
            {ultimo?'¡Vamos a configurar! 🚀':'Siguiente →'}
          </button>
        </div>
        {!ultimo&&<button onClick={onCerrar} style={{display:'block',width:'100%',marginTop:14,background:'none',border:'none',fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.2)',cursor:'pointer',textAlign:'center'}}>Saltar introducción</button>}
      </div>
    </div>
  );
}

function CandadoPremium({ empresaId, nombreEmpresa, mensaje }) {
  return (
    <div style={{borderRadius:16,border:'1px solid rgba(245,158,11,0.2)',padding:'48px 28px',textAlign:'center',background:'rgba(12,15,20,0.98)'}}>
      <div style={{marginBottom:16,display:'flex',justifyContent:'center',color:'#F59E0B'}}><Ic.Lock size={40} strokeWidth={1.5}/></div>
      <div style={{fontFamily:FA,fontSize:22,color:'#EFF4FF',marginBottom:8,fontWeight:400}}>Función premium</div>
      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.7,marginBottom:24,maxWidth:320,margin:'0 auto 24px'}}>
        {mensaje||'Activa tu plan para desbloquear esta función y empezar a crecer con tu bot.'}
      </div>
      <a href={'/wasapbot/planes?id='+empresaId+'&nombre='+encodeURIComponent(nombreEmpresa||'')}
        style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:10,padding:'12px 28px',fontFamily:F,fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 6px 24px rgba(245,158,11,0.35)'}}>
        <Ic.Zap size={14}/> Activar mi plan →
      </a>
      <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:10}}>Desde 79€/mes · Sin contratos · Cancela cuando quieras</div>
    </div>
  );
}

function SimuladorChat({ empresaId, empresa }) {
  const F = "'Inter', system-ui, sans-serif";
  const [mensajes, setMensajes] = useState([{ role:'assistant', content:`¡Hola! 👋 Soy el asistente de *${empresa?.nombreEmpresa||'tu negocio'}*. ¿En qué puedo ayudarte hoy?` }]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef(null);
  const sessionId = useRef(`sim_${Date.now()}`);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes, cargando]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput('');
    const nuevos = [...mensajes, { role:'user', content:texto }];
    setMensajes(nuevos);
    setCargando(true);
    try {
      const r = await fetch('/api/whatsapp-baileys', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-server-secret': SECRET },
        body: JSON.stringify({
          empresaId,
          numeroCliente: sessionId.current,
          texto,
        }),
      });
      const d = await r.json();
      const resp = d.respuesta || 'Sin respuesta.';
      setMensajes(prev => [...prev, { role:'assistant', content:resp }]);
    } catch {
      setMensajes(prev => [...prev, { role:'assistant', content:'Error de conexión. Intenta de nuevo.' }]);
    }
    setCargando(false);
  };

  const PREGUNTAS = ['Hola', 'Qué servicios ofrecen', 'Cuánto cuestan', 'Quiero una cita', 'Cuáles son los horarios'];

  return (
    <div>
      {/* Mensajes */}
      <div ref={scrollRef} style={{height:400,overflowY:'auto',padding:'16px 12px',display:'flex',flexDirection:'column',gap:8,background:'#0B141A'}}>
        {mensajes.map((m,i) => (
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{
              maxWidth:'75%',background:m.role==='user'?'#005C4B':'#202C33',
              borderRadius:m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px',
              padding:'8px 12px',fontFamily:F,fontSize:13,color:'#EFF4FF',lineHeight:1.5,
              whiteSpace:'pre-wrap',wordBreak:'break-word',
            }}>
              {m.content.replace(/\*([^*]+)\*/g,'$1')}
            </div>
          </div>
        ))}
        {cargando && (
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{background:'#202C33',borderRadius:'12px 12px 12px 2px',padding:'10px 14px',display:'flex',gap:4}}>
              {[0,1,2].map(i=>(<div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#4B6080',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>))}
            </div>
          </div>
        )}
      </div>
      {/* Preguntas rápidas */}
      <div style={{padding:'8px 12px',display:'flex',gap:6,flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.05)',background:'#111B21'}}>
        {PREGUNTAS.map(p=>(
          <button key={p} onClick={()=>{setInput(p);}} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:99,padding:'4px 12px',fontFamily:F,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>{p}</button>
        ))}
      </div>
      {/* Input */}
      <div style={{padding:'10px 12px',background:'#202C33',display:'flex',gap:8,alignItems:'center'}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&enviar()}
          placeholder="Escribe como si fueras un cliente..."
          style={{flex:1,background:'#2A3942',border:'none',borderRadius:99,padding:'10px 16px',fontFamily:F,fontSize:13,color:'#EFF4FF',outline:'none'}}
        />
        <button onClick={enviar} disabled={cargando||!input.trim()}
          style={{background:'#25D366',border:'none',borderRadius:'50%',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',opacity:cargando||!input.trim()?0.5:1,flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

export default function WasapBotPanel() {
  const router = useRouter();
  const { id } = router.query;

  const [empresa,        setEmpresa]        = useState(null);
  const [conocimiento,   setConocimiento]   = useState(null);
  const [loadError,      setLoadError]      = useState('');
  const [status,         setStatus]         = useState('loading');
  const [convs,          setConvs]          = useState([]);
  const [citas,          setCitas]          = useState([]);
  const [citasFiltro,    setCitasFiltro]    = useState('todos');
  const [stats,          setStats]          = useState({ hoy:0, semana:0, total:0, tokensUsados:0 });
  const [tab,            setTab]            = useState('inicio');
  const [editando,       setEditando]       = useState(false);
  const [itemsEdit,      setItemsEdit]      = useState([]);
  const [savingCat,      setSavingCat]      = useState(false);
  const [saveMsg,        setSaveMsg]        = useState('');
  const [horarioSemanal, setHorarioSemanal] = useState(horarioSemanalDefault());
  const [savingHorario,  setSavingHorario]  = useState(false);
  const [horarioMsg,     setHorarioMsg]     = useState('');
  const [updatingCita,   setUpdatingCita]   = useState(null);
  const [guiasVistas,    setGuiasVistas]    = useState({});
  const [subiendoFoto,   setSubiendoFoto]   = useState(null); // idx del item cuya foto se está subiendo
  const [errorFoto,      setErrorFoto]      = useState({});   // {idx: mensaje}
  const [generandoPrompt,  setGenerandoPrompt]  = useState(false);
  const [promptGenerado,   setPromptGenerado]   = useState('');
  const [showModalPrompt,  setShowModalPrompt]  = useState(false);
  const [datosManuales,    setDatosManuales]    = useState('');
  const [promptGuardado,   setPromptGuardado]   = useState(false);
  const [broadcastMsg,   setBroadcastMsg]   = useState('');
  const [broadcastEnviando, setBroadcastEnviando] = useState(false);
  const [broadcastProgreso, setBroadcastProgreso] = useState(null);
  const [broadcastError, setBroadcastError] = useState('');
  const [promptAgente,   setPromptAgente]   = useState('');
  const [agenteId,       setAgenteId]       = useState('');
  const [savingPrompt,   setSavingPrompt]   = useState(false);
  const [promptMsg,      setPromptMsg]      = useState('');
  const [webForm,        setWebForm]        = useState({ tituloWeb:'', descripcionWeb:'', fotoWebPortada:'', webActivaWasapbot:true });
  const [savingWeb,      setSavingWeb]      = useState(false);
  const [webMsg,         setWebMsg]         = useState('');
  const [sdkListo,       setSdkListo]       = useState(false);
  const [conectando,     setConectando]     = useState(false);
  const [errorConexion,  setErrorConexion]  = useState('');
  const [telegramToken,      setTelegramToken]      = useState('');
  const [conectandoTelegram, setConectandoTelegram] = useState(false);
  const [telegramMsg,        setTelegramMsg]        = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    cargarDatos(); cargarCitas(); verificarStatus();
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Guías de bienvenida desactivadas: el panel se muestra directo, sin
    // interrupciones, para todas las empresas (nuevas y existentes).
    if (localStorage.getItem('wasapbot_nuevo_' + id)) {
      localStorage.removeItem('wasapbot_nuevo_' + id);
    }
    try { const g = localStorage.getItem('wasapbot_guias_' + id); if (g) setGuiasVistas(JSON.parse(g)); } catch {}
  }, [id]);

  const marcarGuia = (clave) => {
    setGuiasVistas(prev => { const n={...prev,[clave]:true}; if(id) localStorage.setItem('wasapbot_guias_'+id,JSON.stringify(n)); return n; });
  };

  // Embedded Signup de Meta — mismo mecanismo que /wasapbot/activar
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({ appId: META_APP_ID, cookie: true, xfbml: true, version: 'v22.0' });
      setSdkListo(true);
    };
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/es_ES/sdk.js';
      document.body.appendChild(js);
    } else if (window.FB) {
      setSdkListo(true);
    }

    const onMessage = (event) => {
      if (!event.origin || !event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
          const { phone_number_id, waba_id } = data.data || {};
          window.__wasapbotEmbeddedSignupData = { phoneNumberId: phone_number_id, wabaId: waba_id };
        }
      } catch (e) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const conectarConFacebook = () => {
    if (!sdkListo || !window.FB) { setErrorConexion('Aún está cargando, espera un segundo e inténtalo de nuevo'); return; }
    setErrorConexion('');
    window.__wasapbotEmbeddedSignupData = null;

    window.FB.login((response) => {
      if (response.authResponse?.code) {
        finalizarConexionMeta(response.authResponse.code);
      } else {
        setErrorConexion('No se completó la conexión con Facebook. Puedes intentarlo de nuevo.');
      }
    }, {
      config_id: META_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {} },
    });
  };

  const finalizarConexionMeta = async (code) => {
    setConectando(true);
    setErrorConexion('');
    await new Promise(r => setTimeout(r, 1500));
    const datos = window.__wasapbotEmbeddedSignupData;

    if (!datos?.phoneNumberId || !datos?.wabaId) {
      setErrorConexion('No pudimos completar la conexión automáticamente. Nuestro equipo la activará manualmente en menos de 24h.');
      setConectando(false);
      return;
    }

    try {
      const r = await fetch('/api/wasapbot-embedded-signup-callback', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ empresaId:id, code, phoneNumberId: datos.phoneNumberId, wabaId: datos.wabaId }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'No se pudo completar la conexión');
      setStatus('connected');
      setTab('inicio');
    } catch (e) {
      setErrorConexion(e.message);
    } finally {
      setConectando(false);
    }
  };

  const conectarTelegram = async () => {
    const tok = telegramToken.trim();
    if (!tok) { setTelegramMsg('Pega el token que te dio @BotFather'); return; }
    setConectandoTelegram(true);
    setTelegramMsg('');
    try {
      const r = await fetch('/api/telegram-conectar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: id, botToken: tok }),
      });
      const dRes = await r.json();
      if (!dRes.ok) { setTelegramMsg(dRes.error || 'No se pudo conectar.'); setConectandoTelegram(false); return; }
      setTelegramMsg(`✓ Conectado como @${dRes.botUsername}. Ya puedes probarlo escribiéndole a tu bot en Telegram.`);
      setEmpresa(prev => ({ ...prev, telegram: { botToken: tok, botUsername: dRes.botUsername, activo: true } }));
      setTelegramToken('');
    } catch {
      setTelegramMsg('Error de conexión. Intenta de nuevo.');
    }
    setConectandoTelegram(false);
  };

  const cargarDatos = async () => {
    try {
      const r = await fetch(`/api/wasapbot-panel?id=${id}`);
      if (!r.ok) {
        const e = await r.json().catch(()=>({}));
        // Si es 404, limpiar localStorage y redirigir al login para que busque de nuevo
        if (r.status === 404 || r.status === 403) {
          localStorage.removeItem('wasapbot_empresa_id');
          router.replace('/wasapbot/login');
          return;
        }
        setLoadError(e.error||`Error ${r.status}`);
        return;
      }
      const d = await r.json();
      if (!d.ok) { setLoadError(d.error||'Error cargando datos'); return; }
      setEmpresa({ id, ...d.empresa });
      setWebForm({
        tituloWeb: d.empresa.tituloWeb || d.empresa.nombreEmpresa || '',
        descripcionWeb: d.empresa.descripcionWeb || '',
        fotoWebPortada: d.empresa.fotoWebPortada || '',
        webActivaWasapbot: d.empresa.webActivaWasapbot !== false,
      });
      // Cargar prompt del agente IA
      const agSnap = await fetch(`/api/wasapbot-panel?id=${id}&subcol=agentes`).then(r=>r.json()).catch(()=>({}));
      if (agSnap.ok && agSnap.agentes?.[0]) {
        setPromptAgente(agSnap.agentes[0].prompt || '');
        setAgenteId(agSnap.agentes[0].id || '');
      }
      setConvs(d.convs||[]);
      setConocimiento(d.conocimiento||{});
      setItemsEdit((d.conocimiento?.servicios||[]).map(s=>({...s})));
      setPromptGenerado(d.agente?.prompt || '');
      setDatosManuales(d.agente?.prompt || '');
      const semanalGuardado = d.conocimiento?.horarios?.semanal;
      if (semanalGuardado) {
        setHorarioSemanal(prev => ({ ...prev, ...semanalGuardado }));
      }
      const hoy=new Date(); hoy.setHours(0,0,0,0);
      const sem=new Date(); sem.setDate(sem.getDate()-7);
      const list=d.convs||[];
      setStats({
        hoy:   list.filter(c=>c.ultimoMensaje?._seconds?(c.ultimoMensaje._seconds*1000)>=hoy.getTime():false).length,
        semana:list.filter(c=>c.ultimoMensaje?._seconds?(c.ultimoMensaje._seconds*1000)>=sem.getTime():false).length,
        total: list.length, tokensUsados:d.tokens?.usados||0,
      });
    } catch { setLoadError('No se pudo cargar el panel.'); }
  };

  const cargarCitas = async () => {
    try {
      const r=await fetch(`/api/wasapbot-panel?id=${id}&subcol=citas`);
      if(!r.ok)return;
      const d=await r.json();
      if(d.ok&&d.citas) setCitas([...d.citas].sort((a,b)=>(b.fechaHora?._seconds||0)-(a.fechaHora?._seconds||0)));
    } catch {}
  };

  const actualizarEstadoCita = async (citaId, nuevoEstado) => {
    setUpdatingCita(citaId);
    try {
      const r=await fetch('/api/wasapbot-panel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'actualizarCita',empresaId:id,citaId,estado:nuevoEstado})});
      const d=await r.json();
      if(d.ok) setCitas(prev=>prev.map(c=>c.id===citaId?{...c,estado:nuevoEstado}:c));
    } catch {}
    setUpdatingCita(null);
  };

  const eliminarCita = async (citaId) => {
    if(!confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.'))return;
    setUpdatingCita(citaId);
    try {
      const r=await fetch('/api/wasapbot-panel',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'eliminarCita',empresaId:id,citaId})});
      const d=await r.json();
      if(d.ok) setCitas(prev=>prev.filter(c=>c.id!==citaId));
    } catch {}
    setUpdatingCita(null);
  };

  const eliminarCitasCanceladas = async () => {
    const totalCanceladas = citas.filter(c=>c.estado==='cancelada').length;
    if(totalCanceladas===0)return;
    if(!confirm(`¿Eliminar las ${totalCanceladas} citas canceladas? Esta acción no se puede deshacer.`))return;
    try {
      const r=await fetch('/api/wasapbot-panel',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'eliminarCitasCanceladas',empresaId:id})});
      const d=await r.json();
      if(d.ok) setCitas(prev=>prev.filter(c=>c.estado!=='cancelada'));
    } catch {}
  };

  const eliminarConversacion = async (conversacionId) => {
    if(!confirm('¿Eliminar esta conversación? Se borrará todo el historial de mensajes y no se puede deshacer.'))return;
    try {
      const r=await fetch('/api/wasapbot-panel',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'eliminarConversacion',empresaId:id,conversacionId})});
      const d=await r.json();
      if(d.ok) setConvs(prev=>prev.filter(c=>c.id!==conversacionId));
    } catch {}
  };

  const subirFoto = async (idx, archivo) => {
    setSubiendoFoto(idx); setErrorFoto(prev=>({...prev,[idx]:''}));
    try {
      const fotoAnterior = itemsEdit[idx]?.foto;
      const url = await subirFotoCatalogo(id, archivo);
      setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,foto:url}:it));
      if (fotoAnterior) borrarFotoCatalogo(fotoAnterior); // limpieza en segundo plano, sin esperar
    } catch (e) {
      setErrorFoto(prev=>({...prev,[idx]:e.message||'Error al subir la imagen'}));
    }
    setSubiendoFoto(null);
  };

  const quitarFoto = (idx) => {
    const fotoActual = itemsEdit[idx]?.foto;
    setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,foto:''}:it));
    if (fotoActual) borrarFotoCatalogo(fotoActual);
  };

  const enviarBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastEnviando(true); setBroadcastError(''); setBroadcastProgreso(null);
    try {
      let r = await fetch('/api/wasapbot-broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,mensaje:broadcastMsg})});
      let d = await r.json();
      if (!d.ok) { setBroadcastError(d.error||'Error al enviar'); setBroadcastEnviando(false); return; }
      setBroadcastProgreso(d);
      // Continuar en lotes hasta completar
      while (!d.completado) {
        r = await fetch('/api/wasapbot-broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'continuar',empresaId:id,broadcastId:d.broadcastId})});
        d = await r.json();
        if (!d.ok) { setBroadcastError(d.error||'Error al enviar'); break; }
        setBroadcastProgreso(d);
      }
      if (d.ok && d.completado) setBroadcastMsg('');
    } catch (e) { setBroadcastError('Error de conexión'); }
    setBroadcastEnviando(false);
  };

  const verificarStatus = async () => {
    try {
      const r=await fetch(`${WA}/sesion/${id}/status`,{headers:{'x-server-secret':SECRET}});
      const d=await r.json();
      setStatus(d.status||'disconnected');
      pollRef.current=setInterval(async()=>{
        const r2=await fetch(`${WA}/sesion/${id}/status`,{headers:{'x-server-secret':SECRET}}).catch(()=>null);
        const d2=r2?await r2.json().catch(()=>({})):{};
        setStatus(d2.status||'disconnected');
      },30000);
    } catch { setStatus('disconnected'); }
  };

  const guardarCatalogo = async () => {
    setSavingCat(true); setSaveMsg('');
    try {
      const r=await fetch('/api/wasapbot-servicios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,servicios:itemsEdit})});
      const d=await r.json();
      if(d.ok){setSaveMsg('✓ Guardado');setConocimiento(prev=>({...prev,servicios:itemsEdit}));setEditando(false);if(itemsEdit.some(it=>it.nombre?.trim()))marcarGuia('catalogo_items');}
      else setSaveMsg('Error: '+(d.error||''));
    } catch{setSaveMsg('Error de conexión');}
    setSavingCat(false); setTimeout(()=>setSaveMsg(''),3000);
  };

  const guardarHorario = async () => {
    setSavingHorario(true); setHorarioMsg('');
    try {
      const r = await fetch('/api/wasapbot-horario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,horarioSemanal})});
      const d = await r.json();
      if (d.ok) {
        setHorarioMsg('✓ Horario guardado');
        setConocimiento(prev=>({...prev,horarios:{...(prev?.horarios||{}),semanal:horarioSemanal}}));
      } else {
        setHorarioMsg('Error: '+(d.error||''));
      }
    } catch { setHorarioMsg('Error de conexión'); }
    setSavingHorario(false); setTimeout(()=>setHorarioMsg(''),3000);
  };

  const guardarWeb = async () => {
    setSavingWeb(true); setWebMsg('');
    try {
      const r = await fetch('/api/wasapbot-panel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'guardarWeb',empresaId:id,...webForm})});
      const d = await r.json();
      if (d.ok) {
        setWebMsg('✓ Página web guardada');
        setEmpresa(prev=>({...prev,...webForm,slugWeb:d.slugWeb||prev.slugWeb}));
      } else {
        setWebMsg('Error: '+(d.error||''));
      }
    } catch { setWebMsg('Error de conexión'); }
    setSavingWeb(false); setTimeout(()=>setWebMsg(''),3000);
  };

  const subirFotoWeb = async (archivo) => {
    try {
      const url = await subirFotoCatalogo(id, archivo);
      setWebForm(prev=>({...prev,fotoWebPortada:url}));
    } catch (e) {
      setWebMsg('Error al subir imagen: '+(e.message||''));
    }
  };
  const guardarPrompt = async () => {
    setSavingPrompt(true); setPromptMsg('');
    try {
      const r = await fetch('/api/wasapbot-panel', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ accion:'guardarPromptAgente', empresaId:id, agenteId, prompt:promptAgente }),
      });
      const d = await r.json();
      if (d.ok) setPromptMsg('✓ Prompt guardado. El bot ya usa este conocimiento.');
      else setPromptMsg('Error: '+(d.error||''));
    } catch { setPromptMsg('Error de conexión'); }
    setSavingPrompt(false); setTimeout(()=>setPromptMsg(''),4000);
  };

  const toggleDiaAbierto = (diaKey) => {
    setHorarioSemanal(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], abierto: !prev[diaKey]?.abierto, franjas: prev[diaKey]?.franjas?.length ? prev[diaKey].franjas : [{de:'08:00',a:'18:00'}] },
    }));
  };

  const actualizarFranja = (diaKey, idx, campo, valor) => {
    setHorarioSemanal(prev => {
      const franjas = (prev[diaKey]?.franjas||[]).map((f,i)=>i===idx?{...f,[campo]:valor}:f);
      return { ...prev, [diaKey]: { ...prev[diaKey], franjas } };
    });
  };

  const agregarFranja = (diaKey) => {
    setHorarioSemanal(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], franjas: [...(prev[diaKey]?.franjas||[]), {de:'08:00',a:'18:00'}] },
    }));
  };

  const eliminarFranja = (diaKey, idx) => {
    setHorarioSemanal(prev => ({
      ...prev,
      [diaKey]: { ...prev[diaKey], franjas: (prev[diaKey]?.franjas||[]).filter((_,i)=>i!==idx) },
    }));
  };

  const copiarHorarioATodos = (diaKey) => {
    const origen = horarioSemanal[diaKey];
    if (!origen) return;
    setHorarioSemanal(prev => {
      const next = {...prev};
      DIAS_SEMANA.forEach(d => {
        if (d.key !== diaKey) next[d.key] = { abierto: origen.abierto, franjas: origen.franjas.map(f=>({...f})) };
      });
      return next;
    });
  };

  const cerrarSesion = async () => {
    if(!confirm('¿Cerrar sesión?'))return;
    try { await signOut(auth); localStorage.removeItem('wasapbot_empresa_id'); router.replace('/wasapbot/login'); } catch {}
  };

  const toDate=ts=>{if(!ts)return null;if(ts._seconds)return new Date(ts._seconds*1000);if(ts.toDate)return ts.toDate();return null;};
  const fmtFecha=ts=>{const d=toDate(ts);if(!d)return '—';return d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short',year:'numeric'});};

  if(loadError)return(
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{marginBottom:16,color:'#EF4444'}}><Ic.AlertTriangle size={40} strokeWidth={1.5}/></div>
      <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:'#EF4444',marginBottom:8}}>No se pudo cargar el panel</div>
      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',textAlign:'center',maxWidth:380,marginBottom:24}}>{loadError}</div>
      <button onClick={()=>{setLoadError('');cargarDatos();}} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer'}}>Reintentar</button>
    </div>
  );

  if(!empresa)return(
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:'3px solid rgba(37,211,102,0.2)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const cfg       = getConfigIndustria(empresa.industria||'otro');
  const d         = cfg.dashboard;
  const plan      = PLANES[empresa.planWasapbot||empresa.plan]||PLANES.wasapbot;
  const pctTokens = Math.min(Math.round((stats.tokensUsados/plan.tokens)*100),100);
  const pctConvs  = Math.min(Math.round((stats.total/plan.convs)*100),100);
  const connected = status==='connected';
  const servicios = conocimiento?.servicios||[];
  const planActivo = empresa?.planActivo===true;
  const citasFiltradas = citasFiltro==='todos'?citas:citas.filter(c=>c.estado===citasFiltro);
  const citasHoy = citas.filter(c=>{const dt=toDate(c.fechaHora||c.creadoEn);if(!dt)return false;const hoy=new Date();hoy.setHours(0,0,0,0);return dt>=hoy;}).length;

  const CARD={background:'#0C0F14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:20};
  const INP ={width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 11px',color:'#EFF4FF',fontFamily:F,fontSize:13,outline:'none',boxSizing:'border-box'};

  const TABS=[
    {key:'inicio',label:'Inicio',icon:Ic.Home},
    ...(d.tabCitas?[{key:'citas',label:d.tabCitas,icon:Ic.Calendar,badge:citasHoy>0?citasHoy:null}]:[]),
    {key:'convs',label:'Conversaciones',icon:Ic.MessageSquare},
    {key:'catalogo',label:d.tabCatalogo,icon:Ic.ClipboardList},
    ...(['estandar','pro'].includes(empresa?.planWasapbot||empresa?.plan)?[{key:'broadcast',label:'Broadcast',icon:Ic.TrendingUp}]:[]),
    ...((empresa?.planWasapbot||empresa?.plan)==='pro'?[{key:'web',label:'Página web',icon:Ic.MapPin}]:[]),
    {key:'config',label:'Configuración del AgenteIA',icon:Ic.Settings},
    {key:'simulador',label:'Simulador Bot',icon:Ic.Smartphone},
  ];

  const LINKS=[
    {href:`/wasapbot/panel/stock/${id}`,label:'Inventario y ventas',icon:Ic.BarChart,color:'#A78BFA',bg:'rgba(167,139,250,0.07)',border:'rgba(167,139,250,0.18)'},
    ...(cfg.tieneInventario?[{href:`/wasapbot/panel/inventario/${id}`,label:'Menú del día',icon:Ic.Package,color:'#60A5FA',bg:'rgba(96,165,250,0.08)',border:'rgba(96,165,250,0.2)'}]:[]),
    ...(cfg.tienePedidos?[{href:`/wasapbot/panel/pedidos/${id}`,label:'Pedidos del día',icon:Ic.ShoppingCart,color:'#25D366',bg:'rgba(37,211,102,0.06)',border:'rgba(37,211,102,0.15)'}]:[]),
  ];

  return(
    <>
      <Head><title>{empresa.nombreEmpresa} — Panel WasapBot</title></Head>

      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}a{text-decoration:none;color:inherit}

        /* ── MÓVIL: layout vertical nativo ── */
        @media (max-width: 768px) {
          /* Ocultar sidebar lateral */
          [data-panel-sidebar] { display: none !important; }
          /* Contenido ocupa todo el ancho y deja espacio para bottom nav */
          [data-panel-content] { padding: 16px !important; padding-bottom: 80px !important; }
          /* Bottom nav visible */
          [data-bottom-nav] { display: flex !important; }
          /* Nav top más compacto */
          [data-panel-nav] { padding: 0 16px !important; height: 52px !important; }
          [data-nav-title] { font-size: 14px !important; }
          [data-nav-right] { gap: 6px !important; }
          [data-nav-status] span:last-child { display: none; }
          [data-nav-plan] { display: none !important; }
          [data-nav-logout] span { display: none; }
          [data-nav-logout] { padding: 5px 8px !important; }
          /* Grid de stats a 2 columnas */
          [data-stats-grid] { grid-template-columns: repeat(2,1fr) !important; }
          /* Grid de planes a 1 columna */
          [data-planes-grid] { grid-template-columns: 1fr !important; }
          /* Accesos rápidos a 1 columna */
          [data-accesos-grid] { grid-template-columns: 1fr !important; }
          /* Cards de estado de citas a 2 cols */
          [data-citas-estados] { grid-template-columns: repeat(2,1fr) !important; }
          /* Header citas en columna */
          [data-citas-header] { flex-direction: column !important; align-items: flex-start !important; }
          /* Header catálogo en columna */
          [data-cat-header] { flex-direction: column !important; align-items: flex-start !important; }
          [data-config-grid] { grid-template-columns: 1fr !important; }
          [data-config-instrucciones] { order: 1; }
          [data-config-horario] { order: 2; }
          /* Inicio h2 más pequeño */
          [data-inicio-h2] { font-size: 22px !important; }
        }
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)}70%{box-shadow:0 0 0 10px rgba(37,211,102,0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInGuia{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .wb-tab{background:transparent;border:none;border-radius:8px;padding:8px 14px;font-family:${F};font-size:13px;cursor:pointer;transition:all 0.15s;color:#6B7A99;display:flex;align-items:center;gap:8px;width:100%;text-align:left}
        .wb-tab:hover{color:#EFF4FF;background:rgba(255,255,255,0.04)}
        .wb-tab.on{color:#25D366;background:rgba(37,211,102,0.08);font-weight:600}
        .bar-fill{height:6px;border-radius:3px;transition:width 0.6s ease}
        .cat-inp:focus{border-color:rgba(37,211,102,0.45)!important;outline:none}
        .cita-row{background:#0C0F14;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 18px;margin-bottom:10px;transition:border-color 0.15s;animation:fadeIn 0.25s ease both}
        .cita-row:hover{border-color:rgba(255,255,255,0.12)}
        .btn-est{border:none;border-radius:7px;padding:6px 12px;font-family:${F};font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center;gap:5px}
        .btn-est:hover{opacity:0.8;transform:translateY(-1px)}
        .btn-est:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .filtro-pill{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:99px;padding:5px 14px;font-family:${F};font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);cursor:pointer;transition:all 0.15s;white-space:nowrap}
        .filtro-pill:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.65)}
        .filtro-pill.on{background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.35);color:#6EF0A0}
        select.cat-inp option{background:#0E1118}
        .ext-link{display:flex;align-items:center;gap:8px;border-radius:8px;padding:8px 14px;font-family:${F};font-size:13px;font-weight:600;transition:all 0.15s;text-decoration:none}
        .ext-link:hover{opacity:0.8;transform:translateX(2px)}
        .guia-border{border-color:rgba(37,211,102,0.3)!important}
      `}}/>

      {/* NAV */}
      <nav data-panel-nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/wasapbot"><span style={{fontFamily:FA,fontSize:16,cursor:'pointer'}}>BQinz<span style={{color:'#FF6B00'}}>agenc</span>IA</span></Link>
          <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
          <span data-nav-title style={{fontFamily:F,fontSize:13,fontWeight:600}}>{empresa.nombreEmpresa}</span>
        </div>
        <div data-nav-right style={{display:'flex',alignItems:'center',gap:10}}>
          <div data-nav-status style={{display:'flex',alignItems:'center',gap:6,background:connected?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${connected?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:100,padding:'4px 12px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:connected?'#25D366':'#EF4444',animation:connected?'pulse-g 2s infinite':'none'}}/>
            <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:connected?'#25D366':'#EF4444'}}>{connected?'Bot activo':'Desconectado'}</span>
          </div>
          <span data-nav-plan style={{background:plan.color+'22',color:plan.color,border:`1px solid ${plan.color}44`,borderRadius:100,padding:'3px 12px',fontFamily:F,fontSize:11,fontWeight:700}}>{plan.nombre}</span>
          <button data-nav-logout onClick={cerrarSesion} style={{background:'rgba(239,68,68,0.07)',color:'rgba(239,68,68,0.7)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:8,padding:'5px 12px',fontFamily:F,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Salir</span>
          </button>
        </div>
      </nav>

      <div style={{display:'flex',minHeight:'calc(100vh - 58px)'}}>
        {/* SIDEBAR */}
        <div data-tour="hub-sidebar" data-panel-sidebar style={{width:216,borderRight:'1px solid rgba(255,255,255,0.05)',padding:'16px 10px',flexShrink:0,display:'flex',flexDirection:'column',gap:2}}>
          {TABS.map(t=>(
            <button key={t.key} className={`wb-tab${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>
              <t.icon size={16} style={{opacity:0.8}}/>
              <span style={{flex:1}}>{t.label}</span>
              {t.badge&&<span style={{background:'#25D366',color:'#000',borderRadius:99,padding:'1px 7px',fontSize:10,fontWeight:800,minWidth:18,textAlign:'center'}}>{t.badge}</span>}
            </button>
          ))}
          {LINKS.length>0&&(
            <div data-tour="hub-links">
              <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'8px 4px'}}/>
              {LINKS.map(l=>(
                <Link key={l.href} href={l.href} className="ext-link" style={{background:l.bg,border:`1px solid ${l.border}`,color:l.color}}>
                  <l.icon size={15}/>
                  <span style={{flex:1,fontSize:12}}>{l.label}</span>
                  <Ic.ArrowUpRight size={11} style={{opacity:0.5}}/>
                </Link>
              ))}
            </div>
          )}
          <div style={{flex:1}}/>
          <div style={{padding:'12px',background:'rgba(37,211,102,0.04)',border:'1px solid rgba(37,211,102,0.12)',borderRadius:10,marginTop:8}}>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginBottom:4}}>Plan actual</div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:plan.color,marginBottom:2}}>{plan.nombre}</div>
            <div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginBottom:10}}>{plan.precio}/mes</div>
            <a href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}&upgrade=${planActivo?'1':'0'}&planActual=${empresa?.planWasapbot||empresa?.plan||'basico'}`}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:planActivo?'rgba(37,211,102,.15)':'#25D366',color:planActivo?'#25D366':'#fff',border:planActivo?'1px solid rgba(37,211,102,.3)':'none',borderRadius:8,padding:'7px',fontFamily:F,fontSize:11,fontWeight:700,textAlign:'center'}}>
              {planActivo?<><Ic.TrendingUp size={13}/> Mejorar plan</>:<><Ic.Zap size={13}/> Activar plan</>}
            </a>
          </div>
        </div>

        {/* CONTENIDO */}
        <div data-panel-content style={{flex:1,padding:'28px 32px',overflowY:'auto'}}>

          {/* ══ INICIO ══ */}
          {tab==='inicio'&&(
            <div>
              <h2 data-inicio-h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>{empresa.nombreEmpresa}</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20,fontWeight:300}}>Panel de control · {cfg.labelCatalogo} · {empresa.industria}</p>

              {/* Banner prueba gratis 24h activa */}
              {planActivo&&empresa?.esPruebaGratis&&!empresa?.pruebaGratisFinalizada&&(()=>{
                const trialHasta = empresa.trialHasta?._seconds ? new Date(empresa.trialHasta._seconds*1000) : (empresa.trialHasta ? new Date(empresa.trialHasta) : null);
                const msRestantes = trialHasta ? trialHasta.getTime()-Date.now() : null;
                const horasRestantes = msRestantes!=null ? Math.max(1, Math.floor(msRestantes/(60*60*1000))) : null;
                return (
                  <div style={{background:'rgba(37,211,102,.06)',border:'1px solid rgba(37,211,102,.25)',borderRadius:12,padding:'16px 20px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:F,fontSize:14,fontWeight:700,color:'#25D366',marginBottom:3}}>🎁 Prueba gratis activa</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.4)'}}>
                        {horasRestantes!=null ? `Tu bot funciona con IA durante ${horasRestantes}h más. Activa un plan antes de que termine para no perder continuidad.` : 'Tu prueba gratuita de 24 horas está activa.'}
                      </div>
                    </div>
                    <a href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}`}
                      style={{background:'#25D366',color:'#06090D',borderRadius:9,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:700,textDecoration:'none',flexShrink:0}}>
                      Activar plan ahora →
                    </a>
                  </div>
                );
              })()}

              {/* Banner plan no activo */}
              {!planActivo&&(
                <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.25)',borderRadius:12,padding:'18px 20px',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:14}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:F,fontSize:14,fontWeight:700,color:'#F59E0B',marginBottom:3}}><Ic.Zap size={14}/> {empresa?.pruebaGratisFinalizada ? 'Tu prueba gratis de 24h finalizó' : 'Bot en modo configuración'}</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>{empresa?.pruebaGratisFinalizada ? 'Activa un plan para que tu bot vuelva a responder con IA a tus clientes.' : 'Activa un plan para que tu bot responda con IA a tus clientes.'}</div>
                    </div>
                    <a href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}`}
                      style={{background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:9,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:700,textDecoration:'none',flexShrink:0,boxShadow:'0 4px 16px rgba(245,158,11,.3)'}}>
                      Ver planes →
                    </a>
                  </div>
                  {/* Mini cards de planes */}
                  <div data-planes-grid style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {[
                      {id:'basico',   nombre:'Básico',   precio:'79€',  color:'#25D366', desc:'Bot + catálogo + citas'},
                      {id:'estandar', nombre:'Estándar', precio:'149€', color:'#2563EB', desc:'+ Pedidos + reportes', popular:true},
                      {id:'pro',      nombre:'Pro',       precio:'249€', color:'#A78BFA', desc:'+ Web + voz + CRM'},
                    ].map(p=>(
                      <a key={p.id} href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}`}
                        style={{background:`rgba(0,0,0,.3)`,border:`1px solid ${p.color}33`,borderRadius:10,padding:'10px 12px',textDecoration:'none',display:'block',position:'relative'}}>
                        {p.popular&&<div style={{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:8,fontWeight:800,padding:'2px 8px',borderRadius:99,whiteSpace:'nowrap'}}>★ POPULAR</div>}
                        <div style={{fontFamily:"'Abril Fatface',serif",fontSize:16,color:p.color,letterSpacing:'-0.5px',marginBottom:2}}>{p.precio}</div>
                        <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)',marginBottom:2}}>{p.nombre}</div>
                        <div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,.3)'}}>{p.desc}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner desconectado */}
              {!connected&&(
                <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:F,fontSize:14,fontWeight:700,color:'#EF4444',marginBottom:3}}><Ic.AlertTriangle size={14}/> Bot desconectado</div>
                    <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)'}}>Ve a <strong style={{color:'#EFF4FF'}}>Configuración</strong> para conectar tu WhatsApp.</div>
                  </div>
                  <button onClick={()=>setTab('config')} style={{background:'#EF4444',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer'}}>Conectar ahora →</button>
                </div>
              )}

              {/* Acceso rápido stock */}
              <Link href={`/wasapbot/panel/stock/${id}`}
                style={{background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,textDecoration:'none',marginBottom:12}}>
                <div style={{width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',color:'#A78BFA',flexShrink:0}}><Ic.BarChart size={22} strokeWidth={1.6}/></div>
                <div>
                  <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#A78BFA',marginBottom:3}}>Inventario y ventas</div>
                  <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.3)'}}>Compras, ventas, stock y reportes diarios</div>
                </div>
              </Link>

              {/* Accesos rápidos de la industria */}
              {d.accesosRapidos.length>0&&(
                <div data-accesos-grid style={{display:'grid',gridTemplateColumns:`repeat(${d.accesosRapidos.length},1fr)`,gap:12,marginBottom:16}}>
                  {d.accesosRapidos.map((ar,i)=>{
                    const ArIcono = ar.link==='inventario' ? Ic.Package : Ic.ShoppingCart;
                    return (
                    <Link key={i} href={`/wasapbot/panel/${ar.link}/${id}`}
                      style={{background:ar.link==='inventario'?'rgba(96,165,250,0.06)':'rgba(37,211,102,0.06)',border:`1px solid ${ar.link==='inventario'?'rgba(96,165,250,0.2)':'rgba(37,211,102,0.2)'}`,borderRadius:14,padding:'18px 20px',display:'flex',alignItems:'center',gap:14,textDecoration:'none'}}>
                      <div style={{width:40,height:40,borderRadius:10,background:ar.link==='inventario'?'rgba(96,165,250,0.1)':'rgba(37,211,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',color:ar.link==='inventario'?'#60A5FA':'#25D366',flexShrink:0}}><ArIcono size={20} strokeWidth={1.6}/></div>
                      <div>
                        <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:ar.link==='inventario'?'#60A5FA':'#25D366',marginBottom:3}}>{ar.label}</div>
                        <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.3)'}}>{ar.desc}</div>
                      </div>
                    </Link>
                  );})}
                </div>
              )}

              {/* Stats */}
              <div data-tour="hub-stats" data-stats-grid style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
                {[
                  {label:'Hoy',val:stats.hoy,color:'#25D366',icon:Ic.MessageSquare},
                  {label:'Esta semana',val:stats.semana,color:'#60A5FA',icon:Ic.BarChart},
                  {label:'Citas pendientes',val:citas.filter(c=>c.estado==='pendiente').length,color:'#F59E0B',icon:Ic.Calendar},
                  {label:'Total convs',val:stats.total,color:'#EFF4FF',icon:Ic.TrendingUp},
                ].map((s,i)=>(
                  <div key={i} style={CARD}>
                    <div style={{marginBottom:8,color:s.color,opacity:0.85}}><s.icon size={20} strokeWidth={1.6}/></div>
                    <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#4B6080',marginBottom:4}}>{s.label}</div>
                    <div style={{fontFamily:FA,fontSize:32,color:s.color,letterSpacing:'-1px'}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Consumo */}
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Consumo del plan</div>
                {[{label:'Conversaciones',val:stats.total,max:plan.convs,pct:pctConvs},{label:'Créditos IA',val:stats.tokensUsados,max:plan.tokens,pct:pctTokens,fmt:true}].map((b,i)=>(
                  <div key={i} style={{marginBottom:i===0?14:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>{b.label}</span>
                      <span style={{fontFamily:F,fontSize:12,color:b.pct>80?'#EF4444':'#EFF4FF',fontWeight:600}}>{b.fmt?b.val.toLocaleString():b.val} / {b.fmt?b.max.toLocaleString():b.max}</span>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                      <div className="bar-fill" style={{width:`${b.pct}%`,background:b.pct>80?'#EF4444':b.pct>60?'#F59E0B':'#25D366'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CITAS ══ */}
          {tab==='citas'&&d.tabCitas&&(
            <div>
              {!planActivo ? (
                <CandadoPremium empresaId={id} nombreEmpresa={empresa?.nombreEmpresa}
                  mensaje={`Las ${d.tabCitas.toLowerCase()} que agende el bot aparecerán aquí. Activa tu plan para que el bot empiece a agendar automáticamente.`}/>
              ) : (
                <>
                  <div data-citas-header style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                    <div>
                      <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:4}}>{d.tabCitas}</h2>
                      <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300,margin:0}}>El bot las agenda automáticamente por WhatsApp.</p>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={cargarCitas} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.5)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}><Ic.RefreshCw size={13}/> Actualizar</button>
                      {citas.filter(c=>c.estado==='cancelada').length>0&&(
                        <button onClick={eliminarCitasCanceladas} style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,color:'#EF4444',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}>
                          <Ic.X size={13}/> Eliminar canceladas ({citas.filter(c=>c.estado==='cancelada').length})
                        </button>
                      )}
                    </div>
                  </div>
                  <div data-citas-estados style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
                    {Object.entries(ESTADO_CITA).map(([key,est])=>(
                      <div key={key} style={{background:est.bg,border:`1px solid ${est.border}`,borderRadius:12,padding:'12px 16px',textAlign:'center'}}>
                        <div style={{fontFamily:FA,fontSize:24,color:est.color,marginBottom:2}}>{citas.filter(c=>c.estado===key).length}</div>
                        <div style={{fontFamily:F,fontSize:11,color:est.color,fontWeight:600}}>{est.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:6,marginBottom:18,flexWrap:'wrap'}}>
                    {[{key:'todos',label:'Todas'},{key:'pendiente',label:'Pendientes'},{key:'confirmada',label:'Confirmadas'},{key:'cancelada',label:'Canceladas'},{key:'completada',label:'Completadas'}].map(f=>(
                      <button key={f.key} className={`filtro-pill${citasFiltro===f.key?' on':''}`} onClick={()=>setCitasFiltro(f.key)}>
                        {f.label}{f.key!=='todos'&&<span style={{marginLeft:4,opacity:0.6}}>({citas.filter(c=>c.estado===f.key).length})</span>}
                      </button>
                    ))}
                  </div>
                  {citasFiltradas.length===0?(
                    <div style={{...CARD,textAlign:'center',padding:'60px 20px'}}>
                      <div style={{marginBottom:12,display:'flex',justifyContent:'center',color:'#4B6080'}}><Ic.Calendar size={36} strokeWidth={1.5}/></div>
                      <div style={{fontFamily:F,fontSize:15,fontWeight:600,color:'#EFF4FF',marginBottom:8}}>Sin {d.tabCitas.toLowerCase()} aún</div>
                      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)'}}>El bot las agendará automáticamente cuando los clientes lo soliciten por WhatsApp.</div>
                    </div>
                  ):(
                    <div>
                      {citasFiltradas.map((cita,i)=>{
                        const est=ESTADO_CITA[cita.estado]||ESTADO_CITA.pendiente;
                        const esPend=cita.estado==='pendiente',esConf=cita.estado==='confirmada';
                        const updating=updatingCita===cita.id;
                        return(
                          <div key={cita.id||i} className="cita-row">
                            <div style={{display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap'}}>
                              <div style={{width:52,height:58,borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:'#4B6080',textTransform:'uppercase'}}>{cita.fecha?.split('/')[1]?(['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(cita.fecha.split('/')[1])]||''):''}</div>
                                <div style={{fontFamily:FA,fontSize:22,color:'#EFF4FF',lineHeight:1}}>{cita.fecha?.split('/')[0]||'?'}</div>
                                <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366'}}>{cita.hora||'?'}</div>
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                                  <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:'#EFF4FF'}}>{cita.nombreCliente||'Cliente'}</div>
                                  <span style={{background:est.bg,color:est.color,border:`1px solid ${est.border}`,borderRadius:99,padding:'2px 10px',fontFamily:F,fontSize:10,fontWeight:700}}>{est.label}</span>
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:F,fontSize:13,color:'#8A9BB5',marginBottom:4}}><Ic.ClipboardList size={13}/> {cita.servicio||cfg.labelItem}</div>
                                {cita.telefono&&<a href={`https://wa.me/${cita.telefono}`} target="_blank" rel="noreferrer" style={{fontFamily:F,fontSize:12,color:'#25D366'}}>+{cita.telefono}</a>}
                              </div>
                              <div style={{display:'flex',gap:7,flexShrink:0,flexWrap:'wrap'}}>
                                {esPend&&<><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'confirmada')} style={{background:'rgba(37,211,102,0.1)',color:'#25D366',border:'1px solid rgba(37,211,102,0.3)'}}>{updating?'...':<><Ic.Check size={12}/> Confirmar</>}</button><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'cancelada')} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)'}}>{updating?'...':<Ic.X size={12}/>}</button></>}
                                {esConf&&<><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'completada')} style={{background:'rgba(96,165,250,0.1)',color:'#60A5FA',border:'1px solid rgba(96,165,250,0.25)'}}>{updating?'...':<><Ic.Check size={12}/> Completar</>}</button><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'cancelada')} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)'}}>{updating?'...':'Cancelar'}</button></>}
                                {(cita.estado==='cancelada'||cita.estado==='completada')&&<><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'pendiente')} style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>{updating?'...':<><Ic.RotateCcw size={12}/> Reabrir</>}</button><button className="btn-est" disabled={updating} onClick={()=>eliminarCita(cita.id)} style={{background:'rgba(239,68,68,0.06)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)'}}>{updating?'...':<><Ic.X size={12}/> Eliminar</>}</button></>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══ CONVERSACIONES ══ */}
          {tab==='convs'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Conversaciones de WhatsApp</h2>
              {!planActivo ? (
                <CandadoPremium empresaId={id} nombreEmpresa={empresa?.nombreEmpresa}
                  mensaje="Las conversaciones de tus clientes aparecerán aquí cuando actives tu plan. El bot ya recibe mensajes — activa el plan para que responda con IA."/>
              ) : (
                <>
                  <Guia visible={convs.length===0&&!guiasVistas['convs_vacio']} texto={d.guias.convs_vacio} icono={Ic.MessageSquare}/>
                  <div style={CARD}>
                    {convs.map((c,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:i<convs.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(37,211,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:700,color:'#25D366',flexShrink:0}}>{(c.nombreCliente||'?')[0].toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{c.nombreCliente||'Cliente'}</div>
                          <div style={{fontFamily:F,fontSize:11,color:'#4B6080'}}>+{c.telefono||''}</div>
                          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300}}>{c.ultimoTexto}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0,display:'flex',alignItems:'center',gap:10}}>
                          <div>
                            <div style={{fontFamily:F,fontSize:10,color:'#374151'}}>{fmtFecha(c.ultimoMensaje)}</div>
                            <span style={{background:'rgba(37,211,102,0.1)',color:'#25D366',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700}}>WhatsApp</span>
                          </div>
                          <button onClick={()=>eliminarConversacion(c.id)} title="Eliminar conversación" style={{background:'rgba(239,68,68,0.06)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:7,padding:'6px 9px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                            <Ic.X size={13}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    {convs.length===0&&<div style={{fontFamily:F,fontSize:13,color:'#4B6080',textAlign:'center',padding:'40px 0'}}>Sin conversaciones aún. Conecta tu WhatsApp en Configuración.</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ CATÁLOGO ══ */}
          {tab==='catalogo'&&(
            <div>
              <div data-cat-header style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
                <div>
                  <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:4}}>{d.tabCatalogo}</h2>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300,margin:0}}>El bot usará esta información para responder a tus clientes.</p>
                </div>
                {!editando?(
                  <button data-tour="hub-catalogo-btn" onClick={()=>{setItemsEdit(servicios.length>0?servicios.map(s=>({...s})):[{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',duracionMin:''}]);setEditando(true);}} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.25)',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:7}}>
                    {servicios.length>0?<><Ic.Edit size={13}/> Editar</>:<><Ic.Plus size={13}/> Agregar primer {cfg.labelItem.toLowerCase()}</>}
                  </button>
                ):(
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setEditando(false)} style={{background:'rgba(255,255,255,0.04)',color:'#6B7A99',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'9px 16px',fontFamily:F,fontSize:13,cursor:'pointer'}}>Cancelar</button>
                    <button onClick={guardarCatalogo} disabled={savingCat} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingCat?0.7:1}}>{savingCat?'Guardando...':'Guardar cambios'}</button>
                  </div>
                )}
              </div>
              {saveMsg&&<div style={{background:saveMsg.startsWith('✓')?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${saveMsg.startsWith('✓')?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:9,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:saveMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{saveMsg}</div>}
              <Guia visible={servicios.length===0&&!editando&&!guiasVistas['catalogo_items']} texto={d.guias.catalogo_vacio} icono={Ic.ClipboardList}/>
              {!editando&&servicios.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
                  {servicios.map((s,i)=>(
                    <div key={i} style={{...CARD,padding:0,overflow:'hidden',position:'relative'}}>
                      <button onClick={async()=>{if(!confirm(`¿Eliminar "${s.nombre||'este item'}"?`))return;const nuevos=servicios.filter((_,idx)=>idx!==i);try{const r=await fetch('/api/wasapbot-servicios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,servicios:nuevos})});const dd=await r.json();if(dd.ok){setConocimiento(prev=>({...prev,servicios:nuevos}));setItemsEdit(nuevos.map(it=>({...it})));}}catch{}}}
                        title="Eliminar" style={{position:'absolute',top:8,right:8,zIndex:2,background:'rgba(0,0,0,0.55)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'5px 7px',cursor:'pointer',display:'flex',alignItems:'center'}}>
                        <Ic.X size={13}/>
                      </button>
                      {s.foto?<img src={s.foto} alt={s.nombre} style={{width:'100%',height:120,objectFit:'cover',display:'block'}}/>:<div style={{width:'100%',height:50,background:'rgba(37,211,102,0.05)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.2)'}}><Ic.Package size={18} strokeWidth={1.5}/></div>}
                      <div style={{padding:12}}>
                        {s.categoria&&<span style={{background:'rgba(255,255,255,0.05)',color:'#6B7A99',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700,textTransform:'uppercase',display:'inline-block',marginBottom:5}}>{s.categoria}</span>}
                        <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:3}}>{s.nombre||'Sin nombre'}</div>
                        {s.descripcion&&<div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6,lineHeight:1.4}}>{s.descripcion}</div>}
                        {s.precio&&<div style={{fontFamily:FA,fontSize:16,color:'#25D366'}}>{Number(String(s.precio).replace(/\D/g,'')).toLocaleString('es-ES')||s.precio}€</div>}
                        {s.duracionMin&&<div style={{display:'flex',alignItems:'center',gap:4,fontFamily:F,fontSize:10,color:'#4B6080',marginTop:4}}><Ic.Clock size={11}/> {s.duracionMin} min</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editando&&(
                <div>
                  <Guia visible={!guiasVistas['catalogo_editando']} texto={`Completa cada ${cfg.labelItem.toLowerCase()} con nombre, ${cfg.labelPrecio.toLowerCase()} y descripción.`} icono={Ic.Edit}/>
                  {itemsEdit.map((item,idx)=>(
                    <div key={idx} style={{...CARD,marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#8A9BB5'}}>{cfg.labelItem} {idx+1}</span>
                        <button onClick={()=>setItemsEdit(prev=>prev.length>1?prev.filter((_,i)=>i!==idx):[{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',duracionMin:''}])} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,padding:'3px 10px',fontFamily:F,fontSize:11,cursor:'pointer'}}>Eliminar</button>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelItem} *</label>
                          <input className={`cat-inp${!item.nombre?' guia-border':''}`} style={{...INP,borderColor:!item.nombre?'rgba(37,211,102,0.3)':undefined}} value={item.nombre||''}
                            placeholder={cfg.placeholders[`item${idx+1}`]||`Nombre del ${cfg.labelItem.toLowerCase()}`}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it));if(e.target.value)marcarGuia(`nombre_${idx}`);}}/>
                          <Guia visible={!item.nombre&&!guiasVistas[`nombre_${idx}`]} texto={d.guias.catalogo_nombre} icono={Ic.Tag}/>
                        </div>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelPrecio}</label>
                          <input className={`cat-inp${!item.precio?' guia-border':''}`} style={{...INP,borderColor:!item.precio?'rgba(37,211,102,0.25)':undefined}} value={item.precio||''}
                            placeholder={cfg.placeholders[`precio${idx+1}`]||'0'}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,precio:e.target.value}:it));if(e.target.value)marcarGuia(`precio_${idx}`);}}/>
                          <Guia visible={!item.precio&&!guiasVistas[`precio_${idx}`]} texto={d.guias.catalogo_precio} icono={Ic.DollarSign}/>
                        </div>
                      </div>
                      <div>
                        <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelDescripcion}</label>
                        <input className={`cat-inp${!item.descripcion?' guia-border':''}`} style={{...INP,borderColor:!item.descripcion?'rgba(37,211,102,0.2)':undefined}} value={item.descripcion||''}
                          placeholder={cfg.placeholders[`desc${idx+1}`]||'Descripción...'}
                          onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it));if(e.target.value)marcarGuia(`desc_${idx}`);}}/>
                        <Guia visible={!item.descripcion&&!guiasVistas[`desc_${idx}`]} texto={d.guias.catalogo_desc} icono={Ic.FileText}/>
                      </div>
                      {/* ── Campo subida de foto — visible solo para negocios con foto (restaurantes, etc.) ── */}
                      {cfg.tieneFoto&&(
                        <div style={{marginTop:10}}>
                          <label style={{display:'flex',alignItems:'center',gap:5,fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#25D366',marginBottom:6}}><Ic.Camera size={12}/> Foto (se envía por WhatsApp)</label>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            {item.foto?(
                              <img src={item.foto} alt="preview" style={{width:64,height:64,objectFit:'cover',borderRadius:9,border:'2px solid rgba(37,211,102,0.4)',flexShrink:0}}/>
                            ):(
                              <div style={{width:64,height:64,borderRadius:9,background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.2)',flexShrink:0}}><Ic.Camera size={20} strokeWidth={1.5}/></div>
                            )}
                            <div style={{flex:1}}>
                              <input
                                type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                                id={`foto-input-${idx}`} style={{display:'none'}}
                                onChange={e=>{const f=e.target.files?.[0]; if(f) subirFoto(idx,f); e.target.value='';}}
                              />
                              <div style={{display:'flex',gap:8}}>
                                <label htmlFor={`foto-input-${idx}`} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.25)',borderRadius:8,padding:'7px 14px',fontFamily:F,fontSize:12,fontWeight:600,cursor: subiendoFoto===idx?'wait':'pointer',display:'inline-flex',alignItems:'center',gap:6,opacity: subiendoFoto===idx?0.6:1}}>
                                  {subiendoFoto===idx?<>Subiendo...</>:<><Ic.Plus size={12}/> {item.foto?'Cambiar foto':'Subir foto'}</>}
                                </label>
                                {item.foto&&<button onClick={()=>quitarFoto(idx)} style={{background:'rgba(239,68,68,0.06)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:8,padding:'7px 12px',fontFamily:F,fontSize:12,cursor:'pointer'}}>Quitar</button>}
                              </div>
                              {errorFoto[idx]&&<div style={{marginTop:6,fontFamily:F,fontSize:11,color:'#EF4444'}}>{errorFoto[idx]}</div>}
                              {!item.foto&&!errorFoto[idx]&&(
                                <div style={{marginTop:6,display:'flex',alignItems:'flex-start',gap:5,fontFamily:F,fontSize:10,color:'rgba(255,165,0,0.75)'}}>
                                  <Ic.AlertTriangle size={12} style={{flexShrink:0,marginTop:1}}/>
                                  <span>Sin foto — el bot solo mostrará texto. JPG, PNG, WEBP o GIF, máximo 5MB.</span>
                                </div>
                              )}
                              {item.foto&&(
                                <div style={{marginTop:6,display:'flex',alignItems:'flex-start',gap:6,fontFamily:F,fontSize:11,color:'#25D366',lineHeight:1.5}}><Ic.Check size={13} style={{flexShrink:0,marginTop:2}}/><span>Esta foto se enviará automáticamente cuando el cliente pida el menú por WhatsApp</span></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {cfg.tieneCategoria&&(
                        <div style={{marginTop:10}}>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>Categoría</label>
                          <select className="cat-inp" style={{...INP,cursor:'pointer'}} value={item.categoria||''} onChange={e=>setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,categoria:e.target.value}:it))}>
                            <option value="">Sin categoría</option>
                            {cfg.categorias.map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                      {cfg.tieneDuracion&&(
                        <div style={{marginTop:10}}>
                          <label style={{display:'flex',alignItems:'center',gap:5,fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',marginBottom:4}}><Ic.Clock size={12}/> Duración (minutos)</label>
                          <input className="cat-inp" style={{...INP,maxWidth:140}} type="number" min="5" step="5" value={item.duracionMin||''}
                            placeholder="Ej: 30"
                            onChange={e=>setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,duracionMin:e.target.value}:it))}/>
                          <div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:4}}>El bot usará este tiempo para calcular qué horarios puede ofrecer sin solapar con otras citas.</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>setItemsEdit(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',duracionMin:''}])}
                    style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:10,padding:'11px',fontFamily:F,fontSize:13,color:'#4B6080',cursor:'pointer',marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                    <Ic.Plus size={14}/> Agregar {cfg.labelItem.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ CONECTAR WHATSAPP (Embedded Signup de Meta) ══ */}
          {tab==='qr'&&(
            <div style={{maxWidth:520,margin:'0 auto'}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>Conectar WhatsApp</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24,fontWeight:300}}>Con un clic, a través de Meta — sin QR, sin escaneos.</p>

              <div style={{background:'#fff',border:'1.5px solid #E5EAFF',borderRadius:20,padding:'24px',boxShadow:'0 4px 24px rgba(43,106,255,.07)',marginBottom:16,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:12}}>📱</div>
                <p style={{fontFamily:F,fontSize:13.5,color:'#6B7280',lineHeight:1.6,marginBottom:20}}>
                  Vas a iniciar sesión con tu cuenta de Facebook para conectar el
                  WhatsApp de tu negocio de forma <strong style={{color:'#111827'}}>segura y oficial</strong>.
                  Elegirás o crearás tu cuenta de WhatsApp Business y confirmarás tu
                  propio número — todo en la misma ventana.
                </p>

                {errorConexion&&(
                  <div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.2)',borderRadius:10,padding:'11px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:'#EF4444',textAlign:'left'}}>
                    {errorConexion}
                  </div>
                )}

                <button
                  onClick={conectarConFacebook}
                  disabled={!sdkListo||conectando}
                  style={{
                    display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                    width:'100%',minHeight:54,border:'none',borderRadius:14,
                    background:(!sdkListo||conectando)?'#D1D9F0':'#1877F2',
                    color:(!sdkListo||conectando)?'#9CA3AF':'#fff',
                    fontFamily:F,fontSize:16,fontWeight:700,
                    boxShadow:(!sdkListo||conectando)?'none':'0 6px 24px rgba(24,119,242,.35)',
                    transition:'all .2s',cursor:(!sdkListo||conectando)?'default':'pointer',
                  }}>
                  {conectando?(
                    <>
                      <div style={{width:18,height:18,border:'2.5px solid rgba(255,255,255,.3)',borderTop:'2.5px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                      Conectando...
                    </>
                  ):!sdkListo?(
                    'Cargando...'
                  ):(
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Conectar con Facebook
                    </>
                  )}
                </button>
              </div>

              {/* ── Alternativa: Telegram (gratis, sin verificación de Meta) ── */}
              <div style={{background:'#fff',border:'1.5px solid #E5EAFF',borderRadius:20,padding:'22px',boxShadow:'0 4px 24px rgba(43,106,255,.05)',textAlign:'left'}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
                  <span style={{fontSize:22}}>✈️</span>
                  <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:'#111827'}}>
                    Alternativa: Telegram
                    {empresa?.telegram?.activo&&<span style={{marginLeft:8,background:'rgba(37,211,102,.12)',color:'#159A52',borderRadius:99,padding:'2px 9px',fontSize:11,fontWeight:700}}>Conectado</span>}
                  </div>
                </div>
                <p style={{fontFamily:F,fontSize:12.5,color:'#6B7280',lineHeight:1.7,marginBottom:14}}>
                  Mientras tramitas WhatsApp, puedes activar tu mismo bot en Telegram — <strong>gratis y sin ningún trámite</strong>. Tarda 2 minutos:
                </p>
                <ol style={{fontFamily:F,fontSize:12.5,color:'#4B5563',lineHeight:2,paddingLeft:18,marginBottom:16}}>
                  <li>Abre Telegram y busca <strong>@BotFather</strong></li>
                  <li>Escríbele <code style={{background:'#F3F4F6',padding:'1px 6px',borderRadius:4}}>/newbot</code> y sigue sus instrucciones (nombre y username de tu bot)</li>
                  <li>Copia el token que te da (algo como <code style={{background:'#F3F4F6',padding:'1px 6px',borderRadius:4,fontSize:11}}>123456:AAxxxx...</code>) y pégalo aquí abajo</li>
                </ol>
                {telegramMsg&&(
                  <div style={{background:telegramMsg.startsWith('✓')?'rgba(37,211,102,.08)':'rgba(239,68,68,.07)',border:`1px solid ${telegramMsg.startsWith('✓')?'rgba(37,211,102,.25)':'rgba(239,68,68,.2)'}`,borderRadius:9,padding:'9px 13px',marginBottom:12,fontFamily:F,fontSize:12.5,color:telegramMsg.startsWith('✓')?'#159A52':'#EF4444'}}>
                    {telegramMsg}
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  <input
                    value={telegramToken}
                    onChange={e=>setTelegramToken(e.target.value)}
                    placeholder="Pega aquí el token de @BotFather"
                    style={{flex:1,background:'#F9FAFB',border:'1.5px solid #E5E7EB',borderRadius:10,padding:'11px 14px',fontFamily:F,fontSize:13,color:'#111827',outline:'none'}}
                  />
                  <button
                    onClick={conectarTelegram}
                    disabled={conectandoTelegram}
                    style={{background:conectandoTelegram?'#93C5FD':'#26A5E4',color:'#fff',border:'none',borderRadius:10,padding:'0 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:conectandoTelegram?'default':'pointer',whiteSpace:'nowrap'}}>
                    {conectandoTelegram?'Conectando...':'Conectar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ BROADCAST ══ */}
          {tab==='broadcast'&&(
            <div style={{maxWidth:620}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>Mensaje masivo</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20,fontWeight:300}}>Avísale a todos tus contactos a la vez — ideal para avisar de stock repuesto o lanzar una promo.</p>
              <div style={CARD}>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,color:'#4B6080',display:'block',marginBottom:8}}>Mensaje a enviar</label>
                <textarea
                  value={broadcastMsg}
                  onChange={e=>setBroadcastMsg(e.target.value)}
                  disabled={broadcastEnviando}
                  maxLength={1000}
                  placeholder="Ej: 📦 ¡Ya repusimos stock de [producto]! Disponible de nuevo, escríbenos para pedirlo."
                  style={{...INP,minHeight:120,resize:'vertical',fontFamily:F,lineHeight:1.6}}
                />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontFamily:F,fontSize:11,color:'#4B6080'}}>
                  <span>{broadcastMsg.length}/1000</span>
                </div>

                {broadcastError&&<div style={{marginTop:12,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:9,padding:'10px 14px',fontFamily:F,fontSize:12,color:'#EF4444'}}>{broadcastError}</div>}

                {broadcastProgreso&&(
                  <div style={{marginTop:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>{broadcastProgreso.completado?'Enviado':'Enviando...'}</span>
                      <span style={{fontFamily:F,fontSize:12,color:'#EFF4FF',fontWeight:600}}>{broadcastProgreso.enviados} / {broadcastProgreso.totalContactos}</span>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                      <div className="bar-fill" style={{width:`${Math.round((broadcastProgreso.enviados/broadcastProgreso.totalContactos)*100)}%`,background: broadcastProgreso.completado?'#25D366':'#F59E0B'}}/>
                    </div>
                    {broadcastProgreso.completado&&<div style={{marginTop:8,fontFamily:F,fontSize:12,color:'#25D366'}}>✓ Broadcast completado. {broadcastProgreso.fallidos>0?`${broadcastProgreso.fallidos} mensaje(s) no se pudieron enviar.`:''}</div>}
                  </div>
                )}

                <button onClick={enviarBroadcast} disabled={broadcastEnviando||!broadcastMsg.trim()}
                  style={{marginTop:16,background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'11px 24px',fontFamily:F,fontSize:14,fontWeight:700,cursor: broadcastEnviando?'wait':'pointer',opacity: broadcastEnviando||!broadcastMsg.trim()?0.6:1}}>
                  {broadcastEnviando?'Enviando...':'📢 Enviar a todos mis contactos'}
                </button>
                <div style={{marginTop:10,fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.25)'}}>El envío es progresivo para proteger tu número de WhatsApp — puede tardar unos minutos si tienes muchos contactos. No cierres esta pestaña mientras se envía.</div>
              </div>
            </div>
          )}

          {/* ══ SIMULADOR ══ */}
          {tab==='simulador'&&(
            <div style={{maxWidth:480,margin:'0 auto'}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>Simulador de Bot</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20,fontWeight:300}}>Prueba cómo responde tu bot antes de conectarlo al WhatsApp real. Los mensajes NO llegan a tus clientes.</p>
              <div style={{background:'#111B21',borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
                {/* Header estilo WhatsApp */}
                <div style={{background:'#202C33',padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(37,211,102,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'#25D366',flexShrink:0,fontSize:18}}>🤖</div>
                  <div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF'}}>{empresa.nombreEmpresa}</div>
                    <div style={{fontFamily:F,fontSize:11,color:'#25D366'}}>● Simulador activo — NO llega al WhatsApp real</div>
                  </div>
                </div>
                {/* Chat */}
                <SimuladorChat empresaId={id} empresa={empresa}/>
              </div>
            </div>
          )}


          {/* ══ WEB ══ */}
          {tab==='web'&&(
            <div style={{maxWidth:620}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>Página web</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20,fontWeight:300}}>Tu negocio tiene una página web propia incluida en el plan Pro. Configúrala aquí para que tus clientes la vean al buscarte.</p>
              <div style={CARD}>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,color:'#4B6080',display:'block',marginBottom:8}}>Título de la web</label>
                <input className="cat-inp" style={{...INP,marginBottom:16}} value={webForm.tituloWeb}
                  placeholder="Ej: Maquinaria agrícola de ocasión"
                  onChange={e=>setWebForm(prev=>({...prev,tituloWeb:e.target.value}))}/>

                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,color:'#4B6080',display:'block',marginBottom:8}}>Descripción</label>
                <textarea className="cat-inp" style={{...INP,minHeight:100,resize:'vertical',marginBottom:16}} value={webForm.descripcionWeb}
                  placeholder="Describe brevemente lo que ofreces para que el cliente final lo entienda al instante."
                  onChange={e=>setWebForm(prev=>({...prev,descripcionWeb:e.target.value}))}/>

                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,color:'#4B6080',display:'block',marginBottom:8}}>Foto de portada</label>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  {webForm.fotoWebPortada?(
                    <img src={webForm.fotoWebPortada} alt="portada" style={{width:80,height:60,objectFit:'cover',borderRadius:9,border:'2px solid rgba(37,211,102,0.4)',flexShrink:0}}/>
                  ):(
                    <div style={{width:80,height:60,borderRadius:9,background:'rgba(255,255,255,0.04)',border:'1px dashed rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.2)',flexShrink:0}}><Ic.Camera size={20} strokeWidth={1.5}/></div>
                  )}
                  <div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" id="foto-web-input" style={{display:'none'}}
                      onChange={e=>{const f=e.target.files?.[0]; if(f) subirFotoWeb(f); e.target.value='';}}/>
                    <label htmlFor="foto-web-input" style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.25)',borderRadius:8,padding:'7px 14px',fontFamily:F,fontSize:12,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6}}>
                      <Ic.Plus size={12}/> {webForm.fotoWebPortada?'Cambiar foto':'Subir foto'}
                    </label>
                  </div>
                </div>

                <label style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',marginBottom:18}}>
                  <input type="checkbox" checked={webForm.webActivaWasapbot} onChange={()=>setWebForm(prev=>({...prev,webActivaWasapbot:!prev.webActivaWasapbot}))} style={{width:15,height:15,cursor:'pointer',accentColor:'#25D366'}}/>
                  <span style={{fontFamily:F,fontSize:13,color:'#EFF4FF'}}>Mostrar botón de WhatsApp en la web para que los visitantes contacten directamente</span>
                </label>

                {webMsg&&<div style={{marginBottom:14,fontFamily:F,fontSize:12,color:webMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{webMsg}</div>}

                <button onClick={guardarWeb} disabled={savingWeb} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingWeb?0.7:1}}>
                  {savingWeb?'Guardando...':'Guardar página web'}
                </button>

                {empresa?.slugWeb&&(
                  <div style={{marginTop:18,paddingTop:18,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginBottom:6}}>Tu web está disponible en:</div>
                    <a href={`/wasapbot/web/${empresa.slugWeb}`} target="_blank" rel="noreferrer" style={{fontFamily:F,fontSize:13,color:'#25D366',wordBreak:'break-all'}}>
                      bqinzagencia.com/wasapbot/web/{empresa.slugWeb} ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab==='config'&&(
            <div style={{maxWidth:1100}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Configuración del Agente IA</h2>
              <div data-tour="hub-config" style={{...CARD,marginBottom:14}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:8}}>Conexión WhatsApp</div>
                <Guia visible={!connected&&!guiasVistas['whatsapp_conectado']} texto={d.guias.whatsapp} icono={Ic.Smartphone}/>
                <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
                  <button onClick={()=>setTab('qr')} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:7}}>
                    {connected?<><Ic.RefreshCw size={13}/> Reconectar WhatsApp</>:<><Ic.Smartphone size={13}/> Conectar WhatsApp</>}
                  </button>
                  {connected&&<button onClick={async()=>{await fetch(`${WA}/sesion/${id}/desconectar`,{method:'POST',headers:{'x-server-secret':SECRET}});setStatus('disconnected');}} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>Desconectar</button>}
                </div>
              </div>
              <div data-config-grid style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,alignItems:'start'}}>
              <div data-config-horario style={{...CARD,marginBottom:0}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:4}}>Horario de atención semanal</div>
                <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:14,lineHeight:1.5,fontWeight:300}}>
                  {cfg.tieneCitas
                    ? 'El bot usará estos horarios para saber cuándo agendar citas sin solaparlas.'
                    : 'El bot informará estos horarios a tus clientes cuando pregunten.'}
                </p>
                {DIAS_SEMANA.map(dia=>{
                  const dh = horarioSemanal[dia.key] || { abierto:false, franjas:[{de:'08:00',a:'18:00'}] };
                  const franjas = dh.franjas?.length ? dh.franjas : [{de:'08:00',a:'18:00'}];
                  return (
                    <div key={dia.key} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'10px 0'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:dh.abierto?8:0}}>
                        <label style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer'}}>
                          <input type="checkbox" checked={!!dh.abierto} onChange={()=>toggleDiaAbierto(dia.key)} style={{width:15,height:15,cursor:'pointer',accentColor:'#25D366'}}/>
                          <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:dh.abierto?'#EFF4FF':'#4B6080'}}>{dia.label}</span>
                        </label>
                        {!dh.abierto
                          ? <span style={{fontFamily:F,fontSize:11,color:'#4B6080'}}>Cerrado</span>
                          : <button onClick={()=>copiarHorarioATodos(dia.key)} style={{background:'none',border:'none',fontFamily:F,fontSize:10,color:'#25D366',cursor:'pointer',textDecoration:'underline'}}>Copiar a todos los días</button>}
                      </div>
                      {dh.abierto&&(
                        <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:24}}>
                          {franjas.map((f,i)=>(
                            <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                              <input type="time" value={f.de||'08:00'} onChange={e=>actualizarFranja(dia.key,i,'de',e.target.value)} style={{...INP,width:'auto',padding:'6px 8px'}}/>
                              <span style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>a</span>
                              <input type="time" value={f.a||'18:00'} onChange={e=>actualizarFranja(dia.key,i,'a',e.target.value)} style={{...INP,width:'auto',padding:'6px 8px'}}/>
                              {franjas.length>1&&<button onClick={()=>eliminarFranja(dia.key,i)} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,padding:'4px 9px',fontFamily:F,fontSize:11,cursor:'pointer',display:'inline-flex',alignItems:'center'}}><Ic.X size={11}/></button>}
                            </div>
                          ))}
                          <button onClick={()=>agregarFranja(dia.key)} style={{alignSelf:'flex-start',background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:6,padding:'4px 10px',fontFamily:F,fontSize:11,color:'#4B6080',cursor:'pointer',marginTop:2}}>+ Agregar otro horario (jornada partida)</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {horarioMsg&&<div style={{marginTop:12,fontFamily:F,fontSize:12,color:horarioMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{horarioMsg}</div>}
                <button onClick={guardarHorario} disabled={savingHorario} style={{marginTop:14,background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingHorario?0.7:1}}>
                  {savingHorario?'Guardando...':'Guardar horario'}
                </button>
              </div>
              <div data-config-instrucciones style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:4,display:'flex',alignItems:'center',gap:7}}>
                  🤖 Instrucciones del agente IA
                </div>
                <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:12,lineHeight:1.6}}>
                  Escribe aquí la información de tu negocio: qué vendes, precios, cómo atiendes, qué decir si preguntan por el dueño, reglas especiales, etc. El bot usará esto como su conocimiento principal.
                </p>
                <textarea
                  value={promptAgente}
                  onChange={e=>setPromptAgente(e.target.value)}
                  placeholder={`Ej: Somos una empresa de maquinaria agrícola de ocasión en Navarra. Vendemos tractores, cosechadoras y aperos de marcas como Krone, Fendt, New Holland...\n\nSi preguntan por Oscar (el director), di que pueden dejar su nombre, correo y disponibilidad para que Oscar les contacte personalmente.`}
                  style={{...INP,minHeight:180,resize:'vertical',lineHeight:1.6,fontFamily:F}}
                />
                {promptMsg&&<div style={{marginTop:10,fontFamily:F,fontSize:12,color:promptMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{promptMsg}</div>}
                <button onClick={guardarPrompt} disabled={savingPrompt}
                  style={{marginTop:12,background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'10px 22px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingPrompt?0.6:1}}>
                  {savingPrompt?'Guardando...':'💾 Guardar instrucciones del bot'}
                </button>
              </div>
              </div>
              <div style={{...CARD,marginTop:14}}>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:2.2}}>
                  {[['Negocio',empresa.nombreEmpresa],['Industria',empresa.industria],['Tipo',cfg.labelCatalogo],['Email',empresa.email||'Sin correo'],['Ciudad',empresa.ciudad||'—'],['Plan',`${plan.nombre} — ${plan.precio}/mes`]].map(([k,v])=>(
                    <div key={k}><span style={{color:'#4B6080',fontSize:11}}>{k}:</span> <span style={{color:k==='Email'&&!empresa.email?'#F59E0B':undefined}}>{v}</span></div>
                  ))}
                </div>
                <a href="mailto:bqinzagencia@gmail.com" style={{display:'inline-block',marginTop:16,background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600}}>
                Contactar soporte para actualizar
                </a>
                </div>
          </div>
          )}

        </div>
      </div>

      {/* BOTTOM NAV — solo visible en móvil */}
      <nav data-bottom-nav style={{display:'none',position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:'rgba(6,9,13,.98)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.07)',padding:'6px 4px calc(6px + env(safe-area-inset-bottom))',overflowX:'auto',gap:2}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:'1 0 auto',minWidth:56,background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:'6px 4px',cursor:'pointer',color:tab===t.key?'#25D366':'#6B7A99',position:'relative'}}>
            <t.icon size={19} strokeWidth={tab===t.key?2:1.6}/>
            <span style={{fontFamily:F,fontSize:9,fontWeight:tab===t.key?700:500,whiteSpace:'nowrap',maxWidth:64,overflow:'hidden',textOverflow:'ellipsis'}}>{t.label}</span>
            {t.badge&&<span style={{position:'absolute',top:2,right:8,background:'#25D366',color:'#000',borderRadius:99,padding:'0 5px',fontSize:8,fontWeight:800,minWidth:14,textAlign:'center',lineHeight:'14px'}}>{t.badge}</span>}
          </button>
        ))}
      </nav>

      <AsesorWasapbot empresa={empresa}/>
    </>
  );
}
