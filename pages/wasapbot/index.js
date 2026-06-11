// pages/wasapbot/index.js
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
  { value: 'acarreos',     label: 'Transporte',            emoji: '🚛' },
  { value: 'tienda',       label: 'Tienda / Comercio',     emoji: '🏪' },
  { value: 'gimnasio',     label: 'Gimnasio',              emoji: '💪' },
  { value: 'salud',        label: 'Salud / Clínica',       emoji: '🏥' },
  { value: 'educacion',    label: 'Educación',             emoji: '📚' },
  { value: 'tecnico',      label: 'Soporte Técnico',       emoji: '💻' },
  { value: 'otro',         label: 'Otro negocio',          emoji: '💼' },
];

const PREVIEW = {
  taller:      ['Hola, necesito revisar los frenos de mi carro', 'Bienvenido. Con gusto agendamos tu revision. Que marca y modelo es tu vehiculo?'],
  peluqueria:  ['Hola, tienen cita para manana?', 'Hola! Claro. Tenemos disponible 10am, 2pm y 5pm. Cual te queda mejor?'],
  restaurante: ['Cual es el menu de hoy?', 'Hoy: Bandeja paisa $18.000, Sancocho $15.000, Cazuela de mariscos $22.000. Te hago el pedido?'],
  barbero:     ['Cuanto vale el corte?', 'Corte clasico $25.000, Fade $35.000, Fade + barba $45.000. Reservamos turno ahora?'],
  veterinaria: ['Mi perro necesita vacunas', 'Con gusto. Que raza y edad tiene tu mascota? Te indico que vacunas necesita y el costo.'],
  reposteria:  ['Quiero pedir una torta para el sabado', 'Para cuantas personas y que sabor prefieres? Te cotizo de inmediato.'],
  psicologo:   ['Necesito una cita', 'Con gusto. Tenemos sesiones presenciales y virtuales. Que dias te quedan bien?'],
  fotografia:  ['Hacen fotos de bodas?', 'Si, cubrimos bodas y eventos. Cual es la fecha? Te envio portafolio y cotizacion.'],
  contador:    ['Necesito hacer la declaracion de renta', 'Eres persona natural o juridica? Asi te indico los documentos necesarios y el costo.'],
  acarreos:    ['Cuanto vale un trasteo de Cali a Bogota?', 'Para cotizar el flete: es apartamento, casa u oficina? Cuantos metros cuadrados aproximadamente?'],
  tienda:      ['Tienen envios a domicilio?', 'Si, hacemos envios dentro de la ciudad el mismo dia. Que producto te interesa?'],
  gimnasio:    ['Cuanto vale la membresia?', 'Mensual $120.000, Trimestral $300.000, Anual $900.000. Incluye todas las clases. Agendamos visita?'],
  salud:       ['Necesito cita medica', 'Con gusto. Es consulta general o especializada? Tenemos disponibilidad esta semana.'],
  educacion:   ['Dan clases de ingles?', 'Si, tenemos niveles basico, intermedio y avanzado. Para quien son las clases?'],
  tecnico:     ['Mi computador no enciende', 'Hace cuanto ocurre esto y que marca es el equipo? Podemos revisarlo hoy mismo.'],
  otro:        ['Hola, necesito informacion', 'Hola, bienvenido. En que podemos ayudarte hoy?'],
};

