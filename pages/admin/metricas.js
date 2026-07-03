// pages/admin/metricas.js — BQinzagencIA Panel de Métricas v2
import { useState, useEffect, useRef, useCallback } from 'react';

const PASS   = process.env.NEXT_PUBLIC_ADMIN_PASS || 'nexoia2026admin';
const SECRET = 'nexoia_admin_metrics_2026';
const F      = "'Inter', system-ui, sans-serif";
const BG     = '#060B18';
const CARD   = '#0E1525';
const CARD2  = '#111D30';
const BORDER = 'rgba(255,255,255,0.07)';

// ── Componentes base ──────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, color='#EFF4FF', icon, delta }) => (
  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:14, right:16, fontSize:22, opacity:.15 }}>{icon}</div>
    <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, color, letterSpacing:'-.03em', lineHeight:1 }}>{value}</div>
    {sub   && <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:5 }}>{sub}</div>}
    {delta != null && <div style={{ fontSize:11, color: delta>=0?'#25D366':'#EF4444', marginTop:4, fontWeight:600 }}>{delta>=0?'▲':'▼'} {Math.abs(delta)}% vs ayer</div>}
  </div>
);

const BarChart = ({ data=[], color='#2B6AFF', label='sesiones' }) => {
  const max = Math.max(...data.map(d=>d.v), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:64 }}>
      {data.map((d,i) => (
        <div key={i} title={`${d.k}: ${d.v} ${label}`} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <div style={{ width:'100%', background:color, borderRadius:'3px 3px 0 0', height:`${Math.max(d.v/max*56,d.v>0?4:0)}px`, transition:'height .3s', opacity: i===data.length-1?1:.6 }} />
        </div>
      ))}
    </div>
  );
};

const MiniBar = ({ pct, color }) => (
  <div style={{ flex:1, background:'rgba(255,255,255,.06)', borderRadius:4, height:6, overflow:'hidden' }}>
    <div style={{ width:Math.min(pct,100)+'%', height:'100%', background:color, borderRadius:4, transition:'width .5s' }}/>
  </div>
);

