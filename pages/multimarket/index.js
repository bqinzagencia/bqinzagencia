import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getAccount, listProducts, createProduct, updateProduct, deleteProduct,
  registerListing, markRemoved, markAsSold, optimizeListing, adminActivate, photosToListing,
} from '../../lib/multimarketApi';

const PLATFORMS = [
  { id: 'wallapop', name: 'Wallapop' },
  { id: 'vinted', name: 'Vinted' },
  { id: 'milanuncios', name: 'Milanuncios' },
];
const label = (id) => PLATFORMS.find((p) => p.id === id)?.name ?? id;
const CONDITIONS = { new: 'Nuevo', like_new: 'Como nuevo', good: 'Buen estado', fair: 'Aceptable', poor: 'Con desperfectos' };
const STATUS = { published: ['Publicado', '#16a34a'], sold: ['Vendido', '#2563eb'], deleted: ['Retirado', '#6b7280'] };

const line = '1px solid rgba(128,128,128,.35)';
const s = {
  main: { maxWidth: 980, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' },
  row: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  card: { border: line, borderRadius: 12, padding: 16, marginTop: 16 },
  input: { padding: '8px 10px', borderRadius: 8, border: line, background: 'rgba(255,255,255,.06)', color: 'inherit', font: 'inherit' },
  btn: { padding: '7px 12px', border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  ghost: { padding: '7px 12px', borderRadius: 8, border: line, background: 'none', color: 'inherit', cursor: 'pointer', fontSize: 13 },
  tab: (on) => ({ padding: '8px 14px', borderRadius: 999, border: line, background: on ? '#2563eb' : 'none', color: on ? '#fff' : 'inherit', cursor: 'pointer', fontSize: 14 }),
  chip: (c) => ({ background: c, color: '#fff', borderRadius: 999, padding: '2px 10px', fontSize: 12 }),
  error: { background: 'rgba(220,38,38,.15)', color: '#f87171', padding: 12, borderRadius: 8, marginTop: 16 },
  info: { background: 'rgba(22,163,74,.15)', color: '#4ade80', padding: 12, borderRadius: 8, marginTop: 16 },
  muted: { opacity: 0.7, fontSize: 13 },
};

function AdminBox({ account, onDone }) {
  const [email, setEmail] = useState(account.email || '');
  const [plan, setPlan] = useState('starter');
  const [months, setMonths] = useState('1');
  const [msg, setMsg] = useState('');
  const go = async () => {
    setMsg('Activando…');
    try {
      const r = await adminActivate({ email: email.trim() }, plan, months ? parseInt(months, 10) : undefined);
      setMsg(`Licencia activada para ${r.email || r.uid}: plan ${r.license.plan}.`);
      onDone();
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <section style={s.card}>
      <strong>Administración · activar licencia</strong>
      <div style={{ ...s.row, marginTop: 10 }}>
        <input style={s.input} placeholder="email del usuario" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select style={s.input} value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
        <input style={{ ...s.input, width: 80 }} placeholder="meses" value={months} onChange={(e) => setMonths(e.target.value)} />
        <button style={s.btn} onClick={go}>Activar</button>
      </div>
      {msg && <p style={s.muted}>{msg}</p>}
    </section>
  );
}

// Reduce la foto a 1024 px y JPEG para que suba rápido
async function fileToJpeg(file, max = 1024, quality = 0.72) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

function PhotoCreate({ disabled, onResult }) {
  const [shots, setShots] = useState([]);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - shots.length);
    e.target.value = '';
    setErr('');
    try {
      const urls = await Promise.all(files.map((f) => fileToJpeg(f)));
      setShots((prev) => [...prev, ...urls].slice(0, 4));
    } catch {
      setErr('No se pudo leer alguna imagen. Prueba con JPG o PNG.');
    }
  };

  const analyze = async () => {
    setBusy(true);
    setErr('');
    try {
      const r = await photosToListing(shots, hint.trim() || undefined);
      const priceNote = r.suggested_price != null ? 'El precio es orientativo: ajústalo.' : 'La IA no se atreve con el precio: ponlo tú.';
      onResult({
        fields: {
          title: r.optimized_title,
          price: r.suggested_price != null ? String(r.suggested_price) : '',
          condition: r.condition,
          category: r.category,
          description_original: r.optimized_description,
          stock: '1',
        },
        ai: { optimized_title: r.optimized_title, optimized_description: r.optimized_description, recommended_tags: r.recommended_tags },
        note: `Generado desde tus fotos (confianza ${r.confidence}). ${priceNote}${r.notes ? ` ${r.notes}` : ''}`,
      });
      setShots([]);
      setHint('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={s.card}>
      <strong>Crear desde fotos</strong>
      <p style={s.muted}>Sube de 1 a 4 fotos del artículo: la IA propone título, descripción, categoría, estado y precio. Tú revisas y guardas.</p>
      <div style={s.row}>
        <label style={{ ...s.btn, display: 'inline-block', opacity: disabled || shots.length >= 4 ? 0.5 : 1 }}>
          Elegir fotos
          <input type="file" accept="image/*" multiple hidden disabled={disabled || shots.length >= 4} onChange={pick} />
        </label>
        {shots.map((u, i) => (
          <span key={i} style={{ position: 'relative' }}>
            <img src={u} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
            <button style={{ position: 'absolute', top: -6, right: -6, ...s.ghost, padding: '0 6px', background: '#000' }} onClick={() => setShots(shots.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
      <div style={{ ...s.row, marginTop: 10 }}>
        <input style={{ ...s.input, flex: 1, minWidth: 220 }} placeholder="Nota opcional: marca, modelo, estado, precio que quieres..." value={hint} onChange={(e) => setHint(e.target.value)} />
        <button style={{ ...s.btn, opacity: disabled || !shots.length || busy ? 0.5 : 1 }} disabled={disabled || !shots.length || busy} onClick={analyze}>
          {busy ? 'Analizando…' : 'Analizar con IA'}
        </button>
      </div>
      {disabled && <p style={s.muted}>Necesitas un plan activo para usar la IA.</p>}
      {err && <p style={s.error}>{err}</p>}
    </section>
  );
}

function NewProduct({ disabled, onCreate, prefill }) {
  const empty = { title: '', price: '', condition: 'good', category: '', description_original: '', stock: '1' };
  const [f, setF] = useState(empty);
  const [aiBlock, setAiBlock] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => {
    if (!prefill) return;
    setF({ ...empty, ...prefill.fields });
    setAiBlock(prefill.ai || null);
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps
  const price = Number(String(f.price).replace(',', '.'));
  const valid = f.title.trim() && f.category.trim() && f.price !== '' && !Number.isNaN(price) && price >= 0;
  const submit = async (optimize) => {
    const ok = await onCreate(
      { title: f.title.trim(), price, condition: f.condition, category: f.category.trim(), description_original: f.description_original.trim(), stock: Math.max(0, parseInt(f.stock, 10) || 1) },
      optimize,
      optimize ? null : aiBlock
    );
    if (ok) {
      setF(empty);
      setAiBlock(null);
    }
  };
  return (
    <section id="nuevo-producto" style={s.card}>
      <strong>Nuevo producto</strong>
      {prefill?.note && <p style={s.muted}>{prefill.note}</p>}
      <div style={{ ...s.row, marginTop: 10 }}>
        <input style={{ ...s.input, flex: 2, minWidth: 200 }} placeholder="Título (ej. iPhone 12 128GB)" value={f.title} onChange={set('title')} />
        <input style={{ ...s.input, width: 90 }} placeholder="Precio €" value={f.price} onChange={set('price')} />
        <input style={{ ...s.input, width: 70 }} placeholder="Stock" value={f.stock} onChange={set('stock')} />
        <select style={s.input} value={f.condition} onChange={set('condition')}>
          {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input style={{ ...s.input, width: 150 }} placeholder="Categoría" value={f.category} onChange={set('category')} />
      </div>
      <textarea style={{ ...s.input, width: '100%', marginTop: 10, minHeight: 70, boxSizing: 'border-box' }} placeholder="Descripción (opcional, la IA la mejora)" value={f.description_original} onChange={set('description_original')} />
      <div style={{ ...s.row, marginTop: 10 }}>
        <button style={{ ...s.btn, opacity: disabled || !valid ? 0.5 : 1 }} disabled={disabled || !valid} onClick={() => submit(!aiBlock)}>{aiBlock ? 'Guardar producto' : 'Guardar y optimizar con IA'}</button>
        {!aiBlock && <button style={{ ...s.ghost, opacity: disabled || !valid ? 0.5 : 1 }} disabled={disabled || !valid} onClick={() => submit(false)}>Solo guardar</button>}
        {disabled && <span style={s.muted}>Necesitas un plan activo para crear productos.</span>}
      </div>
    </section>
  );
}

function ProductCard({ p, run, hasLicense }) {
  const ai = p.ai;
  const optimize = () =>
    run(`opt-${p.id}`, async () => {
      const r = await optimizeListing({ title: p.title, price: p.price, condition: p.condition, category: p.category, raw_description: p.description_original });
      await updateProduct(p.id, { ai: { optimized_title: r.optimized_title, optimized_description: r.optimized_description, recommended_tags: r.recommended_tags } });
      return 'Anuncio optimizado con IA.';
    });
  const copy = async () => {
    await navigator.clipboard.writeText(`${ai.optimized_title}\n\n${ai.optimized_description}`);
    alert('Título y descripción copiados. Pégalos al publicar en la app.');
  };
  const sendExt = () => {
    const payload = {
      id: p.id,
      title: ai?.optimized_title || p.title,
      description: ai?.optimized_description || p.description_original || '',
      price: p.price,
      condition: p.condition,
      category: p.category,
      tags: ai?.recommended_tags || [],
    };
    let done = false;
    const onMsg = (e) => {
      if (e.source === window && e.data?.source === 'multimarket-ext' && e.data.type === 'MM_SAVED') {
        done = true;
        window.removeEventListener('message', onMsg);
        alert('Enviado a la extensión. Abre Wallapop, Vinted o Milanuncios y pulsa "Rellenar formulario".');
      }
    };
    window.addEventListener('message', onMsg);
    window.postMessage({ source: 'multimarket-panel', type: 'MM_SEND_PRODUCT', payload }, window.location.origin);
    setTimeout(() => {
      if (!done) {
        window.removeEventListener('message', onMsg);
        alert('No detecto la extensión MultiMarket. Instálala en Chrome (chrome://extensions > Cargar descomprimida) y recarga esta página.');
      }
    }, 1200);
  };
  const register = (pl) => {
    const url = window.prompt(`Pega la URL de tu anuncio en ${label(pl)} (puedes dejarla vacía):`);
    if (url === null) return;
    run(`reg-${p.id}-${pl}`, async () => {
      await registerListing(p.id, { platform: pl, url: url.trim() || undefined });
      return `Anuncio registrado en ${label(pl)}.`;
    });
  };
  const sold = (pl) => {
    if (!window.confirm(`¿Marcar "${p.title}" como vendido en ${label(pl)}?`)) return;
    run(`sold-${p.id}`, async () => {
      const r = await markAsSold(p.id, pl, `ui-${p.id}-${Date.now()}`);
      if (r.status === 'partial') return `Venta registrada. Quedan ${r.stock_remaining} unidades; los anuncios siguen activos.`;
      return r.jobs_created.length
        ? `Vendido. Retira ahora el anuncio en: ${r.jobs_created.map(label).join(', ')}.`
        : 'Vendido. No hay más anuncios que retirar.';
    });
  };
  const removed = (pl) => run(`rem-${p.id}-${pl}`, async () => { await markRemoved(p.id, pl); return `Retirado en ${label(pl)}.`; });
  const del = () => {
    if (window.confirm(`¿Eliminar "${p.title}" y sus anuncios registrados?`)) run(`del-${p.id}`, async () => { await deleteProduct(p.id); return 'Producto eliminado.'; });
  };

  return (
    <section style={s.card}>
      <div style={{ ...s.row, justifyContent: 'space-between' }}>
        <div>
          <strong>{ai?.optimized_title || p.title}</strong>
          <div style={s.muted}>{p.price} € · {CONDITIONS[p.condition]} · stock {p.stock} · {p.category}{p.status === 'sold' ? ' · VENDIDO' : ''}</div>
        </div>
        <div style={s.row}>
          <button style={s.ghost} disabled={!hasLicense} onClick={optimize}>{ai ? 'Re-optimizar IA' : 'Optimizar con IA'}</button>
          {ai && <button style={s.ghost} onClick={copy}>Copiar anuncio</button>}
          <button style={s.ghost} onClick={sendExt}>Enviar a extensión</button>
          <button style={s.ghost} onClick={del}>Eliminar</button>
        </div>
      </div>
      {ai && <p style={{ ...s.muted, whiteSpace: 'pre-wrap' }}>{ai.optimized_description}</p>}
      <div style={{ marginTop: 8 }}>
        {PLATFORMS.map((pl) => {
          const l = p.listings[pl.id];
          const pending = p.pending_removal.includes(pl.id);
          const [text, color] = STATUS[l?.status] || ['Sin publicar', '#6b7280'];
          return (
            <div key={pl.id} style={{ ...s.row, borderTop: line, padding: '8px 0' }}>
              <span style={{ width: 110 }}>{pl.name}</span>
              <span style={s.chip(pending ? '#d97706' : color)}>{pending ? 'Retirar ahora' : text}</span>
              {l?.url && <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Abrir anuncio</a>}
              <span style={{ flex: 1 }} />
              {pending ? (
                <button style={s.btn} onClick={() => removed(pl.id)}>Ya lo retiré</button>
              ) : l?.status === 'published' ? (
                <button style={s.ghost} onClick={() => sold(pl.id)}>Vendido aquí</button>
              ) : p.status !== 'sold' ? (
                <button style={s.ghost} onClick={() => register(pl.id)}>Registrar publicado</button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function MultiMarketPanel() {
  const [account, setAccount] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const reload = useCallback(async () => {
    const [a, p] = await Promise.all([getAccount(), listProducts()]);
    setAccount(a);
    setProducts(p.products);
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
          setLoading(false);
          setLoggedOut(true);
          return setError('Inicia sesión para ver tu panel.');
        }
        setError('');
        setLoggedOut(false);
        reload().catch((e) => setError(e.message)).finally(() => setLoading(false));
      }),
    [reload]
  );

  const run = async (_key, fn) => {
    setError('');
    setInfo('');
    try {
      const msg = await fn();
      await reload();
      if (typeof msg === 'string') setInfo(msg);
    } catch (e) {
      setError(e.message);
    }
  };

  const onCreate = async (data, optimize, aiBlock) => {
    setError('');
    setInfo('');
    let id;
    try {
      ({ id } = await createProduct(aiBlock ? { ...data, ai: aiBlock } : data));
    } catch (e) {
      setError(e.message);
      return false;
    }
    try {
      if (optimize) {
        const r = await optimizeListing({ title: data.title, price: data.price, condition: data.condition, category: data.category, raw_description: data.description_original });
        await updateProduct(id, { ai: { optimized_title: r.optimized_title, optimized_description: r.optimized_description, recommended_tags: r.recommended_tags } });
      }
      setInfo(optimize ? 'Producto creado y optimizado con IA.' : aiBlock ? 'Producto creado con el anuncio generado por la IA.' : 'Producto creado.');
    } catch (e) {
      setError(`Producto creado, pero la IA falló: ${e.message}`);
    }
    setPrefill(null);
    await reload().catch(() => {});
    return true;
  };

  const hasLicense = !!account?.license?.active;
  const count = (pl) => products.filter((p) => p.listings[pl]?.status === 'published' || p.pending_removal.includes(pl)).length;
  const visible = tab === 'all' ? products : products.filter((p) => p.listings[tab]?.status === 'published' || p.pending_removal.includes(tab));

  return (
    <main style={s.main}>
      <div style={{ ...s.row, justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>MultiMarket Sync</h1>
        <div style={s.row}>
          {account && <span style={s.muted}>{hasLicense ? `Plan ${account.license.plan}` : 'Sin plan activo'}{account.limits && account.usage ? ` · IA ${account.usage.ai_optimizations}/${account.limits.ai_optimizations_per_month}` : ''}</span>}
          <Link href="/multimarket/planes" style={{ fontSize: 14 }}>Planes</Link>
        </div>
      </div>

      <p style={s.muted}>
        Primera versión semiautomática: crea tu producto, optimiza el anuncio con IA, publícalo tú en cada app (copiando el texto) y registra aquí la URL.
        Al marcar una venta, te indicamos en qué plataformas retirar el anuncio. La publicación automática aún no está activada.
      </p>

      {error && <p style={s.error}>{error}</p>}
      {loggedOut && <p><Link href="/auth/login">Iniciar sesión</Link></p>}
      {info && <p style={s.info}>{info}</p>}
      {loading && <p style={s.muted}>Cargando…</p>}

      {account && !hasLicense && (
        <p style={s.card}>Necesitas un plan activo para crear productos y usar la IA. <Link href="/multimarket/planes">Ver planes</Link></p>
      )}
      {account?.is_admin && <AdminBox account={account} onDone={() => reload().catch((e) => setError(e.message))} />}

      {account && (
        <PhotoCreate
          disabled={!hasLicense}
          onResult={(r) => {
            setPrefill(r);
            setError('');
            setInfo('Revisa los datos y pulsa "Guardar producto".');
            reload().catch(() => {});
            setTimeout(() => document.getElementById('nuevo-producto')?.scrollIntoView({ behavior: 'smooth' }), 150);
          }}
        />
      )}
      {account && <NewProduct disabled={!hasLicense} onCreate={onCreate} prefill={prefill} />}

      {account && (
        <div style={{ ...s.row, marginTop: 24 }}>
          <button style={s.tab(tab === 'all')} onClick={() => setTab('all')}>Todos ({products.length})</button>
          {PLATFORMS.map((pl) => (
            <button key={pl.id} style={s.tab(tab === pl.id)} onClick={() => setTab(pl.id)}>{pl.name} ({count(pl.id)})</button>
          ))}
        </div>
      )}

      {account && visible.length === 0 && <p style={s.muted}>No hay productos en esta vista.</p>}
      {visible.map((p) => <ProductCard key={p.id} p={p} run={run} hasLicense={hasLicense} />)}
    </main>
  );
}
