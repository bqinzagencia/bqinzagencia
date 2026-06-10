// pages/privacidad.js
import Head from 'next/head';
import Link from 'next/link';
import { Logo } from './index';

const NARANJA = '#FF6B00';

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — BQinzagencIA</title>
        <meta name="description" content="Política de privacidad de BQinzagencIA. Cumplimiento RGPD. Datos protegidos en servidores europeos." />
      </Head>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', background: 'rgba(8,11,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/"><Logo size={18} /></Link>
        <Link href="/" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>← Volver al inicio</Link>
      </nav>
      <div style={{ minHeight: '100vh', background: '#080B0F', color: '#FAFAF8', padding: '100px 40px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.25)', color: NARANJA, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
          🔒 Cumplimiento RGPD · Última actualización: junio 2026
        </div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Política de Privacidad</h1>
        <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 48 }}>BQinzagencIA · CIF: [pendiente de registro] · bqinzagencia@gmail.com</p>

        {[
          { title: '1. Responsable del tratamiento', content: 'BQinzagencIA es el responsable del tratamiento de los datos personales recogidos a través de la plataforma www.bqinzagencia.com. Puede contactar con nosotros en bqinzagencia@gmail.com o en el teléfono +34 674 421 919.' },
          { title: '2. Datos que recogemos', content: 'Recogemos los datos que usted nos facilita directamente: nombre, dirección de correo electrónico, teléfono y datos de facturación. También recogemos datos de uso de la plataforma de forma anonimizada para mejorar el servicio.' },
          { title: '3. Finalidad del tratamiento', content: 'Los datos se utilizan para: (a) prestar el servicio contratado, (b) gestionar su cuenta y facturación, (c) enviar comunicaciones relacionadas con el servicio, (d) mejorar la plataforma mediante análisis anónimos.' },
          { title: '4. Base legal', content: 'El tratamiento se basa en la ejecución del contrato de servicios (Art. 6.1.b RGPD), el consentimiento expreso del usuario (Art. 6.1.a RGPD) para comunicaciones comerciales, y el interés legítimo para el análisis de uso (Art. 6.1.f RGPD).' },
          { title: '5. Conservación de datos', content: 'Los datos se conservan durante la vigencia del contrato y, una vez resuelto, durante los plazos legalmente exigidos (máximo 5 años para datos de facturación). Los datos de uso anonimizados pueden conservarse indefinidamente.' },
          { title: '6. Destinatarios', content: 'No cedemos datos a terceros, salvo obligación legal o cuando sea necesario para prestar el servicio (proveedores tecnológicos bajo acuerdo de encargado de tratamiento: Firebase/Google, Stripe, Twilio). Todos los proveedores operan bajo el RGPD.' },
          { title: '7. Transferencias internacionales', content: 'Los datos se almacenan en servidores europeos. En caso de transferencias a terceros países, se aplican las garantías adecuadas del Art. 46 RGPD (cláusulas contractuales tipo aprobadas por la Comisión Europea).' },
          { title: '8. Sus derechos', content: 'Puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a bqinzagencia@gmail.com. Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).' },
          { title: '9. Seguridad', content: 'Aplicamos medidas técnicas y organizativas para proteger sus datos: cifrado TLS 1.3, acceso restringido a datos personales, copias de seguridad cifradas y auditorías periódicas de seguridad.' },
          { title: '10. Cookies', content: 'Para información detallada sobre el uso de cookies, consulte nuestra Política de Cookies disponible en /cookies.' },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#FAFAF8' }}>{s.title}</h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.8 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </>
  );
}
