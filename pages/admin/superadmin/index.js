import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SUPERADMIN_UID = 'hs8aIu8mt6TLOlhda6DMR2s9Ir72';

const PLANES = ['starter', 'basico', 'pro', 'emprendedor'];

export default function Superadmin() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [tab, setTab] = useState('usuarios');
  const [stats, setStats] = useState({ total: 0, activos: 0, bloqueados: 0, conversaciones: 0 });
  const [busqueda, setBusqueda] = useState('');
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== SUPERADMIN_UID) {
        router.replace('/');
        return;
      }
      setAutorizado(true);
      cargarEmpresas();
    });
    return () => unsub();
  }, []);

  async function cargarEmpresas() {
    setCargando(true);
    try {
      const snap = await getDocs(query(collection(db, 'empresas'), orderBy('creadoEn', 'desc')));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEmpresas(data);
      setStats({
        total: data.length,
        activos: data.filter(e => e.estado === 'activo').length,
        bloqueados: data.filter(e => e.estado === 'bloqueado').length,
        conversaciones: data.reduce((a, e) => a + (e.conversacionesTotales || 0), 0),
      });
    } catch (e) {
      console.error(e);
    }
    setCargando(false);
  }

  async function cambiarEstado(id, estado) {
    await updateDoc(doc(db, 'empresas', id), { estado });
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, estado } : e));
    setStats(s => ({
      ...s,
      activos: estado === 'activo' ? s.activos + 1 : s.activos - 1,
      bloqueados: estado === 'bloqueado' ? s.bloqueados + 1 : s.bloqueados - 1,
    }));
  }

  async function cambiarPlan(id, plan) {
    await updateDoc(doc(db, 'empresas', id), { plan });
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, plan } : e));
  }

  async function eliminarEmpresa(id) {
    await deleteDoc(doc(db, 'empresas', id));
    setEmpresas(prev => prev.filter(e => e.id !== id));
    setConfirmar(null);
  }

  const filtradas = empresas.filter(e =>
    (e.email || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.nombreEmpresa || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!autorizado) return null;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>BQinzAgencIA <span style={s.badge}>SUPERADMIN</span></div>
        <button onClick={() => auth.signOut().then(() => router.push('/'))} style={s.logout}>Cerrar sesión</button>
      </div>

      <div style={s.container}>
        <h1 style={s.title}>Panel de Control</h1>

        {/* STATS */}
        <div style={s.statsGrid}>
          {[
            { label: 'Total usuarios', value: stats.total, color: '#FF6B00' },
            { label: 'Activos', value: stats.activos, color: '#22c55e' },
            { label: 'Bloqueados', value: stats.bloqueados, color: '#ef4444' },
            { label: 'Conversaciones', value: stats.conversaciones, color: '#3b82f6' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statNum, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={s.tabs}>
          {['usuarios', 'conversaciones', 'estadisticas'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* BUSQUEDA */}
        {tab === 'usuarios' && (
          <input
            placeholder="Buscar por email o empresa..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={s.search}
          />
        )}

        {/* TABLA USUARIOS */}
        {tab === 'usuarios' && (
          <div style={s.tableWrap}>
            {cargando ? <div style={s.empty}>Cargando...</div> : filtradas.length === 0 ? (
              <div style={s.empty}>No hay usuarios</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Empresa', 'Email', 'Plan', 'Estado', 'WhatsApp', 'Acciones'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(e => (
                    <tr key={e.id} style={s.tr}>
                      <td style={s.td}>{e.nombreEmpresa || '—'}</td>
                      <td style={s.td}>{e.email || '—'}</td>
                      <td style={s.td}>
                        <select
                          value={e.plan || 'starter'}
                          onChange={ev => cambiarPlan(e.id, ev.target.value)}
                          style={s.select}
                        >
                          {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: e.estado === 'activo' ? '#166534' : e.estado === 'bloqueado' ? '#7f1d1d' : '#374151' }}>
                          {e.estado || 'pendiente'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: e.whatsapp?.status === 'connected' ? '#166534' : '#374151' }}>
                          {e.whatsapp?.status === 'connected' ? '✓ Conectado' : 'Desconectado'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          {e.estado !== 'activo' && (
                            <button onClick={() => cambiarEstado(e.id, 'activo')} style={{ ...s.btn, background: '#166534' }}>Activar</button>
                          )}
                          {e.estado !== 'bloqueado' && (
                            <button onClick={() => cambiarEstado(e.id, 'bloqueado')} style={{ ...s.btn, background: '#92400e' }}>Bloquear</button>
                          )}
                          <button onClick={() => setConfirmar(e.id)} style={{ ...s.btn, background: '#7f1d1d' }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'estadisticas' && (
          <div style={s.statsDetail}>
            <h2 style={s.subtitle}>Resumen global</h2>
            <div style={s.statsGrid}>
              {[
                { label: 'Usuarios starter', value: empresas.filter(e => e.plan === 'starter').length },
                { label: 'Usuarios básico', value: empresas.filter(e => e.plan === 'basico').length },
                { label: 'Usuarios pro', value: empresas.filter(e => e.plan === 'pro').length },
                { label: 'WhatsApp activos', value: empresas.filter(e => e.whatsapp?.status === 'connected').length },
              ].map(st => (
                <div key={st.label} style={s.statCard}>
                  <div style={{ ...s.statNum, color: '#FF6B00' }}>{st.value}</div>
                  <div style={s.statLabel}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'conversaciones' && (
          <div style={s.empty}>
            Las conversaciones se ven en el panel de cada empresa.<br />
            Selecciona un usuario arriba para acceder a su cuenta.
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmar && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ color: 'white', marginBottom: 12 }}>¿Eliminar este usuario?</h3>
            <p style={{ color: '#9ca3af', marginBottom: 24 }}>Esta acción es irreversible. Se borrarán todos sus datos.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => eliminarEmpresa(confirmar)} style={{ ...s.btn, background: '#7f1d1d', padding: '10px 24px' }}>Eliminar</button>
              <button onClick={() => setConfirmar(null)} style={{ ...s.btn, background: '#374151', padding: '10px 24px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0d0f12', fontFamily: 'Inter, sans-serif' },
  header: { background: '#111318', borderBottom: '1px solid #1f2937', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', fontWeight: 700, fontSize: 18 },
  badge: { background: '#FF6B00', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 4, marginLeft: 8, fontWeight: 600 },
  logout: { background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  title: { color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 24 },
  subtitle: { color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 16 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: { background: '#111318', border: '1px solid #1f2937', borderRadius: 12, padding: '20px 24px' },
  statNum: { fontSize: 36, fontWeight: 700 },
  statLabel: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { background: 'transparent', border: '1px solid #1f2937', color: '#6b7280', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  tabActive: { background: '#FF6B00', border: '1px solid #FF6B00', color: 'white' },
  search: { width: '100%', background: '#111318', border: '1px solid #1f2937', borderRadius: 8, padding: '10px 16px', color: 'white', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#111318', color: '#6b7280', fontSize: 12, fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #1f2937' },
  tr: { borderBottom: '1px solid #1f2937' },
  td: { padding: '14px 16px', color: '#d1d5db', fontSize: 14 },
  pill: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, color: 'white', fontWeight: 500 },
  select: { background: '#1f2937', border: '1px solid #374151', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer' },
  actions: { display: 'flex', gap: 6 },
  btn: { border: 'none', color: 'white', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  empty: { color: '#6b7280', textAlign: 'center', padding: '48px 0', lineHeight: 2 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#111318', border: '1px solid #1f2937', borderRadius: 16, padding: '32px', maxWidth: 400, width: '100%' },
  statsDetail: {},
};
