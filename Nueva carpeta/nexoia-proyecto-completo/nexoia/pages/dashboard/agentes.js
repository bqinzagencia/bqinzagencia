// pages/dashboard/agentes.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAgentes, crearAgente, updateAgente, deleteAgente } from '../../lib/firebase';
import { CANALES, PLANES } from '../../lib/utils';

const TIPOS_AGENTE = [
  { value: 'ventas', label: '🛒 Ventas', desc: 'Captura leads, cotiza y cierra ventas' },
  { value: 'atencion', label: '🎧 Atención al cliente', desc: 'Responde preguntas y resuelve dudas' },
  { value: 'agenda', label: '📅 Agendamiento', desc: 'Gestiona citas y reservas automáticamente' },
  { value: 'soporte', label: '🔧 Soporte técnico', desc: 'Atiende problemas y solicitudes' },
  { value: 'info', label: 'ℹ️ Informativo', desc: 'Comparte info del negocio y servicios' },
];

export default function Agentes() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [agentes, setAgentes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'ventas', canales: ['web'], personalidad: '', prompt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) loadAgentes();
  }, [user]);

  const loadAgentes = async () => {
    const ags = await getAgentes(user.uid);
    setAgentes(ags);
  };

  const openNew = () => {
    setEditando(null);
    setForm({ nombre: '', tipo: 'ventas', canales: ['web'], personalidad: 'amigable y profesional', prompt: '' });
    setShowModal(true);
  };

  const openEdit = (ag) => {
    setEditando(ag.id);
    setForm({ nombre: ag.nombre, tipo: ag.tipo, canales: ag.canales || ['web'], personalidad: ag.personalidad || '', prompt: ag.prompt || '' });
    setShowModal(true);
  };

  const toggleCanal = (canal) => {
    setForm(f => ({
      ...f,
      canales: f.canales.includes(canal) ? f.canales.filter(c => c !== canal) : [...f.canales, canal],
    }));
  };

  const handleSave = async () => {
    if (!form.nombre) { toast.error('Dale un nombre al agente'); return; }
    const limiteAgentes = PLANES[empresa?.plan]?.agentes || 1;
    if (!editando && limiteAgentes !== -1 && agentes.length >= limiteAgentes) {
      toast.error(`Tu plan ${empresa?.plan} permite máximo ${limiteAgentes} agente(s). Actualiza tu plan para tener más.`);
      return;
    }
    setSaving(true);
    try {
      if (editando) {
        await updateAgente(user.uid, editando, form);
        toast.success('Agente actualizado');
      } else {
        await crearAgente(user.uid, form);
        toast.success('Agente creado exitosamente 🤖');
      }
      setShowModal(false);
      loadAgentes();
    } catch (e) {
      toast.error('Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este agente? Esta acción no se puede deshacer.')) return;
    await deleteAgente(user.uid, id);
    toast.success('Agente eliminado');
    loadAgentes();
  };

  const toggleActivo = async (ag) => {
    await updateAgente(user.uid, ag.id, { activo: !ag.activo });
    toast.success(ag.activo ? 'Agente pausado' : 'Agente activado');
    loadAgentes();
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;
  const limiteAgentes = PLANES[empresa?.plan]?.agentes;

  return (
    <>
      <Head><title>Mis Agentes IA — NEXOIA</title></Head>
      <DashboardLayout title="Mis Agentes IA">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <p style={{ color: 'var(--gray5)', fontSize: 14 }}>
              {agentes.length} agente{agentes.length !== 1 ? 's' : ''} creado{agentes.length !== 1 ? 's' : ''} · Plan {empresa.plan}: {limiteAgentes === -1 ? 'ilimitados' : `máx ${limiteAgentes}`}
            </p>
          </div>
          <button className="btn btn-accent" onClick={openNew}>+ Nuevo Agente IA</button>
        </div>

        {/* Agents grid */}
        {agentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Crea tu primer agente IA</h3>
            <p style={{ color: 'var(--gray5)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>Tu agente aprenderá sobre tu negocio y atenderá clientes automáticamente por WhatsApp, web y más canales.</p>
            <button className="btn btn-accent btn-lg" onClick={openNew}>Crear mi primer agente →</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {agentes.map(ag => (
              <div key={ag.id} style={{ background: 'var(--gray1)', border: `1px solid ${ag.activo ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 24, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: ag.activo ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      🤖
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16 }}>{ag.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{TIPOS_AGENTE.find(t => t.value === ag.tipo)?.label || ag.tipo}</div>
                    </div>
                  </div>
                  <button onClick={() => toggleActivo(ag)} style={{ background: ag.activo ? 'rgba(0,229,160,0.1)' : 'rgba(107,114,128,0.2)', border: 'none', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: ag.activo ? 'var(--accent)' : 'var(--gray5)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {ag.activo ? '● Activo' : '○ Pausado'}
                  </button>
                </div>

                {/* Canales */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {(ag.canales || ['web']).map(c => (
                    <span key={c} style={{ background: 'var(--gray2)', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: 'var(--gray6)' }}>
                      {CANALES[c]?.icon} {CANALES[c]?.label}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>{ag.conversaciones || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray5)' }}>Conversaciones</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(ag)}>✏️ Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ag.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal" style={{ maxWidth: 560 }}>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              <div className="modal-title">{editando ? 'Editar Agente' : 'Nuevo Agente IA'}</div>

              <div className="form-group">
                <label className="form-label">Nombre del agente</label>
                <input className="form-input" placeholder="Ej: Asistente de ventas, Bot de citas..."
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de agente</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TIPOS_AGENTE.map(t => (
                    <button key={t.value} onClick={() => setForm({...form, tipo: t.value})}
                      style={{ background: form.tipo === t.value ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', border: `1px solid ${form.tipo === t.value ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', color: form.tipo === t.value ? 'var(--accent)' : 'var(--gray6)', fontSize: 13, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>{t.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Canales de atención</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(CANALES).map(([key, c]) => (
                    <button key={key} onClick={() => toggleCanal(key)}
                      style={{ background: form.canales.includes(key) ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', border: `1px solid ${form.canales.includes(key) ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', color: form.canales.includes(key) ? 'var(--accent)' : 'var(--gray6)', fontSize: 13 }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Personalidad del agente</label>
                <input className="form-input" placeholder="Ej: amigable y profesional, formal y conciso..."
                  value={form.personalidad} onChange={e => setForm({...form, personalidad: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Instrucciones / Prompt base</label>
                <textarea className="form-input" rows={4} placeholder="Describe cómo debe comportarse tu agente. Ej: Eres el asistente de [empresa]. Ayuda a los clientes con preguntas sobre nuestros servicios..."
                  value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-accent" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear agente IA 🤖'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
