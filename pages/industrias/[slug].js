// pages/industrias/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { INDUSTRIAS_DETALLE, SLUGS_VALIDOS } from '../../lib/industriasData';
import { Logo } from '../index';
import { useAuth } from '../../lib/AuthContext';

const INDUSTRY_PHOTOS = {
  taller: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=160&q=90',
  peluqueria: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=160&q=90',
  inmobiliaria: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=160&q=90',
  restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&q=90',
  restaurante_barrio: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&q=90',
  tienda: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=160&q=90',
  gimnasio: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&q=90',
  salud: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=160&q=90',
  ajedrez: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=160&q=90',
  arquitectura: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=160&q=90',
  papeleria: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=160&q=90',
  deporte: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=160&q=90',
};

const FUNCTION_PHOTOS = {
  taller: [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    'https://images.unsplash.com/photo-1609205807107-1b66742b9e21?w=80&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80',
  ],
  peluqueria: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=80&q=80',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=80&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=80&q=80',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&q=80',
    'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=80&q=80',
  ],
  restaurante: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=80&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=80&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&q=80',
  ],
  restaurante_barrio: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=80&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=80&q=80',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=80&q=80',
  ],
  inmobiliaria: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=80&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=80&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6f349479?w=80&q=80',
  ],
  gimnasio: [
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=80&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=80&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=80&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=80&q=80',
    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=80&q=80',
  ],
  salud: [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&q=80',
    'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=80&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=80&q=80',
  ],
  ajedrez: [
    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=80&q=80',
    'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=80&q=80',
    'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=80&q=80',
    'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=80&q=80',
    'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=80&q=80',
    'https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=80&q=80',
  ],
  arquitectura: [
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=80&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=80&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b47b292?w=80&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=80&q=80',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&q=80',
  ],
  tienda: [
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=80&q=80',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=80&q=80',
    'https://images.unsplash.com/photo-1613082441547-09f407d42dd1?w=80&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&q=80',
  ],
  papeleria: [
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=80&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=80&q=80',
    'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=80&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=80&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=80&q=80',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=80&q=80',
  ],
};

