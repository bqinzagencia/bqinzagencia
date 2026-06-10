// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getConversaciones, getCitas, getContactos, getAgentes } from '../../lib/firebase';
import { tiempoRelativo, formatHora, getIndustriaInfo, iniciales } from '../../lib/utils';

const F = "'Inter', system-ui, sans-serif";

// ── Foto de fondo hero por industria ─────────────────────────────────────────
const HERO_BG = {
  taller:             'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1400&q=85',
  peluqueria:         'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85',
  inmobiliaria:       'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85',
  restaurante:        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85',
  restaurante_barrio: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85',
  tienda:             'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=85',
  gimnasio:           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85',
  salud:              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=85',
  ajedrez:            'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1400&q=85',
  arquitectura:       'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1400&q=85',
  papeleria:          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85',
  aduana:             'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=85',
  portuaria:          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=85',
  tecnico:            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85',
  default:            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85',
};

// ── Fotos reales para los 4 stat cards, por industria ─────────────────────────
// Cada industria tiene fotos relevantes: conversaciones, citas, contactos, agentes
const STAT_IMGS = {
  taller: [
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=72&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=72&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&q=80',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=72&q=80',
  ],
  peluqueria: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=72&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=72&q=80',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=72&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=72&q=80',
  ],
  restaurante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=72&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=72&q=80',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=72&q=80',
    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=72&q=80',
  ],
  restaurante_barrio: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=72&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=72&q=80',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=72&q=80',
    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=72&q=80',
  ],
  inmobiliaria: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=72&q=80',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=72&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=72&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=72&q=80',
  ],
  gimnasio: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=72&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=72&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=72&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=72&q=80',
  ],
  salud: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=72&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=72&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=72&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=72&q=80',
  ],
  ajedrez: [
    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=72&q=80',
    'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=72&q=80',
    'https://images.unsplash.com/photo-1606166325683-e6deb697d301?w=72&q=80',
    'https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=72&q=80',
  ],
  arquitectura: [
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=72&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=72&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=72&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=72&q=80',
  ],
  tienda: [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=72&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=72&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=72&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=72&q=80',
  ],
  papeleria: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=72&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=72&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=72&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=72&q=80',
  ],
  aduana: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=72&q=80',
    'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=72&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=72&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=72&q=80',
  ],
  portuaria: [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=72&q=80',
    'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=72&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=72&q=80',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=72&q=80',
  ],
  tecnico: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=72&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=72&q=80',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=72&q=80',
    'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=72&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=72&q=80',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=72&q=80',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=72&q=80',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=72&q=80',
  ],
};

