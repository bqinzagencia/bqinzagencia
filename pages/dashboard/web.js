// pages/dashboard/web.js — Nuevo diseño: Stepper + Preview en tiempo real
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa, db } from '../../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const CLOUD_NAME   = 'dsomqay6y';
const UPLOAD_PRESET = 'cadegran_fotos';
const F = "'Inter', system-ui, sans-serif";
const DIAS = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];

const INDUSTRY_IMGS = {
  peluqueria:   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  taller:       'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80',
  restaurante:  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  inmobiliaria: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  tienda:       'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
  gimnasio:     'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  salud:        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  ajedrez:      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
  arquitectura: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
  papeleria:    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80',
  aduana:       'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  portuaria:    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  tecnico:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  psicologo:    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
  barbero:      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
  reposteria:   'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
  veterinaria:  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
  fotografia:   'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
  acarreos:     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
  contador:     'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  default:      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
};

export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  // Stepper
  const [step, setStep] = useState(1); // 1=Textos, 2=Personalizar, 3=Publicar

  // Contenido
  const [titulo,      setTitulo]      = useState('');
  const [heroFrase,   setHeroFrase]   = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [telefono,    setTelefono]    = useState('');
  const [whatsapp,    setWhatsapp]    = useState('');
  const [direccion,   setDireccion]   = useState('');
  const [ciudad,      setCiudad]      = useState('');

  // Servicios
  const [servicios, setServicios] = useState([{ nombre: '', precio: '', duracion: '' }]);

  // Fotos
  const [fotoHero,     setFotoHero]     = useState('');
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const [uploading,    setUploading]    = useState(false);
  const fileHeroRef = useRef(null);
  const fileGalRef  = useRef(null);

  // Contacto
  const [formasPago, setFormasPago] = useState([]);

  // Tab activa
  const [tab, setTab] = useState('textos');
  const [saving, setSaving] = useState(false);
  const [publicada, setPublicada] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (!empresa) return;
    setTitulo(empresa.nombreEmpresa || '');
    setCiudad(empresa.ciudad || '');
    setTelefono(empresa.telefono || '');
    if (empresa.plantillaWeb) { setStep(2); setPublicada(true); }
    if (empresa.fotoWeb) setFotoHero(empresa.fotoWeb);

    // Cargar conocimiento
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'empresas', empresa.id, 'config', 'conocimiento'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.servicios?.length) setServicios(d.servicios);
          if (d.info?.descripcionNegocio) setDescripcion(d.info.descripcionNegocio);
          if (d.info?.whatsapp) setWhatsapp(d.info.whatsapp);
          if (d.info?.direccion) setDireccion(d.info.direccion);
          if (d.info?.ciudad) setCiudad(d.info.ciudad);
          if (d.info?.telefono) setTelefono(d.info.telefono);
          if (d.info?.formasPago) setFormasPago(d.info.formasPago);
          if (d.info?.heroFrase) setHeroFrase(d.info.heroFrase);
        }
        const galSnap = await getDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'));
        if (galSnap.exists()) setFotosGaleria(galSnap.data().fotos || []);
      } catch {}
    })();
  }, [empresa]);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const indImg  = INDUSTRY_IMGS[empresa.industria] || INDUSTRY_IMGS.default;
  const heroImg = fotoHero || indImg;
  const slug    = titulo.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const siteUrl = `https://agenciame.com/sitio/${slug}`;

  // Guardar borrador
  const guardarBorrador = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'empresas', empresa.id, 'config', 'conocimiento'), {
        servicios,
        info: { descripcionNegocio: descripcion, whatsapp, telefono, direccion, ciudad, formasPago, heroFrase },
        actualizadoEn: serverTimestamp(),
      }, { merge: true });
      await updateEmpresa(empresa.id, { fotoWeb: fotoHero || '' });
      toast.success('Borrador guardado');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  // Publicar
  const publicar = async () => {
    if (!titulo) { toast.error('Agrega el nombre del negocio'); return; }
    setSaving(true);
    try {
      await guardarBorrador();
      await updateEmpresa(empresa.id, {
        plantillaWeb: empresa.industria,
        fotoWeb:      fotoHero || '',
        webActiva:    true,
      });
      setPublicada(true);
      setStep(3);
      toast.success('Sitio web publicado');
    } catch { toast.error('Error al publicar'); }
    finally { setSaving(false); }
  };

  // Subir foto
  const subirFoto = async (file, onSuccess) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'agenciame/sitios');
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd });
      const data = await res.json();
      onSuccess(data.secure_url);
      toast.success('Foto subida');
    } catch { toast.error('Error al subir'); }
    finally { setUploading(false); }
  };

  const handleHero = e => { const f = e.target.files[0]; if (f) subirFoto(f, setFotoHero); };
  const handleGal  = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const nuevas = [];
    for (const f of files) {
      try {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('upload_preset', UPLOAD_PRESET);
        fd.append('folder', 'agenciame/galeria');
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd });
        const data = await res.json();
        if (data.secure_url) nuevas.push(data.secure_url);
      } catch {}
    }
    const todas = [...fotosGaleria, ...nuevas];
    setFotosGaleria(todas);
    await setDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'), { fotos: todas });
    setUploading(false);
    toast.success(`${nuevas.length} foto(s) agregada(s)`);
  };

  const quitarFoto = async (i) => {
    const arr = fotosGaleria.filter((_,idx)=>idx!==i);
    setFotosGaleria(arr);
    await setDoc(doc(db, 'empresas', empresa.id, 'config', 'galeria'), { fotos: arr });
  };

  const togPago = p => setFormasPago(fp => fp.includes(p) ? fp.filter(x=>x!==p) : [...fp,p]);

  // Estilos reutilizables
  const INP = { width:'100%', background:'#0D1420', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 12px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box' };
  const LBL = { fontFamily:F, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, color:'#4B6080', display:'block', marginBottom:6 };
  const CARD = { background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:16 };

  // TABS
  const TABS = [
    { key:'textos',    label:'Textos',    icon:'📝' },
    { key:'servicios', label:'Servicios', icon:'⭐' },
    { key:'fotos',     label:'Fotos',     icon:'📸' },
    { key:'contacto',  label:'Contacto',  icon:'📞' },
  ];

  const STEPS = ['Plantilla','Personalizar','Publicar'];

  return (
    <>
      <Head><title>Mi Web — agencIAme</title></Head>
      <DashboardLayout title="Mi Web">
        <style dangerouslySetInnerHTML={{__html:`
          .web-inp:focus { border-color: rgba(255,107,0,0.5) !important; }
          .web-tab-btn:hover { background: rgba(255,255,255,0.05) !important; }
          .web-tab-btn.active { background: #FF6B00 !important; color: #fff !important; }
        `}} />

        {/* ── STEPPER ── */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28, background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 24px' }}>
          {STEPS.map((s,i) => {
            const done    = step > i+1;
            const current = step === i+1;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, cursor: done ? 'pointer' : 'default' }}
                  onClick={() => { if (done || current) setStep(i+1); }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background: done ? '#10B981' : current ? '#FF6B00' : '#1A2035',
                    color: done||current ? '#fff' : '#4B6080',
                    fontFamily:F, fontSize:13, fontWeight:700, flexShrink:0,
                    border: current ? '2px solid rgba(255,107,0,0.4)' : 'none',
                    boxShadow: current ? '0 0 0 4px rgba(255,107,0,0.12)' : 'none',
                    transition:'all 0.2s',
                  }}>
                    {done ? '✓' : i+1}
                  </div>
                  <span style={{ fontFamily:F, fontSize:13, fontWeight: current?700:400, color: current?'#EFF4FF': done?'#10B981':'#4B6080' }}>{s}</span>
                </div>
                {i < STEPS.length-1 && (
                  <div style={{ flex:1, height:1, background: done?'#10B981':'rgba(255,255,255,0.06)', margin:'0 16px' }} />
                )}
              </div>
            );
          })}

          {/* Estado activa */}
          {publicada && (
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:100, padding:'4px 14px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }} />
              <span style={{ fontFamily:F, fontSize:12, color:'#10B981', fontWeight:600 }}>Live</span>
            </div>
          )}
        </div>

        {/* ── CUERPO PRINCIPAL: izquierda editor + derecha preview ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20, alignItems:'start' }}>

          {/* ── EDITOR ── */}
          <div>
            {/* Barra estado web */}
            {publicada && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'12px 18px', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981' }} />
                  <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:'#10B981' }}>Tu web está activa</span>
                  <span style={{ fontFamily:F, fontSize:12, color:'#4B6080' }}>·</span>
                  <span style={{ fontFamily:F, fontSize:12, color:'#4B6080' }}>Plantilla: {empresa.industria}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => window.open(siteUrl,'_blank')} style={{ background:'#10B981', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    Ver web
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(siteUrl); toast.success('URL copiada'); }} style={{ background:'rgba(255,255,255,0.06)', color:'#8A9BB5', border:'none', borderRadius:6, padding:'6px 14px', fontFamily:F, fontSize:12, cursor:'pointer' }}>
                    Copiar URL
                  </button>
                </div>
              </div>
            )}

            {/* TABS */}
            <div style={{ display:'flex', gap:2, marginBottom:16, background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:4, overflowX:'auto' }}>
              {TABS.map(t => (
                <button key={t.key} className={`web-tab-btn${tab===t.key?' active':''}`}
                  onClick={() => setTab(t.key)}
                  style={{ background: tab===t.key?'#FF6B00':'transparent', color: tab===t.key?'#fff':'#6B7A99', border:'none', borderRadius:8, padding:'8px 18px', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* TAB: TEXTOS */}
            {tab === 'textos' && (
              <div>
                <div style={CARD}>
                  <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF', marginBottom:16 }}>Informacion principal</div>
                  <div style={{ marginBottom:12 }}>
                    <span style={LBL}>Nombre del negocio</span>
                    <input className="web-inp" style={INP} value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej: Peluqueria Valeria" />
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <span style={LBL}>Titular del hero (frase impactante)</span>
                    <input className="web-inp" style={INP} value={heroFrase} onChange={e=>setHeroFrase(e.target.value)} placeholder="Ej: Tu centro de belleza de confianza en Cali" />
                  </div>
                  <div>
                    <span style={LBL}>Descripcion del negocio</span>
                    <textarea className="web-inp" style={{ ...INP, resize:'vertical', minHeight:100 }} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Ej: Somos una peluqueria especializada en cortes modernos. Atendemos con cita previa y nuestro agente IA esta disponible 24h para reservas." />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SERVICIOS */}
            {tab === 'servicios' && (
              <div>
                <div style={CARD}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF' }}>Tus servicios</div>
                    <button onClick={() => setServicios(s=>[...s,{nombre:'',precio:'',duracion:''}])}
                      style={{ background:'rgba(255,107,0,0.1)', color:'#FF6B00', border:'1px solid rgba(255,107,0,0.25)', borderRadius:8, padding:'6px 14px', fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      + Agregar servicio
                    </button>
                  </div>
                  {servicios.map((sv,i) => (
                    <div key={i} style={{ background:'#111827', borderRadius:10, padding:14, marginBottom:10 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:8 }}>
                        <div>
                          <span style={LBL}>Nombre del servicio</span>
                          <input className="web-inp" style={INP} placeholder="Ej: Corte clasico" value={sv.nombre} onChange={e=>setServicios(s=>s.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} />
                        </div>
                        <div>
                          <span style={LBL}>Precio COP</span>
                          <input className="web-inp" style={INP} placeholder="25000" value={sv.precio} onChange={e=>setServicios(s=>s.map((x,j)=>j===i?{...x,precio:e.target.value}:x))} />
                        </div>
                        <div>
                          <span style={LBL}>Duracion min</span>
                          <input className="web-inp" style={INP} placeholder="30" value={sv.duracion} onChange={e=>setServicios(s=>s.map((x,j)=>j===i?{...x,duracion:e.target.value}:x))} />
                        </div>
                      </div>
                      {servicios.length > 1 && (
                        <button onClick={() => setServicios(s=>s.filter((_,j)=>j!==i))}
                          style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'none', borderRadius:6, padding:'4px 12px', fontFamily:F, fontSize:11, cursor:'pointer' }}>
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FOTOS */}
            {tab === 'fotos' && (
              <div>
                {/* Foto hero */}
                <div style={CARD}>
                  <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF', marginBottom:4 }}>Foto principal (hero)</div>
                  <div style={{ fontFamily:F, fontSize:12, color:'#4B6080', marginBottom:14 }}>La foto grande del encabezado de tu sitio. Horizontal 16:9, min 1200x630px.</div>
                  <input ref={fileHeroRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleHero} />
                  {fotoHero ? (
                    <div style={{ display:'flex', gap:12, alignItems:'center', background:'#111827', borderRadius:10, padding:'10px 14px' }}>
                      <img src={fotoHero} style={{ width:80, height:48, objectFit:'cover', borderRadius:6 }} />
                      <div style={{ flex:1, fontFamily:F, fontSize:12, color:'#10B981', fontWeight:600 }}>Foto personalizada activa</div>
                      <button onClick={() => fileHeroRef.current?.click()} style={{ background:'rgba(255,255,255,0.06)', color:'#8A9BB5', border:'none', borderRadius:6, padding:'6px 12px', fontFamily:F, fontSize:12, cursor:'pointer' }}>Cambiar</button>
                      <button onClick={() => setFotoHero('')} style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'none', borderRadius:6, padding:'6px 12px', fontFamily:F, fontSize:12, cursor:'pointer' }}>Quitar</button>
                    </div>
                  ) : (
                    <div onClick={() => fileHeroRef.current?.click()}
                      style={{ border:'2px dashed rgba(255,255,255,0.08)', borderRadius:10, padding:'28px 24px', textAlign:'center', cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,107,0,0.35)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                      <div style={{ fontFamily:F, fontSize:13, fontWeight:600, color:'#8A9BB5' }}>{uploading ? 'Subiendo...' : '+ Subir foto de fondo'}</div>
                      <div style={{ fontFamily:F, fontSize:11, color:'#374151', marginTop:4 }}>JPG, PNG, WEBP · Max 5MB</div>
                    </div>
                  )}
                </div>

                {/* Galeria */}
                <div style={CARD}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <div>
                      <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF' }}>Galeria de fotos</div>
                      <div style={{ fontFamily:F, fontSize:12, color:'#4B6080', marginTop:2 }}>{fotosGaleria.length}/12 fotos</div>
                    </div>
                    <button onClick={() => fileGalRef.current?.click()} disabled={uploading || fotosGaleria.length >= 12}
                      style={{ background:'rgba(255,107,0,0.1)', color:'#FF6B00', border:'1px solid rgba(255,107,0,0.25)', borderRadius:8, padding:'6px 14px', fontFamily:F, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      {uploading ? 'Subiendo...' : '+ Agregar fotos'}
                    </button>
                  </div>
                  <input ref={fileGalRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleGal} />
                  {fotosGaleria.length === 0 ? (
                    <div onClick={() => fileGalRef.current?.click()}
                      style={{ border:'2px dashed rgba(255,255,255,0.06)', borderRadius:10, padding:'32px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontFamily:F, fontSize:13, color:'#4B6080' }}>Sin fotos aun · Haz clic para agregar</div>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:8 }}>
                      {fotosGaleria.map((foto,i) => (
                        <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'4/3' }}>
                          <img src={foto} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          <button onClick={() => quitarFoto(i)}
                            style={{ position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.7)', border:'none', color:'#fff', borderRadius:'50%', width:22, height:22, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CONTACTO */}
            {tab === 'contacto' && (
              <div>
                <div style={CARD}>
                  <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF', marginBottom:16 }}>Informacion de contacto</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div>
                      <span style={LBL}>Telefono</span>
                      <input className="web-inp" style={INP} placeholder="3105056616" value={telefono} onChange={e=>setTelefono(e.target.value)} />
                    </div>
                    <div>
                      <span style={LBL}>WhatsApp</span>
                      <input className="web-inp" style={INP} placeholder="3105056616" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
                    </div>
                    <div>
                      <span style={LBL}>Direccion</span>
                      <input className="web-inp" style={INP} placeholder="Calle 15 # 28-40" value={direccion} onChange={e=>setDireccion(e.target.value)} />
                    </div>
                    <div>
                      <span style={LBL}>Ciudad</span>
                      <input className="web-inp" style={INP} placeholder="Cali" value={ciudad} onChange={e=>setCiudad(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <span style={LBL}>Formas de pago</span>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                      {['Efectivo','Nequi','Daviplata','Transferencia','Tarjeta debito','Tarjeta credito'].map(p => (
                        <button key={p} onClick={() => togPago(p)}
                          style={{ background: formasPago.includes(p)?'rgba(255,107,0,0.12)':'rgba(255,255,255,0.04)', color: formasPago.includes(p)?'#FF8C40':'#6B7A99', border:`1px solid ${formasPago.includes(p)?'rgba(255,107,0,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:100, padding:'5px 14px', fontFamily:F, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones accion */}
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button onClick={guardarBorrador} disabled={saving}
                style={{ flex:1, background:'rgba(255,255,255,0.04)', color:'#8A9BB5', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'13px', fontFamily:F, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                {saving ? 'Guardando...' : 'Guardar borrador'}
              </button>
              <button onClick={publicar} disabled={saving}
                style={{ flex:2, background:'linear-gradient(135deg,#FF6B00,#FF9500)', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontFamily:F, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(255,107,0,0.35)' }}>
                {saving ? 'Publicando...' : publicada ? 'Actualizar mi web' : 'Publicar mi web'}
              </button>
            </div>
          </div>

          {/* ── PREVIEW DERECHA ── */}
          <div style={{ position:'sticky', top:80 }}>
            <div style={{ background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
              {/* Barra navegador simulada */}
              <div style={{ background:'#111827', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', gap:5 }}>
                  {['#EF4444','#F59E0B','#10B981'].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}
                </div>
                <div style={{ flex:1, background:'#0D1420', borderRadius:6, padding:'4px 10px', fontFamily:F, fontSize:10, color:'#4B6080', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  agenciame.com/sitio/{slug || 'tu-negocio'}
                </div>
                {publicada && <span style={{ fontFamily:F, fontSize:9, color:'#10B981', fontWeight:700, background:'rgba(16,185,129,0.1)', padding:'2px 8px', borderRadius:100 }}>ACTIVA</span>}
              </div>

              {/* Mini preview del sitio */}
              <div style={{ position:'relative', height:220, overflow:'hidden' }}>
                <img src={heroImg} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.85) 100%)' }} />
                {/* Nav mini */}
                <div style={{ position:'absolute', top:0, left:0, right:0, padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:F, fontSize:11, fontWeight:800, color:'#fff' }}>{titulo || empresa.nombreEmpresa}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    {['Servicios','Nosotros','Contacto'].map(l => <span key={l} style={{ fontFamily:F, fontSize:8, color:'rgba(255,255,255,0.6)' }}>{l}</span>)}
                    <span style={{ background:'#FF6B00', color:'#fff', fontFamily:F, fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:4 }}>Reservar cita</span>
                  </div>
                </div>
                {/* Contenido hero mini */}
                <div style={{ position:'absolute', bottom:16, left:12, right:12 }}>
                  <div style={{ background:'#FF6B00', color:'#fff', fontFamily:F, fontSize:7, fontWeight:700, padding:'2px 8px', borderRadius:100, display:'inline-block', marginBottom:6 }}>EMPRESA</div>
                  <div style={{ fontFamily:F, fontSize:14, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:4 }}>
                    {heroFrase || `Bienvenidos a ${titulo || empresa.nombreEmpresa}`}
                  </div>
                  <div style={{ fontFamily:F, fontSize:9, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>
                    {servicios.filter(s=>s.nombre).slice(0,3).map(s=>s.nombre).join(', ') || 'Tus servicios aqui'}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <span style={{ background:'#FF6B00', color:'#fff', fontFamily:F, fontSize:8, fontWeight:700, padding:'4px 10px', borderRadius:4 }}>Reservar cita</span>
                    <span style={{ background:'#25D366', color:'#fff', fontFamily:F, fontSize:8, fontWeight:700, padding:'4px 10px', borderRadius:4 }}>WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Servicios mini */}
              {servicios.some(s=>s.nombre) && (
                <div style={{ padding:'14px 14px 6px' }}>
                  <div style={{ fontFamily:F, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, color:'#FF6B00', textAlign:'center', marginBottom:8 }}>NUESTROS SERVICIOS</div>
                  <div style={{ fontFamily:F, fontSize:11, fontWeight:700, color:'#EFF4FF', textAlign:'center', marginBottom:10 }}>En que podemos ayudarte?</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:10 }}>
                    {servicios.filter(s=>s.nombre).slice(0,3).map((sv,i) => (
                      <div key={i} style={{ background:'#111827', borderRadius:8, padding:'10px 6px', textAlign:'center' }}>
                        <div style={{ fontSize:16, marginBottom:4 }}>⭐</div>
                        <div style={{ fontFamily:F, fontSize:9, fontWeight:600, color:'#EFF4FF', lineHeight:1.2 }}>{sv.nombre}</div>
                        {sv.precio && <div style={{ fontFamily:F, fontSize:8, color:'#FF6B00', marginTop:3 }}>${sv.precio}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacto mini */}
              <div style={{ background:'#111827', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:F, fontSize:10, fontWeight:700, color:'#EFF4FF' }}>{titulo || empresa.nombreEmpresa}</div>
                  {ciudad && <div style={{ fontFamily:F, fontSize:8, color:'#4B6080', marginTop:1 }}>{ciudad}</div>}
                  {telefono && <div style={{ fontFamily:F, fontSize:8, color:'#4B6080' }}>{telefono}</div>}
                </div>
                <button style={{ background:'#FF6B00', color:'#fff', border:'none', borderRadius:6, padding:'5px 12px', fontFamily:F, fontSize:9, fontWeight:700, cursor:'pointer' }}>Contactanos</button>
              </div>
            </div>

            {/* Info URL */}
            {publicada && (
              <div style={{ marginTop:12, background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontFamily:F, fontSize:11, color:'#4B6080', marginBottom:4 }}>URL de tu sitio web:</div>
                <div style={{ fontFamily:F, fontSize:12, color:'#10B981', wordBreak:'break-all', cursor:'pointer' }} onClick={() => window.open(siteUrl,'_blank')}>
                  {siteUrl}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