const CSS = `
  *,-webkit-font-smoothing:antialiased,-moz-osx-font-smoothing:grayscale;
  html,body{background:#0F1623;color:#F0F4FF;font-family:'Inter',system-ui,sans-serif;}
  .ip *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-feature-settings:'kern' 1;}
  .ih1{font-family:'Inter',system-ui,sans-serif;font-weight:800;letter-spacing:-0.04em;line-height:1.1;color:#F0F4FF;font-synthesis:none;}
  .ih2{font-family:'Inter',system-ui,sans-serif;font-weight:700;letter-spacing:-0.03em;line-height:1.2;color:#F0F4FF;font-synthesis:none;}
  .ih3{font-family:'Inter',system-ui,sans-serif;font-weight:600;letter-spacing:-0.01em;line-height:1.3;color:#9AAAC4;}
  .ibody{font-family:'Inter',system-ui,sans-serif;font-weight:400;line-height:1.65;color:#C8D4E8;}
  .ilabel{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;display:block;}
  .inav{font-family:'Inter',system-ui,sans-serif;font-size:13px;font-weight:500;color:#9AAAC4;transition:color 0.15s;text-decoration:none;}
  .inav:hover{color:#F0F4FF;}
  .ibread{font-family:'Inter',system-ui,sans-serif;font-size:13px;font-weight:500;color:#9AAAC4;text-decoration:none;}
  .istat{font-family:'Inter',system-ui,sans-serif;font-weight:800;letter-spacing:-0.04em;line-height:1;font-synthesis:none;}
  .ictitle{font-family:'Inter',system-ui,sans-serif;font-weight:700;font-size:16px;letter-spacing:-0.02em;color:#F0F4FF;margin-bottom:10px;margin:0 0 10px;}
  .icdesc{font-family:'Inter',system-ui,sans-serif;font-size:14px;color:#9AAAC4;line-height:1.65;margin:0;}
  .icheck{font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:500;color:#C8D4E8;display:flex;align-items:center;gap:10px;}
  .itesti{font-family:'Inter',system-ui,sans-serif;font-size:15px;font-style:italic;color:#C8D4E8;line-height:1.65;margin:0 0 20px;}
  .ifl{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:#6B7A99;text-decoration:none;transition:color 0.15s;}
  .ifl:hover{color:#9AAAC4;}
  .ichip{font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:500;color:#9AAAC4;display:flex;align-items:center;gap:8px;text-decoration:none;transition:all 0.2s;}
  .isec{background:#141C2F;}
  .icard{background:#0F1623;}
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
  const indPhoto = INDUSTRY_PHOTOS[industria.slug] || INDUSTRY_PHOTOS.taller;
  const funcPhotos = FUNCTION_PHOTOS[industria.slug] || FUNCTION_PHOTOS.taller;
  const F = "'Inter', system-ui, sans-serif";

  return (
    <>
      <Head>
        <title>{industria.nombre} — agencIAme IA</title>
        <meta name="description" content={industria.descripcion} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{__html: CSS}} />

      {/* NAV */}
      <nav className="ip" style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 60px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',backdropFilter:'blur(20px)',background:'rgba(15,22,35,0.96)',borderBottom:'1px solid rgba(37,99,235,0.15)' }}>
        <Link href="/"><Logo size={22} /></Link>
        <div style={{ display:'flex',gap:28,alignItems:'center' }}>
          <Link href="/#empresas" className="inav">← Todas las empresas</Link>
          <Link href="/#precios" className="inav">Precios</Link>
        </div>
        {user
          ? <Link href="/dashboard" className="btn btn-accent btn-sm">Mi panel →</Link>
          : <Link href="/auth/register" className="btn btn-accent btn-sm">Comenzar gratis</Link>
        }
      </nav>

      {/* HERO */}
      <section className="ip" style={{ minHeight:'75vh',display:'flex',flexDirection:'column',justifyContent:'center',padding:'120px 60px 80px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:`url(${indPhoto.replace('w=160','w=1400')})`,backgroundSize:'cover',backgroundPosition:'center',filter:'brightness(0.15) saturate(0.6)' }} />
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(15,22,35,0.98) 0%,rgba(15,22,35,0.75) 60%,rgba(15,22,35,0.5) 100%)' }} />
        <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse 70% 70% at 70% 40%,${colorBg},transparent)`,pointerEvents:'none' }} />

        <div style={{ position:'relative' }}>
          {/* Breadcrumb */}
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:36 }}>
            <Link href="/#empresas" className="ibread">← Empresas</Link>
            <span style={{ color:'#3A4D6B',fontFamily:F }}>/ </span>
            <span style={{ color,fontFamily:F,fontSize:13,fontWeight:700 }}>{industria.nombre}</span>
          </div>

          <div style={{ width:88,height:88,borderRadius:20,overflow:'hidden',marginBottom:28,border:`2px solid ${color}44`,boxShadow:`0 8px 32px ${color}22` }}>
            <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          </div>

          <span className="ilabel" style={{ display:'inline-flex',alignItems:'center',gap:8,background:colorBg,border:`1px solid ${colorBorder}`,color,padding:'6px 16px',borderRadius:100,marginBottom:24,fontSize:12 }}>
            IA para {industria.nombre}
          </span>

          <h1 className="ih1" style={{ fontSize:'clamp(38px,5.5vw,72px)',maxWidth:760,marginBottom:20 }}>
            {industria.tagline.split(' ').map((w, i, arr) =>
              i >= arr.length - 2
                ? <span key={i} style={{ color }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>
                : w + ' '
            )}
          </h1>

          <p className="ibody" style={{ fontSize:18,maxWidth:580,marginBottom:48 }}>{industria.descripcion}</p>

          <div style={{ display:'flex',gap:16,flexWrap:'wrap',marginBottom:60 }}>
            <Link href="/auth/register" style={{ background:color,color:'#080B0F',borderRadius:100,padding:'14px 32px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,fontFamily:F,fontWeight:700,fontSize:16,letterSpacing:'0.01em' }}>
              Probar 14 días gratis →
            </Link>
            <a href="#flujo" className="btn btn-ghost btn-lg">Ver demo del chat</a>
          </div>

          <div style={{ display:'flex',gap:48,flexWrap:'wrap' }}>
            {industria.heroStats.map((s, i) => (
              <div key={i}>
                <div className="istat" style={{ fontSize:36,color }}>{s.valor}</div>
                <div style={{ fontFamily:F,fontSize:13,fontWeight:500,color:'#9AAAC4',marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONES */}
      <section className="ip isec" style={{ padding:'100px 60px' }}>
        <span className="ilabel" style={{ color,marginBottom:12 }}>Funcionalidades</span>
        <h2 className="ih2" style={{ fontSize:'clamp(28px,4vw,48px)',marginBottom:12 }}>Todo lo que necesitas<br />para tu {industria.nombre.toLowerCase()}</h2>
        <p className="ibody" style={{ fontSize:17,marginBottom:60,maxWidth:520 }}>Funciones diseñadas específicamente para el día a día de tu negocio.</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20 }}>
          {industria.funciones.map((f, i) => (
            <div key={i} className="icard" style={{ border:`1px solid ${i===0?colorBorder:'rgba(255,255,255,0.06)'}`,borderRadius:16,padding:28,transition:'all 0.25s',cursor:'default' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=colorBorder;e.currentTarget.style.transform='translateY(-4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=i===0?colorBorder:'rgba(255,255,255,0.06)';e.currentTarget.style.transform='translateY(0)';}}>
              <div style={{ width:56,height:56,borderRadius:12,overflow:'hidden',marginBottom:18,border:`1px solid ${color}33` }}>
                <img src={funcPhotos[i]||funcPhotos[0]} alt={f.titulo} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              <p className="ictitle">{f.titulo}</p>
              <p className="icdesc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHAT DEMO */}
      <section id="flujo" className="ip" style={{ padding:'100px 60px',background:'#0F1623' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
          <div>
            <span className="ilabel" style={{ color,marginBottom:12 }}>Demo real</span>
            <h2 className="ih2" style={{ fontSize:'clamp(28px,3.5vw,44px)',marginBottom:16 }}>Así habla tu agente IA con los clientes</h2>
            <p className="ibody" style={{ fontSize:16,marginBottom:32 }}>Conversación real entre un cliente y el agente IA configurado para {industria.nombre.toLowerCase()}. Respuestas inteligentes y personalizadas.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {['Responde en menos de 2 segundos','Disponible los 7 días, 24 horas','Aprende de tu negocio específico','Escala a humano cuando es necesario'].map((item,i) => (
                <div key={i} className="icheck">
                  <span style={{ width:20,height:20,borderRadius:'50%',background:colorBg,border:`1px solid ${colorBorder}`,color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:700,flexShrink:0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#141C2F',border:'1px solid rgba(37,99,235,0.15)',borderRadius:20,overflow:'hidden' }}>
            <div style={{ background:'#25D366',padding:'14px 20px',display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:'50%',overflow:'hidden',flexShrink:0 }}>
                <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily:F,fontWeight:700,color:'#fff',fontSize:14 }}>Agente IA — {industria.nombre}</div>
                <div style={{ fontFamily:F,fontSize:12,color:'rgba(255,255,255,0.8)' }}>● En línea ahora</div>
              </div>
            </div>
            <div style={{ padding:20,display:'flex',flexDirection:'column',gap:12,background:'#0a1628',minHeight:340 }}>
              {industria.flujoChat.map((msg,i) => (
                <div key={i} style={{ display:'flex',justifyContent:msg.rol==='agente'?'flex-start':'flex-end' }}>
                  <div style={{ maxWidth:'78%',background:msg.rol==='agente'?'#1F2C34':'#005C4B',borderRadius:msg.rol==='agente'?'0 12px 12px 12px':'12px 0 12px 12px',padding:'10px 14px',fontFamily:F,fontSize:13,lineHeight:1.5,color:'#E9EDEF',whiteSpace:'pre-line' }}>
                    {msg.rol==='agente' && <div style={{ fontSize:10,color:'#22D3EE',fontWeight:700,marginBottom:4,letterSpacing:'0.08em' }}>AGENTE IA</div>}
                    {msg.texto}
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:4,textAlign:'right' }}>{['9:14','9:15','9:15','9:16','9:16','9:16'][i]} ✓✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASOS */}
      <section className="ip isec" style={{ padding:'100px 60px' }}>
        <span className="ilabel" style={{ color,marginBottom:12 }}>Resultados reales</span>
        <h2 className="ih2" style={{ fontSize:'clamp(28px,3.5vw,44px)',marginBottom:48 }}>Negocios que ya lo están usando</h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20 }}>
          {industria.casos.map((caso,i) => (
            <div key={i} className="icard" style={{ border:`1px solid ${colorBorder}`,borderRadius:16,padding:28 }}>
              <div style={{ color:'#F59E0B',fontSize:14,marginBottom:16,letterSpacing:2 }}>★★★★★</div>
              <p className="itesti">"{caso.resultado}"</p>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:colorBg,color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:14,fontWeight:700 }}>{caso.nombre.charAt(0)}</div>
                <div style={{ fontFamily:F,fontWeight:600,fontSize:14,color:'#F0F4FF' }}>{caso.nombre}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OTRAS EMPRESAS */}
      <section className="ip" style={{ padding:'80px 60px',background:'#0F1623' }}>
        <h3 className="ih3" style={{ fontSize:18,marginBottom:28 }}>También tenemos soluciones para:</h3>
        <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
          {Object.values(INDUSTRIAS_DETALLE).filter(ind=>ind.slug!==industria.slug).map(ind=>(
            <Link key={ind.slug} href={`/industrias/${ind.slug}`} className="ichip"
              style={{ background:'#141C2F',border:'1px solid rgba(255,255,255,0.08)',borderRadius:100,padding:'8px 16px 8px 8px' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ind.color+'44';e.currentTarget.style.color=ind.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.color='#9AAAC4';}}>
              <div style={{ width:24,height:24,borderRadius:'50%',overflow:'hidden',flexShrink:0 }}>
                <img src={INDUSTRY_PHOTOS[ind.slug]||INDUSTRY_PHOTOS.taller} alt={ind.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
              {ind.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="ip" style={{ padding:'100px 60px',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:`url(${indPhoto.replace('w=160','w=1400')})`,backgroundSize:'cover',backgroundPosition:'center',filter:'brightness(0.12)' }} />
        <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse 60% 80% at 50% 50%,${colorBg},transparent)` }} />
        <div style={{ position:'relative' }}>
          <div style={{ width:80,height:80,borderRadius:'50%',overflow:'hidden',margin:'0 auto 20px',border:`3px solid ${color}55`,boxShadow:`0 8px 32px ${color}33` }}>
            <img src={indPhoto} alt={industria.nombre} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
          </div>
          <h2 className="ih2" style={{ fontSize:'clamp(36px,4.5vw,60px)',marginBottom:20 }}>
            ¿Listo para automatizar<br />tu <span style={{ color }}>{industria.nombre.toLowerCase()}?</span>
          </h2>
          <p className="ibody" style={{ fontSize:18,marginBottom:44 }}>14 días gratis · Sin tarjeta de crédito · Configuración en minutos</p>
          <div style={{ display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap' }}>
            <Link href="/auth/register" style={{ background:color,color:'#080B0F',borderRadius:100,fontFamily:F,fontWeight:700,fontSize:16,padding:'14px 36px',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 }}>Crear mi cuenta gratis →</Link>
            <a href="mailto:soportesistemas@soporteia.net" className="btn btn-ghost btn-lg">Hablar con un asesor</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ip" style={{ borderTop:'1px solid rgba(37,99,235,0.12)',padding:'32px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,background:'#0F1623' }}>
        <Logo size={20} />
        <div style={{ display:'flex',gap:24 }}>
          <Link href="/" className="ifl">Inicio</Link>
          <Link href="/#precios" className="ifl">Precios</Link>
          <Link href="/auth/register" className="ifl">Registrarse</Link>
        </div>
        <span style={{ fontFamily:F,color:'#3A4D6B',fontSize:12 }}>© 2026 agencIAme by NexoTI · Cali, Colombia</span>
      </footer>
    </>
  );
}
