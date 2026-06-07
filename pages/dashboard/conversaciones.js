// pages/dashboard/conversaciones.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { iniciales, tiempoRelativo } from '../../lib/utils';

const CANAL_ICONS = { 'Chat Web': '🌐', 'Sitio Web': '🌐', 'whatsapp': '💬', 'instagram': '📸', 'facebook': '📘', 'telegram': '🔵', 'Voz': '📞' };

export default function Conversaciones() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'empresas', user.uid, 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setConversaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const filtradas = conversaciones.filter(c =>
    !filtro ||
    (c.nombre || c.nombreCliente || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.ultimoMensajeTexto || c.mensajeUsuario || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.canal || '').toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Conversaciones — NEXOIA</title></Head>
      <DashboardLayout title="Conversaciones">
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 0, background: 'var(--gray1)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

          {/* Lista */}
          <div style={{ width: 320, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <input className="form-input" placeholder="🔍 Buscar..." value={filtro}
                onChange={e => setFiltro(e.target.value)} style={{ borderRadius: 100, fontSize: 13 }} />
            </div>

            <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 11, color: 'var(--gray5)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {filtradas.length} conversaciones
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtradas.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray5)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <p style={{ fontSize: 14 }}>Sin conversaciones aún</p>
                  <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>Tu agente IA registrará las conversaciones cuando los clientes contacten</p>
                </div>
              ) : filtradas.map(c => {
                const nombre = c.nombre || c.nombreCliente || 'Cliente';
                const preview = c.ultimoMensajeTexto || c.mensajeUsuario || 'Sin mensajes';
                const canal = c.canal || 'Chat Web';
                const isSelected = seleccionada?.id === c.id;
                return (
                  <div key={c.id} onClick={() => setSeleccionada(c)}
                    style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: isSelected ? 'rgba(0,229,160,0.06)' : 'transparent', borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? 'rgba(0,229,160,0.15)' : 'rgba(0,229,160,0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {iniciales(nombre)}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: isSelected ? 'var(--accent)' : 'var(--white)' }}>{nombre}</span>
                          <span style={{ fontSize: 10, color: 'var(--gray5)' }}>{tiempoRelativo(c.ultimoMensaje)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {CANAL_ICONS[canal] || '💬'} {preview}
                        </div>
                        {c.citaGuardada && (
                          <div style={{ marginTop: 4, fontSize: 10, color: '#00E5A0', fontWeight: 600 }}>📅 Cita agendada</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vista conversacion */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {seleccionada ? (
              <>
                {/* Header */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                    {iniciales(seleccionada.nombre || seleccionada.nombreCliente || 'CL')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{seleccionada.nombre || seleccionada.nombreCliente || 'Cliente'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>
                      {CANAL_ICONS[seleccionada.canal] || '💬'} {seleccionada.canal || 'Chat Web'} · {tiempoRelativo(seleccionada.ultimoMensaje)}
                      {seleccionada.agenteNombre && <span> · Agente: {seleccionada.agenteNombre}</span>}
                    </div>
                  </div>
                  {seleccionada.citaGuardada && (
                    <div style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      📅 Cita: {seleccionada.citaGuardada.servicio} · {seleccionada.citaGuardada.fecha}
                    </div>
                  )}
                </div>

                {/* Mensajes */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Mensaje del usuario */}
                  {seleccionada.mensajeUsuario && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--gray5)', textAlign: 'right', marginBottom: 4, fontWeight: 600 }}>CLIENTE</div>
                        <div style={{ maxWidth: 480, background: 'var(--accent)', color: '#000', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
                          {seleccionada.mensajeUsuario}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Respuesta del agente */}
                  {seleccionada.mensajeAgente && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--gray5)', marginBottom: 4, fontWeight: 600 }}>{(seleccionada.agenteNombre || 'AGENTE IA').toUpperCase()}</div>
                        <div style={{ maxWidth: 480, background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--gray7)' }}>
                          {seleccionada.mensajeAgente}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Si tiene cita guardada mostrar card */}
                  {seleccionada.citaGuardada && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 12, padding: '12px 20px', fontSize: 13, color: 'var(--accent)', textAlign: 'center' }}>
                        📅 Cita agendada automáticamente: <strong>{seleccionada.citaGuardada.nombre}</strong> — {seleccionada.citaGuardada.servicio} · {seleccionada.citaGuardada.fecha} {seleccionada.citaGuardada.hora}
                      </div>
                    </div>
                  )}

                  {!seleccionada.mensajeUsuario && !seleccionada.mensajeAgente && (
                    <div style={{ textAlign: 'center', color: 'var(--gray5)', padding: 40 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                      No hay mensajes en esta conversación
                    </div>
                  )}
                </div>

                {/* Info bottom */}
                <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--gray5)', background: 'var(--gray2)', borderRadius: 100, padding: '4px 12px' }}>
                    Canal: {seleccionada.canal || 'Chat Web'}
                  </span>
                  {seleccionada.agenteNombre && (
                    <span style={{ fontSize: 12, color: 'var(--gray5)', background: 'var(--gray2)', borderRadius: 100, padding: '4px 12px' }}>
                      Agente: {seleccionada.agenteNombre}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray5)' }}>
                <div style={{ fontSize: 48 }}>💬</div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>Selecciona una conversación</p>
                <p style={{ fontSize: 13 }}>Haz clic en un chat para verlo</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
