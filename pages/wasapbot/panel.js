// pages/wasapbot/panel.js
// Panel de conversaciones WhatsApp — versión standalone para clientes WasapBot

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const WA      = '#25D366';
const WA_GLOW = 'rgba(37,211,102,0.15)';
const WA_BOR  = 'rgba(37,211,102,0.32)';
const DARK    = '#080B0F';
const CARD    = '#111318';
const CARD2   = '#1A1E26';
const NARANJA = '#FF6B00';

function tiempoRelativo(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'short' });
}

function iniciales(str) {
  if (!str) return '?';
  return str.replace(/[^0-9a-zA-Z]/g,'').substring(0,2).toUpperCase();
}

function WaIcon({ size = 20, color = WA }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WasapBotPanel() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  const [conversaciones, setConversaciones] = useState([]);
  const [seleccionada, setSeleccionada]     = useState(null);
  const [mensajes, setMensajes]             = useState([]);
  const [filtro, setFiltro]                 = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/wasapbot'); }, [user, loading]);

  // Conversaciones en tiempo real
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'empresas', user.uid, 'conversaciones_wa'),
      orderBy('actualizado', 'desc'), limit(100)
    );
    return onSnapshot(q, snap =>
      setConversaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  // Mensajes de la conversación seleccionada
  useEffect(() => {
    if (!user || !seleccionada) return;
    setMensajes([]);
    const q = query(
      collection(db, 'empresas', user.uid, 'conversaciones_wa', seleccionada.id, 'mensajes'),
      orderBy('ts', 'asc'), limit(200)
    );
    return onSnapshot(q, snap =>
      setMensajes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [user, seleccionada]);

  const filtradas = conversaciones.filter(c =>
    !filtro ||
    c.numero?.includes(filtro) ||
    c.ultimoMensaje?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', background:DARK, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, border:`3px solid ${WA_GLOW}`, borderTopColor:WA, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <Head>
        <title>Conversaciones WhatsApp — WasapBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Toaster position="top-center" />

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)', background:'rgba(8,11,15,0.96)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {mobileShowChat && (
            <button onClick={() => setMobileShowChat(false)} style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', padding:'4px 8px', fontSize:18 }}>←</button>
          )}
          <Link href="/wasapbot" style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800, color:'#FAFAF8', textDecoration:'none' }}>
            BQinz<span style={{ color:NARANJA }}>agenc</span>IA
          </Link>
          <span style={{ background:WA_GLOW, color:WA, border:`1px solid ${WA_BOR}`, borderRadius:100, padding:'3px 10px', fontSize:10, fontWeight:700 }}>WasapBot</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/wasapbot/configurar" style={{ background:CARD2, color:'#9CA3AF', border:'1px solid rgba(255,255,255,0.08)', borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>
            ⚙️ Configurar
          </Link>
          <Link href="/dashboard" style={{ background:NARANJA, color:'#fff', borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
            Panel →
          </Link>
        </div>
      </nav>

      {/* LAYOUT */}
      <div style={{ height:'calc(100vh - 49px)', display:'flex', background:DARK, overflow:'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ width:320, borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', flexShrink:0,
          ...(mobileShowChat ? { display:'none' } : {}),
          '@media(max-width:768px)': { width:'100%' }
        }}>
          <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14 }}>Conversaciones</span>
              <span style={{ background:WA_GLOW, color:WA, borderRadius:100, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{filtradas.length}</span>
            </div>
            <input value={filtro} onChange={e => setFiltro(e.target.value)}
              placeholder="🔍 Buscar número..."
              style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:100, color:'#FAFAF8', padding:'8px 14px', fontSize:12, outline:'none', boxSizing:'border-box' }} />
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            {filtradas.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:WA_GLOW, border:`1px solid ${WA_BOR}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <WaIcon size={24} />
                </div>
                <p style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Sin conversaciones aún</p>
                <p style={{ color:'#4B5563', fontSize:12, lineHeight:1.6 }}>Cuando alguien escriba a tu WhatsApp aparecerán aquí en tiempo real.</p>
              </div>
            ) : filtradas.map(c => (
              <div key={c.id} onClick={() => { setSeleccionada(c); setMobileShowChat(true); }}
                style={{ padding:'12px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer',
                  background: seleccionada?.id === c.id ? 'rgba(37,211,102,0.06)' : 'transparent',
                  borderLeft: seleccionada?.id === c.id ? `3px solid ${WA}` : '3px solid transparent', transition:'all 0.15s' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background: seleccionada?.id === c.id ? WA_GLOW : CARD2, border:`1px solid ${seleccionada?.id === c.id ? WA_BOR : 'rgba(255,255,255,0.06)'}`, color:WA, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                    <WaIcon size={16} />
                  </div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                      <span style={{ fontWeight:600, fontSize:12 }}>{c.numero || 'Desconocido'}</span>
                      <span style={{ fontSize:10, color:'#4B5563' }}>{tiempoRelativo(c.actualizado)}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.ultimoMensaje || '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div style={{ flex:1, display:'flex', flexDirection:'column',
          ...(!mobileShowChat && window?.innerWidth < 768 ? { display:'none' } : {})
        }}>
          {seleccionada ? (
            <>
              {/* Header */}
              <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:12, background:CARD, flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:WA_GLOW, border:`1px solid ${WA_BOR}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <WaIcon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{seleccionada.numero}</div>
                  <div style={{ fontSize:11, color:WA, display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:5, height:5, background:WA, borderRadius:'50%' }} />
                    WhatsApp · Bot IA activo
                  </div>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  <span style={{ background:WA_GLOW, color:WA, border:`1px solid ${WA_BOR}`, borderRadius:100, padding:'4px 12px', fontSize:10, fontWeight:700 }}>
                    🤖 Respondiendo automáticamente
                  </span>
                </div>
              </div>

              {/* Mensajes */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
                {mensajes.length === 0 ? (
                  <div style={{ textAlign:'center', color:'#4B5563', padding:40, fontSize:13 }}>Cargando mensajes...</div>
                ) : mensajes.map((msg, i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {/* Mensaje cliente */}
                    {msg.textoCliente && (
                      <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <div>
                          <div style={{ fontSize:10, color:'#4B5563', marginBottom:3, paddingLeft:4 }}>Cliente</div>
                          <div style={{ maxWidth:'72%', background:CARD2, border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px 16px 16px 4px', padding:'10px 14px', fontSize:13, lineHeight:1.55, color:'#FAFAF8' }}>
                            {msg.textoCliente}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Respuesta bot */}
                    {msg.textoBot && (
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                          <div style={{ fontSize:10, color:WA, marginBottom:3, paddingRight:4, display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:5, height:5, background:WA, borderRadius:'50%' }} /> Bot IA
                          </div>
                          <div style={{ maxWidth:'72%', background:'rgba(37,211,102,0.1)', border:`1px solid ${WA_BOR}`, borderRadius:'16px 16px 4px 16px', padding:'10px 14px', fontSize:13, lineHeight:1.55, color:'#FAFAF8' }}>
                            {msg.textoBot}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Nota informativa */}
              <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(255,255,255,0.06)', background:CARD, fontSize:11, color:'#4B5563', textAlign:'center' }}>
                🤖 El bot responde automáticamente. Para cambiar su comportamiento, <Link href="/wasapbot/configurar" style={{ color:WA, textDecoration:'none' }}>configura el agente</Link>.
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:WA_GLOW, border:`2px solid ${WA_BOR}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <WaIcon size={32} />
              </div>
              <p style={{ fontWeight:700, fontSize:15 }}>Selecciona una conversación</p>
              <p style={{ color:'#4B5563', fontSize:13 }}>Haz clic en un chat de la izquierda para leerlo</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
