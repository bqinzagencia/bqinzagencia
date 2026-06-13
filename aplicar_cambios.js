// Ejecutar desde CMD en la raiz del proyecto nexoia:
// node aplicar_cambios.js

const fs = require('fs');

// ── CAMBIO 1: wasapbot/index.js — Agregar botón "Ingresar" en el nav ──────────
{
  const path = './pages/wasapbot/index.js';
  let c = fs.readFileSync(path, 'utf8');

  // Reemplazar el nav CTA para agregar botón "Ingresar"
  c = c.replace(
    `        <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green" style={{padding:'9px 22px',fontSize:13,borderRadius:8}}>
          Activar mi bot →
        </button>`,
    `        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={()=>router.push('/auth/login')} style={{background:'transparent',color:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'8px 18px',fontFamily:"'Inter', system-ui, sans-serif",fontSize:13,cursor:'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#EFF4FF';e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.45)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}>
            Ingresar
          </button>
          <button onClick={()=>router.push('/wasapbot/activar')} className="wb-cta-green" style={{padding:'9px 22px',fontSize:13,borderRadius:8}}>
            Activar mi bot →
          </button>
        </div>`
  );

  // Reemplazar la garantía — quitar "14 días"
  c = c.replace(
    `          <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300}}>Si en los primeros 14 días no estás satisfecho, te devolvemos el dinero. Sin preguntas.</div>`,
    `          <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:300}}>Activa tu plan hoy. Si no estás satisfecho, te devolvemos el dinero. Sin preguntas.</div>`
  );

  fs.writeFileSync(path, c, 'utf8');
  console.log('✓ wasapbot/index.js actualizado');
}

// ── CAMBIO 2: pages/index.js — Quitar "14 días gratis" de los CTAs de planes ──
{
  const path = './pages/index.js';
  let c = fs.readFileSync(path, 'utf8');

  // Reemplazar los CTAs del array PLANES
  c = c.replace(
    `  { name: 'Emprendedor', price: '189.000', features: ['1 Agente IA activo', '500 conversaciones/mes', 'Chat web + WhatsApp', 'CRM hasta 200 contactos', 'Agendamiento básico', 'Soporte por email'], cta: 'Comenzar gratis', popular: false },
  { name: 'Profesional', price: '490.000', features: ['3 Agentes IA activos', 'Conversaciones ilimitadas', 'WhatsApp + Instagram + Web', 'Llamadas IA (100/mes)', 'CRM ilimitado + pipeline', 'Página web con IA', 'Reportes avanzados', 'Soporte 24/7'], cta: 'Empezar 14 días gratis', popular: true },`,
    `  { name: 'Emprendedor', price: '189.000', features: ['1 Agente IA activo', '500 conversaciones/mes', 'Chat web + WhatsApp', 'CRM hasta 200 contactos', 'Agendamiento básico', 'Soporte por email'], cta: 'Activar mi plan', popular: false },
  { name: 'Profesional', price: '490.000', features: ['3 Agentes IA activos', 'Conversaciones ilimitadas', 'WhatsApp + Instagram + Web', 'Llamadas IA (100/mes)', 'CRM ilimitado + pipeline', 'Página web con IA', 'Reportes avanzados', 'Soporte 24/7'], cta: 'Activar mi plan', popular: true },`
  );

  fs.writeFileSync(path, c, 'utf8');
  console.log('✓ pages/index.js actualizado');
}

console.log('\nListo. Ahora ejecuta:');
console.log('git add . && git commit -m "fix: boton ingresar wasapbot, quitar trial 14 dias" && vercel --prod');
