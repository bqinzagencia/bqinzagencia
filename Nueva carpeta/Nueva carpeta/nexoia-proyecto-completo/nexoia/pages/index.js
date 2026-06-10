// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const INDUSTRIES = [
  { icon: '🔧', title: 'Talleres & Mecánica', desc: 'Agenda citas, historial de vehículos, presupuestos y seguimiento.', tag: 'Agendamiento IA', slug: 'taller', color: '#FF6B6B' },
  { icon: '✂️', title: 'Peluquerías & Spa', desc: 'Reservas 24/7, recordatorios automáticos y portafolio de servicios.', tag: 'Reservas automáticas', slug: 'peluqueria', color: '#EC4899' },
  { icon: '🏠', title: 'Inmobiliarias', desc: 'Filtra leads, muestra propiedades y agenda visitas con IA.', tag: 'CRM inmobiliario', slug: 'inmobiliaria', color: '#3B82F6' },
  { icon: '🍕', title: 'Restaurantes', desc: 'Pedidos por WhatsApp, reservas de mesas y seguimiento de domicilios.', tag: 'Pedidos IA', slug: 'restaurante', color: '#EAB308' },
  { icon: '🛒', title: 'Tiendas & Retail', desc: 'Catálogo digital, asistente de ventas e inventario automático.', tag: 'Ventas automáticas', slug: 'tienda', color: '#10B981' },
  { icon: '📋', title: 'Papelerías & Servicios', desc: 'Cotizaciones automáticas, seguimiento de pedidos y comunicación.', tag: 'Cotizaciones IA', slug: 'papeleria', color: '#8B5CF6' },
  { icon: '🏋️', title: 'Gimnasios & Fitness', desc: 'Inscripciones, clases, recordatorios de pago y seguimiento.', tag: 'Gestión miembros', slug: 'gimnasio', color: '#F97316' },
  { icon: '🏥', title: 'Salud & Clínicas', desc: 'Agenda médica, pre-triage por chat e historial del paciente.', tag: 'Citas médicas', slug: 'salud', color: '#14B8A6' },
];

const FEATURES = [
  { num: '01', icon: '🤖', title: 'Agentes IA personalizados', desc: 'Asistentes entrenados con tu info de negocio. Responden, capturan leads y cierran ventas.', featured: true },
  { num: '02', icon: '💬', title: 'Chat multicanal', desc: 'WhatsApp, Instagram, web y más. Todos tus canales unificados con respuestas 24/7.' },
  { num: '03', icon: '📞', title: 'Llamadas con IA', desc: 'Agente de voz que llama prospectos, confirma citas y hace seguimiento.' },
  { num: '04', icon: '📊', title: 'CRM inteligente', desc: 'Gestiona clientes, pipeline de ventas y seguimientos con recomendaciones IA.' },
  { num: '05', icon: '🌐', title: 'Página web en minutos', desc: 'Genera o actualiza tu sitio con IA, formularios, chat integrado y SEO.' },
  { num: '06', icon: '📅', title: 'Agendamiento inteligente', desc: 'Calendario conectado al agente IA. Tus clientes agendan solos, sin llamadas manuales.' },
];

const PLANES = [
  {
    name: 'Emprendedor', price: '149.000', period: 'COP / mes',
    features: ['1 Agente IA activo', '500 conversaciones/mes', 'Chat web + WhatsApp', 'Agendamiento básico', 'CRM hasta 200 contactos', 'Soporte por email'],
    cta: 'Comenzar gratis', popular: false,
  },
  {
    name: 'Profesional', price: '349.000', period: 'COP / mes',
    features: ['3 Agentes IA activos', 'Conversaciones ilimitadas', 'WhatsApp + Instagram + Web', 'Llamadas IA (100/mes)', 'CRM ilimitado + pipeline', 'Página web con IA', 'Reportes avanzados', 'Soporte prioritario 24/7'],
    cta: 'Comenzar 14 días gratis', popular: true,
  },
  {
    name: 'Agencia', price: '890.000', period: 'COP / mes',
    features: ['Agentes IA ilimitados', 'Multisede y multiempresa', 'Llamadas IA ilimitadas', 'White-label / marca propia', 'API completa', 'Gestor de cuentas dedicado', 'Capacitación incluida', 'SLA 99.9% uptime'],
    cta: 'Hablar con ventas', popular: false,
  },
];

