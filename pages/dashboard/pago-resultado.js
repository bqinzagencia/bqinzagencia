// pages/dashboard/pago-resultado.js
// Página de retorno después del pago en Wompi
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const F = "'Inter', system-ui, sans-serif";

export default function PagoResultado() {
  const router = useRouter();
  const [estado, setEstado] = useState('cargando');
  const [detalle, setDetalle] = useState({});

  useEffect(() => {
    if (!router.isReady) return;
    const { id, status } = router.query;
    // Wompi redirige con ?id=TX_ID&status=APPROVED|DECLINED|PENDING
    if (status === 'APPROVED') setEstado('aprobado');
    else if (status === 'DECLINED') setEstado('rechazado');
    else if (status === 'PENDING') setEstado('pendiente');
    else setEstado('desconocido');
    setDetalle({ id, status });
  }, [router.isReady, router.query]);

  const configs = {
    cargando: {
      emoji: '⏳', color: '#6B7280',
      titulo: 'Verificando pago...',
      desc: 'Espera un momento.',
    },
    aprobado: {
      emoji: '🎉', color: '#10B981',
      titulo: '¡Pago exitoso!',
      desc: 'Tu plan ha sido activado. Ya puedes usar todas las funciones desbloqueadas.',
      boton: { texto: 'Ir al dashboard', href: '/dashboard' },
    },
    rechazado: {
      emoji: '❌', color: '#EF4444',
      titulo: 'Pago rechazado',
      desc: 'El pago no fue aprobado. Verifica los datos de tu método de pago e intenta de nuevo.',
      boton: { texto: 'Volver a planes', href: '/dashboard/planes' },
    },
    pendiente: {
      emoji: '⏱️', color: '#F59E0B',
      titulo: 'Pago en proceso',
      desc: 'Tu pago está siendo procesado. Recibirás una confirmación cuando se complete (puede tomar unos minutos con PSE).',
      boton: { texto: 'Ir al dashboard', href: '/dashboard' },
    },
    desconocido: {
      emoji: '❓', color: '#6B7280',
      titulo: 'Estado desconocido',
      desc: 'Si realizaste el pago, espera unos minutos y recarga el dashboard. Si el problema persiste, contáctanos.',
      boton: { texto: 'Ir al dashboard', href: '/dashboard' },
    },
  };

  const c = configs[estado] || configs.desconocido;

  return (
    <>
      <Head><title>Resultado del pago — agencIAme</title></Head>
      <style>{`body { background: #0A0F1E; color: #EFF4FF; font-family: ${F}; margin: 0; }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '48px 40px', maxWidth: 460, width: '100%', textAlign: 'center' }}>

          <div style={{ fontSize: 64, marginBottom: 24 }}>{c.emoji}</div>

          <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: c.color, marginBottom: 12, letterSpacing: '-0.03em' }}>
            {c.titulo}
          </div>

          <p style={{ fontFamily: F, fontSize: 15, color: '#8A9BB5', lineHeight: 1.65, marginBottom: 32 }}>
            {c.desc}
          </p>

          {detalle.id && (
            <div style={{ background: '#0A0F1E', borderRadius: 10, padding: '10px 16px', marginBottom: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#4B6080' }}>
              Transacción: {detalle.id}
            </div>
          )}

          {c.boton && (
            <Link href={c.boton.href} style={{
              display: 'inline-block', background: c.color, color: '#fff',
              borderRadius: 100, padding: '13px 32px', fontFamily: F,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: `0 6px 24px ${c.color}44`,
            }}>
              {c.boton.texto} →
            </Link>
          )}

          <div style={{ marginTop: 24, fontFamily: F, fontSize: 12, color: '#374151' }}>
            ¿Problemas? Escríbenos al{' '}
            <a href="https://wa.me/573105056616" style={{ color: '#25D366' }}>310-505-6616</a>
          </div>
        </div>
      </div>
    </>
  );
}
