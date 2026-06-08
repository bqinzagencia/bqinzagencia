// pages/index.js — NEXOIA Landing v4 — Tipografía única, carácter latino-digital
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';

const INDUSTRIES = [
  { icon: '🔧', title: 'Talleres & Mecánica', desc: 'Agenda citas, historial y presupuestos automáticos.', slug: 'taller', color: '#FF6B35', img: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80' },
  { icon: '✂️', title: 'Peluquerías & Spa', desc: 'Reservas 24/7 y portafolio de servicios.', slug: 'peluqueria', color: '#FF4D8B', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
  { icon: '🏠', title: 'Inmobiliarias', desc: 'Filtra leads y agenda visitas con IA.', slug: 'inmobiliaria', color: '#4D94FF', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
  { icon: '🍽️', title: 'Restaurantes', desc: 'Reservas, menu digital y domicilios por WhatsApp.', slug: 'restaurante', color: '#FFB830', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  { icon: '🏠🍲', title: 'Restaurante de Barrio', desc: 'Menu diario con fotos, domicilios y pedidos por WhatsApp.', slug: 'restaurante_barrio', color: '#E85D04', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
  { icon: '🛒', title: 'Tiendas & Retail', desc: 'Catálogo digital, ventas y domicilios.', slug: 'tienda', color: '#30D988', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80' },
  { icon: '🏋️', title: 'Gimnasios & Fitness', desc: 'Inscripciones, clases y pagos automáticos.', slug: 'gimnasio', color: '#1A56FF', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { icon: '🏥', title: 'Salud & Clínicas', desc: 'Agenda médica y pre-triage por chat.', slug: 'salud', color: '#00D4FF', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80' },
  { icon: '♟️', title: 'Escuelas de Ajedrez', desc: 'Clases niños/adultos, torneos, libros y clases virtuales.', slug: 'ajedrez', color: '#C0962C', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80' },
  { icon: '🏗️', title: 'Arquitectura & Construcción', desc: 'Diseño, construcción, renders y consultoría de proyectos.', slug: 'arquitectura', color: '#B5A16E', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80' },
  { icon: '📋', title: 'Servicios & Papelerías', desc: 'Cotizaciones automáticas y seguimiento de pedidos.', slug: 'papeleria', color: '#C77DFF', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { icon: '🎯', title: 'Deporte & Entrenamientos', desc: 'Clases, torneos, inscripciones y seguimiento deportivo.', slug: 'gimnasio', color: '#FF4D6D', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80' },
];

const PLANES = [
  { name: 'Emprendedor', price: '149.000', features: ['1 Agente IA activo', '500 conversaciones/mes', 'Chat web + WhatsApp', 'CRM hasta 200 contactos', 'Agendamiento básico', 'Soporte por email'], cta: 'Comenzar gratis', popular: false },
  { name: 'Profesional', price: '349.000', features: ['3 Agentes IA activos', 'Conversaciones ilimitadas', 'WhatsApp + Instagram + Web', 'Llamadas IA (100/mes)', 'CRM ilimitado + pipeline', 'Página web con IA', 'Reportes avanzados', 'Soporte 24/7'], cta: 'Empezar 14 días gratis', popular: true },
  { name: 'Agencia', price: '890.000', features: ['Agentes IA ilimitados', 'Multisede y multiempresa', 'Llamadas IA ilimitadas', 'White-label / marca propia', 'API completa', 'Gestor dedicado', 'Capacitación incluida', 'SLA 99.9%'], cta: 'Hablar con ventas', popular: false },
];

// ─── Paleta única NEXOIA ──────────────────────────────────────────────────────
// Lima eléctrico #B8FF6C · Coral #FF4D6D · Negro obsidiana #080808
// Tipografía: Abril Fatface (display) · Fraunces (editorial) · Plus Jakarta Sans (cuerpo)

export default function Landing() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const G = '#2563EB';   // azul safiro
  const G2 = '#06B6D4';  // cyan vivo
  const R = '#F97316';   // naranja fuego
  const BG = '#0F1623';  // azul medianoche

  return (
    <>
      <Head>
        <title>agencIAme — Tu negocio atendido por Inteligencia Artificial</title>
        <meta name="description" content="agencIAme: La plataforma de IA que atiende, agenda y vende por tu negocio. Automatiza ventas y atención al cliente 24/7." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Abril Fatface: display dramático | Fraunces: editorial variable | Plus Jakarta Sans: cuerpo moderno */}
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400;1,9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap&text=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%C3%A0%C3%A1%C3%A9%C3%AD%C3%B3%C3%BA%C3%BC%C3%B1%C3%91" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html: `
        body { background: #080808; color: #E8E8E8; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; font-feature-settings: kern 1, liga 1; }
        a { text-decoration: none; color: inherit; }
        h1,h2,h3 { font-synthesis: none; -webkit-text-stroke: 0.01px transparent; }
        img { display:block; }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .btn-ghost { background: transparent; color: #aaa; border: 1px solid #333; border-radius: 2px; padding: 15px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 400; font-size: 15px; cursor: pointer; transition: all 0.25s; display: inline-block; }
        .btn-ghost:hover { border-color: #666; color: #E8E8E8; }
      `}} />

      {/* ── NAV ────────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 64px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid #1A1A1A' : 'none',
        transition: 'all 0.5s ease',
      }}>
        {/* Logo — agencIAme */}
        <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 20, letterSpacing: '-0.5px', color: '#E8E8E8' }}>
          agenc<span style={{ color: '#FF6B00', fontSize: 23, fontWeight: 900 }}>IA</span>me
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {['Empresas', 'Funciones', 'Precios'].map(item => (
            <a key={item} href={'#' + item.toLowerCase()}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#555', fontSize: 13, fontWeight: 400, letterSpacing: 0.3, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#E8E8E8'}
              onMouseLeave={e => e.target.style.color = '#555'}>
              {item === 'Empresas' ? 'Empresas' : item}
            </a>
          ))}
        </div>

        {!loading && (user ? (
          <Link href="/dashboard"><button className="btn-lima" style={{ padding: '9px 22px', fontSize: 13 }}>Panel →</button></Link>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/auth/login"><span style={{ color: '#555', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#E8E8E8'} onMouseLeave={e => e.target.style.color = '#555'}>Ingresar</span></Link>
            <Link href="/auth/register"><button className="btn-lima" style={{ padding: '9px 22px', fontSize: 13 }}>Empezar gratis</button></Link>
          </div>
        ))}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 720, overflow: 'hidden' }}>
        {/* Foto viva */}
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=90" alt="Oficina"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
        {/* Capas de gradiente */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(108deg, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.78) 52%, rgba(8,8,8,0.45) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(to top, #080808, transparent)' }} />
        {/* Acento de luz lima */}
        <div style={{ position: 'absolute', top: '20%', left: '45%', width: 480, height: 480, background: `radial-gradient(circle, ${G}09 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Contenido — izquierda */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          <div style={{ maxWidth: 740 }}>

            {/* Badge */}
            <div className="slide-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: `1px solid ${G}30`, borderRadius: 1, padding: '7px 16px', marginBottom: 44 }}>
              <span style={{ width: 5, height: 5, background: G, borderRadius: '50%', animation: 'blink 2.2s infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: G, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase' }}>
                Tu negocio atendido por Inteligencia Artificial
              </span>
            </div>

            {/* Título — Abril Fatface impacto */}
            <h1 className="slide-up d1" style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(60px, 8.5vw, 120px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-2px', color: '#FAFAFA', marginBottom: 36 }}>
              agenc<span style={{ color: '#FF6B00' }}>IA</span>me<br />
              <span style={{ fontSize: '55%', color: 'rgba(240,240,240,0.7)', fontStyle: 'normal' }}>tu negocio en<br /></span>
              <span style={{ color: G }}>piloto automático.</span>
            </h1>

            {/* Subtítulo — Fraunces italic */}
            <p className="slide-up d2" style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 21, color: 'rgba(255,255,255,0.5)', maxWidth: 500, marginBottom: 52, lineHeight: 1.65, fontWeight: 300 }}>
              La IA que atiende tus clientes, agenda citas y vende por ti — las 24 horas, los 7 días de la semana.
            </p>

            {/* CTAs */}
            <div className="slide-up d3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/auth/register"><button className="btn-lima" style={{ fontSize: 16, padding: '16px 44px' }}>Probar 14 días gratis →</button></Link>
              <a href="#industrias"><button className="btn-ghost" style={{ fontSize: 16, padding: '16px 44px' }}>Ver industrias</button></a>
            </div>

            {/* Social proof */}
            <div className="slide-up d4" style={{ marginTop: 60, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex' }}>
                {['#FF6B35','#FF4D8B','#4D94FF','#FFB830','#B8FF6C'].map((c, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c + '33', border: `2px solid ${c}66`, marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: c, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {['RM','PG','AL','JV','DG'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#888' }}>
                  <span style={{ color: '#E8E8E8', fontWeight: 600 }}>+240 empresas</span> colombianas ya automatizan con NEXOIA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats — derecha sobre foto */}
        <div style={{ position: 'absolute', right: 80, bottom: 80, display: 'flex', gap: 48 }}>
          {[{ v: '24/7', l: 'Disponible' }, { v: '<2s', l: 'Respuesta' }, { v: '94%', l: 'Satisfacción' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 44, color: G, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#444', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #141414', borderBottom: '1px solid #141414', padding: '16px 0', overflow: 'hidden', background: '#0C0C0C' }}>
        <div style={{ display: 'flex', gap: 80, animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap' }}>
          {['Agentes IA 24/7', 'Chat Automatizado', 'CRM Inteligente', 'Voz con IA', 'WhatsApp Business', 'Sitio Web IA', 'Agendamiento', 'Captura de Leads',
            'Agentes IA 24/7', 'Chat Automatizado', 'CRM Inteligente', 'Voz con IA', 'WhatsApp Business', 'Sitio Web IA', 'Agendamiento', 'Captura de Leads'].map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#252525', fontSize: 12, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase', flexShrink: 0 }}>
                <span style={{ width: 3, height: 3, background: G, borderRadius: '50%', opacity: 0.6 }} />{t}
              </span>
            ))}
        </div>
      </div>

      {/* ── INDUSTRIAS ──────────────────────────────────────────────────────────── */}
      <section id="empresas">
        {/* Header */}
        <div style={{ position: 'relative', padding: '100px 80px 72px', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.08) saturate(0.3)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <span className="label">Por tipo de empresa</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(42px, 5.5vw, 80px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-1.5px', color: '#F0F0F0' }}>
                Diseñado para<br />tu tipo de empresa
              </h2>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 18, maxWidth: 380, lineHeight: 1.8, fontWeight: 300 }}>
              Cada empresa tiene su propio agente IA, sitio web y flujos preconfigurados listos desde el primer día.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {INDUSTRIES.map((ind, i) => (
            <Link key={i} href={'/industrias/' + ind.slug}>
              <div className="ind-wrap" style={{ height: 280, borderRight: i % 4 !== 3 ? '1px solid #141414' : 'none', borderBottom: i < 8 ? '1px solid #141414' : 'none' }}>
                <img className="ind-img" src={ind.img} alt={ind.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                <div className="ind-overlay" />
                <div className="ind-bar" style={{ background: ind.color }} />
                {/* Contenido */}
                <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {/* Icono SVG profesional segun industria */}
                  <div style={{ marginBottom: 10, opacity: 0.9 }}>
                    {ind.slug === 'taller' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
                    {ind.slug === 'peluqueria' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>}
                    {ind.slug === 'inmobiliaria' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                    {ind.slug === 'restaurante' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>}
                    {ind.slug === 'restaurante_barrio' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}
                    {ind.slug === 'tienda' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                    {ind.slug === 'gimnasio' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h-5"/><path d="M6 8h5"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/><path d="M21 12h-3"/><path d="M3 12h3"/></svg>}
                    {ind.slug === 'salud' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                    {ind.slug === 'ajedrez' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 6v2c0 1.1-.9 2-2 2H5l1 10h12l1-10h-1c-1.1 0-2-.9-2-2V6"/><line x1="6" y1="20" x2="18" y2="20"/></svg>}
                    {ind.slug === 'arquitectura' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>}
                    {ind.slug === 'papeleria' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
                    {(ind.slug !== 'taller' && ind.slug !== 'peluqueria' && ind.slug !== 'inmobiliaria' && ind.slug !== 'restaurante' && ind.slug !== 'restaurante_barrio' && ind.slug !== 'tienda' && ind.slug !== 'gimnasio' && ind.slug !== 'salud' && ind.slug !== 'ajedrez' && ind.slug !== 'arquitectura' && ind.slug !== 'papeleria') && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ind.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                  </div>
                  <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 6, lineHeight: 1.1 }}>{ind.title}</h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontWeight: 300 }}>{ind.desc}</p>
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, background: ind.color + '22', color: ind.color, fontSize: 9, fontWeight: 600, padding: '3px 9px', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>IA</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FUNCIONES — SPLIT ───────────────────────────────────────────────────── */}
      <section id="funciones" style={{ background: BG }}>
        {/* Split foto + texto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85" alt="Equipo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 55%, #080808 100%)' }} />
          </div>
          <div style={{ padding: '80px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #141414' }}>
            <span className="label">Funcionalidades</span>
            <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: 28, color: '#F0F0F0' }}>
              Todo en una<br />sola plataforma
            </h2>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: 17, lineHeight: 1.8, marginBottom: 44, fontWeight: 300 }}>
              Desde el primer mensaje hasta la cita agendada y el cliente guardado en tu CRM — todo automático mientras tú te enfocas en lo que importa.
            </p>
            <Link href="/auth/register">
              <button className="btn-lima" style={{ alignSelf: 'flex-start' }}>Empezar ahora →</button>
            </Link>
          </div>
        </div>

        {/* Grid 3x2 de funciones — iconos SVG profesionales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #141414' }}>
          {[
            {
              n: '01', title: 'Agentes IA personalizados',
              desc: 'Entrenados con tu información. Responden, capturan leads y cierran ventas 24/7 sin intervención humana.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/><path d="M8 16h.01M16 16h.01"/></svg>)
            },
            {
              n: '02', title: 'Chat multicanal',
              desc: 'WhatsApp, Instagram, web y más. Todos tus canales unificados con respuestas automáticas e inteligentes.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="#B8FF6C"/><circle cx="12" cy="10" r="1" fill="#B8FF6C"/><circle cx="15" cy="10" r="1" fill="#B8FF6C"/></svg>)
            },
            {
              n: '03', title: 'Voz IA',
              desc: 'Agente que contesta llamadas, confirma citas y hace seguimiento telefónico de forma completamente automática.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M15 5.5a4 4 0 0 1 4 4" opacity="0.5"/><path d="M15 1.5a8 8 0 0 1 8 8" opacity="0.3"/></svg>)
            },
            {
              n: '04', title: 'CRM inteligente',
              desc: 'Gestiona clientes y pipeline. Los leads se capturan solos desde cada conversación y llamada.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>)
            },
            {
              n: '05', title: 'Página web IA',
              desc: 'Sitio web elegante generado automáticamente con tus servicios, precios y chat de IA integrado.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>)
            },
            {
              n: '06', title: 'Agendamiento automático',
              desc: 'Calendario conectado al agente. Tus clientes reservan citas solos — sin mensajes ni llamadas manuales.',
              svg: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8FF6C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>)
            },
          ].map((f, i) => (
            <div key={i} className="feat-cell" style={{ padding: '48px 40px', borderRight: i % 3 !== 2 ? '1px solid #141414' : 'none', borderBottom: i < 3 ? '1px solid #141414' : 'none', position: 'relative', background: 'transparent' }}>
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 88, color: G, opacity: 0.06, position: 'absolute', top: -8, right: 24, lineHeight: 1 }}>{f.n}</div>
              <div style={{ marginBottom: 24, opacity: 0.85 }}>{f.svg}</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, marginBottom: 14, color: '#E8E8E8', lineHeight: 1.2 }}>{f.title}</h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3A3A3A', fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS — FOTO FULL ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1800&q=85" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1) saturate(0.5)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.5) 30%, rgba(8,8,8,0.5) 70%, #080808 100%)' }} />

        <div style={{ position: 'relative', padding: '100px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <span className="label">Proceso</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0 }}>
                Activa tu agencia<br />de IA en 4 pasos
              </h2>
            </div>
            <Link href="/auth/register">
              <button className="btn-coral" style={{ fontSize: 15, padding: '14px 36px' }}>Comenzar ahora →</button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#141414' }}>
            {[
              { n: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos. Sin tarjeta de crédito. 14 días completamente gratis.' },
              { n: '02', title: 'Configura', desc: 'Ingresa servicios, precios y horarios. La IA aprende todo sobre tu negocio automáticamente.' },
              { n: '03', title: 'Activa', desc: 'Conecta WhatsApp, tu sitio web o teléfono. Tu agente empieza a trabajar en minutos.' },
              { n: '04', title: 'Crece', desc: 'Revisa reportes y conversaciones en tiempo real. Escala cuando quieras, sin límites.' },
            ].map((step, i) => (
              <div key={i} style={{ background: '#080808', padding: '52px 40px' }}>
                <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 64, color: G, opacity: 0.2, lineHeight: 1, marginBottom: 28 }}>{step.n}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, marginBottom: 16, color: '#E8E8E8' }}>{step.title}</h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3A3A3A', fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ──────────────────────────────────────────────────────────────── */}
      <section id="precios" style={{ background: BG }}>
        <div style={{ position: 'relative', padding: '100px 80px 72px', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&q=80" alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.08)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <span className="label">Planes y precios</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5.5vw, 80px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0, color: '#F0F0F0' }}>
                Comienza gratis,<br />crece sin límites
              </h2>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 18, maxWidth: 320, lineHeight: 1.8, fontWeight: 300 }}>
              Sin contratos. Sin sorpresas. Cancela cuando quieras.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 80px 120px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PLANES.map((plan, i) => (
            <div key={i} className="plan-card" style={{
              border: '1px solid ' + (plan.popular ? G + '55' : '#1A1A1A'),
              borderTop: plan.popular ? `3px solid ${G}` : '1px solid #1A1A1A',
              padding: '48px 40px',
              background: plan.popular ? '#0E0E0E' : '#0A0A0A',
            }}>
              {plan.popular && (
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 20 }}>★ Más popular</div>
              )}
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 24 }}>{plan.name}</div>

              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 72, fontWeight: 400, color: plan.popular ? G : '#E8E8E8', lineHeight: 1, marginBottom: 4, letterSpacing: -2 }}>
                <sup style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, verticalAlign: 'top', marginTop: 18, fontWeight: 300, opacity: 0.6 }}>$</sup>{plan.price}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#2A2A2A', fontSize: 12, marginBottom: 44, letterSpacing: 0.3 }}>COP / mes · IVA incluido</div>

              <ul style={{ listStyle: 'none', marginBottom: 48 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '11px 0', borderBottom: '1px solid #111', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4A4A4A', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 300 }}>
                    <span style={{ color: G, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <button className={plan.popular ? 'btn-lima' : 'btn-ghost-lima'} style={{ width: '100%', textAlign: 'center', fontSize: 14, padding: '14px' }}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=80" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.08)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.5) 20%, rgba(8,8,8,0.5) 80%, #080808 100%)' }} />

        <div style={{ position: 'relative', padding: '100px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 72, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <span className="label">Testimonios</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0 }}>
                Lo que dicen<br />nuestros clientes
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#141414' }}>
            {[
              { quote: 'Antes perdíamos clientes por no contestar a tiempo. Ahora el agente responde en segundos y agenda citas solo. Increíble cambio para mi negocio.', name: 'Ricardo Montoya', role: 'Taller AutoCenter — Medellín', initials: 'RM', color: '#FF6B35' },
              { quote: 'Las reservas de mi peluquería se manejan solas. El bot ya sabe mis horarios y precios. Ahorro 3 horas diarias que antes gastaba en mensajes.', name: 'Patricia Guerrero', role: 'Estudio Elegance — Cali', initials: 'PG', color: '#FF4D8B' },
              { quote: 'El agente filtra prospectos serios y agenda visitas. Mis vendedores solo atienden gente lista para comprar. Las ventas subieron un 40%.', name: 'Andrés López', role: 'Inversión Finca Raíz — Bogotá', initials: 'AL', color: '#4D94FF' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#080808', padding: '52px 44px' }}>
                <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 72, color: t.color, opacity: 0.25, lineHeight: 0.8, marginBottom: 28 }}>"</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, marginBottom: 44, fontWeight: 300 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 2, background: t.color + '18', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#E8E8E8' }}>{t.name}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#2A2A2A', fontSize: 12, marginTop: 3 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: 620, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=90" alt="Ciudad"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 65%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(108deg, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.82) 55%, rgba(8,8,8,0.55) 100%)' }} />
        {/* Luz lima sutil */}
        <div style={{ position: 'absolute', top: '30%', left: '35%', width: 500, height: 300, background: `radial-gradient(ellipse, ${G}06 0%, transparent 70%)` }} />

        <div style={{ position: 'relative', padding: '120px 80px' }}>
          <span className="label">Comienza hoy</span>
          <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(52px, 7vw, 100px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-2.5px', marginBottom: 28, maxWidth: 800, color: '#F0F0F0' }}>
            ¿Listo para poner<br />tu negocio en<br /><span style={{ color: G }}>modo automático?</span>
          </h2>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 20, marginBottom: 60, fontWeight: 300, lineHeight: 1.6, maxWidth: 460 }}>
            14 días gratis · Sin tarjeta de crédito · Configuración en minutos
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <button className="btn-lima" style={{ fontSize: 17, padding: '18px 52px' }}>Crear mi cuenta gratis →</button>
            </Link>
            <a href="mailto:soportesistemas@soporteia.net">
              <button className="btn-ghost" style={{ fontSize: 17, padding: '18px 52px' }}>Agendar una demo</button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#040404', padding: '80px 80px 40px', borderTop: '1px solid #111' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: 64, marginBottom: 64 }}>
          <div>
            <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 26, color: '#E8E8E8', marginBottom: 20 }}>
            agenc<span style={{ color: '#FF6B00', fontSize: 30 }}>IA</span>me
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1C1C1C', fontSize: 13, lineHeight: 1.8, maxWidth: 300, fontWeight: 300 }}>
            La IA que atiende, agenda y vende por tu negocio. Plataforma colombiana de automatización con inteligencia artificial.
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1C1C1C', fontSize: 12 }}>Cali, Colombia</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1C1C1C', fontSize: 12 }}>soportesistemas@soporteia.net</span>
            </div>
          </div>
          {[
            { title: 'Producto', links: ['Funciones', 'Precios', 'Integraciones', 'API'] },
            { title: 'Industrias', links: ['Talleres', 'Peluquerías', 'Inmobiliarias', 'Restaurantes'] },
            { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Términos', 'Privacidad'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#1C1C1C', marginBottom: 28 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1C1C1C', fontSize: 13, fontWeight: 300, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#555'}
                      onMouseLeave={e => e.target.style.color = '#1C1C1C'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #0E0E0E', paddingTop: 28, display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#141414', fontSize: 12 }}>
        <span>© 2026 agenc<span style={{ color: '#FF6B00' }}>IA</span>me by NexoTI · Todos los derechos reservados</span>
        <span>Hecho con amor en Cali, Colombia</span>
        </div>
      </footer>
    </>
  );
}

export function Logo({ size = 20 }) {
  return (
    <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: size + 2, color: '#E8E8E8' }}>
      agenc<span style={{ color: '#FF6B00', fontSize: size + 5 }}>IA</span>me
    </div>
  );
}
