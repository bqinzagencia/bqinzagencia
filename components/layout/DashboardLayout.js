// components/layout/DashboardLayout.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { logoutUser } from '../../lib/firebase';
import { getIndustriaInfo } from '../../lib/utils';
import toast from 'react-hot-toast';
import TrialFloatButton from '../TrialFloatButton';
import SoporteButton from '../SoporteButton';

const INDUSTRY_PHOTOS = {
  taller:             'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=80&q=80',  // mecanico trabajando
  peluqueria:         'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&q=80',  // salon peluqueria
  inmobiliaria:       'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=80',  // edificios
  restaurante:        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&q=80',  // restaurante
  restaurante_barrio: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80',  // cocina barrio
  tienda:             'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&q=80',  // tienda retail
  gimnasio:           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&q=80',  // gimnasio
  salud:              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&q=80',  // clinica
  ajedrez:            'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=80&q=80',  // ajedrez
  arquitectura:       'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=80&q=80',  // arquitectura
  papeleria:          'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=80&q=80',  // impresora papeleria
  educacion:          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=80&q=80',  // aula educacion
  aduana:             'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=80&q=80',  // puerto contenedores
  portuaria:          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=80&q=80',  // buque puerto
  tecnico:            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&q=80',  // circuitos electronicos
  default:            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&q=80',  // oficina generica
};

