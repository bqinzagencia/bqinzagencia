// pages/auth/register.js
// Registro con social login + formulario por pasos — NEXOIA

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  registerUser, crearEmpresa, getEmpresa,
  loginWithGoogle, loginWithGithub, loginWithMicrosoft,
  auth
} from '../../lib/firebase';
import { INDUSTRIAS } from '../../lib/utils';

const G = '#2563EB';
const G2 = '#06B6D4';
const BG = '#0F1623';

// Detecta si ya existe empresa para el usuario social
async function completarRegistroSocial(user, datos) {
  const empresa = await getEmpresa(user.uid);
  if (!empresa) {
    await crearEmpresa(user.uid, {
      email: user.email,
      nombreEmpresa: datos.nombreEmpresa,
      telefono: datos.telefono,
      ciudad: datos.ciudad,
      industria: datos.industria,
      plan: datos.plan || 'emprendedor',
      fotoUrl: user.photoURL || '',
      displayName: user.displayName || '',
    });
  }
}

export default function Register() {
  const router = useRouter();
  const { plan } = router.query;

  // Flujo: 'social-choice' | 'form-step0' | 'form-step1' | 'form-step2' | 'social-complete'
  const [flow, setFlow] = useState('social-choice');
  const [socialUser, setSocialUser] = useState(null); // usuario ya autenticado con social
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    nombreEmpresa: '', telefono: '', ciudad: '',
    industria: '',
    plan: plan || 'emprendedor',
  });

  // Fotos por industria para el fondo
  const INDUSTRY_PHOTOS = {
    taller: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1400&q=80',
    peluqueria: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80',
    inmobiliaria: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80',
    restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
    tienda: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80',
    gimnasio: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
    salud: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80',
    papeleria: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
    educacion: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80',
    otro: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1400&q=80',
  };
  // bgPhoto usa una ref para no re-renderizar mientras el popup de Google esta abierto
  // El fondo solo cambia cuando el usuario llega al step de industria, no antes
  const bgPhoto = (flow === 'form-step2' || flow === 'social-industry') && form.industria
    ? (INDUSTRY_PHOTOS[form.industria] || INDUSTRY_PHOTOS.otro)
    : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=70';

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Si hay usuario logueado con social, completar datos
  useEffect(() => {
    if (socialUser && flow === 'social-complete') {
      // Pre-llenar con datos del proveedor social
      if (socialUser.displayName) {
        set('nombreEmpresa', socialUser.displayName);
      }
    }
  }, [socialUser, flow]);

  // ── Social login handlers ─────────────────────────────────────────────────
  const handleSocial = async (provider) => {
    setSocialLoading(provider);
    try {
      let result;
      if (provider === 'google') result = await loginWithGoogle();
      else if (provider === 'github') result = await loginWithGithub();
      else if (provider === 'microsoft') result = await loginWithMicrosoft();

      const user = result.user;
      setSocialUser(user);

      // Verificar si ya tiene empresa (ya registrado antes)
      const empresa = await getEmpresa(user.uid);
      if (empresa) {
        toast.success('¡Bienvenido de nuevo, ' + (user.displayName || user.email) + '!');
        router.push('/dashboard');
        return;
      }

      // Nuevo usuario — completar datos del negocio
      set('email', user.email || '');
      toast.success('✅ ' + (user.displayName || user.email) + ' conectado. Completa los datos de tu negocio.');
      setFlow('social-complete');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Error al conectar: ' + (err.message || 'intenta de nuevo'));
      }
    } finally {
      setSocialLoading('');
    }
  };

  // ── Registro con email ────────────────────────────────────────────────────
  const nextStep = () => {
    if (flow === 'form-step0') {
      if (!form.email || !form.password) { toast.error('Completa correo y contraseña'); return; }
      if (form.password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
      if (form.password !== form.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
      setFlow('form-step1');
    } else if (flow === 'form-step1') {
      if (!form.nombreEmpresa || !form.telefono) { toast.error('Completa nombre y teléfono'); return; }
      setFlow('form-step2');
    }
  };

  const handleSubmitEmail = async () => {
    if (!form.industria) { toast.error('Selecciona tu industria'); return; }
    setLoading(true);
    try {
      const cred = await registerUser(form.email, form.password);
      await crearEmpresa(cred.user.uid, {
        email: form.email,
        nombreEmpresa: form.nombreEmpresa,
        telefono: form.telefono,
        ciudad: form.ciudad,
        industria: form.industria,
        plan: form.plan,
      });
      toast.success('¡Bienvenido a NEXOIA! 🎉');
      router.push('/dashboard');
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Ya existe una cuenta con ese correo',
        'auth/invalid-email': 'Correo inválido',
        'auth/weak-password': 'Contraseña muy débil',
      };
      toast.error(msgs[err.code] || 'Error al crear la cuenta');
    } finally { setLoading(false); }
  };

  const handleSubmitSocial = async () => {
    if (!form.industria) { toast.error('Selecciona tu industria'); return; }
    if (!form.nombreEmpresa || !form.telefono) { toast.error('Completa nombre y teléfono'); return; }
    setLoading(true);
    try {
      await completarRegistroSocial(socialUser, { ...form });
      toast.success('¡Bienvenido a NEXOIA! 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Error al guardar datos: ' + err.message);
    } finally { setLoading(false); }
  };

  // ── Estilos base ──────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #222', borderRadius: 4,
    padding: '13px 16px', color: '#E8E8E8', fontSize: 14, outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'border-color 0.2s',
    marginBottom: 16,
  };

  const labelStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 600,
    letterSpacing: 1.5, textTransform: 'uppercase', color: '#333', marginBottom: 8, display: 'block',
  };

  const btnLima = {
    width: '100%', background: G, color: '#fff', border: 'none', borderRadius: 4,
    padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: 0.3,
    transition: 'all 0.2s',
  };

  const socialBtn = (disabled) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', background: disabled ? '#0E0E0E' : '#111',
    border: '1px solid #1E1E1E', borderRadius: 4,
    padding: '13px 20px', cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? '#333' : '#E8E8E8', fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400,
    transition: 'all 0.2s', marginBottom: 10,
    opacity: disabled ? 0.5 : 1,
  });

  const stepProgress = (current) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {['Acceso', 'Negocio', 'Industria'].map((s, i) => {
        const stepNum = { 'form-step0': 0, 'form-step1': 1, 'form-step2': 2, 'social-complete': 1 }[flow] ?? 0;
        const active = i <= stepNum;
        return (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 1, background: active ? G : '#1A1A1A', marginBottom: 6, transition: 'background 0.3s' }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: active ? G : '#222', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Head>
        <title>Crear cuenta — NEXOIA</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; color: #E8E8E8; font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        input:focus { border-color: ${G} !important; outline: none; }
        input::placeholder { color: #333; }
        .social-btn:hover { border-color: rgba(37,99,235,0.4) !important; background: #141C2F !important; }
        .ind-btn:hover { border-color: rgba(37,99,235,0.3) !important; }
        .ind-btn.active { background: rgba(37,99,235,0.12) !important; border-color: #2563EB !important; color: #60A5FA !important; }
        .btn-back { background: transparent; color: #4B5563; border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 13px 20px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-back:hover { border-color: rgba(255,255,255,0.2); color: #9AAAC4; }
      `}</style>

      {/* Fondo con foto sutil */}
      <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(' + bgPhoto + ')', backgroundSize: 'cover', backgroundPosition: 'center', filter: (flow === 'form-step2' || flow === 'social-industry') && form.industria ? 'brightness(0.18)' : 'brightness(0.06)', zIndex: 0, transition: 'all 1s ease' }} />
        <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 30%, ${G}04, transparent)`, zIndex: 0 }} />

        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link href="/">
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 28, color: '#E8E8E8', cursor: 'pointer', display: 'inline-block' }}>
                agenc<span style={{ color: '#FF6B00', fontSize: 32 }}>IA</span>me
              </div>
            </Link>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 600, marginTop: 20, marginBottom: 6, color: '#E8E8E8' }}>
              {flow === 'social-choice' ? 'Crea tu cuenta gratis' : flow === 'social-complete' ? 'Completa tu perfil' : 'Crea tu cuenta'}
            </h1>
            <p style={{ color: '#2A2A2A', fontSize: 13 }}>14 días de prueba · Sin tarjeta de crédito</p>
          </div>

          <div style={{ background: '#0C0C0C', border: '1px solid #161616', borderRadius: 8, padding: 32 }}>

            {/* ── PANTALLA INICIAL: Social + opción email ── */}
            {flow === 'social-choice' && (
              <>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 20, textAlign: 'center' }}>
                  Elige cómo registrarte
                </p>

                {/* Google */}
                <button className="social-btn" style={socialBtn(socialLoading && socialLoading !== 'google')} onClick={() => handleSocial('google')} disabled={!!socialLoading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{socialLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}</span>
                  {socialLoading === 'google' && <span style={{ marginLeft: 'auto', opacity: 0.5 }}>⏳</span>}
                </button>



                {/* GitHub */}
                <button className="social-btn" style={socialBtn(socialLoading && socialLoading !== 'github')} onClick={() => handleSocial('github')} disabled={!!socialLoading}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8E8E8">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>{socialLoading === 'github' ? 'Conectando...' : 'Continuar con GitHub'}</span>
                </button>

                {/* Divisor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#161616' }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#222', letterSpacing: 1, textTransform: 'uppercase' }}>o con correo</span>
                  <div style={{ flex: 1, height: 1, background: '#161616' }} />
                </div>

                {/* Email manual */}
                <button style={{ ...socialBtn(false), justifyContent: 'center', background: 'transparent', border: `1px solid ${G}33`, color: G }}
                  className="social-btn" onClick={() => setFlow('form-step0')}>
                  ✉️ &nbsp;Registrarse con correo y contraseña
                </button>
              </>
            )}

            {/* ── STEP 0: Email + password ── */}
            {flow === 'form-step0' && (
              <>
                {stepProgress()}
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" style={inputStyle} placeholder="tu@empresa.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña</label>
                  <input type="password" style={inputStyle} placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar contraseña</label>
                  <input type="password" style={{ ...inputStyle, marginBottom: 24 }} placeholder="Repite la contraseña"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-back" onClick={() => setFlow('social-choice')}>← Atrás</button>
                  <button style={{ ...btnLima, flex: 1 }} onClick={nextStep}>Continuar →</button>
                </div>
              </>
            )}

            {/* ── STEP 1: Datos del negocio (email o social) ── */}
            {(flow === 'form-step1' || flow === 'social-complete') && (
              <>
                {stepProgress()}
                {flow === 'social-complete' && socialUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: G + '10', border: `1px solid ${G}22`, borderRadius: 4, padding: '12px 16px', marginBottom: 24 }}>
                    {socialUser.photoURL && <img src={socialUser.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: G }}>{socialUser.displayName || socialUser.email}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#444' }}>{socialUser.email}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Nombre del negocio *</label>
                  <input type="text" style={inputStyle} placeholder="Ej: Peluquería Elegance"
                    value={form.nombreEmpresa} onChange={e => set('nombreEmpresa', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono / WhatsApp *</label>
                  <input type="tel" style={inputStyle} placeholder="+57 300 000 0000"
                    value={form.telefono} onChange={e => set('telefono', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                  <label style={labelStyle}>Ciudad</label>
                  <input type="text" style={{ ...inputStyle, marginBottom: 24 }} placeholder="Ej: Cali, Bogotá, Medellín"
                    value={form.ciudad} onChange={e => set('ciudad', e.target.value)}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-back" onClick={() => flow === 'social-complete' ? setFlow('social-choice') : setFlow('form-step0')}>← Atrás</button>
                  <button style={{ ...btnLima, flex: 1 }} onClick={() => {
                    if (!form.nombreEmpresa || !form.telefono) { toast.error('Completa nombre y teléfono'); return; }
                    setFlow(flow === 'social-complete' ? 'social-industry' : 'form-step2');
                  }}>Continuar →</button>
                </div>
              </>
            )}

            {/* ── STEP 2: Industria (email) ── */}
            {(flow === 'form-step2' || flow === 'social-industry') && (
              <>
                {stepProgress()}
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#333', fontSize: 13, marginBottom: 20 }}>¿A qué tipo de negocio perteneces?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                  {INDUSTRIAS.map(ind => (
                    <button key={ind.value} className={'ind-btn' + (form.industria === ind.value ? ' active' : '')}
                      onClick={() => set('industria', ind.value)}
                      style={{ background: form.industria === ind.value ? G + '15' : '#111', border: '1px solid ' + (form.industria === ind.value ? G : '#1E1E1E'), borderRadius: 4, padding: '12px 14px', cursor: 'pointer', color: form.industria === ind.value ? G : '#444', fontSize: 13, textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s' }}>
                      {ind.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-back" onClick={() => setFlow(flow === 'social-industry' ? 'social-complete' : 'form-step1')}>← Atrás</button>
                  <button style={{ ...btnLima, flex: 1 }} onClick={flow === 'social-industry' ? handleSubmitSocial : handleSubmitEmail} disabled={loading}>
                    {loading ? 'Creando cuenta...' : '¡Comenzar gratis! 🚀'}
                  </button>
                </div>
              </>
            )}

          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#222', fontSize: 13 }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" style={{ color: G, fontWeight: 600 }}>Ingresar</Link>
          </p>
        </div>
      </div>
    </>
  );
}
