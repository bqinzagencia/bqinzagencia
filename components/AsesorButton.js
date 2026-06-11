// components/AsesorButton.js
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

const F = "'Inter', system-ui, sans-serif";

export default function AsesorButton() {
  const { empresa, user } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [msg,      setMsg]      = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hover,    setHover]    = useState(false);

  if (!empresa) return null;

  const enviar = async () => {
    if (!msg.trim()) { toast.error('Escribe tu mensaje'); return; }
    setEnviando(true);
    try {
      await fetch('/api/soporte-mensaje', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          empresaId:     empresa.id,
          nombreEmpresa: empresa.nombreEmpresa,
          email:         user?.email,
          mensaje:       msg,
          tipo:          'asesor',
        }),
      });
      toast.success('Mensaje enviado. Te contactamos pronto por WhatsApp.');
      setMsg('');
      setOpen(false);
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally { setEnviando(false); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ab-in  { from{opacity:0;transform:scale(0.7) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ab-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,107,0,0.55),0 6px 24px rgba(255,107,0,0.4); }
          60%      { box-shadow:0 0 0 12px rgba(255,107,0,0),0 6px 24px rgba(255,107,0,0.4); }
        }
        @keyframes ab-panel { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

        .ab-fab {
          position:fixed; bottom:100px; right:28px; z-index:9997;
          width:56px; height:56px; border-radius:50%; border:none; cursor:pointer;
          background:linear-gradient(135deg,#FF6B00,#FF9500);
          display:flex; align-items:center; justify-content:center;
          animation: ab-in 0.45s cubic-bezier(0.34,1.56,0.64,1) 1s both,
                     ab-pulse 2.5s ease-in-out 2s infinite;
          transition:transform 0.2s;
        }
        .ab-fab:hover  { transform:scale(1.1) !important; }
        .ab-fab:active { transform:scale(0.94) !important; }

        .ab-dot {
          position:absolute; top:-2px; right:-2px;
          width:16px; height:16px; border-radius:50%;
          background:#10B981; border:2.5px solid #0A0F1E;
        }

        .ab-label {
          position:absolute; right:68px; top:50%;
          transform:translateY(-50%);
          background:#0C0F14; border:1px solid rgba(255,107,0,0.35);
          border-radius:10px; padding:7px 13px;
          white-space:nowrap; pointer-events:none;
          opacity:0; transition:opacity 0.18s;
          box-shadow:0 8px 24px rgba(0,0,0,0.5);
        }
        .ab-label.show { opacity:1; }
        .ab-label::after {
          content:''; position:absolute; right:-6px; top:50%;
          transform:translateY(-50%) rotate(45deg);
          width:10px; height:10px; background:#0C0F14;
          border-right:1px solid rgba(255,107,0,0.35);
          border-top:1px solid rgba(255,107,0,0.35);
        }

        .ab-panel {
          position:fixed; bottom:168px; right:28px; z-index:9997;
          width:310px; background:#0C0F14;
          border:1px solid rgba(255,107,0,0.2); border-radius:20px;
          overflow:hidden;
          box-shadow:0 24px 64px rgba(0,0,0,0.75),0 0 0 1px rgba(255,107,0,0.08);
          animation:ab-panel 0.22s cubic-bezier(0.16,1,0.3,1) both;
        }

        @media(max-width:480px){
          .ab-fab   { bottom:96px; right:20px; width:50px; height:50px; }
          .ab-panel { right:16px; bottom:158px; width:calc(100vw - 32px); }
          .ab-label { display:none; }
        }
      `}} />

      {/* Panel */}
      {open && (
        <div className="ab-panel">
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,rgba(255,107,0,0.15),rgba(255,107,0,0.05))', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,107,0,0.12)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#FF6B00,#FF9500)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(255,107,0,0.4)' }}>
                {/* Icono robot agencIAme */}
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <rect x="7" y="11" width="18" height="13" rx="4" fill="white" opacity="0.95"/>
                  <rect x="11" y="7" width="10" height="6" rx="3" fill="white" opacity="0.75"/>
                  <circle cx="12.5" cy="17.5" r="2" fill="#FF6B00"/>
                  <circle cx="19.5" cy="17.5" r="2" fill="#FF6B00"/>
                  <path d="M12.5 22 Q16 24.5 19.5 22" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <line x1="16" y1="7" x2="16" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="16" cy="4" r="1.5" fill="white" opacity="0.8"/>
                  <line x1="7" y1="17.5" x2="4.5" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="25" y1="17.5" x2="27.5" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:F, fontSize:14, fontWeight:800, color:'#EFF4FF', letterSpacing:'-0.02em' }}>
                  agenc<span style={{ color:'#FF6B00' }}>IA</span>me
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }} />
                  <span style={{ fontFamily:F, fontSize:11, color:'#10B981', fontWeight:600 }}>Asesor disponible ahora</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', color:'#8A9BB5', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>

          {/* Mensaje personalizado */}
          <div style={{ padding:'14px 18px 10px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontFamily:F, fontSize:13, color:'#8A9BB5', lineHeight:1.6, margin:0 }}>
              Hola <strong style={{ color:'#EFF4FF' }}>{empresa.nombreEmpresa}</strong>, estamos aquí para ayudarte con tu plan, configuración o cualquier duda.
            </p>
          </div>

          {/* Formulario de mensaje */}
          <div style={{ padding:'14px 18px' }}>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              rows={3}
              style={{ width:'100%', background:'#111827', border:'1px solid rgba(255,107,0,0.2)', borderRadius:10, padding:'10px 12px', color:'#EFF4FF', fontFamily:F, fontSize:13, resize:'none', outline:'none', boxSizing:'border-box', marginBottom:10, transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,107,0,0.2)'}
            />
            <button onClick={enviar} disabled={enviando}
              style={{ width:'100%', background:'linear-gradient(135deg,#FF6B00,#FF9500)', color:'#fff', border:'none', borderRadius:10, padding:'11px', fontFamily:F, fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 4px 16px rgba(255,107,0,0.35)', transition:'opacity 0.15s', opacity:enviando?0.7:1 }}>
              {enviando ? 'Enviando...' : 'Enviar al asesor →'}
            </button>
          </div>

          {/* Contacto directo */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex' }}>
            <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px', background:'rgba(37,211,102,0.08)', color:'#25D366', fontFamily:F, fontSize:12, fontWeight:700, textDecoration:'none', borderRight:'1px solid rgba(255,255,255,0.05)', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(37,211,102,0.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(37,211,102,0.08)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 1C5.93 1 1 5.93 1 12c0 1.97.518 3.82 1.426 5.427L1 23l5.734-1.498A10.956 10.956 0 0012 23c6.07 0 11-4.93 11-11S18.07 1 12 1z"/>
              </svg>
              WhatsApp
            </a>
            <a href="tel:+573105056616"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px', background:'rgba(255,107,0,0.06)', color:'#FF8C40', fontFamily:F, fontSize:12, fontWeight:700, textDecoration:'none', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,107,0,0.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,107,0,0.06)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.03 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
              Llamar
            </a>
          </div>

          <div style={{ padding:'8px 18px 10px', fontFamily:F, fontSize:10, color:'#374151', textAlign:'center' }}>
            Lun–Vie · 8am–6pm · Cali, Colombia
          </div>
        </div>
      )}

      {/* Botón FAB */}
      <button className="ab-fab"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <div className="ab-dot" />
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <rect x="7" y="11" width="18" height="13" rx="4" fill="white" opacity="0.95"/>
          <rect x="11" y="7" width="10" height="6" rx="3" fill="white" opacity="0.75"/>
          <circle cx="12.5" cy="17.5" r="2" fill="#FF6B00"/>
          <circle cx="19.5" cy="17.5" r="2" fill="#FF6B00"/>
          <path d="M12.5 22 Q16 24.5 19.5 22" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <line x1="16" y1="7" x2="16" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16" cy="4" r="1.5" fill="white" opacity="0.8"/>
          <line x1="7" y1="17.5" x2="4.5" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="25" y1="17.5" x2="27.5" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div className={`ab-label${hover ? ' show' : ''}`}>
          <div style={{ fontFamily:F, fontSize:12, fontWeight:700, color:'#EFF4FF' }}>Contacta un asesor</div>
          <div style={{ fontFamily:F, fontSize:10, color:'#4B6080', marginTop:1 }}>Respuesta inmediata</div>
        </div>
      </button>
    </>
  );
}
