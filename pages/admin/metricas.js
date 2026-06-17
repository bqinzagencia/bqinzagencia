// pages/admin/metricas.js
import { useState, useEffect, useRef } from 'react';

const PASS   = process.env.NEXT_PUBLIC_ADMIN_PASS || 'nexoia2026admin';
const F      = "'Inter', system-ui, sans-serif";
const BG     = '#0A0F1E';
const CARD   = '#111827';
const BORDER = 'rgba(255,255,255,0.07)';
const COLORS = ['#e06c00','#10a37f','#3266ad','#d85a30','#7f77dd','#1d9e75','#ba7517','#a32d2d'];

const Bar  = ({ pct, color }) => (
  <div style={{ flex:1, background:'rgba(255,255,255,0.06)', borderRadius:4, height:8, overflow:'hidden' }}>
    <div style={{ width:Math.min(pct,100)+'%', height:'100%', background:color, borderRadius:4, transition:'width 0.6s' }} />
  </div>
);
const Card = ({ label, value, sub, color='#EFF4FF' }) => (
  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:'16px 18px' }}>
    <div style={{ fontSize:11, color:'#6B7A99', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color, letterSpacing:'-0.03em' }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'#4B6080', marginTop:2 }}>{sub}</div>}
  </div>
);

function PanelPruebas() {
  const ADMIN_SECRET = 'nexoti2026admin';
  const CARD   = '#111827';
  const BORDER = 'rgba(255,255,255,0.07)';
  const F      = "'Inter', system-ui, sans-serif";

  const [empresas,      setEmpresas]      = useState([]);
  const [cargandoEmps,  setCargandoEmps]  = useState(false);
  const [empresaSel,    setEmpresaSel]    = useState(null);
  const [planSel,       setPlanSel]       = useState('basico');
  const [activando,     setActivando]     = useState(false);
  const [log,           setLog]           = useState([]);
  const [busqueda,      setBusqueda]      = useState('');

  const PLANES_PRUEBA = [
    { id:'basico',   label:'Básico',   precio:'$249.000/mes', color:'#25D366', features:['Bot WhatsApp 24/7','Lista clientes auto','Catálogo','Agenda','Inventario básico'] },
    { id:'estandar', label:'Estándar', precio:'$450.000/mes', color:'#2563EB', features:['Todo Básico','Panel pedidos','Inventario avanzado','Reportes diarios','Broadcasts'] },
    { id:'pro',      label:'Pro',      precio:'$790.000/mes', color:'#A78BFA', features:['Todo Estándar','Página web','CRM avanzado','Recordatorios citas','Múltiples agentes'] },
  ];

  const addLog = (msg, tipo='info') => {
    const hora = new Date().toLocaleTimeString('es-CO');
    setLog(prev => [{ hora, msg, tipo }, ...prev].slice(0, 20));
  };

  const cargarEmpresas = async () => {
    setCargandoEmps(true);
    try {
      const r = await fetch('/api/wompi-activar-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: ADMIN_SECRET, empresaId: 'LISTAR' }),
      });
      const d = await r.json();
      if (d.empresas) {
        setEmpresas(d.empresas);
        addLog(`✅ ${d.empresas.length} empresas cargadas`, 'ok');
      }
    } catch(e) {
      addLog('❌ Error cargando empresas: ' + e.message, 'error');
    }
    setCargandoEmps(false);
  };

  const activarPlan = async () => {
    if (!empresaSel) { addLog('⚠️ Selecciona una empresa primero', 'warn'); return; }
    if (!confirm(`¿Activar plan "${planSel}" para "${empresaSel.nombre}"?\n\nEsto es una activación de PRUEBA interna.\nNo afecta el flujo real de pago de otros clientes.`)) return;

    setActivando(true);
    addLog(`⏳ Activando plan ${planSel} para ${empresaSel.nombre}...`, 'info');

    try {
      const r = await fetch('/api/wompi-activar-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret:    ADMIN_SECRET,
          empresaId: empresaSel.id,
          planId:    planSel,
          referencia: `PRUEBA-${planSel.toUpperCase()}-${Date.now()}`,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        addLog(`✅ Plan "${planSel}" activado para "${empresaSel.nombre}"`, 'ok');
        addLog(`🔗 Panel: /wasapbot/panel/${empresaSel.id}`, 'link');
        // Actualizar estado local
        setEmpresas(prev => prev.map(e => e.id === empresaSel.id ? {...e, planActivo: true, plan: planSel} : e));
        setEmpresaSel(prev => ({...prev, planActivo: true, plan: planSel}));
      } else {
        addLog('❌ Error: ' + (d.error || 'Respuesta inesperada'), 'error');
      }
    } catch(e) {
      addLog('❌ Error: ' + e.message, 'error');
    }
    setActivando(false);
  };

  const desactivarPlan = async () => {
    if (!empresaSel) return;
    if (!confirm(`¿Desactivar plan de "${empresaSel.nombre}"?`)) return;
    setActivando(true);
    addLog(`⏳ Desactivando plan de ${empresaSel.nombre}...`, 'info');
    try {
      const r = await fetch('/api/wompi-activar-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret:    ADMIN_SECRET,
          empresaId: empresaSel.id,
          planId:    'sin_plan',
          referencia: `DESACTIVAR-${Date.now()}`,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        addLog(`✅ Plan desactivado para "${empresaSel.nombre}"`, 'ok');
        setEmpresas(prev => prev.map(e => e.id === empresaSel.id ? {...e, planActivo: false, plan: 'sin_plan'} : e));
        setEmpresaSel(prev => ({...prev, planActivo: false, plan: 'sin_plan'}));
      }
    } catch(e) {
      addLog('❌ Error: ' + e.message, 'error');
    }
    setActivando(false);
  };

  const empsFiltradas = empresas.filter(e =>
    (e.nombre||'').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.email||'').toLowerCase().includes(busqueda.toLowerCase())
  );

  const logColor = { ok:'#25D366', error:'#EF4444', warn:'#F59E0B', info:'#8A9BB5', link:'#60A5FA' };

  return (
    <div style={{ fontFamily:F }}>

      {/* Header */}
      <div style={{ background:'rgba(37,211,102,0.05)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ fontSize:28 }}>🧪</div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'#EFF4FF' }}>Panel de Pruebas Internas</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Activa planes en empresas de prueba sin afectar el flujo real de pago de otros clientes. Solo tú puedes hacer esto desde aquí.</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Columna izquierda: seleccionar empresa */}
        <div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#EFF4FF' }}>1. Selecciona la empresa de prueba</div>
              <button onClick={cargarEmpresas} disabled={cargandoEmps}
                style={{ background:'rgba(43,106,255,0.12)', border:'1px solid rgba(43,106,255,0.3)', borderRadius:8, padding:'6px 14px', color:'#6DA4FF', fontFamily:F, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                {cargandoEmps ? 'Cargando...' : '🔄 Cargar empresas'}
              </button>
            </div>

            {empresas.length > 0 && (
              <>
                <input
                  placeholder="Buscar por nombre o email..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  style={{ width:'100%', background:'#0A0F1E', border:`1px solid ${BORDER}`, borderRadius:8, padding:'8px 12px', color:'#EFF4FF', fontFamily:F, fontSize:12, outline:'none', marginBottom:10, boxSizing:'border-box' }}
                />
                <div style={{ maxHeight:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                  {empsFiltradas.map(e => (
                    <div key={e.id} onClick={() => setEmpresaSel(e)}
                      style={{ padding:'10px 12px', borderRadius:10, cursor:'pointer', border:`1px solid ${empresaSel?.id===e.id ? 'rgba(37,211,102,0.5)' : BORDER}`, background: empresaSel?.id===e.id ? 'rgba(37,211,102,0.08)' : 'rgba(255,255,255,0.02)', transition:'all 0.15s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#EFF4FF' }}>{e.nombre || 'Sin nombre'}</div>
                          <div style={{ fontSize:10, color:'#4B6080', marginTop:2 }}>{e.email}</div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
                          {e.planActivo
                            ? <span style={{ fontSize:9, fontWeight:700, color:'#25D366', background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:100, padding:'2px 8px' }}>ACTIVO ✓</span>
                            : <span style={{ fontSize:9, fontWeight:700, color:'#6B7A99', background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`, borderRadius:100, padding:'2px 8px' }}>SIN PLAN</span>
                          }
                          {e.plan && e.plan !== 'sin_plan' && <span style={{ fontSize:9, color:'#8A9BB5' }}>{e.plan}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {empsFiltradas.length === 0 && <div style={{ fontSize:12, color:'#4B6080', textAlign:'center', padding:16 }}>Sin resultados</div>}
                </div>
              </>
            )}
            {empresas.length === 0 && <div style={{ fontSize:12, color:'#4B6080', textAlign:'center', padding:24 }}>Haz clic en "Cargar empresas" para comenzar</div>}
          </div>
        </div>

        {/* Columna derecha: seleccionar plan y activar */}
        <div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#EFF4FF', marginBottom:14 }}>2. Elige el plan a probar</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {PLANES_PRUEBA.map(p => (
                <div key={p.id} onClick={() => setPlanSel(p.id)}
                  style={{ padding:'12px 14px', borderRadius:10, cursor:'pointer', border:`1px solid ${planSel===p.id ? p.color+'66' : BORDER}`, background: planSel===p.id ? p.color+'0D' : 'rgba(255,255,255,0.02)', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color: planSel===p.id ? p.color : '#EFF4FF' }}>{p.label}</span>
                    <span style={{ fontSize:11, color: planSel===p.id ? p.color : '#4B6080', fontWeight:600 }}>{p.precio}</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {p.features.map((f,i) => (
                      <span key={i} style={{ fontSize:9, color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`, borderRadius:100, padding:'2px 8px' }}>{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Empresa seleccionada */}
            {empresaSel ? (
              <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`, borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                <div style={{ fontSize:10, color:'#4B6080', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Empresa seleccionada</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#EFF4FF' }}>{empresaSel.nombre}</div>
                <div style={{ fontSize:11, color:'#4B6080' }}>{empresaSel.email}</div>
                <div style={{ fontSize:11, color: empresaSel.planActivo ? '#25D366' : '#6B7A99', marginTop:4 }}>
                  {empresaSel.planActivo ? `✓ Plan activo: ${empresaSel.plan}` : '⚠️ Sin plan activo'}
                </div>
              </div>
            ) : (
              <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${BORDER}`, borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#4B6080', textAlign:'center' }}>
                ← Selecciona una empresa de la lista
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={activarPlan} disabled={!empresaSel || activando}
                style={{ flex:1, background: empresaSel ? 'linear-gradient(135deg,#25D366,#1DA851)' : 'rgba(255,255,255,0.05)', border:'none', borderRadius:10, padding:'12px', color: empresaSel ? '#fff' : '#4B6080', fontFamily:F, fontSize:13, fontWeight:700, cursor: empresaSel ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
                {activando ? '⏳ Activando...' : `✅ Activar plan ${planSel}`}
              </button>
              {empresaSel?.planActivo && (
                <button onClick={desactivarPlan} disabled={activando}
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'12px 16px', color:'#EF4444', fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Desactivar
                </button>
              )}
            </div>

            {empresaSel?.planActivo && (
              <a href={`/wasapbot/panel/${empresaSel.id}`} target="_blank" rel="noreferrer"
                style={{ display:'block', marginTop:10, textAlign:'center', fontSize:12, color:'#60A5FA', textDecoration:'none' }}>
                🔗 Ir al panel de esta empresa →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Log de actividad */}
      {log.length > 0 && (
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'16px 20px', marginTop:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#4B6080', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Log de actividad</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflowY:'auto' }}>
            {log.map((l,i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:10, color:'#4B6080', flexShrink:0, marginTop:1 }}>{l.hora}</span>
                <span style={{ fontSize:12, color: logColor[l.tipo] || '#8A9BB5', lineHeight:1.4 }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* PRUEBAS */}
      {tab === 'pruebas' && (
        <PanelPruebas />
      )}

    </div>
  );
}

function WasapBotMetricas() {
  const F = "'Inter', system-ui, sans-serif";
  const CARD = '#111827';
  const BORDER = 'rgba(255,255,255,0.07)';
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ampliando, setAmpliando] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/wasapbot-admin', { headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_PASS || 'REEMPLAZAR_ADMIN_SECRET' } });
      const d = await r.json();
      if (d.ok) setClientes(d.clientes || []);
    } catch {}
    finally { setLoading(false); }
  };

  const ampliarTokens = async (empresaId, nombre) => {
    const extra = prompt(`Tokens adicionales para ${nombre}:`);
    if (!extra || isNaN(extra)) return;
    setAmpliando(empresaId);
    try {
      await fetch('/api/wasapbot-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_PASS || 'REEMPLAZAR_ADMIN_SECRET' },
        body: JSON.stringify({ accion: 'ampliar', empresaId, tokens: parseInt(extra) }),
      });
      alert('Tokens ampliados');
      cargar();
    } catch { alert('Error'); }
    finally { setAmpliando(''); }
  };

  const cambiarPlan = async (empresaId, nombre) => {
    const plan = prompt(`Plan para ${nombre} (basico / estandar / pro):`);
    if (!['basico','estandar','pro'].includes(plan)) { alert('Plan invalido'); return; }
    await fetch('/api/wasapbot-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'borrero_nexoia_admin_2026' },
      body: JSON.stringify({ accion: 'cambiar_plan', empresaId, plan }),
    });
    alert('Plan actualizado'); cargar();
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#4B6080', fontFamily: F }}>Cargando...</div>;

  const PLAN_TOKENS = { basico: 50000, estandar: 150000, pro: 400000 };
  const PLAN_PRECIO = { basico: 189000, estandar: 390000, pro: 690000 };
  const totalMRR = clientes.reduce((s, c) => s + (PLAN_PRECIO[c.plan] || 0), 0);

  return (
    <div>
      {/* Resumen MRR */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Clientes WasapBot', val: clientes.length, color: '#25D366' },
          { label: 'MRR WasapBot', val: `${new Intl.NumberFormat('es-CO').format(totalMRR)} COP`, color: '#60A5FA' },
          { label: 'Cerca del limite', val: clientes.filter(c => (c.pctTokens || 0) >= 80).length, color: '#F59E0B' },
        ].map((s,i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 160 }}>
            <div style={{ fontFamily: F, fontSize: 10, color: '#4B6080', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabla clientes */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 80px 80px', padding: '10px 16px', background: '#0D1420', fontSize: 10, color: '#4B6080', textTransform: 'uppercase', letterSpacing: 1, gap: 8 }}>
          <div>Negocio</div><div>Plan</div><div>Tokens</div><div>Consumo</div><div>Ampliar</div><div>Plan</div>
        </div>
        {clientes.map((c,i) => {
          const tokTotal = (PLAN_TOKENS[c.plan] || 50000) + (c.tokensExtra || 0);
          const pctTok   = Math.min(Math.round((c.tokensUsados || 0) / tokTotal * 100), 100);
          const col      = pctTok >= 90 ? '#EF4444' : pctTok >= 70 ? '#F59E0B' : '#25D366';
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 80px 80px', padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, gap: 8, alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: '#EFF4FF' }}>{c.nombre}</div>
                <div style={{ fontFamily: F, fontSize: 10, color: '#4B6080' }}>{c.industria}</div>
              </div>
              <div>
                <span style={{ background: c.plan==='pro'?'rgba(167,139,250,0.1)':c.plan==='estandar'?'rgba(37,99,235,0.1)':'rgba(107,114,128,0.1)', color: c.plan==='pro'?'#A78BFA':c.plan==='estandar'?'#60A5FA':'#9CA3AF', border: `1px solid ${c.plan==='pro'?'rgba(167,139,250,0.25)':c.plan==='estandar'?'rgba(37,99,235,0.25)':'rgba(107,114,128,0.2)'}`, borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700, fontFamily: F }}>
                  {c.plan || 'basico'}
                </span>
              </div>
              <div style={{ fontFamily: F, fontSize: 12, color: '#8A9BB5' }}>
                {new Intl.NumberFormat('es-CO').format(c.tokensUsados || 0)}<br />
                <span style={{ fontSize: 10, color: '#4B6080' }}>de {new Intl.NumberFormat('es-CO').format(tokTotal)}</span>
              </div>
              <div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${pctTok}%`, height: '100%', background: col, borderRadius: 100, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontFamily: F, fontSize: 10, color: col, fontWeight: 700 }}>{pctTok}%</div>
              </div>
              <button onClick={() => ampliarTokens(c.id, c.nombre)} disabled={ampliando===c.id}
                style={{ background: 'rgba(37,211,102,0.08)', color: '#25D366', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 6, padding: '5px 8px', fontFamily: F, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {ampliando===c.id ? '...' : '+ Tokens'}
              </button>
              <button onClick={() => cambiarPlan(c.id, c.nombre)}
                style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 6, padding: '5px 8px', fontFamily: F, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                Plan
              </button>
            </div>
          );
        })}
        {clientes.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#4B6080', fontFamily: F, fontSize: 13 }}>Sin clientes WasapBot aun</div>}
      </div>
    </div>
  );
}

export default function MetricasAdmin() {
  const [auth, setAuth]       = useState(false);
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');
  const [data, setData]       = useState(null);
  const [railway, setRailway] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('resumen');
  const [empSlider, setEmpSlider]   = useState(5);
  const [convSlider, setConvSlider] = useState(10);
  const [borrando, setBorrando]     = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_auth') === '1';
    if (ok) { setAuth(true); fetchAll(); }
    return () => clearInterval(intervalRef.current);
  }, []);

  const login = () => {
    if (pass === PASS) {
      sessionStorage.setItem('admin_auth', '1');
      setAuth(true); fetchAll();
    } else {
      setError('Contraseña incorrecta');
      setTimeout(() => setError(''), 2000);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.allSettled([
        fetch((process.env.NEXT_PUBLIC_WA_SERVER || 'REEMPLAZAR_URL_RAILWAY') + '/health').then(r => r.json()),
        fetch('/api/metrics-admin', { headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_PASS || 'REEMPLAZAR_ADMIN_SECRET' } }).then(r => r.json()),
      ]);
      if (r1.status === 'fulfilled') setRailway(r1.value);
      if (r2.status === 'fulfilled') setData(r2.value);
    } catch {}
    setLoading(false);
  };

  const borrarEmpresa = async (id, nombre) => {
    if (!confirm(`¿Borrar "${nombre}" y todos sus datos?\nEsta acción es irreversible.`)) return;
    setBorrando(id);
    try {
      const r = await fetch('/api/admin-borrar-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_PASS || 'REEMPLAZAR_ADMIN_SECRET' },
        body: JSON.stringify({ empresaId: id }),
      });
      const d = await r.json();
      if (d.ok) { alert('✅ Empresa borrada'); fetchAll(); }
      else alert('Error: ' + d.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setBorrando(''); }
  };

  const borrarTodas = async () => {
    const conservar = prompt('IDs a conservar separados por coma\n(deja vacío para borrar TODAS):');
    if (conservar === null) return;
    if (!confirm('⚠️ ¿Borrar TODAS las empresas? Irreversible.')) return;
    setBorrando('todas');
    try {
      const ids = conservar ? conservar.split(',').map(s => s.trim()).filter(Boolean) : [];
      const r = await fetch('/api/admin-borrar-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_PASS || 'REEMPLAZAR_ADMIN_SECRET' },
        body: JSON.stringify({ todos: true, conservar: ids }),
      });
      const d = await r.json();
      if (d.ok) { alert(`✅ Borradas: ${d.borrados.length}. Conservadas: ${d.conservadas.length}`); fetchAll(); }
      else alert('Error: ' + d.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setBorrando(''); }
  };

  // Métricas
  const railwayUptime   = railway ? railway.uptime / 3600 : 0;
  const railwayCostado  = Math.min(railwayUptime * 0.01, 5);
  const railwayRestante = Math.max(5 - railwayCostado, 0).toFixed(2);
  const railwayPct      = Math.round(railwayCostado / 5 * 100);
  const railwayDias     = Math.round(parseFloat(railwayRestante) / 0.01 / 24);
  const totalConvs      = data?.conversacionesTotal || 0;
  const openaiGastado   = totalConvs * 0.002;
  const openaiRest      = Math.max(5 - openaiGastado, 0).toFixed(3);
  const openaiPct       = Math.round(openaiGastado / 5 * 100);
  const openaiLeft      = Math.round(parseFloat(openaiRest) / 0.002);
  const firebasePct     = Math.round((data?.lecturasHoy || 0) / 50000 * 100);
  const convsTotal30    = empSlider * convSlider * 30;
  const openaiCost30    = convsTotal30 * 0.002;
  const total30         = openaiCost30 + 7.20;
  const totalCOP        = Math.round(total30 * 4100);
  const breakeven       = empSlider > 0 ? Math.ceil(totalCOP / empSlider / 1000) * 1000 : 0;

  if (!auth) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F }}>
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:'40px 36px', width:320 }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#EFF4FF', marginBottom:4, letterSpacing:'-0.03em' }}>
          agenc<span style={{ color:'#FF6B00' }}>IA</span>me
        </div>
        <div style={{ fontSize:13, color:'#6B7A99', marginBottom:28 }}>Panel de métricas — acceso privado</div>
        <input type="password" placeholder="Contraseña" value={pass}
          onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width:'100%', background:'#0A0F1E', border:`1px solid ${error ? '#EF4444' : BORDER}`, borderRadius:10, padding:'10px 14px', color:'#EFF4FF', fontFamily:F, fontSize:14, marginBottom:12, outline:'none', boxSizing:'border-box' }}
          autoFocus />
        {error && <div style={{ fontSize:12, color:'#EF4444', marginBottom:10 }}>{error}</div>}
        <button onClick={login} style={{ width:'100%', background:'#2B6AFF', border:'none', borderRadius:10, padding:'11px', color:'#fff', fontFamily:F, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Ingresar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:F, color:'#EFF4FF', padding:'28px 32px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.03em' }}>
            agenc<span style={{ color:'#FF6B00' }}>IA</span>me — Métricas
          </div>
          <div style={{ fontSize:12, color:'#4B6080', marginTop:2 }}>
            {loading ? 'Actualizando...' : `Actualizado: ${new Date().toLocaleTimeString('es-CO')}`}
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={fetchAll} style={{ background:'rgba(43,106,255,0.12)', border:'1px solid rgba(43,106,255,0.3)', borderRadius:100, padding:'8px 18px', color:'#6DA4FF', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            ↻ Actualizar
          </button>
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuth(false); }}
            style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:100, padding:'8px 18px', color:'#EF4444', fontFamily:F, fontSize:13, cursor:'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#0D1420', padding:4, borderRadius:12, width:'fit-content' }}>
        {['resumen','servicios','empresas','wasapbot','proyección','pruebas'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background:tab===t?'#1E293B':'transparent', border:`1px solid ${tab===t?BORDER:'transparent'}`, borderRadius:8, padding:'7px 18px', color:tab===t?'#EFF4FF':'#6B7A99', fontFamily:F, fontSize:13, fontWeight:tab===t?600:400, cursor:'pointer', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
            <Card label="Railway restante" value={`$${railwayRestante}`} sub={`~${railwayDias} días`} color={railwayDias<5?'#EF4444':'#EFF4FF'} />
            <Card label="OpenAI restante"  value={`$${openaiRest}`}      sub={`~${openaiLeft.toLocaleString()} convs`} color={openaiPct>80?'#F59E0B':'#EFF4FF'} />
            <Card label="Conversaciones hoy" value={data?.conversacionesHoy||0} sub="web + WhatsApp" />
            <Card label="Empresas registradas" value={data?.totalEmpresas||0} sub={`${railway?.sesionesActivas||0} con WhatsApp`} />
          </div>
          {railwayDias<=5&&<div style={{ background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,padding:'12px 16px',marginBottom:14,fontSize:13,color:'#FCA5A5' }}>⚠️ Railway vence en {railwayDias} días — recarga en railway.app</div>}
          {railwayDias>5&&railwayDias<=10&&<div style={{ background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,padding:'12px 16px',marginBottom:14,fontSize:13,color:'#FCD34D' }}>⏰ Railway: ~{railwayDias} días. Planifica recarga.</div>}
          {openaiPct>80&&<div style={{ background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,padding:'12px 16px',marginBottom:14,fontSize:13,color:'#FCD34D' }}>⚠️ OpenAI al {openaiPct}% — recarga en platform.openai.com</div>}
          {railwayDias>10&&openaiPct<=80&&<div style={{ background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#6EE7B7' }}>✅ Todos los servicios operando normalmente</div>}
        </div>
      )}

      {/* SERVICIOS */}
      {tab === 'servicios' && (
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:'20px 24px' }}>
          {[
            { name:'Railway',  pct:railwayPct, color:'#e06c00', detail:`$${railwayCostado.toFixed(2)} gastado de $5.00`, sub:`~${railwayDias} días restantes` },
            { name:'OpenAI',   pct:openaiPct,  color:'#10a37f', detail:`$${openaiGastado.toFixed(3)} gastado de $5.00`, sub:`${openaiLeft.toLocaleString()} convs restantes` },
            { name:'Firebase', pct:firebasePct,color:'#FFCA28', detail:`${(data?.lecturasHoy||0).toLocaleString()} lecturas hoy`, sub:'límite: 50,000/día — GRATIS' },
            { name:'Vercel',   pct:2,          color:'#EFF4FF', detail:'Hobby plan', sub:'GRATIS' },
            { name:'WhatsApp', pct:Math.min((railway?.sesionesActivas||0)*20,100), color:'#25D366', detail:`${railway?.sesionesActivas||0} sesión(es) activa(s)`, sub:'via Baileys — sin costo' },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:i<4?`1px solid ${BORDER}`:'none' }}>
              <div style={{ width:100, fontSize:14, fontWeight:600 }}>{s.name}</div>
              <Bar pct={s.pct} color={s.color} />
              <div style={{ width:40, fontSize:13, color:'#8A9BB5', textAlign:'right' }}>{s.pct}%</div>
              <div style={{ width:220, fontSize:12, color:'#6B7A99' }}>
                <div>{s.detail}</div>
                <div style={{ color:'#4B6080', marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPRESAS */}
      {tab === 'empresas' && (
        <div>
          {/* Contadores */}
          <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:'12px 20px', display:'flex', gap:24 }}>
              {[
                { val: data?.totalEmpresas||0,                                                               label:'Total', color:'#EFF4FF' },
                { val: (data?.empresas||[]).filter(e=>e.plan==='profesional'||e.plan==='agencia').length,   label:'Plan pago', color:'#A78BFA' },
                { val: (data?.empresas||[]).filter(e=>e.trialHasta&&new Date(e.trialHasta)>new Date()).length, label:'Trial activo', color:'#10B981' },
                { val: railway?.sesionesActivas||0,                                                          label:'WA activos', color:'#25D366' },
              ].map((s,i,arr) => (
                <div key={i} style={{ display:'flex', gap:24 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:800, color:s.color, letterSpacing:'-0.03em' }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'#4B6080', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
                  </div>
                  {i<arr.length-1&&<div style={{ width:1, background:BORDER }} />}
                </div>
              ))}
            </div>

            {/* Botón limpiar todo */}
            <button onClick={borrarTodas} disabled={borrando==='todas'}
              style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'12px 20px', color:'#EF4444', fontFamily:F, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              {borrando==='todas' ? '⏳ Borrando...' : '🗑 Limpiar todo'}
            </button>
          </div>

          {/* Tabla */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 60px', padding:'12px 20px', background:'#0D1420', fontSize:11, color:'#4B6080', textTransform:'uppercase', letterSpacing:'0.08em', gap:8 }}>
              <div>Empresa</div><div>Industria</div><div>Plan</div><div>Estado</div><div style={{ textAlign:'right' }}>Convs</div><div style={{ textAlign:'center' }}>Borrar</div>
            </div>
            {(data?.empresas||[]).map((e,i) => {
              const trialActivo  = e.trialHasta && new Date(e.trialHasta)>new Date();
              const trialVencido = e.trialHasta && new Date(e.trialHasta)<=new Date();
              const diasTrial    = e.trialHasta ? Math.ceil((new Date(e.trialHasta)-new Date())/86400000) : 0;
              const planColor    = { emprendedor:'#8A9BB5', profesional:'#2B6AFF', agencia:'#A78BFA' }[e.plan]||'#8A9BB5';
              const planLabel    = { emprendedor:'Emprendedor', profesional:'Pro', agencia:'Agencia' }[e.plan]||e.plan;
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 60px', padding:'13px 20px', borderBottom:`1px solid ${BORDER}`, gap:8, alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i%COLORS.length], flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{e.nombre}</div>
                      <div style={{ fontSize:10, color:'#4B6080' }}>{e.id.slice(0,10)}…</div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'#8A9BB5' }}>{e.industria}</div>
                  <div>
                    <span style={{ background:planColor+'18', color:planColor, border:`1px solid ${planColor}30`, borderRadius:100, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{planLabel}</span>
                  </div>
                  <div>
                    {trialActivo&&<span style={{ background:'rgba(16,185,129,0.1)',color:'#10B981',border:'1px solid rgba(16,185,129,0.25)',borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:700,whiteSpace:'nowrap' }}>Trial {diasTrial}d</span>}
                    {trialVencido&&<span style={{ background:'rgba(239,68,68,0.1)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.25)',borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:700 }}>Vencido</span>}
                    {!e.trialHasta&&<span style={{ background:'rgba(43,106,255,0.1)',color:'#6DA4FF',border:'1px solid rgba(43,106,255,0.2)',borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:700 }}>Activo</span>}
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, textAlign:'right' }}>{e.conversaciones}</div>
                  <div style={{ textAlign:'center' }}>
                    <button onClick={() => borrarEmpresa(e.id, e.nombre)} disabled={borrando===e.id}
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, padding:'4px 10px', color:'#EF4444', fontFamily:F, fontSize:11, cursor:'pointer' }}>
                      {borrando===e.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              );
            })}
            {!data?.empresas?.length && (
              <div style={{ padding:'32px', textAlign:'center', color:'#4B6080', fontSize:13 }}>Sin datos</div>
            )}
          </div>
        </div>
      )}

      {/* WASAPBOT */}
      {tab === 'wasapbot' && (
        <WasapBotMetricas />
      )}

      {/* PROYECCIÓN */}
      {tab === 'proyección' && (
        <div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:'24px', marginBottom:16 }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, color:'#8A9BB5', marginBottom:8 }}>Empresas: <span style={{ color:'#EFF4FF', fontWeight:700 }}>{empSlider}</span></div>
              <input type="range" min="1" max="100" value={empSlider} step="1" onChange={e=>setEmpSlider(Number(e.target.value))} style={{ width:'100%', accentColor:'#2B6AFF' }} />
            </div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:13, color:'#8A9BB5', marginBottom:8 }}>Convs/empresa/día: <span style={{ color:'#EFF4FF', fontWeight:700 }}>{convSlider}</span></div>
              <input type="range" min="1" max="200" value={convSlider} step="1" onChange={e=>setConvSlider(Number(e.target.value))} style={{ width:'100%', accentColor:'#2B6AFF' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              <Card label="OpenAI/mes"   value={`$${openaiCost30.toFixed(2)}`}  sub={`${convsTotal30.toLocaleString()} convs`} />
              <Card label="Railway/mes"  value="$7.20"                           sub="fijo 24/7" />
              <Card label="Total/mes USD" value={`$${total30.toFixed(2)}`}       sub={`~$${totalCOP.toLocaleString()} COP`} />
            </div>
            <div style={{ marginTop:16, padding:'14px 18px', background:'rgba(43,106,255,0.08)', border:'1px solid rgba(43,106,255,0.2)', borderRadius:12, fontSize:13, color:'#6DA4FF' }}>
              Precio mínimo por empresa: <strong style={{ color:'#EFF4FF' }}>${breakeven.toLocaleString()} COP/mes</strong>.
              {' '}Con {empSlider} empresas a $149.000 = ${(empSlider*149000).toLocaleString()} COP ingreso vs ${totalCOP.toLocaleString()} COP costo → margen del {Math.round((1-totalCOP/(empSlider*149000))*100)}%.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
