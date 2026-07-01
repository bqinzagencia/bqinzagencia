// pages/wasapbot/web/[slug].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function WebPublica() {
  const router = useRouter();
  const { slug } = router.query;

  const [empresa, setEmpresa]     = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/wasapbot-web-publica?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setEmpresa(d.empresa); setServicios(d.servicios || []); }
        else setError(d.error || 'No se pudo cargar la página');
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setCargando(false));
  }, [slug]);

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,107,0,0.2)', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: F, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontFamily: FA, fontSize: 24, fontWeight: 400, marginBottom: 8 }}>Página no encontrada</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{error || 'Esta página no existe o fue movida.'}</p>
      </div>
    );
  }

  const whatsappLink = empresa.whatsapp?.numero
    ? `https://wa.me/${empresa.whatsapp.numero.replace(/\D/g, '')}`
    : null;

  return (
    <>
      <Head>
        <title>{empresa.tituloWeb || empresa.nombreEmpresa}</title>
        <meta name="description" content={empresa.descripcionWeb || ''} />
      </Head>

      <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: F }}>
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; }
          body { margin: 0; }
        ` }} />

        {/* Hero */}
        <div style={{
          minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden',
          background: empresa.fotoWebPortada
            ? `linear-gradient(rgba(8,8,8,0.7), rgba(8,8,8,0.95)), url(${empresa.fotoWebPortada})`
            : 'linear-gradient(135deg, #1a1a1a, #080808)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ fontFamily: FA, fontSize: 'clamp(32px,6vw,56px)', fontWeight: 400, letterSpacing: '-1px', marginBottom: 16, maxWidth: 700 }}>
            {empresa.tituloWeb || empresa.nombreEmpresa}
          </div>
          {empresa.descripcionWeb && (
            <p style={{ fontFamily: F, fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7, marginBottom: 32 }}>
              {empresa.descripcionWeb}
            </p>
          )}
          {empresa.webActivaWasapbot && whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer"
              style={{ background: '#25D366', color: '#fff', borderRadius: 99, padding: '14px 32px', fontFamily: F, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(37,211,102,0.3)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.84 14.16c-.25.7-1.25 1.29-2.04 1.46-.54.11-1.25.2-3.62-.78-3.04-1.26-5-4.36-5.15-4.56-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.6-.37.8-.37.2 0 .4 0 .58.01.18.01.43-.07.67.51.25.59.86 2.04.93 2.19.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.47.12.65-.07.18-.2.76-.88.96-1.18.2-.3.4-.25.67-.15.27.1 1.73.82 2.02.96.3.15.49.22.56.34.07.13.07.74-.18 1.44z"/></svg>
              Contactar por WhatsApp
            </a>
          )}
        </div>

        {/* Catálogo */}
        {servicios.length > 0 && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
            <h2 style={{ fontFamily: FA, fontSize: 28, fontWeight: 400, textAlign: 'center', marginBottom: 36, color: 'rgba(255,255,255,0.9)' }}>
              Catálogo
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
              {servicios.map((s, i) => (
                <div key={i} style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
                  {s.foto ? (
                    <img src={s.foto} alt={s.nombre} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 100, background: 'rgba(255,107,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 28 }}>📦</div>
                  )}
                  <div style={{ padding: 16 }}>
                    {s.categoria && (
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: '3px 10px', fontFamily: F, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', display: 'inline-block', marginBottom: 8 }}>
                        {s.categoria}
                      </span>
                    )}
                    <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{s.nombre}</div>
                    {s.descripcion && (
                      <div style={{ fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{s.descripcion}</div>
                    )}
                    {whatsappLink && empresa.webActivaWasapbot && (
                      <a href={whatsappLink} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#25D366', fontFamily: F, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                        Consultar disponibilidad →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: F, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            Página gestionada con <span style={{ color: '#FF6B00', fontWeight: 700 }}>BQinzagencIA</span>
          </div>
        </div>
      </div>
    </>
  );
}
