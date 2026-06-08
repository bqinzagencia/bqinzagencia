// components/ModalBienvenida.js
// Modal de bienvenida con video — aparece solo la primera vez
import { useState, useEffect, useRef } from 'react';

export default function ModalBienvenida() {
  const [visible, setVisible] = useState(false);
  const [cerrado, setCerrado] = useState(false);
  const [audioActivo, setAudioActivo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Solo mostrar si nunca ha visitado
    const yaVio = localStorage.getItem('agenciame_bienvenida_v1');
    if (!yaVio) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Cuando el video aparece, intentar reproducir con audio
  useEffect(() => {
    if (!visible || !videoRef.current) return;
    const vid = videoRef.current;
    vid.muted = false;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setAudioActivo(true);
        })
        .catch(() => {
          // Navegador bloqueó audio — reproducir silenciado
          vid.muted = true;
          vid.play().catch(() => {});
          setAudioActivo(false);
        });
    }
  }, [visible]);

  const activarAudio = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.play().catch(() => {});
    setAudioActivo(true);
  };

  const silenciar = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = true;
    setAudioActivo(false);
  };

  const cerrar = () => {
    setCerrado(true);
    if (videoRef.current) videoRef.current.pause();
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem('agenciame_bienvenida_v1', '1');
    }, 350);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpVideo {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeOutModal {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .modal-bienvenida-overlay {
          animation: ${cerrado ? 'fadeOutModal 0.4s ease forwards' : 'fadeInModal 0.5s ease forwards'};
        }
        .modal-bienvenida-video {
          animation: ${cerrado ? 'fadeOutModal 0.3s ease forwards' : 'slideUpVideo 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both'};
        }
      `}</style>

      {/* Overlay oscuro */}
      <div
        className="modal-bienvenida-overlay"
        onClick={cerrar}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          padding: '0 0 40px 40px',
        }}
      >
        {/* Contenedor del video — esquina inferior izquierda */}
        <div
          className="modal-bienvenida-video"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: 280,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
            background: '#000',
          }}
        >
          {/* Badge "Bienvenida" */}
          <div style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 10,
            background: 'rgba(184,255,108,0.92)',
            color: '#080808',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 100,
            letterSpacing: 0.5,
            fontFamily: 'Inter, sans-serif',
            backdropFilter: 'blur(4px)',
          }}>
            👋 Bienvenida
          </div>

          {/* Botón cerrar */}
          <button
            onClick={cerrar}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(0,0,0,0.8)'}
            onMouseLeave={e => e.target.style.background = 'rgba(0,0,0,0.5)'}
          >
            ✕
          </button>

          {/* Botón audio */}
          <button
            onClick={audioActivo ? silenciar : activarAudio}
            title={audioActivo ? 'Silenciar' : 'Activar audio'}
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: audioActivo ? 'rgba(184,255,108,0.25)' : 'rgba(0,0,0,0.55)',
              border: audioActivo ? '1px solid rgba(184,255,108,0.6)' : '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
            }}
          >
            {audioActivo ? '🔊' : '🔇'}
          </button>

          {/* VIDEO REAL */}
          <video
            ref={videoRef}
            src="/bienvenida.mp4"
            playsInline
            loop
            controls={false}
            onEnded={() => {
              // Mostrar botón "Empezar" al terminar
            }}
            style={{
              width: '100%',
              display: 'block',
              aspectRatio: '9/16',
              objectFit: 'cover',
            }}
          />

          {/* Barra inferior con CTA */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{
              fontFamily: "'Abril Fatface', serif",
              fontSize: 15,
              color: '#fff',
              lineHeight: 1.2,
            }}>
              agenc<span style={{ color: '#FF6B00' }}>IA</span>me
            </div>
            <a
              href="/auth/register"
              onClick={cerrar}
              style={{
                background: '#B8FF6C',
                color: '#080808',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                fontFamily: 'Inter, sans-serif',
                display: 'block',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = '#CCFF80'}
              onMouseLeave={e => e.target.style.background = '#B8FF6C'}
            >
              Comenzar gratis →
            </a>
            <button
              onClick={cerrar}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: 'none',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                padding: '4px',
              }}
            >
              Saltar bienvenida
            </button>
          </div>
        </div>

        {/* Texto de contexto al lado — desktop */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            marginLeft: 20,
            marginBottom: 20,
            maxWidth: 280,
            animation: cerrado ? 'none' : 'slideUpVideo 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both',
            opacity: 0,
          }}
        >
          <div style={{
            fontFamily: "'Abril Fatface', serif",
            fontSize: 22,
            color: '#fff',
            marginBottom: 12,
            lineHeight: 1.2,
          }}>
            Tu negocio<br />en piloto<br /><span style={{ color: '#B8FF6C' }}>automático.</span>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65,
            marginBottom: 16,
          }}>
            Agentes IA que atienden, agendan y venden por ti — 24/7, desde cualquier dispositivo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Chat IA para tus clientes', 'Agendamiento automático', 'CRM inteligente', 'Tu página web incluida'].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Inter, sans-serif',
              }}>
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(184,255,108,0.15)',
                  border: '1px solid rgba(184,255,108,0.3)',
                  color: '#B8FF6C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
