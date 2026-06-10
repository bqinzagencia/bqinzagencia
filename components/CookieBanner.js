// components/CookieBanner.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

const NARANJA = '#FF6B00';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('bqinz_cookie_consent');
      if (!consent) setVisible(true);
    } catch { setVisible(true); }
  }, []);

  function accept(all) {
    try {
      localStorage.setItem('bqinz_cookie_consent', all ? 'all' : 'essential');
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'rgba(17,19,24,0.98)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,107,0,0.2)',
      padding: showDetail ? '28px 40px' : '18px 40px',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
    }}>
      {!showDetail ? (
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
            <span style={{ fontSize: 22 }}>🍪</span>
            <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>
              Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de la plataforma.
              Puedes aceptar todas o solo las esenciales.{' '}
              <Link href="/cookies" style={{ color: NARANJA, textDecoration: 'none', fontWeight: 600 }}>Más información</Link>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <button onClick={() => setShowDetail(true)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#9CA3AF', borderRadius: 100, padding: '8px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Configurar
            </button>
            <button onClick={() => accept(false)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 100, padding: '8px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Solo esenciales
            </button>
            <button onClick={() => accept(true)}
              style={{ background: NARANJA, border: 'none', color: '#fff', borderRadius: 100, padding: '8px 20px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
              Aceptar todas
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 16, color: '#FAFAF8' }}>🍪 Configuración de cookies</h3>
          {[
            { name: 'Cookies esenciales', desc: 'Necesarias para el funcionamiento de la plataforma (sesión, seguridad, preferencias básicas). No pueden desactivarse.', required: true },
            { name: 'Cookies analíticas', desc: 'Nos ayudan a entender cómo se usa la plataforma para mejorarla. Usamos datos anonimizados, nunca datos personales.', required: false },
            { name: 'Cookies de marketing', desc: 'Permiten mostrarte contenido relevante en otras plataformas. Solo activas si las aceptas expresamente.', required: false },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#FAFAF8', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {c.required
                  ? <span style={{ fontSize: 11, color: NARANJA, fontWeight: 700, background: 'rgba(255,107,0,0.1)', padding: '3px 10px', borderRadius: 100 }}>Siempre activas</span>
                  : <span style={{ fontSize: 11, color: '#6B7280', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 100 }}>Opcionales</span>
                }
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => accept(false)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 100, padding: '10px 22px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              Solo esenciales
            </button>
            <button onClick={() => accept(true)}
              style={{ background: NARANJA, border: 'none', color: '#fff', borderRadius: 100, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
              Aceptar todas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
