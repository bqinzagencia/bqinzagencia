// components/layout/DashboardLayout.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { logoutUser } from '../../lib/firebase';
import { getIndustriaInfo, iniciales } from '../../lib/utils';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/dashboard/agentes', icon: '🤖', label: 'Mis Agentes IA' },
  { href: '/dashboard/conversaciones', icon: '💬', label: 'Conversaciones' },
  { href: '/dashboard/crm', icon: '👥', label: 'Clientes / CRM' },
  { href: '/dashboard/agenda', icon: '📅', label: 'Agenda' },
  { href: '/dashboard/web', icon: '🌐', label: 'Mi Web' },
  { href: '/dashboard/reportes', icon: '📊', label: 'Reportes' },
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
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--black)' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 64 : 230,
        background: 'var(--gray1)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          {!collapsed && (
            <Link href="/dashboard" style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800 }}>
              NEX<span style={{ color: 'var(--accent)' }}>OIA</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: 'var(--gray5)', cursor: 'pointer', fontSize: 18, padding: 4, marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Empresa info */}
        {!collapsed && empresa && (
          <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: ind.color + '22', color: ind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
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
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = router.pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
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
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard/configuracion" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, color: 'var(--gray5)', textDecoration: 'none', marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
            {!collapsed && 'Configuración'}
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, color: 'var(--gray5)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <span style={{ fontSize: 16 }}>🚪</span>
            {!collapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--black)' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(8,11,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700 }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlanBadge plan={empresa?.plan} />
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gray2)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
              {iniciales(empresa?.nombreEmpresa || 'U')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function PlanBadge({ plan }) {
  const colors = { emprendedor: '#6B7280', profesional: '#00E5A0', agencia: '#A29BFE' };
  const labels = { emprendedor: 'Emprendedor', profesional: 'Profesional', agencia: 'Agencia' };
  if (!plan) return null;
  return (
    <span style={{ background: colors[plan] + '22', color: colors[plan], border: `1px solid ${colors[plan]}44`, borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {labels[plan] || plan}
    </span>
  );
}
