// pages/dashboard/widget.js
// Panel de integracion del widget embebible — NEXOIA

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Widget() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [tab, setTab] = useState('html');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const color = '#00E5A0';
  const nombre = empresa.nombreEmpresa || 'Asistente';
  const empresaId = user.uid;

  const codigoHTML = `<!-- Widget NEXOIA — ${nombre} -->
<script>
  window.NEXOIA_ID    = "${empresaId}";
  window.NEXOIA_COLOR = "${color}";
  window.NEXOIA_NAME  = "${nombre}";
</script>
<script src="https://nexoia-eight.vercel.app/widget.js" async></script>`;

  const codigoWP = `// Pega esto en functions.php de tu tema WordPress:
function nexoia_widget() { ?>
  <script>
    window.NEXOIA_ID    = "<?php echo '${empresaId}'; ?>";
    window.NEXOIA_COLOR = "${color}";
    window.NEXOIA_NAME  = "${nombre}";
  </script>
  <script src="https://nexoia-eight.vercel.app/widget.js" async></script>
<?php }
add_action('wp_footer', 'nexoia_widget');`;

  const codigoReact = `// Pega esto en tu componente raiz (App.js o _app.js):
useEffect(() => {
  window.NEXOIA_ID    = "${empresaId}";
  window.NEXOIA_COLOR = "${color}";
  window.NEXOIA_NAME  = "${nombre}";
  const s = document.createElement('script');
  s.src = 'https://nexoia-eight.vercel.app/widget.js';
  s.async = true;
  document.body.appendChild(s);
}, []);`;

  const codigos = { html: codigoHTML, wordpress: codigoWP, react: codigoReact };

  const copiar = () => {
    navigator.clipboard.writeText(codigos[tab]);
    setCopiado(true);
    toast.success('Código copiado ✅');
    setTimeout(() => setCopiado(false), 2000);
  };

  const card = { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 24 };

  return (
    <>
      <Head><title>Integra Chat IA a tu Web — agencIAme</title></Head>
      <DashboardLayout title="Integra Chat IA a tu Web">

        <p style={{ color: 'var(--gray5)', marginBottom: 32, fontSize: 15, maxWidth: 600 }}>
          Integra el chat de IA en cualquier sitio web existente con solo 3 líneas de código. Tus clientes pueden chatear con el agente sin salir de tu página.
        </p>

        {/* Preview */}
        <div style={{ ...card, background: 'linear-gradient(135deg, rgba(0,229,160,0.05) 0%, transparent 100%)', border: '1px solid rgba(0,229,160,0.15)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>🎯 ¿Cómo funciona?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
            {[
              { n: '1', titulo: 'Copia el código', desc: 'Selecciona tu plataforma y copia el snippet de instalación.' },
              { n: '2', titulo: 'Pégalo en tu web', desc: 'Agrega el código antes del cierre </body> de tu página.' },
              { n: '3', titulo: '¡Listo!', desc: 'El botón de chat aparece automáticamente en tu sitio web.' },
            ].map((paso, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{paso.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{paso.titulo}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray5)', lineHeight: 1.5 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tu ID */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🔑 Tu ID de empresa</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, background: 'var(--gray2)', borderRadius: 10, padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', wordBreak: 'break-all' }}>
              {empresaId}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(empresaId); toast.success('ID copiado'); }}>
              📋 Copiar
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 10 }}>Este ID identifica tu negocio. Nunca lo compartas con personas no autorizadas.</p>
        </div>

        {/* Codigo */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{'</>'} Código de instalación</h3>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--gray2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {[
              { key: 'html', label: '🌐 HTML' },
              { key: 'wordpress', label: '🔵 WordPress' },
              { key: 'react', label: '⚛️ React/Next.js' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ background: tab === t.key ? 'var(--accent)' : 'transparent', color: tab === t.key ? '#000' : 'var(--gray5)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div style={{ position: 'relative' }}>
            <pre style={{ background: 'var(--gray2)', borderRadius: 12, padding: '20px 24px', fontSize: 12, lineHeight: 1.8, color: '#A8D8A8', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: '1px solid rgba(255,255,255,0.06)' }}>
              {codigos[tab]}
            </pre>
            <button onClick={copiar}
              style={{ position: 'absolute', top: 12, right: 12, background: copiado ? 'var(--accent)' : 'rgba(255,255,255,0.08)', color: copiado ? '#000' : 'var(--gray6)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {copiado ? '✅ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Personalización */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>🎨 Personalización</h3>
          <p style={{ color: 'var(--gray5)', fontSize: 14, marginBottom: 20 }}>Puedes cambiar el color del widget agregando esta variable antes del script:</p>
          <div style={{ background: 'var(--gray2)', borderRadius: 12, padding: '16px 20px', fontFamily: 'monospace', fontSize: 13, color: '#A8D8A8', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            {'window.NEXOIA_COLOR = "#EC4899"; // Rosa peluquería'}<br/>
            {'window.NEXOIA_COLOR = "#F59E0B"; // Naranja taller'}<br/>
            {'window.NEXOIA_COLOR = "#3B82F6"; // Azul inmobiliaria'}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { color: '#00E5A0', label: 'Verde' },
              { color: '#EC4899', label: 'Rosa' },
              { color: '#F59E0B', label: 'Naranja' },
              { color: '#3B82F6', label: 'Azul' },
              { color: '#8B5CF6', label: 'Morado' },
              { color: '#EF4444', label: 'Rojo' },
            ].map(c => (
              <div key={c.color} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray2)', borderRadius: 100, padding: '6px 14px' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.color }} />
                <span style={{ fontSize: 12, color: 'var(--gray6)' }}>{c.label}: {c.color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verificacion */}
        <div style={{ ...card, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>✅ Verifica la instalación</h3>
          <p style={{ color: 'var(--gray5)', fontSize: 14, lineHeight: 1.6 }}>
            Después de instalar el widget, abre tu sitio web y deberías ver un botón 💬 en la esquina inferior derecha. Si no aparece, verifica que el código esté correctamente pegado antes del <code style={{ background: 'var(--gray2)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{'</body>'}</code>.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <a href={`https://nexoia-eight.vercel.app/api/widget-chat`} target="_blank" rel="noopener"
              className="btn btn-ghost btn-sm">
              🔍 Verificar API
            </a>
            <button className="btn btn-accent btn-sm" onClick={() => router.push('/dashboard/conocimiento')}>
              🧠 Configurar conocimiento
            </button>
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
