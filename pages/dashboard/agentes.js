// pages/dashboard/agentes.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { db, updateEmpresa } from '../../lib/firebase';
import { doc, collection, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const NARANJA = '#FF6B00';

const PLANTILLAS_PROMPT = {
  estetica: `Eres {nombre}, asistente de WhatsApp de {empresa}, un centro de estética en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO DIRECTO: {telefono}

TAREAS PRINCIPALES:
1. Gestionar reservas de citas (facial, depilación, tratamientos corporales)
2. Informar precios y duración de servicios
3. Confirmar y recordar citas
4. Cobrar señal por Bizum para asegurar la cita

PROCESO DE CITA:
- Pregunta qué servicio desea
- Ofrece 3 horarios disponibles (mañana, tarde, este fin de semana)
- Pide nombre completo
- Confirma: "✅ Perfecto [nombre], te agendo [servicio] el [fecha] a las [hora]h"
- Pide señal de 10-15€ por Bizum para confirmar

RECUERDA: Respuestas cortas (WhatsApp), máx 3-4 líneas, usa 1-2 emojis, siempre termina con pregunta.`,

  salon: `Eres {nombre}, asistente de WhatsApp de {empresa}, salón de belleza en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

TAREAS:
1. Reservar citas de corte, color, keratina, manicure, pedicure
2. Informar precios y disponibilidad
3. Enviar recordatorios de cita

PROCESO DE CITA:
- Identifica el servicio
- Ofrece horarios disponibles
- Pide nombre y confirma
- "✅ [nombre], te agendo [servicio] el [día] a las [hora]h. Te confirmamos por aquí 💇‍♀️"

Respuestas cortas, amigables, máx 3-4 líneas.`,

  spa: `Eres {nombre}, asistente de WhatsApp de {empresa}, spa y centro de masajes en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

ESPECIALIDAD: Masajes terapéuticos, relajantes, con piedras calientes, tratamientos spa.

PROCESO DE RESERVA:
- Pregunta qué tipo de masaje o tratamiento
- Ofrece terapeutas disponibles si hay varios
- Ofrece 3 horarios
- Pide nombre y confirma
- "✅ [nombre], reserva confirmada: [tratamiento] el [día] a las [hora]h con [terapeuta] 🌿"
- Solicita señal de 15€ por Bizum

Tono sereno, cálido, profesional. Respuestas cortas.`,

  dental: `Eres {nombre}, recepcionista virtual de WhatsApp de {empresa}, clínica dental en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

ESPECIALIDADES: Limpieza dental, ortodoncia, implantes, blanqueamiento, urgencias.

PROCESO DE CITA:
- Pregunta motivo de consulta (revisión, urgencia, tratamiento específico)
- Si es urgencia, ofrece el mismo día o siguiente
- Pide nombre completo y confirma
- "✅ [nombre], cita confirmada el [día] a las [hora]h con [Dr/Dra]. Recuerda traer tu DNI 🦷"

IMPORTANTE: Para dolor severo o urgencia, prioriza atención inmediata.
Respuestas profesionales, tranquilizadoras, cortas.`,

  'medicina-estetica': `Eres {nombre}, asistente de WhatsApp de {empresa}, clínica de medicina estética en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
MÉDICO/A: {medico}
TELÉFONO: {telefono}

TRATAMIENTOS: Botox, ácido hialurónico, láser, mesoterapia, PRP, hilos tensores.

PROCESO:
1. Informa sobre el tratamiento solicitado (qué es, duración, resultados, precio)
2. Pre-cualifica: pregunta si tiene contraindicaciones (embarazo, lactancia, enfermedades autoinmunes)
3. Si es candidata/o, ofrece cita de valoración gratuita
4. "✅ [nombre], te agendo consulta de valoración el [día] a las [hora]h. Te enviaré el consentimiento informado 📋"

NUNCA prometas resultados específicos. Sé precisa con la información médica.
Tono profesional, confiable, empático.`,

  taller: `Eres {nombre}, asistente de WhatsApp de {empresa}, taller mecánico en {ciudad}, España.

SERVICIOS Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

ESPECIALIDAD: Mantenimiento, revisión ITV, cambio de aceite, frenos, neumáticos, electricidad.

PROCESO DE CITA:
- Pregunta qué le pasa al vehículo o qué servicio necesita
- Pide modelo, año y matrícula del vehículo
- Ofrece horarios disponibles
- Confirma: "✅ [nombre], te apunto para [servicio] con tu [modelo] el [día] a las [hora]h 🔧"
- Da precio orientativo si lo conoces

Tono cercano, técnico pero claro, corto.`,

  restaurante: `Eres {nombre}, asistente de WhatsApp de {empresa}, restaurante en {ciudad}, España.

MENÚ Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

TAREAS:
1. Reservas de mesa
2. Información del menú del día
3. Pedidos para llevar o domicilio

PROCESO RESERVA:
- Pide: número de personas, día y hora, si es ocasión especial
- Confirma: "✅ [nombre], mesa para [X] el [día] a las [hora]h confirmada 🍽️"

PROCESO PEDIDO DOMICILIO:
- Toma el pedido completo
- Confirma dirección y forma de pago
- Da tiempo estimado de entrega

Tono amigable, eficiente. Respuestas cortas.`,

  inmobiliaria: `Eres {nombre}, asesor virtual de WhatsApp de {empresa}, inmobiliaria en {ciudad}, España.

CARTERA:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

PROCESO:
1. Identifica si busca compra, alquiler o quiere vender/alquilar su inmueble
2. Para búsqueda: pregunta zona, tipo, habitaciones, presupuesto
3. Presenta 2-3 opciones que encajen
4. Agenda visita: "✅ [nombre], te agendo visita al piso de [zona] el [día] a las [hora]h. Un asesor te confirmará 🏠"
5. Para captar: pide datos del inmueble y del propietario

Tono profesional, seguro, informativo. Respuestas claras y concisas.`,

  gimnasio: `Eres {nombre}, asistente de WhatsApp de {empresa}, gimnasio en {ciudad}, España.

PLANES Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

CLASES: {clases}

TAREAS:
1. Informar planes y precios
2. Reservar clases grupales
3. Gestionar renovaciones de membresía
4. Recordar vencimientos

PROCESO INSCRIPCIÓN:
- Informa planes disponibles
- Pregunta objetivo (tonificar, perder peso, ganar masa, bienestar)
- Recomienda plan según objetivo
- "✅ [nombre], bienvenido/a a {empresa}! Tu membresía [plan] está activada 💪"

Tono motivador, energético pero no exagerado.`,

  salud: `Eres {nombre}, recepcionista virtual de WhatsApp de {empresa}, centro médico en {ciudad}, España.

ESPECIALIDADES Y PRECIOS:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

PROCESO DE CITA:
- Pregunta especialidad o médico que necesita
- Pide motivo breve de consulta
- Ofrece horarios disponibles
- Confirma: "✅ [nombre], cita confirmada el [día] a las [hora]h con [Dr/Dra]. Recuerda traer tu tarjeta sanitaria 🏥"

IMPORTANTE: Nunca des diagnósticos ni recomendaciones médicas.
Para urgencias: "Para urgencias médicas llame al 112 o vaya a Urgencias."

Tono profesional, tranquilizador, eficiente.`,

  generico: `Eres {nombre}, asistente virtual de WhatsApp de {empresa} en {ciudad}, España.

INFORMACIÓN:
{servicios}

HORARIO: {horario}
TELÉFONO: {telefono}

TAREAS:
1. Responder preguntas sobre productos/servicios
2. Agendar citas o reuniones
3. Tomar mensajes para el equipo

Para citas: pide nombre, servicio, fecha y hora preferida.
Confirma siempre: "✅ [nombre], [acción confirmada] 👍"

Tono amigable y profesional. Respuestas cortas y claras.`,
};

export default function Agentes() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();

  const [agentes, setAgentes] = useState([]);
  const [loadingAgentes, setLoadingAgentes] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const industria = empresa?.industria || 'generico';

  const [form, setForm] = useState({
    nombre: 'Asistente IA',
    personalidad: 'amigable, empático y profesional',
    servicios: '',
    horario: 'Lunes a Sábado 9:00-20:00h',
    medico: '',
    clases: '',
    prompt: '',
    activo: true,
    canal: 'whatsapp',
  });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user || !empresa) return;
    cargarAgentes();
  }, [user, empresa]);

  const cargarAgentes = async () => {
    try {
      const snap = await getDocs(collection(db, 'empresas', user.uid, 'agentes'));
      setAgentes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast.error('Error cargando agentes');
    } finally {
      setLoadingAgentes(false);
    }
  };

  const generarPrompt = () => {
    const plantilla = PLANTILLAS_PROMPT[industria] || PLANTILLAS_PROMPT.generico;
    return plantilla
      .replace(/{nombre}/g, form.nombre)
      .replace(/{empresa}/g, empresa?.nombreEmpresa || 'la empresa')
      .replace(/{ciudad}/g, empresa?.ciudad || 'España')
      .replace(/{servicios}/g, form.servicios || '(configura tus servicios y precios aquí)')
      .replace(/{horario}/g, form.horario)
      .replace(/{telefono}/g, empresa?.telefono || '')
      .replace(/{medico}/g, form.medico || '')
      .replace(/{clases}/g, form.clases || '');
  };

  const guardarAgente = async () => {
    if (!form.nombre.trim()) { toast.error('El agente necesita un nombre'); return; }
    setGuardando(true);
    try {
      const promptFinal = form.prompt || generarPrompt();
      const id = editando || `agente_${Date.now()}`;
      await setDoc(doc(db, 'empresas', user.uid, 'agentes', id), {
        ...form,
        prompt: promptFinal,
        updatedAt: serverTimestamp(),
        createdAt: editando ? undefined : serverTimestamp(),
      }, { merge: true });
      toast.success(editando ? 'Agente actualizado ✅' : '¡Agente creado! 🤖');
      setShowForm(false);
      setEditando(null);
      cargarAgentes();
    } catch (e) {
      toast.error('Error guardando agente');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarAgente = async (id) => {
    if (!confirm('¿Eliminar este agente?')) return;
    await deleteDoc(doc(db, 'empresas', user.uid, 'agentes', id));
    toast.success('Agente eliminado');
    cargarAgentes();
  };

  const toggleActivo = async (agente) => {
    await setDoc(doc(db, 'empresas', user.uid, 'agentes', agente.id), { activo: !agente.activo }, { merge: true });
    cargarAgentes();
  };

  const abrirEditar = (agente) => {
    setForm({ nombre: agente.nombre || '', personalidad: agente.personalidad || '', servicios: agente.servicios || '', horario: agente.horario || '', medico: agente.medico || '', clases: agente.clases || '', prompt: agente.prompt || '', activo: agente.activo ?? true, canal: agente.canal || 'whatsapp' });
    setEditando(agente.id);
    setShowForm(true);
  };

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <>
      <Head><title>Mis Agentes IA — BQinzagencIA</title></Head>
      <DashboardLayout title="Mis Agentes IA">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--gray5)', fontSize: 15, maxWidth: 520 }}>
              Configura el agente que responderá automáticamente en WhatsApp. Entrénalo con tus servicios, precios y personalidad.
            </p>
          </div>
          <button onClick={() => { setEditando(null); setForm({ nombre: 'Asistente IA', personalidad: 'amigable, empático y profesional', servicios: '', horario: 'L-S 9:00-20:00h', medico: '', clases: '', prompt: '', activo: true, canal: 'whatsapp' }); setShowForm(true); }}
            style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 100, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            + Nuevo agente
          </button>
        </div>

        {/* Lista de agentes */}
        {loadingAgentes ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray5)' }}>Cargando agentes...</div>
        ) : agentes.length === 0 && !showForm ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'var(--gray1)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Sin agentes configurados</h3>
            <p style={{ color: 'var(--gray5)', marginBottom: 24 }}>Crea tu primer agente IA para que atienda WhatsApp automáticamente.</p>
            <button onClick={() => setShowForm(true)}
              style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Crear mi agente →
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
            {agentes.map(agente => (
              <div key={agente.id} style={{ background: 'var(--gray1)', border: `1px solid ${agente.activo ? 'rgba(255,107,0,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: agente.activo ? 'rgba(255,107,0,0.15)' : 'var(--gray2)', border: `2px solid ${agente.activo ? NARANJA : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  🤖
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16 }}>{agente.nombre}</span>
                    <span style={{ background: agente.activo ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)', color: agente.activo ? '#00E5A0' : 'var(--gray5)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: `1px solid ${agente.activo ? 'rgba(0,229,160,0.2)' : 'transparent'}` }}>
                      {agente.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                    <span style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>
                      💬 WhatsApp
                    </span>
                  </div>
                  <div style={{ color: 'var(--gray5)', fontSize: 13 }}>{agente.personalidad}</div>
                  {agente.horario && <div style={{ color: 'var(--gray5)', fontSize: 12, marginTop: 2 }}>⏰ {agente.horario}</div>}
                </div>

                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button onClick={() => toggleActivo(agente)}
                    style={{ background: agente.activo ? 'rgba(255,107,0,0.1)' : 'rgba(0,229,160,0.1)', color: agente.activo ? NARANJA : '#00E5A0', border: `1px solid ${agente.activo ? 'rgba(255,107,0,0.3)' : 'rgba(0,229,160,0.3)'}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {agente.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => abrirEditar(agente)}
                    style={{ background: 'var(--gray2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                    Editar
                  </button>
                  <button onClick={() => eliminarAgente(agente.id)}
                    style={{ background: 'rgba(255,80,80,0.08)', color: '#ff5050', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORMULARIO DE CREACIÓN/EDICIÓN */}
        {showForm && (
          <div style={{ background: 'var(--gray1)', border: `1px solid ${NARANJA}44`, borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 24, color: NARANJA }}>
              {editando ? '✏️ Editar agente' : '🤖 Configurar agente WhatsApp'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Nombre del agente */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>NOMBRE DEL AGENTE</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Sara, Asistente, Laia..."
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Horario */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>HORARIO</label>
                <input value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
                  placeholder="Ej: Lunes-Sábado 9:00-20:00h"
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Personalidad */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>PERSONALIDAD</label>
              <input value={form.personalidad} onChange={e => setForm(f => ({ ...f, personalidad: e.target.value }))}
                placeholder="Ej: amigable, profesional, cálida, directa..."
                style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Servicios y precios */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                SERVICIOS Y PRECIOS <span style={{ color: NARANJA }}>*</span>
              </label>
              <textarea value={form.servicios} onChange={e => setForm(f => ({ ...f, servicios: e.target.value }))}
                placeholder={`Escribe tus servicios con precios, por ejemplo:\n- Limpieza facial: 45€ (60 min)\n- Depilación piernas: 35€ (45 min)\n- Tratamiento antiedad: 80€ (90 min)\n- Peeling químico: 55€ (45 min)`}
                rows={6}
                style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <p style={{ fontSize: 12, color: 'var(--gray5)', marginTop: 6 }}>💡 Cuantos más detalles incluyas, mejor responderá el agente a preguntas de precios y disponibilidad.</p>
            </div>

            {/* Campos específicos por industria */}
            {(industria === 'medicina-estetica' || industria === 'salud' || industria === 'dental') && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>MÉDICO/A RESPONSABLE</label>
                <input value={form.medico} onChange={e => setForm(f => ({ ...f, medico: e.target.value }))}
                  placeholder="Ej: Dra. García, Dr. Martínez..."
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {industria === 'gimnasio' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>CLASES DISPONIBLES</label>
                <input value={form.clases} onChange={e => setForm(f => ({ ...f, clases: e.target.value }))}
                  placeholder="Ej: Yoga L/M/X 10h, Spinning M/J/S 19h, Zumba V 18h"
                  style={{ width: '100%', background: 'var(--gray2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--white)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {/* Vista previa del prompt generado */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1 }}>PROMPT DEL AGENTE (INSTRUCCIONES)</label>
                <button onClick={() => setForm(f => ({ ...f, prompt: generarPrompt() }))}
                  style={{ background: NARANJA + '22', color: NARANJA, border: `1px solid ${NARANJA}44`, borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  ⚡ Auto-generar
                </button>
              </div>
              <textarea value={form.prompt || generarPrompt()} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                rows={10}
                style={{ width: '100%', background: '#0a0d12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px', fontSize: 12, color: '#9CA3AF', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6, boxSizing: 'border-box' }} />
              <p style={{ fontSize: 11, color: 'var(--gray5)', marginTop: 6 }}>Edita libremente las instrucciones del agente. Cuanto más específico, mejor será su comportamiento.</p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={guardarAgente} disabled={guardando}
                style={{ background: NARANJA, color: '#fff', border: 'none', borderRadius: 100, padding: '13px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'Guardando...' : editando ? '💾 Guardar cambios' : '🚀 Activar agente'}
              </button>
              <button onClick={() => { setShowForm(false); setEditando(null); }}
                style={{ background: 'transparent', color: 'var(--gray5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '13px 24px', fontSize: 15, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Sección de configuración del número de WhatsApp */}
        <div style={{ marginTop: 32, background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>💬</span> Conectar WhatsApp Business
          </h3>
          <p style={{ color: 'var(--gray5)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Para que el agente responda en tu WhatsApp real, necesitas configurar el webhook en Meta Business.
          </p>
          <div style={{ background: 'var(--gray1)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray5)', letterSpacing: 1, marginBottom: 10 }}>URL DEL WEBHOOK</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <code style={{ flex: 1, background: '#080B0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#25D366', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                https://bqinzagencia.com/api/whatsapp/webhook
              </code>
              <button onClick={() => { navigator.clipboard.writeText('https://bqinzagencia.com/api/whatsapp/webhook'); toast.success('Copiado!'); }}
                style={{ background: 'var(--gray2)', color: 'var(--white)', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                Copiar
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { paso: '1', titulo: 'Crea una App en Meta for Developers', desc: 'developers.facebook.com → Nueva app → Tipo Empresa' },
              { paso: '2', titulo: 'Añade WhatsApp Business', desc: 'En tu app → Añadir producto → WhatsApp' },
              { paso: '3', titulo: 'Configura el webhook', desc: `Pega la URL de arriba. Token de verificación: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'bqinzagencia_verify'}` },
              { paso: '4', titulo: 'Añade tu número', desc: 'En WhatsApp → Configuración → Número de teléfono → Añadir número' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--gray1)', borderRadius: 12, padding: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(37,211,102,0.15)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{s.paso}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.titulo}</div>
                <div style={{ color: 'var(--gray5)', fontSize: 12, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: NARANJA, marginBottom: 6 }}>⚡ Variables de entorno necesarias en .env.local</div>
            <code style={{ display: 'block', background: '#080B0F', borderRadius: 8, padding: '12px', fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', lineHeight: 1.8 }}>
              WHATSAPP_TOKEN=EAAxxxxx (Token de acceso de Meta)<br />
              WHATSAPP_VERIFY_TOKEN=bqinzagencia_verify<br />
              OPENAI_API_KEY=sk-xxxx (ya configurado ✅)
            </code>
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
