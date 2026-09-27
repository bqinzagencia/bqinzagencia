// pages/admin/soporte-ia.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { Logo } from '../index';
import toast from 'react-hot-toast';

export default function AdminSoporteIA() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();

  const [conversaciones, setConversaciones] = useState([]);
  const [usoPorDia, setUsoPorDia]           = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [error, setError]                   = useState('');
  const [filtro, setFiltro]                 = useState('');
  const [modoFiltro, setModoFiltro]         = useState('');
  const [canalFiltro, setCanalFiltro]       = useState('');
  const [abierta, setAbierta]               = useState(null);
  const [seleccionadas, setSeleccionadas]   = useState(new Set());
  const [borrando, setBorrando]             = useState(false);
  const [vistaGrafica, setVistaGrafica]     = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard'); return; }
    }
  }, [user, esAdmin, loading]);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const r = await fetch('/api/admin-soporte-ia');
      const d = await r.json();
      if (!d.ok) { setError(d.error || 'No se pudo cargar'); setCargando(false); return; }
      setConversaciones(d.conversaciones || []);
      setUsoPorDia(d.usoPorDia || []);
    } catch (e) {
      setError('Error de conexión: ' + e.message);
    }
    setCargando(false);
  };

  useEffect(() => { if (esAdmin) cargar(); }, [esAdmin]);

  const toDate = ts => {
    if (!ts) return null;
    if (ts._seconds) return new Date(ts._seconds * 1000);
    if (ts.toDate) return ts.toDate();
    return null;
  };
  const fmtFecha = ts => {
    const d = toDate(ts);
    if (!d) return '—';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const hoyKey = () => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const mensajesHoy    = usoPorDia.find(u => u.fecha === hoyKey())?.count || 0;
  const mensajesTotal  = usoPorDia.reduce((s, u) => s + u.count, 0);
  const maxDia         = Math.max(...usoPorDia.map(u => u.count), 1);

  // Semana actual vs semana anterior
  const hoy = new Date();
  const inicioSemana = new Date(hoy); inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const semanaActual = usoPorDia
    .filter(u => new Date(u.fecha) >= inicioSemana)
    .reduce((s, u) => s + u.count, 0);
  const semanaAnterior = usoPorDia
    .filter(u => {
      const d = new Date(u.fecha);
      const inicio7 = new Date(inicioSemana); inicio7.setDate(inicio7.getDate() - 7);
      return d >= inicio7 && d < inicioSemana;
    })
    .reduce((s, u) => s + u.count, 0);
  const tendencia = semanaAnterior > 0
    ? Math.round(((semanaActual - semanaAnterior) / semanaAnterior) * 100)
    : null;

  const conversacionesFiltradas = conversaciones.filter(c => {
    const matchModo  = !modoFiltro || c.modo === modoFiltro;
    const matchCanal = !canalFiltro || c.canal === canalFiltro || (canalFiltro === 'web' && !c.canal);
    const matchTexto = !filtro || (
      c.empresaNombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.ip?.includes(filtro) ||
      c.mensajes?.some(m => m.texto?.toLowerCase().includes(filtro.toLowerCase()))
    );
    return matchModo && matchCanal && matchTexto;
  });

  const toggleSeleccion = (id, e) => {
    e.stopPropagation();
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const todasSeleccionadas = conversacionesFiltradas.length > 0 &&
    conversacionesFiltradas.every(c => seleccionadas.has(c.id));

  const toggleSeleccionarTodas = () => {
    setSeleccionadas(prev => {
      if (todasSeleccionadas) return new Set();
      return new Set(conversacionesFiltradas.map(c => c.id));
    });
  };

  const eliminarIds = async (ids, mensajeConfirm) => {
    if (!ids.length) return;
    if (!confirm(mensajeConfirm)) return;
    setBorrando(true);
    try {
      const r = await fetch('/api/admin-soporte-ia', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const d = await r.json();
      if (!d.ok) { toast.error('Error: ' + (d.error || 'desconocido')); setBorrando(false); return; }
      toast.success(`${d.eliminadas} conversación(es) eliminada(s)`);
      setConversaciones(prev => prev.filter(c => !ids.includes(c.id)));
      setSeleccionadas(new Set());
      setAbierta(prev => ids.includes(prev) ? null : prev);
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setBorrando(false);
  };

  const limpiarAntiguas = async () => {
    if (!confirm('¿Eliminar TODAS las conversaciones de más de 30 días? Esta acción no se puede deshacer.')) return;
    setBorrando(true);
    try {
      const r = await fetch('/api/admin-soporte-ia', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanDays: 30 }),
      });
      const d = await r.json();
      if (!d.ok) { toast.error('Error: ' + (d.error || 'desconocido')); setBorrando(false); return; }
      toast.success(`${d.eliminadas} conversación(es) antigua(s) eliminadas`);
      await cargar();
      setSeleccionadas(new Set());
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
    setBorrando(false);
  };

  const exportarCSV = () => {
    const lista = conversacionesFiltradas.length > 0 ? conversacionesFiltradas : [];
    if (lista.length === 0) { toast.error('No hay conversaciones para exportar'); return; }
    const filas = [['Fecha', 'Empresa', 'Modo', 'Canal', 'IP / Teléfono', 'Rol', 'Mensaje']];
    lista.forEach(c => {
      const fecha = fmtFecha(c.actualizadoEn);
      (c.mensajes || []).forEach(m => {
        filas.push([fecha, c.empresaNombre || 'Visitante', c.modo || 'soporte', c.canal === 'whatsapp' ? 'WhatsApp' : 'Web', c.ip || '', m.rol === 'user' ? 'Cliente' : 'IA', (m.texto || '').replace(/\n/g, ' ')]);
      });
    });
    const csv = filas.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `soporte-ia-${hoyKey()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const [verTabla, setVerTabla] = useState(false);

  // Copiar datos al portapapeles como texto tab-separado (pegar directo en Google Sheets)
  const copiarParaSheets = () => {
    if (usoPorDia.length === 0) { toast.error('No hay estadísticas'); return; }
    // Tab entre columnas, salto de línea entre filas — formato nativo de Google Sheets
    const filas = ['Fecha\tMensajes', ...usoPorDia.map(u => `${u.fecha}\t${u.count}`)];
    const texto = filas.join('\r\n'); // \r\n necesario para que Sheets respete las filas correctamente
    navigator.clipboard.writeText(texto)
      .then(() => {
        toast.success('✅ Copiado. Abre Google Sheets → haz clic en la celda A1 → Ctrl+V', { duration: 6000 });
        window.open('https://sheets.new', '_blank');
      })
      .catch(() => {
        // Fallback: seleccionar texto de la tabla visible
        toast.error('Permiso denegado. Usa el botón "Ver tabla completa" y copia manualmente.');
        setVerTabla(true);
      });
  };

  if (loading || !esAdmin) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Soporte IA — Admin</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--black)' }}>

        {/* Nav */}
        <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--gray1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Logo size={20} />
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>🤖 Conversaciones — Soporte IA</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={cargar} disabled={cargando}>🔄 Actualizar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin')}>← Volver al admin</button>
            <span style={{ color: 'var(--gray5)', fontSize: 14 }}>{user?.email}</span>
          </div>
        </nav>

        <div style={{ padding: '40px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: 24, marginBottom: 24, color: '#EF4444' }}>
              {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#25D366' }}>{mensajesHoy}</div>
              <div style={{ fontSize: 11, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Mensajes hoy</div>
            </div>
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#60A5FA' }}>{mensajesTotal}</div>
              <div style={{ fontSize: 11, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Mensajes últimos 30 días</div>
            </div>
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#FF6B00' }}>{conversaciones.length}</div>
              <div style={{ fontSize: 11, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Conversaciones guardadas</div>
            </div>
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: semanaActual >= semanaAnterior ? '#25D366' : '#EF4444' }}>{semanaActual}</div>
                {tendencia !== null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: tendencia >= 0 ? '#25D366' : '#EF4444' }}>
                    {tendencia >= 0 ? '▲' : '▼'} {Math.abs(tendencia)}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Esta semana vs anterior</div>
            </div>
          </div>

          {/* Gráfico de barras — uso histórico (los 113 mensajes están aquí) */}
          {usoPorDia.length > 0 && (
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Actividad histórica de mensajes</div>
                  <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 3 }}>
                    ℹ️ {mensajesTotal} mensajes registrados como contadores diarios
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setVerTabla(v => !v)}>
                    {verTabla ? '📉 Ocultar tabla' : '📊 Ver tabla completa'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={copiarParaSheets} title="Copia los datos y abre Google Sheets para pegar">
                    📋 Copiar → Google Sheets
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, overflowX: 'auto', paddingBottom: 4 }}>
                {usoPorDia.slice().reverse().map(u => {
                  const pct    = Math.max(4, Math.round((u.count / maxDia) * 100));
                  const esHoy  = u.fecha === hoyKey();
                  return (
                    <div key={u.fecha} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32, flex: 1 }} title={`${u.fecha}: ${u.count} mensajes`}>
                      <div style={{ fontSize: 10, color: esHoy ? '#25D366' : '#cbd5e1', fontWeight: esHoy ? 700 : 400, marginBottom: 3 }}>{u.count}</div>
                      <div style={{ width: '100%', height: `${pct}%`, background: esHoy ? '#25D366' : 'rgba(96,165,250,0.5)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                      <div style={{ fontSize: 10, color: esHoy ? '#25D366' : '#cbd5e1', marginTop: 4, whiteSpace: 'nowrap' }}>{u.fecha.slice(5)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Tabla de datos inline — visible sin Excel ni CSV */}
              {verTabla && (
                <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--gray5)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Fecha</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--gray5)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Mensajes</th>
                        <th style={{ padding: '8px 12px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usoPorDia.map((u, i) => {
                        const esHoy = u.fecha === hoyKey();
                        const barW  = Math.round((u.count / maxDia) * 100);
                        return (
                          <tr key={u.fecha} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: esHoy ? 'rgba(37,211,102,0.04)' : 'transparent' }}>
                            <td style={{ padding: '8px 12px', color: esHoy ? '#25D366' : '#fff', fontWeight: esHoy ? 700 : 400 }}>
                              {esHoy ? '🟢 ' : ''}{u.fecha}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: esHoy ? '#25D366' : '#60A5FA' }}>
                              {u.count}
                            </td>
                            <td style={{ padding: '8px 12px', width: 160 }}>
                              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                <div style={{ width: `${barW}%`, height: '100%', background: esHoy ? '#25D366' : 'rgba(96,165,250,0.6)', borderRadius: 4 }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}>TOTAL</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#FF6B00', fontSize: 16 }}>{mensajesTotal}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Barra de acciones */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, flex: 1 }}>
              Historial ({conversacionesFiltradas.length})
            </h2>
            <button className="btn btn-ghost btn-sm" disabled={borrando || conversacionesFiltradas.length === 0} onClick={exportarCSV}>⬇️ Exportar CSV</button>
            <button className="btn btn-ghost btn-sm" disabled={borrando} onClick={limpiarAntiguas} style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}>🧹 Borrar +30 días</button>
            <select className="form-input" value={canalFiltro} onChange={e => setCanalFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
              <option value="">Todos los canales</option>
              <option value="web">💬 Chat web</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="telegram">✈️ Telegram</option>
            </select>
            <select className="form-input" value={modoFiltro} onChange={e => setModoFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
              <option value="">Ventas y soporte</option>
              <option value="ventas">Solo ventas</option>
              <option value="soporte">Solo soporte</option>
            </select>
            <input
              className="form-input"
              placeholder="🔍 Buscar empresa, IP o texto..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{ width: 260, borderRadius: 100 }}
            />
          </div>

          {/* Selección múltiple */}
          {conversacionesFiltradas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '0 4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--gray5)', cursor: 'pointer' }}>
                <input type="checkbox" checked={todasSeleccionadas} onChange={toggleSeleccionarTodas} />
                Seleccionar todas
              </label>
              {seleccionadas.size > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={borrando}
                  onClick={() => eliminarIds([...seleccionadas], `¿Eliminar ${seleccionadas.size} conversación(es) seleccionada(s)? Esta acción no se puede deshacer.`)}
                  style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  🗑️ Eliminar seleccionadas ({seleccionadas.size})
                </button>
              )}
            </div>
          )}

          {/* Lista de conversaciones */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            {cargando ? (
              <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                {conversaciones.length === 0 ? (
                  <>
                    <p style={{ marginBottom: 8 }}>Todavía no hay conversaciones guardadas.</p>
                    <p style={{ fontSize: 12, color: 'var(--gray5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                      Los <strong style={{ color: '#60A5FA' }}>{mensajesTotal} mensajes</strong> anteriores solo existen como contadores diarios —
                      el sistema de guardado de conversaciones completas se activó recientemente.
                      A partir de ahora cada conversación quedará registrada aquí.
                    </p>
                  </>
                ) : (
                  <p>Ninguna conversación coincide con tu búsqueda.</p>
                )}
              </div>
            ) : (
              <div>
                {conversacionesFiltradas.map((c, idx) => {
                  const primerMensajeUsuario = c.mensajes?.find(m => m.rol === 'user')?.texto || '(sin mensaje de usuario)';
                  const estaAbierta = abierta === c.id;
                  const esWhatsapp = c.canal === 'whatsapp';
                  const esTelegram = c.canal === 'telegram';
                  const canalInfo = esWhatsapp
                    ? { emoji: '📱', label: 'WhatsApp', bg: 'rgba(37,211,102,0.15)', color: '#25D366' }
                    : esTelegram
                    ? { emoji: '✈️', label: 'Telegram', bg: 'rgba(38,165,228,0.15)', color: '#26A5E4' }
                    : null;
                  return (
                    <div key={c.id} style={{ borderBottom: idx < conversacionesFiltradas.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div
                        onClick={() => setAbierta(estaAbierta ? null : c.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionadas.has(c.id)}
                          onClick={e => toggleSeleccion(c.id, e)}
                          onChange={() => {}}
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: canalInfo ? canalInfo.bg : (c.modo === 'ventas' ? 'rgba(255,107,0,0.1)' : 'rgba(37,211,102,0.1)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                        }}>{canalInfo ? canalInfo.emoji : (c.modo === 'ventas' ? '🎯' : '💬')}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{c.empresaNombre || 'Visitante'}</span>
                            {canalInfo && (
                              <span style={{ background: canalInfo.bg, color: canalInfo.color, borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3 }}>
                                {canalInfo.emoji} {canalInfo.label}
                              </span>
                            )}
                            <span style={{ background: c.modo === 'ventas' ? 'rgba(255,107,0,0.12)' : 'rgba(37,211,102,0.12)', color: c.modo === 'ventas' ? '#FF6B00' : '#25D366', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>
                              {c.modo || 'soporte'}
                            </span>
                            {c.ip && <span style={{ fontSize: 10, color: 'var(--gray5)' }}>{esWhatsapp ? `+${c.ip}` : (esTelegram ? `chat ${c.ip}` : c.ip)}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--gray5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {primerMensajeUsuario}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{fmtFecha(c.actualizadoEn)}</div>
                          <div style={{ fontSize: 10, color: 'var(--gray5)', marginTop: 3 }}>{c.totalMensajes || c.mensajes?.length || 0} mensajes</div>
                        </div>
                        <button
                          title="Eliminar esta conversación"
                          disabled={borrando}
                          onClick={(e) => { e.stopPropagation(); eliminarIds([c.id], '¿Eliminar esta conversación? Esta acción no se puede deshacer.'); }}
                          style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 12, color: '#EF4444', flexShrink: 0 }}
                        >🗑️</button>
                        <span style={{ color: 'var(--gray5)', fontSize: 12, flexShrink: 0 }}>{estaAbierta ? '▲' : '▼'}</span>
                      </div>

                      {estaAbierta && (
                        <div style={{ padding: '0 24px 20px 106px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(c.mensajes || []).map((m, i) => (
                            <div key={i} style={{
                              alignSelf: m.rol === 'user' ? 'flex-end' : 'flex-start',
                              maxWidth: '80%',
                              background: m.rol === 'user' ? 'rgba(37,211,102,0.1)' : 'rgba(255,107,0,0.08)',
                              border: `1px solid ${m.rol === 'user' ? 'rgba(37,211,102,0.2)' : 'rgba(255,107,0,0.15)'}`,
                              borderRadius: 12, padding: '9px 13px',
                            }}>
                              <div style={{ fontSize: 9, color: 'var(--gray5)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.rol === 'user' ? 'Cliente' : 'IA'}</div>
                              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{m.texto}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 16 }}>
            Mostrando las últimas {conversaciones.length} conversaciones (límite 300).
            {conversaciones.length === 0 && mensajesTotal > 0 && (
              <> Los {mensajesTotal} mensajes históricos están registrados solo como contadores — a partir de ahora se guardan completos.</>
            )}
          </p>
        </div>
      </div>
    </>
  );
}