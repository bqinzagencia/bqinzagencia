// Cliente del backend MultiMarket (Railway). Usa la sesión de Firebase ya iniciada en bqinzagencia.
import { getAuth } from 'firebase/auth';

const API = process.env.NEXT_PUBLIC_MULTIMARKET_API_URL;

async function call(path, { method = 'GET', body } = {}) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Inicia sesión para continuar.');
  const token = await user.getIdToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Error en la solicitud.'), { status: res.status, code: data.error });
  return data;
}

export const getAccount = () => call('/api/account/me');
export const startCheckout = (plan) => call('/api/stripe/checkout', { method: 'POST', body: { plan } });
export const openPortal = () => call('/api/stripe/portal', { method: 'POST' });
export const optimizeListing = (product) => call('/api/ai/optimize-listing', { method: 'POST', body: product });
export const markAsSold = (productId, sourcePlatform, eventId) =>
  call('/api/webhooks/mark-as-sold', { method: 'POST', body: { product_id: productId, source_platform: sourcePlatform, event_id: eventId } });
// Administración (solo admins de la agencia)
export const adminListLicenses = () => call('/api/admin/licenses');
export const adminActivate = (target, plan, months) =>
  call('/api/admin/licenses/activate', { method: 'POST', body: { ...target, plan, months } });
export const adminDeactivate = (target) => call('/api/admin/licenses/deactivate', { method: 'POST', body: target });
