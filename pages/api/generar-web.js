// pages/api/generar-web.js
// Generador de página web con IA usando OpenAI

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { negocio, tipo, ciudad, servicios, telefono, email, color } = req.body;
  if (!negocio || !tipo) return res.status(400).json({ error: 'Faltan datos del negocio' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'API no configurada' });

  const colorPrincipal = color || '#FF6B00';

  const prompt = `Genera una página web HTML completa, moderna y profesional para el siguiente negocio:

NEGOCIO: "${negocio}"
TIPO: ${tipo}
CIUDAD: ${ciudad || 'España'}
SERVICIOS: ${servicios || 'Los servicios principales del negocio'}
TELÉFONO: ${telefono || '+34 600 000 000'}
EMAIL: ${email || 'info@' + negocio.toLowerCase().replace(/\s/g, '') + '.com'}
COLOR PRINCIPAL: ${colorPrincipal}

REQUISITOS TÉCNICOS OBLIGATORIOS:
1. HTML completo con <!DOCTYPE html>, <html>, <head> y <body>
2. Todo el CSS inline dentro de <style> en el <head> — NO uses frameworks externos
3. Fuentes de Google Fonts (Inter y Syne) via @import en el style
4. Diseño oscuro y moderno: fondo #080B0F o #111318, texto blanco
5. El color principal "${colorPrincipal}" se usa en botones, acentos, highlights
6. Diseño responsive con media queries para móvil
7. JavaScript vanilla inline para interacciones básicas

SECCIONES OBLIGATORIAS EN ESTE ORDEN:
1. NAV fijo: Logo (nombre negocio), links (Servicios, Nosotros, Contacto), botón CTA "Reservar cita"
2. HERO full-height: Título impactante del negocio, subtítulo, 2 botones CTA, imagen de fondo Unsplash del sector (URL directa)
3. STATS: 3-4 números clave (p.ej. "10+ años de experiencia", "500+ clientes", etc.)
4. SERVICIOS: grid de 3-4 cards con icono SVG inline, título y descripción de cada servicio
5. SOBRE NOSOTROS: texto + imagen
6. TESTIMONIOS: 3 cards con texto, nombre, estrellas
7. CONTACTO: formulario (nombre, email, teléfono, mensaje) + datos de contacto + mapa placeholder
8. FOOTER: Logo, links, copyright

IMPORTANTE:
- Escribe SOLO el código HTML, sin explicaciones, sin markdown, sin bloques de código
- El HTML debe empezar con <!DOCTYPE html> directamente
- Haz los textos reales y específicos para "${negocio}" (no placeholders genéricos)
- El formulario debe tener un handler JS que muestre un mensaje de éxito al enviar
- Los iconos deben ser SVG inline, no uses font-awesome ni iconos externos`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto desarrollador web que genera código HTML/CSS/JS completo y funcional. Generas SOLO código HTML puro, sin explicaciones, sin markdown, sin bloques de código. El HTML empieza directamente con <!DOCTYPE html>.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Error de OpenAI' });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';

    // Limpiar markdown si OpenAI lo añade
    html = html.replace(/^```html\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();

    if (!html.includes('<!DOCTYPE')) {
      return res.status(500).json({ error: 'La IA no generó HTML válido. Inténtalo de nuevo.' });
    }

    return res.status(200).json({ html });
  } catch (e) {
    console.error('[generar-web API]', e.message);
    return res.status(500).json({ error: 'Error interno: ' + e.message });
  }
}
