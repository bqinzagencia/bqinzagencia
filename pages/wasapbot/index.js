// pages/index.js — NEXOIA Landing v4 — WasapBot como producto principal
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import DemoSimuladorPublico from '../../components/landing/DemoSimuladorPublico';
import { useState, useEffect, useRef } from 'react';

const INDUSTRIES = [
  { icon: '🔧', title: 'Talleres & Mecánica', desc: 'Agenda citas, historial y presupuestos automáticos.', slug: 'taller', color: '#FF6B35', img: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=80' },
  { icon: '✂️', title: 'Peluquerías & Spa', desc: 'Reservas 24/7 y portafolio de servicios.', slug: 'peluqueria', color: '#FF4D8B', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
  { icon: '🏠', title: 'Inmobiliarias', desc: 'Filtra leads y agenda visitas con IA.', slug: 'inmobiliaria', color: '#4D94FF', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
  { icon: '🍽️', title: 'Restaurantes', desc: 'Reservas, menu digital y domicilios por WhatsApp.', slug: 'restaurante', color: '#FFB830', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  { icon: '🛒', title: 'Tiendas & Retail', desc: 'Catálogo digital, ventas y domicilios.', slug: 'tienda', color: '#30D988', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80' },
  { icon: '🏋️', title: 'Gimnasios & Fitness', desc: 'Inscripciones, clases y pagos automáticos.', slug: 'gimnasio', color: '#1A56FF', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { icon: '🏥', title: 'Salud & Clínicas', desc: 'Agenda médica y pre-triage por chat.', slug: 'salud', color: '#00D4FF', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80' },
  { icon: '♟️', title: 'Escuelas de Ajedrez', desc: 'Clases niños/adultos, torneos, libros y clases virtuales.', slug: 'ajedrez', color: '#C0962C', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80' },
  { icon: '🏗️', title: 'Arquitectura & Construcción', desc: 'Diseño, construcción, renders y consultoría de proyectos.', slug: 'arquitectura', color: '#B5A16E', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80' },
  { icon: '📋', title: 'Servicios & Papelerías', desc: 'Cotizaciones automáticas y seguimiento de pedidos.', slug: 'papeleria', color: '#C77DFF', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { icon: '🎯', title: 'Deporte & Entrenamientos', desc: 'Clases, torneos, inscripciones y seguimiento deportivo.', slug: 'gimnasio', color: '#FF4D6D', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80' },
  { icon: '🛃', title: 'Agencias de Aduana', desc: 'Seguimiento de declaraciones, aranceles y estado de mercancías en puerto.', slug: 'aduana', color: '#0EA5E9', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80' },
  { icon: '🚢', title: 'Operadoras Portuarias', desc: 'Contenedores, ETA de buques, bodegaje y coordinacion con navieras.', slug: 'portuaria', color: '#0F766E', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80' },
  { icon: '💻', title: 'Soporte Técnico & Electrónica', desc: 'Celulares, computadoras y electrónica. Recepción, presupuestos y seguimiento.', slug: 'tecnico', color: '#6366F1', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { icon: '✂️', title: 'Barbería & Estilo', desc: 'Turnos, reservas y clientes fieles. Tu barbería siempre llena sin perder un turno.', slug: 'barbero', color: '#1D4ED8', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80' },
  { icon: '🍰', title: 'Repostería & Chef', desc: 'Pedidos de tortas, cotizaciones automáticas y agenda de entregas sin esfuerzo.', slug: 'reposteria', color: '#EC4899', img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80' },
  { icon: '🐾', title: 'Veterinaria & Mascotas', desc: 'Citas, vacunas y grooming. Recordatorios automáticos para cada mascota.', slug: 'veterinaria', color: '#10B981', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80' },
  { icon: '📷', title: 'Fotografía & Video', desc: 'Cotizaciones, portafolio y agenda de sesiones. Bookings confirmados automáticamente.', slug: 'fotografia', color: '#F59E0B', img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80' },
  { icon: '🚛', title: 'Transporte & Acarreos', desc: 'Cotización de fletes, trasteos y transporte intermunicipal. Tu camión siempre con carga.', slug: 'acarreos', color: '#6B7280', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
  { icon: '🧠', title: 'Psicología & Bienestar', desc: 'Agenda de sesiones, recordatorios y pre-consulta automática. Más pacientes, menos admin.', slug: 'psicologo', color: '#8B5CF6', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80' },
  { icon: '📊', title: 'Asesoría Fiscal & Finanzas', desc: 'Agenda asesorías, recuerda vencimientos Agencia Tributaria y onboarding de clientes automático.', slug: 'contador', color: '#0EA5E9', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
];

const PLANES = [
  { name: 'Básico', price: '79', features: ['Bot WhatsApp 24/7', 'Lista de clientes automática', 'Catálogo de productos', 'Agendamiento de citas', 'Inventario básico', 'Notificaciones email'], cta: 'Activar WasapBot', popular: false },
  { name: 'Estándar', price: '149', features: ['Todo lo del Básico', 'Panel de pedidos', 'Inventario avanzado', 'Reportes de ventas', 'Broadcasts masivos', 'Soporte prioritario'], cta: 'Activar WasapBot', popular: true },
  { name: 'Pro', price: '249', features: ['Todo lo del Estándar', 'Página web incluida', 'Recordatorios de citas', 'CRM avanzado de clientes', 'Múltiples agentes IA', 'Gestor dedicado'], cta: 'Hablar con ventas', popular: false },
];

// ── Iconos de línea (sin emojis tipo caricatura) ─────────────────────────────
function PopupIcon({ type, color = '#25D366', size = 14 }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    bot:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="3" y="11" width="18" height="9" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    calendar:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clipboard: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v3H9z"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
    box:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/></svg>,
    cart:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L22 6H5"/></svg>,
    chart:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3" height="6"/><rect x="11" y="8" width="3" height="10"/><rect x="16" y="4" width="3" height="14"/></svg>,
    bell:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 6 1.5 6H4.5S6 12 6 8z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/></svg>,
    megaphone: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>,
    globe:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></svg>,
    briefcase: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  };
  return icons[type] || icons.bot;
}

// ── Popup de bienvenida ──────────────────────────────────────────────────────
const POPUP_ITEMS = [
  { type: 'bot',       t: 'Bot WhatsApp que responde 24/7 con IA' },
  { type: 'calendar',  t: 'Agenda citas automáticamente' },
  { type: 'clipboard', t: 'Catálogo con fotos, precios y descripciones' },
  { type: 'box',       t: 'Inventario y control de stock en tiempo real' },
  { type: 'briefcase', t: 'Libreta de clientes automática' },
  { type: 'cart',      t: 'Pedidos por WhatsApp con confirmación automática' },
  { type: 'chart',     t: 'Reportes diarios de ventas y actividad' },
  { type: 'bell',      t: 'Alertas de stock mínimo por email' },
  { type: 'megaphone', t: 'Broadcasts masivos a todos tus clientes' },
  { type: 'globe',     t: 'Página web profesional incluida (Plan Pro)' },
  { type: 'briefcase', t: 'CRM avanzado de clientes (Plan Pro)' },
];

function PopupBienvenida({ onClose, onDemo }) {
  const [sonidoActivo, setSonidoActivo] = useState(false);
  const videoRef = useRef(null);

  const toggleSonido = () => {
    const v = videoRef.current;
    if (!v) return;
    if (sonidoActivo) {
      v.muted = true;
      setSonidoActivo(false);
    } else {
      v.muted = false;
      v.play().catch(() => {});
      setSonidoActivo(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(0.92) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.35; transform:scale(.8); } }
        @keyframes slideInCard { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        .popup-box { animation: popIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        .popup-item { animation: fadeUp 0.3s ease both; }
        .popup-sound-btn:hover { background: rgba(37,211,102,0.2) !important; border-color: rgba(37,211,102,0.5) !important; }
      `}</style>

      <div className="popup-box" style={{
        background: '#0A0D12',
        border: '1px solid rgba(37,211,102,0.2)',
        borderRadius: 24,
        width: '100%', maxWidth: 440,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(37,211,102,0.08)',
      }}>
        {/* Cabecera del popup sin video */}
        <div style={{ background: 'linear-gradient(135deg,#0D1F12,#0A1A0D)', borderRadius: '24px 24px 0 0', padding: '20px 22px 16px', borderBottom: '1px solid rgba(37,211,102,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,211,102,0.15)', border: '1.5px solid rgba(37,211,102,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PopupIcon type="bot" size={18}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 700, color: '#25D366' }}>WasapBot · <span style={{color:'#fff'}}>BQinz</span><span style={{color:'#FF6B00'}}>agenc</span><span style={{color:'#fff'}}>IA</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#25D366', animation: 'pulseDot 1.6s ease infinite', display: 'inline-block' }}/>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>● En línea · Responde al instante</span>
              </div>
            </div>
          </div>
        </div>

        {/* Texto "tu negocio en piloto automático" */}
        <div style={{ padding: '16px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <img src="/agenciame-robot-final.png" alt="AIA" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }}/>
            <h2 style={{
              fontFamily: "'Abril Fatface',serif",
              fontSize: 'clamp(20px,5vw,28px)',
              fontWeight: 400, letterSpacing: '-0.5px',
              color: '#F0F0F0', lineHeight: 1.1, margin: 0,
            }}>
              Tu negocio en<br />
              <span style={{ color: '#25D366' }}>piloto automático.</span>
            </h2>
          </div>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 12, fontWeight: 300 }}>
            Un solo bot en WhatsApp administra tu negocio. Desde 49€/mes.
          </p>
        </div>

        {/* Items — lo que incluye (compacto para que quepan los CTAs) */}
        <div style={{ padding: '0 22px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {POPUP_ITEMS.slice(0, 6).map((item, i) => (
            <div key={i} className="popup-item" style={{
              animationDelay: `${0.05 + i * 0.04}s`,
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '7px 9px',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PopupIcon type={item.type} size={11}/>
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.3, fontWeight: 400 }}>{item.t}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/wasapbot/activar" onClick={onClose}>
            <div style={{
              background: 'linear-gradient(135deg,#25D366,#1aad4e)',
              color: '#fff', borderRadius: 12, padding: '14px',
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700,
              textAlign: 'center', cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(37,211,102,0.35)',
            }}>
              Activar mi WasapBot →
            </div>
          </Link>

          {/* Botón demo directo dentro del popup */}
          <div
            onClick={() => {
              onClose();
              setTimeout(() => {
                const el = document.getElementById('btn-demo-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => el && el.querySelector('button')?.click(), 400);
              }, 200);
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(37,211,102,0.06)', border: '1.5px solid rgba(37,211,102,0.35)',
              borderRadius: 12, padding: '13px 14px', cursor: 'pointer',
            }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, color: '#25D366' }}>Prúbalo ahora, sin registrarte</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Demo instantánea con IA real</div>
            </div>
          </div>

          <button onClick={() => { onClose(); setTimeout(() => onDemo && onDemo(), 300); }} style={{
            background: 'linear-gradient(135deg,rgba(37,211,102,0.1),rgba(37,211,102,0.05))',
            border: '1px solid rgba(37,211,102,0.25)',
            borderRadius: 12, padding: '11px',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13,
            color: '#25D366', cursor: 'pointer', fontWeight: 600,
          }}>
            💬 Probar demo sin registrarme
          </button>
        </div>
      </div>
    </div>
  );
}

const CONVERSACIONES_EJEMPLO = [
  {
    nombre: 'Restaurante', icono: '🍽️',
    pregunta: 'Quiero reservar mesa para 4 personas el sábado a las 9pm',
    respuesta: '¡Perfecto! Mesa para 4 el sábado 28 a las 21:00 ✅\nTe enviamos confirmación por WhatsApp. ¿Alguna alergia o petición especial?',
  },
  {
    nombre: 'Barbería', icono: '✂️',
    pregunta: '¿Hay hueco mañana para corte y barba?',
    respuesta: 'Sí, tengo libre mañana a las 11:00 y a las 17:30 ✅\n¿Cuál te viene mejor? Te lo reservo ahora mismo.',
  },
  {
    nombre: 'Taller', icono: '🔧',
    pregunta: '¿Cómo va el inventario de repuestos?',
    respuesta: 'Hoy se usaron 4 filtros de aceite. Quedan solo 2 en stock — te recomiendo pedir más antes del viernes.',
  },
  {
    nombre: 'Peluquería', icono: '💇',
    pregunta: 'Quiero cita para tinte y corte',
    respuesta: 'Claro ✅ Tengo disponible el miércoles 26 a las 10:00 o el jueves 27 a las 16:00. ¿Cuál prefieres?',
  },
  {
    nombre: 'Clínica', icono: '🏥',
    pregunta: '¿Cuánto tarda el resultado de analítica?',
    respuesta: 'Los resultados de analítica básica están listos en 24-48h. Te aviso por WhatsApp en cuanto los tengamos 📊',
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [showPopup,   setShowPopup]   = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [empresaIdx,  setEmpresaIdx]  = useState(0);
  const [chatVisible,  setChatVisible]  = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const empresaActiva = CONVERSACIONES_EJEMPLO[empresaIdx];
  const autoRotRef    = useRef(null);

  const cambiarEmpresa = (idx) => {
    setChatVisible(false);
    setTimeout(() => {
      setEmpresaIdx(idx);
      setChatVisible(true);
    }, 220);
  };

  // Auto-rotación cada 3.5s
  useEffect(() => {
    autoRotRef.current = setInterval(() => {
      setChatVisible(false);
      setTimeout(() => {
        setEmpresaIdx(i => (i + 1) % CONVERSACIONES_EJEMPLO.length);
        setChatVisible(true);
      }, 220);
    }, 3500);
    return () => clearInterval(autoRotRef.current);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Abrir demo si viene con ?demo=1 en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') setShowDemo(true);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const t = setTimeout(() => {
        setShowPopup(true);
      }, 800);
      return () => clearTimeout(t);
    } else {
      setPopupClosed(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupClosed(true);
    // Scroll al botón de demo para que sea lo primero que vea el usuario
    setTimeout(() => {
      const el = document.getElementById('btn-demo-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  const G  = '#FF6B00';  // naranja BQinzagencIA
  const G2 = '#FF9500';
  const BG = '#0F1623';

  return (
    <>
      <Head>
        <title>BQinzagencIA — Tu negocio atendido por Inteligencia Artificial</title>
        <meta name="description" content="BQinzagencIA: La plataforma de IA que atiende, agenda y vende por tu negocio. Automatiza ventas y atención al cliente 24/7." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400;1,9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Popup de bienvenida — solo móvil */}
      {showPopup && <PopupBienvenida onClose={handleClosePopup} onDemo={() => setShowDemo(true)} />}
      {showDemo && <DemoSimuladorPublico onClose={() => setShowDemo(false)} />}

      <style dangerouslySetInnerHTML={{__html: `
        body { background: #080808; color: #E8E8E8; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        *, *::before, *::after { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        h1,h2,h3 { font-synthesis: none; }
        img { display:block; }
        .btn-ghost { background: transparent; color: #aaa; border: 1px solid #333; border-radius: 2px; padding: 15px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 400; font-size: 15px; cursor: pointer; transition: all 0.25s; display: inline-block; }
        .btn-ghost:hover { border-color: #666; color: #E8E8E8; }
        .btn-wa { background: #000; color: #FF6B00; border: 1px solid #FF6B00; border-radius: 2px; padding: 14px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.25s; display: inline-block; }
        .btn-wa:hover { box-shadow: 0 0 18px rgba(255,107,0,0.5); transform: translateY(-1px); }
        .btn-coral { background: #F97316; color: #fff; border: none; border-radius: 2px; padding: 14px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.25s; display: inline-block; }
        .btn-ghost-wa { background: #000; color: #FF6B00; border: 1px solid #FF6B00; border-radius: 2px; padding: 14px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.25s; display: inline-block; }
        .btn-ghost-wa:hover { box-shadow: 0 0 14px rgba(255,107,0,0.4); }
        .label { display: inline-block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #FF6B00; margin-bottom: 20px; }
        .ind-wrap { position: relative; overflow: hidden; cursor: pointer; }
        .ind-img { object-fit: cover; position: absolute; inset: 0; width: 100%; height: 100%; transition: transform 0.6s ease; }
        .ind-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.4) 50%, rgba(8,8,8,0.1) 100%); }
        .ind-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; transform: scaleX(0); transition: transform 0.4s; }
        .ind-wrap:hover .ind-img { transform: scale(1.05); }
        .ind-wrap:hover .ind-bar { transform: scaleX(1); }
        .slide-up { animation: slideUp 0.8s ease both; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.25s; } .d3 { animation-delay: 0.4s; } .d4 { animation-delay: 0.55s; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulseWA { 0%,100%{box-shadow:0 0 0 0 rgba(255,107,0,0.4)} 70%{box-shadow:0 0 0 10px rgba(255,107,0,0)} }
        @keyframes float { 0%,100%{transform:translateY(-50%)} 50%{transform:translateY(calc(-50% - 14px))} }

        .planes-swipe-hint { display: none; }

        /* ─── MOBILE ─────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .lnd-nav { padding: 0 20px !important; height: 58px !important; }
          .lnd-nav-links { display: none !important; }
          .lnd-hero { height: 100dvh !important; min-height: 580px !important; }
          .lnd-hero-img { object-position: 50% 30% !important; }
          .lnd-hero-content { padding: 80px 22px 40px !important; align-items: flex-start !important; justify-content: flex-start !important; }
          .lnd-hero-inner { max-width: 100% !important; padding-top: 20px !important; }
          .lnd-hero-h1 { font-size: clamp(40px, 11vw, 68px) !important; letter-spacing: -1px !important; margin-bottom: 16px !important; }
          .lnd-hero-sub { font-size: 14px !important; margin-bottom: 24px !important; }
          .lnd-hero-ctas { flex-direction: column !important; gap: 10px !important; width: 100% !important; }
          .lnd-hero-ctas a, .lnd-hero-ctas button { width: 100% !important; text-align: center !important; display: block !important; }
          .lnd-hero-proof { margin-top: 28px !important; flex-wrap: wrap !important; gap: 10px !important; }
          .lnd-hero-stats { display: none !important; }
          .lnd-hero-robot { display: none !important; }
          .lnd-hero-badge { padding: 6px 12px !important; margin-bottom: 20px !important; }
          .lnd-ind-header { padding: 60px 22px 40px !important; flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .lnd-ind-grid { grid-template-columns: 1fr 1fr !important; }
          .lnd-ind-grid .ind-wrap { height: 180px !important; }
          .lnd-ind-grid .ind-wrap h3 { font-size: 16px !important; }
          .lnd-ind-grid .ind-wrap p { display: none !important; }
          .lnd-split { grid-template-columns: 1fr !important; }
          .lnd-split-img { min-height: 220px !important; }
          .lnd-split-text { padding: 40px 22px !important; border-left: none !important; border-top: 1px solid #141414 !important; }
          .lnd-feat-grid { grid-template-columns: 1fr !important; }
          .feat-cell { border-right: none !important; padding: 36px 22px !important; }
          section > div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          .lnd-steps-inner { padding: 60px 22px !important; }
          .lnd-steps-header { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
          .lnd-steps-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .lnd-steps-grid > div { border-right: none !important; border-bottom: 1px solid #141414 !important; padding: 36px 22px !important; }
          .lnd-planes-header { padding: 60px 22px 40px !important; flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .lnd-planes-grid { padding: 0 22px 80px !important; grid-template-columns: 1fr !important; gap: 16px !important; }
          .plan-card { padding: 36px 24px !important; }
          .lnd-test-inner { padding: 60px 22px !important; }
          .lnd-test-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .lnd-test-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .lnd-test-grid > div { padding: 36px 22px !important; border-bottom: 1px solid #141414 !important; }
          .lnd-cta-inner { padding: 80px 22px !important; }
          .lnd-cta-h2 { font-size: clamp(38px, 11vw, 72px) !important; letter-spacing: -1px !important; }
          .lnd-cta-btns { flex-direction: column !important; gap: 10px !important; }
          .lnd-cta-btns a, .lnd-cta-btns button { width: 100% !important; display: block !important; text-align: center !important; }
          .lnd-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
          .lnd-footer-grid > div:first-child { grid-column: 1 / -1 !important; }
          .lnd-footer-inner { padding: 56px 22px 32px !important; }
          .lnd-footer-copy { flex-direction: column !important; gap: 8px !important; text-align: center !important; }

          /* WASAPBOT SECTION — visible en móvil sin scroll cuando cierra popup */
          .wasapbot-hero-mobile { display: flex !important; }

          /* Carrusel de planes deslizable (id tiene mayor especificidad que el selector de arriba) */
          .planes-swipe-hint { display: flex !important; }
          #planes-scroll-mobile {
            display: flex !important;
            grid-template-columns: unset !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-snap-type: x mandatory !important;
            gap: 10px !important;
            background: transparent !important;
            border-radius: 0 !important;
            padding-bottom: 6px !important;
            margin: 0 -22px 0 !important;
            padding-left: 22px !important;
            padding-right: 22px !important;
          }
          #planes-scroll-mobile::-webkit-scrollbar { display: none; }
          #planes-scroll-mobile > a {
            flex: 0 0 82% !important;
            scroll-snap-align: center !important;
          }
          #planes-scroll-mobile > a > div {
            border-radius: 14px !important;
            height: 100% !important;
          }
        }
        @media (max-width: 420px) {
          .lnd-ind-grid { grid-template-columns: 1fr !important; }
          .lnd-ind-grid .ind-wrap { height: 200px !important; border-right: none !important; }
          .lnd-ind-grid .ind-wrap p { display: block !important; }
        }
      `}} />

      {/* ── NAV ── */}
      <nav className="lnd-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 64px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid #1A1A1A',
        transition: 'all 0.5s ease',
      }}>
        <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 20, letterSpacing: '-0.5px', color: '#E8E8E8' }}>
          <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: '#FF6B00' }}>agenc</span><span style={{ color: '#fff' }}>IA</span>
        </div>
        <div className="lnd-nav-links" style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {['Empresas', 'Funciones', 'Precios', 'WasapBot'].map(item => (
            <a key={item}
              href={item === 'WasapBot' ? '/wasapbot' : '#' + item.toLowerCase()}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: item === 'WasapBot' ? '#25D366' : '#aaa', fontSize: 13, fontWeight: item === 'WasapBot' ? 600 : 400, letterSpacing: 0.3, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#E8E8E8'}
              onMouseLeave={e => e.target.style.color = item === 'WasapBot' ? '#25D366' : '#aaa'}>
              {item}
            </a>
          ))}
          <Link href="/wasapbot/login"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#aaa', fontSize: 13, fontWeight: 400, letterSpacing: 0.3, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8E8E8'}
            onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>
            Ingresar
          </Link>
        </div>
        <div className="lnd-nav-cta">
          {!loading && (user ? (
            <Link href="/wasapbot"><button className="btn-wa" style={{ padding: '9px 22px', fontSize: 13 }}>Mi WasapBot →</button></Link>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/wasapbot/login"><span style={{ color: '#aaa', fontSize: 13, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color = '#E8E8E8'} onMouseLeave={e => e.target.style.color = '#aaa'}>Ingresar</span></Link>
              <Link href="/wasapbot/activar"><button className="btn-wa" style={{ padding: '9px 22px', fontSize: 13 }}>Crear mi bot →</button></Link>
            </div>
          ))}
        </div>
      </nav>

      {/* ── BLOQUE HERO WASAPBOT — "que vive en WhatsApp" ── */}
      <section style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '68px 0 0', overflow: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes waFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes waPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
          @keyframes waDot   { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
          .wa-mockup { animation: waFloat 5s ease-in-out infinite; }
          .wa-badge-pulse { animation: waPulse 1.8s ease-in-out infinite; }
          @media(max-width:900px){
            .wa-hero-grid { flex-direction: column !important; padding: 100px 22px 60px !important; gap: 48px !important; }
            .wa-hero-right { display: none !important; }
            .wa-hero-left { max-width: 100% !important; }
          }
        `}</style>

        <div className="wa-hero-grid" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:60, padding:'120px 80px 80px', maxWidth:1300, margin:'0 auto', width:'100%' }}>

          {/* IZQUIERDA */}
          <div className="wa-hero-left" style={{ flex:'1 1 480px', maxWidth:580 }}>

            {/* Badge +200 negocios */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:99, padding:'6px 14px', marginBottom:32 }}>
              <span className="wa-badge-pulse" style={{ width:6, height:6, borderRadius:'50%', background:'#25D366', flexShrink:0 }}/>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:'#25D366' }}>+240 negocios activos en España</span>
            </div>

            {/* Label */}
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:16 }}>El primer administrador de empresas</div>

            {/* Título */}
            <h1 style={{ fontFamily:"'Abril Fatface',serif", fontSize:'clamp(44px,6vw,84px)', fontWeight:400, lineHeight:1.0, letterSpacing:'-2px', color:'#F0F0F0', marginBottom:24 }}>
              que vive en<br />
              <span style={{ color:'#25D366' }}>WhatsApp.</span>
            </h1>

            {/* Cita editorial */}
            <p style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:18, color:'rgba(255,255,255,0.45)', lineHeight:1.7, borderLeft:'3px solid rgba(255,255,255,0.12)', paddingLeft:16, marginBottom:12 }}>
              No es un bot. Es tu administrador.
            </p>
            <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:15, color:'rgba(255,255,255,0.35)', lineHeight:1.75, marginBottom:44 }}>
              Atiende, agenda, vende y controla tu negocio — todo desde WhatsApp, todo solo, las 24 horas.
            </p>

            {/* CTA */}
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <Link href="/wasapbot/activar">
                <button style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:4, padding:'15px 36px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'all .2s', boxShadow:'0 6px 28px rgba(37,211,102,0.35)' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  Activa tu plan ahora →
                </button>
              </Link>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,0.3)' }}>Desde 79€/mes</span>
            </div>

            {/* Botón del simulador demo — ancla para scroll desde popup */}
            <div id="btn-demo-anchor" style={{ marginTop:16 }}>
              <button onClick={() => setShowDemo(true)} style={{ background:'rgba(37,211,102,0.08)', border:'1.5px solid rgba(37,211,102,0.4)', color:'#25D366', borderRadius:8, padding:'12px 24px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:13.5, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
                💬 Pruébalo ahora, sin registrarte →
              </button>
            </div>

            {/* Checks */}
            <div style={{ display:'flex', gap:24, marginTop:28, flexWrap:'wrap' }}>
              {['Sin contratos','Activo en 10 min','Soporte en español'].map((t,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:'#25D366', fontSize:12, fontWeight:700 }}>✓</span>
                  <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,0.4)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DERECHA — Mockup WhatsApp con carrusel de conversaciones */}
          <div className="wa-hero-right" style={{ flex:'0 0 auto', position:'relative' }}>

            {/* Badge flotante arriba */}
            <div style={{ position:'absolute', top:-20, right:-10, zIndex:10, display:'flex', alignItems:'center', gap:7, background:'rgba(37,211,102,0.12)', border:'1px solid rgba(37,211,102,0.3)', borderRadius:99, padding:'7px 14px', backdropFilter:'blur(8px)' }}>
              <span className="wa-badge-pulse" style={{ width:6, height:6, borderRadius:'50%', background:'#25D366', flexShrink:0 }}/>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:600, color:'#25D366', whiteSpace:'nowrap' }}>Así te avisa WasapBot a ti, el dueño</span>
            </div>

            {/* Teléfono mockup */}
            <div className="wa-mockup" style={{ width:300, background:'#fff', borderRadius:32, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)', position:'relative' }}>

              {/* Cabecera WhatsApp */}
              <div style={{ background:'#075E54', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{empresaActiva.icono}</div>
                <div>
                  <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700, color:'#fff' }}>Bot {empresaActiva.nombre}</div>
                  <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, color:'rgba(255,255,255,0.7)' }}>en línea — responde al instante</div>
                </div>
              </div>

              {/* Chat body */}
              <div style={{ background:'#ECE5DD', padding:'16px 12px', minHeight:300, display:'flex', flexDirection:'column', gap:10, transition:'opacity .22s ease', opacity: chatVisible ? 1 : 0 }}>
                <div style={{ textAlign:'center' }}>
                  <span style={{ background:'rgba(0,0,0,0.12)', borderRadius:8, padding:'3px 10px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, color:'#555' }}>Hoy</span>
                </div>

                {/* Mensaje usuario */}
                <div style={{ alignSelf:'flex-end', maxWidth:'85%' }}>
                  <div style={{ background:'#DCF8C6', borderRadius:'12px 0 12px 12px', padding:'10px 14px', boxShadow:'0 1px 2px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, color:'#111', lineHeight:1.5 }}>{empresaActiva.pregunta}</div>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:9, color:'#999', textAlign:'right', marginTop:4 }}>9:14 ✓✓</div>
                  </div>
                </div>

                {/* Respuesta bot */}
                <div style={{ alignSelf:'flex-start', maxWidth:'88%' }}>
                  <div style={{ background:'#fff', borderRadius:'0 12px 12px 12px', padding:'10px 14px', boxShadow:'0 1px 2px rgba(0,0,0,0.12)' }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, color:'#111', lineHeight:1.6 }}>{empresaActiva.respuesta}</div>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:9, color:'#999', textAlign:'right', marginTop:4 }}>9:14</div>
                  </div>
                </div>
              </div>

              {/* Tabs de empresas */}
              <div style={{ background:'#F0F0F0', padding:'8px 10px', display:'flex', gap:6, flexWrap:'nowrap', overflowX:'auto', borderTop:'1px solid #ddd' }}>
                {CONVERSACIONES_EJEMPLO.map((e,i)=>(
                  <button key={i} onClick={()=>{ clearInterval(autoRotRef.current); cambiarEmpresa(i); }}
                    style={{ background: i===empresaIdx?'#25D366':'rgba(0,0,0,0.08)', color: i===empresaIdx?'#fff':'#444', borderRadius:99, padding:'4px 11px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, fontWeight: i===empresaIdx?700:400, border:'none', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all .2s' }}>
                    {e.icono} {e.nombre}
                  </button>
                ))}
              </div>

              {/* Input WhatsApp */}
              <div style={{ background:'#F0F0F0', padding:'8px 12px', display:'flex', alignItems:'center', gap:8, borderTop:'1px solid #e0e0e0' }}>
                <div style={{ flex:1, background:'#fff', borderRadius:20, padding:'7px 14px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, color:'#aaa' }}>Escribe un mensaje...</div>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERO ORIGINAL (ahora segundo bloque) ── */}
      <section className={`lnd-hero${popupClosed ? ' hero-popup-closed' : ''}`} style={{ position: 'relative', height: '100svh', minHeight: 580, overflow: 'hidden', paddingTop: 68 }}>
        {/* En móvil con popup cerrado: hero más compacto para que WasapBot sea la primera sección visible */}
        <style>{`@media(max-width:768px){
          .hero-popup-closed{height:56dvh!important;min-height:300px!important;transition:height 0.4s ease}
          .hero-popup-closed .lnd-hero-content{padding:68px 22px 20px!important}
          .hero-popup-closed .lnd-hero-sub{display:none!important}
          .hero-popup-closed .lnd-hero-proof{display:none!important}
          .hero-popup-closed .lnd-hero-badge{margin-bottom:12px!important}
          .hero-popup-closed .lnd-hero-h1{font-size:clamp(30px,8vw,48px)!important;margin-bottom:10px!important;line-height:1!important}
          .hero-popup-closed .lnd-hero-ctas button{padding:11px!important;font-size:13px!important}
          .hero-popup-closed .slide-up.d3{margin-top:10px!important}
        }`}</style>
        <img className="lnd-hero-img"
          src="/hero-bg.png" alt="Fondo tech"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.85) 50%, rgba(8,8,8,0.65) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, #080808, transparent)' }} />

        <div className="lnd-hero-content" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          <div className="lnd-hero-inner" style={{ maxWidth: 740 }}>

            {/* Badge */}
            <div className="slide-up lnd-hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: `1px solid rgba(255,107,0,0.4)`, borderRadius: 1, padding: '7px 16px', marginBottom: 44 }}>
              <span style={{ width: 5, height: 5, background: G, borderRadius: '50%', flexShrink: 0, animation: 'pulseWA 2s infinite' }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: G, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase' }}>
                Tu negocio atendido por Inteligencia Artificial
              </span>
            </div>

            {/* Título */}
            <h1 className="slide-up d1 lnd-hero-h1" style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(60px, 8.5vw, 120px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-2px', color: '#FAFAFA', marginBottom: 36 }}>
              <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: '#FF6B00' }}>agenc</span><span style={{ color: '#fff' }}>IA</span><br />
              <span style={{ fontSize: '55%', color: 'rgba(240,240,240,0.7)' }}>tu negocio en<br /></span>
              <span style={{ color: G }}>piloto automático.</span>
            </h1>

            {/* Sub */}
            <p className="slide-up d2 lnd-hero-sub" style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 21, color: 'rgba(255,255,255,0.5)', maxWidth: 500, marginBottom: 8, lineHeight: 1.65, fontWeight: 300 }}>
              No es un bot. Es tu administrador.
            </p>
            <p className="slide-up d2 lnd-hero-sub" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.35)', maxWidth: 500, marginBottom: 52, lineHeight: 1.75, fontWeight: 300 }}>
              Atiende, agenda, vende y controla tu negocio — todo desde WhatsApp, todo solo, las 24 horas.
            </p>

            {/* CTAs — todos apuntan a WasapBot */}
            <div className="slide-up d3 lnd-hero-ctas" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/wasapbot/activar">
                <button className="btn-wa" style={{ fontSize: 16, padding: '16px 44px' }}>Activar mi WasapBot →</button>
              </Link>
              <button onClick={() => setShowDemo(true)} className="btn-wa" style={{ fontSize: 16, padding: '16px 44px' }}>
                💬 Probar demo
              </button>
              <a href="#wasapbot">
                <button className="btn-ghost" style={{ fontSize: 16, padding: '16px 44px' }}>Ver cómo funciona</button>
              </a>
            </div>

            <div className="slide-up d3" style={{ marginTop: 22 }}>
              <Link href="/wasapbot/activar">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: G, cursor: 'pointer', borderBottom: `1px solid rgba(255,107,0,0.4)`, paddingBottom: 2 }}>
                  Desde 79€/mes · Sin contratos →
                </span>
              </Link>
            </div>

            {/* Social proof */}
            <div className="slide-up d4 lnd-hero-proof" style={{ marginTop: 60, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex' }}>
                {['#FF6B35','#FF4D8B','#4D94FF','#FFB830','#25D366'].map((c, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c + '33', border: `2px solid ${c}66`, marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: c, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {['RM','PG','AL','JV','DG'][i]}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#888' }}>
                <span style={{ color: '#E8E8E8', fontWeight: 600 }}>+240 empresas</span> ya automatizan con <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: '#FF6B00' }}>agenc</span><span style={{ color: '#fff' }}>IA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lnd-hero-stats" style={{ position: 'absolute', right: 80, bottom: 80, display: 'flex', gap: 48 }}>
          {[{ v: '24/7', l: 'Disponible' }, { v: '<2s', l: 'Respuesta' }, { v: '94%', l: 'Satisfacción' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 44, color: G, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#444', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Robot flotando, espacio derecho del hero */}
        <img className="lnd-hero-robot" src="/agenciame-robot-final.png" alt="BQinzagencIA robot IA"
          style={{ position: 'absolute', right: 110, top: '50%', transform: 'translateY(-50%)', width: 380, height: 'auto', objectFit: 'contain', opacity: 0.55, animation: 'float 6s ease-in-out infinite', pointerEvents: 'none' }} />
      </section>

      {/* ── WASAPBOT SECTION — visible en móvil al cerrar popup ── */}
      <section id="wasapbot" style={{ background: '#06090D', borderTop: '1px solid rgba(255,107,0,0.2)', padding: '64px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,107,0,0.1)', border: '2px solid rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseWA 2s infinite' }}>
              <PopupIcon type="bot" size={24}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fontWeight: 700, color: G, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4 }}>Producto principal</div>
              <div style={{ fontFamily: "'Abril Fatface',serif", fontSize: 'clamp(28px,5vw,48px)', color: '#F0F0F0', letterSpacing: '-1px', lineHeight: 1 }}>WasapBot</div>
            </div>
          </div>

          {/* Hint de swipe — solo móvil */}
          <div className="planes-swipe-hint" style={{ alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Desliza para ver los 3 planes
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div id="planes-scroll-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
            {[
              { plan: 'Básico', precio: '79€/mes', color: '#FF6B00', items: ['Bot WhatsApp IA 24/7', 'Lista de clientes automática', 'Catálogo de productos', 'Agendamiento de citas', 'Inventario básico'] },
              { plan: 'Estándar', precio: '149€/mes', color: '#FF6B00', popular: true, items: ['Todo lo del Básico', 'Panel de pedidos', 'Reportes diarios de ventas', 'Broadcasts masivos'] },
              { plan: 'Pro', precio: '249€/mes', color: '#FF6B00', items: ['Todo lo del Estándar', 'Página web incluida', 'Recordatorios de citas', 'CRM avanzado de clientes'] },
            ].map((p, i) => (
              <Link key={i} href="/wasapbot/activar">
                <div style={{ background: '#0A0D12', padding: '24px 20px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0A0D12'}>
                  {p.popular && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#FF6B00', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: '0 0 8px 8px', whiteSpace: 'nowrap' }}>★ MÁS POPULAR</div>}
                  <div style={{ fontFamily: "'Abril Fatface',serif", fontSize: 22, color: '#FF6B00', letterSpacing: '-0.5px', marginBottom: 2 }}>{p.precio}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>{p.plan}</div>
                  {p.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
                      <span style={{ color: '#FF6B00', fontSize: 10, flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/wasapbot/activar">
              <button className="btn-wa" style={{ fontSize: 15, padding: '14px 36px' }}>Activar mi WasapBot →</button>
            </Link>
            <Link href="/wasapbot">
              <button className="btn-ghost-wa" style={{ fontSize: 15, padding: '14px 36px' }}>Ver más detalles</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: '1px solid #141414', borderBottom: '1px solid #141414', padding: '14px 0', overflow: 'hidden', background: '#0C0C0C' }}>
        <div style={{ display: 'flex', gap: 80, animation: 'marquee 32s linear infinite', whiteSpace: 'nowrap' }}>
          {['Bot WhatsApp 24/7', 'Inventario en tiempo real', 'Pedidos automáticos', 'Reportes diarios', 'Agendamiento IA', 'Broadcasts masivos', 'Stock con alertas', 'Página web incluida',
            'Bot WhatsApp 24/7', 'Inventario en tiempo real', 'Pedidos automáticos', 'Reportes diarios', 'Agendamiento IA', 'Broadcasts masivos', 'Stock con alertas', 'Página web incluida'].map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#252525', fontSize: 12, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase', flexShrink: 0 }}>
                <span style={{ width: 3, height: 3, background: G, borderRadius: '50%', opacity: 0.6 }} />{t}
              </span>
            ))}
        </div>
      </div>

      {/* ── INDUSTRIAS ── */}
      <section id="empresas">
        <div style={{ position: 'relative', padding: '100px 80px 72px', overflow: 'hidden' }} className="lnd-ind-header">
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
              Cada industria tiene su bot preconfigurado con el vocabulario, flujos y catálogo listo desde el primer día.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }} className="lnd-ind-grid">
          {INDUSTRIES.map((ind, i) => (
            <Link key={i} href={'/wasapbot/activar'}>
              <div className="ind-wrap" style={{ height: 280, borderRight: i % 4 !== 3 ? '1px solid #141414' : 'none', borderBottom: i < INDUSTRIES.length - 4 ? '1px solid #141414' : 'none' }}>
                <img className="ind-img" src={ind.img} alt={ind.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                <div className="ind-overlay" />
                <div className="ind-bar" style={{ background: ind.color }} />
                <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{ind.icon}</div>
                  <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 6, lineHeight: 1.1 }}>{ind.title}</h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontWeight: 300 }}>{ind.desc}</p>
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, background: ind.color + '22', color: ind.color, fontSize: 9, fontWeight: 600, padding: '3px 9px', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>IA</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FUNCIONES ── */}
      <section id="funciones" style={{ background: BG }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="lnd-split">
          <div className="lnd-split-img" style={{ position: 'relative', minHeight: 560, overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85" alt="Equipo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 55%, #080808 100%)' }} />
          </div>
          <div className="lnd-split-text" style={{ padding: '80px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #141414' }}>
            <span className="label">Funcionalidades</span>
            <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: 28, color: '#F0F0F0' }}>
              Todo en una<br />sola plataforma
            </h2>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontSize: 17, lineHeight: 1.8, marginBottom: 44, fontWeight: 300 }}>
              Desde el primer mensaje hasta la cita agendada, el pedido confirmado y el reporte del día — todo automático.
            </p>
            <Link href="/wasapbot/activar">
              <button className="btn-wa" style={{ alignSelf: 'flex-start' }}>Activar mi WasapBot →</button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #141414' }} className="lnd-feat-grid">
          {[
            { n:'01', title:'Bot WhatsApp IA 24/7',     desc:'Responde, agenda y vende por WhatsApp sin que estés pendiente. Aprende tu negocio y habla como tú.' },
            { n:'02', title:'Inventario y stock',        desc:'Control de entradas, salidas y stock mínimo. Alertas automáticas cuando un producto se está agotando.' },
            { n:'03', title:'Pedidos por WhatsApp',     desc:'El cliente pide por chat, el bot confirma, descuenta el inventario y te notifica al instante.' },
            { n:'04', title:'Reportes diarios',          desc:'Cada noche un resumen: ventas del día, citas agendadas, productos más pedidos y clientes nuevos.' },
            { n:'05', title:'Agendamiento automático',  desc:'El bot agenda citas, confirma por WhatsApp y te avisa cuando alguien cancela o no aparece.' },
            { n:'06', title:'Broadcasts masivos',       desc:'Envía promos, recordatorios o novedades a todos tus clientes con un solo clic desde el panel.' },
          ].map((f, i) => (
            <div key={i} className="feat-cell" style={{ padding: '48px 40px', borderRight: i % 3 !== 2 ? '1px solid #141414' : 'none', borderBottom: i < 3 ? '1px solid #141414' : 'none', position: 'relative' }}>
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 88, color: G, opacity: 0.06, position: 'absolute', top: -8, right: 24, lineHeight: 1 }}>{f.n}</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, marginBottom: 14, color: '#E8E8E8', lineHeight: 1.2 }}>{f.title}</h3>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASOS ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1800&q=85" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1) saturate(0.5)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.5) 30%, rgba(8,8,8,0.5) 70%, #080808 100%)' }} />
        <div style={{ position: 'relative', padding: '100px 80px' }} className="lnd-steps-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, flexWrap: 'wrap', gap: 24 }} className="lnd-steps-header">
            <div>
              <span className="label">Proceso</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0 }}>
                Tu bot activo<br />en 10 minutos
              </h2>
            </div>
            <Link href="/wasapbot/activar">
              <button className="btn-wa" style={{ fontSize: 15, padding: '14px 36px' }}>Comenzar ahora →</button>
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#141414' }} className="lnd-steps-grid">
            {[
              { n: '01', title: 'Regístrate', desc: 'Crea tu negocio en 2 minutos. Solo nombre, industria y correo. Sin tarjeta de crédito.' },
              { n: '02', title: 'Configura', desc: 'Agrega tus servicios, precios y horarios. El bot aprende todo sobre tu negocio automáticamente.' },
              { n: '03', title: 'Conecta', desc: 'Vincula tu WhatsApp con QR o código. El bot empieza a responder en menos de 5 minutos.' },
              { n: '04', title: 'Crece', desc: 'Activa tu plan y desbloquea pedidos, inventario, reportes y broadcasts. Crece sin límites.' },
            ].map((step, i) => (
              <div key={i} style={{ background: '#080808', padding: '52px 40px' }}>
                <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 64, color: G, opacity: 0.2, lineHeight: 1, marginBottom: 28 }}>{step.n}</div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, marginBottom: 16, color: '#E8E8E8' }}>{step.title}</h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="precios" style={{ background: BG }}>
        <div style={{ position: 'relative', padding: '100px 80px 72px', overflow: 'hidden' }} className="lnd-planes-header">
          <img src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1600&q=80" alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.08)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <span className="label">Planes y precios</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5.5vw, 80px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0, color: '#F0F0F0' }}>
                Elige tu plan,<br />crece sin límites
              </h2>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', fontSize: 18, maxWidth: 320, lineHeight: 1.8, fontWeight: 300 }}>
              Sin contratos · Sin sorpresas · Cancela cuando quieras
            </p>
          </div>
        </div>
        <div style={{ padding: '0 80px 120px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="lnd-planes-grid">
          {PLANES.map((plan, i) => (
            <div key={i} className="plan-card" style={{
              border: '1px solid #FF6B00',
              borderTop: `3px solid ${G}`,
              padding: '48px 40px', background: '#000',
            }}>
              {plan.popular && <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 20 }}>★ Más popular</div>}
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>{plan.name}</div>
              <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 72, fontWeight: 400, color: '#FF6B00', lineHeight: 1, marginBottom: 4, letterSpacing: -2 }}>
                {plan.price}<sup style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, verticalAlign: 'top', marginTop: 18, fontWeight: 300, opacity: 0.6 }}>€</sup>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 44, letterSpacing: 0.3 }}>EUR / mes · IVA incluido</div>
              <ul style={{ listStyle: 'none', marginBottom: 48 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '11px 0', borderBottom: '1px solid #1A1A1A', fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.55)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 300 }}>
                    <span style={{ color: G, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/wasapbot/activar">
                <button className={plan.popular ? 'btn-wa' : 'btn-ghost-wa'} style={{ width: '100%', textAlign: 'center', fontSize: 14, padding: '14px' }}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=80" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.08)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080808 0%, rgba(8,8,8,0.5) 20%, rgba(8,8,8,0.5) 80%, #080808 100%)' }} />
        <div style={{ position: 'relative', padding: '100px 80px' }} className="lnd-test-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 72, flexWrap: 'wrap', gap: 24 }} className="lnd-test-header">
            <div>
              <span className="label">Testimonios</span>
              <h2 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.0 }}>
                Lo que dicen<br />nuestros clientes
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#141414' }} className="lnd-test-grid">
            {[
              { quote: 'Antes perdíamos clientes por no contestar a tiempo. Ahora el bot responde en segundos, agenda citas solo y me manda el reporte del día. Increíble.', name: 'Ricardo Montoya', role: 'Taller AutoCenter — Madrid', initials: 'RM', color: '#FF6B35' },
              { quote: 'Las reservas de mi peluquería se manejan solas. El bot sabe mis horarios y precios. Ahorro 3 horas diarias que antes gastaba en mensajes de WhatsApp.', name: 'Patricia Guerrero', role: 'Estudio Elegance — Barcelona', initials: 'PG', color: '#FF4D8B' },
              { quote: 'Mis clientes piden el menú por WhatsApp y el bot toma el pedido, descuenta el inventario y me avisa. Ya no pierdo ningún pedido por estar ocupado.', name: 'Andrés López', role: 'Restaurante El Sabor — Valencia', initials: 'AL', color: '#25D366' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#080808', padding: '52px 44px' }}>
                <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 72, color: t.color, opacity: 0.25, lineHeight: 0.8, marginBottom: 28 }}>"</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, marginBottom: 44, fontWeight: 300 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 2, background: t.color + '18', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#E8E8E8' }}>{t.name}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position: 'relative', minHeight: 620, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=90" alt="Ciudad"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 65%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(108deg, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.82) 55%, rgba(8,8,8,0.55) 100%)' }} />
        <div style={{ position: 'relative', padding: '120px 80px' }} className="lnd-cta-inner">
          <span className="label">Comienza hoy</span>
          <h2 className="lnd-cta-h2" style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(52px, 7vw, 100px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-2.5px', marginBottom: 28, maxWidth: 800, color: '#F0F0F0' }}>
            ¿Listo para poner<br />tu negocio en<br /><span style={{ color: G }}>modo automático?</span>
          </h2>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontSize: 20, marginBottom: 60, fontWeight: 300, lineHeight: 1.6, maxWidth: 460 }}>
            Sin contratos · Cancela cuando quieras · Activo en 10 minutos
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} className="lnd-cta-btns">
            <Link href="/wasapbot/activar">
              <button className="btn-wa" style={{ fontSize: 17, padding: '18px 52px' }}>Activar mi WasapBot →</button>
            </Link>
            <a href="https://wa.me/34674421919?text=Quiero%20información%20sobre%20WasapBot" target="_blank" rel="noreferrer">
              <button className="btn-ghost" style={{ fontSize: 17, padding: '18px 52px' }}>Hablar con un asesor</button>
            </a>
          </div>
        </div>
      </section>

                {/* ── BQINZ PARTNERS — programa de comisionistas ── */}
      <section style={{ background: '#0C0C0C', borderTop: '1px solid #1A1A1A', borderBottom: '1px solid #1A1A1A', padding: '56px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 560 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#C89B3C' }}>Programa de comisionistas</span>
            <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 400, color: '#F0F0F0', letterSpacing: '-0.5px', margin: '10px 0 10px', lineHeight: 1.1 }}>
              Gana dinero recomendando negocios
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 300 }}>
              ¿Conoces negocios que podrían necesitar WasapBot? Recomiéndalos y cobra comisión por cada cliente que actives — sin vender, sin dar soporte técnico.
            </p>
          </div>
          <a href="/bqinz-partners.html" style={{ background: '#C89B3C', color: '#1C1B1F', borderRadius: 2, padding: '14px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', display: 'inline-block' }}>
            Conoce BQinz Partners →
          </a>
        </div>
      </section>

        {/* ── BQINZ PARTNERS — programa de comisionistas ── */}
      <section style={{ background: '#0C0C0C', borderTop: '1px solid #1A1A1A', borderBottom: '1px solid #1A1A1A', padding: '56px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 560 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#C89B3C' }}>Programa de comisionistas</span>
            <h3 style={{ fontFamily: "'Abril Fatface', serif", fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 400, color: '#F0F0F0', letterSpacing: '-0.5px', margin: '10px 0 10px', lineHeight: 1.1 }}>
              Gana dinero recomendando negocios
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 300 }}>
              ¿Conoces negocios que podrían necesitar WasapBot? Recomiéndalos y cobra comisión por cada cliente que actives — sin vender, sin dar soporte técnico.
            </p>
          </div>
          <a href="/bqinz-partners.html" style={{ background: '#C89B3C', color: '#1C1B1F', borderRadius: 2, padding: '14px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', display: 'inline-block' }}>
            Conoce BQinz Partners →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#040404', padding: '80px 80px 40px', borderTop: '1px solid #111' }} className="lnd-footer-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: 64, marginBottom: 64 }} className="lnd-footer-grid">
          <div>
            <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 26, color: '#E8E8E8', marginBottom: 20 }}>
              <span style={{color:'#fff'}}>BQinz</span><span style={{ color: '#FF6B00', fontSize: 30 }}>agenc</span><span style={{color:'#fff'}}>IA</span>
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#888', fontSize: 13, lineHeight: 1.8, maxWidth: 300, fontWeight: 300 }}>
          <span>La IA que atiende, agenda y vende por tu negocio. Plataforma de automatización con inteligencia artificial.</span>
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#666', fontSize: 12 }}>Madrid, España</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#666', fontSize: 12 }}>bqinzagencia@gmail.com</span>
            </div>
          </div>
          {[
            { title: 'WasapBot', links: ['Plan Básico', 'Plan Estándar', 'Plan Pro', 'Ver demo'] },
            { title: 'Industrias', links: ['Restaurantes', 'Peluquerías', 'Talleres', 'Veterinarias'] },
            { title: 'Empresa', links: ['Sobre nosotros', 'Soporte', 'Términos', 'Privacidad'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: '#666', marginBottom: 28 }}>{col.title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="/wasapbot/activar" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#777', fontSize: 13, fontWeight: 300, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#ccc'}
                      onMouseLeave={e => e.target.style.color = '#777'}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#555', fontSize: 12 }} className="lnd-footer-copy">
          <span>© 2026 BQinz<span style={{ color: '#FF6B00' }}>agenc</span>IA · Todos los derechos reservados</span>
          <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
            <Link href="/legal/aviso-legal" style={{color:'#666'}}>Aviso Legal</Link>
            <Link href="/legal/privacidad" style={{color:'#666'}}>Privacidad</Link>
            <Link href="/legal/condiciones" style={{color:'#666'}}>Condiciones</Link>
            <Link href="/legal/cookies" style={{color:'#666'}}>Cookies</Link>
          </div>
          <span>Hecho con amor en España 🇪🇸</span>
        </div>
      </footer>

      {/* Botón flotante fijo del simulador demo — esquina inferior IZQUIERDA para no chocar con el chatbot AIA (bottom-right) */}
      {!showDemo && (
        <button onClick={() => setShowDemo(true)} style={{ position:'fixed', bottom:20, left:20, zIndex:9990, background:'linear-gradient(135deg,#25D366,#1aad4e)', color:'#fff', border:'none', borderRadius:99, padding:'13px 20px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 8px 28px rgba(37,211,102,0.45)', display:'flex', alignItems:'center', gap:8 }}>
          💬 Probar demo
        </button>
      )}
    </>
  );
}

export function Logo({ size = 20 }) {
  return (
    <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: size + 2, color: '#E8E8E8' }}>
      <span style={{color:'#fff'}}>BQinz</span><span style={{ color: '#FF6B00', fontSize: size + 5 }}>agenc</span><span style={{color:'#fff'}}>IA</span>
    </div>
  );
}


