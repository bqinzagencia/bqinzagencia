// pages/industrias/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { INDUSTRIAS_DETALLE, SLUGS_VALIDOS } from '../../lib/industriasData';
import { Logo } from '../index';
import { useAuth } from '../../lib/AuthContext';

export async function getStaticPaths() {
  return {
    paths: SLUGS_VALIDOS.map(slug => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const industria = INDUSTRIAS_DETALLE[params.slug] || null;
  return { props: { industria } };
}

export default function IndustriaDetalle({ industria }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!industria) return null;

  const { color, colorBg, colorBorder } = industria;

  return (
    <>
      <Head>
        <title>{industria.nombre} — NEXOIA Automatización IA</title>
        <meta name="description" content={industria.descripcion} />
      </Head>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.88)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><Logo size={22} /></Link>
        <div style={{ display: 'flex', gap: 28 }}>
          <Link href="/#industrias" style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500 }}>← Todas las industrias</Link>
          <Link href="/#precios" style={{ color: '#9CA3AF', fontSize: 14 }}>Precios</Link>
        </div>
        {user ? (
          <Link href="/dashboard" className="btn btn-accent btn-sm">Mi panel →</Link>
        ) : (
          <Link href="/auth/register" className="btn btn-accent btn-sm">Comenzar gratis</Link>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 60px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 70% at 60% 40%, ${colorBg}, transparent)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/#industrias" style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Industrias
          </Link>
          <span style={{ color: '#3A4150' }}>/</span>
          <span style={{ color, fontSize: 13, fontWeight: 600 }}>{industria.nombre}</span>
        </div>

        <div style={{ fontSize: 64, marginBottom: 20 }}>{industria.emoji}</div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: colorBg, border: `1px solid ${colorBorder}`, color, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24, alignSelf: 'flex-start' }}>
          IA para {industria.nombre}
        </div>

        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', maxWidth: 760, marginBottom: 20 }}>
          {industria.tagline.split(' ').map((w, i, arr) =>
            i >= arr.length - 2
              ? <span key={i} style={{ color }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>
              : w + ' '
          )}
        </h1>

        <p style={{ fontSize: 18, color: '#9CA3AF', maxWidth: 580, lineHeight: 1.65, marginBottom: 48 }}>
          {industria.descripcion}
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 60 }}>
          <Link href="/auth/register" className="btn btn-lg" style={{ background: color, color: '#080B0F', borderRadius: 100, fontWeight: 700, fontSize: 16, padding: '14px 32px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Probar 14 días gratis →
          </Link>
          <a href="#flujo" className="btn btn-ghost btn-lg">Ver demo del chat</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {industria.heroStats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{s.valor}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONES */}
      <section style={{ padding: '100px 60px', background: '#111318' }}>
        <p style={{ color, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Funcionalidades</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>
          Todo lo que necesitas<br />para tu {industria.nombre.toLowerCase()}
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 17, marginBottom: 60, maxWidth: 520 }}>
          Funciones diseñadas específicamente para el día a día de tu negocio.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {industria.funciones.map((f, i) => (
            <div key={i} style={{ background: '#080B0F', border: `1px solid ${i === 0 ? colorBorder : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 28, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colorBorder; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = i === 0 ? colorBorder : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.titulo}</div>
              <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CHAT DEMO */}
      <section id="flujo" style={{ padding: '100px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <p style={{ color, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Demo real</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Así habla tu agente IA con los clientes
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.65, marginBottom: 32 }}>
              Conversación real entre un cliente y el agente IA configurado para {industria.nombre.toLowerCase()}. Respuestas inteligentes, naturales y personalizadas para tu negocio.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Responde en menos de 2 segundos', 'Disponible los 7 días, 24 horas', 'Aprende de tu negocio específico', 'Escala a humano cuando es necesario'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#D1D5DB' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: colorBg, border: `1px solid ${colorBorder}`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Chat mockup */}
          <div style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Phone header */}
            <div style={{ background: '#25D366', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {industria.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Agente IA — {industria.nombre}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>● En línea</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#0a1628', minHeight: 340 }}>
              {industria.flujoChat.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.rol === 'agente' ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    maxWidth: '78%',
                    background: msg.rol === 'agente' ? '#1F2C34' : '#005C4B',
                    borderRadius: msg.rol === 'agente' ? '0 12px 12px 12px' : '12px 0 12px 12px',
                    padding: '10px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#E9EDEF',
                    whiteSpace: 'pre-line',
                  }}>
                    {msg.rol === 'agente' && (
                      <div style={{ fontSize: 10, color: '#00E5A0', fontWeight: 700, marginBottom: 4 }}>🤖 AGENTE IA</div>
                    )}
                    {msg.texto}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'right' }}>
                      {['9:14','9:15','9:15','9:16','9:16','9:16'][i]} ✓✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASOS DE ÉXITO */}
      <section style={{ padding: '100px 60px', background: '#111318' }}>
        <p style={{ color, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Resultados reales</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 48 }}>
          Negocios que ya lo están usando
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {industria.casos.map((caso, i) => (
            <div key={i} style={{ background: '#080B0F', border: `1px solid ${colorBorder}`, borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: 15, color: '#D1D5DB', lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>
                "{caso.resultado}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: colorBg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {caso.nombre.charAt(0)}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{caso.nombre}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OTRAS INDUSTRIAS */}
      <section style={{ padding: '80px 60px' }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 32, color: '#9CA3AF' }}>
          También tenemos soluciones para:
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.values(INDUSTRIAS_DETALLE).filter(ind => ind.slug !== industria.slug).map(ind => (
            <Link key={ind.slug} href={`/industrias/${ind.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111318', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '10px 20px', fontSize: 14, color: '#9CA3AF', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ind.color + '44'; e.currentTarget.style.color = ind.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9CA3AF'; }}>
              {ind.emoji} {ind.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${colorBg}, transparent)`, pointerEvents: 'none' }} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>{industria.emoji}</div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(36px,4.5vw,60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          ¿Listo para automatizar<br />tu <span style={{ color }}>{industria.nombre.toLowerCase()}?</span>
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 44 }}>
          14 días gratis · Sin tarjeta de crédito · Configuración en minutos
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register" className="btn btn-lg" style={{ background: color, color: '#080B0F', borderRadius: 100, fontWeight: 700, fontSize: 16, padding: '14px 36px', textDecoration: 'none' }}>
            Crear mi cuenta gratis →
          </Link>
          <a href="mailto:soportesistemas@soporteia.net" className="btn btn-ghost btn-lg">
            Hablar con un asesor
          </a>
        </div>
      </section>

      {/* FOOTER mínimo */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Logo size={20} />
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/" style={{ color: '#6B7280', fontSize: 13 }}>Inicio</Link>
          <Link href="/#precios" style={{ color: '#6B7280', fontSize: 13 }}>Precios</Link>
          <Link href="/auth/register" style={{ color: '#6B7280', fontSize: 13 }}>Registrarse</Link>
        </div>
        <span style={{ color: '#3A4150', fontSize: 12 }}>© 2026 NEXOIA by NexoTI · Cali, Colombia 🇨🇴</span>
      </footer>
    </>
  );
}
