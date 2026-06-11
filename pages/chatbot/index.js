// pages/chatbot/index.js — Landing enterprise ChatBot Web
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const DEMOS = [
  { industria:'Restaurante',  color:'#EAB308', msgs:[{r:'c',t:'Hola, quiero ver el menu'},{r:'b',t:'Hola! Hoy tenemos Bandeja paisa $22.000, Sancocho $18.000 y Cazuela $28.000. Te hago el pedido?'},{r:'c',t:'Una bandeja paisa por favor'},{r:'b',t:'Perfecto! Tu pedido: 1x Bandeja Paisa $22.000. Envias a domicilio o recoges en el local?'}] },
  { industria:'Peluquería',   color:'#EC4899', msgs:[{r:'c',t:'Tienen cita disponible hoy?'},{r:'b',t:'Hola! Si, tenemos disponible a las 3pm y 5pm. Que servicio necesitas?'},{r:'c',t:'Corte y tinte'},{r:'b',t:'Para corte y tinte te recomendamos la cita de 3pm (2 horas). Te la reservo a tu nombre?'}] },
  { industria:'Taller',       color:'#EF4444', msgs:[{r:'c',t:'Cuanto sale el cambio de aceite?'},{r:'b',t:'El cambio de aceite sintetico + filtro vale $45.000 e incluye revision de niveles. Tienes disponible hoy o manana?'},{r:'c',t:'Manana en la manana'},{r:'b',t:'Agendado para manana 9am. Te esperamos en la Calle 15 # 28-40. Cualquier cambio avisa!'}] },
  { industria:'Veterinaria',  color:'#10B981', msgs:[{r:'c',t:'Necesito vacunar mi gato'},{r:'b',t:'Con gusto! Para gatos recomendamos el paquete triple felino + rabia: $85.000. Que edad tiene tu gato?'},{r:'c',t:'2 anos'},{r:'b',t:'Perfecto, con 2 anos necesita refuerzo anual. Agendamos para esta semana. Cual dia te queda mejor?'}] },
];

const FEATURES = [
  { icon:'💬', title:'Chat en tiempo real',        desc:'Widget flotante que aparece en tu web. Los visitantes chatean sin salir de tu página.' },
  { icon:'🤖', title:'IA entrenada con tu negocio',desc:'Responde preguntas específicas de tu negocio, cotiza servicios y captura leads automáticamente.' },
  { icon:'🎨', title:'Diseño que combina con tu web',desc:'Personaliza colores, posición y avatar del chat para que se vea como parte de tu sitio.' },
  { icon:'📱', title:'Funciona en móvil y desktop', desc:'El widget es responsive. Tus clientes chatean desde cualquier dispositivo sin fricción.' },
  { icon:'📋', title:'Menú de opciones interactivo', desc:'Botones de respuesta rápida para que el cliente navegue tu catálogo como un menú digital.' },
  { icon:'🔔', title:'Notificaciones en tiempo real', desc:'Recibe aviso inmediato cuando un cliente necesita atención humana.' },
];

const PLANES = [
  { id:'starter',  nombre:'Starter',   precio:129000, convs:'300/mes',  color:'#6B7280', features:['Widget para 1 sitio','Chat IA 24/7','Captura de leads','Panel básico','Soporte email'] },
  { id:'business', nombre:'Business',  precio:290000, convs:'1.000/mes', color:'#2563EB', popular:true, features:['Widget para 3 sitios','Todo lo del Starter','Menú interactivo','Historial de chats','Integración WhatsApp','Soporte prioritario'] },
  { id:'agency',   nombre:'Agency',    precio:590000, convs:'Ilimitadas', color:'#A78BFA', features:['Sitios ilimitados','White-label','API completa','Analytics avanzado','Gestor dedicado','SLA garantizado'] },
];

