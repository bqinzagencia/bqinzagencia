// pages/sitio/[slug].js
// Pagina web publica premium por industria — NEXOIA

import Head from 'next/head';
import { useState, useEffect } from 'react';
import * as admin from 'firebase-admin';

function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      }),
    });
  }
  return admin.firestore();
}

export async function getServerSideProps({ params }) {
  const { slug } = params;
  try {
    const db = getAdminDb();
    const snap = await db.collection('empresas').get();
    let empresaData = null;
    snap.forEach(doc => {
      const d = doc.data();
      const nombreSlug = (d.nombreEmpresa || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (nombreSlug === slug || d.slug === slug) empresaData = { id: doc.id, ...d };
    });
    if (!empresaData) return { notFound: true };
    let conocimiento = null;
    try {
      const cSnap = await db.collection('empresas').doc(empresaData.id).collection('config').doc('conocimiento').get();
      if (cSnap.exists) conocimiento = cSnap.data();
    } catch(e) {}
    const limpiar = (obj) => {
      if (!obj) return obj;
      const clean = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && val._seconds !== undefined) clean[key] = new Date(val._seconds * 1000).toISOString();
        else if (val && typeof val === 'object' && !Array.isArray(val)) clean[key] = limpiar(val);
        else clean[key] = val;
      }
      return clean;
    };
    return { props: { empresa: limpiar(empresaData), conocimiento: conocimiento ? limpiar(conocimiento) : null } };
  } catch (e) {
    console.error('[Sitio]', e.message);
    return { notFound: true };
  }
}

