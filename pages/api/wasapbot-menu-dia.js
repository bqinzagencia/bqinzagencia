// pages/api/wasapbot-menu-dia.js
// Gestiona el menú del día (stock diario) y las plantillas de menú
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  const { method } = req;

  // ── GET ──────────────────────────────────────────────────────
  // GET ?empresaId=X&fecha=YYYY-MM-DD  → menú del día
  // GET ?empresaId=X&tipo=plantillas   → lista de plantillas
  // GET ?empresaId=X&tipo=catalogo     → catálogo base
  if (method === 'GET') {
    const { empresaId, fecha, tipo } = req.query;
    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      // Catálogo base
      if (tipo === 'catalogo') {
        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('config').doc('conocimiento').get();
        return res.json({ ok: true, items: snap.exists ? (snap.data().servicios || []) : [] });
      }

      // Plantillas guardadas
      if (tipo === 'plantillas') {
        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('menuPlantillas').orderBy('creadoEn', 'desc').get();
        const plantillas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.json({ ok: true, plantillas });
      }

      // Menú del día (por defecto hoy)
      const diaKey = fecha || hoyKey();
      const snap = await adminDb.collection('empresas').doc(empresaId)
        .collection('menuDia').doc(diaKey).get();

      if (!snap.exists) return res.json({ ok: true, menuDia: null, diaKey });
      return res.json({ ok: true, menuDia: snap.data(), diaKey });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST ─────────────────────────────────────────────────────
  if (method === 'POST') {
    const { accion, empresaId } = req.body;
    if (!empresaId || !accion) return res.status(400).json({ error: 'empresaId y accion requeridos' });

    try {
      // ── Abrir menú del día (desde catálogo base o plantilla) ──
      if (accion === 'abrirDia') {
        const { fecha, items } = req.body;
        const diaKey = fecha || hoyKey();

        // items = [{ itemId, nombre, foto, precio, stockInicial, activo, orden }]
        const itemsConStock = (items || []).map((it, i) => ({
          itemId:       it.itemId || it.nombre.toLowerCase().replace(/\s+/g, '_'),
          nombre:       it.nombre,
          foto:         it.foto || '',
          precio:       it.precio || 0,
          descripcion:  it.descripcion || '',
          categoria:    it.categoria || '',
          stockInicial: Number(it.stockInicial || 0),
          stockActual:  Number(it.stockActual ?? it.stockInicial ?? 0),
          activo:       it.activo !== false,
          orden:        it.orden ?? i,
        }));

        await adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(diaKey).set({
            items:     itemsConStock,
            diaKey,
            abierto:   true,
            creadoEn:  FieldValue.serverTimestamp(),
            resetAt:   null,
          });

        return res.json({ ok: true, diaKey, totalItems: itemsConStock.length });
      }

      // ── Guardar plantilla ──
      if (accion === 'guardarPlantilla') {
        const { nombre, items } = req.body;
        if (!nombre) return res.status(400).json({ error: 'nombre requerido' });

        const ref = adminDb.collection('empresas').doc(empresaId)
          .collection('menuPlantillas').doc(nombre.toLowerCase().replace(/\s+/g, '_'));

        await ref.set({
          nombre,
          items: (items || []).map(it => ({
            itemId:      it.itemId || it.nombre.toLowerCase().replace(/\s+/g, '_'),
            nombre:      it.nombre,
            foto:        it.foto || '',
            precio:      it.precio || 0,
            descripcion: it.descripcion || '',
            categoria:   it.categoria || '',
            stockDefault: Number(it.stockInicial || it.stockDefault || 0),
            activo:      it.activo !== false,
          })),
          creadoEn: FieldValue.serverTimestamp(),
          actualizadoEn: FieldValue.serverTimestamp(),
        }, { merge: true });

        return res.json({ ok: true });
      }

      // ── Actualizar item del día (stock, activo, intercambio) ──
      if (accion === 'actualizarItem') {
        const { fecha, itemId, cambios } = req.body;
        const diaKey = fecha || hoyKey();

        const docRef = adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(diaKey);
        const snap = await docRef.get();
        if (!snap.exists) return res.status(404).json({ error: 'Menú del día no encontrado' });

        const items = snap.data().items || [];
        const idx   = items.findIndex(it => it.itemId === itemId);
        if (idx === -1) return res.status(404).json({ error: 'Item no encontrado' });

        items[idx] = { ...items[idx], ...cambios };
        await docRef.update({ items });

        return res.json({ ok: true, item: items[idx] });
      }

      // ── Intercambiar dos ítems (swap de orden o de día) ──
      if (accion === 'swapItems') {
        const { fecha, itemIdA, itemIdB } = req.body;
        const diaKey = fecha || hoyKey();

        const docRef = adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(diaKey);
        const snap = await docRef.get();
        if (!snap.exists) return res.status(404).json({ error: 'Menú del día no encontrado' });

        const items = snap.data().items || [];
        const idxA  = items.findIndex(it => it.itemId === itemIdA);
        const idxB  = items.findIndex(it => it.itemId === itemIdB);
        if (idxA === -1 || idxB === -1) return res.status(404).json({ error: 'Item no encontrado' });

        // Swap de orden visual
        const ordenA = items[idxA].orden;
        items[idxA].orden = items[idxB].orden;
        items[idxB].orden = ordenA;

        await docRef.update({ items });
        return res.json({ ok: true });
      }

      // ── Mover ítem a otro día ──
      if (accion === 'moverItem') {
        const { fechaOrigen, fechaDestino, itemId } = req.body;
        if (!fechaOrigen || !fechaDestino || !itemId)
          return res.status(400).json({ error: 'Faltan campos' });

        const origenRef = adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(fechaOrigen);
        const destinoRef = adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(fechaDestino);

        const [origenSnap, destinoSnap] = await Promise.all([origenRef.get(), destinoRef.get()]);
        if (!origenSnap.exists) return res.status(404).json({ error: 'Día origen no encontrado' });

        const itemsOrigen  = origenSnap.data().items || [];
        const item = itemsOrigen.find(it => it.itemId === itemId);
        if (!item) return res.status(404).json({ error: 'Item no encontrado' });

        // Agregar al destino
        const itemsDestino = destinoSnap.exists ? (destinoSnap.data().items || []) : [];
        const yaExiste = itemsDestino.find(it => it.itemId === itemId);
        if (!yaExiste) {
          itemsDestino.push({ ...item, stockActual: item.stockInicial, orden: itemsDestino.length });
          if (destinoSnap.exists) {
            await destinoRef.update({ items: itemsDestino });
          } else {
            await destinoRef.set({ items: itemsDestino, diaKey: fechaDestino, abierto: false, creadoEn: FieldValue.serverTimestamp() });
          }
        }

        return res.json({ ok: true });
      }

      // ── Copiar menú de un día a otro ──
      if (accion === 'copiarDia') {
        const { fechaOrigen, fechaDestino } = req.body;
        if (!fechaOrigen || !fechaDestino) return res.status(400).json({ error: 'Faltan campos' });

        const origenSnap = await adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(fechaOrigen).get();
        if (!origenSnap.exists) return res.status(404).json({ error: 'Día origen no encontrado' });

        const itemsCopia = (origenSnap.data().items || []).map(it => ({
          ...it,
          stockActual: it.stockInicial, // resetear al stock inicial
        }));

        await adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(fechaDestino).set({
            items:    itemsCopia,
            diaKey:   fechaDestino,
            abierto:  false,
            creadoEn: FieldValue.serverTimestamp(),
            copiaDe:  fechaOrigen,
          });

        return res.json({ ok: true, totalItems: itemsCopia.length });
      }

      // ── Reset del día (volver a stock inicial) ──
      if (accion === 'resetDia') {
        const { fecha } = req.body;
        const diaKey = fecha || hoyKey();

        const docRef = adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(diaKey);
        const snap = await docRef.get();
        if (!snap.exists) return res.status(404).json({ error: 'Menú no encontrado' });

        const items = (snap.data().items || []).map(it => ({
          ...it,
          stockActual: it.stockInicial,
        }));

        await docRef.update({ items, resetAt: FieldValue.serverTimestamp() });
        return res.json({ ok: true });
      }

      // ── Cerrar el día ──
      if (accion === 'cerrarDia') {
        const { fecha } = req.body;
        const diaKey = fecha || hoyKey();
        await adminDb.collection('empresas').doc(empresaId)
          .collection('menuDia').doc(diaKey).update({ abierto: false });
        return res.json({ ok: true });
      }

      // ── Eliminar plantilla ──
      if (accion === 'eliminarPlantilla') {
        const { plantillaId } = req.body;
        await adminDb.collection('empresas').doc(empresaId)
          .collection('menuPlantillas').doc(plantillaId).delete();
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });

    } catch (err) {
      console.error('wasapbot-menu-dia:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
