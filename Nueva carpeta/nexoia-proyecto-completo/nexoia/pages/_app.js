// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1E26',
            color: '#FAFAF8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#00E5A0', secondary: '#080B0F' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#080B0F' } },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
