// pages/[empresa].js
// Web pública de cada cliente — URL: bqinzagencia.com/[slug-empresa]

import Head from 'next/head';
import { useState } from 'react';

const COLORES = {
  peluqueria:          '#EC4899',
  taller:              '#FF6B6B',
  restaurante:         '#EAB308',
  inmobiliaria:        '#3B82F6',
  tienda:              '#10B981',
  papeleria:           '#8B5CF6',
  gimnasio:            '#F97316',
  salud:               '#14B8A6',
  educacion:           '#6366F1',
  estetica:            '#FF6B00',
  salon:               '#EC4899',
  spa:                 '#8B5CF6',
  dental:              '#14B8A6',
  'medicina-estetica': '#3B82F6',
  generico:            '#A78BFA',
};

function toSlug(str) {
  return (str || '').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function getServerSideProps({ params }) {
  const rawSlug = params.empresa || '';
  const slug    = toSlug(rawSlug);

  // Rutas reservadas del sistema — no buscar en Firestore
  const RESERVED = ['dashboard','auth','admin','api','wasapbot','industrias','especialidades',
    'generar-web','privacidad','cookies','terminos','aviso-legal','404'];
  if (RESERVED.includes(slug)) return { notFound: true };

  try {
    // Usar Firebase Admin (solo disponible en servidor)
    const { db } = await import('../lib/firebaseAdmin');
    const { collection, getDocs, doc, getDoc } = await import('firebase-admin/firestore');

    let empresaData = null;

    // 1. Buscar por slug exacto o nombre
    const snap = await db.collection('empresas').get();
    for (const docSnap of snap.docs) {
      const d = docSnap.data();
      const nombreSlug = toSlug(d.nombreEmpresa);
      if (
        nombreSlug === slug ||
        toSlug(d.slug || '') === slug ||
        docSnap.id === rawSlug
      ) {
        empresaData = { id: docSnap.id, ...d };
        break;
      }
    }

    if (!empresaData) return { notFound: true };

    // Serializar — evitar objetos no serializables
    const wa = empresaData.whatsapp;
    const waNumero = typeof wa === 'string' ? wa
      : (wa && typeof wa === 'object' && wa.numero) ? wa.numero
      : (empresaData.webWhatsapp || empresaData.telefono || '');

    const data = {
      id:            empresaData.id,
      nombreEmpresa: String(empresaData.nombreEmpresa || rawSlug),
      industria:     String(empresaData.industria || empresaData.plantillaWeb || 'generico'),
      ciudad:        String(empresaData.ciudad || 'España'),
      telefono:      String(empresaData.telefono || ''),
      fotoHero:      typeof empresaData.fotoHeroPersonalizada === 'string' ? empresaData.fotoHeroPersonalizada : null,
      descripcion:   String(empresaData.webDescripcion || empresaData.descripcion || ''),
      whatsapp:      String(waNumero),
      servicios:     Array.isArray(empresaData.webServicios) ? empresaData.webServicios.map(s => typeof s === 'string' ? { nombre: s } : s) : [],
      horarios:      {},
    };

    // Base de conocimiento
    try {
      const conocSnap = await db.collection('empresas').doc(empresaData.id)
        .collection('config').doc('conocimiento').get();
      if (conocSnap.exists) {
        const conoc = conocSnap.data();
        if (Array.isArray(conoc.servicios) && conoc.servicios.length > 0)
          data.servicios = conoc.servicios;
        if (conoc.horarios && typeof conoc.horarios === 'object')
          data.horarios = conoc.horarios;
      }
    } catch {}

    return { props: { empresa: data } };
  } catch (e) {
    console.error('[empresa page]', e.message);
    return { notFound: true };
  }
}

export default function EmpresaPublica({ empresa }) {
  const color = COLORES[empresa.industria] || COLORES.generico;
  const tel   = empresa.whatsapp || empresa.telefono || '';
  const waUrl = tel ? `https://wa.me/${tel.replace(/\D/g,'')}?text=Hola,%20quiero%20más%20información` : '#';
  const foto  = empresa.fotoHero ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&h=600&fit=crop&crop=center&q=85';

  return (
    <>
      <Head>
        <title>{empresa.nombreEmpresa} — {empresa.ciudad}</title>
        <meta name="description" content={`${empresa.nombreEmpresa} en ${empresa.ciudad}. Reserva tu cita online fácil y rápido.`} />
        <meta property="og:title" content={empresa.nombreEmpresa} />
        <meta property="og:image" content={foto} />
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #111; }
        .btn-main { background: ${color}; color: #fff; border: none; border-radius: 100px; padding: 13px 28px; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s; }
        .btn-main:hover { opacity: 0.9; }
        .btn-wa { background: #25D366; color: #fff; border: none; border-radius: 100px; padding: 13px 28px; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .servicio-card { background: #f9fafb; border-radius: 16px; padding: 24px 20px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .servicio-card:hover { border-color: ${color}55; box-shadow: 0 4px 20px ${color}15; }
        @media (max-width: 768px) {
          .hero-btns { flex-direction: column; }
          .hero-btns a { width: 100%; justify-content: center; }
          .nav-links { display: none; }
          .servicios-grid { grid-template-columns: 1fr !important; }
          .hero-content h1 { font-size: 32px !important; }
        }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#111' }}>{empresa.nombreEmpresa}</div>
        <div className="nav-links" style={{ display: 'flex', gap: 28 }}>
          {['Servicios','Horarios','Contacto'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ fontSize: 13, padding: '9px 18px' }}>
          💬 WhatsApp
        </a>
      </nav>

      <section style={{ position: 'relative', height: '70vh', minHeight: 480, overflow: 'hidden' }}>
        <img src={foto} alt={empresa.nombreEmpresa} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)' }} />
        <div className="hero-content" style={{ position: 'absolute', bottom: 60, left: 0, right: 0, padding: '0 40px', maxWidth: 700 }}>
          <div style={{ display: 'inline-block', background: color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase' }}>{empresa.ciudad}</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>{empresa.nombreEmpresa}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
            {empresa.descripcion || `Bienvenidos a ${empresa.nombreEmpresa}. Reserva tu cita online en segundos.`}
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 12 }}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">💬 Reservar por WhatsApp</a>
            <a href="#servicios" className="btn-main" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>Ver servicios</a>
          </div>
        </div>
      </section>

      <section id="servicios" style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Nuestros servicios</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-1px', marginBottom: 48, color: '#111' }}>¿En qué podemos ayudarte?</h2>
          {empresa.servicios?.length > 0 ? (
            <div className="servicios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {empresa.servicios.filter(s => s && (s.nombre || typeof s === 'string')).map((s, i) => (
                <div key={i} className="servicio-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: color+'15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>⭐</span>
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#111' }}>{s.nombre || s}</h3>
                  {s.precio && <div style={{ color, fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{s.precio}€</div>}
                  {s.duracion && <div style={{ color: '#9ca3af', fontSize: 13 }}>⏱ {s.duracion} min</div>}
                  {s.descripcion && <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>{s.descripcion}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { icon: '⭐', title: 'Atención personalizada', desc: 'Servicio adaptado a cada cliente con los mejores estándares.' },
                { icon: '⚡', title: 'Reserva rápida', desc: 'Agenda tu cita en segundos por WhatsApp, sin esperas.' },
                { icon: '🛡️', title: 'Calidad garantizada', desc: 'Profesionales con años de experiencia a tu servicio.' },
              ].map((s, i) => (
                <div key={i} className="servicio-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {empresa.horarios && Object.keys(empresa.horarios).length > 0 && (
        <section id="horarios" style={{ padding: '80px 40px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Horarios</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1px', marginBottom: 32 }}>Cuándo estamos disponibles</h2>
            <div style={{ background: '#fafafa', borderRadius: 20, padding: 32, border: '1px solid #e5e7eb' }}>
              {Object.entries(empresa.horarios).map(([dia, h]) => h && h.activo && (
                <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{dia}</span>
                  <span style={{ color: '#6b7280' }}>{h.desde} — {h.hasta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contacto" style={{ padding: '80px 40px', background: '#111', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16 }}>¿Listo para reservar?</h2>
        <p style={{ color: '#9ca3af', fontSize: 17, marginBottom: 40 }}>Escríbenos por WhatsApp y te atendemos en segundos.</p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ fontSize: 17, padding: '16px 40px' }}>
          💬 Reservar ahora por WhatsApp
        </a>
        {empresa.telefono && (
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 20 }}>
            O llámanos: <a href={`tel:${empresa.telefono}`} style={{ color, textDecoration: 'none', fontWeight: 600 }}>{empresa.telefono}</a>
          </p>
        )}
      </section>

      <footer style={{ padding: '24px 40px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#111' }}>{empresa.nombreEmpresa}</span>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>Powered by <a href="https://bqinzagencia.com" style={{ color, textDecoration: 'none', fontWeight: 600 }}>BQinzagencIA</a></span>
      </footer>

      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', zIndex: 999, textDecoration: 'none', fontSize: 28 }}>
        💬
      </a>
    </>
  );
}
