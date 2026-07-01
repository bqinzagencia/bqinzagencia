// pages/wasapbot/activar.js — v13: 24h gratis + modal industria en paso 3
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth, loginWithGoogle } from '../../lib/firebase';

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

const INDUSTRIAS = [
  { id:'restaurante',   emoji:'🍽️', label:'Restaurante' },
  { id:'taller',        emoji:'🔧', label:'Taller / Mecánica' },
  { id:'peluqueria',    emoji:'✂️', label:'Peluquería / Spa' },
  { id:'barberia',      emoji:'💈', label:'Barbería' },
  { id:'veterinaria',   emoji:'🐾', label:'Veterinaria' },
  { id:'reposteria',    emoji:'🎂', label:'Repostería / Chef' },
  { id:'tienda',        emoji:'🏪', label:'Tienda / Comercio' },
  { id:'farmacia',      emoji:'💊', label:'Farmacia / Droguería' },
  { id:'clinica',       emoji:'🏥', label:'Clínica / Estética' },
  { id:'inmobiliaria',  emoji:'🏠', label:'Inmobiliaria' },
  { id:'fotografia',    emoji:'📷', label:'Fotografía' },
  { id:'otro',          emoji:'💼', label:'Otro negocio' },
];

function validarEmailFormato(email) {
  const e = (email || '').trim();
  if (!e) return 'Escribe tu correo electrónico';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(e)) return 'El correo no tiene un formato válido. Ej: tunombre@gmail.com';
  const dominio = e.split('@')[1]?.toLowerCase();
  if (DOMINIOS_FALSOS.includes(dominio)) return 'Por favor usa un correo real (Gmail, Outlook, tu empresa, etc.)';
  return null;
}

function Countdown({ seconds, total }) {
  const pct = seconds / total;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto 10px' }}>
      <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(37,211,102,.12)" strokeWidth="4" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#25D366" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s linear', strokeLinecap: 'round' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontSize: 20, fontWeight: 800, color: '#25D366' }}>
        {seconds}
      </div>
    </div>
  );
}

