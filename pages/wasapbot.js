// pages/wasapbot.js
// Página de producto WasapBot — BQinzagencIA
// Cliente entra, elige su tipo de negocio, pone su número y activa el bot

import Head from 'next/head';
import { useState } from 'react';

const VERDE = '#25D366';
const VERDE_DARK = '#1da851';
const VERDE_GLOW = 'rgba(37,211,102,0.18)';
const VERDE_BORDER = 'rgba(37,211,102,0.3)';
const DARK = '#080B0F';
const CARD = '#0F1318';
const NARANJA = '#FF6B00';

const SECTORES = [
  { value: 'restaurante',    label: 'Restaurante / Cafetería', emoji: '🍽️', demo: ['¿Cuál es el menú de hoy?', 'Hoy tenemos: Menú ejecutivo 12€ (ensalada + segundo + postre). Segundo: pollo asado, merluza o pasta. ¿Te reservo mesa? 😊'] },
  { value: 'barberia',       label: 'Barbería',                 emoji: '💈', demo: ['¿Tienes turno para hoy?',   'Sí! Tenemos hueco a las 17:00h y 18:30h. ¿Qué servicio necesitas? (Corte 12€, Barba 8€, Combo 18€) ✂️'] },
  { value: 'estetica',       label: 'Centro de Estética',       emoji: '💅', demo: ['¿Cuánto vale la depilación láser?', 'La depilación láser de piernas completas está a 89€/sesión o pack 5 sesiones por 349€. ¿Te agendo una consulta gratuita? ✨'] },
  { value: 'salon',          label: 'Salón de Belleza',         emoji: '✂️', demo: ['Quiero teñirme el pelo',    '¡Genial! El tinte completo desde 45€ según largo. Necesito tu nombre, fecha y hora preferida. ¿Cuándo te va bien? 💇‍♀️'] },
  { value: 'clinica_dental', label: 'Clínica Dental',           emoji: '🦷', demo: ['Me duele una muela',        'Tengo una cita urgente mañana a las 9h. ¿Me das tu nombre y teléfono para confirmarte? Cualquier urgencia llama al 91 000 0000 🦷'] },
  { value: 'veterinaria',    label: 'Veterinaria',              emoji: '🐾', demo: ['Mi perro no come bien',     'Es importante que lo revise el veterinario. ¿Cómo se llama tu mascota y qué raza es? Te agendo para mañana. 🐾'] },
  { value: 'taller',         label: 'Taller Mecánico',          emoji: '🔧', demo: ['¿Cuánto vale el cambio de aceite?', 'Cambio de aceite desde 39€ con filtro incluido. ¿Qué marca y modelo tienes? Te doy precio exacto 🔧'] },
  { value: 'inmobiliaria',   label: 'Inmobiliaria',             emoji: '🏠', demo: ['Busco piso en alquiler',    '¿Qué zona y presupuesto tienes? Tenemos pisos desde 650€/mes. Te envío las mejores opciones ahora mismo 🏠'] },
  { value: 'gimnasio',       label: 'Gimnasio / Fitness',       emoji: '💪', demo: ['¿Cuánto cuesta la membresía?', 'Membresía mensual 39€/mes o anual 299€. Primera semana GRATIS sin compromiso. ¿Cuándo pasas a conocernos? 💪'] },
  { value: 'hotel',          label: 'Hotel / Alojamiento',      emoji: '🏨', demo: ['¿Tenéis habitaciones para este fin de semana?', 'Sí! Habitación doble disponible viernes y sábado desde 89€/noche con desayuno incluido. ¿Te hago la reserva? 🏨'] },
  { value: 'farmacia',       label: 'Farmacia / Parafarmacia',  emoji: '💊', demo: ['¿Tenéis ibuprofeno 600?',   'Sí, tenemos ibuprofeno 600mg de varias marcas desde 3,20€. Abrimos de 9h a 21h (lunes a sábado). ¿Necesitas algo más? 💊'] },
  { value: 'contabilidad',   label: 'Gestoría / Contabilidad',  emoji: '📊', demo: ['¿Hacéis la declaración de la renta?', 'Sí, gestionamos la renta desde 50€. ¿Eres autónomo o empresa? Te agendo consulta gratuita esta semana 📊'] },
  { value: 'otro',           label: 'Otro tipo de negocio',     emoji: '🏪', demo: ['¿En qué horario abrís?',   '¡Hola! Abrimos de lunes a viernes de 9h a 20h y sábados de 10h a 14h. ¿En qué te puedo ayudar? 😊'] },
];

