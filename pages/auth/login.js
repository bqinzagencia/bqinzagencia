// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  loginUser, loginWithGoogle, loginWithGithub,
  getEmpresasDeUsuario, cambiarEmpresaActiva,
} from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

const G   = '#2563EB';
const BG  = '#080808';
const F   = "'Plus Jakarta Sans', sans-serif";

export default function Login() {
  const router = useRouter();
  const { agregarEmpresa } = useAuth();

  const [form, setForm]               = useState({ email: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [showEmail, setShowEmail]     = useState(false);

  // Selector de empresa (si tiene varias)
  const [empresas, setEmpresas]       = useState([]);
  const [userTmp, setUserTmp]         = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  // ── Lógica común post-auth ────────────────────────────────────────────────
  const postAuth = async (user) => {
    const emps = await getEmpresasDeUsuario(user.uid);
    if (emps.length === 0) {
      toast('Completa el registro de tu negocio', { icon: '📋' });
      router.push('/auth/register');
      return;
    }
    if (emps.length === 1) {
      // Solo una empresa → entrar directo
      agregarEmpresa(emps[0]);
      toast.success('¡Bienvenido, ' + (user.displayName || emps[0].nombreEmpresa) + '!');
      router.push('/dashboard');
      return;
    }
    // Varias empresas → mostrar selector
    setUserTmp(user);
    setEmpresas(emps);
    setShowSelector(true);
  };

  const elegirEmpresa = async (emp) => {
    await cambiarEmpresaActiva(userTmp.uid, emp.id);
    agregarEmpresa(emp);
    toast.success('Entrando a ' + emp.nombreEmpresa);
    router.push('/dashboard');
  };

  // ── Social login ──────────────────────────────────────────────────────────
  const handleSocial = async (provider) => {
    setSocialLoading(provider);
    try {
      let result;
      if (provider === 'google') result = await loginWithGoogle();
      else if (provider === 'github') result = await loginWithGithub();
      await postAuth(result.user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Error al conectar. Intenta de nuevo.');
      }
    } finally { setSocialLoading(''); }
  };

  // ── Email login ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Completa todos los campos'); return; }
    setLoading(true);
    try {
      const cred = await loginUser(form.email, form.password);
      await postAuth(cred.user);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':    'No existe cuenta con ese correo',
        'auth/wrong-password':    'Contraseña incorrecta',
        'auth/invalid-credential':'Credenciales inválidas',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
      };
      toast.error(msgs[err.code] || 'Error al ingresar');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #222', borderRadius: 4,
    padding: '13px 16px', color: '#E8E8E8', fontSize: 14, outline: 'none',
    fontFamily: F, marginBottom: 16,
  };
  const labelStyle = {
    fontFamily: F, fontSize: 11, fontWeight: 600,
    letterSpacing: 1.5, textTransform: 'uppercase', color: '#333', marginBottom: 8, display: 'block',
  };
  const socialBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', background: '#111', border: '1px solid #1E1E1E',
    borderRadius: 4, padding: '13px 20px', cursor: 'pointer',
    color: '#E8E8E8', fontSize: 14, fontFamily: F, fontWeight: 400,
    marginBottom: 10, transition: 'all 0.2s',
    opacity: (socialLoading && socialLoading !== active) ? 0.4 : 1,
  });

  return (
    <>
      <Head>
        <title>Ingresar — BQinzagencIA</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body { background:${BG}; color:#E8E8E8; font-family:${F}; margin:0; }
        input:focus { border-color:${G} !important; outline:none; }
        input::placeholder { color:#333; }
        .sbtn:hover { border-color:#333 !important; background:#151515 !important; }
      `}</style>

      <div style={{ minHeight:'100vh', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
        <div style={{ position:'fixed', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=70)', backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.06)', zIndex:0 }} />
        <div style={{ position:'fixed', inset:0, background:`radial-gradient(ellipse 60% 70% at 50% 30%, ${G}04, transparent)`, zIndex:0 }} />

        <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <Link href="/">
              <div style={{ fontFamily:"'Abril Fatface', serif", fontSize:28, color:'#E8E8E8', cursor:'pointer', display:'inline-block' }}>
                BQinzagenc<span style={{ color:'#FF6B00', fontSize:32 }}>IA</span>
              </div>
            </Link>
            <h1 style={{ fontFamily:F, fontSize:22, fontWeight:600, marginTop:20, marginBottom:6 }}>
              {showSelector ? 'Elige tu empresa' : 'Bienvenido de vuelta'}
            </h1>
            <p style={{ color:'#2A2A2A', fontSize:13 }}>
              {showSelector ? 'Selecciona con qué empresa quieres ingresar' : 'Ingresa a tu panel de BQinzagencIA'}
            </p>
          </div>

          <div style={{ background:'#0C0C0C', border:'1px solid #161616', borderRadius:8, padding:32 }}>

            {/* ── SELECTOR DE EMPRESA ── */}
            {showSelector && (
              <>
                {userTmp?.photoURL && (
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, padding:'10px 14px', background:G+'10', borderRadius:8, border:`1px solid ${G}22` }}>
                    <img src={userTmp.photoURL} alt="" style={{ width:32, height:32, borderRadius:'50%' }} />
                    <div>
                      <div style={{ fontFamily:F, fontSize:13, fontWeight:600, color:G }}>{userTmp.displayName || userTmp.email}</div>
                      <div style={{ fontFamily:F, fontSize:11, color:'#444' }}>{userTmp.email}</div>
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {empresas.map((emp, i) => (
                    <button key={emp.id} onClick={() => elegirEmpresa(emp)}
                      style={{ display:'flex', alignItems:'center', gap:14, background:'#111', border:'1px solid #1E1E1E', borderRadius:8, padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = G+'66'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}>
                      <div style={{ width:40, height:40, borderRadius:10, background:G+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🏢</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:F, fontSize:14, fontWeight:600, color:'#E8E8E8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.nombreEmpresa}</div>
                        <div style={{ fontFamily:F, fontSize:11, color:'#444', marginTop:2 }}>{emp.industria} · Plan {emp.plan}</div>
                      </div>
                      <span style={{ color:G, fontSize:13, fontWeight:700, flexShrink:0 }}>Entrar →</span>
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowSelector(false)}
                  style={{ marginTop:20, width:'100%', background:'transparent', border:'1px solid #1A1A1A', borderRadius:8, padding:'10px', color:'#444', fontFamily:F, fontSize:13, cursor:'pointer' }}>
                  ← Cambiar cuenta
                </button>
              </>
            )}

            {/* ── LOGIN SOCIAL ── */}
            {!showSelector && !showEmail && (
              <>
                <p style={{ fontFamily:F, fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:'#1E1E1E', marginBottom:20, textAlign:'center' }}>Ingresa con</p>

                <button className="sbtn" style={socialBtn('google')} onClick={() => handleSocial('google')} disabled={!!socialLoading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {socialLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
                </button>

                <button className="sbtn" style={socialBtn('github')} onClick={() => handleSocial('github')} disabled={!!socialLoading}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8E8E8">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  {socialLoading === 'github' ? 'Conectando...' : 'Continuar con GitHub'}
                </button>

                <div style={{ display:'flex', alignItems:'center', gap:16, margin:'24px 0' }}>
                  <div style={{ flex:1, height:1, background:'#161616' }} />
                  <span style={{ fontFamily:F, fontSize:11, color:'#1E1E1E', letterSpacing:1, textTransform:'uppercase' }}>o con correo</span>
                  <div style={{ flex:1, height:1, background:'#161616' }} />
                </div>

                <button className="sbtn" style={{ ...socialBtn('email'), border:`1px solid ${G}33`, color:G, justifyContent:'center' }} onClick={() => setShowEmail(true)}>
                  ✉️ &nbsp;Ingresar con correo y contraseña
                </button>
              </>
            )}

            {/* ── LOGIN EMAIL ── */}
            {!showSelector && showEmail && (
              <form onSubmit={handleSubmit}>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" style={inputStyle} placeholder="tu@empresa.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña</label>
                  <input type="password" style={{ ...inputStyle, marginBottom:8 }} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={e => e.target.style.borderColor = G}
                    onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div style={{ textAlign:'right', marginBottom:24 }}>
                  <Link href="/auth/reset" style={{ fontFamily:F, color:G, fontSize:12, opacity:0.6 }}>¿Olvidaste tu contraseña?</Link>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowEmail(false)}
                    style={{ background:'transparent', color:'#444', border:'1px solid #1A1A1A', borderRadius:4, padding:'13px 16px', fontFamily:F, fontSize:13, cursor:'pointer' }}>
                    ← Atrás
                  </button>
                  <button type="submit" disabled={loading}
                    style={{ flex:1, background:G, color:'#fff', border:'none', borderRadius:4, padding:'13px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:F }}>
                    {loading ? 'Ingresando...' : 'Ingresar →'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={{ textAlign:'center', marginTop:20, fontFamily:F, color:'#222', fontSize:13 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ color:G, fontWeight:600 }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </>
  );
}
