// pages/dashboard/widget.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const F = "'Inter', system-ui, sans-serif";
const ACCENT = '#2B6AFF';
const WA_LINK = 'https://wa.me/573105056616?text=Hola%20agencIAme%2C%20necesito%20ayuda%20para%20instalar%20el%20chat%20en%20mi%20p%C3%A1gina%20web';

const PASOS_TIPOS = {
  html: [
    { n: '1', titulo: 'Copia el código', desc: 'Haz clic en "Copiar código" arriba.' },
    { n: '2', titulo: 'Abre tu página web', desc: 'Abre el archivo index.html con Bloc de notas o tu editor.' },
    { n: '3', titulo: 'Busca </body>', desc: 'Presiona Ctrl+F y escribe </body> para encontrarlo.' },
    { n: '4', titulo: 'Pega el código', desc: 'Pega justo encima de </body>. Guarda el archivo.' },
    { n: '5', titulo: 'Sube a tu servidor', desc: 'Reemplaza el archivo en tu hosting (cPanel, FTP, etc.).' },
    { n: '6', titulo: 'Verifica', desc: 'Abre tu web — debe aparecer el botón 💬 abajo a la derecha.' },
  ],
  wordpress: [
    { n: '1', titulo: 'Copia el código', desc: 'Haz clic en "Copiar código" arriba.' },
    { n: '2', titulo: 'Entra al panel WordPress', desc: 'Abre tu-dominio.com/wp-admin e inicia sesión.' },
    { n: '3', titulo: 'Ve a Apariencia → Editor', desc: 'En el menú izquierdo: Apariencia → Editor de temas.' },
    { n: '4', titulo: 'Abre footer.php', desc: 'En el listado de archivos a la derecha, busca footer.php.' },
    { n: '5', titulo: 'Pega el código', desc: 'Pega justo antes de </body>. Clic en "Actualizar archivo".' },
    { n: '6', titulo: 'Verifica', desc: 'Abre tu web — debe aparecer el botón 💬 abajo a la derecha.' },
  ],
  wix: [
    { n: '1', titulo: 'Copia el código', desc: 'Haz clic en "Copiar código" arriba.' },
    { n: '2', titulo: 'Abre el editor de Wix', desc: 'Entra a wix.com y abre el editor de tu sitio.' },
    { n: '3', titulo: 'Ve a Configuración', desc: 'Clic en el menú superior → Configuración.' },
    { n: '4', titulo: 'Código personalizado', desc: 'Busca "Herramientas avanzadas" → "Código personalizado".' },
    { n: '5', titulo: 'Agrega el código', desc: 'Clic en "+", pega el código, selecciona "Pie de página — todas las páginas".' },
    { n: '6', titulo: 'Publica y verifica', desc: 'Clic en Publicar — aparece el botón 💬 en tu web.' },
  ],
  shopify: [
    { n: '1', titulo: 'Copia el código', desc: 'Haz clic en "Copiar código" arriba.' },
    { n: '2', titulo: 'Panel Shopify', desc: 'Entra a tu-tienda.myshopify.com/admin.' },
    { n: '3', titulo: 'Tienda en línea → Temas', desc: 'En el menú: Tienda en línea → Temas.' },
    { n: '4', titulo: 'Editar código', desc: 'Clic en Acciones → Editar código del tema.' },
    { n: '5', titulo: 'Abre theme.liquid', desc: 'Busca el archivo theme.liquid, pega antes de </body>.' },
    { n: '6', titulo: 'Guarda y verifica', desc: 'Clic en Guardar — aparece el botón 💬 en tu tienda.' },
  ],
};

