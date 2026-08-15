// pages/wasapbot/planes.js — Sistema de upgrade completo
// Un solo dashboard, tres niveles de plan
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

const PLANES = [
  {
    id:      'prueba_5k',
    nombre:  'Prueba Técnica',
    precio:  5,
    color:   '#F59E0B',
    icon:    '🧪',
    popular: false,
    desc:    'Solo para pruebas internas',
    features: [
      { ok: true,  t: 'Plan de prueba técnica' },
      { ok: true,  t: 'Verifica el flujo completo de pago' },
      { ok: true,  t: 'Webhook + Firestore + activación' },
      { ok: true,  t: 'Solo ambiente de pruebas' },
    ],
  },
  {
    id:      'basico',
    nombre:  'Básico',
    precio:  79,
    color:   '#25D366',
    icon:    '🤖',
    popular: false,
    desc:    'Ideal para empezar',
    features: [
      { ok: true,  t: 'Bot WhatsApp responde con IA 24/7' },
      { ok: true,  t: 'Muestra catálogo con fotos y precios' },
      { ok: true,  t: 'Toma pedidos y confirma domicilios' },
      { ok: true,  t: 'Agenda citas automáticamente' },
      { ok: true,  t: 'Libreta de clientes automática' },
      { ok: true,  t: '500 créditos / mes' },
      { ok: true,  t: 'Notificaciones por email' },
      { ok: true,  t: 'Soporte por email' },
      { ok: false, t: 'Panel de pedidos del día' },
      { ok: false, t: 'Reportes diarios y mensuales' },
      { ok: false, t: 'Broadcasts masivos a clientes' },
      { ok: false, t: 'Página web incluida' },
    ],
  },
  {
    id:      'estandar',
    nombre:  'Estándar',
    precio:  149,
    color:   '#2563EB',
    icon:    '⚡',
    popular: true,
    desc:    'El más elegido',
    features: [
      { ok: true,  t: 'Todo lo del plan Básico' },
      { ok: true,  t: 'Modo Dueño — actualiza precios y horarios por WhatsApp' },
      { ok: true,  t: '1.500 créditos / mes' },
      { ok: true,  t: 'Inventario avanzado con entradas y salidas' },
      { ok: true,  t: 'Panel de pedidos del día en tiempo real' },
      { ok: true,  t: 'Reportes diarios y mensuales de ventas' },
      { ok: true,  t: 'Alertas de stock mínimo por email' },
      { ok: true,  t: 'CRM avanzado de clientes' },
      { ok: true,  t: 'Seguimiento post-servicio automático' },
      { ok: false, t: 'Página web incluida' },
      { ok: false, t: 'Recordatorios automáticos de citas' },
      { ok: false, t: 'Múltiples agentes IA' },
    ],
  },
  {
    id:      'pro',
    nombre:  'Pro',
    precio:  249,
    color:   '#A78BFA',
    icon:    '🚀',
    popular: false,
    desc:    'Automatización total',
    features: [
      { ok: true, t: 'Todo lo del plan Profesional' },
      { ok: true, t: '4.000 créditos / mes' },
      { ok: true, t: 'Broadcasts masivos a clientes' },
      { ok: true, t: 'Página web automática incluida' },
      { ok: true, t: 'Recordatorios automáticos de citas' },
      { ok: true, t: 'Reportes avanzados con gráficas' },
      { ok: true, t: 'Múltiples agentes IA' },
      { ok: true, t: 'Gestor dedicado BQinzagencIA' },
      { ok: true, t: 'SLA prioritario 99.9%' },
      { ok: true, t: 'Integración con Instagram' },
      { ok: true, t: 'Encuesta de satisfacción post-servicio' },
      { ok: true, t: 'Soporte VIP prioritario' },
    ],
  },
];

