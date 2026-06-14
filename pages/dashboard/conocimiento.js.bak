// pages/dashboard/conocimiento.js
// Base de conocimiento del negocio — NEXOIA

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export default function Conocimiento() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Servicios
  const [servicios, setServicios] = useState([
    { nombre: '', precio: '', duracion: '', descripcion: '' },
  ]);

  // Horarios
  const [horarios, setHorarios] = useState({
    Lunes: { activo: true, desde: '08:00', hasta: '18:00' },
    Martes: { activo: true, desde: '08:00', hasta: '18:00' },
    Miercoles: { activo: true, desde: '08:00', hasta: '18:00' },
    Jueves: { activo: true, desde: '08:00', hasta: '18:00' },
    Viernes: { activo: true, desde: '08:00', hasta: '18:00' },
    Sabado: { activo: true, desde: '08:00', hasta: '14:00' },
    Domingo: { activo: false, desde: '08:00', hasta: '12:00' },
  });

  // Info adicional
  const [info, setInfo] = useState({
    direccion: '',
    ciudad: '',
    telefono: '',
    whatsapp: '',
    descripcionNegocio: '',
    politicaCancelacion: '',
    formasPago: [],
    preguntasFrecuentes: [{ pregunta: '', respuesta: '' }],
  });

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);
  useEffect(() => { if (user) cargarDatos(); }, [user]);

  const cargarDatos = async () => {
    try {
      const snap = await getDoc(doc(db, 'empresas', user.uid, 'config', 'conocimiento'));
      if (snap.exists()) {
        const d = snap.data();
        if (d.servicios) setServicios(d.servicios);
        if (d.horarios) setHorarios(d.horarios);
        if (d.info) setInfo(d.info);
      } else if (empresa) {
        setInfo(i => ({ ...i, ciudad: empresa.ciudad || '', telefono: empresa.telefono || '' }));
      }
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  // Servicios
  const addServicio = () => setServicios(s => [...s, { nombre: '', precio: '', duracion: '', descripcion: '' }]);
  const removeServicio = (i) => setServicios(s => s.filter((_, idx) => idx !== i));
  const updateServicio = (i, field, val) => setServicios(s => s.map((sv, idx) => idx === i ? { ...sv, [field]: val } : sv));

  // FAQ
  const addFaq = () => setInfo(i => ({ ...i, preguntasFrecuentes: [...(i.preguntasFrecuentes || []), { pregunta: '', respuesta: '' }] }));
  const removeFaq = (i) => setInfo(inf => ({ ...inf, preguntasFrecuentes: inf.preguntasFrecuentes.filter((_, idx) => idx !== i) }));
  const updateFaq = (i, field, val) => setInfo(inf => ({ ...inf, preguntasFrecuentes: inf.preguntasFrecuentes.map((f, idx) => idx === i ? { ...f, [field]: val } : f) }));

  // Formas de pago
  const togglePago = (p) => setInfo(i => ({ ...i, formasPago: i.formasPago.includes(p) ? i.formasPago.filter(x => x !== p) : [...i.formasPago, p] }));

  const handleGuardar = async () => {
    if (!servicios.some(s => s.nombre)) { toast.error('Agrega al menos un servicio'); return; }
    setSaving(true);
    try {
      // Generar prompt automatico
      const promptGenerado = generarPrompt();

      await setDoc(doc(db, 'empresas', user.uid, 'config', 'conocimiento'), {
        servicios,
        horarios,
        info,
        promptGenerado,
        actualizadoEn: serverTimestamp(),
      });

      toast.success('Base de conocimiento guardada ✅');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar');
    } finally { setSaving(false); }
  };

  const generarPrompt = () => {
    const lines = [];
    lines.push('INFORMACION DEL NEGOCIO:');
    lines.push('Empresa: ' + (empresa?.nombreEmpresa || ''));
    if (info.descripcionNegocio) lines.push('Descripcion: ' + info.descripcionNegocio);
    if (info.direccion) lines.push('Direccion: ' + info.direccion + (info.ciudad ? ', ' + info.ciudad : ''));
    if (info.telefono) lines.push('Telefono: ' + info.telefono);
    if (info.whatsapp) lines.push('WhatsApp: ' + info.whatsapp);

    const svActivos = servicios.filter(s => s.nombre);
    if (svActivos.length > 0) {
      lines.push('\nSERVICIOS Y PRECIOS:');
      svActivos.forEach(s => {
        let linea = '- ' + s.nombre;
        if (s.precio) linea += ': $' + s.precio;
        if (s.duracion) linea += ' (' + s.duracion + ' min)';
        if (s.descripcion) linea += ' — ' + s.descripcion;
        lines.push(linea);
      });
    }

    const diasActivos = DIAS.filter(d => horarios[d]?.activo);
    if (diasActivos.length > 0) {
      lines.push('\nHORARIOS DE ATENCION:');
      diasActivos.forEach(d => {
        lines.push('- ' + d + ': ' + horarios[d].desde + ' a ' + horarios[d].hasta);
      });
    }

    if (info.formasPago?.length > 0) {
      lines.push('\nFORMAS DE PAGO: ' + info.formasPago.join(', '));
    }

    if (info.politicaCancelacion) {
      lines.push('\nPOLITICA DE CANCELACION: ' + info.politicaCancelacion);
    }

    const faqs = (info.preguntasFrecuentes || []).filter(f => f.pregunta && f.respuesta);
    if (faqs.length > 0) {
      lines.push('\nPREGUNTAS FRECUENTES:');
      faqs.forEach(f => {
        lines.push('P: ' + f.pregunta);
        lines.push('R: ' + f.respuesta);
      });
    }

    return lines.join('\n');
  };

  if (loading || cargando) return <div className="page-loader"><div className="spinner" /></div>;

  const card = { background: 'var(--gray1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 24 };
  const label = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray5)', marginBottom: 8, display: 'block' };

  return (
    <>
      <Head><title>Base de Conocimiento — NEXOIA</title></Head>
      <DashboardLayout title="Base de Conocimiento">

        <p style={{ color: 'var(--gray5)', marginBottom: 28, fontSize: 14 }}>
          Esta informacion es usada por tu agente IA para responder correctamente a tus clientes.
        </p>

        {/* SERVICIOS */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18 }}>💰 Servicios y precios</h3>
            <button className="btn btn-ghost btn-sm" onClick={addServicio}>+ Agregar servicio</button>
          </div>
          {servicios.map((sv, i) => (
            <div key={i} style={{ background: 'var(--gray2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={label}>Nombre del servicio *</span>
                  <input className="form-input" placeholder="Ej: Corte de cabello" value={sv.nombre} onChange={e => updateServicio(i, 'nombre', e.target.value)} />
                </div>
                <div>
                  <span style={label}>Precio (€)</span>
                  <input className="form-input" placeholder="25" value={sv.precio} onChange={e => updateServicio(i, 'precio', e.target.value)} />
                </div>
                <div>
                  <span style={label}>Duracion (min)</span>
                  <input className="form-input" placeholder="30" value={sv.duracion} onChange={e => updateServicio(i, 'duracion', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <span style={label}>Descripcion breve</span>
                  <input className="form-input" placeholder="Incluye lavado y peinado" value={sv.descripcion} onChange={e => updateServicio(i, 'descripcion', e.target.value)} />
                </div>
                {servicios.length > 1 && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeServicio(i)} style={{ marginBottom: 0 }}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* HORARIOS */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>🕐 Horarios de atencion</h3>
          {DIAS.map(dia => (
            <div key={dia} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={horarios[dia]?.activo || false}
                  onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], activo: e.target.checked } }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: horarios[dia]?.activo ? 'var(--white)' : 'var(--gray5)' }}>{dia}</span>
              </div>
              {horarios[dia]?.activo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="time" className="form-input" style={{ width: 120, padding: '6px 10px' }}
                    value={horarios[dia]?.desde || '08:00'}
                    onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], desde: e.target.value } }))} />
                  <span style={{ color: 'var(--gray5)' }}>a</span>
                  <input type="time" className="form-input" style={{ width: 120, padding: '6px 10px' }}
                    value={horarios[dia]?.hasta || '18:00'}
                    onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], hasta: e.target.value } }))} />
                </div>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--gray5)', fontStyle: 'italic' }}>Cerrado</span>
              )}
            </div>
          ))}
        </div>

        {/* INFO ADICIONAL */}
        <div style={card}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>📍 Informacion del negocio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <span style={label}>Direccion</span>
              <input className="form-input" placeholder="Calle 5 # 10-20" value={info.direccion} onChange={e => setInfo(i => ({ ...i, direccion: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Ciudad</span>
              <input className="form-input" placeholder="Cali" value={info.ciudad} onChange={e => setInfo(i => ({ ...i, ciudad: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Telefono</span>
              <input className="form-input" placeholder="3105056616" value={info.telefono} onChange={e => setInfo(i => ({ ...i, telefono: e.target.value }))} />
            </div>
            <div>
              <span style={label}>WhatsApp</span>
              <input className="form-input" placeholder="3105056616" value={info.whatsapp} onChange={e => setInfo(i => ({ ...i, whatsapp: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <span style={label}>Descripcion del negocio</span>
            <textarea className="form-input" rows={3} placeholder="Somos una peluqueria especializada en cortes modernos y colorimetria, con 10 anos de experiencia en Cali."
              value={info.descripcionNegocio} onChange={e => setInfo(i => ({ ...i, descripcionNegocio: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <span style={label}>Politica de cancelacion</span>
            <input className="form-input" placeholder="Cancelaciones con minimo 2 horas de anticipacion"
              value={info.politicaCancelacion} onChange={e => setInfo(i => ({ ...i, politicaCancelacion: e.target.value }))} />
          </div>
          <div>
            <span style={label}>Formas de pago aceptadas</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Tarjeta debito', 'Tarjeta credito'].map(p => (
                <button key={p} onClick={() => togglePago(p)}
                  style={{ background: info.formasPago?.includes(p) ? 'rgba(0,229,160,0.1)' : 'var(--gray2)', border: '1px solid ' + (info.formasPago?.includes(p) ? 'var(--accent)' : 'rgba(255,255,255,0.06)'), borderRadius: 100, padding: '6px 14px', cursor: 'pointer', color: info.formasPago?.includes(p) ? 'var(--accent)' : 'var(--gray6)', fontSize: 13 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18 }}>❓ Preguntas frecuentes</h3>
            <button className="btn btn-ghost btn-sm" onClick={addFaq}>+ Agregar pregunta</button>
          </div>
          {(info.preguntasFrecuentes || []).map((faq, i) => (
            <div key={i} style={{ background: 'var(--gray2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={label}>Pregunta</span>
                <input className="form-input" placeholder="¿Tienen estacionamiento?" value={faq.pregunta} onChange={e => updateFaq(i, 'pregunta', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <span style={label}>Respuesta</span>
                  <input className="form-input" placeholder="Si, tenemos parqueadero gratuito para clientes." value={faq.respuesta} onChange={e => updateFaq(i, 'respuesta', e.target.value)} />
                </div>
                {(info.preguntasFrecuentes || []).length > 1 && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeFaq(i)}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt preview */}
        <div style={{ ...card, background: 'rgba(0,229,160,0.03)', border: '1px solid rgba(0,229,160,0.15)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--accent)' }}>👁️ Vista previa del prompt generado</h3>
          <pre style={{ fontSize: 12, color: 'var(--gray5)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {generarPrompt() || 'Completa los campos para ver el prompt generado...'}
          </pre>
        </div>

        <button className="btn btn-accent btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGuardar} disabled={saving}>
          {saving ? 'Guardando...' : '💾 Guardar base de conocimiento'}
        </button>

      </DashboardLayout>
    </>
  );
}
