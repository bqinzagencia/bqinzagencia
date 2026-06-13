const fs = require('fs');
let c = fs.readFileSync('pages/index.js', 'utf8');

// Quitar boton "Simular llamada en vivo"
c = c.replace(/\s*<button[^>]*>[^<]*Simular llamada en vivo[^<]*<\/button>/g, '');

// Quitar bloque entero de "Pruébalo ahora" / demo llamada
c = c.replace(/\{\/\*[^*]*DEMO[^*]*\*\/\}/g, '');

// Quitar textos de demo
c = c.replace(/Llamar al demo ahora/g, '');
c = c.replace(/Demo por WhatsApp/g, '');
c = c.replace(/Simula una llamada en vivo/g, '');
c = c.replace(/PRUÉBALO AHORA/g, '');
c = c.replace(/Sin tarjeta · Activo en 24h/g, '');

fs.writeFileSync('pages/index.js', c);
console.log('Hecho');