// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getConversaciones, getCitas, getContactos, getAgentes } from '../../lib/firebase';
import { tiempoRelativo, formatHora, getIndustriaInfo, iniciales } from '../../lib/utils';

export default function Dashboard() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ conversaciones: 0, citas: 0, contactos: 0, agentes: 0 });
  const [conversaciones, setConversaciones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [convs, agts, conts, cits] = await Promise.all([
          getConversaciones(user.uid, 5),
          getAgentes(user.uid),
          getContactos(user.uid),
          getCitas(user.uid),
        ]);
        setConversaciones(convs);
        setCitas(cits.slice(0, 5));
        setStats({ conversaciones: convs.length, citas: cits.length, contactos: conts.length, agentes: agts.length });
      } catch (e) {
        console.error(e);
      } finally { setDataLoading(false); }
    };
    load();
  }, [user]);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const ind = getIndustriaInfo(empresa.industria);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const STAT_CARDS = [
    { label: 'Conversaciones hoy', value: stats.conversaciones, change: '+12% vs ayer', color: 'var(--accent)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    { label: 'Citas agendadas', value: stats.citas, change: 'Total activas', color: '#3B82F6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: 'Contactos en CRM', value: stats.contactos, change: 'Base de clientes', color: '#A29BFE', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { label: 'Agentes activos', value: stats.agentes, change: empresa.plan === 'emprendedor' ? 'Plan: 1 máx' : 'Funcionando', color: '#F97316', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg> },
  ];

  return (
    <>
      <Head><title>Panel — {empresa.nombreEmpresa} · BQinzagencIA</title></Head>
      <DashboardLayout title="Panel">
        {/* Welcome */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              {saludo}, {empresa.nombreEmpresa} {ind.icon}
            </h2>
            <p style={{ color: 'var(--gray5)', fontSize: 14 }}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link href="/dashboard/agentes" className="btn btn-accent">
            + Nuevo Agente IA
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          {STAT_CARDS.map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)' }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="dashboard-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent conversations */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Últimas conversaciones</h3>
              <Link href="/dashboard/conversaciones" style={{ color: 'var(--accent)', fontSize: 13 }}>Ver todas →</Link>
            </div>
            {dataLoading ? (
              <p style={{ color: 'var(--gray5)', fontSize: 14 }}>Cargando...</p>
            ) : conversaciones.length === 0 ? (
              <EmptyState icon="💬" text="Aún no hay conversaciones" sub="Activa tu agente IA para comenzar" />
            ) : conversaciones.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < conversaciones.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                  {iniciales(c.nombreCliente || 'CL')}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombreCliente || 'Cliente'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.ultimoTexto || 'Sin mensajes'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray5)', flexShrink: 0 }}>{tiempoRelativo(c.ultimoMensaje)}</div>
              </div>
            ))}
          </div>

          {/* Upcoming appointments */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700 }}>Próximas citas</h3>
              <Link href="/dashboard/agenda" style={{ color: 'var(--accent)', fontSize: 13 }}>Ver agenda →</Link>
            </div>
            {dataLoading ? (
              <p style={{ color: 'var(--gray5)', fontSize: 14 }}>Cargando...</p>
            ) : citas.length === 0 ? (
              <EmptyState icon="📅" text="No hay citas agendadas" sub="Tu agente IA agendará automáticamente" />
            ) : citas.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < citas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 44, textAlign: 'center', background: 'rgba(0,229,160,0.08)', borderRadius: 10, padding: '6px 4px', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Syne,sans-serif' }}>
                    {c.fechaHora?.toDate ? c.fechaHora.toDate().getDate() : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                    {c.fechaHora?.toDate ? c.fechaHora.toDate().toLocaleDateString('es-CO',{month:'short'}).toUpperCase() : ''}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nombreCliente || 'Cliente'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{c.servicio || 'Servicio'} · {formatHora(c.fechaHora)}</div>
                </div>
                <span className={'badge ' + (c.estado === 'confirmada' ? 'badge-active' : 'badge-trial')}>{c.estado || 'pendiente'}</span>
              </div>
            ))}
          </div>
        </div>

          <div style={{ marginTop: 24, background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Acciones rápidas</h3>
          <div className="quick-actions-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>, label: 'Crear agente IA', href: '/dashboard/agentes' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>, label: 'Agregar contacto', href: '/dashboard/crm' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Agendar cita', href: '/dashboard/agenda' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: 'Ver reportes', href: '/dashboard/reportes' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, label: 'Configurar negocio', href: '/dashboard/configuracion' },
            ].map((a, i) => (
              <Link key={i} href={a.href} className="btn btn-ghost" style={{ gap: 8 }}>
                {a.icon} {a.label}
              </Link>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
      <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{sub}</div>
    </div>
  );
}
