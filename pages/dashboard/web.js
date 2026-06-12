// pages/dashboard/web.js
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa, db } from '../../lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

const NARANJA = '#FF6B00';

// ── Plantillas completas ───────────────────────────────────────────────────────
const PLANTILLAS = [
  { id: 'estetica',         nombre: 'Centro de Estética',   emoji: '💆', color: '#EC4899', desc: 'Faciales, depilación, tratamientos corporales' },
  { id: 'salon',            nombre: 'Salón de Belleza',      emoji: '✂️', color: '#F472B6', desc: 'Cortes, color, keratina, manicura' },
  { id: 'spa',              nombre: 'Spa & Masajes',         emoji: '🧖', color: '#A78BFA', desc: 'Masajes, hidroterapia, aromaterapia' },
  { id: 'dental',           nombre: 'Clínica Dental',        emoji: '🦷', color: '#3B82F6', desc: 'Limpieza, ortodoncia, implantes' },
  { id: 'medicina-estetica',nombre: 'Medicina Estética',     emoji: '💉', color: '#8B5CF6', desc: 'Bótox, rellenos, láser, radiofrecuencia' },
  { id: 'peluqueria',       nombre: 'Peluquería',            emoji: '💈', color: '#EAB308', desc: 'Cortes, tintes, tratamientos capilares' },
  { id: 'gimnasio',         nombre: 'Gimnasio / Fitness',    emoji: '🏋️', color: '#F97316', desc: 'Membresías, clases, entrenamiento personal' },
  { id: 'salud',            nombre: 'Clínica / Salud',       emoji: '🏥', color: '#14B8A6', desc: 'Consultas médicas, diagnóstico, seguimiento' },
  { id: 'restaurante',      nombre: 'Restaurante / Café',    emoji: '🍽️', color: '#F59E0B', desc: 'Reservas, carta online, delivery' },
  { id: 'inmobiliaria',     nombre: 'Inmobiliaria',          emoji: '🏠', color: '#10B981', desc: 'Propiedades, visitas, leads automáticos' },
  { id: 'tienda',           nombre: 'Tienda / Retail',       emoji: '🛒', color: '#06B6D4', desc: 'Catálogo, pedidos, atención 24/7' },
  { id: 'generico',         nombre: 'Profesional General',   emoji: '🏢', color: '#6366F1', desc: 'Diseño adaptable a cualquier negocio' },
];

// ── Fotos por plantilla ────────────────────────────────────────────────────────
const FOTOS = {
  estetica:          ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&q=85','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1400&q=85','https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1400&q=85'],
  salon:             ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=85','https://images.unsplash.com/photo-1560066984-138daaa5f571?w=1400&q=85','https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1400&q=85'],
  spa:               ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=85','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1400&q=85','https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1400&q=85'],
  dental:            ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1400&q=85','https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1400&q=85','https://images.unsplash.com/photo-1588776814546-1ffedaefe0a9?w=1400&q=85'],
  'medicina-estetica':['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1400&q=85','https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=85','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85'],
  peluqueria:        ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1400&q=85','https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1400&q=85','https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=1400&q=85'],
  gimnasio:          ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85','https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=85','https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=85'],
  salud:             ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=85','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=85','https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=85'],
  restaurante:       ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85','https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&q=85'],
  inmobiliaria:      ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=85','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=85'],
  tienda:            ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1400&q=85','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=85','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1400&q=85'],
  generico:          ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85','https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&q=85','https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85'],
};

// ── Servicios sugeridos por plantilla ─────────────────────────────────────────
const SERVICIOS_SUGERIDOS = {
  estetica:          ['Limpieza facial profunda', 'Depilación láser', 'Tratamiento antiedad', 'Peeling químico', 'Microblading'],
  salon:             ['Corte y peinado', 'Coloración y mechas', 'Keratina brasileña', 'Manicura y pedicura', 'Tratamiento capilar'],
  spa:               ['Masaje relajante', 'Masaje deportivo', 'Hidroterapia', 'Aromaterapia', 'Envoltura corporal'],
  dental:            ['Limpieza bucal', 'Ortodoncia invisible', 'Blanqueamiento dental', 'Implantes dentales', 'Revisión gratuita'],
  'medicina-estetica':['Bótox y rellenos', 'Láser rejuvenecedor', 'Radiofrecuencia', 'Mesoterapia facial', 'Plasma rico en plaquetas'],
  peluqueria:        ['Corte de pelo', 'Tinte y coloración', 'Permanente', 'Alisado japonés', 'Tratamiento hidratante'],
  gimnasio:          ['Membresía mensual', 'Entrenamiento personal', 'Clases de yoga', 'Crossfit', 'Nutrición deportiva'],
  salud:             ['Consulta médica', 'Análisis clínicos', 'Revisión general', 'Seguimiento crónico', 'Pediatría'],
  restaurante:       ['Menú del día', 'Reserva de mesa', 'Carta a la carta', 'Eventos privados', 'Delivery a domicilio'],
  inmobiliaria:      ['Compra de inmuebles', 'Alquiler residencial', 'Alquiler comercial', 'Tasación gratuita', 'Gestión de alquileres'],
  tienda:            ['Consulta de stock', 'Pedido online', 'Envío a domicilio', 'Devoluciones', 'Atención al cliente'],
  generico:          ['Servicio principal', 'Consulta inicial', 'Pack completo', 'Asesoría personalizada', 'Seguimiento'],
};

