import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERVER_SECRET = process.env.SERVER_SECRET || 'agenciame2026secret';
const historiales = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-server-secret'];
  if (secret !== SERVER_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { empresaId, numeroCliente, texto, msgId } = req.body;
  if (!empresaId || !numeroCliente || !texto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
    if (!empresaSnap.exists) return res.status(404).json({ error: 'Empresa no encontrada' });
    const empresa = empresaSnap.data();

    if (empresa.estado === 'bloqueado') return res.json({ respuesta: null });

    if (empresa.trialHasta) {
      const hasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : new Date(empresa.trialHasta);
      if (new Date() > hasta) {
        return res.json({
          respuesta: `Hola! El periodo de prueba de ${empresa.nombreEmpresa} ha vencido. Contacta al administrador para continuar.`,
        });
      }
    }

    const conocimientoSnap = await adminDb
      .collection('empresas').doc(empresaId)
      .collection('config').doc('conocimiento')
      .get();
    const conocimiento = conocimientoSnap.exists ? conocimientoSnap.data() : null;

    const contactosRef = adminDb.collection('empresas').doc(empresaId).collection('contactos');
    const contactoQuery = await contactosRef.where('telefono', '==', numeroCliente).limit(1).get();
    let contactoId;
    let nombreCliente = numeroCliente;

    if (contactoQuery.empty) {
      const nuevoContacto = await contactosRef.add({
        telefono: numeroCliente, nombre: numeroCliente,
        canal: 'whatsapp', fuente: 'whatsapp-baileys',
        estado: 'nuevo', creadoEn: FieldValue.serverTimestamp(),
      });
      contactoId = nuevoContacto.id;
    } else {
      const docSnap = contactoQuery.docs[0];
      contactoId = docSnap.id;
      nombreCliente = docSnap.data().nombre || numeroCliente;
    }

    const historialKey = `${empresaId}_${numeroCliente}`;
    if (!historiales.has(historialKey)) historiales.set(historialKey, []);
    const historial = historiales.get(historialKey);
    historial.push({ role: 'user', content: texto });
    if (historial.length > 8) historial.splice(0, historial.length - 8);

    // Verificar si tiene base de conocimiento configurada
    const tieneConocimiento = conocimiento && (
      conocimiento.servicios?.some(s => s.nombre) ||
      conocimiento.info?.descripcionNegocio
    );

    let systemPrompt;

    if (!tieneConocimiento) {
      // Sin base de conocimiento: respuesta generica sin inventar nada
      systemPrompt = `Eres el asistente virtual de ${empresa.nombreEmpresa}.
Atendes por WhatsApp. El negocio aun no ha configurado su informacion.
INSTRUCCIONES:
- Saluda amablemente mencionando el nombre del negocio: ${empresa.nombreEmpresa}
- NO inventes servicios, precios ni informacion del negocio
- Indica que pronto un agente les dara toda la informacion
- Se muy breve, amable y profesional
- Idioma: espanol`;
    } else {
      systemPrompt = `Eres el asistente virtual de ${empresa.nombreEmpresa}, negocio de ${empresa.industria || 'servicios'} en ${empresa.ciudad || 'Espana'}.
Atendes por WhatsApp al cliente ${nombreCliente}.
INSTRUCCIONES:
- Responde de forma amigable, profesional y concisa (maximo 3 parrafos)
- Usa emojis con moderacion
- Si quiere agendar, pide nombre, servicio y horario preferido
- Da precios exactos si los tienes
- NO inventes informacion que no este en la base de conocimiento
- Idioma: espanol`;

      if (conocimiento.servicios?.length > 0) {
        const svcs = conocimiento.servicios.filter(s => s.nombre)
          .map(s => `- ${s.nombre}${s.precio ? ': ' + s.precio + 'EUR' : ''}${s.duracion ? ' (' + s.duracion + ' min)' : ''}${s.descripcion ? ' - ' + s.descripcion : ''}`)
          .join('\n');
        systemPrompt += `\n\nSERVICIOS:\n${svcs}`;
      }
      if (conocimiento.info) {
        const info = conocimiento.info;
        let dir = info.direccion || '';
        if (info.codigoPostal) dir += ' ' + info.codigoPostal;
        if (info.ciudad) dir += ', ' + info.ciudad;
        if (info.provincia) dir += ' (' + info.provincia + ')';
        if (dir.trim()) systemPrompt += `\nDIRECCION: ${dir}`;
        if (info.telefono)            systemPrompt += `\nTELEFONO: ${info.telefono}`;
        if (info.descripcionNegocio)  systemPrompt += `\nDESCRIPCION: ${info.descripcionNegocio}`;
        if (info.politicaCancelacion) systemPrompt += `\nCANCELACION: ${info.politicaCancelacion}`;
        if (info.formasPago?.length)  systemPrompt += `\nPAGOS: ${info.formasPago.join(', ')}`;
      }
      if (conocimiento.horarios) {
        const hDias = Object.entries(conocimiento.horarios)
          .filter(([, v]) => v.activo)
          .map(([dia, v]) => `${dia}: ${v.desde}-${v.hasta}h`)
          .join(', ');
        if (hDias) systemPrompt += `\nHORARIOS: ${hDias}`;
      }
      const faqs = (conocimiento.info?.preguntasFrecuentes || []).filter(f => f.pregunta && f.respuesta);
      if (faqs.length > 0) {
        systemPrompt += '\nFAQS:\n' + faqs.map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n');
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [{ role: 'system', content: systemPrompt }, ...historial],
    });

    const respuesta = completion.choices[0]?.message?.content || '';
    historial.push({ role: 'assistant', content: respuesta });

    const convRef = adminDb.collection('empresas').doc(empresaId).collection('conversaciones');
    const convKey = `wa_${numeroCliente}`;
    await convRef.doc(convKey).set({
      nombreCliente, numeroCliente, canal: 'whatsapp',
      ultimoTexto: texto, ultimoMensaje: FieldValue.serverTimestamp(), contactoId,
    }, { merge: true });
    await convRef.doc(convKey).collection('mensajes').add({ rol: 'cliente', texto, creadoEn: FieldValue.serverTimestamp() });
    await convRef.doc(convKey).collection('mensajes').add({ rol: 'agente', texto: respuesta, creadoEn: FieldValue.serverTimestamp() });

    return res.json({ respuesta });

  } catch (err) {
    const status  = err.status ?? err.response?.status ?? 'N/A';
    const errData = err.error  ?? err.response?.data   ?? null;
    console.error('[whatsapp-baileys] Error status', status + ':', err.message);
    if (errData) console.error('[whatsapp-baileys] data:', JSON.stringify(errData));
    return res.status(500).json({ error: err.message, openai_status: status, openai_data: errData });
  }
}
