// pages/dashboard/web.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { updateEmpresa } from '../../lib/firebase';

const PLANTILLAS = [
  { id: 'taller', nombre: 'Taller / Mecánica', preview: '🔧', color: '#FF6B6B' },
  { id: 'peluqueria', nombre: 'Peluquería / Spa', preview: '✂️', color: '#EC4899' },
  { id: 'restaurante', nombre: 'Restaurante', preview: '🍕', color: '#EAB308' },
  { id: 'inmobiliaria', nombre: 'Inmobiliaria', preview: '🏠', color: '#3B82F6' },
  { id: 'tienda', nombre: 'Tienda / Retail', preview: '🛒', color: '#10B981' },
  { id: 'generico', nombre: 'Genérico Profesional', preview: '🏢', color: '#8B5CF6' },
];

export default function Web() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(empresa?.plantillaWeb || '');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(empresa?.plantillaWeb ? 2 : 1);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  const aplicarPlantilla = async () => {
    if (!plantillaSeleccionada) { toast.error('Selecciona una plantilla'); return; }
    setSaving(true);
    try {
      await updateEmpresa(user.uid, { plantillaWeb: plantillaSeleccionada });
      toast.success('¡Plantilla aplicada! Tu web está lista 🎉');
      setStep(2);
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Mi Web — NEXOIA</title></Head>
      <DashboardLayout title="Mi Página Web">
        {step === 1 && (
          <>
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: 'var(--gray5)', fontSize: 16 }}>Elige una plantilla para tu página web. La IA la personalizará automáticamente con tu información.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
              {PLANTILLAS.map(p => (
                <div key={p.id} onClick={() => setPlantillaSeleccionada(p.id)}
                  style={{ background: 'var(--gray1)', border: `2px solid ${plantillaSeleccionada === p.id ? p.color : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '28px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{p.preview}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, color: plantillaSeleccionada === p.id ? p.color : 'var(--white)' }}>{p.nombre}</div>
                  {plantillaSeleccionada === p.id && (
                    <div style={{ marginTop: 10, fontSize: 12, color: p.color, fontWeight: 600 }}>✓ Seleccionada</div>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-accent btn-lg" onClick={aplicarPlantilla} disabled={saving || !plantillaSeleccionada}>
              {saving ? 'Aplicando...' : 'Generar mi página web con IA →'}
            </button>
          </>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>✅ Tu web está activa</div>
                <div style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 16 }}>Tu página web fue generada con la información de tu negocio.</div>
                <div style={{ background: 'var(--gray2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: 'var(--accent)' }}>
                  nexoia.co/{empresa.nombreEmpresa?.toLowerCase().replace(/\s/g,'-')}
                </div>
              </div>
              <div style={{ background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Herramientas de la web</div>
                {[
                  { icon: '📱', title: 'Chat integrado', desc: 'Widget de chat con tu agente IA en la web' },
                  { icon: '📋', title: 'Formulario de contacto', desc: 'Los clientes pueden dejarte mensajes' },
                  { icon: '📅', title: 'Botón de agenda', desc: 'Cita directa desde la web al calendario' },
                  { icon: '🔍', title: 'SEO optimizado', desc: 'Aparece en Google con tu información' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray5)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Cambiar plantilla</button>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