const Badge = ({ text, color='#6B7A99', bg='rgba(255,255,255,.05)' }) => (
  <span style={{ background:bg, color, border:`1px solid ${color}30`, borderRadius:100, padding:'2px 9px', fontSize:10, fontWeight:700 }}>{text}</span>
);

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const submit = () => {
    if (pass === PASS) { sessionStorage.setItem('bq_admin_auth','1'); onLogin(); }
    else { setErr('Contraseña incorrecta'); setTimeout(()=>setErr(''),2000); }
  };
  return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F }}>
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:'40px 36px', width:320 }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#EFF4FF', marginBottom:4 }}>
          BQinzagenc<span style={{ color:'#FF6B00' }}>IA</span>
        </div>
        <div style={{ fontSize:13, color:'#4B6080', marginBottom:28 }}>Panel de métricas — acceso privado</div>
        <input type="password" placeholder="Contraseña" value={pass}
          onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{ width:'100%', background:'#060B18', border:`1px solid ${err?'#EF4444':BORDER}`, borderRadius:10, padding:'10px 14px', color:'#EFF4FF', fontFamily:F, fontSize:14, marginBottom:12, outline:'none', boxSizing:'border-box' }}
          autoFocus />
        {err && <div style={{ fontSize:12, color:'#EF4444', marginBottom:10 }}>{err}</div>}
        <button onClick={submit} style={{ width:'100%', background:'linear-gradient(135deg,#2B6AFF,#1D4ECC)', border:'none', borderRadius:10, padding:11, color:'#fff', fontFamily:F, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────
export default function MetricasAdmin() {
  const [auth,    setAuth]    = useState(false);
  const [data,    setData]    = useState(null);
  const [railway, setRailway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('web');
  const [accionando, setAccionando] = useState(null); // empresaId en curso
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [agenciaConfig, setAgenciaConfig] = useState(null); // config de la agencia propia
  const [agenciaEdit, setAgenciaEdit] = useState({ telefonoDueno:'', tokensLimite:'' });
  const [agenciaSaving, setAgenciaSaving] = useState(false);
  const [agenciaMsg, setAgenciaMsg] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('bq_admin_auth')==='1') { setAuth(true); }
  }, []);

  useEffect(() => {
    if (!auth) return;
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30000); // auto-refresh 30s para tiempo real
    return () => clearInterval(intervalRef.current);
  }, [auth]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.allSettled([
        fetch((process.env.NEXT_PUBLIC_WA_SERVER||'') + '/health').then(r=>r.json()).catch(()=>null),
        fetch('/api/metrics-admin', { headers:{'x-admin-secret':SECRET} }).then(r=>r.json()),
        fetch('/api/metrics-admin', { headers:{'x-admin-secret':SECRET}, method:'POST', body:JSON.stringify({accion:'getAgenciaConfig'}), headers:{'Content-Type':'application/json','x-admin-secret':SECRET} }).then(r=>r.json()).catch(()=>null),
      ]);
      if (r1.status==='fulfilled' && r1.value) setRailway(r1.value);
      if (r2.status==='fulfilled' && r2.value?.ok) {
        setData(r2.value);
        // Eliminar automáticamente registros sin nombre Y sin plan Y sin conversaciones
        const sinNombre = (r2.value?.empresas || []).filter(e =>
          (!e.nombre || e.nombre.trim() === '' || e.nombre === 'Sin nombre') &&
          (!e.planActivo || e.plan === 'sin_plan') &&
          e.conversaciones === 0
        );
        if (sinNombre.length > 0) {
          fetch('/api/metrics-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': SECRET },
            body: JSON.stringify({ accion: 'eliminarEmpresas', empresaIds: sinNombre.map(e => e.id) }),
          }).catch(() => {});
        }
      }
      if (r3.status==='fulfilled' && r3.value?.ok) {
        setAgenciaConfig(r3.value);
        setAgenciaEdit({ telefonoDueno: r3.value.telefonoDueno||'', tokensLimite: String(r3.value.tokensLimite||400000) });
      }
    } catch {}
    setLoading(false);
  }, []);

  const activarPlan = async (empresaId, planId) => {
    if (!confirm(`¿Activar el plan ${planId} para esta empresa? Se marcará como pagado por 30 días.`)) return;
    setAccionando(empresaId);
    try {
      const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'activarPlan', empresaId, planId }) });
      const d = await r.json();
      if (d.ok) await fetchAll();
      else alert('Error: '+(d.error||'desconocido'));
    } catch (e) { alert('Error: '+e.message); }
    setAccionando(null);
  };

  const toggleBloqueo = async (empresaId, bloquearAhora) => {
    if (bloquearAhora) {
      const motivo = prompt('Motivo del bloqueo (opcional):') || '';
      if (!confirm('¿Bloquear esta empresa? El bot dejará de responder.')) return;
      setAccionando(empresaId);
      try {
        const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'setBloqueo', empresaId, bloqueada:true, motivo }) });
        const d = await r.json();
        if (d.ok) await fetchAll();
      } catch {}
      setAccionando(null);
    } else {
      if (!confirm('¿Desbloquear esta empresa?')) return;
      setAccionando(empresaId);
      try {
        const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'setBloqueo', empresaId, bloqueada:false }) });
        const d = await r.json();
        if (d.ok) await fetchAll();
      } catch {}
      setAccionando(null);
    }
  };

  const eliminarEmpresa = async (empresaId, nombre) => {
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE "${nombre}"?\n\nSe borrarán todas sus conversaciones, citas, contactos y configuración. Esta acción NO se puede deshacer.`)) return;
    setAccionando(empresaId);
    try {
      const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'eliminarEmpresa', empresaId }) });
      const d = await r.json();
      if (d.ok) { setSeleccionadas(prev=>{const n=new Set(prev);n.delete(empresaId);return n;}); await fetchAll(); }
      else alert('Error: '+(d.error||'desconocido'));
    } catch (e) { alert('Error: '+e.message); }
    setAccionando(null);
  };

  const eliminarSeleccionadas = async () => {
    const ids = Array.from(seleccionadas);
    if (ids.length===0) return;
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE ${ids.length} empresa(s) seleccionada(s)?\n\nEsta acción NO se puede deshacer.`)) return;
    setAccionando('__bulk__');
    try {
      const r = await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'eliminarEmpresas', empresaIds: ids }) });
      const d = await r.json();
      if (d.ok) { setSeleccionadas(new Set()); await fetchAll(); }
      else alert('Error: '+(d.error||'desconocido'));
    } catch (e) { alert('Error: '+e.message); }
    setAccionando(null);
  };

  const toggleSeleccion = (empresaId) => {
    setSeleccionadas(prev => {
      const n = new Set(prev);
      if (n.has(empresaId)) n.delete(empresaId); else n.add(empresaId);
      return n;
    });
  };

  if (!auth) return <Login onLogin={()=>{ setAuth(true); }} />;

  // ── Datos calculados ──────────────────────────────────────────────────────
  const web       = data?.web?.hoy        || {};
  const semana    = data?.web?.semana     || {};
  const ultimos14 = data?.web?.ultimos14  || [];
  const topPages  = data?.web?.paginasTop || [];
  const usuariosRT = data?.web?.usuariosRT || [];
  const empresas  = data?.empresas        || [];

  const PLAN_EUR  = { basico:79, estandar:149, pro:249, prueba_5k:0, wasapbot:0 };
  const PLAN_TOK  = { basico:50000, estandar:150000, pro:400000, prueba_5k:45000 };
  const mrr       = empresas.filter(e=>e.planActivo&&!e.esPruebaGratis).reduce((s,e)=>s+(PLAN_EUR[e.plan]||0),0);
  const convsTot  = data?.conversacionesTotal || 0;
  // Coste real de OpenAI estimado a partir de los tokens efectivamente
  // consumidos por todas las empresas (ya registrados por el bot en
  // wasapbot_tokens), en vez de una estimación genérica por conversación.
  // gpt-4o-mini: ~0.15$ / 1M tokens entrada + 0.60$ / 1M salida → usamos
  // una media ponderada de 0.30$ por cada 1M tokens como aproximación única.
  const tokensTotales = empresas.reduce((s,e)=>s+(e.tokensUsados||0),0);
  const openaiGasto   = (tokensTotales / 1000000 * 0.30).toFixed(2);

  const fmtTiempo = s => s>=60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;
  const planColor = { basico:'#25D366', estandar:'#2B6AFF', pro:'#A78BFA', prueba_5k:'#F59E0B', wasapbot:'#6B7A99' };
  const planLabel = { basico:'Básico', estandar:'Estándar', pro:'Pro', prueba_5k:'Prueba 24h', wasapbot:'WasapBot' };

  const TABS = ['web','empresas','wasapbot','costes'];

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:F, color:'#EFF4FF', padding:'24px 28px' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-.03em' }}>
            BQinzagenc<span style={{ color:'#FF6B00' }}>IA</span>
            <span style={{ fontSize:13, fontWeight:400, color:'#4B6080', marginLeft:10 }}>Métricas</span>
          </div>
          <div style={{ fontSize:11, color:'#4B6080', marginTop:2 }}>
            {loading ? '⏳ Actualizando...' : <span style={{color:'rgba(255,255,255,0.7)'}}>Actualizado: {new Date().toLocaleTimeString('es-ES')}</span>}
            {railway?.uptime && <span style={{ marginLeft:12, color:'#25D366' }}>● Railway activo</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* MRR destacado */}
          <div style={{ background:'rgba(43,106,255,.1)', border:'1px solid rgba(43,106,255,.3)', borderRadius:10, padding:'8px 16px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#6DA4FF', textTransform:'uppercase', letterSpacing:'.06em' }}>MRR</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#EFF4FF' }}>{mrr}€</div>
          </div>
          <button onClick={fetchAll} style={{ background:'rgba(43,106,255,.1)', border:'1px solid rgba(43,106,255,.3)', borderRadius:10, padding:'9px 16px', color:'#6DA4FF', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer' }}>↻</button>
          <button onClick={()=>{ sessionStorage.removeItem('bq_admin_auth'); setAuth(false); }}
            style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'9px 16px', color:'#EF4444', fontFamily:F, fontSize:13, cursor:'pointer' }}>Salir</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:2, marginBottom:20, background:'#0D1525', padding:4, borderRadius:12, width:'fit-content' }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ background:tab===t?CARD2:'transparent', border:`1px solid ${tab===t?BORDER:'transparent'}`, borderRadius:8, padding:'7px 20px', color:tab===t?'#EFF4FF':'#4B6080', fontFamily:F, fontSize:13, fontWeight:tab===t?600:400, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>
            {t==='web'?'🌐 Web':t==='empresas'?'🏢 Empresas':t==='wasapbot'?'🤖 WasapBot':'💰 Costes'}
          </button>
        ))}
      </div>

      {/* ══════════ TAB WEB ══════════ */}
      {tab==='web' && (
        <div>
      {/* ── TIEMPO REAL ── */}
          <div style={{ background: usuariosRT.length>0 ? 'rgba(37,211,102,.04)' : CARD, border: `1.5px solid ${usuariosRT.length>0 ? 'rgba(37,211,102,.25)' : BORDER}`, borderRadius:14, padding:'16px 20px', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: usuariosRT.length>0 ? 14 : 0 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: usuariosRT.length>0 ? '#25D366' : '#4B6080', animation: usuariosRT.length>0 ? 'pulse-g 1.5s ease infinite' : 'none', flexShrink:0 }}/>
              <div style={{ fontSize:14, fontWeight:700, color: usuariosRT.length>0 ? '#25D366' : '#EFF4FF' }}>
                {usuariosRT.length > 0 ? `${usuariosRT.length} usuario${usuariosRT.length>1?'s':''} ahora en la web` : 'Nadie en la web ahora mismo'}
              </div>
              <div style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.4)' }}>Actualiza cada 30s</div>
            </div>
            {usuariosRT.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {usuariosRT.map((u, i) => {
                  const mins = Math.floor(u.segsAtras / 60);
                  const segs = u.segsAtras % 60;
                  const tiempoStr = mins > 0 ? `hace ${mins}m ${segs}s` : `hace ${segs}s`;
                  const pagLabel = u.paginaActual === '/' ? 'Inicio' : u.paginaActual.replace('/wasapbot','WasapBot').replace('/planes','Planes').replace('/activar','Activando bot');
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(37,211,102,.05)', border:'1px solid rgba(37,211,102,.12)', borderRadius:8, padding:'8px 12px' }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#25D366', flexShrink:0 }}/>
                      <div style={{ flex:1, fontSize:12, color:'#EFF4FF', fontFamily:"'Courier New',monospace" }}>{pagLabel}</div>
                      <div style={{ fontSize:11, color:'#4B6080' }}>{u.paginasVistas} pág{u.paginasVistas>1?'s':''}</div>
                      {u.isNew && <span style={{ background:'rgba(255,107,0,.15)', color:'#FF6B00', border:'1px solid rgba(255,107,0,.3)', borderRadius:99, padding:'1px 7px', fontSize:9, fontWeight:700 }}>NUEVO</span>}
                      <div style={{ fontSize:11, color:'#4B6080', whiteSpace:'nowrap' }}>{tiempoStr}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KPIs HOY */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:20 }}>
            <MetricCard icon="👥" label="Sesiones"        value={web.sesiones||0}                         sub="visitas independientes" />
            <MetricCard icon="🙋" label="Usuarios activos" value={web.usuarios||0}  color="#25D366"        sub="personas únicas hoy" />
            <MetricCard icon="📄" label="Páginas vistas"  value={web.pageviews||0}  color="#A78BFA"        sub="total de pantallas" />
            <MetricCard icon="✨" label="Nuevos usuarios"  value={web.nuevos||0}    color="#F59E0B"        sub="primera vez en el sitio" />
            <MetricCard icon="⏱" label="Tiempo promedio"  value={fmtTiempo(web.tiempoMedio||0)} color="#60A5FA" sub="por sesión hoy" />
            <MetricCard icon="🚪" label="Tasa de rebote"  value={`${web.rebote||0}%`} color={web.rebote>70?'#EF4444':'#25D366'} sub="salieron sin interacción" />
          </div>

          {/* 7 días y 30 días */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Últimos 7 días</div>
              <div style={{ display:'flex', gap:24 }}>
                {[{l:'Sesiones',v:semana.sesiones||0},{l:'Usuarios',v:semana.usuarios||0},{l:'Pageviews',v:semana.pageviews||0}].map((s,i)=>(
                  <div key={i}><div style={{ fontSize:24,fontWeight:800,color:'#EFF4FF' }}>{s.v}</div><div style={{ fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:2 }}>{s.l}</div></div>
                ))}
              </div>
            </div>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Últimos 30 días</div>
              <div style={{ display:'flex', gap:24 }}>
                {[{l:'Sesiones',v:data?.web?.mes?.sesiones||0},{l:'Empresas',v:data?.totalEmpresas||0},{l:'Convs IA',v:convsTot}].map((s,i)=>(
                  <div key={i}><div style={{ fontSize:24,fontWeight:800,color:'#EFF4FF' }}>{s.v}</div><div style={{ fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:2 }}>{s.l}</div></div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfica 14 días */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#EFF4FF', marginBottom:16 }}>Sesiones por día — últimos 14 días</div>
            <BarChart data={ultimos14.map(d=>({ k:d.fecha.slice(5), v:d.sesiones }))} color="#2B6AFF" label="sesiones" />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              {ultimos14.filter((_,i)=>i%2===0).map((d,i)=>(
                <div key={i} style={{ fontSize:9, color:'#4B6080' }}>{d.fecha.slice(5)}</div>
              ))}
            </div>
          </div>

          {/* Páginas más vistas */}
          {topPages.length>0 && (
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#EFF4FF', marginBottom:14 }}>Páginas más vistas hoy</div>
              {topPages.map((p,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom: i<topPages.length-1?`1px solid ${BORDER}`:'none' }}>
                  <div style={{ width:20, fontSize:11, color:'#4B6080', textAlign:'right' }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:12, color:'#EFF4FF', fontFamily:"'Courier New',monospace" }}>{p.path||'/'}</div>
                  <MiniBar pct={p.views/topPages[0].views*100} color="#2B6AFF" />
                  <div style={{ width:32, fontSize:13, fontWeight:700, color:'#6DA4FF', textAlign:'right' }}>{p.views}</div>
                </div>
              ))}
            </div>
          )}

          {!data && <div style={{ color:'#4B6080', textAlign:'center', padding:40 }}>Los datos web aparecerán conforme lleguen visitas. El tracker empieza a recoger datos desde este deploy.</div>}
        </div>
      )}

      {/* ══════════ TAB EMPRESAS ══════════ */}
      {tab==='empresas' && (
        <div>
          {/* Contadores rápidos */}
          <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            {[
              { l:'Total', v:empresas.length, c:'#EFF4FF' },
              { l:'Plan activo', v:empresas.filter(e=>e.planActivo&&!e.esPruebaGratis).length, c:'#25D366' },
              { l:'En prueba', v:empresas.filter(e=>e.esPruebaGratis&&e.planActivo).length, c:'#F59E0B' },
              { l:'Sin plan', v:empresas.filter(e=>!e.planActivo).length, c:'#EF4444' },
              { l:'WhatsApp activo', v:empresas.filter(e=>e.whatsappActivo).length, c:'#25D366' },
              { l:'Bloqueadas', v:empresas.filter(e=>e.bloqueada).length, c:'#EF4444' },
            ].map((s,i)=>(
              <div key={i} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:'12px 18px', minWidth:110 }}>
                <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:10, color:'#4B6080', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Barra de selección masiva */}
          {seleccionadas.size>0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'10px 16px', marginBottom:12 }}>
              <span style={{ fontFamily:F, fontSize:13, color:'#EF4444', fontWeight:600 }}>{seleccionadas.size} empresa(s) seleccionada(s)</span>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setSeleccionadas(new Set())} style={{ background:'transparent', border:'none', color:'#6B7A99', fontFamily:F, fontSize:12, cursor:'pointer' }}>Cancelar</button>
                <button disabled={accionando==='__bulk__'} onClick={eliminarSeleccionadas} style={{ background:'#EF4444', border:'none', borderRadius:8, padding:'7px 16px', color:'#fff', fontFamily:F, fontSize:12, fontWeight:700, cursor: accionando==='__bulk__'?'wait':'pointer' }}>
                  {accionando==='__bulk__'?'Eliminando...':`🗑️ Eliminar seleccionadas (${seleccionadas.size})`}
                </button>
              </div>
            </div>
          )}

          {/* Botón limpiar Sin nombre */}
          {empresas.filter(e=>(!e.nombre||e.nombre==='Sin nombre')&&!e.planActivo&&e.conversaciones===0).length>0&&(
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.2)', borderRadius:10, padding:'10px 16px', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>🧹</span>
                <span style={{ fontFamily:F, fontSize:13, color:'#F59E0B', fontWeight:600 }}>
                  {empresas.filter(e=>(!e.nombre||e.nombre==='Sin nombre')&&!e.planActivo&&e.conversaciones===0).length} registros sin nombre detectados
                </span>
              </div>
              <button
                disabled={accionando==='__sinNombre__'}
                onClick={async()=>{
                  if(!confirm('¿Eliminar todos los registros Sin nombre sin plan ni conversaciones?')) return;
                  setAccionando('__sinNombre__');
                  const ids = empresas.filter(e=>(!e.nombre||e.nombre==='Sin nombre')&&!e.planActivo&&e.conversaciones===0).map(e=>e.id);
                  try {
                    const r = await fetch('/api/metrics-admin',{method:'POST',headers:{'Content-Type':'application/json','x-admin-secret':SECRET},body:JSON.stringify({accion:'eliminarEmpresas',empresaIds:ids})});
                    const d = await r.json();
                    if(d.ok) await fetchAll();
                    else alert('Error: '+(d.error||'desconocido'));
                  } catch(e){alert('Error: '+e.message);}
                  setAccionando(null);
                }}
                style={{ background: accionando==='__sinNombre__'?'#92400E':'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', border:'none', borderRadius:8, padding:'7px 18px', fontFamily:F, fontSize:12, fontWeight:700, cursor: accionando==='__sinNombre__'?'wait':'pointer', display:'flex', alignItems:'center', gap:6 }}>
                {accionando==='__sinNombre__'
                  ? <><div style={{width:12,height:12,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/> Limpiando...</>
                  : <>🧹 Limpiar todos los Sin nombre</>}
              </button>
            </div>
          )}

          {/* Tabla */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'24px 2fr 1fr 1fr 1fr 1fr 1fr 2fr', padding:'10px 18px', background:'#0D1525', fontSize:10, color:'#4B6080', textTransform:'uppercase', letterSpacing:'.06em', gap:8, alignItems:'center' }}>
              <div></div><div>Empresa</div><div>Plan</div><div>Estado</div><div>Ciudad</div><div style={{ textAlign:'right' }}>Convs hoy</div><div style={{ textAlign:'right' }}>Total convs</div><div style={{ textAlign:'right' }}>Acciones</div>
            </div>
            {empresas.map((e,i)=>{
              const trialDate = e.trialHasta ? new Date(e.trialHasta) : null;
              const trialActivo = trialDate && trialDate > new Date();
              const horasRestantes = trialActivo ? Math.floor((trialDate - new Date())/3600000) : 0;
              const enCurso = accionando === e.id;
              const sel = seleccionadas.has(e.id);
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'24px 2fr 1fr 1fr 1fr 1fr 1fr 2fr', padding:'12px 18px', borderBottom:`1px solid ${BORDER}`, gap:8, alignItems:'center', opacity: e.bloqueada ? .5 : 1, background: sel?'rgba(239,68,68,.04)':'transparent' }}>
                  <input type="checkbox" checked={sel} onChange={()=>toggleSeleccion(e.id)} style={{ width:15, height:15, cursor:'pointer', accentColor:'#EF4444' }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color: e.bloqueada?'#EF4444':'#EFF4FF', display:'flex', alignItems:'center', gap:6 }}>
                      {e.bloqueada && '🔒'}{e.nombre}
                      {(!e.nombre || e.nombre === 'Sin nombre') && e.planActivo && (
                        <button onClick={async()=>{
                          const nuevoNombre = prompt('Nombre para esta empresa:');
                          if (!nuevoNombre?.trim()) return;
                          await fetch('/api/metrics-admin', { method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET}, body:JSON.stringify({ accion:'renombrarEmpresa', empresaId:e.id, nuevoNombre:nuevoNombre.trim() }) });
                          fetchAll();
                        }} style={{ background:'rgba(255,107,0,.15)', color:'#FF6B00', border:'1px solid rgba(255,107,0,.3)', borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                          ✏️ Renombrar
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize:10, color:'#4B6080', marginTop:1 }}>{e.email}</div>
                    {e.esAfiliado && <Badge text="Afiliado" color="#F59E0B" />}
                  </div>
                  <div>
                    <Badge text={planLabel[e.plan]||e.plan} color={planColor[e.plan]||'#6B7A99'} bg={(planColor[e.plan]||'#6B7A99')+'15'} />
                  </div>
                  <div>
                    {e.bloqueada && <Badge text="Bloqueada" color="#EF4444" bg="rgba(239,68,68,.1)" />}
                    {!e.bloqueada && trialActivo && <Badge text={`Trial ${horasRestantes}h`} color="#F59E0B" bg="rgba(245,158,11,.1)" />}
                    {!e.bloqueada && !trialActivo && e.planActivo && <Badge text="Activo" color="#25D366" bg="rgba(37,211,102,.1)" />}
                    {!e.bloqueada && !e.planActivo && <Badge text="Sin plan" color="#6B7A99" />}
                  </div>
                  <div style={{ fontSize:12, color:'#8A9BB5' }}>{e.ciudad||'—'}</div>
                  <div style={{ fontSize:14, fontWeight:700, textAlign:'right', color: e.convsHoy>0?'#25D366':'#4B6080' }}>{e.convsHoy}</div>
                  <div style={{ fontSize:13, textAlign:'right', color:'#8A9BB5' }}>{e.conversaciones}</div>
                  <div style={{ display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap' }}>
                    <select disabled={enCurso} defaultValue="" onChange={ev=>{ if(ev.target.value) activarPlan(e.id, ev.target.value); ev.target.value=''; }}
                      style={{ background:CARD2, color:'#EFF4FF', border:`1px solid ${BORDER}`, borderRadius:7, padding:'5px 8px', fontFamily:F, fontSize:11, cursor:'pointer' }}>
                      <option value="" disabled>Activar plan…</option>
                      <option value="basico">Básico — 79€</option>
                      <option value="estandar">Estándar — 149€</option>
                      <option value="pro">Pro — 249€</option>
                    </select>
                    <button disabled={enCurso} onClick={()=>toggleBloqueo(e.id, !e.bloqueada)}
                      style={{ background: e.bloqueada?'rgba(37,211,102,.08)':'rgba(239,68,68,.08)', color: e.bloqueada?'#25D366':'#EF4444', border:`1px solid ${e.bloqueada?'rgba(37,211,102,.2)':'rgba(239,68,68,.2)'}`, borderRadius:7, padding:'5px 10px', fontFamily:F, fontSize:11, fontWeight:600, cursor: enCurso?'wait':'pointer' }}>
                      {enCurso?'...':(e.bloqueada?'Desbloquear':'Bloquear')}
                    </button>
                    <button disabled={enCurso} onClick={()=>eliminarEmpresa(e.id, e.nombre)}
                      style={{ background:'rgba(239,68,68,.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,.3)', borderRadius:7, padding:'5px 10px', fontFamily:F, fontSize:11, fontWeight:700, cursor: enCurso?'wait':'pointer' }}>
                      {enCurso?'...':'🗑️ Eliminar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ TAB WASAPBOT ══════════ */}
      {tab==='wasapbot' && (
        <div>
      {/* ══ SECCIÓN AGENCIA PROPIA ══ */}
          {(() => {
            const AGENCIA_ID = '48SqTngvOTxYIIFIoXE9';
            const mesKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
            const agencia = empresas.find(e=>e.id===AGENCIA_ID);
            const tokUsado = agenciaConfig?.tokensUsadosMes || 0;
            const tokLimit = parseInt(agenciaEdit.tokensLimite) || 400000;
            const pct = Math.min(Math.round(tokUsado/tokLimit*100),100);
            const col = pct>=90?'#EF4444':pct>=70?'#F59E0B':'#25D366';

            const guardarAgencia = async () => {
              setAgenciaSaving(true); setAgenciaMsg('');
              try {
                const r = await fetch('/api/metrics-admin', {
                  method:'POST', headers:{'Content-Type':'application/json','x-admin-secret':SECRET},
                  body: JSON.stringify({ accion:'updateAgenciaConfig', empresaId:AGENCIA_ID, telefonoDueno:agenciaEdit.telefonoDueno, tokensLimite:parseInt(agenciaEdit.tokensLimite)||400000 })
                });
                const d = await r.json();
                if (d.ok) { setAgenciaMsg('✓ Guardado'); await fetchAll(); }
                else setAgenciaMsg('Error: '+(d.error||''));
              } catch { setAgenciaMsg('Error de conexión'); }
              setAgenciaSaving(false); setTimeout(()=>setAgenciaMsg(''),3000);
            };

            const resetearTokens = async () => {
              if (!confirm('¿Resetear los tokens de este mes a 0?')) return;
              setAgenciaSaving(true);
              try {
                await fetch('/api/wasapbot-panel', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({accion:'resetTokensMes',empresaId:AGENCIA_ID}) });
                setAgenciaMsg('✓ Tokens reseteados');
                await fetchAll();
              } catch { setAgenciaMsg('Error'); }
              setAgenciaSaving(false); setTimeout(()=>setAgenciaMsg(''),3000);
            };

            return (
              <div style={{ background:'rgba(255,107,0,.04)', border:'1.5px solid rgba(255,107,0,.25)', borderRadius:14, padding:'20px 24px', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:'#FF6B00', display:'flex', alignItems:'center', gap:8 }}>🏢 AGENCIA — BQinzagencIA</div>
                    <div style={{ fontSize:11, color:'#4B6080', marginTop:2 }}>Gestiona tus créditos y número del dueño</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={resetearTokens} disabled={agenciaSaving}
                      style={{ background:'rgba(239,68,68,.08)', color:'#EF4444', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, padding:'7px 14px', fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      🔄 Resetear créditos del dueño
                    </button>
                  </div>
                </div>

                {/* Barra de créditos del dueño */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, color:'#8A9BB5', marginBottom:10, fontWeight:600 }}>📱 Créditos WasapBot del dueño (tu número)</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#8A9BB5' }}>Consumidos este mes</span>
                    <span style={{ fontSize:12, fontWeight:700, color:(agenciaConfig?.tokensUsadosDueno||0)/(agenciaConfig?.tokensLimite||50000)>.8?'#EF4444':'#FF6B00' }}>
                      {(agenciaConfig?.tokensUsadosDueno||0).toLocaleString('es-ES')} / {(agenciaConfig?.tokensLimite||50000).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div style={{ background:'rgba(255,255,255,.06)', borderRadius:6, height:10, overflow:'hidden' }}>
                    <div style={{ width:`${Math.min(Math.round((agenciaConfig?.tokensUsadosDueno||0)/(agenciaConfig?.tokensLimite||50000)*100),100)}%`, height:'100%', background:'#FF6B00', borderRadius:6, transition:'width .5s' }}/>
                  </div>
                  {(agenciaConfig?.tokensUsadosDueno||0)/(agenciaConfig?.tokensLimite||50000)>.8 && <div style={{ fontSize:11, color:'#F59E0B', marginTop:6 }}>⚠️ Más del 80% consumido — sube el tope o resetea</div>}
                </div>

                {/* Formulario */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12, alignItems:'flex-end' }}>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:'#4B6080', textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>📱 Número del dueño (con prefijo)</label>
                    <input value={agenciaEdit.telefonoDueno}
                      onChange={e=>setAgenciaEdit(prev=>({...prev,telefonoDueno:e.target.value}))}
                      placeholder="Ej: 34674421919"
                      style={{ width:'100%', background:'#060B18', border:`1px solid ${BORDER}`, borderRadius:8, padding:'9px 12px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                    <div style={{ fontSize:10, color:'#4B6080', marginTop:4 }}>Este número nunca se bloquea aunque supere el tope</div>
                  </div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:'#4B6080', textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>🎯 Tope de créditos / mes</label>
                    <input type="number" value={agenciaEdit.tokensLimite}
                      onChange={e=>setAgenciaEdit(prev=>({...prev,tokensLimite:e.target.value}))}
                      placeholder="400000"
                      style={{ width:'100%', background:'#060B18', border:`1px solid ${BORDER}`, borderRadius:8, padding:'9px 12px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                    <div style={{ fontSize:10, color:'#4B6080', marginTop:4 }}>Plan Pro incluye 400.000 — puedes subir si necesitas más</div>
                  </div>
                  <div>
                    <button onClick={guardarAgencia} disabled={agenciaSaving}
                      style={{ background:'#FF6B00', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontFamily:F, fontSize:13, fontWeight:700, cursor:'pointer', opacity:agenciaSaving?.6:1, whiteSpace:'nowrap' }}>
                      {agenciaSaving?'Guardando...':'💾 Guardar'}
                    </button>
                  </div>
                </div>
                {agenciaMsg && <div style={{ marginTop:10, fontSize:12, color:agenciaMsg.startsWith('✓')?'#25D366':'#EF4444' }}>{agenciaMsg}</div>}
              </div>
            );
          })()}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            <MetricCard icon="💬" label="Convs hoy"      value={data?.conversacionesHoy||0}   color="#25D366" />
            <MetricCard icon="📊" label="Convs total"    value={convsTot}                       color="#60A5FA" />
            <MetricCard icon="📡" label="WA conectados"  value={railway?.sesionesActivas||0}    color="#25D366" />
            <MetricCard icon="🤖" label="Clientes bot"   value={empresas.filter(e=>e.planActivo).length} />
          </div>

          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 2fr 1fr', padding:'10px 18px', background:'#0D1525', fontSize:10, color:'#4B6080', textTransform:'uppercase', letterSpacing:'.06em', gap:8 }}>
              <div>Negocio</div><div>Plan</div><div>WhatsApp</div><div>Tokens consumidos</div><div style={{ textAlign:'right' }}>Convs</div>
            </div>
            {empresas.filter(e=>e.planActivo||e.esPruebaGratis).map((e,i)=>{
              const tokMax = PLAN_TOK[e.plan] || 50000;
              const pct    = Math.min(Math.round((e.tokensUsados||0)/tokMax*100),100);
              const col    = pct>=90?'#EF4444':pct>=70?'#F59E0B':'#25D366';
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 2fr 1fr', padding:'12px 18px', borderBottom:`1px solid ${BORDER}`, gap:8, alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{e.nombre}</div>
                    <div style={{ fontSize:10, color:'#4B6080' }}>{e.industria}</div>
                  </div>
                  <Badge text={planLabel[e.plan]||e.plan} color={planColor[e.plan]||'#6B7A99'} bg={(planColor[e.plan]||'#6B7A99')+'15'} />
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:e.whatsappActivo?'#25D366':'#EF4444' }}/>
                    <span style={{ fontSize:11, color: e.whatsappActivo?'#25D366':'#EF4444' }}>{e.whatsappActivo?'Online':'Offline'}</span>
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <MiniBar pct={pct} color={col} />
                      <span style={{ fontSize:11, color:col, fontWeight:700, whiteSpace:'nowrap' }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize:10, color:'#4B6080' }}>{(e.tokensUsados||0).toLocaleString('es-ES')} / {tokMax.toLocaleString('es-ES')}</div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, textAlign:'right', color:'#8A9BB5' }}>{e.conversaciones}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ TAB COSTES ══════════ */}
      {tab==='costes' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <MetricCard icon="🧠" label="OpenAI gastado"  value={`${openaiGasto}`} sub={`~${tokensTotales.toLocaleString('es-ES')} tokens consumidos`} color={parseFloat(openaiGasto)>4?'#EF4444':'#EFF4FF'} />
            <MetricCard icon="🚂" label="Railway/mes"     value="~7€"   sub="fijo, servidor WhatsApp" />
            <MetricCard icon="💰" label="MRR"             value={`${mrr}€`} sub={`${empresas.filter(e=>e.planActivo&&!e.esPruebaGratis).length} clientes de pago`} color="#25D366" />
          </div>

          {/* Servicios */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Estado de servicios</div>
            {[
              { name:'OpenAI',   pct:Math.round(parseFloat(openaiGasto)/5*100), color:'#10a37f', detail:`$${openaiGasto} gastado de $5.00 de crédito`, sub:`~${Math.round((5-parseFloat(openaiGasto))/0.002)} convs restantes` },
              { name:'Railway',  pct:Math.round((railway?.uptime||0)/3600/720*100), color:'#e06c00', detail:`${railway ? 'Activo — ' + Math.round((railway.uptime||0)/3600)+'h uptime' : 'Sin datos'}`, sub:'~7€/mes fijo' },
              { name:'Firebase', pct:Math.round((data?.lecturasHoy||0)/50000*100), color:'#FFCA28', detail:`~${(data?.lecturasHoy||0).toLocaleString()} lecturas hoy`, sub:'límite: 50.000/día — GRATIS' },
              { name:'Vercel',   pct:3, color:'#EFF4FF', detail:'Hobby plan', sub:'GRATIS hasta 100GB bandwidth' },
              { name:'WhatsApp', pct:Math.min((railway?.sesionesActivas||0)*25,100), color:'#25D366', detail:`${railway?.sesionesActivas||0} sesión(es) activa(s)`, sub:'Baileys — sin coste adicional' },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom:i<4?`1px solid ${BORDER}`:'none' }}>
                <div style={{ width:90, fontSize:13, fontWeight:600 }}>{s.name}</div>
                <MiniBar pct={s.pct} color={s.color} />
                <div style={{ width:36, fontSize:13, color:'#8A9BB5', textAlign:'right' }}>{s.pct}%</div>
                <div style={{ width:260, fontSize:12, color:'#6B7A99' }}>
                  <div>{s.detail}</div>
                  <div style={{ color:'#4B6080', marginTop:1 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Margen */}
          <div style={{ background: mrr>0?'rgba(37,211,102,.06)':'rgba(239,68,68,.06)', border:`1px solid ${mrr>0?'rgba(37,211,102,.2)':'rgba(239,68,68,.2)'}`, borderRadius:14, padding:'18px 22px' }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Resumen financiero este mes</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {[
                { l:'Ingresos (MRR)', v:`${mrr}€`, c:'#25D366' },
                { l:'Costes estimados', v:`${(7+parseFloat(openaiGasto)*0.9).toFixed(0)}€`, c:'#EF4444' },
                { l:'Margen bruto', v:`${mrr-(7+parseFloat(openaiGasto)*0.9)>0?'+':''}${(mrr-(7+parseFloat(openaiGasto)*0.9)).toFixed(0)}€`, c: mrr>7?'#25D366':'#EF4444' },
                { l:'Margen %', v: mrr>0?`${Math.round((1-(7+parseFloat(openaiGasto)*0.9)/mrr)*100)}%`:'—', c:'#60A5FA' },
              ].map((s,i)=>(
                <div key={i}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
