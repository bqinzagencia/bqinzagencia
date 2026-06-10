// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import {
  Phone, MessageCircle, CalendarCheck, Bell, CreditCard, BarChart3, Globe
} from 'lucide-react';

// ── Paleta corporativa ───────────────────────────────────────────────────────
const NARANJA        = '#FF6B00';
const NARANJA_GLOW   = 'rgba(255,107,0,0.15)';
const NARANJA_BORDER = 'rgba(255,107,0,0.32)';
const DARK           = '#080B0F';
const CARD           = '#111318';
const CARD2          = '#1A1E26';

// ── Datos ────────────────────────────────────────────────────────────────────
const SERVICIOS = [
  {
    img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop&crop=faces,center&q=90',
    title: 'Centro de Estética',
    desc: 'Agente IA que gestiona citas de facial, depilación y tratamientos mientras tú trabajas con las manos ocupadas.',
    slug: 'estetica',
  },
  {
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&crop=center&q=90',
    title: 'Salón de Belleza',
    desc: 'Reservas automáticas, recordatorios de cita y lista de espera gestionada por IA. Cero llamadas perdidas.',
    slug: 'salon',
  },
  {
    img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&crop=center&q=90',
    title: 'Spa & Masajes',
    desc: 'Agenda inteligente para múltiples cabinas y terapeutas. El cliente reserva en WhatsApp en menos de 30 segundos.',
    slug: 'spa',
  },
  {
    img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop&crop=center&q=90',
    title: 'Clínica Dental',
    desc: 'Confirmaciones automáticas, recaptación de pacientes inactivos y gestión de urgencias con IA de voz.',
    slug: 'dental',
  },
  {
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&crop=center&q=90',
    title: 'Medicina Estética',
    desc: 'Filtrado de pacientes, consentimientos digitales y seguimiento post-tratamiento automatizado.',
    slug: 'medicina-estetica',
  },
];

const FEATURES = [
  { num: '01', Icon: Phone,         title: 'Cero llamadas perdidas',   desc: 'El agente de voz atiende cada llamada que entra aunque estés en cabina. Agenda, informa y cobra señales.', featured: true },
  { num: '02', Icon: MessageCircle, title: 'WhatsApp 24/7',            desc: 'Responde mensajes, envía menú de servicios, confirma citas y cobra anticipos sin que toques el teléfono.' },
  { num: '03', Icon: CalendarCheck, title: 'Agenda sincronizada',      desc: 'Conectada a Google Calendar o Supabase. Sin dobles reservas, sin huecos muertos.' },
  { num: '04', Icon: Bell,          title: 'Recordatorios automáticos',desc: 'El sistema avisa a tus clientes 24h y 1h antes. Los no-shows caen más del 60%.' },
  { num: '05', Icon: CreditCard,    title: 'Cobro de señales',         desc: 'Solicita pago de señal para confirmar la cita. Integrado con Stripe, Bizum o pasarela local.' },
  { num: '06', Icon: BarChart3,     title: 'Panel de control',         desc: 'Ve ocupación, ingresos y clientes recurrentes en tiempo real desde el móvil.' },
  { num: '07', Icon: Globe,         title: 'Web profesional en minutos', desc: 'Genera tu página web completa con IA: diseño, textos, servicios y formulario de contacto. Sin código, sin esperas.', isNew: true },
];

const PLANES = [
  {
    name: 'Starter',
    badge: 'Micropymes y salones',
    price: '89',
    priceAnual: '74',
    features: [
      'Agente WhatsApp IA 24/7',
      'Hasta 500 conversaciones/mes',
      'Recordatorios automáticos de cita',
      'Sincronización Google Calendar',
      'Catálogo de servicios con precios',
      'Cobro de señales vía Bizum',
      'Soporte por email en 48h',
    ],
    nota: 'Bloque extra de 250 conversaciones por solo 10€/mes',
    cta: 'Empezar 7 días gratis',
    popular: false,
    href: '/auth/register?plan=starter',
    ahorro: 'Ahorra 180€/año',
  },
  {
    name: 'Básico',
    badge: '⭐ Más recomendado',
    price: '199',
    priceAnual: '166',
    features: [
      'Todo en Starter',
      'Hasta 1.500 conversaciones/mes',
      '200 min/mes de Agente de Voz IA',
      'Minuto de voz extra: 0,08€/min',
      'Cobro de señales Stripe + Bizum',
      'CRM de clientes completo',
      'Panel analítico en tiempo real',
      'Soporte prioritario en 4h',
    ],
    nota: 'Bloque extra +500 conversaciones por 15€/mes',
    cta: 'Simular llamada en vivo',
    popular: true,
    href: '#demo',
    ahorro: 'Ahorra 396€/año',
  },
  {
    name: 'Pro',
    badge: 'Clínicas y franquicias',
    price: '569',
    priceAnual: '474',
    features: [
      'Todo en Básico',
      'Conversaciones ilimitadas',
      'Minutos de voz ilimitados',
      'Hasta 5 centros en 1 cuenta',
      'Integración Instagram DM',
      'Consentimientos digitales RGPD',
      'Integraciones Holded / FacturaDirecta',
      'Manager de cuenta dedicado',
      'SLA 99,9% garantizado',
    ],
    nota: null,
    cta: 'Contactar con Ventas',
    popular: false,
    href: 'mailto:bqinzagencia@gmail.com?subject=Plan%20Pro%20-%20BQinzagencIA',
    ahorro: 'Ahorra 1.140€/año',
  },
];