export default function WasapBot() {
  const router = useRouter();
  const [ind, setInd] = useState('peluqueria');
  const preview = PREVIEW[ind] || PREVIEW.otro;
  const indInfo = INDUSTRIAS.find(i => i.value === ind) || INDUSTRIAS[0];

  return (
    <>
      <Head>
        <title>WasapBot — Tu WhatsApp responde solo | agencIAme</title>
        <meta name="description" content="Automatiza tu WhatsApp con IA. Tu negocio atiende clientes las 24 horas sin que muevas un dedo. Actívalo en 5 minutos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        body{margin:0;background:#06090D;color:#EFF4FF;font-family:${F};overflow-x:hidden}
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.5)}70%{box-shadow:0 0 0 14px rgba(37,211,102,0)}}
        @keyframes msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dot{0%,60%,100%{opacity:0.3}30%{opacity:1}}
        .wb-cta{background:linear-gradient(135deg,#25D366,#1DA851);color:#fff;border:none;border-radius:12px;padding:16px 36px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 28px rgba(37,211,102,0.4);transition:all 0.2s}
        .wb-cta:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(37,211,102,0.5)}
        .wb-pill{border:1px solid rgba(255,255,255,0.07);border-radius:100px;padding:7px 14px;font-family:${F};font-size:12px;cursor:pointer;transition:all 0.15s;background:rgba(255,255,255,0.02);color:#6B7A99}
        .wb-pill:hover{border-color:rgba(37,211,102,0.35);color:#EFF4FF}
        .wb-pill.on{background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.4);color:#25D366;font-weight:700}
        @media(max-width:768px){
          .wb-hero{flex-direction:column!important;padding:60px 20px 40px!important;text-align:center}
          .wb-phone{width:220px!important;min-height:360px!important;margin:0 auto}
          .wb-how{grid-template-columns:1fr!important;gap:40px!important}
          .wb-nav{padding:0 20px!important}
          .wb-sec{padding:60px 20px!important}
          .wb-pills{justify-content:center}
        }
      `}} />

      {/* NAV */}
      <nav className="wb-nav" style={{position:'sticky',top:0,zIndex:100,background:'rgba(6,9,13,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 64px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:18,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <button onClick={() => router.push('/wasapbot/activar')} className="wb-cta" style={{padding:'8px 20px',fontSize:13,borderRadius:8}}>Activar mi bot →</button>
      </nav>

      {/* HERO */}
      <div className="wb-hero" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:48,padding:'90px 64px 70px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{flex:1,maxWidth:520}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:100,padding:'5px 14px',marginBottom:24}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#25D366',animation:'pulse-g 2s infinite'}} />
            <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366'}}>Bot activo 24/7</span>
          </div>
          <h1 style={{fontFamily:FA,fontSize:'clamp(40px,5vw,66px)',fontWeight:400,lineHeight:1.0,letterSpacing:'-2px',marginBottom:20,color:'#F0F0F0'}}>
            Tu WhatsApp<br /><span style={{color:'#25D366'}}>responde solo.</span>
          </h1>
          <p style={{fontFamily:F,fontSize:16,color:'rgba(255,255,255,0.4)',lineHeight:1.85,fontWeight:300,marginBottom:32,maxWidth:440}}>
            Configura un agente de IA con la informacion de tu negocio. Atiende clientes, agenda citas y responde preguntas — sin que muevas un dedo.
          </p>
          <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:32}}>
            <button onClick={() => router.push('/wasapbot/activar')} className="wb-cta">Activar mi WasapBot →</button>
            <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.25)'}}>Solo $89.000 COP/mes</span>
          </div>
          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            {['Sin contratos','Activo en 5 min','14 dias gratis'].map(t => (
              <div key={t} style={{display:'flex',alignItems:'center',gap:6}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.35)'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PHONE */}
        <div className="wb-phone" style={{background:'#1A1A2E',border:'8px solid #0D0D1A',borderRadius:40,width:250,minHeight:460,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.7)',flexShrink:0,animation:'float 4s ease-in-out infinite'}}>
          <div style={{background:'#075E54',padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'#128C7E',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{indInfo.emoji}</div>
            <div>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#fff'}}>{indInfo.label}</div>
              <div style={{fontFamily:F,fontSize:9,color:'rgba(255,255,255,0.6)'}}>en linea</div>
            </div>
          </div>
          <div style={{background:'#ECE5DD',padding:12,minHeight:320,display:'flex',flexDirection:'column',gap:6}}>
            <div style={{textAlign:'center',marginBottom:6}}>
              <span style={{background:'rgba(0,0,0,0.15)',color:'rgba(0,0,0,0.5)',fontFamily:F,fontSize:9,padding:'2px 10px',borderRadius:10}}>Hoy</span>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <div style={{background:'#DCF8C6',color:'#111',borderRadius:'12px 12px 2px 12px',padding:'7px 10px',maxWidth:'82%',fontFamily:F,fontSize:11,lineHeight:1.5,animation:'msg-in 0.3s ease'}}>
                {preview[0]}
                <div style={{fontSize:8,color:'#999',textAlign:'right',marginTop:2}}>9:14 am</div>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-start'}} key={ind}>
              <div style={{background:'#fff',color:'#111',borderRadius:'12px 12px 12px 2px',padding:'7px 10px',maxWidth:'82%',fontFamily:F,fontSize:11,lineHeight:1.5,animation:'msg-in 0.4s 0.1s ease both'}}>
                {preview[1]}
                <div style={{fontSize:8,color:'#999',textAlign:'right',marginTop:2}}>9:14 am</div>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-start',marginTop:2}}>
              <div style={{background:'#fff',borderRadius:'12px 12px 12px 2px',padding:'8px 12px',display:'flex',gap:3,alignItems:'center'}}>
                {[0,0.2,0.4].map((d,i)=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#bbb',animation:`dot 1.2s ${d}s ease-in-out infinite`}}/>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTOR INDUSTRIA */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)',padding:'48px 64px',background:'rgba(255,255,255,0.015)'}} className="wb-sec">
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontFamily:F,fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#25D366',marginBottom:10,textAlign:'center'}}>Para cualquier negocio</p>
          <h2 style={{fontFamily:FA,fontSize:'clamp(26px,3vw,40px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',textAlign:'center',marginBottom:8}}>Selecciona tu tipo de negocio</h2>
          <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,0.25)',textAlign:'center',marginBottom:28,fontWeight:300}}>Mira como responderia el bot segun tu actividad</p>
          <div className="wb-pills" style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
            {INDUSTRIAS.map(i => (
              <button key={i.value} className={`wb-pill${ind===i.value?' on':''}`} onClick={() => setInd(i.value)}>
                {i.emoji} {i.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA + PRECIO */}
      <div className="wb-sec wb-how" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,padding:'80px 64px',maxWidth:1200,margin:'0 auto'}}>
        <div>
          <p style={{fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#25D366',marginBottom:14}}>Proceso</p>
          <h2 style={{fontFamily:FA,fontSize:'clamp(28px,3vw,44px)',fontWeight:400,letterSpacing:'-1px',color:'#F0F0F0',marginBottom:36}}>Activo en<br />4 pasos simples</h2>
          {[
            {n:'01',t:'Dinos de que se trata tu negocio',d:'Selecciona tu industria y describe tus servicios, precios y horarios de atencion.'},
            {n:'02',t:'El sistema crea tu agente IA',d:'Automaticamente configuramos un bot entrenado con la informacion de tu negocio.'},
            {n:'03',t:'Conecta tu numero de WhatsApp',d:'Escaneas un codigo QR con tu celular. En 30 segundos tu numero queda activo.'},
            {n:'04',t:'Tu WhatsApp responde solo',d:'El bot atiende clientes, agenda citas y captura leads las 24 horas, todos los dias.'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:18,padding:'20px 0',borderBottom:i<3?'1px solid rgba(255,255,255,0.05)':'none'}}>
              <div style={{width:44,height:44,borderRadius:10,background:'rgba(37,211,102,0.07)',border:'1px solid rgba(37,211,102,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:FA,fontSize:16,color:'#25D366',flexShrink:0}}>{s.n}</div>
              <div>
                <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:'#EFF4FF',marginBottom:5}}>{s.t}</div>
                <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.3)',lineHeight:1.6,fontWeight:300}}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PRECIO */}
        <div style={{background:'linear-gradient(145deg,rgba(37,211,102,0.06),rgba(37,211,102,0.01))',border:'1px solid rgba(37,211,102,0.18)',borderRadius:20,padding:36,alignSelf:'start'}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#25D366',marginBottom:14}}>WasapBot</div>
          <div style={{fontFamily:FA,fontSize:52,color:'#25D366',letterSpacing:'-2px',lineHeight:1,marginBottom:4}}>$89.000</div>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.25)',marginBottom:28}}>COP / mes — sin contratos</div>
          {[
            'Bot de WhatsApp activo 24/7',
            'Entrenado con info de tu negocio',
            'Agenda citas automaticamente',
            'Captura nombre y telefono del cliente',
            'Aviso cuando piden asesor humano',
            'Hasta 500 conversaciones al mes',
            '14 dias gratis para probar',
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(37,211,102,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:300}}>{f}</span>
            </div>
          ))}
          <button onClick={() => router.push('/wasapbot/activar')} className="wb-cta" style={{width:'100%',marginTop:24,fontSize:15}}>
            Activar mi WasapBot →
          </button>
          <div style={{textAlign:'center',marginTop:12,fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.18)'}}>14 dias gratis · Sin tarjeta de credito</div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{borderTop:'1px solid rgba(37,211,102,0.08)',padding:'80px 64px',textAlign:'center',background:'linear-gradient(180deg,rgba(37,211,102,0.03),transparent)'}}>
        <h2 style={{fontFamily:FA,fontSize:'clamp(30px,4vw,54px)',fontWeight:400,letterSpacing:'-1.5px',marginBottom:14,color:'#F0F0F0'}}>
          Cuantos clientes pierdes<br />sin responder?
        </h2>
        <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,0.3)',marginBottom:32,fontWeight:300}}>Activa el bot hoy y tu WhatsApp trabaja mientras tu descansas.</p>
        <button onClick={() => router.push('/wasapbot/activar')} className="wb-cta" style={{fontSize:16,padding:'17px 48px'}}>
          Activar gratis por 14 dias →
        </button>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'24px 64px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:15,cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.12)'}}>2026 NexoTI · Cali, Colombia</span>
        <a href="https://wa.me/573105056616" style={{fontFamily:F,fontSize:12,color:'#25D366'}}>Soporte: 310-505-6616</a>
      </footer>
    </>
  );
}
