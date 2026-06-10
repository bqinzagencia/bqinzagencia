// pages/dashboard/web.js
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa } from '../../lib/firebase';

// Fotos profesionales por industria desde Unsplash (libres de uso)
const FOTOS_POR_INDUSTRIA = {
  taller: [
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1609592806596-b7af72f5f5a5?w=1200&q=80',
  ],
  peluqueria: [
    'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1200&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80',
    'https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=1200&q=80',
  ],
  restaurante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80',
  ],
  inmobiliaria: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
  ],
  tienda: [
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80',
  ],
  papeleria: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
  ],
  gimnasio: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
  ],
  salud: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80',
  ],
  educacion: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80',
  ],
  generico: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80',
  ],
};

const PLANTILLAS = [
  { id: 'taller',      nombre: 'Taller / Mecánica',   emoji: '🔧', color: '#FF6B6B', desc: 'Órdenes, presupuestos, revisiones automáticas' },
  { id: 'peluqueria',  nombre: 'Peluquería / Spa',     emoji: '✂️', color: '#EC4899', desc: 'Citas, servicios, fidelización de clientes' },
  { id: 'restaurante', nombre: 'Restaurante',          emoji: '🍽️', color: '#EAB308', desc: 'Menú, reservas, delivery automatizado' },
  { id: 'inmobiliaria',nombre: 'Inmobiliaria',         emoji: '🏠', color: '#3B82F6', desc: 'Propiedades, leads, firma digital' },
  { id: 'tienda',      nombre: 'Tienda / Retail',      emoji: '🛒', color: '#10B981', desc: 'Catálogo, pedidos, seguimiento de stock' },
  { id: 'papeleria',   nombre: 'Papelería / Oficina',  emoji: '📋', color: '#8B5CF6', desc: 'Cotizaciones, pedidos, impresión online' },
  { id: 'gimnasio',    nombre: 'Gimnasio / Fitness',   emoji: '🏋️', color: '#F97316', desc: 'Membresías, clases, seguimiento fitness' },
  { id: 'salud',       nombre: 'Salud / Clínica',      emoji: '🏥', color: '#14B8A6', desc: 'Citas médicas, historial, recordatorios' },
  { id: 'educacion',   nombre: 'Educación / Academia', emoji: '📚', color: '#6366F1', desc: 'Inscripciones, clases virtuales, seguimiento' },
  { id: 'generico',    nombre: 'Profesional General',  emoji: '🏢', color: '#A78BFA', desc: 'Diseño limpio y adaptable a cualquier negocio' },
];

