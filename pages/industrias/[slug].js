// pages/industrias/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { INDUSTRIAS_DETALLE, SLUGS_VALIDOS } from '../../lib/industriasData';
import { Logo } from '../index';
import { useAuth } from '../../lib/AuthContext';

// Paleta GHL
const BG       = '#0A0F1E';
const BG_CARD  = '#111827';
const BG_CARD2 = '#0D1420';
const BORDER   = 'rgba(255,255,255,0.07)';
const WHITE    = '#EFF4FF';
const GRAY     = '#8A9BB5';
const GRAY2    = '#C4D0E3';
const F        = "'Inter', system-ui, sans-serif";

const INDUSTRY_PHOTOS = {
  taller:             'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=160&q=90',
  peluqueria:         'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=160&q=90',
  inmobiliaria:       'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=160&q=90',
  restaurante:        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&q=90',
  restaurante_barrio: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&q=90',
  tienda:             'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=160&q=90',
  gimnasio:           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&q=90',
  salud:              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=160&q=90',
  ajedrez:            'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=160&q=90',
  arquitectura:       'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=160&q=90',
  papeleria:          'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=160&q=90',
  deporte:            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=160&q=90',
};

const FUNCTION_PHOTOS = {
  taller:   ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80','https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80','https://images.unsplash.com/photo-1609205807107-1b66742b9e21?w=80&q=80','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80'],
  peluqueria:['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&q=80','https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=80&q=80','https://images.unsplash.com/photo-1562322140-8baeececf3df?w=80&q=80','https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=80&q=80','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&q=80','https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=80&q=80'],
  restaurante:['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=80','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=80','https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&q=80','https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=80&q=80','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&q=80','https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&q=80'],
  restaurante_barrio:['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=80','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80','https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=80&q=80','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&q=80','https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=80&q=80'],
  inmobiliaria:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=80&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&q=80','https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&q=80','https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=80&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6f349479?w=80&q=80'],
  gimnasio: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=80&q=80','https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=80&q=80','https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=80&q=80','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&q=80','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=80&q=80','https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=80&q=80'],
  salud:    ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&q=80','https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=80&q=80','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&q=80','https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80','https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&q=80','https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=80&q=80'],
  ajedrez:  ['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=80&q=80','https://images.unsplash.com/photo-1586282391129-76a6df230234?w=80&q=80','https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=80&q=80','https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=80&q=80','https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=80&q=80','https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=80&q=80'],
  arquitectura:['https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=80&q=80','https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=80&q=80','https://images.unsplash.com/photo-1600607687644-c7171b47b292?w=80&q=80','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=80&q=80','https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&q=80','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&q=80'],
  tienda:   ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&q=80','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=80&q=80','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&q=80','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=80&q=80','https://images.unsplash.com/photo-1613082441547-09f407d42dd1?w=80&q=80','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80'],
  papeleria:['https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=80&q=80','https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=80&q=80','https://images.unsplash.com/photo-1586282391129-76a6df230234?w=80&q=80','https://images.unsplash.com/photo-1553877522-43269d4ea984?w=80&q=80','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=80&q=80','https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=80&q=80'],
};

// CSS GHL completo — todos los colores son del sistema azul marino
const CSS = `
  *, *::before, *::after {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'kern' 1, 'liga' 1;
    box-sizing: border-box;
  }
  html, body {
    background: ${BG};
    color: ${WHITE};
    font-family: ${F};
    font-size: 16px;
  }
  .ih1 { font-family:${F}; font-weight:900; letter-spacing:-0.045em; line-height:1.0; color:${WHITE}; font-synthesis:none; }
  .ih2 { font-family:${F}; font-weight:800; letter-spacing:-0.035em; line-height:1.1; color:${WHITE}; font-synthesis:none; }
  .ih3 { font-family:${F}; font-weight:700; letter-spacing:-0.02em; line-height:1.25; color:${GRAY}; }
  .ibody { font-family:${F}; font-weight:400; line-height:1.75; letter-spacing:0.01em; color:${GRAY2}; }
  .ilabel { font-family:${F}; font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; display:block; }
  .inav { font-family:${F}; font-size:14px; font-weight:500; letter-spacing:-0.01em; color:${GRAY}; transition:color 0.15s; text-decoration:none; }
  .inav:hover { color:${WHITE}; }
  .ibread { font-family:${F}; font-size:13px; font-weight:500; color:${GRAY}; text-decoration:none; }
  .istat { font-family:${F}; font-weight:900; letter-spacing:-0.05em; line-height:1; font-synthesis:none; }
  .ictitle { font-family:${F}; font-weight:700; font-size:16px; letter-spacing:-0.02em; line-height:1.3; color:${WHITE}; margin:0 0 10px; }
  .icdesc { font-family:${F}; font-size:14px; font-weight:400; line-height:1.7; color:${GRAY}; margin:0; }
  .icheck { font-family:${F}; font-size:14px; font-weight:500; line-height:1.5; color:${GRAY2}; display:flex; align-items:center; gap:10px; }
  .itesti { font-family:${F}; font-size:15px; font-weight:400; font-style:italic; line-height:1.75; color:${GRAY2}; margin:0 0 20px; }
  .ifl { font-family:${F}; font-size:13px; font-weight:400; color:#4B6080; text-decoration:none; transition:color 0.15s; }
  .ifl:hover { color:${GRAY}; }
  .ichip { font-family:${F}; font-size:13px; font-weight:500; letter-spacing:-0.01em; color:${GRAY}; display:flex; align-items:center; gap:8px; text-decoration:none; transition:all 0.2s; }
  .isec  { background:${BG_CARD}; }
  .icard { background:${BG_CARD2}; }
  .icard-hover { transition: border-color 0.2s, transform 0.2s; }
  .icard-hover:hover { transform: translateY(-4px); }
  .btn-ghost-ind {
    background: transparent;
    color: ${WHITE};
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 100px;
    padding: 14px 32px;
    font-family: ${F};
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-ghost-ind:hover { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.35); }
`;

