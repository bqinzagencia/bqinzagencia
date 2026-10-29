import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAccount, startCheckout, openPortal } from '../../lib/multimarketApi';

const PLANS = [
  { id: 'starter', name: 'Starter', price: '9,99', features: ['Publicación multicanal', '100 optimizaciones de IA al mes', 'Sincronización anti-stock fantasma'] },
  { id: 'pro', name: 'Pro', price: '19,99', features: ['Todo lo de Starter', '500 optimizaciones de IA al mes', 'Soporte prioritario'] },
];

export default function Planes() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    return onAuthStateChanged(getAuth(), (user) => {
      if (!user) return setError('Inicia sesión para ver tus planes.');
      getAccount().then(setAccount).catch((e) => setError(e.message));
    });
  }, []);

  const go = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      const { url } = await fn();
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusy('');
    }
  };

  const lic = account?.license;
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">MultiMarket Sync · Planes</h1>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      {lic && (
        <p className="mt-4 text-sm text-gray-600">
          Estado: {lic.active ? `activo (${lic.plan})` : 'sin plan activo'}
          {lic.source === 'agency' && ' · concedido por la agencia'}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <section key={p.id} className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-3xl font-bold">{p.price} €<span className="text-sm font-normal"> /mes</span></p>
            <ul className="mt-3 space-y-1 text-sm">{p.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <button
              className="mt-4 w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={!account || lic?.active || busy !== ''}
              onClick={() => go(p.id, () => startCheckout(p.id))}
            >
              {busy === p.id ? 'Redirigiendo…' : lic?.active ? 'Ya tienes un plan' : 'Contratar'}
            </button>
          </section>
        ))}
      </div>
      {account?.stripe_status !== 'none' && (
        <button className="mt-6 underline" disabled={busy !== ''} onClick={() => go('portal', openPortal)}>
          Gestionar facturación y suscripción
        </button>
      )}
    </main>
  );
}
