// pages/wasapbot/panel/[id].js
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getConfigIndustria, DIAS_SEMANA, horarioSemanalDefault } from '../../../lib/wasapbotConfig';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';

const AsesorWasapbot = dynamic(() => import('../../../components/AsesorWasapbot'), { ssr: false });
const TourGuia       = dynamic(() => import('../../../components/TourGuia'), { ssr: false });

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const WA     = 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET = 'agenciame2026secreto_nexoia';

const PLANES = {
  prueba_5k:{ nombre:'Prueba Técnica', tokens:15000,  convs:100,  color:'#F59E0B', precio:'$5.000'   },
  basico:   { nombre:'Básico',   tokens:50000,  convs:500,  color:'#25D366', precio:'$189.000' },
  estandar: { nombre:'Estándar', tokens:150000, convs:1500, color:'#2563EB', precio:'$390.000' },
  pro:      { nombre:'Pro',      tokens:400000, convs:4000, color:'#A78BFA', precio:'$690.000' },
  wasapbot: { nombre:'Sin plan', tokens:0,      convs:0,    color:'#6B7280', precio:'Gratis'   },
};

const ESTADO_CITA = {
  pendiente:  { label:'Pendiente',  bg:'rgba(245,158,11,0.1)',  color:'#F59E0B', border:'rgba(245,158,11,0.3)'  },
  confirmada: { label:'Confirmada', bg:'rgba(37,211,102,0.1)',  color:'#25D366', border:'rgba(37,211,102,0.3)'  },
  cancelada:  { label:'Cancelada',  bg:'rgba(239,68,68,0.1)',   color:'#EF4444', border:'rgba(239,68,68,0.3)'   },
  completada: { label:'Completada', bg:'rgba(96,165,250,0.1)',  color:'#60A5FA', border:'rgba(96,165,250,0.3)'  },
};

function Guia({ texto, icono='💡', visible=true }) {
  if (!visible) return null;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:8,background:'rgba(37,211,102,0.05)',border:'1px dashed rgba(37,211,102,0.25)',borderRadius:8,padding:'8px 12px',marginTop:6}}>
      <span style={{fontSize:13,flexShrink:0,marginTop:1}}>{icono}</span>
      <span style={{fontFamily:F,fontSize:11,color:'rgba(37,211,102,0.75)',lineHeight:1.6}}>{texto}</span>
    </div>
  );
}

