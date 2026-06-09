// components/ModalBienvenida.js
import { useState, useEffect, useRef } from 'react';

const AZUL = '#2B6AFF';
const AZUL_BG = 'rgba(43,106,255,0.92)';

export default function ModalBienvenida() {
  const [visible, setVisible] = useState(false);
  const [cerrado, setCerrado] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const [audioActivo, setAudioActivo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const iniciarConAudio = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setIniciado(true);
    vid.muted = false;
    vid.play()
      .then(() => setAudioActivo(true))
      .catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
        setAudioActivo(false);
      });
  };

  const toggleAudio = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (audioActivo) { vid.muted = true; setAudioActivo(false); }
    else             { vid.muted = false; setAudioActivo(true); }
  };

  const cerrar = () => {
    setCerrado(true);
    if (videoRef.current) videoRef.current.pause();
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInModal  { from{opacity:0} to{opacity:1} }
        @keyframes fadeOutModal { from{opacity:1} to{opacity:0} }
        @keyframes slideUpCard  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .bv-overlay-in  { animation: fadeInModal  0.4s ease forwards; }
        .bv-overlay-out { animation: fadeOutModal 0.35s ease forwards; }
        .bv-card-in     { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .bv-card-out    { animation: fadeOutModal 0.3s ease forwards; }
        .bv-texto-in    { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .bv-play-btn:hover {
          transform: scale(1.08) !important;
          background: ${AZUL} !important;
          box-shadow: 0 8px 32px rgba(43,106,255,0.55) !important;
        }
        .bv-cta:hover {
          background: #1A56E8 !important;
          box-shadow: 0 8px 28px rgba(43,106,255,0.5) !important;
          transform: translateY(-1px);
        }
      `}} />

      {/* Overlay */}
      <div
        className={cerrado ? 'bv-overlay-out' : 'bv-overlay-in'}
        onClick={iniciado ? cerrar : iniciarConAudio}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
          padding: '0 0 40px 40px',
        }}
      >
        {/* Tarjeta del video */}
        <div
          className={cerrado ? 'bv-card-out' : 'bv-card-in'}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative', width: 280,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
            background: '#000',
          }}
        >
          {/* Badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 10,
            background: AZUL_BG,
            color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '4px 12px',
            borderRadius: 100, letterSpacing: 0.5,
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: '0 4px 16px rgba(43,106,255,0.4)',
          }}>
            👋 Bienvenida
          </div>

          {/* Cerrar */}
          <button onClick={cerrar} style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>✕</button>

          {/* Botón audio */}
          {iniciado && (
            <button onClick={toggleAudio} style={{
              position: 'absolute', bottom: 70, right: 12, zIndex: 10,
              width: 34, height: 34, borderRadius: '50%',
              background: audioActivo ? 'rgba(43,106,255,0.35)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${audioActivo ? 'rgba(43,106,255,0.6)' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {audioActivo ? '🔊' : '🔇'}
            </button>
          )}

          {/* Video */}
          <video
            ref={videoRef}
            src="/bienvenida.mp4"
            playsInline muted loop
            style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover' }}
          />

          {/* Overlay play */}
          {!iniciado && (
            <div
              onClick={iniciarConAudio}
              style={{
                position: 'absolute', inset: 0, zIndex: 20,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
                cursor: 'pointer', gap: 12,
              }}
            >
              <div className="bv-play-btn" style={{
                width: 68, height: 68, borderRadius: '50%',
                background: AZUL_BG,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
                transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 32px rgba(43,106,255,0.45)',
              }}>▶</div>
              <span style={{
                color: '#fff', fontSize: 13, fontWeight: 600,
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: 0.5,
              }}>Ver con sonido</span>
            </div>
          )}

          {/* CTA inferior */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '48px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)',
            display: 'flex', flexDirection: 'column', gap: 8,
            zIndex: iniciado ? 10 : 5,
          }}>
            <a href="/auth/register" onClick={cerrar} className="bv-cta" style={{
              background: AZUL,
              color: '#fff',
              borderRadius: 100,
              padding: '11px 16px',
              fontSize: 13, fontWeight: 700, textAlign: 'center',
              textDecoration: 'none', display: 'block',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: '0 4px 20px rgba(43,106,255,0.4)',
              transition: 'all 0.2s',
            }}>
              Comenzar gratis →
            </a>
            <button onClick={cerrar} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.45)',
              border: 'none', fontSize: 12, cursor: 'pointer', padding: '4px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Saltar
            </button>
          </div>
        </div>

        {/* Texto lateral */}
        <div
          className={cerrado ? '' : 'bv-texto-in'}
          onClick={e => e.stopPropagation()}
          style={{ marginLeft: 20, marginBottom: 20, maxWidth: 280, opacity: 0 }}
        >
          <div style={{
            fontFamily: "'Abril Fatface', serif",
            fontSize: 22, color: '#fff', marginBottom: 12, lineHeight: 1.2,
          }}>
            Tu negocio<br />en piloto<br />
            <span style={{ color: AZUL }}>automatico.</span>
          </div>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65, marginBottom: 16,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Agentes IA que atienden, agendan y venden por ti — 24/7.
          </p>
          {['Chat IA', 'Agendamiento automatico', 'CRM inteligente', 'Pagina web incluida'].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'rgba(255,255,255,0.7)',
              marginBottom: 6,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              <span style={{ color: AZUL, fontWeight: 700 }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
