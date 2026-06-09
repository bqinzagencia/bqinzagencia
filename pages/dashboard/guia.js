// pages/dashboard/guia.js
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PASOS = [
  {
    num: '01',
    titulo: 'Crea tu Agente IA',
    donde: 'Menú → Mis Agentes IA',
    color: '#2563EB',
    foto: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
    pasos: [
      'Haz clic en "+ Nuevo Agente IA"',
      'Dale un nombre (ej: "Asistente de ventas")',
      'Escoge el tipo: Ventas, Atención, Agendamiento, etc.',
      'Selecciona los canales: Chat Web y/o WhatsApp',
      'Escribe cómo quieres que se comporte (o déjalo por defecto)',
      'Haz clic en "Crear agente IA"',
    ],
    tip: 'Empieza con 1 agente. Nómbralo con el nombre de tu negocio, ej: "Asistente Peluquería Luna".',
  },
  {
    num: '02',
    titulo: 'Configura la información de tu negocio',
    donde: 'Menú → Crea tu Web → Pestaña "Configuración Web"',
    color: '#06B6D4',
    foto: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
    pasos: [
      'Agrega tus servicios con nombre, precio y duración',
      'Configura tus horarios de atención día por día',
      'Escribe la dirección, ciudad y teléfono del negocio',
      'Agrega las formas de pago que aceptas',
      'Escribe las preguntas frecuentes que te hacen los clientes',
      'Haz clic en "Guardar configuración web"',
    ],
    tip: 'Entre más completa sea esta información, mejor responderá tu agente IA a los clientes.',
  },
  {
    num: '03',
    titulo: 'Instala el chat en tu página web',
    donde: 'Menú → Integra Chat IA a tu Web',
    color: '#10B981',
    foto: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
    pasos: [
      'Ve a "Integra Chat IA a tu Web" en el menú',
      'Selecciona tu tipo de página: HTML, WordPress o React',
      'Haz clic en "Copiar código"',
      'Pega ese código en tu página web antes del cierre </body>',
      'Guarda los cambios y abre tu página',
      'Verifica que aparezca el botón 💬 en la esquina inferior derecha',
    ],
    tip: '¿No sabes qué tipo de página tienes? Lee la guía abajo o contáctanos — te ayudamos a instalarlo gratis.',
  },
  {
    num: '04',
    titulo: 'Revisa tus conversaciones y clientes',
    donde: 'Menú → Conversaciones y Clientes / CRM',
    color: '#8B5CF6',
    foto: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&q=80',
    pasos: [
      'En "Conversaciones" ves todos los chats en tiempo real',
      'En "Clientes / CRM" ves los contactos capturados automáticamente',
      'El agente IA guarda el nombre y teléfono de cada cliente',
      'Puedes cambiar el estado: Nuevo → Contactado → Cliente',
      'En "Agenda" ves las citas que el agente programó automáticamente',
    ],
    tip: 'Tu agente captura leads 24/7 aunque tú estés dormido. Revisa el CRM cada mañana.',
  },
];

const TIPOS_WEB = [
  {
    tipo: 'WordPress',
    color: '#21759B',
    foto: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&q=80',
    como: 'Ve al panel de WordPress → Apariencia → Editor de temas → archivo functions.php → pega el código al final → Guardar.',
    señales: ['wp-content/themes/', 'wp-includes/', 'wordpress'],
  },
  {
    tipo: 'Wix / página normal',
    color: '#FAAD00',
    foto: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&q=80',
    como: 'En el editor de Wix: Menú → Configuración → Código personalizado → pega antes del </body>. En HTML: abre tu archivo index.html y pega antes de </body>.',
    señales: ['wix.com', '.html', 'sin frameworks'],
  },
  {
    tipo: 'Shopify',
    color: '#96BF48',
    foto: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80',
    como: 'Panel Shopify → Tienda en línea → Temas → Editar código → theme.liquid → pega antes de </body>.',
    señales: ['shopify.com', 'myshopify', 'cdn.shopify'],
  },
  {
    tipo: 'No tengo página web',
    color: '#F97316',
    foto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80',
    como: 'Usa "Crea tu Web con un Click" en el menú. Sube una foto de tu negocio, agrega tus servicios y tendrás una página web lista en minutos — incluida con tu plan.',
    señales: ['Sin página web todavía'],
  },
];