export async function getStaticPaths() {
  return { paths: SLUGS_VALIDOS.map(slug => ({ params: { slug } })), fallback: false };
}
export async function getStaticProps({ params }) {
  return { props: { industria: INDUSTRIAS_DETALLE[params.slug] || null } };
}

export default function IndustriaDetalle({ industria }) {
  const { user } = useAuth();
  if (!industria) return null;
  const { color, colorBg, colorBorder } = industria;
  const indPhoto   = INDUSTRY_PHOTOS[industria.slug]   || INDUSTRY_PHOTOS.taller;
  const funcPhotos = FUNCTION_PHOTOS[industria.slug]   || FUNCTION_PHOTOS.taller;

  return (
    <>
      <Head>
        <title>{industria.nombre} — agencIAme</title>
        <meta name="description" content={industria.descripcion} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{__html: CSS}} />

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 60px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',backdropFilter:'blur(20px)',background:'rgba(10,15,30,0.97)',borderBottom:`1px solid ${BORDER}` }}>
        <Link href="/"><Logo size={22} /></Link>
        <div style={{ display:'flex',gap:28,alignItems:'center' }}>
          <Link href="/#empresas" className="inav">← Todas las empresas</Link>
          <Link href="/#precios" className="inav">Precios</Link>
        </div>
        {user
          ? <Link href="/dashboard" style={{ background:'#2B6AFF',color:'#fff',borderRadius:100,padding:'8px 20px',fontFamily:F,fontWeight:700,fontSize:13,textDecoration:'none',boxShadow:'0 4px 16px rgba(43,106,255,0.4)' }}>Mi panel →</Link>
          : <Link href="/auth/register" style={{ background:'#2B6AFF',color:'#fff',borderRadius:100,padding:'8px 20px',fontFamily:F,fontWeight:700,fontSize:13,textDecoration:'none',boxShadow:'0 4px 16px rgba(43,106,255,0.4)' }}>Comenzar gratis</Link>
        }
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'75vh',display:'flex',flexDirection:'column',justifyContent:'center',padding:'120px 60px 80px',position:'relative',overflow:'hidden',background:BG }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:`url(${indPhoto.replace('w=160','w=1400')})`,backgroundSize:'cover',backgroundPosition:'center',filter:'brightness(0.12) saturate(0.5)' }} />
        <div style={{ position:'absolute',inset:0,background:`linear-gradient(135deg,rgba(10,15,30,0.98) 0%,rgba(10,15,30,0.80) 55%,rgba(10,15,30,0.55) 100%)` }} />
        <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse 65% 65% at 70% 40%,${colorBg},transparent)`,pointerEvents:'none' }} />

        <div style={{ position:'relative' }}>
          {/* Breadcrumb */}
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:36 }}>
            <Link href="/#empresas" className="ibread">← Empresas</Link>
            <span style={{ color:'#2D3F5C',fontFamily:F }}>/</span>
            <span style={{ color,fontFamily:F,fontSize:13,fontWeight:700 }}>{industria.nombre}</span>
          </div>

          {/* Foto industria */}
          <div style={{ width:88,height:88,borderRadius:20,overflow:'hidden',marginBottom:28,border:`2px solid ${color}44`,boxShadow:`0 8px 32px ${color}22` }}>
            <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          </div>

          {/* Badge */}
          <span style={{ display:'inline-flex',alignItems:'center',gap:8,background:colorBg,border:`1px solid ${colorBorder}`,color,padding:'5px 16px',borderRadius:100,marginBottom:28,fontSize:11,fontFamily:F,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' }}>
            IA para {industria.nombre}
          </span>

          {/* H1 */}
          <h1 className="ih1" style={{ fontSize:'clamp(44px,6vw,76px)',maxWidth:800,marginBottom:22 }}>
            {industria.tagline.split(' ').map((w, i, arr) =>
              i >= arr.length - 2
                ? <span key={i} style={{ color }}>{w}{i < arr.length-1 ? ' ' : ''}</span>
                : w + ' '
            )}
          </h1>

          <p className="ibody" style={{ fontSize:18,maxWidth:560,marginBottom:44 }}>{industria.descripcion}</p>

          {/* CTAs */}
          <div style={{ display:'flex',gap:14,flexWrap:'wrap',marginBottom:56 }}>
            <Link href="/auth/register" style={{ background:color,color:'#080B0F',borderRadius:100,padding:'14px 32px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,fontFamily:F,fontWeight:800,fontSize:15,letterSpacing:'0.01em',boxShadow:`0 6px 24px ${color}44` }}>
              Probar 14 días gratis →
            </Link>
            <a href="#flujo" className="btn-ghost-ind">Ver demo del chat</a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex',gap:44,flexWrap:'wrap' }}>
            {industria.heroStats.map((s, i) => (
              <div key={i}>
                <div className="istat" style={{ fontSize:38,color }}>{s.valor}</div>
                <div style={{ fontFamily:F,fontSize:13,fontWeight:500,color:GRAY,marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONES */}
      <section className="isec" style={{ padding:'96px 60px' }}>
        <span className="ilabel" style={{ color,marginBottom:10 }}>Funcionalidades</span>
        <h2 className="ih2" style={{ fontSize:'clamp(28px,4vw,46px)',marginBottom:12 }}>Todo lo que necesitas<br />para tu {industria.nombre.toLowerCase()}</h2>
        <p className="ibody" style={{ fontSize:16,marginBottom:52,maxWidth:500 }}>Funciones diseñadas para el día a día de tu negocio.</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16 }}>
          {industria.funciones.map((f, i) => (
            <div key={i} className="icard icard-hover" style={{ border:`1px solid ${i===0 ? colorBorder : BORDER}`,borderRadius:18,padding:26 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=colorBorder;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=i===0?colorBorder:BORDER;}}>
              <div style={{ width:52,height:52,borderRadius:12,overflow:'hidden',marginBottom:16,border:`1px solid ${color}33` }}>
                <img src={funcPhotos[i]||funcPhotos[0]} alt={f.titulo} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              <p className="ictitle">{f.titulo}</p>
              <p className="icdesc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHAT DEMO */}
      <section id="flujo" style={{ padding:'96px 60px',background:BG }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center' }}>
          <div>
            <span className="ilabel" style={{ color,marginBottom:10 }}>Demo real</span>
            <h2 className="ih2" style={{ fontSize:'clamp(26px,3.5vw,42px)',marginBottom:16 }}>Así habla tu agente IA<br />con los clientes</h2>
            <p className="ibody" style={{ fontSize:15,marginBottom:28 }}>Conversación real entre un cliente y el agente IA configurado para {industria.nombre.toLowerCase()}.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {['Responde en menos de 2 segundos','Disponible los 7 días, 24 horas','Aprende de tu negocio específico','Escala a humano cuando es necesario'].map((item,i) => (
                <div key={i} className="icheck">
                  <span style={{ width:20,height:20,borderRadius:'50%',background:colorBg,border:`1px solid ${colorBorder}`,color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:10,fontWeight:800,flexShrink:0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Widget WhatsApp */}
          <div style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:20,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ background:'#1A6B3C',padding:'14px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid rgba(255,255,255,0.06)` }}>
              <div style={{ width:40,height:40,borderRadius:'50%',overflow:'hidden',flexShrink:0 }}>
                <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily:F,fontWeight:700,color:'#fff',fontSize:14 }}>Agente IA — {industria.nombre}</div>
                <div style={{ fontFamily:F,fontSize:11,color:'rgba(255,255,255,0.7)' }}>● En línea ahora</div>
              </div>
            </div>
            <div style={{ padding:18,display:'flex',flexDirection:'column',gap:10,background:'#0A1628',minHeight:320 }}>
              {industria.flujoChat.map((msg,i) => (
                <div key={i} style={{ display:'flex',justifyContent:msg.rol==='agente'?'flex-start':'flex-end' }}>
                  <div style={{ maxWidth:'78%',background:msg.rol==='agente'?'#1E2D3D':'#1A4731',borderRadius:msg.rol==='agente'?'0 14px 14px 14px':'14px 0 14px 14px',padding:'10px 14px',fontFamily:F,fontSize:13,lineHeight:1.55,color:'#E4ECF7',whiteSpace:'pre-line',border:`1px solid ${BORDER}` }}>
                    {msg.rol==='agente' && <div style={{ fontSize:10,color:'#22D3EE',fontWeight:700,marginBottom:4,letterSpacing:'0.08em' }}>AGENTE IA</div>}
                    {msg.texto}
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:4,textAlign:'right' }}>{['9:14','9:15','9:15','9:16','9:16','9:16'][i]} ✓✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="isec" style={{ padding:'96px 60px' }}>
        <span className="ilabel" style={{ color,marginBottom:10 }}>Resultados reales</span>
        <h2 className="ih2" style={{ fontSize:'clamp(26px,3.5vw,42px)',marginBottom:44 }}>Negocios que ya lo están usando</h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16 }}>
          {industria.casos.map((caso,i) => (
            <div key={i} className="icard" style={{ border:`1px solid ${colorBorder}`,borderRadius:18,padding:26 }}>
              <div style={{ color:'#F59E0B',fontSize:13,marginBottom:14,letterSpacing:3 }}>★★★★★</div>
              <p className="itesti">"{caso.resultado}"</p>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:colorBg,color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:800,flexShrink:0 }}>{caso.nombre.charAt(0)}</div>
                <div style={{ fontFamily:F,fontWeight:600,fontSize:14,color:WHITE }}>{caso.nombre}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OTRAS INDUSTRIAS */}
      <section style={{ padding:'64px 60px',background:BG }}>
        <h3 className="ih3" style={{ fontSize:16,marginBottom:24,fontWeight:600 }}>También tenemos soluciones para:</h3>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
          {Object.values(INDUSTRIAS_DETALLE).filter(ind=>ind.slug!==industria.slug).map(ind=>(
            <Link key={ind.slug} href={`/industrias/${ind.slug}`} className="ichip"
              style={{ background:BG_CARD,border:`1px solid ${BORDER}`,borderRadius:100,padding:'8px 16px 8px 8px',transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ind.color+'44';e.currentTarget.style.color=ind.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=GRAY;}}>
              <div style={{ width:22,height:22,borderRadius:'50%',overflow:'hidden',flexShrink:0 }}>
                <img src={INDUSTRY_PHOTOS[ind.slug]||INDUSTRY_PHOTOS.taller} alt={ind.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              {ind.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding:'96px 60px',textAlign:'center',position:'relative',overflow:'hidden',background:BG_CARD }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:`url(${indPhoto.replace('w=160','w=1400')})`,backgroundSize:'cover',backgroundPosition:'center',filter:'brightness(0.08)' }} />
        <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse 55% 75% at 50% 50%,${colorBg},transparent)` }} />
        <div style={{ position:'relative' }}>
          <div style={{ width:80,height:80,borderRadius:'50%',overflow:'hidden',margin:'0 auto 20px',border:`3px solid ${color}55`,boxShadow:`0 8px 32px ${color}33` }}>
            <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          </div>
          <h2 className="ih2" style={{ fontSize:'clamp(32px,4.5vw,58px)',marginBottom:18 }}>
            ¿Listo para automatizar<br />tu <span style={{ color }}>{industria.nombre.toLowerCase()}?</span>
          </h2>
          <p className="ibody" style={{ fontSize:17,marginBottom:40 }}>14 días gratis · Sin tarjeta de crédito · Configuración en minutos</p>
          <div style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap' }}>
            <Link href="/auth/register" style={{ background:color,color:'#080B0F',borderRadius:100,fontFamily:F,fontWeight:800,fontSize:16,padding:'14px 36px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,boxShadow:`0 6px 24px ${color}44` }}>
              Crear mi cuenta gratis →
            </Link>
            <a href="mailto:soportesistemas@soporteia.net" className="btn-ghost-ind">Hablar con un asesor</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${BORDER}`,padding:'28px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,background:BG }}>
        <Logo size={20} />
        <div style={{ display:'flex',gap:24 }}>
          <Link href="/" className="ifl">Inicio</Link>
          <Link href="/#precios" className="ifl">Precios</Link>
          <Link href="/auth/register" className="ifl">Registrarse</Link>
        </div>
        <span style={{ fontFamily:F,color:'#2D3F5C',fontSize:12 }}>© 2026 agencIAme by NexoTI · Cali, Colombia</span>
      </footer>
    </>
  );
}
