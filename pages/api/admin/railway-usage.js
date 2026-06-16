// pages/api/admin/railway-usage.js
// Devuelve el consumo/coste estimado del proyecto en Railway (servidor de WhatsApp)
// para el panel de métricas.
//
// Requiere dos variables de entorno:
//   RAILWAY_API_TOKEN  -> Railway → Project Settings → Tokens → "Create Token"
//   RAILWAY_PROJECT_ID -> Railway → Project Settings → General → "Project ID"
//
// Sin esas variables, el endpoint responde { configured: false } y el panel
// muestra un aviso explicando cómo activarlo, sin romper la página.

const RAILWAY_API = 'https://backboard.railway.com/graphql/v2';

export default async function handler(req, res) {
  const TOKEN      = process.env.RAILWAY_API_TOKEN;
  const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;

  if (!TOKEN || !PROJECT_ID) {
    return res.status(200).json({
      configured: false,
      mensaje: 'Faltan RAILWAY_API_TOKEN y/o RAILWAY_PROJECT_ID en las variables de entorno. Genera un Project Token desde Railway → Settings → Tokens.',
    });
  }

  // Periodo: mes en curso
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const query = `
    query EstimatedUsage($projectId: String!, $startDate: DateTime!, $endDate: DateTime!) {
      estimatedUsage(projectId: $projectId, startDate: $startDate, endDate: $endDate) {
        measurement
        value
      }
    }
  `;

  try {
    const resp = await fetch(RAILWAY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // El token de proyecto usa esta cabecera (no Authorization: Bearer)
        'Project-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: {
          projectId: PROJECT_ID,
          startDate: inicioMes.toISOString(),
          endDate: now.toISOString(),
        },
      }),
    });

    const json = await resp.json();

    if (json.errors) {
      return res.status(200).json({
        configured: true,
        error: json.errors[0]?.message || 'Error de la API de Railway',
        raw: json.errors,
      });
    }

    const usage = json.data?.estimatedUsage || [];
    return res.status(200).json({
      configured: true,
      periodo: { desde: inicioMes.toISOString(), hasta: now.toISOString() },
      usage, // [{ measurement: 'CPU_USAGE', value: ... }, ...]
    });
  } catch (e) {
    return res.status(200).json({ configured: true, error: e.message });
  }
}
