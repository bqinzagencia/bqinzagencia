// pages/dashboard/agenda.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCitas, crearCita, updateCita } from '../../lib/firebase';
import { formatFecha, formatHora } from '../../lib/utils';

export default function Agenda() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombreCliente: '', telefono: '', servicio: '', fechaHora: '', duracion: 60, notas: '' });
  const [saving, setSaving] = useState(false);
  const [vista, setVista] = useState('lista');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  useEffect(() => { if (user) loadCitas(); }, [user]);

  const loadCitas = async () => {
    try { const c = await getCitas(user.uid); setCitas(c); }
    catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!form.nombreCliente || !form.fechaHora) { toast.error('Nombre y fecha/hora son requeridos'); return; }
    setSaving(true);
    try {
      await crearCita(user.uid, { ...form, fechaHora: new Date(form.fechaHora) });
      toast.success('Cita agendada ✅');
      setShowModal(false);
      setForm({ nombreCliente: '', telefono: '', servicio: '', fechaHora: '', duracion: 60, notas: '' });
      loadCitas();
    } catch { toast.error('Error al agendar'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (id, estado) => {
    await updateCita(user.uid, id, { estado });
    toast.success('Estado actualizado');
    loadCitas();
  };

  const ahora = new Date();
  const citasHoy = citas.filter(c => {
    const f = c.fechaHora?.toDate ? c.fechaHora.toDate() : new Date(c.fechaHora);
    return f.toDateString() === ahora.toDateString();
  });
  const citasFuturas = citas.filter(c => {
    const f = c.fechaHora?.toDate ? c.fechaHora.toDate() : new Date(c.fechaHora);
    return f > ahora;
  });

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Agenda — NEXOIA</title></Head>
      <DashboardLayout title="Agenda">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['lista', 'hoy'].map(v => (
              <button key={v} onClick={() => setVista(v)} className={'btn btn-sm ' + (vista === v ? 'btn-accent' : 'btn-ghost')}>
                {v === 'lista' ? 'Todas las citas' : 'Citas de hoy'}
              </button>
            ))}
          </div>
          <button className="btn btn-accent" onClick={() => setShowModal(true)}>+ Nueva cita</button>
        </div>

        {/* Hoy counter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Citas hoy',        value: citasHoy.length,                                      color: 'var(--accent)', svgPath: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
            { label: 'Pendientes',        value: citas.filter(c => c.estado === 'confirmada').length,  color: '#F59E0B', svgPath: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
            { label: 'Completadas',       value: citas.filter(c => c.estado === 'completada').length,  color: '#3B82F6', svgPath: <><polyline points="20 6 9 17 4 12"/></> },
            { label: 'Total agendadas',   value: citas.length,                                         color: '#8B5CF6', svgPath: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)' }}>{s.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.svgPath}</svg>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Citas list */}
        {(vista === 'hoy' ? citasHoy : citas).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(37,99,235,0.2)' }}>
            <div style={{ width:80, height:80, borderRadius:16, overflow:'hidden', margin:'0 auto 20px', border:'2px solid rgba(37,99,235,0.3)' }}>
              <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=160&q=80" alt="Agenda" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{vista === 'hoy' ? 'Sin citas para hoy' : 'Sin citas agendadas'}</h3>
            <p style={{ color: 'var(--gray5)', marginBottom: 20 }}>Tu agente IA agendará citas automáticamente cuando los clientes lo soliciten.</p>
            <button className="btn btn-accent" onClick={() => setShowModal(true)}>Agendar primera cita</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(vista === 'hoy' ? citasHoy : citas).map((cita) => {
              const fecha = cita.fechaHora?.toDate ? cita.fechaHora.toDate() : new Date(cita.fechaHora);
              const esHoy = fecha.toDateString() === ahora.toDateString();
              const estados = { confirmada: { color: '#00E5A0', label: 'Confirmada' }, pendiente: { color: '#F59E0B', label: 'Pendiente' }, completada: { color: '#3B82F6', label: 'Completada' }, cancelada: { color: '#EF4444', label: 'Cancelada' } };
              const est = estados[cita.estado] || estados.confirmada;
              return (
                <div key={cita.id} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'center', background: esHoy ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', borderRadius: 12, padding: '10px 14px', minWidth: 64, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, color: esHoy ? 'var(--accent)' : 'var(--white)', lineHeight: 1 }}>{fecha.getDate()}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: esHoy ? 'var(--accent)' : 'var(--gray5)', textTransform: 'uppercase' }}>{fecha.toLocaleDateString('es-CO',{month:'short'})}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 4 }}>{fecha.getHours().toString().padStart(2,'0')}:{fecha.getMinutes().toString().padStart(2,'0')}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cita.nombreCliente}
                      {cita.canal === 'whatsapp' && (
                        <span style={{ fontSize: 10, background: 'rgba(37,211,102,0.15)', color: '#25D366', borderRadius: 100, padding: '2px 8px', fontWeight: 700, flexShrink: 0 }}>📱 WhatsApp</span>
                      )}
                    </div>
                    <div style={{ color: 'var(--gray5)', fontSize: 14 }}>{cita.servicio || 'Servicio'}{cita.telefono ? ` · ${cita.telefono}` : ''}</div>
                    {cita.notas && <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 4, fontStyle: 'italic' }}>{cita.notas}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: est.color + '22', color: est.color, border: `1px solid ${est.color}44`, borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{est.label}</span>
                    <select value={cita.estado || 'confirmada'} onChange={e => cambiarEstado(cita.id, e.target.value)}
                      style={{ background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', color: 'var(--gray6)', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                      <option value="confirmada">Confirmada</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              <div className="modal-title">Nueva cita</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Nombre del cliente *</label>
                  <input className="form-input" placeholder="Juan García" value={form.nombreCliente} onChange={e => setForm({...form, nombreCliente: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" placeholder="+57 300..." value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Servicio</label>
                  <input className="form-input" placeholder="Ej: Cambio de aceite" value={form.servicio} onChange={e => setForm({...form, servicio: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha y hora *</label>
                  <input type="datetime-local" className="form-input" value={form.fechaHora} onChange={e => setForm({...form, fechaHora: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (minutos)</label>
                  <select className="form-input" value={form.duracion} onChange={e => setForm({...form, duracion: Number(e.target.value)})}>
                    {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} minutos</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Notas adicionales</label>
                  <textarea className="form-input" rows={3} value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} style={{ resize: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-accent" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Agendando...' : 'Agendar cita'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
