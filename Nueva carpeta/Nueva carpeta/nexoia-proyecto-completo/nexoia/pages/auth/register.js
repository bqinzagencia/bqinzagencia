// pages/auth/register.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { registerUser, crearEmpresa } from '../../lib/firebase';
import { INDUSTRIAS } from '../../lib/utils';
import { Logo } from '../index';

const STEPS = ['Datos de acceso', 'Tu negocio', 'Tu industria'];

export default function Register() {
  const router = useRouter();
  const { plan } = router.query;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
      toast.success('¡Cuenta creada! Bienvenido a NEXOIA 🎉');
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
      <Head><title>Crear cuenta — NEXOIA</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--black)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 30%,rgba(0,229,160,0.05),transparent)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/"><Logo size={28} /></Link>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, marginTop: 20, marginBottom: 6 }}>Crea tu cuenta gratis</h1>
            <p style={{ color: 'var(--gray6)', fontSize: 14 }}>14 días de prueba · Sin tarjeta de crédito</p>
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
                    {loading ? 'Creando cuenta...' : '¡Comenzar gratis! 🚀'}
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
