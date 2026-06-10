// pages/dashboard/crm.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getContactos, crearContacto, updateContacto } from '../../lib/firebase';
import { iniciales, formatFecha, tiempoRelativo } from '../../lib/utils';

const ESTADOS = [
  { value: 'nuevo', label: 'Nuevo', color: '#3B82F6' },
  { value: 'contactado', label: 'Contactado', color: '#F59E0B' },
  { value: 'prospecto', label: 'Prospecto', color: '#8B5CF6' },
  { value: 'cliente', label: 'Cliente', color: '#00E5A0' },
  { value: 'inactivo', label: 'Inactivo', color: '#6B7280' },
];

const COLORES = ['#FF6B6B','#4ECDC4','#A29BFE','#FFD93D','#6BCB77','#4D96FF','#FF6B9D','#C77DFF'];

export default function CRM() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [contactos, setContactos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', empresa: '', estado: 'nuevo', notas: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  useEffect(() => { if (user) loadContactos(); }, [user]);

  const loadContactos = async () => {
    const c = await getContactos(user.uid);
    setContactos(c);
  };

  const handleSave = async () => {
    if (!form.nombre) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      await crearContacto(user.uid, form);
      toast.success('Contacto agregado al CRM');
      setShowModal(false);
      setForm({ nombre: '', email: '', telefono: '', empresa: '', estado: 'nuevo', notas: '' });
      loadContactos();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (id, estado) => {
    await updateContacto(user.uid, id, { estado });
    toast.success('Estado actualizado');
    loadContactos();
    if (vistaDetalle?.id === id) setVistaDetalle(c => ({ ...c, estado }));
  };

  const filtrados = contactos.filter(c => {
    const matchText = !filtro || c.nombre?.toLowerCase().includes(filtro.toLowerCase()) || c.email?.toLowerCase().includes(filtro.toLowerCase()) || c.telefono?.includes(filtro);
    const matchEstado = !estadoFiltro || c.estado === estadoFiltro;
    return matchText && matchEstado;
  });

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>CRM — BQinzagencIA</title></Head>
      <DashboardLayout title="Clientes / CRM">
        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" placeholder="🔍 Buscar contacto..." value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ flex: 1, minWidth: 200, borderRadius: 100 }} />
          <select className="form-input" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
            style={{ width: 160, borderRadius: 100 }}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <button className="btn btn-accent" onClick={() => setShowModal(true)}>+ Nuevo contacto</button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {ESTADOS.map(e => {
            const count = contactos.filter(c => c.estado === e.value).length;
            return (
              <button key={e.value} onClick={() => setEstadoFiltro(estadoFiltro === e.value ? '' : e.value)}
                style={{ background: estadoFiltro === e.value ? e.color + '22' : 'var(--gray1)', border: `1px solid ${estadoFiltro === e.value ? e.color : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '6px 16px', cursor: 'pointer', color: estadoFiltro === e.value ? e.color : 'var(--gray5)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, display: 'inline-block' }} />
                {e.label} <span style={{ opacity: 0.7 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sin contactos aún</h3>
            <p style={{ color: 'var(--gray5)', marginBottom: 20 }}>Tu agente IA agregará contactos automáticamente, o puedes crearlos manualmente.</p>
            <button className="btn btn-accent" onClick={() => setShowModal(true)}>Agregar primer contacto</button>
          </div>
        ) : (
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Contacto</th><th>Teléfono</th><th>Empresa</th><th>Estado</th><th>Agregado</th><th>Acciones</th>
                </tr></thead>
                <tbody>
                  {filtrados.map((c, i) => {
                    const est = ESTADOS.find(e => e.value === c.estado);
                    const color = COLORES[i % COLORES.length];
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer' }}>
                        <td onClick={() => setVistaDetalle(c)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: color + '22', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{iniciales(c.nombre)}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 14 }}>{c.nombre}</div>
                              <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{c.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{c.telefono || '—'}</td>
                        <td>{c.empresa || '—'}</td>
                        <td>
                          <select value={c.estado} onChange={e => { e.stopPropagation(); cambiarEstado(c.id, e.target.value); }}
                            style={{ background: est?.color + '22', color: est?.color, border: `1px solid ${est?.color}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                          </select>
                        </td>
                        <td style={{ fontSize: 12 }}>{tiempoRelativo(c.creadoEn)}</td>
                        <td>
                          <button onClick={() => setVistaDetalle(c)} className="btn btn-ghost btn-sm">Ver</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              <div className="modal-title">Nuevo contacto</div>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input className="form-input" placeholder="Juan García" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" placeholder="+57 300..." value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input className="form-input" placeholder="correo@..." value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Empresa / Negocio</label>
                <input className="form-input" placeholder="Nombre de la empresa" value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Estado inicial</label>
                <select className="form-input" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                  {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-input" rows={3} placeholder="Información adicional..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-accent" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Agregar al CRM'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {vistaDetalle && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setVistaDetalle(null)}>
            <div className="modal">
              <button className="modal-close" onClick={() => setVistaDetalle(null)}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{iniciales(vistaDetalle.nombre)}</div>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800 }}>{vistaDetalle.nombre}</div>
                  <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{vistaDetalle.empresa || 'Sin empresa'}</div>
                </div>
              </div>
              {[
                { label: '📧 Correo', value: vistaDetalle.email },
                { label: '📞 Teléfono', value: vistaDetalle.telefono },
                { label: '📝 Notas', value: vistaDetalle.notas },
                { label: '📅 Agregado', value: formatFecha(vistaDetalle.creadoEn) },
              ].filter(r => r.value).map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--gray5)', fontSize: 14, minWidth: 120 }}>{r.label}</span>
                  <span style={{ fontSize: 14 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
