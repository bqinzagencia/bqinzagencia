// pages/dashboard/voz/index.js
// Panel Voz IA — integrado con VAPI.ai

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../../lib/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { db, updateEmpresa } from '../../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const NARANJA = '#FF6B00';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDuracion(seg) {
  if (!seg) return '0s';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatFecha(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function VozDashboard() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  const [llamadas, setLlamadas]   = useState([]);
  const [leads, setLeads]         = useState([]);
  const [stats, setStats]         = useState({ total: 0, duracionTotal: 0, leadsCapturados: 0 });
  const [tab, setTab]             = useState('llamadas');
  const [llamadaSel, setLlamadaSel] = useState(null);

  // VAPI estado
  const [vapiKey, setVapiKey]         = useState('');
  const [vapiPrivKey, setVapiPrivKey] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [llamandoTest, setLlamandoTest] = useState(false);
  const [enLlamada, setEnLlamada]     = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [cargandoAsistentes, setCargandoAsistentes] = useState(false);
  const [asistentes, setAsistentes]   = useState([]);
  const [numerosVapi, setNumerosVapi] = useState([]);
  const [telefonoTest, setTelefonoTest] = useState('');

  const vapiRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    // Cargar config VAPI guardada
    if (empresa?.vapiPublicKey)     setVapiKey(empresa.vapiPublicKey);
    if (empresa?.vapiPrivateKey)    setVapiPrivKey(empresa.vapiPrivateKey);
    if (empresa?.vapiAssistantId)   setAssistantId(empresa.vapiAssistantId);
    if (empresa?.vapiPhoneNumberId) setPhoneNumberId(empresa.vapiPhoneNumberId);

    // Escuchar llamadas en tiempo real
    const qLlamadas = query(
      collection(db, 'empresas', user.uid, 'llamadas'),
      orderBy('fechaHora', 'desc'), limit(50)
    );
    const unsubL = onSnapshot(qLlamadas, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLlamadas(data);
      setStats(s => ({
        ...s,
        total: data.length,
        duracionTotal: data.reduce((acc, l) => acc + (l.duracion || 0), 0),
      }));
    });

    // Escuchar leads de llamadas
    const qLeads = query(
      collection(db, 'empresas', user.uid, 'leads'),
      orderBy('fechaHora', 'desc'), limit(50)
    );
    const unsubLe = onSnapshot(qLeads, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.origen === 'llamada_voz');
      setLeads(data);
      setStats(s => ({ ...s, leadsCapturados: data.length }));
    });

    return () => { unsubL(); unsubLe(); };
  }, [user, empresa]);

  // Cargar SDK de VAPI dinámicamente
  useEffect(() => {
    if (!vapiKey) return;
    import('@vapi-ai/web').then(({ default: Vapi }) => {
      vapiRef.current = new Vapi(vapiKey);
      vapiRef.current.on('call-start',  () => { setEnLlamada(true);  toast.success('📞 Llamada iniciada'); });
      vapiRef.current.on('call-end',    () => { setEnLlamada(false); setLlamandoTest(false); toast('📵 Llamada finalizada'); });
      vapiRef.current.on('error',       (e) => { setEnLlamada(false); setLlamandoTest(false); toast.error('Error: ' + (e?.message || 'desconocido')); });
    }).catch(() => {});
  }, [vapiKey]);

  // ── Cargar asistentes y números de VAPI ─────────────────────────────────────
  const cargarRecursosVapi = async () => {
    if (!vapiPrivKey) { toast.error('Primero guarda tu API Key privada de VAPI'); return; }
    setCargandoAsistentes(true);
    try {
      const [resA, resN] = await Promise.all([
        fetch('https://api.vapi.ai/assistant', { headers: { Authorization: `Bearer ${vapiPrivKey}` } }),
        fetch('https://api.vapi.ai/phone-number', { headers: { Authorization: `Bearer ${vapiPrivKey}` } }),
      ]);
      const [dataA, dataN] = await Promise.all([resA.json(), resN.json()]);
      setAsistentes(Array.isArray(dataA) ? dataA : []);
      setNumerosVapi(Array.isArray(dataN) ? dataN : []);
      if (!dataA?.length) toast('Sin asistentes en VAPI — créalos en dashboard.vapi.ai');
    } catch (e) {
      toast.error('Error conectando con VAPI');
    } finally {
      setCargandoAsistentes(false);
    }
  };

  // ── Guardar configuración ────────────────────────────────────────────────────
  const guardarConfig = async () => {
    if (!vapiKey || !vapiPrivKey) { toast.error('Las dos API Keys son obligatorias'); return; }
    setSavingConfig(true);
    try {
      await updateEmpresa(user.uid, {
        vapiPublicKey:    vapiKey,
        vapiPrivateKey:   vapiPrivKey,
        vapiAssistantId:  assistantId,
        vapiPhoneNumberId: phoneNumberId,
      });
      toast.success('✅ VAPI configurado correctamente');
      setConfigModal(false);
    } catch { toast.error('Error guardando'); }
    finally { setSavingConfig(false); }
  };

  // ── Test: llamada en el navegador (sin teléfono) ─────────────────────────────
  const iniciarLlamadaWeb = async () => {
    if (!vapiRef.current) { toast.error('Configura primero la API Key pública de VAPI'); return; }
    if (!assistantId)      { toast.error('Selecciona un asistente de VAPI'); return; }
    setLlamandoTest(true);
    try {
      await vapiRef.current.start(assistantId);
    } catch (e) {
      toast.error('No se pudo iniciar la llamada');
      setLlamandoTest(false);
    }
  };

  const colgarLlamada = () => {
    vapiRef.current?.stop();
    setEnLlamada(false);
    setLlamandoTest(false);
  };

  // ── Test: llamada a teléfono real ────────────────────────────────────────────
  const llamarTelefono = async () => {
    if (!vapiPrivKey)   { toast.error('Necesitas la API Key privada de VAPI'); return; }
    if (!assistantId)   { toast.error('Selecciona un asistente'); return; }
    if (!phoneNumberId) { toast.error('Selecciona un número de VAPI'); return; }
    if (!telefonoTest)  { toast.error('Ingresa el número al que llamar'); return; }

    setLlamandoTest(true);
    try {
      const res = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: { Authorization: `Bearer ${vapiPrivKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          phoneNumberId,
          customer: { number: telefonoTest },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`📞 Llamando a ${telefonoTest}...`);
      } else {
        toast.error(data?.message || 'Error al llamar');
      }
    } catch (e) {
      toast.error('Error de conexión con VAPI');
    } finally {
      setLlamandoTest(false);
    }
  };

  const vapiConfigurado = !!(empresa?.vapiPublicKey && empresa?.vapiAssistantId);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Voz IA — BQinzagencIA</title></Head>
      <DashboardLayout title="Voz IA">

        {/* ── Banner estado VAPI ── */}
        <div style={{
          background: vapiConfigurado ? 'rgba(34,197,94,0.06)' : 'rgba(255,107,0,0.06)',
          border: `1px solid ${vapiConfigurado ? 'rgba(34,197,94,0.25)' : 'rgba(255,107,0,0.25)'}`,
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}>🎙️</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20 }}>
                Agente de Voz IA — VAPI
              </div>
              <div style={{ color: 'var(--gray5)', fontSize: 13, marginTop: 2 }}>
                {vapiConfigurado
                  ? `✅ Conectado · Asistente: ${empresa.vapiAssistantId?.slice(0, 16)}...`
                  : '⚠️ Conecta tu cuenta de VAPI para activar las llamadas IA'}
              </div>
            </div>
          </div>
          <button onClick={() => setConfigModal(true)}
            style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ⚙️ Configurar VAPI
          </button>
        </div>

        {/* ── Panel de prueba ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

          {/* Test navegador */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              🖥️ Probar en el navegador
            </div>
            <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Inicia una llamada de prueba directamente desde aquí. Habla con tu agente IA en tiempo real.
            </p>
            {!enLlamada ? (
              <button onClick={iniciarLlamadaWeb} disabled={llamandoTest || !vapiConfigurado}
                style={{ width: '100%', background: vapiConfigurado ? NARANJA : 'var(--gray2)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: vapiConfigurado ? 'pointer' : 'not-allowed', opacity: llamandoTest ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {llamandoTest ? '⏳ Conectando...' : '📞 Iniciar llamada de prueba'}
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                  <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 14 }}>Llamada en curso...</span>
                </div>
                <button onClick={colgarLlamada}
                  style={{ width: '100%', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  📵 Colgar
                </button>
              </div>
            )}
          </div>

          {/* Test a teléfono real */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              📱 Llamar a un teléfono real
            </div>
            <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              El agente IA llamará al número que indiques. Necesitas un número VAPI configurado.
            </p>
            <input
              value={telefonoTest}
              onChange={e => setTelefonoTest(e.target.value)}
              placeholder="+34600000000"
              style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = NARANJA}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button onClick={llamarTelefono} disabled={llamandoTest || !vapiConfigurado || !telefonoTest}
              style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: (!vapiConfigurado || !telefonoTest) ? 0.5 : 1 }}>
              {llamandoTest ? '⏳ Llamando...' : '📲 Llamar ahora'}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Llamadas totales',  valor: stats.total,                     icon: '📞', color: NARANJA },
            { label: 'Tiempo en llamadas', valor: formatDuracion(stats.duracionTotal), icon: '⏱️', color: '#3B82F6' },
            { label: 'Leads capturados',  valor: stats.leadsCapturados,            icon: '🎯', color: '#22C55E' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 30, color: s.color }}>{s.valor}</div>
              <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['llamadas', 'leads'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ background: tab === t ? `${NARANJA}18` : 'var(--gray1)', border: `1px solid ${tab === t ? NARANJA : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '8px 20px', cursor: 'pointer', color: tab === t ? NARANJA : 'var(--gray5)', fontSize: 14, fontWeight: 600 }}>
              {t === 'llamadas' ? `📞 Llamadas (${llamadas.length})` : `🎯 Leads (${leads.length})`}
            </button>
          ))}
        </div>

        {/* ── Lista llamadas ── */}
        {tab === 'llamadas' && (
          llamadas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📵</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sin llamadas aún</div>
              <div style={{ color: 'var(--gray5)', fontSize: 14 }}>Configura VAPI y haz una llamada de prueba para verla aquí</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {llamadas.map(ll => (
                <div key={ll.id} onClick={() => setLlamadaSel(ll)}
                  style={{ background: 'var(--gray1)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${NARANJA}44`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${NARANJA}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📞</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ll.from || ll.telefono || 'Desconocido'}</div>
                      <div style={{ color: 'var(--gray5)', fontSize: 12 }}>{ll.agente} · {formatDuracion(ll.duracion)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{formatFecha(ll.fechaHora)}</div>
                    <div style={{ fontSize: 11, color: NARANJA, marginTop: 2 }}>Ver transcripción →</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Lista leads ── */}
        {tab === 'leads' && (
          leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray1)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sin leads aún</div>
              <div style={{ color: 'var(--gray5)', fontSize: 14 }}>Los leads capturados en llamadas aparecerán aquí</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leads.map(lead => (
                <div key={lead.id} style={{ background: 'var(--gray1)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{lead.nombre}</div>
                      <div style={{ color: 'var(--gray5)', fontSize: 12 }}>{lead.telefono} · {lead.servicio}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{formatFecha(lead.fechaHora)}</div>
                    <div style={{ fontSize: 11, background: 'rgba(0,229,160,0.1)', color: '#00E5A0', borderRadius: 100, padding: '2px 8px', marginTop: 4, display: 'inline-block' }}>{lead.estado || 'nuevo'}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── MODAL: Transcripción ── */}
        {llamadaSel && (
          <div onClick={e => e.target === e.currentTarget && setLlamadaSel(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'var(--gray1)', borderRadius: 20, padding: 28, maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'auto', position: 'relative' }}>
              <button onClick={() => setLlamadaSel(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'var(--gray2)', border: 'none', color: 'var(--white)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}>✕</button>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>📞 Transcripción</div>
              <div style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20 }}>
                {llamadaSel.from || llamadaSel.telefono} · {formatFecha(llamadaSel.fechaHora)} · {formatDuracion(llamadaSel.duracion)}
              </div>
              {(!llamadaSel.transcripcion?.length) ? (
                <div style={{ color: 'var(--gray5)', textAlign: 'center', padding: 40 }}>Sin transcripción disponible</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {llamadaSel.transcripcion.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, flexDirection: t.rol === 'agente' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: t.rol === 'agente' ? `${NARANJA}20` : 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {t.rol === 'agente' ? '🤖' : '👤'}
                      </div>
                      <div style={{ background: t.rol === 'agente' ? `${NARANJA}10` : 'var(--gray2)', borderRadius: 10, padding: '10px 14px', maxWidth: '80%', fontSize: 14, lineHeight: 1.5, border: `1px solid ${t.rol === 'agente' ? `${NARANJA}30` : 'rgba(255,255,255,0.06)'}` }}>
                        {t.texto}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: Configurar VAPI ── */}
        {configModal && (
          <div onClick={e => e.target === e.currentTarget && setConfigModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#111318', border: `1px solid ${NARANJA}33`, borderRadius: 20, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
              <button onClick={() => setConfigModal(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'var(--gray2)', border: 'none', color: 'var(--white)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}>✕</button>

              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>⚙️ Conectar VAPI</div>
              <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                Obtén tus keys en <a href="https://dashboard.vapi.ai/account" target="_blank" rel="noopener noreferrer" style={{ color: NARANJA }}>dashboard.vapi.ai → API Keys</a>
              </p>

              {/* Public Key */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Public Key (para llamadas web)</label>
                <input value={vapiKey} onChange={e => setVapiKey(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--white)', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = NARANJA}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Private Key */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Private Key (para llamadas a teléfono)</label>
                <input value={vapiPrivKey} onChange={e => setVapiPrivKey(e.target.value)}
                  type="password"
                  placeholder="••••••••••••••••••••"
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = NARANJA}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Cargar asistentes */}
              <button onClick={cargarRecursosVapi} disabled={cargandoAsistentes || !vapiPrivKey}
                style={{ width: '100%', background: 'var(--gray2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16, opacity: !vapiPrivKey ? 0.5 : 1 }}>
                {cargandoAsistentes ? '⏳ Cargando...' : '🔄 Cargar asistentes y números de VAPI'}
              </button>

              {/* Selector asistente */}
              {asistentes.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Asistente VAPI</label>
                  <select value={assistantId} onChange={e => setAssistantId(e.target.value)}
                    style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">— Selecciona un asistente —</option>
                    {asistentes.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
                  </select>
                </div>
              )}

              {/* Input manual asistente si no cargó */}
              {asistentes.length === 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>ID del Asistente (manual)</label>
                  <input value={assistantId} onChange={e => setAssistantId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--white)', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    onFocus={e => e.target.style.borderColor = NARANJA}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <p style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 4 }}>
                    Encuéntralo en <a href="https://dashboard.vapi.ai/assistants" target="_blank" rel="noopener noreferrer" style={{ color: NARANJA }}>dashboard.vapi.ai/assistants</a>
                  </p>
                </div>
              )}

              {/* Selector número VAPI */}
              {numerosVapi.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Número de teléfono VAPI (para llamadas salientes)</label>
                  <select value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)}
                    style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">— Selecciona un número (opcional) —</option>
                    {numerosVapi.map(n => <option key={n.id} value={n.id}>{n.number || n.id}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setConfigModal(false)}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gray5)', borderRadius: 12, padding: '13px', fontSize: 14, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={guardarConfig} disabled={savingConfig}
                  style={{ flex: 2, background: NARANJA, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: savingConfig ? 0.7 : 1 }}>
                  {savingConfig ? 'Guardando...' : '✅ Guardar configuración'}
                </button>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}
