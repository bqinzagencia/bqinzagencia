// pages/api/admin/openai-usage.js
// Devuelve el consumo/coste de OpenAI a nivel de organización para el panel de métricas.
//
// Requiere una API KEY DE ADMINISTRADOR (distinta de OPENAI_API_KEY), que se crea en:
// https://platform.openai.com/settings/organization/admin-keys
// y se guarda como OPENAI_ADMIN_KEY en las variables de entorno (.env.local / Vercel).
//
// Sin esa variable, el endpoint responde { configured: false } y el panel
// muestra un aviso explicando cómo activarlo, sin romper la página.

export default async function handler(req, res) {
  const ADMIN_KEY = process.env.OPENAI_ADMIN_KEY;

  if (!ADMIN_KEY) {
    return res.status(200).json({
      configured: false,
      mensaje: 'Falta OPENAI_ADMIN_KEY en las variables de entorno. Crea una clave de administrador en platform.openai.com/settings/organization/admin-keys',
    });
  }

  try {
    const days = 30;
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - days * 86400;

    const headers = {
      'Authorization': `Bearer ${ADMIN_KEY}`,
      'Content-Type': 'application/json',
    };

    // ── Costes de los últimos 30 días ────────────────────────────────────
    const costsRes = await fetch(
      `https://api.openai.com/v1/organization/costs?start_time=${startTime}&bucket_width=1d&limit=${days + 1}`,
      { headers }
    );

    if (!costsRes.ok) {
      const errBody = await costsRes.text();
      return res.status(200).json({
        configured: true,
        error: `OpenAI respondió ${costsRes.status}`,
        detalle: errBody.slice(0, 500),
      });
    }

    const costsData = await costsRes.json();
    let totalCostUsd = 0;
    let currency = 'usd';
    const dailyCosts = (costsData.data || []).map(bucket => {
      const diaTotal = (bucket.results || []).reduce((acc, r) => {
        if (r.amount?.currency) currency = r.amount.currency;
        return acc + (r.amount?.value || 0);
      }, 0);
      totalCostUsd += diaTotal;
      return { fecha: bucket.start_time, costo: diaTotal };
    });

    // ── Tokens consumidos (completions) de los últimos 30 días ───────────
    let totalTokens = 0;
    try {
      const usageRes = await fetch(
        `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&bucket_width=1d&limit=${days + 1}`,
        { headers }
      );
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        for (const bucket of usageData.data || []) {
          for (const r of bucket.results || []) {
            totalTokens += (r.input_tokens || 0) + (r.output_tokens || 0);
          }
        }
      }
    } catch {}

    return res.status(200).json({
      configured: true,
      moneda: currency,
      costeTotal30d: totalCostUsd,
      tokensTotal30d: totalTokens,
      dailyCosts,
    });
  } catch (e) {
    return res.status(200).json({ configured: true, error: e.message });
  }
}
