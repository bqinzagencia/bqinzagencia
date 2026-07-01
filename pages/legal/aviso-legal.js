// pages/legal/aviso-legal.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function AvisoLegal() {
  return (
    <>
      <Head>
        <title>Aviso Legal — BQinzAgencIA</title>
        <meta name="description" content="Aviso Legal de BQinzAgencIA conforme a la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE)." />
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
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Aviso<br/>Legal</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 22/06/2026 · Versión 1.0</p>
        </div>

        <p>En cumplimiento del deber de información del art. 10 de la <strong style={{color:'#25D366'}}>Ley 34/2002, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE)</strong>, se exponen los siguientes datos:</p>

        <h2>1. Datos del titular</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Titular:</strong> Óscar Borrero Quiñonez (nombre comercial: BQinzAgencIA)</li>
          <li><strong style={{color:'#EFF4FF'}}>NIF:</strong> X848098C</li>
          <li><strong style={{color:'#EFF4FF'}}>Domicilio:</strong> Calle Toledo, C.P. 28005, Madrid, España</li>
          <li><strong style={{color:'#EFF4FF'}}>Correo electrónico:</strong> <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a></li>
          <li><strong style={{color:'#EFF4FF'}}>Naturaleza:</strong> Empresario individual (autónomo)</li>
        </ul>

        <h2>2. Objeto</h2>
        <p>BQinzAgencIA presta servicios de automatización con inteligencia artificial (bots de WhatsApp, agendamiento, catálogos digitales y herramientas asociadas) a través del sitio web bqinzagencia.com (en adelante, "la Web").</p>

        <h2>3. Condiciones de acceso y uso</h2>
        <p>El acceso a la Web es gratuito, salvo el coste de conexión a internet. El uso de la Web implica la aceptación de este Aviso Legal, de la <Link href="/legal/privacidad">Política de Privacidad</Link>, de la <Link href="/legal/cookies">Política de Cookies</Link> y, en su caso, de las <Link href="/legal/condiciones">Condiciones de Contratación</Link>.</p>

        <h2>4. Propiedad intelectual e industrial</h2>
        <p>Los contenidos de la Web (textos, diseño, marca, logotipos, código fuente) son propiedad de BQinzAgencIA o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</p>

        <h2>5. Exclusión de responsabilidad</h2>
        <p>BQinzAgencIA no garantiza la disponibilidad continua de la Web ni de los servicios prestados a través de terceros (WhatsApp/Meta, proveedores de IA, hosting). El usuario es responsable del uso que haga de los servicios contratados, en particular del bot de WhatsApp y de la información que proporcione a sus propios clientes finales.</p>

        <h2>6. Enlaces a terceros</h2>
        <p>La Web puede contener enlaces a sitios de terceros. BQinzAgencIA no se responsabiliza del contenido o políticas de dichos sitios.</p>

        <h2>7. Legislación aplicable</h2>
        <p>Este Aviso Legal se rige por la legislación española. Para cualquier controversia, serán competentes los tribunales que correspondan conforme a la normativa de protección de consumidores, o los de Madrid en su defecto.</p>

        <div style={{marginTop:48,padding:'18px 22px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',margin:0,lineHeight:1.7}}>
            Consulte también nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>, <Link href="/legal/condiciones">Condiciones de Contratación</Link> y <Link href="/legal/cookies">Política de Cookies</Link>.
          </p>
        </div>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/aviso-legal" style={{color:'#25D366'}}>Aviso Legal</Link>
          <Link href="/legal/privacidad" style={{color:'rgba(255,255,255,0.5)'}}>Privacidad</Link>
          <Link href="/legal/condiciones" style={{color:'rgba(255,255,255,0.5)'}}>Condiciones</Link>
          <Link href="/legal/cookies" style={{color:'rgba(255,255,255,0.5)'}}>Cookies</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 BQinzAgencIA · Madrid, España</span>
      </footer>
    </>
  );
}
