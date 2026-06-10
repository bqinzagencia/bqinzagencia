// pages/dashboard/whatsapp.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const F      = "'Inter', system-ui, sans-serif";
const ACCENT = '#25D366';
const WA_SERVER = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';

const card = {
  background: '#111827',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 18,
  padding: 28,
  marginBottom: 20,
};

export default function WhatsApp() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  const [status, setStatus]     = useState('idle'); // idle | loading | qr_ready | connected | disconnected
  const [qrBase64, setQrBase64] = useState(null);
  const [numero, setNumero]     = useState(null);
  const [activando, setActivando] = useState(false);
  const [desconectando, setDesconectando] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  // Leer estado inicial desde empresa
  useEffect(() => {
    if (empresa) {
      const wa = empresa.whatsapp || {};
      if (wa.status === 'connected') {
        setStatus('connected');
        setNumero(wa.numero || null);
      } else if (wa.status === 'qr_ready' && wa.qrBase64) {
        setStatus('qr_ready');
        setQrBase64(wa.qrBase64);
        iniciarPolling();
      }
    }
  }, [empresa]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const empresaId = user.uid;

  // ── Polling: verificar si ya se escaneó el QR ────────────────────────
  function iniciarPolling() {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/wa-status?empresaId=${empresaId}`);
        const d = await r.json();
        if (d.status === 'connected') {
          clearInterval(pollRef.current);
          setStatus('connected');
          setNumero(d.numero);
          setQrBase64(null);
          toast.success('¡WhatsApp conectado! El bot ya está activo 🎉');
        } else if (d.qrBase64) {
          setQrBase64(d.qrBase64);
        }
      } catch {}
    }, 3000);
  }

  // ── Activar / generar QR ─────────────────────────────────────────────
  const activar = async () => {
    setActivando(true);
    setStatus('loading');
    try {
      const r = await fetch('/api/wa-activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId }),
      });
      const d = await r.json();
      if (d.ok) {
        setStatus('qr_ready');
        setQrBase64(d.qrBase64 || null);
        iniciarPolling();
        toast('Escanea el QR con tu WhatsApp 📱', { icon: '📲' });
      } else {
        toast.error(d.error || 'Error al activar');
        setStatus('idle');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
      setStatus('idle');
    } finally {
      setActivando(false);
    }
  };

  // ── Desconectar ──────────────────────────────────────────────────────
  const desconectar = async () => {
    if (!confirm('¿Seguro que quieres desconectar WhatsApp? El bot dejará de responder.')) return;
    setDesconectando(true);
    try {
      await fetch('/api/wa-desconectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId }),
      });
      setStatus('idle');
      setNumero(null);
      setQrBase64(null);
      clearInterval(pollRef.current);
      toast.success('WhatsApp desconectado');
    } catch {
      toast.error('Error al desconectar');
    } finally {
      setDesconectando(false);
    }
  };

  const nombre = empresa.nombreEmpresa || 'Mi Negocio';

  return (
    <>
      <Head><title>WhatsApp IA — {nombre} | agencIAme</title></Head>
      <DashboardLayout title="WhatsApp IA">

        {/* HEADER */}
        <p style={{ fontFamily: F, color: '#8A9BB5', fontSize: 15, marginBottom: 32, maxWidth: 620, lineHeight: 1.65 }}>
          Conecta tu número de WhatsApp y el agente IA responderá automáticamente a tus clientes, 24 horas al día.
        </p>

        {/* ESTADO ACTUAL */}
        <div style={{ ...card, borderColor: status === 'connected' ? 'rgba(37,211,102,0.3)' : 'rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Icono WhatsApp */}
              <div style={{ width: 52, height: 52, borderRadius: 16, background: status === 'connected' ? 'rgba(37,211,102,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                📱
              </div>
              <div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 18, color: '#EFF4FF', letterSpacing: '-0.02em' }}>
                  {status === 'connected' ? `+${numero || 'Conectado'}` : 'WhatsApp Bot'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'connected' ? '#25D366' : status === 'loading' || status === 'qr_ready' ? '#F59E0B' : '#6B7A99' }} />
                  <span style={{ fontFamily: F, fontSize: 13, color: status === 'connected' ? '#34D399' : status === 'loading' || status === 'qr_ready' ? '#FCD34D' : '#6B7A99' }}>
                    {status === 'connected'  ? 'Conectado — Bot activo' :
                     status === 'loading'    ? 'Iniciando...' :
                     status === 'qr_ready'  ? 'Esperando escaneo QR...' :
                     'Desconectado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón acción */}
            {status === 'connected' ? (
              <button onClick={desconectar} disabled={desconectando}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, padding: '10px 24px', fontFamily: F, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {desconectando ? 'Desconectando...' : 'Desconectar'}
              </button>
            ) : status === 'idle' || status === 'disconnected' ? (
              <button onClick={activar} disabled={activando}
                style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 100, padding: '12px 28px', fontFamily: F, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 24px rgba(37,211,102,0.35)' }}>
                {activando ? 'Iniciando...' : '📲 Activar WhatsApp'}
              </button>
            ) : null}
          </div>
        </div>

        {/* QR CODE */}
        {status === 'qr_ready' && (
          <div style={{ ...card, textAlign: 'center', borderColor: 'rgba(37,211,102,0.2)' }}>
            <h3 style={{ fontFamily: F, fontWeight: 800, fontSize: 20, color: '#EFF4FF', marginBottom: 8 }}>
              Escanea el código QR
            </h3>
            <p style={{ fontFamily: F, fontSize: 14, color: '#8A9BB5', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
              Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular dispositivo → Escanea este código
            </p>

            {qrBase64 ? (
              <div style={{ display: 'inline-block', background: '#fff', padding: 20, borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
                <img src={qrBase64} alt="QR WhatsApp" style={{ width: 240, height: 240, display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: 280, height: 280, background: '#0A0F1E', borderRadius: 20, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontFamily: F, fontSize: 13, color: '#FCD34D' }}>Esperando escaneo... el QR expira en 60 segundos</span>
            </div>

            <button onClick={activar} style={{ marginTop: 16, background: 'transparent', color: '#6B7A99', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 20px', fontFamily: F, fontSize: 13, cursor: 'pointer' }}>
              🔄 Generar nuevo QR
            </button>
          </div>
        )}

        {/* CONECTADO — INFO */}
        {status === 'connected' && (
          <div style={{ ...card, borderColor: 'rgba(37,211,102,0.2)', background: 'rgba(37,211,102,0.05)' }}>
            <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: '#34D399', marginBottom: 16 }}>
              ✅ Bot de WhatsApp activo
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: '🤖', titulo: 'Responde automáticamente', desc: 'El agente IA atiende mensajes 24/7 sin que intervengas.' },
                { icon: '📋', titulo: 'Guarda en CRM', desc: 'Cada cliente que escribe queda registrado en tus contactos.' },
                { icon: '💬', titulo: 'Historial de conversaciones', desc: 'Revisa todas las conversaciones en la sección Conversaciones.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#0A0F1E', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: '#EFF4FF', marginBottom: 6 }}>{item.titulo}</div>
                  <div style={{ fontFamily: F, fontSize: 13, color: '#6B7A99', lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CÓMO FUNCIONA */}
        {status !== 'connected' && (
          <div style={card}>
            <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: '#EFF4FF', marginBottom: 20 }}>
              ¿Cómo funciona?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { n: '1', titulo: 'Haz clic en "Activar WhatsApp"', desc: 'El sistema genera un código QR único para tu número.' },
                { n: '2', titulo: 'Escanea el QR con tu teléfono', desc: 'Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo.' },
                { n: '3', titulo: 'El bot queda activo', desc: 'Desde ese momento, el agente IA responde automáticamente a tus clientes.' },
                { n: '4', titulo: 'Tú supervisas desde el dashboard', desc: 'Revisa conversaciones, contactos nuevos y estadísticas en tiempo real.' },
              ].map((paso, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: i < 3 ? 20 : 0, position: 'relative' }}>
                  {i < 3 && <div style={{ position: 'absolute', left: 18, top: 36, width: 2, height: 'calc(100% - 16px)', background: 'rgba(37,211,102,0.15)', borderRadius: 1 }} />}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 800, fontSize: 13, flexShrink: 0, zIndex: 1 }}>
                    {paso.n}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: '#EFF4FF', marginBottom: 3 }}>{paso.titulo}</div>
                    <div style={{ fontFamily: F, fontSize: 13, color: '#6B7A99', lineHeight: 1.55 }}>{paso.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADVERTENCIA */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontFamily: F, fontSize: 13, color: '#FCD34D', lineHeight: 1.6 }}>
            <strong>Importante:</strong> Usa un número de WhatsApp dedicado para el bot. No uses tu número personal principal, ya que mientras el bot esté activo ese número estará vinculado como dispositivo adicional.
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
