// pages/wasapbot/panel/pedidos/[id].js
// Panel de pedidos del día para WasapBot
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import GuiaWasapbot from '../../../../components/GuiaWasapbot';

const TourGuia = dynamic(() => import('../../../../components/TourGuia'), { ssr: false });

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

function hoyStr() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtHora(ts) {
  if (!ts) return '';
  const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
function fmtFecha(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${meses[Number(m)-1]} ${y}`;
}
function fmtP(n) { return Number(n||0).toLocaleString('es-CO'); }

const ESTADOS = {
  pendiente:  { label:'Pendiente',  color:'#F59E0B', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)'  },
  preparando: { label:'Preparando', color:'#60A5FA', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.3)'  },
  listo:      { label:'Listo',      color:'#A78BFA', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)' },
  entregado:  { label:'Entregado',  color:'#25D366', bg:'rgba(37,211,102,0.1)',  border:'rgba(37,211,102,0.3)'  },
  cancelado:  { label:'Cancelado',  color:'#EF4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)'   },
};

const FLUJO = { pendiente:'preparando', preparando:'listo', listo:'entregado' };

export default function PedidosPanel() {
  const router = useRouter();
  const { id } = router.query;

  const [fecha,       setFecha]       = useState(hoyStr());
  const [pedidos,     setPedidos]     = useState([]);
  const [empresa,     setEmpresa]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [filtroEst,   setFiltroEst]   = useState('todos');
  const [savingId,    setSavingId]    = useState(null);
  const [nequi,       setNequi]       = useState('');
  const [editNequi,   setEditNequi]   = useState(false);
  const [savingNequi, setSavingNequi] = useState(false);

  const [sinPlan, setSinPlan] = useState(false);
  const cargarEmpresa = useCallback(async () => {
    if (!id) return;
    try {
      const r = await fetch(`/api/wasapbot-panel?id=${id}`);
      const d = await r.json();
      if (d.ok) {
        setEmpresa(d.empresa);
        setNequi(d.empresa?.nequi || '');
        if (!d.empresa?.planActivo) setSinPlan(true);
      }
    } catch {}
  }, [id]);

  const cargarPedidos = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/wasapbot-pedido?id=${id}&fecha=${fecha}`);
      const d = await r.json();
      if (d.ok) setPedidos(d.pedidos || []);
    } catch {}
    setLoading(false);
  }, [id, fecha]);

  useEffect(() => { if (!id) return; cargarEmpresa(); }, [id]);
  useEffect(() => { if (id) cargarPedidos(); }, [id, fecha]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const t = setInterval(() => { if (id) cargarPedidos(); }, 30000);
    return () => clearInterval(t);
  }, [id, fecha]);

  const avanzarEstado = async (pedidoId, estadoActual) => {
    const nuevoEstado = FLUJO[estadoActual];
    if (!nuevoEstado) return;
    setSavingId(pedidoId);
    try {
      await fetch('/api/wasapbot-pedido', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: id, pedidoId, estado: nuevoEstado }),
      });
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
    } catch {}
    setSavingId(null);
  };

  const cancelarPedido = async (pedidoId) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    setSavingId(pedidoId);
    try {
      await fetch('/api/wasapbot-pedido', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: id, pedidoId, estado: 'cancelado' }),
      });
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'cancelado' } : p));
    } catch {}
    setSavingId(null);
  };

  const reabrirPedido = async (pedidoId) => {
    setSavingId(pedidoId);
    try {
      await fetch('/api/wasapbot-pedido', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: id, pedidoId, estado: 'pendiente' }),
      });
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'pendiente' } : p));
    } catch {}
    setSavingId(null);
  };

  const guardarNequi = async () => {
    setSavingNequi(true);
    try {
      await fetch('/api/wasapbot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: id, campos: { nequi } }),
      });
      setEditNequi(false);
    } catch {}
    setSavingNequi(false);
  };

  const pedidosFiltrados = filtroEst === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEst);

  // Stats del día
  const totalVentas   = pedidos.filter(p => p.estado !== 'cancelado').reduce((a, p) => a + Number(p.total || 0), 0);
  const pendientes    = pedidos.filter(p => p.estado === 'pendiente').length;
  const entregados    = pedidos.filter(p => p.estado === 'entregado').length;
  const cancelados    = pedidos.filter(p => p.estado === 'cancelado').length;
  const enProceso     = pedidos.filter(p => ['preparando','listo'].includes(p.estado)).length;

  const CARD = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:18 };
  const INP  = { background:'#06090D', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 10px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' };
  const BS   = { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'7px 14px', fontFamily:F, fontSize:12, cursor:'pointer' };

  return (<>
    <Head><title>Pedidos — {empresa?.nombreEmpresa || 'WasapBot'}</title></Head>
    <style dangerouslySetInnerHTML={{__html:`
      body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F}}
      *{box-sizing:border-box}a{text-decoration:none;color:inherit}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      .filtro{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:99px;padding:5px 14px;font-family:${F};font-size:11px;font-weight:600;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;white-space:nowrap}
      .filtro:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.65)}
      .filtro.on{background:rgba(37,211,102,.1);border-color:rgba(37,211,102,.35);color:#6EF0A0}
      .pedido-card{background:#0C0F14;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px 18px;margin-bottom:10px;animation:fadeIn .25s ease both;transition:border .15s}
      .pedido-card:hover{border-color:rgba(255,255,255,.12)}
      .btn-accion{border:none;border-radius:8px;padding:7px 14px;font-family:${F};font-size:11px;font-weight:700;cursor:pointer;transition:all .15s}
      .btn-accion:hover{opacity:.85;transform:translateY(-1px)}
      .btn-accion:disabled{opacity:.4;cursor:not-allowed;transform:none}
      input[type=date]{color-scheme:dark}
    `}}/>

    {/* NAV */}
    <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontFamily:FA,fontSize:16}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span>
        <span style={{color:'rgba(255,255,255,.15)'}}>|</span>
        <span style={{fontFamily:F,fontSize:13,fontWeight:600}}>{empresa?.nombreEmpresa || '...'} — Pedidos</span>
        {pendientes > 0 && (
          <span style={{background:'rgba(245,158,11,.15)',color:'#F59E0B',borderRadius:99,padding:'2px 10px',fontFamily:F,fontSize:10,fontWeight:700,animation:'pulse 2s ease infinite'}}>
            🔔 {pendientes} nuevo{pendientes>1?'s':''}
          </span>
        )}
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <Link href={`/wasapbot/panel/${id}`} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>← Panel</Link>
        <button onClick={cargarPedidos} style={BS}>↻</button>
      </div>
    </nav>

    <div style={{maxWidth:960,margin:'0 auto',padding:'20px'}}>

      {/* Selector fecha */}
      <div data-tour="ped-fecha" style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,flexWrap:'wrap'}}>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{...INP,padding:'7px 12px',cursor:'pointer'}}/>
        <span style={{fontFamily:F,fontSize:13,color:'#25D366',fontWeight:600}}>
          {fecha === hoyStr() ? 'Hoy' : fmtFecha(fecha)}
        </span>
        <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.3)'}}>— {pedidos.length} pedido{pedidos.length!==1?'s':''}</span>
      </div>

      {/* Stats */}
      <div data-tour="ped-stats" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
        {[
          {label:'Total ventas', val:`$${fmtP(totalVentas)}`, color:'#25D366', icon:'💰', big:true},
          {label:'Pendientes',   val:pendientes,  color:'#F59E0B', icon:'🔔'},
          {label:'En proceso',   val:enProceso,   color:'#60A5FA', icon:'⏳'},
          {label:'Entregados',   val:entregados,  color:'#25D366', icon:'✅'},
          {label:'Cancelados',   val:cancelados,  color:'#EF4444', icon:'❌'},
        ].map((s,i)=>(
          <div key={i} style={{...CARD,textAlign:'center',padding:'12px 8px'}}>
            <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
            <div style={{fontFamily:FA,fontSize:s.big?18:22,color:s.color,letterSpacing:s.big?'-0.5px':'-1px',marginBottom:2}}>{s.val}</div>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Nequi config */}
      <GuiaWasapbot visible={!nequi} icono="💳"
        texto="Configura aquí tu número de Nequi: el bot lo incluye automáticamente en el mensaje de confirmación que recibe el cliente cuando hace un pedido por WhatsApp, para que pueda pagar de una vez."/>
      <div data-tour="ped-nequi" style={{...CARD,marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontSize:18}}>💳</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF',marginBottom:2}}>Número Nequi para pagos</div>
          {editNequi ? (
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <input value={nequi} onChange={e=>setNequi(e.target.value)} placeholder="Ej: 3001234567"
                style={{...INP,width:160}} onKeyDown={e=>e.key==='Enter'&&guardarNequi()}/>
              <button onClick={guardarNequi} disabled={savingNequi}
                style={{background:'#25D366',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontFamily:F,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                {savingNequi?'Guardando...':'Guardar'}
              </button>
              <button onClick={()=>setEditNequi(false)} style={BS}>Cancelar</button>
            </div>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:F,fontSize:13,color:nequi?'#EFF4FF':'rgba(255,255,255,.3)'}}>
                {nequi || 'Sin número configurado'}
              </span>
              <button onClick={()=>setEditNequi(true)} style={{...BS,padding:'4px 10px',fontSize:11}}>Editar</button>
            </div>
          )}
        </div>
        <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)',maxWidth:220,lineHeight:1.5}}>
          Este número aparece en el mensaje de confirmación del pedido al cliente.
        </div>
      </div>

      {/* Candado si no hay plan */}
      {sinPlan&&(
        <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.25)',borderRadius:16,padding:'32px 24px',marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>🔒</div>
          <div style={{fontFamily:"'Abril Fatface',serif",fontSize:22,color:'#EFF4FF',marginBottom:8,fontWeight:400}}>Función premium</div>
          <div style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.7,marginBottom:20,maxWidth:360,margin:'0 auto 20px'}}>
            Los pedidos de tus clientes por WhatsApp aparecerán aquí cuando actives tu plan. El bot puede recibir mensajes pero necesita el plan para procesarlos.
          </div>
          <a href={'/wasapbot/planes?id='+id}
            style={{display:'inline-block',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:10,padding:'12px 28px',fontFamily:"'Inter',system-ui,sans-serif",fontSize:14,fontWeight:700,textDecoration:'none'}}>
            ⚡ Activar mi plan →
          </a>
        </div>
      )}

      {/* Filtros */}
      {!sinPlan&&<>
      <div data-tour="ped-filtros" style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {[
          {key:'todos',      label:'Todos'},
          {key:'pendiente',  label:'Pendientes'},
          {key:'preparando', label:'Preparando'},
          {key:'listo',      label:'Listos'},
          {key:'entregado',  label:'Entregados'},
          {key:'cancelado',  label:'Cancelados'},
        ].map(f=>(
          <button key={f.key} className={`filtro${filtroEst===f.key?' on':''}`} onClick={()=>setFiltroEst(f.key)}>
            {f.label}
            {f.key!=='todos'&&<span style={{marginLeft:4,opacity:.6}}>
              ({pedidos.filter(p=>p.estado===f.key).length})
            </span>}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div style={{textAlign:'center',padding:'60px 0'}}>
          <div style={{width:36,height:36,border:'3px solid rgba(37,211,102,.1)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={{...CARD,textAlign:'center',padding:'48px 20px'}}>
          <div style={{fontSize:48,marginBottom:12}}>🛒</div>
          <div style={{fontFamily:F,fontSize:15,fontWeight:600,color:'#EFF4FF',marginBottom:8}}>
            {filtroEst==='todos' ? 'Sin pedidos aún' : `Sin pedidos ${ESTADOS[filtroEst]?.label?.toLowerCase()||filtroEst}`}
          </div>
          <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.3)'}}>
            {filtroEst==='todos' ? 'Los pedidos de los clientes por WhatsApp aparecerán aquí en tiempo real.' : 'Prueba otro filtro.'}
          </div>
        </div>
      ) : (
        <div>
          {pedidosFiltrados.map((pedido, i) => {
            const est     = ESTADOS[pedido.estado] || ESTADOS.pendiente;
            const saving  = savingId === pedido.id;
            const siguienteEst = FLUJO[pedido.estado];
            const esCancelado  = pedido.estado === 'cancelado';
            const esEntregado  = pedido.estado === 'entregado';
            const total   = Number(pedido.total || 0);

            return (
              <div key={pedido.id||i} className="pedido-card">
                <div style={{display:'flex',alignItems:'flex-start',gap:14,flexWrap:'wrap'}}>

                  {/* Número de pedido */}
                  <div style={{width:50,height:50,borderRadius:12,background:est.bg,border:`1px solid ${est.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <div style={{fontFamily:F,fontSize:9,color:est.color,fontWeight:700,letterSpacing:0.5}}>#</div>
                    <div style={{fontFamily:FA,fontSize:16,color:est.color,lineHeight:1}}>{(pedido.id||'').slice(-4).toUpperCase()}</div>
                  </div>

                  {/* Info pedido */}
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                      <span style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF'}}>{pedido.nombreCliente||'Cliente'}</span>
                      <span style={{background:est.bg,color:est.color,border:`1px solid ${est.border}`,borderRadius:99,padding:'2px 10px',fontFamily:F,fontSize:10,fontWeight:700}}>{est.label}</span>
                      {pedido.creadoEn && <span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)'}}>{fmtHora(pedido.creadoEn)}</span>}
                    </div>

                    {/* Items del pedido */}
                    <div style={{marginBottom:6}}>
                      {(pedido.items||[]).map((item,j)=>(
                        <div key={j} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.5)',display:'flex',justifyContent:'space-between',maxWidth:360}}>
                          <span>{item.cantidad}x {item.nombre}</span>
                          <span style={{color:'rgba(255,255,255,.3)'}}>
                            {item.precio>0?`$${fmtP(Number(item.precio)*item.cantidad)}`:''}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                      <span style={{fontFamily:FA,fontSize:16,color:'#25D366'}}>${fmtP(total)} COP</span>
                      {pedido.telefono && (
                        <a href={`https://wa.me/${pedido.telefono}`} target="_blank" rel="noreferrer"
                          style={{fontFamily:F,fontSize:11,color:'#25D366',display:'flex',alignItems:'center',gap:4}}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                          +{pedido.telefono}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{display:'flex',gap:6,flexShrink:0,flexWrap:'wrap',alignItems:'flex-start'}}>
                    {siguienteEst && !esCancelado && (
                      <button className="btn-accion" disabled={saving} onClick={()=>avanzarEstado(pedido.id,pedido.estado)}
                        style={{background:`rgba(${pedido.estado==='pendiente'?'96,165,250':pedido.estado==='preparando'?'167,139,250':'37,211,102'},.15)`,
                          color:pedido.estado==='pendiente'?'#60A5FA':pedido.estado==='preparando'?'#A78BFA':'#25D366',
                          border:`1px solid rgba(${pedido.estado==='pendiente'?'96,165,250':pedido.estado==='preparando'?'167,139,250':'37,211,102'},.3)`}}>
                        {saving?'...':pedido.estado==='pendiente'?'▶ Preparar':pedido.estado==='preparando'?'✓ Listo':'🚀 Entregar'}
                      </button>
                    )}
                    {!esCancelado && !esEntregado && (
                      <button className="btn-accion" disabled={saving} onClick={()=>cancelarPedido(pedido.id)}
                        style={{background:'rgba(239,68,68,.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,.2)'}}>
                        {saving?'...':'✕ Cancelar'}
                      </button>
                    )}
                    {(esCancelado || esEntregado) && (
                      <button className="btn-accion" disabled={saving} onClick={()=>reabrirPedido(pedido.id)}
                        style={{background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.4)',border:'1px solid rgba(255,255,255,.08)'}}>
                        {saving?'...':'↩ Reabrir'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>}
    </div>

    <TourGuia
      storageKey={`wasapbot_tour_pedidos_${id}`}
      activo={!!empresa}
      pasos={[
        { selector:'[data-tour="ped-fecha"]', titulo:'Elige el día', icono:'📅',
          texto:'Por defecto ves los pedidos de hoy. Cambia la fecha para revisar pedidos de otro día.' },
        { selector:'[data-tour="ped-stats"]', titulo:'Resumen del día', icono:'💰',
          texto:'Aquí ves el total vendido y cuántos pedidos están pendientes, en proceso, entregados o cancelados — se actualiza solo cada 30 segundos.' },
        { selector:'[data-tour="ped-nequi"]', titulo:'Tu número Nequi', icono:'💳',
          texto:'Escríbelo aquí una sola vez: el bot lo incluye automáticamente en el mensaje de confirmación para que tu cliente pueda pagar el pedido por Nequi de inmediato.' },
        { selector:'[data-tour="ped-filtros"]', titulo:'Sigue el flujo de cada pedido', icono:'🛍️',
          texto:'Usa estos filtros para ver solo los pedidos en cada estado. En cada pedido tienes un botón para avanzarlo: Pendiente → Preparando → Listo → Entregado, o cancelarlo si es necesario.' },
      ]}
    />
  </>);
}
