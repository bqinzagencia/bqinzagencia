// pages/blog/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { ARTICULOS, getArticulo } from '../../lib/blogData';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const FF = "'Georgia', serif";

export async function getStaticPaths() {
  return {
    paths: ARTICULOS.map(a => ({ params: { slug: a.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const articulo = getArticulo(params.slug);
  const relacionados = ARTICULOS.filter(a => a.slug !== params.slug).slice(0, 3);
  return { props: { articulo, relacionados } };
}

export default function ArticuloBlog({ articulo, relacionados }) {
  if (!articulo) return null;

  const renderBloque = (bloque, i) => {
    switch (bloque.tipo) {
      case 'intro':
        return (
          <p key={i} style={{ fontFamily:FF, fontStyle:'italic', fontSize:20, color:'rgba(255,255,255,0.55)', lineHeight:1.85, marginBottom:36, fontWeight:300, borderLeft:'2px solid #2563EB', paddingLeft:24 }}>
            {bloque.texto}
          </p>
        );
      case 'h2':
        return (
          <h2 key={i} style={{ fontFamily:FA, fontSize:'clamp(22px,3vw,32px)', fontWeight:400, lineHeight:1.1, letterSpacing:'-0.5px', color:'#F0F0F0', marginTop:48, marginBottom:20 }}>
            {bloque.texto}
          </h2>
        );
      case 'parrafo':
        return (
          <p key={i} style={{ fontFamily:F, fontSize:16, color:'#3A3A3A', lineHeight:1.85, marginBottom:24, fontWeight:300 }}>
            {bloque.texto}
          </p>
        );
      case 'lista':
        return (
          <ul key={i} style={{ listStyle:'none', padding:0, margin:'0 0 28px', display:'flex', flexDirection:'column', gap:12 }}>
            {bloque.items.map((item, j) => (
              <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:12, fontFamily:F, fontSize:15, color:'#3A3A3A', lineHeight:1.6, fontWeight:300 }}>
                <span style={{ color:'#2563EB', fontWeight:700, flexShrink:0, marginTop:2 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        );
      case 'cta':
        return (
          <div key={i} style={{ margin:'48px 0', padding:'36px 40px', background:'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(6,182,212,0.04))', border:'1px solid rgba(37,99,235,0.2)', textAlign:'center' }}>
            <p style={{ fontFamily:F, fontSize:15, color:'#8A9BB5', marginBottom:20, fontWeight:400 }}>
              ¿Listo para automatizar tu negocio? Prueba gratis 14 días, sin tarjeta de crédito.
            </p>
            <Link href={bloque.href}>
              <button style={{ background:'#2563EB', color:'#fff', border:'none', padding:'14px 36px', fontFamily:F, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 20px rgba(37,99,235,0.35)' }}>
                {bloque.texto} →
              </button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>{articulo.titulo} — agencIAme Blog</title>
        <meta name="description" content={articulo.resumen} />
        <meta name="keywords" content={`${articulo.titulo}, chatbot whatsapp colombia, automatizar negocio ia, agenciame`} />
        <meta property="og:title" content={articulo.titulo} />
        <meta property="og:description" content={articulo.resumen} />
        <meta property="og:image" content={articulo.imagen} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://agenciame.com/blog/${articulo.slug}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        body { background:#080808; color:#E8E8E8; font-family:${F}; margin:0; overflow-x:hidden; }
        *, *::before, *::after { box-sizing:border-box; }
        a { text-decoration:none; color:inherit; }
        .rel-card:hover img { transform:scale(1.05); }
        .rel-card:hover h4 { color:#60A5FA; }
        @media(max-width:768px){
          .art-hero { padding:100px 22px 48px !important; }
          .art-body  { padding:40px 22px !important; }
          .art-grid  { grid-template-columns:1fr !important; }
          .art-nav   { padding:0 20px !important; }
        }
      `}} />

      {/* Nav */}
      <nav className="art-nav" style={{ position:'sticky', top:0, zIndex:100, background:'rgba(8,8,8,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid #141414', padding:'0 64px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/">
          <span style={{ fontFamily:FA, fontSize:20, color:'#E8E8E8', cursor:'pointer' }}>
            agenc<span style={{ color:'#FF6B00', fontSize:23 }}>IA</span>me
          </span>
        </Link>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          <Link href="/blog" style={{ fontFamily:F, fontSize:13, color:'#555' }}>← Blog</Link>
          <Link href="/auth/register">
            <button style={{ background:'#2563EB', color:'#fff', border:'none', padding:'8px 20px', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Empezar gratis
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero del artículo */}
      <div className="art-hero" style={{ position:'relative', padding:'120px 64px 72px', overflow:'hidden' }}>
        <img src={articulo.imagen} alt={articulo.titulo}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.12)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(8,8,8,0.3) 0%,#080808 100%)' }} />
        <div style={{ position:'relative', maxWidth:720 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <Link href="/blog">
              <span style={{ fontFamily:F, fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#2563EB', cursor:'pointer' }}>Blog</span>
            </Link>
            <span style={{ color:'#1A1A1A' }}>/</span>
            <span style={{ fontFamily:F, fontSize:11, color:'#1A1A1A', textTransform:'uppercase', letterSpacing:1 }}>{articulo.categoria}</span>
          </div>
          <h1 style={{ fontFamily:FA, fontSize:'clamp(32px,5vw,60px)', fontWeight:400, lineHeight:1.05, letterSpacing:'-1.5px', color:'#F0F0F0', marginBottom:20 }}>
            {articulo.titulo}
          </h1>
          <p style={{ fontFamily:F, fontSize:16, color:'#2A2A2A', marginBottom:28, fontWeight:300 }}>
            {articulo.resumen}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#FF6B00,#FF9500)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', fontFamily:F }}>A</div>
              <div>
                <div style={{ fontFamily:F, fontSize:13, fontWeight:600, color:'#8A9BB5' }}>Alexander Borrero</div>
                <div style={{ fontFamily:F, fontSize:11, color:'#1A1A1A' }}>NexoTI · agencIAme</div>
              </div>
            </div>
            <span style={{ color:'#141414' }}>·</span>
            <span style={{ fontFamily:F, fontSize:12, color:'#1A1A1A' }}>
              {new Date(articulo.fecha).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}
            </span>
            <span style={{ color:'#141414' }}>·</span>
            <span style={{ fontFamily:F, fontSize:12, color:'#1A1A1A' }}>{articulo.tiempo} de lectura</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:1, maxWidth:1200, margin:'0 auto', borderTop:'1px solid #141414' }}>

        {/* Artículo */}
        <article className="art-body" style={{ padding:'64px 72px', borderRight:'1px solid #141414' }}>
          {articulo.contenido.map((bloque, i) => renderBloque(bloque, i))}

          {/* Compartir */}
          <div style={{ marginTop:64, paddingTop:32, borderTop:'1px solid #141414', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <span style={{ fontFamily:F, fontSize:12, color:'#1A1A1A', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>Compartir</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(articulo.titulo + ' — ' + 'https://agenciame.com/blog/' + articulo.slug)}`}
              target="_blank" rel="noreferrer"
              style={{ background:'rgba(37,211,102,0.1)', color:'#25D366', border:'1px solid rgba(37,211,102,0.2)', padding:'7px 16px', fontFamily:F, fontSize:12, fontWeight:600 }}>
              WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(articulo.titulo)}&url=${encodeURIComponent('https://agenciame.com/blog/' + articulo.slug)}`}
              target="_blank" rel="noreferrer"
              style={{ background:'rgba(29,161,242,0.08)', color:'#1DA1F2', border:'1px solid rgba(29,161,242,0.2)', padding:'7px 16px', fontFamily:F, fontSize:12, fontWeight:600 }}>
              X (Twitter)
            </a>
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ padding:'48px 32px' }}>
          {/* CTA sidebar */}
          <div style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(6,182,212,0.05))', border:'1px solid rgba(37,99,235,0.2)', padding:'28px 24px', marginBottom:40 }}>
            <div style={{ fontFamily:FA, fontSize:22, fontWeight:400, color:'#EFF4FF', marginBottom:12, lineHeight:1.1 }}>
              Prueba agenc<span style={{ color:'#FF6B00' }}>IA</span>me gratis
            </div>
            <p style={{ fontFamily:F, fontSize:13, color:'#4B6080', lineHeight:1.6, marginBottom:20, fontWeight:300 }}>
              14 días sin costo. Automatiza WhatsApp, CRM y citas de tu negocio hoy mismo.
            </p>
            <Link href="/auth/register">
              <button style={{ width:'100%', background:'#2563EB', color:'#fff', border:'none', padding:'11px', fontFamily:F, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Comenzar gratis →
              </button>
            </Link>
          </div>

          {/* Artículos relacionados */}
          <div>
            <div style={{ fontFamily:F, fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#1A1A1A', marginBottom:20 }}>
              También te puede interesar
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {relacionados.map((rel, i) => (
                <Link key={i} href={`/blog/${rel.slug}`}>
                  <div className="rel-card" style={{ display:'flex', gap:12, cursor:'pointer' }}>
                    <div style={{ width:72, height:56, overflow:'hidden', flexShrink:0 }}>
                      <img src={rel.imagen} alt={rel.titulo}
                        style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily:F, fontSize:13, fontWeight:600, color:'#8A9BB5', lineHeight:1.35, marginBottom:4, transition:'color 0.2s' }}>
                        {rel.titulo}
                      </h4>
                      <span style={{ fontFamily:F, fontSize:11, color:'#1A1A1A' }}>{rel.tiempo}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid #0E0E0E', padding:'28px 64px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:FA, fontSize:16 }}>agenc<span style={{ color:'#FF6B00' }}>IA</span>me</span>
        <span style={{ fontFamily:F, fontSize:11, color:'#141414' }}>© 2026 NexoTI · Cali, Colombia</span>
        <Link href="/blog" style={{ fontFamily:F, fontSize:12, color:'#1A1A1A' }}>← Ver todos los artículos</Link>
      </footer>
    </>
  );
}
