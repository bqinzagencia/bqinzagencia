// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        {/* ── FAVICON circular con borde naranja ── ruta: /public/logo.png ── */}
        <link rel="icon"             type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon"             type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon"                               href="/logo.png" />
        <meta name="msapplication-TileImage"                    content="/logo.png" />
        <meta name="theme-color" content="#FF6B00" />
        <meta name="description" content="Cero citas perdidas. Sin tocar el teléfono. Nuestro agente de IA atiende cada llamada y mensaje de WhatsApp mientras tú tienes las manos en el tratamiento. Agenda, confirma, cobra señales y sincroniza todo con tu calendario automáticamente." />
        <meta property="og:title" content="BQinzagencIA — Cero citas perdidas para tu centro de estética" />
        <meta property="og:description" content="Agente de IA que atiende llamadas y WhatsApp 24/7. Agenda, confirma y cobra señales mientras tú trabajas." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