const PREGUNTAS = [
  {
    q: '¿La IA responde en mi idioma y con el nombre de mi negocio?',
    a: 'Sí. Cuando configuras la información de tu negocio en "Configuración Web", el agente aprende todo sobre ti: nombre, servicios, precios, horarios. Responde en español colombiano con el tono que tú definas.',
  },
  {
    q: '¿Qué pasa si el cliente pregunta algo que la IA no sabe?',
    a: 'El agente responde que no tiene esa información y sugiere que el cliente llame o escriba por WhatsApp directamente. Nunca inventa información.',
  },
  {
    q: '¿Cómo sé si el chat está funcionando en mi página?',
    a: 'Abre tu página web en el navegador. Si instalaste el código correctamente, verás un botón 💬 en la esquina inferior derecha. Haz clic y escribe "Hola" — debes recibir respuesta en menos de 3 segundos.',
  },
  {
    q: '¿Qué pasa cuando un cliente agenda una cita?',
    a: 'El agente detecta automáticamente cuando alguien quiere una cita, pide nombre, servicio y fecha. Luego confirma la cita y la guarda en tu "Agenda" del dashboard. También agrega al cliente en tu CRM.',
  },
  {
    q: '¿Puedo tener el chat en WhatsApp también?',
    a: 'Sí, en los planes Emprendedor y superiores puedes activar WhatsApp como canal. El proceso de conexión requiere una cuenta de WhatsApp Business. Ve a "Mis Agentes IA" y selecciona WhatsApp al crear o editar tu agente.',
  },
  {
    q: '¿Qué hago si llego al límite de mi plan?',
    a: 'El sistema te avisa cuando estés al 80% del límite. Cuando llegues al máximo, puedes actualizar tu plan desde "Planes y Precios". Tu historial y configuración se conservan al cambiar de plan.',
  },
];

