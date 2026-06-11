// lib/utils.js

export const INDUSTRIAS = [
  { value: 'taller',             label: 'Taller / Mecánica',             color: '#FF6B6B' },
  { value: 'peluqueria',         label: 'Peluquería / Spa',              color: '#EC4899' },
  { value: 'inmobiliaria',       label: 'Inmobiliaria',                  color: '#3B82F6' },
  { value: 'restaurante',        label: 'Restaurante / Comidas',         color: '#EAB308' },
  { value: 'restaurante_barrio', label: 'Restaurante de barrio',         color: '#E85D04' },
  { value: 'tienda',             label: 'Tienda / Retail',               color: '#10B981' },
  { value: 'papeleria',          label: 'Papelería / Servicios',         color: '#8B5CF6' },
  { value: 'gimnasio',           label: 'Gimnasio / Fitness',            color: '#F97316' },
  { value: 'salud',              label: 'Salud / Clínica',               color: '#14B8A6' },
  { value: 'ajedrez',            label: 'Escuela de Ajedrez / Deporte',  color: '#C0962C' },
  { value: 'arquitectura',       label: 'Arquitectura & Construcción',   color: '#B5A16E' },
  { value: 'educacion',          label: 'Educación / Academia',          color: '#6366F1' },
  { value: 'aduana',             label: 'Agencia de Aduana',            color: '#0EA5E9' },
  { value: 'portuaria',          label: 'Operadora Portuaria',          color: '#0F766E' },
  { value: 'psicologo',   label: 'Psicologia & Bienestar',        color: '#8B5CF6' },
  { value: 'barbero',     label: 'Barberia & Estilo',             color: '#1D4ED8' },
  { value: 'reposteria',  label: 'Reposteria & Chef a Domicilio', color: '#EC4899' },
  { value: 'veterinaria', label: 'Veterinaria & Mascotas',        color: '#10B981' },
  { value: 'fotografia',  label: 'Fotografia & Video',            color: '#F59E0B' },
  { value: 'contador',   label: 'Contaduria & Finanzas',         color: '#0EA5E9' },
  { value: 'acarreos',    label: 'Transporte & Acarreos',         color: '#6B7280' },
  { value: 'tecnico',     label: 'Soporte Tecnico / Electronica', color: '#6366F1' },
  { value: 'otro',        label: 'Otro negocio',                  color: '#6B7280' },
];

// ── PLANES con límites reales ─────────────────────────────────────────────────
// -1 = ilimitado  |  0 = bloqueado  |  n = máximo permitido
export const PLANES = {
  emprendedor: {
    nombre: 'Emprendedor',
    precio: 189000,
    agentes:           1,      // máx 1 agente IA
    conversaciones:    500,    // máx 500 conversaciones/mes
    crm:               200,    // máx 200 contactos en CRM
    canales:           ['web', 'whatsapp'],
    llamadas:          0,      // Voz IA NO disponible
    reportesAvanzados: false,
    soporte:           'email',
  },
  profesional: {
    nombre: 'Profesional',
    precio: 490000,
    agentes:           3,
    conversaciones:    -1,     // ilimitadas
    crm:               -1,     // ilimitado
    canales:           ['web', 'whatsapp', 'instagram', 'facebook'],
    llamadas:          100,    // 100 llamadas Voz IA/mes
    reportesAvanzados: true,
    soporte:           'email+chat',
  },
  agencia: {
    nombre: 'Agencia',
    precio: 1190000,
    agentes:           -1,     // ilimitados
    conversaciones:    -1,
    crm:               -1,
    canales:           ['web', 'whatsapp', 'instagram', 'facebook', 'telegram'],
    llamadas:          -1,
    reportesAvanzados: true,
    soporte:           'prioritario',
  },
};

// ── Verificador central de límites ───────────────────────────────────────────
// Úsalo ANTES de crear cualquier recurso (agente, contacto, conversación…)
// Retorna: { ok: true } | { ok: true, advertencia: true, mensaje, porcentaje }
//        | { ok: false, mensaje, requiereUpgrade: true }
export function verificarLimite(plan, recurso, cantidadActual) {
  const p = PLANES[plan] || PLANES.emprendedor;
  const limite = p[recurso];

  // ilimitado
  if (limite === -1) return { ok: true };

  // completamente bloqueado (ej: llamadas en emprendedor)
  if (limite === 0) {
    const msgs = {
      llamadas: 'La Voz IA no está disponible en el plan Emprendedor. Actualiza tu plan.',
    };
    return { ok: false, mensaje: msgs[recurso] || `Esta función no está disponible en el plan ${p.nombre}.`, requiereUpgrade: true };
  }

  // límite alcanzado
  if (cantidadActual >= limite) {
    const msgs = {
      agentes:        `Límite de ${limite} agente(s) alcanzado en el plan ${p.nombre}.`,
      conversaciones: `Límite de ${limite} conversaciones/mes alcanzado en el plan ${p.nombre}.`,
      crm:            `Límite de ${limite} contactos en CRM alcanzado en el plan ${p.nombre}.`,
      llamadas:       `Límite de ${limite} llamadas de Voz IA/mes alcanzado en el plan ${p.nombre}.`,
    };
    return {
      ok: false,
      mensaje: (msgs[recurso] || `Límite alcanzado en el plan ${p.nombre}.`) + ' Actualiza tu plan para continuar.',
      requiereUpgrade: true,
      limite,
      actual: cantidadActual,
    };
  }

  // advertencia al 80%
  const pct = (cantidadActual / limite) * 100;
  if (pct >= 80) {
    return {
      ok: true,
      advertencia: true,
      mensaje: `Llevas ${cantidadActual} de ${limite} ${recurso} este mes. Te acercas al límite del plan ${p.nombre}.`,
      porcentaje: Math.round(pct),
    };
  }

  return { ok: true };
}

// Funcion helper para mostrar alertas de plan bonitas
// Retorna props listas para pasarle a <AlertaPlan>
export function getAlertaProps(check) {
  if (!check || check.ok) return null;
  if (check.requiereUpgrade) return {
    mensaje: check.mensaje,
    detalle: 'Actualiza tu plan para desbloquear esta función.',
    tipo: 'limite',
  };
  if (check.advertencia) return {
    mensaje: check.mensaje,
    detalle: `${check.porcentaje}% del límite usado. Considera actualizar tu plan.`,
    tipo: 'advertencia',
  };
  return null;
}
export function canalPermitido(plan, canal) {
  const p = PLANES[plan] || PLANES.emprendedor;
  return p.canales.includes(canal);
}

export const CANALES = {
  web:       { label: 'Chat Web',   icon: '🌐', planes: ['emprendedor', 'profesional', 'agencia'] },
  whatsapp:  { label: 'WhatsApp',   icon: '💬', planes: ['emprendedor', 'profesional', 'agencia'] },
  instagram: { label: 'Instagram',  icon: '📸', planes: ['profesional', 'agencia'] },
  facebook:  { label: 'Facebook',   icon: '📘', planes: ['profesional', 'agencia'] },
  telegram:  { label: 'Telegram',   icon: '🔵', planes: ['agencia'] },
};

export function formatPrecio(num) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}
export function formatFecha(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
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