export default function ChatBotLanding() {
  const router = useRouter();
  const [demo,     setDemo]     = useState(0);
  const [msgIdx,   setMsgIdx]   = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen,  setFaqOpen]  = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setMsgIdx(0);
    const msgs = DEMOS[demo].msgs;
    msgs.forEach((_,i) => {
      setTimeout(() => setMsgIdx(i+1), (i+1)*800);
    });
  }, [demo]);

  const cur = DEMOS[demo];

  return (
    <>
      <Head>
        <title>ChatBot Web — Pon un chat IA en tu sitio web | agencIAme</title>
        <meta name="description" content="Widget de chat con IA para tu página web. Atiende visitantes, muestra tu catálogo y captura leads automáticamente. Desde $129.000 COP/mes." />
        <meta name="keywords" content="chatbot pagina web colombia, widget chat ia, chat en vivo colombia, agenciame chatbot" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        :root { --accent:#2563EB; --bg:#04080C; --card:#080E14; --border:rgba(255,255,255,0.06); }
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);color:#EFF4FF;font-family:${F};overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse-b{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.45)}70%{box-shadow:0 0 0 12px rgba(37,99,235,0)}}
        @keyframes msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dot{0%,60%,100%{opacity:0.25}30%{opacity:1}}
        @keyframes fade-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .cb-nav{position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:0 64px;height:64px;display:flex;align-items:center;justify-content:space-between;transition:background 0.3s}
        .cb-nav.scrolled{background:rgba(4,8,12,0.96)}
        .cb-cta{background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;border:none;border-radius:10px;padding:14px 32px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 6px 28px rgba(37,99,235,0.35)}
        .cb-cta:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(37,99,235,0.5)}
        .cb-feat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px 24px;transition:all 0.2s}
        .cb-feat:hover{border-color:rgba(37,99,235,0.25);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.4)}
        .cb-plan{border-radius:20px;padding:36px 30px;transition:transform 0.2s}
        .cb-plan:hover{transform:translateY(-4px)}
        .cb-demo-btn{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:100px;padding:7px 16px;font-size:12px;cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.4);font-family:${F}}
        .cb-demo-btn:hover{color:#EFF4FF;border-color:rgba(37,99,235,0.3)}
        .cb-demo-btn.on{background:rgba(37,99,235,0.1);border-color:rgba(37,99,235,0.35);color:#60A5FA;font-weight:700}
        @media(max-width:768px){
          .cb-nav{padding:0 20px!important}
          .cb-hero{flex-direction:column!important;padding:70px 20px 50px!important;text-align:center!important}
          .cb-feats{grid-template-columns:1fr!important}
          .cb-plans{grid-template-columns:1fr!important}
          .cb-section{padding:60px 20px!important}
        }
      `}} />

      {/* NAV */}
      <nav className={`cb-nav${scrolled?' scrolled':''}`}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:18}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <div style={{display:'flex',gap:28,alignItems:'center',fontSize:13,color:'rgba(255,255,255,0.4)'}}>
          <a href="#funciones">Funciones</a>
          <a href="#precios">Precios</a>
          <Link href="/wasapbot" style={{color:'rgba(255,255,255,0.4)'}}>WasapBot</Link>
        </div>
        <button onClick={()=>router.push('/chatbot/activar')} className="cb-cta" style={{padding:'9px 22px',fontSize:13,borderRadius:8}}>
          Instalar en mi web →
        </button>
      </nav>

      {/* HERO */}
      <section className="cb-hero cb-section" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:48,padding:'100px 64px 80px',maxWidth:1240,margin:'0 auto'}}>
        <div style={{flex:1,maxWidth:540}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,99,235,0.08)',border:'1px solid rgba(37,99,235,0.2)',borderRadius:100,padding:'6px 16px',marginBottom:28}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#2563EB',animation:'pulse-b 2s infinite'}}/>
            <span style={{fontSize:12,fontWeight:700,color:'#60A5FA'}}>Nuevo — ChatBot para tu página web</span>
          </div>

          <h1 style={{fontFamily:FA,fontSize:'clamp(42px,5vw,68px)',fontWeight:400,lineHeight:1.0,letterSpacing:'-2px',marginBottom:22,color:'#F0F0F0'}}>
            Un chat IA<br/>en tu sitio web.
          </h1>

          <p style={{fontSize:17,color:'rgba(255,255,255,0.4)',lineHeight:1.85,fontWeight:300,marginBottom:36,maxWidth:440}}>
            Instala un widget de chat inteligente en tu página web. Atiende visitantes, muestra tu catálogo y captura leads — automáticamente.
          </p>

          <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',marginBottom:40}}>
            <button onClick={()=>router.push('/chatbot/activar')} className="cb-cta" style={{fontSize:16,padding:'15px 36px'}}>
              Instalar gratis 7 días →
            </button>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.2)'}}>Desde $129.000/mes</div>
          </div>

          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            {['1 línea de código','Sin hosting','Soporte en español'].map(t=>(
              <div key={t} style={{display:'flex',alignItems:'center',gap:7}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.35)'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DEMO WIDGET */}
        <div style={{flexShrink:0,position:'relative',animation:'float 5s ease-in-out infinite'}}>
          {/* Browser frame */}
          <div style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'10px 14px 0',width:340,boxShadow:'0 40px 80px rgba(0,0,0,0.7)'}}>
            {/* Tabs del navegador */}
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {['#EF4444','#F59E0B','#10B981'].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}
              <div style={{flex:1,background:'#1F2937',borderRadius:4,height:12,marginLeft:6}}/>
            </div>

            {/* Contenido de la web simulada */}
            <div style={{background:'#F9FAFB',borderRadius:'8px 8px 0 0',padding:'20px 16px',minHeight:200,position:'relative'}}>
              <div style={{background:'#E5E7EB',height:12,borderRadius:6,marginBottom:8,width:'70%'}}/>
              <div style={{background:'#E5E7EB',height:8,borderRadius:4,marginBottom:6,width:'90%'}}/>
              <div style={{background:'#E5E7EB',height:8,borderRadius:4,marginBottom:6,width:'80%'}}/>
              <div style={{background:'#E5E7EB',height:8,borderRadius:4,width:'60%'}}/>

              {/* Widget de chat */}
              <div style={{position:'absolute',bottom:12,right:12,width:260}}>
                {/* Chat expandido */}
                <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.1)',borderRadius:'14px 14px 14px 14px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',overflow:'hidden',marginBottom:8}}>
                  {/* Header del chat */}
                  <div style={{background:'#2563EB',padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:'#fff'}}>Asistente IA</div>
                      <div style={{fontSize:8,color:'rgba(255,255,255,0.7)'}}>Responde en segundos</div>
                    </div>
                    <div style={{marginLeft:'auto',fontSize:14,color:'rgba(255,255,255,0.6)',cursor:'pointer'}}>✕</div>
                  </div>

                  {/* Mensajes */}
                  <div style={{padding:'10px',maxHeight:160,overflowY:'auto',background:'#F8FAFC',display:'flex',flexDirection:'column',gap:5}}>
                    {cur.msgs.slice(0,msgIdx).map((msg,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:msg.r==='c'?'flex-end':'flex-start',animation:'msg-in 0.25s ease'}}>
                        <div style={{background:msg.r==='c'?'#2563EB':'#fff',color:msg.r==='c'?'#fff':'#111',borderRadius:msg.r==='c'?'10px 10px 2px 10px':'10px 10px 10px 2px',padding:'6px 9px',maxWidth:'85%',fontSize:10,lineHeight:1.4,border:msg.r==='b'?'1px solid #E5E7EB':'none',boxShadow:msg.r==='b'?'0 1px 3px rgba(0,0,0,0.06)':'none'}}>
                          {msg.t}
                        </div>
                      </div>
                    ))}
                    {msgIdx < cur.msgs.length && (
                      <div style={{display:'flex',justifyContent:'flex-start'}}>
                        <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:'10px 10px 10px 2px',padding:'6px 10px',display:'flex',gap:3,alignItems:'center'}}>
                          {[0,0.15,0.3].map((d,i)=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:'#9CA3AF',animation:`dot 1.2s ${d}s ease-in-out infinite`}}/>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div style={{padding:'8px 10px',background:'#fff',borderTop:'1px solid #E5E7EB',display:'flex',gap:6,alignItems:'center'}}>
                    <div style={{flex:1,background:'#F3F4F6',borderRadius:20,padding:'5px 10px',fontSize:9,color:'#9CA3AF'}}>Escribe tu mensaje...</div>
                    <div style={{width:24,height:24,borderRadius:'50%',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </div>
                  </div>
                </div>

                {/* FAB button */}
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(37,99,235,0.5)',cursor:'pointer'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo selector */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:14,justifyContent:'center'}}>
            {DEMOS.map((d,i)=>(
              <button key={i} className={`cb-demo-btn${demo===i?' on':''}`} onClick={()=>setDemo(i)}>
                {d.industria}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONES */}
      <section id="funciones" className="cb-section" style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.01)',padding:'80px 64px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#2563EB',marginBottom:14}}>Funciones</p>
            <h2 style={{fontFamily:FA,fontSize:'clamp(30px,4vw,50px)',fontWeight:400,letterSpacing:'-1.5px',color:'#F0F0F0',marginBottom:12}}>
              Todo lo que necesita<br/>un chat inteligente
            </h2>
          </div>
          <div className="cb-feats" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className="cb-feat">
                <div style={{fontSize:32,marginBottom:16}}>{f.icon}</div>
                <div style={{fontSize:15,fontWeight:700,color:'#EFF4FF',marginBottom:8}}>{f.title}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',lineHeight:1.7,fontWeight:300}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALACION */}
      <section className="cb-section" style={{padding:'80px 64px',maxWidth:900,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#2563EB',marginBottom:14}}>Instalación</p>
          <h2 style={{fontFamily:FA,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0'}}>
            1 línea de código.<br/>Listo en 5 minutos.
          </h2>
        </div>
        <div style={{background:'#080E14',border:'1px solid rgba(37,99,235,0.2)',borderRadius:16,padding:'24px 28px'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:'#60A5FA',lineHeight:1.8}}>
            <span style={{color:'#4B6080'}}>{`<!-- Pega este código antes de </body> -->`}</span><br/>
            <span style={{color:'#F59E0B'}}>{`<script`}</span><br/>
            <span style={{color:'#EFF4FF',paddingLeft:16}}>src=<span style={{color:'#25D366'}}>"https://agenciame.com/widget.js"</span></span><br/>
            <span style={{color:'#EFF4FF',paddingLeft:16}}>data-id=<span style={{color:'#25D366'}}>"TU_ID_AQUI"</span></span><br/>
            <span style={{color:'#F59E0B'}}>{`></script>`}</span>
          </div>
        </div>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.3)',textAlign:'center',marginTop:16,fontWeight:300}}>
          Compatible con WordPress, Wix, Shopify, HTML puro y cualquier plataforma web.
        </p>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="cb-section" style={{background:'rgba(255,255,255,0.01)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'80px 64px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#2563EB',marginBottom:14}}>Precios</p>
            <h2 style={{fontFamily:FA,fontSize:'clamp(30px,4vw,50px)',fontWeight:400,letterSpacing:'-1.5px',color:'#F0F0F0',marginBottom:12}}>Planes para cada tamaño</h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.3)',fontWeight:300}}>7 días gratis · Sin tarjeta · Sin contratos</p>
          </div>
          <div className="cb-plans" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {PLANES.map(plan=>(
              <div key={plan.id} className="cb-plan" style={{background:plan.popular?`linear-gradient(145deg,${plan.color}0D,var(--card))`:'var(--card)',border:`${plan.popular?2:1}px solid ${plan.popular?plan.color+'44':'var(--border)'}`,position:'relative'}}>
                {plan.popular&&<div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',padding:'4px 18px',borderRadius:20,fontSize:11,fontWeight:800,whiteSpace:'nowrap',boxShadow:`0 4px 16px ${plan.color}55`}}>MAS POPULAR</div>}
                <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:plan.color,marginBottom:10}}>{plan.nombre}</div>
                <div style={{fontFamily:FA,fontSize:46,color:plan.color,letterSpacing:'-2px',lineHeight:1,marginBottom:4}}>${new Intl.NumberFormat('es-CO').format(plan.precio)}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.25)',marginBottom:6}}>COP / mes</div>
                <div style={{background:plan.color+'15',color:plan.color,border:`1px solid ${plan.color}30`,borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:600,display:'inline-block',marginBottom:24}}>{plan.convs}</div>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:plan.color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontWeight:300}}>{f}</span>
                  </div>
                ))}
                <button onClick={()=>router.push('/chatbot/activar')} style={{width:'100%',marginTop:24,background:plan.popular?`linear-gradient(135deg,${plan.color},${plan.color}CC)`:'rgba(255,255,255,0.05)',color:plan.popular?'#fff':'rgba(255,255,255,0.6)',border:plan.popular?'none':`1px solid rgba(255,255,255,0.1)`,borderRadius:10,padding:'13px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.2s',boxShadow:plan.popular?`0 6px 24px ${plan.color}44`:'none'}}>
                  Empezar con {plan.nombre} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 64px',textAlign:'center',background:'linear-gradient(180deg,rgba(37,99,235,0.04) 0%,transparent 100%)',borderTop:'1px solid rgba(37,99,235,0.1)'}} className="cb-section">
        <h2 style={{fontFamily:FA,fontSize:'clamp(30px,4.5vw,58px)',fontWeight:400,letterSpacing:'-2px',marginBottom:16,color:'#F0F0F0'}}>
          Convierte visitas<br/><span style={{color:'#2563EB'}}>en clientes.</span>
        </h2>
        <p style={{fontSize:16,color:'rgba(255,255,255,0.3)',marginBottom:36,fontWeight:300}}>
          Instala el chat en tu web hoy. Sin código complicado.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>router.push('/chatbot/activar')} className="cb-cta" style={{fontSize:17,padding:'17px 48px'}}>
            Instalar gratis 7 días →
          </button>
          <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer"
            style={{background:'transparent',color:'#EFF4FF',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'17px 28px',fontSize:15,fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
            Hablar con soporte
          </a>
        </div>
      </section>

      <footer style={{borderTop:'1px solid var(--border)',padding:'32px 64px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <div style={{display:'flex',gap:24,fontSize:12,color:'rgba(255,255,255,0.2)'}}>
          <Link href="/wasapbot">WasapBot</Link>
          <Link href="/chatbot">ChatBot</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.12)'}}>© 2026 NexoTI · Cali, Colombia</div>
      </footer>
    </>
  );
}
