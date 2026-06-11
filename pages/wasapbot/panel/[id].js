// pages/wasapbot/panel/[id].js
// Portal exclusivo para clientes de WasapBot — sin acceso al dashboard completo
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const WA = 'https://agenciame-whatsapp-server-production.up.railway.app';
const SECRET = 'agenciame2026secreto_nexoia';

const PLANES = {
  basico:    { nombre:'Básico',    tokens:50000,  convs:500,  color:'#6B7280', precio:'$189.000' },
  estandar:  { nombre:'Estándar',  tokens:150000, convs:1500, color:'#2563EB', precio:'$390.000' },
  pro:       { nombre:'Pro',       tokens:400000, convs:4000, color:'#A78BFA', precio:'$690.000' },
  wasapbot:  { nombre:'Trial',     tokens:15000,  convs:150,  color:'#F59E0B', precio:'Gratis' },
};

export default function WasapBotPanel() {
  const router   = useRouter();
  const { id }   = router.query;
  const [empresa,    setEmpresa]    = useState(null);
  const [status,     setStatus]     = useState('loading');
  const [qrBase64,   setQrBase64]   = useState('');
  const [convs,      setConvs]      = useState([]);
  const [pedidos,    setPedidos]    = useState([]);
  const [stats,      setStats]      = useState({ hoy:0, semana:0, total:0, tokensUsados:0 });
  const [tab,        setTab]        = useState('inicio');
  const [reconect,   setReconect]   = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    cargarEmpresa();
    verificarStatus();
    cargarConversaciones();
    return () => clearInterval(pollRef.current);
  }, [id]);

  const cargarEmpresa = async () => {
    try {
      const snap = await getDoc(doc(db, 'empresas', id));
      if (snap.exists()) setEmpresa({ id, ...snap.data() });
    } catch {}
  };

  const verificarStatus = async () => {
    try {
      const r = await fetch(`${WA}/sesion/${id}/status`, { headers:{'x-server-secret':SECRET} });
      const d = await r.json();
      setStatus(d.status || 'disconnected');
      // Poll cada 30s
      pollRef.current = setInterval(async () => {
        const r2 = await fetch(`${WA}/sesion/${id}/status`, { headers:{'x-server-secret':SECRET} }).catch(()=>null);
        const d2 = r2 ? await r2.json().catch(()=>({})) : {};
        setStatus(d2.status || 'disconnected');
      }, 30000);
    } catch { setStatus('disconnected'); }
  };

  const cargarConversaciones = () => {
    const q = query(
      collection(db, 'empresas', id || 'x', 'conversaciones'),
      orderBy('ultimoMensaje', 'desc'),
      limit(20)
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      setConvs(list);
      // Stats rapidas
      const hoy    = new Date(); hoy.setHours(0,0,0,0);
      const semana = new Date(); semana.setDate(semana.getDate()-7);
      const convsHoy     = list.filter(c => c.ultimoMensaje?.toDate?.() >= hoy).length;
      const convsSemana  = list.filter(c => c.ultimoMensaje?.toDate?.() >= semana).length;
      setStats(s => ({ ...s, hoy:convsHoy, semana:convsSemana, total:list.length }));
    });
  };

  const reconectar = async () => {
    setReconect(true); setQrBase64('');
    try {
      await fetch(`${WA}/sesion/iniciar`, {
        method:'POST', headers:{'Content-Type':'application/json','x-server-secret':SECRET},
        body: JSON.stringify({ empresaId:id }),
      });
      let n=0;
      const poll = async () => {
        if (n++>20) { setReconect(false); return; }
        const r = await fetch(`${WA}/sesion/${id}/qr`, { headers:{'x-server-secret':SECRET} }).catch(()=>null);
        const d = r ? await r.json().catch(()=>({})) : {};
        if (d.qrBase64) { setQrBase64(d.qrBase64); setReconect(false); setTab('qr'); return; }
        if (d.status==='connected') { setStatus('connected'); setQrBase64(''); setReconect(false); setTab('inicio'); return; }
        setTimeout(poll, 2000);
      };
      poll();
    } catch { setReconect(false); }
  };

  if (!empresa) return (
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:'3px solid rgba(37,211,102,0.2)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const plan      = PLANES[empresa.planWasapbot || empresa.plan] || PLANES.wasapbot;
  const pctTokens = Math.min(Math.round((stats.tokensUsados / plan.tokens) * 100), 100);
  const pctConvs  = Math.min(Math.round((stats.total / plan.convs) * 100), 100);
  const connected = status === 'connected';

  const CARD = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20 };
  const TABS = [
    { key:'inicio',   label:'Inicio',         icon:'◉' },
    { key:'convs',    label:'Conversaciones',  icon:'💬' },
    { key:'catalogo', label:'Mi catálogo',     icon:'📋' },
    { key:'config',   label:'Configuración',   icon:'⚙️' },
  ];

  return (
    <>
      <Head><title>{empresa.nombreEmpresa} — WasapBot Panel</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)}70%{box-shadow:0 0 0 10px rgba(37,211,102,0)}}
        .wb-tab{background:transparent;border:none;borderRadius:8px;padding:8px 16px;font-family:${F};font-size:13px;cursor:pointer;transition:all 0.15s;color:#6B7A99;display:flex;align-items:center;gap:7px}
        .wb-tab:hover{color:#EFF4FF;background:rgba(255,255,255,0.04)}
        .wb-tab.on{color:#25D366;background:rgba(37,211,102,0.08);font-weight:600}
        .bar-fill{height:6px;border-radius:3px;transition:width 0.6s ease}
      `}} />

      {/* NAV */}
      <nav style={{background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/wasapbot"><span style={{fontFamily:FA,fontSize:16,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
          <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
          <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{empresa.nombreEmpresa}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:connected?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${connected?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:100,padding:'4px 12px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:connected?'#25D366':'#EF4444',animation:connected?'pulse-g 2s infinite':'none'}}/>
            <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:connected?'#25D366':'#EF4444'}}>{connected?'Activo':'Desconectado'}</span>
          </div>
          <span style={{background:plan.color+'22',color:plan.color,border:`1px solid ${plan.color}44`,borderRadius:100,padding:'3px 12px',fontFamily:F,fontSize:11,fontWeight:700}}>{plan.nombre}</span>
        </div>
      </nav>

      <div style={{display:'flex',minHeight:'calc(100vh - 58px)'}}>

        {/* SIDEBAR */}
        <div style={{width:200,borderRight:'1px solid rgba(255,255,255,0.05)',padding:'20px 12px',flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} className={`wb-tab${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>
              <span style={{fontSize:14}}>{t.icon}</span>{t.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{padding:'12px',background:'rgba(37,211,102,0.04)',border:'1px solid rgba(37,211,102,0.12)',borderRadius:10,marginTop:'auto'}}>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginBottom:4}}>Plan actual</div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:plan.color,marginBottom:2}}>{plan.nombre}</div>
            <div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginBottom:10}}>{plan.precio}/mes</div>
            <a href="https://wa.me/573105056616?text=Quiero mejorar mi plan WasapBot" target="_blank" rel="noreferrer"
              style={{display:'block',background:'#25D366',color:'#fff',borderRadius:8,padding:'7px',fontFamily:F,fontSize:11,fontWeight:700,textAlign:'center'}}>
              Mejorar plan
            </a>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{flex:1,padding:'28px 32px',overflowY:'auto'}}>

          {/* ── INICIO ── */}
          {tab==='inicio' && (
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>
                Bienvenido, {empresa.nombreEmpresa}
              </h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24,fontWeight:300}}>
                Panel de control de tu WasapBot
              </p>

              {/* Estado del bot */}
              {!connected && (
                <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EF4444',marginBottom:3}}>Bot desconectado</div>
                    <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)'}}>Tu WhatsApp no esta respondiendo. Reconecta el bot.</div>
                  </div>
                  <button onClick={reconectar} disabled={reconect}
                    style={{background:'#EF4444',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',opacity:reconect?0.7:1}}>
                    {reconect?'Conectando...':'Reconectar bot'}
                  </button>
                </div>
              )}

              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
                {[
                  {label:'Hoy',      val:stats.hoy,    color:'#25D366' },
                  {label:'Semana',   val:stats.semana, color:'#2563EB' },
                  {label:'Total',    val:stats.total,  color:'#EFF4FF' },
                ].map((s,i)=>(
                  <div key={i} style={CARD}>
                    <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#4B6080',marginBottom:8}}>Conversaciones {s.label}</div>
                    <div style={{fontFamily:FA,fontSize:36,fontWeight:400,color:s.color,letterSpacing:'-1px'}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Consumo */}
              <div style={{...CARD,marginBottom:20}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Consumo del plan</div>
                <div style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>Conversaciones</span>
                    <span style={{fontFamily:F,fontSize:12,color:pctConvs>80?'#EF4444':'#EFF4FF',fontWeight:600}}>{stats.total} / {plan.convs}</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                    <div className="bar-fill" style={{width:`${pctConvs}%`,background:pctConvs>80?'#EF4444':pctConvs>60?'#F59E0B':'#25D366'}}/>
                  </div>
                </div>
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>Tokens IA</span>
                    <span style={{fontFamily:F,fontSize:12,color:pctTokens>80?'#EF4444':'#EFF4FF',fontWeight:600}}>{stats.tokensUsados.toLocaleString()} / {plan.tokens.toLocaleString()}</span>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                    <div className="bar-fill" style={{width:`${pctTokens}%`,background:pctTokens>80?'#EF4444':pctTokens>60?'#F59E0B':'#2563EB'}}/>
                  </div>
                </div>
                {(pctConvs>80||pctTokens>80)&&(
                  <div style={{marginTop:14,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'10px 14px',fontFamily:F,fontSize:12,color:'#FCD34D'}}>
                    Estas cerca del limite. <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer" style={{color:'#25D366',fontWeight:700}}>Amplia tu plan</a>
                  </div>
                )}
              </div>

              {/* Ultimas convs */}
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>Ultimas conversaciones</div>
                {convs.slice(0,5).map((c,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<4?'1px solid rgba(255,255,255,0.05)':'none'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(37,211,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:12,fontWeight:700,color:'#25D366',flexShrink:0}}>
                      {(c.nombreCliente||'?')[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.nombreCliente||c.telefono||'Cliente'}</div>
                      <div style={{fontFamily:F,fontSize:11,color:'#4B6080',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.ultimoTexto||'Sin mensajes'}</div>
                    </div>
                    <div style={{fontFamily:F,fontSize:10,color:'#374151',flexShrink:0}}>
                      {c.ultimoMensaje?.toDate?.()?.toLocaleDateString('es-CO',{day:'numeric',month:'short'})||''}
                    </div>
                  </div>
                ))}
                {convs.length===0&&<div style={{fontFamily:F,fontSize:13,color:'#4B6080',textAlign:'center',padding:'20px 0'}}>Sin conversaciones aun</div>}
              </div>
            </div>
          )}

          {/* ── CONVERSACIONES ── */}
          {tab==='convs' && (
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Conversaciones</h2>
              <div style={CARD}>
                {convs.map((c,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:i<convs.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(37,211,102,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:700,color:'#25D366',flexShrink:0}}>
                      {(c.nombreCliente||'?')[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{c.nombreCliente||'Cliente sin nombre'}</div>
                      <div style={{fontFamily:F,fontSize:11,color:'#4B6080'}}>+{c.telefono||''}</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300}}>{c.ultimoTexto}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:F,fontSize:10,color:'#374151'}}>
                        {c.ultimoMensaje?.toDate?.()?.toLocaleDateString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})||''}
                      </div>
                      <span style={{background:'rgba(37,211,102,0.1)',color:'#25D366',borderRadius:100,padding:'2px 8px',fontFamily:F,fontSize:9,fontWeight:700}}>WhatsApp</span>
                    </div>
                  </div>
                ))}
                {convs.length===0&&<div style={{fontFamily:F,fontSize:13,color:'#4B6080',textAlign:'center',padding:'40px 0'}}>Sin conversaciones aun. El bot empieza a registrar cuando alguien te escriba.</div>}
              </div>
            </div>
          )}

          {/* ── QR ── */}
          {tab==='qr' && (
            <div style={{textAlign:'center',maxWidth:420,margin:'0 auto'}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:8}}>Reconectar WhatsApp</h2>
              {qrBase64 ? (
                <div>
                  <div style={{background:'#fff',borderRadius:16,padding:20,display:'inline-block',marginBottom:20,boxShadow:'0 8px 40px rgba(0,0,0,0.4)'}}>
                    <img src={qrBase64} style={{width:200,height:200,display:'block'}}/>
                  </div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)'}}>Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea</p>
                </div>
              ) : (
                <div>
                  <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24}}>Genera un nuevo QR para reconectar tu numero de WhatsApp.</p>
                  <button onClick={reconectar} disabled={reconect}
                    style={{background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'14px 36px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer'}}>
                    {reconect?'Generando QR...':'Generar QR'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CONFIG ── */}
          {tab==='config' && (
            <div style={{maxWidth:500}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Configuracion</h2>
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Estado del bot</div>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  <button onClick={()=>setTab('qr')}
                    style={{background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Reconectar QR
                  </button>
                  <button onClick={async()=>{ await fetch(`${WA}/sesion/${id}/desconectar`,{method:'POST',headers:{'x-server-secret':SECRET}}); setStatus('disconnected'); }}
                    style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Desconectar bot
                  </button>
                </div>
              </div>
              <div style={{...CARD,marginTop:14}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>Informacion del negocio</div>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.8}}>
                  <div><span style={{color:'#4B6080'}}>Empresa:</span> {empresa.nombreEmpresa}</div>
                  <div><span style={{color:'#4B6080'}}>Industria:</span> {empresa.industria}</div>
                  <div><span style={{color:'#4B6080'}}>Email:</span> {empresa.email}</div>
                  <div><span style={{color:'#4B6080'}}>Plan:</span> {plan.nombre} — {plan.precio}/mes</div>
                </div>
                <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer"
                  style={{display:'inline-block',marginTop:16,background:'rgba(37,211,102,0.08)',color:'#25D366',border:'1px solid rgba(37,211,102,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600}}>
                  Actualizar informacion con soporte
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
