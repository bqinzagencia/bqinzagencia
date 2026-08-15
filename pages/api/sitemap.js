// pages/api/sitemap.js → accesible en /api/sitemap
// PERO con rewrite en next.config.js apunta a /sitemap.xml

const BASE = 'https://www.bqinzagencia.com';

const RUTAS_ESTATICAS = [
  { url: '/',                  priority: '1.0', changefreq: 'weekly'  },
  { url: '/wasapbot',          priority: '0.9', changefreq: 'weekly'  },
  { url: '/wasapbot/activar',  priority: '0.9', changefreq: 'monthly' },
  { url: '/wasapbot/planes',   priority: '0.8', changefreq: 'monthly' },
  { url: '/wasapbot/login',    priority: '0.5', changefreq: 'yearly'  },
  { url: '/legal/condiciones', priority: '0.3', changefreq: 'yearly'  },
  { url: '/legal/privacidad',  priority: '0.3', changefreq: 'yearly'  },
  { url: '/legal/aviso-legal', priority: '0.3', changefreq: 'yearly'  },
  { url: '/legal/cookies',     priority: '0.3', changefreq: 'yearly'  },
];

const INDUSTRIAS = [
  'taller','peluqueria','inmobiliaria','restaurante','tienda','gimnasio',
  'salud','mascotas','arquitectura','papeleria','barbero','reposteria',
  'veterinaria','fotografia','acarreos','psicologo','contador','tecnico',
];

export default function handler(req, res) {
  const rutas = [
    ...RUTAS_ESTATICAS,
    ...INDUSTRIAS.map(slug => ({
      url: `/industrias/${slug}`,
      priority: '0.7',
      changefreq: 'monthly',
    })),
  ];

  const hoy = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas.map(r => `  <url>
    <loc>${BASE}${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <lastmod>${hoy}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.status(200).send(xml);
}