// Qué funciones desbloquea cada plan
export const PLAN_PERMISOS = {
  basico: {
    botIA:         true,
    inventario:    true,  // básico
    pedidos:       false,
    reportes:      false,
    broadcasts:    false,
    paginaWeb:     false,
    recordatorios: false, // recordatorio 24h antes de cita — solo Pro
    seguimiento:   false, // seguimiento post-servicio — Estandar y Pro
    crm:           false,
    conversaciones: true,
    citas:         true,
  },
  estandar: {
    botIA:         true,
    inventario:    true,
    pedidos:       true,
    reportes:      true,
    broadcasts:    true,
    paginaWeb:     false,
    recordatorios: false,
    seguimiento:   true,
    crm:           false,
    conversaciones: true,
    citas:         true,
  },
  pro: {
    botIA:         true,
    inventario:    true,
    pedidos:       true,
    reportes:      true,
    broadcasts:    true,
    paginaWeb:     true,
    recordatorios: true,
    seguimiento:   true,
    crm:           true,
    conversaciones: true,
    citas:         true,
  },
};

export function getPlanPermisos(planId) {
  return PLAN_PERMISOS[planId] || {
    botIA: false, inventario: false, pedidos: false, reportes: false,
    broadcasts: false, paginaWeb: false, recordatorios: false, seguimiento: false, crm: false,
    conversaciones: false, citas: false,
  };
}

// Carga el SDK de PayPal una sola vez y lo reutiliza
function usePaypalSdk() {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return;
    if (window.paypal) { setListo(true); return; }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&intent=capture&locale=es_ES`;
    script.onload  = () => setListo(true);
    script.onerror = () => setListo(false);
    document.body.appendChild(script);
  }, []);
  return listo;
}

// Botón nativo de PayPal — modo 100% client-side: el SDK de PayPal crea
// y captura la orden directamente en el navegador (no requiere Client Secret
// ni autenticación OAuth de servidor). Al aprobarse el pago, notificamos a
// nuestro backend solo para registrar el pago y avisar por WhatsApp — la
// activación del plan se confirma manualmente mientras se resuelve el acceso
// completo a la API REST de PayPal.
function BotonPaypal({ plan, empresaId, nombreEmpresa, email, onError, onSuccess }) {
  const sdkListo = usePaypalSdk();
  const contenedorRef = useRef(null);
  const renderizado = useRef(false);

  useEffect(() => {
    if (!sdkListo || !window.paypal || renderizado.current || !contenedorRef.current) return;
    renderizado.current = true;

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay', height: 45 },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Plan ${plan.nombre} — WasapBot`,
            custom_id: JSON.stringify({ empresaId, planId: plan.id }),
            amount: { currency_code: 'EUR', value: String(plan.precio) },
          }],
          application_context: { brand_name: 'BQinzagencIA', locale: 'es-ES', user_action: 'PAY_NOW' },
        });
      },
      onApprove: async (data, actions) => {
        try {
          const detalles = await actions.order.capture();
          // Notificar al backend (best-effort) para registrar el pago y avisar por WhatsApp.
          // Si esto falla, el pago en PayPal ya se hizo igualmente — no bloqueamos al usuario.
          fetch('/api/paypal-registrar-pago-manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID, empresaId, nombreEmpresa, email,
              planId: plan.id, monto: plan.precio,
            }),
          }).catch(() => {});
          onSuccess(detalles);
        } catch (err) {
          onError('El pago se aprobó pero hubo un error al confirmarlo. Contáctanos para verificar.');
        }
      },
      onCancel: () => {},
      onError: (err) => { onError(err.message || 'Error procesando el pago con PayPal'); },
    }).render(contenedorRef.current);
  }, [sdkListo]);

  if (!PAYPAL_CLIENT_ID) return null;

  return (
    <div style={{marginTop:10}}>
      {!sdkListo && <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.25)',textAlign:'center',padding:'10px 0'}}>Cargando PayPal...</div>}
      <div ref={contenedorRef} style={{opacity:sdkListo?1:0,minHeight:sdkListo?45:0}}/>
    </div>
  );
}

