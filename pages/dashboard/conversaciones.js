// pages/dashboard/conversaciones.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { db, escucharConversaciones } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { iniciales, tiempoRelativo } from '../../lib/utils';

const CANAL_ICONS   = { web: '🌐', whatsapp: '💬', instagram: '📸', facebook: '📘', telegram: '🔵' };
const CANAL_COLORES = { whatsapp: '#25D366', web: '#3B82F6', instagram: '#E1306C', telegram: '#0088CC' };

export default function Conversaciones() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [conversaciones, setConversaciones]   = useState([]);
  const [seleccionada, setSeleccionada]       = useState(null);
  const [mensajes, setMensajes]               = useState([]);
  const [cargandoMsgs, setCargandoMsgs]       = useState(false);
  const [filtro, setFiltro]                   = useState('');
  const [filtroCanal, setFiltroCanal]         = useState('todos');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  // Escuchar conversaciones en tiempo real (WhatsApp + web unificadas)
  useEffect(() => {
    if (!user) return;
    const unsub = escucharConversaciones(user.uid, setConversaciones);
    return () => unsub();
  }, [user]);

  // Cargar mensajes en tiempo real al seleccionar conversación
  useEffect(() => {
    if (!seleccionada || !user) { setMensajes([]); return; }
    setCargandoMsgs(true);
    setMensajes([]);

    const esWA  = seleccionada.canal === 'whatsapp' || !!seleccionada.waId;
    const docId = seleccionada.waId || seleccionada.id?.replace('wa_', '') || seleccionada.id;
    const col   = esWA ? 'conversaciones_wa' : 'conversaciones';

    const q = query(
      collection(db, 'empresas', user.uid, col, docId, 'mensajes'),
      orderBy('ts', 'asc')
    );

    const unsub = onSnapshot(q,
      snap => {
        setMensajes(snap.docs.map(d => ({
          id:    d.id,
          rol:   d.data().role === 'assistant' ? 'agente' : 'cliente',
          texto: d.data().content || '',
          ts:    d.data().ts,
        })));
        setCargandoMsgs(false);
      },
      () => setCargandoMsgs(false)
    );
    return () => unsub();
  }, [seleccionada?.id, user]);

  const filtradas = conversaciones.filter(c => {
    const matchTexto  = !filtro ||
      c.nombreCliente?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.ultimoTexto?.toLowerCase().includes(filtro.toLowerCase());
    const matchCanal  = filtroCanal === 'todos' || c.canal === filtroCanal;
    return matchTexto && matchCanal;
  });

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const totalWA  = conversaciones.filter(c => c.canal === 'whatsapp').length;
  const totalWeb = conversaciones.filter(c => c.canal !== 'whatsapp').length;

  return (
    <>
      <Head><title>Conversaciones — BQinzagencIA</title></Head>
      <DashboardLayout title="Conversaciones">

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'todos',     label: `Todos (${conversaciones.length})`, icon: '📋' },
            { key: 'whatsapp',  label: `WhatsApp (${totalWA})`,            icon: '💬' },
            { key: 'web',       label: `Web (${totalWeb})`,                icon: '🌐' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltroCanal(f.key)}
              style={{ background: filtroCanal === f.key ? 'rgba(0,229,160,0.1)' : 'var(--gray1)', border: `1px solid ${filtroCanal === f.key ? 'rgba(0,229,160,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '7px 18px', cursor: 'pointer', color: filtroCanal === f.key ? '#00E5A0' : 'var(--gray5)', fontSize: 13, fontWeight: 600 }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 200px)', background: 'var(--gray1)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

          {/* ── Lista de conversaciones ── */}
          <div style={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input className="form-input" placeholder="🔍 Buscar..." value={filtro}
                onChange={e => setFiltro(e.target.value)}
                style={{ borderRadius: 100, fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtradas.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray5)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <p style={{ fontSize: 14 }}>Sin conversaciones</p>
                  {filtroCanal === 'whatsapp' && (
                    <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                      Activa el bot de WhatsApp para ver los chats aquí en tiempo real
                    </p>
                  )}
                </div>
              ) : filtradas.map(c => (
                <div key={c.id} onClick={() => setSeleccionada(c)}
                  style={{ padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: seleccionada?.id === c.id ? 'rgba(0,229,160,0.06)' : 'transparent', borderLeft: `2px solid ${seleccionada?.id === c.id ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${CANAL_COLORES[c.canal] || '#888'}22`, color: CANAL_COLORES[c.canal] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {iniciales(c.nombreCliente || 'WA')}
                      </div>
                      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: 'var(--gray1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                        {CANAL_ICONS[c.canal] || '💬'}
                      </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                          {c.nombreCliente || c.waId || 'Cliente'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--gray5)', flexShrink: 0 }}>
                          {tiempoRelativo(c.ultimoMensaje || c.ultimaActividad)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.ultimoTexto || 'Sin mensajes'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Vista del chat ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {seleccionada ? (
              <>
                {/* Header */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${CANAL_COLORES[seleccionada.canal] || '#888'}22`, color: CANAL_COLORES[seleccionada.canal] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                      {iniciales(seleccionada.nombreCliente || 'WA')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{seleccionada.nombreCliente || seleccionada.waId || 'Cliente'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: `${CANAL_COLORES[seleccionada.canal] || '#888'}22`, color: CANAL_COLORES[seleccionada.canal] || '#888', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                          {CANAL_ICONS[seleccionada.canal]} {seleccionada.canal === 'whatsapp' ? 'WhatsApp' : 'Web'}
                        </span>
                        {seleccionada.waId && (
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray5)' }}>+{seleccionada.waId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {seleccionada.waId && (
                    <a href={`https://wa.me/${seleccionada.waId}`} target="_blank" rel="noopener noreferrer"
                      style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '7px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      💬 Abrir en WhatsApp
                    </a>
                  )}
                </div>

                {/* Mensajes */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cargandoMsgs ? (
                    <div style={{ textAlign: 'center', color: 'var(--gray5)', padding: 40 }}>Cargando mensajes...</div>
                  ) : mensajes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--gray5)', padding: 40 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                      Sin mensajes registrados aún
                    </div>
                  ) : mensajes.map((msg, i) => (
                    <div key={msg.id || i} style={{ display: 'flex', justifyContent: msg.rol === 'agente' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                      {msg.rol === 'cliente' && (
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                          {iniciales(seleccionada.nombreCliente || 'CL')}
                        </div>
                      )}
                      <div style={{ maxWidth: '68%', background: msg.rol === 'agente' ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', border: `1px solid ${msg.rol === 'agente' ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.06)'}`, color: 'var(--white)', borderRadius: msg.rol === 'agente' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55 }}>
                        {msg.texto}
                        {msg.ts && (
                          <div style={{ fontSize: 10, color: 'var(--gray5)', marginTop: 4, textAlign: 'right' }}>
                            {msg.ts?.toDate?.()?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) || ''}
                          </div>
                        )}
                      </div>
                      {msg.rol === 'agente' && (
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                          🤖
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray5)' }}>
                <div style={{ fontSize: 52 }}>💬</div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>Selecciona una conversación</p>
                <p style={{ fontSize: 13 }}>Verás aquí los mensajes del bot de WhatsApp en tiempo real</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