export default function WasapBotActivar() {
  const [step, setStep]           = useState(1); // 1=form 2=QR 3=industria 4=listo
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Paso 1
  const [nombre, setNombre]       = useState('');
  const [email, setEmail]         = useState('');
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [verificadoVia, setVerificadoVia]     = useState('');
  const [gLoading, setGLoading]   = useState(false);
  const [codigoEnviado, setCodigoEnviado]     = useState(false);
  const [enviandoCodigo, setEnviandoCodigo]   = useState(false);
  const [codigoEmail, setCodigoEmail]         = useState('');
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);

  // Paso 2 — QR
  const [empresaId, setEmpresaId] = useState('');
  const [qrBase64, setQrBase64]   = useState('');
  const [countdown, setCountdown] = useState(60);
  const [countdownTotal]          = useState(60);
  const [numero, setNumero]       = useState('');

  // Paso 2 — Pairing Code (alternativa sin QR, clave para móvil)
  const [mostrarPairing, setMostrarPairing]   = useState(false);
  const [telefonoPairing, setTelefonoPairing] = useState('');
  const [pairingCode, setPairingCode]         = useState('');
  const [pidiendoPairing, setPidiendoPairing] = useState(false);
  const [pairingError, setPairingError]       = useState('');

  // Paso 3 — Industria
  const [industriaSel, setIndustriaSel]   = useState('');
  const [guardandoInd, setGuardandoInd]   = useState(false);

  const INP = {
    width: '100%', background: '#F8FAFF', border: '1.5px solid #E2E8F4',
    borderRadius: 12, padding: '14px 18px', color: '#1A202C',
    fontFamily: F, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', transition: 'all .22s',
  };

  // ─── Google ───────────────────────────────────────────────────────────────
  const conectarConGoogle = async () => {
    setError(''); setGLoading(true);
    try {
      const result = await loginWithGoogle();
      setEmail(result.user.email || '');
      setEmailVerificado(true); setVerificadoVia('google');
      setCodigoEnviado(false); setCodigoEmail('');
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user')
        setError('No se pudo conectar con Google. Intenta de nuevo o usa tu correo.');
    } finally { setGLoading(false); }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailVerificado || codigoEnviado) {
      setEmailVerificado(false); setVerificadoVia('');
      setCodigoEnviado(false); setCodigoEmail('');
    }
  };

  const usarOtroCorreo = () => {
    setEmailVerificado(false); setVerificadoVia(''); setEmail('');
    setCodigoEnviado(false); setCodigoEmail(''); setError('');
  };

  const enviarCodigoVerificacion = async () => {
    const err = validarEmailFormato(email);
    if (err) { setError(err); return; }
    setError(''); setEnviandoCodigo(true);
    try {
      const r = await fetch('/api/wasapbot-enviar-codigo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'No se pudo enviar el código');
      setCodigoEnviado(true); setCodigoEmail('');
    } catch (e) { setError(e.message); }
    finally { setEnviandoCodigo(false); }
  };

  const verificarCodigoEmail = async () => {
    if (codigoEmail.trim().length !== 6) { setError('Escribe el código de 6 dígitos'); return; }
    setError(''); setVerificandoCodigo(true);
    try {
      const r = await fetch('/api/wasapbot-verificar-codigo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), codigo: codigoEmail.trim() }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Código incorrecto');
      setEmailVerificado(true); setVerificadoVia('codigo');
    } catch (e) { setError(e.message); }
    finally { setVerificandoCodigo(false); }
  };

  // ─── Activar → QR ─────────────────────────────────────────────────────────
  const activar = async () => {
    if (!nombre.trim()) { setError('Escribe el nombre de tu negocio'); return; }
    const errEmail = validarEmailFormato(email);
    if (errEmail) { setError(errEmail); return; }
    if (!emailVerificado) { setError('Verifica tu correo electrónico para continuar.'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/wasapbot-crear', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre, industria: 'otro', descripcion: '', email, ciudad: '',
          producto: 'wasapbot', ownerUid: auth.currentUser?.uid || null,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setEmpresaId(d.empresaId);
      if (typeof window !== 'undefined')
        localStorage.setItem('wasapbot_nuevo_' + d.empresaId, '1');
      await fetch(WA_SERVER + '/sesion/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': WA_SECRET },
        body: JSON.stringify({ empresaId: d.empresaId }),
      });
      setStep(2);
      pollQR(d.empresaId);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // ─── Polling QR ───────────────────────────────────────────────────────────
  const pollQR = (eid) => {
    let n = 0;
    let secs = 60;
    const timerInterval = setInterval(() => {
      secs = Math.max(0, secs - 1);
      setCountdown(secs);
    }, 1000);

    const check = async () => {
      if (n++ > 80) { clearInterval(timerInterval); setError('Tiempo agotado. Recarga e intenta de nuevo.'); return; }
      const r = await fetch(WA_SERVER + '/sesion/' + eid + '/qr', {
        headers: { 'x-server-secret': WA_SECRET },
      }).catch(() => null);
      const data = r ? await r.json().catch(() => ({})) : {};
      if (data.status === 'connected') {
        clearInterval(timerInterval);
        setNumero(data.numero || '');
        setStep(3); // → selección de industria
        return;
      }
      if (data.qrBase64) { setQrBase64(data.qrBase64); setCountdown(60); secs = 60; }
      setTimeout(check, 2500);
    };
    check();
  };

  // ─── Pairing Code (alternativa sin QR) ─────────────────────────────────────
  const pollPairingConexion = (eid) => {
    let n = 0;
    const check = async () => {
      if (n++ > 80) return;
      const r = await fetch(WA_SERVER + '/sesion/' + eid + '/qr', { headers: { 'x-server-secret': WA_SECRET } }).catch(() => null);
      const data = r ? await r.json().catch(() => ({})) : {};
      if (data.status === 'connected') { setNumero(data.numero || ''); setStep(3); return; }
      setTimeout(check, 2500);
    };
    check();
  };

  const solicitarPairingCode = async () => {
    const num = telefonoPairing.replace(/\D/g, '');
    if (num.length < 8) { setPairingError('Escribe un número válido con código de país (ej: +34674421919)'); return; }
    setPairingError(''); setPidiendoPairing(true);
    try {
      await fetch(WA_SERVER + '/sesion/' + empresaId + '/iniciar-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': WA_SECRET },
        body: JSON.stringify({ numero: num }),
      });
      let intentos = 0;
      const poll = async () => {
        if (intentos++ > 20) { setPairingError('No se pudo generar el código. Intenta de nuevo.'); setPidiendoPairing(false); return; }
        const r = await fetch(WA_SERVER + '/sesion/' + empresaId + '/pairing-code', { headers: { 'x-server-secret': WA_SECRET } }).catch(() => null);
        const d = r ? await r.json().catch(() => ({})) : {};
        if (d.pairingCode) { setPairingCode(d.pairingCode); setPidiendoPairing(false); pollPairingConexion(empresaId); return; }
        setTimeout(poll, 1500);
      };
      poll();
    } catch (e) {
      setPairingError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setPidiendoPairing(false);
    }
  };

  // ─── Guardar industria ────────────────────────────────────────────────────
  const guardarIndustria = async (ind) => {
    setGuardandoInd(true);
    try {
      await fetch('/api/wasapbot-panel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'actualizarIndustria', empresaId, industria: ind }),
      });
    } catch {}
    setGuardandoInd(false);
    setStep(4);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Activar WasapBot — BQinzagencIA</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#EEF1FA;color:#1A202C;font-family:${F};min-height:100vh}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ok{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .aup{animation:up .3s cubic-bezier(.4,0,.2,1) both}
        .inp-focus:focus{border-color:#25D366!important;box-shadow:0 0 0 3px rgba(37,211,102,.12)!important;background:#fff!important}
        .inp-focus::placeholder{color:#A0AEC0}
        .g-btn:hover:not(:disabled){background:#f1f5f9!important;border-color:#cbd5e0!important}
        .btn-main{width:100%;border:none;border-radius:14px;padding:16px 24px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#25D366,#1aad4e);color:#fff;box-shadow:0 4px 20px rgba(37,211,102,.28);transition:all .2s;display:flex;align-items:center;justify-content:center;gap:9px}
        .btn-main:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 32px rgba(37,211,102,.38)}
        .btn-main:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
        .btn-sec{background:none;border:1.5px solid #E2E8F4;border-radius:12px;padding:12px 18px;font-family:${F};font-size:13px;font-weight:600;cursor:pointer;color:#64748B;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:7px}
        .btn-sec:hover{background:#F1F5F9;border-color:#CBD5E0}
        .code-input{width:100%;text-align:center;letter-spacing:0.6em;font-size:26px;font-weight:800;color:#1A202C;background:#F8FAFF;border:2px solid #E2E8F4;border-radius:14px;padding:16px;font-family:${F};outline:none;transition:all .2s}
        .code-input:focus{border-color:#25D366;box-shadow:0 0 0 3px rgba(37,211,102,.12)}
        .ind-card{background:#fff;border:1.5px solid #E8EDF5;border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px;font-family:${F};font-size:14px;font-weight:600;color:#1A202C}
        .ind-card:hover{border-color:#25D366;background:#F0FDF4;transform:translateY(-1px);box-shadow:0 4px 16px rgba(37,211,102,.12)}
        .ind-card.sel{border-color:#22C55E;background:#F0FDF4;box-shadow:0 0 0 3px rgba(37,211,102,.15)}
        @media(max-width:480px){h1{font-size:38px!important}}
      ` }} />

      {/* NAV */}
      <nav style={{ background: 'rgba(238,241,250,.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,.06)', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/wasapbot">
          <span style={{ fontFamily: FA, fontSize: 17, cursor: 'pointer', letterSpacing: '-.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
            BQinz<span style={{ color: '#FF6B00' }}>agenc</span>IA
            <span style={{ color: '#25D366', fontSize: 10, fontFamily: F, fontWeight: 700, background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.25)', padding: '2px 9px', borderRadius: 99 }}>WasapBot</span>
          </span>
        </Link>
        <Link href="/wasapbot/login" style={{ fontFamily: F, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
          Ya tengo cuenta →
        </Link>
      </nav>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 100px' }}>

        {/* ERROR */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontFamily: F, fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="#DC2626" /></svg>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 15 }}>✕</button>
          </div>
        )}

        {/* ══ PASO 1 — FORMULARIO ══ */}
        {step === 1 && (
          <div className="aup">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(37,211,102,.1)', border: '1.5px solid rgba(37,211,102,.3)', borderRadius: 99, padding: '7px 16px', marginBottom: 22 }}>
                <span style={{ fontSize: 16 }}>🎁</span>
                <div>
                  <div style={{ fontFamily: F, fontSize: 13, fontWeight: 800, color: '#16A34A', lineHeight: 1.1 }}>24 horas gratis</div>
                  <div style={{ fontFamily: F, fontSize: 10, color: '#16A34A', opacity: .75 }}>Sin tarjeta · Sin contratos</div>
                </div>
              </div>
              <img src="/agenciame-robot-final.png" alt="" style={{ width: 52, height: 52, objectFit: 'contain', display: 'block', margin: '0 auto 14px', opacity: .85 }} />
              <h1 style={{ fontFamily: FA, fontSize: 44, fontWeight: 400, letterSpacing: '-2px', color: '#0F172A', lineHeight: 1.05, marginBottom: 10 }}>
                Activa tu WhatsApp<br />inteligente
              </h1>
              <p style={{ fontFamily: F, fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>
                Nombre de tu negocio + correo → escaneas un QR → listo.<br />
                <strong style={{ color: '#0F172A' }}>Menos de 2 minutos.</strong>
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,.07)', border: '1px solid #E8EDF5' }}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Nombre del negocio *</label>
                <input className="inp-focus" style={INP} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Taller Don Jorge, Salón Mía..." />
              </div>

              <div>
                <label style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Correo electrónico *</label>

                {emailVerificado ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: '#15803D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
                      <div style={{ fontFamily: F, fontSize: 11, color: '#4ADE80' }}>Verificado con {verificadoVia === 'google' ? 'Google' : 'código'}</div>
                    </div>
                    <button onClick={usarOtroCorreo} style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 11, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Cambiar</button>
                  </div>
                ) : (
                  <>
                    <button id="google-btn" className="g-btn" onClick={conectarConGoogle} disabled={gLoading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: '#fff', border: '1.5px solid #E2E8F4', borderRadius: 12, padding: '13px 18px', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14, transition: 'all .18s', opacity: gLoading ? .6 : 1 }}>
                      {gLoading
                        ? <span style={{ width: 18, height: 18, border: '2px solid #E2E8F4', borderTop: '2px solid #4285F4', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
                        : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      }
                      Verificar con Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ flex: 1, height: 1, background: '#E8EDF5' }} />
                      <span style={{ fontFamily: F, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>O TU CORREO</span>
                      <div style={{ flex: 1, height: 1, background: '#E8EDF5' }} />
                    </div>

                    <div style={{ position: 'relative', marginBottom: 10 }}>
                      <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input className="inp-focus" style={{ ...INP, paddingLeft: 42 }} value={email} onChange={e => handleEmailChange(e.target.value)} placeholder="tucorreo@gmail.com" />
                    </div>

                    {!codigoEnviado ? (
                      <button className="btn-sec" style={{ width: '100%' }} onClick={enviarCodigoVerificacion} disabled={enviandoCodigo}>
                        {enviandoCodigo ? <><span style={{ width: 14, height: 14, border: '2px solid #CBD5E0', borderTop: '2px solid #64748B', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Enviando...</> : <>Enviar código de verificación →</>}
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontFamily: F, fontSize: 12, color: '#64748B', marginBottom: 10, textAlign: 'center' }}>Código enviado a <strong>{email}</strong></p>
                        <input className="code-input" value={codigoEmail} onChange={e => setCodigoEmail(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} />
                        <button className="btn-main" style={{ marginTop: 10 }} onClick={verificarCodigoEmail} disabled={verificandoCodigo || codigoEmail.length !== 6}>
                          {verificandoCodigo ? <><span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Verificando...</> : 'Verificar código'}
                        </button>
                        <button onClick={enviarCodigoVerificacion} style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 12, color: '#64748B', cursor: 'pointer', display: 'block', margin: '10px auto 0', textDecoration: 'underline' }}>Reenviar código</button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button className="btn-main" style={{ marginTop: 24 }} onClick={activar} disabled={loading || !nombre.trim() || !emailVerificado}>
                {loading
                  ? <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Activando...</>
                  : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>Activar mi WhatsApp →</>}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
              {['Sin tarjeta', 'Sin contratos', 'Gratis para empezar'].map(t => (
                <span key={t} style={{ fontFamily: F, fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══ PASO 2 — QR ══ */}
        {step === 2 && (
          <div className="aup" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: FA, fontSize: 38, fontWeight: 400, letterSpacing: '-1.5px', color: '#0F172A', marginBottom: 10 }}>Escanea con tu WhatsApp</h1>
            <p style={{ fontFamily: F, fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 28 }}>
              Abre WhatsApp en el móvil del negocio<br />y apunta la cámara al código
            </p>

            {/* Alternativa: conectar con código (sin QR) — clave para móvil */}
            {!mostrarPairing ? (
              <button onClick={() => setMostrarPairing(true)} style={{ marginBottom: 24, width: '100%', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 14, padding: '14px 18px', fontFamily: F, fontSize: 13, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                📱 ¿Estás en el móvil y no puedes escanear el QR? Conectar con código
              </button>
            ) : (
              <div style={{ marginBottom: 24, background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 16, padding: 20, textAlign: 'left' }}>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 10 }}>Conectar con código (sin escanear)</div>
                {!pairingCode ? (
                  <>
                    <p style={{ fontFamily: F, fontSize: 12, color: '#3B82F6', marginBottom: 10, lineHeight: 1.6 }}>Escribe el número de WhatsApp del negocio con el código de país.</p>
                    <input className="inp-focus" style={{ ...INP, marginBottom: 10, background: '#fff' }} value={telefonoPairing} onChange={e => setTelefonoPairing(e.target.value.replace(/[^\d+]/g, ''))} placeholder="+34674421919" />
                    {pairingError && <p style={{ fontFamily: F, fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{pairingError}</p>}
                    <button className="btn-sec" style={{ width: '100%', background: '#fff' }} onClick={solicitarPairingCode} disabled={pidiendoPairing || telefonoPairing.replace(/\D/g, '').length < 8}>
                      {pidiendoPairing ? 'Generando código...' : 'Obtener código →'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: F, fontSize: 12, color: '#3B82F6', marginBottom: 10, lineHeight: 1.6 }}>Abre WhatsApp → Ajustes → Dispositivos vinculados → Vincular con número de teléfono, e ingresa:</p>
                    <div style={{ textAlign: 'center', fontFamily: F, fontSize: 26, fontWeight: 800, letterSpacing: '0.15em', color: '#1D4ED8', background: '#fff', border: '2px solid #BFDBFE', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                      {pairingCode}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #BFDBFE', borderRadius: 99, padding: '8px 16px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1.5s ease infinite' }} />
                      <span style={{ fontFamily: F, fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>Esperando que lo ingreses...</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'inline-block', background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 12px 48px rgba(0,0,0,.1)', border: '2.5px solid #22C55E', marginBottom: 24 }}>
              {qrBase64
                ? <img src={qrBase64} alt="QR WhatsApp" style={{ width: 220, height: 220, display: 'block' }} />
                : (
                  <div style={{ width: 220, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(37,211,102,.15)', borderTop: '3px solid #25D366', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
                    <span style={{ fontFamily: F, fontSize: 12, color: '#94A3B8' }}>Generando QR...</span>
                  </div>
                )}
            </div>

            {qrBase64 && (<><Countdown seconds={countdown} total={countdownTotal} /><p style={{ fontFamily: F, fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>segundos para escanear</p></>)}

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 99, padding: '9px 18px', marginBottom: 28 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ fontFamily: F, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Esperando que escanees...</span>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', textAlign: 'left', border: '1px solid #E8EDF5', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>CÓMO ESCANEAR</div>
              {['Abre WhatsApp en el celular del negocio', 'Ve a Ajustes → Dispositivos vinculados', 'Toca "Vincular un dispositivo"', 'Apunta la cámara al código de arriba'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? 12 : 0 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontSize: 11, fontWeight: 700, color: '#25D366', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontFamily: F, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PASO 3 — INDUSTRIA ══ */}
        {step === 3 && (
          <div className="aup">
            {/* Icono de negocio */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,107,0,.1)', border: '1.5px solid rgba(255,107,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
                🏪
              </div>
              <h1 style={{ fontFamily: FA, fontSize: 36, fontWeight: 400, letterSpacing: '-1.5px', color: '#0F172A', lineHeight: 1.1, marginBottom: 10 }}>
                ¿A qué se dedica<br />tu negocio?
              </h1>
              <p style={{ fontFamily: F, fontSize: 14, color: '#64748B', lineHeight: 1.7 }}>
                Elige el tipo de negocio para que el bot use el vocabulario correcto y el panel se adapte a tu industria.
              </p>
            </div>

            {/* Grid de industrias */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {INDUSTRIAS.map(ind => (
                <button key={ind.id}
                  className={`ind-card${industriaSel === ind.id ? ' sel' : ''}`}
                  onClick={() => setIndustriaSel(ind.id)}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{ind.emoji}</span>
                  <span>{ind.label}</span>
                  {industriaSel === ind.id && (
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>

            <button className="btn-main" onClick={() => guardarIndustria(industriaSel || 'otro')} disabled={guardandoInd}>
              {guardandoInd
                ? <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />Configurando...</>
                : <>Configurar mi panel →</>}
            </button>
            <button onClick={() => setStep(4)} style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 12, color: '#94A3B8', cursor: 'pointer', display: 'block', margin: '12px auto 0', textDecoration: 'underline' }}>
              Omitir — puedo cambiarlo después en Configuración
            </button>
          </div>
        )}

        {/* ══ PASO 4 — ¡LISTO! ══ */}
        {step === 4 && (
          <div className="aup" style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'ok .6s cubic-bezier(0.175,0.885,0.32,1.275) both', boxShadow: '0 0 40px rgba(34,197,94,.15)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>

            <h1 style={{ fontFamily: FA, fontSize: 50, fontWeight: 400, letterSpacing: '-2.5px', color: '#16A34A', marginBottom: 4, lineHeight: 1 }}>¡WhatsApp activo!</h1>
            {numero && (
              <div style={{ fontFamily: F, fontSize: 14, color: '#64748B', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                +{numero}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', textAlign: 'left', border: '1px solid #E8EDF5', boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 24 }}>
              <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                TU WHATSAPP ACABA DE RECIBIR
              </div>
              <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 16px', fontFamily: F, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                <strong style={{ color: '#15803D' }}>Bot de {nombre || 'bqinz'} :</strong> ¡Hola! 🤖 Soy el asistente inteligente de <strong>{nombre || 'bqinz'}</strong>. Ya estoy activo y listo para atender a tus clientes las 24 horas. Escríbeme algo para probarme 👋
              </div>
            </div>

            <p style={{ fontFamily: F, fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 28 }}>
              Desde el panel puedes agregar tus servicios, precios<br />y horarios para que el bot responda con información real de tu negocio.
            </p>

            <a href={'/wasapbot/panel/' + empresaId}
              style={{ display: 'flex', background: '#16A34A', color: '#fff', borderRadius: 14, padding: '16px 24px', fontFamily: F, fontSize: 15, fontWeight: 700, boxShadow: '0 6px 24px rgba(22,163,74,.3)', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 12, textDecoration: 'none' }}>
              Ir a mi panel
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
            <Link href="/wasapbot" style={{ display: 'block', background: '#F1F5F9', color: '#64748B', borderRadius: 14, padding: '14px', fontFamily: F, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