// ─── CONFIGURACION POR INDUSTRIA ────────────────────────────────────────────
const INDUSTRIAS = {
  peluqueria: {
    font: 'Playfair Display',
    fontBody: 'Lato',
    accent: '#C9A96E',
    accentDark: '#8B6914',
    bg: '#0D0D0D',
    surface: '#1A1A1A',
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80',
    heroAlt: 'Peluqueria moderna',
    galeria: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
    ],
    tagline: 'Arte & Belleza',
    emoji: '✂️',
    cta: 'Reservar mi cita',
    colorTexto: '#F5F0E8',
  },
  taller: {
    font: 'Oswald',
    fontBody: 'Roboto',
    accent: '#E8520A',
    accentDark: '#B33D05',
    bg: '#111111',
    surface: '#1C1C1C',
    hero: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1600&q=80',
    heroAlt: 'Taller mecanico profesional',
    galeria: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
      'https://images.unsplash.com/photo-1609205807107-1b66742b9e21?w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    ],
    tagline: 'Potencia & Precisión',
    emoji: '🔧',
    cta: 'Agendar revisión',
    colorTexto: '#F0F0F0',
  },
  restaurante: {
    font: 'Cormorant Garamond',
    fontBody: 'Raleway',
    accent: '#D4A017',
    accentDark: '#9B7210',
    bg: '#0A0A08',
    surface: '#161610',
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
    heroAlt: 'Restaurante elegante',
    galeria: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    ],
    tagline: 'Sabor & Experiencia',
    emoji: '🍽️',
    cta: 'Hacer reserva',
    colorTexto: '#F5F2E8',
  },
  inmobiliaria: {
    font: 'Montserrat',
    fontBody: 'Open Sans',
    accent: '#4A90D9',
    accentDark: '#2C6FAC',
    bg: '#0A0E14',
    surface: '#141820',
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80',
    heroAlt: 'Propiedades premium',
    galeria: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6f349479?w=600&q=80',
    ],
    tagline: 'Tu hogar ideal',
    emoji: '🏠',
    cta: 'Consultar propiedad',
    colorTexto: '#EEF2F8',
  },
  gimnasio: {
    font: 'Bebas Neue',
    fontBody: 'Nunito',
    accent: '#00FF87',
    accentDark: '#00B85E',
    bg: '#080808',
    surface: '#121212',
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
    heroAlt: 'Gimnasio moderno',
    galeria: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
    ],
    tagline: 'Supera tus límites',
    emoji: '💪',
    cta: 'Empezar ahora',
    colorTexto: '#F0FFF8',
  },
  salud: {
    font: 'Nunito',
    fontBody: 'Source Sans Pro',
    accent: '#00C2B8',
    accentDark: '#008F87',
    bg: '#040E14',
    surface: '#081820',
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80',
    heroAlt: 'Clinica de salud',
    galeria: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
      'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
    ],
    tagline: 'Tu bienestar primero',
    emoji: '🏥',
    cta: 'Agendar consulta',
    colorTexto: '#EEF8F8',
  },
  tienda: {
    font: 'Poppins',
    fontBody: 'DM Sans',
    accent: '#FF6B6B',
    accentDark: '#CC4444',
    bg: '#0D0A0A',
    surface: '#1A1414',
    hero: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80',
    heroAlt: 'Tienda moderna',
    galeria: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80',
    ],
    tagline: 'Estilo & Calidad',
    emoji: '🛒',
    cta: 'Ver catálogo',
    colorTexto: '#FFF5F5',
  },
  default: {
    font: 'Inter',
    fontBody: 'Inter',
    accent: '#00E5A0',
    accentDark: '#00A870',
    bg: '#080B0F',
    surface: '#111418',
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    heroAlt: 'Negocio profesional',
    galeria: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    ],
    tagline: 'Profesionalismo & Calidad',
    emoji: '🏢',
    cta: 'Contactar ahora',
    colorTexto: '#F0F4F8',
  },
};

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export default function SitioEmpresa({ empresa, conocimiento }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const ind = empresa.industria?.toLowerCase() || 'default';
  const cfg = INDUSTRIAS[ind] || INDUSTRIAS.default;
  const servicios = conocimiento?.servicios?.filter(s => s.nombre) || [];
  const horarios = conocimiento?.horarios || {};
  const info = conocimiento?.info || {};
  const diasActivos = DIAS.filter(d => horarios[d]?.activo);
  const whatsappNum = (info.whatsapp || info.telefono || empresa.telefono || '').replace(/\D/g, '');
  const whatsappUrl = whatsappNum ? 'https://wa.me/57' + whatsappNum : null;

  const sendChat = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);
    try {
      const res = await fetch('/api/chat-publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, empresaId: empresa.id, empresaNombre: empresa.nombreEmpresa, industria: empresa.industria, conocimiento: conocimiento?.promptGenerado || '' }),
      });
      const data = await res.json();
      if (data.reply) setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Lo siento, intenta de nuevo.' }]);
    } finally { setThinking(false); }
  };

  const googleFonts = 'https://fonts.googleapis.com/css2?family=' + cfg.font.replace(/ /g, '+') + ':wght@400;600;700;800&family=' + cfg.fontBody.replace(/ /g, '+') + ':wght@300;400;500&display=swap';

  return (
    <>
      <Head>
        <title>{empresa.nombreEmpresa} — {cfg.tagline}</title>
        <meta name="description" content={info.descripcionNegocio || empresa.nombreEmpresa + ' en ' + (info.ciudad || 'Colombia')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={googleFonts} rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${cfg.bg}; color: ${cfg.colorTexto}; font-family: '${cfg.fontBody}', sans-serif; }
        .fade-in { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .btn-primary { background: ${cfg.accent}; color: #000; border: none; border-radius: 4px; padding: 14px 32px; font-family: '${cfg.font}', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: ${cfg.accentDark}; transform: translateY(-2px); box-shadow: 0 8px 24px ${cfg.accent}44; }
        .btn-whatsapp { background: #25D366; color: #fff; border: none; border-radius: 4px; padding: 14px 32px; font-family: '${cfg.fontBody}', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; letter-spacing: 0.5px; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-whatsapp:hover { background: #1DA851; transform: translateY(-2px); }
        .divider { width: 60px; height: 3px; background: ${cfg.accent}; margin: 0 auto 24px; }
        .section-title { font-family: '${cfg.font}', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; text-align: center; margin-bottom: 12px; letter-spacing: -0.5px; }
        .section-sub { text-align: center; color: rgba(255,255,255,0.5); font-size: 16px; margin-bottom: 60px; }
        .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .chat-input::placeholder { color: rgba(255,255,255,0.3); }
        .chat-input:focus { outline: none; border-color: ${cfg.accent}; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%); backdrop-filter: blur(4px); }
        .nav-logo { font-family: '${cfg.font}', serif; font-size: 22px; font-weight: 700; color: ${cfg.colorTexto}; letter-spacing: 2px; text-decoration: none; }
        .nav-cta { background: transparent; border: 1px solid ${cfg.accent}; color: ${cfg.accent}; border-radius: 4px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s; }
        .nav-cta:hover { background: ${cfg.accent}; color: #000; }
        .service-card { background: ${cfg.surface}; border: 1px solid rgba(255,255,255,0.06); border-radius: 2px; padding: 32px 28px; position: relative; overflow: hidden; transition: all 0.3s; }
        .service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: ${cfg.accent}; transform: scaleX(0); transition: transform 0.3s; }
        .service-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.12); }
        .service-card:hover::before { transform: scaleX(1); }
        .horario-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .testimonial { background: ${cfg.surface}; border-left: 3px solid ${cfg.accent}; padding: 28px 32px; border-radius: 0 8px 8px 0; }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="#inicio" className="nav-logo">{empresa.nombreEmpresa}</a>
        <button className="nav-cta" onClick={() => setChatOpen(true)}>💬 Chatear</button>
      </nav>

      {/* HERO */}
      <section id="inicio" style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + cfg.hero + ')', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, ' + cfg.bg + 'CC 0%, transparent 60%, ' + cfg.bg + '88 100%)' }} />
        <div className={'container fade-in' + (visible ? ' visible' : '')} style={{ position: 'relative', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontFamily: '"' + cfg.fontBody + '", sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: cfg.accent, marginBottom: 20 }}>{cfg.tagline}</div>
          <h1 style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: -2 }}>
            {empresa.nombreEmpresa}
          </h1>
          {info.descripcionNegocio ? (
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>{info.descripcionNegocio}</p>
          ) : (
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>Servicio de {ind} en {info.ciudad || 'Colombia'}. Calidad y profesionalismo en cada visita.</p>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}>{cfg.cta}</button>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-whatsapp">📱 WhatsApp</a>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'float 2s ease-in-out infinite', opacity: 0.5 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cfg.accent} strokeWidth="2"><path d="M7 10l5 5 5-5"/></svg>
        </div>
      </section>

      {/* GALERIA */}
      <section style={{ padding: '80px 0', background: cfg.bg }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, borderRadius: 4, overflow: 'hidden' }}>
            {cfg.galeria.map((img, i) => (
              <div key={i} style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                <img src={img} alt="galeria" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', display: 'block' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      {servicios.length > 0 && (
        <section id="servicios" style={{ padding: '100px 0', background: cfg.surface + '88' }}>
          <div className="container">
            <p className="section-title">Nuestros Servicios</p>
            <div className="divider" />
            <p className="section-sub">Todo lo que necesitas en un solo lugar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {servicios.map((sv, i) => (
                <div key={i} className="service-card">
                  <div style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 22, fontWeight: 700, marginBottom: 10, color: cfg.colorTexto }}>{sv.nombre}</div>
                  {sv.descripcion && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 20 }}>{sv.descripcion}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    {sv.precio && <span style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 26, fontWeight: 700, color: cfg.accent }}>${parseInt(sv.precio).toLocaleString('es-CO')}</span>}
                    {sv.duracion && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '5px 12px', borderRadius: 100, letterSpacing: 0.5 }}>{sv.duracion} min</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NOSOTROS + HORARIOS */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

            {/* Contacto */}
            <div>
              <div style={{ fontFamily: '"' + cfg.fontBody + '", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: cfg.accent, marginBottom: 16 }}>Encuéntranos</div>
              <h2 style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 36, fontWeight: 700, marginBottom: 32, lineHeight: 1.2 }}>Visítanos y<br/>vive la experiencia</h2>
              {info.descripcionNegocio && <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 32, fontSize: 15 }}>{info.descripcionNegocio}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {(info.direccion) && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 2, background: cfg.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Dirección</div>
                      <div style={{ fontWeight: 500 }}>{info.direccion}{info.ciudad ? ', ' + info.ciudad : ''}</div>
                    </div>
                  </div>
                )}
                {(info.telefono || empresa.telefono) && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 2, background: cfg.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📞</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Teléfono</div>
                      <div style={{ fontWeight: 500 }}>{info.telefono || empresa.telefono}</div>
                    </div>
                  </div>
                )}
                {info.formasPago?.length > 0 && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 2, background: cfg.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💳</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Formas de pago</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {info.formasPago.map(p => <span key={p} style={{ background: cfg.accent + '18', border: '1px solid ' + cfg.accent + '44', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: cfg.accent }}>{p}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={() => setChatOpen(true)}>{cfg.cta}</button>
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-whatsapp">WhatsApp</a>}
              </div>
            </div>

            {/* Horarios */}
            {diasActivos.length > 0 && (
              <div>
                <div style={{ fontFamily: '"' + cfg.fontBody + '", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: cfg.accent, marginBottom: 16 }}>Horarios</div>
                <h2 style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 36, fontWeight: 700, marginBottom: 32, lineHeight: 1.2 }}>Cuando<br/>nos necesitas</h2>
                <div style={{ background: cfg.surface, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  {diasActivos.map((dia, i) => (
                    <div key={dia} className="horario-row" style={{ padding: '16px 28px', borderBottom: i < diasActivos.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{dia}</span>
                      <span style={{ color: cfg.accent, fontWeight: 700, fontFamily: '"' + cfg.fontBody + '", sans-serif', fontSize: 15 }}>{horarios[dia].desde} — {horarios[dia].hasta}</span>
                    </div>
                  ))}
                </div>
                {info.politicaCancelacion && (
                  <div style={{ marginTop: 24, padding: '16px 20px', background: cfg.accent + '11', border: '1px solid ' + cfg.accent + '33', borderRadius: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: cfg.accent, marginBottom: 6 }}>Política de cancelación</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{info.politicaCancelacion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'linear-gradient(135deg, ' + cfg.surface + ' 0%, ' + cfg.bg + ' 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + cfg.hero + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: '"' + cfg.fontBody + '", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: cfg.accent, marginBottom: 16 }}>¿Listo para empezar?</div>
          <h2 style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, marginBottom: 24, letterSpacing: -1 }}>
            Agenda tu cita hoy
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 40px', fontSize: 16, lineHeight: 1.7 }}>
            Nuestro asistente IA está disponible 24/7 para ayudarte a reservar tu próxima visita.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setChatOpen(true)} style={{ fontSize: 16, padding: '16px 40px' }}>{cfg.cta} →</button>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-whatsapp" style={{ fontSize: 16, padding: '16px 40px' }}>📱 WhatsApp</a>}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#000', padding: '32px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: '"' + cfg.font + '", serif', fontSize: 20, fontWeight: 700, color: cfg.accent, marginBottom: 8 }}>{empresa.nombreEmpresa}</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
          Powered by <a href="https://nexoia-eight.vercel.app" style={{ color: cfg.accent, textDecoration: 'none' }}>NEXOIA</a> · {new Date().getFullYear()}
        </div>
      </footer>

      {/* CHAT WIDGET */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 360, height: 520, background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: cfg.surface, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cfg.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"' + cfg.font + '", serif', fontWeight: 700, fontSize: 15 }}>{empresa.nombreEmpresa}</div>
              <div style={{ fontSize: 12, color: '#25D366', fontWeight: 500 }}>● Disponible ahora</div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ background: cfg.surface, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', fontSize: 14, maxWidth: '88%', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                Hola 👋 Soy el asistente de <strong>{empresa.nombreEmpresa}</strong>. ¿En qué te puedo ayudar hoy?
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '88%', background: msg.role === 'user' ? cfg.accent : cfg.surface, color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.85)', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ background: cfg.surface, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', fontSize: 13, maxWidth: '60%', color: 'rgba(255,255,255,0.4)' }}>
                Escribiendo...
              </div>
            )}
          </div>
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={'Escribe un mensaje...'}
              style={{ flex: 1, background: cfg.surface, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: 14, fontFamily: '"' + cfg.fontBody + '", sans-serif' }} />
            <button onClick={sendChat} disabled={!input.trim() || thinking}
              style={{ width: 44, height: 44, borderRadius: 10, background: input.trim() && !thinking ? cfg.accent : 'rgba(255,255,255,0.06)', border: 'none', cursor: input.trim() && !thinking ? 'pointer' : 'default', fontSize: 16, flexShrink: 0, transition: 'all 0.2s' }}>➤</button>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position: 'fixed', bottom: 28, right: 28, width: 60, height: 60, borderRadius: '50%', background: cfg.accent, border: 'none', cursor: 'pointer', fontSize: 24, boxShadow: '0 8px 32px ' + cfg.accent + '55', zIndex: 1000, transition: 'all 0.3s' }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.1)'; e.target.style.boxShadow = '0 12px 40px ' + cfg.accent + '77'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 32px ' + cfg.accent + '55'; }}>
          💬
        </button>
      )}
    </>
  );
}
