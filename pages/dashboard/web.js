// pages/dashboard/web.js
// Mi Página Web — con foto personalizada de fondo — NEXOIA

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Cloudinary config — mismo que CADEGRAN
const CLOUD_NAME = 'dsomqay6y';
const UPLOAD_PRESET = 'cadegran_fotos'; // preset sin firmar

const INDUSTRIAS_CONFIG = {
  peluqueria: { img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', label: 'Peluquería / Spa' },
  taller: { img: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80', label: 'Taller / Mecánica' },
  restaurante: { img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', label: 'Restaurante' },
  inmobiliaria: { img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', label: 'Inmobiliaria' },
  tienda: { img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', label: 'Tienda / Retail' },
  gimnasio: { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', label: 'Gimnasio / Fitness' },
  salud: { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', label: 'Salud / Clínica' },
  papeleria: { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', label: 'Servicios / Papelería' },
};

export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fotoPersonalizada, setFotoPersonalizada] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (empresa) {
      if (empresa.plantillaWeb) {
        setPlantillaSeleccionada(empresa.plantillaWeb);
        setStep(2);
      }
      if (empresa.fotoWeb) {
        setFotoPersonalizada(empresa.fotoWeb);
        setFotoPreview(empresa.fotoWeb);
      }
    }
  }, [empresa]);

  const slug = (empresa?.nombreEmpresa || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const siteUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://nexoia-eight.vercel.app') + '/sitio/' + slug;
  const indConfig = INDUSTRIAS_CONFIG[empresa?.industria] || INDUSTRIAS_CONFIG.salud;

  // ── Subir foto a Cloudinary ──────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error('La foto no debe superar ' + maxSizeMB + 'MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = e => setFotoPreview(e.target.result);
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'nexoia/sitios');

      const res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir la imagen');
      const data = await res.json();
      setFotoPersonalizada(data.secure_url);
      toast.success('✅ Foto subida correctamente');
    } catch (err) {
      toast.error('Error al subir la foto: ' + err.message);
      setFotoPreview('');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const quitarFoto = () => {
    setFotoPersonalizada('');
    setFotoPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const aplicarPlantilla = async () => {
    setSaving(true);
    try {
      await updateEmpresa(user.uid, {
        plantillaWeb: plantillaSeleccionada || empresa.industria,
        fotoWeb: fotoPersonalizada || '',
      });
      toast.success('¡Tu sitio web está listo! 🎉');
      setStep(2);
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const guardarCambiosFoto = async () => {
    setSaving(true);
    try {
      await updateEmpresa(user.uid, { fotoWeb: fotoPersonalizada || '' });
      toast.success('Foto actualizada ✅');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const fotoActual = fotoPreview || fotoPersonalizada || indConfig.img;

  return (
    <>
      <Head><title>Mi Web — NEXOIA</title></Head>
      <DashboardLayout title="Mi Página Web">

        {step === 1 && (
          <>
            <p style={{ color: 'var(--gray5)', fontSize: 15, marginBottom: 32 }}>
              Tu página web se genera automáticamente con el diseño de tu industria. Puedes personalizar la foto de fondo.
            </p>

            {/* Preview del sitio */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 32, height: 280, background: '#111' }}>
              <img src={fotoActual} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploadingPhoto ? 0.4 : 1, transition: 'opacity 0.3s' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                {uploadingPhoto ? (
                  <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <div style={{ color: '#fff', fontSize: 14 }}>Subiendo foto...</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>{empresa.nombreEmpresa}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{indConfig.label}</div>
                    <div style={{ marginTop: 8, background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 100, padding: '4px 14px', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                      Vista previa
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Foto personalizada */}
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>📸 Foto de fondo personalizada</h3>
              <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Sube una foto propia para el hero de tu sitio web. Si no subes foto, se usará automáticamente la imagen de tu industria.
              </p>

              {/* Especificaciones */}
              <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>📐 Especificaciones recomendadas:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { icon: '📏', label: 'Tamaño mínimo', valor: '1200 × 630 px' },
                    { icon: '🎯', label: 'Tamaño ideal', valor: '1920 × 1080 px (Full HD)' },
                    { icon: '⚖️', label: 'Peso máximo', valor: '5 MB' },
                    { icon: '🖼️', label: 'Formatos', valor: 'JPG, PNG, WEBP' },
                    { icon: '📐', label: 'Relación', valor: '16:9 (horizontal)' },
                    { icon: '💡', label: 'Consejo', valor: 'Foto oscura o con personas' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--gray5)', fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray7)', fontWeight: 500 }}>{s.valor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zona de subida */}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

              {!fotoPersonalizada ? (
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Subir mi foto</div>
                  <div style={{ color: 'var(--gray5)', fontSize: 13 }}>Haz clic o arrastra tu imagen aquí</div>
                  <div style={{ color: 'var(--gray5)', fontSize: 11, marginTop: 8 }}>JPG, PNG, WEBP · Máx 5MB · Mín 1200×630px</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px' }}>
                  <img src={fotoPersonalizada} alt="preview" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>✅ Foto personalizada activa</div>
                    <div style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 2 }}>Se usará como fondo de tu sitio web</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>Cambiar</button>
                    <button className="btn btn-danger btn-sm" onClick={quitarFoto}>Quitar</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-accent btn-lg" style={{ flex: 1, justifyContent: 'center' }}
                onClick={aplicarPlantilla} disabled={saving || uploadingPhoto}>
                {saving ? 'Guardando...' : '🌐 Generar mi sitio web →'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div>
            {/* Sitio activo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>✅ Tu sitio web está activo</div>
                <div style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                  Generado con tu industria, servicios y foto de fondo.
                </div>
                <div style={{ background: 'var(--gray2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--accent)', cursor: 'pointer', wordBreak: 'break-all' }}
                  onClick={() => window.open(siteUrl, '_blank')}>
                  {siteUrl}
                </div>
                <button className="btn btn-accent btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  onClick={() => window.open(siteUrl, '_blank')}>
                  🌐 Ver mi sitio web
                </button>
              </div>

              {/* Preview foto actual */}
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', minHeight: 200 }}>
                <img src={fotoPreview || fotoPersonalizada || indConfig.img} alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 200 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{empresa.nombreEmpresa}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{indConfig.label}</div>
                </div>
              </div>
            </div>

            {/* Cambiar foto */}
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📸 Foto de fondo del sitio</h3>

              {/* Especificaciones compactas */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'Tamaño ideal', v: '1920×1080px (Full HD)' },
                  { label: 'Mínimo', v: '1200×630px' },
                  { label: 'Peso máximo', v: '5 MB' },
                  { label: 'Formatos', v: 'JPG · PNG · WEBP' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--gray2)', borderRadius: 8, padding: '8px 14px' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray5)', fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray7)', fontWeight: 600, marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

              {!fotoPersonalizada ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}>
                    {uploadingPhoto ? '⏳ Subiendo...' : '📷 Subir mi foto'}
                  </button>
                  <span style={{ color: 'var(--gray5)', fontSize: 13 }}>Actualmente usando foto de industria</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px' }}>
                  <img src={fotoPersonalizada} alt="preview" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>✅ Foto personalizada</div>
                    <div style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 2 }}>Tu foto propia como fondo</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}>
                      {uploadingPhoto ? '...' : 'Cambiar'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={quitarFoto}>Quitar</button>
                  </div>
                </div>
              )}

              {(fotoPersonalizada !== empresa?.fotoWeb) && (
                <button className="btn btn-accent btn-sm" style={{ marginTop: 12 }} onClick={guardarCambiosFoto} disabled={saving || uploadingPhoto}>
                  {saving ? 'Guardando...' : '💾 Guardar cambios de foto'}
                </button>
              )}
            </div>

            {/* Herramientas */}
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>⚡ Herramientas activas</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '💬', title: 'Chat IA integrado', desc: 'Botón flotante con tu agente IA' },
                  { icon: '📅', title: 'Agendamiento', desc: 'Los clientes reservan citas desde tu web' },
                  { icon: '📱', title: 'WhatsApp directo', desc: 'Botón de WhatsApp en el hero' },
                  { icon: '🔍', title: 'SEO optimizado', desc: 'Aparece en búsquedas de Google' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--gray2)', borderRadius: 10 }}>
                    <span style={{ fontSize: 22 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>✏️ Editar configuración</button>
              <button className="btn btn-accent" onClick={() => window.open(siteUrl, '_blank')}>🌐 Ver sitio web</button>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
