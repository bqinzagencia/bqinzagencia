// pages/legal/terminos.js
// Redirección permanente: el contenido se trasladó a /legal/condiciones
export default function Terminos() { return null; }

export async function getServerSideProps() {
  return { redirect: { destination: '/legal/condiciones', permanent: true } };
}
