// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { loginUser, loginWithGoogle } from '../../lib/firebase';
import { Logo } from '../index';

const NARANJA = '#FF6B00';

// Botón oficial Google — listo para conectar con Firebase/Supabase Auth
function GoogleButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        background: '#fff',
        border: '1px solid #dadce0',
        borderRadius: 100,
        padding: '11px 24px',
        fontSize: 14,
        fontWeight: 600,
        color: '#3c4043',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'box-shadow 0.2s, background 0.2s',
        fontFamily: 'Roboto, sans-serif',
        letterSpacing: '0.01em',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Logo oficial Google SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {loading ? 'Conectando...' : 'Continuar con Google'}
    </button>
  );
}

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Completa todos los campos'); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/dashboard');
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'No existe una cuenta con ese correo',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      };
      toast.error(msgs[err.code] || 'Error al ingresar');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('¡Bienvenido!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('No se pudo conectar con Google');
    } finally { setGoogleLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Ingresar — BQinzagencIA</title>
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--black)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 60% at 50% 30%, rgba(255,107,0,0.06), transparent)`, pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Link href="/"><Logo size={26} /></Link>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Bienvenido de vuelta</h1>
            <p style={{ color: 'var(--gray6)', fontSize: 15 }}>Accede a tu panel de BQinzagencIA</p>
          </div>

          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>

            {/* ── Botón Google ── */}
            <GoogleButton onClick={handleGoogle} loading={googleLoading} />

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#6B7280', fontSize: 12, fontWeight: 500 }}>o continúa con email</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* ── Formulario email ── */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-input" placeholder="tu@empresa.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-input" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -8 }}>
                <Link href="/auth/reset" style={{ color: NARANJA, fontSize: 13 }}>¿Olvidaste tu contraseña?</Link>
              </div>
              <button type="submit"
                disabled={loading}
                style={{ width: '100%', background: NARANJA, color: '#fff', border: 'none', borderRadius: 100, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, boxShadow: `0 0 20px rgba(255,107,0,0.25)` }}>
                {loading ? 'Ingresando...' : 'Ingresar →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray5)', fontSize: 14 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ color: NARANJA, fontWeight: 600 }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </>
  );
}
