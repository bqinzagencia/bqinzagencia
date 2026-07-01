// pages/api/admin-crear-agente-afiliado.js
// Endpoint de uso interno: crea una empresa "afiliado" controlada por Bqinzagencia
// (no por el cliente final) con su agente IA precargado y base de conocimiento.
// Protegido con el mismo secret de admin que ya usa el resto del sistema.

import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_WA_SECRET || 'REEMPLAZAR_SECRET';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  const { nombreEmpresa, email, telefono, ciudad, prompt, productos, faqs } = req.body;
  if (!nombreEmpresa || !email || !prompt) {
    return res.status(400).json({ error: 'Faltan datos requeridos (nombreEmpresa, email, prompt)' });
  }

  try {
    const empresaRef = adminDb.collection('empresas').doc();
    const empresaId = empresaRef.id;

    await empresaRef.set({
      nombreEmpresa,
      email,
      telefono: telefono || '',
      ciudad: ciudad || '',
      industria: 'otro',
      plan: 'profesional',
      producto: 'wasapbot',     // requerido por whatsapp-baileys.js para activar el bot
      planActivo: true,
      esAfiliado: true,           // marca interna: cuenta gestionada por Bqinzagencia, no por el cliente
      comisionPorLead: true,
      whatsapp: { activo: true }, // necesario para que whatsapp-baileys.js responda
      creadoEn: FieldValue.serverTimestamp(),
      agentesActivos: 1,
      conversacionesHoy: 0,
      leadsTotal: 0,
    });

    // Crear el agente IA dentro de la subcoleccion de la empresa
    const agenteRef = await empresaRef.collection('agentes').add({
      nombre: `Asistente ${nombreEmpresa}`,
      tipo: 'ventas',
      canales: ['whatsapp'],
      personalidad: 'profesional, cercano y conocedor del sector agrícola',
      prompt,
      activo: true,
      conversaciones: 0,
      creadoEn: FieldValue.serverTimestamp(),
    });

    // Guardar base de conocimiento (catalogo) en el mismo formato que usa conocimiento.js
    await empresaRef.collection('config').doc('conocimiento').set({
      servicios: (productos || []).map(p => ({
        nombre: p.nombre,
        precio: '',
        duracion: '',
        descripcion: p.descripcion || 'Consultar disponibilidad y precio',
      })),
      info: {
        direccion: 'Ctra. Zaragoza, Km 8,6, Beriáin (Navarra)',
        ciudad: ciudad || 'Beriáin, Navarra',
        telefono: telefono || '',
        descripcionNegocio: 'Venta y reparación de maquinaria agrícola. Marcas: Krone, Amazone, Tanco, Schäffer, Avant, Yanmar, Kobelco.',
        preguntasFrecuentes: faqs || [],
      },
      promptGenerado: prompt,
      actualizadoEn: FieldValue.serverTimestamp(),
    });

    return res.json({ ok: true, empresaId, agenteId: agenteRef.id });
  } catch (err) {
    console.error('admin-crear-agente-afiliado error:', err);
    return res.status(500).json({ error: err.message });
  }
}
