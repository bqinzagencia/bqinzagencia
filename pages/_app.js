// pages/_app.js
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// ── Inter cargada nativamente con next/font — sin parpadeo, sin FOUT, máxima nitidez
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const ModalBienvenida = dynamic(() => import('../components/ModalBienvenida'), { ssr: false });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const esPaginaPrincipal = router.pathname === '/';

  return (
    // Aplica la clase + variable CSS a toda la app
    <div className={`${inter.className} ${inter.variable}`} style={{ minHeight: '100vh' }}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1E26',
              color: '#F0F4FF',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            success: { iconTheme: { primary: '#2563EB', secondary: '#0F1623' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#0F1623' } },
          }}
        />
        <Component {...pageProps} />
        {esPaginaPrincipal && <ModalBienvenida />}
      </AuthProvider>
    </div>
  );
}
