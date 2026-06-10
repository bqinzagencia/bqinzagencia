// pages/404.js
import Link from 'next/link';
import { Logo } from './index';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, textAlign: 'center', padding: 40 }}>
      <Logo size={24} />
      <div style={{ fontSize: 80, lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800 }}>Página no encontrada</h1>
      <p style={{ color: 'var(--gray5)', maxWidth: 400 }}>La página que buscas no existe o fue movida.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/" className="btn btn-accent">Ir al inicio</Link>
        <Link href="/dashboard" className="btn btn-ghost">Mi panel</Link>
      </div>
    </div>
  );
}
