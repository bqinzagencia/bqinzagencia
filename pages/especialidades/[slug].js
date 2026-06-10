// pages/especialidades/[slug].js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { INDUSTRIAS_DETALLE, SLUGS_VALIDOS } from '../../lib/industriasData';
import { Logo } from '../index';
import { useAuth } from '../../lib/AuthContext';

// ── Icono SVG por keyword ─────────────────────────────────────────────────────
function FuncionIcon({ icon, titulo, color }) {
  const key = ((icon || '') + ' ' + (titulo || '')).toLowerCase();
  const s = { width: 24, height: 24, strokeWidth: 1.8, stroke: color, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (/llamad|tel[eé]f|voz|phone/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.66A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
  if (/whatsapp|mensaje|chat|consulta/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if (/agenda|calendar|cita|reserva|sincron|mantenimient/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (/recordatorio|notificaci|aviso|bell/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if (/cobro|pago|stripe|bizum|tarjeta|se[nñ]al|credit|gesti[oó]n de pago/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
  if (/panel|control|estad|anal|chart|bar|ocup|ingreso|report/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (/filtrado|cualific|busca|search/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (/consentimiento|documento|papel|pdf/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  if (/seguimiento|post|check|historial|crm/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
  if (/urgencia|emergencia/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  if (/fideliz|cumple|regalo|bono|recaptaci/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
  if (/precio|tarifa|presupuesto|cotizaci/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
  if (/rese[nñ]a|valoraci|star|reputaci/.test(key))
    return <svg viewBox="0 0 24 24" {...s} fill={color + '33'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (/instagram|portafolio|foto/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
  if (/cat[aá]logo|men[uú]|carta|lista/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
  if (/domicilio|ruta|mapa/.test(key))
    return <svg viewBox="0 0 24 24" {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  // Default
  return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

// ── Estrellas doradas ─────────────────────────────────────────────────────────
function Stars() {
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: SLUGS_VALIDOS.map(slug => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const industria = INDUSTRIAS_DETALLE[params.slug] || null;
  return { props: { industria } };
}

export default function EspecialidadDetalle({ industria }) {
  const { user } = useAuth();
  const [funcionActiva, setFuncionActiva] = useState(null);

  if (!industria) return null;

  const { color, colorBg, colorBorder } = industria;

  return (
    <>
      <Head>
        <title>{industria.nombre} — BQinzagencIA</title>
        <meta name="description" content={industria.descripcion} />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'16px 60px', display:'flex', alignItems:'center', justifyContent:'space-between', backdropFilter:'blur(20px)', background:'rgba(8,11,15,0.9)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><Logo size={20} /></Link>
        <div style={{ display:'flex', gap:28 }}>
          <Link href="/#servicios" style={{ color:'#9CA3AF', fontSize:14, textDecoration:'none' }}>← Especialidades</Link>
          <Link href="/#precios" style={{ color:'#9CA3AF', fontSize:14, textDecoration:'none' }}>Precios</Link>
        </div>
        {user
          ? <Link href="/dashboard" style={{ background:color, color:'#fff', borderRadius:100, padding:'8px 20px', fontSize:13, fontWeight:700, textDecoration:'none' }}>Mi panel →</Link>
          : <Link href="/auth/register" style={{ background:color, color:'#080B0F', borderRadius:100, padding:'8px 20px', fontSize:13, fontWeight:700, textDecoration:'none' }}>Comenzar gratis</Link>
        }
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'70vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 60px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 70% 70% at 60% 40%, ${colorBg}, transparent)`, pointerEvents:'none' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <Link href="/#servicios" style={{ color:'#6B7280', fontSize:13, textDecoration:'none' }}>← Especialidades</Link>
          <span style={{ color:'#3A4150' }}>/</span>
          <span style={{ color, fontSize:13, fontWeight:600 }}>{industria.nombre}</span>
        </div>
        <div style={{ width:80, height:80, borderRadius:20, overflow:'hidden', marginBottom:20, border:`2px solid ${colorBorder}`, boxShadow:`0 0 32px ${colorBg}` }}>
          {industria.img
            ? <img src={industria.img} alt={industria.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <div style={{ width:'100%', height:'100%', background:colorBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>{industria.emoji}</div>
          }
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:colorBg, border:`1px solid ${colorBorder}`, color, padding:'5px 14px', borderRadius:100, fontSize:13, fontWeight:600, marginBottom:20, alignSelf:'flex-start' }}>
          IA especializada · {industria.nombre}
        </div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(38px,5.5vw,70px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-2px', maxWidth:760, marginBottom:18 }}>
          {industria.tagline.split(' ').slice(0,-2).join(' ')}{' '}
          <span style={{ color }}>{industria.tagline.split(' ').slice(-2).join(' ')}</span>
        </h1>
        <p style={{ fontSize:18, color:'#9CA3AF', maxWidth:560, lineHeight:1.65, marginBottom:40 }}>{industria.descripcion}</p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:52 }}>
          <Link href="/auth/register" style={{ background:color, color:'#080B0F', borderRadius:100, fontWeight:700, fontSize:15, padding:'13px 30px', textDecoration:'none' }}>
            Probar 14 días gratis →
          </Link>
          <a href="#chat-demo" style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', borderRadius:100, fontWeight:600, fontSize:15, padding:'13px 30px', textDecoration:'none' }}>
            Ver demo del chat
          </a>
        </div>
        <div style={{ display:'flex', gap:40, flexWrap:'wrap' }}>
          {industria.heroStats.map((s,i) => (
            <div key={i}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800, color, lineHeight:1 }}>{s.valor}</div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONES — cards clicables con modal */}
      <section style={{ padding:'100px 60px', background:'#111318' }}>
        <p style={{ color, fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Funcionalidades</p>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,4vw,46px)', fontWeight:800, letterSpacing:'-1.5px', marginBottom:10 }}>
          Todo lo que necesitas<br/>para tu {industria.nombre.toLowerCase()}
        </h2>
        <p style={{ color:'#9CA3AF', fontSize:16, marginBottom:52, maxWidth:500 }}>
          Haz clic en cualquier función para ver más detalles.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
          {industria.funciones.map((f, i) => (
            <button key={i} onClick={() => setFuncionActiva(f)}
              style={{
                background: i === 0 ? `linear-gradient(135deg,${color}20,${color}08)` : '#080B0F',
                border:`1.5px solid ${i === 0 ? colorBorder : 'rgba(255,255,255,0.08)'}`,
                borderRadius:18, padding:'26px 24px',
                textAlign:'left', cursor:'pointer', transition:'all 0.22s',
                position:'relative', overflow:'hidden', color:'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = colorBorder;
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 20px 50px ${color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = i === 0 ? colorBorder : 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Glow en primera card */}
              {i === 0 && <div style={{ position:'absolute', top:-30, right:-30, width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle,${color}30,transparent 70%)`, pointerEvents:'none' }}/>}

              {/* Icono con contenedor brillante */}
              <div style={{
                width:54, height:54, borderRadius:15,
                background:`linear-gradient(135deg,${color}30,${color}10)`,
                border:`1.5px solid ${color}55`,
                display:'flex', alignItems:'center', justifyContent:'center',
                marginBottom:18, boxShadow:`0 4px 20px ${color}25`,
              }}>
                <FuncionIcon icon={f.icon} titulo={f.titulo} color={color}/>
              </div>

              <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:color+'90', textTransform:'uppercase', marginBottom:8 }}>
                0{i+1} — función
              </div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:10, color:'#FAFAF8', lineHeight:1.3 }}>{f.titulo}</div>
              <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.65, marginBottom:16 }}>{f.desc}</div>

              {/* CTA dentro de la card */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, color, fontSize:12, fontWeight:700 }}>
                Ver más detalles
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>

              {/* Línea de acento inferior */}
              <div style={{ position:'absolute', bottom:0, left:0, width:'40%', height:2, background:`linear-gradient(90deg,${color},transparent)` }}/>
            </button>
          ))}
        </div>
      </section>

      {/* MODAL de función */}
      {funcionActiva && (
        <div
          onClick={() => setFuncionActiva(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:'#111318', border:`1px solid ${colorBorder}`, borderRadius:24, padding:'36px 32px', maxWidth:540, width:'100%', position:'relative', boxShadow:`0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${colorBorder}` }}
          >
            <button onClick={() => setFuncionActiva(null)}
              style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.06)', border:'none', color:'#9CA3AF', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
              ✕
            </button>
            <div style={{ width:60, height:60, borderRadius:16, background:`linear-gradient(135deg,${color}30,${color}10)`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:`0 4px 20px ${color}30` }}>
              <FuncionIcon icon={funcionActiva.icon} titulo={funcionActiva.titulo} color={color}/>
            </div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:color+'90', textTransform:'uppercase', marginBottom:10 }}>Funcionalidad incluida</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:800, marginBottom:14, color:'#FAFAF8' }}>{funcionActiva.titulo}</h3>
            <p style={{ fontSize:15, color:'#9CA3AF', lineHeight:1.75, marginBottom:28 }}>{funcionActiva.desc}</p>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 18px', marginBottom:24 }}>
              <div style={{ fontSize:12, fontWeight:700, color:color, marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>¿Cómo funciona?</div>
              {[
                'El agente IA detecta automáticamente la intención del cliente',
                'Responde en menos de 2 segundos, las 24 horas del día',
                'Se sincroniza con tu agenda y sistema de pagos',
                'Aprende de tu negocio y mejora con cada conversación',
              ].map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8, fontSize:13, color:'#D1D5DB' }}>
                  <span style={{ width:18, height:18, borderRadius:'50%', background:colorBg, border:`1px solid ${colorBorder}`, color, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Link href="/auth/register"
                style={{ flex:1, background:color, color:'#080B0F', borderRadius:12, fontWeight:700, fontSize:14, padding:'12px', textDecoration:'none', textAlign:'center', display:'block' }}>
                Activar esta función gratis →
              </Link>
              <button onClick={() => setFuncionActiva(null)}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9CA3AF', borderRadius:12, padding:'12px 16px', fontSize:14, cursor:'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT DEMO */}
      <section id="chat-demo" style={{ padding:'100px 60px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <p style={{ color, fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Demo real</p>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, letterSpacing:'-1.5px', marginBottom:16 }}>
              Así habla tu agente IA con los clientes
            </h2>
            <p style={{ color:'#9CA3AF', fontSize:15, lineHeight:1.7, marginBottom:28 }}>
              Conversación real entre un cliente y el agente IA configurado para {industria.nombre.toLowerCase()}.
            </p>
            {['Responde en menos de 2 segundos','Disponible 7 días, 24 horas','Aprende de tu negocio','Escala a humano cuando es necesario'].map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'#D1D5DB', marginBottom:10 }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:colorBg, border:`1px solid ${colorBorder}`, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, flexShrink:0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>

          <div style={{ background:'#111318', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>
            <div style={{ background:'#25D366', padding:'14px 20px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.2)', flexShrink:0 }}>
                {industria.img
                  ? <img src={industria.img} alt={industria.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{industria.emoji}</div>
                }
              </div>
              <div>
                <div style={{ fontWeight:700, color:'#fff', fontSize:14 }}>Agente IA — {industria.nombre}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>● En línea ahora</div>
              </div>
            </div>
            <div style={{ padding:18, display:'flex', flexDirection:'column', gap:10, background:'#0a1628', minHeight:320 }}>
              {industria.flujoChat.map((msg, i) => (
                <div key={i} style={{ display:'flex', justifyContent:msg.rol==='agente'?'flex-start':'flex-end' }}>
                  <div style={{
                    maxWidth:'78%',
                    background:msg.rol==='agente'?'#1F2C34':'#005C4B',
                    borderRadius:msg.rol==='agente'?'0 12px 12px 12px':'12px 0 12px 12px',
                    padding:'9px 13px', fontSize:13, lineHeight:1.5, color:'#E9EDEF', whiteSpace:'pre-line',
                  }}>
                    {msg.rol==='agente' && <div style={{ fontSize:9, color:'#00E5A0', fontWeight:700, marginBottom:3 }}>🤖 AGENTE IA</div>}
                    {msg.texto}
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:3, textAlign:'right' }}>
                      {['9:14','9:15','9:15','9:16','9:16','9:16'][i]} ✓✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASOS DE ÉXITO */}
      <section style={{ padding:'100px 60px', background:'#111318' }}>
        <p style={{ color, fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Resultados reales</p>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, letterSpacing:'-1.5px', marginBottom:44 }}>
          Negocios que ya lo están usando
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:18 }}>
          {industria.casos.map((caso,i) => (
            <div key={i} style={{ background:'#080B0F', border:`1px solid ${colorBorder}`, borderRadius:16, padding:26 }}>
              <Stars/>
              <p style={{ fontSize:15, color:'#D1D5DB', lineHeight:1.65, marginBottom:18, fontStyle:'italic' }}>"{caso.resultado}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:colorBg, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800 }}>
                  {caso.nombre.charAt(0)}
                </div>
                <div style={{ fontWeight:600, fontSize:13 }}>{caso.nombre}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OTRAS ESPECIALIDADES */}
      <section style={{ padding:'70px 60px' }}>
        <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, marginBottom:28, color:'#9CA3AF' }}>
          También tenemos soluciones para:
        </h3>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {Object.values(INDUSTRIAS_DETALLE).filter(ind => ind.slug && ind.slug !== industria.slug).map(ind => (
            <Link key={ind.slug} href={`/especialidades/${ind.slug}`}
              style={{ display:'flex', alignItems:'center', gap:8, background:'#111318', border:'1px solid rgba(255,255,255,0.08)', borderRadius:100, padding:'7px 14px', fontSize:13, color:'#9CA3AF', textDecoration:'none', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ind.color+'44'; e.currentTarget.style.color = ind.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9CA3AF'; }}>
              {ind.img
                ? <img src={ind.img} alt={ind.nombre} style={{ width:20, height:20, borderRadius:5, objectFit:'cover' }}/>
                : <span>{ind.emoji}</span>
              }
              {ind.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'100px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 60% 80% at 50% 50%,${colorBg},transparent)`, pointerEvents:'none' }}/>
        <div style={{ width:68, height:68, borderRadius:18, overflow:'hidden', margin:'0 auto 18px', border:`2px solid ${colorBorder}` }}>
          {industria.img
            ? <img src={industria.img} alt={industria.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <div style={{ width:'100%', height:'100%', background:colorBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{industria.emoji}</div>
          }
        </div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(32px,4.5vw,58px)', fontWeight:800, letterSpacing:'-2px', lineHeight:1.1, marginBottom:18 }}>
          ¿Listo para automatizar tu<br/><span style={{ color }}>{industria.nombre.toLowerCase()}?</span>
        </h2>
        <p style={{ color:'#9CA3AF', fontSize:17, marginBottom:40 }}>14 días gratis · Sin tarjeta · Activo en menos de 24h</p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth/register" style={{ background:color, color:'#080B0F', borderRadius:100, fontWeight:700, fontSize:15, padding:'13px 34px', textDecoration:'none' }}>
            Crear mi cuenta gratis →
          </Link>
          <a href="mailto:bqinzagencia@gmail.com?subject=Demo%20-%20${industria.nombre}" style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', borderRadius:100, fontWeight:600, fontSize:15, padding:'13px 34px', textDecoration:'none' }}>
            Hablar con un asesor
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'28px 60px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
        <Logo size={18}/>
        <div style={{ display:'flex', gap:22 }}>
          <Link href="/" style={{ color:'#6B7280', fontSize:13, textDecoration:'none' }}>Inicio</Link>
          <Link href="/#precios" style={{ color:'#6B7280', fontSize:13, textDecoration:'none' }}>Precios</Link>
          <Link href="/auth/register" style={{ color:'#6B7280', fontSize:13, textDecoration:'none' }}>Registrarse</Link>
        </div>
        <span style={{ color:'#3A4150', fontSize:12 }}>© 2026 BQinzagencIA · España 🇪🇸</span>
      </footer>
    </>
  );
}
