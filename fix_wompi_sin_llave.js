// fix_wompi_sin_llave.js — Muestra error claro si Wompi no está configurado
const fs = require('fs');
const path = './pages/wasapbot/planes.js';
let c = fs.readFileSync(path, 'utf8');

// Agregar verificación de llave antes de redirigir a Wompi
c = c.replace(
  `      // Abrir widget de Wompi
      const pubKey = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || '';
      abrirWompi({ referencia: d.referencia, firma: d.firma, monto: d.montoEnCentavos, plan, email, pubKey });`,
  `      // Verificar que esté configurada la llave pública de Wompi
      const pubKey = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || '';
      if (!pubKey) {
        // Si no hay llave de Wompi, ofrecer pago manual por WhatsApp
        setError('');
        setLoading(false);
        const planNombre = plan.nombre;
        const precio = Number(plan.precio).toLocaleString('es-CO');
        const msg = encodeURIComponent(
          'Hola, quiero activar el plan ' + planNombre + ' de WasapBot ($' + precio + '/mes).\\n' +
          'Mi empresa: ' + (nombre || 'Sin nombre') + '\\n' +
          'Mi correo: ' + email + '\\n' +
          'ID empresa: ' + empresaId
        );
        window.open('https://wa.me/573105056616?text=' + msg, '_blank');
        return;
      }
      abrirWompi({ referencia: d.referencia, firma: d.firma, monto: d.montoEnCentavos, plan, email, pubKey });`
);

fs.writeFileSync(path, c, 'utf8');
console.log('✓ planes.js — si no hay llave Wompi, redirige a WhatsApp para pago manual');
console.log('\nEjecuta:');
console.log('del fix_wompi_sin_llave.js && git add . && git commit -m "fix: planes redirige a WA si Wompi no configurado" && vercel --prod');
