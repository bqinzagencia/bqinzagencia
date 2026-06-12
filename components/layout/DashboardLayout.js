// components/layout/DashboardLayout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { logoutUser } from '../../lib/firebase';
import { getIndustriaInfo, iniciales } from '../../lib/utils';
import toast from 'react-hot-toast';

// SVG icons para el nav — sin emojis
const NAV_ITEMS = [
  { href: '/dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, label: 'Panel' },
  { href: '/wasapbot', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>, label: 'WasapBot', whatsapp: true },
  { href: '/dashboard/agentes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="17" cy="10" r="3" fill="currentColor" opacity="0.3"/></svg>, label: 'Mis Agentes IA' },
  { href: '/dashboard/conversaciones', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, label: 'Conversaciones' },
  { href: '/dashboard/crm', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, label: 'Clientes / CRM' },
  { href: '/dashboard/agenda', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Agenda' },
  { href: '/dashboard/web', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, label: 'Mi Web' },
  { href: '/dashboard/reportes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: 'Reportes' },
  { href: '/dashboard/voz', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, label: 'Voz IA' },
  { href: '/dashboard/conocimiento', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>, label: 'Base de conocimiento' },
  { href: '/dashboard/whatsapp', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label: 'WhatsApp Bot', whatsapp: true },
];

export default function DashboardLayout({ children, title }) {
  const { empresa, esAdmin } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ind = getIndustriaInfo(empresa?.industria);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const SidebarContent = () => (
    <aside style={{
      width: collapsed ? 64 : 230,
      background: 'var(--gray1)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s',
      flexShrink: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        {!collapsed && (
          <Link href="/dashboard" style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800 }}>
            <span style={{ color: '#FFFFFF' }}>BQinz</span><span style={{ color: '#FF6B00' }}>agenc</span><span style={{ color: '#FFFFFF' }}>IA</span>
          </Link>
        )}
        <button onClick={() => { setCollapsed(c => !c); setMobileOpen(false); }}
          style={{ background: 'none', border: 'none', color: 'var(--gray5)', cursor: 'pointer', fontSize: 18, padding: 4, marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Empresa info */}
      {!collapsed && empresa && (
        <div style={{ padding: '0 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: ind.color + '22', color: ind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {iniciales(empresa.nombreEmpresa)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{empresa.nombreEmpresa}</div>
              <div style={{ fontSize: 11, color: 'var(--gray5)' }}>{ind.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 13, fontWeight: 500,
                color: active ? 'var(--white)' : 'var(--gray5)',
                background: active ? 'rgba(0,229,160,0.1)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          );
        })}

        {esAdmin && (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 4px' }} />
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--warning)', textDecoration: 'none' }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              {!collapsed && 'Super Admin'}
            </Link>
          </>
        )}
      </nav>

      {/* Settings & Logout */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard/configuracion" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, color: 'var(--gray5)', textDecoration: 'none', marginBottom: 2 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          {!collapsed && 'Configuración'}
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, color: 'var(--gray5)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--black)' }}>

      {/* Sidebar desktop — sticky */}
      <div className="sidebar-desktop" style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <SidebarContent />
      </div>

      {/* Sidebar móvil — overlay */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 160, overflowY: 'auto' }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* MAIN */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--black)', minWidth: 0 }}>
        {/* Top bar */}
        <div className="dashboard-topbar" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(8,11,15,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} style={{ display: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700 }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PlanBadge plan={empresa?.plan} />
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gray2)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
              {iniciales(empresa?.nombreEmpresa || 'U')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-main" style={{ padding: '28px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function PlanBadge({ plan }) {
  const colors = { emprendedor: '#6B7280', profesional: '#00E5A0', agencia: '#A29BFE' };
  const labels = { emprendedor: 'Emprendedor', profesional: 'Profesional', agencia: 'Agencia' };
  if (!plan) return null;
  return (
    <span style={{ background: colors[plan] + '22', color: colors[plan], border: `1px solid ${colors[plan]}44`, borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
      {labels[plan] || plan}
    </span>
  );
}
