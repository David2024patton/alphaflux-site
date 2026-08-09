(function() {
  var OPEN_CLASS = 'fluxchat-open';
  var chatState = { open: false, step: 0, data: {} };
  var steps = [
    { q: "Hi! 👋 Welcome to AlphaFlux. I'm your AI growth assistant. What brings you here today?", opts: ["Growing my traffic & leads", "Understanding AI-powered marketing", "Checking pricing & services", "Just browsing"] },
    { q: "Great choice! What industry are you in?", opts: ["SaaS", "eCommerce", "B2B / Professional Services", "Home Services", "Healthcare", "Financial / Legal", "Other"] },
    { q: "What's your biggest marketing challenge right now?", opts: ["Not enough leads", "Leads but they don't convert", "Too much ad spend, low ROI", "Competitors are outranking us", "No clear marketing strategy"] },
    { q: "Last question: what's your monthly marketing budget?", opts: ["Under $1,000", "$1,000 - $5,000", "$5,000 - $15,000", "$15,000+", "Not sure yet"] }
  ];

  function init() {
    var container = document.getElementById('fluxchat-container');
    if (!container) return;
    container.innerHTML =
      '<button id="fluxchat-toggle" class="fluxchat-toggle" aria-label="Open chat">' +
        '<svg class="fluxchat-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
        '<svg class="fluxchat-close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
      '</button>' +
      '<div id="fluxchat-window" class="fluxchat-window">' +
        '<div class="fluxchat-header"><span>AlphaFlux Assistant</span></div>' +
        '<div id="fluxchat-body" class="fluxchat-body"></div>' +
        '<div id="fluxchat-footer" class="fluxchat-footer"></div>' +
      '</div>';
    var toggle = document.getElementById('fluxchat-toggle');
    var windowEl = document.getElementById('fluxchat-window');
    toggle.addEventListener('click', function() {
      chatState.open = !chatState.open;
      if (chatState.open) {
        document.body.classList.add(OPEN_CLASS);
        try { gtag('event', 'chat_opened'); } catch(e) {}
        if (chatState.step === 0) showStep(0);
      } else {
        document.body.classList.remove(OPEN_CLASS);
      }
    });
  }

  function showStep(i) {
    chatState.step = i;
    if (i >= steps.length) { showFinalCTA(); return; }
    var s = steps[i];
    var body = document.getElementById('fluxchat-body');
    var footer = document.getElementById('fluxchat-footer');
    var bubble = document.createElement('div');
    bubble.className = 'fluxchat-bubble';
    bubble.textContent = s.q;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
    var optsHtml = s.opts.map(function(o, idx) {
      return '<button class="fluxchat-opt" data-idx="' + idx + '">' + o + '</button>';
    }).join('');
    footer.innerHTML = '<div class="fluxchat-opts">' + optsHtml + '</div>';
    footer.querySelectorAll('.fluxchat-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var val = s.opts[parseInt(btn.getAttribute('data-idx'))];
        var userBubble = document.createElement('div');
        userBubble.className = 'fluxchat-bubble fluxchat-user';
        userBubble.textContent = val;
        body.appendChild(userBubble);
        body.scrollTop = body.scrollHeight;
        footer.innerHTML = '';
        setTimeout(function() { showStep(i + 1); }, 400);
      });
    });
  }

  function showFinalCTA() {
    var body = document.getElementById('fluxchat-body');
    var footer = document.getElementById('fluxchat-footer');
    var bubble = document.createElement('div');
    bubble.className = 'fluxchat-bubble';
    bubble.innerHTML = 'Thanks! Based on what you shared, a <strong>Free AI Visibility Audit</strong> is the perfect next step. Our strategists will analyze your digital presence and show you exactly where the growth opportunities are. Ready?';
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
    footer.innerHTML = '<a href="/contact/" class="fluxchat-cta">Get Free AI Visibility Audit →</a>';
    try { gtag('event', 'chat_lead_captured'); } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
