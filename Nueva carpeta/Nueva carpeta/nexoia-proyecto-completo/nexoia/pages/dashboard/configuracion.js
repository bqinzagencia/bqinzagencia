// pages/dashboard/configuracion.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa } from '../../lib/firebase';
import { INDUSTRIAS, PLANES, formatPrecio } from '../../lib/utils';

export default function Configuracion() {
  const { user, empresa, setEmpresa, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('negocio');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  useEffect(() => { if (empresa) setForm({ nombreEmpresa: empresa.nombreEmpresa || '', telefono: empresa.telefono || '', ciudad: empresa.ciudad || '', industria: empresa.industria || '', web: empresa.web || '', descripcion: empresa.descripcion || '', horario: empresa.horario || '', }); }, [empresa]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpresa(user.uid, form);
      setEmpresa(e => ({ ...e, ...form }));
      toast.success('Configuración guardada ✅');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const planActual = PLANES[empresa.plan] || PLANES.emprendedor;
  const TABS = [
    { key: 'negocio', label: '🏢 Mi negocio' },
    { key: 'plan', label: '⭐ Mi plan' },
    { key: 'cuenta', label: '👤 Cuenta' },
  ];

  return (
    <>
      <Head><title>Configuración — NEXOIA</title></Head>
      <DashboardLayout title="Configuración">
        <div style={{ maxWidth: 720 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--gray1)', padding: 4, borderRadius: 12, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={'btn btn-sm ' + (tab === t.key ? 'btn-accent' : '')}
                style={tab !== t.key ? { background: 'transparent', border: 'none', color: 'var(--gray5)' } : {}}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Negocio tab */}
          {tab === 'negocio' && (
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Información del negocio</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Nombre del negocio</label>
                  <input className="form-input" value={form.nombreEmpresa || ''} onChange={e => setForm({...form, nombreEmpresa: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input className="form-input" value={form.telefono || ''} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+57 300 000 0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input className="form-input" value={form.ciudad || ''} onChange={e => setForm({...form, ciudad: e.target.value})} placeholder="Ej: Cali" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de negocio</label>
                  <select className="form-input" value={form.industria || ''} onChange={e => setForm({...form, industria: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {INDUSTRIAS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sitio web</label>
                  <input className="form-input" value={form.web || ''} onChange={e => setForm({...form, web: e.target.value})} placeholder="https://..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Descripción del negocio</label>
                  <textarea className="form-input" rows={3} value={form.descripcion || ''} onChange={e => setForm({...form, descripcion: e.target.value})}
                    placeholder="Descripción breve de tus servicios. Tu agente IA usará esta información."
                    style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Horario de atención</label>
                  <input className="form-input" value={form.horario || ''} onChange={e => setForm({...form, horario: e.target.value})}
                    placeholder="Ej: Lunes a viernes 8am-6pm, Sábados 8am-1pm" />
                </div>
              </div>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {/* Plan tab */}
          {tab === 'plan' && (
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Mi plan actual</h3>
              <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Plan {planActual.nombre}</div>
                    <div style={{ color: 'var(--gray5)', fontSize: 14 }}>
                      {planActual.agentes === -1 ? 'Agentes ilimitados' : `${planActual.agentes} agente${planActual.agentes > 1 ? 's' : ''}`} · {planActual.conversaciones === -1 ? 'Conversaciones ilimitadas' : `${planActual.conversaciones} conversaciones/mes`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{formatPrecio(planActual.precio)}</div>
                    <div style={{ color: 'var(--gray5)', fontSize: 12 }}>/ mes</div>
                  </div>
                </div>
              </div>

              <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: 16 }}>Actualiza tu plan</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {Object.entries(PLANES).filter(([k]) => k !== empresa.plan).map(([key, plan]) => (
                  <div key={key} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Plan {plan.nombre}</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>{formatPrecio(plan.precio)}<span style={{ fontSize: 12, color: 'var(--gray5)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>/mes</span></div>
                    <a href="mailto:soportesistemas@soporteia.net?subject=Cambio de plan NEXOIA" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                      Actualizar
                    </a>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--gray5)', fontSize: 13, marginTop: 20 }}>Para cambiar tu plan contacta: soportesistemas@soporteia.net · 310-505-6616</p>
            </div>
          )}

          {/* Cuenta tab */}
          {tab === 'cuenta' && (
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Datos de la cuenta</h3>
              <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray5)' }}>Correo electrónico</span>
                <span>{user?.email}</span>
              </div>
              <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray5)' }}>ID de empresa</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray5)' }}>{user?.uid?.slice(0,16)}...</span>
              </div>
              <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray5)' }}>Plan activo</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{empresa.plan}</span>
              </div>
              <div style={{ marginTop: 24, padding: 20, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12 }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Zona de peligro</p>
                <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16 }}>Para cancelar tu cuenta o eliminar datos, contacta nuestro soporte.</p>
                <a href="mailto:soportesistemas@soporteia.net?subject=Cancelar cuenta NEXOIA" className="btn btn-danger btn-sm">
                  Contactar soporte
                </a>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
