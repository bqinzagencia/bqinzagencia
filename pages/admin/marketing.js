// pages/admin/marketing.js
// Panel de Marketing: CRM de leads, Calendario de contenido, Rendimiento de Reels
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { getLeads, updateLead, eliminarLead } from '../../lib/firebase';
import { formatFecha } from '../../lib/utils';
import { Logo } from '../index';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';

const ESTADO_LEAD = {
  nuevo:      { label: 'Nuevo',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  contactado: { label: 'Contactado', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  demo:       { label: 'Demo',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  convertido: { label: 'Convertido', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  perdido:    { label: 'Perdido',    color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEM = ['L','M','X','J','V','S','D'];

export default function MarketingPanel() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab]                   = useState('crm');
  const [leads, setLeads]               = useState([]);
  const [filtroLead, setFiltroLead]     = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [reels, setReels]               = useState([]);
  const [posts, setPosts]               = useState([]);
  const [loadingData, setLoadingData]   = useState(true);
  const [mesActual, setMesActual]       = useState(new Date().getMonth());
  const [anioActual, setAnioActual]     = useState(new Date().getFullYear());
  const [modalReel, setModalReel]       = useState(null);
  const [modalPost, setModalPost]       = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard'); return; }
    }
  }, [user, esAdmin, loading]);

  useEffect(() => {
    if (!esAdmin) return;
    (async () => {
      const [lds, reelsSnap, postsSnap] = await Promise.all([
        getLeads(500),
        getDocs(query(collection(db, 'marketing_reels'), orderBy('creadoEn', 'desc'))),
        getDocs(query(collection(db, 'marketing_posts'), orderBy('fecha', 'asc'))),
      ]);
      setLeads(lds);
      setReels(reelsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingData(false);
    })();
  }, [esAdmin]);

  const leadsFiltrados = leads.filter(l => {
    const matchText = !filtroLead ||
      l.nombre?.toLowerCase().includes(filtroLead.toLowerCase()) ||
      l.instagram?.toLowerCase().includes(filtroLead.toLowerCase());
    const matchEstado = !estadoFiltro || l.estado === estadoFiltro;
    return matchText && matchEstado;
  });

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

  async function guardarReel(datos) {
    if (datos.id) {
      await updateDoc(doc(db, 'marketing_reels', datos.id), { ...datos, actualizadoEn: serverTimestamp() });
      setReels(prev => prev.map(r => r.id === datos.id ? { ...r, ...datos } : r));
      toast.success('Reel actualizado');
    } else {
      const ref = await addDoc(collection(db, 'marketing_reels'), { ...datos, creadoEn: serverTimestamp() });
      setReels(prev => [{ id: ref.id, ...datos }, ...prev]);
      toast.success('Reel añadido');
    }
    setModalReel(null);
  }

  async function borrarReel(id) {
    if (!confirm('¿Eliminar este reel?')) return;
    await deleteDoc(doc(db, 'marketing_reels', id));
    setReels(prev => prev.filter(r => r.id !== id));
    toast.success('Reel eliminado');
  }

  async function guardarPost(datos) {
    if (datos.id) {
      await updateDoc(doc(db, 'marketing_posts', datos.id), { ...datos });
      setPosts(prev => prev.map(p => p.id === datos.id ? { ...p, ...datos } : p));
      toast.success('Publicación actualizada');
    } else {
      const ref = await addDoc(collection(db, 'marketing_posts'), datos);
      setPosts(prev => [...prev, { id: ref.id, ...datos }].sort((a, b) => a.fecha?.localeCompare(b.fecha)));
      toast.success('Publicación añadida');
    }
    setModalPost(null);
  }

  async function borrarPost(id) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await deleteDoc(doc(db, 'marketing_posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Publicación eliminada');
  }

  // Métricas globales
  const totalLeads = leads.length;
  const convertidos = leads.filter(l => l.estado === 'convertido').length;
  const tasaConv = totalLeads > 0 ? Math.round((convertidos / totalLeads) * 100) : 0;
  const totalVistas = reels.reduce((s, r) => s + (Number(r.vistas) || 0), 0);
  const totalLeadsReels = reels.reduce((s, r) => s + (Number(r.leads) || 0), 0);
  const mejorReel = reels.reduce((best, r) => (Number(r.leads) || 0) > (Number(best?.leads) || 0) ? r : best, null);

  // Calendario
  function diasEnMes(m, a) { return new Date(a, m + 1, 0).getDate(); }
  function primerDiaSemana(m, a) {
    const d = new Date(a, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  }
  const totalDias = diasEnMes(mesActual, anioActual);
  const offset = primerDiaSemana(mesActual, anioActual);
  const hoy = new Date();
  const esHoy = (dia) => dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
  const postsDeMes = posts.filter(p => {
    if (!p.fecha) return false;
    const [y, m] = p.fecha.split('-').map(Number);
    return m - 1 === mesActual && y === anioActual;
  });
  function postsEnDia(dia) {
    const dStr = `${anioActual}-${String(mesActual + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    return postsDeMes.filter(p => p.fecha === dStr);
  }

  const S = {
    nav: { padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--gray1)' },
    tab: (active) => ({ background: 'none', border: 'none', borderBottom: active ? '2px solid #FF6B00' : '2px solid transparent', color: active ? '#FF6B00' : 'var(--gray5)', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, padding: '10px 18px', cursor: 'pointer', marginBottom: -1 }),
    card: { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 },
    metric: { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' },
    btn: { background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--white)' },
    btnPrimary: { background: '#FF6B00', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff' },
  };

  if (loading || !esAdmin) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Marketing — BQinzagencIA</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--black)' }}>

        {/* NAV */}
        <nav style={S.nav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Logo size={18} />
            <button onClick={() => router.push('/admin')} style={{ ...S.btn, fontSize: 11 }}>← Admin</button>
            <span style={{ background: 'rgba(255,107,0,0.15)', color: '#FF6B00', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>📊 Marketing</span>
          </div>
          <span style={{ color: 'var(--gray5)', fontSize: 13 }}>{user?.email}</span>
        </nav>

        <div style={{ padding: '32px 40px' }}>

          {/* MÉTRICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Leads totales', value: totalLeads, color: '#3B82F6' },
              { label: 'Tasa conversión', value: `${tasaConv}%`, color: '#10B981' },
              { label: 'Convertidos', value: convertidos, color: '#10B981' },
              { label: 'Vistas totales', value: totalVistas.toLocaleString('es-ES'), color: '#F59E0B' },
              { label: 'Mejor reel', value: mejorReel?.titulo ? mejorReel.titulo.slice(0, 18) + '...' : '—', color: '#FF6B00', small: true },
            ].map((m, i) => (
              <div key={i} style={S.metric}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--gray5)', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: m.small ? 14 : 28, fontWeight: 800, color: m.color, lineHeight: 1.2 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
            {[
              { id: 'crm',       label: `🎯 CRM de leads (${leads.length})` },
              { id: 'reels',     label: `🎬 Reels (${reels.length})` },
              { id: 'calendario',label: '📅 Calendario' },
            ].map(t => (
              <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {/* ── TAB CRM ── */}
          {tab === 'crm' && (
            <>
              {/* Embudo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
                {Object.entries(ESTADO_LEAD).map(([k, v]) => (
                  <div key={k} style={{ ...S.metric, border: `1px solid ${v.color}33`, cursor: 'pointer', background: estadoFiltro === k ? v.bg : 'var(--gray1)' }}
                    onClick={() => setEstadoFiltro(estadoFiltro === k ? '' : k)}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: v.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{v.label}</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: v.color }}>{leads.filter(l => l.estado === k).length}</div>
                  </div>
                ))}
              </div>

              {/* Controles */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <input className="form-input" placeholder="🔍 Buscar nombre o @instagram..." value={filtroLead}
                  onChange={e => setFiltroLead(e.target.value)} style={{ width: 260, borderRadius: 100 }} />
                <select className="form-input" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
                  <option value="">Todos los estados</option>
                  {Object.entries(ESTADO_LEAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <span style={{ color: 'var(--gray5)', fontSize: 12, marginLeft: 'auto' }}>{leadsFiltrados.length} leads</span>
              </div>

              {/* Tabla leads */}
              <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                {leadsFiltrados.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                    <p>No hay leads todavía. Cuando alguien comente DEMO en tus Reels, aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr>
                        <th>Lead</th><th>Fuente</th><th>Reel origen</th><th>Negocio</th><th>Fecha</th><th>Estado</th><th>Notas</th><th>Acciones</th>
                      </tr></thead>
                      <tbody>
                        {leadsFiltrados.map(lead => {
                          const est = ESTADO_LEAD[lead.estado] || ESTADO_LEAD.nuevo;
                          return (
                            <tr key={lead.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: est.bg, color: est.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                    {(lead.nombre || lead.instagram || '?').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.nombre || '—'}</div>
                                    <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{lead.instagram ? `@${lead.instagram}` : lead.telefono || lead.email || '—'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 100 }}>
                                  {lead.fuente === 'instagram' ? '📸 IG' : lead.fuente === 'tiktok' ? '🎵 TT' : '📱 WA'}
                                </span>
                              </td>
                              <td style={{ fontSize: 11, color: 'var(--gray5)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.reel || '—'}</td>
                              <td style={{ fontSize: 12 }}>{lead.negocio || lead.interes || '—'}</td>
                              <td style={{ fontSize: 11, color: 'var(--gray5)' }}>{formatFecha(lead.creadoEn)}</td>
                              <td>
                                <select value={lead.estado || 'nuevo'} onChange={e => cambiarEstadoLead(lead.id, e.target.value)}
                                  style={{ background: est.bg, color: est.color, border: `1px solid ${est.color}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  {Object.entries(ESTADO_LEAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </td>
                              <td style={{ fontSize: 11, color: 'var(--gray5)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.notas || '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  {lead.instagram && (
                                    <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noreferrer"
                                      style={{ ...S.btn, padding: '5px 8px', textDecoration: 'none', fontSize: 12 }}>📸</a>
                                  )}
                                  {lead.telefono && (
                                    <a href={`https://wa.me/${lead.telefono}`} target="_blank" rel="noreferrer"
                                      style={{ ...S.btn, padding: '5px 8px', textDecoration: 'none', fontSize: 12 }}>💬</a>
                                  )}
                                  <button onClick={() => borrarLead(lead.id)}
                                    style={{ ...S.btn, borderColor: 'rgba(255,107,107,0.3)', color: '#FF6B6B', padding: '5px 8px' }}>🗑️</button>
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
            </>
          )}

          {/* ── TAB REELS ── */}
          {tab === 'reels' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button style={S.btnPrimary} onClick={() => setModalReel({})}>+ Añadir Reel</button>
              </div>

              {reels.length === 0 ? (
                <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
                  <p style={{ color: 'var(--gray5)' }}>No hay reels registrados. Añade tus primeros videos para ver el rendimiento.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Ranking header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 100px', gap: 12, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <span>Reel</span><span>Plataforma</span><span>Vistas</span><span>Leads</span><span>CTR</span><span></span>
                  </div>
                  {reels
                    .sort((a, b) => (Number(b.leads) || 0) - (Number(a.leads) || 0))
                    .map((reel, i) => {
                      const ctr = reel.vistas > 0 ? Math.round((Number(reel.leads) / Number(reel.vistas)) * 100) : 0;
                      const isTop = i === 0;
                      return (
                        <div key={reel.id} style={{ ...S.card, marginBottom: 0, display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 100px', gap: 12, alignItems: 'center', border: isTop ? '1px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isTop && <span style={{ background: 'rgba(255,107,0,0.15)', color: '#FF6B00', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap' }}>⭐ TOP</span>}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{reel.titulo}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{reel.descripcion || '—'}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, background: reel.plataforma === 'tiktok' ? 'rgba(255,107,107,0.1)' : 'rgba(59,130,246,0.1)', color: reel.plataforma === 'tiktok' ? '#FF6B6B' : '#3B82F6', padding: '2px 8px', borderRadius: 100, fontSize: 11 }}>
                            {reel.plataforma === 'tiktok' ? '🎵 TikTok' : '📸 Instagram'}
                          </span>
                          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#F59E0B' }}>{Number(reel.vistas || 0).toLocaleString('es-ES')}</span>
                          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#3B82F6' }}>{reel.leads || 0}</span>
                          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#10B981' }}>{ctr}%</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setModalReel(reel)} style={{ ...S.btn, padding: '5px 10px', fontSize: 12 }}>✏️</button>
                            <button onClick={() => borrarReel(reel.id)} style={{ ...S.btn, borderColor: 'rgba(255,107,107,0.3)', color: '#FF6B6B', padding: '5px 10px', fontSize: 12 }}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {/* ── TAB CALENDARIO ── */}
          {tab === 'calendario' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button style={S.btn} onClick={() => { if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); } else setMesActual(m => m - 1); }}>←</button>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800 }}>{MESES[mesActual]} {anioActual}</span>
                  <button style={S.btn} onClick={() => { if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); } else setMesActual(m => m + 1); }}>→</button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--gray5)', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(59,130,246,0.4)', display: 'inline-block' }}></span>Instagram</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(255,107,107,0.4)', display: 'inline-block' }}></span>TikTok</span>
                  </div>
                  <button style={S.btnPrimary} onClick={() => setModalPost({ fecha: `${anioActual}-${String(mesActual+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`, plataforma: 'instagram' })}>+ Publicación</button>
                </div>
              </div>

              <div style={{ ...S.card }}>
                {/* Cabecera días semana */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
                  {DIAS_SEM.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray5)', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Celdas del mes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                  {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: totalDias }).map((_, i) => {
                    const dia = i + 1;
                    const dPosts = postsEnDia(dia);
                    const isToday = esHoy(dia);
                    return (
                      <div key={dia} onClick={() => setModalPost({ fecha: `${anioActual}-${String(mesActual+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`, plataforma: 'instagram' })}
                        style={{ minHeight: 56, borderRadius: 8, background: 'var(--gray2)', border: isToday ? '1.5px solid #FF6B00' : '1px solid rgba(255,255,255,0.06)', padding: '4px 6px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--gray2)'}
                      >
                        <div style={{ fontSize: 11, color: isToday ? '#FF6B00' : 'var(--gray5)', fontWeight: isToday ? 800 : 400, marginBottom: 3 }}>{dia}</div>
                        {dPosts.slice(0, 2).map(p => (
                          <div key={p.id} onClick={e => { e.stopPropagation(); setModalPost(p); }}
                            style={{ fontSize: 10, background: p.plataforma === 'tiktok' ? 'rgba(255,107,107,0.2)' : 'rgba(59,130,246,0.2)', color: p.plataforma === 'tiktok' ? '#FF8A8A' : '#93C5FD', borderRadius: 4, padding: '1px 4px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.plataforma === 'tiktok' ? '🎵' : '📸'} {p.titulo || 'Sin título'}
                          </div>
                        ))}
                        {dPosts.length > 2 && <div style={{ fontSize: 9, color: 'var(--gray5)' }}>+{dPosts.length - 2} más</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de próximas publicaciones */}
              {postsDeMes.length > 0 && (
                <div style={{ ...S.card, marginTop: 16 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Publicaciones de {MESES[mesActual]}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {postsDeMes.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <span style={{ fontSize: 16 }}>{p.plataforma === 'tiktok' ? '🎵' : '📸'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.titulo || 'Sin título'}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{p.fecha} · {p.plataforma === 'tiktok' ? 'TikTok' : 'Instagram'} {p.hora ? `· ${p.hora}` : ''}</div>
                        </div>
                        <span style={{ fontSize: 11, background: p.estado === 'publicado' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: p.estado === 'publicado' ? '#10B981' : '#F59E0B', padding: '2px 8px', borderRadius: 100 }}>
                          {p.estado === 'publicado' ? 'Publicado' : 'Pendiente'}
                        </span>
                        <button onClick={() => setModalPost(p)} style={{ ...S.btn, padding: '4px 8px', fontSize: 12 }}>✏️</button>
                        <button onClick={() => borrarPost(p.id)} style={{ ...S.btn, borderColor: 'rgba(255,107,107,0.3)', color: '#FF6B6B', padding: '4px 8px', fontSize: 12 }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Modal Reel */}
      {modalReel !== null && <ModalReel datos={modalReel} onClose={() => setModalReel(null)} onGuardar={guardarReel} />}

      {/* Modal Post */}
      {modalPost !== null && <ModalPost datos={modalPost} onClose={() => setModalPost(null)} onGuardar={guardarPost} onBorrar={borrarPost} />}
    </>
  );
}

function ModalReel({ datos, onClose, onGuardar }) {
  const [titulo, setTitulo]         = useState(datos.titulo || '');
  const [descripcion, setDesc]      = useState(datos.descripcion || '');
  const [plataforma, setPlat]       = useState(datos.plataforma || 'instagram');
  const [vistas, setVistas]         = useState(datos.vistas || '');
  const [leads, setLeads]           = useState(datos.leads || '');
  const [url, setUrl]               = useState(datos.url || '');
  const [saving, setSaving]         = useState(false);

  async function guardar() {
    if (!titulo.trim()) { toast.error('El título es obligatorio'); return; }
    setSaving(true);
    await onGuardar({ ...datos, titulo, descripcion, plataforma, vistas: Number(vistas) || 0, leads: Number(leads) || 0, url });
    setSaving(false);
  }

  return (
    <ModalShell title={datos.id ? 'Editar Reel' : '+ Añadir Reel'} onClose={onClose}>
      <Campo label="Título del video" value={titulo} onChange={setTitulo} placeholder="Bot mientras descansas..." />
      <Campo label="Descripción (opcional)" value={descripcion} onChange={setDesc} placeholder="Breve descripción..." />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: 'var(--gray5)', display: 'block', marginBottom: 6 }}>Plataforma</label>
        <select className="form-input" value={plataforma} onChange={e => setPlat(e.target.value)} style={{ width: '100%' }}>
          <option value="instagram">📸 Instagram</option>
          <option value="tiktok">🎵 TikTok</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo label="Vistas totales" value={vistas} onChange={setVistas} placeholder="12400" />
        <Campo label="Leads generados" value={leads} onChange={setLeads} placeholder="23" />
      </div>
      <Campo label="URL del video (opcional)" value={url} onChange={setUrl} placeholder="https://instagram.com/reel/..." />
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </ModalShell>
  );
}

function ModalPost({ datos, onClose, onGuardar, onBorrar }) {
  const [titulo, setTitulo]       = useState(datos.titulo || '');
  const [plataforma, setPlat]     = useState(datos.plataforma || 'instagram');
  const [fecha, setFecha]         = useState(datos.fecha || '');
  const [hora, setHora]           = useState(datos.hora || '');
  const [estado, setEstado]       = useState(datos.estado || 'pendiente');
  const [notas, setNotas]         = useState(datos.notas || '');
  const [saving, setSaving]       = useState(false);

  async function guardar() {
    if (!titulo.trim() || !fecha) { toast.error('Título y fecha son obligatorios'); return; }
    setSaving(true);
    await onGuardar({ ...datos, titulo, plataforma, fecha, hora, estado, notas });
    setSaving(false);
  }

  return (
    <ModalShell title={datos.id ? 'Editar publicación' : '+ Nueva publicación'} onClose={onClose}>
      <Campo label="Título / descripción" value={titulo} onChange={setTitulo} placeholder="Reel: bot mientras descansas..." />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: 'var(--gray5)', display: 'block', marginBottom: 6 }}>Plataforma</label>
        <select className="form-input" value={plataforma} onChange={e => setPlat(e.target.value)} style={{ width: '100%' }}>
          <option value="instagram">📸 Instagram</option>
          <option value="tiktok">🎵 TikTok</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo label="Fecha" value={fecha} onChange={setFecha} placeholder="2026-07-15" />
        <Campo label="Hora (opcional)" value={hora} onChange={setHora} placeholder="18:00" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: 'var(--gray5)', display: 'block', marginBottom: 6 }}>Estado</label>
        <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)} style={{ width: '100%' }}>
          <option value="pendiente">Pendiente</option>
          <option value="publicado">Publicado</option>
        </select>
      </div>
      <Campo label="Notas (opcional)" value={notas} onChange={setNotas} placeholder="Ideas, hashtags, CTA..." />
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {datos.id && <button onClick={() => { onBorrar(datos.id); onClose(); }} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#FF6B6B' }}>Eliminar</button>}
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn btn-primary" onClick={guardar} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--gray5)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
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
