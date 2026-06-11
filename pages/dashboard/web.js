// pages/dashboard/web.js
// Mi Página Web — galería múltiple + menú diario + domicilios — agencIAme

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CLOUD_NAME = 'dsomqay6y';
const UPLOAD_PRESET = 'cadegran_fotos';

const INDUSTRIAS_CONFIG = {
  peluqueria:         { img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', label: 'Peluquería / Spa' },
  taller:             { img: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80', label: 'Taller / Mecánica' },
  restaurante:        { img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', label: 'Restaurante' },
  restaurante_barrio: { img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', label: 'Restaurante de Barrio' },
  inmobiliaria:       { img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', label: 'Inmobiliaria' },
  tienda:             { img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', label: 'Tienda / Retail' },
  gimnasio:           { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', label: 'Gimnasio / Fitness' },
  salud:              { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', label: 'Salud / Clínica' },
  ajedrez:            { img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80', label: 'Escuela de Ajedrez' },
  arquitectura:       { img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80', label: 'Arquitectura & Construcción' },
  papeleria:          { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', label: 'Servicios / Papelería' },
  aduana:             { img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80', label: 'Agencia de Aduana' },
  portuaria:          { img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', label: 'Operadora Portuaria' },
  tecnico:            { img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', label: 'Soporte Técnico / Electrónica' },
  default:            { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', label: 'Mi Negocio' },
};

const esRestaurante = (ind) => ind === 'restaurante' || ind === 'restaurante_barrio';

export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('foto'); // 'foto' | 'galeria' | 'menu' | 'domicilio'

  // Foto hero
  const [fotoPersonalizada, setFotoPersonalizada] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileHeroRef = useRef(null);

  // Galería múltiple
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const [uploadingGal, setUploadingGal] = useState(false);
  const fileGalRef = useRef(null);

  // Menú diario (restaurantes)
  const [menuTitulo, setMenuTitulo] = useState('Menú del día');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuPrecioCompleto, setMenuPrecioCompleto] = useState('');
  const [platos, setPlatos] = useState([{ nombre: '', descripcion: '', precio: '', foto: '' }]);
  const [uploadingPlato, setUploadingPlato] = useState(null);
  const filePlatoRefs = useRef({});

  // Domicilio
  const [ofreceDomicilio, setOfreceDomicilio] = useState(false);
  const [zonasCobertura, setZonasCobertura] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (empresa) {
      if (empresa.plantillaWeb) setStep(2);
      if (empresa.fotoWeb) { setFotoPersonalizada(empresa.fotoWeb); setFotoPreview(empresa.fotoWeb); }
      if (empresa.ofreceDomicilio) setOfreceDomicilio(true);
      if (empresa.zonasCobertura) setZonasCobertura(empresa.zonasCobertura);
      if (empresa.tiempoEntrega) setTiempoEntrega(empresa.tiempoEntrega);
      cargarGaleria();
      if (esRestaurante(empresa.industria)) cargarMenu();
    }
  }, [empresa]);

  const cargarGaleria = async () => {
    try {
      const snap = await getDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'));
      if (snap.exists()) setFotosGaleria(snap.data().fotos || []);
    } catch (e) {}
  };

  const cargarMenu = async () => {
    try {
      const snap = await getDoc(doc(db, 'empresas', empresa.id, 'config', 'menuDiario'));
      if (snap.exists()) {
        const d = snap.data();
        setMenuTitulo(d.titulo || 'Menú del día');
        setMenuDesc(d.descripcion || '');
        setMenuPrecioCompleto(d.precioMenuCompleto || '');
        setPlatos(d.platos || [{ nombre: '', descripcion: '', precio: '', foto: '' }]);
      }
    } catch (e) {}
  };

  const slug = (empresa?.nombreEmpresa || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const siteUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://agenciame.com') + '/sitio/' + slug;
  const indConfig = INDUSTRIAS_CONFIG[empresa?.industria] || INDUSTRIAS_CONFIG.default;

  // ── Subir foto hero ──────────────────────────────────────────────────────
  const subirFoto = async (file, onSuccess, setUploading) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Máx 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Solo imágenes'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'agenciame/sitios');
      const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Error subiendo');
      const data = await res.json();
      onSuccess(data.secure_url);
      toast.success('✅ Foto subida');
    } catch (e) { toast.error('Error: ' + e.message); }
    finally { setUploading(false); }
  };

  const handleHeroChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    subirFoto(file, url => setFotoPersonalizada(url), setUploadingFoto);
  };

  // ── Subir fotos galería ──────────────────────────────────────────────────
  const handleGaleriaChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (fotosGaleria.length + files.length > 12) { toast.error('Máximo 12 fotos en galería'); return; }
    setUploadingGal(true);
    const nuevas = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        fd.append('folder', 'agenciame/galeria');
        const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.secure_url) nuevas.push(data.secure_url);
      } catch (e) {}
    }
    const todas = [...fotosGaleria, ...nuevas];
    setFotosGaleria(todas);
    await setDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'), { fotos: todas });
    toast.success(nuevas.length + ' foto(s) agregada(s) ✅');
    setUploadingGal(false);
  };

  const eliminarFotoGaleria = async (i) => {
    const nuevas = fotosGaleria.filter((_, idx) => idx !== i);
    setFotosGaleria(nuevas);
    await setDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'), { fotos: nuevas });
    toast.success('Foto eliminada');
  };

  // ── Platos menú ──────────────────────────────────────────────────────────
  const addPlato = () => setPlatos(p => [...p, { nombre: '', descripcion: '', precio: '', foto: '' }]);
  const removePlato = (i) => setPlatos(p => p.filter((_, idx) => idx !== i));
  const updatePlato = (i, k, v) => setPlatos(p => p.map((pl, idx) => idx === i ? { ...pl, [k]: v } : pl));

  const handleFotoPlato = async (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPlato(i);
    await subirFoto(file, url => updatePlato(i, 'foto', url), (v) => { if (!v) setUploadingPlato(null); });
    setUploadingPlato(null);
  };

  const guardarMenu = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'empresas', empresa.id, 'config', 'menuDiario'), {
        titulo: menuTitulo,
        descripcion: menuDesc,
        precioMenuCompleto: menuPrecioCompleto,
        platos: platos.filter(p => p.nombre),
        actualizadoEn: new Date().toISOString(),
      });
      toast.success('Menú guardado ✅');
    } catch (e) { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const aplicarPlantilla = async () => {
    setSaving(true);
    try {
      await updateEmpresa(empresa.id, {
        plantillaWeb: empresa.industria,
        fotoWeb: fotoPersonalizada || '',
        ofreceDomicilio,
        zonasCobertura,
        tiempoEntrega,
      });
      toast.success('Tu sitio web esta listo!');
      setStep(2);
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const guardarConfig = async () => {
    setSaving(true);
    try {
      await updateEmpresa(empresa.id, { fotoWeb: fotoPersonalizada || '', ofreceDomicilio, zonasCobertura, tiempoEntrega });
      toast.success('Configuración guardada ✅');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const esTiendaORestaurante = esRestaurante(empresa.industria) || empresa.industria === 'tienda';
  const fotoActual = fotoPreview || fotoPersonalizada || indConfig.img;

  const card = { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 20 };
  const label = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)', marginBottom: 8, display: 'block' };

  const TABS = [
    { key: 'foto',      label: 'Foto Hero' },
    { key: 'galeria',   label: 'Galería' },
    { key: 'config',    label: 'Configuración Web' },
    ...(esRestaurante(empresa.industria) ? [{ key: 'menu', label: 'Menú Diario' }] : []),
    ...(esTiendaORestaurante ? [{ key: 'domicilio', label: 'Domicilio' }] : []),
  ];

  return (
    <>
      <Head><title>Crea tu Web con un Click — agencIAme</title></Head>
      <DashboardLayout title="Crea tu Web con un Click">

        {step === 1 && (
          <>
            <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 28 }}>
              Tu página web se genera automáticamente. Personaliza la foto de fondo, agrega tu galería
              {esRestaurante(empresa.industria) ? ', sube tu menú diario' : ''} y más.
            </p>

            {/* Preview */}
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 28, height: 240, background: '#111' }}>
              <img src={fotoActual} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.3) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: '#fff' }}>{empresa.nombreEmpresa}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{indConfig.label}</div>
                {fotosGaleria.length > 0 && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>✅ {fotosGaleria.length} fotos en galería</div>}
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--gray2)', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ background: tab === t.key ? 'var(--accent)' : 'transparent', color: tab === t.key ? '#000' : 'var(--gray5)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB: Foto Hero */}
            {tab === 'foto' && (
              <div style={card}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🖼️ Foto de fondo del hero</h3>
                <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16 }}>La foto principal que aparece en el encabezado de tu sitio.</p>
                <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>📐 Especificaciones:</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[{ l: 'Ideal', v: '1920×1080px' }, { l: 'Mínimo', v: '1200×630px' }, { l: 'Peso máx', v: '5 MB' }, { l: 'Formatos', v: 'JPG PNG WEBP' }, { l: 'Relación', v: '16:9 horizontal' }].map((s, i) => (
                      <div key={i} style={{ background: 'var(--gray2)', borderRadius: 6, padding: '6px 12px' }}>
                        <div style={{ fontSize: 9, color: 'var(--gray5)', fontWeight: 600, letterSpacing: 0.5 }}>{s.l}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray7)', fontWeight: 600, marginTop: 2 }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <input ref={fileHeroRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleHeroChange} />
                {!fotoPersonalizada ? (
                  <div onClick={() => fileHeroRef.current?.click()}
                    style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 10, padding: '36px 24px', textAlign: 'center', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{uploadingFoto ? 'Subiendo...' : 'Subir foto de fondo'}</div>
                    <div style={{ color: 'var(--gray5)', fontSize: 12 }}>JPG, PNG, WEBP · Máx 5MB · Mín 1200×630px</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px' }}>
                    <img src={fotoPersonalizada} alt="hero" style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>✅ Foto personalizada activa</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileHeroRef.current?.click()}>Cambiar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { setFotoPersonalizada(''); setFotoPreview(''); }}>Quitar</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Galería */}
            {tab === 'galeria' && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>📸 Galería fotográfica</h3>
                    <p style={{ color: 'var(--gray5)', fontSize: 12, marginTop: 4 }}>Sube hasta 12 fotos. Aparecen en la sección de galería de tu sitio web.</p>
                  </div>
                  <button className="btn btn-accent btn-sm" onClick={() => fileGalRef.current?.click()} disabled={uploadingGal || fotosGaleria.length >= 12}>
                    {uploadingGal ? '⏳ Subiendo...' : '+ Agregar fotos'}
                  </button>
                </div>
                <input ref={fileGalRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleGaleriaChange} />

                {/* Especificaciones galería */}
                <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>📐 Especificaciones galería:</div>
                  <div style={{ fontSize: 12, color: 'var(--gray5)', lineHeight: 1.6 }}>
                    • Mínimo 800×600px · Ideal 1200×900px (3:4 o 4:3)<br/>
                    • Peso máximo 5MB por foto · Formatos: JPG, PNG, WEBP<br/>
                    • Máximo 12 fotos · Las primeras 4-8 aparecen en la portada
                  </div>
                </div>

                {fotosGaleria.length === 0 ? (
                  <div onClick={() => fileGalRef.current?.click()}
                    style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 10, padding: '48px 24px', textAlign: 'center', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Sin fotos aún</div>
                    <div style={{ color: 'var(--gray5)', fontSize: 12 }}>Haz clic para subir tu primera foto</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
                    {fotosGaleria.map((foto, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={foto} alt={'foto ' + (i + 1)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => eliminarFotoGaleria(i)}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✕
                        </button>
                        <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>#{i + 1}</div>
                      </div>
                    ))}
                    {fotosGaleria.length < 12 && (
                      <div onClick={() => fileGalRef.current?.click()}
                        style={{ aspectRatio: '4/3', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 28, color: 'var(--gray5)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                        +
                      </div>
                    )}
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 10 }}>{fotosGaleria.length}/12 fotos · Las fotos se guardan automáticamente</p>
              </div>
            )}

            {/* TAB: Configuración Web — integrada desde /dashboard/conocimiento */}
            {tab === 'config' && (
              <ConfiguracionWeb uid={user.uid} empresa={empresa} />
            )}

            {/* TAB: Menú Diario */}
            {tab === 'menu' && esRestaurante(empresa.industria) && (
              <div style={card}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🍽️ Menú del día</h3>
                <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20 }}>Actualiza tu menú diario con fotos. Aparece destacado en tu sitio web.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <span style={label}>Título del menú</span>
                    <input className="form-input" placeholder="Menú del día" value={menuTitulo} onChange={e => setMenuTitulo(e.target.value)} />
                  </div>
                  <div>
                    <span style={label}>Precio menú completo (COP)</span>
                    <input className="form-input" placeholder="15000" value={menuPrecioCompleto} onChange={e => setMenuPrecioCompleto(e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span style={label}>Descripción del menú</span>
                  <input className="form-input" placeholder="Sopa, plato fuerte, jugo y postre" value={menuDesc} onChange={e => setMenuDesc(e.target.value)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14 }}>Platos del día</span>
                  <button className="btn btn-ghost btn-sm" onClick={addPlato}>+ Agregar plato</button>
                </div>

                {platos.map((plato, i) => (
                  <div key={i} style={{ background: 'var(--gray2)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 10 }}>
                      <div>
                        <span style={label}>Nombre del plato</span>
                        <input className="form-input" placeholder="Ej: Bandeja paisa" value={plato.nombre} onChange={e => updatePlato(i, 'nombre', e.target.value)} />
                      </div>
                      <div>
                        <span style={label}>Precio (COP)</span>
                        <input className="form-input" placeholder="12000" value={plato.precio} onChange={e => updatePlato(i, 'precio', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <span style={label}>Descripción</span>
                      <input className="form-input" placeholder="Ingredientes y descripción breve" value={plato.descripcion} onChange={e => updatePlato(i, 'descripcion', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <span style={label}>Foto del plato</span>
                        <input
                          ref={el => filePlatoRefs.current[i] = el}
                          type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                          onChange={e => handleFotoPlato(e, i)} />
                        {plato.foto ? (
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <img src={plato.foto} alt="plato" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                            <button className="btn btn-ghost btn-sm" onClick={() => filePlatoRefs.current[i]?.click()}>Cambiar</button>
                            <button className="btn btn-danger btn-sm" onClick={() => updatePlato(i, 'foto', '')}>Quitar</button>
                          </div>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => filePlatoRefs.current[i]?.click()} disabled={uploadingPlato === i}>
                            {uploadingPlato === i ? '⏳ Subiendo...' : '📷 Subir foto del plato'}
                          </button>
                        )}
                      </div>
                      {platos.length > 1 && (
                        <button className="btn btn-danger btn-sm" onClick={() => removePlato(i)} style={{ marginTop: 20 }}>🗑️</button>
                      )}
                    </div>
                  </div>
                ))}

                <button className="btn btn-accent" onClick={guardarMenu} disabled={saving} style={{ marginTop: 8 }}>
                  {saving ? 'Guardando...' : '💾 Guardar menú del día'}
                </button>
              </div>
            )}

            {/* TAB: Domicilio */}
            {tab === 'domicilio' && esTiendaORestaurante && (
              <div style={card}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🛵 Configurar domicilios</h3>
                <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20 }}>Habilita el botón de domicilio en tu sitio web. Los clientes pedirán por WhatsApp.</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--gray2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                  <input type="checkbox" checked={ofreceDomicilio} onChange={e => setOfreceDomicilio(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>🛵 Ofrecer domicilios</div>
                    <div style={{ fontSize: 12, color: 'var(--gray5)' }}>Aparecerá un botón naranja "Pedir domicilio" en tu sitio web</div>
                  </div>
                </div>

                {ofreceDomicilio && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <span style={label}>Zonas de cobertura</span>
                      <input className="form-input" placeholder="Ej: Barrio El Poblado, Laureles, El Estadio" value={zonasCobertura} onChange={e => setZonasCobertura(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <span style={label}>Tiempo estimado de entrega</span>
                      <input className="form-input" placeholder="Ej: 30-45 minutos" value={tiempoEntrega} onChange={e => setTiempoEntrega(e.target.value)} />
                    </div>
                    <div style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                      💡 Los pedidos llegarán a tu WhatsApp configurado en la Base de conocimiento. El cliente escribe el pedido y tú confirmas.
                    </div>
                  </>
                )}
              </div>
            )}

            <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={aplicarPlantilla} disabled={saving}>
              {saving ? 'Guardando...' : step === 2 ? '💾 Guardar cambios' : '🌐 Generar mi sitio web →'}
            </button>
          </>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>✅ Tu sitio web está activo</div>
                <div style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16 }}>{fotosGaleria.length} fotos en galería · {esRestaurante(empresa.industria) ? 'Menú disponible · ' : ''}{empresa.ofreceDomicilio ? '🛵 Domicilios activos' : ''}</div>
                <div style={{ background: 'var(--gray2)', borderRadius: 8, padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--accent)', cursor: 'pointer', wordBreak: 'break-all' }}
                  onClick={() => window.open(siteUrl, '_blank')}>{siteUrl}</div>
                <button className="btn btn-accent btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => window.open(siteUrl, '_blank')}>
                  🌐 Ver mi sitio web
                </button>
              </div>
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 200 }}>
                <img src={fotoPreview || fotoPersonalizada || indConfig.img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 200 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.2) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>{empresa.nombreEmpresa}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{indConfig.label}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginRight: 12 }}>✏️ Editar configuración</button>
            <button className="btn btn-accent" onClick={() => window.open(siteUrl, '_blank')}>🌐 Ver sitio web</button>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

// ── Componente ConfiguracionWeb integrado ────────────────────────────────────
import { serverTimestamp } from 'firebase/firestore';
const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

function ConfiguracionWeb({ uid, empresa }) {
  const [saving, setSaving] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [servicios, setServicios] = useState([{ nombre: '', precio: '', duracion: '', descripcion: '' }]);
  const [horarios, setHorarios] = useState({
    Lunes: { activo: true, desde: '08:00', hasta: '18:00' },
    Martes: { activo: true, desde: '08:00', hasta: '18:00' },
    Miercoles: { activo: true, desde: '08:00', hasta: '18:00' },
    Jueves: { activo: true, desde: '08:00', hasta: '18:00' },
    Viernes: { activo: true, desde: '08:00', hasta: '18:00' },
    Sabado: { activo: true, desde: '08:00', hasta: '14:00' },
    Domingo: { activo: false, desde: '08:00', hasta: '12:00' },
  });
  const [info, setInfo] = useState({
    direccion: '', ciudad: '', telefono: '', whatsapp: '',
    descripcionNegocio: '', politicaCancelacion: '',
    formasPago: [], preguntasFrecuentes: [{ pregunta: '', respuesta: '' }],
  });

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'empresas', uid, 'config', 'conocimiento'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.servicios) setServicios(d.servicios);
          if (d.horarios) setHorarios(d.horarios);
          if (d.info) setInfo(d.info);
        } else if (empresa) {
          setInfo(i => ({ ...i, ciudad: empresa.ciudad || '', telefono: empresa.telefono || '' }));
        }
      } catch (e) { console.error(e); }
      finally { setCargando(false); }
    })();
  }, [uid]);

  const addSv = () => setServicios(s => [...s, { nombre: '', precio: '', duracion: '', descripcion: '' }]);
  const rmSv  = (i) => setServicios(s => s.filter((_, idx) => idx !== i));
  const updSv = (i, f, v) => setServicios(s => s.map((sv, idx) => idx === i ? { ...sv, [f]: v } : sv));
  const addFaq  = () => setInfo(i => ({ ...i, preguntasFrecuentes: [...(i.preguntasFrecuentes || []), { pregunta: '', respuesta: '' }] }));
  const rmFaq   = (i) => setInfo(inf => ({ ...inf, preguntasFrecuentes: inf.preguntasFrecuentes.filter((_, idx) => idx !== i) }));
  const updFaq  = (i, f, v) => setInfo(inf => ({ ...inf, preguntasFrecuentes: inf.preguntasFrecuentes.map((fq, idx) => idx === i ? { ...fq, [f]: v } : fq) }));
  const togPago = (p) => setInfo(i => ({ ...i, formasPago: i.formasPago.includes(p) ? i.formasPago.filter(x => x !== p) : [...i.formasPago, p] }));

  const guardar = async () => {
    if (!servicios.some(s => s.nombre)) { toast.error('Agrega al menos un servicio'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'empresas', uid, 'config', 'conocimiento'), {
        servicios, horarios, info,
        actualizadoEn: serverTimestamp(),
      });
      toast.success('Configuración web guardada');
    } catch (e) { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const card  = { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 20 };
  const lbl   = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)', marginBottom: 8, display: 'block' };

  if (cargando) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray5)' }}>Cargando...</div>;

  return (
    <div>
      <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 24 }}>
        Esta información la usa tu agente IA para responder correctamente a tus clientes.
      </p>

      {/* SERVICIOS */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Servicios y precios</h3>
          <button className="btn btn-ghost btn-sm" onClick={addSv}>+ Agregar servicio</button>
        </div>
        {servicios.map((sv, i) => (
          <div key={i} style={{ background: 'var(--gray2)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
              <div><span style={lbl}>Nombre *</span><input className="form-input" placeholder="Ej: Corte de cabello" value={sv.nombre} onChange={e => updSv(i, 'nombre', e.target.value)} /></div>
              <div><span style={lbl}>Precio COP</span><input className="form-input" placeholder="25000" value={sv.precio} onChange={e => updSv(i, 'precio', e.target.value)} /></div>
              <div><span style={lbl}>Duración min</span><input className="form-input" placeholder="30" value={sv.duracion} onChange={e => updSv(i, 'duracion', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}><span style={lbl}>Descripción</span><input className="form-input" placeholder="Detalles del servicio" value={sv.descripcion} onChange={e => updSv(i, 'descripcion', e.target.value)} /></div>
              {servicios.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => rmSv(i)}>Quitar</button>}
            </div>
          </div>
        ))}
      </div>

      {/* HORARIOS */}
      <div style={card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Horarios de atención</h3>
        {DIAS.map(dia => (
          <div key={dia} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 110, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={horarios[dia]?.activo || false}
                onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], activo: e.target.checked } }))}
                style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: horarios[dia]?.activo ? 'var(--white)' : 'var(--gray5)' }}>{dia}</span>
            </div>
            {horarios[dia]?.activo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="time" className="form-input" style={{ width: 120, padding: '6px 10px' }} value={horarios[dia]?.desde || '08:00'} onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], desde: e.target.value } }))} />
                <span style={{ color: 'var(--gray5)' }}>a</span>
                <input type="time" className="form-input" style={{ width: 120, padding: '6px 10px' }} value={horarios[dia]?.hasta || '18:00'} onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], hasta: e.target.value } }))} />
              </div>
            ) : <span style={{ fontSize: 13, color: 'var(--gray5)', fontStyle: 'italic' }}>Cerrado</span>}
          </div>
        ))}
      </div>

      {/* INFO NEGOCIO */}
      <div style={card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Información del negocio</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><span style={lbl}>Dirección</span><input className="form-input" placeholder="Calle 5 # 10-20" value={info.direccion} onChange={e => setInfo(i => ({ ...i, direccion: e.target.value }))} /></div>
          <div><span style={lbl}>Ciudad</span><input className="form-input" placeholder="Cali" value={info.ciudad} onChange={e => setInfo(i => ({ ...i, ciudad: e.target.value }))} /></div>
          <div><span style={lbl}>Teléfono</span><input className="form-input" placeholder="3105056616" value={info.telefono} onChange={e => setInfo(i => ({ ...i, telefono: e.target.value }))} /></div>
          <div><span style={lbl}>WhatsApp</span><input className="form-input" placeholder="3105056616" value={info.whatsapp} onChange={e => setInfo(i => ({ ...i, whatsapp: e.target.value }))} /></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={lbl}>Descripción del negocio</span>
          <textarea className="form-input" rows={3} placeholder="Somos una peluquería especializada en cortes modernos..." value={info.descripcionNegocio} onChange={e => setInfo(i => ({ ...i, descripcionNegocio: e.target.value }))} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={lbl}>Política de cancelación</span>
          <input className="form-input" placeholder="Cancelaciones con mínimo 2 horas de anticipación" value={info.politicaCancelacion} onChange={e => setInfo(i => ({ ...i, politicaCancelacion: e.target.value }))} />
        </div>
        <div>
          <span style={lbl}>Formas de pago</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Tarjeta débito', 'Tarjeta crédito'].map(p => (
              <button key={p} onClick={() => togPago(p)}
                style={{ background: info.formasPago?.includes(p) ? 'rgba(37,99,235,0.12)' : 'var(--gray2)', border: '1px solid ' + (info.formasPago?.includes(p) ? '#2563EB' : 'rgba(255,255,255,0.06)'), borderRadius: 100, padding: '6px 14px', cursor: 'pointer', color: info.formasPago?.includes(p) ? '#60A5FA' : 'var(--gray6)', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Preguntas frecuentes</h3>
          <button className="btn btn-ghost btn-sm" onClick={addFaq}>+ Agregar pregunta</button>
        </div>
        {(info.preguntasFrecuentes || []).map((faq, i) => (
          <div key={i} style={{ background: 'var(--gray2)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ marginBottom: 10 }}><span style={lbl}>Pregunta</span><input className="form-input" placeholder="¿Tienen estacionamiento?" value={faq.pregunta} onChange={e => updFaq(i, 'pregunta', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}><span style={lbl}>Respuesta</span><input className="form-input" placeholder="Sí, tenemos parqueadero gratuito." value={faq.respuesta} onChange={e => updFaq(i, 'respuesta', e.target.value)} /></div>
              {(info.preguntasFrecuentes || []).length > 1 && <button className="btn btn-danger btn-sm" onClick={() => rmFaq(i)}>Quitar</button>}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar configuración web'}
      </button>
    </div>
  );
}
