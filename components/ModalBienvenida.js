// components/ModalBienvenida.js
import { useState, useEffect, useRef } from 'react';

const N  = '#FF6B00';           // naranja principal
const NB = 'rgba(255,107,0,0.95)'; // naranja para fondos

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
      .catch(() => { vid.muted = true; vid.play().catch(()=>{}); setAudioActivo(false); });
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

  const F = "'Inter', system-ui, sans-serif";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fadeInModal  { from{opacity:0} to{opacity:1} }
        @keyframes fadeOutModal { from{opacity:1} to{opacity:0} }
        @keyframes slideUpCard  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .bv-overlay-in  { animation: fadeInModal  0.4s ease forwards; }
        .bv-overlay-out { animation: fadeOutModal 0.35s ease forwards; }
        .bv-card-in     { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .bv-card-out    { animation: fadeOutModal 0.3s ease forwards; }
        .bv-texto-in    { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .bv-play-btn:hover {
          transform: scale(1.1) !important;
          background: #FF8C00 !important;
          box-shadow: 0 12px 40px rgba(255,107,0,0.7) !important;
        }
        .bv-cta:hover {
          background: #E55F00 !important;
          box-shadow: 0 10px 32px rgba(255,107,0,0.6) !important;
          transform: translateY(-2px) !important;
        }
        .bv-cerrar:hover { background: rgba(255,255,255,0.18) !important; }
      `}} />

      {/* Overlay */}
      <div
        className={cerrado ? 'bv-overlay-out' : 'bv-overlay-in'}
        onClick={iniciado ? cerrar : iniciarConAudio}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
          padding: '0 0 40px 40px',
        }}
      >
        {/* ── Tarjeta video ── */}
        <div
          className={cerrado ? 'bv-card-out' : 'bv-card-in'}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative', width: 280,
            borderRadius: 22, overflow: 'hidden',
            boxShadow: `0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(255,107,0,0.15)`,
            background: '#000',
          }}
        >
          {/* Badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 10,
            background: NB, color: '#fff',
            fontSize: 11, fontWeight: 800, padding: '5px 14px',
            borderRadius: 100, letterSpacing: '0.06em',
            fontFamily: F,
            boxShadow: '0 4px 16px rgba(255,107,0,0.5)',
            textTransform: 'uppercase',
          }}>
            👋 Bienvenida
          </div>

          {/* Cerrar */}
          <button className="bv-cerrar" onClick={cerrar} style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', fontFamily: F,
          }}>✕</button>

          {/* Botón audio */}
          {iniciado && (
            <button onClick={toggleAudio} style={{
              position: 'absolute', bottom: 72, right: 12, zIndex: 10,
              width: 34, height: 34, borderRadius: '50%',
              background: audioActivo ? 'rgba(255,107,0,0.35)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${audioActivo ? 'rgba(255,107,0,0.7)' : 'rgba(255,255,255,0.2)'}`,
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
                background: 'rgba(0,0,0,0.42)',
                cursor: 'pointer', gap: 12,
              }}
            >
              <div className="bv-play-btn" style={{
                width: 72, height: 72, borderRadius: '50%',
                background: NB,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, color: '#fff',
                transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 36px rgba(255,107,0,0.55)',
              }}>▶</div>
              <span style={{
                color: '#fff', fontSize: 13, fontWeight: 700,
                fontFamily: F, letterSpacing: '0.03em',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}>Ver con sonido</span>
            </div>
          )}

          {/* CTA inferior */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '52px 14px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, transparent 100%)',
            display: 'flex', flexDirection: 'column', gap: 8,
            zIndex: iniciado ? 10 : 5,
          }}>
            <a href="/auth/register" onClick={cerrar} className="bv-cta" style={{
              background: N,
              color: '#fff',
              borderRadius: 100,
              padding: '12px 16px',
              fontSize: 14, fontWeight: 800,
              textAlign: 'center', textDecoration: 'none', display: 'block',
              fontFamily: F, letterSpacing: '0.02em',
              boxShadow: '0 6px 24px rgba(255,107,0,0.45)',
              transition: 'all 0.2s',
            }}>
              Comenzar gratis →
            </a>
            <button onClick={cerrar} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.45)',
              border: 'none', fontSize: 12, cursor: 'pointer', padding: '4px',
              fontFamily: F, transition: 'color 0.2s',
            }}>
              Saltar
            </button>
          </div>
        </div>

        {/* ── Texto lateral ── */}
        <div
          className={cerrado ? '' : 'bv-texto-in'}
          onClick={e => e.stopPropagation()}
          style={{ marginLeft: 22, marginBottom: 20, maxWidth: 290, opacity: 0 }}
        >
          {/* Título vistoso */}
          <div style={{
            fontFamily: "'Abril Fatface', serif",
            fontSize: 26, color: '#fff', marginBottom: 14,
            lineHeight: 1.15, letterSpacing: '-0.01em',
          }}>
            Tu negocio<br />en piloto<br />
            <span style={{
              color: N,
              textShadow: '0 0 32px rgba(255,107,0,0.6)',
            }}>
              automatico.
            </span>
          </div>

          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.62)',
            lineHeight: 1.65, marginBottom: 18, fontFamily: F,
          }}>
            Agentes IA que atienden, agendan y venden por ti — 24/7.
          </p>

          {/* Lista de features */}
          {[
            'Chat IA en tu sitio web',
            'Agendamiento automatico',
            'CRM inteligente',
            'Pagina web incluida',
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.82)',
              marginBottom: 8, fontFamily: F,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(255,107,0,0.18)',
                border: '1px solid rgba(255,107,0,0.5)',
                color: N, fontWeight: 800, fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
