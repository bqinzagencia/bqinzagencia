// pages/cookies.js
import Head from 'next/head';
import Link from 'next/link';
import { Logo } from './index';

const NARANJA = '#FF6B00';

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Política de Cookies — BQinzagencIA</title>
      </Head>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><Logo size={18} /></Link>
        <Link href="/" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>← Volver al inicio</Link>
      </nav>
      <div style={{ minHeight: '100vh', background: '#080B0F', color: '#FAFAF8', padding: '100px 40px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', color: NARANJA, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
          🍪 Política de Cookies · Última actualización: junio 2026
        </div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 48 }}>Política de Cookies</h1>

        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
          BQinzagencIA utiliza cookies propias y de terceros para mejorar la experiencia de usuario, analizar el tráfico y personalizar el contenido. A continuación, detallamos los tipos de cookies que utilizamos y su finalidad.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111318' }}>
                {['Tipo', 'Nombre', 'Finalidad', 'Duración'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#6B7280', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { tipo: 'Esencial', nombre: 'bqinz_session', fin: 'Mantener la sesión activa del usuario', dur: 'Sesión' },
                { tipo: 'Esencial', nombre: 'bqinz_cookie_consent', fin: 'Guardar las preferencias de cookies', dur: '12 meses' },
                { tipo: 'Esencial', nombre: '__Secure-next-auth', fin: 'Autenticación segura de la cuenta', dur: 'Sesión' },
                { tipo: 'Analítica', nombre: '_ga, _gid', fin: 'Google Analytics: análisis de uso anónimo', dur: '2 años / 24h' },
                { tipo: 'Marketing', nombre: 'fbp, fbc', fin: 'Meta Pixel: medición de conversiones', dur: '90 días' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: row.tipo === 'Esencial' ? 'rgba(255,107,0,0.1)' : row.tipo === 'Analítica' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                      color: row.tipo === 'Esencial' ? NARANJA : row.tipo === 'Analítica' ? '#3B82F6' : '#8B5CF6',
                      padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    }}>{row.tipo}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: 12 }}>{row.nombre}</td>
                  <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{row.fin}</td>
                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 14 }}>¿Cómo gestionar las cookies?</h2>
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
          Puede configurar sus preferencias de cookies en cualquier momento haciendo clic en el banner de cookies que aparece al acceder a la plataforma. También puede configurar su navegador para rechazar todas las cookies, aunque esto puede afectar a la funcionalidad del servicio.
        </p>
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.8 }}>
          Para más información, puede consultar la guía de la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: NARANJA, textDecoration: 'none' }}>Agencia Española de Protección de Datos (AEPD)</a>.
        </p>
      </div>
    </>
  );
}
