// pages/wasapbot/panel/[id].js
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getConfigIndustria } from '../../../lib/wasapbotConfig';
import dynamic from 'next/dynamic';

const AsesorWasapbot = dynamic(() => import('../../../components/AsesorWasapbot'), { ssr: false });

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const WA     = 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET = 'agenciame2026secreto_nexoia';

const PLANES = {
  basico:   { nombre:'Básico',   tokens:50000,  convs:500,  color:'#6B7280', precio:'$189.000' },
  estandar: { nombre:'Estándar', tokens:150000, convs:1500, color:'#2563EB', precio:'$390.000' },
  pro:      { nombre:'Pro',      tokens:400000, convs:4000, color:'#A78BFA', precio:'$690.000' },
  wasapbot: { nombre:'Trial',    tokens:15000,  convs:150,  color:'#F59E0B', precio:'Gratis'   },
};

const ESTADO_CITA = {
  pendiente:  { label:'Pendiente',  bg:'rgba(245,158,11,0.1)',  color:'#F59E0B', border:'rgba(245,158,11,0.3)'  },
  confirmada: { label:'Confirmada', bg:'rgba(37,211,102,0.1)',  color:'#25D366', border:'rgba(37,211,102,0.3)'  },
  cancelada:  { label:'Cancelada',  bg:'rgba(239,68,68,0.1)',   color:'#EF4444', border:'rgba(239,68,68,0.3)'   },
  completada: { label:'Completada', bg:'rgba(96,165,250,0.1)',  color:'#60A5FA', border:'rgba(96,165,250,0.3)'  },
};

// ── Guía contextual ──────────────────────────────────────────
function Guia({ texto, icono = '💡', visible = true }) {
  if (!visible) return null;
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:8,
      background:'rgba(37,211,102,0.05)',
      border:'1px dashed rgba(37,211,102,0.25)',
      borderRadius:8, padding:'8px 12px', marginTop:6,
      animation:'fadeInGuia 0.3s ease',
    }}>
      <span style={{fontSize:13,flexShrink:0,marginTop:1}}>{icono}</span>
      <span style={{fontFamily:F,fontSize:11,color:'rgba(37,211,102,0.75)',lineHeight:1.6}}>{texto}</span>
    </div>
  );
}

