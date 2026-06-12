// pages/wasapbot/activar.js — v6 PREMIUM: estilo plataformas top SaaS
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { INDUSTRIAS_WB, getConfigIndustria } from '../../lib/wasapbotConfig';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const CLOUD = 'dsomqay6y';
const PRESET = 'cadegran_fotos';
const STEPS = [
  { n:1, label:'Tu negocio',      icon:'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM9 3h6a2 2 0 0 1 2 2v2H7V5a2 2 0 0 1 2-2z' },
  { n:2, label:'Tu catalogo',     icon:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
  { n:3, label:'WhatsApp',        icon:'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { n:4, label:'Listo',           icon:'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
];

// Cada industria: color, fondo, icono SVG path, descripcion corta
const IND = {
  restaurante: {
    color:'#F59E0B', bg:'rgba(245,158,11,0.1)', glow:'rgba(245,158,11,0.25)',
    desc:'Menú, pedidos y reservas',
    svg:'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  },
  taller: {
    color:'#EF4444', bg:'rgba(239,68,68,0.1)', glow:'rgba(239,68,68,0.25)',
    desc:'Servicios y reparaciones',
    svg:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  },
  peluqueria: {
    color:'#EC4899', bg:'rgba(236,72,153,0.1)', glow:'rgba(236,72,153,0.25)',
    desc:'Citas y servicios de belleza',
    svg:'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM20 4L8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  },
  barbero: {
    color:'#60A5FA', bg:'rgba(96,165,250,0.1)', glow:'rgba(96,165,250,0.25)',
    desc:'Turnos y servicios masculinos',
    svg:'M6.5 6.5c-1 1-1.5 2.2-1.5 3.5 0 2.8 2.2 5 5 5s5-2.2 5-5c0-1.3-.5-2.5-1.5-3.5M12 2v4M8 3l1 3M16 3l-1 3',
  },
  veterinaria: {
    color:'#34D399', bg:'rgba(52,211,153,0.1)', glow:'rgba(52,211,153,0.25)',
    desc:'Mascotas, citas y vacunas',
    svg:'M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z',
  },
  reposteria: {
    color:'#FB923C', bg:'rgba(251,146,60,0.1)', glow:'rgba(251,146,60,0.25)',
    desc:'Pedidos y delivery de postres',
    svg:'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1M2 21h20M12 11V4',
  },
  tienda: {
    color:'#A78BFA', bg:'rgba(167,139,250,0.1)', glow:'rgba(167,139,250,0.25)',
    desc:'Catalogo, precios y pedidos',
    svg:'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  },
  farmacia: {
    color:'#22D3EE', bg:'rgba(34,211,238,0.1)', glow:'rgba(34,211,238,0.25)',
    desc:'Productos, disponibilidad y domicilios',
    svg:'m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7zM8.5 8.5l7 7',
  },
  psicologo: {
    color:'#C084FC', bg:'rgba(192,132,252,0.1)', glow:'rgba(192,132,252,0.25)',
    desc:'Citas, consultas y seguimiento',
    svg:'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04z',
  },
  fotografia: {
    color:'#FBBF24', bg:'rgba(251,191,36,0.1)', glow:'rgba(251,191,36,0.25)',
    desc:'Sesiones, paquetes y portafolio',
    svg:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  contador: {
    color:'#38BDF8', bg:'rgba(56,189,248,0.1)', glow:'rgba(56,189,248,0.25)',
    desc:'Consultas, informes y servicios',
    svg:'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  acarreos: {
    color:'#94A3B8', bg:'rgba(148,163,184,0.1)', glow:'rgba(148,163,184,0.25)',
    desc:'Fletes, mudanzas y seguimiento',
    svg:'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3M9 11h14v10H9zM12 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  },
  gimnasio: {
    color:'#FB923C', bg:'rgba(251,146,60,0.1)', glow:'rgba(251,146,60,0.25)',
    desc:'Membresias, clases y rutinas',
    svg:'M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7',
  },
  salud: {
    color:'#F472B6', bg:'rgba(244,114,182,0.1)', glow:'rgba(244,114,182,0.25)',
    desc:'Citas, resultados y seguimiento',
    svg:'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  educacion: {
    color:'#818CF8', bg:'rgba(129,140,248,0.1)', glow:'rgba(129,140,248,0.25)',
    desc:'Clases, inscripciones y tareas',
    svg:'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',
  },
  tecnico: {
    color:'#6366F1', bg:'rgba(99,102,241,0.1)', glow:'rgba(99,102,241,0.25)',
    desc:'Soporte, tickets y reparaciones',
    svg:'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  },
  inmobiliaria: {
    color:'#60A5FA', bg:'rgba(96,165,250,0.1)', glow:'rgba(96,165,250,0.25)',
    desc:'Propiedades, visitas y contratos',
    svg:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  },
  otro: {
    color:'#94A3B8', bg:'rgba(148,163,184,0.1)', glow:'rgba(148,163,184,0.25)',
    desc:'Cualquier tipo de negocio',
    svg:'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 8v4M12 16h.01',
  },
};

function IcoSvg({ path, size=24, color='currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {path.split('M').filter(Boolean).map((p,i)=>(
        <path key={i} d={'M'+p} />
      ))}
    </svg>
  );
}

export default function WasapBotActivar() {
  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [empresaId,  setEmpresaId]  = useState('');
  const [qrBase64,   setQrBase64]   = useState('');
  const [numero,     setNumero]     = useState('');
  const [nombre,     setNombre]     = useState('');
  const [industria,  setIndustria]  = useState('');
  const [descripcion,setDescripcion]= useState('');
  const [email,      setEmail]      = useState('');
  const [horario,    setHorario]    = useState('');
  const [ciudad,     setCiudad]     = useState('');
  const [items, setItems] = useState([
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
  ]);
  const [preguntas, setPreguntas] = useState(['','','']);
  const fileRefs = useRef([]);

  const cfg = industria ? getConfigIndustria(industria) : null;
  const ph  = cfg?.placeholders || {};
  const indCfg = IND[industria] || null;

  const INP = {
    width:'100%', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:12,
    padding:'14px 16px', color:'#F0F4FF', fontFamily:F, fontSize:14,
    outline:'none', boxSizing:'border-box', transition:'all 0.2s',
  };
  const LBL = {
    fontFamily:F, fontSize:11, fontWeight:700, textTransform:'uppercase',
    letterSpacing:1.2, color:'rgba(255,255,255,0.28)', display:'block', marginBottom:8,
  };
  const CARD = {
    background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:20, padding:'28px', marginBottom:16,
  };

  const subirFoto = async (file, idx) => {
    setItems(prev => prev.map((it,i) => i===idx ? {...it,subiendo:true} : it));
    try {
      const fd = new FormData();
      fd.append('file',file); fd.append('upload_preset',PRESET); fd.append('folder','wasapbot/catalogo');
      const r = await fetch('https://api.cloudinary.com/v1_1/'+CLOUD+'/image/upload',{method:'POST',body:fd});
      const d = await r.json();
      setItems(prev => prev.map((it,i) => i===idx ? {...it,foto:d.secure_url,subiendo:false} : it));
    } catch { setItems(prev => prev.map((it,i) => i===idx ? {...it,subiendo:false} : it)); }
  };

  const crearEmpresa = async () => {
    if (!nombre.trim()) { setError('Escribe el nombre de tu negocio'); return; }
    if (!industria)     { setError('Selecciona el tipo de negocio'); return; }
    if (!email.trim())  { setError('Escribe tu correo electronico'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/wasapbot-crear',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nombre,industria,descripcion,email,horario,ciudad,producto:'wasapbot'})});
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setEmpresaId(d.empresaId); setStep(2);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const guardarCatalogo = async () => {
    setLoading(true);
    try {
      const iv = items.filter(it=>it.nombre.trim());
      const pf = preguntas.filter(p=>p.trim()).map(p=>({pregunta:p,respuesta:''}));
      await fetch('/api/wasapbot-servicios',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({empresaId,servicios:iv,horario,preguntas:pf,
          tipoCatalogo:cfg?.tipoCatalogo||'servicios',permitePedidos:cfg?.permitePedidos||false})});
      setStep(3); iniciarBot();
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const iniciarBot = async () => {
    setLoading(true);
    const WA='https://agenciame-whatsapp-server-production.up.railway.app';
    try {
      await fetch(WA+'/sesion/iniciar',{method:'POST',
        headers:{'Content-Type':'application/json','x-server-secret':'agenciame2026secreto_nexoia'},
        body:JSON.stringify({empresaId})});
      let n=0;
      const poll=async()=>{
        if(n++>30){setError('Tiempo agotado.');setLoading(false);return;}
        const r2=await fetch(WA+'/sesion/'+empresaId+'/qr',{headers:{'x-server-secret':'agenciame2026secreto_nexoia'}}).catch(()=>null);
        const d2=r2?await r2.json().catch(()=>({})):{};
        if(d2.status==='connected'){setNumero(d2.numero||'');setStep(4);setLoading(false);return;}
        if(d2.qrBase64){setQrBase64(d2.qrBase64);setLoading(false);pollStatus();return;}
        setTimeout(poll,2000);
      };
      poll();
    } catch(e){setError(e.message);setLoading(false);}
  };

  const pollStatus=()=>{
    const WA='https://agenciame-whatsapp-server-production.up.railway.app';
    let n=0;
    const check=async()=>{
      if(n++>60)return;
      const r=await fetch(WA+'/sesion/'+empresaId+'/status',{headers:{'x-server-secret':'agenciame2026secreto_nexoia'}}).catch(()=>null);
      const d=r?await r.json().catch(()=>({})):{};
      if(d.status==='connected'){setNumero(d.numero||'');setStep(4);return;}
      setTimeout(check,3000);
    };
    check();
  };

  return (
    <>
      <Head>
        <title>Activar WasapBot - agencIAme</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06080D;color:#EFF4FF;font-family:${F};overflow-x:hidden;min-height:100vh}
        a{text-decoration:none;color:inherit}
        .wi:focus{border-color:rgba(37,211,102,0.5)!important;background:rgba(37,211,102,0.05)!important;box-shadow:0 0 0 3px rgba(37,211,102,0.08)!important}
        .wi::placeholder{color:rgba(255,255,255,0.2)}
        .ind-btn{background:rgba(255,255,255,0.025);border:1.5px solid rgba(255,255,255,0.07);border-radius:18px;padding:0;cursor:pointer;outline:none;text-align:left;transition:all 0.2s cubic-bezier(.4,0,.2,1);overflow:hidden;position:relative}
        .ind-btn:hover{border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);transform:translateY(-1px)}
        .bmain{width:100%;border:none;border-radius:14px;padding:16px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#25D366,#1aad4e);color:#fff;box-shadow:0 4px 24px rgba(37,211,102,0.3);transition:all .2s}
        .bmain:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 36px rgba(37,211,102,0.42)}
        .bmain:disabled{opacity:0.45;cursor:not-allowed;transform:none}
        .bgh{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px;font-family:${F};font-size:13px;font-weight:500;cursor:pointer;transition:all .15s}
        .bgh:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7)}
        .bda{width:100%;background:none;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:12px;font-family:${F};font-size:13px;color:rgba(255,255,255,0.3);cursor:pointer;transition:all .15s}
        .bda:hover{border-color:rgba(37,211,102,0.4);color:rgba(37,211,102,0.8)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ok{from{opacity:0;transform:scale(0.2) rotate(-15deg)}to{opacity:1;transform:scale(1) rotate(0)}}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .aup{animation:up 0.35s cubic-bezier(.4,0,.2,1) both}
        select.wi option{background:#0E1118}
        .prog-line{height:2px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden}
        .prog-fill{height:100%;background:linear-gradient(90deg,#25D366,#B8FF6C);border-radius:99px;transition:width 0.5s ease}
      `}}/>

      {/* ── NAV ── */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,8,13,0.96)',backdropFilter:'blur(28px)',borderBottom:'1px solid rgba(255,255,255,0.055)',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/wasapbot">
          <span style={{fontFamily:FA,fontSize:18,cursor:'pointer',letterSpacing:'-0.5px'}}>
            agenc<span style={{color:'#FF6B00'}}>IA</span>me
            <span style={{color:'#25D366',fontSize:12,fontFamily:F,fontWeight:700,marginLeft:8,background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.2)',padding:'2px 8px',borderRadius:99}}>WasapBot</span>
          </span>
        </Link>
        <Link href="/wasapbot" style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.25)',display:'flex',alignItems:'center',gap:6,transition:'color .15s'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver
        </Link>
      </nav>

      {/* ── PROGRESO ── */}
      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 32px'}}>
        <div style={{maxWidth:700,margin:'0 auto',display:'flex',alignItems:'center',gap:0,padding:'18px 0 14px'}}>
          {STEPS.map((s,i)=>{
            const done=step>s.n, cur=step===s.n;
            return(
              <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,opacity:done||cur?1:0.35,transition:'opacity .3s'}}>
                  <div style={{width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:done?'#25D366':cur?'rgba(37,211,102,0.12)':'rgba(255,255,255,0.04)',border:'1px solid '+(done?'#25D366':cur?'rgba(37,211,102,0.4)':'rgba(255,255,255,0.08)'),transition:'all .3s',color:done?'#fff':cur?'#25D366':'rgba(255,255,255,0.3)'}}>
                    {done
                      ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      :<span style={{fontFamily:F,fontSize:12,fontWeight:700}}>{s.n}</span>}
                  </div>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:cur?600:400,color:cur?'#EFF4FF':'rgba(255,255,255,0.35)',whiteSpace:'nowrap',display:cur?'block':'none'}}>{s.label}</span>
                </div>
                {i<STEPS.length-1&&(
                  <div style={{flex:1,margin:'0 8px'}}>
                    <div className="prog-line"><div className="prog-fill" style={{width:step>s.n?'100%':'0%'}}/></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:700,margin:'0 auto',padding:'48px 20px 100px'}}>

        {error&&(
          <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:14,padding:'14px 18px',marginBottom:20,fontFamily:F,fontSize:13,color:'#F87171',display:'flex',alignItems:'center',gap:10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#F87171"/></svg>
            {error}
          </div>
        )}

        {/* ════════ PASO 1 ════════ */}
        {step===1&&(
          <div className="aup">
            {/* Hero */}
            <div style={{marginBottom:44}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.18)',borderRadius:99,padding:'5px 14px 5px 10px',marginBottom:20}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#25D366'}}/>
                <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:'#6EF0A0'}}>Paso 1 de 4</span>
              </div>
              <h1 style={{fontFamily:FA,fontSize:52,fontWeight:400,letterSpacing:'-2.5px',color:'#F5F5F5',marginBottom:10,lineHeight:1.0}}>
                Cuéntanos sobre<br/>tu negocio
              </h1>
              <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.32)',fontWeight:300,lineHeight:1.7,maxWidth:500}}>
                Tu bot se configurará automaticamente con la personalidad y el vocabulario de tu industria.
              </p>
            </div>

            {/* Nombre */}
            <div style={CARD}>
              <label style={LBL}>Nombre del negocio *</label>
              <input className="wi" style={INP} value={nombre} onChange={e=>setNombre(e.target.value)}
                placeholder={ph.nombre||'Ej: Restaurante El Buen Sabor'} />
            </div>

            {/* Selector de industria — 2 columnas, tarjetas grandes */}
            <div style={CARD}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:20}}>
                <label style={LBL}>Tipo de negocio *</label>
                {industria&&<span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.25)',cursor:'pointer'}} onClick={()=>setIndustria('')}>Cambiar ✕</span>}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {INDUSTRIAS_WB.map(ind=>{
                  const c = IND[ind.value] || IND.otro;
                  const sel = industria===ind.value;
                  return(
                    <button key={ind.value} className="ind-btn" onClick={()=>setIndustria(ind.value)}
                      style={{
                        background: sel ? c.bg : 'rgba(255,255,255,0.025)',
                        border: '1.5px solid '+(sel ? c.color.replace(')',',0.4)').replace('rgb','rgba') : 'rgba(255,255,255,0.07)'),
                        boxShadow: sel ? '0 8px 32px '+c.glow : 'none',
                        transform: sel ? 'translateY(-2px)' : '',
                      }}>
                      <div style={{padding:'18px 18px 16px',display:'flex',flexDirection:'column',gap:14}}>
                        {/* Top: icono + check */}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div style={{width:48,height:48,borderRadius:14,background:sel?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',boxShadow:sel?'inset 0 1px 0 rgba(255,255,255,0.1)':'none'}}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                              stroke={sel?c.color:'rgba(255,255,255,0.5)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              {c.svg.split('M').filter(Boolean).map((p,i)=><path key={i} d={'M'+p}/>)}
                            </svg>
                          </div>
                          {/* Check */}
                          <div style={{width:20,height:20,borderRadius:6,border:'1.5px solid '+(sel?c.color:'rgba(255,255,255,0.1)'),background:sel?c.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',flexShrink:0}}>
                            {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        </div>
                        {/* Texto */}
                        <div>
                          <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:sel?'#F0F4FF':'rgba(255,255,255,0.7)',marginBottom:3,transition:'color .2s'}}>{ind.label}</div>
                          <div style={{fontFamily:F,fontSize:11,color:sel?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.25)',fontWeight:300,lineHeight:1.4}}>{c.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descripcion + Ciudad + Horario */}
            <div style={CARD}>
              <label style={LBL}>Descripcion del negocio</label>
              <textarea className="wi" style={{...INP,resize:'vertical',minHeight:92,lineHeight:1.7}} value={descripcion}
                onChange={e=>setDescripcion(e.target.value)}
                placeholder={ph.descripcion||'Cuenta brevemente qué ofreces, tu estilo y tus valores...'} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:16}}>
                <div>
                  <label style={LBL}>Ciudad</label>
                  <input className="wi" style={INP} value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Cali, Bogota, Medellin..." />
                </div>
                <div>
                  <label style={LBL}>Horario de atencion</label>
                  <input className="wi" style={INP} value={horario} onChange={e=>setHorario(e.target.value)} placeholder={ph.horario||'Lun-Vie 8am-6pm'} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={CARD}>
              <label style={LBL}>Correo electronico *</label>
              <input className="wi" style={INP} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@gmail.com" />
              <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.18)',margin:'10px 0 0',fontWeight:300}}>
                Aqui recibiras resumenes diarios y alertas cuando un cliente pida hablar con una persona.
              </p>
            </div>

            <button className="bmain" onClick={crearEmpresa} disabled={loading}>
              {loading
                ?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                    <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>
                    Creando tu agente...
                  </span>
                :<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    Continuar
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                  </span>}
            </button>
          </div>
        )}

        {/* ════════ PASO 2 ════════ */}
        {step===2&&cfg&&(
          <div className="aup">
            <div style={{marginBottom:40}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.18)',borderRadius:99,padding:'5px 14px 5px 10px',marginBottom:20}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#25D366'}}/>
                <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:'#6EF0A0'}}>Paso 2 de 4</span>
              </div>
              <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:10,lineHeight:1.0}}>{cfg.labelCatalogo}</h1>
              <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.32)',fontWeight:300,lineHeight:1.7,maxWidth:500}}>
                Agrega tus {cfg.labelCatalogo.toLowerCase()}. El bot los presentara automaticamente cuando un cliente pregunte.
                {cfg.permitePedidos&&<span style={{color:'#6EF0A0',fontWeight:500}}> Podran hacer pedidos directamente por WhatsApp.</span>}
              </p>
            </div>

            {items.map((item,idx)=>(
              <div key={idx} style={CARD}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                  <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1.2}}>{cfg.labelItem} {idx+1}</span>
                  {items.length>1&&<button onClick={()=>setItems(prev=>prev.filter((_,i)=>i!==idx))}
                    style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:8,color:'rgba(239,68,68,0.6)',cursor:'pointer',fontSize:11,padding:'4px 10px',fontFamily:F,fontWeight:600,transition:'all .15s'}}>Eliminar</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:cfg.tieneFoto?'1fr auto':'1fr',gap:16,marginBottom:14,alignItems:'end'}}>
                  <div>
                    <label style={LBL}>{cfg.labelItem} *</label>
                    <input className="wi" style={INP} value={item.nombre}
                      onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it))}
                      placeholder={ph['item'+(idx+1)]||'Nombre del '+cfg.labelItem.toLowerCase()} />
                  </div>
                  {cfg.tieneFoto&&(
                    <div>
                      <label style={LBL}>Foto</label>
                      <input ref={el=>fileRefs.current[idx]=el} type="file" accept="image/*" style={{display:'none'}}
                        onChange={e=>{const f=e.target.files[0];if(f) subirFoto(f,idx);}} />
                      {item.foto?(
                        <div style={{position:'relative',width:60,height:60}}>
                          <img src={item.foto} style={{width:60,height:60,objectFit:'cover',borderRadius:12,border:'1px solid rgba(255,255,255,0.1)'}}/>
                          <button onClick={()=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,foto:''}:it))}
                            style={{position:'absolute',top:-7,right:-7,background:'#EF4444',border:'2px solid #06080D',borderRadius:'50%',width:20,height:20,color:'#fff',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✕</button>
                        </div>
                      ):(
                        <div onClick={()=>fileRefs.current[idx]?.click()} style={{width:60,height:60,border:'1.5px dashed rgba(255,255,255,0.12)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,0.2)',fontSize:22,transition:'all .15s',gap:2}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(37,211,102,0.45)';e.currentTarget.style.color='rgba(37,211,102,0.6)'}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';e.currentTarget.style.color='rgba(255,255,255,0.2)'}}>
                          {item.subiendo
                            ?<div style={{width:18,height:18,border:'2px solid rgba(37,211,102,0.2)',borderTop:'2px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                            :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                  <div>
                    <label style={LBL}>{cfg.labelPrecio}</label>
                    <input className="wi" style={INP} value={item.precio}
                      onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,precio:e.target.value}:it))}
                      placeholder={ph['precio'+(idx+1)]||'0'} />
                  </div>
                  {cfg.tieneCategoria&&(
                    <div>
                      <label style={LBL}>Categoria</label>
                      <select className="wi" style={{...INP,cursor:'pointer'}} value={item.categoria}
                        onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,categoria:e.target.value}:it))}>
                        <option value="">Seleccionar...</option>
                        {cfg.categorias.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label style={LBL}>{cfg.labelDescripcion}</label>
                  <input className="wi" style={INP} value={item.descripcion}
                    onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it))}
                    placeholder={ph['desc'+(idx+1)]||'Descripcion breve...'} />
                </div>
              </div>
            ))}

            <button className="bda" style={{marginBottom:20}}
              onClick={()=>setItems(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false}])}>
              + Agregar {cfg.labelItem.toLowerCase()}
            </button>

            <div style={CARD}>
              <label style={LBL}>Preguntas frecuentes</label>
              <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.22)',margin:'0 0 16px',fontWeight:300,lineHeight:1.6}}>El bot respondera estas preguntas automaticamente sin que tengas que estar pendiente</p>
              {preguntas.map((p,i)=>(
                <input key={i} className="wi" style={{...INP,marginBottom:10}} value={p}
                  onChange={e=>setPreguntas(prev=>prev.map((x,j)=>j===i?e.target.value:x))}
                  placeholder={ph['pregunta'+(i+1)]||'Ej: Cuanto tiempo demora el servicio?'} />
              ))}
            </div>

            <div style={{display:'flex',gap:12}}>
              <button className="bgh" style={{flex:'0 0 auto',minWidth:120}} onClick={()=>setStep(1)}>← Atras</button>
              <button className="bmain" style={{flex:1}} onClick={guardarCatalogo} disabled={loading}>
                {loading
                  ?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                      <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>
                      Guardando...
                    </span>
                  :<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                      Conectar WhatsApp
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                    </span>}
              </button>
            </div>
          </div>
        )}

        {/* ════════ PASO 3: QR ════════ */}
        {step===3&&(
          <div className="aup" style={{textAlign:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.18)',borderRadius:99,padding:'5px 14px 5px 10px',marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#25D366'}}/>
              <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:'#6EF0A0'}}>Paso 3 de 4</span>
            </div>
            <h1 style={{fontFamily:FA,fontSize:44,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:12,lineHeight:1.0}}>Conecta tu WhatsApp</h1>
            <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.3)',fontWeight:300,marginBottom:44,lineHeight:1.7,maxWidth:440,margin:'0 auto 44px'}}>
              Escanea el codigo QR con tu celular. Solo toma 10 segundos y tu bot queda activo al instante.
            </p>
            {loading&&!qrBase64&&(
              <div style={{padding:'72px 0'}}>
                <div style={{width:52,height:52,border:'3px solid rgba(37,211,102,0.12)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.9s linear infinite',margin:'0 auto 22px'}}/>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.2)'}}>Iniciando tu bot...</div>
              </div>
            )}
            {qrBase64&&(
              <div>
                <div style={{background:'white',borderRadius:24,padding:24,display:'inline-block',marginBottom:36,boxShadow:'0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'}}>
                  <img src={qrBase64} alt="QR" style={{width:240,height:240,display:'block'}}/>
                </div>
                <div style={{...CARD,textAlign:'left',maxWidth:460,margin:'0 auto 28px'}}>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:16,textTransform:'uppercase',letterSpacing:1.2}}>Como escanear</div>
                  {['Abre WhatsApp en tu celular','Ve a Ajustes y Dispositivos vinculados','Toca Vincular un dispositivo','Apunta la camara al codigo QR'].map((t,i)=>(
                    <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:12}}>
                      <div style={{width:24,height:24,borderRadius:8,background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366',flexShrink:0,marginTop:1}}>{i+1}</div>
                      <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.6}}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:10,background:'rgba(245,158,11,0.07)',border:'1px solid rgba(245,158,11,0.18)',borderRadius:99,padding:'8px 16px'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#F59E0B',boxShadow:'0 0 10px rgba(245,158,11,0.6)'}}/>
                  <span style={{fontFamily:F,fontSize:12,color:'rgba(245,158,11,0.85)',fontWeight:500}}>Esperando que escanees el codigo...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ PASO 4: LISTO ════════ */}
        {step===4&&(
          <div className="aup" style={{textAlign:'center'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'rgba(37,211,102,0.08)',border:'2px solid rgba(37,211,102,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 32px',animation:'ok 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both',boxShadow:'0 0 60px rgba(37,211,102,0.15)'}}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:54,fontWeight:400,letterSpacing:'-2.5px',color:'#25D366',marginBottom:8,lineHeight:1}}>Bot activado</h1>
            {numero&&<div style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.28)',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +{numero}
            </div>}
            <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.35)',lineHeight:1.8,fontWeight:300,maxWidth:420,margin:'0 auto 40px'}}>
              Tu WhatsApp ya responde automaticamente. Prueba enviando un mensaje y ve como responde tu bot.
            </p>
            <div style={{...CARD,textAlign:'left',maxWidth:500,margin:'0 auto 32px'}}>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',marginBottom:18,textTransform:'uppercase',letterSpacing:1.2}}>Tu bot ya puede hacer esto</div>
              {[
                ['Responder preguntas sobre tu negocio 24/7','#25D366'],
                ['Presentar tu catalogo con precios y fotos','#25D366'],
                ['Agendar citas y reservas automaticamente','#25D366'],
                ['Capturar datos del cliente (nombre, tel, correo)','#25D366'],
                ['Avisarte cuando un cliente necesita hablar contigo','#25D366'],
              ].map(([t,col],i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<4?13:0}}>
                  <div style={{width:22,height:22,borderRadius:7,background:'rgba(37,211,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.5}}>{t}</span>
                </div>
              ))}
            </div>
            <a href={'/wasapbot/panel/'+empresaId} style={{display:'flex',maxWidth:500,margin:'0 auto 10px',background:'linear-gradient(135deg,#25D366,#1aad4e)',color:'#fff',borderRadius:16,padding:'17px 24px',fontFamily:F,fontSize:15,fontWeight:700,textAlign:'center',boxShadow:'0 8px 32px rgba(37,211,102,0.35)',alignItems:'center',justifyContent:'center',gap:8}}>
              Ir a mi panel
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <Link href="/wasapbot" style={{display:'block',maxWidth:500,margin:'0 auto',background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'14px',fontFamily:F,fontSize:13,textAlign:'center'}}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
