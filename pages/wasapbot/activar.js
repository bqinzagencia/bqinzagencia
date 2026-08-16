// pages/wasapbot/activar.js — v15: paso 2 conectado a solicitud de activacion manual (Meta)
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth, loginWithGoogle } from '../../lib/firebase';
const trackInicioRegistro = () => {};
const trackRegistroCompleto = () => {};
const trackEvent = () => {};

// Ocultar el bot flotante en esta pagina de registro para no distraer al usuario
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-hide-bot', '1');
}

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const WA_SERVER = process.env.NEXT_PUBLIC_WA_SERVER || 'https://bqinzagencia-whatsapp-server-production.up.railway.app';
const WA_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'bqinzagencia2026.';

const DOMINIOS_FALSOS = [
  'tucorreo.com','correo.com','email.com','test.com','prueba.com',
  'ejemplo.com','example.com','fake.com','nomail.com','noemail.com',
  'sinmail.com','temporal.com','temp.com','mimail.com','micorreo.com',
  'tuemail.com','miemail.com','correofalso.com','mailinator.com',
  'guerrillamail.com','throwaway.email','yopmail.com','trashmail.com',
  'tempmail.com','sharklasers.com','spam4.me','dispostable.com',
];

function validarEmail(email) {
  const e = (email||'').trim();
  if (!e) return 'Escribe tu correo';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Correo inválido. Ej: tunombre@gmail.com';
  const dom = e.split('@')[1]?.toLowerCase();
  if (DOMINIOS_FALSOS.includes(dom)) return 'Usa un correo real (Gmail, Outlook, etc.)';
  return null;
}

