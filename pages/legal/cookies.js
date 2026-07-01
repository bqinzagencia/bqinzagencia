// pages/legal/cookies.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Política de Cookies — BQinzAgencIA</title>
        <meta name="description" content="Política de Cookies de BQinzAgencIA conforme a la LSSI-CE y el RGPD." />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06080D;color:#C8D0E0;font-family:${F};min-height:100vh}
        a{color:#25D366;text-decoration:none}
        a:hover{text-decoration:underline}
        h2{font-family:${FA};font-weight:400;color:#EFF4FF;margin:48px 0 16px;font-size:26px;letter-spacing:-0.5px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px}
        p{line-height:1.85;margin-bottom:14px;font-size:14px}
        ul{padding-left:22px;margin-bottom:14px}
        li{line-height:1.8;font-size:14px;margin-bottom:4px}
        table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px}
        th{background:rgba(37,211,102,0.08);color:#25D366;padding:10px 14px;text-align:left;font-weight:600;border:1px solid rgba(255,255,255,0.07)}
        td{padding:10px 14px;border:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.6);vertical-align:top}
      `}}/>

      <nav style={{background:'rgba(6,8,13,0.98)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 40px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:20,color:'#EFF4FF',cursor:'pointer'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <Link href="/" style={{fontSize:13,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al inicio
        </Link>
      </nav>

      <div style={{maxWidth:760,margin:'0 auto',padding:'60px 24px 100px'}}>
        <div style={{marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,color:'rgba(37,211,102,0.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>Documento legal</p>
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Política de<br/>Cookies</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 22/06/2026 · Versión 1.0</p>
        </div>

        <p>Esta Política de Cookies cumple con el art. 22.2 de la <strong style={{color:'#25D366'}}>LSSI-CE</strong> y el <strong style={{color:'#25D366'}}>RGPD</strong>. Una cookie es un fichero que se descarga en su dispositivo al acceder a determinadas páginas web, que permite almacenar y recuperar información sobre la navegación.</p>

        <h2>1. Tipos de cookies utilizadas</h2>
        <table>
          <thead><tr><th>Tipo</th><th>Finalidad</th><th>¿Requiere consentimiento?</th></tr></thead>
          <tbody>
            <tr><td>Técnicas / esenciales</td><td>Sesión de usuario, seguridad, balanceo de carga</td><td>No</td></tr>
            <tr><td>Preferencias</td><td>Recordar idioma o configuración elegida</td><td>No, si son estrictamente necesarias; sí en caso contrario</td></tr>
            <tr><td>Analíticas</td><td>Medición de uso del sitio [RELLENAR: ej. Google Analytics]</td><td>Sí</td></tr>
            <tr><td>De terceros</td><td>[RELLENAR: ej. WhatsApp Business, Vercel Analytics]</td><td>Sí, salvo que sean técnicas</td></tr>
          </tbody>
        </table>

        <h2>2. Gestión del consentimiento</h2>
        <p>Al acceder a la Web por primera vez, se muestra un aviso de cookies donde puede <strong style={{color:'#EFF4FF'}}>aceptar, rechazar o configurar</strong> las cookies no esenciales. Puede modificar su decisión en cualquier momento desde [RELLENAR: enlace/botón "Configurar cookies" en el sitio].</p>

        <h2>3. Cómo deshabilitar las cookies desde el navegador</h2>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noreferrer">Microsoft Edge</a></li>
        </ul>

        <h2>4. Más información</h2>
        <p>Para conocer cómo tratamos los datos personales asociados a las cookies, consulte nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>.</p>

        <h2>5. Contacto</h2>
        <p>Para cualquier duda sobre esta Política, escriba a <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a>.</p>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/aviso-legal" style={{color:'rgba(255,255,255,0.5)'}}>Aviso Legal</Link>
          <Link href="/legal/privacidad" style={{color:'rgba(255,255,255,0.5)'}}>Privacidad</Link>
          <Link href="/legal/condiciones" style={{color:'rgba(255,255,255,0.5)'}}>Condiciones</Link>
          <Link href="/legal/cookies" style={{color:'#25D366'}}>Cookies</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 BQinzAgencIA · Madrid, España</span>
      </footer>
    </>
  );
}
