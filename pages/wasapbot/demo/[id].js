// pages/wasapbot/demo/[id].js
// Simulador público compartible — sin login, sin sidebar, sin datos sensibles.
// Link directo para compartir con un prospecto: bqinzagencia.com/wasapbot/demo/EMPRESA_ID
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'bqinzagencia2026.';

export default function DemoPublico() {
  const router  = useRouter();
  const { id }  = router.query;

  const [empresa,  setEmpresa]  = useState(null);
  const [error,    setError]    = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [input,    setInput]    = useState('');
  const [cargando, setCargando] = useState(false);
  const sessionId = useRef(`demo_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/wasapbot-demo-publico?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.ok) { setError('No se encontró este negocio.'); return; }
        setEmpresa(d);
        setMensajes([{
          rol: 'bot',
          texto: `¡Hola! 👋 Soy el asistente virtual de *${d.nombre}*. ¿En qué puedo ayudarte hoy?`,
        }]);
      })
      .catch(() => setError('Error de conexión.'));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async (texto) => {
    const msg = (texto || input).trim();
    if (!msg || cargando || !empresa) return;
    setInput('');
    setMensajes(prev => [...prev, { rol: 'cliente', texto: msg }]);
    setCargando(true);
    try {
      const r = await fetch('/api/whatsapp-baileys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-server-secret': SECRET },
        body: JSON.stringify({ empresaId: id, numeroCliente: sessionId.current, texto: msg }),
      });
      const d = await r.json();
      setMensajes(prev => [...prev, { rol: 'bot', texto: d.respuesta || 'Sin respuesta.' }]);
    } catch {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error de conexión. Intenta de nuevo.' }]);
    }
    setCargando(false);
  };

  const PREGUNTAS = ['Hola', 'Qué servicios ofrecen', 'Cuánto cuestan', 'Quiero una cita', 'Cuáles son los horarios'];
  const fmt = t => t?.replace(/\*([^*]+)\*/g, '$1') || '';

  return (
    <>
      <Head>
        <title>{empresa?.nombre ? `Demo — ${empresa.nombre}` : 'Simulador WasapBot'}</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#EEF1FA;font-family:${F};min-height:100vh}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        .msg{animation:up .2s ease both}
      ` }} />

      {/* NAV */}
      <nav style={{ background:'rgba(6,9,13,.97)', padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/wasapbot">
          <span style={{ fontFamily:FA, fontSize:17, color:'#fff', cursor:'pointer', letterSpacing:'-.5px' }}>
            BQinz<span style={{color:'#FF6B00'}}>agenc</span>IA
          </span>
        </Link>
        <span style={{ fontFamily:F, fontSize:11, color:'rgba(255,255,255,0.5)', background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:99, padding:'3px 10px' }}>
          🤖 Demo en vivo
        </span>
      </nav>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'32px 16px 80px' }}>

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'20px', fontFamily:F, fontSize:14, color:'#DC2626', textAlign:'center' }}>{error}</div>
        )}

        {!empresa && !error && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ width:36, height:36, border:'3px solid rgba(37,211,102,0.15)', borderTop:'3px solid #25D366', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
            <div style={{ fontFamily:F, fontSize:13, color:'#94A3B8' }}>Cargando simulador...</div>
          </div>
        )}

        {empresa && (
          <>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontFamily:FA, fontSize:28, letterSpacing:'-1px', color:'#0F172A', marginBottom:6 }}>{empresa.nombre}</div>
              <p style={{ fontFamily:F, fontSize:13, color:'#64748B', lineHeight:1.6 }}>
                Prueba cómo respondería el asistente de IA a tus clientes.<br/>
                <strong style={{color:'#0F172A'}}>Los mensajes NO llegan a clientes reales.</strong>
              </p>
            </div>

            {/* Chat estilo WhatsApp */}
            <div style={{ background:'#111B21', borderRadius:20, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {/* Header */}
              <div style={{ background:'#202C33', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(37,211,102,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
                <div>
                  <div style={{ fontFamily:F, fontSize:14, fontWeight:700, color:'#EFF4FF' }}>{empresa.nombre}</div>
                  <div style={{ fontFamily:F, fontSize:11, color:'#25D366' }}>● En línea</div>
                </div>
              </div>

              {/* Mensajes */}
              <div style={{ height:380, overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:8, background:'#0B141A' }}>
                {mensajes.map((m,i) => (
                  <div key={i} className="msg" style={{ display:'flex', justifyContent:m.rol==='cliente'?'flex-end':'flex-start' }}>
                    <div style={{
                      maxWidth:'78%', background:m.rol==='cliente'?'#005C4B':'#202C33',
                      borderRadius:m.rol==='cliente'?'12px 12px 2px 12px':'12px 12px 12px 2px',
                      padding:'9px 13px', fontFamily:F, fontSize:13, color:'#EFF4FF', lineHeight:1.55,
                      whiteSpace:'pre-wrap', wordBreak:'break-word',
                    }}>
                      {fmt(m.texto)}
                    </div>
                  </div>
                ))}
                {cargando && (
                  <div style={{ display:'flex', justifyContent:'flex-start' }}>
                    <div style={{ background:'#202C33', borderRadius:'12px 12px 12px 2px', padding:'10px 14px', display:'flex', gap:4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#4B6080', animation:`bounce 1.2s ${i*0.2}s infinite` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {/* Sugerencias */}
              <div style={{ padding:'8px 12px', display:'flex', gap:6, flexWrap:'wrap', background:'#111B21', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                {PREGUNTAS.map(p => (
                  <button key={p} onClick={() => enviar(p)}
                    style={{ background:'rgba(37,211,102,0.08)', color:'#25D366', border:'1px solid rgba(37,211,102,0.2)', borderRadius:99, padding:'4px 12px', fontFamily:F, fontSize:11, cursor:'pointer', whiteSpace:'nowrap' }}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding:'10px 12px', background:'#202C33', display:'flex', gap:8, alignItems:'center' }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && enviar()}
                  placeholder="Escribe un mensaje..."
                  style={{ flex:1, background:'#2A3942', border:'none', borderRadius:99, padding:'10px 16px', fontFamily:F, fontSize:13, color:'#EFF4FF', outline:'none' }}
                />
                <button onClick={() => enviar()} disabled={cargando || !input.trim()}
                  style={{ background:'#25D366', border:'none', borderRadius:'50%', width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, opacity:cargando||!input.trim()?0.5:1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ marginTop:28, background:'#fff', borderRadius:18, padding:'24px', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #E8EDF5' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>🚀</div>
              <div style={{ fontFamily:FA, fontSize:22, letterSpacing:'-0.5px', color:'#0F172A', marginBottom:8 }}>¿Te imaginas esto en tu negocio?</div>
              <p style={{ fontFamily:F, fontSize:13, color:'#64748B', marginBottom:20, lineHeight:1.7 }}>
                Activa tu propio bot en menos de 2 minutos.<br/>
                <strong style={{color:'#0F172A'}}>24 horas gratis · Sin tarjeta · Sin contratos</strong>
              </p>
              <Link href="/wasapbot/activar">
                <span style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#25D366,#1aad4e)', color:'#fff', borderRadius:12, padding:'14px 28px', fontFamily:F, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(37,211,102,0.3)' }}>
                  Activar mi WhatsApp gratis →
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
