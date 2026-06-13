// pages/wasapbot/planes.js
// Página de selección de plan y pago con Wompi
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

const PLANES = [
  {
    id:       'basico',
    nombre:   'Básico',
    precio:   189000,
    color:    '#6B7280',
    convs:    '~500/mes',
    tokens:   '50.000',
    popular:  false,
    features: [
      'Bot WhatsApp 24/7',
      '500 conversaciones/mes',
      'Catálogo de productos/servicios',
      'Agendamiento de citas',
      'Inventario y control de stock',
      'Reportes diarios básicos',
      'Notificaciones por email',
      'Soporte por WhatsApp',
    ],
  },
  {
    id:       'estandar',
    nombre:   'Estándar',
    precio:   390000,
    color:    '#2563EB',
    convs:    '~1.500/mes',
    tokens:   '150.000',
    popular:  true,
    features: [
      'Todo lo del plan Básico',
      '1.500 conversaciones/mes',
      'Sistema de pedidos por WhatsApp',
      'Inventario avanzado con alertas',
      'Reportes de ventas y compras',
      'Broadcasts a clientes',
      'Seguimiento post-servicio',
      'Soporte prioritario',
    ],
  },
  {
    id:       'pro',
    nombre:   'Pro',
    precio:   690000,
    color:    '#A78BFA',
    convs:    '~4.000/mes',
    tokens:   '400.000',
    popular:  false,
    features: [
      'Todo lo del plan Estándar',
      '4.000 conversaciones/mes',
      'Recordatorios automáticos de citas',
      'Encuesta de satisfacción',
      'Página web incluida',
      'Múltiples agentes IA',
      'Reportes avanzados mensuales',
      'Gestor dedicado NexoTI',
    ],
  },
];

