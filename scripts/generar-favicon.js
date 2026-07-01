// scripts/generar-favicon.js
const fs   = require('fs');
const path = require('path');

async function main() {
  let sharp;
  try { sharp = require('sharp'); }
  catch {
    console.log('Instalando sharp...');
    require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
    sharp = require('sharp');
  }

  const candidates = [
    'public/logo__2_.png',
    'public/robot-bqinz-v2-texto-nitido.png',
    'public/agenciame-robot-final.png',
  ];

  const src = candidates.find(c => fs.existsSync(c));
  if (!src) {
    console.error('❌ No se encontró ninguna imagen en public/');
    console.error('   Copia logo__2_.png a public/ y vuelve a ejecutar.');
    process.exit(1);
  }
  console.log(`✅ Usando: ${src}`);

  const meta = await sharp(src).metadata();
  const { width: w, height: h } = meta;
  console.log(`   Tamaño: ${w}x${h}`);

  // Logo cuadrado — usar directamente con pequeño margen
  const m  = Math.floor(w * 0.02);
  const sq = await sharp(src)
    .extract({ left: m, top: m, width: w - m*2, height: h - m*2 })
    .resize(512, 512)
    .png()
    .toBuffer();

  const out = 'public';

  // PNGs
  for (const s of [16, 32, 48, 64, 192, 512]) {
    const name = `favicon-${s}x${s}.png`;
    await sharp(sq).resize(s, s).png().toFile(path.join(out, name));
    console.log(`✅ public/${name}`);
  }

  // Apple touch icon 180x180
  await sharp(sq).resize(180, 180).png().toFile(path.join(out, 'apple-touch-icon.png'));
  console.log('✅ public/apple-touch-icon.png');

  // favicon.ico (32x32 embebido en ICO)
  const ico32 = await sharp(sq).resize(32, 32).png().toBuffer();
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  const icoDir = Buffer.alloc(16);
  icoDir.writeUInt8(32, 0);
  icoDir.writeUInt8(32, 1);
  icoDir.writeUInt8(0, 2);
  icoDir.writeUInt8(0, 3);
  icoDir.writeUInt16LE(1, 4);
  icoDir.writeUInt16LE(32, 6);
  icoDir.writeUInt32LE(ico32.length, 8);
  icoDir.writeUInt32LE(22, 12);
  fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.concat([icoHeader, icoDir, ico32]));
  console.log('✅ public/favicon.ico');

  console.log('\n🎉 Listo. Ahora corre: npx vercel --prod');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
