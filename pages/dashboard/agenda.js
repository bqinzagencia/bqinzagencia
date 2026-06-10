// pages/dashboard/agenda.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCitas, crearCita, updateCita } from '../../lib/firebase';
import { formatFecha, formatHora } from '../../lib/utils';

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const ESTADO_COLORES = { confirmada:'#00E5A0', pendiente:'#F59E0B', completada:'#3B82F6', cancelada:'#EF4444' };

function CalendarioMensual({ citas, onDiaClick, onCitaClick }) {
  const [mesActual, setMesActual] = useState(new Date());

  const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

  // Lunes = 0 en nuestra cuadrícula
  let offsetInicio = primerDia.getDay() - 1;
  if (offsetInicio < 0) offsetInicio = 6;

  const totalCeldas = Math.ceil((offsetInicio + ultimoDia.getDate()) / 7) * 7;
  const celdas = Array.from({ length: totalCeldas }, (_, i) => {
    const diaNum = i - offsetInicio + 1;
    if (diaNum < 1 || diaNum > ultimoDia.getDate()) return null;
    return new Date(mesActual.getFullYear(), mesActual.getMonth(), diaNum);
  });

  const citasDelDia = (fecha) => {
    if (!fecha) return [];
    return citas.filter(c => {
      const f = c.fechaHora?.toDate ? c.fechaHora.toDate() : new Date(c.fechaHora);
      return f.toDateString() === fecha.toDateString();
    });
  };

  const hoy = new Date();

  return (
    <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setMesActual(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          style={{ background: 'var(--gray2)', border: 'none', color: 'var(--white)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>&#8249;</button>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18 }}>
          {MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
        </span>
        <button onClick={() => setMesActual(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          style={{ background: 'var(--gray2)', border: 'none', color: 'var(--white)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>&#8250;</button>
      </div>

      {/* Días semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '10px 4px', fontSize: 11, fontWeight: 700, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {celdas.map((fecha, i) => {
          if (!fecha) return <div key={i} style={{ minHeight: 90, borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }} />;
          const citasDia = citasDelDia(fecha);
          const esHoy = fecha.toDateString() === hoy.toDateString();
          const esPasado = fecha < hoy && !esHoy;
          return (
            <div key={i}
              onClick={() => onDiaClick(fecha)}
              style={{
                minHeight: 90, padding: '6px 8px',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', transition: 'background 0.15s',
                background: esHoy ? 'rgba(255,107,0,0.08)' : 'transparent',
              }}
              onMouseEnter={e => { if (!esHoy) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = esHoy ? 'rgba(255,107,0,0.08)' : 'transparent'; }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: esHoy ? '#FF6B00' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: esHoy ? 800 : 400,
                color: esHoy ? '#fff' : esPasado ? 'var(--gray4)' : 'var(--white)',
                marginBottom: 4,
              }}>{fecha.getDate()}</div>
              {citasDia.slice(0, 3).map((c, ci) => {
                const f = c.fechaHora?.toDate ? c.fechaHora.toDate() : new Date(c.fechaHora);
                const color = ESTADO_COLORES[c.estado] || '#00E5A0';
                return (
                  <div key={ci}
                    onClick={e => { e.stopPropagation(); onCitaClick(c); }}
                    style={{
                      background: color + '20', borderLeft: `2px solid ${color}`,
                      borderRadius: '0 4px 4px 0', padding: '2px 5px',
                      fontSize: 10, fontWeight: 600, color, marginBottom: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}>
                    {f.getHours().toString().padStart(2,'0')}:{f.getMinutes().toString().padStart(2,'0')} {c.nombreCliente}
                  </div>
                );
              })}
              {citasDia.length > 3 && (
                <div style={{ fontSize: 10, color: 'var(--gray5)', marginTop: 2 }}>+{citasDia.length - 3} más</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Agenda() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState(null);
  const [form, setForm] = useState({ nombreCliente: '', telefono: '', servicio: '', fechaHora: '', duracion: 60, notas: '' });
  const [saving, setSaving] = useState(false);
  const [vista, setVista] = useState('calendario');

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
      await crearCita(user.uid, { ...form, estado: 'confirmada', fechaHora: new Date(form.fechaHora) });
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
    if (citaDetalle?.id === id) setCitaDetalle(c => ({ ...c, estado }));
  };

  const ahora = new Date();
  const citasHoy = citas.filter(c => {
    const f = c.fechaHora?.toDate ? c.fechaHora.toDate() : new Date(c.fechaHora);
    return f.toDateString() === ahora.toDateString();
  });

  const abrirNuevaCita = (fecha) => {
    const fechaStr = fecha ? fecha.toISOString().slice(0, 16) : '';
    setForm(f => ({ ...f, fechaHora: fechaStr }));
    setShowModal(true);
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Agenda — BQinzagencIA</title></Head>
      <DashboardLayout title="Agenda">
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['calendario', '🗓️ Calendario'], ['hoy', '☀️ Hoy'], ['lista', '📋 Lista']].map(([v, label]) => (
              <button key={v} onClick={() => setVista(v)} className={'btn btn-sm ' + (vista === v ? 'btn-accent' : 'btn-ghost')}>{label}</button>
            ))}
          </div>
          <button className="btn btn-accent" onClick={() => abrirNuevaCita(null)}>+ Nueva cita</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Citas hoy', value: citasHoy.length, color: '#FF6B00', icon: '📅' },
            { label: 'Confirmadas', value: citas.filter(c => c.estado === 'confirmada').length, color: '#00E5A0', icon: '✅' },
            { label: 'Completadas', value: citas.filter(c => c.estado === 'completada').length, color: '#3B82F6', icon: '🏆' },
            { label: 'Total', value: citas.length, color: '#8B5CF6', icon: '🗓️' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray5)', letterSpacing: 0.5 }}>{s.label}</span>
                <span>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Vista Calendario */}
        {vista === 'calendario' && (
          <CalendarioMensual
            citas={citas}
            onDiaClick={abrirNuevaCita}
            onCitaClick={setCitaDetalle}
          />
        )}

        {/* Vista Hoy */}
        {vista === 'hoy' && (
          <div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray5)' }}>
              {citasHoy.length > 0 ? `${citasHoy.length} cita${citasHoy.length > 1 ? 's' : ''} para hoy` : 'Sin citas para hoy'}
            </h3>
            {citasHoy.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>&#128197;</div>
                <p style={{ color: 'var(--gray5)', marginBottom: 20 }}>No hay citas programadas para hoy.</p>
                <button className="btn btn-accent" onClick={() => abrirNuevaCita(new Date())}>Agendar para hoy</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {citasHoy.sort((a, b) => {
                  const fa = a.fechaHora?.toDate ? a.fechaHora.toDate() : new Date(a.fechaHora);
                  const fb = b.fechaHora?.toDate ? b.fechaHora.toDate() : new Date(b.fechaHora);
                  return fa - fb;
                }).map(cita => <CitaCard key={cita.id} cita={cita} onEstado={cambiarEstado} onClick={setCitaDetalle} />)}
              </div>
            )}
          </div>
        )}

        {/* Vista Lista */}
        {vista === 'lista' && (
          <div>
            {citas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>&#128197;</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sin citas agendadas</h3>
                <p style={{ color: 'var(--gray5)', marginBottom: 20 }}>Tu agente IA agendará citas automáticamente.</p>
                <button className="btn btn-accent" onClick={() => abrirNuevaCita(null)}>Agendar primera cita</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...citas].sort((a, b) => {
                  const fa = a.fechaHora?.toDate ? a.fechaHora.toDate() : new Date(a.fechaHora);
                  const fb = b.fechaHora?.toDate ? b.fechaHora.toDate() : new Date(b.fechaHora);
                  return fa - fb;
                }).map(cita => <CitaCard key={cita.id} cita={cita} onEstado={cambiarEstado} onClick={setCitaDetalle} />)}
              </div>
            )}
          </div>
        )}

        {/* Modal nueva cita */}
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
                  <input className="form-input" placeholder="+34 600..." value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Servicio</label>
                  <input className="form-input" placeholder="Ej: Limpieza facial" value={form.servicio} onChange={e => setForm({...form, servicio: e.target.value})} />
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
                  {saving ? 'Agendando...' : '📅 Agendar cita'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalle cita */}
        {citaDetalle && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCitaDetalle(null)}>
            <div className="modal">
              <button className="modal-close" onClick={() => setCitaDetalle(null)}>✕</button>
              <div className="modal-title">Detalle de cita</div>
              {(() => {
                const f = citaDetalle.fechaHora?.toDate ? citaDetalle.fechaHora.toDate() : new Date(citaDetalle.fechaHora);
                const color = ESTADO_COLORES[citaDetalle.estado] || '#00E5A0';
                return (
                  <>
                    <div style={{ background: color + '15', border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{citaDetalle.nombreCliente}</div>
                      <div style={{ color: 'var(--gray5)', fontSize: 14 }}>{citaDetalle.servicio || 'Servicio'}</div>
                      <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color }}>
                        {f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {f.getHours().toString().padStart(2,'0')}:{f.getMinutes().toString().padStart(2,'0')}h
                      </div>
                    </div>
                    {citaDetalle.telefono && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                        <span style={{ color: 'var(--gray5)' }}>📞 Teléfono</span>
                        <a href={`tel:${citaDetalle.telefono}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{citaDetalle.telefono}</a>
                      </div>
                    )}
                    {citaDetalle.notas && (
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                        <div style={{ color: 'var(--gray5)', marginBottom: 4 }}>📝 Notas</div>
                        <div>{citaDetalle.notas}</div>
                      </div>
                    )}
                    <div style={{ marginTop: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 8 }}>Cambiar estado:</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {Object.entries(ESTADO_COLORES).map(([estado, c]) => (
                          <button key={estado} onClick={() => cambiarEstado(citaDetalle.id, estado)}
                            style={{ background: citaDetalle.estado === estado ? c + '30' : 'var(--gray2)', border: `1px solid ${citaDetalle.estado === estado ? c : 'rgba(255,255,255,0.08)'}`, color: citaDetalle.estado === estado ? c : 'var(--gray5)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
                            {estado}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

function CitaCard({ cita, onEstado, onClick }) {
  const ahora = new Date();
  const fecha = cita.fechaHora?.toDate ? cita.fechaHora.toDate() : new Date(cita.fechaHora);
  const esHoy = fecha.toDateString() === ahora.toDateString();
  const color = ESTADO_COLORES[cita.estado] || '#00E5A0';
  const label = { confirmada: 'Confirmada', pendiente: 'Pendiente', completada: 'Completada', cancelada: 'Cancelada' }[cita.estado] || 'Confirmada';

  return (
    <div style={{ background: 'var(--gray1)', border: `1px solid ${esHoy ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}
      onClick={() => onClick(cita)}>
      <div style={{ textAlign: 'center', background: esHoy ? 'rgba(255,107,0,0.1)' : 'var(--gray2)', borderRadius: 12, padding: '10px 14px', minWidth: 60, flexShrink: 0 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: esHoy ? '#FF6B00' : 'var(--white)', lineHeight: 1 }}>{fecha.getDate()}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: esHoy ? '#FF6B00' : 'var(--gray5)', textTransform: 'uppercase' }}>{fecha.toLocaleDateString('es-ES',{month:'short'})}</div>
        <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 4 }}>{fecha.getHours().toString().padStart(2,'0')}:{fecha.getMinutes().toString().padStart(2,'0')}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{cita.nombreCliente}</div>
        <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{cita.servicio || 'Servicio'}{cita.telefono ? ` · ${cita.telefono}` : ''}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ background: color + '20', color, border: `1px solid ${color}44`, borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{label}</span>
        <select value={cita.estado || 'confirmada'} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); onEstado(cita.id, e.target.value); }}
          style={{ background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', color: 'var(--gray6)', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
          <option value="confirmada">Confirmada</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
    </div>
  );
}


