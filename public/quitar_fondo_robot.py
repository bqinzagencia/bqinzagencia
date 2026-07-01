"""
Quita el fondo blanco de agenciame-robot-final.png
y guarda una version transparente.

Instrucciones:
  1. Coloca este script en C:\proyectos\bqinzagencia\bqinzagencia\public\
  2. Ejecuta: python quitar_fondo_robot.py
  3. Se genera: agenciame-robot-transparente.png
  4. Renombralo a agenciame-robot-final.png (o actualiza index.js)
"""

from PIL import Image
import numpy as np
import os

INPUT  = "agenciame-robot-final.png"
OUTPUT = "agenciame-robot-transparente.png"

img = Image.open(INPUT).convert("RGBA")
data = np.array(img, dtype=np.float32)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Umbral: considera "blanco" cualquier pixel muy claro
# Ajusta THRESHOLD si queda cortado (sube) o si quedan bordes blancos (baja)
THRESHOLD = 240

mask_blanco = (r >= THRESHOLD) & (g >= THRESHOLD) & (b >= THRESHOLD)

# Suavizar los bordes: calcular que tan "blanco" es (0=opaco, 1=transparente)
blancura = np.minimum(np.minimum(r, g), b)
alpha_nuevo = np.where(mask_blanco, np.clip((255 - blancura) * 3, 0, 255), a)

data[:,:,3] = alpha_nuevo
resultado = Image.fromarray(data.astype(np.uint8), "RGBA")
resultado.save(OUTPUT, "PNG")

print(f"✅ Guardado: {OUTPUT}")
print(f"   Tamaño: {img.size[0]}x{img.size[1]}px")
print(f"   Pixels transparentes: {int((alpha_nuevo < 10).sum()):,}")
print()
print("Siguiente paso:")
print(f"  Renombra '{OUTPUT}' a '{INPUT}' para reemplazar el original")
print("  O actualiza index.js para apuntar al nuevo archivo")
