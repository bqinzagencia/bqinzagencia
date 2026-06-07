// pages/index.js — NEXOIA Landing Premium
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const INDUSTRIES = [
  { icon: '🔧', title: 'Talleres & Mecánica', desc: 'Agenda citas, historial de vehículos y presupuestos automáticos.', tag: 'Agendamiento IA', slug: 'taller', color: '#FF6B6B' },
  { icon: '✂️', title: 'Peluquerías & Spa', desc: 'Reservas 24/7, recordatorios y portafolio de servicios.', tag: 'Reservas automáticas', slug: 'peluqueria', color: '#EC4899' },
  { icon: '🏠', title: 'Inmobiliarias', desc: 'Filtra leads, muestra propiedades y agenda visitas con IA.', tag: 'CRM inmobiliario', slug: 'inmobiliaria', color: '#3B82F6' },
  { icon: '🍕', title: 'Restaurantes', desc: 'Pedidos por WhatsApp, reservas de mesas y domicilios.', tag: 'Pedidos IA', slug: 'restaurante', color: '#EAB308' },
  { icon: '🛒', title: 'Tiendas & Retail', desc: 'Catálogo digital, asistente de ventas e inventario.', tag: 'Ventas automáticas', slug: 'tienda', color: '#10B981' },
  { icon: '🏋️', title: 'Gimnasios & Fitness', desc: 'Inscripciones, clases, pagos y seguimiento de miembros.', tag: 'Gestión miembros', slug: 'gimnasio', color: '#F97316' },
  { icon: '🏥', title: 'Salud & Clínicas', desc: 'Agenda médica, pre-triage por chat e historial del paciente.', tag: 'Citas médicas', slug: 'salud', color: '#14B8A6' },
  { icon: '📋', title: 'Papelerías & Servicios', desc: 'Cotizaciones automáticas y seguimiento de pedidos.', tag: 'Cotizaciones IA', slug: 'papeleria', color: '#8B5CF6' },
];

const FEATURES = [
  { icon: '🤖', title: 'Agentes IA personalizados', desc: 'Entrenados con la información de tu negocio. Responden, capturan leads y cierran ventas 24/7.', featured: true },
  { icon: '💬', title: 'Chat multicanal', desc: 'WhatsApp, Instagram, web y más. Todos tus canales unificados con respuestas automáticas.' },
  { icon: '📞', title: 'Voz IA', desc: 'Agente que contesta llamadas, confirma citas y hace seguimiento por teléfono.' },
  { icon: '📊', title: 'CRM inteligente', desc: 'Gestiona clientes, pipeline de ventas y seguimientos con recomendaciones IA.' },
  { icon: '🌐', title: 'Página web en minutos', desc: 'Genera tu sitio web con IA, chat integrado, formularios y SEO optimizado.' },
  { icon: '📅', title: 'Agendamiento automático', desc: 'Calendario conectado al agente IA. Tus clientes agendan solos, sin llamadas manuales.' },
];

const PLANES = [
  { name: 'Emprendedor', price: '149.000', period: 'COP / mes', features: ['1 Agente IA activo','500 conversaciones/mes','Chat web + WhatsApp','Agendamiento básico','CRM hasta 200 contactos','Soporte por email'], cta: 'Comenzar gratis', popular: false },
  { name: 'Profesional', price: '349.000', period: 'COP / mes', features: ['3 Agentes IA activos','Conversaciones ilimitadas','WhatsApp + Instagram + Web','Llamadas IA (100/mes)','CRM ilimitado + pipeline','Página web con IA','Reportes avanzados','Soporte 24/7'], cta: 'Comenzar 14 días gratis', popular: true },
  { name: 'Agencia', price: '890.000', period: 'COP / mes', features: ['Agentes IA ilimitados','Multisede y multiempresa','Llamadas IA ilimitadas','White-label / marca propia','API completa','Gestor dedicado','Capacitación incluida','SLA 99.9%'], cta: 'Hablar con ventas', popular: false },
];

