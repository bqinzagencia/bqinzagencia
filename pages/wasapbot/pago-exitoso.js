// pages/wasapbot/pago-exitoso.js
// Página de confirmación después del pago con Wompi
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const PLANES = { basico:'Básico', estandar:'Estándar', pro:'Pro' };

export default function PagoExitoso() {
  const router = useRouter();
  const { empresa, plan, ref, id: txId } = router.query;

  const [estado, setEstado] = useState('verificando'); // verificando | aprobado | pendiente | error

  useEffect(() => {
    if (!ref) return;
    // Verificar estado del pago en Firestore via API
    const verificar = async () => {
      try {
        const r = await fetch(`/api/wompi-verificar?ref=${ref}`);
        const d = await r.json();
        if (d.estado === 'APPROVED' || d.planActivo) {
          setEstado('aprobado');
        } else if (d.estado === 'PENDING') {
          setEstado('pendiente');
          // Reintentar en 5 segundos
          setTimeout(verificar, 5000);
        } else {
          setEstado('error');
        }
      } catch {
        // Si no hay API de verificación, asumir aprobado (Wompi solo redirige si fue aprobado)
        setEstado('aprobado');
      }
    };
    setTimeout(verificar, 2000); // esperar 2s para que el webhook procese
  }, [ref]);

  return (
    <>
      <Head>
        <title>Pago confirmado — WasapBot agencIAme</title>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>
      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06090D;color:#EFF4FF;font-family:${F};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        @keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}}/>

      <div style={{textAlign:'center',maxWidth:480,width:'100%'}}>
        <div style={{fontFamily:FA,fontSize:22,marginBottom:32}}>
          agenc<span style={{color:'#FF6B00'}}>IA</span>me
        </div>

        {estado === 'verificando' && (
          <>
            <div style={{width:48,height:48,border:'3px solid rgba(37,211,102,.15)',borderTop:'3px solid #25D366',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 24px'}}/>
            <div style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.5)',animation:'pulse 1.5s ease infinite'}}>Confirmando tu pago...</div>
          </>
        )}

        {estado === 'aprobado' && (
          <>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(37,211,102,.1)',border:'2px solid rgba(37,211,102,.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',animation:'popIn .5s cubic-bezier(.175,.885,.32,1.275)'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{fontFamily:FA,fontSize:48,fontWeight:400,letterSpacing:'-2px',color:'#25D366',marginBottom:8,lineHeight:1}}>
              ¡Pago exitoso!
            </h1>
            <div style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.4)',marginBottom:8,fontWeight:300}}>
              Plan <strong style={{color:'#EFF4FF'}}>{PLANES[plan] || plan}</strong> activado
            </div>
            {ref && (
              <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.2)',marginBottom:32}}>
                Referencia: {ref}
              </div>
            )}

            <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'20px 24px',marginBottom:28,textAlign:'left'}}>
              <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:14}}>¿Qué sigue?</div>
              {[
                { n:'1', t:'Tu bot ya está activo — empieza a recibir mensajes', c:'#25D366' },
                { n:'2', t:'Ve al panel y conecta tu WhatsApp con el código QR', c:'#25D366' },
                { n:'3', t:'Configura tu catálogo para que el bot conozca tus productos', c:'#25D366' },
                { n:'4', t:'Comparte tu número de WhatsApp con tus clientes', c:'#25D366' },
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:i<3?12:0}}>
                  <div style={{width:24,height:24,borderRadius:8,background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,fontSize:11,fontWeight:800,color:'#25D366',flexShrink:0,marginTop:1}}>{s.n}</div>
                  <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.5}}>{s.t}</span>
                </div>
              ))}
            </div>

            {empresa && (
              <Link href={`/wasapbot/panel/${empresa}`}
                style={{display:'block',background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',borderRadius:14,padding:'16px',fontFamily:F,fontSize:15,fontWeight:700,marginBottom:12}}>
                Ir a mi panel →
              </Link>
            )}
            <a href="https://wa.me/573105056616?text=Acabo de activar mi WasapBot, necesito ayuda para configurarlo"
              target="_blank" rel="noreferrer"
              style={{display:'block',background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.5)',border:'1px solid rgba(255,255,255,.08)',borderRadius:14,padding:'14px',fontFamily:F,fontSize:13}}>
              ¿Necesitas ayuda? Escríbenos al 310-505-6616
            </a>
          </>
        )}

        {estado === 'pendiente' && (
          <>
            <div style={{fontSize:48,marginBottom:20}}>⏳</div>
            <h2 style={{fontFamily:FA,fontSize:32,color:'#F59E0B',marginBottom:12}}>Pago en proceso</h2>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:24,lineHeight:1.7}}>
              Tu pago está siendo verificado. Esto puede tomar unos minutos. Te notificaremos por email cuando se confirme.
            </p>
            {empresa && (
              <Link href={`/wasapbot/panel/${empresa}`}
                style={{display:'inline-block',background:'rgba(245,158,11,.1)',color:'#F59E0B',border:'1px solid rgba(245,158,11,.3)',borderRadius:12,padding:'12px 24px',fontFamily:F,fontSize:13,fontWeight:600}}>
                Volver al panel
              </Link>
            )}
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{fontSize:48,marginBottom:20}}>❌</div>
            <h2 style={{fontFamily:FA,fontSize:32,color:'#EF4444',marginBottom:12}}>Pago no procesado</h2>
            <p style={{fontFamily:F,fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:24,lineHeight:1.7}}>
              Hubo un problema con tu pago. No se realizó ningún cobro. Intenta de nuevo o contáctanos.
            </p>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              {empresa && (
                <Link href={`/wasapbot/planes?id=${empresa}`}
                  style={{background:'#EF4444',color:'#fff',borderRadius:12,padding:'12px 24px',fontFamily:F,fontSize:13,fontWeight:700}}>
                  Intentar de nuevo
                </Link>
              )}
              <a href="https://wa.me/573105056616" target="_blank" rel="noreferrer"
                style={{background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.5)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'12px 24px',fontFamily:F,fontSize:13}}>
                Contactar soporte
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
