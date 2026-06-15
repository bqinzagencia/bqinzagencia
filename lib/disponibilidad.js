// lib/disponibilidad.js
// Calcula horarios disponibles para citas a partir del horario semanal
// configurado por la empresa, la duracion del servicio solicitado y las
// citas que ya estan agendadas (pendientes/confirmadas) ese mismo dia.
//
// Pensado para usarse desde pages/api/whatsapp-baileys.js antes de crear
// una cita detectada por la IA (CITA_DETECTADA), para evitar solapamientos.

const DIAS_ORDEN = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

// "HH:MM" -> minutos desde medianoche. null si es invalido.
export function horaAMinutos(hhmm) {
  if (!hhmm) return null;
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

// minutos desde medianoche -> "HH:MM"
export function minutosAHora(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// "HH:MM" 24h -> "h:MM am/pm" para mostrar al cliente
export function formatearHora12(hhmm) {
  const mins = horaAMinutos(hhmm);
  if (mins === null) return hhmm || '';
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Acepta "9", "9:00", "09:00", "9am", "9 pm", "2:30 p.m.", "14:30"...
// Devuelve "HH:MM" 24h o null si no se puede interpretar.
export function normalizarHora(horaStr) {
  if (!horaStr) return null;
  const s = String(horaStr).trim().toLowerCase();
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3] ? m[3].replace(/\./g, '') : null;
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59 || isNaN(h)) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// Acepta "DD/MM/YYYY", "DD-MM-YYYY", "DD/MM" (asume año actual)...
// Devuelve "YYYY-MM-DD" o null si no se puede interpretar.
export function normalizarFecha(fechaStr) {
  if (!fechaStr) return null;
  const m = String(fechaStr).trim().match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (!m) return null;
  const dia = parseInt(m[1], 10), mes = parseInt(m[2], 10);
  let anio = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  if (anio < 100) anio += 2000;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// "YYYY-MM-DD" -> 'lunes'..'domingo'
export function diaKeyDesdeFechaKey(fechaKey) {
  if (!fechaKey) return null;
  const [y, m, d] = fechaKey.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  if (isNaN(fecha.getTime())) return null;
  return DIAS_ORDEN[fecha.getDay()];
}

const DIAS_LABEL = {
  lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves',
  viernes:'Viernes', sabado:'Sábado', domingo:'Domingo',
};
const ORDEN_SEMANA = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];

// Convierte el horario semanal estructurado en un texto legible para el
// prompt de la IA, ej: "Lunes 08:00-18:00, Martes 08:00-18:00, Sábado 08:00-13:00"
export function horarioSemanalATexto(horarioSemanal) {
  if (!horarioSemanal) return '';
  return ORDEN_SEMANA
    .filter(key => horarioSemanal[key]?.abierto)
    .map(key => {
      const franjas = horarioSemanal[key].franjas || [];
      const rango = franjas.map(f => `${f.de}-${f.a}`).join(' y ');
      return `${DIAS_LABEL[key]} ${rango}`;
    })
    .join(', ');
}

// Franjas (en minutos) configuradas para un dia. [] si esta cerrado.
function franjasEnMinutos(horarioSemanal, diaKey) {
  const dia = horarioSemanal?.[diaKey];
  if (!dia || !dia.abierto) return [];
  return (dia.franjas || [])
    .map(f => ({ inicio: horaAMinutos(f.de), fin: horaAMinutos(f.a) }))
    .filter(f => f.inicio !== null && f.fin !== null && f.fin > f.inicio);
}

function ocupadosEnMinutos(ocupados) {
  return (ocupados || [])
    .map(o => {
      const inicio = horaAMinutos(normalizarHora(o.hora));
      if (inicio === null) return null;
      return { inicio, fin: inicio + Math.max(5, Number(o.duracionMin) || 30) };
    })
    .filter(Boolean);
}

// ── Lista de horarios libres para un dia ──────────────────────
// horarioSemanal: { lunes:{abierto,franjas:[{de,a}]}, ... }
// fecha: en cualquier formato reconocido por normalizarFecha
// duracionMin: duracion del servicio (minutos)
// ocupados: [{hora:'HH:MM', duracionMin}] citas pendientes/confirmadas ese dia
// pasoMin: cada cuantos minutos se sugiere un horario (default 30)
export function horariosDisponibles({ horarioSemanal, fecha, duracionMin = 30, ocupados = [], pasoMin = 30 }) {
  const fechaKey = normalizarFecha(fecha);
  if (!fechaKey) return [];
  const diaKey  = diaKeyDesdeFechaKey(fechaKey);
  const franjas = franjasEnMinutos(horarioSemanal, diaKey);
  if (franjas.length === 0) return [];

  const dur         = Math.max(5, Number(duracionMin) || 30);
  const ocupadosMin = ocupadosEnMinutos(ocupados);

  const libres = [];
  for (const franja of franjas) {
    for (let slot = franja.inicio; slot + dur <= franja.fin; slot += pasoMin) {
      const slotFin = slot + dur;
      const solapa  = ocupadosMin.some(o => slot < o.fin && slotFin > o.inicio);
      if (!solapa) libres.push(minutosAHora(slot));
    }
  }
  return libres;
}

// ── Verifica un horario puntual solicitado ────────────────────
// Devuelve { disponible, motivo, fechaKey, diaKey, horaNorm }
// motivo: 'ok' | 'fecha_invalida' | 'hora_invalida' | 'cerrado' | 'fuera_horario' | 'ocupado'
export function verificarDisponibilidad({ horarioSemanal, fecha, hora, duracionMin = 30, ocupados = [] }) {
  const fechaKey = normalizarFecha(fecha);
  if (!fechaKey) return { disponible: false, motivo: 'fecha_invalida' };
  const horaNorm = normalizarHora(hora);
  if (!horaNorm) return { disponible: false, motivo: 'hora_invalida', fechaKey };

  const diaKey  = diaKeyDesdeFechaKey(fechaKey);
  const franjas = franjasEnMinutos(horarioSemanal, diaKey);
  if (franjas.length === 0) return { disponible: false, motivo: 'cerrado', fechaKey, diaKey };

  const dur    = Math.max(5, Number(duracionMin) || 30);
  const inicio = horaAMinutos(horaNorm);
  const fin    = inicio + dur;

  const dentroDeFranja = franjas.some(f => inicio >= f.inicio && fin <= f.fin);
  if (!dentroDeFranja) return { disponible: false, motivo: 'fuera_horario', fechaKey, diaKey, horaNorm };

  const ocupadosMin = ocupadosEnMinutos(ocupados);
  const solapa = ocupadosMin.some(o => inicio < o.fin && fin > o.inicio);
  if (solapa) return { disponible: false, motivo: 'ocupado', fechaKey, diaKey, horaNorm };

  return { disponible: true, motivo: 'ok', fechaKey, diaKey, horaNorm };
}
