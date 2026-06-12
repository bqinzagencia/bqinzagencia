// MOVER ESTE ARCHIVO A:
// E:\DATOS\copiacontroltecnologico\nexoia\pages\wasapbot\panel\inventario\[id].js
//
// Comando desde CMD:
// mkdir E:\DATOS\copiacontroltecnologico\nexoia\pages\wasapbot\panel\inventario
// move E:\DATOS\copiacontroltecnologico\nexoia\pages\wasapbot\inventario_id.js E:\DATOS\copiacontroltecnologico\nexoia\pages\wasapbot\panel\inventario\[id].js

// pages/wasapbot/panel/inventario/[id].js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

function hoyStr() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtFecha(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-');
  const dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const fecha = new Date(Number(y), Number(m)-1, Number(d));
  return `${dias[fecha.getDay()]} ${d} ${meses[Number(m)-1]}`;
}

function StockBar({ actual, inicial }) {
  const p = inicial ? Math.round((actual/inicial)*100) : 0;
  const color = p===0?'#EF4444':p<=20?'#F59E0B':p<=50?'#60A5FA':'#25D366';
  return (
    <div style={{marginTop:6}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{fontFamily:F,fontSize:10,color:'rgba(255,255,255,0.35)'}}>{actual} / {inicial} porciones</span>
        <span style={{fontFamily:F,fontSize:10,fontWeight:700,color}}>{p===0?'AGOTADO':`${p}%`}</span>
      </div>
      <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:5,overflow:'hidden'}}>
        <div style={{width:`${p}%`,height:'100%',background:color,borderRadius:3,transition:'width 0.4s ease'}}/>
      </div>
    </div>
  );
}

