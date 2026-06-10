// pages/dashboard/voz/index.js
// Panel de gestión de voz IA — NEXOIA

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../../lib/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const INDUSTRIAS = {
  taller: { nombre: 'Mecá', emoji: '🔧', color: '#f59e0b' },
  peluqueria: { nombre: 'Bella', emoji: '💇', color: '#ec4899' },
  inmobiliaria: { nombre: 'Ino', emoji: '🏠', color: '#3b82f6' },
  restaurante: { nombre: 'Sazón', emoji: '🍽️', color: '#f97316' },
  tienda: { nombre: 'Tiendita', emoji: '🛒', color: '#8b5cf6' },
  papeleria: { nombre: 'Papelito', emoji: '📄', color: '#06b6d4' },
  gimnasio: { nombre: 'Fitbot', emoji: '💪', color: '#10b981' },
  salud: { nombre: 'Salud', emoji: '🏥', color: '#ef4444' },
  generico: { nombre: 'Nexo', emoji: '🤖', color: '#6b7280' },
};

function formatDuracion(seg) {
  if (!seg) return '0s';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatFecha(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function VozDashboard() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [llamadas, setLlamadas] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, duracionTotal: 0, leadsCapturados: 0 });
  const [tabActiva, setTabActiva] = useState('llamadas');
  const [llamadaSeleccionada, setLlamadaSeleccionada] = useState(null);
  const [configModal, setConfigModal] = useState(false);
  const [twilioNumber, setTwilioNumber] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    // Escuchar llamadas en tiempo real
    const qLlamadas = query(
      collection(db, 'empresas', user.uid, 'llamadas'),
      orderBy('fechaHora', 'desc'),
      limit(50)
    );
    const unsubLlamadas = onSnapshot(qLlamadas, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLlamadas(data);
      const total = data.length;
      const duracionTotal = data.reduce((acc, l) => acc + (l.duracion || 0), 0);
      setStats(s => ({ ...s, total, duracionTotal }));
    });

    // Escuchar leads
    const qLeads = query(
      collection(db, 'empresas', user.uid, 'leads'),
      orderBy('fechaHora', 'desc'),
      limit(50)
    );
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeads(data.filter(l => l.origen === 'llamada_voz'));
      setStats(s => ({ ...s, leadsCapturados: data.filter(l => l.origen === 'llamada_voz').length }));
    });

    // Cargar número Twilio de la empresa
    if (empresa?.twilioNumber) setTwilioNumber(empresa.twilioNumber);

    return () => { unsubLlamadas(); unsubLeads(); };
  }, [user, empresa]);

  const guardarConfig = async () => {
    if (!twilioNumber) { toast.error('Ingresa el número Twilio'); return; }
    setSavingConfig(true);
    try {
      await updateDoc(doc(db, 'empresas', user.uid), { twilioNumber });
      toast.success('Número Twilio guardado ✅');
      setConfigModal(false);
    } catch (e) {
      toast.error('Error guardando configuración');
    } finally { setSavingConfig(false); }
  };

  const industria = empresa?.industria || 'generico';
  const agenteInfo = INDUSTRIAS[industria] || INDUSTRIAS.generico;

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Voz IA — NEXOIA</title></Head>
      <DashboardLayout title="Voz IA">

        {/* BANNER AGENTE */}
        <div style={{
          background: `linear-gradient(135deg, ${agenteInfo.color}22, ${agenteInfo.color}08)`,
          border: `1px solid ${agenteInfo.color}44`,
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}>{agenteInfo.emoji}</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22 }}>
                Agente {agenteInfo.nombre}
              </div>
              <div style={{ color: 'var(--gray5)', fontSize: 14 }}>
                {empresa.twilioNumber
                  ? `📞 ${empresa.twilioNumber} — activo`
                  : '⚠️ Número Twilio no configurado'}
              </div>
            </div>
          </div>
          <button className="btn btn-accent" onClick={() => setConfigModal(true)}>
            ⚙️ Configurar número
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Llamadas totales', valor: stats.total, emoji: '📞' },
            { label: 'Tiempo en llamadas', valor: formatDuracion(stats.duracionTotal), emoji: '⏱️' },
            { label: 'Leads capturados', valor: stats.leadsCapturados, emoji: '🎯' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--accent)' }}>{s.valor}</div>
              <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['llamadas', 'leads'].map(t => (
            <button key={t} onClick={() => setTabActiva(t)}
              style={{ background: tabActiva === t ? 'rgba(0,229,160,0.1)' : 'var(--gray1)', border: `1px solid ${tabActiva === t ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '8px 20px', cursor: 'pointer', color: tabActiva === t ? 'var(--accent)' : 'var(--gray5)', fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>
              {t === 'llamadas' ? `📞 Llamadas (${llamadas.length})` : `🎯 Leads (${leads.length})`}
            </button>
          ))}
        </div>

        {/* LISTA LLAMADAS */}
        {tabActiva === 'llamadas' && (
          <div>
            {llamadas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📵</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sin llamadas aún</div>
                <div style={{ color: 'var(--gray5)', fontSize: 14 }}>Configura tu número Twilio y las llamadas aparecerán aquí en tiempo real</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {llamadas.map(ll => (
                  <div key={ll.id} onClick={() => setLlamadaSeleccionada(ll)}
                    style={{ background: 'var(--gray1)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,229,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📞</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{ll.from}</div>
                        <div style={{ color: 'var(--gray5)', fontSize: 12 }}>Agente: {ll.agente} · {formatDuracion(ll.duracion)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{formatFecha(ll.fechaHora)}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>
                        {ll.transcripcion?.length || 0} turnos · Ver →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTA LEADS */}
        {tabActiva === 'leads' && (
          <div>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sin leads aún</div>
                <div style={{ color: 'var(--gray5)', fontSize: 14 }}>Los leads capturados en llamadas aparecerán aquí automáticamente</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leads.map(lead => (
                  <div key={lead.id} style={{ background: 'var(--gray1)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{lead.nombre}</div>
                        <div style={{ color: 'var(--gray5)', fontSize: 12 }}>{lead.telefono} · {lead.servicio}</div>
                        {lead.notas && <div style={{ color: 'var(--gray5)', fontSize: 11, marginTop: 2, maxWidth: 400 }}>{lead.notas.slice(0, 80)}...</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{formatFecha(lead.fechaHora)}</div>
                      <div style={{ fontSize: 11, background: 'rgba(0,229,160,0.1)', color: 'var(--accent)', borderRadius: 100, padding: '2px 8px', marginTop: 4, display: 'inline-block' }}>
                        {lead.estado || 'nuevo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: VER TRANSCRIPCIÓN */}
        {llamadaSeleccionada && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setLlamadaSeleccionada(null)}>
            <div className="modal" style={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
              <button className="modal-close" onClick={() => setLlamadaSeleccionada(null)}>✕</button>
              <div className="modal-title">📞 Transcripción de llamada</div>
              <div style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20 }}>
                {llamadaSeleccionada.from} · {formatFecha(llamadaSeleccionada.fechaHora)} · {formatDuracion(llamadaSeleccionada.duracion)}
              </div>
              {(!llamadaSeleccionada.transcripcion || llamadaSeleccionada.transcripcion.length === 0) ? (
                <div style={{ color: 'var(--gray5)', textAlign: 'center', padding: 40 }}>Sin transcripción disponible</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {llamadaSeleccionada.transcripcion.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, flexDirection: t.rol === 'agente' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: t.rol === 'agente' ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {t.rol === 'agente' ? '🤖' : '👤'}
                      </div>
                      <div style={{ background: t.rol === 'agente' ? 'rgba(0,229,160,0.08)' : 'var(--gray2)', borderRadius: 10, padding: '10px 14px', maxWidth: '80%', fontSize: 14, lineHeight: 1.5, border: `1px solid ${t.rol === 'agente' ? 'rgba(0,229,160,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                        {t.texto}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: CONFIGURAR TWILIO */}
        {configModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfigModal(false)}>
            <div className="modal" style={{ maxWidth: 500 }}>
              <button className="modal-close" onClick={() => setConfigModal(false)}>✕</button>
              <div className="modal-title">⚙️ Configurar número de voz</div>
              <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Ingresa tu número Twilio. Cuando un cliente llame a ese número, el agente <strong style={{ color: 'var(--accent)' }}>{agenteInfo.nombre}</strong> responderá automáticamente.
              </p>
              <div className="form-group">
                <label className="form-label">Número Twilio (formato internacional)</label>
                <input className="form-input" placeholder="+1XXXXXXXXXX"
                  value={twilioNumber} onChange={e => setTwilioNumber(e.target.value)} />
                <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 6 }}>
                  Ejemplo: +15551234567 — consíguelo en console.twilio.com
                </div>
              </div>
              <div style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: 'var(--gray6)' }}>
                <strong>Webhook a configurar en Twilio:</strong><br />
                <code style={{ color: 'var(--accent)', fontSize: 12 }}>
                  https://tu-servidor.railway.app/incoming-call
                </code>
                <br /><span style={{ color: 'var(--gray5)' }}>Ver README del servidor para instrucciones completas.</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfigModal(false)}>Cancelar</button>
                <button className="btn btn-accent" style={{ flex: 2, justifyContent: 'center' }} onClick={guardarConfig} disabled={savingConfig}>
                  {savingConfig ? 'Guardando...' : 'Guardar número ✅'}
                </button>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}
