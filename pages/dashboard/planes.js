// pages/dashboard/planes.js
// Integración Wompi — PSE + Tarjetas + Nequi
// Cuando lleguen las llaves, pon los valores en Vercel:
//   NEXT_PUBLIC_WOMPI_PUB_KEY = pub_test_XXXX  (luego pub_prod_XXXX)
//   WOMPI_PRIV_KEY            = prv_test_XXXX  (luego prv_prod_XXXX)
//   WOMPI_EVENTS_SECRET       = el secreto del webhook

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const F = "'Inter', system-ui, sans-serif";

const WOMPI_PUB = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || '';

const PLANES = [
  {
    id:      'emprendedor',
    nombre:  'Emprendedor',
    precio:  189000,
    sub:     'Ideal para arrancar',
    color:   '#6B7280',
    features: [
      '1 Agente IA activo',
      '500 conversaciones/mes',
      'Chat web + WhatsApp (2 dias trial)',
      'CRM hasta 200 contactos',
      'Agendamiento basico',
      'Soporte por email',
    ],
  },
  {
    id:      'profesional',
    nombre:  'Profesional',
    precio:  490000,
    sub:     'El mas popular',
    color:   '#1A56FF',
    popular: true,
    features: [
      '3 Agentes IA activos',
      'Conversaciones ilimitadas',
      'WhatsApp + Instagram + Web',
      'Llamadas IA (100/mes)',
      'CRM ilimitado + pipeline',
      'Pagina web con IA',
      'Reportes avanzados',
      'Soporte 24/7',
    ],
  },
  {
    id:      'agencia',
    nombre:  'Agencia',
    precio:  1190000,
    sub:     'Para equipos y agencias',
    color:   '#A78BFA',
    features: [
      'Agentes IA ilimitados',
      'Multisede y multiempresa',
      'Llamadas IA ilimitadas',
      'White-label / marca propia',
      'API completa',
      'Gestor dedicado',
      'Capacitacion incluida',
      'SLA 99.9%',
    ],
  },
];

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}

