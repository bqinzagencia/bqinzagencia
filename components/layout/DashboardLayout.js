// components/layout/DashboardLayout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { logoutUser } from '../../lib/firebase';
import { getIndustriaInfo, iniciales } from '../../lib/utils';
import toast from 'react-hot-toast';
import TrialFloatButton from '../TrialFloatButton';

// Fotos Unsplash por industria para el avatar de la empresa
const INDUSTRY_PHOTOS = {
  taller:           'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=80&q=80',
  peluqueria:       'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&q=80',
  inmobiliaria:     'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=80',
  restaurante:      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&q=80',
  restaurante_barrio:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80',
  tienda:           'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=80&q=80',
  gimnasio:         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&q=80',
  salud:            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&q=80',
  ajedrez:          'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=80&q=80',
  arquitectura:     'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=80&q=80',
  papeleria:        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&q=80',
  default:          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&q=80',
};

const NAV_ITEMS = [
  { href: '/dashboard',                label: 'Dashboard',                  img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=48&q=80' },
  { href: '/dashboard/agentes',        label: 'Mis Agentes IA',             img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=48&q=80' },
  { href: '/dashboard/conversaciones', label: 'Conversaciones',             img: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=48&q=80' },
  { href: '/dashboard/crm',            label: 'Clientes / CRM',             img: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=48&q=80' },
  { href: '/dashboard/agenda',         label: 'Agenda',                     img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=48&q=80' },
  { href: '/dashboard/web',            label: 'Crea tu Web con un Click',   img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=48&q=80' },
  { href: '/dashboard/widget',         label: 'Integra Chat IA a tu Web',   img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=48&q=80' },
  { href: '/dashboard/reportes',       label: 'Reportes',                   img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=48&q=80' },
  { href: '/dashboard/voz',            label: 'Voz IA',                     img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=48&q=80' },
];

export default function DashboardLayout({ children, title }) {
  const { empresa, esAdmin } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const ind = getIndustriaInfo(empresa?.industria);
  const empresaFoto = INDUSTRY_PHOTOS[empresa?.industria] || INDUSTRY_PHOTOS.default;

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Sesión cerrada');
    router.push('/');
    setTimeout(() => window.location.href = '/', 300);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        .sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 10px; border-radius: 8px; margin-bottom: 2px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px; font-weight: 500; letter-spacing: -0.1px;
          color: #6B7280; text-decoration: none;
          transition: all 0.15s; border: 1px solid transparent;
          cursor: pointer; background: none; width: 100%; text-align: left;
        }
        .sb-item:hover { background: rgba(37,99,235,0.08); color: #C8D4E8; border-color: rgba(37,99,235,0.15); }
        .sb-item.active { background: rgba(37,99,235,0.15); color: #F0F4FF; border-color: rgba(37,99,235,0.3); }
        .sb-thumb { width: 28px; height: 28px; border-radius: 7px; object-fit: cover; flex-shrink: 0; opacity: 0.65; transition: opacity 0.15s; border: 1px solid rgba(255,255,255,0.08); }
        .sb-item:hover .sb-thumb, .sb-item.active .sb-thumb { opacity: 1; border-color: rgba(37,99,235,0.4); }
        .sb-active-dot { width: 5px; height: 5px; border-radius: 50%; background: #2563EB; flex-shrink: 0; margin-left: auto; box-shadow: 0 0 6px rgba(37,99,235,0.7); }
        .sb-logout { display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:8px; font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:500; color:#EF4444; background:none; border:1px solid transparent; cursor:pointer; width:100%; transition:all 0.15s; }
        .sb-logout:hover { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.15); }
        .db-topbar { font-family:'Inter',system-ui,sans-serif; font-size:17px; font-weight:700; letter-spacing:-0.4px; color:#F9FAFB; }
        .db-main { font-family:'Inter',system-ui,sans-serif; }
      `}} />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#080B0F' }}>

        {/* SIDEBAR */}
        <aside style={{
          width: collapsed ? 58 : 228,
          background: '#0F1623',
          borderRight: '1px solid rgba(37,99,235,0.12)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0, position: 'sticky',
          top: 0, height: '100vh', overflow: 'hidden',
        }}>

          {/* Logo + colapsar */}
          <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 6 }}>
            {!collapsed && (
              <Link href="/dashboard" style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px', color: '#F9FAFB', textDecoration: 'none' }}>
                agenc<span style={{ color: '#FF6B00' }}>IA</span>me
              </Link>
            )}
            <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
              </svg>
            </button>
          </div>

          {/* Empresa con FOTO REAL de la industria */}
          {empresa && (
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Foto real de la industria como avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={empresaFoto}
                    alt={empresa.nombreEmpresa}
                    style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', border: `2px solid ${ind.color}40` }}
                  />
                  {/* Dot verde activo */}
                  <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#00E5A0', border: '2px solid #090C11' }} />
                </div>
                {!collapsed && (
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E5E7EB', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {empresa.nombreEmpresa}
                    </div>
                    <div style={{ fontSize: 11, color: '#374151', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>
                      {ind.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`sb-item${active ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}>
                  <img src={item.img} alt="" className="sb-thumb" />
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {!collapsed && active && <span className="sb-active-dot" />}
                </Link>
              );
            })}

            {esAdmin && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '8px 2px' }} />
                <Link href="/admin" className="sb-item" style={{ color: '#F59E0B' }}>
                  <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=48&q=80" alt="" className="sb-thumb" />
                  {!collapsed && <span>Super Admin</span>}
                </Link>
              </>
            )}
          </nav>

          {/* Footer: Configuración + Cerrar sesión */}
          <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Botón Guía — siempre visible, llama la atención */}
            <Link href="/dashboard/guia"
              className={`sb-item${router.pathname === '/dashboard/guia' ? ' active' : ''}`}
              style={{ background: router.pathname === '/dashboard/guia' ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>?</div>
              {!collapsed && <span style={{ color: '#60A5FA', fontWeight: 600 }}>¿Cómo funciona todo?</span>}
            </Link>

            <Link href="/dashboard/configuracion"
              className={`sb-item${router.pathname === '/dashboard/configuracion' ? ' active' : ''}`}>
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=48&q=80" alt="" className="sb-thumb" />
              {!collapsed && <span>Configuración</span>}
            </Link>

            {/* BOTÓN CERRAR SESIÓN — visible siempre, rojo */}
            <button onClick={handleLogout} className="sb-logout" title={collapsed ? 'Cerrar sesión' : undefined}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="db-main" style={{ flex: 1, overflow: 'auto', background: '#080B0F' }}>
          {/* Topbar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: 'rgba(8,11,15,0.94)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            padding: '0 32px', height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h1 className="db-topbar">{title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlanBadge plan={empresa?.plan} />
              {/* Avatar topbar con foto real */}
              <img
                src={INDUSTRY_PHOTOS[empresa?.industria] || INDUSTRY_PHOTOS.default}
                alt={empresa?.nombreEmpresa}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,229,160,0.25)' }}
              />
              {/* Cerrar sesión — siempre visible en topbar */}
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, padding: '6px 12px',
                  cursor: 'pointer', color: '#EF4444',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 600,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ padding: '28px 32px' }}>
            {children}
          </div>
        </main>
      </div>

      {/* Botón flotante de trial — visible en todo el dashboard */}
      <TrialFloatButton />
    </>
  );
}

function PlanBadge({ plan }) {
  const map = {
    emprendedor: { color: '#6B7280', label: 'Emprendedor' },
    profesional: { color: '#00E5A0', label: 'Profesional' },
    agencia:     { color: '#A78BFA', label: 'Agencia' },
  };
  const p = map[plan];
  if (!p) return null;
  return (
    <span style={{
      background: p.color + '15', color: p.color,
      border: `1px solid ${p.color}30`, borderRadius: 6,
      padding: '3px 10px', fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 0.6,
      fontFamily: "'Inter', sans-serif",
    }}>
      {p.label}
    </span>
  );
}
