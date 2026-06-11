// components/AlertaPlan.js
// Alerta bonita azul vivo para restricciones de plan
// Uso: <AlertaPlan mensaje="Limite alcanzado" detalle="Actualiza tu plan" onUpgrade={() => router.push('/dashboard/planes')} />

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AlertaPlan({ mensaje, detalle, tipo = 'limite', onClose }) {
  const router  = useRouter();
  const [salir, setSalir] = useState(false);

  if (salir) return null;

  const cerrar = () => {
    setSalir(true);
    onClose?.();
  };

  const iconos = {
    limite:    '🔒',
    advertencia: '⚡',
    upgrade:   '🚀',
    bloqueado: '🚫',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes alerta-in {
          from { opacity:0; transform:translateY(-10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .alerta-plan {
          animation: alerta-in 0.25s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 14px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(6,182,212,0.08) 100%);
          border: 1px solid rgba(37,99,235,0.35);
          box-shadow: 0 4px 24px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .alerta-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(37,99,235,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .alerta-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px; font-weight: 700;
          color: #93C5FD; margin-bottom: 3px;
        }
        .alerta-detail {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px; color: rgba(147,197,253,0.7); line-height: 1.5;
        }
        .alerta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #2563EB; color: #fff; border: none;
          border-radius: 100px; padding: 7px 16px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer;
          margin-top: 10px; transition: all 0.15s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
        }
        .alerta-btn:hover { background: #1D4ED8; transform: translateY(-1px); }
        .alerta-close {
          position: absolute; top: 10px; right: 10px;
          background: none; border: none; cursor: pointer;
          color: rgba(147,197,253,0.4); font-size: 16px;
          padding: 2px; line-height: 1; transition: color 0.15s;
        }
        .alerta-close:hover { color: rgba(147,197,253,0.8); }
      `}} />
      <div className="alerta-plan">
        <div className="alerta-icon">{iconos[tipo] || '🔒'}</div>
        <div style={{ flex: 1 }}>
          <div className="alerta-title">{mensaje}</div>
          {detalle && <div className="alerta-detail">{detalle}</div>}
          <button className="alerta-btn" onClick={() => router.push('/dashboard/planes')}>
            Ver planes →
          </button>
        </div>
        <button className="alerta-close" onClick={cerrar}>✕</button>
      </div>
    </>
  );
}
