// components/SoporteButton.js
// Boton flotante "Hablar con soporte" — visible en todo el dashboard
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

const F = "'Inter', system-ui, sans-serif";

export default function SoporteButton() {
  const { empresa, user } = useAuth();
  const [open, setOpen]     = useState(false);
  const [msg, setMsg]       = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!empresa) return null;

  const enviar = async () => {
    if (!msg.trim()) { toast.error('Escribe tu mensaje'); return; }
    setEnviando(true);
    try {
      await fetch('/api/soporte-mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId:    empresa.id,
          nombreEmpresa: empresa.nombreEmpresa,
          email:        user?.email,
          mensaje:      msg,
        }),
      });
      toast.success('✅ Mensaje enviado. Te contactamos pronto.');
      setMsg('');
      setOpen(false);
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally { setEnviando(false); }
  };

  return (
    <>
      <style>{`
        @keyframes sp-in { from { opacity:0; transform:scale(0.85) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .sp-btn { position:fixed; bottom:28px; right:28px; z-index:9998; display:flex; align-items:center; gap:10px; background:#2B6AFF; color:#fff; border:none; border-radius:100px; padding:12px 20px; font-family:${F}; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(43,106,255,0.4); transition:all 0.2s; }
        .sp-btn:hover { background:#1A55E8; transform:translateY(-2px); box-shadow:0 8px 28px rgba(43,106,255,0.5); }
        .sp-panel { position:fixed; bottom:80px; right:28px; z-index:9998; width:320px; background:#0C0F14; border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.6); animation:sp-in 0.2s ease; }
      `}</style>

      {open && (
        <div className="sp-panel">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:F, fontWeight:800, fontSize:15, color:'#EFF4FF' }}>💬 Hablar con soporte</div>
              <div style={{ fontFamily:F, fontSize:12, color:'#4B6080', marginTop:2 }}>BQinzagencIA — Soporte técnico</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#4B6080', cursor:'pointer', fontSize:18 }}>✕</button>
          </div>

          <div style={{ fontFamily:F, fontSize:12, color:'#6B7A99', marginBottom:12 }}>
            Empresa: <strong style={{ color:'#EFF4FF' }}>{empresa.nombreEmpresa}</strong>
          </div>

          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Describe tu problema o consulta..."
            rows={4}
            style={{ width:'100%', background:'#111827', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 12px', color:'#EFF4FF', fontFamily:F, fontSize:13, resize:'none', outline:'none', boxSizing:'border-box', marginBottom:12 }}
          />

          <button onClick={enviar} disabled={enviando}
            style={{ width:'100%', background:'#2B6AFF', color:'#fff', border:'none', borderRadius:10, padding:'11px', fontFamily:F, fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {enviando ? 'Enviando...' : 'Enviar mensaje →'}
          </button>

          <p style={{ fontFamily:F, fontSize:11, color:'#374151', textAlign:'center', marginTop:10 }}>
            Responderemos por WhatsApp o email
          </p>
        </div>
      )}

      <button className="sp-btn" onClick={() => setOpen(!open)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Soporte
      </button>
    </>
  );
}
