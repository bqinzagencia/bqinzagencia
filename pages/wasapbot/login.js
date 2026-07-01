// pages/wasapbot/login.js
// Login exclusivo para WasapBot — redirige al panel de WasapBot, no al dashboard de agencIAme
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { loginWithGoogle, loginUser, db } from '../../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const F  = "'Inter', system-ui, sans-serif";
const FA = "'Abril Fatface', serif";

export default function WasapBotLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState('');

  // Si ya hay sesión activa en wasapbot, redirigir
  useEffect(() => {
    const saved = localStorage.getItem('wasapbot_empresa_id');
    if (saved) router.replace(`/wasapbot/panel/${saved}`);
  }, []);

  // Buscar empresa del usuario — múltiples fallbacks para compatibilidad
  const redirigirAlPanel = async (uid, emailUsuario) => {
    try {
      let empresaId = null;

      // Intento 1: buscar por ownerUid + producto wasapbot
      let snap = await getDocs(query(
        collection(db, 'empresas'),
        where('ownerUid', '==', uid),
        where('producto', '==', 'wasapbot'),
        limit(1)
      ));

      // Intento 2: buscar por ownerUid sin filtro de producto (empresas antiguas)
      if (snap.empty) {
        snap = await getDocs(query(
          collection(db, 'empresas'),
          where('ownerUid', '==', uid),
          limit(5)
        ));
        // Filtrar las que sean wasapbot o no tengan producto definido
        const docs = snap.docs.filter(d => {
          const prod = d.data().producto;
          return prod === 'wasapbot' || !prod || prod === '';
        });
        if (docs.length > 0) snap = { empty: false, docs };
        else snap = { empty: true, docs: [] };
      }

      // Intento 3: buscar por email + producto wasapbot
      if (snap.empty && emailUsuario) {
        snap = await getDocs(query(
          collection(db, 'empresas'),
          where('email', '==', emailUsuario),
          where('producto', '==', 'wasapbot'),
          limit(1)
        ));
      }

      // Intento 4: buscar por email sin filtro de producto
      if (snap.empty && emailUsuario) {
        snap = await getDocs(query(
          collection(db, 'empresas'),
          where('email', '==', emailUsuario),
          limit(5)
        ));
        const docs = snap.docs.filter(d => {
          const prod = d.data().producto;
          return prod === 'wasapbot' || !prod || prod === '';
        });
        if (docs.length > 0) snap = { empty: false, docs };
        else snap = { empty: true, docs: [] };
      }

      if (!snap.empty && snap.docs.length > 0) {
        empresaId = snap.docs[0].id;
        // Actualizar ownerUid y producto para futuros logins
        const { doc, updateDoc } = await import('firebase/firestore');
        const ref = doc(db, 'empresas', empresaId);
        await updateDoc(ref, {
          ownerUid: uid,
          producto: 'wasapbot',
        }).catch(() => {});

        localStorage.setItem('wasapbot_empresa_id', empresaId);
        router.replace(`/wasapbot/panel/${empresaId}`);
      } else {
        setError('No encontramos un negocio asociado a esta cuenta. ¿Quieres crear uno?');
        setLoading(false);
        setGLoading(false);
      }
    } catch (err) {
      setError('Error al buscar tu negocio: ' + err.message);
      setLoading(false);
      setGLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    try {
      const result = await loginWithGoogle();
      await redirigirAlPanel(result.user.uid, result.user.email);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Error al conectar con Google. Intenta de nuevo.');
      }
      setGLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Completa correo y contraseña'); return; }
    setLoading(true); setError('');
    try {
      const result = await loginUser(email, password);
      await redirigirAlPanel(result.user.uid, email);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'No existe una cuenta con ese correo',
        'auth/wrong-password':  'Contraseña incorrecta',
        'auth/invalid-email':   'Correo inválido',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
      };
      setError(msgs[err.code] || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ingresar — WasapBot</title>
        <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{__html:`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#04080C;color:#EFF4FF;font-family:${F};min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;overflow-x:hidden}
        input{outline:none;transition:border-color 0.2s}
        input:focus{border-color:rgba(37,211,102,0.5)!important}
        input::placeholder{color:#222}
        .g-btn:hover{background:#0E1A12!important;border-color:rgba(37,211,102,0.4)!important}
        .sbm-btn:hover{opacity:0.9;transform:translateY(-1px)}
        @keyframes loginFloat { 0%,100%{transform:translateY(-50%)} 50%{transform:translateY(calc(-50% - 14px))} }
        .login-robot { position:fixed; right:4%; top:50%; transform:translateY(-50%); width:380px; height:auto; opacity:0.35; pointer-events:none; animation:loginFloat 6s ease-in-out infinite; z-index:0; }
        @media(max-width:900px){ .login-robot{ display:none; } }
      `}}/>

      <img className="login-robot" src="/agenciame-robot-final.webp" alt="" />

      <div style={{width:'100%',maxWidth:420,position:'relative',zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <Link href="/wasapbot">
            <div style={{fontFamily:FA,fontSize:28,cursor:'pointer',display:'inline-block'}}>
              BQinzagenc<span style={{color:'#FF6B00',fontSize:32}}>IA</span>
              <span style={{fontFamily:F,fontSize:13,color:'#25D366',fontWeight:700,marginLeft:8,verticalAlign:'middle'}}>WasapBot</span>
            </div>
          </Link>
          <h1 style={{fontFamily:F,fontSize:20,fontWeight:600,marginTop:20,marginBottom:4,color:'#EFF4FF'}}>
            Accede a tu panel
          </h1>
          <p style={{color:'#2A2A2A',fontSize:13}}>Gestiona tu bot de WhatsApp</p>
        </div>

        <div style={{background:'#080E14',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:32}}>

          {/* Botón Google */}
          <button className="g-btn" onClick={handleGoogle} disabled={gLoading||loading}
            style={{display:'flex',alignItems:'center',gap:12,width:'100%',background:'#0A1020',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'12px 20px',cursor:'pointer',color:'#EFF4FF',fontSize:14,fontFamily:F,fontWeight:400,marginBottom:20,transition:'all 0.2s',opacity:(gLoading||loading)?0.6:1}}>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{gLoading ? 'Conectando...' : 'Continuar con Google'}</span>
          </button>

          {/* Divisor */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.06)'}}/>
            <span style={{fontSize:11,color:'#1A1A1A',letterSpacing:1,textTransform:'uppercase'}}>o con correo</span>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.06)'}}/>
          </div>

          {/* Formulario email */}
          <form onSubmit={handleEmail}>
            <input type="email" placeholder="correo@empresa.com" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',background:'#04080C',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'11px 14px',color:'#EFF4FF',fontFamily:F,fontSize:13,marginBottom:10}}/>
            <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',background:'#04080C',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'11px 14px',color:'#EFF4FF',fontFamily:F,fontSize:13,marginBottom:16}}/>

            {error && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,padding:'10px 12px',marginBottom:14,fontSize:13,color:'#EF4444',lineHeight:1.5}}>
                {error}
                {error.includes('¿Quieres activar') && (
                  <Link href="/wasapbot/activar" style={{display:'block',marginTop:8,color:'#25D366',fontWeight:600}}>
                    Activar mi WasapBot →
                  </Link>
                )}
              </div>
            )}

            <button type="submit" className="sbm-btn" disabled={loading||gLoading}
              style={{width:'100%',background:'linear-gradient(135deg,#25D366,#1DA851)',color:'#fff',border:'none',borderRadius:8,padding:'12px',fontFamily:F,fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.2s',opacity:(loading||gLoading)?0.7:1}}>
              {loading ? 'Ingresando...' : 'Ingresar al panel →'}
            </button>
          </form>
        </div>

        <p style={{textAlign:'center',marginTop:20,fontFamily:F,color:'#1A1A1A',fontSize:13}}>
          ¿No tienes WasapBot?{' '}
          <Link href="/wasapbot/activar" style={{color:'#25D366',fontWeight:600}}>Actívalo ahora</Link>
        </p>
        <p style={{textAlign:'center',marginTop:8,fontFamily:F,fontSize:12}}>
          <Link href="/wasapbot" style={{color:'rgba(255,255,255,0.2)'}}>← Volver a WasapBot</Link>
        </p>
      </div>
    </>
  );
}
