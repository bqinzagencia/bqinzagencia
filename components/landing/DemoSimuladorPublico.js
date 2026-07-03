// components/landing/DemoSimuladorPublico.js
// Simulador 100% ficticio para la landing pública — NO llama a OpenAI ni WhatsApp real.
// Respuestas predefinidas con coincidencia simple de palabras clave.
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const F = "'Plus Jakarta Sans', sans-serif";

const CTA_TEXT = '¡Fácil! 🚀 Regístrate gratis en agenciame — tienes 24 horas sin tarjeta para conectar tu WhatsApp real y que la IA responda con la información de TU negocio. ¿Empezamos?';

const DEMO_DATA = {
  peluqueria: {
    nombre: 'Bella Hair Studio', icono: '💇',
    bienvenida: '¡Hola! Soy el asistente virtual de Bella Hair Studio 💇 ¿En qué puedo ayudarte?',
    rapidas: [
      { q: 'Hola', a: '¡Hola! 👋 Bienvenido a Bella Hair Studio. ¿Quieres ver servicios, precios o reservar una cita?' },
      { q: '¿Qué servicios tienen?', a: 'Estos son nuestros servicios:\n✂️ Corte de cabello — 18€\n🎨 Tinte completo — 45€\n💅 Manicura — 15€\n\n¿Quieres reservar alguno?' },
      { q: '¿Tenéis hueco mañana?', a: 'Sí, tengo disponible mañana a las 10:00 y a las 16:30 ✅ ¿Cuál prefieres?' },
      { q: 'Quiero reservar cita', card: 'cita' },
      { q: '¿Cómo registro mi negocio?', cta: true },
    ],
    card: { titulo: 'Cita confirmada', check: '✅', detalle: 'Corte de cabello + Tinte completo', linea2: '📅 Mañana, 10:00', total: '63€' },
  },
  restaurante: {
    nombre: 'Sabor Casero', icono: '🍽️',
    bienvenida: '¡Hola! Soy el asistente virtual de Sabor Casero 🍽️ ¿En qué puedo ayudarte?',
    rapidas: [
      { q: 'Hola', a: '¡Hola! 👋 Bienvenido a Sabor Casero. ¿Quieres ver el menú, hacer un pedido o reservar mesa?' },
      { q: '¿Qué tenéis en el menú?', a: 'Nuestro menú de hoy:\n🥘 Paella valenciana — 12€\n🥗 Ensalada César — 8€\n🍰 Tarta de queso — 6€\n\n¿Quieres pedir algo?' },
      { q: '¿Hacéis domicilios?', a: 'Sí, hacemos entregas en un radio de 5km. Tiempo estimado: 30-40 minutos 🛵' },
      { q: 'Quiero hacer un pedido', card: 'pedido' },
      { q: '¿Cómo registro mi negocio?', cta: true },
    ],
    card: { titulo: 'Pedido confirmado', check: '✅', detalle: '1x Paella valenciana, 1x Tarta de queso', linea2: '⏱️ Listo en 30-40 min', total: '18€' },
  },
};

function track(evento, extra = {}) {
  try {
    fetch('/api/track-demo-simulador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento, ...extra }),
    }).catch(() => {});
  } catch {}
}

function matchLibre(texto, rapidas) {
  const t = texto.toLowerCase();
  if (/hola|buenas|buenos d/.test(t)) return rapidas[0];
  if (/precio|cuesta|cuanto|vale/.test(t)) return rapidas[1];
  if (/hueco|disponib|cuando|domicili/.test(t)) return rapidas[2];
  if (/reserv|cita|pedido|pedir|comprar/.test(t)) return rapidas[3];
  if (/registr|mi negocio|mi empresa|c[oó]mo uso|c[oó]mo funciona/.test(t)) return rapidas[4];
  return null;
}

