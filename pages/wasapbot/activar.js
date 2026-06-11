// pages/wasapbot/activar.js
// Flujo de activacion del WasapBot: negocio → agente → QR → listo
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const INDUSTRIAS = [
  { value: 'taller',       label: 'Taller / Mecánica',     emoji: '🔧' },
  { value: 'peluqueria',   label: 'Peluquería / Spa',      emoji: '✂️' },
  { value: 'restaurante',  label: 'Restaurante',           emoji: '🍽️' },
  { value: 'barbero',      label: 'Barbería',              emoji: '💈' },
  { value: 'veterinaria',  label: 'Veterinaria',           emoji: '🐾' },
  { value: 'reposteria',   label: 'Repostería / Chef',     emoji: '🎂' },
  { value: 'psicologo',    label: 'Psicología',            emoji: '🧠' },
  { value: 'fotografia',   label: 'Fotografía',            emoji: '📷' },
  { value: 'contador',     label: 'Contaduría',            emoji: '📊' },
  { value: 'acarreos',     label: 'Transporte / Acarreos', emoji: '🚛' },
  { value: 'tienda',       label: 'Tienda / Comercio',     emoji: '🏪' },
  { value: 'gimnasio',     label: 'Gimnasio',              emoji: '💪' },
  { value: 'salud',        label: 'Salud / Clínica',       emoji: '🏥' },
  { value: 'educacion',    label: 'Educación',             emoji: '📚' },
  { value: 'tecnico',      label: 'Soporte Técnico',       emoji: '💻' },
  { value: 'otro',         label: 'Otro negocio',          emoji: '💼' },
];

const STEPS = ['Tu negocio', 'Tus servicios', 'Conecta WhatsApp', 'Listo'];

