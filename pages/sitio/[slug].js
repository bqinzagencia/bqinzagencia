// pages/sitio/[slug].js
// Pagina web publica premium — agencIAme
// Industrias: peluqueria, taller, restaurante, inmobiliaria, gimnasio, salud, tienda,
//             ajedrez, arquitectura, restaurante_barrio, papeleria

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

    // Cargar fotos de galeria
    let fotosGaleria = [];
    try {
      const gSnap = await db.collection('empresas').doc(empresaData.id).collection('config').doc('galeria').get();
      if (gSnap.exists) fotosGaleria = gSnap.data().fotos || [];
    } catch(e) {}

    // Cargar menu diario (restaurantes)
    let menuDiario = null;
    try {
      const mSnap = await db.collection('empresas').doc(empresaData.id).collection('config').doc('menuDiario').get();
      if (mSnap.exists) menuDiario = mSnap.data();
    } catch(e) {}

    const limpiar = (obj) => {
      if (!obj) return obj;
      const clean = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && val._seconds !== undefined) clean[key] = new Date(val._seconds * 1000).toISOString();
        else if (Array.isArray(val)) clean[key] = val.map(v => typeof v === 'object' && v !== null ? limpiar(v) : v);
        else if (val && typeof val === 'object') clean[key] = limpiar(val);
        else clean[key] = val;
      }
      return clean;
    };

    return {
      props: {
        empresa: limpiar(empresaData),
        conocimiento: conocimiento ? limpiar(conocimiento) : null,
        fotosGaleria: fotosGaleria || [],
        menuDiario: menuDiario ? limpiar(menuDiario) : null,
      }
    };
  } catch (e) {
    console.error('[Sitio]', e.message);
    return { notFound: true };
  }
}