export default function PlanesWasapbot() {
  const router   = useRouter();
  const { id: empresaId, nombre: nombreEmpresa } = router.query;

  const [planSel,    setPlanSel]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [email,      setEmail]      = useState('');
  const [nombre,     setNombre]     = useState(nombreEmpresa || '');

  useEffect(() => {
    if (nombreEmpresa) setNombre(decodeURIComponent(nombreEmpresa));
  }, [nombreEmpresa]);

  const iniciarPago = async (plan) => {
    if (!empresaId) {
      setError('No se encontró el ID de la empresa. Vuelve al panel.');
      return;
    }
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico para continuar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/wompi-crear-pago', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          planId:        plan.id,
          empresaId,
          nombreEmpresa: nombre,
          email,
          monto:         plan.precio,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Error creando el pago');

      // Abrir widget de Wompi
      const pubKey = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || '';
      abrirWompi({ referencia: d.referencia, firma: d.firma, monto: d.montoEnCentavos, plan, email, pubKey });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const abrirWompi = ({ referencia, firma, monto, plan, email, pubKey }) => {
    // Cargar script de Wompi dinámicamente
    if (!document.getElementById('wompi-script')) {
      const script = document.createElement('script');
      script.id  = 'wompi-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.setAttribute('data-render', 'button');
      document.head.appendChild(script);
    }

    // Crear formulario oculto para el widget
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = 'https://checkout.wompi.co/p/';

    const campos = {
      'public-key':          pubKey || process.env.NEXT_PUBLIC_WOMPI_PUB_KEY,
      'currency':            'COP',
      'amount-in-cents':     String(monto),
      'reference':           referencia,
      'signature:integrity': firma,
      'redirect-url':        `${window.location.origin}/wasapbot/pago-exitoso?empresa=${empresaId}&plan=${plan.id}&ref=${referencia}`,
      'customer-data:email': email,
      'customer-data:full-name': nombre || '',
    };

    for (const [k, v] of Object.entries(campos)) {
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = k;
      input.value = v || '';
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit(); // Redirige al checkout de Wompi
    setLoading(false);
  };

  const fmtP = (n) => Number(n).toLocaleString('es-CO');

  return (
    <>
      <Head>
        <title>Elige tu plan — WasapBot agencIAme</title>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06090D;color:#EFF4FF;font-family:${F};min-height:100vh}
        a{text-decoration:none;color:inherit}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .plan-card{border-radius:20px;padding:32px 28px;cursor:pointer;transition:all .2s;position:relative;animation:fadeIn .3s ease both}
        .plan-card:hover{transform:translateY(-4px)}
        .check{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        .btn-pago{width:100%;border:none;border-radius:12px;padding:14px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:24px}
        .btn-pago:hover:not(:disabled){transform:translateY(-2px);opacity:.9}
        .btn-pago:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .garantia{display:flex;align-items:center;gap:8px;background:rgba(37,211,102,.05);border:1px solid rgba(37,211,102,.15);borderRadius:10px;padding:10px 14px;margin-top:10px}
      `}}/>

      {/* NAV */}
      <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontFamily:FA,fontSize:18}}>agenc<span style={{color:'#FF6B00'}}>IA</span>me <span style={{fontFamily:F,fontSize:13,color:'#25D366',fontWeight:700}}>WasapBot</span></span>
        {empresaId && (
          <Link href={`/wasapbot/panel/${empresaId}`} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)'}}>
            ← Volver al panel
          </Link>
        )}
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 20px 80px'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#25D366',letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>
            Planes WasapBot
          </p>
          <h1 style={{fontFamily:FA,fontSize:'clamp(36px,5vw,60px)',fontWeight:400,letterSpacing:'-2px',color:'#F0F0F0',marginBottom:12,lineHeight:1.05}}>
            Activa tu bot hoy
          </h1>
          <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.35)',fontWeight:300,maxWidth:480,margin:'0 auto'}}>
            Sin contratos. Sin permanencia. Cancela cuando quieras.
          </p>
        </div>

        {/* Email input */}
        <div style={{maxWidth:400,margin:'0 auto 36px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'20px 22px'}}>
          <label style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#4B6080',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>
            Tu correo para la confirmación
          </label>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="tucorreo@gmail.com"
            style={{width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'10px 14px',color:'#EFF4FF',fontFamily:F,fontSize:14,outline:'none'}}
          />
          {error && (
            <div style={{fontFamily:F,fontSize:12,color:'#EF4444',marginTop:8}}>{error}</div>
          )}
        </div>

        {/* Planes */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:1000,margin:'0 auto'}}>
          {PLANES.map((plan, i) => (
            <div key={plan.id} className="plan-card"
              style={{
                background: plan.popular
                  ? `linear-gradient(145deg,${plan.color}12,rgba(12,15,20,1))`
                  : 'rgba(12,15,20,1)',
                border: `${plan.popular?2:1}px solid ${plan.popular?plan.color+'55':'rgba(255,255,255,.07)'}`,
                animationDelay: `${i*0.08}s`,
              }}>

              {plan.popular && (
                <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',padding:'4px 18px',borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:.5,whiteSpace:'nowrap',boxShadow:`0 4px 16px ${plan.color}55`}}>
                  MÁS POPULAR
                </div>
              )}

              <div style={{fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:plan.color,marginBottom:10}}>{plan.nombre}</div>
              <div style={{fontFamily:FA,fontSize:44,color:plan.color,letterSpacing:'-2px',lineHeight:1,marginBottom:4}}>
                ${fmtP(plan.precio)}
              </div>
              <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.25)',marginBottom:8}}>COP / mes</div>

              <div style={{display:'flex',gap:8,marginBottom:22}}>
                <span style={{background:`${plan.color}18`,color:plan.color,border:`1px solid ${plan.color}30`,borderRadius:100,padding:'3px 10px',fontFamily:F,fontSize:11,fontWeight:600}}>{plan.tokens} tokens</span>
                <span style={{background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.3)',border:'1px solid rgba(255,255,255,.07)',borderRadius:100,padding:'3px 10px',fontFamily:F,fontSize:11}}>{plan.convs}</span>
              </div>

              {plan.features.map((f,j)=>(
                <div key={j} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                  <div className="check" style={{background:`${plan.color}18`}}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:300,lineHeight:1.4}}>{f}</span>
                </div>
              ))}

              <button
                className="btn-pago"
                disabled={loading}
                onClick={()=>iniciarPago(plan)}
                style={{
                  background: plan.popular
                    ? `linear-gradient(135deg,${plan.color},${plan.color}CC)`
                    : 'rgba(255,255,255,.05)',
                  color:   plan.popular ? '#fff' : 'rgba(255,255,255,.6)',
                  border:  plan.popular ? 'none' : `1px solid rgba(255,255,255,.1)`,
                  boxShadow: plan.popular ? `0 6px 24px ${plan.color}44` : 'none',
                }}>
                {loading ? 'Procesando...' : `Activar plan ${plan.nombre} →`}
              </button>
            </div>
          ))}
        </div>

        {/* Métodos de pago */}
        <div style={{textAlign:'center',marginTop:36}}>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.2)',marginBottom:12}}>Métodos de pago disponibles</div>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            {['💳 Tarjeta débito/crédito','🏦 PSE','📱 Nequi','🏧 Bancolombia'].map(m=>(
              <span key={m} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:99,padding:'5px 14px'}}>{m}</span>
            ))}
          </div>
        </div>

        {/* Garantía */}
        <div style={{maxWidth:500,margin:'24px auto 0',background:'rgba(37,211,102,.05)',border:'1px solid rgba(37,211,102,.15)',borderRadius:14,padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round" style={{flexShrink:0}}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div>
            <div style={{fontFamily:F,fontSize:13,fontWeight:700,color:'#EFF4FF',marginBottom:2}}>Garantía de satisfacción</div>
            <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',fontWeight:300}}>Si no estás satisfecho, te devolvemos el dinero. Sin preguntas. Contáctanos al 310-505-6616.</div>
          </div>
        </div>

        {/* Soporte */}
        <div style={{textAlign:'center',marginTop:28}}>
          <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.25)',marginBottom:8}}>¿Tienes dudas antes de pagar?</div>
          <a href="https://wa.me/573105056616?text=Quiero información sobre los planes WasapBot" target="_blank" rel="noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,.08)',color:'#25D366',border:'1px solid rgba(37,211,102,.2)',borderRadius:10,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:600}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
            Hablar con un asesor
          </a>
        </div>
      </div>
    </>
  );
}
