const fs = require('fs');
fs.copyFileSync('whatsapp-baileys.js', 'whatsapp-baileys.backup.js');
const codigo = fs.readFileSync('whatsapp-baileys.js', 'utf8');
const nuevo = codigo
  .replace('const historiales = new Map();', 'const historiales = new Map();\nconst msgsProcesados = new Set();')
  .replace(
    'const { empresaId, numeroCliente, texto, msgId } = req.body;',
    `const { empresaId, numeroCliente, texto, msgId } = req.body;
  if (msgId && msgsProcesados.has(msgId)) return res.json({ respuesta: null });
  if (msgId) { msgsProcesados.add(msgId); if (msgsProcesados.size > 1000) { const first = msgsProcesados.values().next().value; msgsProcesados.delete(first); } }`
  );
fs.writeFileSync('whatsapp-baileys.js', nuevo);
console.log('Hecho');