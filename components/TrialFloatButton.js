// components/TrialFloatButton.js
// Botón flotante azul marino brillante — visible para TODAS las empresas
// Muestra días de trial si aplica, o ícono de planes si ya tiene plan activo
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const F          = "'Inter', system-ui, sans-serif";
const BLUE       = '#1A56FF';
const BLUE_GLOW  = 'rgba(26,86,255,0.45)';
const BLUE_HOVER = '#0B3FE0';
const BLUE_RING  = 'rgba(26,86,255,0.25)';

export default function TrialFloatButton() {
  const { empresa } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pulsar,  setPulsar]  = useState(false);

  // ── Calcular estado del trial ──────────────────────────────────────────────
  const esTrial = empresa?.plan === 'emprendedor';
  let diasRestantes = 0;
  let trialVencido  = false;

  if (esTrial && empresa?.trialHasta) {
    const hasta = empresa.trialHasta?.toDate
      ? empresa.trialHasta.toDate()
      : new Date(empresa.trialHasta);
    const diff    = Math.ceil((hasta - new Date()) / (1000 * 60 * 60 * 24));
    diasRestantes = Math.max(0, diff);
    trialVencido  = diff <= 0;
  }

  // ── Animación de entrada (siempre, para todas las empresas) ────────────────
  useEffect(() => {
    if (!empresa) return;
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, [empresa]);

  // ── Pulso periódico solo cuando está en trial ──────────────────────────────
  useEffect(() => {
    if (!esTrial) return;
    const id = setInterval(() => {
      setPulsar(true);
      setTimeout(() => setPulsar(false), 700);
    }, 8000);
    return () => clearInterval(id);
  }, [esTrial]);

  // No renderizar si no hay empresa cargada
  if (!empresa) return null;

  // ── Colores: rojo si urgente/vencido, azul marino en cualquier otro caso ───
  const esUrgente  = esTrial && (diasRestantes <= 3 || trialVencido);
  const btnColor   = esUrgente ? '#DC2626' : BLUE;
  const glowColor  = esUrgente ? 'rgba(220,38,38,0.4)' : BLUE_GLOW;
  const hoverColor = esUrgente ? '#B91C1C' : BLUE_HOVER;
  const ringColor  = esUrgente ? 'rgba(220,38,38,0.2)' : BLUE_RING;

  // ── Badge encima del botón ─────────────────────────────────────────────────
  const labelBadge = trialVencido
    ? 'VENCIDO'
    : esTrial
    ? (diasRestantes === 1 ? '1 DÍA' : `${diasRestantes} DÍAS`)
    : 'PLANES';

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const tooltipTitle = trialVencido
    ? '⚠️ Prueba vencida'
    : esTrial
    ? `🕐 ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`
    : '🚀 Ver planes y funciones';

  const tooltipSub = trialVencido
    ? 'Activa un plan para continuar'
    : esTrial
    ? 'Ver planes y precios →'
    : 'Mejora o gestiona tu plan →';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tfb-in {
          from { opacity:0; transform:scale(0.4) translateY(24px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes tfb-pulse {
          0%   { box-shadow: 0 0 0 0 ${ringColor}; }
          65%  { box-shadow: 0 0 0 18px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0  rgba(0,0,0,0); }
        }
        @keyframes tfb-badge-pop {
          from { transform:translateX(-50%) scale(0.5); opacity:0; }
          to   { transform:translateX(-50%) scale(1);   opacity:1; }
        }
        @keyframes tfb-wiggle {
          0%,100% { transform:rotate(0deg); }
          20%     { transform:rotate(-9deg); }
          40%     { transform:rotate(9deg); }
          60%     { transform:rotate(-5deg); }
          80%     { transform:rotate(5deg); }
        }
        .tfb-wrap {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .tfb-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          font-family: ${F};
          position: relative;
        }
        .tfb-btn:hover  { transform: scale(1.09); }
        .tfb-btn:active { transform: scale(0.95); }
        .tfb-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) scale(1);
          background: #fff;
          border-radius: 20px;
          padding: 2px 8px;
          white-space: nowrap;
          pointer-events: none;
          animation: tfb-badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.7s both;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .tfb-tooltip {
          position: absolute;
          right: 72px;
          bottom: 10px;
          background: #0C0F14;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          white-space: nowrap;
          pointer-events: none;
          transform: translateX(8px);
          opacity: 0;
          transition: all 0.18s;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .tfb-tooltip.show {
          transform: translateX(0);
          opacity: 1;
        }
        .tfb-tooltip::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 10px; height: 10px;
          background: #0C0F14;
          border-right: 1px solid rgba(255,255,255,0.1);
          border-top:   1px solid rgba(255,255,255,0.1);
        }
      `}} />

      <div className="tfb-wrap">
        <Link
          href="/dashboard/planes"
          className="tfb-btn"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? hoverColor : btnColor,
            boxShadow: pulsar
              ? `0 6px 28px ${glowColor}, 0 2px 10px rgba(0,0,0,0.5)`
              : hovered
              ? `0 8px 32px ${glowColor}, 0 2px 10px rgba(0,0,0,0.4)`
              : `0 4px 22px ${glowColor}, 0 2px 8px rgba(0,0,0,0.35)`,
            animation: !visible
              ? 'none'
              : pulsar
              ? 'tfb-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both, tfb-pulse 0.7s ease-out'
              : 'tfb-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Badge de días / estado */}
          <span className="tfb-badge">
            <span style={{
              fontFamily: F,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 0.5,
              color: esUrgente ? '#DC2626' : BLUE,
              display: 'block',
              lineHeight: 1.1,
            }}>
              {labelBadge}
            </span>
          </span>

          {/* Ícono interior */}
          <svg
            width="26" height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: hovered ? 'tfb-wiggle 0.5s ease-in-out' : 'none',
              flexShrink: 0,
            }}
          >
            {trialVencido
              ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
              : <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>
            }
          </svg>

          {/* Tooltip */}
          <div className={`tfb-tooltip${hovered ? ' show' : ''}`}>
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: '#F9FAFB', marginBottom: 3 }}>
              {tooltipTitle}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: '#6B7280' }}>
              {tooltipSub}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
