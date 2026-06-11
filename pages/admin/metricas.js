// pages/admin/metricas.js
// Panel privado de métricas — solo Alexander
// Protegido por contraseña local (sessionStorage)

import { useState, useEffect, useRef } from 'react';

const PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'nexoia2026admin';
const F = "'Inter', system-ui, sans-serif";
const BG = '#0A0F1E';
const CARD = '#111827';
const BORDER = 'rgba(255,255,255,0.07)';
const COLORS = ['#e06c00','#10a37f','#3266ad','#d85a30','#7f77dd','#1d9e75','#ba7517','#a32d2d'];

export default function MetricasAdmin() {
  const [auth, setAuth]       = useState(false);
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');
  const [data, setData]       = useState(null);
  const [railway, setRailway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('resumen');
  const [empSlider, setEmpSlider] = useState(5);
  const [convSlider, setConvSlider] = useState(10);
  const intervalRef = useRef(null);

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_auth') === '1';
    if (ok) { setAuth(true); fetchAll(); }
    return () => clearInterval(intervalRef.current);
  }, []);

  const login = () => {
    if (pass === PASS) {
      sessionStorage.setItem('admin_auth', '1');
      setAuth(true);
      fetchAll();
    } else {
      setError('Contraseña incorrecta');
      setTimeout(() => setError(''), 2000);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.allSettled([
        fetch('https://agenciame-whatsapp-server-production.up.railway.app/health').then(r => r.json()),
        fetch('/api/metrics-admin', { headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026' } }).then(r => r.json()),
      ]);
      if (r1.status === 'fulfilled') setRailway(r1.value);
      if (r2.status === 'fulfilled') setData(r2.value);
    } catch {}
    setLoading(false);
  };

  // Calcular métricas Railway
  const railwayUptime   = railway ? railway.uptime / 3600 : 0;
  const railwayCostado  = Math.min(railwayUptime * 0.01, 5);
  const railwayRestante = Math.max(5 - railwayCostado, 0).toFixed(2);
  const railwayPct      = Math.round(railwayCostado / 5 * 100);
  const railwayDias     = Math.round(parseFloat(railwayRestante) / 0.01 / 24);

  // Calcular métricas OpenAI
  const totalConvs    = data?.conversacionesTotal || 0;
  const openaiGastado = totalConvs * 0.002;
  const openaiRest    = Math.max(5 - openaiGastado, 0).toFixed(3);
  const openaiPct     = Math.round(openaiGastado / 5 * 100);
  const openaiLeft    = Math.round(parseFloat(openaiRest) / 0.002);

  // Firebase
  const firebasePct = Math.round((data?.lecturasHoy || 0) / 50000 * 100);

  // Proyección
  const convsTotal30  = empSlider * convSlider * 30;
  const openaiCost30  = convsTotal30 * 0.002;
  const railwayCost30 = 7.20;
  const total30       = openaiCost30 + railwayCost30;
  const totalCOP      = Math.round(total30 * 4100);
  const breakeven     = empSlider > 0 ? Math.ceil(totalCOP / empSlider / 1000) * 1000 : 0;

  const Bar = ({ pct, color }) => (
    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
      <div style={{ width: Math.min(pct, 100) + '%', height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s' }} />
    </div>
  );

  const Card = ({ label, value, sub, color = '#EFF4FF' }) => (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.03em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#4B6080', marginTop: 2 }}>{sub}</div>}
    </div>
  );

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '40px 36px', width: 320 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#EFF4FF', marginBottom: 4, letterSpacing: '-0.03em' }}>
          agenc<span style={{ color: '#FF6B00' }}>IA</span>me
        </div>
        <div style={{ fontSize: 13, color: '#6B7A99', marginBottom: 28 }}>Panel de métricas — acceso privado</div>
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', background: '#0A0F1E', border: `1px solid ${error ? '#EF4444' : BORDER}`, borderRadius: 10, padding: '10px 14px', color: '#EFF4FF', fontFamily: F, fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
          autoFocus
        />
        {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 10 }}>{error}</div>}
        <button onClick={login} style={{ width: '100%', background: '#2B6AFF', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Ingresar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, color: '#EFF4FF', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>
            agenc<span style={{ color: '#FF6B00' }}>IA</span>me — Métricas
          </div>
          <div style={{ fontSize: 12, color: '#4B6080', marginTop: 2 }}>
            {loading ? 'Actualizando...' : `Actualizado: ${new Date().toLocaleTimeString('es-CO')}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} style={{ background: 'rgba(43,106,255,0.12)', border: '1px solid rgba(43,106,255,0.3)', borderRadius: 100, padding: '8px 18px', color: '#6DA4FF', fontFamily: F, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ↻ Actualizar
          </button>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuth(false); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 100, padding: '8px 18px', color: '#EF4444', fontFamily: F, fontSize: 13, cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0D1420', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {['resumen','servicios','empresas','proyección'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: tab === t ? '#1E293B' : 'transparent', border: `1px solid ${tab === t ? BORDER : 'transparent'}`, borderRadius: 8, padding: '7px 18px', color: tab === t ? '#EFF4FF' : '#6B7A99', fontFamily: F, fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            <Card label="Railway restante" value={`$${railwayRestante}`} sub={`~${railwayDias} días`} color={railwayDias < 5 ? '#EF4444' : '#EFF4FF'} />
            <Card label="OpenAI restante" value={`$${openaiRest}`} sub={`~${openaiLeft.toLocaleString()} convs`} color={openaiPct > 80 ? '#F59E0B' : '#EFF4FF'} />
            <Card label="Conversaciones hoy" value={data?.conversacionesHoy || 0} sub="web + WhatsApp" />
            <Card label="Empresas registradas" value={data?.totalEmpresas || 0} sub={`${railway?.sesionesActivas || 0} con WhatsApp`} />
          </div>

          {/* Alertas */}
          {railwayDias <= 5 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#FCA5A5' }}>
              ⚠️ Railway vence en {railwayDias} días — recarga crédito en railway.app o el servidor WhatsApp se apaga.
            </div>
          )}
          {railwayDias > 5 && railwayDias <= 10 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#FCD34D' }}>
              ⏰ Railway: quedan ~{railwayDias} días. Planifica recarga.
            </div>
          )}
          {openaiPct > 80 && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#FCD34D' }}>
              ⚠️ OpenAI: crédito al {openaiPct}% — recarga en platform.openai.com
            </div>
          )}
          {railwayDias > 10 && openaiPct <= 80 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#6EE7B7' }}>
              ✅ Todos los servicios operando normalmente
            </div>
          )}
        </div>
      )}

      {/* SERVICIOS */}
      {tab === 'servicios' && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px' }}>
          {[
            { name: 'Railway', pct: railwayPct, color: '#e06c00', detail: `$${railwayCostado.toFixed(2)} gastado de $5.00`, sub: `~${railwayDias} días restantes` },
            { name: 'OpenAI', pct: openaiPct, color: '#10a37f', detail: `$${openaiGastado.toFixed(3)} gastado de $5.00`, sub: `${openaiLeft.toLocaleString()} conversaciones restantes` },
            { name: 'Firebase', pct: firebasePct, color: '#FFCA28', detail: `${(data?.lecturasHoy || 0).toLocaleString()} lecturas hoy`, sub: 'límite: 50,000/día — GRATIS' },
            { name: 'Vercel', pct: 2, color: '#EFF4FF', detail: 'Hobby plan', sub: 'GRATIS — ilimitado en este volumen' },
            { name: 'WhatsApp', pct: Math.min((railway?.sesionesActivas || 0) * 20, 100), color: '#25D366', detail: `${railway?.sesionesActivas || 0} sesión(es) activa(s)`, sub: 'via Baileys — sin costo por mensaje' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ width: 100, fontSize: 14, fontWeight: 600 }}>{s.name}</div>
              <Bar pct={s.pct} color={s.color} />
              <div style={{ width: 40, fontSize: 13, color: '#8A9BB5', textAlign: 'right' }}>{s.pct}%</div>
              <div style={{ width: 200, fontSize: 12, color: '#6B7A99' }}>
                <div>{s.detail}</div>
                <div style={{ color: '#4B6080', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPRESAS */}
      {tab === 'empresas' && (
        <div>
          {/* Contador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 20px', display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#EFF4FF', letterSpacing: '-0.03em' }}>{data?.totalEmpresas || 0}</div>
                <div style={{ fontSize: 11, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total empresas</div>
              </div>
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#A78BFA', letterSpacing: '-0.03em' }}>
                  {(data?.empresas || []).filter(e => e.plan === 'profesional' || e.plan === 'agencia').length}
                </div>
                <div style={{ fontSize: 11, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Con plan pago</div>
              </div>
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', letterSpacing: '-0.03em' }}>
                  {(data?.empresas || []).filter(e => {
                    if (!e.trialHasta) return false;
                    return new Date(e.trialHasta) > new Date();
                  }).length}
                </div>
                <div style={{ fontSize: 11, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>En trial activo</div>
              </div>
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#25D366', letterSpacing: '-0.03em' }}>
                  {railway?.sesionesActivas || 0}
                </div>
                <div style={{ fontSize: 11, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.08em' }}>WA activos</div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: '#0D1420', fontSize: 11, color: '#4B6080', textTransform: 'uppercase', letterSpacing: '0.08em', gap: 8 }}>
              <div>Empresa</div><div>Industria</div><div>Plan</div><div>Estado</div><div style={{ textAlign: 'right' }}>Convs</div><div style={{ textAlign: 'center' }}>WA</div>
            </div>
            {(data?.empresas || []).map((e, i) => {
              const trialActivo  = e.trialHasta && new Date(e.trialHasta) > new Date();
              const trialVencido = e.trialHasta && new Date(e.trialHasta) <= new Date();
              const diasTrial    = e.trialHasta ? Math.ceil((new Date(e.trialHasta) - new Date()) / 86400000) : 0;
              const planColor    = { emprendedor: '#8A9BB5', profesional: '#2B6AFF', agencia: '#A78BFA' }[e.plan] || '#8A9BB5';
              const planLabel    = { emprendedor: 'Emprendedor', profesional: 'Pro', agencia: 'Agencia' }[e.plan] || e.plan;
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nombre}</div>
                      <div style={{ fontSize: 10, color: '#4B6080' }}>{e.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8A9BB5' }}>{e.industria}</div>
                  <div>
                    <span style={{ background: planColor + '18', color: planColor, border: `1px solid ${planColor}30`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                      {planLabel}
                    </span>
                  </div>
                  <div>
                    {trialActivo && (
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Trial {diasTrial}d
                      </span>
                    )}
                    {trialVencido && (
                      <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                        Vencido
                      </span>
                    )}
                    {!e.trialHasta && (
                      <span style={{ background: 'rgba(43,106,255,0.1)', color: '#6DA4FF', border: '1px solid rgba(43,106,255,0.2)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                        Activo
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{e.conversaciones}</div>
                  <div style={{ textAlign: 'center', fontSize: 16 }}>{e.whatsappActivo ? '🟢' : '⚫'}</div>
                </div>
              );
            })}
            {!data?.empresas?.length && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#4B6080', fontSize: 13 }}>Sin datos</div>
            )}
          </div>
        </div>
      )}

      {/* PROYECCIÓN */}
      {tab === 'proyección' && (
        <div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '24px', marginBottom: 16 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#8A9BB5', marginBottom: 8 }}>
                Empresas registradas: <span style={{ color: '#EFF4FF', fontWeight: 700 }}>{empSlider}</span>
              </div>
              <input type="range" min="1" max="100" value={empSlider} step="1"
                onChange={e => setEmpSlider(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2B6AFF' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#8A9BB5', marginBottom: 8 }}>
                Conversaciones por empresa/día: <span style={{ color: '#EFF4FF', fontWeight: 700 }}>{convSlider}</span>
              </div>
              <input type="range" min="1" max="200" value={convSlider} step="1"
                onChange={e => setConvSlider(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2B6AFF' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <Card label="OpenAI/mes" value={`$${openaiCost30.toFixed(2)}`} sub={`${convsTotal30.toLocaleString()} convs`} />
              <Card label="Railway/mes" value="$7.20" sub="fijo 24/7" />
              <Card label="Total/mes USD" value={`$${total30.toFixed(2)}`} sub={`~$${totalCOP.toLocaleString()} COP`} />
            </div>
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(43,106,255,0.08)', border: '1px solid rgba(43,106,255,0.2)', borderRadius: 12, fontSize: 13, color: '#6DA4FF' }}>
              Para cubrir costos debes cobrar mínimo <strong style={{ color: '#EFF4FF' }}>${breakeven.toLocaleString()} COP/empresa/mes</strong>.
              Con {empSlider} empresas a $30.000 COP = ${(empSlider * 30000).toLocaleString()} COP ingreso vs ${totalCOP.toLocaleString()} COP costo → margen del {Math.round((1 - totalCOP / (empSlider * 30000)) * 100)}%.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