const PLANES = [
  {
    nombre: 'Starter',
    precio: '29',
    mensajes: '500 mensajes/mes',
    features: ['Bot WhatsApp 24/7', 'IA adaptada a tu negocio', 'Panel de conversaciones', 'Soporte por email'],
    popular: false,
    color: VERDE,
  },
  {
    nombre: 'Pro',
    precio: '59',
    mensajes: '2.000 mensajes/mes',
    features: ['Todo lo del Starter', 'Agenda de citas automática', 'Catálogo de productos', 'Recordatorios automáticos', 'Soporte prioritario'],
    popular: true,
    color: NARANJA,
  },
  {
    nombre: 'Business',
    precio: '99',
    mensajes: 'Mensajes ilimitados',
    features: ['Todo lo del Pro', 'Múltiples agentes', 'Integración con CRM', 'Analíticas avanzadas', 'Manager dedicado'],
    popular: false,
    color: '#9B59B6',
  },
];

// Componente del chat demo
function ChatDemo({ sector }) {
  const s = SECTORES.find(s => s.value === sector) || SECTORES[0];
  const [mostrar, setMostrar] = useState(false);

  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', maxWidth: 360, margin: '0 auto' }}>
      {/* Barra superior estilo WhatsApp */}
      <div style={{ background: '#1F2C34', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: VERDE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {s.emoji}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{s.label}</div>
          <div style={{ fontSize: 12, color: VERDE }}>● en línea — responde al instante</div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ background: '#0B141A', padding: 16, minHeight: 160, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E")' }}>
        {/* Mensaje del cliente */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <div style={{ background: '#005C4B', color: '#fff', borderRadius: '12px 12px 2px 12px', padding: '8px 12px', maxWidth: '80%', fontSize: 14 }}>
            {s.demo[0]}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: 4 }}>9:14 ✓✓</div>
          </div>
        </div>

        {/* Respuesta del bot */}
        {mostrar ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: VERDE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {s.emoji}
            </div>
            <div style={{ background: '#1F2C34', color: '#fff', borderRadius: '12px 12px 12px 2px', padding: '8px 12px', maxWidth: '80%', fontSize: 14, lineHeight: 1.5 }}>
              {s.demo[1]}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>9:14</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: VERDE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {s.emoji}
            </div>
            <button onClick={() => setMostrar(true)}
              style={{ background: '#1F2C34', border: `1px solid ${VERDE_BORDER}`, color: VERDE, borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver respuesta del bot →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Formulario de activación paso a paso
function FormularioActivacion() {
  const [paso, setPaso] = useState(1); // 1: sector, 2: datos, 3: activando, 4: éxito
  const [sectorSel, setSectorSel] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', nombreEmpresa: '', descripcion: '', ciudad: '', plan: 'starter' });
  const [error, setError] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sectorInfo = SECTORES.find(s => s.value === sectorSel);

  async function activar(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.telefono || !form.nombreEmpresa) {
      setError('Por favor rellena todos los campos obligatorios.');
      return;
    }
    setLoading(true);
    setPaso(3);
    try {
      const res = await fetch('/api/wasapbot/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sector: sectorSel }),
      });
      const data = await res.json();
      if (data.success) {
        setEmpresaId(data.empresaId);
        setPaso(4);
      } else {
        setError(data.error || 'Error al activar. Inténtalo de nuevo.');
        setPaso(2);
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setPaso(2);
    } finally {
      setLoading(false);
    }
  }

  // Paso 1 — Elige sector
  if (paso === 1) return (
    <div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
        ¿A qué se dedica tu negocio?
      </h3>
      <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
        Elegiremos el mejor lenguaje y comportamiento para tu bot
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
        {SECTORES.map(s => (
          <button key={s.value} onClick={() => { setSectorSel(s.value); setPaso(2); }}
            style={{ background: '#0F1318', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = VERDE; e.currentTarget.style.background = 'rgba(37,211,102,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#0F1318'; }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Paso 2 — Datos del negocio
  if (paso === 2) return (
    <div>
      <button onClick={() => setPaso(1)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, marginBottom: 20, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Cambiar tipo de negocio
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, background: VERDE_GLOW, border: `1px solid ${VERDE_BORDER}`, borderRadius: 12, padding: '10px 16px' }}>
        <span style={{ fontSize: 24 }}>{sectorInfo?.emoji}</span>
        <span style={{ color: VERDE, fontWeight: 600, fontSize: 14 }}>{sectorInfo?.label} — Bot personalizado listo</span>
      </div>

      <form onSubmit={activar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>Tu nombre</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Oscar García" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>Ciudad</label>
            <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)}
              placeholder="Madrid" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>Nombre de tu negocio *</label>
          <input value={form.nombreEmpresa} onChange={e => set('nombreEmpresa', e.target.value)}
            placeholder="Ej: Barbería El Rincón" required style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="tu@email.com" required style={inputStyle} />
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>Número de WhatsApp a conectar *</label>
          <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
            placeholder="+34 600 000 000" required style={inputStyle} />
          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Este número recibirá los mensajes de tus clientes automáticamente</p>
        </div>

        <div>
          <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6, display: 'block' }}>
            Cuéntanos más sobre tu negocio <span style={{ color: '#4B5563' }}>(opcional pero recomendado)</span>
          </label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            placeholder={`Ej: Somos una ${sectorInfo?.label.toLowerCase()} en ${form.ciudad || 'Madrid'}, con 10 años de experiencia. Ofrecemos ${sectorInfo?.value === 'restaurante' ? 'cocina mediterránea con menú del día' : 'servicios especializados'}. Horario: lunes a sábado 9h-20h...`}
            rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} />
          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            Cuanto más detalles des (servicios, precios, horarios), mejor responderá el bot 🎯
          </p>
        </div>

        {/* Plan */}
        <div>
          <label style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10, display: 'block' }}>Plan</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[{ v: 'starter', l: 'Starter', p: '29€/mes' }, { v: 'pro', l: 'Pro', p: '59€/mes' }, { v: 'business', l: 'Business', p: '99€/mes' }].map(p => (
              <button type="button" key={p.v} onClick={() => set('plan', p.v)}
                style={{ background: form.plan === p.v ? VERDE_GLOW : '#0F1318', border: `1px solid ${form.plan === p.v ? VERDE : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 6px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.plan === p.v ? VERDE : '#fff' }}>{p.l}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{p.p}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#EF4444', fontSize: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          style={{ background: VERDE, color: '#fff', border: 'none', borderRadius: 14, padding: '16px 24px', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, boxShadow: `0 0 32px ${VERDE_GLOW}` }}>
          ✅ Activar mi WasapBot ahora →
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#4B5563' }}>7 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>
      </form>
    </div>
  );

  // Paso 3 — Activando
  if (paso === 3) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>⚙️</div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
        Configurando tu bot...
      </h3>
      <p style={{ color: '#9CA3AF', marginBottom: 24 }}>
        La IA está aprendiendo sobre tu negocio ({sectorInfo?.label})
      </p>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: VERDE, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>
    </div>
  );

  // Paso 4 — Éxito
  if (paso === 4) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: VERDE_GLOW, border: `2px solid ${VERDE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>
        ✅
      </div>
      <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
        ¡Tu bot está listo! 🎉
      </h3>
      <div style={{ background: VERDE_GLOW, border: `1px solid ${VERDE_BORDER}`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📱</span>
        <span style={{ color: VERDE, fontWeight: 600 }}>{form.telefono} — configurado</span>
      </div>
      <p style={{ color: '#9CA3AF', marginBottom: 24, lineHeight: 1.6 }}>
        Tu WhatsApp ya está respondiendo automáticamente con IA adaptada a <strong style={{ color: '#fff' }}>{sectorInfo?.label}</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <a href={`/wasapbot/panel?id=${empresaId}`}
          style={{ background: VERDE, color: '#fff', borderRadius: 12, padding: '14px 24px', fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'block' }}>
          Ver conversaciones de WhatsApp →
        </a>
        <a href={`/wasapbot/configurar?id=${empresaId}`}
          style={{ background: '#1A1E26', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 12, padding: '14px 24px', fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'block' }}>
          Configurar respuestas del bot
        </a>
        <a href="/dashboard" style={{ color: '#6B7280', fontSize: 13, textDecoration: 'none' }}>
          Ir al panel completo →
        </a>
      </div>

      <div style={{ background: '#0F1318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', textAlign: 'left' }}>
        <p style={{ color: VERDE, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>✨ Próximos pasos recomendados:</p>
        {[
          'Envía un mensaje de prueba a tu WhatsApp para ver el bot en acción',
          'Configura los servicios y precios de tu negocio en el panel de agentes',
          'Activa los recordatorios automáticos de cita',
          'Invita a tu equipo al panel de conversaciones',
        ].map((paso, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <span style={{ color: VERDE, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>{paso}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#0F1318', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
  fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
};

export default function WasapBot() {
  const [sectorDemo, setSectorDemo] = useState('restaurante');

  return (
    <>
      <Head>
        <title>WasapBot — Tu WhatsApp responde solo | BQinzagencIA</title>
        <meta name="description" content="Activa un agente de IA en tu WhatsApp en menos de 10 minutos. Adaptado a tu tipo de negocio. Sin código, sin contratos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: DARK, color: '#FAFAF8', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <a href="/" style={{ textDecoration: 'none', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: '#fff' }}>
            <img src="/logo.png" alt="BQinzagencIA" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
            BQinz<span style={{ color: VERDE }}>agenc</span>IA
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="#precios" style={{ color: '#9CA3AF', fontSize: 14, textDecoration: 'none' }}>Precios</a>
            <a href="#demo" style={{ color: '#9CA3AF', fontSize: 14, textDecoration: 'none' }}>Demo</a>
            <a href="/dashboard" style={{ background: VERDE, color: '#fff', borderRadius: 100, padding: '8px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Mi panel →
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center', padding: '120px 24px 80px' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: VERDE_GLOW, border: `1px solid ${VERDE_BORDER}`, color: VERDE, borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, background: VERDE, borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            +200 negocios activos
          </div>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,6vw,64px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 24, maxWidth: 700, margin: '0 auto 24px' }}>
            Tu WhatsApp<br />
            <span style={{ color: VERDE }}>trabaja solo.</span>
          </h1>

          <p style={{ color: '#9CA3AF', fontSize: 'clamp(16px,2vw,20px)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Configura un agente de IA entrenado con la info de tu negocio. Responde clientes, agenda citas y vende productos — mientras tú descansas.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            {[['2.4M+', 'Mensajes respondidos'], ['98%', 'Tasa de respuesta'], ['< 3s', 'Tiempo de respuesta'], ['24/7', 'Disponibilidad']].map(([v, l]) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: VERDE }}>{v}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Hero chat demo */}
          <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <ChatDemo sector="restaurante" />
          </div>
        </section>

        {/* DEMO INTERACTIVA — Funciona para tu negocio */}
        <section id="demo" style={{ padding: '80px 24px', background: CARD }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: VERDE, fontSize: 13, fontWeight: 600, letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>DEMO INTERACTIVA</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
              Funciona para tu industria
            </h2>
            <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>
              Haz clic en tu tipo de negocio para ver cómo respondería el bot
            </p>

            {/* Selector de sector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
              {SECTORES.slice(0, 8).map(s => (
                <button key={s.value} onClick={() => setSectorDemo(s.value)}
                  style={{ background: sectorDemo === s.value ? VERDE_GLOW : '#111', border: `1px solid ${sectorDemo === s.value ? VERDE : 'rgba(255,255,255,0.1)'}`, color: sectorDemo === s.value ? VERDE : '#9CA3AF', borderRadius: 100, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <ChatDemo sector={sectorDemo} />

            <p style={{ textAlign: 'center', marginTop: 24, color: '#6B7280', fontSize: 13 }}>
              Este es un ejemplo. Tu bot se entrenará con la información real de tu negocio.
            </p>
          </div>
        </section>

        {/* ACTIVAR — Formulario principal */}
        <section id="activar" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ color: VERDE, fontSize: 13, fontWeight: 600, letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>EMPIEZA EN MINUTOS</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
              Activa tu WasapBot
            </h2>
            <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>
              Sin código. Sin contratos. Activo en menos de 10 minutos.
            </p>

            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 32px' }}>
              <FormularioActivacion />
            </div>
          </div>
        </section>

        {/* FUNCIONES */}
        <section style={{ padding: '80px 24px', background: CARD }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{ color: VERDE, fontSize: 13, fontWeight: 600, letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>FUNCIONES</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
              Todo lo que necesita<br />tu negocio en WhatsApp
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {[
                { icon: '🤖', title: 'IA entrenada con tu negocio', desc: 'El bot aprende tus servicios, precios y horarios. Responde como si fueras tú, sin respuestas genéricas.' },
                { icon: '📅', title: 'Agendamiento automático', desc: 'Confirma citas, envía recordatorios y gestiona tu agenda. Sin llamadas, sin mensajes manuales.' },
                { icon: '📊', title: 'Captura leads automáticamente', desc: 'Registra nombre, teléfono y motivo de cada cliente. Tu CRM crece solo.' },
                { icon: '🔔', title: 'Alertas cuando te necesitan', desc: 'Si el cliente pide hablar contigo, recibes notificación inmediata.' },
                { icon: '📱', title: 'Panel de control propio', desc: 'Ve conversaciones, estadísticas y consumo en tiempo real desde tu móvil.' },
                { icon: '🎯', title: 'Adaptado a tu sector', desc: 'No es un bot genérico. Se configura específicamente para tu tipo de negocio.' },
              ].map((f, i) => (
                <div key={i} style={{ background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRECIOS */}
        <section id="precios" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ color: VERDE, fontSize: 13, fontWeight: 600, letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>PRECIOS</p>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
              Elige tu plan
            </h2>
            <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: 48 }}>Sin contratos · Sin tarjeta de crédito · 7 días gratis</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {PLANES.map((p, i) => (
                <div key={i} style={{ background: CARD, border: `2px solid ${p.popular ? p.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: 28, position: 'relative', boxShadow: p.popular ? `0 0 40px rgba(255,107,0,0.15)` : 'none' }}>
                  {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: NARANJA, color: '#fff', borderRadius: 100, padding: '4px 16px', fontSize: 12, fontWeight: 700 }}>MÁS POPULAR</div>}
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{p.nombre}</div>
                  <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>{p.mensajes}</div>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, color: p.color }}>{p.precio}€</span>
                    <span style={{ color: '#6B7280', fontSize: 14 }}>/mes</span>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ color: VERDE, fontWeight: 700, fontSize: 14 }}>✓</span>
                        <span style={{ fontSize: 14, color: '#9CA3AF' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#activar" style={{ background: p.popular ? p.color : 'transparent', border: `1px solid ${p.popular ? p.color : 'rgba(255,255,255,0.15)'}`, color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                    Empezar {p.popular ? 'ahora' : 'gratis'} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 24px', background: CARD }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Preguntas frecuentes</h2>
            {[
              ['¿Necesito saber programar?', 'No. El proceso es 100% visual. Eliges tu tipo de negocio, nos cuentas sobre él y el bot se configura automáticamente con IA.'],
              ['¿Funciona con mi número actual de WhatsApp?', 'Sí, mediante WhatsApp Business API. Te guiamos en el proceso de verificación de tu número.'],
              ['¿Cuánto tarda en activarse?', 'El bot queda configurado en menos de 10 minutos. La verificación del número de WhatsApp puede tardar 24-48h según Meta.'],
              ['¿Puedo personalizar las respuestas?', 'Sí, desde tu panel puedes ajustar el comportamiento del bot, añadir información de tu negocio y ver todas las conversaciones.'],
              ['¿Qué pasa si un cliente quiere hablar con una persona?', 'El bot detecta cuando el cliente necesita atención humana y te envía una notificación inmediata.'],
              ['¿Puedo cancelar cuando quiera?', 'Sí, sin permanencia ni penalizaciones. Cancelas desde tu panel en cualquier momento.'],
            ].map(([q, a], i) => <FaqItem key={i} q={q} a={a} />)}
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, marginBottom: 16 }}>
            Empieza hoy.<br /><span style={{ color: VERDE }}>Vende en piloto automático.</span>
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 36 }}>
            Sin tarjeta. Sin contratos. Activo en 10 minutos.
          </p>
          <a href="#activar" style={{ background: VERDE, color: '#fff', borderRadius: 100, padding: '18px 48px', fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: `0 0 40px ${VERDE_GLOW}` }}>
            Activa tu bot gratis →
          </a>
          <div style={{ marginTop: 20 }}>
            <a href={`https://wa.me/34674421919?text=Hola,%20quiero%20info%20sobre%20WasapBot`} target="_blank" rel="noopener noreferrer"
              style={{ color: VERDE, fontSize: 14, textDecoration: 'none' }}>
              💬 Hablar con un asesor por WhatsApp
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#3A4150', fontSize: 13 }}>© 2026 BQinzagencIA · España 🇪🇸</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Inicio', '/'], ['Panel', '/dashboard'], ['Privacidad', '/privacidad'], ['Cookies', '/cookies']].map(([l, h]) => (
              <a key={l} href={h} style={{ color: '#6B7280', fontSize: 13, textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { border-color: ${VERDE} !important; box-shadow: 0 0 0 3px rgba(37,211,102,0.15); }
        ::placeholder { color: #4B5563; }
        a:hover { opacity: 0.85; }
      `}</style>
    </>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16, marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: '#fff', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600, fontFamily: 'inherit', paddingBottom: open ? 12 : 0 }}>
        {q}
        <span style={{ color: VERDE, fontSize: 20, flexShrink: 0, marginLeft: 12 }}>{open ? '−' : '+'}</span>
      </button>
      {open && <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
}
