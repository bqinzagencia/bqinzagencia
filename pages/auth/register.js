// pages/auth/register.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { registerUser, crearEmpresa, loginWithGoogle } from '../../lib/firebase';
import { INDUSTRIAS } from '../../lib/utils';
import { Logo } from '../index';

const STEPS = ['Datos de acceso', 'Tu negocio', 'Tu industria'];

// Botón oficial Google — estándar de diseño Google Identity
function GoogleButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, background: '#fff', border: '1px solid #dadce0', borderRadius: 100,
        padding: '11px 24px', fontSize: 14, fontWeight: 600, color: '#3c4043',
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'box-shadow 0.2s',
        fontFamily: 'Roboto, sans-serif', letterSpacing: '0.01em', opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {loading ? 'Conectando...' : 'Registrarse con Google'}
    </button>
  );
}

export default function Register() {
  const router = useRouter();
  const { plan } = router.query;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    nombreEmpresa: '', telefono: '', ciudad: '',
    industria: '',
    plan: plan || 'profesional',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = () => {
    if (step === 0) {
      if (!form.email || !form.password) { toast.error('Completa correo y contraseña'); return; }
      if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
      if (form.password !== form.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    }
    if (step === 1) {
      if (!form.nombreEmpresa || !form.telefono) { toast.error('Completa el nombre y teléfono'); return; }
    }
    setStep(s => s + 1);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('¡Bienvenido a BQinzagencIA!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('No se pudo conectar con Google');
    } finally { setGoogleLoading(false); }
  };

  const handleSubmit = async () => {
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
      toast.success('¡Cuenta creada! Bienvenido a BQinzAgencIA 🎉');
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

  return (
    <>
      <Head><title>Crear cuenta — BQinzAgencIA</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--black)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 30%,rgba(0,229,160,0.05),transparent)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/"><Logo size={28} /></Link>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, marginTop: 20, marginBottom: 6 }}>Crea tu cuenta</h1>
            <p style={{ color: 'var(--gray6)', fontSize: 14 }}>Empieza a automatizar tu negocio hoy</p>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.1)', marginBottom: 8, transition: 'background 0.3s' }} />
                <span style={{ fontSize: 11, color: i <= step ? 'var(--accent)' : 'var(--gray5)', fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
            {/* Step 0 */}
            {step === 0 && (
              <>
                {/* ── Botón Google ── */}
                <GoogleButton onClick={handleGoogle} loading={googleLoading} />

                {/* Separador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#6B7280', fontSize: 12, fontWeight: 500 }}>o regístrate con email</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" className="form-input" placeholder="tu@empresa.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar contraseña</label>
                  <input type="password" className="form-input" placeholder="Repite la contraseña"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                </div>
                <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={nextStep}>
                  Continuar →
                </button>
              </>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre del negocio</label>
                  <input type="text" className="form-input" placeholder="Ej: Taller AutoCenter"
                    value={form.nombreEmpresa} onChange={e => set('nombreEmpresa', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input type="tel" className="form-input" placeholder="+57 300 000 0000"
                    value={form.telefono} onChange={e => set('telefono', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input type="text" className="form-input" placeholder="Ej: Cali, Bogotá, Medellín"
                    value={form.ciudad} onChange={e => set('ciudad', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-ghost btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(0)}>← Atrás</button>
                  <button className="btn btn-accent btn-lg" style={{ flex: 2, justifyContent: 'center' }} onClick={nextStep}>Continuar →</button>
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 20 }}>¿A qué tipo de negocio perteneces?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                  {INDUSTRIAS.map(ind => (
                    <button key={ind.value} onClick={() => set('industria', ind.value)}
                      style={{ background: form.industria === ind.value ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', border: `1px solid ${form.industria === ind.value ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', color: form.industria === ind.value ? 'var(--accent)' : 'var(--gray6)', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'all 0.15s' }}>
                      {ind.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-ghost btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Atrás</button>
                  <button className="btn btn-accent btn-lg" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creando cuenta...' : '¡Comenzar ahora! 🚀'}
                  </button>
                </div>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--gray5)', fontSize: 13 }}>
            ¿Ya tienes cuenta? <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Ingresar</Link>
          </p>
        </div>
      </div>
    </>
  );
}
