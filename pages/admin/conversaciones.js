// pages/admin/conversaciones.js
// Vista admin de solo lectura: conversaciones de WhatsApp de una empresa.
// Reutiliza /api/wasapbot-panel?id=... (mismo endpoint que usa el panel del cliente).
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { Logo } from '../index';

export default function AdminConversaciones() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [empresa,  setEmpresa]  = useState(null);
  const [convs,    setConvs]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [filtro,   setFiltro]   = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard'); return; }
    }
  }, [user, esAdmin, loading]);

  useEffect(() => {
    if (!esAdmin || !id) return;
    (async () => {
      setCargando(true);
      setError('');
      try {
        const r = await fetch(`/api/wasapbot-panel?id=${id}`);
        const d = await r.json();
        if (!d.ok) { setError(d.error || 'No se pudo cargar la empresa'); setCargando(false); return; }
        setEmpresa({ id, ...d.empresa });
        setConvs(d.convs || []);
      } catch (e) {
        setError('Error de conexión: ' + e.message);
      }
      setCargando(false);
    })();
  }, [esAdmin, id]);

  const toDate = ts => { if (!ts) return null; if (ts._seconds) return new Date(ts._seconds * 1000); if (ts.toDate) return ts.toDate(); return null; };
  const fmtFecha = ts => { const d = toDate(ts); if (!d) return '—'; return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };

  const convsFiltradas = convs.filter(c =>
    !filtro ||
    c.nombreCliente?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefono?.includes(filtro) ||
    c.ultimoTexto?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading || !esAdmin) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Conversaciones — {empresa?.nombreEmpresa || 'Admin'}</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
        <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--gray1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Logo size={20} />
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              💬 Conversaciones {empresa ? `— ${empresa.nombreEmpresa}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/admin')}>← Volver al admin</button>
            <span style={{ color: 'var(--gray5)', fontSize: 14 }}>{user?.email}</span>
          </div>
        </nav>

        <div style={{ padding: '40px' }}>
          {!id && (
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: 40, textAlign: 'center', color: '#F59E0B' }}>
              Falta el parámetro <code>id</code> de la empresa. Vuelve al panel admin y pulsa 💬 sobre una empresa.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: 24, marginBottom: 24, color: '#EF4444' }}>
              {error}
            </div>
          )}

          {empresa && (
            <>
              {/* Cabecera con info de la empresa */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{empresa.nombreEmpresa}</h2>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--gray5)' }}>
                    <span>{empresa.email}</span>
                    <span>·</span>
                    <span>{empresa.industria || 'otro'}</span>
                    <span>·</span>
                    <span style={{ color: empresa.planActivo ? '#25D366' : '#EF4444' }}>{empresa.planActivo ? 'Plan activo' : 'Sin plan activo'}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <input
                  className="form-input"
                  placeholder="🔍 Buscar cliente, teléfono o mensaje..."
                  value={filtro}
                  onChange={e => setFiltro(e.target.value)}
                  style={{ width: 280, borderRadius: 100 }}
                />
              </div>

              {/* Contador */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 18px' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#25D366' }}>{convs.length}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Conversaciones totales</div>
                </div>
                <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 18px' }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: '#60A5FA' }}>{convsFiltradas.length}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mostrando</div>
                </div>
              </div>

              {/* Lista de conversaciones */}
              <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                {cargando ? (
                  <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : convsFiltradas.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <p>{convs.length === 0 ? 'Esta empresa todavía no tiene conversaciones de WhatsApp.' : 'Ninguna conversación coincide con tu búsqueda.'}</p>
                  </div>
                ) : (
                  <div>
                    {convsFiltradas.map((c, i) => (
                      <div key={c.id || i} style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
                        borderBottom: i < convsFiltradas.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', background: 'rgba(37,211,102,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#25D366', flexShrink: 0,
                        }}>
                          {(c.nombreCliente || '?')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{c.nombreCliente || 'Cliente'}</span>
                            {c.telefono && (
                              <a href={`https://wa.me/${c.telefono}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#25D366', textDecoration: 'none' }}>
                                +{c.telefono}
                              </a>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--gray5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.ultimoTexto || 'Sin mensajes de texto'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{fmtFecha(c.ultimoMensaje)}</div>
                          <span style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 700, display: 'inline-block', marginTop: 3 }}>
                            WhatsApp
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 16 }}>
                Mostrando las últimas {convs.length} conversaciones (límite de la API). Vista de solo lectura — para responder o eliminar conversaciones, hazlo desde el panel del cliente.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
