// pages/[slug].js
// Página web pública de cada cliente — bqinzagencia.com/[nombre-empresa]
import Head from 'next/head';
import { useState, useEffect } from 'react';
import * as admin from 'firebase-admin';

// ── Firebase Admin ─────────────────────────────────────────────────────────────
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

// ── Rutas reservadas del sistema ───────────────────────────────────────────────
const RUTAS_RESERVADAS = [
  'auth', 'dashboard', 'api', 'especialidades', 'generar-web',
  'privacidad', 'cookies', 'terminos', 'aviso-legal', 'baja',
  '_next', 'favicon.ico', 'logo.png',
];

// ── Colores por plantilla ──────────────────────────────────────────────────────
const COLORES = {
  taller:       '#FF6B6B',
  peluqueria:   '#EC4899',
  restaurante:  '#EAB308',
  inmobiliaria: '#3B82F6',
  tienda:       '#10B981',
  papeleria:    '#8B5CF6',
  gimnasio:     '#F97316',
  salud:        '#14B8A6',
  educacion:    '#6366F1',
  generico:     '#FF6B00',
};

const FOTOS = {
  taller:       'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1400&q=85',
  peluqueria:   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=85',
  restaurante:  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85',
  inmobiliaria: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=85',
  tienda:       'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1400&q=85',
  papeleria:    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85',
  gimnasio:     'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85',
  salud:        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=85',
  educacion:    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=85',
  generico:     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85',
};

// ── getServerSideProps ─────────────────────────────────────────────────────────
export async function getServerSideProps({ params }) {
  const slug = params?.slug;
  if (!slug || RUTAS_RESERVADAS.includes(slug)) return { notFound: true };

  try {
    const db = getDb();
    const snap = await db.collection('empresas')
      .where('slugWeb', '==', slug)
      .limit(1)
      .get();

    // También buscar por nombre normalizado
    let empresa = null;
    if (!snap.empty) {
      empresa = { id: snap.docs[0].id, ...snap.docs[0].data() };
    } else {
      const snap2 = await db.collection('empresas').get();
      for (const doc of snap2.docs) {
        const d = doc.data();
        const slugNombre = (d.nombreEmpresa || '').toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (slugNombre === slug) {
          empresa = { id: doc.id, ...d };
          break;
        }
      }
    }

    if (!empresa || !empresa.plantillaWeb) return { notFound: true };

    // Obtener servicios del agente
    const agentSnap = await db.collection('empresas').doc(empresa.id)
      .collection('agentes').where('activo', '==', true).limit(1).get();
    const agente = agentSnap.empty ? null : agentSnap.docs[0].data();

    return {
      props: {
        empresa: JSON.parse(JSON.stringify(empresa)),
        agente: agente ? JSON.parse(JSON.stringify(agente)) : null,
      },
    };
  } catch (e) {
    console.error('[slug] Error:', e.message);
    return { notFound: true };
  }
}

