// pages/admin/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { getTodasEmpresas } from '../../lib/firebase';
import { getIndustriaInfo, formatFecha, iniciales, formatPrecio, PLANES } from '../../lib/utils';
import { Logo } from '../index';
import toast from 'react-hot-toast';
import { logoutUser } from '../../lib/firebase';

export default function AdminPanel() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [planFiltro, setPlanFiltro] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard'); return; }
    }
  }, [user, esAdmin, loading]);

  useEffect(() => {
    if (esAdmin) getTodasEmpresas().then(e => { setEmpresas(e); setLoadingData(false); });
  }, [esAdmin]);

  const filtradas = empresas.filter(e => {
    const matchText = !filtro || e.nombreEmpresa?.toLowerCase().includes(filtro.toLowerCase()) || e.email?.toLowerCase().includes(filtro.toLowerCase());
    const matchPlan = !planFiltro || e.plan === planFiltro;
    return matchText && matchPlan;
  });

  const ingresos = empresas.reduce((sum, e) => sum + (PLANES[e.plan]?.precio || 0), 0);

  if (loading || !esAdmin) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Super Admin — NEXOIA</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
        {/* Admin nav */}
        <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--gray1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Logo size={20} />
            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>⚡ Super Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--gray5)', fontSize: 14 }}>{user?.email}</span>
            <button className="btn btn-ghost btn-sm" onClick={async () => { await logoutUser(); router.push('/'); }}>Salir</button>
          </div>
        </nav>

        <div style={{ padding: '40px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'Total empresas', value: empresas.length, color: '#00E5A0', icon: '🏢' },
              { label: 'Plan Emprendedor', value: empresas.filter(e => e.plan === 'emprendedor').length, color: '#6B7280', icon: '🌱' },
              { label: 'Plan Profesional', value: empresas.filter(e => e.plan === 'profesional').length, color: '#00E5A0', icon: '⭐' },
              { label: 'Plan Agencia', value: empresas.filter(e => e.plan === 'agencia').length, color: '#A29BFE', icon: '🚀' },
              { label: 'MRR estimado', value: formatPrecio(ingresos), color: '#F59E0B', icon: '💰' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)' }}>{s.label}</span>
                  <span>{s.icon}</span>
                </div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: i === 4 ? 20 : 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, flex: 1 }}>Empresas suscritas ({filtradas.length})</h2>
            <input className="form-input" placeholder="🔍 Buscar empresa o correo..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 260, borderRadius: 100 }} />
            <select className="form-input" value={planFiltro} onChange={e => setPlanFiltro(e.target.value)} style={{ width: 160, borderRadius: 100 }}>
              <option value="">Todos los planes</option>
              <option value="emprendedor">Emprendedor</option>
              <option value="profesional">Profesional</option>
              <option value="agencia">Agencia</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
            {loadingData ? (
              <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : filtradas.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray5)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
                <p>No hay empresas registradas aún</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Empresa</th><th>Industria</th><th>Plan</th><th>Ciudad</th><th>Contacto</th><th>Registrado</th><th>Estado</th>
                  </tr></thead>
                  <tbody>
                    {filtradas.map((emp) => {
                      const ind = getIndustriaInfo(emp.industria);
                      const planColors = { emprendedor: '#6B7280', profesional: '#00E5A0', agencia: '#A29BFE' };
                      return (
                        <tr key={emp.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: ind.color + '22', color: ind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{iniciales(emp.nombreEmpresa)}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--white)' }}>{emp.nombreEmpresa || '—'}</div>
                                <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{ind.label}</td>
                          <td>
                            <span style={{ background: (planColors[emp.plan] || '#6B7280') + '22', color: planColors[emp.plan] || '#6B7280', border: `1px solid ${(planColors[emp.plan] || '#6B7280')}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                              {emp.plan || 'emprendedor'}
                            </span>
                          </td>
                          <td style={{ fontSize: 13 }}>{emp.ciudad || '—'}</td>
                          <td style={{ fontSize: 13 }}>{emp.telefono || '—'}</td>
                          <td style={{ fontSize: 12 }}>{formatFecha(emp.creadoEn)}</td>
                          <td>
                            <span className={'badge ' + (emp.planActivo ? 'badge-active' : 'badge-inactive')}>
                              {emp.planActivo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
