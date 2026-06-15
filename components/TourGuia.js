// components/TourGuia.js
// Tour interactivo tipo "spotlight": resalta una seccion del panel a la vez
// con una burbuja que explica que es y que hacer ahi. Se muestra automaticamente
// una sola vez por panel (localStorage) y se puede reabrir con el boton "?" flotante.
//
// Uso:
// <TourGuia
//   storageKey={`wasapbot_tour_inventario_${id}`}
//   activo={!loading && !!empresa}
//   pasos={[
//     { selector:'[data-tour="inv-fecha"]', titulo:'Fecha', texto:'...', icono:'📅' },
//     { selector:'[data-tour="hub-config"]', titulo:'WhatsApp', texto:'...', icono:'📱', accion:()=>setTab('config') },
//   ]}
// />

import { useState, useEffect, useCallback } from 'react';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function TourGuia({ storageKey, pasos = [], activo = true }) {
  const [paso, setPaso]       = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect]       = useState(null);
  const [listo, setListo]     = useState(false); // evita renderizar con `window` en SSR

  // Decide si arrancar automaticamente al montar (solo la primera vez)
  useEffect(() => {
    if (!activo || !storageKey || pasos.length === 0) { setListo(true); return; }
    let visto = false;
    try { visto = localStorage.getItem(storageKey) === '1'; } catch {}
    if (!visto) { setPaso(0); setVisible(true); }
    setListo(true);
  }, [activo, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const actual = pasos[paso];

  const ubicar = useCallback(() => {
    if (!actual) return;
    const el = document.querySelector(actual.selector);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    });
  }, [actual]);

  useEffect(() => {
    if (!visible || !actual) return;
    if (typeof actual.accion === 'function') {
      try { actual.accion(); } catch {}
    }
    const t0 = setTimeout(ubicar, 80);
    const t1 = setTimeout(ubicar, 300);
    const t2 = setTimeout(ubicar, 650);
    const onScroll = () => ubicar();
    const onResize = () => ubicar();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t0); clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [visible, paso, ubicar]); // eslint-disable-line react-hooks/exhaustive-deps

  const cerrar = () => {
    setVisible(false);
    try { localStorage.setItem(storageKey, '1'); } catch {}
  };
  const siguiente = () => { if (paso < pasos.length - 1) setPaso(p => p + 1); else cerrar(); };
  const anterior  = () => setPaso(p => Math.max(0, p - 1));
  const reiniciar = () => { setPaso(0); setRect(null); setVisible(true); };

  if (!listo || pasos.length === 0) return null;

  // Se ubica apilado JUSTO ARRIBA del boton naranja de soporte (AsesorWasapbot,
  // que esta en bottom:28/right:28, 56px, z-index 9997) para que ambos queden
  // visibles y alineados en la misma columna, sin que el chat lo tape.
  const BotonAyuda = (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes tgIn{from{opacity:0;transform:scale(0.7) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .tg-fab{position:fixed;bottom:96px;right:33px;z-index:9990;width:46px;height:46px;border-radius:50%;border:none;cursor:pointer;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-family:${F};font-size:19px;font-weight:800;box-shadow:0 6px 20px rgba(37,211,102,0.4);transition:transform 0.2s;animation:tgIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both}
        .tg-fab:hover{transform:scale(1.1)}
        .tg-label{position:absolute;right:58px;top:50%;transform:translateY(-50%);background:#0C0F14;border:1px solid rgba(37,211,102,0.3);border-radius:10px;padding:7px 13px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.18s;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:${F};font-size:12px;font-weight:700;color:#EFF4FF}
        .tg-fab:hover .tg-label{opacity:1}
        @media(max-width:480px){.tg-fab{bottom:78px;right:20px;width:42px;height:42px;font-size:17px}.tg-label{display:none}}
      `}}/>
      <button className="tg-fab" onClick={reiniciar} title="Ver guía de este panel">
        ?
        <span className="tg-label">Ver guía</span>
      </button>
    </>
  );

  if (!visible || !actual) return BotonAyuda;

  const ANCHO = 320;
  const ALTO_EST = 190; // altura aproximada de la burbuja, para no salirnos de pantalla
  const win = { w: window.innerWidth, h: window.innerHeight };
  const anchoBurbuja = Math.min(ANCHO, win.w - 32);
  let bubbleStyle = { position: 'fixed', zIndex: 9999, width: anchoBurbuja };

  if (rect) {
    const espacioAbajo = win.h - (rect.top + rect.height);
    const arriba = espacioAbajo < ALTO_EST && rect.top > ALTO_EST;
    const left = Math.min(Math.max(rect.left, 16), win.w - anchoBurbuja - 16);
    bubbleStyle.left = left;
    if (arriba) {
      bubbleStyle.bottom = Math.min(Math.max(win.h - rect.top + 14, 16), win.h - ALTO_EST);
    } else {
      bubbleStyle.top = Math.min(Math.max(rect.top + rect.height + 14, 16), win.h - ALTO_EST);
    }
  } else {
    bubbleStyle.left = '50%';
    bubbleStyle.top = '50%';
    bubbleStyle.transform = 'translate(-50%,-50%)';
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tourFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .tour-bubble { animation: tourFadeIn .25s ease both; }
      `}} />

      {/* Overlay con recorte sobre el elemento resaltado */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
        {rect ? (
          <div style={{
            position: 'absolute', top: rect.top - 6, left: rect.left - 6,
            width: rect.width + 12, height: rect.height + 12,
            borderRadius: 10, boxShadow: '0 0 0 9999px rgba(4,6,10,0.74)',
            border: '2px solid #25D366', transition: 'all .25s ease',
          }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,6,10,0.74)' }} />
        )}
      </div>

      {/* Burbuja */}
      <div className="tour-bubble" style={{
        ...bubbleStyle, background: '#0C0F14', border: '1px solid rgba(37,211,102,0.3)',
        borderRadius: 14, padding: 18, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {typeof actual.icono === 'function'
            ? <actual.icono size={18} style={{color:'#25D366'}}/>
            : <span style={{ fontSize: 18 }}>{actual.icono || '💡'}</span>}
          <span style={{ fontFamily: FA, fontSize: 16, color: '#EFF4FF' }}>{actual.titulo}</span>
        </div>
        <div style={{ fontFamily: F, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 14 }}>
          {actual.texto}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: F, fontSize: 11, color: '#4B6080' }}>Paso {paso + 1} de {pasos.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cerrar} style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 11, color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>Saltar</button>
            {paso > 0 && (
              <button onClick={anterior} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>← Atrás</button>
            )}
            <button onClick={siguiente} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: F, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              {paso === pasos.length - 1 ? 'Listo' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
