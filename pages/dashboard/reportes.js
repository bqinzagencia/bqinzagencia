// pages/dashboard/reportes.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getConversaciones, getCitas, getContactos } from '../../lib/firebase';

export default function Reportes() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ conversaciones: [], citas: [], contactos: [] });
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  useEffect(() => {
    if (user) Promise.all([
      getConversaciones(user.uid, 100),
      getCitas(user.uid),
      getContactos(user.uid),
    ]).then(([c, ci, co]) => setData({ conversaciones: c, citas: ci, contactos: co }));
  }, [user]);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const stats = [
    { icon: '💬', label: 'Total conversaciones', value: data.conversaciones.length, color: '#00E5A0', sub: 'Atendidas por tu agente IA' },
    { icon: '📅', label: 'Citas agendadas', value: data.citas.length, color: '#3B82F6', sub: data.citas.filter(c => c.estado === 'completada').length + ' completadas' },
    { icon: '👥', label: 'Contactos en CRM', value: data.contactos.length, color: '#A29BFE', sub: data.contactos.filter(c => c.estado === 'cliente').length + ' clientes activos' },
    { icon: '📈', label: 'Tasa de conversión', value: data.contactos.length ? Math.round((data.contactos.filter(c => c.estado === 'cliente').length / data.contactos.length) * 100) + '%' : '—', color: '#F97316', sub: 'Leads → Clientes' },
  ];

  const byEstado = ['nuevo','contactado','prospecto','cliente','inactivo'].map(e => ({
    estado: e, count: data.contactos.filter(c => c.estado === e).length,
  }));
  const maxCount = Math.max(...byEstado.map(b => b.count), 1);

  const estadoColors = { nuevo: '#3B82F6', contactado: '#F59E0B', prospecto: '#8B5CF6', cliente: '#00E5A0', inactivo: '#6B7280' };
  const estadoLabels = { nuevo: 'Nuevos', contactado: 'Contactados', prospecto: 'Prospectos', cliente: 'Clientes', inactivo: 'Inactivos' };

  return (
    <>
      <Head><title>Reportes — BQinzagencIA</title></Head>
      <DashboardLayout title="Reportes y Analytics">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)', alignSelf: 'flex-start' }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="reportes-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* CRM Pipeline */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Pipeline de clientes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byEstado.map(b => (
                <div key={b.estado}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: estadoColors[b.estado] }}>{estadoLabels[b.estado]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{b.count}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray2)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${(b.count / maxCount) * 100}%`, background: estadoColors[b.estado], borderRadius: 4, transition: 'width 0.6s ease', minWidth: b.count > 0 ? 8 : 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citas por estado */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Estado de citas</h3>
            {data.citas.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray5)', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                <p>Sin citas registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['confirmada','completada','pendiente','cancelada'].map(est => {
                  const count = data.citas.filter(c => (c.estado || 'confirmada') === est).length;
                  const colors = { confirmada: '#00E5A0', completada: '#3B82F6', pendiente: '#F59E0B', cancelada: '#EF4444' };
                  const labels = { confirmada: 'Confirmadas', completada: 'Completadas', pendiente: 'Pendientes', cancelada: 'Canceladas' };
                  return (
                    <div key={est}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: colors[est] }}>{labels[est]}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--gray2)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${(count / data.citas.length) * 100}%`, background: colors[est], borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, gridColumn: '1/-1' }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Resumen de actividad</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              {[
                { label: 'Agente IA activo', value: '24/7', icon: '🤖', color: '#00E5A0' },
                { label: 'Tiempo de respuesta', value: '< 2 seg', icon: '⚡', color: '#F59E0B' },
                { label: 'Satisfacción estimada', value: '94%', icon: '⭐', color: '#A29BFE' },
                { label: 'Horas ahorradas', value: `${data.conversaciones.length * 3} min`, icon: '⏱️', color: '#3B82F6' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.color + '08', border: `1px solid ${s.color}22`, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
