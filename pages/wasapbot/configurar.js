// pages/wasapbot/configurar.js
// Configuración del agente WasapBot — editar prompt, personalidad y servicios

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const WA      = '#25D366';
const WA_GLOW = 'rgba(37,211,102,0.15)';
const WA_BOR  = 'rgba(37,211,102,0.32)';
const DARK    = '#080B0F';
const CARD    = '#111318';
const CARD2   = '#1A1E26';
const NARANJA = '#FF6B00';

const TIPOS = [
  { id: 'estetica',           label: 'Centro de Estética',    emoji: '💆' },
  { id: 'salon',              label: 'Salón de Belleza',       emoji: '✂️' },
  { id: 'spa',                label: 'Spa & Masajes',          emoji: '🧖' },
  { id: 'dental',             label: 'Clínica Dental',         emoji: '🦷' },
  { id: 'medicina-estetica',  label: 'Medicina Estética',      emoji: '💉' },
  { id: 'restaurante',        label: 'Restaurante / Cafetería',emoji: '🍽️' },
  { id: 'gimnasio',           label: 'Gimnasio / Fitness',     emoji: '🏋️' },
  { id: 'inmobiliaria',       label: 'Inmobiliaria',           emoji: '🏠' },
  { id: 'tienda',             label: 'Tienda / Comercio',      emoji: '🛒' },
  { id: 'salud',              label: 'Clínica / Consultorio',  emoji: '🏥' },
  { id: 'academia',           label: 'Academia / Educación',   emoji: '📚' },
  { id: 'veterinaria',        label: 'Veterinaria / Mascotas', emoji: '🐾' },
  { id: 'generico',           label: 'Otro tipo de negocio',   emoji: '🏢' },
];

function generarPromptAutomatico(tipo, nombre, descripcion) {
  const tipoLabel = TIPOS.find(t => t.id === tipo)?.label || 'negocio';
  return `Eres el asistente virtual de WhatsApp de "${nombre}", un ${tipoLabel} en España.

${descripcion ? `Información del negocio: ${descripcion}` : ''}

TUS TAREAS PRINCIPALES:
1. Responder preguntas sobre servicios, precios y horarios
2. Agendar citas y reservas
3. Confirmar y recordar citas
4. Captar datos de clientes potenciales

REGLAS DE COMUNICACIÓN:
- Escribe en español, tono cercano y profesional
- Respuestas CORTAS: máximo 3-4 líneas por mensaje
- Usa 1-2 emojis por mensaje máximo
- Al confirmar cita: "✅ [nombre], te agendo [servicio] el [día] a las [hora]h"
- Si no sabes algo: "Te paso con el equipo ahora mismo 🙏"

FLUJO DE CITA:
1. Pregunta qué servicio necesita
2. Ofrece 2-3 horarios disponibles
3. Pide nombre completo
4. Confirma la cita
5. Solicita señal si aplica

Responde SOLO en texto plano. Sin asteriscos ni markdown.`;
}

