// pages/generar-web.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { Logo } from './index';

const NARANJA        = '#FF6B00';
const NARANJA_GLOW   = 'rgba(255,107,0,0.15)';
const NARANJA_BORDER = 'rgba(255,107,0,0.32)';
const DARK           = '#080B0F';
const CARD           = '#111318';
const CARD2          = '#1A1E26';
const GREEN          = '#22C55E';

const TIPOS = [
  'Centro de Estética', 'Salón de Belleza', 'Spa & Masajes',
  'Clínica Dental', 'Medicina Estética', 'Gimnasio & Fitness',
  'Restaurante & Café', 'Tienda & Retail', 'Peluquería',
  'Inmobiliaria', 'Taller Mecánico', 'Clínica Médica', 'Otro',
];

const COLORES = [
  { hex: '#FF6B00', name: 'Naranja' },
  { hex: '#3B82F6', name: 'Azul' },
  { hex: '#8B5CF6', name: 'Violeta' },
  { hex: '#EC4899', name: 'Rosa' },
  { hex: '#22C55E', name: 'Verde' },
  { hex: '#14B8A6', name: 'Turquesa' },
  { hex: '#EAB308', name: 'Dorado' },
  { hex: '#EF4444', name: 'Rojo' },
];

const PASOS = [
  { n: 1, label: 'Tu negocio' },
  { n: 2, label: 'Servicios' },
  { n: 3, label: 'Estilo' },
  { n: 4, label: 'Resultado' },
];