export default function PlanesWasapbot() {
  const router = useRouter();
  const { id: empresaId, nombre: nombreEmpresa, upgrade, planActual } = router.query;

  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [email,         setEmail]         = useState('');
  const [emailConfirm,  setEmailConfirm]  = useState('');
  const [emailEditable, setEmailEditable] = useState(false);
  const [nombre,        setNombre]        = useState('');
  const [empresaData,   setEmpresaData]   = useState(null);
  const [cargando,      setCargando]      = useState(true);
  const [planSel,       setPlanSel]       = useState(null);
  const [planParaPagar, setPlanParaPagar] = useState(null); // plan elegido, abre selector de método

  const esUpgrade = upgrade === '1';

  useEffect(() => {
    if (!empresaId) { setCargando(false); return; }
    fetch('/api/wasapbot-panel?id=' + empresaId)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.empresa) {
          setEmpresaData(d.empresa);
          setNombre(d.empresa.nombreEmpresa || '');
          setEmail(d.empresa.email || '');
          setEmailConfirm(d.empresa.email || '');
        }
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [empresaId]);

  const abrirSelectorPago = (plan) => {
    if (!empresaId) { setError('No se encontró el ID de la empresa.'); return; }
    if (!email.trim()) { setError('El correo es requerido.'); return; }
    setError('');
    setPlanParaPagar(plan);
  };

  const iniciarPagoStripe = async (plan) => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/stripe-crear-sesion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          planId:        plan.id,
          empresaId,
          nombreEmpresa: nombre,
          email,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Error creando la sesión de pago');

      // Redirigir al checkout de Stripe
      window.location.href = d.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fmtP = (n) => Number(n).toLocaleString('es-ES') + '€';

  // Qué planes mostrar según si es upgrade. El plan "prueba_5k" es solo
  // para pruebas internas de Alexander (verificar el flujo de pago) y
  // NUNCA debe mostrarse a clientes reales — se excluye siempre.
  const planesAMostrar = (esUpgrade
    ? PLANES.filter(p => {
        const orden = { basico: 1, estandar: 2, pro: 3 };
        return orden[p.id] > (orden[planActual] || 0);
      })
    : PLANES
  ).filter(p => p.id !== 'prueba_5k');

  return (
    <>
      <Head>
        <title>{esUpgrade ? 'Mejora tu plan' : 'Activa tu WasapBot'} — BQinzagencIA</title>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#06090D;color:#EFF4FF;font-family:${F};min-height:100vh}
        a{text-decoration:none;color:inherit}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .plan-card{border-radius:20px;padding:32px 28px;cursor:pointer;transition:all .2s;position:relative;animation:fadeIn .3s ease both}
        .plan-card:hover{transform:translateY(-4px)}
        .btn-pago{width:100%;border:none;border-radius:12px;padding:14px;font-family:${F};font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:24px}
        .btn-pago:hover:not(:disabled){transform:translateY(-2px);opacity:.9}
        .btn-pago:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .feature-ok{color:rgba(255,255,255,.5)}
        .feature-no{color:rgba(255,255,255,.2);text-decoration:line-through}
        .planes-grid{display:grid;gap:16px;max-width:1000px;margin:0 auto}
        .plan-card{min-width:0}
        @media(max-width:860px){
          .planes-grid{
            display:flex!important;
            grid-template-columns:none!important;
            overflow-x:auto;
            overflow-y:visible;
            scroll-snap-type:x mandatory;
            -webkit-overflow-scrolling:touch;
            padding:6px 6px 18px;
            margin:0 -20px;
            gap:14px;
          }
          .planes-grid::-webkit-scrollbar{height:5px}
          .planes-grid::-webkit-scrollbar-thumb{background:rgba(255,107,0,.35);border-radius:99px}
          .planes-grid .plan-card{
            flex:0 0 84%;
            scroll-snap-align:center;
            min-width:260px;
          }
          .planes-grid::before, .planes-grid::after{content:'';flex:0 0 16px}
        }
      `}}/>

      {/* NAV */}
      <nav style={{background:'rgba(6,9,13,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'0 24px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontFamily:FA,fontSize:18}}>
        BQinzagenc<span style={{color:'#FF6B00'}}>IA</span>
          <span style={{fontFamily:F,fontSize:13,color:'#25D366',fontWeight:700,marginLeft:8}}>WasapBot</span>
        </span>
        {empresaId && (
          <Link href={`/wasapbot/panel/${empresaId}`} style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',display:'flex',alignItems:'center',gap:5}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver al panel
          </Link>
        )}
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 20px 80px'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:40}}>
          {esUpgrade && (
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,.08)',border:'1px solid rgba(37,211,102,.2)',borderRadius:99,padding:'6px 16px',marginBottom:16}}>
              <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#25D366',textTransform:'uppercase',letterSpacing:1}}>
                ⬆️ Mejorando desde plan {planActual}
              </span>
            </div>
          )}
          <p style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#25D366',letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>
            {esUpgrade ? 'Upgrade de plan' : 'Planes WasapBot'}
          </p>
          <h1 style={{fontFamily:FA,fontSize:'clamp(36px,5vw,60px)',fontWeight:400,letterSpacing:'-2px',color:'#F0F0F0',marginBottom:12,lineHeight:1.05}}>
            {esUpgrade ? 'Desbloquea más funciones' : 'Activa tu bot hoy'}
          </h1>
          <p style={{fontFamily:F,fontSize:15,color:'rgba(255,255,255,.35)',fontWeight:300,maxWidth:480,margin:'0 auto'}}>
            Sin contratos · Sin permanencia · Cancela cuando quieras
          </p>
        </div>

        {/* Correo */}
        <div style={{maxWidth:440,margin:'0 auto 36px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'20px 22px'}}>
          {cargando ? (
            <div style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.3)',textAlign:'center',padding:'10px 0'}}>Cargando datos...</div>
          ) : (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <label style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#4B6080',textTransform:'uppercase',letterSpacing:1}}>Correo de confirmación</label>
                {!emailEditable && (
                  <button onClick={()=>setEmailEditable(true)}
                    style={{background:'none',border:'none',fontFamily:F,fontSize:11,color:'#25D366',cursor:'pointer',fontWeight:600}}>
                    ✏️ Cambiar
                  </button>
                )}
              </div>
              {!emailEditable ? (
                <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(37,211,102,.05)',border:'1px solid rgba(37,211,102,.2)',borderRadius:8,padding:'11px 14px'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{fontFamily:F,fontSize:14,color:'#EFF4FF',flex:1}}>{email || 'Sin correo registrado'}</span>
                  <span style={{fontFamily:F,fontSize:10,color:'#25D366',fontWeight:700,background:'rgba(37,211,102,.1)',borderRadius:99,padding:'2px 8px'}}>✓</span>
                </div>
              ) : (
                <div>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@gmail.com"
                    style={{width:'100%',background:'#06090D',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,padding:'10px 14px',color:'#EFF4FF',fontFamily:F,fontSize:14,outline:'none',marginBottom:8,boxSizing:'border-box'}}/>
                  <input type="email" value={emailConfirm} onChange={e=>setEmailConfirm(e.target.value)} placeholder="Confirmar correo"
                    style={{width:'100%',background:'#06090D',border:`1px solid ${emailConfirm&&email!==emailConfirm?'rgba(239,68,68,.5)':'rgba(255,255,255,.15)'}`,borderRadius:8,padding:'10px 14px',color:'#EFF4FF',fontFamily:F,fontSize:14,outline:'none',marginBottom:4,boxSizing:'border-box'}}/>
                  {emailConfirm && email!==emailConfirm && <div style={{fontFamily:F,fontSize:11,color:'#EF4444',marginBottom:4}}>⚠️ Los correos no coinciden</div>}
                  {emailConfirm && email===emailConfirm && <div style={{fontFamily:F,fontSize:11,color:'#25D366',marginBottom:4}}>✓ Los correos coinciden</div>}
                  <button onClick={()=>{setEmailEditable(false);setEmailConfirm(email);}}
                    style={{background:'none',border:'none',fontFamily:F,fontSize:11,color:'rgba(255,255,255,.3)',cursor:'pointer',marginTop:4}}>
                    Cancelar
                  </button>
                </div>
              )}
              {error && <div style={{fontFamily:F,fontSize:12,color:'#EF4444',marginTop:10,background:'rgba(239,68,68,.06)',borderRadius:6,padding:'8px 10px'}}>{error}</div>}
            </>
          )}
        </div>

        {/* Prueba gratis 24h */}
        {!esUpgrade && (
          <div style={{maxWidth:1000,margin:'0 auto 28px',background:'linear-gradient(135deg,rgba(37,211,102,.08),rgba(37,211,102,.02))',border:'1.5px solid rgba(37,211,102,.3)',borderRadius:18,padding:'24px 28px',display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
            <div style={{fontSize:32,flexShrink:0}}>🎁</div>
            <div style={{flex:1,minWidth:220}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
                <span style={{fontFamily:F,fontSize:13,fontWeight:800,color:'#25D366',textTransform:'uppercase',letterSpacing:1}}>Prueba gratis</span>
                <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:'#06090D',background:'#25D366',borderRadius:99,padding:'2px 10px'}}>24 HORAS</span>
              </div>
              <p style={{fontFamily:F,fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:300,lineHeight:1.6,margin:0}}>
                Activa tu bot y pruébalo gratis durante 24 horas desde que te registras. Pasado ese tiempo, tu cuenta se desactiva automáticamente — la hayas usado o no — hasta que elijas el plan que más te convenga.
              </p>
            </div>
            <a href="/wasapbot/activar" style={{flexShrink:0,background:'#25D366',color:'#06090D',border:'none',borderRadius:10,padding:'12px 22px',fontFamily:F,fontSize:13,fontWeight:800,whiteSpace:'nowrap'}}>
              Probar 24h gratis →
            </a>
          </div>
        )}

        {/* Planes */}
        <div className="planes-grid" style={{gridTemplateColumns:`repeat(${planesAMostrar.length},1fr)`}}>
          {planesAMostrar.map((plan, i) => (
            <div key={plan.id} className="plan-card"
              style={{
                background: '#000000',
                border: '1px solid #FF6B00',
                animationDelay: `${i*0.08}s`,
              }}>

              {plan.popular && (
                <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'#FF6B00',color:'#000',padding:'4px 18px',borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:.5,whiteSpace:'nowrap',boxShadow:'0 4px 16px rgba(255,107,0,0.55)'}}>
                  MÁS POPULAR
                </div>
              )}

              <div style={{fontSize:28,marginBottom:8}}>{plan.icon}</div>
              <div style={{fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#FF6B00',marginBottom:4}}>{plan.nombre}</div>
              <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.3)',marginBottom:12}}>{plan.desc}</div>
              <div style={{fontFamily:FA,fontSize:44,color:'#FF6B00',letterSpacing:'-2px',lineHeight:1,marginBottom:4}}>
                {fmtP(plan.precio)}
              </div>
              <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.25)',marginBottom:20}}>EUR / mes · IVA incluido</div>

              <div style={{borderTop:'1px solid rgba(255,255,255,.06)',paddingTop:16,marginBottom:20}}>
                {plan.features.map((f,j) => (
                  <div key={j} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:9}}>
                    <span style={{fontSize:11,flexShrink:0,marginTop:2,color:f.ok?'#FF6B00':'rgba(255,255,255,.2)'}}>
                      {f.ok ? '✓' : '✗'}
                    </span>
                    <span className={f.ok ? 'feature-ok' : 'feature-no'} style={{fontFamily:F,fontSize:12,lineHeight:1.4}}>
                      {f.t}
                    </span>
                  </div>
                ))}
              </div>

              <button className="btn-pago" disabled={loading} onClick={()=>abrirSelectorPago(plan)}
                style={{
                  background: '#000000',
                  color: '#FF6B00',
                  border: '1px solid #FF6B00',
                  boxShadow: '0 0 12px rgba(255,107,0,0.3)',
                }}>
                {loading ? 'Procesando...' : esUpgrade ? `Mejorar a ${plan.nombre} →` : `Activar plan ${plan.nombre} →`}
              </button>
            </div>
          ))}
        </div>

        {/* Comparación de planes si es upgrade */}
        {esUpgrade && (
          <div style={{maxWidth:700,margin:'36px auto 0',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:14,padding:'20px 24px'}}>
            <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:1,marginBottom:14}}>
              ¿Qué desbloqueas al mejorar?
            </div>
            {[
              { plan:'estandar', items:['Panel de pedidos en tiempo real','Reportes de ventas y compras','Broadcasts masivos a clientes','Alertas de stock mínimo'] },
              { plan:'pro',      items:['Página web automática con IA','Recordatorios automáticos de citas','CRM avanzado de clientes','Encuesta de satisfacción'] },
            ].filter(p => {
              const orden = { basico:1, estandar:2, pro:3 };
              return orden[p.plan] > (orden[planActual] || 0);
            }).map((p,i) => {
              const planInfo = PLANES.find(x => x.id === p.plan);
              return (
                <div key={i} style={{marginBottom:i===0?16:0}}>
                  <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:planInfo?.color,marginBottom:8}}>
                    Plan {planInfo?.nombre}:
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {p.items.map((item,j) => (
                      <span key={j} style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.5)',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:99,padding:'4px 12px'}}>
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Métodos de pago */}
        <div style={{textAlign:'center',marginTop:36}}>
          <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.2)',marginBottom:12}}>Método de pago disponible</div>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            {['💰 PayPal'].map(m=>(
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
            <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',fontWeight:300}}>Si no estás satisfecho, te devolvemos el dinero. Contáctanos al 674421919.</div>
          </div>
        </div>

        {/* Soporte */}
        <div style={{textAlign:'center',marginTop:24}}>
          <a href="https://wa.me/34674421919?text=Quiero información sobre los planes WasapBot" target="_blank" rel="noreferrer"
            style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,211,102,.08)',color:'#25D366',border:'1px solid rgba(37,211,102,.2)',borderRadius:10,padding:'10px 20px',fontFamily:F,fontSize:13,fontWeight:600}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
            Hablar con un asesor
          </a>
        </div>
      </div>

      {/* Selector de método de pago (tarjeta / PayPal) */}
      {planParaPagar && (
        <div onClick={()=>{ if(!loading) setPlanParaPagar(null); }} style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#0A0D12',border:'1px solid rgba(255,107,0,.25)',borderRadius:18,padding:'28px 26px',maxWidth:380,width:'100%'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontFamily:F,fontSize:15,fontWeight:700,color:'#EFF4FF'}}>Pagar con PayPal</div>
              {!loading && (
                <button onClick={()=>setPlanParaPagar(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:18,cursor:'pointer',lineHeight:1}}>✕</button>
              )}
            </div>
            <div style={{fontFamily:F,fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:20}}>
              Plan {planParaPagar.nombre} — {fmtP(planParaPagar.precio)}/mes
            </div>

            {/* Tarjeta (Stripe) — temporalmente deshabilitado */}
            {false && (
            <button disabled={loading} onClick={()=>iniciarPagoStripe(planParaPagar)}
              style={{width:'100%',background:'#000',color:'#FF6B00',border:'1px solid #FF6B00',borderRadius:10,padding:'13px',fontFamily:F,fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading ? 'Procesando...' : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Pagar con tarjeta</>)}
            </button>
            )}

            {/* Separador — temporalmente oculto junto con Stripe */}
            {false && (
            <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.08)'}}/>
              <span style={{fontFamily:F,fontSize:11,color:'rgba(255,255,255,.25)'}}>o</span>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.08)'}}/>
            </div>
            )}

            {/* PayPal */}
            <BotonPaypal
              plan={planParaPagar}
              empresaId={empresaId}
              nombreEmpresa={nombre}
              email={email}
              onError={(msg)=>setError(msg)}
              onSuccess={()=>{ window.location.href = `/wasapbot/pago-exitoso?empresa=${empresaId}&plan=${planParaPagar.id}`; }}
            />

            {error && <div style={{fontFamily:F,fontSize:12,color:'#EF4444',marginTop:14,background:'rgba(239,68,68,.06)',borderRadius:6,padding:'8px 10px'}}>{error}</div>}
          </div>
        </div>
      )}
    </>
  );
}