export default function WasapBotActivar() {
  const router = useRouter();
  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [empresaId,   setEmpresaId]   = useState('');
  const [qrBase64,    setQrBase64]    = useState('');
  const [connected,   setConnected]   = useState(false);
  const [numero,      setNumero]      = useState('');

  // Form step 1
  const [nombre,      setNombre]      = useState('');
  const [industria,   setIndustria]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [email,       setEmail]       = useState('');

  // Form step 2
  const [servicios, setServicios] = useState([
    { nombre: '', precio: '' },
    { nombre: '', precio: '' },
    { nombre: '', precio: '' },
  ]);
  const [horario,   setHorario]   = useState('Lunes a Viernes 8am-6pm');
  const [preguntas, setPreguntas] = useState('');

  const INP = { width:'100%', background:'#0D1420', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 14px', color:'#EFF4FF', fontFamily:F, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 };
  const LBL = { fontFamily:F, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, color:'#4B6080', display:'block', marginBottom:6 };

  // Paso 1 → crear empresa y agente
  const crearAgente = async () => {
    if (!nombre.trim())    { setError('Escribe el nombre de tu negocio'); return; }
    if (!industria)        { setError('Selecciona el tipo de negocio'); return; }
    if (!email.trim())     { setError('Escribe tu correo electrónico'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/wasapbot-crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, industria, descripcion, email }),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Error al crear el agente');
      setEmpresaId(d.empresaId);
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 2 → guardar servicios y avanzar a QR
  const guardarServicios = async () => {
    setLoading(true);
    try {
      await fetch('/api/wasapbot-servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, servicios: servicios.filter(s => s.nombre), horario, preguntas }),
      });
      setStep(3);
      iniciarBot();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Paso 3 → iniciar bot y obtener QR
  const iniciarBot = async () => {
    setLoading(true);
    try {
      const waUrl = process.env.NEXT_PUBLIC_WA_SERVER || 'https://agenciame-whatsapp-server-production.up.railway.app';
      const res = await fetch(`${waUrl}/sesion/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': 'agenciame2026secreto_nexoia' },
        body: JSON.stringify({ empresaId }),
      });
      await res.json();
      // Polling QR
      let intentos = 0;
      const poll = async () => {
        if (intentos++ > 30) { setError('Tiempo agotado. Intenta de nuevo.'); setLoading(false); return; }
        try {
          const r2 = await fetch(`${waUrl}/sesion/${empresaId}/qr`, {
            headers: { 'x-server-secret': 'agenciame2026secreto_nexoia' },
          });
          const d2 = await r2.json();
          if (d2.status === 'connected') {
            setConnected(true); setNumero(d2.numero || ''); setStep(4); setLoading(false); return;
          }
          if (d2.qrBase64) { setQrBase64(d2.qrBase64); setLoading(false); pollConexion(); return; }
        } catch {}
        setTimeout(poll, 2000);
      };
      poll();
    } catch (e) { setError(e.message); setLoading(false); }
  };

  // Polling hasta que se conecte
  const pollConexion = () => {
    let intentos = 0;
    const waUrl = process.env.NEXT_PUBLIC_WA_SERVER || 'https://agenciame-whatsapp-server-production.up.railway.app';
    const check = async () => {
      if (intentos++ > 60) return;
      try {
        const r = await fetch(`${waUrl}/sesion/${empresaId}/status`, {
          headers: { 'x-server-secret': 'agenciame2026secreto_nexoia' },
        });
        const d = await r.json();
        if (d.status === 'connected') { setConnected(true); setNumero(d.numero || ''); setStep(4); return; }
      } catch {}
      setTimeout(check, 3000);
    };
    check();
  };

  return (
    <>
      <Head><title>Activar WasapBot — agencIAme</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F}}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        .wb-inp:focus{border-color:rgba(37,211,102,0.5)!important;outline:none}
        .wb-ind-btn{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 10px;cursor:pointer;transition:all 0.15s;text-align:center;color:#6B7A99;font-family:${F};font-size:12px;font-weight:600}
        .wb-ind-btn:hover{border-color:rgba(37,211,102,0.3);color:#EFF4FF}
        .wb-ind-btn.on{background:rgba(37,211,102,0.08);border-color:rgba(37,211,102,0.4);color:#25D366}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes check-in{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
      `}} />

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 40px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/wasapbot"><span style={{fontFamily:FA,fontSize:17,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me <span style={{color:'#25D366',fontSize:14,fontFamily:F,fontWeight:600}}>WasapBot</span></span></Link>
        <Link href="/wasapbot" style={{fontFamily:F,fontSize:12,color:'#4B6080'}}>← Volver</Link>
      </nav>

      <div style={{maxWidth:580,margin:'0 auto',padding:'48px 24px'}}>

        {/* STEPPER */}
        <div style={{display:'flex',alignItems:'center',marginBottom:48}}>
          {STEPS.map((s,i) => {
            const done = step > i+1, cur = step === i+1;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:done?'#25D366':cur?'rgba(37,211,102,0.15)':'#0D1420',border:`1px solid ${done?'#25D366':cur?'rgba(37,211,102,0.5)':'rgba(255,255,255,0.08)'}`,fontFamily:F,fontSize:11,fontWeight:700,color:done?'#fff':cur?'#25D366':'#4B6080',flexShrink:0,transition:'all 0.3s'}}>
                    {done ? '✓' : i+1}
                  </div>
                  <span style={{fontFamily:F,fontSize:11,fontWeight:cur?700:400,color:cur?'#EFF4FF':done?'#25D366':'#4B6080',display:'none',...(cur?{display:'block'}:{})}}>{s}</span>
                </div>
                {i < STEPS.length-1 && <div style={{flex:1,height:1,background:done?'#25D366':'rgba(255,255,255,0.06)',margin:'0 10px',minWidth:20}}/>}
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:F,fontSize:13,color:'#EF4444'}}>
            {error}
          </div>
        )}

        {/* PASO 1 — DATOS DEL NEGOCIO */}
        {step === 1 && (
          <div>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:6}}>Tu negocio</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32,fontWeight:300}}>Cuéntanos de qué se trata para configurar tu bot correctamente.</p>

            <div style={{marginBottom:20}}>
              <span style={LBL}>Nombre de tu negocio *</span>
              <input className="wb-inp" style={INP} placeholder="Ej: Peluquería Valeria, Taller Don Jorge..." value={nombre} onChange={e=>setNombre(e.target.value)} />
            </div>

            <div style={{marginBottom:20}}>
              <span style={LBL}>Tipo de negocio *</span>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {INDUSTRIAS.map(i => (
                  <button key={i.value} className={`wb-ind-btn${industria===i.value?' on':''}`} onClick={() => setIndustria(i.value)}>
                    <div style={{fontSize:22,marginBottom:4}}>{i.emoji}</div>
                    <div style={{fontSize:10,lineHeight:1.2}}>{i.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <span style={LBL}>Descripcion de tu negocio (opcional)</span>
              <textarea className="wb-inp" style={{...INP,resize:'vertical',minHeight:80,marginBottom:0}} placeholder="Ej: Somos una peluqueria especializada en cortes modernos y tintes. Atendemos con cita previa..." value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
            </div>

            <div style={{marginBottom:28}}>
              <span style={LBL}>Tu correo electronico *</span>
              <input className="wb-inp" style={INP} type="email" placeholder="tucorreo@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>

            <button onClick={crearAgente} disabled={loading}
              style={{width:'100%',background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,211,102,0.35)',opacity:loading?0.7:1}}>
              {loading ? 'Creando tu agente...' : 'Continuar →'}
            </button>
          </div>
        )}

        {/* PASO 2 — SERVICIOS */}
        {step === 2 && (
          <div>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:6}}>Tus servicios</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32,fontWeight:300}}>Con esta info el bot cotiza y responde preguntas correctamente.</p>

            <div style={{marginBottom:20}}>
              <span style={LBL}>Servicios y precios (escribe los principales)</span>
              {servicios.map((sv,i) => (
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:8}}>
                  <input className="wb-inp" style={{...INP,marginBottom:0}} placeholder={`Servicio ${i+1} (ej: Corte de cabello)`} value={sv.nombre} onChange={e=>setServicios(s=>s.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} />
                  <input className="wb-inp" style={{...INP,marginBottom:0}} placeholder="Precio" value={sv.precio} onChange={e=>setServicios(s=>s.map((x,j)=>j===i?{...x,precio:e.target.value}:x))} />
                </div>
              ))}
              <button onClick={() => setServicios(s=>[...s,{nombre:'',precio:''}])}
                style={{background:'none',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 16px',fontFamily:F,fontSize:12,color:'#4B6080',cursor:'pointer',marginTop:4}}>
                + Agregar servicio
              </button>
            </div>

            <div style={{marginBottom:20}}>
              <span style={LBL}>Horario de atencion</span>
              <input className="wb-inp" style={INP} placeholder="Ej: Lunes a Viernes 8am-6pm, Sabados 9am-2pm" value={horario} onChange={e=>setHorario(e.target.value)} />
            </div>

            <div style={{marginBottom:28}}>
              <span style={LBL}>Preguntas frecuentes de tus clientes (opcional)</span>
              <textarea className="wb-inp" style={{...INP,resize:'vertical',minHeight:80,marginBottom:0}} placeholder="Ej: Hacen domicilios? Aceptan tarjeta? Tienen parqueadero?..." value={preguntas} onChange={e=>setPreguntas(e.target.value)} />
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={() => setStep(1)} style={{flex:1,background:'rgba(255,255,255,0.04)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'13px',fontFamily:F,fontSize:14,cursor:'pointer'}}>
                ← Atrás
              </button>
              <button onClick={guardarServicios} disabled={loading}
                style={{flex:2,background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:12,padding:'13px',fontFamily:F,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(37,211,102,0.35)',opacity:loading?0.7:1}}>
                {loading ? 'Guardando...' : 'Conectar WhatsApp →'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — QR */}
        {step === 3 && (
          <div style={{textAlign:'center'}}>
            <h1 style={{fontFamily:FA,fontSize:36,fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:6}}>Conecta tu WhatsApp</h1>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32,fontWeight:300}}>Escanea el codigo QR con tu celular para activar el bot.</p>

            {loading && !qrBase64 && (
              <div style={{padding:'60px 0'}}>
                <div style={{width:40,height:40,border:'3px solid rgba(37,211,102,0.2)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 20px'}}/>
                <div style={{fontFamily:F,fontSize:14,color:'#4B6080'}}>Preparando tu bot...</div>
              </div>
            )}

            {qrBase64 && (
              <div>
                <div style={{background:'#fff',borderRadius:16,padding:20,display:'inline-block',boxShadow:'0 8px 40px rgba(0,0,0,0.5)',marginBottom:24}}>
                  <img src={qrBase64} alt="QR WhatsApp" style={{width:220,height:220,display:'block'}} />
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'16px 20px',textAlign:'left',marginBottom:20}}>
                  <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:10}}>Como escanear:</div>
                  {['Abre WhatsApp en tu celular','Ve a Configuracion → Dispositivos vinculados','Toca "Vincular un dispositivo"','Escanea el codigo QR de esta pantalla'].map((t,i)=>(
                    <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
                      <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(37,211,102,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:10,fontWeight:700,color:'#25D366',flexShrink:0}}>{i+1}</div>
                      <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.4)'}}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'#F59E0B'}}/>
                  <span style={{fontFamily:F,fontSize:12,color:'#F59E0B'}}>Esperando que escanees el codigo...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 4 — LISTO */}
        {step === 4 && (
          <div style={{textAlign:'center'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(37,211,102,0.12)',border:'2px solid #25D366',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'check-in 0.5s ease'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:40,fontWeight:400,letterSpacing:'-1px',color:'#25D366',marginBottom:8}}>Bot activado</h1>
            {numero && <div style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,0.4)',marginBottom:24}}>Numero conectado: +{numero}</div>}
            <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.7,fontWeight:300,maxWidth:400,margin:'0 auto 32px'}}>
              Tu WhatsApp ya esta respondiendo automaticamente con la informacion de <strong style={{color:'#EFF4FF'}}>{nombre}</strong>. Prueba enviandote un mensaje.
            </p>
            <div style={{background:'rgba(37,211,102,0.06)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:28,textAlign:'left'}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#25D366',marginBottom:8}}>Tu bot ya puede:</div>
              {['Responder preguntas sobre tu negocio','Cotizar tus servicios automaticamente','Agendar citas cuando el cliente lo pida','Capturar el nombre y telefono de cada cliente','Avisarte cuando alguien necesita atencion humana'].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.5)'}}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10,flexDirection:'column'}}>
              <a href="https://wa.me/573105056616?text=Hola, acabo de activar mi WasapBot y quiero saber mas sobre los planes"
                target="_blank" rel="noreferrer"
                style={{background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',borderRadius:12,padding:'14px',fontFamily:F,fontSize:15,fontWeight:700,textAlign:'center',boxShadow:'0 6px 24px rgba(37,211,102,0.35)'}}>
                Hablar con un asesor →
              </a>
              <Link href="/wasapbot" style={{background:'rgba(255,255,255,0.04)',color:'#8A9BB5',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'13px',fontFamily:F,fontSize:14,textAlign:'center'}}>
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
