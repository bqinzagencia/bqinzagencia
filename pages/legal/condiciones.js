// pages/legal/condiciones.js
import Head from 'next/head';
import Link from 'next/link';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function Condiciones() {
  return (
    <>
      <Head>
        <title>Condiciones de Contratación — BQinzAgencIA</title>
        <meta name="description" content="Condiciones de Uso y Contratación de los servicios de BQinzAgencIA (planes Básico, Estándar y Pro)." />
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
        <Link href="/"><span style={{fontFamily:FA,fontSize:20,color:'#EFF4FF',cursor:'pointer'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <Link href="/" style={{fontSize:13,color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al inicio
        </Link>
      </nav>

      <div style={{maxWidth:760,margin:'0 auto',padding:'60px 24px 100px'}}>
        <div style={{marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,color:'rgba(37,211,102,0.8)',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>Documento legal</p>
          <h1 style={{fontFamily:FA,fontSize:46,fontWeight:400,letterSpacing:'-2px',color:'#F5F5F5',marginBottom:16,lineHeight:1.05}}>Condiciones de<br/>Contratación</h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Última actualización: 22/06/2026 · Versión 1.0</p>
        </div>

        <p>Estas Condiciones regulan la contratación de los servicios de <strong style={{color:'#EFF4FF'}}>Óscar Borrero Quiñonez</strong>, operando bajo el nombre comercial <strong style={{color:'#EFF4FF'}}>BQinzAgencIA</strong> (NIF X848098C, domicilio en Calle Toledo, C.P. 28005, Madrid), conforme a la <strong style={{color:'#25D366'}}>Ley 7/1998 de Condiciones Generales de la Contratación</strong>, el <strong style={{color:'#25D366'}}>Real Decreto Legislativo 1/2007 (TRLGDCU)</strong> y la <strong style={{color:'#25D366'}}>Ley 34/2002 (LSSI-CE)</strong>.</p>

        <h2>1. Objeto y aceptación</h2>
        <p>BQinzAgencIA ofrece servicios SaaS de automatización con inteligencia artificial: bot de WhatsApp, agendamiento de citas, catálogo digital, gestión de pedidos e inventario, reportes y panel de administración. Al contratar un plan, el Cliente acepta expresamente estas Condiciones.</p>

        <h2>2. Planes y precios (IVA incluido)</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Plan Básico — 79€/mes:</strong> bot de WhatsApp 24/7, lista de clientes automática, catálogo de productos, agendamiento de citas, inventario básico y notificaciones por email.</li>
          <li><strong style={{color:'#EFF4FF'}}>Plan Estándar — 149€/mes:</strong> incluye lo anterior y añade panel de pedidos, inventario avanzado, reportes de ventas, transmisiones (broadcasts) masivas y soporte prioritario.</li>
          <li><strong style={{color:'#EFF4FF'}}>Plan Pro — 249€/mes:</strong> incluye lo anterior y suma página web incluida, recordatorios de citas, CRM avanzado, múltiples agentes IA y gestor dedicado.</li>
        </ul>
        <p><strong style={{color:'#EFF4FF'}}>Sin permanencia.</strong> El Cliente puede dar de baja su plan en cualquier momento, surtiendo efecto al final del periodo ya pagado.</p>

        <h2>3. Forma de pago</h2>
        <p>Se admiten los siguientes medios: <strong style={{color:'#EFF4FF'}}>Bizum, tarjeta bancaria y efectivo</strong> (el pago en efectivo solo aplica a contratación presencial). El pago es mensual y por adelantado. El servicio se activa tras la confirmación del pago.</p>

        <h2>4. Prueba gratuita y derecho de desistimiento</h2>
        <p>BQinzAgencIA ofrece una <strong style={{color:'#EFF4FF'}}>prueba gratuita de 24 horas</strong> desde el registro, sin necesidad de tarjeta ni pago previo, para que el Cliente pueda evaluar el servicio antes de contratar. Transcurridas las 24 horas, la cuenta queda desactivada hasta que el Cliente active un plan de pago.</p>
        <p>Conforme al art. 103.a) TRLGDCU, el derecho de desistimiento de 14 días naturales <strong style={{color:'#EFF4FF'}}>no resulta de aplicación una vez iniciada la prestación del servicio digital</strong> con el consentimiento expreso del Cliente y su reconocimiento de que pierde dicho derecho. Dado que el Cliente dispone de la prueba gratuita previa descrita arriba para evaluar el servicio sin coste, la contratación de un plan de pago implica la aceptación expresa del inicio inmediato de la prestación y, por tanto, la pérdida del derecho de desistimiento.</p>

        <h2>5. Cambios de precio</h2>
        <p>BQinzAgencIA podrá modificar los precios notificándolo con al menos 30 días de antelación. El Cliente podrá cancelar antes de que el nuevo precio entre en vigor.</p>

        <h2>6. Uso aceptable</h2>
        <p>Queda prohibido usar el servicio para: envío de spam o comunicaciones no solicitadas, actividades ilícitas, reventa no autorizada del acceso, vulneración de la seguridad de la plataforma o incumplimiento de las políticas de WhatsApp/Meta. El incumplimiento puede conllevar la suspensión inmediata del servicio.</p>

        <h2>7. Limitaciones del servicio de IA</h2>
        <p>Las respuestas del bot se generan mediante modelos de lenguaje de terceros y pueden contener imprecisiones. No deben utilizarse como asesoramiento médico, legal o financiero. El Cliente es responsable de revisar y configurar adecuadamente la información de su negocio.</p>

        <h2>8. Disponibilidad</h2>
        <p>Se procurará una disponibilidad del servicio 24/7, sin garantizarla de forma ininterrumpida, dada la dependencia de terceros (WhatsApp/Meta, OpenAI, proveedores de hosting).</p>

        <h2>9. Propiedad intelectual</h2>
        <p>El código, diseño y marca de la plataforma son propiedad de BQinzAgencIA. El Cliente conserva la titularidad de sus propios datos y contenidos, y concede una licencia de uso necesaria para la prestación del servicio.</p>

        <h2>10. Responsabilidad</h2>
        <p>BQinzAgencIA no será responsable de pérdidas de ingresos, daños indirectos, ni de fallos derivados de servicios de terceros (Meta/WhatsApp, OpenAI, hosting). La responsabilidad máxima se limita al importe abonado por el plan en el mes en que se produjo el incidente.</p>

        <h2>11. Protección de datos</h2>
        <p>El tratamiento de datos personales se rige por nuestra <Link href="/legal/privacidad">Política de Privacidad</Link>, conforme al RGPD y la LOPDGDD.</p>

        <h2>12. Legislación y fuero</h2>
        <p>Estas Condiciones se rigen por la legislación española. Para consumidores y usuarios, serán competentes los tribunales del domicilio del Cliente; en otros casos, los de Madrid, sin perjuicio de las normas de protección al consumidor aplicables.</p>

        <h2>13. Contacto</h2>
        <ul>
          <li><strong style={{color:'#EFF4FF'}}>Titular:</strong> Óscar Borrero Quiñonez (BQinzAgencIA)</li>
          <li><strong style={{color:'#EFF4FF'}}>Correo:</strong> <a href="mailto:bqinzagencia@gmail.com">bqinzagencia@gmail.com</a></li>
          <li><strong style={{color:'#EFF4FF'}}>Domicilio:</strong> Calle Toledo, C.P. 28005, Madrid, España</li>
        </ul>

        <div style={{marginTop:48,padding:'18px 22px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)',borderRadius:12}}>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',margin:0,lineHeight:1.7}}>
            Al contratar cualquier plan, el Cliente confirma haber leído y aceptado estas Condiciones, el <Link href="/legal/aviso-legal">Aviso Legal</Link> y la <Link href="/legal/privacidad">Política de Privacidad</Link>.
          </p>
        </div>
      </div>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'24px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <Link href="/"><span style={{fontFamily:FA,fontSize:16,color:'#EFF4FF'}}>BQinz<span style={{color:'#FF6B00'}}>agencIA</span></span></Link>
        <div style={{display:'flex',gap:24,fontSize:12}}>
          <Link href="/legal/aviso-legal" style={{color:'rgba(255,255,255,0.5)'}}>Aviso Legal</Link>
          <Link href="/legal/privacidad" style={{color:'rgba(255,255,255,0.5)'}}>Privacidad</Link>
          <Link href="/legal/condiciones" style={{color:'#25D366'}}>Condiciones</Link>
          <Link href="/legal/cookies" style={{color:'rgba(255,255,255,0.5)'}}>Cookies</Link>
        </div>
        <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>© 2026 BQinzAgencIA · Madrid, España</span>
      </footer>
    </>
  );
}
