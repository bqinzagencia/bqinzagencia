// pages/api/chatbot-widget-config.js
// Retorna la configuracion publica del chatbot para el widget
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  // CORS — el widget se carga desde cualquier dominio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id requerido' });

  try {
    const snap = await adminDb.collection('chatbots').doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: 'ChatBot no encontrado' });

    const data = snap.data();

    // Verificar trial
    if (data.trialHasta) {
      const hasta = data.trialHasta?.toDate ? data.trialHasta.toDate() : new Date(data.trialHasta);
      if (new Date() > hasta && !data.planActivo) {
        return res.json({
          nombre:   data.nombre || 'Asistente',
          color:    data.colorChat || '#2563EB',
          posicion: data.posicion  || 'derecha',
          saludo:   'Este chat no esta disponible en este momento.',
          servicios: [],
          inactivo: true,
        });
      }
    }

    // Cargar servicios
    const conocSnap = await adminDb.collection('chatbots').doc(id)
      .collection('config').doc('conocimiento').get();
    const conoc = conocSnap.exists ? conocSnap.data() : {};

    return res.json({
      nombre:    data.nombre || data.nombreEmpresa || 'Asistente',
      color:     data.colorChat  || '#2563EB',
      posicion:  data.posicion   || 'derecha',
      saludo:    data.saludo     || `Hola, bienvenido a ${data.nombre}. En que puedo ayudarte?`,
      avatarUrl: data.avatarUrl  || '',
      servicios: (conoc.servicios || []).filter(s => s.nombre).slice(0, 6),
      permitePedidos: conoc.permitePedidos || false,
      whatsapp:  data.whatsapp   || '',
    });
  } catch (err) {
    console.error('chatbot-widget-config:', err);
    return res.status(500).json({ error: err.message });
  }
}
