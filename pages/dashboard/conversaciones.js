// pages/dashboard/conversaciones.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { escucharConversaciones } from '../../lib/firebase';
import { iniciales, tiempoRelativo, CANALES } from '../../lib/utils';

const CANAL_ICONS = { web: '🌐', whatsapp: '💬', instagram: '📸', facebook: '📘', telegram: '🔵' };

export default function Conversaciones() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const unsub = escucharConversaciones(user.uid, setConversaciones);
    return () => unsub();
  }, [user]);

  const filtradas = conversaciones.filter(c =>
    !filtro || c.nombreCliente?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.ultimoTexto?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Conversaciones — NEXOIA</title></Head>
      <DashboardLayout title="Conversaciones">
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 0, background: 'var(--gray1)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {/* List */}
          <div style={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input className="form-input" placeholder="🔍 Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)}
                style={{ borderRadius: 100, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtradas.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray5)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <p style={{ fontSize: 14 }}>Sin conversaciones aún</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Tu agente IA iniciará conversaciones cuando los clientes contacten</p>
                </div>
              ) : filtradas.map(c => (
                <div key={c.id} onClick={() => setSeleccionada(c)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: seleccionada?.id === c.id ? 'rgba(0,229,160,0.06)' : 'transparent', borderLeft: seleccionada?.id === c.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {iniciales(c.nombreCliente || 'CL')}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{c.nombreCliente || 'Cliente'}</span>
                        <span style={{ fontSize: 10, color: 'var(--gray5)' }}>{tiempoRelativo(c.ultimoMensaje)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {CANAL_ICONS[c.canal] || '💬'} {c.ultimoTexto || 'Sin mensajes'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat view */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {seleccionada ? (
              <>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                    {iniciales(seleccionada.nombreCliente || 'CL')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{seleccionada.nombreCliente || 'Cliente'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>
                      {CANAL_ICONS[seleccionada.canal] || '💬'} {seleccionada.canal || 'Web'} · {tiempoRelativo(seleccionada.ultimoMensaje)}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(seleccionada.mensajes || []).map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.rol === 'agente' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', background: msg.rol === 'agente' ? 'var(--accent)' : 'var(--gray2)', color: msg.rol === 'agente' ? 'var(--black)' : 'var(--white)', borderRadius: msg.rol === 'agente' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 16px', fontSize: 14, lineHeight: 1.5 }}>
                        {msg.texto}
                      </div>
                    </div>
                  ))}
                  {(!seleccionada.mensajes || seleccionada.mensajes.length === 0) && (
                    <div style={{ textAlign: 'center', color: 'var(--gray5)', padding: 40 }}>No hay mensajes en esta conversación</div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray5)' }}>
                <div style={{ fontSize: 48 }}>💬</div>
                <p style={{ fontWeight: 600 }}>Selecciona una conversación</p>
                <p style={{ fontSize: 13 }}>Haz clic en un chat para verlo</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
