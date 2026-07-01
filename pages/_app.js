// pages/_app.js
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const ModalBienvenida      = dynamic(() => import('../components/ModalBienvenida'),      { ssr: false });
const VerificarEmailBanner = dynamic(() => import('../components/VerificarEmailBanner'),  { ssr: false });
const AsesorWasapbot       = dynamic(() => import('../components/AsesorWasapbot'),        { ssr: false });

// ── Tracker de visitas propio ────────────────────────────────────────────────
// sessionId: único por pestaña/sesión (sessionStorage)
// visitorId: persistente entre sesiones (localStorage)
// Registra pageviews y tiempo en página. Filtra bots por User-Agent.
function getOrCreate(key, storage) {
  try {
    let v = storage.getItem(key);
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); storage.setItem(key, v); }
    return v;
  } catch { return 'anon'; }
}

function usePageTracker() {
  const router   = useRouter();
  const startRef = useRef(Date.now());
  const prevPath = useRef(null);

  useEffect(() => {
    const skip = ['/admin', '/wasapbot/panel', '/dashboard'];
    if (skip.some(p => router.pathname.startsWith(p))) return;
    if (typeof navigator === 'undefined') return;
    if (/bot|crawl|spider|lighthouse|chrome-lighthouse/i.test(navigator.userAgent)) return;

    const sessionId = getOrCreate('bq_sid', sessionStorage);
    const visitorId = getOrCreate('bq_vid', localStorage);
    const isNew     = !localStorage.getItem('bq_returning');
    if (isNew) localStorage.setItem('bq_returning', '1');

    // Enviar tiempo en página anterior
    if (prevPath.current) {
      const spent = Math.round((Date.now() - startRef.current) / 1000);
      navigator.sendBeacon?.('/api/track-visit', JSON.stringify({
        type: 'time', path: prevPath.current, seconds: spent, sessionId, visitorId,
      }));
    }

    // Registrar nuevo pageview
    startRef.current = Date.now();
    prevPath.current = router.pathname;
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pageview', path: router.pathname, sessionId, visitorId, isNew, ref: document.referrer }),
    }).catch(() => {});

    // Tiempo al cerrar pestaña
    const onUnload = () => {
      const spent = Math.round((Date.now() - startRef.current) / 1000);
      navigator.sendBeacon?.('/api/track-visit', JSON.stringify({
        type: 'time', path: router.pathname, seconds: spent, sessionId, visitorId,
      }));
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [router.pathname]);
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const esPaginaPrincipal = router.pathname === '/';
  usePageTracker();

  const sinChatbot = ['/wasapbot/panel', '/dashboard', '/legal/terminos', '/legal/privacidad'];
  const mostrarChatbot = !sinChatbot.some(p => router.pathname.startsWith(p));

  return (
    <div className={`${inter.className} ${inter.variable}`} style={{ minHeight: '100vh' }}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1E26', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontFamily: "'Inter', system-ui, sans-serif" },
            success: { iconTheme: { primary: '#2563EB', secondary: '#0F1623' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#0F1623' } },
          }}
        />
        <VerificarEmailBanner />
        <Component {...pageProps} />
        {esPaginaPrincipal && <ModalBienvenida />}
        {mostrarChatbot && <AsesorWasapbot modo="ventas" />}
      </AuthProvider>
    </div>
  );
}
