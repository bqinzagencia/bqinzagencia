// pages/sitio/[slug].js
// Pagina web publica de cada empresa — NEXOIA

import Head from 'next/head';
import { useState } from 'react';
import * as admin from 'firebase-admin';

function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      }),
    });
  }
  return admin.firestore();
}

export async function getServerSideProps({ params }) {
  const { slug } = params;
  try {
    const db = getAdminDb();
    const snap = await db.collection('empresas').get();
    let empresaData = null;

    snap.forEach(doc => {
      const d = doc.data();
      const nombreSlug = (d.nombreEmpresa || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (nombreSlug === slug || d.slug === slug) {
        empresaData = { id: doc.id, ...d };
      }
    });

    if (!empresaData) return { notFound: true };

    // Cargar conocimiento
    let conocimiento = null;
    try {
      const cSnap = await db.collection('empresas').doc(empresaData.id).collection('config').doc('conocimiento').get();
      if (cSnap.exists) conocimiento = cSnap.data();
    } catch(e) {}

    // Limpiar timestamps de Firestore
    const limpiar = (obj) => {
      if (!obj) return obj;
      const clean = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && val._seconds !== undefined) {
          clean[key] = new Date(val._seconds * 1000).toISOString();
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          clean[key] = limpiar(val);
        } else {
          clean[key] = val;
        }
      }
      return clean;
    };

    return {
      props: {
        empresa: limpiar(empresaData),
        conocimiento: conocimiento ? limpiar(conocimiento) : null,
      }
    };
  } catch (e) {
    console.error('[Sitio] Error:', e.message);
    return { notFound: true };
  }
}

const INDUSTRIA_CONFIG = {
  peluqueria: { color: '#EC4899', bg: '#1a0a12', emoji: '✂️' },
  taller: { color: '#F59E0B', bg: '#1a1200', emoji: '🔧' },
  restaurante: { color: '#EF4444', bg: '#1a0800', emoji: '🍽️' },
  inmobiliaria: { color: '#3B82F6', bg: '#080f1a', emoji: '🏠' },
  tienda: { color: '#10B981', bg: '#081a12', emoji: '🛒' },
  gimnasio: { color: '#8B5CF6', bg: '#0e081a', emoji: '💪' },
  salud: { color: '#06B6D4', bg: '#081419', emoji: '🏥' },
  default: { color: '#00E5A0', bg: '#080b0f', emoji: '🏢' },
};

