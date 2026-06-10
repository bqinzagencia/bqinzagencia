// components/ChatbotWidget.js
import { useState, useRef, useEffect } from 'react';

const NARANJA = '#FF6B00';
const NARANJA_GLOW = 'rgba(255,107,0,0.15)';
const NARANJA_BORDER = 'rgba(255,107,0,0.32)';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy el agente IA de BQinzagencIA. Puedo explicarte cómo automatizamos citas, WhatsApp y llamadas para tu centro de estética o belleza. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Lo siento, hubo un error. Inténtalo de nuevo.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Por favor inténtalo de nuevo.' }]);
    }
    setLoading(false);
  }

  const QUICK = [
    '¿Cuánto cuesta?',
    '¿Cómo funciona?',
    '¿Hay prueba gratis?',
    'Quiero una demo',
  ];

  return (
    <>
      {/* Botón flotante con logo real */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 62, height: 62, borderRadius: '50%', border: 'none',
          background: open ? '#1A1E26' : NARANJA,
          cursor: 'pointer', padding: 0, overflow: 'hidden',
          boxShadow: open ? `0 4px 24px rgba(0,0,0,0.5)` : `0 4px 24px ${NARANJA_GLOW}, 0 0 0 3px rgba(255,107,0,0.18)`,
          transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = open ? 'scale(0.92)' : 'scale(1)'; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <img src="/logo.png" alt="BQinzagencIA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        )}
        {/* Badge de no leídos */}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#EF4444', color: '#fff',
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #080B0F',
          }}>{unread}</span>
        )}
      </button>

      {/* Ventana del chat */}
      <div style={{
        position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
        width: 360, maxWidth: 'calc(100vw - 40px)',
        background: '#111318',
        border: `1px solid ${NARANJA_BORDER}`,
        borderRadius: 20,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: 520,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
        transformOrigin: 'bottom right',
      }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, #1A1008 0%, #1C1410 100%)`,
          borderBottom: `1px solid ${NARANJA_BORDER}`,
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="BQinzagencIA"
              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${NARANJA_BORDER}` }}
            />
            <span style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: '50%',
              background: '#22C55E', border: '2px solid #111318',
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: '#FAFAF8', lineHeight: 1.2 }}>
              <span style={{ color: '#fff' }}>BQinz</span>
              <span style={{ color: NARANJA }}>agenc</span>
              <span style={{ color: '#fff' }}>IA</span>
            </div>
            <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              Agente IA · En línea ahora
            </div>
          </div>
          <a
            href="/auth/register"
            style={{ background: NARANJA, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100, textDecoration: 'none', flexShrink: 0 }}
          >
            Probar gratis
          </a>
        </div>

        {/* Mensajes */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
          background: '#0D1117',
          scrollbarWidth: 'thin', scrollbarColor: `${NARANJA_BORDER} transparent`,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
              {msg.role === 'assistant' && (
                <img src="/logo.png" alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${NARANJA_BORDER}`, marginBottom: 2 }} />
              )}
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? NARANJA : '#1A1E26',
                color: '#FAFAF8',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 13px',
                fontSize: 13, lineHeight: 1.55,
                border: msg.role === 'assistant' ? `1px solid rgba(255,255,255,0.06)` : 'none',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicador de carga */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <img src="/logo.png" alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${NARANJA_BORDER}` }} />
              <div style={{ background: '#1A1E26', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: NARANJA, display: 'inline-block', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && !loading && (
          <div style={{ padding: '8px 12px 0', display: 'flex', flexWrap: 'wrap', gap: 6, background: '#0D1117', borderTop: `1px solid rgba(255,255,255,0.05)` }}>
            {QUICK.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{ background: NARANJA_GLOW, border: `1px solid ${NARANJA_BORDER}`, color: NARANJA, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = NARANJA; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = NARANJA_GLOW; e.currentTarget.style.color = NARANJA; }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 12px', background: '#111318', borderTop: `1px solid rgba(255,255,255,0.07)`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            style={{
              flex: 1, background: '#1A1E26', border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#FAFAF8',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = NARANJA_BORDER; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none',
              background: input.trim() && !loading ? NARANJA : '#1A1E26',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '6px 14px 10px', background: '#111318', textAlign: 'center', fontSize: 10, color: '#3A4150' }}>
          Powered by BQinzagencIA · IA generativa
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
