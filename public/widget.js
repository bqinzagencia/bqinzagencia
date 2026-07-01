// public/widget.js
// Widget de ChatBot agencIAme — se instala con 1 linea de codigo
// <script src="https://agenciame.com/widget.js" data-id="ID_DEL_CHATBOT"></script>

(function() {
  'use strict';

  // Obtener el ID del chatbot del atributo data-id
  var scripts = document.querySelectorAll('script[data-id]');
  var currentScript = scripts[scripts.length - 1];
  var chatbotId = currentScript ? currentScript.getAttribute('data-id') : null;

  if (!chatbotId) {
    console.warn('[BqinzagencIA] Widget: data-id no encontrado');
    return;
  }

  var API_BASE = 'https://www.bqinzagencia.com';
  var config   = null;
  var isOpen   = false;
  var messages = [];
  var sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2);

  // ── 1. Cargar configuracion del chatbot ──────────────────────────────────
  function loadConfig(cb) {
    fetch(API_BASE + '/api/chatbot-widget-config?id=' + chatbotId)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        config = d;
        cb(d);
      })
      .catch(function() {
        // Config por defecto si falla
        config = {
          nombre:   'Asistente',
          color:    '#2563EB',
          posicion: 'derecha',
          saludo:   'Hola, bienvenido. En que puedo ayudarte?',
          avatar:   '',
          servicios: [],
        };
        cb(config);
      });
  }

  // ── 2. Crear estilos ─────────────────────────────────────────────────────
  function injectStyles(color, pos) {
    var side  = pos === 'izquierda' ? 'left' : 'right';
    var style = document.createElement('style');
    style.textContent = [
      '#agme-fab{position:fixed;' + side + ':24px;bottom:24px;z-index:99999;width:54px;height:54px;border-radius:50%;background:' + color + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px ' + color + '55;transition:transform 0.2s,box-shadow 0.2s;}',
      '#agme-fab:hover{transform:scale(1.1);box-shadow:0 8px 28px ' + color + '77;}',
      '#agme-badge{position:absolute;top:-4px;' + side + ':' + (pos==='izquierda'?'-4px':'-4px') + ';width:18px;height:18px;background:#EF4444;border:2px solid #fff;border-radius:50%;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;}',
      '#agme-panel{position:fixed;' + side + ':24px;bottom:90px;z-index:99998;width:340px;max-height:520px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.18);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Inter",sans-serif;}',
      '#agme-panel.open{display:flex;}',
      '@keyframes agme-in{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      '#agme-panel.open{animation:agme-in 0.22s cubic-bezier(0.16,1,0.3,1) both;}',
      '#agme-header{background:' + color + ';padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
      '#agme-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden;}',
      '#agme-avatar img{width:100%;height:100%;object-fit:cover;}',
      '#agme-hname{font-size:13px;font-weight:700;color:#fff;}',
      '#agme-hstatus{font-size:10px;color:rgba(255,255,255,0.7);margin-top:1px;}',
      '#agme-hclose{margin-left:auto;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;color:#fff;font-size:14px;display:flex;align-items:center;justify-content:center;}',
      '#agme-msgs{flex:1;overflow-y:auto;padding:14px;background:#F8FAFC;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth;}',
      '.agme-msg{max-width:82%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.5;animation:agme-in 0.2s ease;}',
      '.agme-msg.bot{background:#fff;color:#111;border:1px solid #E5E7EB;border-radius:12px 12px 12px 2px;align-self:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.06);}',
      '.agme-msg.user{background:' + color + ';color:#fff;border-radius:12px 12px 2px 12px;align-self:flex-end;}',
      '.agme-msg.typing{padding:10px 14px;}',
      '.agme-dot{width:6px;height:6px;border-radius:50%;background:#9CA3AF;display:inline-block;margin:0 2px;animation:agme-dot 1.2s ease-in-out infinite;}',
      '@keyframes agme-dot{0%,60%,100%{opacity:0.25}30%{opacity:1}}',
      '.agme-opts{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}',
      '.agme-opt{background:' + color + '12;color:' + color + ';border:1px solid ' + color + '30;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;}',
      '.agme-opt:hover{background:' + color + ';color:#fff;}',
      '#agme-input-wrap{padding:10px;background:#fff;border-top:1px solid #E5E7EB;display:flex;gap:8px;align-items:center;flex-shrink:0;}',
      '#agme-input{flex:1;background:#F3F4F6;border:none;border-radius:22px;padding:9px 14px;font-size:13px;color:#111;outline:none;font-family:inherit;}',
      '#agme-input:focus{background:#EBF0FF;}',
      '#agme-send{width:34px;height:34px;border-radius:50%;background:' + color + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity 0.15s;}',
      '#agme-send:hover{opacity:0.85;}',
      '#agme-branding{text-align:center;padding:5px;font-size:9px;color:#D1D5DB;background:#fff;}',
      '#agme-branding a{color:#D1D5DB;}',
      '@media(max-width:480px){#agme-panel{width:calc(100vw - 20px);' + side + ':10px;bottom:80px;}}',
    ].join('');
    document.head.appendChild(style);
  }

  // ── 3. Crear DOM ─────────────────────────────────────────────────────────
  function buildUI(cfg) {
    var color = cfg.color || '#2563EB';
    var pos   = cfg.posicion || 'derecha';
    injectStyles(color, pos);

    // FAB
    var fab = document.createElement('button');
    fab.id = 'agme-fab';
    fab.setAttribute('aria-label', 'Abrir chat');
    fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';

    var badge = document.createElement('div');
    badge.id = 'agme-badge';
    badge.textContent = '1';
    fab.appendChild(badge);

    // Panel
    var panel = document.createElement('div');
    panel.id  = 'agme-panel';

    // Header
    var header = document.createElement('div');
    header.id  = 'agme-header';

    var avatarDiv = document.createElement('div');
    avatarDiv.id  = 'agme-avatar';
    if (cfg.avatarUrl) {
      var img = document.createElement('img');
      img.src = cfg.avatarUrl;
      img.alt = cfg.nombre;
      avatarDiv.appendChild(img);
    } else {
      avatarDiv.textContent = '🤖';
    }

    var nameDiv = document.createElement('div');
    var hname   = document.createElement('div');
    hname.id    = 'agme-hname';
    hname.textContent = cfg.nombre || 'Asistente';
    var hstatus = document.createElement('div');
    hstatus.id  = 'agme-hstatus';
    hstatus.textContent = 'En linea · responde en segundos';
    nameDiv.appendChild(hname);
    nameDiv.appendChild(hstatus);

    var closeBtn = document.createElement('button');
    closeBtn.id  = 'agme-hclose';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Cerrar chat');

    header.appendChild(avatarDiv);
    header.appendChild(nameDiv);
    header.appendChild(closeBtn);

    // Mensajes
    var msgsDiv = document.createElement('div');
    msgsDiv.id  = 'agme-msgs';

    // Input
    var inputWrap = document.createElement('div');
    inputWrap.id  = 'agme-input-wrap';

    var input = document.createElement('input');
    input.id          = 'agme-input';
    input.type        = 'text';
    input.placeholder = 'Escribe tu mensaje...';
    input.maxLength   = 500;

    var sendBtn = document.createElement('button');
    sendBtn.id  = 'agme-send';
    sendBtn.setAttribute('aria-label', 'Enviar');
    sendBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

    inputWrap.appendChild(input);
    inputWrap.appendChild(sendBtn);

    // Branding
    var branding = document.createElement('div');
    branding.id  = 'agme-branding';
    branding.innerHTML = 'Powered by <a href="https://bqinzagencia.com" target="_blank">BQinzagenc<span style="color:#FF6B00">IA</span></a>';

    panel.appendChild(header);
    panel.appendChild(msgsDiv);
    panel.appendChild(inputWrap);
    panel.appendChild(branding);

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // ── Eventos ──
    fab.addEventListener('click', function() { togglePanel(); });
    closeBtn.addEventListener('click', function() { closePanel(); });
    sendBtn.addEventListener('click', function() { sendMessage(); });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Mostrar saludo inicial despues de 800ms
    setTimeout(function() {
      addMessage('bot', cfg.saludo || 'Hola, en que puedo ayudarte?');
      // Mostrar opciones rapidas si hay servicios
      if (cfg.servicios && cfg.servicios.length > 0) {
        showOptions(cfg.servicios.slice(0, 4).map(function(s) {
          return s.nombre + (s.precio ? ' — $' + Number(s.precio).toLocaleString('es-CO') : '');
        }));
      }
      // Mostrar badge
      if (!isOpen) {
        badge.style.display = 'flex';
      }
    }, 800);
  }

  // ── 4. Funciones del chat ────────────────────────────────────────────────
  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    var panel = document.getElementById('agme-panel');
    var badge = document.getElementById('agme-badge');
    var fab   = document.getElementById('agme-fab');
    if (panel) panel.classList.add('open');
    if (badge) badge.style.display = 'none';
    if (fab)   fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
    scrollToBottom();
  }

  function closePanel() {
    isOpen = false;
    var panel = document.getElementById('agme-panel');
    var fab   = document.getElementById('agme-fab');
    if (panel) panel.classList.remove('open');
    if (fab)   fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  }

  function addMessage(role, text) {
    var msgsDiv = document.getElementById('agme-msgs');
    if (!msgsDiv) return;
    var div = document.createElement('div');
    div.className = 'agme-msg ' + role;
    div.textContent = text;
    messages.push({ role: role, text: text });
    msgsDiv.appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    var msgsDiv = document.getElementById('agme-msgs');
    if (!msgsDiv) return null;
    var div = document.createElement('div');
    div.className = 'agme-msg bot typing';
    div.id = 'agme-typing';
    div.innerHTML = '<span class="agme-dot" style="animation-delay:0s"></span><span class="agme-dot" style="animation-delay:0.2s"></span><span class="agme-dot" style="animation-delay:0.4s"></span>';
    msgsDiv.appendChild(div);
    scrollToBottom();
    return div;
  }

  function removeTyping() {
    var el = document.getElementById('agme-typing');
    if (el) el.remove();
  }

  function showOptions(opts) {
    var msgsDiv = document.getElementById('agme-msgs');
    if (!msgsDiv || !opts.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'agme-opts';
    opts.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className   = 'agme-opt';
      btn.textContent = opt;
      btn.addEventListener('click', function() {
        wrap.remove();
        sendText(opt);
      });
      wrap.appendChild(btn);
    });
    msgsDiv.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    var msgsDiv = document.getElementById('agme-msgs');
    if (msgsDiv) msgsDiv.scrollTop = msgsDiv.scrollHeight;
  }

  function sendMessage() {
    var input = document.getElementById('agme-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendText(text);
  }

  function sendText(text) {
    addMessage('user', text);
    var typing = showTyping();

    // Llamar al API del chatbot
    fetch(API_BASE + '/api/chatbot-responder', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chatbotId: chatbotId,
        sessionId: sessionId,
        texto:     text,
        historial: messages.slice(-10).map(function(m) {
          return { role: m.role === 'user' ? 'user' : 'assistant', content: m.text };
        }),
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      removeTyping();
      var respuesta = d.respuesta || 'Lo siento, no pude procesar tu mensaje.';
      addMessage('bot', respuesta);

      // Si hay opciones sugeridas
      if (d.opciones && d.opciones.length) {
        showOptions(d.opciones);
      }
    })
    .catch(function() {
      removeTyping();
      addMessage('bot', 'Hubo un problema de conexion. Intenta de nuevo en unos segundos.');
    });
  }

  // ── 5. Init ──────────────────────────────────────────────────────────────
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { loadConfig(buildUI); });
    } else {
      loadConfig(buildUI);
    }
  }

  init();

})();
