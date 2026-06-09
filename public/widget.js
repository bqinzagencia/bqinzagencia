(function() {
  'use strict';

  var NEXOIA_ID     = window.NEXOIA_ID;
  var NEXOIA_COLOR  = window.NEXOIA_COLOR  || '#FF6B00';
  var NEXOIA_NAME   = window.NEXOIA_NAME   || 'Asistente';
  var NEXOIA_BOTTOM = window.NEXOIA_BOTTOM || '24px';
  var NEXOIA_API    = 'https://nexoia-soporteias-projects.vercel.app';

  if (!NEXOIA_ID) { console.warn('[NEXOIA] Falta NEXOIA_ID'); return; }
  if (document.getElementById('nexoia-widget')) return;

  var messages      = [];
  var isOpen        = false;
  var isThinking    = false;
  var clienteNombre = '';
  var clienteTel    = '';
  var leadGuardado  = false;
  var enFormulario  = true; // comienza en formulario

  // ── Estilos ──────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#nexoia-btn{position:fixed;bottom:' + NEXOIA_BOTTOM + ';right:24px;width:56px;height:56px;border-radius:50%;background:' + NEXOIA_COLOR + ';border:none;cursor:pointer;font-size:22px;box-shadow:0 8px 24px ' + NEXOIA_COLOR + '55;z-index:99999;transition:all 0.3s;display:flex;align-items:center;justify-content:center;}',
    '#nexoia-btn:hover{transform:scale(1.1);}',
    '#nexoia-chat{position:fixed;bottom:calc(' + NEXOIA_BOTTOM + ' + 68px);right:24px;width:340px;background:#13161a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);display:none;flex-direction:column;z-index:99999;overflow:hidden;font-family:sans-serif;}',
    '#nexoia-chat.open{display:flex;}',
    '#nexoia-header{padding:14px 18px;background:#1a1d22;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#nexoia-avatar{width:36px;height:36px;border-radius:10px;background:' + NEXOIA_COLOR + '22;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}',
    '#nexoia-title{flex:1;font-weight:700;font-size:14px;color:#fff;}',
    '#nexoia-status{font-size:11px;color:#25D366;font-weight:500;}',
    '#nexoia-close{background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:18px;line-height:1;padding:4px;}',

    // Formulario de captura
    '#nexoia-form{padding:20px 18px;display:flex;flex-direction:column;gap:12px;}',
    '#nexoia-form-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;}',
    '#nexoia-form-sub{font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:4px;line-height:1.5;}',
    '.nxinput{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:11px 14px;color:#fff;font-size:13px;outline:none;font-family:sans-serif;box-sizing:border-box;}',
    '.nxinput:focus{border-color:' + NEXOIA_COLOR + ';}',
    '.nxinput::placeholder{color:rgba(255,255,255,0.3);}',
    '.nxinput.error{border-color:#EF4444;}',
    '#nexoia-form-error{font-size:12px;color:#F87171;display:none;}',
    '#nexoia-form-btn{width:100%;padding:12px;background:' + NEXOIA_COLOR + ';color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity 0.2s;font-family:sans-serif;}',
    '#nexoia-form-btn:hover{opacity:0.88;}',

    // Chat
    '#nexoia-messages{height:340px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}',
    '#nexoia-messages::-webkit-scrollbar{width:4px;}',
    '#nexoia-messages::-webkit-scrollbar-track{background:transparent;}',
    '#nexoia-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}',
    '.nxmsg{max-width:88%;padding:10px 14px;font-size:14px;line-height:1.5;border-radius:16px;}',
    '.nxmsg.bot{background:#1a1d22;border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.85);border-radius:16px 16px 16px 4px;align-self:flex-start;}',
    '.nxmsg.user{background:' + NEXOIA_COLOR + ';color:#fff;font-weight:500;border-radius:16px 16px 4px 16px;align-self:flex-end;}',
    '#nexoia-footer{padding:12px 14px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;flex-shrink:0;}',
    '#nexoia-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#fff;font-size:13px;outline:none;font-family:sans-serif;}',
    '#nexoia-input:focus{border-color:' + NEXOIA_COLOR + ';}',
    '#nexoia-input::placeholder{color:rgba(255,255,255,0.3);}',
    '#nexoia-send{width:40px;height:40px;border-radius:10px;background:' + NEXOIA_COLOR + ';border:none;cursor:pointer;font-size:15px;flex-shrink:0;transition:opacity 0.2s;}',
    '#nexoia-send:disabled{opacity:0.4;cursor:default;}',
    '#nexoia-powered{text-align:center;padding:6px;font-size:10px;color:rgba(255,255,255,0.2);flex-shrink:0;}',
    '#nexoia-powered a{color:' + NEXOIA_COLOR + ';text-decoration:none;font-weight:600;}',
  ].join('');
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────────────────────────
  var container = document.createElement('div');
  container.id = 'nexoia-widget';
  container.innerHTML = [
    '<button id="nexoia-btn">💬</button>',
    '<div id="nexoia-chat">',

    // Header (siempre visible)
    '  <div id="nexoia-header">',
    '    <div id="nexoia-avatar">🤖</div>',
    '    <div><div id="nexoia-title">' + NEXOIA_NAME + '</div><div id="nexoia-status">● En línea</div></div>',
    '    <button id="nexoia-close">✕</button>',
    '  </div>',

    // Formulario de captura (pantalla inicial)
    '  <div id="nexoia-form">',
    '    <div id="nexoia-form-title">¡Hola! Para ayudarte mejor</div>',
    '    <div id="nexoia-form-sub">Ingresa tus datos y te conectamos de inmediato con nuestro asistente.</div>',
    '    <input class="nxinput" id="nx-nombre" placeholder="Tu nombre completo *" type="text" />',
    '    <input class="nxinput" id="nx-tel"    placeholder="Tu teléfono / WhatsApp *" type="tel" />',
    '    <div id="nexoia-form-error">Por favor completa nombre y teléfono.</div>',
    '    <button id="nexoia-form-btn">Iniciar chat →</button>',
    '  </div>',

    // Chat (oculto hasta completar formulario)
    '  <div id="nexoia-messages" style="display:none;"></div>',
    '  <div id="nexoia-footer" style="display:none;">',
    '    <input id="nexoia-input" placeholder="Escribe un mensaje..." />',
    '    <button id="nexoia-send">➤</button>',
    '  </div>',
    '  <div id="nexoia-powered" style="display:none;">Powered by <a href="https://agenciame.com" target="_blank">agenc<span style="color:' + NEXOIA_COLOR + '">IA</span>me</a></div>',
    '</div>',
  ].join('');
  document.body.appendChild(container);

  // ── Referencias ───────────────────────────────────────────────────────────
  var btn        = document.getElementById('nexoia-btn');
  var chat       = document.getElementById('nexoia-chat');
  var closeBtn   = document.getElementById('nexoia-close');
  var formEl     = document.getElementById('nexoia-form');
  var formBtn    = document.getElementById('nexoia-form-btn');
  var formError  = document.getElementById('nexoia-form-error');
  var nxNombre   = document.getElementById('nx-nombre');
  var nxTel      = document.getElementById('nx-tel');
  var messagesEl = document.getElementById('nexoia-messages');
  var footer     = document.getElementById('nexoia-footer');
  var powered    = document.getElementById('nexoia-powered');
  var input      = document.getElementById('nexoia-input');
  var sendBtn    = document.getElementById('nexoia-send');

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chat.classList.add('open');
      btn.innerHTML = '✕';
      if (enFormulario) nxNombre.focus();
      else input.focus();
    } else {
      chat.classList.remove('open');
      btn.innerHTML = '💬';
    }
  }

  // ── Guardar lead en CRM ────────────────────────────────────────────────────
  function guardarLead(nombre, tel) {
    fetch(NEXOIA_API + '/api/widget-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresaId: NEXOIA_ID,
        guardarLead: true,
        lead: { nombre: nombre, telefono: tel, canal: 'web' },
        messages: [],
      }),
    }).catch(function() {});
  }

  // ── Activar chat después del formulario ────────────────────────────────────
  function activarChat() {
    var nombre = nxNombre.value.trim();
    var tel    = nxTel.value.trim();

    nxNombre.classList.remove('error');
    nxTel.classList.remove('error');
    formError.style.display = 'none';

    if (!nombre || !tel) {
      if (!nombre) nxNombre.classList.add('error');
      if (!tel)    nxTel.classList.add('error');
      formError.style.display = 'block';
      return;
    }

    clienteNombre = nombre;
    clienteTel    = tel;

    // Ocultar form, mostrar chat
    formEl.style.display     = 'none';
    messagesEl.style.display = 'flex';
    footer.style.display     = 'flex';
    powered.style.display    = 'block';
    enFormulario = false;

    // Guardar en CRM automáticamente
    if (!leadGuardado) {
      guardarLead(nombre, tel);
      leadGuardado = true;
    }

    // Saludo personalizado
    addMessage('¡Hola ' + nombre + '! 👋 ¿En qué te puedo ayudar hoy?', 'bot');
    input.focus();
  }

  // ── Mensajes ───────────────────────────────────────────────────────────────
  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'nxmsg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  // ── Enviar mensaje ─────────────────────────────────────────────────────────
  function sendMessage() {
    var text = input.value.trim();
    if (!text || isThinking) return;
    addMessage(text, 'user');
    messages.push({ role: 'user', content: text });
    input.value = '';
    isThinking = true;
    sendBtn.disabled = true;

    var thinkingEl = addMessage('Escribiendo...', 'bot');
    thinkingEl.style.color     = 'rgba(255,255,255,0.35)';
    thinkingEl.style.fontStyle = 'italic';

    fetch(NEXOIA_API + '/api/widget-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages:   messages,
        empresaId:  NEXOIA_ID,
        clienteNombre: clienteNombre,
        clienteTel:    clienteTel,
        canal:         'web',
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      messagesEl.removeChild(thinkingEl);
      var reply = data.reply || 'Lo siento, intenta de nuevo.';
      addMessage(reply, 'bot');
      messages.push({ role: 'assistant', content: reply });
    })
    .catch(function() {
      messagesEl.removeChild(thinkingEl);
      addMessage('Error de conexión. Intenta de nuevo.', 'bot');
    })
    .finally(function() {
      isThinking   = false;
      sendBtn.disabled = false;
    });
  }

  // ── Eventos ────────────────────────────────────────────────────────────────
  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  formBtn.addEventListener('click', activarChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });
  nxNombre.addEventListener('keydown', function(e) { if (e.key === 'Enter') nxTel.focus(); });
  nxTel.addEventListener('keydown', function(e) { if (e.key === 'Enter') activarChat(); });

})();