const TESTIMONIALS = [
  { quote: 'Antes perdía entre 8 y 12 llamadas al día por estar en cabina. Ahora el agente las atiende todas y llena mi agenda sola. En el primer mes recuperé más de 1.400€.', name: 'Laura Sánchez', role: 'Centro Estético Áurea — Madrid', initials: 'LS', color: '#EC4899' },
  { quote: 'Mis clientas agendan por WhatsApp a las 11 de la noche. El bot les responde al momento, confirma la cita y les pide la señal. Yo me entero por la mañana con todo cerrado.', name: 'Miriam Torres', role: 'Salón Belle — Valencia', initials: 'MT', color: '#F97316' },
  { quote: 'Los no-shows bajaron un 65% en 6 semanas. Los recordatorios automáticos hacen el trabajo que antes me costaba 1 hora de llamadas al día.', name: 'Cristina Romero', role: 'Spa Esencia — Barcelona', initials: 'CR', color: '#8B5CF6' },
];

const INTEGRATIONS = [
  { label: 'WhatsApp Business', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/120px-WhatsApp.svg.png' },
  { label: 'Google Calendar',   img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/120px-Google_Calendar_icon_%282020%29.svg.png' },
  { label: 'Stripe',            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/320px-Stripe_Logo%2C_revised_2016.svg.png' },
  { label: 'Bizum',             img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Bizum_logo.svg/320px-Bizum_logo.svg.png' },
  { label: 'Instagram',         img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/120px-Instagram_icon.png' },
  { label: 'Gmail',             img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/120px-Gmail_icon_%282020%29.svg.png' },
  { label: 'Google Sheets',     img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/120px-Google_Sheets_logo_%282014-2020%29.svg.png' },
  { label: 'Holded',            img: 'https://cdn.holded.com/holded/favicon/apple-touch-icon.png' },
  { label: 'Zapier',            img: 'https://images.ctfassets.net/lzny33ho1g45/4NsLZYJBJ1bEnljXkO0IaC/9d46e7e6d2ed04d56b5e9e82ced4dc0d/zapier-logo.png' },
  { label: 'Twilio',            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Twilio-logo-red.svg/320px-Twilio-logo-red.svg.png' },
  { label: 'Widget Web',        img: 'https://cdn-icons-png.flaticon.com/128/1006/1006363.png' },
  { label: 'Supabase',          img: 'https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png' },
];

// ── Logo SVG corporativo ─────────────────────────────────────────────────────
export function LogoIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" stroke={NARANJA} strokeWidth="2.8" fill="none"
        style={{ filter: `drop-shadow(0 0 7px ${NARANJA})` }} />
      <ellipse cx="32" cy="32" rx="17" ry="8.5" stroke={NARANJA} strokeWidth="1.6" fill="none" transform="rotate(-38 32 32)" />
      <ellipse cx="32" cy="32" rx="17" ry="8.5" stroke={NARANJA} strokeWidth="1.6" fill="none" transform="rotate(38 32 32)" />
      <circle cx="32" cy="15" r="2.2" fill={NARANJA} />
      <line x1="36" y1="21" x2="47" y2="13" stroke={NARANJA} strokeWidth="1.8" strokeLinecap="round" />
      <polyline points="43,11 48,13 46,18" stroke={NARANJA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="22" y="38" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="15" fill="white" letterSpacing="-1">BQ</text>
    </svg>
  );
}

export function Logo({ size = 20 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoIcon size={size + 14} />
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: size, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
        <span style={{ color: '#FFFFFF' }}>BQinz</span>
        <span style={{ color: NARANJA }}>agenc</span>
        <span style={{ color: '#FFFFFF' }}>IA</span>
      </div>
    </div>
  );
}

// ── Botón Google reutilizable ────────────────────────────────────────────────
export function GoogleButton({ onClick, loading, text = 'Continuar con Google' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, background: '#fff', border: '1px solid #dadce0', borderRadius: 100,
        padding: '11px 24px', fontSize: 14, fontWeight: 600, color: '#3c4043',
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'box-shadow 0.2s',
        fontFamily: 'Roboto,sans-serif', letterSpacing: '0.01em', opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.418 14.392 17.64 12 17.64 9.2z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {loading ? 'Conectando...' : text}
    </button>
  );
}

// ── Toggle anual/mensual ────────────────────────────────────────────────────
function PlanesToggle() {
  return null; // placeholder — se implementa con state en el padre
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureModal, setFeatureModal] = useState(null);
  const [anual, setAnual] = useState(false);

  // Detalle extendido de cada función
  const FEATURES_DETAIL = {
    'Cero llamadas perdidas': {
      como: ['El agente de voz contesta en menos de 2 segundos', 'Identifica si es reserva, consulta o urgencia', 'Agenda la cita directamente en tu calendario', 'Cobra señal por teléfono si lo configuras'],
      beneficio: 'Recupera entre 400€ y 1.200€ al mes en citas que antes se perdían.',
      demo: 'tel:+34900000000',
      demoLabel: '📞 Llamar al demo ahora',
    },
    'WhatsApp 24/7': {
      como: ['Responde mensajes a las 3am igual que a las 10am', 'Envía el menú de servicios con precios y fotos', 'Confirma la cita y pide señal por Bizum o Stripe', 'Sin que tú toques el teléfono'],
      beneficio: 'El 68% de los clientes no vuelve a intentarlo si no hay respuesta inmediata.',
      demo: 'https://wa.me/34900000000?text=Hola%2C+quiero+ver+una+demo',
      demoLabel: '💬 Probar demo WhatsApp',
    },
    'Agenda sincronizada': {
      como: ['Conectada a Google Calendar o Supabase en tiempo real', 'Nunca agenda dos citas en el mismo hueco', 'Gestiona múltiples profesionales y cabinas', 'Los huecos liberados se rellenan automáticamente con la lista de espera'],
      beneficio: 'Cero dobles reservas. Cero huecos vacíos innecesarios.',
      demo: '/auth/register',
      demoLabel: '→ Conectar mi agenda gratis',
    },
    'Recordatorios automáticos': {
      como: ['WhatsApp automático 24h antes de la cita', 'Segundo recordatorio 1h antes', 'El cliente confirma o cancela con un mensaje', 'Si cancela, el agente oferta ese hueco a la lista de espera'],
      beneficio: 'Los no-shows caen más del 60% en las primeras 2 semanas.',
      demo: '/auth/register',
      demoLabel: '→ Activar recordatorios gratis',
    },
    'Cobro de señales': {
      como: ['El agente solicita señal para confirmar la cita', 'Link de pago Stripe o número Bizum automático', 'Sin señal, la cita no se confirma en agenda', 'Reembolso automático si cancela con 24h de antelación'],
      beneficio: 'Las cancelaciones de última hora caen un 80% cuando se cobra señal.',
      demo: '/auth/register',
      demoLabel: '→ Configurar cobro de señales',
    },
    'Panel de control': {
      como: ['Dashboard en tiempo real desde el móvil o tablet', 'Ve ocupación del día, semana y mes', 'Ingresos confirmados vs pendientes', 'Clientes más frecuentes y servicios más vendidos'],
      beneficio: 'Toma decisiones con datos reales, no con intuición.',
      demo: '/dashboard',
      demoLabel: '→ Ver mi panel ahora',
    },
  };

  const modalData = featureModal ? FEATURES_DETAIL[featureModal.title] : null;

  return (
    <>
      <Head>
        <title>BQinzagencIA — Tu centro lleno. Cero citas perdidas. Sin tocar el teléfono.</title>
        <meta name="description" content="Tu centro lleno. Cero citas perdidas. Sin tocar el teléfono. Nuestro agente de IA atiende cada llamada y mensaje de WhatsApp mientras tú tienes las manos en el tratamiento. Agenda, confirma, cobra señales y sincroniza todo con tu calendario automáticamente." />
        <meta property="og:title" content="BQinzagencIA — Tu centro lleno. Cero citas perdidas." />
        <meta property="og:description" content="Tu centro lleno. Cero citas perdidas. Sin tocar el teléfono. Nuestro agente de IA atiende cada llamada y mensaje de WhatsApp mientras tú tienes las manos en el tratamiento." />
        <meta property="og:url" content="https://www.bqinzagencia.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BQinzagencIA — Cero citas perdidas para centros de estética" />
        <meta name="twitter:description" content="Tu centro lleno. Cero citas perdidas. Sin tocar el teléfono. IA que atiende llamadas y WhatsApp 24/7 para centros de estética en España." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* ── FAVICON ── coloca el logo circular en /public/logo.png ── */}
        <link rel="icon"             type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon"             type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon"                               href="/logo.png" />
        <meta name="msapplication-TileImage"                    content="/logo.png" />
      </Head>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="nav-inner" style={{ padding: '14px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={20} />

          <div className="nav-links-desktop">
            {['Servicios','Funciones','Precios','Cómo funciona'].map(item => (
              <a key={item} href={'#' + item.toLowerCase().replace(/\s/g,'-')} onClick={() => setMenuOpen(false)}
                style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#FAFAF8'}
                onMouseLeave={e => e.target.style.color = '#9CA3AF'}
              >{item}</a>
            ))}
          </div>

          <div className="nav-cta-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <Link href="/dashboard" style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '9px 22px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Ir al panel →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">Ingresar</Link>
                <Link href="/auth/register" style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '9px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>

          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background: 'rgba(8,11,15,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Servicios','Funciones','Precios','Cómo funciona'].map(item => (
              <a key={item} href={'#' + item.toLowerCase().replace(/\s/g,'-')} onClick={() => setMenuOpen(false)}
                style={{ color: '#D1D5DB', fontSize: 16, fontWeight: 500, padding: '12px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                {item}
              </a>
            ))}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '12px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                  Ir al panel →
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Ingresar</Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                    style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '12px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                    Comenzar gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '100vh', marginTop: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>

        <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1920&q=90" alt="Belleza profesional"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '65% center', transform: 'scale(1.0)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(8,11,15,0.92) 0%,rgba(8,11,15,0.65) 50%,rgba(8,11,15,0.25) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 50% 60% at 12% 60%, ${NARANJA_GLOW} 0%, transparent 65%)` }} />

        <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: 1200 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: NARANJA_GLOW, border: `1px solid ${NARANJA_BORDER}`, color: NARANJA, padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, background: NARANJA, borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            IA especializada en centros de estética y belleza · España
          </div>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(34px,6vw,82px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-2px', maxWidth: 860, marginBottom: 22, color: '#FAFAF8' }}>
            Tu centro lleno.<br />
            <span style={{ color: NARANJA }}>Cero citas perdidas.</span><br />
            Sin tocar el teléfono.
          </h1>

          <p style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(255,255,255,0.75)', maxWidth: 560, marginBottom: 36, lineHeight: 1.7 }}>
            Nuestro agente de IA atiende cada llamada y mensaje de WhatsApp mientras tú tienes las manos en el tratamiento. Agenda, confirma, cobra señales y sincroniza todo con tu calendario automáticamente.
          </p>

          <div className="hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <Link href="/auth/register"
              style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 0 28px ${NARANJA_GLOW}` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.66A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
              Simular llamada en vivo
            </Link>
            <a href="#funciones" className="btn btn-ghost btn-lg" style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 16 }}>
              Ver demostración →
            </a>
          </div>

          <div className="hero-stats">
            {[
              { valor: '-65%', label: 'menos no-shows' },
              { valor: '24/7', label: 'atención automática' },
              { valor: '+38%', label: 'citas recuperadas' },
              { valor: '< 30s', label: 'para agendar en WhatsApp' },
            ].map((s, i) => (
              <div key={i}>
                <div className="hero-stat-val" style={{ fontFamily: 'Syne,sans-serif', fontSize: 30, fontWeight: 800, color: NARANJA, lineHeight: 1 }}>{s.valor}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.22))' }} />
          scroll
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', background: DARK }}>
        <div style={{ display: 'flex', gap: 52, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap' }}>
          {['Citas automáticas','WhatsApp IA 24/7','Cero llamadas perdidas','Cobro de señales','Recordatorios automáticos','Agenda sincronizada','Voz IA para llamadas','Menos no-shows','Clientes recurrentes','Panel en tiempo real']
            .flatMap(t => [t, t])
            .map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#FAFAF8', fontSize: 13, fontWeight: 600, flexShrink: 0, letterSpacing: 0.5 }}>
                <span style={{ width: 4, height: 4, background: NARANJA, borderRadius: '50%', display: 'inline-block' }} />{t}
              </span>
            ))}
        </div>
      </div>

      {/* ── PROBLEMA ── */}
      <section className="section-pad" style={{ background: CARD, textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:20 }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#FFFFFF' }}>BQinz</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:NARANJA }}>agenc</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#FFFFFF' }}>IA</span>
          </div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.15 }}>
            ¿Cuántas citas pierdes al día<br />por no coger el teléfono?
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
            Cada llamada sin contestar son entre <strong style={{ color: '#FAFAF8' }}>40€ y 120€</strong> que se van a la competencia. Con BQinzagencIA, tu centro nunca vuelve a perder una cita.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, maxWidth: 640, margin: '0 auto' }}>
            {[
              { n: '68%',  txt: 'de clientes no deja mensaje si no contestan' },
              { n: '3.2x', txt: 'más reservas con respuesta inmediata en WhatsApp' },
              { n: '8–12', txt: 'llamadas perdidas al día en un centro mediano' },
            ].map((item, i) => (
              <div key={i} style={{ background: DARK, border: `1px solid ${NARANJA_BORDER}`, borderRadius: 16, padding: '24px 16px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: NARANJA, marginBottom: 8 }}>{item.n}</div>
                <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5 }}>{item.txt}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS — iconos Lucide ── */}
      <section id="servicios" className="section-pad">
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Especialidades</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Diseñado para tu tipo de centro</h2>
        <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 520, lineHeight: 1.6, marginBottom: 48 }}>Flujos de IA preconfigurados para cada especialidad. Listo en menos de 24 horas.</p>

        <div className="servicios-row1">
          {SERVICIOS.slice(0,3).map(({ img, title, desc, slug }, i) => (
            <Link key={i} href={'/especialidades/' + slug} className="servicio-card">
              <img src={img} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,11,15,0.05) 0%, rgba(8,11,15,0.5) 45%, rgba(8,11,15,0.93) 100%)' }} />
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span style={{ background: 'rgba(255,107,0,0.18)', backdropFilter: 'blur(8px)', color: NARANJA, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, border: `1px solid ${NARANJA_BORDER}` }}>IA especializada</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 6, color: '#FAFAF8' }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{desc}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: NARANJA, color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 100 }}>Ver demo →</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="servicios-row2">
          {SERVICIOS.slice(3).map(({ img, title, desc, slug }, i) => (
            <Link key={i} href={'/especialidades/' + slug} className="servicio-card">
              <img src={img} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,11,15,0.05) 0%, rgba(8,11,15,0.5) 45%, rgba(8,11,15,0.93) 100%)' }} />
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span style={{ background: 'rgba(255,107,0,0.18)', backdropFilter: 'blur(8px)', color: NARANJA, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, border: `1px solid ${NARANJA_BORDER}` }}>IA especializada</span>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 6, color: '#FAFAF8' }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{desc}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: NARANJA, color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 100 }}>Ver demo →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES — iconos Lucide ── */}
      <section id="funciones" className="section-pad" style={{ background: CARD }}>
        <div className="features-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 20 }}>
          <div>
            <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Funcionalidades</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px' }}>Todo lo que necesita<br />tu centro, automatizado</h2>
          </div>
          <Link href="/auth/register" style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '11px 26px', fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            Ver planes →
          </Link>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {FEATURES.map(({ num, Icon, title, desc, featured, isNew }, i) => (
            isNew ? (
              <Link key={i} href="/generar-web"
                style={{
                  background: 'linear-gradient(135deg, #0D1A0D 0%, #0A1A10 100%)',
                  border: `1px solid rgba(34,197,94,0.35)`,
                  borderRadius: 16, padding: 26,
                  transition: 'all 0.25s', textDecoration: 'none', color: 'inherit', display: 'block',
                  boxShadow: '0 0 24px rgba(34,197,94,0.08)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.08)'; }}
              >
                <div style={{ position: 'absolute', top: 14, right: 14, background: '#22C55E', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: 1, textTransform: 'uppercase' }}>NUEVO</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#22C55E', marginBottom: 16, textTransform: 'uppercase', opacity: 0.7 }}>{num} — NUEVA FUNCIÓN</div>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color="#22C55E" strokeWidth={1.7} />
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#FAFAF8' }}>{title}</div>
                <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>{desc}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#22C55E', fontSize: 13, fontWeight: 700 }}>Generar mi web →</span>
              </Link>
            ) : (
            <div key={i} style={{
              background: featured ? NARANJA : DARK,
              border: `1px solid ${featured ? NARANJA : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 16, padding: 26, transition: 'all 0.25s',
              color: featured ? '#fff' : 'inherit',
              cursor: 'pointer',
            }}
              onClick={() => setFeatureModal({ title, desc, Icon, featured })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = featured ? NARANJA : NARANJA_BORDER; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${featured ? 'rgba(255,107,0,0.3)' : NARANJA_GLOW}`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = featured ? NARANJA : 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: featured ? 'rgba(255,255,255,0.55)' : '#6B7280', marginBottom: 16, textTransform: 'uppercase' }}>
                {num} — {featured ? 'CLAVE' : 'FUNCIÓN'}
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: featured ? 'rgba(255,255,255,0.2)' : NARANJA_GLOW, border: `1px solid ${featured ? 'rgba(255,255,255,0.3)' : NARANJA_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} color={featured ? '#fff' : NARANJA} strokeWidth={1.7} />
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: featured ? 'rgba(255,255,255,0.8)' : '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>{desc}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: featured ? 'rgba(255,255,255,0.7)' : NARANJA, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                Ver cómo funciona
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
            )
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" className="section-pad" style={{ textAlign: 'center' }}>
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Pruébalo ahora</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>Simula una llamada en vivo</h2>
        <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Llama ahora mismo a nuestro número de demo y experimenta cómo tu agente IA atiende a tus clientes.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register"
            style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '16px 40px', fontSize: 17, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: `0 0 32px ${NARANJA_GLOW}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.66A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
            Llamar al demo ahora
          </Link>
          <Link href="/auth/register"
            style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '16px 40px', fontSize: 17, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Demo por WhatsApp
          </Link>
        </div>
        <p style={{ color: '#4B5563', fontSize: 13, marginTop: 20 }}>Crea tu cuenta gratis · Sin tarjeta · Activo en 24h</p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cómo-funciona" className="section-pad" style={{ background: CARD }}>
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Proceso</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 48 }}>Tu centro automatizado en 4 pasos</h2>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 28 }}>
          {[
            { n: 1, img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=80&h=80&fit=crop&crop=center&q=80', title: 'Regístrate', desc: 'Crea tu cuenta en 2 minutos. Sin tarjeta. 7 días gratis.' },
            { n: 2, img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop&crop=center&q=80', title: 'Configura tu centro', desc: 'Añade servicios, precios y horarios. La IA los aprende al instante.' },
            { n: 3, img: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=80&h=80&fit=crop&crop=center&q=80', title: 'Conecta tus canales', desc: 'WhatsApp Business y tu número de teléfono en minutos.' },
            { n: 4, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=80&fit=crop&crop=center&q=80', title: 'Tu centro en automático', desc: 'El agente empieza a gestionar citas. Tú solo revisas el panel.' },
          ].map(step => (
            <div key={step.n} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: CARD2, border: `2px solid ${NARANJA_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: NARANJA, margin: '0 auto 14px' }}>{step.n}</div>
              <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', margin: '0 auto 12px', border: `1px solid rgba(255,255,255,0.08)` }}>
                <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{step.title}</div>
              <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANES ACTUALIZADOS ── */}
      <section id="precios" className="section-pad">
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Precios</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 8 }}>Recupera el coste en la primera semana</h2>
      <p style={{ color: '#9CA3AF', fontSize: 17, marginBottom: 12 }}>Sin permanencia. Sin sorpresas. Cancela cuando quieras.</p>

        {/* Toggle mensual/anual */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:48, flexWrap:'wrap' }}>
          <span style={{ fontSize:14, color: anual ? '#6B7280' : '#FAFAF8', fontWeight:600 }}>Mensual</span>
          <button onClick={() => setAnual(a => !a)}
            style={{ width:52, height:28, borderRadius:100, background: anual ? NARANJA : '#1A1E26', border:`2px solid ${anual ? NARANJA : 'rgba(255,255,255,0.15)'}`, cursor:'pointer', position:'relative', transition:'all 0.25s', flexShrink:0 }}>
            <span style={{ position:'absolute', top:3, left: anual ? 26 : 4, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.25s', display:'block' }} />
          </button>
          <span style={{ fontSize:14, color: anual ? '#FAFAF8' : '#6B7280', fontWeight:600 }}>Anual</span>
          {anual && <span style={{ background:'rgba(255,107,0,0.15)', color:NARANJA, border:`1px solid rgba(255,107,0,0.3)`, borderRadius:100, fontSize:12, fontWeight:700, padding:'3px 12px' }}>Ahorra hasta 20% 🎉</span>}
        </div>

        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, alignItems: 'start' }}>
          {PLANES.map((plan, i) => (
            <div key={i} style={{
              border: `1px solid ${plan.popular ? NARANJA : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 22, padding: '36px 30px', position: 'relative',
              background: plan.popular ? '#1C1410' : CARD,
              boxShadow: plan.popular ? `0 0 40px ${NARANJA_GLOW}` : 'none',
            }}>
              {/* Badge */}
              <div style={{ display: 'inline-block', background: plan.popular ? NARANJA : 'rgba(255,255,255,0.06)', color: plan.popular ? '#fff' : '#9CA3AF', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, marginBottom: 20, letterSpacing: 0.5 }}>
                {plan.badge}
              </div>

              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: plan.popular ? NARANJA : '#fff', marginBottom: 12 }}>
                {plan.name}
              </div>

              {/* Precio */}
              {plan.price ? (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-3px' }}>
                    <sup style={{ fontSize: 22, verticalAlign: 'top', marginTop: 10, fontWeight: 700 }}>€</sup>
                    {anual && plan.priceAnual ? plan.priceAnual : plan.price}
                  </span>
                  <span style={{ color: '#6B7280', fontSize: 15, marginLeft: 6 }}>/mes</span>
                  {anual && plan.ahorro && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ background: 'rgba(255,107,0,0.1)', color: NARANJA, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 100, border: `1px solid rgba(255,107,0,0.25)` }}>
                        {plan.ahorro}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: NARANJA, marginBottom: 8 }}>
                  Personalizado
                </div>
              )}
              <div style={{ color: '#4B5563', fontSize: 12, marginBottom: 28 }}>IVA no incluido · Sin permanencia</div>

              <ul style={{ listStyle: 'none', marginBottom: 32 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#D1D5DB', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: NARANJA, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <a href={plan.href}
                style={{
                  display: 'block', textAlign: 'center', borderRadius: 100, padding: '14px 24px',
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  background: plan.popular ? NARANJA : 'transparent',
                  color: plan.popular ? '#fff' : '#9CA3AF',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: plan.popular ? `0 0 24px ${NARANJA_GLOW}` : 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section-pad" style={{ background: CARD }}>
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Testimonios</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 48 }}>Centros que ya no pierden citas</h2>
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 26 }}>
              <div style={{ color: NARANJA, fontSize: 14, marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 22, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color + '22', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, border: `1px solid ${t.color}44` }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEGRACIONES ── */}
      <section className="section-pad" style={{ textAlign: 'center' }}>
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Integraciones</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 48 }}>Conecta con las herramientas que ya usas</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {INTEGRATIONS.map((int, i) => (
            <div key={i}
              style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = NARANJA_BORDER; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <img src={int.img} alt={int.label} style={{ width: 18, height: 18, objectFit: 'contain', display: 'block', borderRadius: 3 }} />
              {int.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-section">
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${NARANJA_GLOW}, transparent)`, pointerEvents: 'none' }} />
        <p style={{ color: NARANJA, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, position: 'relative' }}>Empieza hoy</p>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(30px,5vw,64px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20, position: 'relative' }}>
          ¿Tu centro listo para<br /><span style={{ color: NARANJA }}>no perder ni una cita más?</span>
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 'clamp(15px,2vw,18px)', marginBottom: 40, position: 'relative' }}>
          7 días gratis · Sin tarjeta de crédito · Activo en menos de 24h
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link href="/auth/register"
            style={{ background: NARANJA, color: '#fff', borderRadius: 100, padding: '15px 36px', fontSize: 17, fontWeight: 800, textDecoration: 'none', boxShadow: `0 0 32px ${NARANJA_GLOW}` }}>
            Activar mi agente IA gratis →
          </Link>
          <a href="#demo" className="btn btn-ghost btn-lg">Ver demostración</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-grid">
        <div className="footer-brand">
          <Logo size={18} />
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, maxWidth: 260, marginTop: 14 }}>
            IA especializada en centros de estética y belleza en España. Cero citas perdidas.
          </p>
          <p style={{ marginTop: 14, color: '#3A4150', fontSize: 12 }}>
            📍 España · bqinzagencia@gmail.com · +34 674 421 919
          </p>
        </div>
        {[
          { title: 'Producto',       links: ['Funciones','Precios','Integraciones','API','Changelog'] },
          { title: 'Especialidades', links: ['Estética','Salones de belleza','Spas','Clínicas dentales','Medicina estética'] },
          { title: 'Empresa',        links: ['Sobre nosotros','Blog','Casos de éxito','Términos','Privacidad'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#3A4150', marginBottom: 16 }}>{col.title}</h4>
            <ul style={{ listStyle: 'none' }}>
              {col.links.map((link, j) => (
                <li key={j} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: '#6B7280', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = NARANJA}
                    onMouseLeave={e => e.target.style.color = '#6B7280'}
                  >{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>

      {/* ── BLOQUE RGPD ── */}
      <div style={{ background: '#0A0D12', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 24 }}>
          {[
            { icon: '🔒', title: 'Cumplimiento RGPD', desc: 'Operamos bajo el Reglamento General de Protección de Datos (RGPD) de la UE. Todos los datos de tus clientes son tratados con el máximo nivel de privacidad y seguridad.' },
            { icon: '🇪🇺', title: 'Servidores en Europa', desc: 'Todos los datos se almacenan exclusivamente en servidores europeos certificados. Ningún dato sale del territorio de la UE sin tu consentimiento expreso.' },
            { icon: '🛡️', title: 'Cifrado extremo a extremo', desc: 'Las comunicaciones entre tu negocio, tus clientes y nuestra plataforma están cifradas con TLS 1.3 y AES-256. Nadie más puede acceder a tu información.' },
            { icon: '📄', title: 'Derecho al olvido', desc: 'Tus clientes pueden solicitar la eliminación de sus datos en cualquier momento. Cumplimos con el Art. 17 del RGPD sin burocracia ni demoras.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#FAFAF8', marginBottom: 5 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1100, margin: '20px auto 0', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#3A4150' }}>BQinzagencIA · Plataforma certificada ·</span>
          <a href="/privacidad" style={{ fontSize: 11, color: '#4B5563', textDecoration: 'none' }}>Política de Privacidad</a>
          <span style={{ color: '#2A2E38', fontSize: 11 }}>|</span>
          <a href="/terminos" style={{ fontSize: 11, color: '#4B5563', textDecoration: 'none' }}>Términos de Servicio</a>
          <span style={{ color: '#2A2E38', fontSize: 11 }}>|</span>
          <a href="/cookies" style={{ fontSize: 11, color: '#4B5563', textDecoration: 'none' }}>Política de Cookies</a>
          <span style={{ color: '#2A2E38', fontSize: 11 }}>|</span>
          <a href="/aviso-legal" style={{ fontSize: 11, color: '#4B5563', textDecoration: 'none' }}>Aviso Legal</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 BQinzagencIA · Todos los derechos reservados</span>
        <span>Hecho con ❤️ en España 🇪🇸</span>
      </div>

      <style>{`
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* MODAL FUNCIONES */}
      {featureModal && modalData && (
        <div onClick={() => setFeatureModal(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9990, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111318', border:`1px solid ${NARANJA_BORDER}`, borderRadius:24, padding:'36px 32px', maxWidth:520, width:'100%', position:'relative', boxShadow:`0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px ${NARANJA_BORDER}` }}>
            <button onClick={() => setFeatureModal(null)}
              style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.06)', border:'none', color:'#9CA3AF', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

            {/* Icono */}
            <div style={{ width:52, height:52, borderRadius:14, background: featureModal.featured ? NARANJA_GLOW : NARANJA_GLOW, border:`1px solid ${NARANJA_BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:`0 4px 20px ${NARANJA_GLOW}` }}>
              <featureModal.Icon size={24} color={NARANJA} strokeWidth={1.7}/>
            </div>

            <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:NARANJA+'90', textTransform:'uppercase', marginBottom:8 }}>Funcionalidad incluida</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:12, color:'#FAFAF8' }}>{featureModal.title}</h3>
            <p style={{ fontSize:15, color:'#9CA3AF', lineHeight:1.7, marginBottom:24 }}>{featureModal.desc}</p>

            {/* Cómo funciona */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 18px', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:NARANJA, marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>Cómo funciona</div>
              {modalData.como.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:9, fontSize:13, color:'#D1D5DB' }}>
                  <span style={{ width:18, height:18, borderRadius:'50%', background:NARANJA_GLOW, border:`1px solid ${NARANJA_BORDER}`, color:NARANJA, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            {/* Beneficio */}
            <div style={{ background:`linear-gradient(135deg, ${NARANJA_GLOW}, transparent)`, border:`1px solid ${NARANJA_BORDER}`, borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'flex-start', gap:10 }}>
              <span style={{ fontSize:16 }}>💡</span>
              <span style={{ fontSize:13, color:'#FAFAF8', fontWeight:600, lineHeight:1.55 }}>{modalData.beneficio}</span>
            </div>

            {/* Botones */}
            <div style={{ display:'flex', gap:10 }}>
              <a href={modalData.demo}
                style={{ flex:1, background:NARANJA, color:'#fff', borderRadius:12, fontWeight:700, fontSize:14, padding:'12px', textDecoration:'none', textAlign:'center', display:'block' }}>
                {modalData.demoLabel}
              </a>
              <button onClick={() => setFeatureModal(null)}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9CA3AF', borderRadius:12, padding:'12px 16px', fontSize:14, cursor:'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