export default function GenerarWeb() {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    negocio: '', tipo: '', ciudad: '', telefono: '', email: '',
    servicios: '', colorHex: '#FF6B00',
  });
  const [generando, setGenerando] = useState(false);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [progreso, setProgreso] = useState(0);
  const iframeRef = useRef(null);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function puedeAvanzar() {
    if (paso === 1) return form.negocio.trim().length >= 2 && form.tipo;
    if (paso === 2) return form.servicios.trim().length >= 5;
    return true;
  }

  async function generar() {
    setGenerando(true);
    setError('');
    setProgreso(0);

    // Simular progreso visual
    const interval = setInterval(() => {
      setProgreso(p => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + Math.random() * 12;
      });
    }, 400);

    try {
      const res = await fetch('/api/generar-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      clearInterval(interval);

      if (data.error) {
        setError(data.error);
        setGenerando(false);
        setProgreso(0);
        return;
      }

      setProgreso(100);
      setTimeout(() => {
        setHtml(data.html);
        setPaso(4);
        setGenerando(false);
      }, 400);
    } catch (e) {
      clearInterval(interval);
      setError('Error de conexión. Inténtalo de nuevo.');
      setGenerando(false);
      setProgreso(0);
    }
  }

  function descargarHTML() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (form.negocio.toLowerCase().replace(/\s+/g, '-') || 'mi-web') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  function copiarHTML() {
    navigator.clipboard.writeText(html).then(() => {
      alert('¡Código HTML copiado al portapapeles!');
    });
  }

  const colorActual = form.colorHex;

  return (
    <>
      <Head>
        <title>Genera tu web en minutos — BQinzagencIA</title>
        <meta name="description" content="Genera tu página web profesional con IA en menos de 2 minutos. Sin código, sin diseñador." />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><Logo size={18} /></Link>
        <Link href="/" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver al inicio
        </Link>
      </nav>

      <div style={{ minHeight: '100vh', background: DARK, color: '#FAFAF8', paddingTop: 80 }}>

        {/* HERO */}
        {paso < 4 && (
          <div style={{ textAlign: 'center', padding: '48px 20px 32px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.08), transparent)`, pointerEvents: 'none' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: GREEN, padding: '6px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
              <span style={{ width: 7, height: 7, background: GREEN, borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              IA generativa · Listo en 60 segundos
            </div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,5vw,56px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 14 }}>
              Tu web profesional,<br /><span style={{ color: GREEN }}>generada por IA</span>
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: 16, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Rellena 3 pasos rápidos y nuestra IA construye tu página web completa: diseño, textos, servicios y formulario de contacto.
            </p>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 40 }}>
              {PASOS.map((p, i) => (
                <div key={p.n} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: paso > p.n ? GREEN : paso === p.n ? colorActual : CARD2,
                      border: `2px solid ${paso >= p.n ? (paso > p.n ? GREEN : colorActual) : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: paso >= p.n ? '#fff' : '#6B7280',
                      transition: 'all 0.3s',
                    }}>
                      {paso > p.n ? '✓' : p.n}
                    </div>
                    <span style={{ fontSize: 11, color: paso >= p.n ? '#FAFAF8' : '#4B5563', fontWeight: 600 }}>{p.label}</span>
                  </div>
                  {i < PASOS.length - 1 && (
                    <div style={{ width: 60, height: 2, background: paso > p.n ? GREEN : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: 22, transition: 'background 0.3s' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        <div style={{ maxWidth: paso === 4 ? 1200 : 640, margin: '0 auto', padding: '0 20px 80px' }}>

          {/* PASO 1 — Tu negocio */}
          {paso === 1 && (
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Cuéntanos sobre tu negocio</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Esta información se usará para generar los textos y estructura de tu web.</p>

              <label style={labelStyle}>Nombre del negocio *</label>
              <input
                style={inputStyle}
                placeholder="Ej: Centro Estético Lumina"
                value={form.negocio}
                onChange={e => update('negocio', e.target.value)}
                onFocus={e => e.target.style.borderColor = colorActual}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />

              <label style={labelStyle}>Tipo de negocio *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8, marginBottom: 20 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => update('tipo', t)}
                    style={{
                      background: form.tipo === t ? colorActual : CARD2,
                      border: `1px solid ${form.tipo === t ? colorActual : 'rgba(255,255,255,0.08)'}`,
                      color: form.tipo === t ? '#fff' : '#9CA3AF',
                      borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}>
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Ciudad / Localidad</label>
                  <input style={inputStyle} placeholder="Ej: Madrid" value={form.ciudad} onChange={e => update('ciudad', e.target.value)} onFocus={e => e.target.style.borderColor = colorActual} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input style={inputStyle} placeholder="Ej: +34 600 000 000" value={form.telefono} onChange={e => update('telefono', e.target.value)} onFocus={e => e.target.style.borderColor = colorActual} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <label style={labelStyle}>Email de contacto</label>
              <input style={inputStyle} placeholder="Ej: hola@tulumina.com" value={form.email} onChange={e => update('email', e.target.value)} onFocus={e => e.target.style.borderColor = colorActual} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />

              <button
                onClick={() => puedeAvanzar() && setPaso(2)}
                style={{ ...btnStyle(colorActual), opacity: puedeAvanzar() ? 1 : 0.4, cursor: puedeAvanzar() ? 'pointer' : 'not-allowed', marginTop: 8 }}
              >
                Siguiente: Mis servicios →
              </button>
            </div>
          )}

          {/* PASO 2 — Servicios */}
          {paso === 2 && (
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>¿Qué servicios ofreces?</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Describe tus servicios principales. La IA los convertirá en una sección de servicios atractiva.</p>

              <label style={labelStyle}>Servicios principales *</label>
              <textarea
                style={{ ...inputStyle, height: 130, resize: 'vertical', lineHeight: 1.6 }}
                placeholder={"Ej: Limpieza facial profunda, Depilación láser, Microblading, Tratamiento antiedad con radiofrecuencia, Hidratación profunda..."}
                value={form.servicios}
                onChange={e => update('servicios', e.target.value)}
                onFocus={e => e.target.style.borderColor = colorActual}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <p style={{ color: '#4B5563', fontSize: 12, marginTop: 6, marginBottom: 24 }}>
                Tip: cuantos más detalles pongas, mejor será el resultado. Separa los servicios por comas.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setPaso(1)} style={{ ...btnSecStyle, flex: '0 0 auto' }}>← Atrás</button>
                <button
                  onClick={() => puedeAvanzar() && setPaso(3)}
                  style={{ ...btnStyle(colorActual), opacity: puedeAvanzar() ? 1 : 0.4, cursor: puedeAvanzar() ? 'pointer' : 'not-allowed', flex: 1 }}
                >
                  Siguiente: Estilo visual →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Estilo + Generar */}
          {paso === 3 && (
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Elige el estilo de tu web</h2>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Selecciona el color principal que definirá la identidad de tu sitio.</p>

              <label style={labelStyle}>Color principal de marca</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                {COLORES.map(c => (
                  <button key={c.hex} onClick={() => update('colorHex', c.hex)}
                    title={c.name}
                    style={{
                      width: 44, height: 44, borderRadius: 12, background: c.hex, border: 'none',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: form.colorHex === c.hex ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}` : 'none',
                      transform: form.colorHex === c.hex ? 'scale(1.12)' : 'scale(1)',
                    }}
                  />
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={form.colorHex} onChange={e => update('colorHex', e.target.value)}
                    style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'transparent', padding: 2 }}
                    title="Color personalizado"
                  />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Personalizar</span>
                </div>
              </div>

              {/* Preview del color */}
              <div style={{ background: CARD2, borderRadius: 14, padding: '18px 20px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: colorActual, flexShrink: 0, boxShadow: `0 4px 16px ${colorActual}55` }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Vista previa del color</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Los botones, acentos y detalles de tu web usarán este color: <span style={{ color: colorActual, fontWeight: 700 }}>{colorActual}</span></div>
                </div>
              </div>

              {/* Resumen antes de generar */}
              <div style={{ background: DARK, borderRadius: 14, padding: '18px 20px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Resumen de tu web</div>
                {[
                  ['Negocio', form.negocio],
                  ['Tipo', form.tipo],
                  ['Ciudad', form.ciudad || 'No especificada'],
                  ['Servicios', form.servicios.length > 60 ? form.servicios.slice(0, 60) + '…' : form.servicios],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#4B5563', width: 72, flexShrink: 0 }}>{k}:</span>
                    <span style={{ color: '#FAFAF8', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              {generando && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
                    <span>Generando tu web con IA...</span>
                    <span style={{ color: GREEN, fontWeight: 700 }}>{Math.round(progreso)}%</span>
                  </div>
                  <div style={{ height: 6, background: CARD2, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${GREEN}, #16A34A)`, borderRadius: 100, width: progreso + '%', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#4B5563' }}>
                    {progreso < 30 ? '🧠 Analizando tu negocio...' : progreso < 60 ? '✍️ Escribiendo los textos...' : progreso < 85 ? '🎨 Aplicando el diseño...' : '⚡ Finalizando el código...'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setPaso(2)} disabled={generando} style={{ ...btnSecStyle, flex: '0 0 auto' }}>← Atrás</button>
                <button
                  onClick={generar}
                  disabled={generando}
                  style={{
                    ...btnStyle(GREEN), flex: 1, opacity: generando ? 0.7 : 1,
                    cursor: generando ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  {generando ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Generando...
                    </>
                  ) : (
                    <>⚡ Generar mi web con IA</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 4 — RESULTADO */}
          {paso === 4 && html && (
            <div>
              {/* Header resultado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: GREEN, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    ✓ Web generada con éxito
                  </div>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
                    Tu web está lista, <span style={{ color: colorActual }}>{form.negocio}</span>
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => { setPaso(1); setHtml(''); setForm({ negocio: '', tipo: '', ciudad: '', telefono: '', email: '', servicios: '', colorHex: '#FF6B00' }); }}
                    style={btnSecStyle}>
                    🔄 Generar otra
                  </button>
                  <button onClick={copiarHTML} style={{ ...btnStyle('#3B82F6') }}>
                    📋 Copiar código
                  </button>
                  <button onClick={descargarHTML} style={{ ...btnStyle(GREEN) }}>
                    ⬇️ Descargar .html
                  </button>
                </div>
              </div>

              {/* Preview en iframe */}
              <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
                {/* Barra del navegador fake */}
                <div style={{ background: CARD2, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#EF4444', '#EAB308', '#22C55E'].map(c => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7 }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, background: '#080B0F', borderRadius: 6, padding: '5px 14px', fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                    🔒 {form.negocio.toLowerCase().replace(/\s+/g, '')}.com
                  </div>
                  <span style={{ fontSize: 11, color: '#4B5563' }}>Vista previa</span>
                </div>
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
                  title="Vista previa de tu web"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              {/* Info de siguiente paso */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginBottom: 20 }}>
                {[
                  { icon: '⬇️', title: 'Descarga el HTML', desc: 'Haz clic en "Descargar .html" y tendrás el archivo listo para subir a cualquier hosting.' },
                  { icon: '🚀', title: 'Súbela a Netlify gratis', desc: 'Arrastra el archivo a netlify.com/drop y tu web estará online con URL en segundos.' },
                  { icon: '🤖', title: 'Añade el Agente IA', desc: 'Con BQinzagencIA puedes conectar el chatbot de IA a tu nueva web para captar citas automáticamente.', highlight: true },
                ].map((card, i) => (
                  <div key={i} style={{ background: card.highlight ? 'rgba(255,107,0,0.07)' : CARD, border: `1px solid ${card.highlight ? NARANJA_BORDER : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: card.highlight ? NARANJA : '#FAFAF8' }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{card.desc}</div>
                    {card.highlight && (
                      <Link href="/auth/register" style={{ display: 'inline-block', marginTop: 12, background: NARANJA, color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 100, textDecoration: 'none' }}>
                        Añadir Agente IA →
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Código fuente colapsable */}
              <details style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                <summary style={{ padding: '14px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#9CA3AF', userSelect: 'none' }}>
                  {'</>'} Ver código fuente HTML
                </summary>
                <pre style={{ margin: 0, padding: '0 20px 20px', overflowX: 'auto', fontSize: 11, lineHeight: 1.6, color: '#6B7280', maxHeight: 320, overflowY: 'auto' }}>
                  {html}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ── Estilos reutilizables ────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#9CA3AF',
  marginBottom: 8, marginTop: 0, letterSpacing: 0.3,
};

const inputStyle = {
  width: '100%', background: '#1A1E26', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#FAFAF8',
  outline: 'none', marginBottom: 18, boxSizing: 'border-box', transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

function btnStyle(color) {
  return {
    width: '100%', background: color, color: '#fff', border: 'none',
    borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'Syne,sans-serif',
  };
}

const btnSecStyle = {
  background: '#1A1E26', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
};
