// pages/wasapbot/index.js
// Landing page del producto WasapBot — bqinzagencia.com/wasapbot
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

const WA      = '#25D366';
const WA_DARK = '#128C7E';
const WA_GLOW = 'rgba(37,211,102,0.12)';
const WA_BOR  = 'rgba(37,211,102,0.28)';
const NARANJA = '#FF6B00';
const DARK    = '#080B0F';
const CARD    = '#111318';
const CARD2   = '#1A1E26';

const TIPOS_NEGOCIO = [
  { id:'estetica',          emoji:'💆', label:'Centro de Estética' },
  { id:'salon',             emoji:'✂️', label:'Salón de Belleza' },
  { id:'spa',               emoji:'🧖', label:'Spa & Masajes' },
  { id:'dental',            emoji:'🦷', label:'Clínica Dental' },
  { id:'medicina-estetica', emoji:'💉', label:'Medicina Estética' },
  { id:'restaurante',       emoji:'🍽️', label:'Restaurante / Café' },
  { id:'clinica',           emoji:'🏥', label:'Clínica / Salud' },
  { id:'gimnasio',          emoji:'🏋️', label:'Gimnasio / Fitness' },
  { id:'inmobiliaria',      emoji:'🏠', label:'Inmobiliaria' },
  { id:'tienda',            emoji:'🛒', label:'Tienda / Comercio' },
  { id:'veterinaria',       emoji:'🐾', label:'Veterinaria' },
  { id:'otro',              emoji:'🏢', label:'Otro negocio' },
];

