// pages/legal/terminos.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function Terminos() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones — agencIAme</title>
        <meta name="description" content="Términos y Condiciones de uso de agencIAme y WasapBot." />
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
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Términos y<br/>Condiciones</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 15 de junio de 2026 · Versión 1.0</p>
        </div>

        <p>Bienvenido a <strong style={{color:'#EFF4FF'}}>agencIAme</strong>, plataforma de automatización con inteligencia artificial operada por <strong style={{color:'#EFF4FF'}}>NexoTI</strong>, con domicilio en Cali, Valle del Cauca, Colombia. Al acceder y utilizar nuestros servicios, incluyendo <strong style={{color:'#EFF4FF'}}>WasapBot</strong>, usted acepta de forma expresa estos Términos y Condiciones.</p>

        <h2>1. Definiciones</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Plataforma:</strong> El sitio web agenciame.com y todos sus servicios asociados.</li>
          <li><strong style={{color:'#EFF4FF'}}>WasapBot:</strong> Servicio de automatización de WhatsApp con IA ofrecido por agencIAme.</li>
          <li><strong style={{color:'#EFF4FF'}}>Usuario / Cliente:</strong> Persona natural o jurídica que se registre o use la Plataforma.</li>
          <li><strong style={{color:'#EFF4FF'}}>Usuario Final:</strong> Clientes del Usuario que interactúan con el bot de WhatsApp.</li>
          <li><strong style={{color:'#EFF4FF'}}>Créditos IA:</strong> Unidad de consumo del servicio de procesamiento de lenguaje natural.</li>
        </ul>

        <h2>2. Descripción del servicio</h2>
        <p>agencIAme ofrece herramientas de automatización basadas en IA que incluyen: bot de WhatsApp entrenado con la información del negocio, agendamiento automático de citas, catálogo digital interactivo, gestión de pedidos e inventario, reportes de ventas, panel de administración web y broadcasts masivos a clientes. Los servicios se prestan como <strong style={{color:'#EFF4FF'}}>Software como Servicio (SaaS)</strong> bajo suscripción mensual.</p>

        <h2>3. Registro y cuenta</h2>
        <p>El Usuario debe crear una cuenta con información veraz y actualizada. Es responsable de mantener la confidencialidad de sus credenciales, de todas las actividades realizadas desde su cuenta y de notificar a NexoTI ante cualquier uso no autorizado. NexoTI puede suspender cuentas con información falsa o que incumplan estos términos.</p>

        <h2>4. Planes y pagos</h2>
        <h3>4.1 Planes disponibles</h3>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Básico:</strong> $189.000 COP/mes — ~500 conversaciones, 50.000 créditos IA.</li>
          <li><strong style={{color:'#EFF4FF'}}>Estándar:</strong> $390.000 COP/mes — ~1.500 conversaciones, 150.000 créditos IA.</li>
          <li><strong style={{color:'#EFF4FF'}}>Pro:</strong> $690.000 COP/mes — ~4.000 conversaciones, 400.000 créditos IA.</li>
        </ul>
        <h3>4.2 Facturación</h3>
        <p>Los pagos son mensuales, por adelantado, en pesos colombianos (COP) con IVA incluido. El plan se activa al confirmar el pago. Al agotar el 100% de créditos, el bot responde con mensaje de servicio no disponible hasta la renovación.</p>
        <h3>4.3 Cambios de precio</h3>
        <p>NexoTI podrá modificar los precios notificando al Usuario con al menos 30 días de anticipación. El Usuario podrá cancelar antes de que el nuevo precio entre en vigor.</p>

        <h2>5. Cancelación y reembolsos</h2>
        <p>El Usuario puede cancelar su suscripción en cualquier momento sin permanencia mínima. <strong style={{color:'#EFF4FF'}}>Política de reembolso:</strong> Si el Usuario cancela dentro de los primeros 7 días desde la activación de su primer plan y el servicio no funcionó correctamente por causas imputables a NexoTI, se realizará el reembolso total. Después de este período no se realizan reembolsos por días no utilizados.</p>

        <h2>6. Uso aceptable</h2>
        <p>Está expresamente prohibido usar los servicios para: enviar spam o mensajes no solicitados; actividades ilegales o fraudulentas; revender el acceso a terceros sin autorización; vulnerar la seguridad de la Plataforma; enviar contenido difamatorio, violento o discriminatorio; y cualquier uso que viole la legislación colombiana o las políticas de Meta/WhatsApp. El incumplimiento puede resultar en suspensión inmediata sin reembolso.</p>

        <h2>7. WhatsApp y Meta</h2>
        <p>WasapBot opera con tecnología compatible con WhatsApp. El uso está sujeto a los <a href="https://www.whatsapp.com/legal/terms-of-service" target="_blank" rel="noreferrer">Términos de WhatsApp</a> y políticas de Meta Platforms. Meta puede modificar o restringir su plataforma en cualquier momento. NexoTI no garantiza disponibilidad continua ante cambios de Meta. El Usuario es responsable del contenido enviado a través del bot.</p>

        <h2>8. Inteligencia artificial y limitaciones</h2>
        <p>Los servicios usan modelos de lenguaje de terceros (incluyendo OpenAI). Las respuestas del bot son generadas por IA y pueden contener imprecisiones. NexoTI no garantiza que sean siempre correctas o apropiadas. El bot no debe usarse como fuente de asesoramiento médico, legal o financiero. Es responsabilidad del Usuario configurar adecuadamente el bot para su negocio.</p>

        <h2>9. Disponibilidad</h2>
        <p>NexoTI hará sus mejores esfuerzos para mantener la Plataforma disponible 24/7, pero no garantiza disponibilidad ininterrumpida. Pueden existir interrupciones por mantenimiento programado, fallas en servicios de terceros (WhatsApp, OpenAI, Vercel, Firebase) o causas de fuerza mayor.</p>

        <h2>10. Propiedad intelectual</h2>
        <p>Todos los derechos sobre la Plataforma, código, diseño, marca y logotipos pertenecen a NexoTI. El Usuario conserva la propiedad de sus datos y otorga a NexoTI una licencia no exclusiva para usarlos únicamente con el fin de prestar el servicio.</p>

        <h2>11. Limitación de responsabilidad</h2>
        <p>NexoTI no será responsable por pérdida de ingresos o datos del Usuario, daños por respuestas incorrectas del bot, ni acciones de terceros (Meta, OpenAI) que afecten el servicio. La responsabilidad total de NexoTI no excederá el valor pagado por el plan en el mes en que ocurrió el daño.</p>

        <h2>12. Protección de datos</h2>
        <p>El tratamiento de datos personales se rige por nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>, la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.</p>

        <h2>13. Modificaciones</h2>
        <p>NexoTI puede modificar estos Términos notificando al Usuario por correo con al menos 15 días de anticipación. El uso continuo tras la notificación constituye aceptación de los nuevos términos.</p>

        <h2>14. Ley aplicable</h2>
        <p>Estos Términos se rigen por las leyes de Colombia. Las controversias se someterán a los jueces y tribunales de Cali, Valle del Cauca, previa conciliación ante la Cámara de Comercio de Cali.</p>

        <h2>15. Contacto</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Empresa:</strong> NexoTI</li>
          <li><strong style={{color:'#EFF4FF'}}>Correo:</strong> <a href="mailto:soportesistemas@soporteia.net">soportesistemas@soporteia.net</a></li>
          <li><strong style={{color:'#EFF4FF'}}>WhatsApp:</strong> <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer">310 505 6616</a></li>
          <li><strong style={{color:'#EFF4FF'}}>Ciudad:</strong> Cali, Valle del Cauca, Colombia</li>
        </ul>

        <div style={{marginTop:48,padding:'18px 22px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',margin:0,lineHeight:1.7}}>
            Al usar agencIAme y WasapBot usted confirma haber leído y aceptado estos Términos, así como nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>.
          </p>
        </div>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me</span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/terminos" style={{color:'#25D366'}}>Términos</Link>
          <Link href="/legal/privacidad" style={{color:'rgba(255,255,255,0.5)'}}>Privacidad</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 NexoTI · Cali, Colombia</span>
      </footer>
    </>
  );
}