// ── Componente público ─────────────────────────────────────────────────────────
export default function EmpresaPublica({ empresa, agente }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', mensaje: '' });
  const [formSent, setFormSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const plantilla = empresa.plantillaWeb || 'generico';
  const color = COLORES[plantilla] || '#FF6B00';
  const fotoHero = empresa.fotoHeroPersonalizada || FOTOS[plantilla] || FOTOS.generico;
  const nombre = empresa.nombreEmpresa || 'Empresa';
  const ciudad = empresa.ciudad || 'España';
  const tel = empresa.telefono || '';
  const email = empresa.email || '';
  const whatsapp = tel.replace(/\D/g, '');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  async function handleFormSubmit(e) {
    e.preventDefault();
    try {
      await fetch('/api/contacto-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: empresa.id, ...formData }),
      });
      setFormSent(true);
    } catch { setFormSent(true); }
  }

  const servicios = agente?.servicios || [
    { nombre: 'Consulta inicial', precio: 'Gratis', duracion: '15 min' },
    { nombre: 'Servicio principal', precio: 'Consultar', duracion: '60 min' },
    { nombre: 'Pack completo', precio: 'Consultar', duracion: '90 min' },
  ];

  return (
    <>
      <Head>
        <title>{nombre} — {ciudad}</title>
        <meta name="description" content={`${nombre} en ${ciudad}. ${agente?.descripcion || 'Reserva tu cita online.'}`} />
        <meta property="og:title" content={nombre} />
        <meta property="og:image" content={fotoHero} />
        <meta property="og:type" content="business.business" />
        <link rel="icon" href="/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#111', minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 40px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.3s',
        }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: scrolled ? '#111' : '#fff', letterSpacing: '-0.5px' }}>
            {nombre}
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Servicios', 'Nosotros', 'Contacto'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ color: scrolled ? '#555' : 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                {l}
              </a>
            ))}
          </div>
          <a href="#contacto"
            style={{ background: color, color: '#fff', borderRadius: 100, padding: '9px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 20px ${color}55` }}>
            Reservar cita
          </a>
        </nav>

        {/* ── HERO ── */}
        <section style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <img src={fotoHero} alt={nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '0 60px', maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: color, color: '#fff', padding: '5px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
              📍 {ciudad}
            </div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(36px,5vw,68px)', lineHeight: 1.05, letterSpacing: '-2px', color: '#fff', marginBottom: 20 }}>
              {agente?.tagline || `Bienvenidos a ${nombre}`}
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 36, maxWidth: 520 }}>
              {agente?.descripcion || 'Tu centro de confianza. Atención personalizada, reservas online 24h y agente IA siempre disponible.'}
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="#contacto"
                style={{ background: color, color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 8px 30px ${color}55`, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                📅 Reservar cita
              </a>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}?text=Hola%2C%20quiero%20información`} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ background: '#111', padding: '40px 60px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {[
              { n: '24/7', label: 'Atención automática' },
              { n: '< 30s', label: 'Tiempo de respuesta' },
              { n: '100%', label: 'Satisfacción garantizada' },
              { n: '0€', label: 'Coste de reserva' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, color, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICIOS ── */}
        <section id="servicios" style={{ padding: '100px 60px', background: '#FAFAF8' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Lo que ofrecemos</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-1.5px', marginBottom: 14, color: '#111' }}>
                Nuestros servicios
              </h2>
              <p style={{ color: '#6B7280', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Reserva online en menos de 30 segundos. Sin llamadas, sin esperas.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {Array.isArray(servicios) && servicios.slice(0, 6).map((s, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 20, padding: '28px 24px',
                  border: `1px solid ${i === 0 ? color + '33' : 'rgba(0,0,0,0.07)'}`,
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}22`; e.currentTarget.style.borderColor = color + '44'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = i === 0 ? color + '33' : 'rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 22 }}>
                    {['💆', '✂️', '💅', '🧴', '💪', '🌿'][i] || '⭐'}
                  </div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#111' }}>{s.nombre || `Servicio ${i + 1}`}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 16 }}>
                    {s.descripcion || 'Atención personalizada de la máxima calidad.'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color }}>
                      {s.precio || 'Consultar'}
                    </div>
                    {s.duracion && <span style={{ background: color + '15', color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{s.duracion}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <a href="#contacto"
                style={{ background: color, color: '#fff', borderRadius: 100, padding: '14px 36px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: `0 8px 24px ${color}44` }}>
                Reservar cita ahora →
              </a>
            </div>
          </div>
        </section>

        {/* ── POR QUÉ ELEGIRNOS ── */}
        <section id="nosotros" style={{ padding: '100px 60px', background: '#111', color: '#fff' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Por qué elegirnos</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-1.5px', marginBottom: 24, lineHeight: 1.1 }}>
                Tu centro de confianza en {ciudad}
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.75, marginBottom: 36 }}>
                {agente?.descripcionLarga || `En ${nombre} combinamos la calidez del trato personal con la tecnología más avanzada. Nuestro agente IA atiende a tus clientes las 24 horas para que nunca pierdas una cita.`}
              </p>
              {[
                'Respuesta inmediata por WhatsApp',
                'Reservas online sin llamadas',
                'Recordatorios automáticos de cita',
                'Sin listas de espera',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 15 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>✓</div>
                  <span style={{ color: '#D1D5DB' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden' }}>
              <img src={fotoHero} alt={nombre} style={{ width: '100%', height: 360, objectFit: 'cover', objectPosition: 'center 30%' }} />
            </div>
          </div>
        </section>

        {/* ── CONTACTO / RESERVA ── */}
        <section id="contacto" style={{ padding: '100px 60px', background: '#FAFAF8' }}>
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Reserva online</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-1.5px', color: '#111', marginBottom: 12 }}>
                ¿Hablamos?
              </h2>
              <p style={{ color: '#6B7280', fontSize: 16 }}>Te respondemos en menos de 30 segundos.</p>
            </div>

            {formSent ? (
              <div style={{ background: color + '12', border: `1px solid ${color}33`, borderRadius: 20, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 10, color: '#111' }}>¡Mensaje enviado!</h3>
                <p style={{ color: '#6B7280', fontSize: 15 }}>Te contactaremos en breve. También puedes escribirnos directamente por WhatsApp.</p>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 100, padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginTop: 20 }}>
                    Abrir WhatsApp →
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'nombre', placeholder: 'Tu nombre completo', type: 'text', required: true },
                  { name: 'telefono', placeholder: 'Tu teléfono (WhatsApp)', type: 'tel', required: true },
                ].map(f => (
                  <input key={f.name} type={f.type} placeholder={f.placeholder} required={f.required}
                    value={formData[f.name]} onChange={e => setFormData(d => ({ ...d, [f.name]: e.target.value }))}
                    style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '14px 18px', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = color}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                  />
                ))}
                <textarea placeholder="¿En qué podemos ayudarte? (servicio, fecha preferida...)" rows={4}
                  value={formData.mensaje} onChange={e => setFormData(d => ({ ...d, mensaje: e.target.value }))}
                  style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '14px 18px', fontSize: 15, outline: 'none', resize: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = color}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                />
                <button type="submit"
                  style={{ background: color, color: '#fff', border: 'none', borderRadius: 100, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${color}44`, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}>
                  Enviar mensaje y reservar →
                </button>
                <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                  Tus datos están protegidos según el RGPD. Solo se usarán para gestionar tu solicitud.
                </p>
              </form>
            )}

            {/* Datos de contacto */}
            <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {tel && (
                <a href={`tel:${tel}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '10px 20px', fontSize: 14, color: '#111', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  📞 {tel}
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  💬 WhatsApp
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '10px 20px', fontSize: 14, color: '#111', textDecoration: 'none' }}>
                  ✉️ {email}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#0A0D12', color: '#fff', padding: '36px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{nombre}</div>
            <div style={{ fontSize: 12, color: '#4B5563' }}>📍 {ciudad} · Atención 24/7 con IA</div>
          </div>
          <div style={{ fontSize: 11, color: '#3A4150', textAlign: 'right' }}>
            <div style={{ marginBottom: 6 }}>
              Sitio gestionado por{' '}
              <a href="https://www.bqinzagencia.com" target="_blank" rel="noopener noreferrer"
                style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 700 }}>BQinzagencIA</a>
            </div>
            <div>© {new Date().getFullYear()} {nombre} · RGPD · Datos protegidos en servidores europeos 🇪🇸</div>
          </div>
        </footer>

        {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}?text=Hola%2C%20quiero%20información%20sobre%20${encodeURIComponent(nombre)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 999,
              width: 58, height: 58, borderRadius: '50%',
              background: '#25D366', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(37,211,102,0.45)',
              textDecoration: 'none', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}
      </div>
    </>
  );
}
