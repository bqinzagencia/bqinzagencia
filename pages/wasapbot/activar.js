// pages/wasapbot/activar.js — Flujo completo con placeholders dinamicos y catalogo con fotos
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { INDUSTRIAS_WB, getConfigIndustria } from '../../lib/wasapbotConfig';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const CLOUD = 'dsomqay6y';
const PRESET = 'cadegran_fotos';
const STEPS = ['Tu negocio', 'Tu catalogo', 'Conecta WhatsApp', 'Listo'];

export default function WasapBotActivar() {
  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [empresaId,  setEmpresaId]  = useState('');
  const [qrBase64,   setQrBase64]   = useState('');
  const [numero,     setNumero]     = useState('');

  // Paso 1
  const [nombre,      setNombre]      = useState('');
  const [industria,   setIndustria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [email,       setEmail]       = useState('');
  const [horario,     setHorario]     = useState('');
  const [ciudad,      setCiudad]      = useState('');

  // Paso 2 — catalogo
  const [items, setItems] = useState([
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', categoria:'', foto:'', subiendo:false },
  ]);
  const [preguntas, setPreguntas] = useState(['','','']);
  const fileRefs = useRef([]);

  const cfg = industria ? getConfigIndustria(industria) : null;
  const ph  = cfg?.placeholders || {};

  const INP = { width:'100%', background:'#0D1420', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'11px 13px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
  const LBL = { fontFamily:F, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, color:'#4B6080', display:'block', marginBottom:5 };
  const CARD = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:14 };

  // Subir foto a Cloudinary
  const subirFoto = async (file, idx) => {
    setItems(prev => prev.map((it,i) => i===idx ? {...it, subiendo:true} : it));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', PRESET);
      fd.append('folder', 'wasapbot/catalogo');
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:'POST', body:fd });
      const d = await r.json();
      setItems(prev => prev.map((it,i) => i===idx ? {...it, foto:d.secure_url, subiendo:false} : it));
    } catch { setItems(prev => prev.map((it,i) => i===idx ? {...it, subiendo:false} : it)); }
  };

  // Paso 1 → crear empresa
  const crearEmpresa = async () => {
    if (!nombre.trim())  { setError('Escribe el nombre de tu negocio'); return; }
    if (!industria)      { setError('Selecciona el tipo de negocio'); return; }
    if (!email.trim())   { setError('Escribe tu correo electronico'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/wasapbot-crear', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ nombre, industria, descripcion, email, horario, ciudad, producto:'wasapbot' }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setEmpresaId(d.empresaId);
      setStep(2);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 2 → guardar catalogo
  const guardarCatalogo = async () => {
    setLoading(true);
    try {
      const itemsValidos = items.filter(it => it.nombre.trim());
      const pFiltradas   = preguntas.filter(p => p.trim()).map(p => ({ pregunta:p, respuesta:'' }));
      await fetch('/api/wasapbot-servicios', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          empresaId,
          servicios:  itemsValidos,
          horario,
          preguntas:  pFiltradas,
          tipoCatalogo: cfg?.tipoCatalogo || 'servicios',
          permitePedidos: cfg?.permitePedidos || false,
        }),
      });
      setStep(3);
      iniciarBot();
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 3 → QR
  const iniciarBot = async () => {
    setLoading(true);
    const WA = 'https://agenciame-whatsapp-server-production.up.railway.app';
    try {
      await fetch(`${WA}/sesion/iniciar`, {
        method:'POST', headers:{'Content-Type':'application/json','x-server-secret':'agenciame2026secreto_nexoia'},
        body: JSON.stringify({ empresaId }),
      });
      let intentos = 0;
      const poll = async () => {
        if (intentos++ > 30) { setError('Tiempo agotado. Intenta de nuevo.'); setLoading(false); return; }
        const r2 = await fetch(`${WA}/sesion/${empresaId}/qr`, { headers:{'x-server-secret':'agenciame2026secreto_nexoia'} }).catch(()=>null);
        const d2 = r2 ? await r2.json().catch(()=>({})) : {};
        if (d2.status === 'connected') { setNumero(d2.numero||''); setStep(4); setLoading(false); return; }
        if (d2.qrBase64) { setQrBase64(d2.qrBase64); setLoading(false); pollStatus(); return; }
        setTimeout(poll, 2000);
      };
      poll();
    } catch(e) { setError(e.message); setLoading(false); }
  };

  const pollStatus = () => {
    const WA = 'https://agenciame-whatsapp-server-production.up.railway.app';
    let n = 0;
    const check = async () => {
      if (n++ > 60) return;
      const r = await fetch(`${WA}/sesion/${empresaId}/status`, { headers:{'x-server-secret':'agenciame2026secreto_nexoia'} }).catch(()=>null);
      const d = r ? await r.json().catch(()=>({})) : {};
      if (d.status === 'connected') { setNumero(d.numero||''); setStep(4); return; }
      setTimeout(check, 3000);
    };
    check();
  };

  return (
    <>
      <Head><title>Activar WasapBot — agencIAme</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        .wf-inp:focus{border-color:rgba(37,211,102,0.45)!important}
        .wf-ind{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 8px;cursor:pointer;transition:all 0.15s;text-align:center;color:#6B7A99;font-family:${F};font-size:11px;font-weight:600}
        .wf-ind:hover{border-color:rgba(37,211,102,0.3);color:#EFF4FF}
        .wf-ind.on{background:rgba(37,211,102,0.08);border-color:rgba(37,211,102,0.4);color:#25D366}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ok{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
      `}} />

      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/wasapbot"><span style={{fontFamily:FA,fontSize:16,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me <span style={{color:'#25D366',fontSize:13,fontFamily:F,fontWeight:700}}>WasapBot</span></span></Link>
        <Link href="/wasapbot" style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>← Volver</Link>
      </nav>

      <div style={{maxWidth:640,margin:'0 auto',padding:'44px 20px 80px'}}>

        {/* STEPPER */}
        <div style={{display:'flex',alignItems:'center',marginBottom:44}}>
          {STEPS.map((s,i) => {
            const done=step>i+1, cur=step===i+1;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:done?'#25D366':cur?'rgba(37,211,102,0.12)':'#0D1420',border:`1px solid ${done?'#25D366':cur?'rgba(37,211,102,0.5)':'rgba(255,255,255,0.07)'}`,fontFamily:F,fontSize:10,fontWeight:700,color:done?'#fff':cur?'#25D366':'#4B6080',flexShrink:0}}>
                    {done?'✓':i+1}
                  </div>
                  {cur && <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#EFF4FF'}}>{s}</span>}
                </div>
                {i<STEPS.length-1 && <div style={{flex:1,height:1,background:done?'#25D366':'rgba(255,255,255,0.06)',margin:'0 8px',minWidth:16}}/>}
              </div>
            );
          })}
        </div>

        {error && <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:'#EF4444'}}>{error}</div>}

        {/* ── PASO 1: DATOS DEL NEGOCIO ── */}
        {step===1 && (
          <div>
            <h1 style={{fontFamily:FA,fontSize:38,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:4}}>Tu negocio</h1>
            <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:28,fontWeight:300}}>Cuéntanos de qué se trata para configurar tu bot correctamente.</p>

            <div style={CARD}>
              <label style={LBL}>Nombre del negocio *</label>
              <input className="wf-inp" style={INP} value={nombre} onChange={e=>setNombre(e.target.value)}
                placeholder={ph.nombre || 'Ej: Mi negocio...'} />

              <label style={{...LBL,marginTop:14}}>Tipo de negocio *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:4}}>
                {INDUSTRIAS_WB.map(i=>(
                  <button key={i.value} className={`wf-ind${industria===i.value?' on':''}`} onClick={()=>setIndustria(i.value)}>
                    <div style={{fontSize:20,marginBottom:3}}>{i.emoji}</div>
                    <div style={{fontSize:9,lineHeight:1.2}}>{i.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={CARD}>
              <label style={LBL}>Descripcion de tu negocio</label>
              <textarea className="wf-inp" style={{...INP,resize:'vertical',minHeight:80}} value={descripcion}
                onChange={e=>setDescripcion(e.target.value)}
                placeholder={ph.descripcion || 'Describe brevemente tu negocio...'} />

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                <div>
                  <label style={LBL}>Ciudad</label>
                  <input className="wf-inp" style={INP} value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Cali, Bogota, Medellin..." />
                </div>
                <div>
                  <label style={LBL}>Horario de atencion</label>
                  <input className="wf-inp" style={INP} value={horario} onChange={e=>setHorario(e.target.value)}
                    placeholder={ph.horario || 'Lunes a Viernes 8am-6pm'} />
                </div>
              </div>
            </div>

            <div style={CARD}>
              <label style={LBL}>Tu correo electronico *</label>
              <input className="wf-inp" style={INP} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@gmail.com" />
            </div>

            <button onClick={crearEmpresa} disabled={loading}
              style={{width:'100%',background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,211,102,0.3)',opacity:loading?0.7:1}}>
              {loading?'Creando tu agente...':'Continuar →'}
            </button>
          </div>
        )}

        {/* ── PASO 2: CATALOGO ── */}
        {step===2 && cfg && (
          <div>
            <h1 style={{fontFamily:FA,fontSize:38,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:4}}>{cfg.labelCatalogo}</h1>
            <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:28,fontWeight:300}}>
              Agrega tus {cfg.labelCatalogo.toLowerCase()} con precios y fotos. El bot los presentara a tus clientes.
              {cfg.permitePedidos && <span style={{color:'#25D366',fontWeight:600}}> Los clientes podran acumular pedidos como en un menu digital.</span>}
            </p>

            {items.map((item,idx)=>(
              <div key={idx} style={{...CARD,position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF'}}>{cfg.labelItem} {idx+1}</span>
                  {items.length>1 && <button onClick={()=>setItems(prev=>prev.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',color:'#4B6080',cursor:'pointer',fontSize:16}}>✕</button>}
                </div>

                <div style={{display:'grid',gridTemplateColumns:cfg.tieneFoto?'1fr auto':'1fr',gap:14,marginBottom:12}}>
                  <div>
                    <label style={LBL}>{cfg.labelItem} *</label>
                    <input className="wf-inp" style={INP} value={item.nombre} onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it))}
                      placeholder={ph[`item${idx+1}`] || `Nombre del ${cfg.labelItem.toLowerCase()}`} />
                  </div>
                  {cfg.tieneFoto && (
                    <div>
                      <label style={LBL}>Foto</label>
                      <input ref={el=>fileRefs.current[idx]=el} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ const f=e.target.files[0]; if(f) subirFoto(f,idx); }} />
                      {item.foto ? (
                        <div style={{position:'relative',width:64,height:64}}>
                          <img src={item.foto} style={{width:64,height:64,objectFit:'cover',borderRadius:8}} />
                          <button onClick={()=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,foto:''}:it))} style={{position:'absolute',top:-6,right:-6,background:'#EF4444',border:'none',borderRadius:'50%',width:18,height:18,color:'#fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                        </div>
                      ) : (
                        <div onClick={()=>fileRefs.current[idx]?.click()} style={{width:64,height:64,border:'2px dashed rgba(255,255,255,0.1)',borderRadius:8,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:20,color:'#4B6080'}}>
                          {item.subiendo ? <div style={{width:20,height:20,border:'2px solid rgba(37,211,102,0.3)',borderTop:'2px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/> : '+'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={LBL}>{cfg.labelPrecio}</label>
                    <input className="wf-inp" style={INP} value={item.precio} onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,precio:e.target.value}:it))}
                      placeholder={ph[`precio${idx+1}`] || '0'} />
                  </div>
                  {cfg.tieneCategoria && (
                    <div>
                      <label style={LBL}>Categoria</label>
                      <select className="wf-inp" style={{...INP,cursor:'pointer'}} value={item.categoria} onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,categoria:e.target.value}:it))}>
                        <option value="">Seleccionar...</option>
                        {cfg.categorias.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label style={LBL}>{cfg.labelDescripcion}</label>
                  <input className="wf-inp" style={INP} value={item.descripcion} onChange={e=>setItems(prev=>prev.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it))}
                    placeholder={ph[`desc${idx+1}`] || 'Descripcion...'} />
                </div>
              </div>
            ))}

            <button onClick={()=>setItems(prev=>[...prev,{nombre:'',precio:'',descripcion:'',categoria:'',foto:'',subiendo:false}])}
              style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:10,padding:'10px',fontFamily:F,fontSize:13,color:'#4B6080',cursor:'pointer',marginBottom:20}}>
              + Agregar {cfg.labelItem.toLowerCase()}
            </button>

            {/* Preguntas frecuentes */}
            <div style={CARD}>
              <label style={LBL}>Preguntas frecuentes de tus clientes</label>
              <p style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.25)',marginBottom:12,fontWeight:300}}>El bot respondera estas preguntas automaticamente</p>
              {preguntas.map((p,i)=>(
                <input key={i} className="wf-inp" style={{...INP,marginBottom:8}} value={p} onChange={e=>setPreguntas(prev=>prev.map((x,j)=>j===i?e.target.value:x))}
                  placeholder={ph[`pregunta${i+1}`] || `Pregunta ${i+1}`} />
              ))}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,background:'rgba(255,255,255,0.03)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px',fontFamily:F,fontSize:13,cursor:'pointer'}}>
                ← Atras
              </button>
              <button onClick={guardarCatalogo} disabled={loading}
                style={{flex:2,background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'12px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,211,102,0.3)',opacity:loading?0.7:1}}>
                {loading?'Guardando...':'Conectar WhatsApp →'}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: QR ── */}
        {step===3 && (
          <div style={{textAlign:'center'}}>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:6}}>Conecta tu WhatsApp</h1>
            <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:32,fontWeight:300}}>Escanea el codigo QR con tu celular para activar el bot.</p>
            {loading && !qrBase64 && (
              <div style={{padding:'60px 0'}}>
                <div style={{width:40,height:40,border:'3px solid rgba(37,211,102,0.2)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}}/>
                <div style={{fontFamily:F,fontSize:13,color:'#4B6080'}}>Preparando tu bot...</div>
              </div>
            )}
            {qrBase64 && (
              <div>
                <div style={{background:'#fff',borderRadius:16,padding:20,display:'inline-block',boxShadow:'0 8px 40px rgba(0,0,0,0.5)',marginBottom:24}}>
                  <img src={qrBase64} alt="QR" style={{width:220,height:220,display:'block'}}/>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'16px 20px',textAlign:'left',marginBottom:20}}>
                  <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF',marginBottom:10}}>Como escanear:</div>
                  {['Abre WhatsApp en tu celular','Ve a Configuracion → Dispositivos vinculados','Toca "Vincular un dispositivo"','Escanea el codigo QR de esta pantalla'].map((t,i)=>(
                    <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:7}}>
                      <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(37,211,102,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:9,fontWeight:700,color:'#25D366',flexShrink:0}}>{i+1}</div>
                      <span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.35)'}}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#F59E0B'}}/>
                  <span style={{fontFamily:F,fontSize:12,color:'#F59E0B'}}>Esperando que escanees el codigo...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 4: LISTO ── */}
        {step===4 && (
          <div style={{textAlign:'center'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(37,211,102,0.1)',border:'2px solid #25D366',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'ok 0.5s ease'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:42,fontWeight:400,letterSpacing:'-1px',color:'#25D366',marginBottom:8}}>Bot activado</h1>
            {numero && <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.35)',marginBottom:20}}>+{numero}</div>}
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.45)',lineHeight:1.7,fontWeight:300,maxWidth:400,margin:'0 auto 28px'}}>
              Tu WhatsApp ya responde automaticamente. Prueba enviando un mensaje al numero conectado.
            </p>
            <div style={{background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12,padding:'16px 20px',marginBottom:24,textAlign:'left'}}>
              {['Responde preguntas sobre tu negocio','Presenta tu catalogo con precios','Agenda citas cuando el cliente lo pida','Captura nombre y telefono del cliente','Te avisa cuando piden asesor humano'].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.45)'}}>{t}</span>
                </div>
              ))}
            </div>
            <a href={`/wasapbot/panel/${empresaId}`}
              style={{display:'block',background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,textAlign:'center',boxShadow:'0 6px 24px rgba(37,211,102,0.3)',marginBottom:10}}>
              Ir a mi panel →
            </a>
            <Link href="/wasapbot" style={{display:'block',background:'rgba(255,255,255,0.03)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px',fontFamily:F,fontSize:13,textAlign:'center'}}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
