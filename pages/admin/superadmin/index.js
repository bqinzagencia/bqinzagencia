import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SUPERADMIN_UID = 'hs8aIu8mt6TLOlhda6DMR2s9Ir72';
const PLANES = ['starter', 'basico', 'pro', 'emprendedor'];
const PLAN_COLOR = { starter: '#374151', basico: '#1e3a5f', pro: '#4c1d95', emprendedor: '#7c2d12' };

export default function Superadmin() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [tab, setTab] = useState('usuarios');
  const [busqueda, setBusqueda] = useState('');
  const [confirmar, setConfirmar] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPlan, setFiltroPlan] = useState('todos');
  const [ordenar, setOrdenar] = useState('reciente');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== SUPERADMIN_UID) { router.replace('/'); return; }
      setAutorizado(true);
      cargarEmpresas();
    });
    return () => unsub();
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function cargarEmpresas() {
    setCargando(true);
    try {
      const snap = await getDocs(query(collection(db, 'empresas'), orderBy('creadoEn', 'desc')));
      setEmpresas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { showToast('Error cargando datos', 'error'); }
    setCargando(false);
  }

  async function cambiarEstado(id, estado) {
    try {
      await updateDoc(doc(db, 'empresas', id), { estado, updatedAt: new Date() });
      setEmpresas(prev => prev.map(e => e.id === id ? { ...e, estado } : e));
      showToast(`Cuenta ${estado === 'activo' ? 'activada' : 'bloqueada'}`);
    } catch { showToast('Error al cambiar estado', 'error'); }
  }

  async function cambiarPlan(id, plan) {
    try {
      await updateDoc(doc(db, 'empresas', id), { plan, updatedAt: new Date() });
      setEmpresas(prev => prev.map(e => e.id === id ? { ...e, plan } : e));
      showToast(`Plan cambiado a ${plan}`);
    } catch { showToast('Error al cambiar plan', 'error'); }
  }

  async function eliminarEmpresa(id) {
    try {
      await deleteDoc(doc(db, 'empresas', id));
      setEmpresas(prev => prev.filter(e => e.id !== id));
      setConfirmar(null); setDetalle(null);
      showToast('Empresa eliminada');
    } catch { showToast('Error al eliminar', 'error'); }
  }

  const stats = {
    total: empresas.length,
    activos: empresas.filter(e => e.estado === 'activo').length,
    bloqueados: empresas.filter(e => e.estado === 'bloqueado').length,
    pendientes: empresas.filter(e => !e.estado || e.estado === 'pendiente').length,
    whatsappActivos: empresas.filter(e => e.whatsapp?.status === 'connected').length,
    ingresoEstimado: empresas.filter(e => e.estado === 'activo').reduce((a, e) => {
      return a + ({ starter: 0, basico: 49, pro: 99, emprendedor: 199 }[e.plan] || 0);
    }, 0),
  };

  let filtradas = empresas.filter(e => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || (e.email||'').toLowerCase().includes(q) || (e.nombreEmpresa||'').toLowerCase().includes(q) || (e.telefono||'').includes(q);
    const matchEstado = filtroEstado === 'todos' || (filtroEstado === 'pendiente' ? (!e.estado || e.estado === 'pendiente') : e.estado === filtroEstado);
    const matchPlan = filtroPlan === 'todos' || e.plan === filtroPlan;
    return matchQ && matchEstado && matchPlan;
  });
  if (ordenar === 'nombre') filtradas = [...filtradas].sort((a,b) => (a.nombreEmpresa||'').localeCompare(b.nombreEmpresa||''));
  if (ordenar === 'plan') filtradas = [...filtradas].sort((a,b) => PLANES.indexOf(b.plan) - PLANES.indexOf(a.plan));

  if (!autorizado) return null;

  return (
    <div style={s.page}>
      {toast && <div style={{...s.toast, background: toast.type==='error'?'#7f1d1d':'#14532d'}}>{toast.msg}</div>}

      <div style={s.header}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={s.logo}>BQinzAgencIA</div>
          <span style={s.badge}>SUPERADMIN</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={cargarEmpresas} style={s.refreshBtn}>↻ Actualizar</button>
          <button onClick={() => auth.signOut().then(() => router.push('/'))} style={s.logout}>Cerrar sesión</button>
        </div>
      </div>

      <div style={s.container}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h1 style={s.title}>Panel de Control</h1>
          <div style={{color:'#22c55e',fontSize:12,display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:8,height:8,background:'#22c55e',borderRadius:'50%',display:'inline-block'}}></span> En vivo
          </div>
        </div>

        <div style={s.statsGrid}>
          {[
            {label:'Total cuentas', value:stats.total, color:'#FF6B00', icon:'👥'},
            {label:'Activos', value:stats.activos, color:'#22c55e', icon:'✅'},
            {label:'Bloqueados', value:stats.bloqueados, color:'#ef4444', icon:'🚫'},
            {label:'Pendientes', value:stats.pendientes, color:'#f59e0b', icon:'⏳'},
            {label:'WhatsApp activos', value:stats.whatsappActivos, color:'#25d366', icon:'📱'},
            {label:'Ingreso estimado', value:`${stats.ingresoEstimado}€/mes`, color:'#a78bfa', icon:'💰'},
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{fontSize:22,marginBottom:6}}>{st.icon}</div>
              <div style={{...s.statNum,color:st.color}}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={s.tabs}>
          {[{key:'usuarios',label:'👤 Usuarios'},{key:'estadisticas',label:'📊 Estadísticas'},{key:'crm',label:'🗂 CRM'}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{...s.tab,...(tab===t.key?s.tabActive:{})}}>{t.label}</button>
          ))}
        </div>

        {tab === 'usuarios' && (
          <>
            <div style={s.filtrosRow}>
              <input placeholder="🔍 Buscar por email, empresa o teléfono..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={s.search}/>
              <select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value)} style={s.filterSelect}>
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="bloqueado">Bloqueados</option>
                <option value="pendiente">Pendientes</option>
              </select>
              <select value={filtroPlan} onChange={e=>setFiltroPlan(e.target.value)} style={s.filterSelect}>
                <option value="todos">Todos los planes</option>
                {PLANES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <select value={ordenar} onChange={e=>setOrdenar(e.target.value)} style={s.filterSelect}>
                <option value="reciente">Más recientes</option>
                <option value="nombre">Por nombre</option>
                <option value="plan">Por plan</option>
              </select>
            </div>
            <div style={{color:'#6b7280',fontSize:12,marginBottom:12}}>Mostrando {filtradas.length} de {empresas.length} empresas</div>
            <div style={s.tableWrap}>
              {cargando ? <div style={s.empty}>⏳ Cargando...</div> : filtradas.length===0 ? <div style={s.empty}>Sin resultados</div> : (
                <table style={s.table}>
                  <thead><tr>{['Empresa','Email','Teléfono','Plan','Estado','WhatsApp','Registro','Acciones'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtradas.map(e=>(
                      <tr key={e.id} style={s.tr}>
                        <td style={s.td}><button onClick={()=>setDetalle(e)} style={s.linkBtn}>{e.nombreEmpresa||'—'}</button></td>
                        <td style={s.td}>{e.email||'—'}</td>
                        <td style={s.td}>{e.telefono||'—'}</td>
                        <td style={s.td}>
                          <select value={e.plan||'starter'} onChange={ev=>cambiarPlan(e.id,ev.target.value)} style={{...s.select,background:PLAN_COLOR[e.plan]||'#374151'}}>
                            {PLANES.map(p=><option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td style={s.td}>
                          <span style={{...s.pill,background:e.estado==='activo'?'#14532d':e.estado==='bloqueado'?'#7f1d1d':'#374151'}}>
                            {e.estado==='activo'?'✅ Activo':e.estado==='bloqueado'?'🚫 Bloqueado':'⏳ Pendiente'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{...s.pill,background:e.whatsapp?.status==='connected'?'#14532d':'#374151'}}>
                            {e.whatsapp?.status==='connected'?'📱 Conectado':'⭕ No'}
                          </span>
                        </td>
                        <td style={s.td}><span style={{color:'#6b7280',fontSize:12}}>{e.creadoEn?.toDate?e.creadoEn.toDate().toLocaleDateString('es-ES'):'—'}</span></td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            {e.estado!=='activo'&&<button onClick={()=>cambiarEstado(e.id,'activo')} style={{...s.btn,background:'#14532d'}} title="Activar">✅</button>}
                            {e.estado!=='bloqueado'&&<button onClick={()=>cambiarEstado(e.id,'bloqueado')} style={{...s.btn,background:'#92400e'}} title="Bloquear">🚫</button>}
                            <button onClick={()=>setDetalle(e)} style={{...s.btn,background:'#1e3a5f'}} title="Ver">👁</button>
                            <button onClick={()=>setConfirmar(e.id)} style={{...s.btn,background:'#7f1d1d'}} title="Eliminar">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === 'estadisticas' && (
          <div>
            <div style={s.statsGrid}>
              {PLANES.map(p=>({label:`Plan ${p}`,total:empresas.filter(e=>e.plan===p).length,activos:empresas.filter(e=>e.plan===p&&e.estado==='activo').length})).map(st=>(
                <div key={st.label} style={s.statCard}>
                  <div style={{...s.statNum,color:'#FF6B00'}}>{st.total}</div>
                  <div style={s.statLabel}>{st.label}</div>
                  <div style={{color:'#22c55e',fontSize:12,marginTop:4}}>{st.activos} activos</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:20}}>
              <div style={s.statCard}>
                <h3 style={{color:'white',marginBottom:16,fontSize:15}}>Distribución por estado</h3>
                {[{label:'Activos',value:stats.activos,color:'#22c55e'},{label:'Bloqueados',value:stats.bloqueados,color:'#ef4444'},{label:'Pendientes',value:stats.pendientes,color:'#f59e0b'}].map(item=>(
                  <div key={item.label} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{color:'#d1d5db',fontSize:13}}>{item.label}</span>
                      <span style={{color:item.color,fontSize:13,fontWeight:600}}>{item.value}</span>
                    </div>
                    <div style={{background:'#1f2937',borderRadius:4,height:6}}>
                      <div style={{background:item.color,height:6,borderRadius:4,width:`${stats.total?(item.value/stats.total*100):0}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={s.statCard}>
                <h3 style={{color:'white',marginBottom:16,fontSize:15}}>Resumen financiero</h3>
                {[
                  {label:'Ingreso mensual estimado',value:`${stats.ingresoEstimado}€`,color:'#a78bfa'},
                  {label:'Cuentas de pago',value:empresas.filter(e=>e.plan!=='starter'&&e.estado==='activo').length,color:'#FF6B00'},
                  {label:'Cuentas gratuitas',value:empresas.filter(e=>e.plan==='starter').length,color:'#6b7280'},
                  {label:'WhatsApp conectados',value:stats.whatsappActivos,color:'#25d366'},
                ].map(item=>(
                  <div key={item.label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1f2937'}}>
                    <span style={{color:'#9ca3af',fontSize:13}}>{item.label}</span>
                    <span style={{color:item.color,fontWeight:600}}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'crm' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>{['Empresa','Email','Plan','Conversaciones','Leads','Agentes','WhatsApp','Estado','Acciones'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {empresas.map(e=>(
                  <tr key={e.id} style={s.tr}>
                    <td style={s.td}><button onClick={()=>setDetalle(e)} style={s.linkBtn}>{e.nombreEmpresa||'—'}</button></td>
                    <td style={s.td}>{e.email||'—'}</td>
                    <td style={s.td}><span style={{...s.pill,background:PLAN_COLOR[e.plan]||'#374151'}}>{e.plan||'starter'}</span></td>
                    <td style={{...s.td,textAlign:'center'}}>{e.conversacionesTotales||0}</td>
                    <td style={{...s.td,textAlign:'center'}}>{e.leadsTotal||0}</td>
                    <td style={{...s.td,textAlign:'center'}}>{e.agentesActivos||0}</td>
                    <td style={s.td}><span style={{...s.pill,background:e.whatsapp?.status==='connected'?'#14532d':'#374151'}}>{e.whatsapp?.status==='connected'?'📱 Sí':'⭕ No'}</span></td>
                    <td style={s.td}><span style={{...s.pill,background:e.estado==='activo'?'#14532d':e.estado==='bloqueado'?'#7f1d1d':'#374151'}}>{e.estado||'pendiente'}</span></td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button onClick={()=>setDetalle(e)} style={{...s.btn,background:'#1e3a5f'}}>👁 Ver</button>
                        <button onClick={()=>setConfirmar(e.id)} style={{...s.btn,background:'#7f1d1d'}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalle && (
        <div style={s.overlay} onClick={()=>setDetalle(null)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{color:'white',margin:0}}>{detalle.nombreEmpresa||'Sin nombre'}</h3>
              <button onClick={()=>setDetalle(null)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:20,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
              {[
                {label:'Email',value:detalle.email},
                {label:'Teléfono',value:detalle.telefono},
                {label:'Plan',value:detalle.plan},
                {label:'Estado',value:detalle.estado},
                {label:'Ciudad',value:detalle.ciudad},
                {label:'Industria',value:detalle.industria},
                {label:'Agentes activos',value:detalle.agentesActivos||0},
                {label:'Conversaciones',value:detalle.conversacionesTotales||0},
                {label:'Leads total',value:detalle.leadsTotal||0},
                {label:'WhatsApp',value:detalle.whatsapp?.status||'desconectado'},
                {label:'Registro',value:detalle.creadoEn?.toDate?detalle.creadoEn.toDate().toLocaleDateString('es-ES'):'—'},
                {label:'UID',value:detalle.id?.slice(0,14)+'...'},
              ].map(item=>(
                <div key={item.label} style={{background:'#0d0f12',borderRadius:8,padding:'10px 14px'}}>
                  <div style={{color:'#6b7280',fontSize:11,marginBottom:3}}>{item.label}</div>
                  <div style={{color:'#d1d5db',fontSize:14,fontWeight:500}}>{item.value||'—'}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {detalle.estado!=='activo'&&<button onClick={()=>{cambiarEstado(detalle.id,'activo');setDetalle({...detalle,estado:'activo'});}} style={{...s.btn,background:'#14532d',padding:'8px 16px',fontSize:13}}>✅ Activar</button>}
              {detalle.estado!=='bloqueado'&&<button onClick={()=>{cambiarEstado(detalle.id,'bloqueado');setDetalle({...detalle,estado:'bloqueado'});}} style={{...s.btn,background:'#92400e',padding:'8px 16px',fontSize:13}}>🚫 Bloquear</button>}
              <button onClick={()=>{setConfirmar(detalle.id);setDetalle(null);}} style={{...s.btn,background:'#7f1d1d',padding:'8px 16px',fontSize:13}}>🗑 Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {confirmar && (
        <div style={s.overlay}>
          <div style={{...s.modal,maxWidth:360}}>
            <h3 style={{color:'white',marginBottom:8}}>¿Eliminar esta empresa?</h3>
            <p style={{color:'#9ca3af',marginBottom:24,fontSize:14}}>Acción irreversible. Se borrarán todos sus datos.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>eliminarEmpresa(confirmar)} style={{...s.btn,background:'#7f1d1d',padding:'10px 24px',fontSize:14}}>Sí, eliminar</button>
              <button onClick={()=>setConfirmar(null)} style={{...s.btn,background:'#374151',padding:'10px 24px',fontSize:14}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:{minHeight:'100vh',background:'#0d0f12',fontFamily:'Inter, sans-serif'},
  header:{background:'#111318',borderBottom:'1px solid #1f2937',padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100},
  logo:{color:'white',fontWeight:700,fontSize:18},
  badge:{background:'#FF6B00',color:'white',fontSize:10,padding:'3px 10px',borderRadius:4,fontWeight:700,letterSpacing:1},
  logout:{background:'transparent',border:'1px solid #374151',color:'#9ca3af',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontSize:13},
  refreshBtn:{background:'transparent',border:'1px solid #374151',color:'#9ca3af',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:13},
  container:{maxWidth:1400,margin:'0 auto',padding:'28px 24px'},
  title:{color:'white',fontSize:26,fontWeight:700,margin:0},
  statsGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',gap:12,marginBottom:28},
  statCard:{background:'#111318',border:'1px solid #1f2937',borderRadius:12,padding:'18px 20px'},
  statNum:{fontSize:28,fontWeight:700,lineHeight:1},
  statLabel:{color:'#6b7280',fontSize:12,marginTop:6},
  tabs:{display:'flex',gap:6,marginBottom:20},
  tab:{background:'transparent',border:'1px solid #1f2937',color:'#6b7280',padding:'8px 20px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:500},
  tabActive:{background:'#FF6B00',border:'1px solid #FF6B00',color:'white'},
  filtrosRow:{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'},
  search:{flex:2,minWidth:200,background:'#111318',border:'1px solid #1f2937',borderRadius:8,padding:'9px 14px',color:'white',fontSize:13},
  filterSelect:{background:'#111318',border:'1px solid #1f2937',borderRadius:8,padding:'9px 12px',color:'#d1d5db',fontSize:13,cursor:'pointer'},
  tableWrap:{overflowX:'auto',borderRadius:12,border:'1px solid #1f2937'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{background:'#0d0f12',color:'#6b7280',fontSize:11,fontWeight:600,padding:'12px 14px',textAlign:'left',borderBottom:'1px solid #1f2937',textTransform:'uppercase',letterSpacing:0.5},
  tr:{borderBottom:'1px solid #1f2937'},
  td:{padding:'12px 14px',color:'#d1d5db',fontSize:13},
  pill:{display:'inline-block',padding:'3px 10px',borderRadius:20,fontSize:11,color:'white',fontWeight:500},
  select:{border:'1px solid #374151',color:'white',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer'},
  actions:{display:'flex',gap:4},
  btn:{border:'none',color:'white',padding:'5px 10px',borderRadius:6,cursor:'pointer',fontSize:13},
  linkBtn:{background:'none',border:'none',color:'#FF6B00',cursor:'pointer',fontSize:13,fontWeight:500,textDecoration:'underline',padding:0},
  empty:{color:'#6b7280',textAlign:'center',padding:'48px 0'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:{background:'#111318',border:'1px solid #1f2937',borderRadius:16,padding:'28px',maxWidth:600,width:'90%',maxHeight:'85vh',overflowY:'auto'},
  toast:{position:'fixed',bottom:24,right:24,color:'white',padding:'12px 20px',borderRadius:10,fontSize:14,fontWeight:500,zIndex:9999,boxShadow:'0 4px 20px rgba(0,0,0,0.4)'},
};