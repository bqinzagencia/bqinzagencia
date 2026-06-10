// pages/dashboard/planes.js
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const F = "'Inter', system-ui, sans-serif";

// ── Configura aquí tus credenciales de ePayco ─────────────────────────────────
// Regístrate en https://epayco.com y reemplaza estos valores con los de tu panel
const EPAYCO_PUBLIC_KEY = 'TU_PUBLIC_KEY_EPAYCO';  // ← reemplazar
const EPAYCO_TEST       = true;                     // ← false en producción
// ──────────────────────────────────────────────────────────────────────────────

const PLANES = [
  {
    id:          'emprendedor',
    nombre:      'Emprendedor',
    precio:      149000,
    sub:         'Ideal para arrancar',
    color:       '#6B7280',
    features: [
      '1 Agente IA activo',
      '500 conversaciones/mes',
      'Chat web + WhatsApp',
      'CRM hasta 200 contactos',
      'Agendamiento basico',
      'Soporte por email',
    ],
  },
  {
    id:          'profesional',
    nombre:      'Profesional',
    precio:      349000,
    sub:         'El mas popular',
    color:       '#1A56FF',
    popular:     true,
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
    id:          'agencia',
    nombre:      'Agencia',
    precio:      890000,
    sub:         'Para equipos y agencias',
    color:       '#A78BFA',
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

  // Calcular días de trial
  let diasRestantes = 0;
  let trialVencido  = false;
  const esTrial = empresa?.plan === 'emprendedor';
  if (esTrial && empresa?.trialHasta) {
    const hasta = empresa.trialHasta?.toDate
      ? empresa.trialHasta.toDate()
      : new Date(empresa.trialHasta);
    const diff    = Math.ceil((hasta - new Date()) / (1000 * 60 * 60 * 24));
    diasRestantes = Math.max(0, diff);
    trialVencido  = diff <= 0;
  }

  function iniciarPago(plan) {
    if (typeof window === 'undefined' || !window.ePayco) {
      alert('La pasarela de pago aún está cargando, intenta en un momento.');
      return;
    }
    if (EPAYCO_PUBLIC_KEY === 'TU_PUBLIC_KEY_EPAYCO') {
      alert('⚙️ El administrador aún no ha configurado la pasarela de pagos. Contacta soporte.');
      return;
    }

    const handler = window.ePayco.checkout.configure({
      key:  EPAYCO_PUBLIC_KEY,
      test: EPAYCO_TEST,
    });

    handler.open({
      name:        `Plan ${plan.nombre} — agencIAme`,
      description: `Suscripción mensual Plan ${plan.nombre}${empresa?.nombreEmpresa ? ' — ' + empresa.nombreEmpresa : ''}`,
      invoice:     `INV-${Date.now()}`,
      currency:    'cop',
      amount:      String(plan.precio),
      tax_base:    '0',
      tax:         '0',
      country:     'co',
      lang:        'es',
      response:    `${window.location.origin}/dashboard/pago-respuesta`,
      confirmation:`${window.location.origin}/api/epayco-confirmacion`,
      email_billing: empresa?.emailAdmin || '',
      extra1: empresa?.id || '',
      extra2: plan.id,
    });
  }

  // Cargar script ePayco una vez
  if (typeof window !== 'undefined' && !document.getElementById('epayco-script')) {
    const s   = document.createElement('script');
    s.id      = 'epayco-script';
    s.src     = 'https://checkout.epayco.co/checkout.js';
    document.head.appendChild(s);
  }

  return (
    <DashboardLayout title="Planes y precios">
      <Head><title>Planes — agencIAme</title></Head>

      {/* Aviso de trial */}
      {esTrial && (
        <div style={{
          background: trialVencido ? 'rgba(220,38,38,0.08)' : 'rgba(26,86,255,0.08)',
          border: `1px solid ${trialVencido ? 'rgba(220,38,38,0.3)' : 'rgba(26,86,255,0.3)'}`,
          borderRadius: 12, padding: '14px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>{trialVencido ? '🔒' : '🕐'}</span>
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

      {/* Grid de planes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
        {PLANES.map((plan) => {
          const esPlanActual = empresa?.plan === plan.id && !esTrial;
          return (
            <div
              key={plan.id}
              style={{
                background: plan.popular ? `linear-gradient(145deg, ${plan.color}0F, #0C0F14)` : '#0C0F14',
                border: `${plan.popular ? 2 : 1}px solid ${plan.popular ? plan.color + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, padding: '28px 24px',
                position: 'relative', display: 'flex', flexDirection: 'column',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff', padding: '3px 16px', borderRadius: 20,
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, fontFamily: F,
                  boxShadow: `0 4px 16px ${plan.color}55`,
                }}>
                  MÁS POPULAR
                </div>
              )}

              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: plan.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                {plan.sub}
              </div>
              <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: '#F9FAFB', marginBottom: 16 }}>
                {plan.nombre}
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: F, fontSize: 34, fontWeight: 900, color: plan.color, letterSpacing: '-1px' }}>
                  {formatCOP(plan.precio)}
                </span>
                <span style={{ fontFamily: F, fontSize: 13, color: '#4B5563' }}>/mes</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontFamily: F, fontSize: 13, color: '#9CA3AF' }}>{f}</span>
                  </li>
                ))}
              </ul>

              {esPlanActual ? (
                <div style={{
                  textAlign: 'center', padding: '12px', borderRadius: 10,
                  background: plan.color + '15', border: `1px solid ${plan.color}33`,
                  fontFamily: F, fontSize: 13, fontWeight: 700, color: plan.color,
                }}>
                  ✓ Plan actual
                </div>
              ) : (
                <button
                  onClick={() => iniciarPago(plan)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: plan.popular ? plan.color : 'rgba(255,255,255,0.06)',
                    color: plan.popular ? '#fff' : '#D1D5DB',
                    fontFamily: F, fontSize: 14, fontWeight: 700,
                    transition: 'all 0.15s',
                    boxShadow: plan.popular ? `0 4px 20px ${plan.color}44` : 'none',
                  }}
                  onMouseEnter={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
                >
                  Elegir {plan.nombre} →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Garantía */}
      <div style={{
        background: '#0C0F14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: '#F9FAFB', marginBottom: 2 }}>
            Garantía de 30 días o te devolvemos tu dinero
          </div>
          <div style={{ fontFamily: F, fontSize: 12, color: '#4B5563' }}>
            Pago 100% seguro vía PSE o tarjeta · Sin contratos · Cancela en cualquier momento
          </div>
        </div>
        {EPAYCO_PUBLIC_KEY === 'TU_PUBLIC_KEY_EPAYCO' && (
          <div style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '8px 14px', fontFamily: F, fontSize: 12, color: '#F59E0B' }}>
            ⚙️ Configura tu clave de ePayco para activar los pagos
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
