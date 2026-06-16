// pages/wasapbot/index.js — Landing enterprise nivel Interakt/WATI
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const INDUSTRIAS = [
  { value:'restaurante', label:'Restaurante',    emoji:'🍽️', msg:['¿Cómo va el negocio hoy?','Hoy vendiste $340.000 en 14 pedidos. Bandeja paisa fue lo más pedido — quedan solo 3 porciones, prepara más para mañana.'] },
  { value:'barbero',     label:'Barbería',       emoji:'💈', msg:['Resumen del día','9 cortes hoy ($315.000). Mañana tienes 6 citas confirmadas y 2 espacios libres en la tarde.'] },
  { value:'taller',      label:'Taller',         emoji:'🔧', msg:['¿Cómo va el inventario de repuestos?','Hoy se usaron 4 filtros de aceite. Quedan solo 2 en stock — te recomiendo pedir más antes del viernes.'] },
  { value:'veterinaria', label:'Veterinaria',    emoji:'🐾', msg:['Resumen del día','5 consultas hoy ($180.000). Stock de vacuna antirrábica: quedan 3 dosis, pide más pronto.'] },
  { value:'peluqueria',  label:'Peluquería',     emoji:'✂️', msg:['¿Cómo van las ventas de hoy?','7 citas atendidas, $245.000. El tinte rubio cenizo esta casi agotado — queda 1 unidad.'] },
  { value:'contador',    label:'Contaduría',     emoji:'📊', msg:['Resumen de la semana','12 clientes atendidos esta semana. 3 declaraciones pendientes por entregar antes del viernes.'] },
  { value:'reposteria',  label:'Repostería',     emoji:'🎂', msg:['¿Cómo van las ventas de hoy?','Vendiste 8 tortas ($640.000). Te quedan solo 2kg de harina — alerta de stock bajo.'] },
  { value:'fotografia',  label:'Fotografía',     emoji:'📷', msg:['¿Cómo va el mes?','3 sesiones agendadas esta semana, $8.400.000 en cotizaciones enviadas. 1 sesión por confirmar pago.'] },
];