function WaIcon({ size = 20, color = WA }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WasapBotLanding() {
  const { user } = useAuth();
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [configurando, setConfigurando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');

  async function activar() {
    if (!tipo || !nombre || !telefono) { setError('Rellena todos los campos obligatorios'); return; }
    setError('');
    setConfigurando(true);
    try {
      // Si tiene cuenta, configurar directamente
      if (user) {
        const res = await fetch('/api/wasapbot-configurar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empresaId: user.uid, botTipo: tipo, nombreEmpresa: nombre, descripcion, telefono }),
        });
        if (res.ok) { setListo(true); setPaso(3); }
        else setError('Error al configurar. Inténtalo de nuevo.');
      } else {
        // Sin cuenta → guardar en localStorage y redirigir a registro
        localStorage.setItem('wasapbot_pendiente', JSON.stringify({ tipo, nombre, descripcion, telefono }));
        window.location.href = `/auth/register?from=wasapbot&tipo=${tipo}&nombre=${encodeURIComponent(nombre)}`;
      }
    } catch { setError('Error de conexión. Inténtalo de nuevo.'); }
    setConfigurando(false);
  }

  return (
    <>
      <Head>
        <title>WasapBot — Automatiza tu WhatsApp con IA | BQinzagencIA</title>
        <meta name="description" content="Conecta tu WhatsApp y deja que la IA atienda, informe y reserve citas automáticamente. Activo en menos de 5 minutos." />
        <link rel="icon" href="/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ fontFamily:"'DM Sans',sans-serif", background: DARK, color: '#FAFAF8', minHeight: '100vh' }}>

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#FAFAF8', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#fff' }}>BQinz</span><span style={{ color: NARANJA }}>agenc</span><span style={{ color: '#fff' }}>IA</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: WA_GLOW, border: `1px solid ${WA_BOR}`, borderRadius: 100, padding: '5px 14px' }}>
            <WaIcon size={14} />
            <span style={{ color: WA, fontSize: 13, fontWeight: 700 }}>WasapBot</span>
          </div>
          {user
            ? <Link href="/wasapbot/panel" style={{ background: WA, color: '#fff', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Mi panel →</Link>
            : <Link href="/auth/login" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Iniciar sesión</Link>
          }
        </nav>

        {/* HERO */}
        <section style={{ padding: 'clamp(60px,8vh,120px) 40px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,211,102,0.07), transparent)`, pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: WA_GLOW, border: `1px solid ${WA_BOR}`, borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, background: WA, borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: WA, fontSize: 13, fontWeight: 700 }}>Tu WhatsApp activo 24/7 con IA</span>
          </div>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 20 }}>
            Tu WhatsApp responde solo.<br />
            <span style={{ color: WA }}>Tú descansas.</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#9CA3AF', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.65 }}>
            Conecta tu número de WhatsApp y nuestra IA atenderá a tus clientes, informará sobre tus servicios y reservará citas — adaptada exactamente a tu tipo de negocio.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 52 }}>
            {[
              { n: '< 5 min', label: 'Para activarlo' },
              { n: '24/7', label: 'Siempre disponible' },
              { n: '0€', label: 'Para empezar' },
              { n: '200+', label: 'Negocios activos' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: WA, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { document.getElementById('activar').scrollIntoView({ behavior: 'smooth' }); }}
            style={{ background: WA, color: '#fff', border: 'none', borderRadius: 100, padding: '16px 44px', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 32px rgba(37,211,102,0.4)`, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <WaIcon size={18} color="#fff" />
            Activar mi WasapBot
          </button>
          <p style={{ fontSize: 12, color: '#4B5563', marginTop: 14 }}>Sin tarjeta · Activo en minutos</p>
        </section>

        {/* BENEFICIOS */}
        <section style={{ padding: '80px 40px', background: '#0D1117' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: '🤖', title: 'Responde como humano', desc: 'La IA lee el contexto de tu negocio, aprende tus servicios y responde de forma natural y personalizada.' },
              { icon: '📅', title: 'Agenda citas automáticamente', desc: 'Detecta cuando un cliente quiere reservar, recoge sus datos y confirma la cita sin que toques el móvil.' },
              { icon: '💰', title: 'Cobra señales por Bizum', desc: 'Pide un anticipo para confirmar la cita. Las cancelaciones de última hora desaparecen.' },
              { icon: '⚡', title: 'Respuesta en 2 segundos', desc: 'Nunca más un cliente sin respuesta. El bot contesta al instante, día y noche, festivos incluidos.' },
              { icon: '🧠', title: 'Aprende tu negocio', desc: 'Le cuentas tu catálogo, precios y horarios una sola vez. A partir de ahí responde todo correctamente.' },
              { icon: '👁️', title: 'Tú decides cuándo intervenir', desc: 'Ves todas las conversaciones en tiempo real y puedes tomar el control cuando quieras.' },
            ].map((b, i) => (
              <div key={i} style={{ background: CARD, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 22px', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = WA_BOR; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{b.icon}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TIPOS DE NEGOCIO */}
        <section style={{ padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ color: WA, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Compatible con</p>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,40px)', letterSpacing: '-1.5px', marginBottom: 12 }}>
            Adaptado a tu tipo de negocio
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 16, maxWidth: 480, margin: '0 auto 44px' }}>
            El bot se autoprograma con el lenguaje, servicios y flujo específico de tu sector.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 800, margin: '0 auto' }}>
            {TIPOS_NEGOCIO.map(t => (
              <div key={t.id} style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '8px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
                <span>{t.emoji}</span><span>{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section style={{ padding: '80px 40px', background: '#0D1117' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,40px)', letterSpacing: '-1.5px' }}>
              Activo en 4 pasos
            </h2>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
            {[
              { n: '01', icon: '🏢', title: 'Describe tu negocio', desc: 'Dinos qué tipo de negocio tienes y añade tus servicios y precios.' },
              { n: '02', icon: '🤖', title: 'La IA se autoprograma', desc: 'En segundos generamos el prompt perfecto para tu sector y negocio.' },
              { n: '03', icon: '📱', title: 'Conecta tu número', desc: 'Enlaza tu WhatsApp Business siguiendo las instrucciones. Sin apps extra.' },
              { n: '04', icon: '🚀', title: 'Empieza a responder', desc: 'Tu bot ya está activo. Monitoriza todo desde tu panel en tiempo real.' },
            ].map((s, i) => (
              <div key={i} style={{ background: CARD, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 11, color: WA, letterSpacing: 2, marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRECIO */}
        <section style={{ padding: '80px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,40px)', letterSpacing: '-1.5px', marginBottom: 40 }}>
            Un precio simple y honesto
          </h2>
          <div style={{ display: 'inline-block', background: CARD, border: `2px solid ${WA_BOR}`, borderRadius: 24, padding: '36px 44px', maxWidth: 420, width: '100%', textAlign: 'left', boxShadow: `0 20px 60px rgba(37,211,102,0.12)` }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: WA_GLOW, border: `1px solid ${WA_BOR}`, color: WA, padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              ⭐ Más popular
            </div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 40, marginBottom: 4 }}>
              49<span style={{ fontSize: 20, color: '#9CA3AF' }}>€/mes</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>IVA no incluido · Sin permanencia · Cancela cuando quieras</div>
            {[
              'Agente IA personalizado para tu negocio',
              'Hasta 1.000 conversaciones/mes',
              'Respuesta automática 24/7',
              'Agenda de citas automática',
              'Panel de conversaciones en tiempo real',
              'Actualizaciones del bot incluidas',
              'Soporte por WhatsApp',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: '#D1D5DB' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: WA_GLOW, border: `1px solid ${WA_BOR}`, color: WA, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
                {f}
              </div>
            ))}
            <button onClick={() => document.getElementById('activar').scrollIntoView({ behavior: 'smooth' })}
              style={{ width: '100%', background: WA, color: '#fff', border: 'none', borderRadius: 100, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 24, boxShadow: `0 8px 24px rgba(37,211,102,0.35)` }}>
              Activar ahora →
            </button>
            <p style={{ fontSize: 11, color: '#4B5563', textAlign: 'center', marginTop: 10 }}>Sin tarjeta de crédito requerida</p>
          </div>
        </section>

        {/* FORMULARIO DE ACTIVACIÓN */}
        <section id="activar" style={{ padding: '80px 40px 120px', background: '#0D1117' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-1.5px', marginBottom: 12 }}>
                Activa tu <span style={{ color: WA }}>WasapBot</span> ahora
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: 16 }}>3 pasos · Sin tarjeta · Sin permanencia</p>
            </div>

            {/* Stepper visual */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
              {[{ n: 1, l: 'Negocio' }, { n: 2, l: 'Datos' }, { n: 3, l: '¡Listo!' }].map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: paso > s.n ? WA : paso === s.n ? WA : CARD2, border: `2px solid ${paso >= s.n ? WA : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                      {paso > s.n ? '✓' : s.n}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: paso >= s.n ? '#FAFAF8' : '#4B5563' }}>{s.l}</span>
                  </div>
                  {i < 2 && <div style={{ width: 60, height: 2, background: paso > s.n ? WA : 'rgba(255,255,255,0.07)', margin: '0 4px', marginBottom: 18 }} />}
                </div>
              ))}
            </div>

            {/* Paso 1 — Tipo de negocio */}
            {paso === 1 && (
              <div style={{ background: CARD, border: `1px solid ${WA_BOR}`, borderRadius: 20, padding: '28px 24px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 8, color: WA }}>¿Qué tipo de negocio tienes?</h3>
                <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 22 }}>El bot se autoprograma según tu sector. Elige el que mejor te describe.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {TIPOS_NEGOCIO.map(t => (
                    <button key={t.id} onClick={() => setTipo(t.id)}
                      style={{ background: tipo === t.id ? WA_GLOW : CARD2, border: `1.5px solid ${tipo === t.id ? WA : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '12px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', color: 'inherit' }}
                      onMouseEnter={e => { if (tipo !== t.id) e.currentTarget.style.borderColor = WA_BOR; }}
                      onMouseLeave={e => { if (tipo !== t.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{t.emoji}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: tipo === t.id ? WA : '#D1D5DB', lineHeight: 1.3 }}>{t.label}</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => tipo && setPaso(2)} disabled={!tipo}
                  style={{ width: '100%', background: tipo ? WA : CARD2, color: '#fff', border: 'none', borderRadius: 100, padding: '14px', fontSize: 15, fontWeight: 800, cursor: tipo ? 'pointer' : 'not-allowed', opacity: tipo ? 1 : 0.4, boxShadow: tipo ? `0 8px 24px rgba(37,211,102,0.3)` : 'none' }}>
                  Continuar →
                </button>
              </div>
            )}

            {/* Paso 2 — Datos del negocio */}
            {paso === 2 && (
              <div style={{ background: CARD, border: `1px solid ${WA_BOR}`, borderRadius: 20, padding: '28px 24px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 8, color: WA }}>Cuéntanos sobre tu negocio</h3>
                <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 22 }}>Con esta info la IA aprende a responder exactamente como tú lo harías.</p>

                {[
                  { label: 'Nombre del negocio *', campo: 'nombre', val: nombre, fn: setNombre, ph: 'Ej: Centro Estético Lumina' },
                  { label: 'Tu número de WhatsApp *', campo: 'telefono', val: telefono, fn: setTelefono, ph: '+34 600 000 000' },
                ].map(f => (
                  <div key={f.campo} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.fn(e.target.value)} placeholder={f.ph}
                      style={{ width: '100%', background: CARD2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#FAFAF8', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = WA}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                ))}

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ¿Qué hace tu negocio? (servicios, precios...)
                  </label>
                  <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}
                    placeholder={`Ej: Ofrecemos limpiezas faciales (45€), depilación láser (desde 30€), tratamientos antiedad (80€). Horario: L-S 9-20h. Ciudad: Madrid.`}
                    style={{ width: '100%', background: CARD2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#FAFAF8', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = WA}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  <p style={{ fontSize: 11, color: '#4B5563', marginTop: 5 }}>Cuantos más detalles, mejor responderá el bot.</p>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setPaso(1)} style={{ background: CARD2, color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '13px 20px', fontSize: 14, cursor: 'pointer' }}>← Atrás</button>
                  <button onClick={activar} disabled={configurando}
                    style={{ flex: 1, background: WA, color: '#fff', border: 'none', borderRadius: 100, padding: '13px', fontSize: 15, fontWeight: 800, cursor: configurando ? 'not-allowed' : 'pointer', opacity: configurando ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 8px 24px rgba(37,211,102,0.3)` }}>
                    {configurando ? (
                      <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Configurando bot...</>
                    ) : (
                      <><WaIcon size={16} color="#fff" /> Activar mi WasapBot gratis</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3 — Listo */}
            {paso === 3 && (
              <div style={{ background: CARD, border: `2px solid ${WA_BOR}`, borderRadius: 20, padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: WA_GLOW, border: `2px solid ${WA_BOR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={WA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>¡Tu bot está listo! 🎉</h3>
                <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 12 }}>
                  Tu WhatsApp ya está respondiendo automáticamente con IA adaptada a <strong style={{ color: '#FAFAF8' }}>{TIPOS_NEGOCIO.find(t => t.id === tipo)?.label}</strong>.
                </p>
                <div style={{ background: CARD2, border: `1px solid ${WA_BOR}`, borderRadius: 12, padding: '12px 18px', marginBottom: 28, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <WaIcon size={16} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: WA }}>{telefono}</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>conectado</span>
                </div>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.65, marginBottom: 28 }}>
                  Tu WhatsApp ya está respondiendo automáticamente con IA adaptada a <strong style={{ color: '#FAFAF8' }}>{TIPOS_NEGOCIO.find(t => t.id === tipo)?.label}</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <Link href="/wasapbot/panel" style={{ background: WA, color: '#fff', borderRadius: 100, padding: '14px', fontSize: 15, fontWeight: 800, textDecoration: 'none', display: 'block', boxShadow: `0 8px 24px rgba(37,211,102,0.3)` }}>
                    Ver conversaciones de WhatsApp →
                  </Link>
                  <Link href="/wasapbot/configurar" style={{ background: CARD2, color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '14px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                    Configurar respuestas del bot
                  </Link>
                  <Link href="/dashboard" style={{ color: '#4B5563', fontSize: 13, textDecoration: 'none' }}>
                    Ir al panel completo →
                  </Link>
                </div>
                <div style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 14, padding: '18px 20px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: NARANJA, marginBottom: 10 }}>✨ Próximos pasos recomendados:</div>
                  {[
                    'Envía un mensaje de prueba a tu WhatsApp para ver el bot en acción',
                    'Configura los servicios y precios de tu negocio en el panel de agentes',
                    'Activa los recordatorios automáticos de cita',
                    'Invita a tu equipo al panel de conversaciones',
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
                      <span style={{ color: NARANJA, fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/" style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#FAFAF8', textDecoration: 'none' }}>
            <span>BQinz</span><span style={{ color: NARANJA }}>agenc</span><span>IA</span>
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacidad" style={{ color: '#4B5563', fontSize: 12, textDecoration: 'none' }}>Privacidad</Link>
            <Link href="/cookies" style={{ color: '#4B5563', fontSize: 12, textDecoration: 'none' }}>Cookies</Link>
            <Link href="mailto:bqinzagencia@gmail.com" style={{ color: '#4B5563', fontSize: 12, textDecoration: 'none' }}>Contacto</Link>
          </div>
          <span style={{ color: '#3A4150', fontSize: 12 }}>© 2026 BQinzagencIA · España 🇪🇸</span>
        </footer>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}