export default function SitioEmpresa({ empresa, conocimiento }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const industria = empresa.industria?.toLowerCase() || 'default';
  const config = INDUSTRIA_CONFIG[industria] || INDUSTRIA_CONFIG.default;
  const servicios = conocimiento?.servicios?.filter(s => s.nombre) || [];
  const horarios = conocimiento?.horarios || {};
  const info = conocimiento?.info || {};
  const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const diasActivos = DIAS.filter(d => horarios[d]?.activo);

  const whatsappNum = (info.whatsapp || info.telefono || empresa.telefono || '').replace(/\D/g, '');
  const whatsappUrl = whatsappNum ? 'https://wa.me/57' + whatsappNum : null;

  const sendChat = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);
    try {
      const res = await fetch('/api/chat-publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          empresaNombre: empresa.nombreEmpresa,
          industria: empresa.industria,
          conocimiento: conocimiento?.promptGenerado || '',
        }),
      });
      const data = await res.json();
      if (data.reply) setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Lo siento, intenta de nuevo.' }]);
    } finally { setThinking(false); }
  };

  return (
    <>
      <Head>
        <title>{empresa.nombreEmpresa}</title>
        <meta name="description" content={info.descripcionNegocio || empresa.nombreEmpresa + ' en Colombia'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ fontFamily: "'Inter', sans-serif", background: config.bg, color: '#fff', minHeight: '100vh' }}>

        {/* HERO */}
        <div style={{ background: 'linear-gradient(135deg,' + config.bg + ' 0%,' + config.color + '22 100%)', borderBottom: '1px solid ' + config.color + '33', padding: '80px 24px 60px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{config.emoji}</div>
          <h1 style={{ fontWeight: 800, fontSize: 48, margin: '0 0 16px', letterSpacing: -1 }}>{empresa.nombreEmpresa}</h1>
          {info.descripcionNegocio && (
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>{info.descripcionNegocio}</p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setChatOpen(true)}
              style={{ background: config.color, color: '#000', border: 'none', borderRadius: 100, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              💬 Chatear ahora
            </button>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener"
                style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                📱 WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* SERVICIOS */}
        {servicios.length > 0 && (
          <div style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontWeight: 800, fontSize: 32, marginBottom: 32, textAlign: 'center' }}>Nuestros servicios</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
              {servicios.map((sv, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: config.color }}>{sv.nombre}</h3>
                  {sv.descripcion && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12, lineHeight: 1.5 }}>{sv.descripcion}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {sv.precio && <span style={{ fontWeight: 800, fontSize: 20 }}>${parseInt(sv.precio).toLocaleString('es-CO')}</span>}
                    {sv.duracion && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 100 }}>{sv.duracion} min</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HORARIOS + CONTACTO */}
        <div style={{ padding: '40px 24px 60px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: diasActivos.length > 0 ? '1fr 1fr' : '1fr', gap: 40 }}>
            {diasActivos.length > 0 && (
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>🕐 Horarios</h2>
                {diasActivos.map(dia => (
                  <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{dia}</span>
                    <span style={{ fontWeight: 600, color: config.color }}>{horarios[dia].desde} – {horarios[dia].hasta}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>📍 Contacto</h2>
              {(info.direccion) && <div style={{ marginBottom: 16 }}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Dirección</div><div style={{ fontWeight: 600, marginTop: 4 }}>{info.direccion}{info.ciudad ? ', ' + info.ciudad : ''}</div></div>}
              {(info.telefono || empresa.telefono) && <div style={{ marginBottom: 16 }}><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Teléfono</div><div style={{ fontWeight: 600, marginTop: 4 }}>{info.telefono || empresa.telefono}</div></div>}
              {info.formasPago?.length > 0 && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Formas de pago</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {info.formasPago.map(p => <span key={p} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 12px', fontSize: 12 }}>{p}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', padding: 24, borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Powered by <a href="https://nexoia-eight.vercel.app" style={{ color: config.color, textDecoration: 'none', fontWeight: 600 }}>NEXOIA</a>
        </div>

        {/* CHAT WIDGET */}
        {chatOpen && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, width: 340, height: 480, background: '#13161a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: config.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{config.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{empresa.nombreEmpresa}</div>
                <div style={{ fontSize: 11, color: config.color }}>● En línea</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: 14, maxWidth: '85%' }}>
                  Hola! Soy el asistente de {empresa.nombreEmpresa}. ¿En qué te puedo ayudar?
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', background: msg.role === 'user' ? config.color : 'rgba(255,255,255,0.06)', color: msg.role === 'user' ? '#000' : '#fff', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', fontSize: 14 }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {thinking && <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: '85%' }}>Escribiendo...</div>}
            </div>
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Escribe un mensaje..." style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none' }} />
              <button onClick={sendChat} disabled={!input.trim() || thinking}
                style={{ width: 38, height: 38, borderRadius: 9, background: input.trim() && !thinking ? config.color : 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', fontSize: 15 }}>➤</button>
            </div>
          </div>
        )}

        {!chatOpen && (
          <button onClick={() => setChatOpen(true)}
            style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: config.color, border: 'none', cursor: 'pointer', fontSize: 22, boxShadow: '0 8px 24px ' + config.color + '66', zIndex: 1000 }}>
            💬
          </button>
        )}
      </div>
    </>
  );
}
