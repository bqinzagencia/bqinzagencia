// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#080B0F" />
        <meta name="description" content="NEXOIA — Automatización empresarial con Inteligencia Artificial. Agentes IA, chat multicanal, CRM y más para tu negocio en Colombia." />
        <meta property="og:title" content="NEXOIA — Tu negocio en piloto automático con IA" />
        <meta property="og:description" content="Automatiza ventas, atención al cliente y operaciones con agentes de IA para talleres, restaurantes, inmobiliarias y más." />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
