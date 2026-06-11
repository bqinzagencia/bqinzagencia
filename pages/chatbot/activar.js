// pages/chatbot/activar.js
// Flujo de activacion del ChatBot Web — 4 pasos
import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { INDUSTRIAS_WB, getConfigIndustria } from '../../lib/wasapbotConfig';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const CLOUD  = 'dsomqay6y';
const PRESET = 'cadegran_fotos';
const STEPS  = ['Tu negocio', 'Tu catálogo', 'Personaliza el chat', 'Listo'];

const COLORES = ['#2563EB','#7C3AED','#059669','#DC2626','#D97706','#0891B2','#BE185D','#374151'];

export default function ChatBotActivar() {
  const router = useRouter();
  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [chatbotId, setChatbotId] = useState('');

  // Paso 1
  const [nombre,      setNombre]      = useState('');
  const [industria,   setIndustria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [email,       setEmail]       = useState('');
  const [horario,     setHorario]     = useState('');
  const [ciudad,      setCiudad]      = useState('');
  const [whatsapp,    setWhatsapp]    = useState('');

  // Paso 2
  const [items, setItems] = useState([
    { nombre:'', precio:'', descripcion:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', foto:'', subiendo:false },
    { nombre:'', precio:'', descripcion:'', foto:'', subiendo:false },
  ]);
  const [preguntas, setPreguntas] = useState(['','','']);
  const fileRefs = useRef([]);

  // Paso 3 — personalizacion
  const [colorChat,  setColorChat]  = useState('#2563EB');
  const [posicion,   setPosicion]   = useState('derecha');
  const [saludo,     setSaludo]     = useState('');
  const [avatarUrl,  setAvatarUrl]  = useState('');
  const avatarRef = useRef(null);

  const cfg = industria ? getConfigIndustria(industria) : null;
  const ph  = cfg?.placeholders || {};

  const INP = { width:'100%', background:'#0D1420', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'11px 13px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
  const LBL = { fontFamily:F, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, color:'#4B6080', display:'block', marginBottom:5 };
  const CARD = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:14 };

  const subirFoto = async (file, idx) => {
    setItems(p=>p.map((it,i)=>i===idx?{...it,subiendo:true}:it));
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', PRESET); fd.append('folder','chatbot/catalogo');
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,{method:'POST',body:fd});
      const d = await r.json();
      setItems(p=>p.map((it,i)=>i===idx?{...it,foto:d.secure_url,subiendo:false}:it));
    } catch { setItems(p=>p.map((it,i)=>i===idx?{...it,subiendo:false}:it)); }
  };

  const subirAvatar = async (file) => {
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('upload_preset', PRESET); fd.append('folder','chatbot/avatares');
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,{method:'POST',body:fd});
      const d = await r.json();
      setAvatarUrl(d.secure_url);
    } catch {}
  };

  // Paso 1 → crear chatbot
  const crearChatbot = async () => {
    if (!nombre.trim())  { setError('Escribe el nombre de tu negocio'); return; }
    if (!industria)      { setError('Selecciona el tipo de negocio'); return; }
    if (!email.trim())   { setError('Escribe tu correo electrónico'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/chatbot-crear', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ nombre, industria, descripcion, email, horario, ciudad, whatsapp }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setChatbotId(d.chatbotId);
      setSaludo(`Hola, bienvenido a ${nombre}. En que puedo ayudarte?`);
      setStep(2);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 2 → guardar catalogo
  const guardarCatalogo = async () => {
    setLoading(true);
    try {
      const itemsValidos = items.filter(it=>it.nombre.trim());
      const pFiltradas   = preguntas.filter(p=>p.trim()).map(p=>({pregunta:p,respuesta:''}));
      await fetch('/api/chatbot-servicios', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ chatbotId, servicios:itemsValidos, horario, preguntas:pFiltradas, permitePedidos:cfg?.permitePedidos||false }),
      });
      setStep(3);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 3 → guardar personalizacion y finalizar
  const finalizar = async () => {
    setLoading(true);
    try {
      await fetch('/api/chatbot-config', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ chatbotId, colorChat, posicion, saludo, avatarUrl }),
      });
      setStep(4);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Preview del widget
  const WidgetPreview = () => (
    <div style={{ position:'relative', width:260, flexShrink:0 }}>
      <div style={{ background:'#fff', border:`1px solid rgba(0,0,0,0.1)`, borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', overflow:'hidden', marginBottom:10 }}>
        <div style={{ background:colorChat, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}} />
            : <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
          }
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#fff'}}>{nombre||'Tu negocio'}</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.7)'}}>En linea · responde ya</div>
          </div>
        </div>
        <div style={{padding:10,background:'#F8FAFC',minHeight:80,display:'flex',flexDirection:'column',gap:5}}>
          <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:'10px 10px 10px 2px',padding:'7px 10px',maxWidth:'85%',fontSize:11,lineHeight:1.4,color:'#111'}}>
            {saludo||`Hola, bienvenido a ${nombre||'nuestro negocio'}. En que puedo ayudarte?`}
          </div>
          {items.filter(it=>it.nombre).slice(0,2).map((it,i)=>(
            <button key={i} style={{alignSelf:'flex-start',background:colorChat+'12',color:colorChat,border:`1px solid ${colorChat}30`,borderRadius:20,padding:'4px 10px',fontSize:9,fontWeight:600,cursor:'pointer'}}>
              {it.nombre} — ${it.precio||''}
            </button>
          ))}
        </div>
        <div style={{padding:'6px 8px',background:'#fff',borderTop:'1px solid #E5E7EB',display:'flex',gap:5,alignItems:'center'}}>
          <div style={{flex:1,background:'#F3F4F6',borderRadius:20,padding:'4px 8px',fontSize:9,color:'#9CA3AF'}}>Escribe tu mensaje...</div>
          <div style={{width:22,height:22,borderRadius:'50%',background:colorChat,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </div>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:posicion==='derecha'?'flex-end':'flex-start'}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:colorChat,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${colorChat}55`,cursor:'pointer'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>Activar ChatBot Web — agencIAme</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        .cf-inp:focus{border-color:rgba(37,99,235,0.45)!important}
        .cf-ind{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 8px;cursor:pointer;transition:all 0.15s;text-align:center;color:#6B7A99;font-family:${F};font-size:11px;font-weight:600}
        .cf-ind:hover{border-color:rgba(37,99,235,0.3);color:#EFF4FF}
        .cf-ind.on{background:rgba(37,99,235,0.08);border-color:rgba(37,99,235,0.4);color:#60A5FA}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ok{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
      `}} />

      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/chatbot"><span style={{fontFamily:FA,fontSize:16,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me <span style={{color:'#2563EB',fontSize:13,fontFamily:F,fontWeight:700}}>ChatBot</span></span></Link>
        <Link href="/chatbot" style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>← Volver</Link>
      </nav>

      <div style={{maxWidth:700,margin:'0 auto',padding:'44px 20px 80px'}}>

        {/* STEPPER */}
        <div style={{display:'flex',alignItems:'center',marginBottom:44}}>
          {STEPS.map((s,i)=>{
            const done=step>i+1, cur=step===i+1;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:done?'#2563EB':cur?'rgba(37,99,235,0.12)':'#0D1420',border:`1px solid ${done?'#2563EB':cur?'rgba(37,99,235,0.5)':'rgba(255,255,255,0.07)'}`,fontFamily:F,fontSize:10,fontWeight:700,color:done?'#fff':cur?'#60A5FA':'#4B6080',flexShrink:0}}>
                    {done?'✓':i+1}
                  </div>
                  {cur&&<span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#EFF4FF'}}>{s}</span>}
                </div>
                {i<STEPS.length-1&&<div style={{flex:1,height:1,background:done?'#2563EB':'rgba(255,255,255,0.06)',margin:'0 8px',minWidth:16}}/>}
              </div>
            );
          })}
        </div>

        {error&&<div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:'#EF4444'}}>{error}</div>}

        {/* PASO 1 */}
        {step===1&&(
          <div>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:4}}>Tu negocio</h1>
            <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:28,fontWeight:300}}>Configura el ChatBot con la información de tu negocio.</p>

            <div style={CARD}>
              <label style={LBL}>Nombre del negocio *</label>
              <input className="cf-inp" style={INP} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder={ph.nombre||'Ej: Mi negocio...'} />
              <label style={{...LBL,marginTop:14}}>Tipo de negocio *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:4}}>
                {INDUSTRIAS_WB.map(i=>(
                  <button key={i.value} className={`cf-ind${industria===i.value?' on':''}`} onClick={()=>setIndustria(i.value)}>
                    <div style={{fontSize:20,marginBottom:3}}>{i.emoji}</div>
                    <div style={{fontSize:9,lineHeight:1.2}}>{i.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={CARD}>
              <label style={LBL}>Descripcion del negocio</label>
              <textarea className="cf-inp" style={{...INP,resize:'vertical',minHeight:75}} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder={ph.descripcion||'Describe tu negocio...'} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                <div>
                  <label style={LBL}>Ciudad</label>
                  <input className="cf-inp" style={INP} value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Cali, Bogota..." />
                </div>
                <div>
                  <label style={LBL}>Horario</label>
                  <input className="cf-inp" style={INP} value={horario} onChange={e=>setHorario(e.target.value)} placeholder={ph.horario||'Lun-Vie 8am-6pm'} />
                </div>
                <div>
                  <label style={LBL}>WhatsApp (opcional)</label>
                  <input className="cf-inp" style={INP} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="3105056616" />
                </div>
                <div>
                  <label style={LBL}>Correo *</label>
                  <input className="cf-inp" style={INP} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@gmail.com" />
                </div>
              </div>
            </div>

            <button onClick={crearChatbot} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#2563EB,#1D4ED8)',color:'#fff',border:'none',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,99,235,0.3)',opacity:loading?0.7:1}}>
              {loading?'Creando tu ChatBot...':'Continuar →'}
            </button>
          </div>
        )}

        {/* PASO 2 — CATALOGO */}
        {step===2&&cfg&&(
          <div>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:4}}>{cfg.labelCatalogo}</h1>
            <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:28,fontWeight:300}}>El chat mostrará tu catálogo con botones interactivos.{cfg.permitePedidos&&<span style={{color:'#2563EB',fontWeight:600}}> Los clientes podrán acumular pedidos.</span>}</p>

            {items.map((item,idx)=>(
              <div key={idx} style={CARD}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#EFF4FF'}}>{cfg.labelItem} {idx+1}</span>
                  {items.length>1&&<button onClick={()=>setItems(p=>p.filter((_,i)=>i!==idx))} style={{background:'none',border:'none',color:'#4B6080',cursor:'pointer',fontSize:16}}>✕</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:cfg.tieneFoto?'1fr auto':'1fr',gap:12,marginBottom:10}}>
                  <div>
                    <label style={LBL}>{cfg.labelItem}</label>
                    <input className="cf-inp" style={INP} value={item.nombre} onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,nombre:e.target.value}:it))} placeholder={ph[`item${idx+1}`]||`Nombre del ${cfg.labelItem.toLowerCase()}`} />
                  </div>
                  {cfg.tieneFoto&&(
                    <div>
                      <label style={LBL}>Foto</label>
                      <input ref={el=>fileRefs.current[idx]=el} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)subirFoto(f,idx);}} />
                      {item.foto
                        ? <div style={{position:'relative',width:64,height:64}}><img src={item.foto} style={{width:64,height:64,objectFit:'cover',borderRadius:8}}/><button onClick={()=>setItems(p=>p.map((it,i)=>i===idx?{...it,foto:''}:it))} style={{position:'absolute',top:-6,right:-6,background:'#EF4444',border:'none',borderRadius:'50%',width:18,height:18,color:'#fff',cursor:'pointer',fontSize:10}}>✕</button></div>
                        : <div onClick={()=>fileRefs.current[idx]?.click()} style={{width:64,height:64,border:'2px dashed rgba(255,255,255,0.1)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:20,color:'#4B6080'}}>{item.subiendo?<div style={{width:18,height:18,border:'2px solid rgba(37,99,235,0.3)',borderTop:'2px solid #2563EB',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>:'+'}</div>
                      }
                    </div>
                  )}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label style={LBL}>{cfg.labelPrecio}</label>
                    <input className="cf-inp" style={INP} value={item.precio} onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,precio:e.target.value}:it))} placeholder={ph[`precio${idx+1}`]||'0'} />
                  </div>
                  <div>
                    <label style={LBL}>{cfg.labelDescripcion}</label>
                    <input className="cf-inp" style={INP} value={item.descripcion} onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,descripcion:e.target.value}:it))} placeholder={ph[`desc${idx+1}`]||'Descripcion...'} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={()=>setItems(p=>[...p,{nombre:'',precio:'',descripcion:'',foto:'',subiendo:false}])} style={{width:'100%',background:'none',border:'1px dashed rgba(255,255,255,0.08)',borderRadius:10,padding:'9px',fontFamily:F,fontSize:12,color:'#4B6080',cursor:'pointer',marginBottom:16}}>
              + Agregar {cfg.labelItem.toLowerCase()}
            </button>

            <div style={CARD}>
              <label style={LBL}>Preguntas frecuentes</label>
              {preguntas.map((p,i)=>(
                <input key={i} className="cf-inp" style={{...INP,marginBottom:8}} value={p} onChange={e=>setPreguntas(prev=>prev.map((x,j)=>j===i?e.target.value:x))} placeholder={ph[`pregunta${i+1}`]||`Pregunta ${i+1}`} />
              ))}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,background:'rgba(255,255,255,0.03)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px',fontFamily:F,fontSize:13,cursor:'pointer'}}>← Atras</button>
              <button onClick={guardarCatalogo} disabled={loading} style={{flex:2,background:'linear-gradient(135deg,#2563EB,#1D4ED8)',color:'#fff',border:'none',borderRadius:12,padding:'12px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,99,235,0.3)',opacity:loading?0.7:1}}>
                {loading?'Guardando...':'Personalizar chat →'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — PERSONALIZACION */}
        {step===3&&(
          <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:280}}>
              <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:4}}>Personaliza</h1>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.3)',marginBottom:24,fontWeight:300}}>Ajusta el chat para que combine con tu marca.</p>

              <div style={CARD}>
                <label style={LBL}>Color del chat</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
                  {COLORES.map(c=>(
                    <div key={c} onClick={()=>setColorChat(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:colorChat===c?'3px solid #EFF4FF':'3px solid transparent',transition:'all 0.15s'}}/>
                  ))}
                </div>
              </div>

              <div style={CARD}>
                <label style={LBL}>Posicion del boton</label>
                <div style={{display:'flex',gap:8}}>
                  {['derecha','izquierda'].map(p=>(
                    <button key={p} onClick={()=>setPosicion(p)} style={{flex:1,background:posicion===p?`rgba(37,99,235,0.1)`:'rgba(255,255,255,0.03)',border:`1px solid ${posicion===p?'rgba(37,99,235,0.4)':'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'9px',fontFamily:F,fontSize:12,color:posicion===p?'#60A5FA':'#6B7A99',cursor:'pointer',textTransform:'capitalize'}}>
                      {p==='derecha'?'Derecha →':'← Izquierda'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={CARD}>
                <label style={LBL}>Mensaje de saludo</label>
                <textarea className="cf-inp" style={{...INP,resize:'vertical',minHeight:70}} value={saludo} onChange={e=>setSaludo(e.target.value)} placeholder={`Hola, bienvenido a ${nombre}. En que puedo ayudarte?`} />
              </div>

              <div style={CARD}>
                <label style={LBL}>Avatar del chat (opcional)</label>
                <input ref={avatarRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)subirAvatar(f);}} />
                {avatarUrl
                  ? <div style={{display:'flex',gap:10,alignItems:'center'}}><img src={avatarUrl} style={{width:48,height:48,borderRadius:'50%',objectFit:'cover'}}/><button onClick={()=>setAvatarUrl('')} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'none',borderRadius:8,padding:'6px 12px',fontFamily:F,fontSize:12,cursor:'pointer'}}>Quitar</button></div>
                  : <button onClick={()=>avatarRef.current?.click()} style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 16px',fontFamily:F,fontSize:12,color:'#4B6080',cursor:'pointer'}}>+ Subir foto de perfil del bot</button>
                }
              </div>

              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setStep(2)} style={{flex:1,background:'rgba(255,255,255,0.03)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px',fontFamily:F,fontSize:13,cursor:'pointer'}}>← Atras</button>
                <button onClick={finalizar} disabled={loading} style={{flex:2,background:'linear-gradient(135deg,#2563EB,#1D4ED8)',color:'#fff',border:'none',borderRadius:12,padding:'12px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,99,235,0.3)',opacity:loading?0.7:1}}>
                  {loading?'Creando tu ChatBot...':'Finalizar y obtener código →'}
                </button>
              </div>
            </div>

            {/* Preview live */}
            <div style={{flexShrink:0}}>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#4B6080',marginBottom:12}}>Vista previa en vivo</div>
              <WidgetPreview />
            </div>
          </div>
        )}

        {/* PASO 4 — LISTO */}
        {step===4&&(
          <div style={{textAlign:'center'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(37,99,235,0.1)',border:'2px solid #2563EB',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'ok 0.5s ease'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:42,fontWeight:400,letterSpacing:'-1px',color:'#2563EB',marginBottom:8}}>ChatBot listo</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.4)',lineHeight:1.7,fontWeight:300,maxWidth:400,margin:'0 auto 28px'}}>
              Tu ChatBot esta listo. Instálalo en tu web con este código:
            </p>

            <div style={{background:'#080E14',border:'1px solid rgba(37,99,235,0.2)',borderRadius:12,padding:'18px 20px',marginBottom:20,textAlign:'left',fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'#60A5FA',lineHeight:1.8}}>
              <span style={{color:'#4B6080'}}>{`<!-- Pega antes de </body> -->`}</span><br/>
              <span style={{color:'#F59E0B'}}>{`<script`}</span><br/>
              <span style={{paddingLeft:16,color:'#EFF4FF'}}>src=<span style={{color:'#25D366'}}>"https://agenciame.com/widget.js"</span></span><br/>
              <span style={{paddingLeft:16,color:'#EFF4FF'}}>data-id=<span style={{color:'#25D366'}}>"{chatbotId}"</span></span><br/>
              <span style={{color:'#F59E0B'}}>{`></script>`}</span>
            </div>

            <button onClick={()=>{navigator.clipboard.writeText(`<script\n  src="https://agenciame.com/widget.js"\n  data-id="${chatbotId}"\n></script>`);}} style={{background:'rgba(37,99,235,0.1)',color:'#60A5FA',border:'1px solid rgba(37,99,235,0.25)',borderRadius:10,padding:'10px 24px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:20,display:'block',width:'100%'}}>
              Copiar código al portapapeles
            </button>

            <Link href={`/chatbot/panel/${chatbotId}`} style={{display:'block',background:'linear-gradient(135deg,#2563EB,#1D4ED8)',color:'#fff',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,textAlign:'center',boxShadow:'0 6px 24px rgba(37,99,235,0.3)',marginBottom:10}}>
              Ir a mi panel →
            </Link>
            <Link href="/chatbot" style={{display:'block',background:'rgba(255,255,255,0.03)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px',fontFamily:F,fontSize:13,textAlign:'center'}}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
