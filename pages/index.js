// pages/index.js — NEXOIA Landing v3 — Full width, fotos vivas, diseño editorial
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';

const INDUSTRIES = [
  { icon: '🔧', title: 'Talleres & Mecánica', desc: 'Agenda citas, historial y presupuestos automáticos.', slug: 'taller', color: '#FF6B6B', img: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80' },
  { icon: '✂️', title: 'Peluquerías & Spa', desc: 'Reservas 24/7 y portafolio de servicios.', slug: 'peluqueria', color: '#EC4899', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
  { icon: '🏠', title: 'Inmobiliarias', desc: 'Filtra leads y agenda visitas con IA.', slug: 'inmobiliaria', color: '#3B82F6', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
  { icon: '🍕', title: 'Restaurantes', desc: 'Pedidos por WhatsApp y reservas de mesas.', slug: 'restaurante', color: '#EAB308', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  { icon: '🛒', title: 'Tiendas & Retail', desc: 'Catálogo digital y asistente de ventas.', slug: 'tienda', color: '#10B981', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80' },
  { icon: '🏋️', title: 'Gimnasios & Fitness', desc: 'Inscripciones, clases y pagos automáticos.', slug: 'gimnasio', color: '#F97316', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { icon: '🏥', title: 'Salud & Clínicas', desc: 'Agenda médica y pre-triage por chat.', slug: 'salud', color: '#14B8A6', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80' },
  { icon: '📋', title: 'Servicios & Papelerías', desc: 'Cotizaciones automáticas y seguimiento.', slug: 'papeleria', color: '#8B5CF6', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
];

const PLANES = [
  { name: 'Emprendedor', price: '149.000', features: ['1 Agente IA activo', '500 conversaciones/mes', 'Chat web + WhatsApp', 'CRM hasta 200 contactos', 'Agendamiento básico', 'Soporte por email'], cta: 'Comenzar gratis', popular: false, accent: '#6B7280' },
  { name: 'Profesional', price: '349.000', features: ['3 Agentes IA activos', 'Conversaciones ilimitadas', 'WhatsApp + Instagram + Web', 'Llamadas IA (100/mes)', 'CRM ilimitado + pipeline', 'Página web con IA', 'Reportes avanzados', 'Soporte 24/7'], cta: 'Empezar 14 días gratis', popular: true, accent: '#00E5A0' },
  { name: 'Agencia', price: '890.000', features: ['Agentes IA ilimitados', 'Multisede y multiempresa', 'Llamadas IA ilimitadas', 'White-label / marca propia', 'API completa', 'Gestor dedicado', 'Capacitación incluida', 'SLA 99.9%'], cta: 'Hablar con ventas', popular: false, accent: '#A29BFE' },
];

export default function Landing() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>NEXOIA — Tu negocio en piloto automático con IA</title>
        <meta name="description" content="Plataforma de IA para negocios colombianos. Automatiza ventas, atención y operaciones." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080A0E; color: #E2E6EF; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-up { animation: fadeUp 1s ease both; }
        .delay-1 { animation-delay: 0.15s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.45s; }
        .ind-card:hover .ind-img { transform: scale(1.08); }
        .ind-card:hover .ind-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%) !important; }
        .feat-num { font-family: 'Cormorant Garamond', serif; font-size: 80px; font-weight: 700; line-height: 1; opacity: 0.07; position: absolute; top: -10px; right: 20px; color: #00E5A0; }
        .plan-card:hover { transform: translateY(-8px); }
        img { display: block; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 60px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,10,14,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        <LogoComp />
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {['Industrias', 'Funciones', 'Precios'].map(item => (
            <a key={item} href={'#' + item.toLowerCase()}
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 400, letterSpacing: 0.3, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
              {item}
            </a>
          ))}
        </div>
        {user ? (
          <Link href="/dashboard">
            <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Ir al panel →
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login">
              <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '10px 20px', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}>
                Ingresar
              </button>
            </Link>
            <Link href="/auth/register">
              <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Comenzar gratis
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO — FOTO FULL WIDTH REAL ── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden' }}>
        {/* FOTO DE FONDO — GRANDE, VIVA */}
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=90"
          alt="Oficina moderna"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        {/* Capa oscura para que las letras se lean */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(8,10,14,0.92) 0%, rgba(8,10,14,0.7) 55%, rgba(8,10,14,0.4) 100%)' }} />
        {/* Gradiente inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, #080A0E, transparent)' }} />

        {/* Contenido — pegado a la izquierda, NO centrado */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          <div style={{ maxWidth: 700 }}>
            {/* Badge */}
            <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 2, padding: '8px 18px', marginBottom: 36 }}>
              <span style={{ width: 6, height: 6, background: '#00E5A0', borderRadius: '50%', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#00E5A0', fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase' }}>Inteligencia Artificial para Negocios Colombianos</span>
            </div>

            <h1 className="fade-up delay-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(56px, 7.5vw, 108px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-2px', color: '#F0F4FF', marginBottom: 32 }}>
              Tu negocio<br />
              <em style={{ color: '#00E5A0', fontStyle: 'italic' }}>en piloto</em><br />
              automático.
            </h1>

            <p className="fade-up delay-2" style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 48, maxWidth: 520, fontWeight: 300 }}>
              La plataforma todo-en-uno que permite a talleres, restaurantes, inmobiliarias y más negocios automatizar ventas y atención al cliente con agentes de IA — 24 horas al día, 7 días a la semana.
            </p>

            <div className="fade-up delay-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/auth/register">
                <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: 4, padding: '16px 40px', fontSize: 16, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3, transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.target.style.background = '#00C98A'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 16px 40px rgba(0,229,160,0.3)'; }}
                  onMouseLeave={e => { e.target.style.background = '#00E5A0'; e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}>
                  Probar 14 días gratis →
                </button>
              </Link>
              <a href="#industrias">
                <button style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '16px 40px', fontSize: 16, cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}>
                  Ver industrias
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats — esquina inferior derecha sobre la foto */}
        <div style={{ position: 'absolute', bottom: 60, right: 80, display: 'flex', gap: 32 }}>
          {[{ v: '+240', l: 'Empresas activas' }, { v: '24/7', l: 'Disponibilidad' }, { v: '< 2s', l: 'Respuesta IA' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: '#00E5A0', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 0.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '18px 0', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: 80, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].flatMap(() => ['Agentes de IA 24/7', 'Chat automatizado', 'CRM inteligente', 'Llamadas con IA', 'WhatsApp Business', 'Páginas web IA', 'Agendamiento automático', 'Captura de leads'].map((t, i) => (
            <span key={t + i} style={{ display: 'inline-flex', alignItems: 'center', gap: 16, color: '#374151', fontSize: 13, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>
              <span style={{ width: 4, height: 4, background: '#00E5A0', borderRadius: '50%', opacity: 0.5 }} />{t}
            </span>
          )))}
        </div>
      </div>

      {/* ── INDUSTRIAS — GRID CON FOTOS REALES ── */}
      <section id="industrias" style={{ padding: '0' }}>
        {/* Header de sección — ancho completo con foto */}
        <div style={{ position: 'relative', padding: '100px 80px 80px', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.12)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 16 }}>Por industria</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px', color: '#F0F4FF' }}>
                  Diseñado para<br />tu tipo de negocio
                </h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 380, lineHeight: 1.8, fontWeight: 300 }}>
                Cada industria tiene su propio agente IA, plantilla de sitio web y flujos preconfigurados listos para usar desde el primer día.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de industrias — fotos que se ven */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'auto auto' }}>
          {INDUSTRIES.map((ind, i) => (
            <Link key={i} href={'/industrias/' + ind.slug}>
              <div className="ind-card" style={{ position: 'relative', height: 320, overflow: 'hidden', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Foto de fondo real */}
                <img className="ind-img" src={ind.img} alt={ind.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }} />
                {/* Overlay oscuro */}
                <div className="ind-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)', transition: 'background 0.4s ease' }} />
                {/* Barra de color de industria */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: ind.color, transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.4s ease' }} className="ind-bar" />
                {/* Contenido */}
                <div style={{ position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <span style={{ background: ind.color + '22', color: ind.color, border: '1px solid ' + ind.color + '44', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 2, letterSpacing: 1, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12 }}>IA</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.15 }}>{ind.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, fontWeight: 300 }}>{ind.desc}</p>
                </div>
                {/* Emoji */}
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 28, opacity: 0.8 }}>{ind.icon}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FUNCIONES — SPLIT LAYOUT ── */}
      <section id="funciones" style={{ background: '#080A0E' }}>
        {/* Intro con foto lateral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 600 }}>
          {/* Foto */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85" alt="Equipo trabajando" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, #080A0E 100%)' }} />
          </div>
          {/* Texto */}
          <div style={{ padding: '80px 80px 80px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 20 }}>Funcionalidades</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 32 }}>
              Todo lo que<br />necesitas, en<br />una sola plataforma
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8, marginBottom: 40, fontWeight: 300 }}>
              Desde el primer mensaje hasta la cita agendada y el cliente en tu CRM — NEXOIA lo hace todo automáticamente mientras tú te concentras en tu negocio.
            </p>
            <Link href="/auth/register">
              <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: 4, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Empezar ahora →
              </button>
            </Link>
          </div>
        </div>

        {/* Grid de features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { icon: '🤖', title: 'Agentes IA personalizados', desc: 'Entrenados con tu información. Responden, capturan leads y cierran ventas 24/7 sin intervención humana.' },
            { icon: '💬', title: 'Chat multicanal', desc: 'WhatsApp, Instagram, web y más. Todos tus canales unificados con respuestas automáticas e inteligentes.' },
            { icon: '📞', title: 'Voz IA', desc: 'Un agente que contesta llamadas, confirma citas y hace seguimiento telefónico automáticamente.' },
            { icon: '📊', title: 'CRM inteligente', desc: 'Gestiona clientes y pipeline de ventas. Los leads se capturan solos desde el chat y las llamadas.' },
            { icon: '🌐', title: 'Página web con IA', desc: 'Sitio web elegante generado automáticamente con tus servicios, precios y chat de IA integrado.' },
            { icon: '📅', title: 'Agendamiento automático', desc: 'Calendario conectado al agente. Tus clientes agendan solos — sin llamadas ni mensajes manuales.' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '48px 40px', borderRight: i % 3 !== 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', position: 'relative', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,160,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="feat-num">{String(i + 1).padStart(2, '0')}</span>
              <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#E2E6EF' }}>{f.title}</h3>
              <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.75, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS — FOTO FULL WIDTH ── */}
      <section style={{ position: 'relative', padding: '120px 80px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1800&q=85" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.12) saturate(0.7)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080A0E 0%, rgba(8,10,14,0.5) 40%, rgba(8,10,14,0.5) 70%, #080A0E 100%)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ marginBottom: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 16 }}>Proceso</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Activa tu agencia<br />de IA en 4 pasos
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)' }}>
            {[
              { n: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos. Sin tarjeta de crédito. 14 días completamente gratis.' },
              { n: '02', title: 'Configura', desc: 'Ingresa tus servicios, precios y horarios. La IA aprende todo sobre tu negocio.' },
              { n: '03', title: 'Activa', desc: 'Conecta WhatsApp, tu sitio web o teléfono. Tu agente empieza a trabajar en minutos.' },
              { n: '04', title: 'Crece', desc: 'Revisa reportes, conversaciones y métricas en tiempo real. Escala cuando quieras.' },
            ].map((step, i) => (
              <div key={i} style={{ background: 'rgba(8,10,14,0.85)', padding: '48px 36px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 700, color: '#00E5A0', opacity: 0.25, lineHeight: 1, marginBottom: 24 }}>{step.n}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 16, color: '#E2E6EF' }}>{step.title}</h3>
                <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.75, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="precios" style={{ background: '#080A0E', padding: '0 0 120px' }}>
        {/* Header con foto */}
        <div style={{ position: 'relative', padding: '100px 80px 80px', overflow: 'hidden', marginBottom: 60 }}>
          <img src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 16 }}>Planes y precios</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 700, letterSpacing: '-1px', color: '#F0F4FF' }}>
                Comienza gratis,<br />crece cuando quieras
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 340, lineHeight: 1.8, fontWeight: 300 }}>Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
          </div>
        </div>

        <div style={{ padding: '0 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {PLANES.map((plan, i) => (
            <div key={i} className="plan-card" style={{
              border: '1px solid ' + (plan.popular ? '#00E5A0' : 'rgba(255,255,255,0.08)'),
              borderRadius: 4, padding: '48px 40px',
              position: 'relative',
              background: plan.popular ? 'rgba(0,229,160,0.03)' : 'rgba(255,255,255,0.01)',
              transition: 'transform 0.3s ease',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -13, left: 40, background: '#00E5A0', color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 16px', letterSpacing: 1, textTransform: 'uppercase' }}>Más popular</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#374151', marginBottom: 24 }}>{plan.name}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 700, color: plan.popular ? '#00E5A0' : '#E2E6EF', lineHeight: 1, marginBottom: 4, letterSpacing: -2 }}>
                <sup style={{ fontSize: 24, verticalAlign: 'top', marginTop: 16, fontFamily: 'Inter', fontWeight: 400 }}>$</sup>{plan.price}
              </div>
              <div style={{ color: '#374151', fontSize: 13, marginBottom: 40, fontWeight: 300 }}>COP / mes · IVA incluido</div>
              <ul style={{ listStyle: 'none', marginBottom: 44 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#6B7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 300 }}>
                    <span style={{ color: plan.accent, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <button style={{ width: '100%', background: plan.popular ? '#00E5A0' : 'transparent', color: plan.popular ? '#000' : '#E2E6EF', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', letterSpacing: 0.3 }}
                  onMouseEnter={e => { if (!plan.popular) { e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.background = 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={e => { if (!plan.popular) { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.background = 'transparent'; } }}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ position: 'relative', padding: '120px 80px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=80" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080A0E 0%, rgba(8,10,14,0.6) 30%, rgba(8,10,14,0.6) 70%, #080A0E 100%)' }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 16 }}>Testimonios</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 80, lineHeight: 1.1 }}>
            Lo que dicen<br />nuestros clientes
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.06)' }}>
            {[
              { quote: 'Antes perdíamos clientes por no contestar a tiempo. Ahora el agente responde en segundos y agenda citas solo. Increíble cambio para mi negocio.', name: 'Ricardo Montoya', role: 'Taller AutoCenter — Medellín', initials: 'RM', color: '#FF6B6B' },
              { quote: 'Las reservas de mi peluquería se manejan solas. El bot ya sabe mis horarios y precios. Ahorro 3 horas diarias que antes gastaba en mensajes.', name: 'Patricia Guerrero', role: 'Estudio Elegance — Cali', initials: 'PG', color: '#EC4899' },
              { quote: 'El agente filtra prospectos serios y agenda visitas. Mis vendedores solo atienden gente lista para comprar. Las ventas subieron un 40%.', name: 'Andrés López', role: 'Inversión Finca Raíz — Bogotá', initials: 'AL', color: '#3B82F6' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(8,10,14,0.9)', padding: '48px 40px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, color: t.color, opacity: 0.3, lineHeight: 0.8, marginBottom: 24 }}>"</div>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 40, fontWeight: 300, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 2, background: t.color + '22', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#E2E6EF' }}>{t.name}</div>
                    <div style={{ color: '#4B5563', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — FOTO IMPACTANTE ── */}
      <section style={{ position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=90" alt="Ciudad" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 70%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(8,10,14,0.96) 0%, rgba(8,10,14,0.75) 60%, rgba(8,10,14,0.5) 100%)' }} />

        <div style={{ position: 'relative', padding: '120px 80px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#00E5A0', marginBottom: 20 }}>Comienza hoy</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 6.5vw, 88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 28, maxWidth: 700 }}>
            ¿Listo para poner<br />tu negocio en <em style={{ color: '#00E5A0', fontStyle: 'italic' }}>modo</em><br /><em style={{ fontStyle: 'italic' }}>automático?</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, marginBottom: 56, fontWeight: 300, maxWidth: 480, lineHeight: 1.7 }}>
            14 días gratis · Sin tarjeta de crédito · Configuración en minutos
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <button style={{ background: '#00E5A0', color: '#000', border: 'none', borderRadius: 4, padding: '18px 48px', fontSize: 17, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.target.style.background = '#00C98A'; e.target.style.boxShadow = '0 16px 48px rgba(0,229,160,0.3)'; }}
                onMouseLeave={e => { e.target.style.background = '#00E5A0'; e.target.style.boxShadow = 'none'; }}>
                Crear mi cuenta gratis →
              </button>
            </Link>
            <a href="mailto:soportesistemas@soporteia.net">
              <button style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '18px 48px', fontSize: 17, cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}>
                Agendar una demo
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#040507', padding: '80px 80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }}>
          <div>
            <LogoComp />
            <p style={{ color: '#1F2937', fontSize: 14, lineHeight: 1.75, maxWidth: 300, marginTop: 20, fontWeight: 300 }}>
              Automatización empresarial con IA para negocios colombianos. Desarrollado por NexoTI / SoporteIA en Cali, Colombia.
            </p>
            <p style={{ color: '#1F2937', fontSize: 13, marginTop: 20 }}>📍 Cali, Colombia</p>
            <p style={{ color: '#1F2937', fontSize: 13, marginTop: 4 }}>soportesistemas@soporteia.net</p>
          </div>
          {[
            { title: 'Producto', links: ['Funciones', 'Precios', 'Integraciones', 'API'] },
            { title: 'Industrias', links: ['Talleres', 'Peluquerías', 'Inmobiliarias', 'Restaurantes'] },
            { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Términos', 'Privacidad'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2.5, color: '#1F2937', marginBottom: 24 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" style={{ color: '#1F2937', fontSize: 14, fontWeight: 300, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#6B7280'}
                      onMouseLeave={e => e.target.style.color = '#1F2937'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', color: '#111827', fontSize: 13 }}>
          <span>© 2026 NEXOIA by NexoTI · Todos los derechos reservados</span>
          <span>Hecho con ❤️ en Cali, Colombia 🇨🇴</span>
        </div>
      </footer>
    </>
  );
}

function LogoComp() {
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: '#E2E6EF' }}>
      NEX<em style={{ color: '#00E5A0', fontStyle: 'italic' }}>OIA</em>
    </div>
  );
}

export function Logo({ size = 20 }) {
  return <LogoComp />;
}
