// pages/api/wasapbot-stock.js
// Sistema de inventario general por empresa
// Maneja items, entradas (compras) y salidas (ventas/uso) con contabilidad básica
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function mesKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  const { method } = req;

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const { empresaId, tipo, fecha, mes, itemId } = req.query;
    if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

    try {
      // GET ?tipo=items → todos los items del inventario
      if (tipo === 'items' || !tipo) {
        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('stockItems').orderBy('categoria').orderBy('nombre').get();
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.json({ ok: true, items });
      }

      // GET ?tipo=movimientos&fecha=YYYY-MM-DD → movimientos del día
      if (tipo === 'movimientos') {
        const diaKey = fecha || hoyKey();
        const inicio = new Date(diaKey + 'T00:00:00-05:00');
        const fin    = new Date(diaKey + 'T23:59:59-05:00');

        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos')
          .where('fecha', '>=', inicio)
          .where('fecha', '<=', fin)
          .orderBy('fecha', 'desc')
          .get();

        const movimientos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return res.json({ ok: true, movimientos, diaKey });
      }

      // GET ?tipo=resumen&fecha=YYYY-MM-DD → resumen del día (ventas, compras, ganancia)
      if (tipo === 'resumen') {
        const diaKey = fecha || hoyKey();
        const inicio = new Date(diaKey + 'T00:00:00-05:00');
        const fin    = new Date(diaKey + 'T23:59:59-05:00');

        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos')
          .where('fecha', '>=', inicio)
          .where('fecha', '<=', fin)
          .get();

        let totalEntradas = 0; // total invertido en compras
        let totalSalidas  = 0; // total vendido
        let costoDeSalidas = 0; // costo de lo que salió (para ganancia bruta)
        const movs = snap.docs.map(d => d.data());

        for (const m of movs) {
          if (m.tipo === 'entrada') {
            totalEntradas += Number(m.totalMovimiento || 0);
          } else if (m.tipo === 'salida') {
            totalSalidas  += Number(m.totalMovimiento || 0);
            costoDeSalidas += Number(m.costoTotal || 0);
          }
        }

        return res.json({
          ok: true,
          diaKey,
          totalEntradas,   // dinero invertido en compras del día
          totalSalidas,    // dinero generado por ventas del día
          gananciaBruta: totalSalidas - costoDeSalidas, // utilidad bruta
          totalMovimientos: movs.length,
        });
      }

      // GET ?tipo=resumenMes&mes=YYYY-MM → resumen del mes
      if (tipo === 'resumenMes') {
        const mesActual = mes || mesKey();
        const [anio, m] = mesActual.split('-');
        const inicio = new Date(Number(anio), Number(m)-1, 1);
        const fin    = new Date(Number(anio), Number(m), 0, 23, 59, 59);

        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos')
          .where('fecha', '>=', inicio)
          .where('fecha', '<=', fin)
          .get();

        let totalEntradas = 0, totalSalidas = 0, costoDeSalidas = 0;
        const movs = snap.docs.map(d => d.data());
        for (const m of movs) {
          if (m.tipo === 'entrada') totalEntradas += Number(m.totalMovimiento || 0);
          else if (m.tipo === 'salida') {
            totalSalidas  += Number(m.totalMovimiento || 0);
            costoDeSalidas += Number(m.costoTotal || 0);
          }
        }

        return res.json({
          ok: true, mes: mesActual,
          totalEntradas, totalSalidas,
          gananciaBruta: totalSalidas - costoDeSalidas,
          totalMovimientos: movs.length,
        });
      }

      // GET ?tipo=alertas → items con stock bajo o agotado
      if (tipo === 'alertas') {
        const snap = await adminDb.collection('empresas').doc(empresaId)
          .collection('stockItems').get();
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const agotados   = items.filter(it => it.stockActual <= 0);
        const bajoStock  = items.filter(it => it.stockActual > 0 && it.stockActual <= (it.stockMinimo || 5));
        return res.json({ ok: true, agotados, bajoStock });
      }

      return res.status(400).json({ error: 'Tipo no reconocido' });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────────
  if (method === 'POST') {
    const { accion, empresaId } = req.body;
    if (!empresaId || !accion) return res.status(400).json({ error: 'empresaId y accion requeridos' });

    try {

      // ── Crear o actualizar item del inventario ──────────────────────────────
      if (accion === 'guardarItem') {
        const { item } = req.body;
        if (!item?.nombre) return res.status(400).json({ error: 'nombre requerido' });

        const itemId = item.id || item.nombre.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        const ref = adminDb.collection('empresas').doc(empresaId)
          .collection('stockItems').doc(itemId);

        const snap = await ref.get();
        if (snap.exists && !item.id) {
          // Si ya existe con ese nombre, actualizar
          await ref.update({
            nombre:       item.nombre,
            categoria:    item.categoria || '',
            unidad:       item.unidad    || 'unidad',
            precioCompra: Number(item.precioCompra || 0),
            precioVenta:  Number(item.precioVenta  || 0),
            stockMinimo:  Number(item.stockMinimo  || 5),
            updatedAt:    FieldValue.serverTimestamp(),
          });
        } else {
          await ref.set({
            nombre:       item.nombre,
            categoria:    item.categoria || '',
            unidad:       item.unidad    || 'unidad',
            precioCompra: Number(item.precioCompra || 0),
            precioVenta:  Number(item.precioVenta  || 0),
            stockActual:  Number(item.stockInicial || 0),
            stockMinimo:  Number(item.stockMinimo  || 5),
            activo:       true,
            creadoEn:     FieldValue.serverTimestamp(),
            updatedAt:    FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        return res.json({ ok: true, itemId });
      }

      // ── Inicializar inventario con items predefinidos de la industria ────────
      if (accion === 'inicializarIndustria') {
        const { items } = req.body; // array de items predefinidos
        const batch = adminDb.batch();

        for (const item of (items || [])) {
          const itemId = item.nombre.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

          const ref = adminDb.collection('empresas').doc(empresaId)
            .collection('stockItems').doc(itemId);

          batch.set(ref, {
            nombre:       item.nombre,
            categoria:    item.categoria || '',
            unidad:       item.unidad    || 'unidad',
            precioCompra: Number(item.precioCompra || 0),
            precioVenta:  Number(item.precioVenta  || 0),
            stockActual:  0,
            stockMinimo:  Number(item.stockMinimo  || 5),
            activo:       true,
            esBase:       true, // marcado como item base de la industria
            creadoEn:     FieldValue.serverTimestamp(),
            updatedAt:    FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        await batch.commit();
        return res.json({ ok: true, total: items?.length || 0 });
      }

      // ── Registrar ENTRADA (compra de insumos) ───────────────────────────────
      if (accion === 'entrada') {
        const { items, proveedor, nota } = req.body;
        // items = [{ itemId, nombre, cantidad, precioUnitario }]
        if (!items?.length) return res.status(400).json({ error: 'items requeridos' });

        const batch = adminDb.batch();
        let totalMovimiento = 0;
        const itemsDetalle  = [];

        for (const it of items) {
          const cantidad      = Number(it.cantidad || 0);
          const precioUnit    = Number(it.precioUnitario || 0);
          const subtotal      = cantidad * precioUnit;
          totalMovimiento    += subtotal;

          itemsDetalle.push({
            itemId:         it.itemId,
            nombre:         it.nombre,
            cantidad,
            precioUnitario: precioUnit,
            subtotal,
            unidad:         it.unidad || 'unidad',
          });

          // Actualizar stock del item
          const itemRef = adminDb.collection('empresas').doc(empresaId)
            .collection('stockItems').doc(it.itemId);
          batch.update(itemRef, {
            stockActual:  FieldValue.increment(cantidad),
            precioCompra: precioUnit > 0 ? precioUnit : FieldValue.delete(), // actualizar precio de compra
            updatedAt:    FieldValue.serverTimestamp(),
          });
        }

        // Guardar el movimiento
        const movRef = adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos').doc();
        batch.set(movRef, {
          tipo:            'entrada',
          items:           itemsDetalle,
          totalMovimiento,
          proveedor:       proveedor || '',
          nota:            nota      || '',
          fecha:           FieldValue.serverTimestamp(),
          diaKey:          hoyKey(),
          mesKey:          mesKey(),
          creadoEn:        FieldValue.serverTimestamp(),
        });

        await batch.commit();
        return res.json({ ok: true, movimientoId: movRef.id, totalMovimiento });
      }

      // ── Registrar SALIDA (venta o uso de insumos) ───────────────────────────
      if (accion === 'salida') {
        const { items, cliente, nota, canal } = req.body;
        // items = [{ itemId, nombre, cantidad, precioVenta, precioCompra }]
        if (!items?.length) return res.status(400).json({ error: 'items requeridos' });

        const batch = adminDb.batch();
        let totalMovimiento = 0; // total vendido
        let costoTotal      = 0; // costo de lo vendido
        const itemsDetalle  = [];
        const alertas       = [];

        for (const it of items) {
          const cantidad      = Number(it.cantidad || 0);
          const precioVenta   = Number(it.precioVenta  || 0);
          const precioCompra  = Number(it.precioCompra || 0);
          const subtotalVenta = cantidad * precioVenta;
          const subtotalCosto = cantidad * precioCompra;

          totalMovimiento += subtotalVenta;
          costoTotal      += subtotalCosto;

          itemsDetalle.push({
            itemId:        it.itemId,
            nombre:        it.nombre,
            cantidad,
            precioVenta,
            precioCompra,
            subtotalVenta,
            subtotalCosto,
            unidad:        it.unidad || 'unidad',
          });

          // Actualizar stock
          const itemRef = adminDb.collection('empresas').doc(empresaId)
            .collection('stockItems').doc(it.itemId);
          const itemSnap = await itemRef.get();

          if (itemSnap.exists) {
            const stockActual = itemSnap.data().stockActual || 0;
            const nuevoStock  = Math.max(0, stockActual - cantidad);
            const stockMinimo = itemSnap.data().stockMinimo || 5;

            batch.update(itemRef, {
              stockActual: nuevoStock,
              updatedAt:   FieldValue.serverTimestamp(),
            });

            if (nuevoStock === 0) {
              alertas.push({ nombre: it.nombre, tipo: 'agotado', stock: 0 });
            } else if (nuevoStock <= stockMinimo) {
              alertas.push({ nombre: it.nombre, tipo: 'bajo', stock: nuevoStock });
            }
          }
        }

        // Guardar movimiento
        const movRef = adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos').doc();
        batch.set(movRef, {
          tipo:            'salida',
          items:           itemsDetalle,
          totalMovimiento, // total en ventas
          costoTotal,      // costo de lo que salió
          ganancia:        totalMovimiento - costoTotal,
          cliente:         cliente || '',
          nota:            nota    || '',
          canal:           canal   || 'manual', // 'manual' | 'whatsapp' | 'web'
          fecha:           FieldValue.serverTimestamp(),
          diaKey:          hoyKey(),
          mesKey:          mesKey(),
          creadoEn:        FieldValue.serverTimestamp(),
        });

        await batch.commit();

        // Email de alertas si hay stock crítico
        if (alertas.length > 0) {
          const empSnap = await adminDb.collection('empresas').doc(empresaId).get();
          const emp     = empSnap.data();
          if (emp?.email) {
            const { enviarEmailInventario } = await import('../../lib/emailWasapbot');
            await enviarEmailInventario({
              emailNegocio:  emp.email,
              nombreNegocio: emp.nombreEmpresa || 'tu negocio',
              alertas,
              panelUrl: `https://agenciame.com/wasapbot/panel/stock/${empresaId}`,
            }).catch(() => {});
          }
        }

        return res.json({ ok: true, movimientoId: movRef.id, totalMovimiento, costoTotal, ganancia: totalMovimiento - costoTotal, alertas });
      }

      // ── Eliminar item del inventario ────────────────────────────────────────
      if (accion === 'eliminarItem') {
        const { itemId } = req.body;
        await adminDb.collection('empresas').doc(empresaId)
          .collection('stockItems').doc(itemId).delete();
        return res.json({ ok: true });
      }

      // ── Ajuste de stock (corrección manual) ─────────────────────────────────
      if (accion === 'ajusteStock') {
        const { itemId, stockNuevo, nota } = req.body;
        const itemRef = adminDb.collection('empresas').doc(empresaId)
          .collection('stockItems').doc(itemId);
        const snap = await itemRef.get();
        if (!snap.exists) return res.status(404).json({ error: 'Item no encontrado' });

        const stockAnterior = snap.data().stockActual || 0;
        await itemRef.update({ stockActual: Number(stockNuevo), updatedAt: FieldValue.serverTimestamp() });

        // Registrar como movimiento de ajuste
        await adminDb.collection('empresas').doc(empresaId)
          .collection('stockMovimientos').add({
            tipo:            'ajuste',
            items:           [{ itemId, nombre: snap.data().nombre, stockAnterior, stockNuevo: Number(stockNuevo) }],
            totalMovimiento: 0,
            nota:            nota || 'Ajuste manual de stock',
            fecha:           FieldValue.serverTimestamp(),
            diaKey:          hoyKey(),
            mesKey:          mesKey(),
            creadoEn:        FieldValue.serverTimestamp(),
          });

        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Acción no reconocida: ' + accion });

    } catch (err) {
      console.error('wasapbot-stock:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