// ─── CONFIGURACION POR INDUSTRIA ────────────────────────────────────────────
const INDUSTRIAS = {
  peluqueria: {
    font: 'Playfair Display', fontBody: 'Lato',
    accent: '#C9A96E', accentDark: '#8B6914',
    bg: '#0D0D0D', surface: '#1A1A1A',
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80','https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80','https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80','https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80'],
    tagline: 'Arte & Belleza', cta: 'Reservar mi cita', colorTexto: '#F5F0E8',
    tieneDomicilio: false,
  },
  taller: {
    font: 'Oswald', fontBody: 'Roboto',
    accent: '#E8520A', accentDark: '#B33D05',
    bg: '#111111', surface: '#1C1C1C',
    hero: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80','https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80','https://images.unsplash.com/photo-1609205807107-1b66742b9e21?w=600&q=80','https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80'],
    tagline: 'Potencia & Precision', cta: 'Agendar revision', colorTexto: '#F0F0F0',
    tieneDomicilio: false,
  },
  restaurante: {
    font: 'Cormorant Garamond', fontBody: 'Raleway',
    accent: '#D4A017', accentDark: '#9B7210',
    bg: '#0A0A08', surface: '#161610',
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80','https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80'],
    tagline: 'Sabor & Experiencia', cta: 'Hacer reserva', colorTexto: '#F5F2E8',
    tieneDomicilio: true,
  },
  restaurante_barrio: {
    font: 'Merriweather', fontBody: 'Nunito',
    accent: '#E85D04', accentDark: '#C44D00',
    bg: '#0D0800', surface: '#1A1200',
    hero: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80','https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80'],
    tagline: 'Sabor de Casa', cta: 'Ver menu de hoy', colorTexto: '#FFF5EC',
    tieneDomicilio: true,
  },
  inmobiliaria: {
    font: 'Montserrat', fontBody: 'Open Sans',
    accent: '#4A90D9', accentDark: '#2C6FAC',
    bg: '#0A0E14', surface: '#141820',
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6f349479?w=600&q=80'],
    tagline: 'Tu hogar ideal', cta: 'Consultar propiedad', colorTexto: '#EEF2F8',
    tieneDomicilio: false,
  },
  gimnasio: {
    font: 'Bebas Neue', fontBody: 'Nunito',
    accent: '#00FF87', accentDark: '#00B85E',
    bg: '#080808', surface: '#121212',
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80','https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80','https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80'],
    tagline: 'Supera tus limites', cta: 'Empezar ahora', colorTexto: '#F0FFF8',
    tieneDomicilio: false,
  },
  salud: {
    font: 'Nunito', fontBody: 'Source Sans Pro',
    accent: '#00C2B8', accentDark: '#008F87',
    bg: '#040E14', surface: '#081820',
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80','https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&q=80','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80','https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80'],
    tagline: 'Tu bienestar primero', cta: 'Agendar consulta', colorTexto: '#EEF8F8',
    tieneDomicilio: false,
  },
  tienda: {
    font: 'Poppins', fontBody: 'DM Sans',
    accent: '#FF6B6B', accentDark: '#CC4444',
    bg: '#0D0A0A', surface: '#1A1414',
    hero: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80','https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80','https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80','https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80'],
    tagline: 'Estilo & Calidad', cta: 'Ver catalogo', colorTexto: '#FFF5F5',
    tieneDomicilio: true,
  },
  ajedrez: {
    font: 'Cinzel', fontBody: 'Raleway',
    accent: '#C0962C', accentDark: '#8B6914',
    bg: '#0A0800', surface: '#151200',
    hero: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=600&q=80','https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=600&q=80','https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=600&q=80','https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&q=80'],
    tagline: 'Estrategia & Mente', cta: 'Inscribirse ahora', colorTexto: '#F5F0E0',
    tieneDomicilio: false,
  },
  arquitectura: {
    font: 'Cormorant Garamond', fontBody: 'Jost',
    accent: '#B5A16E', accentDark: '#8A7340',
    bg: '#0A0908', surface: '#141210',
    hero: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80','https://images.unsplash.com/photo-1600607687644-c7171b47b292?w=600&q=80','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'],
    tagline: 'Arquitectura & Vision', cta: 'Solicitar consultoria', colorTexto: '#F0EDE8',
    tieneDomicilio: false,
  },
  papeleria: {
    font: 'Poppins', fontBody: 'DM Sans',
    accent: '#7B61FF', accentDark: '#5A44CC',
    bg: '#0A0812', surface: '#120F1A',
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80','https://images.unsplash.com/photo-1586282391129-76a6df230234?w=600&q=80','https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=600&q=80','https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80'],
    tagline: 'Servicios & Soluciones', cta: 'Solicitar cotizacion', colorTexto: '#F0EEF8',
    tieneDomicilio: true,
  },
  default: {
    font: 'Inter', fontBody: 'Inter',
    accent: '#00E5A0', accentDark: '#00A870',
    bg: '#080B0F', surface: '#111418',
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=90',
    galeria: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80','https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80','https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80'],
    tagline: 'Profesionalismo & Calidad', cta: 'Contactar ahora', colorTexto: '#F0F4F8',
    tieneDomicilio: false,
  },
};