// ─── Componente de Preview de Página Web ───────────────────────────────────────
function WebPreview({ empresa, plantilla, fotoHero }) {
  if (!plantilla) return null;
  const foto = fotoHero || FOTOS_POR_INDUSTRIA[plantilla.id]?.[0] || FOTOS_POR_INDUSTRIA.generico[0];
  const nombre = empresa?.nombreEmpresa || 'Tu Empresa';
  const ciudad = empresa?.ciudad || 'España';

  return (
    <div style={{
      width: '100%', borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      background: '#fff',
    }}>
      {/* Browser bar */}
      <div style={{ background: '#1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, background: '#2d2d4e', borderRadius: 6, padding: '5px 14px', fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
          🔒 bqinzagencia.com/{nombre.toLowerCase().replace(/\s/g, '-')}
        </div>
      </div>

      {/* HERO con foto real */}
      <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
        <img src={foto} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />

        {/* Nav dentro del hero */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>
            {nombre}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            {['Servicios','Sobre nosotros','Galería','Contacto'].map(l => (
              <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <div style={{ background: plantilla.color, color: '#fff', borderRadius: 100, padding: '7px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Agendar cita
          </div>
        </div>

        {/* Copy del hero */}
        <div style={{ position: 'absolute', bottom: 40, left: 32, right: '40%' }}>
          <div style={{ background: plantilla.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {plantilla.emoji} {plantilla.nombre} en {ciudad}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.5px' }}>
            Bienvenidos a<br />{nombre}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            {plantilla.desc}. Atención rápida, resultados garantizados.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: plantilla.color, color: '#fff', borderRadius: 100, padding: '10px 22px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Ver servicios →
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 100, padding: '10px 22px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)' }}>
              WhatsApp 💬
            </div>
          </div>
        </div>
      </div>

      {/* SERVICIOS */}
      <div style={{ padding: '48px 32px', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ color: plantilla.color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Nuestros servicios</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#111', letterSpacing: '-0.5px' }}>
            ¿En qué podemos ayudarte?
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '⭐', title: 'Servicio Premium', desc: 'Atención personalizada con los mejores estándares de calidad.' },
            { icon: '⚡', title: 'Respuesta Rápida', desc: 'Agente IA disponible 24/7 para responder a tus clientes.' },
            { icon: '🛡️', title: 'Garantía Total', desc: 'Satisfacción garantizada o te devolvemos tu inversión.' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', textAlign: 'center', border: `1px solid ${i === 0 ? plantilla.color + '33' : 'transparent'}` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACTO */}
      <div style={{ background: '#111', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>¿Listo para comenzar?</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>📍 {ciudad} · Atención 24/7 con IA</div>
        </div>
        <div style={{ background: plantilla.color, color: '#fff', borderRadius: 100, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Contáctanos →
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1); // 1=elige plantilla, 2=activa/edita
  const [plantillaId, setPlantillaId] = useState('');
  const [fotoHero, setFotoHero] = useState(null); // URL personalizada subida
  const [fotoIdx, setFotoIdx] = useState(0);       // índice de foto Unsplash
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (empresa?.plantillaWeb) {
      setPlantillaId(empresa.plantillaWeb);
      setFotoHero(empresa.fotoHeroPersonalizada || null);
      setStep(2);
    }
  }, [empresa]);

  const plantilla = PLANTILLAS.find(p => p.id === plantillaId);
  const fotosDisponibles = FOTOS_POR_INDUSTRIA[plantillaId] || FOTOS_POR_INDUSTRIA.generico;
  const fotoActual = fotoHero || fotosDisponibles[fotoIdx];

  const aplicarPlantilla = async () => {
    if (!plantillaId) { toast.error('Selecciona una plantilla'); return; }
    setSaving(true);
    try {
      await updateEmpresa(user.uid, {
        plantillaWeb: plantillaId,
        fotoHeroPersonalizada: fotoHero || null,
      });
      toast.success('¡Página web generada! 🎉');
      setStep(2);
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  // Subir foto personalizada (base64 → guarda en Firestore o Storage)
  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('La foto no puede superar 5 MB'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoHero(ev.target.result);
      setUploading(false);
      toast.success('¡Foto cargada! Guarda los cambios para aplicarla.');
    };
    reader.readAsDataURL(file);
  };

  const guardarCambios = async () => {
    setSaving(true);
    try {
      await updateEmpresa(user.uid, {
        plantillaWeb: plantillaId,
        fotoHeroPersonalizada: fotoHero || null,
      });
      toast.success('Cambios guardados ✅');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Mi Web — BQinzagencIA</title></Head>
      <DashboardLayout title="Mi Página Web">

        {/* ── PASO 1: Elegir plantilla ── */}
        {step === 1 && (
          <div>
            <p style={{ color: 'var(--gray5)', fontSize: 15, marginBottom: 32 }}>
              Elige la plantilla que mejor describe tu negocio. La IA personalizará el diseño, contenido y fotos automáticamente.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 40 }}>
              {PLANTILLAS.map(p => (
                <div key={p.id} onClick={() => setPlantillaId(p.id)}
                  style={{
                    background: plantillaId === p.id ? p.color + '18' : 'var(--gray1)',
                    border: `2px solid ${plantillaId === p.id ? p.color : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
                    transition: 'all 0.2s', position: 'relative',
                  }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{p.emoji}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: plantillaId === p.id ? p.color : 'var(--white)', marginBottom: 6 }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray5)', lineHeight: 1.5 }}>{p.desc}</div>
                  {plantillaId === p.id && (
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>✓</div>
                  )}
                </div>
              ))}
            </div>

            {/* Preview en tiempo real */}
            {plantilla && (
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--gray5)' }}>
                  Vista previa — <span style={{ color: plantilla.color }}>{plantilla.nombre}</span>
                </h3>
                <WebPreview empresa={empresa} plantilla={plantilla} fotoHero={fotoHero} />
              </div>
            )}

            <button className="btn btn-accent btn-lg" onClick={aplicarPlantilla} disabled={saving || !plantillaId}>
              {saving ? 'Generando...' : 'Generar mi página web profesional →'}
            </button>
          </div>
        )}

        {/* ── PASO 2: Gestionar web activa ── */}
        {step === 2 && plantilla && (
          <div>
            {/* Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5A0', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Tu web está activa</span>
                </div>
                <div style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 16 }}>
                  Plantilla: <strong style={{ color: plantilla.color }}>{plantilla.emoji} {plantilla.nombre}</strong>
                </div>
                <div style={{ background: 'var(--gray2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--accent)', marginBottom: 16 }}>
                  bqinzagencia.com/{empresa.nombreEmpresa?.toLowerCase().replace(/\s/g, '-')}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href="#" className="btn btn-accent btn-sm" style={{ fontSize: 12 }}>🔗 Ver web</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ fontSize: 12 }}>Cambiar plantilla</button>
                </div>
              </div>

              <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Funciones activas</div>
                {[
                  { icon: '📱', title: 'Chat IA integrado', active: true },
                  { icon: '📅', title: 'Botón de agenda', active: true },
                  { icon: '📋', title: 'Formulario de contacto', active: true },
                  { icon: '🔍', title: 'SEO optimizado', active: true },
                  { icon: '📲', title: 'Botón WhatsApp flotante', active: true },
                ].map((f, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{f.title}</span>
                    <span style={{ color: '#00E5A0', fontWeight: 700, fontSize: 12 }}>✓ ON</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EDITOR DE FOTO ── */}
            <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>📸 Foto de portada</div>
              <p style={{ color: 'var(--gray5)', fontSize: 13, marginBottom: 24 }}>
                Sube una foto propia de tu empresa o elige una de nuestras fotos profesionales.
              </p>

              {/* Botón subir foto personalizada */}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-lg"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                    color: '#fff', border: 'none', fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                  {uploading ? '⏳ Subiendo...' : '📤 Subir foto de mi empresa'}
                </button>
                {fotoHero && (
                  <button className="btn btn-ghost" onClick={() => { setFotoHero(null); setFotoIdx(0); }} style={{ fontSize: 13 }}>
                    ✕ Quitar foto personalizada
                  </button>
                )}
              </div>

              {/* Galería de fotos profesionales */}
              {!fotoHero && (
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray5)', marginBottom: 12 }}>O elige una foto profesional:</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {fotosDisponibles.map((url, i) => (
                      <div key={i} onClick={() => setFotoIdx(i)}
                        style={{
                          width: 120, height: 75, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                          border: `3px solid ${fotoIdx === i ? plantilla.color : 'transparent'}`,
                          transition: 'all 0.2s', flexShrink: 0,
                        }}>
                        <img src={url} alt={`foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de la foto seleccionada */}
              <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', height: 160, position: 'relative' }}>
                <img src={fotoActual} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'center', paddingLeft: 24 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
                      {empresa.nombreEmpresa}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                      {fotoHero ? '📤 Foto personalizada' : '🖼️ Foto profesional'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview completa */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 20 }}>
                Vista previa de tu página web
              </div>
              <WebPreview empresa={empresa} plantilla={plantilla} fotoHero={fotoActual} />
            </div>

            <button className="btn btn-accent btn-lg" onClick={guardarCambios} disabled={saving}>
              {saving ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
