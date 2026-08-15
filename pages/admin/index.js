// pages/admin/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { getTodasEmpresas, getConfigGlobal, updateConfigGlobal,
  setEstadoEmpresa, eliminarEmpresaAdmin, chequearVencimientos,
  getSystemLogs, crearEmpresa, logoutUser,
  getLeads, updateLead, eliminarLead,
} from '../../lib/firebase';
import { getIndustriaInfo, formatFecha, iniciales, formatPrecio, PLANES } from '../../lib/utils';
import { Logo } from '../index';
import toast from 'react-hot-toast';

const PLAN_COLORS = { emprendedor: '#6B7280', profesional: '#00E5A0', agencia: '#A29BFE', basico:'#25D366', estandar:'#2563EB', pro:'#A78BFA', wasapbot:'#6B7280' };
const PLAN_LABEL_WASAPBOT = { basico:'Básico — 79€', estandar:'Estándar — 149€', pro:'Pro — 249€' };
const SECRET_METRICAS = process.env.NEXT_PUBLIC_ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

export default function AdminPanel() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();
  const [empresas, setEmpresas]       = useState([]);
  const [filtro, setFiltro]           = useState('');
  const [planFiltro, setPlanFiltro]   = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [config, setConfig]           = useState(null);
  const [logs, setLogs]               = useState([]);
  const [modal, setModal]             = useState(null);
  const [tabActiva, setTabActiva]      = useState('empresas'); // 'empresas' | 'leads'
  const [leads, setLeads]             = useState([]);
  const [filtroLead, setFiltroLead]   = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard'); return; }
    }
  }, [user, esAdmin, loading]);

  useEffect(() => {
    if (!esAdmin) return;
    (async () => {
      const [emp, cfg, lg, lds] = await Promise.all([getTodasEmpresas(), getConfigGlobal(), getSystemLogs(15), getLeads(200)]);
      const vencidasIds = await chequearVencimientos(emp);
      const empActualizadas = emp.map(e => vencidasIds.includes(e.id) ? { ...e, planActivo: false, estadoVencido: true } : e);
      setEmpresas(empActualizadas);
      setConfig(cfg);
      setLogs(lg);
      setLeads(lds);
      setLoadingData(false);
    })();
  }, [esAdmin]);

  const filtradas = empresas.filter(e => {
    const matchText = !filtro || e.nombreEmpresa?.toLowerCase().includes(filtro.toLowerCase()) || e.email?.toLowerCase().includes(filtro.toLowerCase());
    const matchPlan = !planFiltro || e.plan === planFiltro;
    return matchText && matchPlan;
  });

  const leadsFiltrados = leads.filter(l => {
    const matchText = !filtroLead || l.nombre?.toLowerCase().includes(filtroLead.toLowerCase()) || l.instagram?.toLowerCase().includes(filtroLead.toLowerCase());
    const matchEstado = !estadoFiltro || l.estado === estadoFiltro;
    return matchText && matchEstado;
  });

  const ESTADO_LEAD = {
    nuevo:      { label: 'Nuevo',      color: '#3B82F6' },
    contactado: { label: 'Contactado', color: '#F59E0B' },
    demo:       { label: 'Demo',       color: '#8B5CF6' },
    convertido: { label: 'Convertido', color: '#10B981' },
    perdido:    { label: 'Perdido',    color: '#6B7280' },
  };

  async function cambiarEstadoLead(leadId, nuevoEstado) {
    await updateLead(leadId, { estado: nuevoEstado });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: nuevoEstado } : l));
    toast.success('Estado actualizado');
  }

  async function borrarLead(leadId) {
    if (!confirm('¿Eliminar este lead?')) return;
    await eliminarLead(leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    toast.success('Lead eliminado');
  }

  const ingresos = empresas.reduce((sum, e) => sum + (e.planActivo ? (PLANES[e.plan]?.precio || 0) : 0), 0);

  async function toggleEstado(emp) {
    const nuevoEstado = !emp.planActivo;
    await setEstadoEmpresa(emp.id, nuevoEstado);
    setEmpresas(prev => prev.map(e => e.id === emp.id ? { ...e, planActivo: nuevoEstado, estadoVencido: false } : e));
    toast.success(nuevoEstado ? 'Empresa reactivada' : 'Empresa suspendida');
  }

  async function eliminarEmpresa(emp) {
    if (!confirm(`¿Eliminar permanentemente "${emp.nombreEmpresa}"? Esta acción no se puede deshacer.`)) return;
    await eliminarEmpresaAdmin(emp.id);
    setEmpresas(prev => prev.filter(e => e.id !== emp.id));
    toast.success('Empresa eliminada');
  }

  // ── Activar plan de pago de WasapBot (Básico/Estándar/Pro) ──
  // Usa el mismo endpoint que el panel de métricas, ya probado y funcionando,
  // en vez de duplicar la lógica de escritura directa a Firestore aquí.
  const [activandoPlan, setActivandoPlan] = useState(null);
  async function activarPlanWasapbot(empresaId, planId) {
    if (!confirm(`¿Activar el plan ${PLAN_LABEL_WASAPBOT[planId]} para esta empresa? Se marcará como pagado por 30 días.`)) return;
    setActivandoPlan(empresaId);
    try {
      const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET_METRICAS}, body:JSON.stringify({ accion:'activarPlan', empresaId, planId }) });
      const d = await r.json();
      if (d.ok) {
        toast.success('Plan activado');
        setEmpresas(prev => prev.map(e => e.id === empresaId ? { ...e, plan: planId, planActivo: true, producto:'wasapbot' } : e));
      } else toast.error('Error: ' + (d.error || 'desconocido'));
    } catch (e) { toast.error('Error: ' + e.message); }
    setActivandoPlan(null);
  }

  if (loading || !esAdmin) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Super Admin — NEXOIA</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
        <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--gray1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Logo size={20} />
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>⚡ Super Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal('credenciales')}>🔑 Credenciales</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setModal('reglas')}>⚙️ Reglas de negocio</button>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin/marketing')} style={{ background: 'rgba(255,107,0,0.1)', borderColor: 'rgba(255,107,0,0.3)', color: '#FF6B00' }}>📊 Marketing</button>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin/soporte-ia')}>🤖 Soporte IA</button>
            <span style={{ color: 'var(--gray5)', fontSize: 14 }}>{user?.email}</span>
            <button className="btn btn-ghost btn-sm" onClick={async () => { await logoutUser(); router.push('/'); }}>Salir</button>
          </div>
        </nav>

        <div style={{ padding: '40px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'Total empresas', value: empresas.length, color: '#00E5A0', icon: '🏢' },
              { label: 'Plan Emprendedor', value: empresas.filter(e => e.plan === 'emprendedor').length, color: '#6B7280', icon: '🌱' },
              { label: 'Plan Profesional', value: empresas.filter(e => e.plan === 'profesional').length, color: '#00E5A0', icon: '⭐' },
              { label: 'Plan Agencia', value: empresas.filter(e => e.plan === 'agencia').length, color: '#A29BFE', icon: '🚀' },
              { label: 'MRR estimado', value: formatPrecio(ingresos), color: '#F59E0B', icon: '💰' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)' }}>{s.label}</span>
                  <span>{s.icon}</span>
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: i === 4 ? 20 : 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
            {[{ id: 'empresas', label: `🏢 Empresas (${empresas.length})` }, { id: 'leads', label: `🎯 Leads Instagram (${leads.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setTabActiva(tab.id)} style={{
                background: 'none', border: 'none', borderBottom: tabActiva === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
                color: tabActiva === tab.id ? '#F59E0B' : 'var(--gray5)',
                fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 18px',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1,
              }}>{tab.label}</button>
            ))}
          </div>

          {/* TAB: EMPRESAS */}
          {tabActiva === 'empresas' && (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, flex: 1 }}>Empresas suscritas ({filtradas.length})</h2>
                <input className="form-input" placeholder="🔍 Buscar empresa o correo..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 240, borderRadius: 100 }} />
                <select className="form-input" value={planFiltro} onChange={e => setPlanFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
                  <option value="">Todos los planes</option>
                  <option value="emprendedor">Emprendedor</option>
                  <option value="profesional">Profesional</option>
                  <option value="agencia">Agencia</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('nuevaEmpresa')}>+ Añadir empresa</button>
              </div>

              <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
                {loadingData ? (
                  <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : filtradas.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
                    <p>No hay empresas registradas aún</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr>
                        <th>Empresa</th><th>Industria</th><th>Plan</th><th>Ciudad</th><th>Contacto</th><th>Registrado</th><th>Renovación</th><th>Estado</th><th>Acciones</th>
                      </tr></thead>
                      <tbody>
                        {filtradas.map((emp) => {
                          const ind = getIndustriaInfo(emp.industria);
                          const planColor = PLAN_COLORS[emp.plan] || '#6B7280';
                          return (
                            <tr key={emp.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: 10, background: ind.color + '22', color: ind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{iniciales(emp.nombreEmpresa)}</div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--white)' }}>{emp.nombreEmpresa || '—'}</div>
                                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{emp.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: 13 }}>{ind.label}</td>
                              <td>
                                <span style={{ background: planColor + '22', color: planColor, border: `1px solid ${planColor}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                  {emp.plan || 'emprendedor'}
                                </span>
                              </td>
                              <td style={{ fontSize: 13 }}>{emp.ciudad || '—'}</td>
                              <td style={{ fontSize: 13 }}>{emp.telefono || '—'}</td>
                              <td style={{ fontSize: 12 }}>{formatFecha(emp.creadoEn)}</td>
                              <td style={{ fontSize: 12, color: emp.estadoVencido ? '#FF6B6B' : 'var(--gray5)' }}>{emp.proximaRenovacion ? formatFecha(emp.proximaRenovacion) : '—'}</td>
                              <td>
                                <span className={'badge ' + (emp.planActivo ? 'badge-active' : 'badge-inactive')}>
                                  {emp.planActivo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 6, alignItems:'center', flexWrap:'wrap' }}>
                                  <select disabled={activandoPlan===emp.id} defaultValue="" onChange={ev=>{ if(ev.target.value) activarPlanWasapbot(emp.id, ev.target.value); ev.target.value=''; }}
                                    style={{ background:'var(--gray1)', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'5px 6px', fontSize:11, cursor:'pointer' }}>
                                    <option value="" disabled>Activar plan…</option>
                                    <option value="basico">Básico — 79€</option>
                                    <option value="estandar">Estándar — 149€</option>
                                    <option value="pro">Pro — 249€</option>
                                  </select>
                                  <button title={emp.planActivo ? 'Suspender' : 'Reactivar'} onClick={() => toggleEstado(emp)}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 13 }}>
                                    {emp.planActivo ? '⏸️' : '▶️'}
                                  </button>
                                  <button title="Ver conversaciones" onClick={() => router.push(`/admin/conversaciones?id=${emp.id}`)}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 13 }}>💬</button>
                                  <button title="Eliminar" onClick={() => eliminarEmpresa(emp)}
                                    style={{ background: 'none', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 13, color: '#FF6B6B' }}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <AlertasSistema logs={logs} />
            </>
          )}

          {/* TAB: LEADS */}
          {tabActiva === 'leads' && <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, flex: 1 }}>🎯 Leads de Instagram ({leadsFiltrados.length})</h2>
              <input className="form-input" placeholder="🔍 Buscar nombre o @instagram..." value={filtroLead} onChange={e => setFiltroLead(e.target.value)} style={{ width: 240, borderRadius: 100 }} />
              <select className="form-input" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
                <option value="">Todos los estados</option>
                {Object.entries(ESTADO_LEAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Resumen por estado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
              {Object.entries(ESTADO_LEAD).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--gray1)', border: `1px solid ${v.color}33`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setEstadoFiltro(estadoFiltro === k ? '' : k)}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: v.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: v.color }}>{leads.filter(l => l.estado === k).length}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              {leadsFiltrados.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                  <p>No hay leads todavía. Cuando alguien comente DEMO en tus Reels, aparecerán aquí.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr>
                      <th>Lead</th><th>Fuente</th><th>Reel</th><th>Neg. interes</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
                    </tr></thead>
                    <tbody>
                      {leadsFiltrados.map(lead => {
                        const est = ESTADO_LEAD[lead.estado] || ESTADO_LEAD.nuevo;
                        return (
                          <tr key={lead.id}>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)' }}>{lead.nombre || '—'}</div>
                              <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{lead.instagram ? `@${lead.instagram}` : lead.telefono || lead.email || '—'}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 100 }}>
                                {lead.fuente === 'instagram' ? '📸 Instagram' : lead.fuente === 'tiktok' ? '🎵 TikTok' : '📱 WhatsApp'}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--gray5)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.reel || '—'}</td>
                            <td style={{ fontSize: 12 }}>{lead.negocio || lead.interes || '—'}</td>
                            <td style={{ fontSize: 12 }}>{formatFecha(lead.creadoEn)}</td>
                            <td>
                              <select value={lead.estado || 'nuevo'} onChange={e => cambiarEstadoLead(lead.id, e.target.value)}
                                style={{ background: est.color + '22', color: est.color, border: `1px solid ${est.color}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                {Object.entries(ESTADO_LEAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {lead.instagram && (
                                  <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noreferrer"
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>📸</a>
                                )}
                                {lead.telefono && (
                                  <a href={`https://wa.me/${lead.telefono}`} target="_blank" rel="noreferrer"
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 9px', fontSize: 13, textDecoration: 'none' }}>💬</a>
                                )}
                                <button onClick={() => borrarLead(lead.id)}
                                  style={{ background: 'none', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 13, color: '#FF6B6B' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Instrucciones ManyChat */}
            <div style={{ marginTop: 24, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, padding: 22 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', marginBottom: 8 }}>🔗 Cómo conectar ManyChat con este panel</h4>
              <p style={{ fontSize: 12, color: 'var(--gray5)', lineHeight: 1.7, marginBottom: 8 }}>
                En ManyChat, crea una acción <strong style={{color:'#fff'}}>"Webhook POST"</strong> apuntando a:
              </p>
              <code style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#10B981', marginBottom: 8 }}>
                POST https://bqinzagencia.com/api/lead-instagram?api_key=bqinz_leads_2026
              </code>
              <p style={{ fontSize: 12, color: 'var(--gray5)', lineHeight: 1.7 }}>
                Con body JSON: <code style={{color:'#ccc'}}>{'{ "nombre": "{{first_name}}", "instagram": "{{instagram}}", "fuente": "instagram", "reel": "titulo_del_reel", "interes": "demo" }'}</code>
              </p>
            </div>
          </>}

        </div>
      </div>

      {modal === 'credenciales' && <ModalCredenciales config={config} onClose={() => setModal(null)} onSaved={setConfig} />}
      {modal === 'reglas'        && <ModalReglas config={config} onClose={() => setModal(null)} onSaved={setConfig} />}
      {modal === 'nuevaEmpresa'  && <ModalNuevaEmpresa onClose={() => setModal(null)} onCreated={(e) => setEmpresas(prev => [e, ...prev])} />}
    </>
  );
}

// ───────────────────────── MODAL: Credenciales globales ─────────────────────────
function ModalCredenciales({ config, onClose, onSaved }) {
  const [vapiKey, setVapiKey]   = useState(config?.vapiApiKey || '');
  const [openaiKey, setOpenai]  = useState(config?.openaiApiKey || '');
  const [waToken, setWaToken]   = useState(config?.whatsappToken || '');
  const [saving, setSaving]     = useState(false);

  async function guardar() {
    setSaving(true);
    const datos = { vapiApiKey: vapiKey, openaiApiKey: openaiKey, whatsappToken: waToken };
    await updateConfigGlobal(datos);
    onSaved(prev => ({ ...prev, ...datos }));
    setSaving(false);
    toast.success('Credenciales actualizadas');
    onClose();
  }

  return (
    <ModalShell title="🔑 Credenciales del sistema" subtitle="Se guardan en Firestore (config/global) — no requiere redeploy" onClose={onClose}>
      <Campo label="Vapi.ai API Key" value={vapiKey} onChange={setVapiKey} placeholder="sk_vapi_..." />
      <Campo label="OpenAI API Key" value={openaiKey} onChange={setOpenai} placeholder="sk-..." />
      <Campo label="WhatsApp Token" value={waToken} onChange={setWaToken} placeholder="EAAG..." />
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </ModalShell>
  );
}

// ───────────────────────── MODAL: Reglas de negocio / tokens ─────────────────────────
function ModalReglas({ config, onClose, onSaved }) {
  const [valores, setValores] = useState(() => {
    const base = {};
    for (const planId of Object.keys(PLANES)) {
      base[planId] = {
        tokensIncluidos: config?.[`tokens_${planId}`] ?? PLANES[planId].tokensIncluidos,
        precioRecarga1k: config?.[`recarga_${planId}`] ?? PLANES[planId].precioRecarga1k,
      };
    }
    return base;
  });
  const [saving, setSaving] = useState(false);

  function setCampo(planId, campo, valor) {
    setValores(prev => ({ ...prev, [planId]: { ...prev[planId], [campo]: valor } }));
  }

  async function guardar() {
    setSaving(true);
    const datos = {};
    for (const planId of Object.keys(valores)) {
      datos[`tokens_${planId}`] = Number(valores[planId].tokensIncluidos);
      datos[`recarga_${planId}`] = Number(valores[planId].precioRecarga1k);
    }
    await updateConfigGlobal(datos);
    onSaved(prev => ({ ...prev, ...datos }));
    setSaving(false);
    toast.success('Reglas de negocio actualizadas');
    onClose();
  }

  return (
    <ModalShell title="⚙️ Límites de tokens por plan" subtitle="Tokens incluidos/mes y precio de recarga por cada 1.000 tokens excedidos" onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {Object.keys(PLANES).map(planId => (
          <div key={planId} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, color: PLAN_COLORS[planId], marginBottom: 12, textTransform: 'capitalize' }}>{PLANES[planId].nombre}</div>
            <label style={{ fontSize: 11, color: 'var(--gray5)', display: 'block', marginBottom: 4 }}>Tokens incluidos/mes</label>
            <input className="form-input" type="number" value={valores[planId].tokensIncluidos}
              onChange={e => setCampo(planId, 'tokensIncluidos', e.target.value)} style={{ marginBottom: 12, width: '100%' }} />
            <label style={{ fontSize: 11, color: 'var(--gray5)', display: 'block', marginBottom: 4 }}>€ por 1.000 tokens extra</label>
            <input className="form-input" type="number" step="0.1" value={valores[planId].precioRecarga1k}
              onChange={e => setCampo(planId, 'precioRecarga1k', e.target.value)} style={{ width: '100%' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar reglas'}</button>
      </div>
    </ModalShell>
  );
}

// ───────────────────────── MODAL: Añadir empresa ─────────────────────────
function ModalNuevaEmpresa({ onClose, onCreated }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail]   = useState('');
  const [plan, setPlan]     = useState('emprendedor');
  const [saving, setSaving] = useState(false);

  async function crear() {
    if (!nombre.trim() || !email.trim()) { toast.error('Nombre y correo son requeridos'); return; }
    setSaving(true);
    try {
      // crearEmpresa requiere un uid — para alta manual desde admin usamos
      // un id sintético basado en el email hasta que el usuario inicie sesión.
      const uidTemporal = 'manual_' + email.replace(/[^a-zA-Z0-9]/g, '_');
      const empresaId = await crearEmpresa(uidTemporal, { nombreEmpresa: nombre, email, plan });
      onCreated({ id: empresaId, nombreEmpresa: nombre, email, plan, planActivo: true, creadoEn: new Date() });
      toast.success('Empresa creada');
      onClose();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
    setSaving(false);
  }

  return (
    <ModalShell title="+ Añadir empresa" onClose={onClose}>
      <Campo label="Nombre de la empresa" value={nombre} onChange={setNombre} placeholder="Mi Negocio S.L." />
      <Campo label="Correo de contacto" value={email} onChange={setEmail} placeholder="contacto@negocio.com" />
      <label style={{ fontSize: 12, color: 'var(--gray5)', display: 'block', marginBottom: 6 }}>Plan inicial</label>
      <select className="form-input" value={plan} onChange={e => setPlan(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
        {Object.keys(PLANES).map(p => <option key={p} value={p}>{PLANES[p].nombre}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn btn-primary" onClick={crear} disabled={saving} style={{ flex: 1 }}>{saving ? 'Creando...' : 'Crear empresa'}</button>
      </div>
    </ModalShell>
  );
}

// ───────────────────────── Alertas de sistema (logs) ─────────────────────────
function AlertasSistema({ logs }) {
  return (
    <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, marginBottom: 14 }}>🚨 Alertas de sistema</h3>
      {logs.length === 0 ? (
        <p style={{ color: 'var(--gray5)', fontSize: 13 }}>Sin errores registrados. Todo funcionando correctamente.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#FF8A8A', fontWeight: 600 }}>{log.tipo}</div>
                <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{log.mensaje}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gray5)', whiteSpace: 'nowrap' }}>{formatFecha(log.creadoEn)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Helpers de UI reutilizables ─────────────────────────
function ModalShell({ title, subtitle, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: wide ? 640 : 420, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--gray5)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--gray5)', marginBottom: 18 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: 'var(--gray5)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input className="form-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%' }} />
    </div>
  );
}