export default function PlanesPage() {
  const { empresa } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState('');

  // Trial
  let diasRestantes = 0;
  let trialVencido  = false;
  const esTrial = !empresa?.planActivo || empresa?.plan === 'emprendedor';
  if (empresa?.trialHasta) {
    const hasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : new Date(empresa.trialHasta);
    const diff  = Math.ceil((hasta - new Date()) / (1000 * 60 * 60 * 24));
    diasRestantes = Math.max(0, diff);
    trialVencido  = diff <= 0;
  }

  const iniciarPago = async (plan) => {
    if (!WOMPI_PUB) {
      alert('Los pagos se activarán en los próximos días. Contacta soporte: 310-505-6616');
      return;
    }
    setLoadingPlan(plan.id);
    try {
      // 1. Crear referencia de pago en nuestro backend
      const r = await fetch('/api/wompi-crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId:       plan.id,
          empresaId:    empresa.id,
          nombreEmpresa: empresa.nombreEmpresa,
          email:        empresa.email,
          monto:        plan.precio,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);

      // 2. Redirigir al checkout de Wompi
      const params = new URLSearchParams({
        'public-key':             WOMPI_PUB,
        'currency':               'COP',
        'amount-in-cents':        String(plan.precio * 100),
        'reference':              d.referencia,
        'redirect-url':           `${window.location.origin}/dashboard/pago-resultado`,
        'customer-email':         empresa.email || '',
        'customer-full-name':     empresa.nombreEmpresa || '',
        'signature:integrity':    d.firma,
      });
      window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
    } catch (e) {
      alert('Error al iniciar el pago: ' + e.message);
      setLoadingPlan('');
    }
  };

  return (
    <DashboardLayout title="Planes y precios">
      <Head><title>Planes — agencIAme</title></Head>

      {/* Aviso trial */}
      {esTrial && (
        <div style={{
          background: trialVencido ? 'rgba(220,38,38,0.08)' : 'rgba(26,86,255,0.08)',
          border: `1px solid ${trialVencido ? 'rgba(220,38,38,0.3)' : 'rgba(26,86,255,0.3)'}`,
          borderRadius: 12, padding: '14px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>{trialVencido ? '🔒' : '⏱️'}</span>
          <div>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: trialVencido ? '#EF4444' : '#F9FAFB' }}>
              {trialVencido
                ? 'Tu período de prueba venció — elige un plan para continuar'
                : `Te quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} de prueba gratuita`}
            </div>
            <div style={{ fontFamily: F, fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              Todos los planes incluyen 30 días de garantía. Sin contratos, cancela cuando quieras.
            </div>
          </div>
        </div>
      )}

      {/* Aviso si Wompi no está configurado */}
      {!WOMPI_PUB && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24,
          fontFamily: F, fontSize: 13, color: '#FCD34D', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span>⚙️</span>
          <span>Los pagos en línea estarán disponibles muy pronto. Para contratar un plan escríbenos al <strong>310-505-6616</strong></span>
        </div>
      )}

      {/* Grid de planes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
        {PLANES.map((plan) => {
          const esPlanActual = empresa?.plan === plan.id && empresa?.planActivo && plan.id !== 'emprendedor';
          return (
            <div key={plan.id} style={{
              background: plan.popular ? `linear-gradient(145deg, ${plan.color}0F, #0C0F14)` : '#0C0F14',
              border: `${plan.popular ? 2 : 1}px solid ${plan.popular ? plan.color + '55' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 16, padding: '28px 24px',
              position: 'relative', display: 'flex', flexDirection: 'column',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff', padding: '3px 16px', borderRadius: 20,
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, fontFamily: F,
                  boxShadow: `0 4px 16px ${plan.color}55`, whiteSpace: 'nowrap',
                }}>MÁS POPULAR</div>
              )}

              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{plan.sub}</div>
              <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: '#F9FAFB', marginBottom: 16 }}>{plan.nombre}</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: F, fontSize: 34, fontWeight: 900, color: plan.color, letterSpacing: '-1px' }}>{formatCOP(plan.precio)}</span>
                <span style={{ fontFamily: F, fontSize: 13, color: '#4B5563' }}>/mes</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontFamily: F, fontSize: 13, color: '#9CA3AF', lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Métodos de pago */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {['PSE', 'Tarjeta', 'Nequi', 'Bancolombia'].map(m => (
                  <span key={m} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#6B7280', fontFamily: F }}>
                    {m}
                  </span>
                ))}
              </div>

              {esPlanActual ? (
                <div style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: plan.color + '15', border: `1px solid ${plan.color}33`, fontFamily: F, fontSize: 13, fontWeight: 700, color: plan.color }}>
                  ✓ Plan actual
                </div>
              ) : (
                <button onClick={() => iniciarPago(plan)} disabled={!!loadingPlan}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: loadingPlan ? 'wait' : 'pointer',
                    background: plan.popular ? plan.color : 'rgba(255,255,255,0.06)',
                    color: plan.popular ? '#fff' : '#D1D5DB',
                    fontFamily: F, fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                    boxShadow: plan.popular ? `0 4px 20px ${plan.color}44` : 'none',
                    opacity: loadingPlan && loadingPlan !== plan.id ? 0.5 : 1,
                  }}>
                  {loadingPlan === plan.id ? 'Preparando pago...' : `Elegir ${plan.nombre} →`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Garantía */}
      <div style={{ background: '#0C0F14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: '#F9FAFB', marginBottom: 2 }}>Garantía de 30 días o te devolvemos tu dinero</div>
          <div style={{ fontFamily: F, fontSize: 12, color: '#4B5563' }}>Pago 100% seguro con Wompi · PSE · Tarjeta · Nequi · Sin contratos</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="https://wompi.com/assets/img/brand/logo-wompi.svg" alt="Wompi" style={{ height: 24, opacity: 0.6 }} onError={e => e.target.style.display='none'} />
        </div>
      </div>
    </DashboardLayout>
  );
}
