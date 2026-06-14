// components/VerificarEmailBanner.js
// Banner global (se monta en _app.js) — avisa cuando el usuario se registró
// con correo/contraseña y todavía no confirmó su correo (link enviado por
// Firebase con enviarVerificacionEmail). Los logins con Google/GitHub no
// muestran esto, porque ya vienen verificados por el proveedor.

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/AuthContext';
import { enviarVerificacionEmail } from '../lib/firebase';

export default function VerificarEmailBanner() {
  const { user, emailSinVerificar } = useAuth();
  const [enviando, setEnviando]   = useState(false);
  const [cooldown, setCooldown]   = useState(false);
  const [recargando, setRecargando] = useState(false);

  if (!emailSinVerificar) return null;

  const reenviar = async () => {
    if (cooldown) return;
    setEnviando(true);
    try {
      await enviarVerificacionEmail(user);
      toast.success('Correo de verificación enviado a ' + user.email);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000); // evita spam: 30s
    } catch (err) {
      if (err?.code === 'auth/too-many-requests') {
        toast.error('Espera un poco antes de reenviar otro correo.');
      } else {
        toast.error('No se pudo enviar el correo. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const yaVerifique = async () => {
    setRecargando(true);
    try {
      await user.reload();
      window.location.reload();
    } catch {
      setRecargando(false);
    }
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 999,
      background: 'linear-gradient(90deg, #1A1306, #0F1623)',
      borderBottom: '1px solid rgba(255,107,0,0.25)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 14, flexWrap: 'wrap',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
    }}>
      <span style={{ color: '#FFB37A' }}>
        ⚠️ Verifica tu correo <strong style={{ color: '#FF6B00' }}>{user.email}</strong> para activar tu plan de WasapBot.
      </span>
      <button onClick={reenviar} disabled={enviando || cooldown} style={{
        background: 'transparent', border: '1px solid rgba(255,107,0,0.4)',
        borderRadius: 6, padding: '5px 14px', color: '#FF6B00',
        fontSize: 12, fontWeight: 600, cursor: enviando || cooldown ? 'default' : 'pointer',
        opacity: enviando || cooldown ? 0.5 : 1,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {cooldown ? 'Correo enviado ✓' : enviando ? 'Enviando...' : 'Reenviar correo'}
      </button>
      <button onClick={yaVerifique} disabled={recargando} style={{
        background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 6, padding: '5px 14px', color: 'rgba(255,255,255,0.5)',
        fontSize: 12, cursor: recargando ? 'default' : 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {recargando ? 'Comprobando...' : 'Ya verifiqué mi correo'}
      </button>
    </div>
  );
}
