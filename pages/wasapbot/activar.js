// pages/wasapbot/activar.js — v10: paso 3 con QR + codigo por numero
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { INDUSTRIAS_WB, getConfigIndustria } from '../../lib/wasapbotConfig';
import { auth } from '../../lib/firebase';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const CLOUD  = 'dsomqay6y';
const PRESET = 'cadegran_fotos';
const STEPS  = ['Tu negocio','Catalogo','WhatsApp','Listo'];
const CATS   = ['Todos','Gastronomia','Belleza','Salud','Comercio','Logistica',
                'Tecnologia','Educacion','Finanzas','Deporte','Bienestar',
                'Creativo','Automotriz','Mascotas','Inmuebles','Otro'];
const WA_SERVER = 'https://agenciame-whatsapp-server-production.up.railway.app';
const WA_SECRET = 'agenciame2026secreto_nexoia';

const IND = {
  restaurante:  { color:'#F59E0B', r:'245,158,11',  cat:'Gastronomia', desc:'Menu digital, pedidos y reservas automaticas' },
  taller:       { color:'#EF4444', r:'239,68,68',   cat:'Automotriz',  desc:'Presupuestos, citas y seguimiento de servicios' },
  peluqueria:   { color:'#EC4899', r:'236,72,153',  cat:'Belleza',     desc:'Reservas de citas, recordatorios y promos' },
  barbero:      { color:'#60A5FA', r:'96,165,250',  cat:'Belleza',     desc:'Turnos express, confirmaciones y recordatorios' },
  veterinaria:  { color:'#34D399', r:'52,211,153',  cat:'Mascotas',    desc:'Citas, vacunas, recordatorios y seguimiento' },
  reposteria:   { color:'#FB923C', r:'251,146,60',  cat:'Gastronomia', desc:'Pedidos personalizados, precios y delivery' },
  tienda:       { color:'#A78BFA', r:'167,139,250', cat:'Comercio',    desc:'Catalogo, precios, stock y pedidos por chat' },
  farmacia:     { color:'#22D3EE', r:'34,211,238',  cat:'Salud',       desc:'Disponibilidad, precios y domicilios' },
  psicologo:    { color:'#C084FC', r:'192,132,252', cat:'Bienestar',   desc:'Consultas, citas y seguimiento continuo' },
  fotografia:   { color:'#FBBF24', r:'251,191,36',  cat:'Creativo',    desc:'Sesiones, paquetes, portafolio y cotizaciones' },
  contador:     { color:'#38BDF8', r:'56,189,248',  cat:'Finanzas',    desc:'Consultas, documentos y servicios contables' },
  acarreos:     { color:'#94A3B8', r:'148,163,184', cat:'Logistica',   desc:'Fletes, mudanzas, rutas y seguimiento en vivo' },
  gimnasio:     { color:'#FB923C', r:'251,146,60',  cat:'Deporte',     desc:'Membresias, clases, rutinas y seguimiento' },
  salud:        { color:'#F472B6', r:'244,114,182', cat:'Salud',       desc:'Citas medicas, examenes y seguimiento' },
  educacion:    { color:'#818CF8', r:'129,140,248', cat:'Educacion',   desc:'Inscripciones, clases, tareas y recordatorios' },
  tecnico:      { color:'#6366F1', r:'99,102,241',  cat:'Tecnologia',  desc:'Soporte tecnico, tickets y reparaciones' },
  inmobiliaria: { color:'#60A5FA', r:'96,165,250',  cat:'Inmuebles',   desc:'Propiedades, visitas, arriendos y contratos' },
  otro:         { color:'#94A3B8', r:'148,163,184', cat:'Otro',        desc:'Cualquier tipo de negocio o servicio' },
};