const TESTIMONIALS = [
  { quote: 'Antes perdíamos clientes por no contestar a tiempo. Ahora el agente responde en segundos y agenda citas solo. Increíble cambio.', name: 'Ricardo Montoya', role: 'Taller AutoCenter — Medellín', initials: 'RM', color: '#FF6B6B' },
  { quote: 'Las reservas de mi peluquería se manejan solas. El bot ya sabe mis horarios y precios. Ahorro 3 horas diarias.', name: 'Patricia Guerrero', role: 'Estudio Elegance — Cali', initials: 'PG', color: '#EC4899' },
  { quote: 'El agente filtra prospectos serios y agenda visitas. Mis vendedores ahora solo atienden gente lista para comprar.', name: 'Andrés López', role: 'Inversión Finca Raíz — Bogotá', initials: 'AL', color: '#3B82F6' },
];

const INTEGRATIONS = [
  '💬 WhatsApp Business', '📸 Instagram', '📘 Facebook Messenger', '🔵 Telegram',
  '📧 Gmail', '📅 Google Calendar', '🗂️ Google Sheets', '💳 Wompi / PSE',
  '🧾 Alegra', '🗺️ Google Maps', '📲 Twilio', '🔗 Zapier', '🔥 Firebase', '▲ Vercel',
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>NEXOIA — Tu negocio en piloto automático con IA</title>
      </Head>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 60px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        background: 'rgba(8,11,15,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Logo size={22} />
        <div style={{ display: 'flex', gap: 32 }}>
          {['Industrias','Funciones','Precios','Cómo funciona'].map(item => (
            <a key={item} href={'#' + item.toLowerCase().replace(' ','-')}
              style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color='#FAFAF8'}
              onMouseLeave={e => e.target.style.color='#9CA3AF'}
            >{item}</a>
          ))}
        </div>
        {user ? (
          <Link href="/dashboard" className="btn btn-accent">Ir al panel →</Link>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Ingresar</Link>
            <Link href="/auth/register" className="btn btn-accent btn-sm">Comenzar gratis</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 60px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,229,160,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(0,229,160,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00E5A0', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500, marginBottom: 32, alignSelf: 'flex-start' }}>
          <span style={{ width: 6, height: 6, background: '#00E5A0', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          Automatización empresarial con Inteligencia Artificial
        </div>

        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(48px,6vw,80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', maxWidth: 820, marginBottom: 24 }}>
          Tu negocio,<br />en <span style={{ color: '#00E5A0' }}>piloto automático</span><br />con IA.
        </h1>
        <p style={{ fontSize: 20, color: '#9CA3AF', maxWidth: 560, marginBottom: 48, lineHeight: 1.6 }}>
          La plataforma todo-en-uno que permite a talleres, restaurantes, inmobiliarias y más negocios colombianos automatizar ventas, atención al cliente y operaciones con agentes de IA.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/auth/register" className="btn btn-accent btn-lg">Probar 14 días gratis →</Link>
          <a href="#como-funciona" className="btn btn-ghost btn-lg">Ver cómo funciona</a>
        </div>

        <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex' }}>
            {['#FF6B6B','#4ECDC4','#FFE66D','#A29BFE','#fd79a8'].map((c,i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: '2px solid #080B0F', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: c === '#FFE66D' ? '#333' : '#fff' }}>
                {['LM','CR','AP','JV','DG'][i]}
              </div>
            ))}
          </div>
          <p style={{ color: '#6B7280', fontSize: 14 }}><strong style={{ color: '#FAFAF8' }}>+240 empresas</strong> ya automatizan con NEXOIA</p>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap' }}>
          {['Agentes de IA 24/7','Chat automatizado','CRM inteligente','Llamadas con IA','WhatsApp Business','Páginas web con IA','Agendamiento inteligente','Reportes en tiempo real'].concat(['Agentes de IA 24/7','Chat automatizado','CRM inteligente','Llamadas con IA','WhatsApp Business','Páginas web con IA','Agendamiento inteligente','Reportes en tiempo real']).map((t,i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#6B7280', fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, background: '#00E5A0', borderRadius: '50%', display: 'inline-block' }} />{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── INDUSTRIES ── */}
      <section id="industrias" style={{ padding: '100px 60px' }}>
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Por industria</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Diseñado para tu tipo de negocio</h2>
        <p style={{ color: '#9CA3AF', fontSize: 18, maxWidth: 540, lineHeight: 1.6, marginBottom: 60 }}>Soluciones específicas para cada sector con plantillas, flujos y agentes IA preconfigurados.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {INDUSTRIES.map((ind, i) => (
            <Link key={i} href={'/industrias/' + ind.slug} style={{ background: '#111318', padding: '28px', transition: 'all 0.2s', cursor: 'pointer', display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.background='#1A1E26'; e.currentTarget.style.borderLeft='2px solid ' + ind.color; }}
              onMouseLeave={e => { e.currentTarget.style.background='#111318'; e.currentTarget.style.borderLeft='2px solid transparent'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{ind.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{ind.title}</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{ind.desc}</div>
              <span style={{ background: 'rgba(0,229,160,0.1)', color: '#00E5A0', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>{ind.tag}</span>
              <span style={{ position: 'absolute', right: 16, bottom: 16, fontSize: 16, opacity: 0.4 }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funciones" style={{ padding: '100px 60px', background: '#111318' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Funcionalidades</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Todo lo que necesitas,<br />en una sola plataforma</h2>
          </div>
          <Link href="/auth/register" className="btn btn-accent">Ver planes →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: f.featured ? '#00E5A0' : '#080B0F',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s',
              color: f.featured ? '#080B0F' : 'inherit',
            }}
              onMouseEnter={e => { if (!f.featured) { e.currentTarget.style.borderColor='rgba(0,229,160,0.2)'; e.currentTarget.style.transform='translateY(-4px)'; } }}
              onMouseLeave={e => { if (!f.featured) { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(0)'; } }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: f.featured ? 'rgba(0,0,0,0.5)' : '#6B7280', marginBottom: 16, textTransform: 'uppercase' }}>{f.num} — {f.featured ? 'ESTRELLA' : 'FUNCIÓN'}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: f.featured ? 'rgba(0,0,0,0.65)' : '#6B7280', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" style={{ padding: '100px 60px' }}>
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Proceso</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 60 }}>Activa tu agencia de IA en 4 pasos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32, position: 'relative' }}>
          {[
            { n: 1, title: 'Regístrate', desc: 'Crea tu cuenta en segundos. Sin tarjeta de crédito. 14 días gratis.' },
            { n: 2, title: 'Configura tu negocio', desc: 'Carga tu información, servicios y precios. La IA aprende automáticamente.' },
            { n: 3, title: 'Activa tu agente', desc: 'Conecta WhatsApp, Instagram o tu web. Tu agente empieza en minutos.' },
            { n: 4, title: 'Crece con datos', desc: 'Ve reportes, conversaciones y métricas en tiempo real. Escala tu negocio.' },
          ].map((step) => (
            <div key={step.n} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1A1E26', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: '#00E5A0', margin: '0 auto 20px' }}>{step.n}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{step.title}</div>
              <div style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="precios" style={{ padding: '100px 60px', background: '#111318' }}>
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Planes</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 8 }}>Comienza gratis, crece cuando quieras</h2>
        <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 60 }}>Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
          {PLANES.map((plan, i) => (
            <div key={i} style={{ border: `1px solid ${plan.popular ? '#00E5A0' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: 36, position: 'relative', background: plan.popular ? '#1A1E26' : '#111318', transition: 'all 0.25s' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#00E5A0', color: '#080B0F', fontSize: 12, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>⭐ Más popular</div>
              )}
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', marginBottom: 12 }}>{plan.name}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 52, fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', marginBottom: 4 }}>
                <sup style={{ fontSize: 22, verticalAlign: 'top', marginTop: 8 }}>$</sup>{plan.price}
              </div>
              <div style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>{plan.period} · IVA incluido</div>
              <ul style={{ listStyle: 'none', marginBottom: 36 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#D1D5DB', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#00E5A0', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={i === 2 ? '/auth/register?plan=agencia' : '/auth/register'} className={'btn btn-lg ' + (plan.popular ? 'btn-accent' : 'btn-ghost')} style={{ display: 'block', textAlign: 'center' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 60px' }}>
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Testimonios</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 60 }}>Lo que dicen nuestros clientes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
              <div style={{ color: '#00E5A0', fontSize: 16, marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontSize: 15, color: '#9CA3AF', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color + '33', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section style={{ padding: '100px 60px', background: '#111318', textAlign: 'center' }}>
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Integraciones</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 60 }}>Conecta con las herramientas que ya usas</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
          {INTEGRATIONS.map((int, i) => (
            <div key={i} style={{ background: '#080B0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '10px 22px', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,229,160,0.3)'; e.currentTarget.style.color='#00E5A0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color=''; }}
            >{int}</div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%,rgba(0,229,160,0.06),transparent)', pointerEvents: 'none' }} />
        <p style={{ color: '#00E5A0', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Comienza hoy</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(40px,5vw,68px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 24 }}>
          ¿Listo para poner tu negocio<br />en <span style={{ color: '#00E5A0' }}>modo automático?</span>
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 20, marginBottom: 48 }}>14 días gratis · Sin tarjeta de crédito · Configuración en minutos</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register" className="btn btn-accent btn-lg">Crear mi cuenta gratis →</Link>
          <a href="mailto:soportesistemas@soporteia.net" className="btn btn-ghost btn-lg">Agendar una demo</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <Logo size={22} />
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, maxWidth: 260, marginTop: 12 }}>Automatización empresarial con IA para negocios colombianos. Desarrollado por NexoTI / SoporteIA.</p>
          <p style={{ marginTop: 20, color: '#3A4150', fontSize: 12 }}>📍 Cali, Colombia · soportesistemas@soporteia.net</p>
        </div>
        {[
          { title: 'Producto', links: ['Funciones','Precios','Integraciones','API','Changelog'] },
          { title: 'Industrias', links: ['Talleres','Peluquerías','Inmobiliarias','Restaurantes','Más sectores'] },
          { title: 'Empresa', links: ['Sobre nosotros','Blog','Casos de éxito','Términos','Privacidad'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#3A4150', marginBottom: 20 }}>{col.title}</h4>
            <ul style={{ listStyle: 'none' }}>
              {col.links.map((link, j) => (
                <li key={j} style={{ marginBottom: 12 }}>
                  <a href="#" style={{ color: '#6B7280', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color='#FAFAF8'}
                    onMouseLeave={e => e.target.style.color='#6B7280'}
                  >{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6B7280', fontSize: 13 }}>
        <span>© 2026 NEXOIA by NexoTI · Todos los derechos reservados</span>
        <span>Hecho con ❤️ en Cali, Colombia 🇨🇴</span>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>
    </>
  );
}

export function Logo({ size = 20 }) {
  return (
    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: size, fontWeight: 800, letterSpacing: '-0.5px' }}>
      NEX<span style={{ color: '#00E5A0' }}>OIA</span>
    </div>
  );
}