function ModalBienvenidaWasapbot({ nombre, cfg, onCerrar }) {
  const [paso, setPaso] = useState(0);
  const d = cfg.dashboard;
  const pasos = [
    { emoji:'🎉', titulo:`¡Bienvenido, ${nombre||'emprendedor'}!`, texto:'Tu WasapBot está listo. En unos minutos lo tendrás configurado para que responda a tus clientes las 24 horas. Te voy a guiar paso a paso.', color:'#25D366' },
    ...d.bienvenida.map(p=>({...p,color:'#60A5FA'})),
    { emoji:'🚀', titulo:'¡Listo para arrancar!', texto:'Las casillas vacías tienen anotaciones en verde que te guían. A medida que las llenas, las anotaciones desaparecen automáticamente. ¡Empecemos!', color:'#25D366' },
  ];
  const p = pasos[paso];
  const ultimo = paso === pasos.length - 1;
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes pulse-wb{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)}70%{box-shadow:0 0 0 12px rgba(37,211,102,0)}}`}</style>
      <div style={{background:'#0C0F14',border:`1px solid ${p.color}33`,borderRadius:24,padding:'40px 36px',maxWidth:480,width:'100%',animation:'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',boxShadow:`0 40px 80px rgba(0,0,0,0.6),0 0 40px ${p.color}15`}}>
        <div style={{display:'flex',gap:6,marginBottom:32}}>
          {pasos.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=paso?p.color:'rgba(255,255,255,0.08)',transition:'background 0.4s'}}/>)}
        </div>
        <div style={{width:72,height:72,borderRadius:'50%',background:`${p.color}15`,border:`2px solid ${p.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginBottom:24,animation:'pulse-wb 2.5s ease-in-out infinite'}}>{p.emoji}</div>
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
      <div style={{fontSize:44,marginBottom:16}}>🔒</div>
      <div style={{fontFamily:FA,fontSize:22,color:'#EFF4FF',marginBottom:8,fontWeight:400}}>Función premium</div>
      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.7,marginBottom:24,maxWidth:320,margin:'0 auto 24px'}}>
        {mensaje||'Activa tu plan para desbloquear esta función y empezar a crecer con tu bot.'}
      </div>
      <a href={'/wasapbot/planes?id='+empresaId+'&nombre='+encodeURIComponent(nombreEmpresa||'')}
        style={{display:'inline-block',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:10,padding:'12px 28px',fontFamily:F,fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 6px 24px rgba(245,158,11,0.35)'}}>
        ⚡ Activar mi plan →
      </a>
      <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:10}}>Desde $189.000/mes · Sin contratos · Cancela cuando quieras</div>
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
  const [qrBase64,       setQrBase64]       = useState('');
  const [convs,          setConvs]          = useState([]);
  const [citas,          setCitas]          = useState([]);
  const [citasFiltro,    setCitasFiltro]    = useState('todos');
  const [stats,          setStats]          = useState({ hoy:0, semana:0, total:0, tokensUsados:0 });
  const [tab,            setTab]            = useState('inicio');
  const [reconect,       setReconect]       = useState(false);
  const [metodoConexion, setMetodoConexion] = useState('');
  const [telefonoCod,    setTelefonoCod]    = useState('');
  const [codigoBot,      setCodigoBot]      = useState('');
  const [solicitandoCod, setSolicitandoCod] = useState(false);
  const [codigoCopiado,  setCodigoCopiado]  = useState(false);
  const [editando,       setEditando]       = useState(false);
  const [itemsEdit,      setItemsEdit]      = useState([]);
  const [savingCat,      setSavingCat]      = useState(false);
  const [saveMsg,        setSaveMsg]        = useState('');
  const [horarioSemanal, setHorarioSemanal] = useState(horarioSemanalDefault());
  const [savingHorario,  setSavingHorario]  = useState(false);
  const [horarioMsg,     setHorarioMsg]     = useState('');
  const [updatingCita,   setUpdatingCita]   = useState(null);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [guiasVistas,    setGuiasVistas]    = useState({});
  const pollRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    cargarDatos(); cargarCitas(); verificarStatus();
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (localStorage.getItem('wasapbot_nuevo_' + id)) {
      setMostrarBienvenida(true);
      localStorage.removeItem('wasapbot_nuevo_' + id);
    }
    try { const g = localStorage.getItem('wasapbot_guias_' + id); if (g) setGuiasVistas(JSON.parse(g)); } catch {}
  }, [id]);

  const marcarGuia = (clave) => {
    setGuiasVistas(prev => { const n={...prev,[clave]:true}; if(id) localStorage.setItem('wasapbot_guias_'+id,JSON.stringify(n)); return n; });
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
      setConvs(d.convs||[]);
      setConocimiento(d.conocimiento||{});
      setItemsEdit((d.conocimiento?.servicios||[]).map(s=>({...s})));
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

  const iniciarQR = async () => {
    setMetodoConexion('qr'); setReconect(true); setQrBase64('');
    try {
      await fetch(`${WA}/sesion/iniciar`,{method:'POST',headers:{'Content-Type':'application/json','x-server-secret':SECRET},body:JSON.stringify({empresaId:id})});
      let n=0;
      const poll=async()=>{
        if(n++>30){setReconect(false);return;}
        const r=await fetch(`${WA}/sesion/${id}/qr`,{headers:{'x-server-secret':SECRET}}).catch(()=>null);
        const dq=r?await r.json().catch(()=>({})):{};
        if(dq.qrBase64){setQrBase64(dq.qrBase64);setReconect(false);return;}
        if(dq.status==='connected'){setStatus('connected');setQrBase64('');setReconect(false);setTab('inicio');return;}
        setTimeout(poll,2000);
      };
      poll();
    } catch{setReconect(false);}
  };

  const reconectar = async () => { setTab('qr'); setMetodoConexion(''); setQrBase64(''); setCodigoBot(''); };

  const solicitarCodigo = async () => {
    const tel=telefonoCod.replace(/\D/g,'');
    if(tel.length<10){alert('Escribe tu número completo con código de país. Ej: 573001234567');return;}
    setSolicitandoCod(true);
    try {
      await fetch(`${WA}/sesion/iniciar`,{method:'POST',headers:{'Content-Type':'application/json','x-server-secret':SECRET},body:JSON.stringify({empresaId:id})});
      await new Promise(r=>setTimeout(r,2000));
      const r=await fetch(`${WA}/sesion/${id}/pairing-code`,{method:'POST',headers:{'Content-Type':'application/json','x-server-secret':SECRET},body:JSON.stringify({telefono:tel})});
      const dpc=await r.json();
      if(dpc.code){setCodigoBot(dpc.code);pollConexion();}
      else alert(dpc.error||'No se pudo generar el código. Intenta con QR.');
    } catch(e){alert('Error: '+e.message);}
    setSolicitandoCod(false);
  };

  const pollConexion = () => {
    let n=0;
    const check=async()=>{
      if(n++>60)return;
      const r=await fetch(`${WA}/sesion/${id}/status`,{headers:{'x-server-secret':SECRET}}).catch(()=>null);
      const ds=r?await r.json().catch(()=>({})):{};
      if(ds.status==='connected'){setStatus('connected');setTab('inicio');setMetodoConexion('');setCodigoBot('');return;}
      setTimeout(check,3000);
    };
    check();
  };

  const copiarCodigo = () => {
    if(!codigoBot)return;
    const hacerCopia = () => { setCodigoCopiado(true); setTimeout(()=>setCodigoCopiado(false),2000); };
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(codigoBot).then(hacerCopia).catch(()=>{});
    } else {
      try{
        const ta=document.createElement('textarea');
        ta.value=codigoBot; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        hacerCopia();
      }catch{}
    }
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
  const fmtFecha=ts=>{const d=toDate(ts);if(!d)return '—';return d.toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short',year:'numeric'});};

  if(loadError)return(
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
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
    {key:'inicio',label:'Inicio',icon:'◉'},
    ...(d.tabCitas?[{key:'citas',label:d.tabCitas,icon:'📅',badge:citasHoy>0?citasHoy:null}]:[]),
    {key:'convs',label:'Conversaciones',icon:'💬'},
    {key:'catalogo',label:d.tabCatalogo,icon:'📋'},
    {key:'config',label:'Configuración',icon:'⚙️'},
  ];

  const LINKS=[
    {href:`/wasapbot/panel/stock/${id}`,label:'Inventario y ventas',icon:'📊',color:'#A78BFA',bg:'rgba(167,139,250,0.07)',border:'rgba(167,139,250,0.18)'},
    ...(cfg.tieneInventario?[{href:`/wasapbot/panel/inventario/${id}`,label:'Menú del día',icon:'📦',color:'#60A5FA',bg:'rgba(96,165,250,0.08)',border:'rgba(96,165,250,0.2)'}]:[]),
    ...(cfg.tienePedidos?[{href:`/wasapbot/panel/pedidos/${id}`,label:'Pedidos del día',icon:'🛒',color:'#25D366',bg:'rgba(37,211,102,0.06)',border:'rgba(37,211,102,0.15)'}]:[]),
  ];

  return(
    <>
      <Head><title>{empresa.nombreEmpresa} — Panel WasapBot</title></Head>

      {mostrarBienvenida&&<ModalBienvenidaWasapbot nombre={empresa.nombreEmpresa} cfg={cfg} onCerrar={()=>setMostrarBienvenida(false)}/>}

      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}a{text-decoration:none;color:inherit}
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
        .btn-est{border:none;border-radius:7px;padding:6px 12px;font-family:${F};font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s}
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
      <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/wasapbot"><span style={{fontFamily:FA,fontSize:16,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
          <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
          <span style={{fontFamily:F,fontSize:13,fontWeight:600}}>{empresa.nombreEmpresa}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:connected?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${connected?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:100,padding:'4px 12px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:connected?'#25D366':'#EF4444',animation:connected?'pulse-g 2s infinite':'none'}}/>
            <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:connected?'#25D366':'#EF4444'}}>{connected?'Bot activo':'Desconectado'}</span>
          </div>
          <span style={{background:plan.color+'22',color:plan.color,border:`1px solid ${plan.color}44`,borderRadius:100,padding:'3px 12px',fontFamily:F,fontSize:11,fontWeight:700}}>{plan.nombre}</span>
          <button onClick={cerrarSesion} style={{background:'rgba(239,68,68,0.07)',color:'rgba(239,68,68,0.7)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:8,padding:'5px 12px',fontFamily:F,fontSize:11,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Salir
          </button>
        </div>
      </nav>

      <div style={{display:'flex',minHeight:'calc(100vh - 58px)'}}>
        {/* SIDEBAR */}
        <div data-tour="hub-sidebar" style={{width:216,borderRight:'1px solid rgba(255,255,255,0.05)',padding:'16px 10px',flexShrink:0,display:'flex',flexDirection:'column',gap:2}}>
          {TABS.map(t=>(
            <button key={t.key} className={`wb-tab${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span style={{flex:1}}>{t.label}</span>
              {t.badge&&<span style={{background:'#25D366',color:'#000',borderRadius:99,padding:'1px 7px',fontSize:10,fontWeight:800,minWidth:18,textAlign:'center'}}>{t.badge}</span>}
            </button>
          ))}
          {LINKS.length>0&&(
            <div data-tour="hub-links">
              <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'8px 4px'}}/>
              {LINKS.map(l=>(
                <Link key={l.href} href={l.href} className="ext-link" style={{background:l.bg,border:`1px solid ${l.border}`,color:l.color}}>
                  <span style={{fontSize:14}}>{l.icon}</span>
                  <span style={{flex:1,fontSize:12}}>{l.label}</span>
                  <span style={{fontSize:10,opacity:0.6}}>↗</span>
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
              style={{display:'block',background:planActivo?'rgba(37,211,102,.15)':'#25D366',color:planActivo?'#25D366':'#fff',border:planActivo?'1px solid rgba(37,211,102,.3)':'none',borderRadius:8,padding:'7px',fontFamily:F,fontSize:11,fontWeight:700,textAlign:'center'}}>
              {planActivo?'⬆️ Mejorar plan':'⚡ Activar plan'}
            </a>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{flex:1,padding:'28px 32px',overflowY:'auto'}}>

          {/* ══ INICIO ══ */}
          {tab==='inicio'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>{empresa.nombreEmpresa}</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20,fontWeight:300}}>Panel de control · {cfg.labelCatalogo} · {empresa.industria}</p>

              {/* Banner plan no activo */}
              {!planActivo&&(
                <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.25)',borderRadius:12,padding:'18px 20px',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:14}}>
                    <div>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#F59E0B',marginBottom:3}}>⚡ Bot en modo configuración</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>Activa un plan para que tu bot responda con IA a tus clientes.</div>
                    </div>
                    <a href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}`}
                      style={{background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:9,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:700,textDecoration:'none',flexShrink:0,boxShadow:'0 4px 16px rgba(245,158,11,.3)'}}>
                      Ver planes →
                    </a>
                  </div>
                  {/* Mini cards de planes */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {[
                      {id:'basico',   nombre:'Básico',   precio:'$189K', color:'#25D366', desc:'Bot + catálogo + citas'},
                      {id:'estandar', nombre:'Estándar', precio:'$390K', color:'#2563EB', desc:'+ Pedidos + reportes', popular:true},
                      {id:'pro',      nombre:'Pro',       precio:'$690K', color:'#A78BFA', desc:'+ Web + voz + CRM'},
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
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EF4444',marginBottom:3}}>⚠️ Bot desconectado</div>
                    <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)'}}>Ve a <strong style={{color:'#EFF4FF'}}>Configuración</strong> para conectar tu WhatsApp.</div>
                  </div>
                  <button onClick={()=>setTab('config')} style={{background:'#EF4444',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer'}}>Conectar ahora →</button>
                </div>
              )}

              {/* Acceso rápido stock */}
              <Link href={`/wasapbot/panel/stock/${id}`}
                style={{background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,textDecoration:'none',marginBottom:12}}>
                <span style={{fontSize:26}}>📊</span>
                <div>
                  <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#A78BFA',marginBottom:3}}>Inventario y ventas</div>
                  <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.3)'}}>Compras, ventas, stock y reportes diarios</div>
                </div>
              </Link>

              {/* Accesos rápidos de la industria */}
              {d.accesosRapidos.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:`repeat(${d.accesosRapidos.length},1fr)`,gap:12,marginBottom:16}}>
                  {d.accesosRapidos.map((ar,i)=>(
                    <Link key={i} href={`/wasapbot/panel/${ar.link}/${id}`}
                      style={{background:ar.link==='inventario'?'rgba(96,165,250,0.06)':'rgba(37,211,102,0.06)',border:`1px solid ${ar.link==='inventario'?'rgba(96,165,250,0.2)':'rgba(37,211,102,0.2)'}`,borderRadius:14,padding:'18px 20px',display:'flex',alignItems:'center',gap:14,textDecoration:'none'}}>
                      <span style={{fontSize:26}}>{ar.icon}</span>
                      <div>
                        <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:ar.link==='inventario'?'#60A5FA':'#25D366',marginBottom:3}}>{ar.label}</div>
                        <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.3)'}}>{ar.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div data-tour="hub-stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
                {[
                  {label:'Hoy',val:stats.hoy,color:'#25D366',icon:'💬'},
                  {label:'Esta semana',val:stats.semana,color:'#60A5FA',icon:'📊'},
                  {label:'Citas pendientes',val:citas.filter(c=>c.estado==='pendiente').length,color:'#F59E0B',icon:'📅'},
                  {label:'Total convs',val:stats.total,color:'#EFF4FF',icon:'📈'},
                ].map((s,i)=>(
                  <div key={i} style={CARD}>
                    <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
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
                  <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
                    <div>
                      <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:4}}>{d.tabCitas}</h2>
                      <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300,margin:0}}>El bot las agenda automáticamente por WhatsApp.</p>
                    </div>
                    <button onClick={cargarCitas} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>↻ Actualizar</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
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
                      <div style={{fontSize:48,marginBottom:12}}>📅</div>
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
                                <div style={{fontFamily:F,fontSize:13,color:'#8A9BB5',marginBottom:4}}>📋 {cita.servicio||cfg.labelItem}</div>
                                {cita.telefono&&<a href={`https://wa.me/${cita.telefono}`} target="_blank" rel="noreferrer" style={{fontFamily:F,fontSize:12,color:'#25D366'}}>+{cita.telefono}</a>}
                              </div>
                              <div style={{display:'flex',gap:7,flexShrink:0,flexWrap:'wrap'}}>
                                {esPend&&<><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'confirmada')} style={{background:'rgba(37,211,102,0.1)',color:'#25D366',border:'1px solid rgba(37,211,102,0.3)'}}>{updating?'...':'✓ Confirmar'}</button><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'cancelada')} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)'}}>{updating?'...':'✕'}</button></>}
                                {esConf&&<><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'completada')} style={{background:'rgba(96,165,250,0.1)',color:'#60A5FA',border:'1px solid rgba(96,165,250,0.25)'}}>{updating?'...':'✓ Completar'}</button><button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'cancelada')} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)'}}>{updating?'...':'Cancelar'}</button></>}
                                {(cita.estado==='cancelada'||cita.estado==='completada')&&<button className="btn-est" disabled={updating} onClick={()=>actualizarEstadoCita(cita.id,'pendiente')} style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>{updating?'...':'↩ Reabrir'}</button>}
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
                  <Guia visible={convs.length===0&&!guiasVistas['convs_vacio']} texto={d.guias.convs_vacio} icono="💬"/>
                  <div style={CARD}>
                    {convs.map((c,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:i<convs.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(37,211,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:700,color:'#25D366',flexShrink:0}}>{(c.nombreCliente||'?')[0].toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{c.nombreCliente||'Cliente'}</div>
                          <div style={{fontFamily:F,fontSize:11,color:'#4B6080'}}>+{c.telefono||''}</div>
                          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300}}>{c.ultimoTexto}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontFamily:F,fontSize:10,color:'#374151'}}>{fmtFecha(c.ultimoMensaje)}</div>
                          <span style={{background:'rgba(37,211,102,0.1)',color:'#25D366',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700}}>WhatsApp</span>
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
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
                <div>
                  <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:4}}>{d.tabCatalogo}</h2>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300,margin:0}}>El bot usará esta información para responder a tus clientes.</p>
                </div>
                {!editando?(
                  <button data-tour="hub-catalogo-btn" onClick={()=>{setItemsEdit(servicios.length>0?servicios.map(s=>({...s})):[{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',duracionMin:''}]);setEditando(true);}} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.25)',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    {servicios.length>0?'✏️ Editar':'+ Agregar primer '+cfg.labelItem.toLowerCase()}
                  </button>
                ):(
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setEditando(false)} style={{background:'rgba(255,255,255,0.04)',color:'#6B7A99',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'9px 16px',fontFamily:F,fontSize:13,cursor:'pointer'}}>Cancelar</button>
                    <button onClick={guardarCatalogo} disabled={savingCat} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingCat?0.7:1}}>{savingCat?'Guardando...':'Guardar cambios'}</button>
                  </div>
                )}
              </div>
              {saveMsg&&<div style={{background:saveMsg.startsWith('✓')?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${saveMsg.startsWith('✓')?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:9,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:saveMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{saveMsg}</div>}
              <Guia visible={servicios.length===0&&!editando&&!guiasVistas['catalogo_items']} texto={d.guias.catalogo_vacio} icono="📋"/>
              {!editando&&servicios.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
                  {servicios.map((s,i)=>(
                    <div key={i} style={{...CARD,padding:0,overflow:'hidden'}}>
                      {s.foto?<img src={s.foto} alt={s.nombre} style={{width:'100%',height:120,objectFit:'cover',display:'block'}}/>:<div style={{width:'100%',height:50,background:'rgba(37,211,102,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📌</div>}
                      <div style={{padding:12}}>
                        {s.categoria&&<span style={{background:'rgba(255,255,255,0.05)',color:'#6B7A99',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700,textTransform:'uppercase',display:'inline-block',marginBottom:5}}>{s.categoria}</span>}
                        <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:3}}>{s.nombre||'Sin nombre'}</div>
                        {s.descripcion&&<div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6,lineHeight:1.4}}>{s.descripcion}</div>}
                        {s.precio&&<div style={{fontFamily:FA,fontSize:16,color:'#25D366'}}>${Number(String(s.precio).replace(/\D/g,'')).toLocaleString('es-CO')||s.precio}</div>}
                        {s.duracionMin&&<div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginTop:4}}>⏱️ {s.duracionMin} min</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {editando&&(
                <div>
                  <Guia visible={!guiasVistas['catalogo_editando']} texto={`Completa cada ${cfg.labelItem.toLowerCase()} con nombre, ${cfg.labelPrecio.toLowerCase()} y descripción.`} icono="✏️"/>
                  {itemsEdit.map((item,idx)=>(
                    <div key={idx} style={{...CARD,marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#8A9BB5'}}>{cfg.labelItem} {idx+1}</span>
                        {itemsEdit.length>1&&<button onClick={()=>setItemsEdit(prev=>prev.filter((_,i)=>i!==idx))} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,padding:'3px 10px',fontFamily:F,fontSize:11,cursor:'pointer'}}>Eliminar</button>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelItem} *</label>
                          <input className={`cat-inp${!item.nombre?' guia-border':''}`} style={{...INP,borderColor:!item.nombre?'rgba(37,211,102,0.3)':undefined}} value={item.nombre||''}
                            placeholder={cfg.placeholders[`item${idx+1}`]||`Nombre del ${cfg.labelItem.toLowerCase()}`}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it));if(e.target.value)marcarGuia(`nombre_${idx}`);}}/>
                          <Guia visible={!item.nombre&&!guiasVistas[`nombre_${idx}`]} texto={d.guias.catalogo_nombre} icono="🏷️"/>
                        </div>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelPrecio}</label>
                          <input className={`cat-inp${!item.precio?' guia-border':''}`} style={{...INP,borderColor:!item.precio?'rgba(37,211,102,0.25)':undefined}} value={item.precio||''}
                            placeholder={cfg.placeholders[`precio${idx+1}`]||'0'}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,precio:e.target.value}:it));if(e.target.value)marcarGuia(`precio_${idx}`);}}/>
                          <Guia visible={!item.precio&&!guiasVistas[`precio_${idx}`]} texto={d.guias.catalogo_precio} icono="💰"/>
                        </div>
                      </div>
                      <div>
                        <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelDescripcion}</label>
                        <input className={`cat-inp${!item.descripcion?' guia-border':''}`} style={{...INP,borderColor:!item.descripcion?'rgba(37,211,102,0.2)':undefined}} value={item.descripcion||''}
                          placeholder={cfg.placeholders[`desc${idx+1}`]||'Descripción...'}
                          onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it));if(e.target.value)marcarGuia(`desc_${idx}`);}}/>
                        <Guia visible={!item.descripcion&&!guiasVistas[`desc_${idx}`]} texto={d.guias.catalogo_desc} icono="📝"/>
                      </div>
                      {/* ── Campo URL foto — visible solo para industrias con foto (restaurantes, etc.) ── */}
                      {cfg.tieneFoto&&(
                        <div style={{marginTop:10}}>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#25D366',display:'block',marginBottom:4}}>📷 URL de foto (se envía por WhatsApp)</label>
                          <input
                            className="cat-inp"
                            style={{...INP,borderColor:item.foto&&item.foto.startsWith('http')?'rgba(37,211,102,0.5)':'rgba(255,255,255,0.06)'}}
                            value={item.foto||''}
                            placeholder="https://... enlace directo a la imagen del plato o producto"
                            onChange={e=>setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,foto:e.target.value.trim()}:it))}
                          />
                          {item.foto&&item.foto.startsWith('http')&&(
                            <div style={{marginTop:8,display:'flex',alignItems:'center',gap:10}}>
                              <img
                                src={item.foto} alt="preview"
                                style={{width:64,height:64,objectFit:'cover',borderRadius:9,border:'2px solid rgba(37,211,102,0.4)',flexShrink:0}}
                                onError={e=>{e.target.style.opacity='0.15';}}
                              />
                              <span style={{fontFamily:F,fontSize:11,color:'#25D366',lineHeight:1.6}}>✓ Esta foto se enviará automáticamente<br/>cuando el cliente pida el menú por WhatsApp</span>
                            </div>
                          )}
                          {!item.foto&&(
                            <div style={{marginTop:5,fontFamily:F,fontSize:10,color:'rgba(255,165,0,0.75)'}}>
                              ⚠️ Sin foto — el bot solo mostrará texto. Pega la URL de la imagen para que se envíe por WhatsApp.
                            </div>
                          )}
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
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>⏱️ Duración (minutos)</label>
                          <input className="cat-inp" style={{...INP,maxWidth:140}} type="number" min="5" step="5" value={item.duracionMin||''}
                            placeholder="Ej: 30"
                            onChange={e=>setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,duracionMin:e.target.value}:it))}/>
                          <div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:4}}>El bot usará este tiempo para calcular qué horarios puede ofrecer sin solapar con otras citas.</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>setItemsEdit(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',duracionMin:''}])}
                    style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:10,padding:'11px',fontFamily:F,fontSize:13,color:'#4B6080',cursor:'pointer',marginTop:4}}>
                    + Agregar {cfg.labelItem.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ QR / CÓDIGO ══ */}
          {tab==='qr'&&(
            <div style={{maxWidth:680,margin:'0 auto'}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>Conectar WhatsApp</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:28,fontWeight:300}}>Elige cómo conectar tu número. Ambas opciones funcionan igual de bien.</p>
              {!metodoConexion&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div onClick={iniciarQR} style={{background:'rgba(37,211,102,0.04)',border:'1.5px solid rgba(37,211,102,0.2)',borderRadius:16,padding:22,cursor:'pointer',transition:'all 0.2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(37,211,102,0.5)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(37,211,102,0.2)';e.currentTarget.style.transform='none';}}>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:4}}>📷 Escanear código QR</div>
                    <div style={{fontFamily:F,fontSize:11,color:'#25D366',fontWeight:600,marginBottom:8}}>✓ Recomendado</div>
                    <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.6,margin:0}}>Abre WhatsApp desde otro celular o PC y escanea el código con la cámara.</p>
                  </div>
                  <div onClick={()=>setMetodoConexion('codigo')} style={{background:'rgba(96,165,250,0.04)',border:'1.5px solid rgba(96,165,250,0.2)',borderRadius:16,padding:22,cursor:'pointer',transition:'all 0.2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.5)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.2)';e.currentTarget.style.transform='none';}}>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:4}}>🔢 Código por número</div>
                    <div style={{fontFamily:F,fontSize:11,color:'#60A5FA',fontWeight:600,marginBottom:8}}>Solo un celular</div>
                    <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.6,margin:0}}>WhatsApp te envía un código de 8 dígitos directamente. No necesitas cámara.</p>
                  </div>
                </div>
              )}
              {metodoConexion==='qr'&&(
                <div style={{textAlign:'center'}}>
                  <button onClick={()=>{setMetodoConexion('');setQrBase64('');setReconect(false);}} style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',cursor:'pointer',marginBottom:24,display:'inline-flex',alignItems:'center',gap:6}}>← Cambiar método</button>
                  {reconect&&!qrBase64&&(<div style={{padding:'60px 0'}}><div style={{width:48,height:48,border:'3px solid rgba(37,211,102,0.1)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.9s linear infinite',margin:'0 auto 20px'}}/><div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.25)'}}>Generando QR...</div></div>)}
                  {qrBase64&&(
                    <div>
                      <div style={{background:'#fff',borderRadius:20,padding:22,display:'inline-block',marginBottom:24,boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}><img src={qrBase64} alt="QR" style={{width:220,height:220,display:'block'}}/></div>
                      <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:16}}>Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea</p>
                    </div>
                  )}
                </div>
              )}
              {metodoConexion==='codigo'&&(
                <div>
                  <button onClick={()=>{setMetodoConexion('');setCodigoBot('');setTelefonoCod('');}} style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',cursor:'pointer',marginBottom:24,display:'inline-flex',alignItems:'center',gap:6}}>← Cambiar método</button>
                  {!codigoBot?(
                    <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'28px 24px',maxWidth:480}}>
                      <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Número de WhatsApp del bot</div>
                      <div style={{position:'relative',marginBottom:12}}>
                        <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.35)',pointerEvents:'none'}}>+</span>
                        <input type="tel" value={telefonoCod} onChange={e=>setTelefonoCod(e.target.value.replace(/\D/g,''))} placeholder="57 300 123 4567"
                          style={{width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 12px 10px 28px',color:'#EFF4FF',fontFamily:F,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
                      </div>
                      <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.2)',marginBottom:16}}>Colombia: 57 + número de 10 dígitos. Ej: 573001234567</p>
                      <button onClick={solicitarCodigo} disabled={solicitandoCod||!telefonoCod.trim()} style={{width:'100%',background:'linear-gradient(135deg,#60A5FA,#3B82F6)',color:'#fff',border:'none',borderRadius:10,padding:'12px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer',opacity:(solicitandoCod||!telefonoCod.trim())?0.6:1}}>
                        {solicitandoCod?'Enviando...':'Enviar código a mi WhatsApp →'}
                      </button>
                    </div>
                  ):(
                    <div style={{textAlign:'center',maxWidth:480}}>
                      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',marginBottom:16}}>WhatsApp te envió este código:</div>
                      <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:20}}>
                        {[codigoBot.slice(0,4),codigoBot.slice(4,8)].map((bloque,bi)=>(
                          <div key={bi} style={{display:'flex',gap:5}}>
                            {bloque.split('').map((digit,di)=>(
                              <div key={di} style={{width:48,height:56,borderRadius:12,background:'rgba(37,211,102,0.1)',border:'2px solid rgba(37,211,102,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:22,fontWeight:800,color:'#25D366'}}>{digit}</div>
                            ))}
                            {bi===0&&<div style={{display:'flex',alignItems:'center',padding:'0 3px',fontFamily:F,fontSize:22,fontWeight:800,color:'rgba(37,211,102,0.3)'}}>–</div>}
                          </div>
                        ))}
                      </div>
                      <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.7}}>WhatsApp → Ajustes → Dispositivos vinculados → Vincular con número → Ingresa el código</p>
                      <button onClick={copiarCodigo} style={{display:'inline-flex',alignItems:'center',gap:7,background:codigoCopiado?'rgba(37,211,102,0.12)':'rgba(255,255,255,0.04)',color:codigoCopiado?'#25D366':'rgba(255,255,255,0.5)',border:`1px solid ${codigoCopiado?'rgba(37,211,102,0.35)':'rgba(255,255,255,0.08)'}`,borderRadius:8,padding:'8px 16px',fontFamily:F,fontSize:12,fontWeight:600,cursor:'pointer',marginTop:14}}>
                        {codigoCopiado?(<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copiado</>):(<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar código</>)}
                      </button>
                      <div>
                        <button onClick={()=>{setCodigoBot('');setTelefonoCod('');}} style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.25)',cursor:'pointer',textDecoration:'underline',marginTop:12}}>No recibí el código — intentar de nuevo</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ CONFIGURACIÓN ══ */}
          {tab==='config'&&(
            <div style={{maxWidth:560}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Configuración</h2>
              <div data-tour="hub-config" style={{...CARD,marginBottom:14}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:8}}>Conexión WhatsApp</div>
                <Guia visible={!connected&&!guiasVistas['whatsapp_conectado']} texto={d.guias.whatsapp} icono="📱"/>
                <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
                  <button onClick={()=>{setTab('qr');setMetodoConexion('');setQrBase64('');setCodigoBot('');}} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    {connected?'↻ Reconectar WhatsApp':'📱 Conectar WhatsApp'}
                  </button>
                  {connected&&<button onClick={async()=>{await fetch(`${WA}/sesion/${id}/desconectar`,{method:'POST',headers:{'x-server-secret':SECRET}});setStatus('disconnected');}} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>Desconectar</button>}
                </div>
              </div>
              <div style={{...CARD,marginBottom:14}}>
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
                              {franjas.length>1&&<button onClick={()=>eliminarFranja(dia.key,i)} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,padding:'4px 9px',fontFamily:F,fontSize:11,cursor:'pointer'}}>✕</button>}
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
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>Tu negocio</div>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:2.2}}>
                  {[['Negocio',empresa.nombreEmpresa],['Industria',empresa.industria],['Tipo',cfg.labelCatalogo],['Email',empresa.email||'⚠️ Sin correo'],['Ciudad',empresa.ciudad||'—'],['Plan',`${plan.nombre} — ${plan.precio}/mes`]].map(([k,v])=>(
                    <div key={k}><span style={{color:'#4B6080',fontSize:11}}>{k}:</span> <span style={{color:k==='Email'&&!empresa.email?'#F59E0B':undefined}}>{v}</span></div>
                  ))}
                </div>
                <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:16,background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600}}>
                  Contactar soporte para actualizar
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
      <AsesorWasapbot empresa={empresa}/>
      <TourGuia
        storageKey={`wasapbot_tour_panel_${id}`}
        activo={!!empresa}
        pasos={[
          { selector:'[data-tour="hub-sidebar"]', titulo:'Tu menú principal', icono:'🧭',
            texto:'Aquí navegas entre las secciones de tu negocio: Inicio (resumen), '+(d.tabCitas?d.tabCitas+', ':'')+'Conversaciones de WhatsApp, tu '+d.tabCatalogo+' y la Configuración para conectar el bot.' },
          { selector:'[data-tour="hub-links"]', titulo:'Accesos directos', icono:'🔗',
            texto:'Atajos a herramientas extra: inventario y reportes de ventas'+(cfg.tieneInventario?', el menú del día':'')+(cfg.tienePedidos?' y los pedidos en tiempo real':'')+'.' },
          { selector:'[data-tour="hub-catalogo-btn"]', titulo:d.tabCatalogo, icono:'📋', accion:()=>setTab('catalogo'),
            texto:'Aquí registras tu '+cfg.labelCatalogo.toLowerCase()+': nombre, '+cfg.labelPrecio.toLowerCase()+' y descripción de cada '+cfg.labelItem.toLowerCase()+'. El bot usa esta información para responder a tus clientes — empieza por aquí si aún no tienes nada cargado.' },
          { selector:'[data-tour="hub-config"]', titulo:'Conecta tu WhatsApp', icono:'📱', accion:()=>setTab('config'),
            texto:'Escanea el código QR o usa el código por número para conectar el WhatsApp de tu negocio. En cuanto quede conectado, tu bot empieza a responder automaticamente a tus clientes.' },
          { selector:'[data-tour="hub-stats"]', titulo:'Tu actividad', icono:'📊', accion:()=>setTab('inicio'),
            texto:'Aquí ves cuántas conversaciones, citas y contactos genera tu bot cada día — y más abajo, cuánto plan te queda disponible.' },
        ]}
      />
    </>
  );
}