// ── Modal de bienvenida dinámico por industria ────────────────
function ModalBienvenidaWasapbot({ nombre, cfg, onCerrar }) {
  const [paso, setPaso] = useState(0);
  const d = cfg.dashboard;

  // Paso 0 siempre es bienvenida general, luego los pasos de la industria
  const pasos = [
    {
      emoji: '🎉',
      titulo: `¡Bienvenido, ${nombre || 'emprendedor'}!`,
      texto: `Tu WasapBot está listo. En unos minutos lo tendrás configurado para que responda a tus clientes las 24 horas. Te voy a guiar paso a paso.`,
      color: '#25D366',
    },
    ...d.bienvenida.map(p => ({ ...p, color: '#60A5FA' })),
    {
      emoji: '🚀',
      titulo: '¡Listo para arrancar!',
      texto: 'Las casillas vacías tienen anotaciones en verde que te guían. A medida que las llenas, las anotaciones desaparecen automáticamente. ¡Empecemos!',
      color: '#25D366',
    },
  ];

  const p      = pasos[paso];
  const ultimo = paso === pasos.length - 1;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeInGuia { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-wb { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)} 70%{box-shadow:0 0 0 12px rgba(37,211,102,0)} }
      `}</style>
      <div style={{
        background:'#0C0F14', border:`1px solid ${p.color}33`,
        borderRadius:24, padding:'40px 36px', maxWidth:480, width:'100%',
        animation:'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        boxShadow:`0 40px 80px rgba(0,0,0,0.6), 0 0 40px ${p.color}15`,
      }}>
        {/* Barra de progreso */}
        <div style={{display:'flex', gap:6, marginBottom:32}}>
          {pasos.map((_,i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:2,
              background: i <= paso ? p.color : 'rgba(255,255,255,0.08)',
              transition:'background 0.4s',
            }}/>
          ))}
        </div>

        {/* Emoji */}
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:`${p.color}15`, border:`2px solid ${p.color}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:32, marginBottom:24,
          animation:'pulse-wb 2.5s ease-in-out infinite',
        }}>{p.emoji}</div>

        <h2 style={{fontFamily:FA,fontSize:26,fontWeight:400,color:'#EFF4FF',marginBottom:12,lineHeight:1.2}}>{p.titulo}</h2>
        <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.8,marginBottom:36,fontWeight:300}}>{p.texto}</p>

        <div style={{display:'flex', gap:10}}>
          {paso > 0 && (
            <button onClick={() => setPaso(p => p - 1)} style={{
              background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
              padding:'12px 20px', fontFamily:F, fontSize:13, cursor:'pointer',
            }}>← Anterior</button>
          )}
          <button onClick={() => ultimo ? onCerrar() : setPaso(p => p + 1)} style={{
            flex:1, background:`linear-gradient(135deg,${p.color},${p.color}BB)`,
            color:'#fff', border:'none', borderRadius:10,
            padding:'12px 20px', fontFamily:F, fontSize:14, fontWeight:700, cursor:'pointer',
          }}>
            {ultimo ? '¡Vamos a configurar! 🚀' : 'Siguiente →'}
          </button>
        </div>

        {!ultimo && (
          <button onClick={onCerrar} style={{
            display:'block', width:'100%', marginTop:14,
            background:'none', border:'none', fontFamily:F, fontSize:11,
            color:'rgba(255,255,255,0.2)', cursor:'pointer', textAlign:'center',
          }}>Saltar introducción</button>
        )}
      </div>
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
  const [editando,       setEditando]       = useState(false);
  const [itemsEdit,      setItemsEdit]      = useState([]);
  const [savingCat,      setSavingCat]      = useState(false);
  const [saveMsg,        setSaveMsg]        = useState('');
  const [updatingCita,   setUpdatingCita]   = useState(null);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [guiasVistas,    setGuiasVistas]    = useState({});
  const pollRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    cargarDatos();
    cargarCitas();
    verificarStatus();
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Mostrar bienvenida si es nuevo
    if (localStorage.getItem('wasapbot_nuevo_' + id)) {
      setMostrarBienvenida(true);
      localStorage.removeItem('wasapbot_nuevo_' + id);
    }
    // Cargar guías vistas
    try {
      const g = localStorage.getItem('wasapbot_guias_' + id);
      if (g) setGuiasVistas(JSON.parse(g));
    } catch {}
  }, [id]);

  const marcarGuia = (clave) => {
    setGuiasVistas(prev => {
      const nuevo = { ...prev, [clave]: true };
      if (id) localStorage.setItem('wasapbot_guias_' + id, JSON.stringify(nuevo));
      return nuevo;
    });
  };

  const verGuia = (clave, valor) => {
    if (guiasVistas[clave]) return false;
    if (valor && String(valor).trim()) return false;
    return true;
  };

  const cargarDatos = async () => {
    try {
      const r = await fetch(`/api/wasapbot-panel?id=${id}`);
      if (!r.ok) { const e = await r.json().catch(()=>({})); setLoadError(e.error||`Error ${r.status}`); return; }
      const d = await r.json();
      if (!d.ok) { setLoadError(d.error||'Error cargando datos'); return; }
      setEmpresa({ id, ...d.empresa });
      setConvs(d.convs || []);
      setConocimiento(d.conocimiento || {});
      setItemsEdit((d.conocimiento?.servicios||[]).map(s=>({...s})));
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      const sem = new Date(); sem.setDate(sem.getDate()-7);
      const list = d.convs || [];
      setStats({
        hoy:    list.filter(c=>c.ultimoMensaje?._seconds?(c.ultimoMensaje._seconds*1000)>=hoy.getTime():false).length,
        semana: list.filter(c=>c.ultimoMensaje?._seconds?(c.ultimoMensaje._seconds*1000)>=sem.getTime():false).length,
        total:  list.length,
        tokensUsados: d.tokens?.usados||0,
      });
    } catch { setLoadError('No se pudo cargar el panel.'); }
  };

  const cargarCitas = async () => {
    try {
      const r = await fetch(`/api/wasapbot-panel?id=${id}&subcol=citas`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.ok && d.citas) setCitas([...d.citas].sort((a,b)=>(b.fechaHora?._seconds||0)-(a.fechaHora?._seconds||0)));
    } catch {}
  };

  const actualizarEstadoCita = async (citaId, nuevoEstado) => {
    setUpdatingCita(citaId);
    try {
      const r = await fetch('/api/wasapbot-panel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'actualizarCita',empresaId:id,citaId,estado:nuevoEstado})});
      const d = await r.json();
      if (d.ok) setCitas(prev=>prev.map(c=>c.id===citaId?{...c,estado:nuevoEstado}:c));
    } catch {}
    setUpdatingCita(null);
  };

  const verificarStatus = async () => {
    try {
      const r = await fetch(`${WA}/sesion/${id}/status`,{headers:{'x-server-secret':SECRET}});
      const d = await r.json();
      setStatus(d.status||'disconnected');
      pollRef.current = setInterval(async()=>{
        const r2 = await fetch(`${WA}/sesion/${id}/status`,{headers:{'x-server-secret':SECRET}}).catch(()=>null);
        const d2 = r2?await r2.json().catch(()=>({})):{};
        setStatus(d2.status||'disconnected');
      },30000);
    } catch { setStatus('disconnected'); }
  };

  const reconectar = async () => {
    setReconect(true); setQrBase64('');
    try {
      await fetch(`${WA}/sesion/iniciar`,{method:'POST',headers:{'Content-Type':'application/json','x-server-secret':SECRET},body:JSON.stringify({empresaId:id})});
      let n=0;
      const poll=async()=>{
        if(n++>20){setReconect(false);return;}
        const r=await fetch(`${WA}/sesion/${id}/qr`,{headers:{'x-server-secret':SECRET}}).catch(()=>null);
        const d=r?await r.json().catch(()=>({})):{};
        if(d.qrBase64){setQrBase64(d.qrBase64);setReconect(false);setTab('qr');return;}
        if(d.status==='connected'){setStatus('connected');setQrBase64('');setReconect(false);setTab('inicio');return;}
        setTimeout(poll,2000);
      };
      poll();
    } catch{setReconect(false);}
  };

  const guardarCatalogo = async () => {
    setSavingCat(true); setSaveMsg('');
    try {
      const r = await fetch('/api/wasapbot-servicios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,servicios:itemsEdit})});
      const d = await r.json();
      if(d.ok){
        setSaveMsg('✓ Guardado correctamente');
        setConocimiento(prev=>({...prev,servicios:itemsEdit}));
        setEditando(false);
        if(itemsEdit.some(it=>it.nombre?.trim())) marcarGuia('catalogo_items');
      } else setSaveMsg('Error: '+(d.error||''));
    } catch{setSaveMsg('Error de conexión');}
    setSavingCat(false);
    setTimeout(()=>setSaveMsg(''),3000);
  };

  const toDate = ts => {
    if(!ts)return null;
    if(ts._seconds)return new Date(ts._seconds*1000);
    if(ts.toDate)return ts.toDate();
    return null;
  };
  const fmtFecha = ts => {
    const d=toDate(ts);
    if(!d)return '—';
    return d.toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  };

  if(loadError)return(
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
      <div style={{fontFamily:F,fontSize:16,fontWeight:700,color:'#EF4444',marginBottom:8}}>No se pudo cargar el panel</div>
      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',textAlign:'center',maxWidth:380,marginBottom:24}}>{loadError}</div>
      <button onClick={()=>{setLoadError('');cargarDatos();}} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer'}}>Reintentar</button>
    </div>
  );

  if(!empresa) return(
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:'3px solid rgba(37,211,102,0.2)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Config dinámica por industria ──────────────────────────
  const cfg        = getConfigIndustria(empresa.industria || 'otro');
  const d          = cfg.dashboard;
  const plan       = PLANES[empresa.planWasapbot||empresa.plan]||PLANES.wasapbot;
  const pctTokens  = Math.min(Math.round((stats.tokensUsados/plan.tokens)*100),100);
  const pctConvs   = Math.min(Math.round((stats.total/plan.convs)*100),100);
  const connected  = status === 'connected';
  const servicios  = conocimiento?.servicios || [];
  const citasFiltradas = citasFiltro==='todos'?citas:citas.filter(c=>c.estado===citasFiltro);
  const citasHoy   = citas.filter(c=>{
    const dt=toDate(c.fechaHora||c.creadoEn);
    if(!dt)return false;
    const hoy=new Date();hoy.setHours(0,0,0,0);
    return dt>=hoy;
  }).length;

  const CARD = {background:'#0C0F14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:20};
  const INP  = {width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 11px',color:'#EFF4FF',fontFamily:F,fontSize:13,outline:'none',boxSizing:'border-box'};

  // Tabs dinámicos — solo mostrar los que aplican a la industria
  const TABS = [
    { key:'inicio',   label:'Inicio',              icon:'◉' },
    ...(d.tabCitas ? [{ key:'citas', label:d.tabCitas, icon:'📅', badge:citasHoy>0?citasHoy:null }] : []),
    { key:'convs',    label:'Conversaciones',       icon:'💬' },
    { key:'catalogo', label:d.tabCatalogo,          icon:'📋' },
    { key:'config',   label:'Configuración',        icon:'⚙️' },
  ];

  // Links del sidebar — solo inventario/pedidos si la industria lo tiene
  const LINKS = [
    ...(cfg.tieneInventario ? [{ href:`/wasapbot/panel/inventario/${id}`, label:'Inventario / Stock', icon:'📦', color:'#60A5FA', bg:'rgba(96,165,250,0.08)', border:'rgba(96,165,250,0.2)' }] : []),
    ...(cfg.tienePedidos    ? [{ href:`/wasapbot/panel/pedidos/${id}`,    label:'Pedidos del día',   icon:'🛒', color:'#25D366', bg:'rgba(37,211,102,0.06)', border:'rgba(37,211,102,0.15)' }] : []),
  ];

  return(
    <>
      <Head><title>{empresa.nombreEmpresa} — Panel WasapBot</title></Head>

      {/* Modal bienvenida dinámico */}
      {mostrarBienvenida && (
        <ModalBienvenidaWasapbot
          nombre={empresa.nombreEmpresa}
          cfg={cfg}
          onCerrar={() => setMostrarBienvenida(false)}
        />
      )}

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
        </div>
      </nav>

      <div style={{display:'flex',minHeight:'calc(100vh - 58px)'}}>

        {/* SIDEBAR */}
        <div style={{width:216,borderRight:'1px solid rgba(255,255,255,0.05)',padding:'16px 10px',flexShrink:0,display:'flex',flexDirection:'column',gap:2}}>
          {TABS.map(t=>(
            <button key={t.key} className={`wb-tab${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>
              <span style={{fontSize:14}}>{t.icon}</span>
              <span style={{flex:1}}>{t.label}</span>
              {t.badge&&<span style={{background:'#25D366',color:'#000',borderRadius:99,padding:'1px 7px',fontSize:10,fontWeight:800,minWidth:18,textAlign:'center'}}>{t.badge}</span>}
            </button>
          ))}

          {/* Links externos solo si la industria los tiene */}
          {LINKS.length > 0 && (
            <>
              <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'8px 4px'}}/>
              {LINKS.map(l=>(
                <Link key={l.href} href={l.href} className="ext-link"
                  style={{background:l.bg,border:`1px solid ${l.border}`,color:l.color}}>
                  <span style={{fontSize:14}}>{l.icon}</span>
                  <span style={{flex:1,fontSize:12}}>{l.label}</span>
                  <span style={{fontSize:10,opacity:0.6}}>↗</span>
                </Link>
              ))}
            </>
          )}

          <div style={{flex:1}}/>
          <div style={{padding:'12px',background:'rgba(37,211,102,0.04)',border:'1px solid rgba(37,211,102,0.12)',borderRadius:10,marginTop:8}}>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginBottom:4}}>Plan actual</div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:plan.color,marginBottom:2}}>{plan.nombre}</div>
            <div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginBottom:10}}>{plan.precio}/mes</div>
            <a href="https://wa.me/573105056616?text=Quiero mejorar mi plan WasapBot" target="_blank" rel="noreferrer"
              style={{display:'block',background:'#25D366',color:'#fff',borderRadius:8,padding:'7px',fontFamily:F,fontSize:11,fontWeight:700,textAlign:'center'}}>
              Mejorar plan
            </a>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{flex:1,padding:'28px 32px',overflowY:'auto'}}>

          {/* ══ INICIO ══ */}
          {tab==='inicio'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>{empresa.nombreEmpresa}</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24,fontWeight:300}}>
                Panel de control · {cfg.labelCatalogo} · {empresa.industria}
              </p>

              {!connected&&(
                <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EF4444',marginBottom:3}}>⚠️ Bot desconectado</div>
                    <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)'}}>
                      Tu WhatsApp no está conectado. Ve a <strong style={{color:'#EFF4FF'}}>Configuración</strong> para generar el QR y conectarlo.
                    </div>
                  </div>
                  <button onClick={()=>setTab('config')} style={{background:'#EF4444',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                    Conectar ahora →
                  </button>
                </div>
              )}

              {/* Accesos rápidos dinámicos — solo los de la industria */}
              {d.accesosRapidos.length > 0 && (
                <div style={{display:'grid',gridTemplateColumns:`repeat(${d.accesosRapidos.length},1fr)`,gap:12,marginBottom:20}}>
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
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                {[
                  {label:'Conversaciones hoy',val:stats.hoy,     color:'#25D366',icon:'💬'},
                  {label:'Esta semana',        val:stats.semana,  color:'#60A5FA',icon:'📊'},
                  {label:`${d.tabCitas||'Citas'} pendientes`, val:citas.filter(c=>c.estado==='pendiente').length, color:'#F59E0B',icon:'📅'},
                  {label:'Total conversaciones',val:stats.total,  color:'#EFF4FF',icon:'📈'},
                ].map((s,i)=>(
                  <div key={i} style={CARD}>
                    <div style={{fontFamily:F,fontSize:20,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#4B6080',marginBottom:4}}>{s.label}</div>
                    <div style={{fontFamily:FA,fontSize:32,fontWeight:400,color:s.color,letterSpacing:'-1px'}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Consumo del plan */}
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Consumo del plan</div>
                {[
                  {label:'Conversaciones',val:stats.total,max:plan.convs,pct:pctConvs},
                  {label:'Tokens IA',val:stats.tokensUsados,max:plan.tokens,pct:pctTokens,fmt:true},
                ].map((b,i)=>(
                  <div key={i} style={{marginBottom:i===0?14:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>{b.label}</span>
                      <span style={{fontFamily:F,fontSize:12,color:b.pct>80?'#EF4444':'#EFF4FF',fontWeight:600}}>
                        {b.fmt?b.val.toLocaleString():b.val} / {b.fmt?b.max.toLocaleString():b.max}
                      </span>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                      <div className="bar-fill" style={{width:`${b.pct}%`,background:b.pct>80?'#EF4444':b.pct>60?'#F59E0B':'#25D366'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ CITAS / TURNOS (dinámico) ══ */}
          {tab==='citas'&&d.tabCitas&&(
            <div>
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
                  <div style={{fontFamily:F,fontSize:15,fontWeight:600,color:'#EFF4FF',marginBottom:8}}>
                    Sin {d.tabCitas.toLowerCase()} aún
                  </div>
                  <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)'}}>
                    El bot las agendará automáticamente cuando los clientes lo soliciten por WhatsApp.
                  </div>
                </div>
              ):(
                <div>
                  {citasFiltradas.map((cita,i)=>{
                    const est=ESTADO_CITA[cita.estado]||ESTADO_CITA.pendiente;
                    const esPend=cita.estado==='pendiente', esConf=cita.estado==='confirmada';
                    const updating=updatingCita===cita.id;
                    return(
                      <div key={cita.id||i} className="cita-row">
                        <div style={{display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap'}}>
                          <div style={{width:52,height:58,borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:0.5}}>{cita.fecha?.split('/')[1]?(['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(cita.fecha.split('/')[1])]||''):''}</div>
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
            </div>
          )}

          {/* ══ CONVERSACIONES ══ */}
          {tab==='convs'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Conversaciones de WhatsApp</h2>
              <Guia
                visible={convs.length===0 && !guiasVistas['convs_vacio']}
                texto={d.guias.convs_vacio}
                icono="💬"
              />
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
                {convs.length===0&&(
                  <div style={{fontFamily:F,fontSize:13,color:'#4B6080',textAlign:'center',padding:'40px 0'}}>
                    Sin conversaciones aún. Conecta tu WhatsApp en Configuración.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ CATÁLOGO / MENÚ / SERVICIOS (dinámico) ══ */}
          {tab==='catalogo'&&(
            <div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
                <div>
                  <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:4}}>{d.tabCatalogo}</h2>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300,margin:0}}>
                    El bot usará esta información para responder a tus clientes.
                  </p>
                </div>
                {!editando?(
                  <button onClick={()=>{setItemsEdit(servicios.length>0?servicios.map(s=>({...s})):[{nombre:'',precio:'',descripcion:'',categoria:'',foto:''}]);setEditando(true);}} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.25)',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    {servicios.length>0?'✏️ Editar':'+ Agregar primer '+cfg.labelItem.toLowerCase()}
                  </button>
                ):(
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setEditando(false)} style={{background:'rgba(255,255,255,0.04)',color:'#6B7A99',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'9px 16px',fontFamily:F,fontSize:13,cursor:'pointer'}}>Cancelar</button>
                    <button onClick={guardarCatalogo} disabled={savingCat} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:savingCat?0.7:1}}>
                      {savingCat?'Guardando...':'Guardar cambios'}
                    </button>
                  </div>
                )}
              </div>

              {saveMsg&&<div style={{background:saveMsg.startsWith('✓')?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${saveMsg.startsWith('✓')?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:9,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:saveMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{saveMsg}</div>}

              {/* Guía catálogo vacío — texto específico de la industria */}
              <Guia
                visible={servicios.length===0 && !editando && !guiasVistas['catalogo_items']}
                texto={d.guias.catalogo_vacio}
                icono="📋"
              />

              {/* Vista items guardados */}
              {!editando&&servicios.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
                  {servicios.map((s,i)=>(
                    <div key={i} style={{...CARD,padding:0,overflow:'hidden'}}>
                      {s.foto&&<img src={s.foto} alt={s.nombre} style={{width:'100%',height:120,objectFit:'cover',display:'block'}}/>}
                      {!s.foto&&<div style={{width:'100%',height:50,background:'rgba(37,211,102,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📌</div>}
                      <div style={{padding:12}}>
                        {s.categoria&&<span style={{background:'rgba(255,255,255,0.05)',color:'#6B7A99',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,display:'inline-block',marginBottom:5}}>{s.categoria}</span>}
                        <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:3}}>{s.nombre||'Sin nombre'}</div>
                        {s.descripcion&&<div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6,lineHeight:1.4}}>{s.descripcion}</div>}
                        {s.precio&&<div style={{fontFamily:FA,fontSize:16,color:'#25D366'}}>${Number(String(s.precio).replace(/\D/g,'')).toLocaleString('es-CO')||s.precio}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario edición — guías por campo según industria */}
              {editando&&(
                <div>
                  <Guia
                    visible={!guiasVistas['catalogo_editando']}
                    texto={`Completa cada ${cfg.labelItem.toLowerCase()} con nombre, ${cfg.labelPrecio.toLowerCase()} y descripción. El bot usará esta información para responder preguntas de tus clientes.`}
                    icono="✏️"
                  />

                  {itemsEdit.map((item,idx)=>(
                    <div key={idx} style={{...CARD,marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#8A9BB5'}}>{cfg.labelItem} {idx+1}</span>
                        {itemsEdit.length>1&&<button onClick={()=>setItemsEdit(prev=>prev.filter((_,i)=>i!==idx))} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,padding:'3px 10px',fontFamily:F,fontSize:11,cursor:'pointer'}}>Eliminar</button>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelItem} *</label>
                          <input className={`cat-inp${!item.nombre?' guia-border':''}`}
                            style={{...INP,borderColor:!item.nombre?'rgba(37,211,102,0.3)':undefined}}
                            value={item.nombre||''}
                            placeholder={cfg.placeholders[`item${idx+1}`]||`Nombre del ${cfg.labelItem.toLowerCase()}`}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it));if(e.target.value)marcarGuia(`nombre_${idx}`);}}/>
                          <Guia
                            visible={!item.nombre && !guiasVistas[`nombre_${idx}`]}
                            texto={d.guias.catalogo_nombre}
                            icono="🏷️"
                          />
                        </div>
                        <div>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelPrecio}</label>
                          <input className={`cat-inp${!item.precio?' guia-border':''}`}
                            style={{...INP,borderColor:!item.precio?'rgba(37,211,102,0.25)':undefined}}
                            value={item.precio||''}
                            placeholder={cfg.placeholders[`precio${idx+1}`]||'0'}
                            onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,precio:e.target.value}:it));if(e.target.value)marcarGuia(`precio_${idx}`);}}/>
                          <Guia
                            visible={!item.precio && !guiasVistas[`precio_${idx}`]}
                            texto={d.guias.catalogo_precio}
                            icono="💰"
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>{cfg.labelDescripcion}</label>
                        <input className={`cat-inp${!item.descripcion?' guia-border':''}`}
                          style={{...INP,borderColor:!item.descripcion?'rgba(37,211,102,0.2)':undefined}}
                          value={item.descripcion||''}
                          placeholder={cfg.placeholders[`desc${idx+1}`]||'Descripción...'}
                          onChange={e=>{setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it));if(e.target.value)marcarGuia(`desc_${idx}`);}}/>
                        <Guia
                          visible={!item.descripcion && !guiasVistas[`desc_${idx}`]}
                          texto={d.guias.catalogo_desc}
                          icono="📝"
                        />
                      </div>
                      {cfg.tieneCategoria&&(
                        <div style={{marginTop:10}}>
                          <label style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8,color:'#4B6080',display:'block',marginBottom:4}}>Categoría</label>
                          <select className="cat-inp" style={{...INP,cursor:'pointer'}} value={item.categoria||''}
                            onChange={e=>setItemsEdit(prev=>prev.map((it,i)=>i===idx?{...it,categoria:e.target.value}:it))}>
                            <option value="">Sin categoría</option>
                            {cfg.categorias.map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>setItemsEdit(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:''}])}
                    style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:10,padding:'11px',fontFamily:F,fontSize:13,color:'#4B6080',cursor:'pointer',marginTop:4}}>
                    + Agregar {cfg.labelItem.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ QR ══ */}
          {tab==='qr'&&(
            <div style={{textAlign:'center',maxWidth:420,margin:'0 auto'}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:8}}>Conectar WhatsApp</h2>
              {qrBase64?(
                <div>
                  <div style={{background:'#fff',borderRadius:16,padding:20,display:'inline-block',marginBottom:20,boxShadow:'0 8px 40px rgba(0,0,0,0.4)'}}>
                    <img src={qrBase64} style={{width:200,height:200,display:'block'}} alt="QR"/>
                  </div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)'}}>Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea</p>
                </div>
              ):(
                <div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24}}>Genera un QR para conectar tu número de WhatsApp al bot.</p>
                  <button onClick={reconectar} disabled={reconect} style={{background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'14px 36px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer'}}>
                    {reconect?'Generando QR...':'Generar QR'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ CONFIGURACIÓN ══ */}
          {tab==='config'&&(
            <div style={{maxWidth:560}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Configuración</h2>

              <div style={{...CARD,marginBottom:14}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:8}}>Conexión WhatsApp</div>
                <Guia
                  visible={!connected && !guiasVistas['whatsapp_conectado']}
                  texto={d.guias.whatsapp}
                  icono="📱"
                />
                <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
                  <button onClick={()=>setTab('qr')} style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    {connected?'↻ Reconectar QR':'📱 Generar QR para conectar'}
                  </button>
                  {connected&&<button onClick={async()=>{await fetch(`${WA}/sesion/${id}/desconectar`,{method:'POST',headers:{'x-server-secret':SECRET}});setStatus('disconnected');}} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>Desconectar</button>}
                </div>
              </div>

              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>Tu negocio</div>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:2.2}}>
                  {[
                    ['Negocio',    empresa.nombreEmpresa],
                    ['Industria',  empresa.industria],
                    ['Tipo',       cfg.labelCatalogo],
                    ['Email',      empresa.email||'⚠️ Sin correo'],
                    ['Ciudad',     empresa.ciudad||'—'],
                    ['Plan',       `${plan.nombre} — ${plan.precio}/mes`],
                  ].map(([k,v])=>(
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
    </>
  );
}
