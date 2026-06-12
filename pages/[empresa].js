// pages/[empresa].js
// Web pública de cada cliente — URL: bqinzagencia.com/[slug-empresa]

import Head from 'next/head';
import { useState } from 'react';
import { db as adminDb } from '../lib/firebaseAdmin';

const COLORES = {
  peluqueria:  '#EC4899',
  taller:      '#FF6B6B',
  restaurante: '#EAB308',
  inmobiliaria:'#3B82F6',
  tienda:      '#10B981',
  papeleria:   '#8B5CF6',
  gimnasio:    '#F97316',
  salud:       '#14B8A6',
  educacion:   '#6366F1',
  estetica:    '#FF6B00',
  salon:       '#EC4899',
  spa:         '#8B5CF6',
  dental:      '#14B8A6',
  'medicina-estetica': '#3B82F6',
  generico:    '#A78BFA',
};

export async function getServerSideProps({ params }) {
  const rawSlug = params.empresa || '';
  const slug = rawSlug.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  try {
    let empresa = null;

    // 1. Buscar por campo slug exacto
    const s1 = await adminDb.collection('empresas').where('slug', '==', slug).limit(1).get();
    if (!s1.empty) empresa = { id: s1.docs[0].id, ...s1.docs[0].data() };

    // 2. Buscar por slug generado del nombre (pelupelo → peluqueria-pelo, pp → pp, etc.)
    if (!empresa) {
      const todos = await adminDb.collection('empresas').get();
      for (const doc of todos.docs) {
        const d = doc.data();
        const nombreSlug = (d.nombreEmpresa || '')
          .toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (nombreSlug === slug || d.slug === slug) {
          empresa = { id: doc.id, ...d };
          break;
        }
      }
    }

    // 3. Fallback: buscar por UID si el slug tiene formato de UID
    if (!empresa && rawSlug.length > 15) {
      const s3 = await adminDb.collection('empresas').doc(rawSlug).get();
      if (s3.exists) empresa = { id: s3.id, ...s3.data() };
    }

    if (!empresa) return { notFound: true };

    // Limpiar datos sensibles
    const data = {
      id:             empresa.id,
      nombreEmpresa:  empresa.nombreEmpresa || slug,
      industria:      empresa.industria || 'generico',
      ciudad:         empresa.ciudad || 'España',
      telefono:       empresa.telefono || '',
      plantillaWeb:   empresa.plantillaWeb || empresa.industria || 'generico',
      fotoHero:       empresa.fotoHeroPersonalizada || null,
      descripcion:    empresa.descripcion || '',
      whatsapp:       empresa.whatsapp?.numero || empresa.telefono || '',
    };

    // Obtener servicios de base de conocimiento
    const conocSnap = await adminDb
      .collection('empresas').doc(empresa.id)
      .collection('config').doc('conocimiento')
      .get();

    if (conocSnap.exists) {
      const conoc = conocSnap.data();
      data.servicios  = conoc.servicios || [];
      data.horarios   = conoc.horarios  || {};
      data.info       = conoc.info      || {};
    }

    return { props: { empresa: data } };
  } catch (e) {
    console.error('[empresa page]', e.message);
    return { notFound: true };
  }
}

export default function EmpresaPublica({ empresa }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const color = COLORES[empresa.industria] || COLORES.generico;
  const tel   = empresa.whatsapp || empresa.telefono || '';
  const waUrl = tel ? `https://wa.me/${tel.replace(/\D/g,'')}?text=Hola,%20quiero%20más%20información` : '#';

  const foto = empresa.fotoHero ||
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

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#111' }}>
          {empresa.nombreEmpresa}
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 28 }}>
          {['Servicios', 'Horarios', 'Contacto'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ fontSize: 13, padding: '9px 18px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '70vh', minHeight: 480, overflow: 'hidden' }}>
        <img src={foto} alt={empresa.nombreEmpresa} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
        <div className="hero-content" style={{ position: 'absolute', bottom: 60, left: 0, right: 0, padding: '0 40px', maxWidth: 700 }}>
          <div style={{ display: 'inline-block', background: color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 16, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {empresa.ciudad}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
            {empresa.nombreEmpresa}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
            {empresa.descripcion || `Bienvenidos a ${empresa.nombreEmpresa}. Reserva tu cita online en segundos.`}
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 12 }}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Reservar por WhatsApp
            </a>
            <a href="#servicios" className="btn-main" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              Ver servicios
            </a>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" style={{ padding: '80px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Nuestros servicios</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: '-1px', marginBottom: 48, color: '#111' }}>
            ¿En qué podemos ayudarte?
          </h2>
          {empresa.servicios?.length > 0 ? (
            <div className="servicios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {empresa.servicios.filter(s => s.nombre).map((s, i) => (
                <div key={i} className="servicio-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#111' }}>{s.nombre}</h3>
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

      {/* HORARIOS */}
      {empresa.horarios && Object.keys(empresa.horarios).length > 0 && (
        <section id="horarios" style={{ padding: '80px 40px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Horarios</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1px', marginBottom: 32 }}>Cuándo estamos disponibles</h2>
            <div style={{ background: '#fafafa', borderRadius: 20, padding: 32, border: '1px solid #e5e7eb' }}>
              {Object.entries(empresa.horarios).map(([dia, h]) => h.activo && (
                <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 15 }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{dia}</span>
                  <span style={{ color: '#6b7280' }}>{h.desde} — {h.hasta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA / CONTACTO */}
      <section id="contacto" style={{ padding: '80px 40px', background: '#111', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16 }}>
          ¿Listo para reservar?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: 17, marginBottom: 40 }}>
          Escríbenos por WhatsApp y te atendemos en segundos.
        </p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa" style={{ fontSize: 17, padding: '16px 40px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Reservar ahora por WhatsApp
        </a>
        {empresa.telefono && (
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 20 }}>
            O llámanos: <a href={`tel:${empresa.telefono}`} style={{ color, textDecoration: 'none', fontWeight: 600 }}>{empresa.telefono}</a>
          </p>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#111' }}>{empresa.nombreEmpresa}</span>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>Powered by <a href="https://bqinzagencia.com" style={{ color, textDecoration: 'none', fontWeight: 600 }}>BQinzagencIA</a></span>
      </footer>

      {/* WhatsApp flotante */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', zIndex: 999, textDecoration: 'none', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  );
}