export default function InventarioPanel() {
  const router = useRouter();
  const { id } = router.query;

  const [tab,        setTab]        = useState('menuDia');
  const [fecha,      setFecha]      = useState(hoyStr());
  const [menuDia,    setMenuDia]    = useState(null);
  const [catalogo,   setCatalogo]   = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [empresa,    setEmpresa]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [savingMsg,  setSavingMsg]  = useState('');
  const [editItems,  setEditItems]  = useState([]);
  const [editando,   setEditando]   = useState(false);
  const [modalPlant, setModalPlant] = useState(false);
  const [nomPlant,   setNomPlant]   = useState('');
  const [savingP,    setSavingP]    = useState(false);
  const [modalCop,   setModalCop]   = useState(false);
  const [fechaCop,   setFechaCop]   = useState('');
  const [modalMov,   setModalMov]   = useState(null);
  const [fechaMov,   setFechaMov]   = useState('');

  const msg = (m, t=3000) => { setSavingMsg(m); setTimeout(()=>setSavingMsg(''),t); };
  const api  = async (body) => fetch('/api/wasapbot-menu-dia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresaId:id,...body})});

  const cargarEmpresa = useCallback(async()=>{
    if(!id)return;
    try{const r=await fetch(`/api/wasapbot-panel?id=${id}`);const d=await r.json();if(d.ok)setEmpresa(d.empresa);}catch{}
  },[id]);

  const cargarMenuDia = useCallback(async(f)=>{
    if(!id)return;
    setLoading(true);
    try{
      const r=await fetch(`/api/wasapbot-menu-dia?empresaId=${id}&fecha=${f||fecha}`);
      const d=await r.json();
      if(d.ok){setMenuDia(d.menuDia);setEditItems(d.menuDia?.items?d.menuDia.items.map(it=>({...it})):[]);}
    }catch{}
    setLoading(false);
  },[id,fecha]);

  const cargarCatalogo = useCallback(async()=>{
    if(!id)return;
    try{const r=await fetch(`/api/wasapbot-menu-dia?empresaId=${id}&tipo=catalogo`);const d=await r.json();if(d.ok)setCatalogo(d.items||[]);}catch{}
  },[id]);

  const cargarPlantillas = useCallback(async()=>{
    if(!id)return;
    try{const r=await fetch(`/api/wasapbot-menu-dia?empresaId=${id}&tipo=plantillas`);const d=await r.json();if(d.ok)setPlantillas(d.plantillas||[]);}catch{}
  },[id]);

  useEffect(()=>{if(!id)return;cargarEmpresa();cargarCatalogo();cargarPlantillas();cargarMenuDia(fecha);},[id]);
  useEffect(()=>{if(id)cargarMenuDia(fecha);},[fecha]);

  const abrirDesdeCatalogo = async()=>{
    if(!catalogo.length)return;
    msg('Abriendo...', 10000);
    const items=catalogo.map((it,i)=>({
      itemId:it.nombre.toLowerCase().replace(/\s+/g,'_'),nombre:it.nombre,foto:it.foto||'',
      precio:it.precio||0,descripcion:it.descripcion||'',categoria:it.categoria||'',
      stockInicial:20,stockActual:20,activo:true,orden:i,
    }));
    const r=await api({accion:'abrirDia',fecha,items});
    const d=await r.json();
    if(d.ok){msg('✓ Menú abierto');await cargarMenuDia(fecha);}else msg('Error: '+d.error);
  };

  const aplicarPlantilla = async(p)=>{
    msg(`Aplicando "${p.nombre}"...`, 10000);
    const items=p.items.map((it,i)=>({...it,stockInicial:it.stockDefault||20,stockActual:it.stockDefault||20,activo:true,orden:i}));
    const r=await api({accion:'abrirDia',fecha,items});
    const d=await r.json();
    if(d.ok){msg('✓ Aplicada');await cargarMenuDia(fecha);}else msg('Error: '+d.error);
  };

  const guardarCambios = async()=>{
    msg('Guardando...', 10000);
    const r=await api({accion:'abrirDia',fecha,items:editItems});
    const d=await r.json();
    if(d.ok){msg('✓ Guardado');setEditando(false);await cargarMenuDia(fecha);}else msg('Error: '+d.error);
  };

  const toggleItem = async(itemId,activo)=>{
    await api({accion:'actualizarItem',fecha,itemId,cambios:{activo}});
    setMenuDia(prev=>prev?{...prev,items:prev.items.map(it=>it.itemId===itemId?{...it,activo}:it)}:prev);
  };

  const resetDia = async()=>{
    if(!confirm('¿Volver al stock inicial?'))return;
    const r=await api({accion:'resetDia',fecha});
    const d=await r.json();
    if(d.ok){msg('✓ Stock reseteado');await cargarMenuDia(fecha);}
  };

  const cerrarDia = async()=>{
    const ab=menuDia?.abierto;
    if(!confirm(ab?'¿Cerrar el menú?':'¿Reabrir el menú?'))return;
    await api({accion:'cerrarDia',fecha});
    await cargarMenuDia(fecha);
  };

  const guardarPlantilla = async()=>{
    if(!nomPlant.trim())return;
    setSavingP(true);
    const r=await api({accion:'guardarPlantilla',nombre:nomPlant,items:editItems.map(it=>({...it,stockDefault:it.stockInicial}))});
    const d=await r.json();
    if(d.ok){setModalPlant(false);setNomPlant('');msg('✓ Plantilla guardada');await cargarPlantillas();}
    setSavingP(false);
  };

  const copiarDia = async()=>{
    if(!fechaCop)return;
    const r=await api({accion:'copiarDia',fechaOrigen:fecha,fechaDestino:fechaCop});
    const d=await r.json();
    if(d.ok){msg(`✓ Copiado a ${fmtFecha(fechaCop)}`);setModalCop(false);setFechaCop('');}
  };

  const moverItem = async()=>{
    if(!fechaMov||!modalMov)return;
    const r=await api({accion:'moverItem',fechaOrigen:fecha,fechaDestino:fechaMov,itemId:modalMov.itemId});
    const d=await r.json();
    if(d.ok){msg(`✓ Copiado a ${fmtFecha(fechaMov)}`);setModalMov(null);setFechaMov('');}
  };

  const eliminarPlantilla = async(pid,nombre)=>{
    if(!confirm(`¿Eliminar "${nombre}"?`))return;
    await api({accion:'eliminarPlantilla',plantillaId:pid});
    await cargarPlantillas();
  };

  const items   = menuDia?.items||[];
  const abierto = menuDia?.abierto===true;
  const agotados= items.filter(i=>i.stockActual===0).length;
  const bajoStk = items.filter(i=>i.stockActual>0&&i.stockActual<=3).length;
  const activos = items.filter(i=>i.activo&&i.stockActual>0).length;

  const CARD={background:'#0C0F14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:18};
  const INP ={background:'#06090D',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px 10px',color:'#EFF4FF',fontFamily:F,fontSize:13,outline:'none',boxSizing:'border-box'};
  const BG  ={background:'#25D366',color:'#fff',border:'none',borderRadius:9,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer'};
  const BS  ={background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9,padding:'8px 16px',fontFamily:F,fontSize:12,cursor:'pointer'};

  return(<>
    <Head><title>Inventario — {empresa?.nombreEmpresa||'WasapBot'}</title></Head>
    <style dangerouslySetInnerHTML={{__html:`
      body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F}}*{box-sizing:border-box}a{text-decoration:none;color:inherit}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .tb{background:transparent;border:none;border-bottom:2px solid transparent;padding:10px 18px;font-family:${F};font-size:13px;cursor:pointer;color:rgba(255,255,255,0.4);transition:all .15s;font-weight:500}
      .tb:hover{color:rgba(255,255,255,.7)}.tb.on{color:#25D366;border-bottom-color:#25D366;font-weight:700}
      .ic{background:#0C0F14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px;margin-bottom:10px;animation:fadeIn .2s ease both;transition:border .15s}
      .ic:hover{border-color:rgba(255,255,255,.13)}.ic.inactivo{opacity:.5}.ic.agotado{border-color:rgba(239,68,68,.3)}.ic.bajo{border-color:rgba(245,158,11,.3)}
      .tog{position:relative;display:inline-block;width:38px;height:20px;cursor:pointer}
      .tog input{opacity:0;width:0;height:0}
      .sl{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,.15);border-radius:20px;transition:.3s}
      .sl:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}
      input:checked+.sl{background:#25D366}input:checked+.sl:before{transform:translateX(18px)}
      .ni{width:60px;text-align:center;background:#06090D;border:1px solid rgba(255,255,255,.15);border-radius:7px;padding:5px;color:#EFF4FF;font-family:${F};font-size:14px;font-weight:700;outline:none}
      .nb{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;width:26px;height:26px;color:#EFF4FF;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700}
      .nb:hover{background:rgba(255,255,255,.14)}
      .mbo{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
      .mdi{background:#0C0F14;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px;width:100%;max-width:420px;animation:fadeIn .2s ease}
      .bdg{border-radius:99px;padding:2px 10px;font-family:${F};font-size:10px;font-weight:700;display:inline-block}
      input[type=date]{color-scheme:dark}
    `}}/>

    <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontFamily:FA,fontSize:16}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span>
        <span style={{color:'rgba(255,255,255,.15)'}}>|</span>
        <span style={{fontFamily:F,fontSize:13,fontWeight:600}}>{empresa?.nombreEmpresa||'...'} — Inventario</span>
        {bajoStk>0&&<span className="bdg" style={{background:'rgba(245,158,11,.15)',color:'#F59E0B'}}>⚠️ {bajoStk} bajo stock</span>}
        {agotados>0&&<span className="bdg" style={{background:'rgba(239,68,68,.15)',color:'#EF4444'}}>🔴 {agotados} agotado{agotados>1?'s':''}</span>}
        {savingMsg&&<span style={{fontFamily:F,fontSize:12,color:savingMsg.startsWith('✓')?'#25D366':savingMsg.startsWith('Error')?'#EF4444':'#F59E0B'}}>{savingMsg}</span>}
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <Link href={`/wasapbot/panel/${id}`} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>← Panel</Link>
        <button onClick={()=>cargarMenuDia(fecha)} style={BS}>↻</button>
      </div>
    </nav>

    <div style={{maxWidth:960,margin:'0 auto',padding:'20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,flexWrap:'wrap'}}>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{...INP,padding:'7px 12px',cursor:'pointer'}}/>
        <span style={{fontFamily:F,fontSize:13,color:'#25D366',fontWeight:600}}>{fmtFecha(fecha)}{fecha===hoyStr()?' (hoy)':''}</span>
        {menuDia&&<span className="bdg" style={abierto?{background:'rgba(37,211,102,.1)',color:'#25D366'}:{background:'rgba(107,114,128,.1)',color:'#9CA3AF'}}>{abierto?'🟢 Abierto':'⭕ Cerrado'}</span>}
      </div>

      {menuDia&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
          {[{l:'Disponibles',v:activos,c:'#25D366',i:'✅'},{l:'Bajo stock',v:bajoStk,c:'#F59E0B',i:'⚠️'},{l:'Agotados',v:agotados,c:'#EF4444',i:'🔴'},{l:'Total',v:items.length,c:'#EFF4FF',i:'📋'}].map((s,i)=>(
            <div key={i} style={{...CARD,textAlign:'center',padding:'12px 8px'}}>
              <div style={{fontSize:18,marginBottom:3}}>{s.i}</div>
              <div style={{fontFamily:FA,fontSize:24,color:s.c}}>{s.v}</div>
              <div style={{fontFamily:F,fontSize:10,color:'#4B6080',textTransform:'uppercase',letterSpacing:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{borderBottom:'1px solid rgba(255,255,255,.07)',marginBottom:18,display:'flex'}}>
        {[{k:'menuDia',l:'📅 Menú del día'},{k:'plantillas',l:'📋 Plantillas'}].map(t=>(
          <button key={t.k} className={`tb${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {tab==='menuDia'&&(
        <div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {!menuDia?(
              <>
                <button onClick={abrirDesdeCatalogo} style={BG}>🍽️ Abrir desde catálogo</button>
                {plantillas.map(p=>(<button key={p.id} onClick={()=>aplicarPlantilla(p)} style={{...BS,color:'#60A5FA',borderColor:'rgba(96,165,250,.25)',background:'rgba(96,165,250,.06)'}}>📋 {p.nombre}</button>))}
              </>
            ):(
              <>
                {!editando?<button onClick={()=>{setEditItems(items.map(it=>({...it})));setEditando(true);}} style={BG}>✏️ Editar stock</button>
                :<><button onClick={guardarCambios} style={BG}>💾 Guardar</button><button onClick={()=>setEditando(false)} style={BS}>Cancelar</button></>}
                <button onClick={()=>setModalPlant(true)} style={BS}>💾 Guardar como plantilla</button>
                <button onClick={()=>setModalCop(true)} style={BS}>📅 Copiar a otro día</button>
                <button onClick={resetDia} style={{...BS,color:'#60A5FA'}}>↺ Reset stock</button>
                <button onClick={cerrarDia} style={{...BS,color:abierto?'#EF4444':'#25D366'}}>{abierto?'⭕ Cerrar':'🟢 Reabrir'}</button>
              </>
            )}
          </div>

          {menuDia&&plantillas.length>0&&!editando&&(
            <div style={{background:'rgba(96,165,250,.05)',border:'1px solid rgba(96,165,250,.15)',borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontFamily:F,fontSize:12,color:'#60A5FA',fontWeight:600}}>📋 Cambiar a:</span>
              {plantillas.map(p=>(<button key={p.id} onClick={()=>{if(confirm(`¿Reemplazar con "${p.nombre}"?`))aplicarPlantilla(p);}} style={{background:'rgba(96,165,250,.1)',border:'1px solid rgba(96,165,250,.25)',borderRadius:7,padding:'4px 12px',fontFamily:F,fontSize:11,fontWeight:600,color:'#60A5FA',cursor:'pointer'}}>{p.nombre}</button>))}
            </div>
          )}

          {!menuDia&&!loading&&(
            <div style={{...CARD,textAlign:'center',padding:'48px 20px'}}>
              <div style={{fontSize:48,marginBottom:12}}>🍽️</div>
              <div style={{fontFamily:F,fontSize:15,fontWeight:600,color:'#EFF4FF',marginBottom:8}}>Sin menú para {fmtFecha(fecha)}</div>
              <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.3)',maxWidth:400,margin:'0 auto'}}>
                Abre el menú del día desde el catálogo base o aplica una plantilla guardada.
              </div>
            </div>
          )}

          {menuDia&&!editando&&(
            <div>
              {[...items].sort((a,b)=>(a.orden||0)-(b.orden||0)).map(item=>{
                const ag=item.stockActual===0,bj=item.stockActual>0&&item.stockActual<=3;
                const cl=!item.activo?'ic inactivo':ag?'ic agotado':bj?'ic bajo':'ic';
                return(<div key={item.itemId} className={cl}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    {item.foto&&<img src={item.foto} alt="" style={{width:52,height:52,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                        <span style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF'}}>{item.nombre}</span>
                        {ag&&<span className="bdg" style={{background:'rgba(239,68,68,.15)',color:'#EF4444'}}>AGOTADO</span>}
                        {bj&&<span className="bdg" style={{background:'rgba(245,158,11,.15)',color:'#F59E0B'}}>⚠️ BAJO</span>}
                        {!item.activo&&!ag&&<span className="bdg" style={{background:'rgba(107,114,128,.1)',color:'#6B7280'}}>INACTIVO</span>}
                        {item.precio>0&&<span style={{fontFamily:F,fontSize:12,color:'#25D366'}}>${Number(item.precio).toLocaleString('es-CO')}</span>}
                      </div>
                      {item.descripcion&&<div style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)',marginBottom:4}}>{item.descripcion}</div>}
                      <StockBar actual={item.stockActual} inicial={item.stockInicial}/>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0,alignItems:'flex-end'}}>
                      <label className="tog"><input type="checkbox" checked={item.activo} onChange={e=>toggleItem(item.itemId,e.target.checked)}/><span className="sl"/></label>
                      <button onClick={()=>{setModalMov(item);setFechaMov('');}} style={{background:'none',border:'1px solid rgba(255,255,255,.08)',borderRadius:6,padding:'3px 8px',fontFamily:F,fontSize:10,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>📅 Copiar a...</button>
                    </div>
                  </div>
                </div>);
              })}
            </div>
          )}

          {menuDia&&editando&&(
            <div>
              <div style={{background:'rgba(37,211,102,.05)',border:'1px solid rgba(37,211,102,.15)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
                <span style={{fontFamily:F,fontSize:12,color:'#25D366'}}>📝 Ajusta las porciones. El bot solo muestra ítems con stock &gt; 0 y activos.</span>
              </div>
              {editItems.map((item,idx)=>(
                <div key={item.itemId} style={{...CARD,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                    {item.foto&&<img src={item.foto} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
                    <div style={{flex:1,minWidth:140}}>
                      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:2}}>{item.nombre}</div>
                      {item.precio>0&&<div style={{fontFamily:F,fontSize:12,color:'#25D366'}}>${Number(item.precio).toLocaleString('es-CO')}</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'center'}}>
                      <div style={{fontFamily:F,fontSize:10,color:'#4B6080'}}>PORCIONES</div>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <button className="nb" onClick={()=>setEditItems(p=>p.map((it,i)=>i===idx?{...it,stockInicial:Math.max(0,(it.stockInicial||0)-1),stockActual:Math.max(0,(it.stockActual||0)-1)}:it))}>−</button>
                        <input className="ni" type="number" min="0" max="999" value={item.stockInicial||0}
                          onChange={e=>{const v=Math.max(0,parseInt(e.target.value)||0);setEditItems(p=>p.map((it,i)=>i===idx?{...it,stockInicial:v,stockActual:v}:it));}}/>
                        <button className="nb" onClick={()=>setEditItems(p=>p.map((it,i)=>i===idx?{...it,stockInicial:(it.stockInicial||0)+1,stockActual:(it.stockActual||0)+1}:it))}>+</button>
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{fontFamily:F,fontSize:10,color:'#4B6080'}}>ACTIVO</div>
                      <label className="tog"><input type="checkbox" checked={item.activo!==false} onChange={e=>setEditItems(p=>p.map((it,i)=>i===idx?{...it,activo:e.target.checked}:it))}/><span className="sl"/></label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='plantillas'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.4)'}}>Menús guardados para aplicar con un clic.</div>
            {menuDia&&<button onClick={()=>setModalPlant(true)} style={BG}>+ Guardar menú de hoy</button>}
          </div>
          {plantillas.length===0?(
            <div style={{...CARD,textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{fontFamily:F,fontSize:14,color:'#EFF4FF',marginBottom:8}}>Sin plantillas guardadas</div>
              <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.3)'}}>Crea el menú de un día y guárdalo como plantilla para reutilizarlo.</div>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
              {plantillas.map(p=>(
                <div key={p.id} style={CARD}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div style={{fontFamily:FA,fontSize:18,color:'#EFF4FF'}}>{p.nombre}</div>
                    <button onClick={()=>eliminarPlantilla(p.id,p.nombre)} style={{background:'none',border:'none',color:'rgba(239,68,68,.5)',cursor:'pointer',fontSize:14}}>✕</button>
                  </div>
                  <div style={{marginBottom:12}}>
                    {(p.items||[]).slice(0,5).map(it=>(
                      <div key={it.itemId} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                        <span style={{fontFamily:F,fontSize:12,color:'#EFF4FF'}}>{it.nombre}</span>
                        <span style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>{it.stockDefault||0} porciones</span>
                      </div>
                    ))}
                    {(p.items||[]).length>5&&<div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginTop:4}}>+{p.items.length-5} más...</div>}
                  </div>
                  <button onClick={()=>{setFecha(hoyStr());aplicarPlantilla(p);}} style={{...BG,width:'100%',padding:'8px',fontSize:12}}>Aplicar hoy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {modalPlant&&(<div className="mbo" onClick={e=>{if(e.target===e.currentTarget)setModalPlant(false);}}>
      <div className="mdi">
        <div style={{fontFamily:FA,fontSize:20,marginBottom:4}}>Guardar plantilla</div>
        <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:14}}>El menú de {fmtFecha(fecha)} se guardará como plantilla reutilizable.</div>
        <label style={{fontFamily:F,fontSize:11,color:'#4B6080',display:'block',marginBottom:6}}>NOMBRE</label>
        <input value={nomPlant} onChange={e=>setNomPlant(e.target.value)} placeholder="Ej: Menú Lunes, Menú Especial..." style={{...INP,width:'100%',marginBottom:16}} onKeyDown={e=>e.key==='Enter'&&guardarPlantilla()}/>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setModalPlant(false)} style={{...BS,flex:1}}>Cancelar</button>
          <button onClick={guardarPlantilla} disabled={savingP||!nomPlant.trim()} style={{...BG,flex:1,opacity:savingP?0.7:1}}>{savingP?'Guardando...':'Guardar'}</button>
        </div>
      </div>
    </div>)}

    {modalCop&&(<div className="mbo" onClick={e=>{if(e.target===e.currentTarget)setModalCop(false);}}>
      <div className="mdi">
        <div style={{fontFamily:FA,fontSize:20,marginBottom:4}}>Copiar menú a otro día</div>
        <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:14}}>El menú de {fmtFecha(fecha)} se copiará. El stock se reinicia al inicial.</div>
        <label style={{fontFamily:F,fontSize:11,color:'#4B6080',display:'block',marginBottom:6}}>FECHA DESTINO</label>
        <input type="date" value={fechaCop} onChange={e=>setFechaCop(e.target.value)} min={hoyStr()} style={{...INP,width:'100%',marginBottom:16}}/>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setModalCop(false)} style={{...BS,flex:1}}>Cancelar</button>
          <button onClick={copiarDia} disabled={!fechaCop} style={{...BG,flex:1,opacity:!fechaCop?0.5:1}}>Copiar</button>
        </div>
      </div>
    </div>)}

    {modalMov&&(<div className="mbo" onClick={e=>{if(e.target===e.currentTarget)setModalMov(null);}}>
      <div className="mdi">
        <div style={{fontFamily:FA,fontSize:20,marginBottom:4}}>Copiar plato a otro día</div>
        <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:4}}>Plato: <strong style={{color:'#EFF4FF'}}>{modalMov.nombre}</strong></div>
        <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:14}}>Se copiará al menú del día seleccionado con el stock inicial.</div>
        <label style={{fontFamily:F,fontSize:11,color:'#4B6080',display:'block',marginBottom:6}}>FECHA DESTINO</label>
        <input type="date" value={fechaMov} onChange={e=>setFechaMov(e.target.value)} style={{...INP,width:'100%',marginBottom:16}}/>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setModalMov(null)} style={{...BS,flex:1}}>Cancelar</button>
          <button onClick={moverItem} disabled={!fechaMov} style={{...BG,flex:1,opacity:!fechaMov?0.5:1}}>Copiar</button>
        </div>
      </div>
    </div>)}
  </>);
}
