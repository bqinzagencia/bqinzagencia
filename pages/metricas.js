// pages/metricas.js
// Panel de métricas privado — acceso con contraseña: 2026.2026
// URL: bqinzagencia.com/metricas

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';

const PASS       = '2026.2026';
const NARANJA    = '#FF6B00';
const VERDE      = '#22C55E';
const ROJO       = '#EF4444';
const AMARILLO   = '#F59E0B';
const DARK       = '#080B0F';
const CARD       = '#111318';
const CARD2      = '#1A1E26';

function fmt(n) { return (n || 0).toLocaleString('es-ES'); }
function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'2-digit' });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Metricas() {
  const [auth, setAuth]           = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState(false);

  const [empresas, setEmpresas]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [accionando, setAccionando]     = useState(null);
  const [tabActiva, setTabActiva]       = useState('general');

  const [stats, setStats] = useState({
    totalEmpresas: 0, activas: 0, bloqueadas: 0,
    tokensWasap: 0, tokensChatWeb: 0,
    ingresosMes: 0, ingresosTotal: 0,
  });

  const [infra, setInfra] = useState({ openai: null, railway: null, cargando: false });

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === PASS) { setAuth(true); setPassError(false); }
    else { setPassError(true); setPassInput(''); }
  };

  // ── Cargar datos de Firebase ─────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Sin orderBy: si una empresa no tiene 'creadoEn' quedaba excluida de los resultados.
      // Traemos todas y ordenamos en memoria (igual que /admin/superadmin).
      const snap = await getDocs(collection(db, 'empresas'));

      const lista = await Promise.all(snap.docs.map(async docSnap => {
        const d = { id: docSnap.id, ...docSnap.data() };

        // Tokens y conversaciones: todo vive en empresas/{id}/conversaciones
        // canal === 'whatsapp'  -> WasapBot (tokensTotal/mensajesTotal acumulados por contacto)
        // cualquier otro canal  -> ChatWeb (tokensUsados por mensaje)
        let tokensWasap = 0, tokensChatWeb = 0, mensajesWasap = 0, mensajesChat = 0;
        try {
          const convSnap = await getDocs(collection(db, 'empresas', d.id, 'conversaciones'));
          convSnap.docs.forEach(c => {
            const cd = c.data();
            if (cd.canal === 'whatsapp') {
              tokensWasap   += cd.tokensTotal   || 0;
              mensajesWasap += cd.mensajesTotal || 0;
            } else {
              tokensChatWeb += cd.tokensUsados || 0;
              mensajesChat  += 1;
            }
          });
        } catch {}

        // Contar citas
        let citas = 0;
        try {
          const citasSnap = await getDocs(collection(db, 'empresas', d.id, 'citas'));
          citas = citasSnap.size;
        } catch {}

        // El estado se ha guardado con dos esquemas distintos según la pantalla:
        // metricas usa bloqueada/planActivo, superadmin usa estado:'activo'|'bloqueado'.
        // Soportamos ambos para reflejar el estado real sin importar quién lo cambió.
        const bloqueada = d.bloqueada === true || d.estado === 'bloqueado';
        const activa    = !bloqueada && (d.planActivo === true || d.estado === 'activo');

        return {
          ...d,
          bloqueada,
          activa,
          tokensWasap,
          tokensChatWeb,
          tokensTotal: tokensWasap + tokensChatWeb,
          mensajesWasap,
          mensajesChat,
          citas,
          planLabel: { emprendedor: 'Starter', starter: 'Starter', basico: 'Básico', pro: 'Pro', clinica: 'Clínica Pro', agencia: 'Agencia' }[d.plan] || d.plan || 'Sin plan',
          planColor: { emprendedor: '#6B7280', starter: '#6B7280', basico: VERDE, pro: NARANJA, clinica: '#8B5CF6', agencia: '#3B82F6' }[d.plan] || '#6B7280',
          estadoLabel: bloqueada ? 'Bloqueada' : activa ? 'Activa' : 'Inactiva',
          estadoColor: bloqueada ? ROJO : activa ? VERDE : AMARILLO,
        };
      }));

      // Ordenar en memoria por fecha de creación (más recientes primero)
      lista.sort((a, b) => {
        const ta = a.creadoEn?.toMillis?.() || (a.creadoEn?.seconds || 0) * 1000 || 0;
        const tb = b.creadoEn?.toMillis?.() || (b.creadoEn?.seconds || 0) * 1000 || 0;
        return tb - ta;
      });

      setEmpresas(lista);

      // Calcular stats globales
      const tokensWasapTotal    = lista.reduce((a, e) => a + e.tokensWasap, 0);
      const tokensChatWebTotal  = lista.reduce((a, e) => a + e.tokensChatWeb, 0);
      const PRECIO_POR_1K = 0.00015; // gpt-4o-mini input ~$0.15/1M tokens
      setStats({
        totalEmpresas: lista.length,
        activas: lista.filter(e => e.activa).length,
        bloqueadas: lista.filter(e => e.bloqueada).length,
        inactivas: lista.filter(e => !e.activa && !e.bloqueada).length,
        tokensWasap: tokensWasapTotal,
        tokensChatWeb: tokensChatWebTotal,
        tokensTotal: tokensWasapTotal + tokensChatWebTotal,
        costeEstimado: ((tokensWasapTotal + tokensChatWebTotal) / 1000 * PRECIO_POR_1K).toFixed(4),
        citasTotal: lista.reduce((a, e) => a + e.citas, 0),
      });

    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (auth) cargarDatos(); }, [auth, cargarDatos]);

  // ── Cargar consumo de OpenAI y Railway ───────────────────────────────────────
  const cargarInfra = useCallback(async () => {
    setInfra(prev => ({ ...prev, cargando: true }));
    try {
      const [openaiRes, railwayRes] = await Promise.all([
        fetch('/api/admin/openai-usage').then(r => r.json()).catch(e => ({ configured: true, error: e.message })),
        fetch('/api/admin/railway-usage').then(r => r.json()).catch(e => ({ configured: true, error: e.message })),
      ]);
      setInfra({ openai: openaiRes, railway: railwayRes, cargando: false });
    } catch (e) {
      setInfra({ openai: { configured: true, error: e.message }, railway: { configured: true, error: e.message }, cargando: false });
    }
  }, []);

  useEffect(() => { if (auth) cargarInfra(); }, [auth, cargarInfra]);

  // ── Acciones ────────────────────────────────────────────────────────────────
  const bloquearEmpresa = async (id, bloqueada) => {
    if (!confirm(bloqueada ? '¿Desbloquear esta empresa?' : '¿Bloquear esta empresa? El bot dejará de responder.')) return;
    setAccionando(id);
    try {
      // Actualizamos ambos esquemas de estado (bloqueada/planActivo y estado) para
      // que el cambio se refleje sin importar qué pantalla lo lea despues.
      await updateDoc(doc(db, 'empresas', id), {
        bloqueada: !bloqueada,
        planActivo: bloqueada,
        estado: bloqueada ? 'activo' : 'bloqueado',
      });
      await cargarDatos();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setAccionando(null); }
  };

  const eliminarEmpresa = async (id, nombre) => {
    if (!confirm(`⚠️ ELIMINAR PERMANENTEMENTE "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
    if (!confirm(`Confirma una segunda vez: ¿Eliminar "${nombre}"?`)) return;
    setAccionando(id);
    try {
      await deleteDoc(doc(db, 'empresas', id));
      await cargarDatos();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setAccionando(null); }
  };

  const cambiarPlan = async (id, planActual) => {
    const planes = ['starter', 'basico', 'pro', 'clinica'];
    const nuevo = prompt(`Plan actual: ${planActual}\nEscribe el nuevo plan: starter, basico, pro, clinica`);
    if (!nuevo || !planes.includes(nuevo.toLowerCase())) return;
    setAccionando(id);
    try {
      await updateDoc(doc(db, 'empresas', id), { plan: nuevo.toLowerCase(), planActivo: true, estado: 'activo' });
      await cargarDatos();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setAccionando(null); }
  };

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const empresasFiltradas = empresas.filter(e => {
    const matchSearch = !search ||
      e.nombreEmpresa?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.telefono?.includes(search);
    const matchEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'activas'    && e.activa) ||
      (filtroEstado === 'bloqueadas' && e.bloqueada) ||
      (filtroEstado === 'inactivas'  && !e.activa && !e.bloqueada);
    return matchSearch && matchEstado;
  });

  const maxTokens = Math.max(...empresas.map(e => e.tokensTotal), 1);

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  if (!auth) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <Head><title>Panel de Métricas — BQinzagencIA</title></Head>
      <div style={{ background: CARD, border: `1px solid ${NARANJA}44`, borderRadius: 20, padding: 40, width: '100%', maxWidth: 380, boxShadow: `0 0 60px ${NARANJA}15` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: '#FAFAF8', marginBottom: 6 }}>
            <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: NARANJA }}>agenc</span><span style={{ color: '#fff' }}>IA</span>
          </div>
          <div style={{ color: '#6B7280', fontSize: 14 }}>Panel de Métricas — Acceso Restringido</div>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            placeholder="Contraseña de acceso"
            autoFocus
            style={{ width: '100%', background: CARD2, border: `1px solid ${passError ? ROJO : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '13px 16px', fontSize: 15, color: '#FAFAF8', outline: 'none', marginBottom: 8, boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 2 }}
          />
          {passError && <p style={{ color: ROJO, fontSize: 12, marginBottom: 12 }}>❌ Contraseña incorrecta</p>}
          <button type="submit" style={{ width: '100%', background: NARANJA, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4 }}>
            Acceder al panel →
          </button>
        </form>
      </div>
    </div>
  );

  // ── PANEL PRINCIPAL ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: DARK, color: '#FAFAF8', fontFamily: 'system-ui, sans-serif' }}>
      <Head><title>Métricas — BQinzagencIA</title></Head>

      {/* Header */}
      <div style={{ background: CARD, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 22, fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800 }}>
            <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: NARANJA }}>agenc</span><span style={{ color: '#fff' }}>IA</span>
          </span>
          <span style={{ background: NARANJA + '22', color: NARANJA, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: `1px solid ${NARANJA}44` }}>MÉTRICAS</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { cargarDatos(); cargarInfra(); }} disabled={loading}
            style={{ background: CARD2, color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
          </button>
          <button onClick={() => setAuth(false)}
            style={{ background: 'rgba(239,68,68,0.1)', color: ROJO, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[
            { key: 'general', label: '📊 General' },
            { key: 'tokens', label: '🔥 Consumo Tokens' },
            { key: 'empresas', label: '🏢 Empresas' },
            { key: 'infra', label: '⚙️ Infraestructura' },
          ].map(t => (
            <button key={t.key} onClick={() => setTabActiva(t.key)}
              style={{ background: tabActiva === t.key ? NARANJA + '18' : CARD, border: `1px solid ${tabActiva === t.key ? NARANJA : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '9px 22px', cursor: 'pointer', color: tabActiva === t.key ? NARANJA : '#9CA3AF', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB GENERAL ── */}
        {tabActiva === 'general' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Empresas total',   valor: fmt(stats.totalEmpresas), icon: '🏢', color: NARANJA },
                { label: 'Activas',          valor: fmt(stats.activas),       icon: '✅', color: VERDE },
                { label: 'Inactivas',        valor: fmt(stats.inactivas || 0),icon: '⏸️', color: AMARILLO },
                { label: 'Bloqueadas',       valor: fmt(stats.bloqueadas),    icon: '🚫', color: ROJO },
                { label: 'Citas agendadas',  valor: fmt(stats.citasTotal),    icon: '📅', color: '#3B82F6' },
                { label: 'Tokens WasapBot',  valor: fmt(stats.tokensWasap),   icon: '💬', color: '#25D366' },
                { label: 'Tokens ChatWeb',   valor: fmt(stats.tokensChatWeb), icon: '🌐', color: '#8B5CF6' },
                { label: 'Coste IA (est.)',  valor: `$${stats.costeEstimado}`,icon: '💰', color: AMARILLO },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD, borderRadius: 14, padding: '20px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.valor}</div>
                  <div style={{ color: '#6B7280', fontSize: 12, marginTop: 5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Distribución por plan */}
            <div style={{ background: CARD, borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
              <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Distribución por plan</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {['starter', 'basico', 'pro', 'clinica'].map(plan => {
                  const count = empresas.filter(e => e.plan === plan).length;
                  const pct = stats.totalEmpresas ? Math.round(count / stats.totalEmpresas * 100) : 0;
                  const colors = { starter: '#6B7280', basico: VERDE, pro: NARANJA, clinica: '#8B5CF6' };
                  const labels = { starter: 'Starter', basico: 'Básico', pro: 'Pro', clinica: 'Clínica Pro' };
                  return (
                    <div key={plan} style={{ background: CARD2, borderRadius: 12, padding: 16, border: `1px solid ${colors[plan]}33` }}>
                      <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 24, fontWeight: 800, color: colors[plan] }}>{count}</div>
                      <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{labels[plan]}</div>
                      <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: colors[plan], borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 empresas por tokens */}
            <div style={{ background: CARD, borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🔥 Top 5 consumidoras de tokens</div>
              {[...empresas].sort((a, b) => b.tokensTotal - a.tokensTotal).slice(0, 5).map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: NARANJA + '20', color: NARANJA, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nombreEmpresa || e.email}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#25D366' }}>💬 {fmt(e.tokensWasap)}</span>
                      <span style={{ fontSize: 11, color: '#8B5CF6' }}>🌐 {fmt(e.tokensChatWeb)}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, fontSize: 15, color: NARANJA }}>{fmt(e.tokensTotal)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TAB TOKENS ── */}
        {tabActiva === 'tokens' && (
          <div style={{ background: CARD, borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 700, fontSize: 18 }}>Consumo de tokens por empresa</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: '#25D366' }}>● WasapBot</span>
                <span style={{ color: '#8B5CF6' }}>● ChatWeb</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...empresas].sort((a, b) => b.tokensTotal - a.tokensTotal).map(e => (
                <div key={e.id} style={{ background: CARD2, borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{e.nombreEmpresa || e.email || e.id}</span>
                      <span style={{ marginLeft: 10, background: e.planColor + '22', color: e.planColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{e.planLabel}</span>
                    </div>
                    <span style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, fontSize: 14, color: NARANJA }}>{fmt(e.tokensTotal)} tokens</span>
                  </div>
                  {/* Barra WasapBot */}
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>
                      <span>💬 WasapBot ({e.mensajesWasap} conv.)</span>
                      <span style={{ color: '#25D366' }}>{fmt(e.tokensWasap)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${(e.tokensWasap / maxTokens * 100).toFixed(1)}%`, height: '100%', background: '#25D366', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  {/* Barra ChatWeb */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>
                      <span>🌐 ChatWeb ({e.mensajesChat} conv.)</span>
                      <span style={{ color: '#8B5CF6' }}>{fmt(e.tokensChatWeb)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${(e.tokensChatWeb / maxTokens * 100).toFixed(1)}%`, height: '100%', background: '#8B5CF6', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB EMPRESAS ── */}
        {tabActiva === 'empresas' && (
          <>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="🔍 Buscar por nombre, email o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 240, background: CARD, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', fontSize: 14, color: '#FAFAF8', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = NARANJA}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              {[
                { key: 'todos', label: `Todas (${empresas.length})` },
                { key: 'activas', label: `Activas (${stats.activas})` },
                { key: 'inactivas', label: `Inactivas (${stats.inactivas || 0})` },
                { key: 'bloqueadas', label: `Bloqueadas (${stats.bloqueadas})` },
              ].map(f => (
                <button key={f.key} onClick={() => setFiltroEstado(f.key)}
                  style={{ background: filtroEstado === f.key ? NARANJA + '18' : CARD, border: `1px solid ${filtroEstado === f.key ? NARANJA : 'rgba(255,255,255,0.06)'}`, borderRadius: 100, padding: '8px 16px', cursor: 'pointer', color: filtroEstado === f.key ? NARANJA : '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div style={{ background: CARD, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: CARD2 }}>
                      {['Empresa', 'Email', 'Plan', 'Estado', 'Tokens WA', 'Tokens Chat', 'Citas', 'Registro', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#6B7280', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empresasFiltradas.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Sin resultados</td></tr>
                    ) : empresasFiltradas.map((e, i) => (
                      <tr key={e.id}
                        style={{ borderBottom: i < empresasFiltradas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: accionando === e.id ? 0.5 : 1, background: e.bloqueada ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{e.nombreEmpresa || '—'}</div>
                          <div style={{ color: '#4B5563', fontSize: 11, marginTop: 2 }}>{e.ciudad || ''} {e.industria ? `· ${e.industria}` : ''}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#9CA3AF', maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.email || '—'}</div>
                          <div style={{ color: '#4B5563', fontSize: 11 }}>{e.telefono || ''}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: e.planColor + '22', color: e.planColor, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: `1px solid ${e.planColor}44`, whiteSpace: 'nowrap' }}>{e.planLabel}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: e.estadoColor, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: e.estadoColor, display: 'inline-block' }} />
                            {e.estadoLabel}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#25D366', fontWeight: 600 }}>{fmt(e.tokensWasap)}</td>
                        <td style={{ padding: '14px 16px', color: '#8B5CF6', fontWeight: 600 }}>{fmt(e.tokensChatWeb)}</td>
                        <td style={{ padding: '14px 16px', color: '#3B82F6', fontWeight: 600 }}>{fmt(e.citas)}</td>
                        <td style={{ padding: '14px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtDate(e.creadoEn)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                            <button onClick={() => cambiarPlan(e.id, e.plan)} disabled={!!accionando}
                              style={{ background: NARANJA + '15', color: NARANJA, border: `1px solid ${NARANJA}33`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Plan
                            </button>
                            <button onClick={() => bloquearEmpresa(e.id, e.bloqueada)} disabled={!!accionando}
                              style={{ background: e.bloqueada ? VERDE + '15' : AMARILLO + '15', color: e.bloqueada ? VERDE : AMARILLO, border: `1px solid ${e.bloqueada ? VERDE : AMARILLO}33`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              {e.bloqueada ? 'Activar' : 'Bloquear'}
                            </button>
                            <button onClick={() => eliminarEmpresa(e.id, e.nombreEmpresa)} disabled={!!accionando}
                              style={{ background: ROJO + '15', color: ROJO, border: `1px solid ${ROJO}33`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {empresasFiltradas.length > 0 && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', color: '#6B7280', fontSize: 12 }}>
                  Mostrando {empresasFiltradas.length} de {empresas.length} empresas
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB INFRAESTRUCTURA ── */}
        {tabActiva === 'infra' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

            {/* OpenAI */}
            <div style={{ background: CARD, borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 700, fontSize: 16 }}>OpenAI — últimos 30 días</div>
              </div>
              {infra.cargando && !infra.openai ? (
                <p style={{ color: '#6B7280', fontSize: 13 }}>Cargando…</p>
              ) : !infra.openai?.configured ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.6 }}>
                  <p style={{ color: AMARILLO, fontWeight: 700, marginBottom: 8 }}>⚠️ No configurado</p>
                  <p>{infra.openai?.mensaje}</p>
                  <p style={{ marginTop: 10, color: '#4B5563' }}>Añade <code>OPENAI_ADMIN_KEY</code> en .env.local y en Vercel.</p>
                </div>
              ) : infra.openai.error ? (
                <div style={{ color: ROJO, fontSize: 13, lineHeight: 1.6 }}>
                  Error: {infra.openai.error}
                  {infra.openai.detalle && <div style={{ color: '#6B7280', marginTop: 6, wordBreak: 'break-all' }}>{infra.openai.detalle}</div>}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 28, fontWeight: 800, color: AMARILLO }}>
                      ${infra.openai.costeTotal30d?.toFixed(2) ?? '0.00'}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>Coste estimado ({(infra.openai.moneda || 'usd').toUpperCase()})</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: 28, fontWeight: 800, color: NARANJA }}>
                      {fmt(infra.openai.tokensTotal30d)}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>Tokens consumidos</div>
                  </div>
                </div>
              )}
            </div>

            {/* Railway */}
            <div style={{ background: CARD, borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 22 }}>🚂</span>
                <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 700, fontSize: 16 }}>Railway — mes en curso</div>
              </div>
              {infra.cargando && !infra.railway ? (
                <p style={{ color: '#6B7280', fontSize: 13 }}>Cargando…</p>
              ) : !infra.railway?.configured ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.6 }}>
                  <p style={{ color: AMARILLO, fontWeight: 700, marginBottom: 8 }}>⚠️ No configurado</p>
                  <p>{infra.railway?.mensaje}</p>
                  <p style={{ marginTop: 10, color: '#4B5563' }}>Añade <code>RAILWAY_API_TOKEN</code> y <code>RAILWAY_PROJECT_ID</code> en .env.local y en Vercel.</p>
                </div>
              ) : infra.railway.error ? (
                <div style={{ color: ROJO, fontSize: 13, lineHeight: 1.6 }}>
                  Error: {infra.railway.error}
                  <div style={{ color: '#4B5563', marginTop: 6 }}>El esquema de la API de Railway puede haber cambiado; revisa este endpoint si persiste.</div>
                </div>
              ) : (infra.railway.usage || []).length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: 13 }}>Sin datos de uso disponibles este mes todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {infra.railway.usage.map((u, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i < infra.railway.usage.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', padding: '8px 0' }}>
                      <span style={{ color: '#9CA3AF', fontSize: 13 }}>{u.measurement}</span>
                      <span style={{ fontWeight: 700, color: NARANJA }}>{fmt(Math.round((u.value || 0) * 100) / 100)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
