// components/layout/DashboardLayout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { logoutUser } from '../../lib/firebase';
import { getIndustriaInfo, iniciales } from '../../lib/utils';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/dashboard/agentes',
    label: 'Mis Agentes IA',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M15 3.5a3 3 0 0 1 0 5"/></svg>,
  },
  {
    href: '/dashboard/conversaciones',
    label: 'Conversaciones',
    img: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    href: '/dashboard/crm',
    label: 'Clientes / CRM',
    img: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/dashboard/agenda',
    label: 'Agenda',
    img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    href: '/dashboard/web',
    label: 'Mi Web',
    img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/></svg>,
  },
  {
    href: '/dashboard/reportes',
    label: 'Reportes',
    img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    href: '/dashboard/voz',
    label: 'Voz IA',
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  },
  {
    href: '/dashboard/conocimiento',
    label: 'Conocimiento',
    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    href: '/dashboard/widget',
    label: 'Widget Web',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=48&q=80',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  },
];

export default function DashboardLayout({ children, title }) {
  const { empresa, esAdmin } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const ind = getIndustriaInfo(empresa?.industria);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Sesión cerrada');
    router.push('/');
    setTimeout(() => window.location.href = '/', 300);
  };

  const F = "'Inter', system-ui, -apple-system, sans-serif";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .sb-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 10px; border-radius: 8px; margin-bottom: 1px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px; font-weight: 500;
          color: #6B7280; text-decoration: none;
          transition: all 0.15s ease; border: 1px solid transparent;
          position: relative; overflow: hidden;
        }
        .sb-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #E5E7EB;
          border-color: rgba(255,255,255,0.06);
        }
        .sb-nav-item.active {
          background: rgba(0,229,160,0.08);
          color: #F9FAFB;
          border-color: rgba(0,229,160,0.15);
        }
        .sb-nav-item.active .sb-nav-dot { background: #00E5A0; }
        .sb-img-thumb {
          width: 24px; height: 24px; border-radius: 5px;
          object-fit: cover; flex-shrink: 0;
          opacity: 0.7; transition: opacity 0.15s;
        }
        .sb-nav-item:hover .sb-img-thumb,
        .sb-nav-item.active .sb-img-thumb { opacity: 1; }
        .sb-nav-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: transparent; flex-shrink: 0;
          position: absolute; left: 6px;
        }
        .sb-btn { background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:10px; width:100%; padding:7px 10px; border-radius:8px; font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:500; color:#6B7280; transition: all 0.15s; }
        .sb-btn:hover { background:rgba(255,255,255,0.05); color:#E5E7EB; }
        .db-topbar-title { font-family:'Inter',system-ui,sans-serif; font-size:17px; font-weight:700; letter-spacing:-0.3px; color:#F9FAFB; }
        .db-content { font-family:'Inter',system-ui,sans-serif; }
      `}} />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#080B0F' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: collapsed ? 56 : 220,
          background: '#0A0D12',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0, position: 'sticky',
          top: 0, height: '100vh', overflow: 'hidden',
          fontFamily: F,
        }}>

          {/* Logo */}
          <div style={{ padding: '16px 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
            {!collapsed && (
              <Link href="/dashboard" style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px', color: '#F9FAFB', textDecoration: 'none' }}>
                agenc<span style={{ color: '#FF6B00' }}>IA</span>me
              </Link>
            )}
            <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {collapsed ? <><polyline points="9 18 15 12 9 6"/></> : <><polyline points="15 18 9 12 15 6"/></>}
              </svg>
            </button>
          </div>

          {/* Empresa info */}
          {!collapsed && empresa && (
            <div style={{ padding: '0 10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: ind.color + '20', color: ind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: F }}>
                  {iniciales(empresa.nombreEmpresa)}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: F }}>{empresa.nombreEmpresa}</div>
                  <div style={{ fontSize: 11, color: '#374151', fontFamily: F, marginTop: 1 }}>{ind.label}</div>
                </div>
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`sb-nav-item${active ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}>
                  <span className="sb-nav-dot" />
                  {/* Imagen thumbnail del menú */}
                  <img
                    src={item.img}
                    alt=""
                    className="sb-img-thumb"
                    style={{ display: collapsed ? 'block' : 'block' }}
                  />
                  {!collapsed && (
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  )}
                </Link>
              );
            })}

            {esAdmin && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '8px 2px' }} />
                <Link href="/admin" className="sb-nav-item" style={{ color: '#F59E0B' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  {!collapsed && <span>Super Admin</span>}
                </Link>
              </>
            )}
          </nav>

          {/* Footer nav */}
          <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <Link href="/dashboard/configuracion" className="sb-nav-item"
              style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#6B7280', transition: 'all 0.15s', border: '1px solid transparent' }}>
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=48&q=80" alt="" className="sb-img-thumb" />
              {!collapsed && <span>Configuración</span>}
            </Link>
            <button onClick={handleLogout} className="sb-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="db-content" style={{ flex: 1, overflow: 'auto', background: '#080B0F' }}>
          {/* Topbar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: 'rgba(8,11,15,0.94)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            padding: '0 32px', height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h1 className="db-topbar-title">{title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PlanBadge plan={empresa?.plan} />
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#141820', border: '1.5px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00E5A0', fontFamily: F }}>
                {iniciales(empresa?.nombreEmpresa || 'U')}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: '28px 32px' }}>
            {children}
          </div>
        </main>
      </div>
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
      border: `1px solid ${p.color}30`,
      borderRadius: 6, padding: '3px 10px',
      fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 0.6,
      fontFamily: "'Inter', sans-serif",
    }}>
      {p.label}
    </span>
  );
}
