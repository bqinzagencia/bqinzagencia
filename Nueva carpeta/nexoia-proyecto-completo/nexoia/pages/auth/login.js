// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { loginUser } from '../../lib/firebase';
import { Logo } from '../index';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Head><title>Ingresar — NEXOIA</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--black)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 30%,rgba(0,229,160,0.05),transparent)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link href="/"><Logo size={28} /></Link>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Bienvenido de vuelta</h1>
            <p style={{ color: 'var(--gray6)', fontSize: 15 }}>Ingresa a tu panel de NEXOIA</p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
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
              <Link href="/auth/reset" style={{ color: 'var(--accent)', fontSize: 13 }}>¿Olvidaste tu contraseña?</Link>
            </div>
            <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--gray5)', fontSize: 14 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </>
  );
}
