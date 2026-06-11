// pages/wasapbot/activar.js — v4 fix colores + iconos visibles
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { INDUSTRIAS_WB, getConfigIndustria } from '../../lib/wasapbotConfig';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const CLOUD = 'dsomqay6y';
const PRESET = 'cadegran_fotos';
const STEPS = ['Tu negocio', 'Tu catalogo', 'Conecta WhatsApp', 'Listo'];

// Color acento por industria
const IND_COLOR = {
  restaurante:'#F59E0B', taller:'#EF4444',   peluqueria:'#EC4899', barbero:'#60A5FA',
  veterinaria:'#34D399', reposteria:'#FB923C', tienda:'#A78BFA',   farmacia:'#22D3EE',
  psicologo:'#C084FC',   fotografia:'#FBBF24', contador:'#38BDF8', acarreos:'#94A3B8',
  gimnasio:'#FB923C',    salud:'#F472B6',      educacion:'#818CF8', tecnico:'#6366F1',
  inmobiliaria:'#60A5FA', otro:'#94A3B8',
};

// SVG paths por industria — stroke="currentColor" hereda el color del padre
const IND_SVG = {
  restaurante: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/><line x1="21" y1="15" x2="21" y2="22"/></svg>,
  taller:      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  peluqueria:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  barbero:     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M6.36 6.36A8 8 0 1 0 19 17"/><path d="M20.35 3.65A8 8 0 0 1 6.3 17.6"/><circle cx="12" cy="12" r="2"/></svg>,
  veterinaria: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/><path d="M9.5 10.5c-.667-.333-2-.7-2-2"/><path d="M14.5 10.5c.667-.333 2-.7 2-2"/></svg>,
  reposteria:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="7" y1="11" x2="7" y2="6"/><line x1="12" y1="11" x2="12" y2="4"/><line x1="17" y1="11" x2="17" y2="6"/></svg>,
  tienda:      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><line x1="2" y1="7" x2="22" y2="7"/></svg>,
  farmacia:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>,
  psicologo:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  fotografia:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/></svg>,
  contador:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  acarreos:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>,
  gimnasio:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>,
  salud:       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  educacion:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  tecnico:     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  inmobiliaria:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  otro:        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
};

