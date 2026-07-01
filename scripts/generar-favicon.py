"""
Genera el favicon de BQinzagencIA desde el robot.
Ejecutar desde la raíz del proyecto:
    python scripts/generar-favicon.py

Requiere: pip install Pillow
"""
from PIL import Image
import os, sys

# Buscar la imagen del robot
candidates = [
    "public/robot-bqinz-v2-texto-nitido.png",
    "public/agenciame-robot-final.png",
]

src = None
for c in candidates:
    if os.path.exists(c):
        src = c
        break

if not src:
    print("❌ No se encontró la imagen del robot en public/")
    print("   Copia robot-bqinz-v2-texto-nitido.png a public/ y vuelve a ejecutar.")
    sys.exit(1)

print(f"✅ Usando: {src}")
img = Image.open(src).convert("RGBA")
w, h = img.size
print(f"   Tamaño original: {w}x{h}")

# Crop: cabeza del robot (tercio superior central)
left   = int(w * 0.25)
top    = 0
right  = int(w * 0.85)
bottom = int(h * 0.52)
head = img.crop((left, top, right, bottom))

# Cuadrado con padding transparente
sw = max(head.size)
sq = Image.new("RGBA", (sw, sw), (0, 0, 0, 0))
sq.paste(head, ((sw - head.width) // 2, (sw - head.height) // 2))

out = "public"

# favicon.ico (multi-tamaño: 16, 32, 48)
ico_imgs = [sq.resize((s, s), Image.LANCZOS) for s in [16, 32, 48]]
ico_imgs[0].save(f"{out}/favicon.ico", format="ICO",
    sizes=[(16,16),(32,32),(48,48)], append_images=ico_imgs[1:])
print("✅ public/favicon.ico")

# PNGs
for s in [16, 32, 192, 512]:
    sq.resize((s, s), Image.LANCZOS).save(f"{out}/favicon-{s}x{s}.png")
    print(f"✅ public/favicon-{s}x{s}.png")

# Apple touch icon
sq.resize((180, 180), Image.LANCZOS).save(f"{out}/apple-touch-icon.png")
print("✅ public/apple-touch-icon.png")

print("\n🎉 Todos los favicons generados en public/")
print("   Ahora corre: npx vercel --prod")
