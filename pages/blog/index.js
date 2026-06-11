// pages/blog/index.js
import Head from 'next/head';
import Link from 'next/link';
import { ARTICULOS } from '../../lib/blogData';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

function formatFecha(str) {
  const d = new Date(str);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog — agencIAme | Automatización con IA para negocios en Colombia</title>
        <meta name="description" content="Guías, casos de éxito y estrategias para automatizar tu negocio con inteligencia artificial en Colombia. ChatBot WhatsApp, CRM, agendamiento automático." />
        <meta name="keywords" content="chatbot whatsapp colombia, automatizar negocio ia, bot whatsapp colombia, agenciame" />
        <meta property="og:title" content="Blog agencIAme — Automatización IA para negocios Colombia" />
        <meta property="og:description" content="Guías prácticas para automatizar tu negocio con IA en Colombia." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        body { background:#080808; color:#E8E8E8; font-family:${F}; margin:0; overflow-x:hidden; }
        *, *::before, *::after { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        .bc:hover .bc-img { transform:scale(1.04); }
        .bc:hover .bc-title { color:#60A5FA; }
        .bc { transition:transform 0.2s; cursor:pointer; }
        .bc:hover { transform:translateY(-3px); }
        @media(max-width:768px){
          .blog-hero { padding:60px 22px 48px !important; }
          .blog-featured { grid-template-columns:1fr !important; }
          .blog-featured-img { min-height:220px !important; }
          .blog-featured-text { padding:32px 24px !important; }
          .blog-grid { grid-template-columns:1fr !important; }
          .blog-nav { padding:0 20px !important; }
          .blog-cta { padding:60px 22px !important; }
          .blog-footer { padding:24px 22px !important; flex-direction:column !important; gap:8px !important; text-align:center !important; }
        }
      `}} />

      {/* Nav */}
      <nav className="blog-nav" style={{ position:'sticky', top:0, zIndex:100, background:'rgba(8,8,8,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid #141414', padding:'0 64px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/">
          <span style={{ fontFamily:FA, fontSize:20, color:'#E8E8E8', cursor:'pointer' }}>
            agenc<span style={{ color:'#FF6B00', fontSize:23 }}>IA</span>me
          </span>
        </Link>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          <Link href="/" style={{ fontFamily:F, fontSize:13, color:'#555', display:'none' }}>Inicio</Link>
          <Link href="/auth/register">
            <button style={{ background:'#2563EB', color:'#fff', border:'none', borderRadius:4, padding:'8px 20px', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Empezar gratis
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="blog-hero" style={{ padding:'80px 64px 60px', borderBottom:'1px solid #141414', background:'linear-gradient(180deg,#0C0C0C 0%,#080808 100%)' }}>
        <div style={{ maxWidth:800 }}>
          <span style={{ fontFamily:F, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#2563EB', display:'block', marginBottom:20 }}>Blog</span>
          <h1 style={{ fontFamily:FA, fontSize:'clamp(42px,6vw,72px)', fontWeight:400, lineHeight:1.0, letterSpacing:'-1.5px', marginBottom:20, color:'#F0F0F0' }}>
            Ideas para crecer<br />con inteligencia artificial
          </h1>
          <p style={{ fontFamily:F, fontSize:17, color:'#333', lineHeight:1.8, maxWidth:520, fontWeight:300 }}>
            Guías prácticas, casos reales y estrategias para automatizar tu negocio en Colombia.
          </p>
        </div>
      </div>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'64px 32px' }}>

        {/* Destacado */}
        <Link href={`/blog/${ARTICULOS[0].slug}`}>
          <div className="bc blog-featured" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid #141414', overflow:'hidden', marginBottom:64 }}>
            <div className="blog-featured-img" style={{ position:'relative', overflow:'hidden', minHeight:360 }}>
              <img className="bc-img" src={ARTICULOS[0].imagen} alt={ARTICULOS[0].titulo}
                style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 50%,#080808 100%)' }} />
            </div>
            <div className="blog-featured-text" style={{ padding:'52px 48px', display:'flex', flexDirection:'column', justifyContent:'center', borderLeft:'1px solid #141414' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <span style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#2563EB' }}>Destacado</span>
                <span style={{ fontFamily:F, fontSize:10, color:'#1A1A1A' }}>· {ARTICULOS[0].categoria} · {ARTICULOS[0].tiempo}</span>
              </div>
              <h2 className="bc-title" style={{ fontFamily:FA, fontSize:'clamp(22px,2.5vw,36px)', fontWeight:400, lineHeight:1.1, color:'#E8E8E8', marginBottom:16, transition:'color 0.2s' }}>
                {ARTICULOS[0].titulo}
              </h2>
              <p style={{ fontFamily:F, fontSize:15, color:'#2A2A2A', lineHeight:1.7, marginBottom:28, fontWeight:300 }}>
                {ARTICULOS[0].resumen}
              </p>
              <span style={{ fontFamily:F, fontSize:12, color:'#1A1A1A' }}>{formatFecha(ARTICULOS[0].fecha)}</span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="blog-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'#141414', border:'1px solid #141414' }}>
          {ARTICULOS.slice(1).map((art, i) => (
            <Link key={i} href={`/blog/${art.slug}`}>
              <div className="bc" style={{ background:'#080808', overflow:'hidden' }}>
                <div style={{ height:200, overflow:'hidden' }}>
                  <img className="bc-img" src={art.imagen} alt={art.titulo}
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }} />
                </div>
                <div style={{ padding:'28px' }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:F, fontSize:9, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#2563EB' }}>{art.categoria}</span>
                    <span style={{ fontFamily:F, fontSize:9, color:'#1A1A1A' }}>{art.tiempo}</span>
                  </div>
                  <h3 className="bc-title" style={{ fontFamily:FA, fontSize:20, fontWeight:400, lineHeight:1.2, color:'#E8E8E8', marginBottom:10, transition:'color 0.2s' }}>
                    {art.titulo}
                  </h3>
                  <p style={{ fontFamily:F, fontSize:13, color:'#2A2A2A', lineHeight:1.7, fontWeight:300, marginBottom:16 }}>
                    {art.resumen}
                  </p>
                  <span style={{ fontFamily:F, fontSize:11, color:'#1A1A1A' }}>{formatFecha(art.fecha)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* CTA */}
      <div className="blog-cta" style={{ borderTop:'1px solid #141414', padding:'80px 64px', textAlign:'center', background:'#0C0C0C' }}>
        <h2 style={{ fontFamily:FA, fontSize:'clamp(32px,4vw,52px)', fontWeight:400, letterSpacing:'-1px', marginBottom:16, color:'#F0F0F0' }}>
          ¿Listo para automatizar tu negocio?
        </h2>
        <p style={{ fontFamily:F, fontSize:15, color:'#2A2A2A', marginBottom:36, fontWeight:300 }}>
          14 días gratis · Sin tarjeta de crédito · Configuración en minutos
        </p>
        <Link href="/auth/register">
          <button style={{ background:'#2563EB', color:'#fff', border:'none', padding:'16px 44px', fontFamily:F, fontSize:15, fontWeight:600, cursor:'pointer' }}>
            Crear cuenta gratis →
          </button>
        </Link>
      </div>

      <footer className="blog-footer" style={{ borderTop:'1px solid #0E0E0E', padding:'28px 64px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:FA, fontSize:16 }}>agenc<span style={{ color:'#FF6B00' }}>IA</span>me</span>
        <span style={{ fontFamily:F, fontSize:11, color:'#141414' }}>© 2026 NexoTI · Cali, Colombia</span>
        <Link href="/" style={{ fontFamily:F, fontSize:12, color:'#1A1A1A' }}>← Volver al inicio</Link>
      </footer>
    </>
  );
}
