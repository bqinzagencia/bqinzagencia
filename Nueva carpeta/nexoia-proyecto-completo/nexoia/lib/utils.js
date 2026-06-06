// lib/utils.js

export const INDUSTRIAS = [
  { value: 'taller', label: '🔧 Taller / Mecánica', color: '#FF6B6B' },
  { value: 'peluqueria', label: '✂️ Peluquería / Spa', color: '#EC4899' },
  { value: 'inmobiliaria', label: '🏠 Inmobiliaria', color: '#3B82F6' },
  { value: 'restaurante', label: '🍕 Restaurante / Comidas', color: '#EAB308' },
  { value: 'tienda', label: '🛒 Tienda / Retail', color: '#10B981' },
  { value: 'papeleria', label: '📋 Papelería / Servicios', color: '#8B5CF6' },
  { value: 'gimnasio', label: '🏋️ Gimnasio / Fitness', color: '#F97316' },
  { value: 'salud', label: '🏥 Salud / Clínica', color: '#14B8A6' },
  { value: 'educacion', label: '📚 Educación / Academia', color: '#6366F1' },
  { value: 'otro', label: '🏢 Otro negocio', color: '#6B7280' },
];

export const PLANES = {
  emprendedor: {
    nombre: 'Emprendedor',
    precio: 149000,
    agentes: 1,
    conversaciones: 500,
    canales: ['web', 'whatsapp'],
    llamadas: 0,
    crm: 200,
  },
  profesional: {
    nombre: 'Profesional',
    precio: 349000,
    agentes: 3,
    conversaciones: -1,
    canales: ['web', 'whatsapp', 'instagram', 'facebook'],
    llamadas: 100,
    crm: -1,
  },
  agencia: {
    nombre: 'Agencia',
    precio: 890000,
    agentes: -1,
    conversaciones: -1,
    canales: ['web', 'whatsapp', 'instagram', 'facebook', 'telegram'],
    llamadas: -1,
    crm: -1,
  },
};

export const CANALES = {
  web: { label: 'Chat Web', icon: '🌐' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  instagram: { label: 'Instagram', icon: '📸' },
  facebook: { label: 'Facebook', icon: '📘' },
  telegram: { label: 'Telegram', icon: '🔵' },
};

export function formatPrecio(num) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatFecha(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatHora(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function getIndustriaInfo(value) {
  return INDUSTRIAS.find(i => i.value === value) || INDUSTRIAS[INDUSTRIAS.length - 1];
}

export function iniciales(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function tiempoRelativo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'hace un momento';
  if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)}h`;
  return formatFecha(ts);
}
