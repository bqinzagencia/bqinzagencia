// pages/dashboard/chat/[agenteId].js
// Interfaz de chat con el agente IA

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../lib/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { db } from '../../../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ChatAgente() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const { agenteId } = router.query;
  const [agente, setAgente] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user && agenteId) loadAgente();
  }, [user, agenteId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAgente = async () => {
    const snap = await getDoc(doc(db, 'empresas', user.uid, 'agentes', agenteId));
    if (snap.exists()) {
      const ag = { id: snap.id, ...snap.data() };
      setAgente(ag);
      setMessages([{
        role: 'assistant',
        content: 'Hola, soy ' + ag.nombre + '. En que te puedo ayudar hoy?',
      }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          agente: { id: agente.id, nombre: agente.nombre, tipo: agente.tipo, personalidad: agente.personalidad, prompt: agente.prompt },
          empresa: { id: empresa.id || user.uid, nombreEmpresa: empresa.nombreEmpresa, industria: empresa.industria, ciudad: empresa.ciudad, telefono: empresa.telefono },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
        try {
          await addDoc(collection(db, 'empresas', user.uid, 'conversaciones'), {
            agenteId,
            agenteNombre: agente.nombre,
            canal: 'Chat Web',
            nombre: userMsg.content.substring(0, 30),
            ultimoMensajeTexto: data.reply.substring(0, 60),
            mensajeUsuario: userMsg.content,
            mensajeAgente: data.reply,
            tokensUsados: data.tokensUsados || 0,
            citaGuardada: data.citaGuardada || null,
            ultimoMensaje: serverTimestamp(),
            creadoEn: serverTimestamp(),
          });
        } catch (e) { console.error('Conv error:', e); }
      } else {
        toast.error(data.error || 'Error al obtener respuesta');
      }
    } catch (e) {
      toast.error('Error de conexion');
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;
  if (!agente) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>{'Chat: ' + agente.nombre + ' — NEXOIA'}</title></Head>
      <DashboardLayout title={'Chat: ' + agente.nombre}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', background: 'var(--gray1)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16 }}>{agente.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)' }}>En linea</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => router.push('/dashboard/agentes')}>← Volver</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, alignSelf: 'flex-end' }}>🤖</div>
                )}
                <div style={{ maxWidth: '70%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--gray2)', color: msg.role === 'user' ? '#000' : 'var(--gray7)', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginLeft: 10, alignSelf: 'flex-end' }}>👤</div>
                )}
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <div style={{ background: 'var(--gray2)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--gray5)', fontSize: 13 }}>Escribiendo...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={'Escribe un mensaje para ' + agente.nombre + '...'}
              rows={1} style={{ flex: 1, background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', color: 'var(--gray7)', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={sendMessage} disabled={!input.trim() || thinking}
              style={{ width: 44, height: 44, borderRadius: 12, background: input.trim() && !thinking ? 'var(--accent)' : 'var(--gray2)', border: 'none', cursor: input.trim() && !thinking ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all 0.2s' }}>
              ➤
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