export default function Widget() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);
  const [plataforma, setPlataforma] = useState('html');

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const nombre    = empresa.nombreEmpresa || 'Mi Negocio';
  const empresaId = empresa.id; // CORRECTO: empresa.id no user.uid

  const codigos = {
    html: `<!-- Chat IA — ${nombre} | agencIAme -->
<script>
  window.NEXOIA_ID    = "${empresaId}";
  window.NEXOIA_COLOR = "#FF6B00";
  window.NEXOIA_NAME  = "${nombre}";
</script>
<script src="https://agenciame.com/widget.js" async></script>`,

    wordpress: `<?php
// Pega esto al final de functions.php de tu tema:
function agenciame_widget() { ?>
  <script>
    window.NEXOIA_ID    = "<?php echo '${empresaId}'; ?>";
    window.NEXOIA_COLOR = "#FF6B00";
    window.NEXOIA_NAME  = "<?php echo '${nombre}'; ?>";
  </script>
  <script src="https://agenciame.com/widget.js" async></script>
<?php }
add_action('wp_footer', 'agenciame_widget');`,

    wix: `<!-- Chat IA — ${nombre} | agencIAme -->
<script>
  window.NEXOIA_ID    = "${empresaId}";
  window.NEXOIA_COLOR = "#FF6B00";
  window.NEXOIA_NAME  = "${nombre}";
</script>
<script src="https://agenciame.com/widget.js" async></script>`,

    shopify: `<!-- Chat IA — ${nombre} | agencIAme -->
<script>
  window.NEXOIA_ID    = "${empresaId}";
  window.NEXOIA_COLOR = "#FF6B00";
  window.NEXOIA_NAME  = "${nombre}";
</script>
<script src="https://agenciame.com/widget.js" async></script>`,
  };

  const copiar = () => {
    navigator.clipboard.writeText(codigos[plataforma]);
    setCopiado(true);
    toast.success('Código copiado');
    setTimeout(() => setCopiado(false), 2500);
  };

  const PLATAFORMAS = [
    { key: 'html',      label: 'HTML' },
    { key: 'wordpress', label: 'WordPress' },
    { key: 'wix',       label: 'Wix' },
    { key: 'shopify',   label: 'Shopify' },
  ];

  const card = {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 28,
    marginBottom: 20,
  };

  return (
    <>
      <Head><title>Integra Chat IA a tu Web — agencIAme</title></Head>
      <DashboardLayout title="Integra Chat IA a tu Web">

        {/* INTRO */}
        <p style={{ fontFamily: F, color: '#8A9BB5', fontSize: 15, marginBottom: 32, maxWidth: 620, lineHeight: 1.65 }}>
          Activa el chat de IA en tu página web existente. Tus visitantes pueden hablar con tu agente sin salir de tu sitio — 24 horas, 7 días a la semana.
        </p>

        {/* SELECTOR DE PLATAFORMA + CÓDIGO */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#EFF4FF', margin: 0 }}>
              Código de instalación
            </h3>
            {/* Tabs plataforma */}
            <div style={{ display: 'flex', gap: 4, background: '#0A0F1E', borderRadius: 10, padding: 4 }}>
              {PLATAFORMAS.map(p => (
                <button key={p.key} onClick={() => setPlataforma(p.key)}
                  style={{ background: plataforma === p.key ? ACCENT : 'transparent', color: plataforma === p.key ? '#fff' : '#6B7A99', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', fontFamily: F }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#0A0F1E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', fontSize: 12, lineHeight: 1.9, color: '#6DA4FF', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {codigos[plataforma]}
            </pre>
            <button onClick={copiar}
              style={{ position: 'absolute', top: 12, right: 12, background: copiado ? '#10B981' : 'rgba(43,106,255,0.2)', color: copiado ? '#fff' : '#6DA4FF', border: `1px solid ${copiado ? '#10B981' : 'rgba(43,106,255,0.3)'}`, borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: F }}>
              {copiado ? '✓ Copiado' : 'Copiar código'}
            </button>
          </div>

          <p style={{ fontFamily: F, fontSize: 12, color: '#4B6080', marginTop: 14 }}>
            Este código ya contiene el ID único de <strong style={{ color: '#8A9BB5' }}>{nombre}</strong>. No lo modifiques.
          </p>
        </div>

        {/* GUÍA PASO A PASO */}
        <div style={card}>
          <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#EFF4FF', marginBottom: 8 }}>
            Guía de implementación — {PLATAFORMAS.find(p => p.key === plataforma)?.label}
          </h3>
          <p style={{ fontFamily: F, fontSize: 13, color: '#6B7A99', marginBottom: 24 }}>
            Sigue estos pasos en orden. Si tienes dudas en alguno, contáctanos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PASOS_TIPOS[plataforma].map((paso, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: i < 5 ? 20 : 0, position: 'relative' }}>
                {/* Línea conectora */}
                {i < 5 && (
                  <div style={{ position: 'absolute', left: 18, top: 36, width: 2, height: 'calc(100% - 16px)', background: 'rgba(43,106,255,0.15)', borderRadius: 1 }} />
                )}
                {/* Número */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 5 ? 'rgba(16,185,129,0.15)' : 'rgba(43,106,255,0.12)', border: `1px solid ${i === 5 ? 'rgba(16,185,129,0.4)' : 'rgba(43,106,255,0.3)'}`, color: i === 5 ? '#34D399' : '#6DA4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 800, fontSize: 13, flexShrink: 0, zIndex: 1 }}>
                  {i === 5 ? '✓' : paso.n}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: '#EFF4FF', marginBottom: 3 }}>{paso.titulo}</div>
                  <div style={{ fontFamily: F, fontSize: 13, color: '#6B7A99', lineHeight: 1.55 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEMAS COMUNES */}
        <div style={card}>
          <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#EFF4FF', marginBottom: 20 }}>
            ¿El botón no aparece? Revisa esto
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { pregunta: 'El botón no aparece en la página', respuesta: 'El código no quedó bien pegado. Asegúrate de que esté justo antes de </body>, no después de </html>.' },
              { pregunta: 'Aparece pero dice "Error de conexión"', respuesta: 'El código fue modificado y el ID quedó incompleto. Copia el código de nuevo usando el botón "Copiar código".' },
              { pregunta: 'Lo instalé pero no veo cambios', respuesta: 'Borra el caché del navegador con Ctrl + Shift + R, o prueba en modo incógnito.' },
              { pregunta: 'El botón queda tapado por el de WhatsApp', respuesta: 'Agrega window.NEXOIA_BOTTOM = "90px"; antes del script para subir el botón del chat.' },
              { pregunta: 'El agente responde cosas incorrectas', respuesta: 'Completa la información en: Crea tu Web → Configuración Web. Entre más completa, mejor responde.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0A0F1E', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: '#C4D0E3', marginBottom: 4 }}>• {item.pregunta}</div>
                <div style={{ fontFamily: F, fontSize: 13, color: '#6B7A99', lineHeight: 1.55 }}>{item.respuesta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — NOSOTROS LO HACEMOS POR TI */}
        <div style={{ background: 'linear-gradient(135deg, rgba(43,106,255,0.12) 0%, rgba(255,107,0,0.08) 100%)', border: '1px solid rgba(43,106,255,0.25)', borderRadius: 20, padding: '32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF6B00', marginBottom: 8 }}>
              Servicio de implementación
            </div>
            <h3 style={{ fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: '#EFF4FF', marginBottom: 10, lineHeight: 1.2 }}>
              ¿Prefieres que lo hagamos nosotros?
            </h3>
            <p style={{ fontFamily: F, fontSize: 14, color: '#8A9BB5', lineHeight: 1.65, maxWidth: 460 }}>
              Si no tienes acceso a los archivos de tu página o no sabes cómo hacerlo, nosotros te instalamos el chat en menos de 10 minutos. Solo contáctanos y dinos el tipo de página que tienes.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                'Instalación remota incluida',
                'Compatible con cualquier plataforma',
                'Sin costo adicional en el primer mes',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: F, fontSize: 13, color: '#8A9BB5' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <a href={WA_LINK} target="_blank" rel="noreferrer"
              style={{ background: '#25D366', color: '#fff', borderRadius: 100, padding: '13px 28px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: F, fontWeight: 800, fontSize: 14, boxShadow: '0 6px 24px rgba(37,211,102,0.4)', whiteSpace: 'nowrap' }}>
              💬 Instálalo por WhatsApp
            </a>
            <a href="mailto:soportesistemas@soporteia.net?subject=Instalación chat agencIAme"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#C4D0E3', borderRadius: 100, padding: '12px 28px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: F, fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap', justifyContent: 'center' }}>
              ✉️ Enviar por email
            </a>
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
