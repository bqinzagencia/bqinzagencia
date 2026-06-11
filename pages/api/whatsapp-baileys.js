// pages/api/whatsapp-baileys.js
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET = process.env.SERVER_SECRET || 'agenciame2026secreto_nexoia';
const historiales = new Map();

// Numero de soporte NexoTI para recibir avisos
const SOPORTE_NUMERO = process.env.SOPORTE_WHATSAPP || '573105056616';
const SOPORTE_EMPRESA_ID = process.env.SOPORTE_EMPRESA_ID || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = req.headers['x-server-secret'];
  if (secret !== SERVER_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto, msgId } = req.body;
  if (!empresaId || !numeroCliente || !texto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // 1. Obtener datos de la empresa
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) {
      historiales.delete(`${empresaId}_${numeroCliente}`);
      return res.json({ respuesta: null });
    }
    const empresa = empresaSnap.data();
    const nombreEmpresa = empresa.nombreEmpresa || 'nuestro negocio';

    // 2. Verificar trial: 1 hora gratuita para nuevos inscritos de WasapBot
    // Solo aplica si el plan NO está activo (no han pagado)
    const planActivo = empresa.planActivo === true && empresa.plan && empresa.plan !== 'wasapbot';

    if (!planActivo && empresa.producto === 'wasapbot') {
      const ahora = new Date();
      const UNA_HORA_MS = 60 * 60 * 1000; // 1 hora en milisegundos

      // Calcular tiempo desde la creacion de la cuenta
      const creadoEn = empresa.creadoEn?.toDate
        ? empresa.creadoEn.toDate()
        : (empresa.creadoEn ? new Date(empresa.creadoEn) : null);

      if (creadoEn) {
        const msDesdeCreacion = ahora - creadoEn;

        if (msDesdeCreacion > UNA_HORA_MS) {
          // Trial de 1 hora vencido — invitar a activar plan
          return res.json({
            respuesta:
              `Hola 👋 El periodo de prueba gratuito de *${nombreEmpresa}* (1 hora) ha finalizado.\n\n` +
              `Para seguir recibiendo respuestas automáticas por WhatsApp, activa un plan en:\n` +
              `👉 https://agenciame.com/wasapbot\n\n` +
              `¿Tienes dudas? Escríbenos al *+${SOPORTE_NUMERO}* 🟢`,
          });
        }

        // Avisar cuando queden menos de 10 minutos del trial
        const msRestantes = UNA_HORA_MS - msDesdeCreacion;
        if (msRestantes < 10 * 60 * 1000) {
          const minsRestantes = Math.ceil(msRestantes / 60000);
          // Este aviso se agrega al final de la respuesta más abajo
          req._trialAviso = `\n\n_⏳ Quedan ~${minsRestantes} min de tu prueba gratuita. Activa tu plan en agenciame.com/wasapbot_`;
        }
      }
    }

    // 3. Base de conocimiento
    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento').get();
    const conocimiento = conocimientoSnap.exists ? conocimientoSnap.data() : null;

    // 4. Buscar o crear contacto
    const contactosRef = adminDb.collection('empresas').doc(empresaId).collection('contactos');
    const contactoQuery = await contactosRef.where('telefono', '==', numeroCliente).limit(1).get();

    let contactoId;
    let nombreCliente = null;
    let telefonoCapturado = numeroCliente;
    let esNuevoContacto = false;

    if (contactoQuery.empty) {
      esNuevoContacto = true;
      const nuevoContacto = await contactosRef.add({
        telefono:  numeroCliente,
        nombre:    `WhatsApp ${numeroCliente}`,
        canal:     'whatsapp',
        fuente:    'whatsapp-bot',
        estado:    'nuevo',
        creadoEn:  FieldValue.serverTimestamp(),
      });
      contactoId = nuevoContacto.id;
    } else {
      const docSnap  = contactoQuery.docs[0];
      contactoId     = docSnap.id;
      nombreCliente  = docSnap.data().nombre;
      telefonoCapturado = docSnap.data().telefono || numeroCliente;
      if (!nombreCliente || nombreCliente.startsWith('WhatsApp ') || nombreCliente === numeroCliente) {
        nombreCliente = null;
      }
    }

    // 5. Historial
    const historialKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(historialKey)) historiales.set(historialKey, []);
    const historial = historiales.get(historialKey);
    if (historial.length > 20) historial.splice(0, historial.length - 10);
    historial.push({ role: 'user', content: texto });
    if (historial.length > 10) historial.splice(0, historial.length - 10);

    // 6. Detectar si pide soporte humano
    const pideSoporte = /soporte|asesor|humano|persona|hablar con alguien|representante/i.test(texto);

    // 7. System prompt
    let systemPrompt = `Eres el asistente virtual de WhatsApp de "${nombreEmpresa}", ${empresa.industria || 'negocio'} en ${empresa.ciudad || 'Colombia'}.

SALUDO INICIAL (solo en el primer mensaje del cliente):
"Bienvenido/a a ${nombreEmpresa}. Soy tu asistente virtual. En que puedo ayudarte hoy?"

IMPORTANTE: Siempre que menciones el negocio usa el nombre "${nombreEmpresa}".

REGLAS CRITICAS:
1. NOMBRE OBLIGATORIO: Si el cliente NO ha dado su nombre REAL, debes pedirlo en CADA respuesta hasta obtenerlo. Sin nombre no puedes continuar. Di: "Para atenderte mejor, ¿me puedes dar tu nombre completo?"
2. TELEFONO: Si el cliente contacta desde un numero diferente al registrado, pide confirmacion del telefono de contacto.
3. Responde de forma concisa (max 3 parrafos), amigable y profesional.
4. Usa emojis moderadamente.
5. Si el cliente quiere AGENDAR: confirma servicio, fecha y hora. Luego agrega en nueva linea:
   CITA_DETECTADA: {"nombre":"NOMBRE","servicio":"SERVICIO","fecha":"DD/MM/YYYY","hora":"HH:MM"}
6. Idioma: espanol colombiano.
7. Si el cliente pide hablar con un asesor humano, di que le avisas al equipo y agrega en nueva linea:
   SOPORTE_SOLICITADO: {"nombre":"NOMBRE_CLIENTE","motivo":"MOTIVO"}`;

    if (nombreCliente) {
      systemPrompt += `\n\nNOMBRE DEL CLIENTE YA REGISTRADO: ${nombreCliente} - NO vuelvas a pedirlo.`;
    } else {
      systemPrompt += `\n\nEL CLIENTE AUN NO HA DADO SU NOMBRE. Pidelo amablemente en tu respuesta.`;
    }

    // Agregar conocimiento
    if (conocimiento) {
      if (conocimiento.servicios?.length > 0) {
        const svcs = conocimiento.servicios.filter(s => s.nombre)
          .map(s => `- ${s.nombre}: $${s.precio || 'consultar'} COP${s.duracion ? ` (${s.duracion} min)` : ''}`)
          .join('\n');
        systemPrompt += `\n\nSERVICIOS:\n${svcs}`;
      }
      if (conocimiento.info?.descripcionNegocio) systemPrompt += `\n\nDESCRIPCION: ${conocimiento.info.descripcionNegocio}`;
      if (conocimiento.info?.direccion) systemPrompt += `\nDIRECCION: ${conocimiento.info.direccion}`;
      if (conocimiento.horarios) {
        const hDias = Object.entries(conocimiento.horarios)
          .filter(([, v]) => v.activo).map(([dia, v]) => `${dia}: ${v.desde}-${v.hasta}`).join(', ');
        if (hDias) systemPrompt += `\nHORARIOS: ${hDias}`;
      }
      if (conocimiento.info?.formasPago?.length) systemPrompt += `\nPAGOS: ${conocimiento.info.formasPago.join(', ')}`;
      if (conocimiento.info?.preguntasFrecuentes?.length > 0) {
        const faqs = conocimiento.info.preguntasFrecuentes.filter(f => f.pregunta)
          .map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n');
        systemPrompt += `\n\nFAQs:\n${faqs}`;
      }
    }

    // 8. OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt }, ...historial],
    });

    let respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role: 'assistant', content: respuesta });

    // 9. Registrar tokens consumidos
    const tokensUsados = completion.usage?.total_tokens || 0;
    if (tokensUsados > 0) {
      const ahoraTok = new Date();
      const mesKey   = `${ahoraTok.getFullYear()}-${String(ahoraTok.getMonth()+1).padStart(2,'0')}`;
      const tokRef   = adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey}`);
      await tokRef.set({ usado: FieldValue.increment(tokensUsados), empresaId, mes: mesKey }, { merge: true }).catch(()=>{});
    }

    // Verificar limite de tokens del plan
    const PLAN_TOKENS = { basico:50000, estandar:150000, pro:400000, wasapbot:15000 };
    const planId   = empresa.planWasapbot || empresa.plan || 'wasapbot';
    const tokLimit = PLAN_TOKENS[planId] || 15000;
    const ahoraTok2 = new Date();
    const mesKey2   = `${ahoraTok2.getFullYear()}-${String(ahoraTok2.getMonth()+1).padStart(2,'0')}`;
    const tokSnap   = await adminDb.collection('wasapbot_tokens').doc(`${empresaId}_${mesKey2}`).get().catch(()=>null);
    const tokActual = tokSnap?.exists ? (tokSnap.data().usado || 0) : 0;

    if (tokActual > tokLimit) {
      return res.json({ respuesta: `Hola. El servicio de respuestas automáticas de ${nombreEmpresa} ha alcanzado su límite mensual. Por favor contacta directamente al negocio.` });
    }

    // 10. Capturar nombre del mensaje
    const nombreEnMensaje = extraerNombre(texto);
    if (nombreEnMensaje && (!nombreCliente || nombreCliente.startsWith('WhatsApp '))) {
      await contactosRef.doc(contactoId).update({ nombre: nombreEnMensaje });
      nombreCliente = nombreEnMensaje;
    }

    // Actualizar contadores en empresa
    try {
      await adminDb.collection('empresas').doc(empresaId).update({
        tokensUsados:    FieldValue.increment(tokensUsados),
        conversaciones:  FieldValue.increment(1),
        ultimaActividad: FieldValue.serverTimestamp(),
      });
    } catch {}

    // 11. Limpiar etiquetas internas de la respuesta
    let respuestaLimpia = respuesta
      .replace(/\n?CITA_DETECTADA:.*$/m, '')
      .replace(/\n?SOPORTE_SOLICITADO:.*$/m, '')
      .trim();

    // Agregar aviso de trial si quedan pocos minutos
    if (req._trialAviso) {
      respuestaLimpia += req._trialAviso;
    }

    // 12. Procesar SOPORTE_SOLICITADO
    const soporteMatch = respuesta.match(/SOPORTE_SOLICITADO:\s*(\{[^}]+\})/);
    if (soporteMatch || pideSoporte) {
      try {
        const waServer = process.env.WHATSAPP_SERVER_URL || 'https://agenciame-whatsapp-server-production.up.railway.app';
        const msgSoporte = `🆘 *Solicitud de soporte*\n\n*Empresa:* ${nombreEmpresa}\n*Cliente:* ${nombreCliente || numeroCliente}\n*Teléfono:* +${numeroCliente}\n*Mensaje:* ${texto}`;

        if (SOPORTE_EMPRESA_ID) {
          await fetch(`${waServer}/enviar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-server-secret': SERVER_SECRET },
            body: JSON.stringify({ empresaId: SOPORTE_EMPRESA_ID, numero: SOPORTE_NUMERO, texto: msgSoporte }),
          }).catch(() => {});
        }

        await adminDb.collection('empresas').doc(empresaId).collection('soportes').add({
          nombreCliente: nombreCliente || `WhatsApp ${numeroCliente}`,
          telefono:      numeroCliente,
          mensaje:       texto,
          estado:        'pendiente',
          creadoEn:      FieldValue.serverTimestamp(),
        });
      } catch {}
    }

    // 13. Procesar CITA_DETECTADA
    const citaMatch = respuesta.match(/CITA_DETECTADA:\s*(\{[^}]+\})/);
    if (citaMatch) {
      try {
        const citaData = JSON.parse(citaMatch[1]);
        const nombreCita = citaData.nombre || nombreCliente || `WhatsApp ${numeroCliente}`;
        if (citaData.nombre && (!nombreCliente || nombreCliente.startsWith('WhatsApp '))) {
          await contactosRef.doc(contactoId).update({ nombre: citaData.nombre });
        }
        await adminDb.collection('empresas').doc(empresaId).collection('citas').add({
          nombreCliente: nombreCita,
          telefono:      numeroCliente,
          servicio:      citaData.servicio || 'Consulta',
          fechaHora:     parsearFechaHora(citaData.fecha, citaData.hora),
          fecha:         citaData.fecha || '',
          hora:          citaData.hora || '',
          estado:        'confirmada',
          canal:         'whatsapp',
          fuente:        'whatsapp-bot',
          notas:         'Cita agendada por WhatsApp Bot',
          contactoId,
          creadoEn:      FieldValue.serverTimestamp(),
        });
      } catch {}
    }

    // 14. Guardar conversacion
    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({
      nombreCliente: nombreCliente || `WhatsApp ${numeroCliente}`,
      telefono:      numeroCliente,
      canal:         'whatsapp',
      ultimoTexto:   texto,
      ultimoMensaje: FieldValue.serverTimestamp(),
      contactoId,
    }, { merge: true });

    await convRef.doc(convKey).collection('mensajes').add({ rol: 'cliente', texto, creadoEn: FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol: 'agente', texto: respuestaLimpia, creadoEn: FieldValue.serverTimestamp() });

    return res.json({ respuesta: respuestaLimpia });

  } catch (err) {
    console.error('Error whatsapp-baileys:', err);
    return res.status(500).json({ error: err.message });
  }
}

function extraerNombre(texto) {
  const patrones = [
    /(?:me llamo|soy|mi nombre es|habla|te escribe)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i,
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)(?:,| aqui| acá| aca| buenos| buen)/i,
  ];
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match && match[1] && match[1].length > 2 && match[1].length < 40) return match[1].trim();
  }
  return null;
}

function parsearFechaHora(fecha, hora) {
  try {
    if (!fecha) return new Date();
    const ahora = new Date();
    const partes = fecha.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (partes) {
      const dia  = parseInt(partes[1]);
      const mes  = parseInt(partes[2]) - 1;
      const anio = partes[3] ? parseInt(partes[3]) : ahora.getFullYear();
      const hp   = hora?.match(/(\d{1,2}):?(\d{2})?/);
      return new Date(anio < 100 ? 2000 + anio : anio, mes, dia, hp ? parseInt(hp[1]) : 9, hp?.[2] ? parseInt(hp[2]) : 0);
    }
  } catch {}
  return new Date();
}