export default function DemoSimuladorPublico({ onClose }) {
  const [industria, setIndustria] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { track('apertura'); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes, escribiendo]);

  const data = industria ? DEMO_DATA[industria] : null;

  const elegirIndustria = (id) => {
    setIndustria(id);
    track('industria_seleccionada', { industria: id });
    setMensajes([
      { from: 'sistema', text: '⚠️ Esto es una demo de ejemplo con respuestas preestablecidas. Cuando te registres gratis, hablarás con la IA real entrenada con la información de tu negocio.' },
      { from: 'bot', text: DEMO_DATA[id].bienvenida },
    ]);
  };

  const responderBot = (item) => {
    setEscribiendo(true);
    setTimeout(() => {
      setEscribiendo(false);
      if (item.cta) {
        track('cta_registro_visto', { industria });
        setMensajes(m => [...m, { from: 'bot', text: CTA_TEXT, cta: true }]);
      } else if (item.card) {
        track('cierre_confirmado', { industria, tipo: item.card });
        setMensajes(m => [...m,
          { from: 'bot', card: data.card },
          { from: 'bot', text: '¿Te gustó? Esto fue una muestra 🙂 Regístrate gratis y prueba la IA real respondiendo sobre tu propio negocio 👇', cta: true },
        ]);
      } else {
        setMensajes(m => [...m, { from: 'bot', text: item.a }]);
      }
    }, 700 + Math.random() * 500);
  };

  const enviarRapida = (item) => {
    track('pregunta_rapida', { industria, pregunta: item.q });
    setMensajes(m => [...m, { from: 'user', text: item.q }]);
    responderBot(item);
  };

  const enviarLibre = () => {
    const texto = inputVal.trim();
    if (!texto) return;
    setInputVal('');
    setMensajes(m => [...m, { from: 'user', text: texto }]);
    const match = matchLibre(texto, data.rapidas);
    if (match) {
      responderBot(match);
    } else {
      setEscribiendo(true);
      setTimeout(() => {
        setEscribiendo(false);
        setMensajes(m => [...m, { from: 'bot', text: 'Esto es una simulación de ejemplo 🙂 Prueba una de las preguntas rápidas de abajo, o regístrate gratis para hablar con la IA real sobre tu propio negocio.' }]);
      }, 600);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`
        @keyframes demoPopIn { from { opacity:0; transform:scale(.94) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes demoDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        .demo-box { animation: demoPopIn .3s cubic-bezier(.34,1.56,.64,1) both; }
        .demo-quick:hover { background: rgba(37,211,102,0.14) !important; }
        .demo-quick-cta:hover { background: rgba(255,107,0,0.18) !important; }
      `}</style>

      <div className="demo-box" style={{ width: '100%', maxWidth: 340, background: '#080808', borderRadius: 34, padding: 10, boxShadow: '0 40px 90px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06)', position: 'relative' }}>
        {/* Botón cerrar */}
        <button onClick={onClose} style={{ position: 'absolute', top: -14, right: -14, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', color: '#111', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, boxShadow: '0 4px 14px rgba(0,0,0,.4)' }}>✕</button>

        {/* Notch */}
        <div style={{ width: 90, height: 18, background: '#080808', borderRadius: '0 0 14px 14px', position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 4 }} />

        {/* Pantalla */}
        <div style={{ background: '#ECE5DD', borderRadius: 26, overflow: 'hidden', minHeight: 520, display: 'flex', flexDirection: 'column' }}>

          {/* Badge MODO DEMO — persistente */}
          <div style={{ background: '#111', padding: '6px 14px', textAlign: 'center' }}>
            <span style={{ fontFamily: F, fontSize: 9.5, fontWeight: 700, color: '#FFB020', letterSpacing: .5 }}>⚠️ MODO DEMO · respuestas de ejemplo, no es la IA real</span>
          </div>

          {!industria ? (
            /* ── SELECTOR DE INDUSTRIA ── */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 22px', gap: 14 }}>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
                <div style={{ fontFamily: "'Abril Fatface',serif", fontSize: 22, color: '#111', marginBottom: 4 }}>Prueba el bot</div>
                <div style={{ fontFamily: F, fontSize: 12, color: '#555' }}>Elige un ejemplo para probar</div>
              </div>
              {Object.entries(DEMO_DATA).map(([id, d]) => (
                <button key={id} onClick={() => elegirIndustria(id)} style={{ background: '#fff', border: '1.5px solid rgba(37,211,102,.35)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 26 }}>{d.icono}</span>
                  <span style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: '#111' }}>{d.nombre}</span>
                  <span style={{ marginLeft: 'auto', color: '#25D366', fontSize: 16 }}>→</span>
                </button>
              ))}
              <p style={{ fontFamily: F, fontSize: 10.5, color: '#777', textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
                Estos son 2 ejemplos de los muchos tipos de negocio que agencIA ya sabe atender — al registrarte, configuramos el bot para el tuyo.
              </p>
            </div>
          ) : (
            <>
              {/* Cabecera WhatsApp */}
              <div style={{ background: '#075E54', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{data.icono}</div>
                <div>
                  <div style={{ fontFamily: F, fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{data.nombre}</div>
                  <div style={{ fontFamily: F, fontSize: 9.5, color: 'rgba(255,255,255,.7)' }}>en línea</div>
                </div>
                <button onClick={() => { setIndustria(null); setMensajes([]); }} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', fontSize: 10, fontFamily: F, borderRadius: 8, padding: '4px 9px', cursor: 'pointer' }}>Cambiar</button>
              </div>

              {/* Chat */}
              <div ref={scrollRef} style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 340 }}>
                {mensajes.map((m, i) => {
                  if (m.from === 'sistema') return (
                    <div key={i} style={{ textAlign: 'center', margin: '2px 0 6px' }}>
                      <span style={{ display: 'inline-block', background: 'rgba(255,176,32,.15)', border: '1px solid rgba(255,176,32,.3)', borderRadius: 10, padding: '7px 12px', fontFamily: F, fontSize: 10.5, color: '#8a5c00', lineHeight: 1.5, maxWidth: 260 }}>{m.text}</span>
                    </div>
                  );
                  if (m.card) return (
                    <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '90%', background: '#fff', borderRadius: '0 12px 12px 12px', padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,.15)', border: '1px solid #86EFAC' }}>
                      <div style={{ fontFamily: F, fontSize: 12.5, fontWeight: 800, color: '#16A34A', marginBottom: 6 }}>{m.card.check} {m.card.titulo}</div>
                      <div style={{ fontFamily: F, fontSize: 11.5, color: '#333', marginBottom: 3 }}>{m.card.detalle}</div>
                      <div style={{ fontFamily: F, fontSize: 11, color: '#555', marginBottom: 6 }}>{m.card.linea2}</div>
                      <div style={{ borderTop: '1px dashed #ddd', paddingTop: 6, fontFamily: F, fontSize: 12, fontWeight: 700, color: '#111' }}>Total: {m.card.total}</div>
                    </div>
                  );
                  const esUser = m.from === 'user';
                  return (
                    <div key={i} style={{ alignSelf: esUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <div style={{ background: esUser ? '#DCF8C6' : '#fff', borderRadius: esUser ? '12px 0 12px 12px' : '0 12px 12px 12px', padding: '9px 12px', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>
                        <div style={{ fontFamily: F, fontSize: 12, color: '#111', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{m.text}</div>
                      </div>
                      {m.cta && (
                        <Link href="/wasapbot/activar">
                          <div onClick={() => track('cta_click_registro', { industria })} style={{ marginTop: 6, background: 'linear-gradient(135deg,#25D366,#1aad4e)', color: '#fff', borderRadius: 10, padding: '9px 14px', fontFamily: F, fontSize: 11.5, fontWeight: 700, textAlign: 'center', cursor: 'pointer' }}>
                            Registrarme gratis →
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
                {escribiendo && (
                  <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: '0 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 3 }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#999', animation: `demoDot 1.2s ease infinite`, animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                )}
              </div>

              {/* Preguntas rápidas */}
              <div style={{ padding: '8px 10px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #ddd', background: '#F5F3EF' }}>
                {data.rapidas.map((r, i) => (
                  <button key={i} onClick={() => enviarRapida(r)} className={r.cta ? 'demo-quick-cta' : 'demo-quick'}
                    style={{ background: r.cta ? 'rgba(255,107,0,.1)' : 'rgba(37,211,102,.1)', border: `1px solid ${r.cta ? 'rgba(255,107,0,.35)' : 'rgba(37,211,102,.3)'}`, color: r.cta ? '#B45300' : '#0d7a3f', borderRadius: 99, padding: '6px 11px', fontFamily: F, fontSize: 10.5, fontWeight: 600, cursor: 'pointer' }}>
                    {r.q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ background: '#F0F0F0', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviarLibre()}
                  placeholder="Escribe un mensaje..." style={{ flex: 1, background: '#fff', border: 'none', borderRadius: 20, padding: '8px 14px', fontFamily: F, fontSize: 11.5, outline: 'none' }} />
                <button onClick={enviarLibre} style={{ width: 30, height: 30, borderRadius: '50%', background: '#25D366', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