const DIAS_ES = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export default function SitioEmpresa({ empresa, conocimiento, fotosGaleria, menuDiario }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fotoActiva, setFotoActiva] = useState(null);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const ind = empresa.industria?.toLowerCase() || 'default';
  const cfg = INDUSTRIAS[ind] || INDUSTRIAS.default;
  const servicios = conocimiento?.servicios?.filter(s => s.nombre) || [];
  const horarios = conocimiento?.horarios || {};
  const info = conocimiento?.info || {};
  const diasActivos = DIAS_ES.filter(d => horarios[d]?.activo);
  const whatsappNum = (info.whatsapp || info.telefono || empresa.telefono || '').replace(/\D/g, '');
  const whatsappUrl = whatsappNum ? 'https://wa.me/57' + whatsappNum : null;
  const heroPhoto = empresa.fotoWeb || cfg.hero;

  // Galeria: fotos propias primero, luego las de la industria
  const todasFotos = fotosGaleria && fotosGaleria.length > 0 ? fotosGaleria : cfg.galeria;

  // Domicilio habilitado
  const tieneDomicilio = (info.ofreceDomicilio || cfg.tieneDomicilio) && whatsappUrl;

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

  // Cargar fuentes — soporte para Cinzel y Jost tambien
  const fontsMap = {
    'Playfair Display': 'Playfair+Display:wght@400;600;700;800',
    'Oswald': 'Oswald:wght@400;600;700',
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400',
    'Montserrat': 'Montserrat:wght@400;600;700;800',
    'Bebas Neue': 'Bebas+Neue',
    'Nunito': 'Nunito:wght@300;400;600;700',
    'Poppins': 'Poppins:wght@300;400;600;700',
    'Cinzel': 'Cinzel:wght@400;600;700',
    'Merriweather': 'Merriweather:wght@300;400;700',
    'Inter': 'Inter:wght@300;400;500;600;700',
    'Jost': 'Jost:wght@300;400;500;600',
  };
  const bodyFontsMap = {
    'Lato': 'Lato:wght@300;400;700',
    'Roboto': 'Roboto:wght@300;400;500',
    'Raleway': 'Raleway:wght@300;400;500;600',
    'Open Sans': 'Open+Sans:wght@300;400;600',
    'Nunito': 'Nunito:wght@300;400;600',
    'DM Sans': 'DM+Sans:wght@300;400;500',
    'Source Sans Pro': 'Source+Sans+Pro:wght@300;400;600',
    'Jost': 'Jost:wght@300;400;500',
    'Inter': 'Inter:wght@300;400;500',
  };
  const fontParam = fontsMap[cfg.font] || cfg.font.replace(/ /g, '+') + ':wght@400;600;700;800';
  const bodyParam = bodyFontsMap[cfg.fontBody] || cfg.fontBody.replace(/ /g, '+') + ':wght@300;400;500';
  const googleFonts = 'https://fonts.googleapis.com/css2?family=' + fontParam + '&family=' + bodyParam + '&display=swap';

  const A = cfg.accent;
  const BG = cfg.bg;
  const SURF = cfg.surface;
  const TXT = cfg.colorTexto;

  return (
    <>
      <Head>
        <title>{empresa.nombreEmpresa} — {cfg.tagline}</title>
        <meta name="description" content={info.descripcionNegocio || empresa.nombreEmpresa + ' en ' + (info.ciudad || 'Colombia')} />
        <meta property="og:title" content={empresa.nombreEmpresa} />
        <meta property="og:description" content={info.descripcionNegocio || cfg.tagline} />
        <meta property="og:image" content={heroPhoto} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={googleFonts} rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; color: ${TXT}; font-family: '${cfg.fontBody}', sans-serif; }
        a { text-decoration: none; color: inherit; }
        img { display: block; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { opacity:0; transform:translateY(30px); transition:opacity 0.9s ease,transform 0.9s ease; }
        .fade-in.visible { opacity:1; transform:translateY(0); }
        .btn-p { background:${A}; color:#000; border:none; border-radius:3px; padding:14px 32px; font-family:'${cfg.font}',serif; font-weight:700; font-size:15px; cursor:pointer; letter-spacing:0.5px; text-transform:uppercase; transition:all 0.3s; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
        .btn-p:hover { opacity:0.88; transform:translateY(-2px); box-shadow:0 8px 28px ${A}44; }
        .btn-w { background:#25D366; color:#fff; border:none; border-radius:3px; padding:14px 32px; font-weight:700; font-size:15px; cursor:pointer; transition:all 0.3s; text-decoration:none; display:inline-flex; align-items:center; gap:8px; font-family:'${cfg.fontBody}',sans-serif; }
        .btn-w:hover { background:#1DA851; transform:translateY(-2px); }
        .btn-dom { background:#FF4500; color:#fff; border:none; border-radius:3px; padding:14px 32px; font-weight:700; font-size:15px; cursor:pointer; transition:all 0.3s; text-decoration:none; display:inline-flex; align-items:center; gap:8px; font-family:'${cfg.fontBody}',sans-serif; }
        .btn-dom:hover { background:#CC3700; transform:translateY(-2px); }
        .cont { max-width:1160px; margin:0 auto; padding:0 32px; }
        .label-s { font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:${A}; margin-bottom:16px; display:block; }
        .sv-card { background:${SURF}; border:1px solid rgba(255,255,255,0.06); border-radius:3px; padding:28px; position:relative; overflow:hidden; transition:all 0.3s; }
        .sv-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:${A}; transform:scaleX(0); transition:transform 0.3s; }
        .sv-card:hover { transform:translateY(-4px); border-color:rgba(255,255,255,0.12); }
        .sv-card:hover::before { transform:scaleX(1); }
        .gal-item { overflow:hidden; position:relative; cursor:pointer; }
        .gal-img { width:100%; height:100%; object-fit:cover; transition:transform 0.7s ease; }
        .gal-item:hover .gal-img { transform:scale(1.08); }
        .nav-site { position:fixed; top:0; left:0; right:0; z-index:100; padding:18px 40px; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(180deg,rgba(0,0,0,0.85) 0%,transparent 100%); backdrop-filter:blur(8px); }
        .nav-logo-s { font-family:'${cfg.font}',serif; font-size:20px; font-weight:700; letter-spacing:1px; }
        .nav-btn-s { background:transparent; border:1px solid ${A}; color:${A}; border-radius:3px; padding:8px 18px; font-size:12px; font-weight:600; cursor:pointer; letter-spacing:1px; text-transform:uppercase; transition:all 0.3s; }
        .nav-btn-s:hover { background:${A}; color:#000; }
        .lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; }
        .lightbox img { max-width:90vw; max-height:90vh; object-fit:contain; border-radius:4px; }
        .menu-card { background:${SURF}; border:1px solid rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; transition:all 0.3s; }
        .menu-card:hover { border-color:${A}44; transform:translateY(-2px); }
      `}</style>

      {/* NAV */}
      <nav className="nav-site">
        <span className="nav-logo-s">{empresa.nombreEmpresa}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {tieneDomicilio && (
            <a href={whatsappUrl + '?text=Hola, quiero hacer un pedido a domicilio'} target="_blank" rel="noopener"
              style={{ background: '#FF4500', color: '#fff', border: 'none', borderRadius: 3, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              🛵 Domicilio
            </a>
          )}
          <button className="nav-btn-s" onClick={() => setChatOpen(true)}>💬 Chatear</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + heroPhoto + ')', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.32)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,' + BG + 'DD 0%,transparent 60%,' + BG + '99 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to top,' + BG + ',transparent)' }} />

        <div className={'cont fade-in' + (visible ? ' visible' : '')} style={{ position: 'relative', textAlign: 'center' }}>
          <span className="label-s">{cfg.tagline}</span>
          <h1 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(44px,8vw,96px)', fontWeight: 800, lineHeight: 1.0, marginBottom: 24, letterSpacing: -1 }}>
            {empresa.nombreEmpresa}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.75, fontWeight: 300 }}>
            {info.descripcionNegocio || ('Bienvenidos a ' + empresa.nombreEmpresa + '. Calidad y profesionalismo en cada servicio.')}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-p" onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}>{cfg.cta}</button>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-w">📱 WhatsApp</a>}
            {tieneDomicilio && (
              <a href={whatsappUrl + '?text=Quiero hacer un pedido a domicilio'} target="_blank" rel="noopener" className="btn-dom">🛵 Pedir domicilio</a>
            )}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', animation: 'float 2.5s ease-in-out infinite', opacity: 0.4 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><path d="M7 10l5 5 5-5"/></svg>
        </div>
      </section>

      {/* GALERIA DE FOTOS */}
      {todasFotos.length > 0 && (
        <section style={{ padding: '0 0 2px', background: BG }}>
          <div style={{ display: 'grid', gridTemplateColumns: todasFotos.length >= 4 ? 'repeat(4,1fr)' : todasFotos.length === 3 ? 'repeat(3,1fr)' : todasFotos.length === 2 ? 'repeat(2,1fr)' : '1fr', gap: 3 }}>
            {todasFotos.slice(0, 8).map((img, i) => (
              <div key={i} className="gal-item" style={{ height: todasFotos.length > 4 && i >= 4 ? 200 : 320 }} onClick={() => setFotoActiva(img)}>
                <img className="gal-img" src={img} alt={'foto ' + (i + 1)} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.5) 100%)' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      {fotoActiva && (
        <div className="lightbox" onClick={() => setFotoActiva(null)}>
          <img src={fotoActiva} alt="foto ampliada" onClick={e => e.stopPropagation()} />
          <button onClick={() => setFotoActiva(null)} style={{ position: 'absolute', top: 24, right: 32, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', opacity: 0.7 }}>✕</button>
        </div>
      )}

      {/* MENU DIARIO (solo restaurantes) */}
      {(ind === 'restaurante' || ind === 'restaurante_barrio') && menuDiario && menuDiario.platos && menuDiario.platos.length > 0 && (
        <section style={{ padding: '80px 0', background: SURF + '88' }}>
          <div className="cont">
            <span className="label-s" style={{ textAlign: 'center', display: 'block' }}>Menu de hoy</span>
            <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
              {menuDiario.titulo || 'Menu del dia'}
            </h2>
            {menuDiario.descripcion && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: 48, fontSize: 15 }}>{menuDiario.descripcion}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {menuDiario.platos.map((plato, i) => (
                <div key={i} className="menu-card">
                  {plato.foto && (
                    <div style={{ height: 180, overflow: 'hidden' }}>
                      <img src={plato.foto} alt={plato.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    </div>
                  )}
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{plato.nombre}</div>
                    {plato.descripcion && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 14 }}>{plato.descripcion}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {plato.precio && <span style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 22, fontWeight: 700, color: A }}>${parseInt(plato.precio).toLocaleString('es-CO')}</span>}
                      {tieneDomicilio && (
                        <a href={whatsappUrl + '?text=Quiero pedir: ' + plato.nombre} target="_blank" rel="noopener"
                          style={{ background: '#25D366', color: '#fff', borderRadius: 3, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          Pedir 🛵
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {menuDiario.precioMenuCompleto && (
              <div style={{ textAlign: 'center', marginTop: 40, padding: '20px 32px', background: A + '11', border: '1px solid ' + A + '33', borderRadius: 4, display: 'inline-block' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Menu completo del dia</div>
                <div style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 32, fontWeight: 700, color: A }}>${parseInt(menuDiario.precioMenuCompleto).toLocaleString('es-CO')}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICIOS */}
      {servicios.length > 0 && (
        <section id="servicios" style={{ padding: '100px 0', background: SURF + '66' }}>
          <div className="cont">
            <span className="label-s" style={{ textAlign: 'center', display: 'block' }}>
              {ind === 'ajedrez' ? 'Clases & Servicios' : ind === 'arquitectura' ? 'Nuestros Servicios' : 'Servicios'}
            </span>
            <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 }}>
              {ind === 'ajedrez' ? 'Aprende, compite y mejora' : ind === 'arquitectura' ? 'Soluciones arquitectonicas' : 'Todo lo que necesitas'}
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: 56, fontSize: 15 }}>
              {ind === 'ajedrez' ? 'Clases para todos los niveles — niños, adultos, presencial y virtual.' : ind === 'arquitectura' ? 'Diseño, construccion y consultoria de alto nivel.' : 'Calidad y profesionalismo en cada servicio.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 22 }}>
              {servicios.map((sv, i) => (
                <div key={i} className="sv-card">
                  {sv.modalidad && (
                    <span style={{ background: A + '22', color: A, border: '1px solid ' + A + '44', fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: 1, textTransform: 'uppercase', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>
                      {sv.modalidad}
                    </span>
                  )}
                  <div style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{sv.nombre}</div>
                  {sv.descripcion && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 18 }}>{sv.descripcion}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {sv.precio && <span style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 24, fontWeight: 700, color: A }}>${parseInt(sv.precio).toLocaleString('es-CO')}</span>}
                    {sv.duracion && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 100 }}>{sv.duracion} min</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DOMICILIO BANNER */}
      {tieneDomicilio && (
        <section style={{ padding: '60px 0', background: 'linear-gradient(135deg,#FF450011 0%,' + BG + ' 100%)', borderTop: '1px solid rgba(255,69,0,0.2)', borderBottom: '1px solid rgba(255,69,0,0.2)' }}>
          <div className="cont" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛵</div>
            <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 700, marginBottom: 12 }}>
              Pedidos a Domicilio
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontSize: 15, maxWidth: 480, margin: '0 auto 28px' }}>
              {info.zonasCobertura ? 'Cobertura: ' + info.zonasCobertura : 'Realizamos entregas en tu zona. Escríbenos por WhatsApp para confirmar cobertura y tiempos.'}
            </p>
            <a href={whatsappUrl + '?text=Hola, quiero hacer un pedido a domicilio'} target="_blank" rel="noopener" className="btn-dom" style={{ fontSize: 16, padding: '16px 40px' }}>
              🛵 Pedir ahora por WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* CONTACTO + HORARIOS */}
      <section style={{ padding: '100px 0' }}>
        <div className="cont">
          <div style={{ display: 'grid', gridTemplateColumns: diasActivos.length > 0 ? '1fr 1fr' : '1fr', gap: 72, alignItems: 'start' }}>
            {/* Contacto */}
            <div>
              <span className="label-s">Encuéntranos</span>
              <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, marginBottom: 32, lineHeight: 1.15 }}>
                Visítanos y vive<br />la experiencia
              </h2>
              {info.descripcionNegocio && <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32, fontSize: 15, fontWeight: 300 }}>{info.descripcionNegocio}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                {info.direccion && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 3, background: A + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Dirección</div>
                      <div style={{ fontWeight: 500 }}>{info.direccion}{info.ciudad ? ', ' + info.ciudad : ''}</div>
                    </div>
                  </div>
                )}
                {(info.telefono || empresa.telefono) && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 3, background: A + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📞</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Teléfono</div>
                      <div style={{ fontWeight: 500 }}>{info.telefono || empresa.telefono}</div>
                    </div>
                  </div>
                )}
                {info.formasPago?.length > 0 && (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 3, background: A + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💳</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Formas de pago</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {info.formasPago.map(p => <span key={p} style={{ background: A + '18', border: '1px solid ' + A + '44', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: A }}>{p}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-p" onClick={() => setChatOpen(true)}>{cfg.cta}</button>
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-w">WhatsApp</a>}
              </div>
            </div>

            {/* Horarios */}
            {diasActivos.length > 0 && (
              <div>
                <span className="label-s">Horarios</span>
                <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, marginBottom: 32, lineHeight: 1.15 }}>Cuando<br />nos necesitas</h2>
                <div style={{ background: SURF, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  {diasActivos.map((dia, i) => (
                    <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 24px', borderBottom: i < diasActivos.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{dia}</span>
                      <span style={{ color: A, fontWeight: 700, fontSize: 14 }}>{horarios[dia].desde} — {horarios[dia].hasta}</span>
                    </div>
                  ))}
                </div>
                {info.politicaCancelacion && (
                  <div style={{ marginTop: 20, padding: '14px 18px', background: A + '0E', border: '1px solid ' + A + '2A', borderRadius: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: A, marginBottom: 6 }}>Política de cancelación</div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{info.politicaCancelacion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(' + heroPhoto + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07 }} />
        <div style={{ position: 'relative' }}>
          <span className="label-s">¿Listo para empezar?</span>
          <h2 style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 'clamp(32px,5vw,60px)', fontWeight: 800, marginBottom: 20, letterSpacing: -0.5 }}>
            {ind === 'ajedrez' ? 'Comienza tu aventura en el ajedrez' : ind === 'arquitectura' ? 'Hagamos realidad tu proyecto' : cfg.cta + ' hoy'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto 40px', fontSize: 15, lineHeight: 1.7, fontWeight: 300 }}>
            Nuestro asistente IA está disponible 24/7 para responder tus preguntas y agendar tu cita.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-p" onClick={() => setChatOpen(true)} style={{ fontSize: 16, padding: '16px 40px' }}>{cfg.cta} →</button>
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener" className="btn-w" style={{ fontSize: 16, padding: '16px 40px' }}>📱 WhatsApp</a>}
            {tieneDomicilio && <a href={whatsappUrl + '?text=Quiero hacer un pedido'} target="_blank" rel="noopener" className="btn-dom" style={{ fontSize: 16, padding: '16px 40px' }}>🛵 Domicilio</a>}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#000', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: '"' + cfg.font + '",serif', fontSize: 18, fontWeight: 700, color: A, marginBottom: 6 }}>{empresa.nombreEmpresa}</div>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          Powered by <a href="https://agenciame.com" style={{ color: A, textDecoration: 'none', fontWeight: 600 }}>agenc<span style={{ color: '#FF6B00' }}>IA</span>me</a> · {new Date().getFullYear()}
        </div>
      </footer>

      {/* CHAT WIDGET */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, width: 360, height: 520, background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {ind === 'ajedrez' ? '♟️' : ind === 'arquitectura' ? '🏗️' : ind === 'restaurante' || ind === 'restaurante_barrio' ? '🍽️' : '🤖'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"' + cfg.font + '",serif', fontWeight: 700, fontSize: 15 }}>{empresa.nombreEmpresa}</div>
              <div style={{ fontSize: 12, color: '#25D366', fontWeight: 500 }}>● Disponible ahora</div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ background: SURF, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', fontSize: 14, maxWidth: '90%', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                Hola 👋 Soy el asistente de <strong>{empresa.nombreEmpresa}</strong>. ¿En qué te puedo ayudar?
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '88%', background: msg.role === 'user' ? A : SURF, color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.85)', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6 }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ background: SURF, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', fontSize: 13, maxWidth: '60%', color: 'rgba(255,255,255,0.4)' }}>
                Escribiendo...
              </div>
            )}
          </div>
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, background: SURF, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: '"' + cfg.fontBody + '",sans-serif' }} />
            <button onClick={sendChat} disabled={!input.trim() || thinking}
              style={{ width: 44, height: 44, borderRadius: 10, background: input.trim() && !thinking ? A : 'rgba(255,255,255,0.06)', border: 'none', cursor: input.trim() && !thinking ? 'pointer' : 'default', fontSize: 16, flexShrink: 0, transition: 'all 0.2s' }}>➤</button>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position: 'fixed', bottom: 28, right: 28, width: 60, height: 60, borderRadius: '50%', background: A, border: 'none', cursor: 'pointer', fontSize: 24, boxShadow: '0 8px 32px ' + A + '55', zIndex: 1000, transition: 'all 0.3s' }}>
          💬
        </button>
      )}
    </>
  );
}