export default function WasapBotConfigurar() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  const [guardando, setGuardando]   = useState(false);
  const [tab, setTab]               = useState('basico');
  const [form, setForm]             = useState({
    tipo:        '',
    nombre:      '',
    descripcion: '',
    horario:     'Lunes a Sábado 9:00-20:00h',
    servicios:   '',
    prompt:      '',
    saludo:      '',
    nombre_bot:  'Asistente',
  });

  useEffect(() => { if (!loading && !user) router.push('/wasapbot'); }, [user, loading]);

  useEffect(() => {
    if (!user || !empresa) return;
    setForm(f => ({
      ...f,
      tipo:       empresa.botTipo       || empresa.industria || '',
      nombre:     empresa.nombreEmpresa || '',
      descripcion:empresa.descripcionNegocio || '',
      horario:    empresa.horario        || 'Lunes a Sábado 9:00-20:00h',
      prompt:     empresa.botPrompt     || '',
      nombre_bot: empresa.nombreAgente  || 'Asistente',
    }));
  }, [user, empresa]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoGenerarPrompt = () => {
    const p = generarPromptAutomatico(form.tipo, form.nombre, form.descripcion);
    set('prompt', p);
    toast.success('Prompt generado automáticamente ✨');
  };

  const guardar = async () => {
    if (!form.tipo)   { toast.error('Selecciona el tipo de negocio'); return; }
    if (!form.nombre) { toast.error('Añade el nombre de tu negocio'); return; }
    setGuardando(true);
    try {
      const promptFinal = form.prompt || generarPromptAutomatico(form.tipo, form.nombre, form.descripcion);
      await setDoc(doc(db, 'empresas', user.uid), {
        botTipo:           form.tipo,
        nombreAgente:      form.nombre_bot,
        descripcionNegocio:form.descripcion,
        horario:           form.horario,
        botPrompt:         promptFinal,
        botSaludo:         form.saludo,
        updatedAt:         serverTimestamp(),
        agenteWasapBot: {
          nombre: form.nombre_bot,
          prompt: promptFinal,
          activo: true,
        },
      }, { merge: true });
      toast.success('¡Configuración guardada! El bot ya usa las nuevas instrucciones 🤖');
    } catch (e) {
      toast.error('Error al guardar: ' + e.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:DARK, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:36, height:36, border:`3px solid ${WA_GLOW}`, borderTopColor:WA, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tipoActual = TIPOS.find(t => t.id === form.tipo);

  return (
    <>
      <Head>
        <title>Configurar bot — WasapBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Toaster position="top-center" />

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)', background:'rgba(8,11,15,0.96)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link href="/wasapbot" style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:800, color:'#FAFAF8', textDecoration:'none' }}>
            BQinz<span style={{ color:NARANJA }}>agenc</span>IA
          </Link>
          <span style={{ background:WA_GLOW, color:WA, border:`1px solid ${WA_BOR}`, borderRadius:100, padding:'3px 10px', fontSize:10, fontWeight:700 }}>WasapBot</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/wasapbot/panel" style={{ background:CARD2, color:WA, border:`1px solid ${WA_BOR}`, borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:700, textDecoration:'none' }}>
            💬 Ver conversaciones
          </Link>
          <Link href="/dashboard" style={{ background:NARANJA, color:'#fff', borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:700, textDecoration:'none' }}>
            Panel completo →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 20px' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, letterSpacing:'-1px', marginBottom:8 }}>
            ⚙️ Configurar tu bot
          </h1>
          <p style={{ color:'#6B7280', fontSize:15 }}>
            Personaliza cómo responde el bot a tus clientes en WhatsApp.
          </p>
        </div>

        {/* Estado actual */}
        {tipoActual && (
          <div style={{ background:WA_GLOW, border:`1px solid ${WA_BOR}`, borderRadius:14, padding:'14px 20px', marginBottom:28, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>{tipoActual.emoji}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#FAFAF8' }}>{form.nombre}</div>
              <div style={{ fontSize:12, color:WA }}>{tipoActual.label} · Bot: {form.nombre_bot}</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, background:'rgba(37,211,102,0.1)', border:`1px solid ${WA_BOR}`, borderRadius:100, padding:'4px 12px' }}>
              <span style={{ width:6, height:6, background:WA, borderRadius:'50%', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, fontWeight:700, color:WA }}>Bot activo</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:CARD, borderRadius:12, padding:4, marginBottom:28 }}>
          {[
            { id:'basico',    label:'📋 Info básica' },
            { id:'prompt',    label:'🤖 Instrucciones IA' },
            { id:'mensajes',  label:'💬 Mensajes' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, background:tab===t.id ? NARANJA : 'transparent', color:tab===t.id ? '#fff' : '#6B7280', border:'none', borderRadius:8, padding:'10px 8px', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB BÁSICO */}
        {tab === 'basico' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Tipo de negocio */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, display:'block', marginBottom:12, textTransform:'uppercase' }}>
                TIPO DE NEGOCIO
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8 }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={() => set('tipo', t.id)}
                    style={{ background:form.tipo===t.id ? WA_GLOW : CARD, border:`1px solid ${form.tipo===t.id ? WA_BOR : 'rgba(255,255,255,0.06)'}`, borderRadius:10, padding:'10px 12px', cursor:'pointer', color:form.tipo===t.id ? WA : '#9CA3AF', fontSize:12, fontWeight:600, textAlign:'left', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre del negocio */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, display:'block', marginBottom:8, textTransform:'uppercase' }}>NOMBRE DEL NEGOCIO</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Centro Estético Lumina"
                style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#FAFAF8', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
            </div>

            {/* Nombre del bot */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, display:'block', marginBottom:8, textTransform:'uppercase' }}>NOMBRE DEL BOT / ASISTENTE</label>
              <input value={form.nombre_bot} onChange={e => set('nombre_bot', e.target.value)} placeholder="Ej: Luna, Sara, Asistente..."
                style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#FAFAF8', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
            </div>

            {/* Descripción */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, display:'block', marginBottom:8, textTransform:'uppercase' }}>DESCRIPCIÓN DEL NEGOCIO</label>
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4}
                placeholder={`Describe tu negocio: servicios principales, precios, horarios, ubicación...\nEj: Somos un centro de estética en Madrid. Ofrecemos faciales desde 45€, depilación laser desde 60€. Horario L-S 9-20h.`}
                style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#FAFAF8', padding:'11px 14px', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.6 }} />
              <p style={{ fontSize:11, color:'#4B5563', marginTop:6 }}>💡 Cuanta más información pongas, mejor responderá el bot a tus clientes.</p>
            </div>

            {/* Horario */}
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, display:'block', marginBottom:8, textTransform:'uppercase' }}>HORARIO DE ATENCIÓN</label>
              <input value={form.horario} onChange={e => set('horario', e.target.value)} placeholder="Lunes a Sábado 9:00-20:00h"
                style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#FAFAF8', padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
        )}

        {/* TAB PROMPT */}
        {tab === 'prompt' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ background:CARD, border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>¿Qué son las instrucciones IA?</div>
              <p style={{ color:'#6B7280', fontSize:13, lineHeight:1.6 }}>
                Estas instrucciones le dicen al bot cómo debe comportarse, qué puede responder y cómo hablar con tus clientes. 
                Puedes generarlas automáticamente o editarlas manualmente.
              </p>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#6B7280', letterSpacing:1, textTransform:'uppercase' }}>INSTRUCCIONES DEL BOT</label>
              <button onClick={autoGenerarPrompt}
                style={{ background:`${WA}22`, color:WA, border:`1px solid ${WA_BOR}`, borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                ✨ Auto-generar
              </button>
            </div>
            <textarea value={form.prompt} onChange={e => set('prompt', e.target.value)} rows={18}
              placeholder="Pulsa 'Auto-generar' para crear las instrucciones automáticamente según tu tipo de negocio, o escríbelas manualmente..."
              style={{ width:'100%', background:'#0a0d12', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#9CA3AF', padding:'14px', fontSize:12, outline:'none', resize:'vertical', fontFamily:'monospace', lineHeight:1.7, boxSizing:'border-box' }} />
          </div>
        )}

        {/* TAB MENSAJES */}
        {tab === 'mensajes' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ background:CARD, border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>Mensaje de bienvenida</div>
              <p style={{ color:'#6B7280', fontSize:13, lineHeight:1.6, marginBottom:16 }}>
                Este mensaje se envía automáticamente cuando alguien escribe por primera vez.
              </p>
              <textarea value={form.saludo} onChange={e => set('saludo', e.target.value)} rows={4}
                placeholder={`Ej: ¡Hola! Soy ${form.nombre_bot}, el asistente de ${form.nombre || 'nuestro negocio'} 👋\n¿En qué puedo ayudarte hoy?`}
                style={{ width:'100%', background:CARD2, border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#FAFAF8', padding:'11px 14px', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.6 }} />
            </div>

            {/* Preview del saludo */}
            {(form.saludo || form.nombre_bot) && (
              <div style={{ background:'#0f172a', border:`1px solid ${WA_BOR}`, borderRadius:14, padding:20 }}>
                <div style={{ fontSize:11, color:WA, fontWeight:700, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:6, height:6, background:WA, borderRadius:'50%' }} /> PREVIEW — Así verá el cliente el primer mensaje
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div style={{ maxWidth:'80%', background:WA_GLOW, border:`1px solid ${WA_BOR}`, borderRadius:'16px 16px 4px 16px', padding:'12px 16px', fontSize:14, lineHeight:1.6, color:'#FAFAF8', whiteSpace:'pre-wrap' }}>
                    {form.saludo || `¡Hola! Soy ${form.nombre_bot}, el asistente de ${form.nombre || 'nuestro negocio'} 👋\n¿En qué puedo ayudarte hoy?`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón guardar */}
        <div style={{ marginTop:32, display:'flex', gap:12 }}>
          <Link href="/wasapbot/panel"
            style={{ background:CARD2, color:'#9CA3AF', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'13px 24px', fontSize:14, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            ← Conversaciones
          </Link>
          <button onClick={guardar} disabled={guardando}
            style={{ flex:1, background:WA, color:'#fff', border:'none', borderRadius:12, padding:'13px', fontSize:15, fontWeight:800, cursor:guardando ? 'not-allowed' : 'pointer', opacity:guardando ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 24px rgba(37,211,102,0.3)' }}>
            {guardando ? 'Guardando...' : '✅ Guardar configuración'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </>
  );
}