const STATS = [
  { num:'2.4M+', label:'Mensajes respondidos', svg:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  { num:'98%',   label:'Tasa de respuesta',    svg:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
  { num:'< 3s',  label:'Tiempo de respuesta',  svg:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { num:'24/7',  label:'Disponibilidad',       svg:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
];

const FEAT_ICONS = [
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
];

const IND_IMGS = {
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  barbero:     'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80',
  taller:      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&q=80',
  veterinaria: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
  peluqueria:  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
  contador:    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
  reposteria:  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80',
  fotografia:  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=80',
};

const FEATURES = [
  { icon:'🤖', title:'IA entrenada con tu negocio',   desc:'El bot aprende tus servicios, precios, horarios y responde como si fueras tú. Sin respuestas genéricas.' },
  { icon:'📋', title:'Catálogo digital interactivo',  desc:'Muestra fotos, precios y descripciones de tus productos. Los clientes navegan y hacen pedidos directo por WhatsApp.' },
  { icon:'📅', title:'Agendamiento automático',       desc:'El bot confirma citas, envía recordatorios y maneja tu agenda. Sin llamadas, sin mensajes manuales.' },
  { icon:'👤', title:'Captura leads automáticamente', desc:'Registra nombre, teléfono y motivo de cada cliente. Tu CRM crece solo mientras el bot trabaja.' },
  { icon:'🔔', title:'Alertas cuando te necesitan',   desc:'Si el cliente pide hablar con una persona, recibes notificación inmediata por WhatsApp.' },
  { icon:'📊', title:'Panel de control propio',       desc:'Ve conversaciones, consumo de mensajes y estadísticas en tiempo real desde tu panel personal.' },
];

const PLANES = [
  { id:'basico',   nombre:'Básico',   precio:189000,  tokens:'50.000',  convs:'~500/mes',  color:'#6B7280', features:['Bot WhatsApp 24/7','Catálogo de productos','Libreta de clientes automática','Panel de estadísticas','Soporte por WhatsApp'] },
  { id:'estandar', nombre:'Estándar', precio:390000,  tokens:'150.000', convs:'~1.500/mes', color:'#2563EB', popular:true, features:['Todo lo del Básico','Sistema de pedidos','Hasta 1.500 conversaciones','Agendamiento automático','Reportes detallados','Soporte prioritario'] },
  { id:'pro',      nombre:'Pro',      precio:690000,  tokens:'400.000', convs:'~4.000/mes', color:'#A78BFA', features:['Todo lo del Estándar','Hasta 4.000 conversaciones','Catálogo con fotos HD','Integración con tu web','Panel avanzado de analytics','CRM avanzado de clientes','Gestor dedicado'] },
];

const FAQS = [
  { q:'¿Necesito saber programar?', r:'No. La configuración se hace en menos de 10 minutos desde un formulario web. Sin código, sin técnicos.' },
  { q:'¿Funciona con mi número actual de WhatsApp?', r:'Sí. Usas el mismo número que ya tienes. Solo escaneas un código QR una vez y listo.' },
  { q:'¿Qué pasa cuando se acaban los mensajes del plan?', r:'El bot avisa automáticamente y puedes ampliar tu plan o esperar al siguiente mes. Nunca se corta sin avisar.' },
  { q:'¿Puedo cancelar cuando quiero?', r:'Sí. No hay contratos ni permanencia mínima. Cancelas cuando quieras desde WhatsApp al 310-505-6616.' },
  { q:'¿El bot responde en español colombiano?', r:'Sí, habla en español natural colombiano. No es un bot rígido — entiende preguntas libres y responde con contexto.' },
  { q:'¿Cuánto tiempo tarda la configuración?', r:'Menos de 10 minutos. Llenas el formulario, subes tus productos/servicios, escaneas el QR y tu bot está activo.' },
];

export default function WasapBotLanding() {
  const router = useRouter();
  const [ind,       setInd]       = useState(0);
  const [msgStep,   setMsgStep]   = useState(0);
  const [faqOpen,   setFaqOpen]   = useState(null);
  const [scrolled,  setScrolled]  = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Rotar industrias automáticamente
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setInd(i => (i + 1) % INDUSTRIAS.length);
      setMsgStep(0);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMsgStep(1), 1200);
    return () => clearTimeout(t);
  }, [ind]);

  const cur = INDUSTRIAS[ind];

  return (
    <>
      <Head>
        <title>WasapBot — Tu WhatsApp responde solo | agencIAme</title>
        <meta name="description" content="Automatiza tu WhatsApp con IA. Atiende clientes, agenda citas y vende productos las 24 horas. Actívalo en 10 minutos. Desde $189.000 COP/mes." />
        <meta name="keywords" content="bot whatsapp colombia, automatizar whatsapp negocio, chatbot whatsapp cali medellin bogota, wasapbot agenciame" />
        <meta property="og:title" content="WasapBot — Tu WhatsApp responde solo" />
        <meta property="og:description" content="Bot de WhatsApp con IA para tu negocio. Sin código, activo en 10 minutos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        :root {
          --g: #25D366;
          --g2: #1DA851;
          --bg: #04080C;
          --card: #080E14;
          --border: rgba(255,255,255,0.06);
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); color:#EFF4FF; font-family:${F}; overflow-x:hidden; }
        a { text-decoration:none; color:inherit; }

        /* Animaciones */
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-g  { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.45)} 70%{box-shadow:0 0 0 14px rgba(37,211,102,0)} }
        @keyframes msg-in   { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes count-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot      { 0%,60%,100%{opacity:0.25} 30%{opacity:1} }
        @keyframes fade-in  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* NAV */
        .wb-nav {
          position:sticky; top:0; z-index:100;
          backdrop-filter:blur(24px);
          border-bottom: 1px solid var(--border);
          padding:0 64px; height:64px;
          display:flex; align-items:center; justify-content:space-between;
          transition:background 0.3s;
        }
        .wb-nav.scrolled { background:rgba(4,8,12,0.96); }
        .wb-nav-links a { font-size:13px; color:rgba(255,255,255,0.7); transition:color 0.15s; }
        .wb-nav-links a:hover { color:#EFF4FF; }

        /* CTA buttons */
        .wb-cta-green {
          background:linear-gradient(135deg,var(--g),var(--g2));
          color:#fff; border:none; border-radius:10px;
          padding:14px 32px; font-family:${F}; font-size:15px; font-weight:700;
          cursor:pointer; transition:all 0.2s;
          box-shadow:0 6px 28px rgba(37,211,102,0.35);
        }
        .wb-cta-green:hover { transform:translateY(-2px); box-shadow:0 10px 36px rgba(37,211,102,0.5); }
        .wb-cta-ghost {
          background:transparent; color:#EFF4FF;
          border:1px solid rgba(255,255,255,0.15); border-radius:10px;
          padding:14px 28px; font-family:${F}; font-size:15px; font-weight:600;
          cursor:pointer; transition:all 0.2s;
        }
        .wb-cta-ghost:hover { border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.04); }

        /* Phone */
        .wb-phone {
          background:#111; border:6px solid #1A1A1A;
          border-radius:36px; width:270px; overflow:hidden;
          box-shadow:0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
          animation:float 5s ease-in-out infinite;
          flex-shrink:0;
        }

        /* Feature cards */
        .wb-feat {
          background:var(--card); border:1px solid var(--border);
          border-radius:16px; padding:28px 24px;
          transition:all 0.2s;
        }
        .wb-feat:hover { border-color:rgba(37,211,102,0.2); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.4); }

        /* Pricing */
        .wb-plan { border-radius:20px; padding:36px 30px; transition:all 0.2s; }
        .wb-plan:hover { transform:translateY(-4px); }

        /* FAQ */
        .wb-faq-item { border-bottom:1px solid var(--border); padding:18px 0; cursor:pointer; }
        .wb-faq-item:last-child { border-bottom:none; }

        /* Responsive */
        @media(max-width:768px) {
          .wb-nav { padding:0 20px !important; height:56px !important; }
          .wb-nav-links { display:none !important; }
          .wb-hero { flex-direction:column !important; padding:70px 20px 50px !important; text-align:center !important; }
          .wb-hero-btns { justify-content:center !important; }
          .wb-phone { width:230px !important; margin:0 auto !important; }
          .wb-stats { grid-template-columns:1fr 1fr !important; }
          .wb-feat-grid { grid-template-columns:1fr !important; }
          .wb-plan-grid { grid-template-columns:1fr !important; }
          .wb-section { padding:60px 20px !important; }
          .wb-ind-pills { justify-content:flex-start !important; overflow-x:auto !important; padding-bottom:8px !important; }
        }
      `}} />

      {/* ── NAV ── */}
      <nav className={`wb-nav${scrolled?' scrolled':''}`}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/agenciame-logo.png" alt="agencIAme" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/>
          <span style={{fontFamily:FA,fontSize:18}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span>
        </Link>
        <div className="wb-nav-links" style={{display:'flex',gap:32,alignItems:'center'}}>
          {[['#features','Funciones'],['#precios','Precios'],['#faqs','FAQ']].map(([h,l])=>(
            <a key={h} href={h}>{l}</a>
          ))}
          <Link href="/chatbot" style={{color:'rgba(255,255,255,0.45)',fontSize:13}}>ChatBot Web</Link>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={()=>router.push('/wasapbot/login')} style={{background:'transparent',color:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'8px 18px',fontFamily:"'Inter', system-ui, sans-serif",fontSize:13,cursor:'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#EFF4FF';e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.45)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}>
            Ingresar
          </button>
          <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green" style={{padding:'9px 22px',fontSize:13,borderRadius:8}}>
            Activar mi bot →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="wb-hero wb-section" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:48,padding:'100px 64px 80px',maxWidth:1240,margin:'0 auto'}}>
        <div style={{flex:1,maxWidth:560}}>
          {/* Badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:100,padding:'6px 16px',marginBottom:28}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#25D366',animation:'pulse-g 2s infinite'}}/>
            <span style={{fontSize:12,fontWeight:700,color:'#25D366'}}>+200 negocios activos en Colombia</span>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:22}}>
            <img src="/agenciame-robot-final.png" alt="agencIAme robot" style={{width:84,height:84,objectFit:'contain',flexShrink:0,animation:'float 5s ease-in-out infinite',filter:'drop-shadow(0 8px 24px rgba(37,211,102,0.25))',opacity:0.92}}/>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(37,211,102,0.7)',letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>El primer administrador de empresas</div>
              <h1 style={{fontFamily:FA,fontSize:'clamp(36px,4.5vw,62px)',fontWeight:400,lineHeight:1.0,letterSpacing:'-2px',color:'#F0F0F0',margin:0}}>
                que vive en<br/><span style={{color:'#25D366'}}>WhatsApp.</span>
              </h1>
            </div>
          </div>

          <p style={{fontSize:15,color:'rgba(255,255,255,0.5)',lineHeight:1.85,fontWeight:300,marginBottom:12,maxWidth:460,fontStyle:'italic',borderLeft:'2px solid rgba(37,211,102,0.4)',paddingLeft:14}}>
            No es un bot. Es tu administrador.
          </p>

          <p style={{fontSize:15,color:'rgba(255,255,255,0.35)',lineHeight:1.85,fontWeight:300,marginBottom:36,maxWidth:460}}>
            Atiende, agenda, vende y controla tu negocio — todo desde WhatsApp, todo solo, las 24 horas.
          </p>

          <div className="wb-hero-btns" style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',marginBottom:40}}>
            <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green" style={{fontSize:16,padding:'15px 36px'}}>
              Activa tu plan ahora →
            </button>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.2)'}}>Desde $249.000/mes</div>
          </div>

          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            {['Sin contratos','Activo en 10 min','Soporte en español'].map(t=>(
              <div key={t} style={{display:'flex',alignItems:'center',gap:7}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.35)'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PHONE MOCKUP */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.25)',borderRadius:100,padding:'5px 14px'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#25D366',animation:'pulse-g 2s infinite'}}/>
            <span style={{fontSize:11,fontWeight:700,color:'#25D366'}}>Así te avisa WasapBot a ti, el dueño</span>
          </div>
          <div className="wb-phone">
          {/* WhatsApp header */}
          <div style={{background:'#075E54',padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:'2px solid rgba(255,255,255,0.2)'}}>
              <img src="/agenciame-logo.png" alt="WasapBot" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>Bot {cur.label}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.65)'}}>en linea — responde al instante</div>
            </div>
          </div>

          {/* Chat */}
          <div style={{background:'#ECE5DD',padding:12,minHeight:340,display:'flex',flexDirection:'column',gap:6,position:'relative'}}>
            <div style={{textAlign:'center',marginBottom:4}}>
              <span style={{background:'rgba(0,0,0,0.12)',color:'rgba(0,0,0,0.45)',fontSize:9,padding:'2px 10px',borderRadius:10,fontFamily:F}}>Hoy</span>
            </div>

            {/* Mensaje cliente */}
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <div style={{background:'#DCF8C6',color:'#111',borderRadius:'12px 12px 2px 12px',padding:'8px 11px',maxWidth:'82%',fontSize:12,lineHeight:1.5,fontFamily:F,animation:'msg-in 0.3s ease'}}>
                {cur.msg[0]}
                <div style={{fontSize:8,color:'#999',textAlign:'right',marginTop:2}}>9:14 ✓✓</div>
              </div>
            </div>

            {/* Respuesta bot */}
            {msgStep >= 1 && (
              <div style={{display:'flex',justifyContent:'flex-start'}} key={`${ind}-resp`}>
                <div style={{background:'#fff',color:'#111',borderRadius:'12px 12px 12px 2px',padding:'8px 11px',maxWidth:'85%',fontSize:12,lineHeight:1.5,fontFamily:F,animation:'msg-in 0.35s 0.1s ease both'}}>
                  {cur.msg[1]}
                  <div style={{fontSize:8,color:'#999',textAlign:'right',marginTop:2}}>9:14</div>
                </div>
              </div>
            )}

            {/* Typing */}
            {msgStep < 1 && (
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{background:'#fff',borderRadius:'12px 12px 12px 2px',padding:'8px 12px',display:'flex',gap:3,alignItems:'center'}}>
                  {[0,0.2,0.4].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#bbb',animation:`dot 1.2s ${d}s ease-in-out infinite`}}/>)}
                </div>
              </div>
            )}

            {/* Selector industria */}
            <div style={{position:'absolute',bottom:10,left:8,right:8}}>
              <div style={{display:'flex',gap:4,overflowX:'auto',paddingBottom:2}}>
                {INDUSTRIAS.map((i,idx)=>(
                  <button key={i.value} onClick={()=>{setInd(idx);setMsgStep(0);clearInterval(timerRef.current);}}
                    style={{background:ind===idx?'rgba(37,211,102,0.15)':'rgba(0,0,0,0.06)',border:`1px solid ${ind===idx?'rgba(37,211,102,0.4)':'rgba(0,0,0,0.12)'}`,borderRadius:20,padding:'3px 8px',fontSize:9,cursor:'pointer',whiteSpace:'nowrap',color:ind===idx?'#1A6B3A':'#555',fontWeight:ind===idx?700:400,flexShrink:0}}>
                    {i.emoji} {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'48px 64px',background:'rgba(255,255,255,0.015)'}} className="wb-section">
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div className="wb-stats" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'var(--border)'}}>
            {STATS.map((s,i)=>(
              <div key={i} style={{background:i%2===0?'var(--card)':'var(--bg)',padding:'32px 24px',textAlign:'center'}}>
                <div style={{width:52,height:52,borderRadius:14,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>{s.svg}</div>
                <div style={{fontFamily:FA,fontSize:'clamp(28px,3vw,42px)',fontWeight:400,color:'#25D366',letterSpacing:'-1px',marginBottom:6}}>{s.num}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.3)',fontWeight:300}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONES ── */}
      <section id="features" className="wb-section" style={{padding:'80px 64px',maxWidth:1240,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <img src="/agenciame-logo.png" alt="agencIAme robot" style={{width:64,height:64,borderRadius:14,objectFit:'cover',margin:'0 auto 18px'}}/>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#25D366',marginBottom:14}}>Lo que ningún otro bot hace</p>
          <h2 style={{fontFamily:FA,fontSize:'clamp(32px,4vw,52px)',fontWeight:400,letterSpacing:'-1.5px',color:'#F0F0F0',marginBottom:14}}>
            No es un bot.<br/>Es tu administrador.
          </h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.3)',fontWeight:300,maxWidth:520,margin:'0 auto'}}>
            Mientras la competencia solo responde preguntas, WasapBot controla tu inventario, construye tu lista de clientes, gestiona tus pedidos y te reporta tus ventas cada mañana. Solo. Sin operadores. Sin apps extra.
          </p>
        </div>
        <div className="wb-feat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="wb-feat">
              <div style={{width:48,height:48,borderRadius:12,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'#25D366',marginBottom:20,flexShrink:0}}>
                {FEAT_ICONS[i]}
              </div>
              <div style={{fontSize:15,fontWeight:700,color:'#EFF4FF',marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',lineHeight:1.7,fontWeight:300}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INDUSTRIAS CON FOTOS REALES ── */}
      <section style={{background:'rgba(37,211,102,0.02)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'80px 64px'}} className="wb-section">
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#25D366',marginBottom:12}}>Para todo tipo de negocio</p>
            <h2 style={{fontFamily:FA,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:8}}>Funciona para tu industria</h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.3)',marginBottom:0,fontWeight:300}}>Haz clic para ver como responderia el bot</p>
          </div>

          {/* Grid de fotos por industria */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:28}}>
            {INDUSTRIAS.map((i,idx)=>(
              <div key={i.value} onClick={()=>{setInd(idx);setMsgStep(0);window.scrollTo({top:0,behavior:'smooth'});}} style={{position:'relative',borderRadius:14,overflow:'hidden',aspectRatio:'4/3',cursor:'pointer',border:`2px solid ${ind===idx?'#25D366':'transparent'}`,transition:'all 0.2s',transform:ind===idx?'scale(1.02)':'scale(1)'}}>
                <img src={IND_IMGS[i.value]||IND_IMGS.restaurante} alt={i.label} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                <div style={{position:'absolute',inset:0,background:ind===idx?'linear-gradient(180deg,transparent 30%,rgba(37,211,102,0.7) 100%)':'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.75) 100%)'}}/>
                <div style={{position:'absolute',bottom:10,left:12,right:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#fff'}}>{i.label}</span>
                  {ind===idx&&<span style={{background:'#25D366',color:'#fff',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:100}}>ACTIVO</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Preview del chat de la industria seleccionada */}
          <div style={{background:'var(--card)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:16,padding:'24px 28px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
            <div style={{width:48,height:48,borderRadius:12,overflow:'hidden',flexShrink:0}}>
              <img src={IND_IMGS[cur.value]||IND_IMGS.restaurante} alt={cur.label} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:12,fontWeight:700,color:'#25D366',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>{cur.label}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>Tú preguntas: "{cur.msg[0]}"</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',marginTop:4}}>WasapBot responde: "{cur.msg[1].slice(0,90)}..."</div>
            </div>
            <button onClick={()=>router.push('/wasapbot/activar')} style={{background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:10,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0}}>
              Activar para {cur.label}
            </button>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="wb-section" style={{padding:'80px 64px',maxWidth:1240,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#25D366',marginBottom:14}}>Precios</p>
          <h2 style={{fontFamily:FA,fontSize:'clamp(30px,4vw,52px)',fontWeight:400,letterSpacing:'-1.5px',color:'#F0F0F0',marginBottom:12}}>Elige tu plan</h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.3)',fontWeight:300}}>Sin contratos · Sin tarjeta de crédito · Cancela cuando quieras</p>
        </div>
        <div className="wb-plan-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {PLANES.map((plan)=>(
            <div key={plan.id} className="wb-plan" style={{background:plan.popular?`linear-gradient(145deg,${plan.color}0D,var(--card))`:'var(--card)',border:`${plan.popular?2:1}px solid ${plan.popular?plan.color+'44':'var(--border)'}`,position:'relative'}}>
              {plan.popular && (
                <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',padding:'4px 18px',borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:0.5,whiteSpace:'nowrap',boxShadow:`0 4px 16px ${plan.color}55`}}>
                  MAS POPULAR
                </div>
              )}
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:plan.color,marginBottom:10}}>{plan.nombre}</div>
              <div style={{fontFamily:FA,fontSize:46,color:plan.color,letterSpacing:'-2px',lineHeight:1,marginBottom:4}}>
                ${new Intl.NumberFormat('es-CO').format(plan.precio)}
              </div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.25)',marginBottom:6}}>COP / mes</div>
              <div style={{display:'flex',gap:10,marginBottom:24}}>
                <span style={{background:plan.color+'15',color:plan.color,border:`1px solid ${plan.color}30`,borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:600}}>{plan.tokens} créditos IA</span>
                <span style={{background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:100,padding:'3px 10px',fontSize:11}}>{plan.convs}</span>
              </div>
              {plan.features.map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>
                  <div style={{width:18,height:18,borderRadius:'50%',background:plan.color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontWeight:300}}>{f}</span>
                </div>
              ))}
              <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green"
                style={{width:'100%',marginTop:24,background:plan.popular?`linear-gradient(135deg,${plan.color},${plan.color}CC)`:'rgba(255,255,255,0.05)',color:plan.popular?'#fff':'rgba(255,255,255,0.6)',boxShadow:plan.popular?`0 6px 24px ${plan.color}44`:'none',border:plan.popular?'none':`1px solid rgba(255,255,255,0.1)`}}>
                Empezar con {plan.nombre} ahora →
              </button>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div style={{marginTop:40,background:'rgba(37,211,102,0.04)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:16,padding:'20px 28px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{width:44,height:44,borderRadius:10,background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#EFF4FF',marginBottom:3}}>Garantía de satisfacción</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300}}>Activa tu plan hoy. Si no estás satisfecho, te devolvemos el dinero. Sin preguntas.</div>
          </div>
        </div>
      </section>

      {/* ── COMPARATIVA ── */}
      <section style={{background:'rgba(255,255,255,0.015)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'64px 64px'}} className="wb-section">
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <h2 style={{fontFamily:FA,fontSize:'clamp(28px,3.5vw,44px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',textAlign:'center',marginBottom:40}}>
            WasapBot vs la competencia
          </h2>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',background:'#0A1020',padding:'12px 20px',fontSize:11,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:1,gap:8}}>
              <div>Característica</div><div style={{textAlign:'center',color:'#25D366'}}>WasapBot</div><div style={{textAlign:'center'}}>Interakt</div><div style={{textAlign:'center'}}>WATI</div>
            </div>
            {[
              ['En español colombiano','✓','Parcial','No'],
              ['Configuración sin código','✓','✓','No'],
              ['Soporte local en Colombia','✓','No','No'],
              ['Precio en pesos COP','✓','No ($USD)','No ($USD)'],
              ['Activo en 10 minutos','✓','Días','Días'],
              ['Sin contrato mínimo','✓','6 meses','6 meses'],
              ['Catálogo con fotos','✓','✓','✓'],
              ['Precio mensual','$189.000 COP','~$400.000 COP','~$520.000 COP'],
            ].map(([feat,wb,int,wati],i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'13px 20px',borderBottom:`1px solid var(--border)`,gap:8,alignItems:'center'}}>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>{feat}</div>
                <div style={{textAlign:'center',fontSize:13,fontWeight:700,color:wb==='✓'?'#25D366':wb.includes('$')?'#25D366':'#6B7A99'}}>{wb}</div>
                <div style={{textAlign:'center',fontSize:13,color:int==='✓'?'rgba(255,255,255,0.4)':'#4B5563'}}>{int}</div>
                <div style={{textAlign:'center',fontSize:13,color:wati==='✓'?'rgba(255,255,255,0.4)':'#4B5563'}}>{wati}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faqs" className="wb-section" style={{padding:'80px 64px',maxWidth:800,margin:'0 auto'}}>
        <h2 style={{fontFamily:FA,fontSize:'clamp(28px,3.5vw,46px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',textAlign:'center',marginBottom:48}}>
          Preguntas frecuentes
        </h2>
        {FAQS.map((faq,i)=>(
          <div key={i} className="wb-faq-item" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
              <div style={{fontSize:15,fontWeight:600,color:'#EFF4FF'}}>{faq.q}</div>
              <div style={{fontSize:18,color:'#4B6080',flexShrink:0,transition:'transform 0.2s',transform:faqOpen===i?'rotate(45deg)':'none'}}>+</div>
            </div>
            {faqOpen===i && (
              <div style={{fontSize:14,color:'rgba(255,255,255,0.4)',lineHeight:1.7,marginTop:12,fontWeight:300,animation:'fade-in 0.2s ease'}}>
                {faq.r}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{background:'linear-gradient(180deg,rgba(37,211,102,0.05) 0%,transparent 100%)',borderTop:'1px solid rgba(37,211,102,0.1)',padding:'80px 64px',textAlign:'center'}} className="wb-section">
        <h2 style={{fontFamily:FA,fontSize:'clamp(32px,4.5vw,60px)',fontWeight:400,letterSpacing:'-2px',marginBottom:16,color:'#F0F0F0'}}>
          El primer administrador<br/>de empresas que vive<br/><span style={{color:'#25D366'}}>en WhatsApp.</span>
        </h2>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.4)',marginBottom:8,fontWeight:300,fontStyle:'italic'}}>
          No es un bot. Es tu administrador.
        </p>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.3)',marginBottom:36,fontWeight:300}}>
          Sin contratos · Sin tarjeta de crédito · Activo en 10 minutos.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green" style={{fontSize:17,padding:'17px 48px'}}>
            Activa tu plan ahora y empieza a vender →
          </button>
          <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer" className="wb-cta-ghost" style={{fontSize:15,display:'flex',alignItems:'center',gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 1C5.93 1 1 5.93 1 12c0 1.97.518 3.82 1.426 5.427L1 23l5.734-1.498A10.956 10.956 0 0012 23c6.07 0 11-4.93 11-11S18.07 1 12 1z"/></svg>
            Hablar con un asesor
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'32px 64px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/agenciame-logo.png" alt="agencIAme" style={{width:28,height:28,borderRadius:6,objectFit:'cover'}}/>
          <span style={{fontFamily:FA,fontSize:16}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span>
        </Link>
        <div style={{display:'flex',gap:24,fontSize:12,color:'rgba(255,255,255,0.55)'}}>
          <Link href="/wasapbot">WasapBot</Link>
          <Link href="/chatbot">ChatBot</Link>
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
        </div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>© 2026 NexoTI · Cali, Colombia</div>
      </footer>
    </>
  );
}
