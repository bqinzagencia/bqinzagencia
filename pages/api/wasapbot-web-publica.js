// pages/api/wasapbot-web-publica.js
// Endpoint público (sin auth) que sirve los datos de la web del negocio
// buscando por slugWeb. Usado por pages/wasapbot/web/[slug].js
import { db as adminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug requerido' });

  try {
    const snap = await adminDb.collection('empresas').where('slugWeb', '==', slug).limit(1).get();
    if (snap.empty) return res.status(404).json({ error: 'Página no encontrada' });

    const doc = snap.docs[0];
    const data = doc.data();

    // Solo exponer campos públicos — nunca email, teléfono interno, ownerUid, etc.
    const empresaPublica = {
      nombreEmpresa: data.nombreEmpresa || '',
      tituloWeb: data.tituloWeb || '',
      descripcionWeb: data.descripcionWeb || '',
      fotoWebPortada: data.fotoWebPortada || '',
      webActivaWasapbot: data.webActivaWasapbot !== false,
      whatsapp: { numero: data.whatsapp?.numero || '' },
    };

    // Catálogo público (servicios/productos)
    const conocSnap = await adminDb.collection('empresas').doc(doc.id)
      .collection('config').doc('conocimiento').get();
    const servicios = conocSnap.exists ? (conocSnap.data().servicios || []) : [];
    const serviciosPublicos = servicios
      .filter(s => s.nombre?.trim())
      .map(s => ({ nombre: s.nombre, descripcion: s.descripcion || '', categoria: s.categoria || '', foto: s.foto || '' }));

    return res.json({ ok: true, empresa: empresaPublica, servicios: serviciosPublicos });
  } catch (err) {
    console.error('wasapbot-web-publica error:', err);
    return res.status(500).json({ error: 'Error al cargar la página' });
  }
}