// ── Preview del navegador ──────────────────────────────────────────────────────
function WebPreview({ datos, plantilla }) {
  if (!plantilla) return null;
  const fotos = FOTOS[plantilla.id] || FOTOS.generico;
  const foto = datos.fotoHero || fotos[0];
  const color = plantilla.color;

  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 32px 64px rgba(0,0,0,0.5)', background: '#fff' }}>
      {/* Barra del navegador */}
      <div style={{ background: '#1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#2d2d4e', borderRadius: 6, padding: '5px 14px', fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
          🔒 bqinzagencia.com/{(datos.nombreEmpresa || 'tu-empresa').toLowerCase().replace(/\s+/g,'-')}
        </div>
        <div style={{ fontSize: 11, color: '#4B5563', background: '#22C55E20', color: '#22C55E', padding: '2px 10px', borderRadius: 100, fontWeight: 700 }}>● ACTIVA</div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        <img src={foto} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.45) 55%,rgba(0,0,0,0.1) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>{datos.nombreEmpresa || 'Tu Empresa'}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            {['Servicios','Nosotros','Contacto'].map(l => <span key={l}>{l}</span>)}
          </div>
          <div style={{ background: color, color: '#fff', borderRadius: 100, padding: '6px 16px', fontSize: 11, fontWeight: 700 }}>Reservar cita</div>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: 24, right: '42%' }}>
          <div style={{ background: color, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            {plantilla.emoji} {datos.ciudad || 'España'}
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1.15, marginBottom: 10, letterSpacing: '-0.5px' }}>
            {datos.titular || `Bienvenidos a ${datos.nombreEmpresa || 'tu empresa'}`}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: 1.6, marginBottom: 14 }}>
            {datos.descripcion || plantilla.desc}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: color, color: '#fff', borderRadius: 100, padding: '8px 18px', fontSize: 10, fontWeight: 700 }}>Reservar cita →</div>
            <div style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '8px 18px', fontSize: 10, fontWeight: 600 }}>💬 WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div style={{ padding: '28px 24px', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Nuestros servicios</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#111', letterSpacing: '-0.5px' }}>¿En qué podemos ayudarte?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {(datos.servicios || SERVICIOS_SUGERIDOS[plantilla.id] || []).slice(0, 3).map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: `1px solid ${i === 0 ? color + '40' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{['💆','✨','⭐'][i]}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 11, color: '#111', marginBottom: 4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#111', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 12, color: '#fff', marginBottom: 2 }}>{datos.nombreEmpresa || 'Tu Empresa'}</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>📍 {datos.ciudad || 'España'} · {datos.telefono || '+34 600 000 000'}</div>
        </div>
        <div style={{ background: color, color: '#fff', borderRadius: 100, padding: '8px 20px', fontSize: 10, fontWeight: 700 }}>Contáctanos →</div>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef(null);

  const [paso, setPaso] = useState(1); // 1=plantilla, 2=editor, 3=publicar
  const [plantillaId, setPlantillaId] = useState('');
  const [fotoIdx, setFotoIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabEditor, setTabEditor] = useState('general'); // general | servicios | fotos | contacto

  // Datos editables de la web
  const [datos, setDatos] = useState({
    nombreEmpresa: '',
    titular: '',
    descripcion: '',
    ciudad: '',
    telefono: '',
    email: '',
    horario: '',
    whatsapp: '',
    instagram: '',
    servicios: [],
    fotoHero: null,
  });

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (empresa) {
      setDatos(d => ({
        ...d,
        nombreEmpresa: empresa.nombreEmpresa || '',
        ciudad: empresa.ciudad || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        titular: empresa.webTitular || '',
        descripcion: empresa.webDescripcion || '',
        horario: empresa.horario || 'Lunes–Sábado 9:00–20:00h',
        whatsapp: empresa.whatsapp || empresa.telefono || '',
        instagram: empresa.instagram || '',
        servicios: empresa.webServicios || [],
        fotoHero: empresa.fotoHeroPersonalizada || null,
      }));
      if (empresa.plantillaWeb) {
        setPlantillaId(empresa.plantillaWeb);
        setPaso(2);
      }
    }
  }, [empresa]);

  const plantilla = PLANTILLAS.find(p => p.id === plantillaId);
  const fotos = FOTOS[plantillaId] || FOTOS.generico;
  const serviciosSugeridos = SERVICIOS_SUGERIDOS[plantillaId] || SERVICIOS_SUGERIDOS.generico;

  // Actualizar campo de datos
  function set(campo, valor) { setDatos(d => ({ ...d, [campo]: valor })); }

  // Subir foto a Firebase Storage
  async function subirFoto(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('La foto no puede superar 8 MB'); return; }
    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `webs/${user.uid}/hero_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      set('fotoHero', url);
      toast.success('✅ Foto subida correctamente');
    } catch (e) {
      // Fallback: base64 si Storage falla
      const reader = new FileReader();
      reader.onload = ev => { set('fotoHero', ev.target.result); toast.success('Foto cargada'); };
      reader.readAsDataURL(file);
    }
    setUploading(false);
  }

  // Guardar todo en Firestore
  async function guardar(publicar = false) {
    setSaving(true);
    try {
      await updateEmpresa(user.uid, {
        plantillaWeb: plantillaId,
        webTitular: datos.titular,
        webDescripcion: datos.descripcion,
        webServicios: datos.servicios,
        fotoHeroPersonalizada: datos.fotoHero || null,
        ciudad: datos.ciudad,
        telefono: datos.telefono,
        email: datos.email,
        horario: datos.horario,
        whatsapp: datos.whatsapp,
        instagram: datos.instagram,
        webPublicada: true,
      });
      toast.success(publicar ? '🎉 ¡Web publicada con éxito!' : '✅ Cambios guardados');
      if (publicar) setPaso(3);
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  }

  const slugEmpresa = (empresa?.nombreEmpresa || datos.nombreEmpresa || 'mi-empresa')
    .toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const urlPublica = `https://www.bqinzagencia.com/${slugEmpresa}`;
  const urlLocal   = `http://localhost:3000/${slugEmpresa}`;

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Mi Web — BQinzagencIA</title></Head>
      <DashboardLayout title="Mi Página Web">

        {/* ── Stepper ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {[{ n: 1, label: 'Plantilla' }, { n: 2, label: 'Personalizar' }, { n: 3, label: 'Publicar' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: paso > s.n ? 'pointer' : 'default' }}
                onClick={() => paso > s.n && setPaso(s.n)}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: paso > s.n ? '#22C55E' : paso === s.n ? NARANJA : 'var(--gray2)', border: `2px solid ${paso >= s.n ? (paso > s.n ? '#22C55E' : NARANJA) : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', transition: 'all 0.3s' }}>
                  {paso > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: paso >= s.n ? '#FAFAF8' : '#4B5563' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ width: 80, height: 2, background: paso > s.n ? '#22C55E' : 'rgba(255,255,255,0.07)', margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* ── PASO 1: Elegir plantilla ── */}
        {paso === 1 && (
          <div>
            <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 28 }}>
              Elige el tipo de negocio que mejor describe tu actividad. El diseño, fotos y textos se adaptarán automáticamente.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 36 }}>
              {PLANTILLAS.map(p => (
                <div key={p.id} onClick={() => setPlantillaId(p.id)}
                  style={{ background: plantillaId === p.id ? p.color + '18' : 'var(--gray1)', border: `2px solid ${plantillaId === p.id ? p.color : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  onMouseEnter={e => { if (plantillaId !== p.id) e.currentTarget.style.borderColor = p.color + '55'; }}
                  onMouseLeave={e => { if (plantillaId !== p.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{p.emoji}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, color: plantillaId === p.id ? p.color : 'var(--white)', marginBottom: 5 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray5)', lineHeight: 1.5 }}>{p.desc}</div>
                  {plantillaId === p.id && <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800 }}>✓</div>}
                </div>
              ))}
            </div>

            {plantilla && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray5)' }}>
                  Preview — <span style={{ color: plantilla.color }}>{plantilla.nombre}</span>
                </h3>
                <WebPreview datos={datos} plantilla={plantilla} />
              </div>
            )}

            <button className="btn btn-accent btn-lg" disabled={!plantillaId || saving}
              onClick={() => { if (plantillaId) { if (datos.servicios.length === 0) set('servicios', SERVICIOS_SUGERIDOS[plantillaId] || []); setPaso(2); } }}>
              Continuar — Personalizar mi web →
            </button>
          </div>
        )}

        {/* ── PASO 2: Editor ── */}
        {paso === 2 && plantilla && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 32, alignItems: 'start' }}>

            {/* Panel izquierdo — Editor */}
            <div>
              {/* Barra de estado activa */}
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>Tu web está activa</span>
                  <span style={{ fontSize: 12, color: 'var(--gray5)' }}>Plantilla: {plantilla.emoji} {plantilla.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? urlLocal : urlPublica}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#22C55E', color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    🜍 Ver web
                  </a>
                  <button onClick={() => setPaso(1)}
                    style={{ background: 'var(--gray2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Cambiar plantilla
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(urlPublica); toast.success('¡URL copiada!'); }}
                    style={{ background: 'var(--gray2)', color: 'var(--gray5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
                    📋 Copiar URL
                  </button>
                </div>
              </div>
              {/* Tabs del editor */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--gray1)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                {[
                  { id: 'general', label: '📝 Textos' },
                  { id: 'servicios', label: '⭐ Servicios' },
                  { id: 'fotos', label: '📸 Fotos' },
                  { id: 'contacto', label: '📞 Contacto' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTabEditor(t.id)}
                    style={{ flex: 1, background: tabEditor === t.id ? NARANJA : 'transparent', color: tabEditor === t.id ? '#fff' : 'var(--gray5)', border: 'none', borderRadius: 8, padding: '9px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab: Textos generales */}
              {tabEditor === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>Información principal</h3>
                  {[
                    { label: 'Nombre del negocio', campo: 'nombreEmpresa', placeholder: 'Ej: Centro Estético Lumina' },
                    { label: 'Titular del hero (frase impactante)', campo: 'titular', placeholder: 'Ej: Tu centro de estética de confianza en Madrid' },
                  ].map(f => (
                    <div key={f.campo}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
                      <input value={datos[f.campo]} onChange={e => set(f.campo, e.target.value)} placeholder={f.placeholder}
                        style={{ width: '100%', background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = NARANJA}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Descripción del negocio</label>
                    <textarea value={datos.descripcion} onChange={e => set('descripcion', e.target.value)}
                      placeholder="Ej: Somos un centro de estética especializado en tratamientos faciales y corporales. Atendemos con cita previa y nuestro agente IA está disponible 24h para reservas."
                      rows={4} style={{ width: '100%', background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = NARANJA}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                </div>
              )}

              {/* Tab: Servicios */}
              {tabEditor === 'servicios' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>Tus servicios</h3>
                    <button onClick={() => set('servicios', [...datos.servicios, ''])}
                      style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      + Añadir
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {datos.servicios.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', color: NARANJA, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i+1}</span>
                        <input value={s} onChange={e => { const arr = [...datos.servicios]; arr[i] = e.target.value; set('servicios', arr); }}
                          placeholder={`Servicio ${i+1}`}
                          style={{ flex: 1, background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--white)', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = NARANJA}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                        <button onClick={() => set('servicios', datos.servicios.filter((_, j) => j !== i))}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)', marginBottom: 10, fontWeight: 600 }}>💡 Sugerencias para {plantilla.nombre}:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {serviciosSugeridos.filter(s => !datos.servicios.includes(s)).map(s => (
                        <button key={s} onClick={() => set('servicios', [...datos.servicios, s])}
                          style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--gray5)', borderRadius: 100, padding: '5px 14px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = NARANJA; e.currentTarget.style.color = NARANJA; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--gray5)'; }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Fotos */}
              {tabEditor === 'fotos' && (
                <div>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Foto de portada</h3>
                  <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20 }}>Sube una foto de tu negocio o elige una de nuestras fotos profesionales del sector.</p>

                  <input ref={fileRef} type="file" accept="image/*" onChange={e => subirFoto(e.target.files?.[0])} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      style={{ background: 'linear-gradient(135deg,#FF6B00,#FF9A3C)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: uploading ? 0.7 : 1 }}>
                      {uploading ? '⏳ Subiendo...' : '📤 Subir foto de mi negocio'}
                    </button>
                    {datos.fotoHero && (
                      <button onClick={() => set('fotoHero', null)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '11px 16px', fontSize: 13, cursor: 'pointer' }}>
                        ✕ Quitar
                      </button>
                    )}
                  </div>

                  {datos.fotoHero && (
                    <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', height: 140 }}>
                      <img src={datos.fotoHero} alt="Mi foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {!datos.fotoHero && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', marginBottom: 12 }}>O elige una foto profesional de {plantilla.nombre}:</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {fotos.map((url, i) => (
                          <div key={i} onClick={() => setFotoIdx(i)}
                            style={{ width: 130, height: 82, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `3px solid ${fotoIdx === i ? NARANJA : 'transparent'}`, transition: 'all 0.2s' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Contacto */}
              {tabEditor === 'contacto' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>Datos de contacto</h3>
                  {[
                    { label: 'Ciudad', campo: 'ciudad', placeholder: 'Madrid' },
                    { label: 'Teléfono', campo: 'telefono', placeholder: '+34 600 000 000' },
                    { label: 'WhatsApp', campo: 'whatsapp', placeholder: '+34 600 000 000' },
                    { label: 'Email', campo: 'email', placeholder: 'hola@tucentro.com' },
                    { label: 'Horario', campo: 'horario', placeholder: 'Lunes–Sábado 9:00–20:00h' },
                    { label: 'Instagram (solo usuario)', campo: 'instagram', placeholder: '@tucentro' },
                  ].map(f => (
                    <div key={f.campo}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
                      <input value={datos[f.campo]} onChange={e => set(f.campo, e.target.value)} placeholder={f.placeholder}
                        style={{ width: '100%', background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = NARANJA}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={() => guardar(false)} disabled={saving}
                  style={{ flex: 1, background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Guardando...' : '💾 Guardar borrador'}
                </button>
                <button onClick={() => guardar(true)} disabled={saving}
                  style={{ flex: 2, background: NARANJA, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px rgba(255,107,0,0.35)` }}>
                  {saving ? 'Publicando...' : '🚀 Publicar mi web'}
                </button>
              </div>
            </div>

            {/* Panel derecho — Preview en tiempo real */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray5)' }}>Vista previa en tiempo real</span>
                <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: 100 }}>● Live</span>
              </div>
              <WebPreview datos={{ ...datos, fotoHero: datos.fotoHero || fotos[fotoIdx] }} plantilla={plantilla} />
            </div>
          </div>
        )}

        {/* ── PASO 3: Publicada ── */}
        {paso === 3 && (
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1.5px', marginBottom: 14 }}>
              ¡Tu web está publicada!
            </h2>
            <p style={{ color: 'var(--gray5)', fontSize: 16, marginBottom: 32 }}>
              Cualquier persona puede acceder ahora mismo a tu página web profesional.
            </p>

            <div style={{ background: 'var(--gray1)', border: `1px solid ${NARANJA}44`, borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22 }}>🔗</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'var(--gray5)', marginBottom: 4, fontWeight: 600 }}>Tu URL pública</div>
                <a href={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? urlLocal : urlPublica} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 15, fontWeight: 700, color: NARANJA, textDecoration: 'none', fontFamily: 'monospace' }}>
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? urlLocal : urlPublica}
                </a>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(urlPublica); toast.success('¡URL copiada!'); }}
                style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Copiar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {[
                { icon: '📱', title: 'Comparte por WhatsApp', href: `https://wa.me/?text=Visita mi web: ${urlPublica}`, color: '#25D366' },
                { icon: '📋', title: 'Copiar para Instagram', onClick: () => { navigator.clipboard.writeText(urlPublica); toast.success('¡Copiado!'); }, color: '#E1306C' },
              ].map((a, i) => (
                <a key={i} href={a.href} target={a.href ? '_blank' : undefined} rel="noopener noreferrer"
                  onClick={a.onClick}
                  style={{ background: a.color + '15', border: `1px solid ${a.color}33`, borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--white)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</span>
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setPaso(2)}
                style={{ flex: 1, background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Editar web
              </button>
              <a href={urlPublica} target="_blank" rel="noopener noreferrer"
                style={{ flex: 2, background: NARANJA, color: '#fff', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px rgba(255,107,0,0.35)` }}>
                🌐 Ver mi web publicada →
              </a>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}