// ── Paso 1: Datos ── Paso 2: Solicitar activación ── Paso 3: Listo ──
export default function WasapBotActivar() {
  const [paso,      setPaso]      = useState(1); // 1=datos, 2=activacion, 3=listo
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [emailHotmart, setEmailHotmart] = useState(''); // email pre-llenado desde Hotmart
  const [desdeHotmart, setDesdeHotmart] = useState(false);
  const [empresaId, setEmpresaId] = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [trialHoras,setTrialHoras]= useState(0);

  // Email verificado
  const [emailVerificado,   setEmailVerificado]   = useState(false);
  const [verificadoVia,     setVerificadoVia]     = useState('');
  const [gLoading,          setGLoading]          = useState(false);
  const [codigoEnviado,     setCodigoEnviado]     = useState(false);
  const [enviandoCodigo,    setEnviandoCodigo]    = useState(false);
  const [codigoEmail,       setCodigoEmail]       = useState('');
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);

  // Numero de WhatsApp final (paso 3)
  const [numeroWA,   setNumeroWA]   = useState('');

  // Solicitud de activación manual (nueva plataforma Meta)
  const [telefonoActivacion, setTelefonoActivacion] = useState('');
  const [enviandoActivacion, setEnviandoActivacion] = useState(false);
  const [solicitudEnviada,   setSolicitudEnviada]   = useState(false);
  const [errorActivacion,    setErrorActivacion]    = useState('');

  useEffect(() => {
    fetch('/api/wasapbot-precios').then(r=>r.json())
      .then(d=>{ if(d.ok) setTrialHoras(Number(d.promo?.trialHoras)||0); })
      .catch(()=>{});
    trackInicioRegistro();
    // Detectar si viene de Hotmart con email pre-llenado
    const params = new URLSearchParams(window.location.search);
    const emailParam  = params.get('email');
    const fuenteParam = params.get('fuente');
    if (fuenteParam === 'hotmart' && emailParam) {
      const emailLimpio = decodeURIComponent(emailParam).toLowerCase().trim();
      setEmail(emailLimpio);
      setEmailHotmart(emailLimpio);
      setEmailVerificado(true);
      setVerificadoVia('hotmart');
      setDesdeHotmart(true);
    }
  }, []);

  // ── Google ──────────────────────────────────────────────────────────────
  const conectarGoogle = async () => {
    setError(''); setGLoading(true);
    try {
      const result = await loginWithGoogle();
      setEmail(result.user.email||'');
      setEmailVerificado(true);
      setVerificadoVia('google');
      setCodigoEnviado(false); setCodigoEmail('');
    } catch(e) {
      if (e.code !== 'auth/popup-closed-by-user')
        setError('No se pudo conectar con Google. Intenta de nuevo.');
    } finally { setGLoading(false); }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailVerificado || codigoEnviado) {
      setEmailVerificado(false); setVerificadoVia('');
      setCodigoEnviado(false); setCodigoEmail('');
    }
  };

  // ── Código por email ────────────────────────────────────────────────────
  const enviarCodigo = async () => {
    const err = validarEmail(email);
    if (err) { setError(err); return; }
    setError(''); setEnviandoCodigo(true);
    try {
      const r = await fetch('/api/wasapbot-enviar-codigo', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error||'No se pudo enviar el código');
      setCodigoEnviado(true); setCodigoEmail('');
    } catch(e) { setError(e.message); }
    finally { setEnviandoCodigo(false); }
  };

  const verificarCodigo = async () => {
    if (codigoEmail.trim().length !== 6) { setError('Escribe el código de 6 dígitos'); return; }
    setError(''); setVerificandoCodigo(true);
    try {
      const r = await fetch('/api/wasapbot-verificar-codigo', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email.trim(), codigo: codigoEmail.trim() }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error||'Código incorrecto');
      setEmailVerificado(true); setVerificadoVia('codigo');
    } catch(e) { setError(e.message); }
    finally { setVerificandoCodigo(false); }
  };

  // ── Paso 1 → crear empresa + ir a paso 2 ───────────────────────────────
  const crearEmpresa = async () => {
    if (!nombre.trim()) { setError('Escribe el nombre de tu negocio'); return; }
    if (nombre.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return; }
    if (/^(sin nombre|test|prueba|hola|demo|asdf|qwerty)$/i.test(nombre.trim())) { setError('Escribe el nombre real de tu negocio'); return; }
    const errEmail = validarEmail(email);
    if (errEmail) { setError(errEmail); return; }
    if (!emailVerificado) { setError('Verifica tu correo para continuar'); return; }

    setError(''); setLoading(true);
    try {
      // Crear empresa en Firestore
      const r = await fetch('/api/wasapbot-crear', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          nombre: nombre.trim(),
          email:  email.trim(),
          industria: 'otro',
          descripcion: '',
          ciudad: '',
          producto: 'wasapbot',
          ownerUid: auth.currentUser?.uid || null,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);

      const eid = d.empresaId;
      setEmpresaId(eid);
      trackRegistroCompleto({ industria:'otro', ciudad:'' });
      trackEvent('registro_paso1_ok', { metodo_email: verificadoVia });

      setPaso(2);
      setLoading(false);
    } catch(e) {
      setError(e.message);
      setLoading(false);
    }
  };

  // ── Paso 2 → solicitar activación manual (nueva plataforma Meta) ───────
  const solicitarActivacionManual = async () => {
    const tel = telefonoActivacion.replace(/\D/g,'');
    if (tel.length < 9) { setErrorActivacion('Escribe tu numero de WhatsApp con codigo de pais. Ej: 34674421919'); return; }
    setErrorActivacion(''); setEnviandoActivacion(true);
    try {
      const r = await fetch('/api/wasapbot-solicitar-conexion', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ empresaId, nombre: nombre.trim(), email: email.trim(), telefono: tel }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error||'No se pudo enviar la solicitud');
      setNumeroWA(tel);
      setSolicitudEnviada(true);
      trackEvent('solicitud_activacion_manual', {});
    } catch(e) {
      setErrorActivacion(e.message);
    } finally {
      setEnviandoActivacion(false);
    }
  };

  // ── Estilos base ────────────────────────────────────────────────────────
  const INP = {
    width:'100%', background:'#fff', border:'1.5px solid #D1D9F0',
    borderRadius:12, padding:'14px 18px', color:'#111827',
    fontFamily:F, fontSize:16, outline:'none', boxSizing:'border-box',
    transition:'border-color .2s',
  };

  return (
    <>
      <Head>
        <title>Activa tu WasapBot — BQinzagencIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{min-height:100vh;background:linear-gradient(135deg,#0A0E2A 0%,#0D1B3E 40%,#1A3A6B 100%);font-family:${F};-webkit-font-smoothing:antialiased;color:#EFF4FF}
        a{text-decoration:none;color:inherit}
        input{-webkit-appearance:none}
        input:focus{border-color:rgba(43,106,255,.5)!important;box-shadow:0 0 0 3px rgba(43,106,255,.08)!important;outline:none}
        input::placeholder{color:#9CA3AF}
        button{-webkit-tap-highlight-color:transparent;touch-action:manipulation;cursor:pointer}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes ok{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .aup{animation:up .35s ease both}
        .aok{animation:ok .5s cubic-bezier(0.175,0.885,0.32,1.275) both}
      `}}/>

      {/* NAV */}
      <nav style={{
        position:'sticky',top:0,zIndex:100,
        background:'rgba(8,12,40,.97)',backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
        padding:'0 24px',height:58,
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <Link href="/wasapbot">
          <span style={{fontFamily:FA,fontSize:18,letterSpacing:'-.5px',cursor:'pointer'}}>
            BQinzagenc<span style={{color:'#FF6B00'}}>IA</span>
            <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366',
              background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.2)',
              padding:'3px 10px',borderRadius:99,marginLeft:8}}>WasapBot</span>
          </span>
        </Link>
        <Link href="/wasapbot/login"
          style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.6)',fontWeight:600}}>
          Ingresar
        </Link>
      </nav>

      {/* INDICADOR DE PASO */}
      <div style={{background:'rgba(10,14,42,.97)',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'12px 24px'}}>
        <div style={{maxWidth:480,margin:'0 auto',display:'flex',alignItems:'center',gap:8}}>
          {[
            {n:1, label:'Tu negocio'},
            {n:2, label:'Conectar WhatsApp'},
            {n:3, label:'¡Listo!'},
          ].map((s,i)=>{
            const done = paso > s.n;
            const cur  = paso === s.n;
            return (
              <div key={s.n} style={{display:'flex',alignItems:'center',flex: i<2 ? 1 : 'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{
                    width:24,height:24,borderRadius:7,flexShrink:0,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,
            background: done?'#25D366': cur?'rgba(255,107,0,.15)':'rgba(255,255,255,.06)',
                    border: `1px solid ${done?'#1aad4e':cur?'rgba(255,107,0,.4)':'rgba(255,255,255,.1)'}`,
                    color: done?'#fff':cur?'#FF6B00':'rgba(255,255,255,.3)',
                    transition:'all .3s',
                  }}>
                    {done
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : s.n}
                  </div>
                  <span style={{
                    fontFamily:F,fontSize:11,fontWeight:cur?700:400,
                    color:cur?'#EFF4FF':'rgba(255,255,255,.3)',
                    display: cur?'block':'none',
                  }}>{s.label}</span>
                </div>
                {i<2&&<div style={{flex:1,height:1,background:'#E5EAFF',margin:'0 8px'}}/>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:480,margin:'0 auto',padding:'32px 20px 80px'}}>

        {/* ═══ PASO 1: DATOS ═══════════════════════════════════════════════ */}
        {paso===1&&(
          <div className="aup">

            {/* Banner Hotmart — simple y positivo */}
            {desdeHotmart && (
              <div style={{
                display:'flex',alignItems:'center',gap:12,
                background:'#F0FDF4',border:'1px solid #BBF7D0',
                borderRadius:12,padding:'12px 16px',marginBottom:20,
              }}>
                <span style={{fontSize:20,flexShrink:0}}>✅</span>
                <div style={{fontFamily:F,fontSize:13,color:'#166534',lineHeight:1.5}}>
                  <strong>¡Pago confirmado!</strong> Registírate con el mismo correo que usaste en Hotmart para activar tu plan.
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{textAlign:'center',marginBottom:28}}>
              {trialHoras>0&&(
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:8,
                  background:'linear-gradient(135deg,rgba(37,211,102,.12),rgba(37,211,102,.06))',
                  border:'1.5px solid rgba(37,211,102,.4)',
                  borderRadius:14,padding:'8px 16px',marginBottom:18,
                }}>
                  <span style={{fontSize:18}}>🎁</span>
                  <div style={{textAlign:'left'}}>
                    <div style={{fontFamily:F,fontSize:13,fontWeight:800,color:'#25D366'}}>
                      {trialHoras} horas gratis
                    </div>
                    <div style={{fontFamily:F,fontSize:11,color:'rgba(37,211,102,.75)',fontWeight:300}}>
                      Sin tarjeta · Sin contratos
                    </div>
                  </div>
                </div>
              )}
              <img src="/robot-bqinz-v2-texto-nitido.png" alt="BQinzagencIA"
                style={{width:52,height:52,objectFit:'contain',opacity:.5,margin:'0 auto 14px',display:'block'}}/>
              <h1 style={{
                fontFamily:FA,fontSize:34,fontWeight:400,
                letterSpacing:'-1.5px',color:'#EFF4FF',lineHeight:1.05,marginBottom:8,
              }}>
                Activa tu WhatsApp<br/>inteligente
              </h1>
              <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.5)',fontWeight:300,lineHeight:1.7}}>
                Nombre de tu negocio + correo → deja tu numero → te contactamos.<br/>
                <strong style={{color:'#EFF4FF',fontWeight:600}}>Menos de 2 minutos.</strong>
              </p>
            </div>

            {/* Formulario */}
            <div style={{
              background:'#fff',border:'1.5px solid #E5EAFF',
              borderRadius:20,padding:'24px',
              boxShadow:'0 4px 24px rgba(43,106,255,.07)',
              marginBottom:16,
            }}>

              {error&&(
                <div style={{
                  background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.2)',
                  borderRadius:10,padding:'11px 14px',marginBottom:16,
                  fontFamily:F,fontSize:13,color:'#EF4444',
                  display:'flex',alignItems:'center',gap:8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                    <circle cx="12" cy="16" r=".5" fill="#EF4444"/>
                  </svg>
                  {error}
                  <button onClick={()=>setError('')}
                    style={{marginLeft:'auto',background:'none',border:'none',color:'rgba(239,68,68,.5)',fontSize:16,lineHeight:1}}>✕</button>
                </div>
              )}

              {/* Nombre */}
              <div style={{marginBottom:16}}>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',
                  letterSpacing:1.2,color:'#6B7280',display:'block',marginBottom:8}}>
                  Nombre del negocio *
                </label>
                <input
                  style={INP}
                  value={nombre}
                  onChange={e=>setNombre(e.target.value)}
                  placeholder="Ej: Taller Don Jorge, Salón Mía..."
                  autoFocus
                />
              </div>

              {/* Correo */}
              <div style={{marginBottom:20}}>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',
                  letterSpacing:1.2,color:'#6B7280',display:'block',marginBottom:8}}>
                  Correo electrónico *
                </label>

                {emailVerificado ? (
                  <div style={{
                    display:'flex',alignItems:'center',gap:10,
                    background:'rgba(37,211,102,.07)',border:'1px solid rgba(37,211,102,.25)',
                    borderRadius:12,padding:'12px 14px',
                  }}>
                    <div style={{width:26,height:26,borderRadius:8,background:'rgba(37,211,102,.15)',
                      display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#111827',
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email}</div>
                      <div style={{fontFamily:F,fontSize:11,color:'rgba(37,211,102,.85)',marginTop:1}}>
                        {desdeHotmart ? 'Correo del pago Hotmart 🔒' : `Verificado${verificadoVia==='google'?' con Google':''}`}
                      </div>
                    </div>
                    {/* Solo mostrar botón Cambiar si NO viene de Hotmart */}
                    {!desdeHotmart && (
                      <button onClick={()=>{
                        setEmailVerificado(false); setVerificadoVia(''); setEmail('');
                        setCodigoEnviado(false); setCodigoEmail(''); setError('');
                      }} style={{background:'none',border:'none',fontFamily:F,fontSize:11,color:'#9CA3AF'}}>
                        Cambiar
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Google */}
                    <button onClick={conectarGoogle} disabled={gLoading}
                      style={{
                        display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                        width:'100%',minHeight:50,
                        background:'#fff',border:'1.5px solid #D1D9F0',borderRadius:12,
                        fontFamily:F,fontSize:14,fontWeight:600,color:'#111827',
                        marginBottom:10,transition:'all .15s',
                        opacity:gLoading?.6:1,
                        boxShadow:'0 2px 8px rgba(0,0,0,.04)',
                      }}>
                      {gLoading
                        ? <div style={{width:18,height:18,border:'2px solid #D1D9F0',borderTop:'2px solid #2B6AFF',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                        : <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                      }
                      {gLoading?'Conectando...':'Verificar con Google'}
                    </button>

                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{flex:1,height:1,background:'#E5EAFF'}}/>
                      <span style={{fontFamily:F,fontSize:10,color:'#9CA3AF',letterSpacing:1,textTransform:'uppercase'}}>o tu correo</span>
                      <div style={{flex:1,height:1,background:'#E5EAFF'}}/>
                    </div>

                    <div style={{position:'relative',marginBottom:8}}>
                      <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input style={{...INP,paddingLeft:44}}
                        type="email" inputMode="email" autoComplete="email"
                        value={email} onChange={e=>handleEmailChange(e.target.value)}
                        placeholder="tucorreo@gmail.com"/>
                    </div>

                    {!codigoEnviado ? (
                      <button onClick={enviarCodigo} disabled={enviandoCodigo||!email.trim()}
                        style={{
                          width:'100%',background:'none',border:'1.5px dashed #D1D9F0',
                          borderRadius:10,padding:'10px',fontFamily:F,fontSize:13,
                          color: email.trim()?'#6B7280':'#C4C4C4',
                          transition:'all .15s',
                        }}>
                        {enviandoCodigo?'Enviando código...':'Enviar código de verificación →'}
                      </button>
                    ) : (
                      <div style={{background:'#F8FAFF',border:'1px solid #E5EAFF',borderRadius:12,padding:14}}>
                        <p style={{fontFamily:F,fontSize:12,color:'#6B7280',marginBottom:10,lineHeight:1.5}}>
                          Código enviado a <strong style={{color:'#111827'}}>{email}</strong>
                        </p>
                        <div style={{display:'flex',gap:8}}>
                          <input
                            style={{...INP,letterSpacing:6,fontWeight:700,textAlign:'center',flex:1,fontSize:18,padding:'12px'}}
                            value={codigoEmail}
                            onChange={e=>setCodigoEmail(e.target.value.replace(/\D/g,'').slice(0,6))}
                            placeholder="000000" maxLength={6} inputMode="numeric"/>
                          <button onClick={verificarCodigo}
                            disabled={verificandoCodigo||codigoEmail.trim().length!==6}
                            style={{
                              background:'linear-gradient(135deg,#2B6AFF,#1A56E8)',
                              color:'#fff',border:'none',borderRadius:10,
                              padding:'0 18px',fontFamily:F,fontSize:13,fontWeight:700,
                              opacity:(verificandoCodigo||codigoEmail.trim().length!==6)?.5:1,
                            }}>
                            {verificandoCodigo?'...':'OK'}
                          </button>
                        </div>
                        <button onClick={enviarCodigo} disabled={enviandoCodigo}
                          style={{background:'none',border:'none',fontFamily:F,fontSize:11,
                            color:'#9CA3AF',marginTop:8,textDecoration:'underline'}}>
                          {enviandoCodigo?'Enviando...':'Reenviar código'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!emailVerificado&&nombre.trim()&&(
                <p style={{fontFamily:F,fontSize:12,color:'#9CA3AF',textAlign:'center',marginTop:10}}>
                  Verifica tu correo arriba para continuar
                </p>
              )}
            </div>

            {/* Boton sticky fuera del card - siempre visible en movil */}
            <div style={{position:'sticky',bottom:0,zIndex:20,paddingTop:12,paddingBottom:8,background:'linear-gradient(to bottom, transparent, #F0F4FF 40%)'}}>
              <button
                onClick={crearEmpresa}
                disabled={loading||!emailVerificado||!nombre.trim()}
                style={{
                  width:'100%',minHeight:54,border:'none',borderRadius:14,
                  background:(loading||!emailVerificado||!nombre.trim())
                    ?'#D1D9F0'
                    :'linear-gradient(135deg,#FF6B00,#e05a00)',
                  color:(loading||!emailVerificado||!nombre.trim())?'#9CA3AF':'#fff',
                  fontFamily:F,fontSize:16,fontWeight:700,
                  boxShadow:(loading||!emailVerificado||!nombre.trim())
                    ?'none':'0 6px 24px rgba(255,107,0,.35)',
                  transition:'all .2s',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                }}>
                {loading?(
                  <>
                    <div style={{width:18,height:18,border:'2.5px solid rgba(255,255,255,.3)',
                      borderTop:'2.5px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                    Preparando tu bot...
                  </>
                ):(
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.054 23.448a.75.75 0 0 0 .922.922l5.59-1.478A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                    Continuar →
                  </>
                )}
              </button>
            </div>

            {/* Garantías */}
            <div style={{display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
              {['\u2713 Sin tarjeta','\u2713 Sin contratos','\u2713 Gratis para empezar'].map((t,i)=>(
                <span key={i} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500}}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PASO 2: SOLICITAR ACTIVACIÓN ══════════════════════════════════ */}
        {paso===2&&(
          <div className="aup">

            <div style={{textAlign:'center',marginBottom:16}}>
              <h2 style={{fontFamily:FA,fontSize:28,color:'#EFF4FF',letterSpacing:'-1px',marginBottom:4}}>
                Conecta tu WhatsApp
              </h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.45)',fontWeight:300}}>
                Te contactamos para completar la activación
              </p>
            </div>

            {!solicitudEnviada ? (
              <div style={{background:'#fff',border:'1.5px solid #E5EAFF',borderRadius:16,padding:'20px',marginBottom:12,textAlign:'left'}}>
                <p style={{fontFamily:F,fontSize:13,color:'#6B7280',marginBottom:14,lineHeight:1.6}}>
                  Estamos completando la integración con la plataforma oficial de WhatsApp (Meta).
                  Déjanos tu número y activaremos tu bot en menos de 24 horas.
                </p>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',
                  letterSpacing:1.2,color:'#6B7280',display:'block',marginBottom:8}}>
                  Tu numero de WhatsApp *
                </label>
                <input value={telefonoActivacion} onChange={e=>setTelefonoActivacion(e.target.value)}
                  placeholder="34674421919" inputMode="tel"
                  style={{...INP,marginBottom:10}}/>
                <div style={{fontFamily:F,fontSize:11,color:'#9CA3AF',marginBottom:14}}>
                  España: 34 + numero sin el 0 inicial
                </div>

                {errorActivacion&&(
                  <div style={{fontFamily:F,fontSize:12,color:'#EF4444',marginBottom:10}}>{errorActivacion}</div>
                )}

                <button onClick={solicitarActivacionManual} disabled={enviandoActivacion}
                  style={{
                    width:'100%',background:'linear-gradient(135deg,#25D366,#1aad4e)',
                    color:'#fff',border:'none',borderRadius:10,
                    padding:'13px',fontFamily:F,fontSize:14,fontWeight:700,
                    boxShadow:'0 4px 16px rgba(37,211,102,.3)',
                    opacity:enviandoActivacion?.6:1,
                  }}>
                  {enviandoActivacion?'Enviando...':'Solicitar activación →'}
                </button>
              </div>
            ) : (
              <div style={{background:'#F0FDF4',border:'2px solid #25D366',borderRadius:16,padding:'20px',marginBottom:12,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#111827',marginBottom:6}}>
                  ¡Solicitud recibida!
                </div>
                <div style={{fontFamily:F,fontSize:13,color:'#6B7280',lineHeight:1.6}}>
                  Te contactaremos al numero +{telefonoActivacion.replace(/\D/g,'')} para activar tu WhatsApp en menos de 24 horas.
                </div>
              </div>
            )}

            <button onClick={()=>{ window.location.href='/wasapbot/panel/'+empresaId; }}
              style={{background:'none',border:'none',fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.4)',textDecoration:'underline',display:'block',margin:'8px auto 0',cursor:'pointer'}}>
              Ir a mi panel →
           Te contactamos para completar la activación
 </button>
          </div>
        )}

      </div>
    </>
  );
}