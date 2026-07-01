// pages/legal/privacidad.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — BQinzAgencIA</title>
        <meta name="description" content="Política de Privacidad de BQinzAgencIA. Cumplimiento RGPD (UE 2016/679) y LOPDGDD (España)." />
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06080D;color:#C8D0E0;font-family:${F};min-height:100vh}
        a{color:#25D366;text-decoration:none}
        a:hover{text-decoration:underline}
        h2{font-family:${FA};font-weight:400;color:#EFF4FF;margin:48px 0 16px;font-size:26px;letter-spacing:-0.5px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px}
        h3{font-family:${F};font-weight:600;color:#EFF4FF;margin:28px 0 10px;font-size:16px}
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
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Política de<br/>Privacidad</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 22/06/2026 · Versión 1.0</p>
        </div>

        <div style={{background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:32}}>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',margin:0,lineHeight:1.7}}>
            Esta Política cumple con el <strong style={{color:'#25D366'}}>Reglamento (UE) 2016/679 (RGPD)</strong> y la <strong style={{color:'#25D366'}}>Ley Orgánica 3/2018 (LOPDGDD)</strong>. El Responsable del tratamiento es <strong style={{color:'#EFF4FF'}}>Óscar Borrero Quiñonez</strong>, operando bajo el nombre comercial <strong style={{color:'#EFF4FF'}}>BQinzAgencIA</strong> (NIF X848098C), con domicilio en Calle Toledo, C.P. 28005, Madrid, España.
          </p>
        </div>

        <h2>1. ¿Quiénes somos?</h2>
        <p><strong style={{color:'#EFF4FF'}}>BQinzAgencIA</strong> es el nombre comercial bajo el que Óscar Borrero Quiñonez opera esta plataforma de automatización con inteligencia artificial para negocios en España. Para consultas sobre tratamiento de datos personales, puede contactarnos en <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a>.</p>
        <p>NIF X848098C · Calle Toledo, C.P. 28005, Madrid, España · Empresario individual (autónomo)</p>

        <h2>2. Datos que recopilamos</h2>
        <h3>2.1 Datos del Cliente (negocios que contratan el servicio)</h3>
        <table>
          <thead><tr><th>Dato</th><th>Finalidad</th><th>Base legal (RGPD)</th></tr></thead>
          <tbody>
            <tr><td>Nombre del negocio y de contacto</td><td>Configuración del bot y del panel</td><td>Art. 6.1.b — ejecución de contrato</td></tr>
            <tr><td>Correo electrónico</td><td>Acceso, notificaciones, reportes</td><td>Art. 6.1.b — ejecución de contrato</td></tr>
            <tr><td>Número de WhatsApp</td><td>Vinculación del bot al número</td><td>Art. 6.1.b — ejecución de contrato</td></tr>
            <tr><td>Ciudad y tipo de negocio</td><td>Personalización del servicio</td><td>Art. 6.1.b — ejecución de contrato</td></tr>
            <tr><td>Datos de facturación</td><td>Facturación y obligaciones fiscales</td><td>Art. 6.1.c — obligación legal</td></tr>
            <tr><td>Datos de uso (logs)</td><td>Soporte técnico y mejora del servicio</td><td>Art. 6.1.f — interés legítimo</td></tr>
          </tbody>
        </table>

        <h3>2.2 Datos de los clientes finales (usuarios que escriben al bot de WhatsApp)</h3>
        <p>El bot de WhatsApp puede recibir datos de los clientes finales del Cliente, como: nombre, número de teléfono, contenido de los mensajes, pedidos y citas. <strong style={{color:'#EFF4FF'}}>El Cliente actúa como Responsable del tratamiento de estos datos; BQinzAgencIA actúa como Encargado del tratamiento</strong> conforme al art. 28 RGPD. El Cliente es responsable de informar y, en su caso, recabar el consentimiento de sus propios clientes finales.</p>

        <h3>2.3 Datos técnicos</h3>
        <ul>
          <li>Dirección IP y datos de navegación.</li>
          <li>Tipo de dispositivo y navegador.</li>
          <li>Cookies (ver <Link href="/legal/cookies">Política de Cookies</Link>).</li>
        </ul>

        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Prestar y personalizar los servicios contratados (planes Básico, Estándar y Pro).</li>
          <li>Gestionar el alta, facturación y cobro de la suscripción.</li>
          <li>Enviar comunicaciones de soporte técnico y avisos del servicio.</li>
          <li>Cumplir obligaciones legales y fiscales.</li>
          <li>Prevenir fraude y garantizar la seguridad de la plataforma.</li>
        </ul>
        <p><strong style={{color:'#EFF4FF'}}>BQinzAgencIA no vende ni cede datos personales a terceros</strong> con fines comerciales ajenos a la prestación del servicio.</p>

        <h2>4. Encargados del tratamiento y transferencias internacionales</h2>
        <p>Para prestar el servicio recurrimos a los siguientes proveedores, bajo contrato de encargo de tratamiento (art. 28 RGPD):</p>
        <table>
          <thead><tr><th>Proveedor</th><th>Finalidad</th><th>Ubicación / garantía</th></tr></thead>
          <tbody>
            <tr><td>OpenAI</td><td>Procesamiento de lenguaje natural del bot</td><td>EE.UU. — Cláusulas Contractuales Tipo</td></tr>
            <tr><td>Google Firebase</td><td>Base de datos y autenticación</td><td>UE/EE.UU. — Cláusulas Contractuales Tipo</td></tr>
            <tr><td>Vercel</td><td>Hosting de la plataforma</td><td>EE.UU. — Cláusulas Contractuales Tipo</td></tr>
            <tr><td>Meta / WhatsApp</td><td>Envío y recepción de mensajes</td><td>UE/EE.UU.</td></tr>
            <tr><td>[RELLENAR: pasarela de pago]</td><td>Procesamiento de pagos (Bizum/tarjeta)</td><td>[RELLENAR]</td></tr>
          </tbody>
        </table>

        <h2>5. Conservación de los datos</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Datos del Cliente activo:</strong> durante la vigencia del contrato.</li>
          <li><strong style={{color:'#EFF4FF'}}>Tras la baja:</strong> los plazos exigidos por la normativa fiscal y mercantil española (en general, hasta 6 años a efectos contables/fiscales).</li>
          <li><strong style={{color:'#EFF4FF'}}>Conversaciones del bot:</strong> [RELLENAR: ej. 6 meses] desde la fecha de la conversación.</li>
        </ul>

        <h2>6. Sus derechos (RGPD)</h2>
        <p>Puede ejercer en cualquier momento los derechos de <strong style={{color:'#EFF4FF'}}>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</strong>, así como retirar su consentimiento, escribiendo a <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a>. Responderemos en el plazo máximo de <strong style={{color:'#EFF4FF'}}>un mes</strong>.</p>
        <p>Si considera que no hemos atendido correctamente sus derechos, puede presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos (AEPD)</a>.</p>

        <h2>7. Seguridad</h2>
        <p>Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS/TLS), control de acceso, copias de seguridad y monitorización. Ningún sistema es 100% seguro; en caso de violación de seguridad relevante, se notificará conforme al art. 34 RGPD.</p>

        <h2>8. Menores de edad</h2>
        <p>Nuestros servicios no están dirigidos a menores de 18 años y no recopilamos intencionadamente sus datos.</p>

        <h2>9. Cambios a esta política</h2>
        <p>Podemos actualizar esta Política. Los cambios relevantes se notificarán por correo con antelación razonable. La versión vigente está siempre disponible en <Link href="/legal/privacidad">/legal/privacidad</Link>.</p>

        <h2>10. Contacto</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Responsable:</strong> Óscar Borrero Quiñonez (BQinzAgencIA)</li>
          <li><strong style={{color:'#EFF4FF'}}>Correo:</strong> <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a></li>
          <li><strong style={{color:'#EFF4FF'}}>Domicilio:</strong> Calle Toledo, C.P. 28005, Madrid, España</li>
          <li><strong style={{color:'#EFF4FF'}}>Autoridad de control:</strong> <a href="https://www.aepd.es" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a></li>
        </ul>

        <div style={{marginTop:48,padding:'18px 22px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',margin:0,lineHeight:1.7}}>
            Consulte también nuestro <Link href="/legal/aviso-legal">Aviso Legal</Link>, <Link href="/legal/condiciones">Condiciones de Contratación</Link> y <Link href="/legal/cookies">Política de Cookies</Link>.
          </p>
        </div>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/aviso-legal" style={{color:'rgba(255,255,255,0.5)'}}>Aviso Legal</Link>
          <Link href="/legal/privacidad" style={{color:'#25D366'}}>Privacidad</Link>
          <Link href="/legal/condiciones" style={{color:'rgba(255,255,255,0.5)'}}>Condiciones</Link>
          <Link href="/legal/cookies" style={{color:'rgba(255,255,255,0.5)'}}>Cookies</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 BQinzAgencIA · Madrid, España</span>
      </footer>
    </>
  );
}
