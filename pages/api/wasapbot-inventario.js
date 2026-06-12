// pages/api/wasapbot-inventario.js
// Descuenta stock cuando se confirma un pedido y envía alertas
import { db as adminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { enviarEmailInventario } from '../../lib/emailWasapbot';

function hoyKey() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { accion, empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });

  try {
    // ── Descontar stock al confirmar pedido ──────────────────
    if (accion === 'descontarPedido') {
      const { items, fecha } = req.body;
      // items = [{ nombre, cantidad }]
      if (!items?.length) return res.json({ ok: true, alertas: [] });

      const diaKey = fecha || hoyKey();
      const docRef = adminDb.collection('empresas').doc(empresaId)
        .collection('menuDia').doc(diaKey);
      const snap = await docRef.get();

      if (!snap.exists) return res.json({ ok: true, alertas: [], sin_inventario: true });

      const menuItems  = snap.data().items || [];
      const alertas    = [];
      let   cambios    = false;

      for (const pedidoItem of items) {
        const idx = menuItems.findIndex(mi =>
          mi.nombre.toLowerCase() === pedidoItem.nombre.toLowerCase() ||
          mi.itemId === pedidoItem.itemId
        );
        if (idx === -1) continue;

        const anterior  = menuItems[idx].stockActual || 0;
        const cantidad  = pedidoItem.cantidad || 1;
        const nuevo     = Math.max(0, anterior - cantidad);

        menuItems[idx].stockActual = nuevo;
        cambios = true;

        // Si queda 0 → marcar inactivo automáticamente
        if (nuevo === 0) {
          menuItems[idx].activo = false;
          alertas.push({ nombre: menuItems[idx].nombre, tipo: 'agotado', stock: 0 });
        } else if (nuevo <= 3) {
          // Alerta de bajo stock (umbral: 3 o menos)
          alertas.push({ nombre: menuItems[idx].nombre, tipo: 'bajo', stock: nuevo });
        }
      }

      if (cambios) {
        await docRef.update({ items: menuItems });
      }

      // Enviar emails de alerta si hay
      if (alertas.length > 0) {
        const empresaSnap = await adminDb.collection('empresas').doc(empresaId).get();
        const empresa     = empresaSnap.data();
        const emailNegocio = empresa?.email;
        const panelUrl    = `https://agenciame.com/wasapbot/panel/menu/${empresaId}`;

        await enviarEmailInventario({
          emailNegocio,
          nombreNegocio: empresa?.nombreEmpresa || 'tu negocio',
          alertas,
          panelUrl,
        }).catch(() => {});
      }

      return res.json({ ok: true, alertas });
    }

    // ── Obtener resumen del inventario del día ───────────────
    if (accion === 'resumen') {
      const { fecha } = req.body;
      const diaKey = fecha || hoyKey();
      const snap = await adminDb.collection('empresas').doc(empresaId)
        .collection('menuDia').doc(diaKey).get();

      if (!snap.exists) return res.json({ ok: true, items: [], diaKey });
      const items = snap.data().items || [];
      return res.json({
        ok: true,
        diaKey,
        items,
        agotados:    items.filter(i => i.stockActual === 0).length,
        bajoStock:   items.filter(i => i.stockActual > 0 && i.stockActual <= 3).length,
        disponibles: items.filter(i => i.activo && i.stockActual > 0).length,
      });
    }

    return res.status(400).json({ error: 'Acción no reconocida' });

  } catch (err) {
    console.error('wasapbot-inventario:', err);
    return res.status(500).json({ error: err.message });
  }
}