export default function WasapBotActivar() {
  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [empresaId,  setEmpresaId]  = useState('');
  const [qrBase64,   setQrBase64]   = useState('');
  const [numero,     setNumero]     = useState('');

  const [nombre,      setNombre]      = useState('');
  const [industria,   setIndustria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [email,       setEmail]       = useState('');
  const [horario,     setHorario]     = useState('');
  const [ciudad,      setCiudad]      = useState('');

  const [items, setItems] = useState([
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
  ]);
  const [preguntas, setPreguntas] = useState(['','','']);
  const fileRefs = useRef([]);

  const cfg = industria ? getConfigIndustria(industria) : null;
  const ph  = cfg?.placeholders || {};

  const INP = {
    width:'100%', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.09)', borderRadius:10,
    padding:'13px 16px', color:'#EFF4FF', fontFamily:F, fontSize:14,
    outline:'none', boxSizing:'border-box', transition:'border-color 0.2s, background 0.2s',
  };
  const LBL = {
    fontFamily:F, fontSize:11, fontWeight:600, textTransform:'uppercase',
    letterSpacing:1, color:'rgba(255,255,255,0.3)', display:'block', marginBottom:7,
  };
  const CARD = {
    background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:16, padding:'24px', marginBottom:14,
  };

  const subirFoto = async (file, idx) => {
    setItems(prev => prev.map((it,i) => i===idx ? {...it,subiendo:true} : it));
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', PRESET); fd.append('folder', 'wasapbot/catalogo');
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
      const itemsValidos = items.filter(it => it.nombre.trim());
      const pFiltradas   = preguntas.filter(p => p.trim()).map(p => ({pregunta:p,respuesta:''}));
      await fetch('/api/wasapbot-servicios',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({empresaId,servicios:itemsValidos,horario,preguntas:pFiltradas,
          tipoCatalogo:cfg?.tipoCatalogo||'servicios',permitePedidos:cfg?.permitePedidos||false})});
      setStep(3); iniciarBot();
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const iniciarBot = async () => {
    setLoading(true);
    const WA = 'https://agenciame-whatsapp-server-production.up.railway.app';
    try {
      await fetch(WA+'/sesion/iniciar',{method:'POST',
        headers:{'Content-Type':'application/json','x-server-secret':'agenciame2026secreto_nexoia'},
        body:JSON.stringify({empresaId})});
      let intentos = 0;
      const poll = async () => {
        if (intentos++>30) { setError('Tiempo agotado. Intenta de nuevo.'); setLoading(false); return; }
        const r2 = await fetch(WA+'/sesion/'+empresaId+'/qr',{headers:{'x-server-secret':'agenciame2026secreto_nexoia'}}).catch(()=>null);
        const d2 = r2 ? await r2.json().catch(()=>({})) : {};
        if (d2.status==='connected') { setNumero(d2.numero||''); setStep(4); setLoading(false); return; }
        if (d2.qrBase64) { setQrBase64(d2.qrBase64); setLoading(false); pollStatus(); return; }
        setTimeout(poll,2000);
      };
      poll();
    } catch(e) { setError(e.message); setLoading(false); }
  };

  const pollStatus = () => {
    const WA = 'https://agenciame-whatsapp-server-production.up.railway.app';
    let n = 0;
    const check = async () => {
      if (n++>60) return;
      const r = await fetch(WA+'/sesion/'+empresaId+'/status',{headers:{'x-server-secret':'agenciame2026secreto_nexoia'}}).catch(()=>null);
      const d = r ? await r.json().catch(()=>({})) : {};
      if (d.status==='connected') { setNumero(d.numero||''); setStep(4); return; }
      setTimeout(check,3000);
    };
    check();
  };

  const indSel = INDUSTRIAS_WB.find(i => i.value===industria);

  return (
    <>
      <Head>
        <title>Activar WasapBot - agencIAme</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#07090E;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        .wi:focus{border-color:rgba(37,211,102,0.5)!important;background:rgba(37,211,102,0.04)!important}
        .wi::placeholder{color:rgba(255,255,255,0.18)}
        .bmain{width:100%;border:none;border-radius:14px;padding:16px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#25D366,#1DB954);color:#fff;box-shadow:0 4px 22px rgba(37,211,102,0.3);transition:transform .15s,box-shadow .2s}
        .bmain:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 34px rgba(37,211,102,0.4)}
        .bmain:disabled{opacity:0.5;cursor:not-allowed;transform:none}
        .bgh{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px;font-family:${F};font-size:13px;font-weight:500;cursor:pointer;transition:all .15s}
        .bgh:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.75)}
        .bda{width:100%;background:none;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:12px;font-family:${F};font-size:13px;color:rgba(255,255,255,0.3);cursor:pointer;transition:all .15s}
        .bda:hover{border-color:rgba(37,211,102,0.4);color:rgba(37,211,102,0.75)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ok{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:scale(1)}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .aup{animation:up 0.3s ease both}
        select.wi option{background:#141820}
      `}} />

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(7,9,14,0.95)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 28px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/wasapbot">
          <span style={{fontFamily:FA,fontSize:17,cursor:'pointer',letterSpacing:'-0.3px'}}>
            agenc<span style={{color:'#FF6B00'}}>IA</span>me{' '}
            <span style={{color:'#25D366',fontSize:13,fontFamily:F,fontWeight:700}}>WasapBot</span>
          </span>
        </Link>
        <Link href="/wasapbot" style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.28)'}}>← Volver</Link>
      </nav>

      <div style={{maxWidth:660,margin:'0 auto',padding:'52px 20px 100px'}}>

        {/* STEPPER */}
        <div style={{display:'flex',alignItems:'center',marginBottom:52}}>
          {STEPS.map((s,i)=>{
            const done=step>i+1, cur=step===i+1;
            return(
              <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,flexShrink:0,transition:'all .3s',background:done?'#25D366':cur?'rgba(37,211,102,0.12)':'rgba(255,255,255,0.05)',border:'1px solid '+(done?'#25D366':cur?'rgba(37,211,102,0.55)':'rgba(255,255,255,0.08)'),color:done?'#fff':cur?'#25D366':'rgba(255,255,255,0.25)'}}>
                    {done?'✓':i+1}
                  </div>
                  {cur&&<span style={{fontFamily:F,fontSize:12,fontWeight:600,color:'#EFF4FF',whiteSpace:'nowrap'}}>{s}</span>}
                </div>
                {i<STEPS.length-1&&<div style={{flex:1,height:1,background:done?'rgba(37,211,102,0.5)':'rgba(255,255,255,0.07)',margin:'0 10px',minWidth:12,transition:'background .3s'}}/>}
              </div>
            );
          })}
        </div>

        {error&&(
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',borderRadius:12,padding:'12px 16px',marginBottom:18,fontFamily:F,fontSize:13,color:'#F87171',display:'flex',alignItems:'center',gap:10}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#F87171"/></svg>
            {error}
          </div>
        )}

        {/* ══════ PASO 1 ══════ */}
        {step===1&&(
          <div className="aup">
            <h1 style={{fontFamily:FA,fontSize:48,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:8,lineHeight:1.02}}>Tu negocio</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.3)',fontWeight:300,lineHeight:1.65,margin:'0 0 36px'}}>
              Cuentanos de que se trata para configurar tu bot correctamente.
            </p>

            {/* Nombre */}
            <div style={CARD}>
              <label style={LBL}>Nombre del negocio *</label>
              <input className="wi" style={INP} value={nombre} onChange={e=>setNombre(e.target.value)}
                placeholder={ph.nombre||'Ej: Restaurante El Buen Sabor'} />
            </div>

            {/* Tipo */}
            <div style={CARD}>
              <label style={LBL}>Tipo de negocio *</label>

              {indSel&&(
                <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(37,211,102,0.07)',border:'1px solid rgba(37,211,102,0.25)',borderRadius:10,padding:'9px 14px',marginBottom:16}}>
                  <div style={{color:'#25D366',display:'flex'}}>{IND_SVG[indSel.value]}</div>
                  <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#6EF0A0'}}>{indSel.label}</span>
                  <button onClick={()=>setIndustria('')} style={{marginLeft:'auto',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:14,padding:'2px 4px'}}>✕</button>
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {INDUSTRIAS_WB.map(ind=>{
                  const col = IND_COLOR[ind.value]||'#94A3B8';
                  const sel = industria===ind.value;
                  return(
                    <button key={ind.value} onClick={()=>setIndustria(ind.value)} style={{
                      background: sel ? 'rgba('+hexRgb(col)+',0.1)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid '+(sel ? 'rgba('+hexRgb(col)+',0.45)' : 'rgba(255,255,255,0.08)'),
                      borderRadius:14, padding:'16px 8px 13px',
                      cursor:'pointer', outline:'none',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                      transition:'all .18s',
                      boxShadow: sel ? '0 4px 18px rgba('+hexRgb(col)+',0.2)' : 'none',
                    }}>
                      {/* Caja del icono */}
                      <div style={{
                        width:46, height:46, borderRadius:13,
                        background: sel ? 'rgba('+hexRgb(col)+',0.18)' : 'rgba(255,255,255,0.06)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color: sel ? col : 'rgba(255,255,255,0.55)',
                        transition:'all .18s',
                      }}>
                        {IND_SVG[ind.value]}
                      </div>
                      {/* Label */}
                      <span style={{
                        fontFamily:F, fontSize:10, fontWeight: sel ? 700 : 600,
                        lineHeight:1.25, textAlign:'center',
                        color: sel ? col : 'rgba(255,255,255,0.45)',
                        transition:'color .18s',
                      }}>{ind.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descripcion + Ciudad + Horario */}
            <div style={CARD}>
              <label style={LBL}>Descripcion del negocio</label>
              <textarea className="wi" style={{...INP,resize:'vertical',minHeight:90,lineHeight:1.65}} value={descripcion}
                onChange={e=>setDescripcion(e.target.value)}
                placeholder={ph.descripcion||'Ej: Ofrecemos cortes modernos y clasicos para toda la familia...'} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
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
              <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.2)',margin:'8px 0 0',fontWeight:300}}>
                Aqui recibiras resumenes de conversaciones y alertas del bot.
              </p>
            </div>

            <button className="bmain" onClick={crearEmpresa} disabled={loading}>
              {loading
                ?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                    <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>
                    Creando tu agente...
                  </span>
                :'Continuar →'}
            </button>
          </div>
        )}

        {/* ══════ PASO 2 ══════ */}
        {step===2&&cfg&&(
          <div className="aup">
            <h1 style={{fontFamily:FA,fontSize:44,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:8,lineHeight:1.02}}>{cfg.labelCatalogo}</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.3)',fontWeight:300,lineHeight:1.65,margin:'0 0 32px'}}>
              Agrega tus {cfg.labelCatalogo.toLowerCase()} con precios y fotos.
              {cfg.permitePedidos&&<span style={{color:'#6EF0A0',fontWeight:500}}> Los clientes podran hacer pedidos como en un menu digital.</span>}
            </p>

            {items.map((item,idx)=>(
              <div key={idx} style={CARD}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:1}}>{cfg.labelItem} {idx+1}</span>
                  {items.length>1&&<button onClick={()=>setItems(prev=>prev.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:16,padding:'2px 8px'}}>✕</button>}
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
                        <div style={{position:'relative',width:56,height:56}}>
                          <img src={item.foto} style={{width:56,height:56,objectFit:'cover',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)'}}/>
                          <button onClick={()=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,foto:''}:it))}
                            style={{position:'absolute',top:-6,right:-6,background:'#EF4444',border:'none',borderRadius:'50%',width:18,height:18,color:'#fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                        </div>
                      ):(
                        <div onClick={()=>fileRefs.current[idx]?.click()} style={{width:56,height:56,border:'1.5px dashed rgba(255,255,255,0.12)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,0.2)',fontSize:22,transition:'all .15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(37,211,102,0.4)';e.currentTarget.style.color='rgba(37,211,102,0.6)'}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';e.currentTarget.style.color='rgba(255,255,255,0.2)'}}>
                          {item.subiendo?<div style={{width:18,height:18,border:'2px solid rgba(37,211,102,0.2)',borderTop:'2px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>:'+'}
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
                    placeholder={ph['desc'+(idx+1)]||'Descripcion...'} />
                </div>
              </div>
            ))}

            <button className="bda" style={{marginBottom:24}}
              onClick={()=>setItems(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false}])}>
              + Agregar {cfg.labelItem.toLowerCase()}
            </button>

            <div style={CARD}>
              <label style={LBL}>Preguntas frecuentes</label>
              <p style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.2)',margin:'0 0 14px',fontWeight:300}}>El bot respondera estas preguntas automaticamente</p>
              {preguntas.map((p,i)=>(
                <input key={i} className="wi" style={{...INP,marginBottom:9}} value={p}
                  onChange={e=>setPreguntas(prev=>prev.map((x,j)=>j===i?e.target.value:x))}
                  placeholder={ph['pregunta'+(i+1)]||'Ej: Cuanto tiempo demora el servicio?'} />
              ))}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button className="bgh" style={{flex:'0 0 auto',minWidth:110}} onClick={()=>setStep(1)}>← Atras</button>
              <button className="bmain" style={{flex:1}} onClick={guardarCatalogo} disabled={loading}>
                {loading
                  ?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                      <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'}}/>
                      Guardando...
                    </span>
                  :'Conectar WhatsApp →'}
              </button>
            </div>
          </div>
        )}

        {/* ══════ PASO 3: QR ══════ */}
        {step===3&&(
          <div className="aup" style={{textAlign:'center'}}>
            <h1 style={{fontFamily:FA,fontSize:42,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:10,lineHeight:1.02}}>Conecta tu WhatsApp</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.28)',fontWeight:300,marginBottom:40,lineHeight:1.65}}>
              Escanea el codigo QR con tu celular para activar el bot.
            </p>
            {loading&&!qrBase64&&(
              <div style={{padding:'70px 0'}}>
                <div style={{width:48,height:48,border:'3px solid rgba(37,211,102,0.15)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 20px'}}/>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.22)'}}>Preparando tu bot...</div>
              </div>
            )}
            {qrBase64&&(
              <div>
                <div style={{background:'#fff',borderRadius:20,padding:22,display:'inline-block',marginBottom:32,boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
                  <img src={qrBase64} alt="QR" style={{width:230,height:230,display:'block'}}/>
                </div>
                <div style={{...CARD,textAlign:'left',maxWidth:420,margin:'0 auto 24px'}}>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.55)',marginBottom:14,textTransform:'uppercase',letterSpacing:1}}>Como escanear</div>
                  {['Abre WhatsApp en tu celular','Ve a Configuracion - Dispositivos vinculados','Toca Vincular un dispositivo','Escanea el codigo QR de esta pantalla'].map((t,i)=>(
                    <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:10}}>
                      <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:10,fontWeight:700,color:'#25D366',flexShrink:0,marginTop:1}}>{i+1}</div>
                      <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.5}}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:8}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#F59E0B'}}/>
                  <span style={{fontFamily:F,fontSize:12,color:'rgba(245,158,11,0.8)'}}>Esperando que escanees el codigo...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ PASO 4: LISTO ══════ */}
        {step===4&&(
          <div className="aup" style={{textAlign:'center'}}>
            <div style={{width:88,height:88,borderRadius:'50%',background:'rgba(37,211,102,0.08)',border:'1.5px solid rgba(37,211,102,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',animation:'ok 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both'}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:50,fontWeight:400,letterSpacing:'-2px',color:'#25D366',marginBottom:8,lineHeight:1}}>Bot activado</h1>
            {numero&&<div style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.3)',marginBottom:20}}>+{numero}</div>}
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.4)',lineHeight:1.7,fontWeight:300,maxWidth:400,margin:'0 auto 36px'}}>
              Tu WhatsApp ya responde automaticamente. Prueba enviando un mensaje al numero conectado.
            </p>
            <div style={{...CARD,textAlign:'left',maxWidth:440,margin:'0 auto 28px'}}>
              {['Responde preguntas sobre tu negocio','Presenta tu catalogo con precios','Agenda citas cuando el cliente lo pida','Captura nombre y telefono del cliente','Te avisa cuando piden asesor humano'].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'center',marginBottom:i<4?12:0}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(37,211,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.4}}>{t}</span>
                </div>
              ))}
            </div>
            <a href={'/wasapbot/panel/'+empresaId} style={{display:'block',maxWidth:440,margin:'0 auto 10px',background:'linear-gradient(135deg,#25D366,#1DB954)',color:'#fff',borderRadius:14,padding:'15px',fontFamily:F,fontSize:15,fontWeight:700,textAlign:'center',boxShadow:'0 6px 28px rgba(37,211,102,0.3)'}}>
              Ir a mi panel →
            </a>
            <Link href="/wasapbot" style={{display:'block',maxWidth:440,margin:'0 auto',background:'rgba(255,255,255,0.03)',color:'rgba(255,255,255,0.38)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'13px',fontFamily:F,fontSize:13,textAlign:'center'}}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function hexRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? parseInt(r[1],16)+','+parseInt(r[2],16)+','+parseInt(r[3],16) : '148,163,184';
}