const NAV_ITEMS = [
  { href: '/dashboard',                label: 'Dashboard',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/agentes',        label: 'Mis Agentes IA',  icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2' },
  { href: '/dashboard/conversaciones', label: 'Conversaciones',  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { href: '/dashboard/crm',            label: 'Clientes / CRM',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/dashboard/agenda',         label: 'Agenda',          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/dashboard/web',            label: 'Crea tu Web',     icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
  { href: '/dashboard/widget',         label: 'Integra Chat IA', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { href: '/dashboard/whatsapp',        label: 'WhatsApp Bot',    icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M11.997 1.003C5.927 1.003 1 5.93 1 12c0 1.97.518 3.82 1.426 5.427L1 23l5.734-1.498A10.956 10.956 0 0011.997 23C18.067 23 23 18.073 23 12S18.067 1.003 11.997 1.003z' },
  { href: '/dashboard/reportes',       label: 'Reportes',        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/dashboard/voz',            label: 'Voz IA',          icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
];

export default function DashboardLayout({ children, title }) {
  const { empresa, empresas, esAdmin, seleccionarEmpresa } = useAuth();
  const router    = useRouter();
  const [open, setOpen]           = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [mobile, setMobile]       = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const ind         = getIndustriaInfo(empresa?.industria);
  const empresaFoto = INDUSTRY_PHOTOS[empresa?.industria] || INDUSTRY_PHOTOS.default;

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Cerrar menú al navegar en móvil
  useEffect(() => { if (mobile) setOpen(false); }, [router.pathname]);

  const logout = async () => {
    await logoutUser();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const Icon = ({ d }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );

  // ── Contenido del sidebar ─────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* Logo + cerrar (móvil) */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: '-0.04em', color: '#EFF4FF', textDecoration: 'none' }}>
          agenc<span style={{ color: '#FF6B00' }}>IA</span>me
        </Link>
        {mobile && (
          <button onClick={() => setOpen(false)}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#8A9BB5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Info empresa + selector */}
      {empresa && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={empresaFoto} alt="" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', border: `2px solid ${ind.color}44` }} />
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: '#10B981', border: '2px solid #0D1420' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#EFF4FF', fontFamily: "'Inter',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {empresa.nombreEmpresa}
              </div>
              <div style={{ fontSize: 10, color: '#4B6080', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>
                {ind.label}
              </div>
            </div>
            {/* Boton selector si hay mas de una empresa */}
            {empresas.length > 1 && (
              <button onClick={() => setSelectorOpen(s => !s)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#6B7A99' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            )}
          </div>

          {/* Dropdown selector de empresas */}
          {selectorOpen && empresas.length > 1 && (
            <div style={{ marginTop: 8, background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              {empresas.map(e => (
                <button key={e.id} onClick={() => { seleccionarEmpresa(e.id); setSelectorOpen(false); router.push('/dashboard'); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: e.id === empresa.id ? 'rgba(43,106,255,0.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left' }}>
                  <img src={INDUSTRY_PHOTOS[e.industria] || INDUSTRY_PHOTOS.default} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: e.id === empresa.id ? '#6DA4FF' : '#EFF4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif" }}>{e.nombreEmpresa}</div>
                    <div style={{ fontSize: 10, color: '#4B6080', fontFamily: "'Inter',sans-serif" }}>{e.industria}</div>
                  </div>
                  {e.id === empresa.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2B6AFF', flexShrink: 0 }} />}
                </button>
              ))}
              <button onClick={() => { setSelectorOpen(false); router.push('/auth/register?nueva=1'); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#10B981', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</div>
                Agregar empresa
              </button>
            </div>
          )}

          {/* Boton agregar empresa si solo tiene una */}
          {empresas.length === 1 && (
            <button onClick={() => router.push('/auth/register?nueva=1')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B6080', fontFamily: "'Inter',sans-serif", fontSize: 11, marginTop: 6, borderRadius: 6 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar otra empresa
            </button>
          )}
        </div>
      )}

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '6px 6px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 9px', borderRadius: 9, marginBottom: 1,
                fontFamily: "'Inter',sans-serif", fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#EFF4FF' : '#6B7A99',
                textDecoration: 'none',
                background: active ? 'rgba(43,106,255,0.14)' : 'transparent',
                border: `1px solid ${active ? 'rgba(43,106,255,0.3)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: active ? 'rgba(43,106,255,0.2)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: active ? '#6DA4FF' : '#4B6080' }}>
                <Icon d={item.icon} />
              </div>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2B6AFF', flexShrink: 0 }} />}
            </Link>
          );
        })}

        {esAdmin && (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '6px 4px' }} />
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: '#F59E0B', textDecoration: 'none', background: 'rgba(245,158,11,0.06)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.9" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              Super Admin
            </Link>
          </>
        )}
      </nav>

      {/* Pie del sidebar */}
      <div style={{ padding: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 6, flexShrink: 0 }}>
        <Link href="/dashboard/guia"
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, marginBottom: 3, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#60A5FA', textDecoration: 'none', background: 'rgba(43,106,255,0.08)', border: '1px solid rgba(43,106,255,0.18)' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(43,106,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 13, color: '#6DA4FF' }}>?</div>
          ¿Cómo funciona?
        </Link>
        <Link href="/dashboard/configuracion"
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, marginBottom: 3, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: '#6B7A99', textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#4B6080' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </div>
          Configuración
        </Link>
        <button onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, width: '100%', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        /* ── Reset móvil ── */
        *, *::before, *::after { box-sizing: border-box; }
        html { overflow-x: hidden; }
        body { overflow-x: hidden; }

        /* ── Tipografía dashboard ── */
        .db-main { font-family: 'Inter', system-ui, sans-serif; }
        .db-topbar { font-family: 'Inter', system-ui, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -0.03em; color: #EFF4FF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ── Overlay fondo oscuro al abrir menú ── */
        .sb-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 199; backdrop-filter: blur(3px); }

        /* ── Grids responsivos — aplica a TODAS las subpáginas ── */
        .db-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .db-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .db-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .db-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }

        @media (max-width: 767px) {
          /* Grids a 1 columna en móvil */
          .db-grid-2,
          .db-grid-3,
          .db-grid-4 { grid-template-columns: 1fr !important; }

          /* Topbar título más pequeño */
          .db-topbar { font-size: 14px; max-width: 160px; }

          /* Padding del contenido */
          .db-content { padding: 16px 14px !important; }

          /* Tablas — scroll horizontal */
          table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }

          /* Pre / código — scroll */
          pre { overflow-x: auto !important; white-space: pre !important; }

          /* Botones en fila — apilan en móvil */
          .db-btn-row { flex-direction: column !important; align-items: stretch !important; }
          .db-btn-row .btn { text-align: center; justify-content: center; }

          /* Stat cards en 2 columnas en móvil */
          .db-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
        }

        @media (max-width: 380px) {
          /* Pantallas muy pequeñas — stat cards a 1 columna */
          .db-stats-grid { grid-template-columns: 1fr !important; }
          .db-topbar { max-width: 120px; font-size: 13px; }
        }
      `}} />

      <div className="db-shell" style={{ display: 'flex', minHeight: '100vh', background: '#0A0F1E', position: 'relative', overflowX: 'hidden' }}>

        {/* Backdrop móvil */}
        {mobile && open && (
          <div className="sb-backdrop" onClick={() => setOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <aside data-sidebar style={{
          width: 236,
          background: '#0D1420',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          ...(mobile ? {
            position:  'fixed',
            top:       0,
            left:      0,
            height:    '100vh',
            zIndex:    200,
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            transition:'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
          } : {
            position:  'sticky',
            top:       0,
            height:    '100vh',
            overflowY: 'auto',
          }),
        }}>
          <Sidebar />
        </aside>

        {/* ── MAIN ── */}
        <main className="db-main" style={{ flex: 1, minWidth: 0, overflowX: 'hidden', overflowY: 'auto', background: '#0A0F1E', width: mobile ? '100vw' : 'auto' }}>

          {/* Topbar */}
          <div style={{
            position:       'sticky',
            top:            0,
            zIndex:         10,
            background:     'rgba(10,15,30,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom:   '1px solid rgba(255,255,255,0.06)',
            padding:        mobile ? '0 14px' : '0 28px',
            height:         54,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            10,
          }}>
            {/* Izquierda: hamburguesa + título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              {mobile && (
                <button onClick={() => setOpen(true)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#8A9BB5' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                    <line x1="3" y1="6"  x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              )}
              <h1 className="db-topbar">{title}</h1>
            </div>

            {/* Derecha: badge + avatar + salir */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!mobile && <PlanBadge plan={empresa?.plan} />}
              <img
                src={INDUSTRY_PHOTOS[empresa?.industria] || INDUSTRY_PHOTOS.default}
                alt=""
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  border: '2px solid rgba(43,106,255,0.35)',
                  flexShrink: 0,
                  display: 'block',
                }}
              />
              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: mobile ? '7px 8px' : '6px 12px', cursor: 'pointer', color: '#EF4444', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {!mobile && 'Salir'}
              </button>
            </div>
          </div>

          {/* Contenido de cada página */}
          <div className="db-content" style={{ padding: mobile ? '16px 14px' : '28px 32px' }}>
            {children}
          </div>
        </main>
      </div>

      <TrialFloatButton />
      <SoporteButton />
    </>
  );
}

function PlanBadge({ plan }) {
  const map = {
    emprendedor: { color: '#8A9BB5', label: 'Emprendedor' },
    profesional: { color: '#2B6AFF', label: 'Pro' },
    agencia:     { color: '#A78BFA', label: 'Agencia' },
  };
  const p = map[plan];
  if (!p) return null;
  return (
    <span style={{ background: p.color+'18', color: p.color, border: `1px solid ${p.color}30`, borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>
      {p.label}
    </span>
  );
}
