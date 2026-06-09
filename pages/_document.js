// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0F1623" />
        <meta name="description" content="agencIAme — Automatización empresarial con Inteligencia Artificial. Agentes IA, chat multicanal, CRM y más para tu negocio en Colombia." />
        <meta property="og:title" content="agencIAme — Tu negocio en piloto automático con IA" />
        <meta property="og:description" content="Automatiza ventas, atención al cliente y operaciones con agentes de IA para talleres, restaurantes, inmobiliarias y más." />
        <meta property="og:type" content="website" />
        {/*
          next/font/google inyecta los @font-face automáticamente de forma óptima.
          NO agregar @import de Google Fonts aquí — genera duplicados y FOUT.
          Las fuentes de la landing (Abril Fatface, Fraunces, Plus Jakarta Sans)
          sí se cargan en globals.css porque son solo para la landing, no toda la app.
        */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