export default function Guia() {
  const { empresa, loading } = useAuth();
  const router = useRouter();
  const [faqAbierto, setFaqAbierto] = useState(null);
  const [pasoActivo, setPasoActivo] = useState(0);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const F = "'Inter', system-ui, sans-serif";
  const paso = PASOS[pasoActivo];

  return (
    <>
      <Head><title>Guía de inicio — agencIAme</title></Head>
      <DashboardLayout title="¿Cómo funciona todo?">

        {/* HERO */}
        <div style={{ background: 'linear-gradient(135deg, #141C2F 0%, #1E2A42 100%)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 20, padding: '32px 36px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#06B6D4', marginBottom: 10 }}>
              Guía de inicio rápido
            </div>
            <h2 style={{ fontFamily: F, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F0F4FF', marginBottom: 10, lineHeight: 1.2 }}>
              Todo lo que necesitas saber<br />para activar tu IA hoy
            </h2>
            <p style={{ fontFamily: F, fontSize: 14, color: '#9AAAC4', maxWidth: 480 }}>
              En {empresa?.nombreEmpresa || 'tu negocio'} puedes tener un agente de IA respondiendo clientes, agendando citas y capturando leads — sin saber programación.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {PASOS.map((p, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === pasoActivo ? '#2563EB' : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setPasoActivo(i)} />
            ))}
          </div>
        </div>

        {/* PASOS INTERACTIVOS */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: F, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7A99', marginBottom: 20 }}>
            4 pasos para empezar
          </h3>

          {/* Tabs de pasos */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {PASOS.map((p, i) => (
              <button key={i} onClick={() => setPasoActivo(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, border: `1px solid ${i === pasoActivo ? p.color : 'rgba(255,255,255,0.06)'}`, background: i === pasoActivo ? p.color + '15' : 'transparent', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600, color: i === pasoActivo ? p.color : '#6B7A99', transition: 'all 0.2s' }}>
                <span style={{ fontWeight: 800 }}>{p.num}</span>
                <span>{p.titulo}</span>
              </button>
            ))}
          </div>

          {/* Contenido del paso activo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, background: '#141C2F', border: `1px solid ${paso.color}33`, borderRadius: 20, overflow: 'hidden' }}>
            {/* Foto */}
            <div style={{ position: 'relative', minHeight: 300 }}>
              <img src={paso.foto} alt={paso.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, #141C2F 100%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                <span style={{ background: paso.color, color: '#fff', fontFamily: F, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Paso {paso.num}
                </span>
              </div>
            </div>

            {/* Instrucciones */}
            <div style={{ padding: '28px 28px 28px 8px' }}>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: paso.color, marginBottom: 8 }}>
                {paso.donde}
              </div>
              <h3 style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#F0F4FF', marginBottom: 20, letterSpacing: '-0.02em' }}>
                {paso.titulo}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {paso.pasos.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: paso.color + '20', border: `1px solid ${paso.color}40`, color: paso.color, fontFamily: F, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 14, color: '#C8D4E8', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: paso.color + '10', border: `1px solid ${paso.color}25`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <span style={{ fontFamily: F, fontSize: 13, color: '#9AAAC4', lineHeight: 1.5 }}>{paso.tip}</span>
              </div>
            </div>
          </div>

          {/* Navegación entre pasos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button onClick={() => setPasoActivo(i => Math.max(0, i - 1))} disabled={pasoActivo === 0}
              className="btn btn-ghost" style={{ opacity: pasoActivo === 0 ? 0.3 : 1 }}>
              ← Paso anterior
            </button>
            {pasoActivo < PASOS.length - 1 ? (
              <button onClick={() => setPasoActivo(i => i + 1)} className="btn btn-accent">
                Siguiente paso →
              </button>
            ) : (
              <button onClick={() => router.push('/dashboard/agentes')} className="btn btn-accent">
                ¡Crear mi primer agente! →
              </button>
            )}
          </div>
        </div>

        {/* TIPOS DE PÁGINA WEB */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: F, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7A99', marginBottom: 6 }}>
            ¿Cómo instalo el chat según mi tipo de página?
          </h3>
          <p style={{ fontFamily: F, fontSize: 14, color: '#6B7A99', marginBottom: 20 }}>
            Si no sabes qué tipo de página tienes, haz clic derecho en tu web → "Ver código fuente" y busca las palabras clave de cada tipo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {TIPOS_WEB.map((t, i) => (
              <div key={i} style={{ background: '#141C2F', border: `1px solid ${t.color}30`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                  <img src={t.foto} alt={t.tipo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #141C2F 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
                    <span style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#F0F4FF' }}>{t.tipo}</span>
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontFamily: F, fontSize: 13, color: '#9AAAC4', lineHeight: 1.6, marginBottom: 12 }}>{t.como}</p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
                    <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7A99', marginBottom: 6 }}>Cómo identificarla:</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {t.señales.map((s, j) => (
                        <span key={j} style={{ background: t.color + '15', color: t.color, fontFamily: F, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREGUNTAS FRECUENTES */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: F, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7A99', marginBottom: 20 }}>
            Preguntas frecuentes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREGUNTAS.map((faq, i) => (
              <div key={i} style={{ background: '#141C2F', border: `1px solid ${faqAbierto === i ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                  style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: faqAbierto === i ? '#F0F4FF' : '#C8D4E8', textAlign: 'left', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{ color: faqAbierto === i ? '#2563EB' : '#6B7A99', fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: faqAbierto === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {faqAbierto === i && (
                  <div style={{ padding: '0 20px 16px', fontFamily: F, fontSize: 14, color: '#9AAAC4', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 20, padding: '32px 36px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#F0F4FF', marginBottom: 10, letterSpacing: '-0.02em' }}>
            ¿Necesitas ayuda para instalarlo?
          </h3>
          <p style={{ fontFamily: F, fontSize: 14, color: '#9AAAC4', marginBottom: 24 }}>
            Te ayudamos a instalar el chat en tu página web sin costo adicional.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/573105056616?text=Hola, necesito ayuda para instalar el chat de agencIAme en mi página web"
              target="_blank" rel="noreferrer"
              style={{ background: '#25D366', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 100, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              💬 Escribir por WhatsApp
            </a>
            <a href="mailto:soportesistemas@soporteia.net?subject=Necesito ayuda con agencIAme"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#C8D4E8', fontFamily: F, fontWeight: 600, fontSize: 14, padding: '12px 24px', borderRadius: 100, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ✉️ Enviar email
            </a>
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
