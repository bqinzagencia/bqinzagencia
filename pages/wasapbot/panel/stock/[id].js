// pages/wasapbot/panel/stock/[id].js
// Panel de inventario general por empresa — entradas, salidas, stock y reportes
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { getStockIndustria } from '../../../../lib/stockIndustrias';
import GuiaWasapbot from '../../../../components/GuiaWasapbot';

const TourGuia = dynamic(() => import('../../../../components/TourGuia'), { ssr: false });

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

function hoyStr() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function mesStr() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
}
function fmtP(n) { return Number(n||0).toLocaleString('es-ES'); }
function fmtTs(ts) {
  if (!ts) return '';
  const d = ts._seconds ? new Date(ts._seconds*1000) : new Date(ts);
  return d.toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
}

export default function StockPanel() {
  const router = useRouter();
  const { id } = router.query;

  const [tab,          setTab]          = useState('resumen');
  const [empresa,      setEmpresa]      = useState(null);
  const [sinPlan,      setSinPlan]      = useState(false);
  const [items,        setItems]        = useState([]);
  const [movimientos,  setMovimientos]  = useState([]);
  const [resumenDia,   setResumenDia]   = useState(null);
  const [resumenMes,   setResumenMes]   = useState(null);
  const [alertas,      setAlertas]      = useState({ agotados:[], bajoStock:[] });
  const [fecha,        setFecha]        = useState(hoyStr());
  const [mes,          setMes]          = useState(mesStr());
  const [loading,      setLoading]      = useState(true);
  const [savingMsg,    setSavingMsg]    = useState('');
  const [mostrarInit,  setMostrarInit]  = useState(false);

  // Modales
  const [modalMov,     setModalMov]     = useState(null);
  const [movItems,     setMovItems]     = useState([{ itemId:'', nombre:'', cantidad:1, precioUnitario:0, precioVenta:0, unidad:'unidad' }]);
  const [movNota,      setMovNota]      = useState('');
  const [savingMov,    setSavingMov]    = useState(false);
  const [modalItem,    setModalItem]    = useState(false);
  const [nuevoItem,    setNuevoItem]    = useState({ nombre:'', categoria:'', unidad:'unidad', precioCompra:0, precioVenta:0, stockMinimo:5 });
  const [savingItem,   setSavingItem]   = useState(false);
  const [modalAjuste,  setModalAjuste]  = useState(null);
  const [nuevoStock,   setNuevoStock]   = useState(0);
  const [ajusteNota,   setAjusteNota]   = useState('');

  const msg = (m, t=3500) => { setSavingMsg(m); setTimeout(()=>setSavingMsg(''),t); };
  const api  = (body) => fetch('/api/wasapbot-stock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,...body})});

  const cargarEmpresa = useCallback(async()=>{
    if(!id)return;
    const r = await fetch('/api/wasapbot-panel?id='+id);
    const d = await r.json();
    if(d.ok) {
      setEmpresa(d.empresa);
      if(!d.empresa?.planActivo) setSinPlan(true);
    }
  },[id]);

  const cargarTodo = useCallback(async()=>{
    if(!id)return;
    setLoading(true);
    try {
      const [ri,rm,rd,rmd,ra] = await Promise.all([
        fetch('/api/wasapbot-stock?empresaId='+id+'&tipo=items'),
        fetch('/api/wasapbot-stock?empresaId='+id+'&tipo=movimientos&fecha='+fecha),
        fetch('/api/wasapbot-stock?empresaId='+id+'&tipo=resumen&fecha='+fecha),
        fetch('/api/wasapbot-stock?empresaId='+id+'&tipo=resumenMes&mes='+mes),
        fetch('/api/wasapbot-stock?empresaId='+id+'&tipo=alertas'),
      ]);
      const [di,dm,dd,dmd,da] = await Promise.all([ri.json(),rm.json(),rd.json(),rmd.json(),ra.json()]);
      if(di.ok) setItems(di.items||[]);
      if(dm.ok) setMovimientos(dm.movimientos||[]);
      if(dd.ok) setResumenDia(dd);
      if(dmd.ok) setResumenMes(dmd);
      if(da.ok) setAlertas({ agotados:da.agotados||[], bajoStock:da.bajoStock||[] });
      if(di.ok && (di.items||[]).length===0) setMostrarInit(true);
    } catch{}
    setLoading(false);
  },[id,fecha,mes]);

  useEffect(()=>{ if(!id)return; cargarEmpresa(); },[id]);
  useEffect(()=>{ if(id) cargarTodo(); },[id,fecha,mes]);

  const inicializarIndustria = async()=>{
    if(!empresa)return;
    const cfg = getStockIndustria(empresa.industria||'otro');
    msg('Cargando items...', 10000);
    const r = await api({ accion:'inicializarIndustria', items: cfg.items });
    const d = await r.json();
    if(d.ok){ msg('✓ '+d.total+' items cargados'); setMostrarInit(false); cargarTodo(); }
    else msg('Error: '+d.error);
  };

  const guardarMovimiento = async()=>{
    const itemsValidos = movItems.filter(it=>it.itemId&&it.cantidad>0);
    if(!itemsValidos.length){ alert('Agrega al menos un item con cantidad'); return; }
    setSavingMov(true);
    try {
      const r = await api({
        accion: modalMov,
        items: itemsValidos.map(it=>({
          itemId: it.itemId, nombre: it.nombre, cantidad: Number(it.cantidad),
          precioUnitario: Number(it.precioUnitario||0),
          precioVenta:    Number(it.precioVenta||0),
          precioCompra:   Number(it.precioUnitario||0),
          unidad: it.unidad,
        })),
        nota: movNota,
      });
      const d = await r.json();
      if(d.ok){
        msg(modalMov==='entrada'?'✓ Entrada registrada':'✓ Salida registrada');
        setModalMov(null);
        setMovItems([{itemId:'',nombre:'',cantidad:1,precioUnitario:0,precioVenta:0,unidad:'unidad'}]);
        setMovNota('');
        cargarTodo();
      } else msg('Error: '+d.error);
    } catch{ msg('Error de conexión'); }
    setSavingMov(false);
  };

  const guardarItem = async()=>{
    if(!nuevoItem.nombre.trim()){ alert('Escribe el nombre del item'); return; }
    setSavingItem(true);
    const r = await api({ accion:'guardarItem', item: nuevoItem });
    const d = await r.json();
    if(d.ok){
      msg('✓ Item guardado');
      setModalItem(false);
      setNuevoItem({nombre:'',categoria:'',unidad:'unidad',precioCompra:0,precioVenta:0,stockMinimo:5});
      cargarTodo();
    } else msg('Error: '+d.error);
    setSavingItem(false);
  };

  const guardarAjuste = async()=>{
    if(!modalAjuste)return;
    const r = await api({ accion:'ajusteStock', itemId:modalAjuste.id, stockNuevo:Number(nuevoStock), nota:ajusteNota||'Ajuste manual' });
    const d = await r.json();
    if(d.ok){ msg('✓ Stock ajustado'); setModalAjuste(null); cargarTodo(); }
    else msg('Error: '+d.error);
  };

  const eliminarItem = async(itemId, nombre)=>{
    if(!confirm('¿Eliminar "'+nombre+'" del inventario?'))return;
    const r = await api({ accion:'eliminarItem', itemId });
    const d = await r.json();
    if(d.ok){ msg('✓ Item eliminado'); cargarTodo(); }
  };

  const cfg = empresa ? getStockIndustria(empresa.industria||'otro') : { categorias:[], unidadesComunes:['unidad'], labelInventario:'Inventario', items:[] };

  const itemsPorCategoria = {};
  for(const it of items){
    const cat = it.categoria||'Sin categoría';
    if(!itemsPorCategoria[cat]) itemsPorCategoria[cat]=[];
    itemsPorCategoria[cat].push(it);
  }

  const CARD = {background:'#0C0F14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:18};
  const INP  = {width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px 10px',color:'#EFF4FF',fontFamily:F,fontSize:13,outline:'none',boxSizing:'border-box'};
  const BG   = {background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer'};
  const BS   = {background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,cursor:'pointer'};
  const MB   = {position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20};
  const MD   = {background:'#0C0F14',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:28,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'};

  return(<>
    <Head><title>Inventario — {empresa?.nombreEmpresa||'WasapBot'}</title></Head>
    <style dangerouslySetInnerHTML={{__html:
      `body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F}}*{box-sizing:border-box}a{text-decoration:none;color:inherit}` +
      `@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}` +
      `@keyframes spin{to{transform:rotate(360deg)}}` +
      `.tb{background:transparent;border:none;border-bottom:2px solid transparent;padding:10px 18px;font-family:${F};font-size:13px;cursor:pointer;color:rgba(255,255,255,0.4);transition:all .15s;font-weight:500}` +
      `.tb:hover{color:rgba(255,255,255,.7)}.tb.on{color:#25D366;border-bottom-color:#25D366;font-weight:700}` +
      `.badge{border-radius:99px;padding:2px 10px;font-family:${F};font-size:10px;font-weight:700;display:inline-block}` +
      `input[type=date],input[type=month]{color-scheme:dark}select option{background:#0E1118}`
    }}/>

    {/* NAV */}
    <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontFamily:FA,fontSize:16}}>BQinz<span style={{color:'#FF6B00'}}>agenc</span>IA</span>
        <span style={{color:'rgba(255,255,255,.15)'}}>|</span>
        <span style={{fontFamily:F,fontSize:13,fontWeight:600}}>{empresa?.nombreEmpresa||'...'} — {cfg.labelInventario||'Inventario'}</span>
        {alertas.agotados.length>0&&<span className="badge" style={{background:'rgba(239,68,68,.15)',color:'#EF4444'}}>🔴 {alertas.agotados.length} agotados</span>}
        {alertas.bajoStock.length>0&&<span className="badge" style={{background:'rgba(245,158,11,.15)',color:'#F59E0B'}}>⚠️ {alertas.bajoStock.length} bajo mínimo</span>}
        {savingMsg&&<span style={{fontFamily:F,fontSize:12,color:savingMsg.startsWith('✓')?'#25D366':'#EF4444'}}>{savingMsg}</span>}
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <Link href={`/wasapbot/panel/${id}`} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>← Panel</Link>
        <button onClick={cargarTodo} style={BS}>↻</button>
      </div>
    </nav>

    <div style={{maxWidth:1100,margin:'0 auto',padding:'20px'}}>

      {/* Candado si no hay plan */}
      {sinPlan&&(
        <div style={{background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.25)',borderRadius:16,padding:'40px 24px',marginBottom:24,textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:16}}>🔒</div>
          <div style={{fontFamily:FA,fontSize:26,color:'#EFF4FF',marginBottom:8,fontWeight:400}}>Función premium</div>
          <div style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,.4)',lineHeight:1.8,marginBottom:28,maxWidth:400,margin:'0 auto 28px'}}>
            El inventario y los reportes de ventas requieren un plan activo. Activa tu plan para registrar entradas, salidas y ver tus ganancias diarias.
          </div>
          <a href={`/wasapbot/planes?id=${id}&nombre=${encodeURIComponent(empresa?.nombreEmpresa||'')}`}
            style={{display:'inline-block',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#fff',borderRadius:10,padding:'14px 36px',fontFamily:F,fontSize:15,fontWeight:700,textDecoration:'none',boxShadow:'0 6px 24px rgba(245,158,11,.35)'}}>
            ⚡ Activar mi plan →
          </a>
          <div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.2)',marginTop:12}}>Desde 79€/mes · Sin contratos</div>
        </div>
      )}

      {/* Alerta inicializar */}
      {!sinPlan&&mostrarInit&&empresa&&(
        <div style={{background:'rgba(37,211,102,.06)',border:'1px solid rgba(37,211,102,.2)',borderRadius:14,padding:'18px 22px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:4}}>📦 Tu inventario está vacío</div>
            <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)'}}>
              Cargamos {cfg.items?.length||0} items típicos de {empresa.industria} para que empieces rápido. Puedes editarlos después.
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={inicializarIndustria} style={BG}>⚡ Cargar items sugeridos</button>
            <button onClick={()=>setMostrarInit(false)} style={BS}>Agregar manualmente</button>
          </div>
        </div>
      )}

      {/* Tabs — solo si hay plan */}
      {!sinPlan&&(
        <>
        <div data-tour="stk-tabs" style={{borderBottom:'1px solid rgba(255,255,255,.07)',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex'}}>
            {[{k:'resumen',l:'📊 Resumen'},{k:'items',l:'📦 Stock'},{k:'movimientos',l:'📋 Movimientos'}].map(t=>(
              <button key={t.k} className={`tb${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,paddingBottom:4}}>
            <button onClick={()=>setModalMov('entrada')} style={{...BG,background:'rgba(96,165,250,.15)',color:'#60A5FA',border:'1px solid rgba(96,165,250,.3)',padding:'7px 14px',fontSize:12}}>
              📥 Registrar entrada
            </button>
            <button onClick={()=>setModalMov('salida')} style={{...BG,background:'rgba(239,68,68,.1)',color:'#EF4444',border:'1px solid rgba(239,68,68,.25)',padding:'7px 14px',fontSize:12}}>
              📤 Registrar salida
            </button>
            <button onClick={()=>setModalItem(true)} style={{...BS,fontSize:12}}>+ Nuevo item</button>
          </div>
        </div>

        {loading?(
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{width:36,height:36,border:'3px solid rgba(37,211,102,.1)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/>
          </div>
        ):(
          <>
          {/* ══ RESUMEN ══ */}
          {tab==='resumen'&&(
            <div data-tour="stk-resumen">
              <GuiaWasapbot visible={(resumenDia?.totalMovimientos||0)===0} icono="📊"
                texto="Aquí ves cuánto compraste, cuánto vendiste y tu ganancia del día y del mes. Usa los botones '📥 Registrar entrada' (compras) y '📤 Registrar salida' (ventas) arriba para empezar a llevar el control."/>
              <div style={{display:'flex',gap:12,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>Día:</span>
                  <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{...INP,width:150,padding:'6px 10px',cursor:'pointer'}}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>Mes:</span>
                  <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{...INP,width:150,padding:'6px 10px',cursor:'pointer'}}/>
                </div>
              </div>

              {/* Stats día */}
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Resumen del día</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
                {[
                  {label:'Invertido compras', val:fmtP(resumenDia?.totalEntradas)+'€', color:'#60A5FA', icon:'📥'},
                  {label:'Total en ventas',    val:fmtP(resumenDia?.totalSalidas)+'€',  color:'#25D366', icon:'📤'},
                  {label:'Ganancia bruta',     val:fmtP(resumenDia?.gananciaBruta)+'€', color:(resumenDia?.gananciaBruta||0)>=0?'#25D366':'#EF4444', icon:'💰'},
                  {label:'Movimientos',        val:resumenDia?.totalMovimientos||0,      color:'#EFF4FF', icon:'📋'},
                ].map((s,i)=>(
                  <div key={i} style={{...CARD,textAlign:'center',padding:'14px 10px'}}>
                    <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                    <div style={{fontFamily:FA,fontSize:18,color:s.color,marginBottom:3,letterSpacing:'-0.5px'}}>{s.val}</div>
                    <div style={{fontFamily:F,fontSize:10,color:'#4B6080',textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Stats mes */}
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Resumen del mes</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                {[
                  {label:'Total invertido en compras', val:fmtP(resumenMes?.totalEntradas)+'€', color:'#60A5FA', icon:'📥'},
                  {label:'Total ventas del mes',        val:fmtP(resumenMes?.totalSalidas)+'€',  color:'#25D366', icon:'📤'},
                  {label:'Ganancia bruta del mes',      val:fmtP(resumenMes?.gananciaBruta)+'€', color:(resumenMes?.gananciaBruta||0)>=0?'#25D366':'#EF4444', icon:'💰'},
                ].map((s,i)=>(
                  <div key={i} style={{...CARD,display:'flex',alignItems:'center',gap:14,padding:'16px 18px'}}>
                    <span style={{fontSize:26}}>{s.icon}</span>
                    <div>
                      <div style={{fontFamily:F,fontSize:10,color:'#4B6080',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{s.label}</div>
                      <div style={{fontFamily:FA,fontSize:22,color:s.color,letterSpacing:'-0.5px'}}>{s.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alertas */}
              {(alertas.agotados.length>0||alertas.bajoStock.length>0)&&(
                <div style={CARD}>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>⚠️ Alertas de stock</div>
                  {alertas.agotados.map((it,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                      <span className="badge" style={{background:'rgba(239,68,68,.15)',color:'#EF4444',flexShrink:0}}>AGOTADO</span>
                      <span style={{fontFamily:F,fontSize:13,color:'#EFF4FF',flex:1}}>{it.nombre}</span>
                      <button onClick={()=>{setModalAjuste(it);setNuevoStock(0);setAjusteNota('');}} style={{...BS,padding:'4px 10px',fontSize:11}}>Ajustar</button>
                    </div>
                  ))}
                  {alertas.bajoStock.map((it,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                      <span className="badge" style={{background:'rgba(245,158,11,.15)',color:'#F59E0B',flexShrink:0}}>BAJO: {it.stockActual} {it.unidad}</span>
                      <span style={{fontFamily:F,fontSize:13,color:'#EFF4FF',flex:1}}>{it.nombre}</span>
                      <button onClick={()=>setModalMov('entrada')} style={{...BS,padding:'4px 10px',fontSize:11,color:'#60A5FA'}}>Registrar compra</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ITEMS / STOCK ══ */}
          {tab==='items'&&(
            <div data-tour="stk-items">
              {items.length===0?(
                <div style={{...CARD,textAlign:'center',padding:'48px 20px'}}>
                  <div style={{fontSize:48,marginBottom:12}}>📦</div>
                  <div style={{fontFamily:F,fontSize:15,fontWeight:600,color:'#EFF4FF',marginBottom:16}}>Sin items en el inventario</div>
                  <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={inicializarIndustria} style={BG}>⚡ Cargar items sugeridos</button>
                    <button onClick={()=>setModalItem(true)} style={BS}>+ Agregar manualmente</button>
                  </div>
                </div>
              ):(
                Object.entries(itemsPorCategoria).map(([cat,catItems])=>(
                  <div key={cat} style={{marginBottom:20}}>
                    <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:1,marginBottom:8,padding:'0 4px'}}>
                      {cat} <span style={{opacity:.5}}>({catItems.length})</span>
                    </div>
                    <div style={CARD}>
                      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto',gap:8,padding:'0 0 8px',borderBottom:'1px solid rgba(255,255,255,.06)',marginBottom:4}}>
                        {['Item','Unidad','P. compra','P. venta','Stock',''].map((h,i)=>(
                          <div key={i} style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:.8,textAlign:i>1?'center':'left'}}>{h}</div>
                        ))}
                      </div>
                      {catItems.map(item=>{
                        const agotado = item.stockActual<=0;
                        const bajo    = item.stockActual>0&&item.stockActual<=(item.stockMinimo||5);
                        return(
                          <div key={item.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto',gap:8,alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.04)',opacity:agotado?.6:1}}>
                            <div>
                              <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{item.nombre}</div>
                              {item.stockMinimo>0&&<div style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,.25)'}}>Mín: {item.stockMinimo}</div>}
                            </div>
                            <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.4)',textAlign:'center'}}>{item.unidad}</div>
                            <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.5)',textAlign:'center'}}>{fmtP(item.precioCompra)}€</div>
                            <div style={{fontFamily:F,fontSize:12,color:'#25D366',textAlign:'center'}}>{item.precioVenta>0?fmtP(item.precioVenta)+'€':'-'}</div>
                            <div style={{textAlign:'center'}}>
                              <span style={{fontFamily:FA,fontSize:18,color:agotado?'#EF4444':bajo?'#F59E0B':'#25D366'}}>{item.stockActual||0}</span>
                              {agotado&&<div className="badge" style={{background:'rgba(239,68,68,.15)',color:'#EF4444',marginTop:2}}>Agotado</div>}
                              {bajo&&!agotado&&<div className="badge" style={{background:'rgba(245,158,11,.15)',color:'#F59E0B',marginTop:2}}>Bajo</div>}
                            </div>
                            <div style={{display:'flex',gap:4}}>
                              <button onClick={()=>{setModalAjuste(item);setNuevoStock(item.stockActual||0);setAjusteNota('');}}
                                style={{background:'none',border:'1px solid rgba(255,255,255,.08)',borderRadius:6,padding:'4px 8px',fontFamily:F,fontSize:10,color:'rgba(255,255,255,.4)',cursor:'pointer'}}>
                                Ajustar
                              </button>
                              <button onClick={()=>eliminarItem(item.id,item.nombre)}
                                style={{background:'none',border:'none',color:'rgba(239,68,68,.4)',cursor:'pointer',fontSize:14,padding:'4px 6px'}}>✕</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ MOVIMIENTOS ══ */}
          {tab==='movimientos'&&(
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{...INP,width:160,padding:'6px 10px',cursor:'pointer'}}/>
                <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)'}}>{movimientos.length} movimiento{movimientos.length!==1?'s':''}</span>
              </div>
              {movimientos.length===0?(
                <div style={{...CARD,textAlign:'center',padding:'40px 20px'}}>
                  <div style={{fontSize:40,marginBottom:12}}>📋</div>
                  <div style={{fontFamily:F,fontSize:14,color:'#EFF4FF',marginBottom:6}}>Sin movimientos en esta fecha</div>
                  <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.3)'}}>Registra entradas (compras) o salidas (ventas) con los botones de arriba.</div>
                </div>
              ):(
                <div style={CARD}>
                  {movimientos.map((mov,i)=>{
                    const esEntrada = mov.tipo==='entrada';
                    const esAjuste  = mov.tipo==='ajuste';
                    return(
                      <div key={mov.id||i} style={{padding:'12px 0',borderBottom:i<movimientos.length-1?'1px solid rgba(255,255,255,.05)':'none',animation:'fadeIn .2s ease'}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                          <div style={{width:40,height:40,borderRadius:10,background:esEntrada?'rgba(96,165,250,.1)':esAjuste?'rgba(255,255,255,.04)':'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                            {esEntrada?'📥':esAjuste?'🔧':'📤'}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                              <span className="badge" style={{background:esEntrada?'rgba(96,165,250,.15)':esAjuste?'rgba(255,255,255,.06)':'rgba(239,68,68,.12)',color:esEntrada?'#60A5FA':esAjuste?'rgba(255,255,255,.4)':'#EF4444'}}>
                                {esEntrada?'COMPRA':esAjuste?'AJUSTE':'VENTA'}
                              </span>
                              <span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)'}}>{fmtTs(mov.fecha||mov.creadoEn)}</span>
                              {mov.nota&&<span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.25)',fontStyle:'italic'}}>{mov.nota}</span>}
                            </div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                              {(mov.items||[]).map((it,j)=>(
                                <span key={j} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.5)',background:'rgba(255,255,255,.04)',borderRadius:6,padding:'3px 8px'}}>
                                  {it.cantidad} {it.unidad||''} {it.nombre}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            {!esAjuste&&(
                              <div style={{fontFamily:FA,fontSize:18,color:esEntrada?'#60A5FA':'#25D366',letterSpacing:'-0.5px'}}>
                                {esEntrada?'-':'+'}{fmtP(mov.totalMovimiento)}€
                              </div>
                            )}
                            {!esEntrada&&!esAjuste&&mov.ganancia!=null&&(
                              <div style={{fontFamily:F,fontSize:11,color:mov.ganancia>=0?'#25D366':'#EF4444',marginTop:2}}>
                                Gan: {fmtP(mov.ganancia)}€
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          </>
        )}
        </>
      )}
    </div>

    {/* ══ MODAL MOVIMIENTO ══ */}
    {modalMov&&(
      <div style={MB} onClick={e=>{if(e.target===e.currentTarget)setModalMov(null);}}>
        <div style={MD}>
          <div style={{fontFamily:FA,fontSize:22,marginBottom:4}}>
            {modalMov==='entrada'?'📥 Registrar entrada (compra)':'📤 Registrar salida (venta/uso)'}
          </div>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:20,lineHeight:1.6}}>
            {modalMov==='entrada'
              ? 'Registra los insumos que compraste. El stock aumentará automáticamente.'
              : 'Registra lo que vendiste o usaste. El stock se descontará automáticamente.'}
          </div>

          {movItems.map((it,idx)=>(
            <div key={idx} style={{...CARD,marginBottom:10,padding:14}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:8,marginBottom:8}}>
                <div>
                  <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Item *</label>
                  <select style={{...INP,cursor:'pointer'}} value={it.itemId}
                    onChange={e=>{
                      const sel = items.find(i=>i.id===e.target.value);
                      setMovItems(prev=>prev.map((x,i)=>i===idx?{...x,itemId:e.target.value,nombre:sel?.nombre||'',precioUnitario:sel?.precioCompra||0,precioVenta:sel?.precioVenta||0,unidad:sel?.unidad||'unidad'}:x));
                    }}>
                    <option value="">Seleccionar item...</option>
                    {Object.entries(itemsPorCategoria).map(([cat,catItems])=>(
                      <optgroup key={cat} label={cat}>
                        {catItems.map(i=><option key={i.id} value={i.id}>{i.nombre} (stock: {i.stockActual||0} {i.unidad})</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Cantidad</label>
                  <input type="number" min="0.1" step="0.1" style={INP} value={it.cantidad}
                    onChange={e=>setMovItems(prev=>prev.map((x,i)=>i===idx?{...x,cantidad:e.target.value}:x))}/>
                </div>
                <div>
                  <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>
                    {modalMov==='entrada'?'Precio compra':'Precio venta'}
                  </label>
                  <input type="number" min="0" style={INP}
                    value={modalMov==='entrada'?it.precioUnitario:it.precioVenta}
                    onChange={e=>setMovItems(prev=>prev.map((x,i)=>i===idx?modalMov==='entrada'?{...x,precioUnitario:e.target.value}:{...x,precioVenta:e.target.value}:x))}/>
                </div>
              </div>
              {movItems.length>1&&(
                <button onClick={()=>setMovItems(prev=>prev.filter((_,i)=>i!==idx))}
                  style={{background:'none',border:'none',color:'rgba(239,68,68,.5)',cursor:'pointer',fontSize:12,fontFamily:F}}>
                  ✕ Quitar
                </button>
              )}
            </div>
          ))}

          <button onClick={()=>setMovItems(prev=>[...prev,{itemId:'',nombre:'',cantidad:1,precioUnitario:0,precioVenta:0,unidad:'unidad'}])}
            style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,.1)',borderRadius:8,padding:'8px',fontFamily:F,fontSize:12,color:'rgba(255,255,255,.3)',cursor:'pointer',marginBottom:12}}>
            + Agregar otro item
          </button>

          <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Nota (opcional)</label>
          <input style={{...INP,marginBottom:16}} value={movNota} onChange={e=>setMovNota(e.target.value)}
            placeholder={modalMov==='entrada'?'Ej: Compra en Makro, factura #123':'Ej: Pedido cliente WhatsApp'}/>

          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setModalMov(null)} style={{...BS,flex:1}}>Cancelar</button>
            <button onClick={guardarMovimiento} disabled={savingMov}
              style={{...BG,flex:2,background:modalMov==='entrada'?'linear-gradient(135deg,#60A5FA,#3B82F6)':'linear-gradient(135deg,#25D366,#1DA851)',opacity:savingMov?.7:1}}>
              {savingMov?'Guardando...':modalMov==='entrada'?'✓ Registrar entrada':'✓ Registrar salida'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══ MODAL NUEVO ITEM ══ */}
    {modalItem&&(
      <div style={MB} onClick={e=>{if(e.target===e.currentTarget)setModalItem(false);}}>
        <div style={{...MD,maxWidth:460}}>
          <div style={{fontFamily:FA,fontSize:20,marginBottom:4}}>Agregar nuevo item</div>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:18}}>
            Se agregará al inventario de {empresa?.nombreEmpresa}.
          </div>
          <GuiaWasapbot visible icono="📦"
            texto="Nombre: el insumo o producto (ej: Pollo, Gaseosa 1.5L). Categoría: para agruparlo en tu lista. Unidad: cómo lo mides (unidad, kg, lt...). Precio compra/venta: lo que pagas y lo que cobras por él. Stock mínimo: cuándo te avisamos que se está agotando."/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Nombre *</label>
              <input style={INP} value={nuevoItem.nombre} onChange={e=>setNuevoItem(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Aceite motor 20W50"/>
            </div>
            <div>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Categoría</label>
              <select style={{...INP,cursor:'pointer'}} value={nuevoItem.categoria} onChange={e=>setNuevoItem(p=>({...p,categoria:e.target.value}))}>
                <option value="">Sin categoría</option>
                {(cfg.categorias||[]).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Unidad</label>
              <select style={{...INP,cursor:'pointer'}} value={nuevoItem.unidad} onChange={e=>setNuevoItem(p=>({...p,unidad:e.target.value}))}>
                {(cfg.unidadesComunes||['unidad']).map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Precio compra</label>
              <input type="number" style={INP} value={nuevoItem.precioCompra} onChange={e=>setNuevoItem(p=>({...p,precioCompra:e.target.value}))}/>
            </div>
            <div>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Precio venta</label>
              <input type="number" style={INP} value={nuevoItem.precioVenta} onChange={e=>setNuevoItem(p=>({...p,precioVenta:e.target.value}))}/>
            </div>
            <div>
              <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Stock mínimo (alerta)</label>
              <input type="number" style={INP} value={nuevoItem.stockMinimo} onChange={e=>setNuevoItem(p=>({...p,stockMinimo:e.target.value}))}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button onClick={()=>setModalItem(false)} style={{...BS,flex:1}}>Cancelar</button>
            <button onClick={guardarItem} disabled={savingItem} style={{...BG,flex:2,opacity:savingItem?.7:1}}>
              {savingItem?'Guardando...':'✓ Agregar item'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══ MODAL AJUSTE ══ */}
    {modalAjuste&&(
      <div style={MB} onClick={e=>{if(e.target===e.currentTarget)setModalAjuste(null);}}>
        <div style={{...MD,maxWidth:400}}>
          <div style={{fontFamily:FA,fontSize:20,marginBottom:4}}>Ajustar stock</div>
          <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:4}}>
            Item: <strong style={{color:'#EFF4FF'}}>{modalAjuste.nombre}</strong>
          </div>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:18}}>
            Stock actual: {modalAjuste.stockActual||0} {modalAjuste.unidad}
          </div>
          <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Nuevo stock</label>
          <input type="number" min="0" style={{...INP,marginBottom:10}} value={nuevoStock} onChange={e=>setNuevoStock(e.target.value)}/>
          <label style={{fontFamily:F,fontSize:10,fontWeight:700,color:'#4B6080',display:'block',marginBottom:4,textTransform:'uppercase',letterSpacing:.8}}>Motivo</label>
          <input style={{...INP,marginBottom:18}} value={ajusteNota} onChange={e=>setAjusteNota(e.target.value)} placeholder="Ej: Conteo físico, merma, pérdida..."/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setModalAjuste(null)} style={{...BS,flex:1}}>Cancelar</button>
            <button onClick={guardarAjuste} style={{...BG,flex:2}}>✓ Guardar ajuste</button>
          </div>
        </div>
      </div>
    )}

    <TourGuia
      storageKey={`wasapbot_tour_stock_${id}`}
      activo={!!empresa && !sinPlan}
      pasos={[
        { selector:'[data-tour="stk-tabs"]', titulo:'Resumen, Stock y Movimientos', icono:'📊', accion:()=>setTab('resumen'),
          texto:'Aquí registras tus compras (📥 Entrada) y ventas (📤 Salida) del día, o agregas un producto nuevo con "+ Nuevo item". Las pestañas de arriba te llevan al resumen, al listado de stock y al historial de movimientos.' },
        { selector:'[data-tour="stk-resumen"]', titulo:'Resumen del negocio', icono:'💰', accion:()=>setTab('resumen'),
          texto:'Aquí ves cuánto compraste, cuánto vendiste y tu ganancia del día y del mes — todo se calcula solo con cada movimiento que registres.' },
        { selector:'[data-tour="stk-items"]', titulo:'Tu inventario', icono:'📦', accion:()=>setTab('items'),
          texto:'Aquí ves todos tus productos organizados por categoría: cuánto cuestan, a qué precio los vendes y cuánto stock te queda. Toca "Ajustar" si el conteo real no coincide con el del sistema.' },
      ]}
    />
  </>);
}