const TESTIMONIALS = [
  { quote: 'Antes perdíamos clientes por no contestar a tiempo. Ahora el agente responde en segundos y agenda citas solo.', name: 'Ricardo Montoya', role: 'Taller AutoCenter — Medellín', initials: 'RM', color: '#FF6B6B' },
  { quote: 'Las reservas de mi peluquería se manejan solas. El bot ya sabe mis horarios y precios. Ahorro 3 horas diarias.', name: 'Patricia Guerrero', role: 'Estudio Elegance — Cali', initials: 'PG', color: '#EC4899' },
  { quote: 'El agente filtra prospectos serios y agenda visitas. Mis vendedores solo atienden gente lista para comprar.', name: 'Andrés López', role: 'Inversión Finca Raíz — Bogotá', initials: 'AL', color: '#3B82F6' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>NEXOIA — Tu negocio en piloto automático con IA</title>
        <meta name="description" content="La plataforma todo-en-uno de IA para negocios colombianos. Automatiza ventas, atención al cliente y operaciones." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #06080C; color: #E8EAF0; font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #00E5A0; color: #000; border: none; border-radius: 6px; padding: 14px 32px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: #00C98A; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,229,160,0.25); }
        .btn-outline { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #E8EAF0; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 14px 32px; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .btn-outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }
        .section-label { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #00E5A0; margin-bottom: 16px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 56px); font-weight: 700; line-height: 1.15; letter-spacing: -0.5px; }
        .container { max-width: 1160px; margin: 0 auto; padding: 0 48px; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .animate-up { animation: float-up 0.8s ease forwards; }
        .industry-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.12) !important; }
        .feature-card:hover { transform: translateY(-4px); }
        .plan-card:hover { transform: translateY(-6px); }
        nav a:hover { color: #E8EAF0 !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,8,12,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Logo />
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {['Industrias','Funciones','Precios'].map(item => (
            <a key={item} href={'#' + item.toLowerCase()} style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>{item}</a>
          ))}
        </div>
        {user ? (
          <Link href="/dashboard"><button className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>Ir al panel →</button></Link>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login"><button className="btn-outline" style={{ padding: '10px 20px', fontSize: 14 }}>Ingresar</button></Link>
            <Link href="/auth/register"><button className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>Comenzar gratis</button></Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Foto de fondo */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(0.25) saturate(0.8)' }} />
        {/* Gradiente sobre la foto */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,8,12,0.95) 0%, rgba(6,8,12,0.7) 50%, rgba(0,30,20,0.85) 100%)' }} />
        {/* Gradiente verde sutil */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, #06080C, transparent)' }} />
        {/* Orbe de luz */}
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 780 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 100, padding: '8px 18px', marginBottom: 40 }}>
              <span style={{ width: 6, height: 6, background: '#00E5A0', borderRadius: '50%', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 13, color: '#00E5A0', fontWeight: 500, letterSpacing: 0.5 }}>Automatización empresarial con Inteligencia Artificial</span>
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(52px, 7vw, 96px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-2px', marginBottom: 28, color: '#F0F2F8' }}>
              Tu negocio,<br />
              <em style={{ color: '#00E5A0', fontStyle: 'italic', fontWeight: 700 }}>en piloto</em><br />
              automático.
            </h1>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 20, color: 'rgba(240,242,248,0.65)', maxWidth: 540, marginBottom: 52, lineHeight: 1.7, fontWeight: 300 }}>
              La plataforma todo-en-uno que permite a talleres, restaurantes, inmobiliarias y más negocios colombianos automatizar ventas y atención al cliente con agentes de IA.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 64 }}>
              <Link href="/auth/register"><button className="btn-primary" style={{ fontSize: 16, padding: '16px 36px' }}>Probar 14 días gratis →</button></Link>
              <a href="#funciones"><button className="btn-outline" style={{ fontSize: 16, padding: '16px 36px' }}>Ver cómo funciona</button></a>
            </div>

            {/* Avatares + social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex' }}>
                {['#FF6B6B','#4ECDC4','#FFE66D','#A29BFE','#fd79a8'].map((c, i) => (
                  <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', background: c, border: '2px solid #06080C', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: c === '#FFE66D' ? '#333' : '#fff' }}>
                    {['LM','CR','AP','JV','DG'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#E8EAF0', fontWeight: 500 }}><strong>+240 empresas</strong> colombianas ya automatizan con NEXOIA</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Talleres · Peluquerías · Restaurantes · Inmobiliarias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats flotantes */}
        <div style={{ position: 'absolute', right: 60, bottom: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { valor: '24/7', label: 'Disponibilidad' },
            { valor: '< 2s', label: 'Respuesta IA' },
            { valor: '94%', label: 'Satisfacción' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 24px', textAlign: 'center', minWidth: 130 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#00E5A0', lineHeight: 1 }}>{s.valor}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', gap: 64, animation: 'marquee 30s linear infinite', whiteSpace: 'nowrap' }}>
          {['Agentes de IA 24/7','Chat automatizado','CRM inteligente','Llamadas con IA','WhatsApp Business','Páginas web con IA','Agendamiento inteligente','Captura de leads','Reportes en tiempo real'].concat(['Agentes de IA 24/7','Chat automatizado','CRM inteligente','Llamadas con IA','WhatsApp Business','Páginas web con IA','Agendamiento inteligente','Captura de leads','Reportes en tiempo real']).map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: '#4B5563', fontSize: 13, fontWeight: 500, flexShrink: 0, letterSpacing: 0.5 }}>
              <span style={{ width: 4, height: 4, background: '#00E5A0', borderRadius: '50%', opacity: 0.6 }} />{t}
            </span>
          ))}
        </div>
      </div>

      {/* INDUSTRIES */}
      <section id="industrias" style={{ padding: '120px 0', background: '#06080C' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p className="section-label">Por industria</p>
              <h2 className="section-title">Diseñado para<br />tu tipo de negocio</h2>
            </div>
            <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 360, lineHeight: 1.7, fontWeight: 300 }}>Soluciones específicas para cada sector con agentes IA preconfigurados.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
            {INDUSTRIES.map((ind, i) => (
              <Link key={i} href={'/industrias/' + ind.slug}>
                <div className="industry-card" style={{ background: '#0C0F15', padding: '32px 28px', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'all 0.3s', minHeight: 180 }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{ind.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#E8EAF0' }}>{ind.title}</div>
                  <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{ind.desc}</div>
                  <span style={{ background: ind.color + '18', color: ind.color, border: '1px solid ' + ind.color + '33', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, letterSpacing: 0.3 }}>{ind.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Foto de fondo sutil */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.08) saturate(0.5)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06080C 0%, transparent 20%, transparent 80%, #06080C 100%)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="section-label">Funcionalidades</p>
            <h2 className="section-title">Todo lo que necesitas,<br />en una sola plataforma</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: f.featured ? 'linear-gradient(135deg, #00E5A0 0%, #00C98A 100%)' : 'rgba(255,255,255,0.03)',
                border: '1px solid ' + (f.featured ? 'transparent' : 'rgba(255,255,255,0.07)'),
                borderRadius: 16, padding: '32px 28px',
                color: f.featured ? '#000' : '#E8EAF0',
                transition: 'all 0.3s',
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: f.featured ? 'rgba(0,0,0,0.65)' : '#9CA3AF', fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '120px 0', background: '#06080C' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="section-label">Proceso</p>
            <h2 className="section-title">Activa tu agencia de IA<br />en 4 pasos</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, position: 'relative' }}>
            {/* Línea conectora */}
            <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,229,160,0.3), transparent)', display: 'none' }} />
            {[
              { n: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos. Sin tarjeta de crédito. 14 días gratis.' },
              { n: '02', title: 'Configura tu negocio', desc: 'Carga tu información, servicios y precios. La IA aprende automáticamente.' },
              { n: '03', title: 'Activa tu agente', desc: 'Conecta WhatsApp, tu web o teléfono. Tu agente empieza en minutos.' },
              { n: '04', title: 'Crece con datos', desc: 'Reportes, conversaciones y métricas en tiempo real para escalar.' },
            ].map((step) => (
              <div key={step.n} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: 'rgba(0,229,160,0.15)', lineHeight: 1, marginBottom: 20 }}>{step.n}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#E8EAF0' }}>{step.title}</div>
                <div style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="precios" style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.06)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06080C 0%, transparent 15%, transparent 85%, #06080C 100%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(0,229,160,0.04) 0%, transparent 70%)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="section-label">Planes</p>
            <h2 className="section-title">Comienza gratis,<br />crece cuando quieras</h2>
            <p style={{ color: '#6B7280', fontSize: 16, marginTop: 16, fontWeight: 300 }}>Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {PLANES.map((plan, i) => (
              <div key={i} className="plan-card" style={{
                border: '1px solid ' + (plan.popular ? '#00E5A0' : 'rgba(255,255,255,0.08)'),
                borderRadius: 20, padding: '40px 32px',
                position: 'relative',
                background: plan.popular ? 'rgba(0,229,160,0.04)' : 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.3s',
              }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#00E5A0', color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 18px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>⭐ MÁS POPULAR</div>
                )}
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#6B7280', marginBottom: 20 }}>{plan.name}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 56, fontWeight: 700, lineHeight: 1, color: plan.popular ? '#00E5A0' : '#E8EAF0', marginBottom: 4, letterSpacing: -1 }}>
                  <sup style={{ fontSize: 22, verticalAlign: 'top', marginTop: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>$</sup>{plan.price}
                </div>
                <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 36, fontWeight: 300 }}>{plan.period} · IVA incluido</div>
                <ul style={{ listStyle: 'none', marginBottom: 40 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 300 }}>
                      <span style={{ color: '#00E5A0', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <button className={plan.popular ? 'btn-primary' : 'btn-outline'} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALES */}
      <section style={{ padding: '120px 0', background: '#06080C' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="section-label">Testimonios</p>
            <h2 className="section-title">Lo que dicen<br />nuestros clientes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '36px 32px', position: 'relative' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, color: 'rgba(0,229,160,0.15)', lineHeight: 1, marginBottom: 20 }}>"</div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#9CA3AF', lineHeight: 1.8, marginBottom: 32, fontWeight: 300, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: t.color + '22', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#E8EAF0' }}>{t.name}</div>
                    <div style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 28, right: 28, color: '#00E5A0', fontSize: 12 }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '140px 0', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 60%', filter: 'brightness(0.15) saturate(0.6)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06080C 0%, rgba(6,8,12,0.4) 40%, rgba(6,8,12,0.4) 60%, #06080C 100%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(0,229,160,0.06) 0%, transparent 70%)' }} />

        <div className="container" style={{ position: 'relative' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Comienza hoy</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, marginBottom: 24, color: '#F0F2F8' }}>
            ¿Listo para poner<br />tu negocio en <em style={{ color: '#00E5A0', fontStyle: 'italic' }}>modo</em><br /><em style={{ fontStyle: 'italic' }}>automático?</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, marginBottom: 52, fontWeight: 300 }}>14 días gratis · Sin tarjeta de crédito · Configuración en minutos</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register"><button className="btn-primary" style={{ fontSize: 17, padding: '18px 44px' }}>Crear mi cuenta gratis →</button></Link>
            <a href="mailto:soportesistemas@soporteia.net"><button className="btn-outline" style={{ fontSize: 17, padding: '18px 44px' }}>Agendar una demo</button></a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 48px 40px', background: '#06080C' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 60 }}>
          <div>
            <Logo />
            <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginTop: 16, fontWeight: 300 }}>
              Automatización empresarial con IA para negocios colombianos. Desarrollado por NexoTI / SoporteIA.
            </p>
            <p style={{ marginTop: 20, color: '#374151', fontSize: 13 }}>📍 Cali, Colombia</p>
            <p style={{ color: '#374151', fontSize: 13 }}>soportesistemas@soporteia.net</p>
          </div>
          {[
            { title: 'Producto', links: ['Funciones','Precios','Integraciones','API'] },
            { title: 'Industrias', links: ['Talleres','Peluquerías','Inmobiliarias','Restaurantes'] },
            { title: 'Empresa', links: ['Sobre nosotros','Blog','Términos','Privacidad'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#374151', marginBottom: 24 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {col.links.map((link, j) => (
                  <li key={j}><a href="#" style={{ color: '#4B5563', fontSize: 14, fontWeight: 300, transition: 'color 0.2s' }}>{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#374151', fontSize: 13 }}>
          <span>© 2026 NEXOIA by NexoTI · Todos los derechos reservados</span>
          <span>Hecho con ❤️ en Cali, Colombia 🇨🇴</span>
        </div>
      </footer>
    </>
  );
}

export function Logo({ size = 20 }) {
  return (
    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: size + 2, fontWeight: 700, letterSpacing: '-0.5px', color: '#E8EAF0' }}>
      NEX<span style={{ color: '#00E5A0', fontStyle: 'italic' }}>OIA</span>
    </div>
  );
}
