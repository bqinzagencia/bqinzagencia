// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        {/* Zoom habilitado para accesibilidad */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <meta name="theme-color" content="#FF6B00" />
        <style dangerouslySetInnerHTML={{__html: `
          html, body {
            background: #0A0F1E;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            overflow-x: hidden;
          }
          * { box-sizing: border-box; }

          /* ── Dashboard móvil ──────────────────────────── */
          @media (max-width: 768px) {

            /* Sidebar oculto por defecto — se abre con drawer */
            .db-sidebar {
              transform: translateX(-100%) !important;
              position: fixed !important;
              z-index: 1000 !important;
              height: 100vh !important;
              top: 0 !important;
            }
            .db-sidebar.open {
              transform: translateX(0) !important;
            }

            /* Main content ocupa todo el ancho */
            .db-main {
              margin-left: 0 !important;
              width: 100% !important;
              padding: 16px !important;
            }

            /* Topbar en móvil */
            .db-topbar {
              padding: 0 16px !important;
              height: 56px !important;
            }

            /* Avatar sidebar — visible y bien posicionado */
            .db-avatar-wrap {
              padding: 16px 16px 12px !important;
            }
            .db-avatar-img {
              width: 48px !important;
              height: 48px !important;
            }
            .db-avatar-name {
              font-size: 13px !important;
            }
            .db-avatar-role {
              font-size: 11px !important;
            }

            /* Grids de 2 columnas → 1 columna */
            .db-grid-2 { grid-template-columns: 1fr !important; }
            .db-grid-3 { grid-template-columns: 1fr !important; }
            .db-grid-4 { grid-template-columns: 1fr 1fr !important; }

            /* Botones flotantes — separados para no pisarse */
            .tfb-wrap { bottom: 20px !important; right: 20px !important; }
            .sp-btn   { bottom: 20px !important; left: 20px !important; padding: 10px 16px !important; font-size: 12px !important; }

            /* Ocultar columnas secundarias en tablas */
            .db-table-hide { display: none !important; }

            /* Hero dashboard */
            .db-hero-wrap { height: 160px !important; border-radius: 12px !important; }
            .db-hero-inner { padding: 0 16px !important; flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
            .db-hero-title { font-size: 17px !important; }
            .db-hero-btn   { width: 100% !important; text-align: center !important; justify-content: center !important; margin-left: 0 !important; }

            /* Conversaciones — lista full width en móvil */
            .conv-split { flex-direction: column !important; height: auto !important; }
            .conv-lista  { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; max-height: 40vh !important; }
          }

          @media (max-width: 420px) {
            .db-grid-4 { grid-template-columns: 1fr !important; }
            .db-main   { padding: 12px !important; }
          }
        `}} />
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-54NPKF2D5N" />
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-54NPKF2D5N');
        `}} />
        <meta name="description" content="BQinzagencIA — Automatización empresarial con Inteligencia Artificial." />
        <meta property="og:title" content="BQinzagencIA — Tu negocio en piloto automático con IA" />
        <meta property="og:description" content="Automatiza ventas, atención al cliente y operaciones con agentes de IA." />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