const GUIDE_STEPS = [
  { step: '01', href: '/dashboard/agentes',      title: 'Crea tu Agente IA',        desc: 'Entrena tu primer agente con los servicios y precios de tu negocio. Responderá clientes 24/7.',              color: '#2B6AFF', icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></> },
  { step: '02', href: '/dashboard/conocimiento', title: 'Base de conocimiento',      desc: 'Agrega servicios, tarifas, horarios y FAQs. Tu agente usará esta información en cada conversación.',        color: '#06B6D4', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
  { step: '03', href: '/dashboard/widget',       title: 'Instala el chat en tu web', desc: 'Copia el código widget y pégalo en tu sitio. Tus visitantes chatearán con la IA de inmediato.',             color: '#A78BFA', icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></> },
  { step: '04', href: '/dashboard/agenda',       title: 'Activa el agendamiento',    desc: 'Configura tu calendario y deja que la IA agende citas automáticamente sin intervención.',                   color: '#FF6B00', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
  { step: '05', href: '/dashboard/voz',          title: 'Configura Voz IA',          desc: 'Conecta tu número para que la IA conteste llamadas y confirme citas automáticamente.',                       color: '#10B981', icon: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></> },
  { step: '06', href: '/dashboard/web',          title: 'Publica tu página web',     desc: 'Activa tu micrositio con servicios, fotos y chat integrado. Incluido en todos los planes.',                  color: '#8B5CF6', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/></> },
];

export default function Dashboard() {
  const { user, empresa, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats]                   = useState({ conversaciones: 0, citas: 0, contactos: 0, agentes: 0 });
  const [conversaciones, setConversaciones] = useState([]);
  const [citas, setCitas]                   = useState([]);
  const [dataLoading, setDataLoading]       = useState(true);
  const [guideVisible, setGuideVisible]     = useState(true);

  useEffect(() => { if (!loading && !user) router.push('/auth/login'); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [convs, agts, conts, cits] = await Promise.all([
          getConversaciones(user.uid, 5), getAgentes(user.uid),
          getContactos(user.uid), getCitas(user.uid),
        ]);
        setConversaciones(convs);
        setCitas(cits.slice(0, 5));
        setStats({ conversaciones: convs.length, citas: cits.length, contactos: conts.length, agentes: agts.length });
        if (agts.length > 0) setGuideVisible(false);
      } catch (e) { console.error(e); }
      finally { setDataLoading(false); }
    })();
  }, [user]);

  if (loading || !empresa) return <div className="page-loader"><div className="spinner" /></div>;

  const ind    = getIndustriaInfo(empresa.industria);
  const heroBg = HERO_BG[empresa.industria] || HERO_BG.default;
  const imgs   = STAT_IMGS[empresa.industria] || STAT_IMGS.default;
  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  // ── Cálculo del trial ────────────────────────────────────────────
  const esTrial = empresa.plan === 'emprendedor';
  let diasRestantes = 0;
  let trialVencido = false;
  if (esTrial && empresa.trialHasta) {
    const hasta = empresa.trialHasta?.toDate ? empresa.trialHasta.toDate() : new Date(empresa.trialHasta);
    const hoy   = new Date();
    const diff  = Math.ceil((hasta - hoy) / (1000 * 60 * 60 * 24));
    diasRestantes = Math.max(0, diff);
    trialVencido  = diff <= 0;
  }

  const STATS = [
    { label: 'Conversaciones hoy', value: stats.conversaciones, sub: '+12% vs ayer',    color: '#00E5A0', img: imgs[0] },
    { label: 'Citas agendadas',    value: stats.citas,          sub: 'Total activas',    color: '#3B82F6', img: imgs[1] },
    { label: 'Contactos en CRM',  value: stats.contactos,      sub: 'Base de clientes', color: '#A78BFA', img: imgs[2] },
    { label: 'Agentes activos',   value: stats.agentes,        sub: empresa.plan === 'emprendedor' ? 'Plan: 1 máx' : 'En línea', color: '#F97316', img: imgs[3] },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <Head><title>Dashboard — {empresa.nombreEmpresa} · agencIAme</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        .db-page { font-family:${F}; }
        .db-card { background:#111827; border:1px solid rgba(255,255,255,0.07); border-radius:18px; }
        .db-stitle { font-family:${F}; font-size:14px; font-weight:700; color:#EFF4FF; letter-spacing:-0.02em; }
        .db-stat-val { font-family:${F}; font-size:36px; font-weight:900; letter-spacing:-0.04em; line-height:1; }
        .db-stat-lbl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#4B6080; font-family:${F}; }
        .db-stat-sub { font-size:12px; color:#4B6080; margin-top:6px; font-family:${F}; }
        .db-lnk { color:#2B6AFF; font-size:12px; font-weight:600; text-decoration:none; font-family:${F}; }
        .db-lnk:hover { color:#6DA4FF; }
        .db-gcard { background:#111827; border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:18px; transition:border-color 0.2s,transform 0.2s; cursor:pointer; text-decoration:none; display:block; }
        .db-gcard:hover { border-color:rgba(43,106,255,0.28); transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.4); }
        .db-abtn { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:100px; font-size:13px; font-weight:600; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#8A9BB5; text-decoration:none; transition:all 0.15s; font-family:${F}; }
        .db-abtn:hover { background:rgba(43,106,255,0.09); color:#EFF4FF; border-color:rgba(43,106,255,0.22); }
        .db-bconf { background:rgba(16,185,129,0.14); color:#34D399; border:1px solid rgba(16,185,129,0.22); border-radius:100px; padding:3px 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; font-family:${F}; }
        .db-bpend { background:rgba(245,158,11,0.14); color:#FBB040; border:1px solid rgba(245,158,11,0.22); border-radius:100px; padding:3px 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; font-family:${F}; }
        .stat-img-wrap { width:38px; height:38px; border-radius:10px; overflow:hidden; flex-shrink:0; }
        .stat-img-wrap img { width:100%; height:100%; object-fit:cover; }

        /* ── Mobile fixes hero ── */
        @media (max-width: 767px) {
          .db-hero-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 14px !important;
            padding: 0 18px !important;
          }
          .db-hero-title { font-size: 19px !important; margin-bottom: 2px !important; }
          .db-hero-date  { font-size: 11px !important; }
          .db-hero-btn   { width: 100% !important; justify-content: center !important; padding: 10px 0 !important; font-size: 13px !important; }
          .db-hero-wrap  { height: 220px !important; border-radius: 14px !important; }
          .db-conv-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .db-hero-title { font-size: 16px !important; }
          .db-hero-wrap  { height: 200px !important; }
        }
      `}} />

      <div className="db-page">

        {/* ── Hero banner ── */}
        <div className="db-hero-wrap" style={{ position:'relative', borderRadius:20, overflow:'hidden', height:200, marginBottom:28 }}>
          {/* Imagen de fondo — centrada y visible en móvil */}
          <img
            src={heroBg}
            alt={ind.label}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center center' }}
          />
          {/* Gradiente oscuro que cubre bien en móvil */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(8,11,15,0.95) 0%,rgba(8,11,15,0.75) 50%,rgba(8,11,15,0.45) 100%)' }} />
          {/* Contenido interior — apila en móvil */}
          <div
            className="db-hero-inner"
            style={{ position:'relative', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}
          >
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:ind.color+'22', border:`1px solid ${ind.color}44`, borderRadius:100, padding:'4px 12px', marginBottom:10 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:ind.color }} />
                <span style={{ fontFamily:F, fontSize:11, fontWeight:600, color:ind.color, letterSpacing:0.5 }}>{ind.label}</span>
              </div>
              <h2
                className="db-hero-title"
                style={{ fontFamily:F, fontSize:26, fontWeight:800, color:'#F9FAFB', letterSpacing:'-0.5px', marginBottom:4, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}
              >
                {saludo}, {empresa.nombreEmpresa}
              </h2>
              <p
                className="db-hero-date"
                style={{ fontFamily:F, fontSize:13, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
              >
                {new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </p>
            </div>
            <Link
              href="/dashboard/agentes"
              className="db-hero-btn"
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#2B6AFF', color:'#fff', padding:'10px 22px', borderRadius:100, fontSize:13, fontWeight:700, textDecoration:'none', fontFamily:F, boxShadow:'0 4px 20px rgba(43,106,255,0.4)', whiteSpace:'nowrap', flexShrink:0, marginLeft:12 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Agente IA
            </Link>
          </div>
        </div>

        {/* ── Stat cards con fotos reales ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
          {STATS.map((s, i) => (
            <div key={i} className="db-card" style={{ padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span className="db-stat-lbl">{s.label}</span>
                {/* FOTO REAL en lugar de emoji/icono */}
                <div className="stat-img-wrap" style={{ border:`1.5px solid ${s.color}33` }}>
                  <img src={s.img} alt={s.label} />
                </div>
              </div>
              <div className="db-stat-val" style={{ color:s.color }}>{s.value}</div>
              <div className="db-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Guía de activación ── */}
        {guideVisible && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:F, fontSize:15, fontWeight:700, color:'#F9FAFB', marginBottom:2 }}>Guía de activación</div>
                <div style={{ fontFamily:F, fontSize:12, color:'#4B5563' }}>Completa estos pasos para tener tu agencia de IA al 100%</div>
              </div>
              <button onClick={() => setGuideVisible(false)} style={{ background:'none', border:'none', color:'#374151', cursor:'pointer', fontSize:12, fontFamily:F }}>Ocultar</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:12 }}>
              {GUIDE_STEPS.map(s => (
                <Link key={s.step} href={s.href} className="db-gcard">
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:s.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                    </div>
                    <span style={{ fontFamily:F, fontSize:10, fontWeight:700, color:s.color, letterSpacing:1, textTransform:'uppercase' }}>Paso {s.step}</span>
                  </div>
                  <div style={{ fontFamily:F, fontSize:13, fontWeight:600, color:'#F9FAFB', marginBottom:5 }}>{s.title}</div>
                  <div style={{ fontFamily:F, fontSize:12, color:'#4B5563', lineHeight:1.6 }}>{s.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Conversaciones + Citas ── */}
        <div className="db-conv-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div className="db-card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <span className="db-stitle">Últimas conversaciones</span>
              <Link href="/dashboard/conversaciones" className="db-lnk">Ver todas →</Link>
            </div>
            {dataLoading ? <Skel/> : conversaciones.length === 0
              ? <Empty text="Sin conversaciones aún" sub="Activa tu agente IA para comenzar"/>
              : conversaciones.map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 0', borderBottom:i<conversaciones.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
                  <div style={{ width:34,height:34,borderRadius:8,background:'#1C2028',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#00E5A0',flexShrink:0,fontFamily:F }}>{iniciales(c.nombreCliente||'CL')}</div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontSize:13,fontWeight:600,color:'#F9FAFB',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:F }}>{c.nombreCliente||'Cliente'}</div>
                    <div style={{ fontSize:11,color:'#374151',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:F }}>{c.ultimoTexto||'Sin mensajes'}</div>
                  </div>
                  <div style={{ fontSize:11,color:'#374151',flexShrink:0,fontFamily:F }}>{tiempoRelativo(c.ultimoMensaje)}</div>
                </div>
              ))
            }
          </div>

          <div className="db-card" style={{ padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <span className="db-stitle">Próximas citas</span>
              <Link href="/dashboard/agenda" className="db-lnk">Ver agenda →</Link>
            </div>
            {dataLoading ? <Skel/> : citas.length === 0
              ? <Empty text="Sin citas agendadas" sub="Tu agente IA agendará automáticamente"/>
              : citas.map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 0', borderBottom:i<citas.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
                  <div style={{ width:42,textAlign:'center',background:'rgba(0,229,160,0.07)',borderRadius:8,padding:'5px 4px',flexShrink:0 }}>
                    <div style={{ fontSize:16,fontWeight:800,color:'#00E5A0',fontFamily:F,lineHeight:1 }}>{c.fechaHora?.toDate?c.fechaHora.toDate().getDate():'—'}</div>
                    <div style={{ fontSize:9,color:'#00E5A0',fontWeight:700,letterSpacing:0.5,fontFamily:F }}>{c.fechaHora?.toDate?c.fechaHora.toDate().toLocaleDateString('es-CO',{month:'short'}).toUpperCase():''}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:'#F9FAFB',fontFamily:F }}>{c.nombreCliente||'Cliente'}</div>
                    <div style={{ fontSize:11,color:'#374151',fontFamily:F }}>{c.servicio||'Servicio'} · {formatHora(c.fechaHora)}</div>
                  </div>
                  <span className={c.estado==='confirmada'?'db-bconf':'db-bpend'}>{c.estado||'Pendiente'}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Acciones rápidas ── */}
        <div className="db-card" style={{ padding:22 }}>
          <div className="db-stitle" style={{ marginBottom:14 }}>Acciones rápidas</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { label:'Crear agente IA',  href:'/dashboard/agentes',       icon:<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></> },
              { label:'Agregar contacto', href:'/dashboard/crm',           icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></> },
              { label:'Agendar cita',     href:'/dashboard/agenda',        icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
              { label:'Ver reportes',     href:'/dashboard/reportes',      icon:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
              { label:'Configuración',    href:'/dashboard/configuracion', icon:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
            ].map((a,i) => (
              <Link key={i} href={a.href} className="db-abtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Empty({ text, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'28px 16px' }}>
      <div style={{ width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.04)',margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div style={{ fontSize:13,fontWeight:600,color:'#6B7280',marginBottom:3,fontFamily:"'Inter',sans-serif" }}>{text}</div>
      <div style={{ fontSize:12,color:'#374151',fontFamily:"'Inter',sans-serif" }}>{sub}</div>
    </div>
  );
}

function Skel() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {[1,2,3].map(i => <div key={i} style={{ height:36,background:'rgba(255,255,255,0.03)',borderRadius:8 }}/>)}
    </div>
  );
}
