// pages/legal/privacidad.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — agencIAme</title>
        <meta name="description" content="Política de Privacidad y Tratamiento de Datos Personales de agencIAme. Cumplimiento Ley 1581 de 2012 Colombia." />
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
        <Link href="/"><span style={{fontFamily:FA,fontSize:20,color:'#EFF4FF',cursor:'pointer'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <Link href="/" style={{fontSize:13,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al inicio
        </Link>
      </nav>

      <div style={{maxWidth:760,margin:'0 auto',padding:'60px 24px 100px'}}>
        <div style={{marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,color:'rgba(37,211,102,0.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>Documento legal</p>
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Política de<br/>Privacidad</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 15 de junio de 2026 · Versión 1.0</p>
        </div>

        <div style={{background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:32}}>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',margin:0,lineHeight:1.7}}>
            Esta Política cumple con la <strong style={{color:'#25D366'}}>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales de Colombia) y el <strong style={{color:'#25D366'}}>Decreto 1377 de 2013</strong>. El Responsable del tratamiento es <strong style={{color:'#EFF4FF'}}>NexoTI</strong>, con domicilio en Cali, Valle del Cauca, Colombia.
          </p>
        </div>

        <h2>1. ¿Quiénes somos?</h2>
        <p><strong style={{color:'#EFF4FF'}}>NexoTI</strong> es la empresa que opera la plataforma <strong style={{color:'#EFF4FF'}}>agencIAme</strong> (agenciame.com), un servicio de automatización con inteligencia artificial para pequeñas y medianas empresas en Colombia y Latinoamérica. Para consultas relacionadas con sus datos personales, puede contactarnos en <a href="mailto:soportesistemas@soporteia.net">soportesistemas@soporteia.net</a>.</p>

        <h2>2. Datos que recopilamos</h2>
        <h3>2.1 Datos del Usuario (empresas que contratan el servicio)</h3>
        <table>
          <thead>
            <tr><th>Dato</th><th>Finalidad</th><th>Base legal</th></tr>
          </thead>
          <tbody>
            <tr><td>Nombre del negocio</td><td>Configuración del bot y panel</td><td>Ejecución del contrato</td></tr>
            <tr><td>Correo electrónico</td><td>Acceso, notificaciones, reportes</td><td>Ejecución del contrato</td></tr>
            <tr><td>Número de WhatsApp</td><td>Vinculación del bot al número</td><td>Ejecución del contrato</td></tr>
            <tr><td>Ciudad e industria</td><td>Personalización del servicio</td><td>Ejecución del contrato</td></tr>
            <tr><td>Datos de pago</td><td>Facturación (procesados por terceros)</td><td>Ejecución del contrato</td></tr>
            <tr><td>Datos de uso (logs)</td><td>Soporte técnico y mejora del servicio</td><td>Interés legítimo</td></tr>
          </tbody>
        </table>

        <h3>2.2 Datos de Usuarios Finales (clientes del negocio)</h3>
        <p>A través del bot de WhatsApp, es posible que se recopilen datos de los clientes finales del Usuario, incluyendo: nombre, número de teléfono de WhatsApp, mensajes de conversación, pedidos realizados y horarios de citas agendadas.</p>
        <p><strong style={{color:'#EFF4FF'}}>Importante:</strong> El Usuario actúa como Responsable del tratamiento de los datos de sus clientes finales. NexoTI actúa como Encargado del tratamiento. El Usuario debe contar con el consentimiento de sus clientes para el uso del bot y debe tener su propia política de privacidad.</p>

        <h3>2.3 Datos técnicos recopilados automáticamente</h3>
        <ul>
          <li>Dirección IP y datos de navegación.</li>
          <li>Tipo de dispositivo y navegador.</li>
          <li>Cookies de sesión y preferencias.</li>
          <li>Registros de actividad en la plataforma.</li>
        </ul>

        <h2>3. ¿Para qué usamos sus datos?</h2>
        <ul>
          <li>Prestar y personalizar los servicios contratados.</li>
          <li>Enviar reportes diarios de actividad del bot por correo electrónico.</li>
          <li>Notificar sobre el consumo del plan y alertas de límite de créditos.</li>
          <li>Enviar comunicaciones de soporte técnico y actualizaciones del servicio.</li>
          <li>Mejorar la calidad del servicio y entrenar modelos de IA (con datos anonimizados).</li>
          <li>Cumplir con obligaciones legales y regulatorias.</li>
          <li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
        </ul>
        <p><strong style={{color:'#EFF4FF'}}>NexoTI NO vende ni comercializa datos personales a terceros.</strong></p>

        <h2>4. Compartición de datos con terceros</h2>
        <p>Para prestar el servicio, compartimos datos con los siguientes proveedores bajo estrictos acuerdos de confidencialidad:</p>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Finalidad</th><th>País</th></tr>
          </thead>
          <tbody>
            <tr><td>OpenAI</td><td>Procesamiento de lenguaje natural (respuestas del bot)</td><td>EE.UU.</td></tr>
            <tr><td>Google Firebase</td><td>Base de datos y autenticación</td><td>EE.UU.</td></tr>
            <tr><td>Vercel</td><td>Hosting de la plataforma</td><td>EE.UU.</td></tr>
            <tr><td>Cloudinary</td><td>Almacenamiento de imágenes del catálogo</td><td>EE.UU.</td></tr>
            <tr><td>Railway</td><td>Servidor de conexión WhatsApp</td><td>EE.UU.</td></tr>
            <tr><td>Meta / WhatsApp</td><td>Envío y recepción de mensajes</td><td>EE.UU.</td></tr>
          </tbody>
        </table>
        <p>Todos estos proveedores se encuentran en Estados Unidos. La transferencia internacional de datos se realiza bajo las garantías establecidas en la legislación colombiana.</p>

        <h2>5. Cookies</h2>
        <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma (sesión de usuario, preferencias) y cookies analíticas para entender cómo se usa el sitio. Al continuar usando agencIAme, acepta el uso de cookies esenciales. Para las analíticas, puede gestionar sus preferencias desde la configuración de su navegador.</p>

        <h2>6. Conservación de los datos</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Datos del Usuario activo:</strong> Durante toda la vigencia del contrato.</li>
          <li><strong style={{color:'#EFF4FF'}}>Tras cancelación:</strong> 12 meses para cumplimiento de obligaciones legales, luego eliminación o anonimización.</li>
          <li><strong style={{color:'#EFF4FF'}}>Conversaciones del bot:</strong> 6 meses desde la fecha de la conversación.</li>
          <li><strong style={{color:'#EFF4FF'}}>Logs técnicos:</strong> 3 meses.</li>
        </ul>

        <h2>7. Sus derechos (Ley 1581 de 2012)</h2>
        <p>Como titular de datos personales, usted tiene los siguientes derechos:</p>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Conocer</strong> los datos que tenemos sobre usted y el uso que les damos.</li>
          <li><strong style={{color:'#EFF4FF'}}>Actualizar</strong> sus datos cuando sean inexactos, incompletos o fragmentados.</li>
          <li><strong style={{color:'#EFF4FF'}}>Rectificar</strong> datos que no correspondan a la realidad.</li>
          <li><strong style={{color:'#EFF4FF'}}>Suprimir</strong> sus datos cuando no sean necesarios para la finalidad del tratamiento (salvo obligación legal de conservarlos).</li>
          <li><strong style={{color:'#EFF4FF'}}>Revocar</strong> el consentimiento otorgado en cualquier momento.</li>
          <li><strong style={{color:'#EFF4FF'}}>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) de Colombia.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, envíe su solicitud a <a href="mailto:soportesistemas@soporteia.net">soportesistemas@soporteia.net</a> indicando su nombre, número de identificación y el derecho que desea ejercer. Responderemos en un plazo máximo de <strong style={{color:'#EFF4FF'}}>10 días hábiles</strong>.</p>

        <h2>8. Seguridad</h2>
        <p>Implementamos medidas técnicas y organizativas para proteger sus datos, incluyendo: cifrado en tránsito (HTTPS/TLS), autenticación segura, control de acceso por roles, copias de seguridad periódicas y monitoreo de actividad sospechosa. Sin embargo, ningún sistema es 100% seguro. En caso de brecha de seguridad que afecte sus datos, le notificaremos en el menor tiempo posible.</p>

        <h2>9. Menores de edad</h2>
        <p>agencIAme no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que hemos recibido datos de un menor sin el consentimiento de sus padres o tutores, los eliminaremos de inmediato.</p>

        <h2>10. Cambios a esta política</h2>
        <p>Podemos actualizar esta Política de Privacidad periódicamente. Los cambios relevantes serán notificados por correo electrónico con al menos 15 días de anticipación. La versión vigente siempre estará disponible en <a href="/legal/privacidad">agenciame.com/legal/privacidad</a>.</p>

        <h2>11. Contacto y reclamaciones</h2>
        <p>Para ejercer sus derechos, hacer consultas o presentar reclamaciones sobre el tratamiento de sus datos:</p>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Correo:</strong> <a href="mailto:soportesistemas@soporteia.net">soportesistemas@soporteia.net</a></li>
          <li><strong style={{color:'#EFF4FF'}}>WhatsApp:</strong> <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer">310 505 6616</a></li>
          <li><strong style={{color:'#EFF4FF'}}>Autoridad de control:</strong> <a href="https://www.sic.gov.co" target="_blank" rel="noreferrer">Superintendencia de Industria y Comercio (SIC)</a></li>
        </ul>

        <div style={{marginTop:48,padding:'18px 22px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',margin:0,lineHeight:1.7}}>
            También puede consultar nuestros <Link href="/legal/terminos">Términos y Condiciones</Link>. Ante cualquier duda sobre el tratamiento de sus datos, contáctenos antes de usar el servicio.
          </p>
        </div>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/terminos" style={{color:'rgba(255,255,255,0.5)'}}>Términos</Link>
          <Link href="/legal/privacidad" style={{color:'#25D366'}}>Privacidad</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 NexoTI · Cali, Colombia</span>
      </footer>
    </>
  );
}
