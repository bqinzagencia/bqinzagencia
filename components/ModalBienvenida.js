// components/ModalBienvenida.js
import { useState, useEffect, useRef } from 'react';

const N  = '#FF6B00';
const NB = 'rgba(255,107,0,0.95)';

// Stats que rotan para dar vida al panel derecho
const STATS = [
  { valor: '+340%', label: 'más leads capturados' },
  { valor: '24/7',  label: 'atención sin descanso' },
  { valor: '3 min', label: 'para configurar tu IA' },
  { valor: '0 COP', label: 'para empezar hoy' },
];

const TESTIMONIOS = [
  { texto: '"Antes perdía clientes a medianoche. Ahora mi IA los atiende y agenda sola."', autor: 'María L.', tipo: 'Peluquería' },
  { texto: '"En la primera semana el bot me trajo 12 clientes nuevos al taller."',          autor: 'Carlos R.', tipo: 'Taller mecánica' },
  { texto: '"Mis reservas aumentaron 60% sin contratar más personal."',                     autor: 'Juliana M.', tipo: 'Restaurante' },
];

export default function ModalBienvenida() {
  const [visible,     setVisible]     = useState(false);
  const [cerrado,     setCerrado]     = useState(false);
  const [iniciado,    setIniciado]    = useState(false);
  const [audioActivo, setAudioActivo] = useState(false);
  const [statIdx,     setStatIdx]     = useState(0);
  const [testiIdx,    setTestiIdx]    = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Detectar si el navegador revierte el mute automaticamente
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onVolumeChange = () => {
      setAudioActivo(!vid.muted && vid.volume > 0);
    };
    vid.addEventListener('volumechange', onVolumeChange);
    return () => vid.removeEventListener('volumechange', onVolumeChange);
  }, []);

  // Rotar stats cada 2s
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setStatIdx(i => (i + 1) % STATS.length), 2000);
    return () => clearInterval(t);
  }, [visible]);

  // Rotar testimonios cada 4s
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTestiIdx(i => (i + 1) % TESTIMONIOS.length), 4000);
    return () => clearInterval(t);
  }, [visible]);

  const iniciarConAudio = () => {
    const vid = videoRef.current;
    if (!vid) return;
    // Primero quitar mute, luego play — orden crítico para el navegador
    vid.muted = false;
    vid.volume = 1;
    const p = vid.play();
    if (p !== undefined) {
      p.then(() => {
        // Si el navegador revirtió el mute, detectarlo
        if (vid.muted) {
          setAudioActivo(false);
        } else {
          setAudioActivo(true);
        }
      }).catch(() => {
        // Fallback: reproducir con mute y mostrar icono apagado
        vid.muted = true;
        vid.play().catch(() => {});
        setAudioActivo(false);
      });
    }
    setIniciado(true);
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
  const F  = "'Inter', system-ui, sans-serif";
  const FA = "'Abril Fatface', serif";
  const st = STATS[statIdx];
  const te = TESTIMONIOS[testiIdx];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fadeInModal  { from{opacity:0}              to{opacity:1} }
        @keyframes fadeOutModal { from{opacity:1}              to{opacity:0} }
        @keyframes slideUpCard  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpFast  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow    { 0%,100%{box-shadow:0 0 24px rgba(255,107,0,0.4)} 50%{box-shadow:0 0 48px rgba(255,107,0,0.7)} }
        @keyframes countUp      { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        .bv-overlay-in  { animation: fadeInModal  0.4s ease forwards; }
        .bv-overlay-out { animation: fadeOutModal 0.35s ease forwards; }
        .bv-card-in     { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .bv-card-out    { animation: fadeOutModal 0.3s ease forwards; }
        .bv-texto-in    { animation: slideUpCard  0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .bv-panel-in    { animation: slideUpCard  0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .bv-stat-val    { animation: countUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .bv-testi       { animation: slideUpFast 0.5s cubic-bezier(0.16,1,0.3,1) both; }
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
        .bv-mini-card { transition: transform 0.2s, border-color 0.2s; }
        .bv-mini-card:hover { transform: translateY(-3px); border-color: rgba(255,107,0,0.4) !important; }
      `}} />

      {/* ── Overlay ── */}
      <div
        className={cerrado ? 'bv-overlay-out' : 'bv-overlay-in'}
        onClick={cerrar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '20px',
        }}
      >

        {/* ── Tarjeta video ── */}
        <div
          className={cerrado ? 'bv-card-out' : 'bv-card-in'}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative', width: 260, flexShrink: 0,
            borderRadius: 22, overflow: 'hidden',
            boxShadow: `0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(255,107,0,0.18)`,
            background: '#000',
          }}
        >
          {/* Badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 10,
            background: NB, color: '#fff',
            fontSize: 10, fontWeight: 800, padding: '5px 12px',
            borderRadius: 100, letterSpacing: '0.08em',
            fontFamily: F, textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(255,107,0,0.5)',
          }}>👋 Bienvenida</div>

          {/* Cerrar */}
          <button className="bv-cerrar" onClick={cerrar} style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', fontFamily: F,
          }}>✕</button>

          {/* Botón audio */}
          {iniciado && (
            <button onClick={toggleAudio} style={{
              position: 'absolute', bottom: 72, right: 10, zIndex: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: audioActivo ? 'rgba(255,107,0,0.35)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${audioActivo ? 'rgba(255,107,0,0.7)' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>{audioActivo ? '🔊' : '🔇'}</button>
          )}

          {/* Video */}
          <video ref={videoRef} src="/bienvenida.mp4"
            playsInline muted loop
            style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover' }}
          />

          {/* Overlay play */}
          {!iniciado && (
            <div onClick={iniciarConAudio} style={{
              position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.42)', cursor: 'pointer', gap: 10,
            }}>
              <div className="bv-play-btn" style={{
                width: 68, height: 68, borderRadius: '50%', background: NB,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: '#fff',
                transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 36px rgba(255,107,0,0.55)',
              }}>▶</div>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: F, letterSpacing: '0.03em' }}>
                Ver con sonido
              </span>
            </div>
          )}

          {/* CTA */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '48px 12px 14px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.94), transparent)',
            display: 'flex', flexDirection: 'column', gap: 6,
            zIndex: iniciado ? 10 : 5,
          }}>
            <a href="/auth/register" onClick={cerrar} className="bv-cta" style={{
              background: N, color: '#fff', borderRadius: 100,
              padding: '11px 14px', fontSize: 13, fontWeight: 800,
              textAlign: 'center', textDecoration: 'none', display: 'block',
              fontFamily: F, letterSpacing: '0.02em',
              boxShadow: '0 6px 24px rgba(255,107,0,0.45)', transition: 'all 0.2s',
            }}>Comenzar gratis →</a>
            <button onClick={cerrar} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              border: 'none', fontSize: 11, cursor: 'pointer', padding: '3px',
              fontFamily: F,
            }}>Saltar</button>
          </div>
        </div>

        {/* ── Texto central ── */}
        <div
          className={cerrado ? '' : 'bv-texto-in'}
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: 260, opacity: 0, flexShrink: 0 }}
        >
          <div style={{ fontFamily: FA, fontSize: 28, color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
            Tu negocio<br />en piloto<br />
            <span style={{ color: N, textShadow: '0 0 32px rgba(255,107,0,0.6)' }}>automatico.</span>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 18, fontFamily: F }}>
            Agentes IA que atienden, agendan y venden por ti — 24/7.
          </p>
          {['Chat IA en tu sitio web', 'Agendamiento automatico', 'CRM inteligente', 'Pagina web incluida'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontFamily: F }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.5)', color: N, fontWeight: 800, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
              {item}
            </div>
          ))}
        </div>

        {/* ── Panel derecho — el espacio que estaba vacío ── */}
        <div
          className={cerrado ? '' : 'bv-panel-in'}
          onClick={e => e.stopPropagation()}
          style={{
            width: 300, opacity: 0, flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          {/* Stat rotante grande */}
          <div style={{
            background: 'linear-gradient(135deg, #111827 0%, #1A2236 100%)',
            border: `1px solid rgba(255,107,0,0.25)`,
            borderRadius: 18, padding: '24px 24px 20px',
            textAlign: 'center',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}>
            <div key={statIdx} className="bv-stat-val" style={{
              fontFamily: F, fontSize: 52, fontWeight: 900,
              color: N, letterSpacing: '-0.04em', lineHeight: 1,
              marginBottom: 8, textShadow: '0 0 40px rgba(255,107,0,0.5)',
            }}>{st.valor}</div>
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' }}>
              {st.label}
            </div>
          </div>

          {/* 3 mini-cards de características */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '🤖', titulo: 'IA 24/7',        desc: 'Nunca duerme' },
              { icon: '📅', titulo: 'Auto-agenda',     desc: 'Citas solas' },
              { icon: '💬', titulo: 'Multi-canal',     desc: 'Web + WhatsApp' },
              { icon: '📊', titulo: 'CRM incluido',    desc: 'Leads al instante' },
            ].map((c, i) => (
              <div key={i} className="bv-mini-card" style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '14px 12px',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: '#EFF4FF', marginBottom: 2 }}>{c.titulo}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Testimonio rotante */}
          <div style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <div style={{ color: N, fontSize: 14, marginBottom: 8, letterSpacing: 2 }}>★★★★★</div>
            <p key={testiIdx} className="bv-testi" style={{ fontFamily: F, fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 10 }}>
              {te.texto}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(255,107,0,0.2)`, border: `1px solid rgba(255,107,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontSize: 11, fontWeight: 700, color: N }}>
                {te.autor.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: '#EFF4FF' }}>{te.autor}</div>
                <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{te.tipo}</div>
              </div>
            </div>
          </div>

          {/* CTA panel */}
          <a href="/auth/register" onClick={cerrar} className="bv-cta" style={{
            background: N, color: '#fff', borderRadius: 100,
            padding: '13px 20px', fontSize: 14, fontWeight: 800,
            textAlign: 'center', textDecoration: 'none', display: 'block',
            fontFamily: F, letterSpacing: '0.02em',
            boxShadow: '0 6px 28px rgba(255,107,0,0.4)', transition: 'all 0.2s',
          }}>
            Activar mi agente IA gratis →
          </a>
        </div>

      </div>
    </>
  );
}
