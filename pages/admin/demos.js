// pages/admin/demos.js
// Generador de links de demo para prospectos — solo para el admin de BQinzagencIA.
// Sin correo, sin registro — genera el link en 1 click y lo copias.
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const SECRET = process.env.NEXT_PUBLIC_ADMIN_METRICS_SECRET || 'nexoia_admin_metrics_2026';

const INDUSTRIAS = [
  { id:'peluqueria',   label:'💇 Peluquería / Spa' },
  { id:'barberia',     label:'💈 Barbería' },
  { id:'restaurante',  label:'🍽️ Restaurante' },
  { id:'clinica',      label:'🏥 Clínica / Estética' },
  { id:'veterinaria',  label:'🐾 Veterinaria' },
  { id:'taller',       label:'🔧 Taller / Mecánica' },
  { id:'tienda',       label:'🏪 Tienda / Comercio' },
  { id:'inmobiliaria', label:'🏠 Inmobiliaria' },
  { id:'reposteria',   label:'🎂 Repostería / Chef' },
  { id:'farmacia',     label:'💊 Farmacia' },
  { id:'fotografia',   label:'📷 Fotografía' },
  { id:'otro',         label:'💼 Otro negocio' },
];

export default function AdminDemos() {
  const { user, esAdmin, loading } = useAuth();
  const router = useRouter();

  const [nombre,    setNombre]    = useState('');
  const [industria, setIndustria] = useState('peluqueria');
  const [prospecto, setProspecto] = useState('');
  const [instagram, setInstagram] = useState('');
  const [generando, setGenerando] = useState(false);
  const [demos,     setDemos]     = useState([]); // historial de la sesión
  const [copiado,   setCopiado]   = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user)    { router.push('/auth/login'); return; }
      if (!esAdmin) { router.push('/dashboard');  return; }
    }
  }, [user, esAdmin, loading]);

  const generarDemo = async () => {
    if (!nombre.trim()) return;
    setGenerando(true);
    try {
      const r = await fetch('/api/wasapbot-crear-demo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': SECRET },
        body:    JSON.stringify({
          nombreNegocio:   nombre.trim(),
          industria,
          nombreProspecto: prospecto.trim(),
          instagram:       instagram.trim(),
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setDemos(prev => [{ ...d, nombre: nombre.trim(), prospecto: prospecto.trim(), instagram: instagram.trim(), industria, creadoEn: new Date().toLocaleTimeString('es-ES') }, ...prev]);
        setNombre(''); setProspecto(''); setInstagram('');
      }
    } catch {}
    setGenerando(false);
  };

  const copiar = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2500);
  };

  const compartirWA = (link, nombre) => {
    const msg = encodeURIComponent(`Hola! Te comparto el simulador de tu asistente IA personalizado para *${nombre}* 🤖\n\nPruébalo aquí: ${link}\n\n_(No necesitas registrarte, entra directo)_`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading || !esAdmin) return null;

  const INP = { width:'100%', background:'#0C0F14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 14px', color:'#EFF4FF', fontFamily:F, fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color .2s' };

  return (
    <>
      <Head><title>Generador de Demos — Admin BQinzagencIA</title></Head>
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06090D;color:#EFF4FF;font-family:${F};min-height:100vh}
        input:focus,select:focus{border-color:rgba(37,211,102,0.5)!important}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .card{animation:up .25s ease both}
      ` }} />

      {/* NAV */}
      <nav style={{ background:'rgba(6,9,13,.97)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontFamily:FA, fontSize:17, cursor:'pointer' }} onClick={() => router.push('/admin')}>
            BQinz<span style={{color:'#FF6B00'}}>agenc</span>IA
          </span>
          <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontSize:13, fontWeight:700 }}>🔗 Generador de demos</span>
        </div>
        <button onClick={() => router.push('/admin')}
          style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 14px', color:'rgba(255,255,255,0.5)', fontFamily:F, fontSize:12, cursor:'pointer' }}>
          ← Volver al admin
        </button>
      </nav>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* Formulario */}
        <div style={{ background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:28, marginBottom:28 }}>
          <h2 style={{ fontFamily:FA, fontSize:26, fontWeight:400, letterSpacing:'-0.5px', marginBottom:6 }}>Nuevo link de demo</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:24, lineHeight:1.6 }}>
            Genera un link personalizado para un prospecto. Él entra directo al chat sin registrarse.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nombre del negocio *</label>
              <input style={INP} value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Manicure by Alina" onKeyDown={e => e.key==='Enter' && generarDemo()} />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Industria</label>
              <select style={{ ...INP, cursor:'pointer' }} value={industria} onChange={e => setIndustria(e.target.value)}>
                {INDUSTRIAS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Nombre del prospecto</label>
              <input style={INP} value={prospecto} onChange={e => setProspecto(e.target.value)} placeholder="Ej: Alina" />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>Instagram (opcional)</label>
              <input style={INP} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@manicure_madrid_by_alina" />
            </div>
          </div>

          <button onClick={generarDemo} disabled={generando || !nombre.trim()}
            style={{ width:'100%', background:'linear-gradient(135deg,#25D366,#1aad4e)', color:'#fff', border:'none', borderRadius:12, padding:'14px', fontFamily:F, fontSize:15, fontWeight:700, cursor:'pointer', opacity: generando||!nombre.trim()?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {generando
              ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.3)', borderTop:'2.5px solid #fff', borderRadius:'50%', animation:'spin .8s linear infinite', display:'inline-block' }}/>Generando...</>
              : <>🔗 Generar link de demo</>}
          </button>
        </div>

        {/* Historial de demos generados en esta sesión */}
        {demos.length > 0 && (
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>
              Links generados esta sesión
            </div>
            {demos.map((d, i) => (
              <div key={d.empresaId} className="card" style={{ background:'#0C0F14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:20, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:12 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#EFF4FF', marginBottom:3 }}>{d.nombre}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', gap:10 }}>
                      {d.prospecto && <span>👤 {d.prospecto}</span>}
                      {d.instagram && <span>📸 {d.instagram}</span>}
                      <span>🕐 {d.creadoEn}</span>
                    </div>
                  </div>
                  <span style={{ background:'rgba(37,211,102,0.1)', color:'#25D366', border:'1px solid rgba(37,211,102,0.2)', borderRadius:99, padding:'3px 10px', fontSize:10, fontWeight:700, flexShrink:0 }}>
                    {INDUSTRIAS.find(x => x.id===d.industria)?.label || d.industria}
                  </span>
                </div>

                {/* Link */}
                <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:9, padding:'10px 14px', marginBottom:12, fontFamily:'monospace', fontSize:12, color:'#94A3B8', wordBreak:'break-all' }}>
                  {d.link}
                </div>

                {/* Acciones */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={() => copiar(d.link, d.empresaId)}
                    style={{ flex:1, background: copiado===d.empresaId ? 'rgba(37,211,102,0.15)' : 'rgba(255,255,255,0.05)', color: copiado===d.empresaId ? '#25D366' : '#EFF4FF', border:`1px solid ${copiado===d.empresaId?'rgba(37,211,102,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:9, padding:'9px 14px', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    {copiado===d.empresaId ? '✓ Copiado' : '📋 Copiar link'}
                  </button>
                  <button onClick={() => compartirWA(d.link, d.nombre)}
                    style={{ flex:1, background:'rgba(37,211,102,0.08)', color:'#25D366', border:'1px solid rgba(37,211,102,0.2)', borderRadius:9, padding:'9px 14px', fontFamily:F, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    💬 Enviar por WhatsApp
                  </button>
                  <a href={d.link} target="_blank" rel="noreferrer"
                    style={{ background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'9px 14px', fontFamily:F, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}>
                    👁️ Previsualizar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {demos.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(255,255,255,0.2)', fontSize:13 }}>
            Los links que generes aparecerán aquí para copiarlos o enviarlos por WhatsApp directamente.
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
