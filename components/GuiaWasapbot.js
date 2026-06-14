// components/GuiaWasapbot.js
// Banner de ayuda contextual para los paneles de WasapBot (inventario, pedidos, stock)
// Uso: <GuiaWasapbot visible={condicion} icono="🍽️" texto="Texto explicativo..." />

import { useState } from 'react';

const F = "'Inter', system-ui, sans-serif";

export default function GuiaWasapbot({ visible = true, icono = '💡', texto = '', onClose }) {
  const [cerrado, setCerrado] = useState(false);

  if (!visible || cerrado || !texto) return null;

  const cerrar = () => {
    setCerrado(true);
    onClose?.();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes guiaWasapbotIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .guia-wasapbot {
          animation: guiaWasapbotIn 0.25s ease both;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 40px 14px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          background: rgba(96,165,250,0.06);
          border: 1px solid rgba(96,165,250,0.2);
        }
        .guia-wasapbot .gw-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(96,165,250,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .guia-wasapbot .gw-text {
          font-family: ${F};
          font-size: 12.5px;
          line-height: 1.6;
          color: rgba(186,212,255,0.85);
          padding-top: 2px;
        }
        .guia-wasapbot .gw-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(96,165,250,0.4);
          font-size: 14px;
          padding: 2px;
          line-height: 1;
          transition: color 0.15s;
        }
        .guia-wasapbot .gw-close:hover {
          color: rgba(96,165,250,0.85);
        }
      `}} />
      <div className="guia-wasapbot">
        <div className="gw-icon">{icono}</div>
        <div className="gw-text">{texto}</div>
        <button className="gw-close" onClick={cerrar} title="Cerrar" aria-label="Cerrar">✕</button>
      </div>
    </>
  );
}