function IndIcon({ id, color, size = 22 }) {
  const p = { fill:'none', stroke:color, strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
  const w = size, h = size;
  const icons = {
    restaurante:  <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/><line x1="21" y1="15" x2="21" y2="22"/></svg>,
    taller:       <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    peluqueria:   <svg width={w} height={h} viewBox="0 0 24 24" {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    barbero:      <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>,
    veterinaria:  <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/></svg>,
    reposteria:   <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="7" y1="11" x2="7" y2="6"/><line x1="12" y1="11" x2="12" y2="4"/><line x1="17" y1="11" x2="17" y2="6"/></svg>,
    tienda:       <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><line x1="2" y1="7" x2="22" y2="7"/></svg>,
    farmacia:     <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>,
    psicologo:    <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"/></svg>,
    fotografia:   <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/></svg>,
    contador:     <svg width={w} height={h} viewBox="0 0 24 24" {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    acarreos:     <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>,
    gimnasio:     <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>,
    salud:        <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    educacion:    <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    tecnico:      <svg width={w} height={h} viewBox="0 0 24 24" {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    inmobiliaria: <svg width={w} height={h} viewBox="0 0 24 24" {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    otro:         <svg width={w} height={h} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill={color}/></svg>,
  };
  return icons[id] || icons.otro;
}

export default function WasapBotActivar() {
  const [step, setStep]              = useState(1);
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState('');
  const [empresaId, setEmpresaId]    = useState('');
  const [qrBase64, setQrBase64]      = useState('');
  const [numero, setNumero]          = useState('');
  const [nombre, setNombre]          = useState('');
  const [industria, setIndustria]    = useState('');
  const [descripcion,setDescripcion] = useState('');
  const [email, setEmail]            = useState('');
  const [horario, setHorario]        = useState('');
  const [ciudad, setCiudad]          = useState('');
  const [busq, setBusq]              = useState('');
  const [catFiltro, setCatFiltro]    = useState('Todos');
  const [items, setItems]            = useState([
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
    {nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false},
  ]);
  const [preguntas, setPreguntas]    = useState(['','','']);
  const fileRefs                     = useRef([]);

  // Estado exclusivo del paso 3
  const [metodoConexion, setMetodoConexion] = useState(''); // '' | 'qr' | 'codigo'
  const [telefonoCodigo, setTelefonoCodigo] = useState('');
  const [codigoBot, setCodigoBot]           = useState('');
  const [solicitandoCodigo, setSolicitandoCodigo] = useState(false);

  const cfg    = industria ? getConfigIndustria(industria) : null;
  const ph     = cfg?.placeholders || {};
  const indCfg = IND[industria];

  const indsFiltradas = INDUSTRIAS_WB.filter(ind => {
    const c = IND[ind.value];
    const okCat  = catFiltro === 'Todos' || c?.cat === catFiltro;
    const okBusq = !busq.trim() ||
      ind.label.toLowerCase().includes(busq.toLowerCase()) ||
      c?.desc.toLowerCase().includes(busq.toLowerCase());
    return okCat && okBusq;
  });

  const INP = {
    width:'100%', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.09)', borderRadius:12,
    padding:'14px 18px', color:'#F0F4FF', fontFamily:F, fontSize:14,
    outline:'none', boxSizing:'border-box', transition:'all .22s',
  };
  const LBL = {
    fontFamily:F, fontSize:11, fontWeight:700, textTransform:'uppercase',
    letterSpacing:1.2, color:'rgba(255,255,255,0.3)', display:'block', marginBottom:9,
  };
  const CARD = {
    background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.075)',
    borderRadius:20, padding:'26px', marginBottom:14,
  };

  const subirFoto = async (file, idx) => {
    setItems(p=>p.map((it,i)=>i===idx?{...it,subiendo:true}:it));
    try {
      const fd = new FormData();
      fd.append('file',file); fd.append('upload_preset',PRESET); fd.append('folder','wasapbot/catalogo');
      const r = await fetch('https://api.cloudinary.com/v1_1/'+CLOUD+'/image/upload',{method:'POST',body:fd});
      const d = await r.json();
      setItems(p=>p.map((it,i)=>i===idx?{...it,foto:d.secure_url,subiendo:false}:it));
    } catch { setItems(p=>p.map((it,i)=>i===idx?{...it,subiendo:false}:it)); }
  };

  const crearEmpresa = async () => {
    if (!nombre.trim()) { setError('Escribe el nombre de tu negocio'); return; }
    if (!industria)     { setError('Selecciona el tipo de negocio'); return; }
    if (!email.trim())  { setError('Escribe tu correo electronico'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/wasapbot-crear',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nombre,industria,descripcion,email,horario,ciudad,producto:'wasapbot',ownerUid:auth.currentUser?.uid||null})});
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setEmpresaId(d.empresaId);
      // Marcar como nuevo usuario para mostrar bienvenida en el panel
      if (typeof window !== 'undefined') {
        localStorage.setItem('wasapbot_nuevo_' + d.empresaId, '1');
      }
      // Ir directo al panel — la configuración se hace desde ahí
      window.location.href = '/wasapbot/panel/' + d.empresaId;
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
      setStep(3);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ── Método QR (flujo original) ──
  const iniciarConQR = async () => {
    setMetodoConexion('qr'); setLoading(true);
    try {
      await fetch(WA_SERVER+'/sesion/iniciar',{method:'POST',
        headers:{'Content-Type':'application/json','x-server-secret':WA_SECRET},
        body:JSON.stringify({empresaId})});
      let n = 0;
      const poll = async () => {
        if (n++>30) { setError('Tiempo agotado. Intenta de nuevo.'); setLoading(false); return; }
        const r2 = await fetch(WA_SERVER+'/sesion/'+empresaId+'/qr',{headers:{'x-server-secret':WA_SECRET}}).catch(()=>null);
        const d2 = r2 ? await r2.json().catch(()=>({})) : {};
        if (d2.status==='connected') { setNumero(d2.numero||''); setStep(4); setLoading(false); return; }
        if (d2.qrBase64) { setQrBase64(d2.qrBase64); setLoading(false); pollStatus(); return; }
        setTimeout(poll, 2000);
      };
      poll();
    } catch(e) { setError(e.message); setLoading(false); }
  };

  // ── Método Código (sin segundo dispositivo) ──
  const solicitarCodigo = async () => {
    const tel = telefonoCodigo.replace(/\D/g,'');
    if (tel.length < 10) { setError('Escribe tu numero de WhatsApp completo con codigo de pais (ej: 573001234567)'); return; }
    setError(''); setSolicitandoCodigo(true);
    try {
      // Primero iniciar sesion
      await fetch(WA_SERVER+'/sesion/iniciar',{method:'POST',
        headers:{'Content-Type':'application/json','x-server-secret':WA_SECRET},
        body:JSON.stringify({empresaId})});
      await new Promise(r=>setTimeout(r,2000));
      // Luego solicitar pairing code
      const r = await fetch(WA_SERVER+'/sesion/'+empresaId+'/pairing-code',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-server-secret':WA_SECRET},
        body:JSON.stringify({telefono:tel}),
      });
      const d = await r.json();
      if (d.code) {
        setCodigoBot(d.code);
        pollStatus(); // empezar a esperar conexion
      } else {
        setError(d.error || 'No se pudo generar el codigo. Intenta con QR.');
      }
    } catch(e) { setError('Error al solicitar codigo: '+e.message); }
    finally { setSolicitandoCodigo(false); }
  };

  const pollStatus = () => {
    let n = 0;
    const check = async () => {
      if (n++>60) return;
      const r = await fetch(WA_SERVER+'/sesion/'+empresaId+'/status',{headers:{'x-server-secret':WA_SECRET}}).catch(()=>null);
      const d = r ? await r.json().catch(()=>({})) : {};
      if (d.status==='connected') { setNumero(d.numero||''); setStep(4); return; }
      setTimeout(check, 3000);
    };
    check();
  };

  const pct = ((step-1)/3)*100;

  return (
    <>
      <Head>
        <title>Activar WasapBot — agencIAme</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06080D;color:#EFF4FF;font-family:${F};min-height:100vh;overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .wi:focus{border-color:rgba(37,211,102,.55)!important;background:rgba(37,211,102,.04)!important;box-shadow:0 0 0 4px rgba(37,211,102,.07)!important}
        .wi::placeholder{color:rgba(255,255,255,.2)}
        .icard{border-radius:16px;padding:14px 16px;cursor:pointer;outline:none;display:flex;align-items:center;gap:13px;transition:all .2s cubic-bezier(.4,0,.2,1);text-align:left;width:100%}
        .icard:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.4)!important}
        .bmain{width:100%;border:none;border-radius:14px;padding:16px 24px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#25D366,#1aad4e);color:#fff;box-shadow:0 4px 24px rgba(37,211,102,.3);transition:all .2s;display:flex;align-items:center;justify-content:center;gap:9px}
        .bmain:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 36px rgba(37,211,102,.42)}
        .bmain:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
        .bsec{background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px 20px;font-family:${F};font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:8px}
        .bsec:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.75)}
        .bdash{width:100%;background:none;border:1.5px dashed rgba(255,255,255,.1);border-radius:12px;padding:13px;font-family:${F};font-size:13px;color:rgba(255,255,255,.3);cursor:pointer;transition:all .18s}
        .bdash:hover{border-color:rgba(37,211,102,.4);color:rgba(37,211,102,.8);background:rgba(37,211,102,.03)}
        .cpill{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:99px;padding:5px 14px;font-family:${F};font-size:11px;font-weight:600;color:rgba(255,255,255,.35);cursor:pointer;transition:all .18s;white-space:nowrap}
        .cpill:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.65)}
        .cpill.on{background:rgba(37,211,102,.1);border-color:rgba(37,211,102,.35);color:#6EF0A0}
        .bsearch{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:11px 16px 11px 42px;font-family:${F};font-size:13px;color:#EFF4FF;outline:none;width:100%;transition:all .2s}
        .bsearch:focus{border-color:rgba(37,211,102,.4);background:rgba(37,211,102,.03);box-shadow:0 0 0 3px rgba(37,211,102,.07)}
        .bsearch::placeholder{color:rgba(255,255,255,.22)}
        .metodo-card{background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);border-radius:18px;padding:22px;cursor:pointer;transition:all .2s;flex:1;text-align:left}
        .metodo-card:hover{border-color:rgba(37,211,102,.35);background:rgba(37,211,102,.04);transform:translateY(-2px)}
        .metodo-card.sel{border-color:rgba(37,211,102,.5);background:rgba(37,211,102,.07);box-shadow:0 6px 24px rgba(37,211,102,.15)}
        .codigo-digit{width:48px;height:56px;border-radius:12px;background:rgba(37,211,102,.1);border:2px solid rgba(37,211,102,.3);display:flex;align-items:center;justify-content:center;font-family:${F};font-size:22px;font-weight:800;color:#25D366;letter-spacing:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ok{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .aup{animation:up .3s cubic-bezier(.4,0,.2,1) both}
        select.wi option{background:#0E1118}
        @media(max-width:600px){.ind-grid{grid-template-columns:1fr!important}.two-col{grid-template-columns:1fr!important}.metodos-grid{flex-direction:column!important}}
      `}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,8,13,.97)',backdropFilter:'blur(28px)',borderBottom:'1px solid rgba(255,255,255,.055)',padding:'0 28px',height:62,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/wasapbot">
          <span style={{fontFamily:FA,fontSize:18,cursor:'pointer',letterSpacing:'-.5px',display:'flex',alignItems:'center',gap:10}}>
            agenc<span style={{color:'#FF6B00'}}>IA</span>me
            <span style={{color:'#25D366',fontSize:11,fontFamily:F,fontWeight:700,background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.2)',padding:'3px 10px',borderRadius:99}}>WasapBot</span>
          </span>
        </Link>
        <Link href="/wasapbot" style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.3)',display:'flex',alignItems:'center',gap:5}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver
        </Link>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{background:'rgba(255,255,255,.015)',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{height:3,background:'rgba(255,255,255,.05)',position:'relative'}}>
          <div style={{position:'absolute',top:0,left:0,height:'100%',width:pct+'%',background:'linear-gradient(90deg,#25D366,#B8FF6C)',transition:'width .6s cubic-bezier(.4,0,.2,1)',boxShadow:'0 0 12px rgba(37,211,102,.5)'}}/>
        </div>
        <div style={{maxWidth:720,margin:'0 auto',display:'flex',padding:'14px 20px'}}>
          {STEPS.map((s,i)=>{
            const done=step>i+1, cur=step===i+1;
            return(
              <div key={i} style={{flex:1,display:'flex',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:7,opacity:done||cur?1:.3,transition:'opacity .4s'}}>
                  <div style={{width:26,height:26,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:done?'#25D366':cur?'rgba(37,211,102,.15)':'rgba(255,255,255,.05)',border:'1px solid '+(done?'#1aad4e':cur?'rgba(37,211,102,.45)':'rgba(255,255,255,.08)'),fontSize:11,fontWeight:700,color:done?'#fff':cur?'#25D366':'rgba(255,255,255,.3)'}}>
                    {done?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>:i+1}
                  </div>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:cur?600:400,color:cur?'#EFF4FF':'rgba(255,255,255,.3)',display:cur?'block':'none'}}>{s}</span>
                </div>
                {i<STEPS.length-1&&<div style={{flex:1,height:1,background:'rgba(255,255,255,.06)',margin:'0 6px'}}/>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:720,margin:'0 auto',padding:'44px 20px 100px'}}>

        {error&&(
          <div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.2)',borderRadius:14,padding:'13px 18px',marginBottom:20,fontFamily:F,fontSize:13,color:'#F87171',display:'flex',alignItems:'center',gap:10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="#F87171"/></svg>
            {error}
            <button onClick={()=>setError('')} style={{marginLeft:'auto',background:'none',border:'none',color:'rgba(239,68,68,.5)',cursor:'pointer',fontSize:16}}>✕</button>
          </div>
        )}

        {/* ═══ PASO 1 ═══ */}
        {step===1&&(
          <div className="aup">
            <div style={{marginBottom:40}}>
              <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:'rgba(37,211,102,.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>PASO 1 DE 4</p>
              <h1 style={{fontFamily:FA,fontSize:50,fontWeight:400,letterSpacing:'-2.5px',color:'#F5F5F5',marginBottom:12,lineHeight:1.02}}>Cuentanos sobre<br/>tu negocio</h1>
              <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.33)',fontWeight:300,lineHeight:1.75,maxWidth:480}}>Configuramos tu bot automaticamente con el vocabulario y la personalidad de tu industria.</p>
            </div>

            <div style={CARD}>
              <label style={LBL}>Nombre del negocio *</label>
              <input className="wi" style={INP} value={nombre} onChange={e=>setNombre(e.target.value)}
                placeholder={ph.nombre||'Ej: Restaurante El Buen Sabor, Salon Mia, Taller Don Jorge...'}/>
            </div>

            <div style={CARD}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <label style={{...LBL,marginBottom:0}}>Tipo de negocio *</label>
                {industria&&<button onClick={()=>setIndustria('')} style={{background:'none',border:'none',fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                  Cambiar <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>}
              </div>
              {indCfg&&(
                <div style={{display:'flex',alignItems:'center',gap:14,background:'rgba('+indCfg.r+',.08)',border:'1.5px solid rgba('+indCfg.r+',.35)',borderRadius:14,padding:'13px 16px',marginBottom:18,boxShadow:'0 4px 24px rgba('+indCfg.r+',.18)'}}>
                  <div style={{width:44,height:44,borderRadius:13,background:'rgba('+indCfg.r+',.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <IndIcon id={industria} color={indCfg.color} size={24}/>
                  </div>
                  <div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#F0F4FF',marginBottom:2}}>{INDUSTRIAS_WB.find(x=>x.value===industria)?.label}</div>
                    <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.4)',fontWeight:300}}>{indCfg.desc}</div>
                  </div>
                  <div style={{marginLeft:'auto',width:24,height:24,borderRadius:8,background:indCfg.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              )}
              <div style={{position:'relative',marginBottom:12}}>
                <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="bsearch" value={busq} onChange={e=>setBusq(e.target.value)} placeholder="Buscar tipo de negocio..."/>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                {CATS.map(cat=>(
                  <button key={cat} className={'cpill'+(catFiltro===cat?' on':'')} onClick={()=>setCatFiltro(cat)}>{cat}</button>
                ))}
              </div>
              {indsFiltradas.length===0?(
                <div style={{textAlign:'center',padding:'32px 0',fontFamily:F,fontSize:13,color:'rgba(255,255,255,.25)'}}>Sin resultados para "{busq}"</div>
              ):(
                <div className="ind-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {indsFiltradas.map(ind=>{
                    const c=IND[ind.value]||IND.otro, sel=industria===ind.value;
                    return(
                      <button key={ind.value} className="icard" onClick={()=>setIndustria(ind.value)}
                        style={{background:sel?'rgba('+c.r+',.12)':'rgba(255,255,255,.03)',border:'1.5px solid '+(sel?'rgba('+c.r+',.5)':'rgba(255,255,255,.08)'),boxShadow:sel?'0 6px 28px rgba('+c.r+',.25)':'none',transform:sel?'translateY(-2px)':'none'}}>
                        <div style={{width:44,height:44,borderRadius:13,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:sel?'rgba('+c.r+',.22)':'rgba('+c.r+',.1)',transition:'background .2s'}}>
                          <IndIcon id={ind.value} color={c.color} size={22}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:sel?'#F0F4FF':'rgba(255,255,255,.7)',marginBottom:2}}>{ind.label}</div>
                          <div style={{fontFamily:F,fontSize:11,fontWeight:300,color:'rgba(255,255,255,.3)',lineHeight:1.4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.desc}</div>
                        </div>
                        <div style={{width:20,height:20,borderRadius:6,flexShrink:0,background:sel?c.color:'transparent',border:'1.5px solid '+(sel?c.color:'rgba(255,255,255,.15)'),display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                          {sel&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={CARD}>
              <label style={LBL}>Descripcion del negocio</label>
              <textarea className="wi" style={{...INP,resize:'vertical',minHeight:90,lineHeight:1.7}} value={descripcion} onChange={e=>setDescripcion(e.target.value)}
                placeholder={ph.descripcion||'Ej: Somos un salon de belleza familiar con 10 anos de experiencia...'}/>
              <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
                <div>
                  <label style={LBL}>Ciudad</label>
                  <input className="wi" style={INP} value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Cali, Bogota, Medellin..."/>
                </div>
                <div>
                  <label style={LBL}>Horario de atencion</label>
                  <input className="wi" style={INP} value={horario} onChange={e=>setHorario(e.target.value)} placeholder={ph.horario||'Lun-Vie 8am-6pm'}/>
                </div>
              </div>
            </div>

            <div style={CARD}>
              <label style={LBL}>Correo electronico *</label>
              <div style={{position:'relative'}}>
                <svg style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input className="wi" style={{...INP,paddingLeft:46}} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@gmail.com"/>
              </div>
              <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.2)',margin:'10px 0 0',fontWeight:300}}>Recibiras resumenes diarios y alertas de citas agendadas.</p>
            </div>

            <button className="bmain" onClick={crearEmpresa} disabled={loading}>
              {loading
                ?<><span style={{width:17,height:17,border:'2.5px solid rgba(255,255,255,.3)',borderTop:'2.5px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite',display:'inline-block',flexShrink:0}}/>Creando tu agente...</>
                :<>Crear mi WasapBot →<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg></>}
            </button>
          </div>
        )}

        {/* ═══ PASO 2 ═══ */}
        {step===2&&cfg&&(
          <div className="aup">
            <div style={{marginBottom:36}}>
              <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:'rgba(37,211,102,.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>PASO 2 DE 4</p>
              <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:12,lineHeight:1.02}}>{cfg.labelCatalogo}</h1>
              <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.33)',fontWeight:300,lineHeight:1.75,maxWidth:500}}>
                Agrega tus {cfg.labelCatalogo.toLowerCase()} — el bot los presentara cuando un cliente pregunte.
                {cfg.permitePedidos&&<span style={{color:'rgba(37,211,102,.85)',fontWeight:500}}> Los clientes podran hacer pedidos por WhatsApp.</span>}
              </p>
            </div>
            {items.map((item,idx)=>(
              <div key={idx} style={CARD}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:9}}>
                    <div style={{width:26,height:26,borderRadius:8,background:'rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)'}}>{idx+1}</div>
                    <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:'rgba(255,255,255,.5)'}}>{cfg.labelItem}</span>
                  </div>
                  {items.length>1&&<button onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))}
                    style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,color:'rgba(239,68,68,.6)',cursor:'pointer',fontSize:11,padding:'5px 12px',fontFamily:F,fontWeight:600}}>Eliminar</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:cfg.tieneFoto?'1fr auto':'1fr',gap:16,marginBottom:14,alignItems:'end'}}>
                  <div>
                    <label style={LBL}>{cfg.labelItem} *</label>
                    <input className="wi" style={INP} value={item.nombre}
                      onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it))}
                      placeholder={ph['item'+(idx+1)]||'Nombre del '+cfg.labelItem.toLowerCase()}/>
                  </div>
                  {cfg.tieneFoto&&(
                    <div>
                      <label style={LBL}>Foto</label>
                      <input ref={el=>fileRefs.current[idx]=el} type="file" accept="image/*" style={{display:'none'}}
                        onChange={e=>{const f=e.target.files[0];if(f) subirFoto(f,idx);}}/>
                      {item.foto?(
                        <div style={{position:'relative',width:62,height:62}}>
                          <img src={item.foto} alt="" style={{width:62,height:62,objectFit:'cover',borderRadius:12,border:'1px solid rgba(255,255,255,.1)'}}/>
                          <button onClick={()=>setItems(p=>p.map((it,i)=>i===idx?{...it,foto:''}:it))}
                            style={{position:'absolute',top:-7,right:-7,background:'#EF4444',border:'2px solid #06080D',borderRadius:'50%',width:20,height:20,color:'#fff',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✕</button>
                        </div>
                      ):(
                        <div onClick={()=>fileRefs.current[idx]?.click()}
                          style={{width:62,height:62,border:'1.5px dashed rgba(255,255,255,.12)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,.2)',transition:'all .18s',gap:3}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(37,211,102,.45)';e.currentTarget.style.color='rgba(37,211,102,.65)'}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.12)';e.currentTarget.style.color='rgba(255,255,255,.2)'}}>
                          {item.subiendo
                            ?<div style={{width:18,height:18,border:'2px solid rgba(37,211,102,.2)',borderTop:'2px solid #25D366',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                            :<><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span style={{fontSize:9,fontFamily:F,fontWeight:600}}>Subir</span></>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                  <div>
                    <label style={LBL}>{cfg.labelPrecio}</label>
                    <input className="wi" style={INP} value={item.precio}
                      onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,precio:e.target.value}:it))} placeholder={ph['precio'+(idx+1)]||'0'}/>
                  </div>
                  {cfg.tieneCategoria&&(
                    <div>
                      <label style={LBL}>Categoria</label>
                      <select className="wi" style={{...INP,cursor:'pointer'}} value={item.categoria}
                        onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,categoria:e.target.value}:it))}>
                        <option value="">Seleccionar...</option>
                        {cfg.categorias.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label style={LBL}>{cfg.labelDescripcion}</label>
                  <input className="wi" style={INP} value={item.descripcion}
                    onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it))} placeholder={ph['desc'+(idx+1)]||'Descripcion breve...'}/>
                </div>
              </div>
            ))}
            <button className="bdash" style={{marginBottom:20}}
              onClick={()=>setItems(p=>[...p,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false}])}>
              + Agregar {cfg.labelItem.toLowerCase()}
            </button>
            <div style={CARD}>
              <label style={LBL}>Preguntas frecuentes que responde el bot</label>
              <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.22)',margin:'0 0 16px',fontWeight:300,lineHeight:1.6}}>El bot las respondera automaticamente. Ahorra hasta 80% de tu tiempo.</p>
              {preguntas.map((p,i)=>(
                <input key={i} className="wi" style={{...INP,marginBottom:10}} value={p}
                  onChange={e=>setPreguntas(prev=>prev.map((x,j)=>j===i?e.target.value:x))}
                  placeholder={ph['pregunta'+(i+1)]||'Ej: Cuanto demoran? Tienen parqueadero? Aceptan tarjeta?'}/>
              ))}
            </div>
            <div style={{display:'flex',gap:12}}>
              <button className="bsec" onClick={()=>setStep(1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                Atras
              </button>
              <button className="bmain" style={{flex:1}} onClick={guardarCatalogo} disabled={loading}>
                {loading
                  ?<><span style={{width:17,height:17,border:'2.5px solid rgba(255,255,255,.3)',borderTop:'2.5px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite',display:'inline-block',flexShrink:0}}/>Guardando...</>
                  :<>Conectar WhatsApp<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg></>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            PASO 3 — CONEXION WHATSAPP (QR o CODIGO)
        ═══════════════════════════════════════════════ */}
        {step===3&&(
          <div className="aup">
            <div style={{textAlign:'center',marginBottom:40}}>
              <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:'rgba(37,211,102,.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:18}}>PASO 3 DE 4</p>
              <h1 style={{fontFamily:FA,fontSize:44,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:12,lineHeight:1.02}}>Conecta tu WhatsApp</h1>
              <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.32)',fontWeight:300,lineHeight:1.75,maxWidth:500,margin:'0 auto'}}>
                Elige cómo conectar según tu situación. Ambas opciones funcionan igual de bien.
              </p>
            </div>

            {/* ── SELECTOR DE MÉTODO ── */}
            {!metodoConexion&&(
              <div className="metodos-grid" style={{display:'flex',gap:14,marginBottom:8}}>

                {/* Opción A: QR */}
                <div className="metodo-card" onClick={iniciarConQR}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{width:46,height:46,borderRadius:13,background:'rgba(37,211,102,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="21" y2="14"/><line x1="14" y1="17" x2="14" y2="21"/>
                        <line x1="17" y1="17" x2="17" y2="17"/><line x1="21" y1="17" x2="21" y2="21"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:2}}>Escanear código QR</div>
                      <div style={{fontFamily:F,fontSize:11,color:'#25D366',fontWeight:600}}>Recomendado</div>
                    </div>
                  </div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.6,margin:'0 0 14px'}}>
                    Abre WhatsApp en otro celular o computador y escanea el código con la cámara.
                  </p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {['Tienes otro celular','Tienes PC cerca','Celular y PC a la vez'].map((t,i)=>(
                      <span key={i} style={{background:'rgba(37,211,102,.08)',color:'rgba(37,211,102,.7)',borderRadius:99,padding:'3px 10px',fontFamily:F,fontSize:10,fontWeight:600}}>✓ {t}</span>
                    ))}
                  </div>
                </div>

                {/* Opción B: Código */}
                <div className="metodo-card" onClick={()=>setMetodoConexion('codigo')}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{width:46,height:46,borderRadius:13,background:'rgba(96,165,250,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12" y2="18"/>
                        <path d="M9 8h1l1 4 1-4h1"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:2}}>Código por número</div>
                      <div style={{fontFamily:F,fontSize:11,color:'#60A5FA',fontWeight:600}}>Para un solo celular</div>
                    </div>
                  </div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.6,margin:'0 0 14px'}}>
                    WhatsApp te envía un código de 8 dígitos directamente al celular. No necesitas escanearlo con cámara.
                  </p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {['Solo tienes este celular','Estas en movil','Sin PC disponible'].map((t,i)=>(
                      <span key={i} style={{background:'rgba(96,165,250,.08)',color:'rgba(96,165,250,.7)',borderRadius:99,padding:'3px 10px',fontFamily:F,fontSize:10,fontWeight:600}}>✓ {t}</span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── FLUJO QR ── */}
            {metodoConexion==='qr'&&(
              <div className="aup" style={{textAlign:'center'}}>
                <button onClick={()=>{setMetodoConexion('');setQrBase64('');setLoading(false);}}
                  style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',cursor:'pointer',marginBottom:24,display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                  Cambiar método
                </button>

                {loading&&!qrBase64&&(
                  <div style={{padding:'60px 0'}}>
                    <div style={{width:52,height:52,border:'3px solid rgba(37,211,102,.1)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin .9s linear infinite',margin:'0 auto 22px'}}/>
                    <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.22)'}}>Generando codigo QR...</div>
                  </div>
                )}

                {qrBase64&&(
                  <div>
                    <div style={{background:'#fff',borderRadius:24,padding:24,display:'inline-block',marginBottom:28,boxShadow:'0 28px 80px rgba(0,0,0,.7)'}}>
                      <img src={qrBase64} alt="QR" style={{width:240,height:240,display:'block'}}/>
                    </div>

                    <div style={{...CARD,textAlign:'left',maxWidth:460,margin:'0 auto 24px'}}>
                      <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:14,textTransform:'uppercase',letterSpacing:1.2}}>Como escanear</div>
                      {[
                        'Abre WhatsApp en tu otro celular o PC',
                        'Ve a Ajustes → Dispositivos vinculados',
                        'Toca "Vincular un dispositivo"',
                        'Apunta la camara al codigo QR de arriba',
                      ].map((t,i)=>(
                        <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:i<3?12:0}}>
                          <div style={{width:24,height:24,borderRadius:8,background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366',flexShrink:0,marginTop:1}}>{i+1}</div>
                          <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.42)',lineHeight:1.6}}>{t}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{display:'inline-flex',alignItems:'center',gap:10,background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.18)',borderRadius:99,padding:'9px 18px'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:'#F59E0B',animation:'pulse 1.5s ease infinite'}}/>
                      <span style={{fontFamily:F,fontSize:12,color:'rgba(245,158,11,.85)',fontWeight:500}}>Esperando que escanees...</span>
                    </div>

                    {/* Sugerencia para quienes solo tienen un celular */}
                    <div style={{marginTop:24,background:'rgba(96,165,250,.05)',border:'1px solid rgba(96,165,250,.15)',borderRadius:14,padding:'14px 18px',textAlign:'left',maxWidth:460,margin:'24px auto 0'}}>
                      <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#60A5FA',marginBottom:6}}>¿Solo tienes este celular?</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.6,marginBottom:10}}>
                        No necesitas escanearlo. Usa el método de código numérico — WhatsApp te lo envía directamente.
                      </div>
                      <button onClick={()=>{setMetodoConexion('codigo');setQrBase64('');setLoading(false);}}
                        style={{background:'rgba(96,165,250,.1)',color:'#60A5FA',border:'1px solid rgba(96,165,250,.25)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                        Cambiar a código numérico →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FLUJO CÓDIGO POR NÚMERO ── */}
            {metodoConexion==='codigo'&&(
              <div className="aup">
                <button onClick={()=>setMetodoConexion('')}
                  style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',cursor:'pointer',marginBottom:28,display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                  Cambiar método
                </button>

                {!codigoBot ? (
                  /* Solicitar codigo */
                  <div style={{...CARD,maxWidth:480,margin:'0 auto'}}>
                    <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:24}}>
                      <div style={{width:46,height:46,borderRadius:13,background:'rgba(96,165,250,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round">
                          <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:'#EFF4FF',marginBottom:4}}>Conectar con código de WhatsApp</div>
                        <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.35)',lineHeight:1.6}}>
                          Escribe el número de WhatsApp que usará el bot y te enviamos un código de 8 dígitos.
                        </div>
                      </div>
                    </div>

                    <label style={LBL}>Numero de WhatsApp del bot</label>
                    <div style={{position:'relative',marginBottom:8}}>
                      <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontFamily:F,fontSize:14,color:'rgba(255,255,255,.4)',pointerEvents:'none'}}>+</span>
                      <input className="wi" style={{...INP,paddingLeft:30}} type="tel"
                        value={telefonoCodigo}
                        onChange={e=>setTelefonoCodigo(e.target.value.replace(/\D/g,''))}
                        placeholder="57 300 123 4567"/>
                    </div>
                    <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.2)',marginBottom:24,fontWeight:300}}>
                      Incluye el codigo de pais sin el +. Colombia: 57, seguido del numero de 10 digitos.
                    </p>

                    {/* Pasos visuales */}
                    <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:'14px 16px',marginBottom:24}}>
                      <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Qué va a pasar</div>
                      {[
                        {n:'1', t:'Presionas el botón y escribimos tu número a WhatsApp', color:'#60A5FA'},
                        {n:'2', t:'WhatsApp te envía un código de 8 dígitos por mensaje', color:'#60A5FA'},
                        {n:'3', t:'Lo escribes aquí y tu bot queda conectado', color:'#25D366'},
                      ].map((s,i)=>(
                        <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<2?10:0}}>
                          <div style={{width:22,height:22,borderRadius:7,background:'rgba('+((s.color==='#25D366')?'37,211,102':'96,165,250')+',.12)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:800,color:s.color,flexShrink:0,marginTop:1}}>{s.n}</div>
                          <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.5}}>{s.t}</span>
                        </div>
                      ))}
                    </div>

                    <button className="bmain" onClick={solicitarCodigo} disabled={solicitandoCodigo||!telefonoCodigo.trim()}>
                      {solicitandoCodigo
                        ?<><span style={{width:17,height:17,border:'2.5px solid rgba(255,255,255,.3)',borderTop:'2.5px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite',display:'inline-block',flexShrink:0}}/>Enviando solicitud...</>
                        :<>Enviar codigo a mi WhatsApp<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg></>}
                    </button>
                  </div>
                ) : (
                  /* Mostrar codigo recibido */
                  <div style={{textAlign:'center',maxWidth:480,margin:'0 auto'}}>

                    {/* Codigo en grande */}
                    <div style={{marginBottom:32}}>
                      <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:16,fontWeight:300}}>
                        WhatsApp te envio este codigo. Abré WhatsApp y busca el mensaje de <strong style={{color:'#EFF4FF'}}>WhatsApp</strong>:
                      </div>

                      <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                        {/* Mostrar codigo en bloques de 4 */}
                        {[codigoBot.slice(0,4), codigoBot.slice(4,8)].map((bloque,bi)=>(
                          <div key={bi} style={{display:'flex',gap:6}}>
                            {bloque.split('').map((digit,di)=>(
                              <div key={di} className="codigo-digit">{digit}</div>
                            ))}
                            {bi===0&&<div style={{display:'flex',alignItems:'center',padding:'0 4px',fontFamily:F,fontSize:22,fontWeight:800,color:'rgba(37,211,102,.4)'}}>–</div>}
                          </div>
                        ))}
                      </div>

                      <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.2)',fontWeight:300}}>
                        Este codigo expira en 60 segundos
                      </div>
                    </div>

                    {/* Instrucciones */}
                    <div style={{...CARD,textAlign:'left',marginBottom:24}}>
                      <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',marginBottom:14,textTransform:'uppercase',letterSpacing:1.2}}>Donde ingresar el codigo</div>
                      {[
                        'Abre WhatsApp en tu celular',
                        'Ve a Ajustes → Dispositivos vinculados',
                        'Toca "Vincular con numero de telefono"',
                        'Ingresa el codigo de 8 digitos que aparece arriba',
                      ].map((t,i)=>(
                        <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:i<3?12:0}}>
                          <div style={{width:24,height:24,borderRadius:8,background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366',flexShrink:0,marginTop:1}}>{i+1}</div>
                          <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.42)',lineHeight:1.6}}>{t}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{display:'inline-flex',alignItems:'center',gap:10,background:'rgba(37,211,102,.06)',border:'1px solid rgba(37,211,102,.18)',borderRadius:99,padding:'9px 18px',marginBottom:20}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:'#25D366',animation:'pulse 1.5s ease infinite'}}/>
                      <span style={{fontFamily:F,fontSize:12,color:'rgba(37,211,102,.85)',fontWeight:500}}>Esperando que ingreses el codigo...</span>
                    </div>

                    <div>
                      <button onClick={()=>{setCodigoBot('');setTelefonoCodigo('');}}
                        style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,.25)',cursor:'pointer',textDecoration:'underline'}}>
                        No recibí el código — intentar de nuevo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ PASO 4 ═══ */}
        {step===4&&(
          <div className="aup" style={{textAlign:'center'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'rgba(37,211,102,.08)',border:'2px solid rgba(37,211,102,.28)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',animation:'ok .6s cubic-bezier(0.175,0.885,0.32,1.275) both',boxShadow:'0 0 60px rgba(37,211,102,.15)'}}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:54,fontWeight:400,letterSpacing:'-2.5px',color:'#25D366',marginBottom:6,lineHeight:1}}>Bot activado</h1>
            {numero&&<div style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,.28)',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +{numero}
            </div>}
            <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.35)',lineHeight:1.8,fontWeight:300,maxWidth:420,margin:'0 auto 36px'}}>
              Tu WhatsApp responde automaticamente. Enviáte un mensaje para probarlo.
            </p>
            <div style={{...CARD,textAlign:'left',maxWidth:500,margin:'0 auto 28px'}}>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.3)',marginBottom:16,textTransform:'uppercase',letterSpacing:1.2}}>Tu bot ya hace todo esto</div>
              {['Responde preguntas 24/7 sin que estes pendiente','Presenta tu catalogo con precios y fotos','Agenda citas y envia confirmacion por email','Captura nombre, telefono y correo del cliente','Te avisa cuando necesitan hablar con una persona'].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<4?13:0}}>
                  <div style={{width:22,height:22,borderRadius:7,background:'rgba(37,211,102,.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.5)',lineHeight:1.5}}>{t}</span>
                </div>
              ))}
            </div>
            <a href={'/wasapbot/panel/'+empresaId} style={{display:'flex',maxWidth:500,margin:'0 auto 10px',background:'linear-gradient(135deg,#25D366,#1aad4e)',color:'#fff',borderRadius:16,padding:'17px 24px',fontFamily:F,fontSize:15,fontWeight:700,boxShadow:'0 8px 32px rgba(37,211,102,.35)',alignItems:'center',justifyContent:'center',gap:9}}>
              Ir a mi panel
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <Link href="/wasapbot" style={{display:'block',maxWidth:500,margin:'0 auto',background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.35)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'14px',fontFamily:F,fontSize:13,textAlign:'center'}}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
