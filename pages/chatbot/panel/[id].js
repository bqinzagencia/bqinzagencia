// pages/chatbot/panel/[id].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const PLANES = {
  starter:  { nombre:'Starter',  convs:300,  tokens:30000,  color:'#6B7280', precio:'$129.000' },
  business: { nombre:'Business', convs:1000, tokens:100000, color:'#2563EB', precio:'$290.000' },
  agency:   { nombre:'Agency',   convs:-1,   tokens:400000, color:'#A78BFA', precio:'$590.000' },
};

export default function ChatBotPanel() {
  const router   = useRouter();
  const { id }   = router.query;
  const [chatbot, setChatbot] = useState(null);
  const [convs,   setConvs]   = useState([]);
  const [stats,   setStats]   = useState({ hoy:0, total:0, tokens:0 });
  const [tab,     setTab]     = useState('inicio');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!id) return;
    cargar();
    cargarConvs();
  }, [id]);

  const cargar = async () => {
    try {
      const snap = await getDoc(doc(db, 'chatbots', id));
      if (snap.exists()) setChatbot({ id, ...snap.data() });
    } catch {}
  };

  const cargarConvs = () => {
    const q = query(
      collection(db, 'chatbots', id||'x', 'conversaciones'),
      orderBy('ultimoMensaje','desc'), limit(30)
    );
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d=>({id:d.id,...d.data()}));
      setConvs(list);
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      setStats(s=>({...s, hoy:list.filter(c=>c.ultimoMensaje?.toDate?.()>=hoy).length, total:list.length}));
    });
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(`<script\n  src="https://agenciame.com/widget.js"\n  data-id="${id}"\n></script>`);
    setCopiado(true);
    setTimeout(()=>setCopiado(false), 2000);
  };

  if (!chatbot) return (
    <div style={{minHeight:'100vh',background:'#06090D',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:'3px solid rgba(37,99,235,0.2)',borderTop:'3px solid #2563EB',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const plan     = PLANES[chatbot.plan] || PLANES.starter;
  const pctConvs = plan.convs > 0 ? Math.min(Math.round(stats.total/plan.convs*100),100) : 0;
  const pctTok   = Math.min(Math.round((chatbot.tokensUsados||0)/plan.tokens*100),100);
  const CARD     = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20 };
  const TABS     = [
    {key:'inicio',  label:'Inicio',       icon:'◉'},
    {key:'convs',   label:'Conversaciones',icon:'💬'},
    {key:'codigo',  label:'Código',        icon:'</>'},
    {key:'config',  label:'Config',        icon:'⚙️'},
  ];

  const snippetCodigo = `<script\n  src="https://agenciame.com/widget.js"\n  data-id="${id}"\n></script>`;

  return (
    <>
      <Head><title>{chatbot.nombre} — ChatBot Panel</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cb-tab{background:transparent;border:none;padding:8px 14px;font-family:${F};font-size:13px;cursor:pointer;transition:all 0.15s;color:#6B7A99;display:flex;align-items:center;gap:7px;border-radius:8px}
        .cb-tab:hover{color:#EFF4FF;background:rgba(255,255,255,0.04)}
        .cb-tab.on{color:#2563EB;background:rgba(37,99,235,0.08);font-weight:600}
      `}} />

      {/* NAV */}
      <nav style={{background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/chatbot"><span style={{fontFamily:FA,fontSize:16}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
          <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
          <span style={{fontFamily:F,fontSize:13,fontWeight:600}}>{chatbot.nombre}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{background:chatbot.activo?'rgba(37,211,102,0.08)':'rgba(239,68,68,0.08)',color:chatbot.activo?'#25D366':'#EF4444',border:`1px solid ${chatbot.activo?'rgba(37,211,102,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:100,padding:'4px 12px',fontFamily:F,fontSize:11,fontWeight:700}}>
            {chatbot.activo?'Activo':'Inactivo'}
          </span>
          <span style={{background:plan.color+'22',color:plan.color,border:`1px solid ${plan.color}44`,borderRadius:100,padding:'3px 12px',fontFamily:F,fontSize:11,fontWeight:700}}>{plan.nombre}</span>
        </div>
      </nav>

      <div style={{display:'flex',minHeight:'calc(100vh - 58px)'}}>
        {/* SIDEBAR */}
        <div style={{width:200,borderRight:'1px solid rgba(255,255,255,0.05)',padding:'20px 12px',flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} className={`cb-tab${tab===t.key?' on':''}`} onClick={()=>setTab(t.key)}>
              <span style={{fontSize:14}}>{t.icon}</span>{t.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{padding:'12px',background:'rgba(37,99,235,0.04)',border:'1px solid rgba(37,99,235,0.12)',borderRadius:10,marginTop:'auto'}}>
            <div style={{fontFamily:F,fontSize:10,color:'#4B6080',marginBottom:4}}>Plan actual</div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:plan.color,marginBottom:2}}>{plan.nombre}</div>
            <div style={{fontFamily:F,fontSize:11,color:'#4B6080',marginBottom:10}}>{plan.precio}/mes</div>
            <a href="https://wa.me/573105056616?text=Quiero mejorar mi plan ChatBot" target="_blank" rel="noreferrer"
              style={{display:'block',background:'#2563EB',color:'#fff',borderRadius:8,padding:'7px',fontFamily:F,fontSize:11,fontWeight:700,textAlign:'center'}}>
              Mejorar plan
            </a>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{flex:1,padding:'28px 32px',overflowY:'auto'}}>

          {/* INICIO */}
          {tab==='inicio'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:6}}>{chatbot.nombre}</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24,fontWeight:300}}>Panel de control de tu ChatBot Web</p>

              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
                {[
                  {label:'Chats hoy',   val:stats.hoy,   color:'#2563EB'},
                  {label:'Total chats', val:stats.total, color:'#EFF4FF'},
                  {label:'Créditos IA',val:(chatbot.tokensUsados||0).toLocaleString(),color:'#A78BFA'},
                ].map((s,i)=>(
                  <div key={i} style={CARD}>
                    <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#4B6080',marginBottom:8}}>{s.label}</div>
                    <div style={{fontFamily:FA,fontSize:32,fontWeight:400,color:s.color,letterSpacing:'-1px'}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Consumo */}
              <div style={{...CARD,marginBottom:20}}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:16}}>Consumo del plan</div>
                {[
                  {label:'Conversaciones',val:`${stats.total} / ${plan.convs>0?plan.convs:'ilimitadas'}`,pct:pctConvs},
                  {label:'Créditos IA',val:`${(chatbot.tokensUsados||0).toLocaleString()} / ${plan.tokens.toLocaleString()}`,pct:pctTok},
                ].map((b,i)=>(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontFamily:F,fontSize:12,color:'#8A9BB5'}}>{b.label}</span>
                      <span style={{fontFamily:F,fontSize:12,fontWeight:600,color:b.pct>80?'#EF4444':'#EFF4FF'}}>{b.val}</span>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.06)',borderRadius:3,height:6,overflow:'hidden'}}>
                      <div style={{width:`${b.pct}%`,height:'100%',background:b.pct>80?'#EF4444':b.pct>60?'#F59E0B':'#2563EB',borderRadius:3,transition:'width 0.6s'}}/>
                    </div>
                  </div>
                ))}
                {(pctConvs>80||pctTok>80)&&<div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'9px 12px',fontFamily:F,fontSize:12,color:'#FCD34D'}}>
                  Estas cerca del limite. <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer" style={{color:'#2563EB',fontWeight:700}}>Amplia tu plan</a>
                </div>}
              </div>

              {/* Codigo rapido */}
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:12}}>Código de instalación</div>
                <div style={{background:'#06090D',borderRadius:8,padding:'12px 14px',fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'#60A5FA',lineHeight:1.7,marginBottom:10}}>
                  {snippetCodigo.split('\n').map((l,i)=><div key={i}>{l}</div>)}
                </div>
                <button onClick={copiarCodigo} style={{background:copiado?'rgba(37,211,102,0.1)':'rgba(37,99,235,0.1)',color:copiado?'#25D366':'#60A5FA',border:`1px solid ${copiado?'rgba(37,211,102,0.25)':'rgba(37,99,235,0.25)'}`,borderRadius:8,padding:'8px 16px',fontFamily:F,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  {copiado?'Copiado ✓':'Copiar código'}
                </button>
              </div>
            </div>
          )}

          {/* CONVERSACIONES */}
          {tab==='convs'&&(
            <div>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Conversaciones</h2>
              <div style={CARD}>
                {convs.map((c,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:i<convs.length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(37,99,235,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:700,color:'#2563EB',flexShrink:0}}>
                      {(c.nombreCliente||'?')[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:F,fontSize:13,fontWeight:600,color:'#EFF4FF'}}>{c.nombreCliente||'Visitante'}</div>
                      <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300}}>{c.ultimoTexto||''}</div>
                    </div>
                    <div style={{fontFamily:F,fontSize:10,color:'#374151',flexShrink:0}}>
                      {c.ultimoMensaje?.toDate?.()?.toLocaleDateString('es-CO',{day:'numeric',month:'short'})||''}
                    </div>
                  </div>
                ))}
                {convs.length===0&&<div style={{fontFamily:F,fontSize:13,color:'#4B6080',textAlign:'center',padding:'40px 0'}}>Sin conversaciones aun. Instala el widget en tu web para empezar.</div>}
              </div>
            </div>
          )}

          {/* CODIGO */}
          {tab==='codigo'&&(
            <div style={{maxWidth:560}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:8}}>Código de instalación</h2>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:24,fontWeight:300}}>Pega este código en tu sitio web antes de cerrar la etiqueta {'</body>'}.</p>

              <div style={{background:'#080E14',border:'1px solid rgba(37,99,235,0.2)',borderRadius:14,padding:'22px 24px',marginBottom:16}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:'#60A5FA',lineHeight:1.8}}>
                  <span style={{color:'#4B6080'}}>{`<!-- ChatBot agencIAme -->`}</span><br/>
                  <span style={{color:'#F59E0B'}}>{`<script`}</span><br/>
                  <span style={{paddingLeft:16,color:'#EFF4FF'}}>src=<span style={{color:'#25D366'}}>"https://agenciame.com/widget.js"</span></span><br/>
                  <span style={{paddingLeft:16,color:'#EFF4FF'}}>data-id=<span style={{color:'#25D366'}}>"{id}"</span></span><br/>
                  <span style={{color:'#F59E0B'}}>{`></script>`}</span>
                </div>
              </div>

              <button onClick={copiarCodigo} style={{width:'100%',background:copiado?'rgba(37,211,102,0.1)':'rgba(37,99,235,0.1)',color:copiado?'#25D366':'#60A5FA',border:`1px solid ${copiado?'rgba(37,211,102,0.25)':'rgba(37,99,235,0.25)'}`,borderRadius:10,padding:'12px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:20}}>
                {copiado?'Copiado ✓':'Copiar código'}
              </button>

              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:12}}>Compatible con</div>
                {['WordPress','Wix','Shopify','Squarespace','HTML puro','Webflow','cualquier plataforma web'].map((p,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.45)'}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIG */}
          {tab==='config'&&(
            <div style={{maxWidth:480}}>
              <h2 style={{fontFamily:FA,fontSize:28,fontWeight:400,letterSpacing:'-0.5px',marginBottom:20}}>Configuración</h2>
              <div style={CARD}>
                <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.8}}>
                  <div><span style={{color:'#4B6080'}}>Nombre:</span> {chatbot.nombre}</div>
                  <div><span style={{color:'#4B6080'}}>Industria:</span> {chatbot.industria}</div>
                  <div><span style={{color:'#4B6080'}}>Email:</span> {chatbot.email}</div>
                  <div><span style={{color:'#4B6080'}}>Color:</span> <span style={{display:'inline-block',width:12,height:12,borderRadius:'50%',background:chatbot.colorChat||'#2563EB',verticalAlign:'middle',marginRight:4}}/>{chatbot.colorChat}</div>
                  <div><span style={{color:'#4B6080'}}>Posicion:</span> {chatbot.posicion}</div>
                </div>
                <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer"
                  style={{display:'inline-block',marginTop:16,background:'rgba(37,99,235,0.08)',color:'#60A5FA',border:'1px solid rgba(37,99,235,0.2)',borderRadius:8,padding:'9px 18px',fontFamily:F,fontSize:13,fontWeight:600}}>
                  Actualizar configuracion con soporte
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
