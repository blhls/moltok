/* ============================================================
   MOULTLOOK v3.2 — site.js (shared)
   Moltok reveal · rail clock · feed search · demiurge flip ·
   moult confirm · transmission popup · ulbrine / biabop.
   No state to lose across pages: chat memory lives for the
   current page load only, exactly as intended.
   ============================================================ */
'use strict';

/* ── Small helpers ──────────────────────────────────────── */
var ROOT = (document.body && document.body.dataset && document.body.dataset.root) || '';
var IS_FR = document.documentElement.lang === 'fr' ||
            (document.body && document.body.classList.contains('theme-fr'));
function asset(name) { return ROOT + name; }
function t(en, fr) { return IS_FR ? fr : en; }

/* Try a list of sources in order; run finalCb() if all fail. */
function srcChain(img, names, finalCb) {
  var i = 0;
  img.onerror = function () {
    i++;
    if (i < names.length) { img.src = asset(names[i]); }
    else { img.onerror = null; if (finalCb) finalCb(); }
  };
  img.src = asset(names[0]);
}

/* Play a one-shot "fine glitch" animation on an element, then
   run done(). dir = 'out' (visible -> gone) or 'in' (gone -> visible). */
function fineGlitch(el, dir, done) {
  if (!el) { if (done) done(); return; }
  var cls = dir === 'in' ? 'fine-glitch-in' : 'fine-glitch-out';
  el.classList.remove('fine-glitch-in', 'fine-glitch-out');
  void el.offsetWidth;                 // restart the animation
  if (dir === 'in') { el.hidden = false; el.style.visibility = 'visible'; }
  el.classList.add(cls);
  var end = function (e) {
    if (e && e.target !== el) return;   // ignore bubbling child animations
    el.removeEventListener('animationend', end);
    el.classList.remove(cls);
    if (dir === 'out') { el.style.visibility = 'hidden'; }
    if (done) done();
  };
  el.addEventListener('animationend', end);
}

/* ── Rail clock (hh:mm:ss) ──────────────────────────────── */
(function clock() {
  var el = document.getElementById('rail-clock');
  if (!el) return;
  function tick() {
    var n = new Date(), p = function (x) { return String(x).padStart(2, '0'); };
    el.textContent = p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
  }
  tick(); setInterval(tick, 1000);
})();

/* ── Header wordmark -> GIF header (keeps the subtitle) ──── */
(function headerGif() {
  var mark = document.querySelector('.app-header .wordmark-link .wordmark');
  if (!mark) return;
  var names = IS_FR
    ? ['moultlook_header_gasc_redux.gif', 'moultlook_header_gasc.gif']
    : ['moultlook_header_int_redux.gif', 'moultlook_header_int.gif'];
  var img = document.createElement('img');
  img.className = 'wordmark-gif';
  img.alt = 'MOULTLOOK';
  mark.parentNode.replaceChild(img, mark);
  srcChain(img, names, function () {    // no gif in repo -> keep the text
    if (img.parentNode) img.parentNode.replaceChild(mark, img);
  });
})();

/* ── Feed search: filters the cards already on the page ─── */
function feedFilter(q) {
  q = q.toLowerCase();
  var cards = document.querySelectorAll('.feed-grid .card'), any = false;
  cards.forEach(function (c) {
    var hit = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
    c.hidden = !hit; if (hit) any = true;
  });
  var empty = document.getElementById('feed-empty');
  if (empty) empty.hidden = any;
}

/* ── Demiurge flip cards ────────────────────────────────── */
function flipDemi(btn)     { var c = btn.closest('.demi-card'); if (c) c.classList.add('flipped'); }
function flipDemiBack(btn) { var c = btn.closest('.demi-card'); if (c) c.classList.remove('flipped'); }

/* ── Moult confirmation ─────────────────────────────────── */
function openMoultConfirm()  { var p = document.getElementById('moult-popup'); if (p) p.hidden = false; }
function closeMoultConfirm() { var p = document.getElementById('moult-popup'); if (p) p.hidden = true; }
function confirmMoultOutside(e) { if (e.target.id === 'moult-popup') closeMoultConfirm(); }
function confirmMoult() { window.location.href = (document.body.dataset.root || '') + 'index.html'; }

/* ============================================================
   MOLTOK  —  anemone -> reveal -> vibrate -> chatbox
   States: 'anemone' | 'moltok' | 'chat'
   ============================================================ */
var moltokState = 'anemone';
var moltokHistory = [];        // remembered for this page load only
var moltokGreeted = false;

(function buildMoltok() {
  var wrap  = document.querySelector('.moltok');
  var anchor = document.getElementById('moltok-anchor');
  var panel = document.getElementById('moltok-panel');
  if (!wrap || !anchor || !panel) return;

  /* Build the stage: anemone gif on top, moltok sprite behind it. */
  var stage = document.createElement('div');
  stage.className = 'anemone-stage';
  stage.id = 'anemone-stage';

  var behind = document.createElement('img');
  behind.className = 'moltok-behind';
  behind.id = 'moltok-behind';
  behind.alt = 'Moltok';
  behind.src = asset('m_moltok_small.png');
  behind.onerror = function () { behind.onerror = null; behind.src = asset('m_moltok.png'); };

  var anemBtn = document.createElement('button');
  anemBtn.className = 'anemone-btn';
  anemBtn.id = 'anemone-btn';
  anemBtn.setAttribute('aria-label', t('Reveal Moltok', 'Révéler Moltok'));

  var anem = document.createElement('img');
  anem.className = 'anemone-gif';
  anem.id = 'anemone-gif';
  anem.alt = '';
  srcChain(anem, ['anemone_animated_redux.gif', 'anemone_animated.gif', 'm_anemona_detailed.png']);
  anemBtn.appendChild(anem);

  stage.appendChild(behind);
  stage.appendChild(anemBtn);

  /* Replace the old anchor with the stage; keep the panel as chatbox. */
  wrap.replaceChild(stage, anchor);
  panel.hidden = true;

  /* Hover on the anemone = yellow glow (see style.css). */

  /* Click anemone -> vanish in fine glitches, reveal moltok. */
  anemBtn.addEventListener('click', function () {
    if (moltokState !== 'anemone') return;
    fineGlitch(anemBtn, 'out', function () {
      anemBtn.hidden = true;
      moltokState = 'moltok';
      behind.classList.add('revealed');
    });
  });

  /* Click the revealed moltok -> vibrate, disappear, chatbox appears. */
  behind.style.cursor = 'pointer';
  behind.addEventListener('click', function () {
    if (moltokState !== 'moltok') return;
    behind.classList.add('vibrate');
    setTimeout(function () {
      behind.classList.remove('vibrate');
      fineGlitch(behind, 'out', function () {
        behind.hidden = true;
        openChatbox();
      });
    }, 620);
  });

  /* Wire the chatbox close button to the glitch-back sequence. */
  var closeBtn = panel.querySelector('.xp-close');
  if (closeBtn) { closeBtn.removeAttribute('onclick'); closeBtn.addEventListener('click', closeChatbox); }
  var sendBtn = panel.querySelector('.moltok-send');
  if (sendBtn) { sendBtn.removeAttribute('onclick'); sendBtn.addEventListener('click', moltokRespond); }
  var input = panel.querySelector('.moltok-input');
  if (input) {
    input.removeAttribute('onkeydown');
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') moltokRespond(); });
  }
})();

function openChatbox() {
  var panel = document.getElementById('moltok-panel');
  if (!panel) return;
  moltokState = 'chat';
  var stage = document.getElementById('anemone-stage');
  if (stage) stage.hidden = true;       // no empty gap above the chatbox
  panel.hidden = false;
  panel.classList.remove('fine-glitch-out');
  fineGlitch(panel, 'in');
  renderMoltokHistory();
  if (!moltokGreeted && moltokHistory.length === 0) {
    moltokGreeted = true;
    setTimeout(function () { pushMoltok({ text: 'blblbl :)' }); }, 420);
  }
  setTimeout(function () { var i = document.getElementById('moltok-input'); if (i) i.focus(); }, 90);
}

/* Close -> chatbox glitches out, anemone + moltok reappear.
   History is kept; reopening replays the whole sequence. */
function closeChatbox() {
  var panel  = document.getElementById('moltok-panel');
  var anemBtn = document.getElementById('anemone-btn');
  var behind = document.getElementById('moltok-behind');
  if (!panel) return;
  fineGlitch(panel, 'out', function () {
    panel.hidden = true;
    var stage = document.getElementById('anemone-stage');
    if (stage) stage.hidden = false;    // bring the stage back before reappearing
    if (behind) { behind.hidden = false; behind.classList.remove('revealed'); }
    if (anemBtn) {
      anemBtn.hidden = false; anemBtn.style.visibility = 'hidden';
      fineGlitch(anemBtn, 'in', function () { moltokState = 'anemone'; });
    } else { moltokState = 'anemone'; }
  });
}

function renderMoltokHistory() {
  var msgs = document.getElementById('moltok-messages');
  if (!msgs) return;
  msgs.innerHTML = '';
  moltokHistory.forEach(function (m) { appendMoltokNode(m, msgs); });
  msgs.scrollTop = msgs.scrollHeight;
}

function appendMoltokNode(m, msgs) {
  var d = document.createElement('div');
  if (m.gif) {
    d.className = 'moltok-msg bot gif';
    var img = document.createElement('img');
    img.src = asset('koolkrab.gif'); img.alt = 'kool krab';
    d.appendChild(img);
  } else {
    d.className = 'moltok-msg ' + (m.who === 'user' ? 'user' : 'bot');
    d.textContent = m.text;
  }
  msgs.appendChild(d);
}

/* Moltok's blblbl language */
var blPresets = [
  'blblblbllbbb :)', 'bll…blbllb.', 'blbl bl blblb~', 'blblblblblbl !!',
  'b…bl…blblb.', 'BLBLBLBLBL :)', 'bl bl. blblbl…', 'bllbllbllbll~',
  'blb. blb. bl. :)', 'blblblblbl ??', 'bl… bl… :3'
];
function blblbl(input) {
  var low = (input || '').toLowerCase();
  if (['koolkrab', 'kool krab', 'krab'].some(function (k) { return low.indexOf(k) !== -1; })) return { gif: true };
  if (Math.random() < 0.2) return { gif: true };
  if (Math.random() < 0.45) return { text: blPresets[Math.floor(Math.random() * blPresets.length)] };
  var parts = ['bl', 'blb', 'bll', 'lb', 'blbl', 'bllb', 'lbl', 'b'];
  var ends = [' :)', '.', '…', '~', ' !!', '', ' ?', ' :3'];
  var s = '';
  for (var i = 0, n = 2 + Math.floor(Math.random() * 6); i < n; i++) s += parts[Math.floor(Math.random() * parts.length)];
  return { text: s + ends[Math.floor(Math.random() * ends.length)] };
}

function moltokRespond() {
  var inp = document.getElementById('moltok-input');
  if (!inp) return;
  var txt = inp.value.trim(); if (!txt) return;
  inp.value = '';
  var msgs = document.getElementById('moltok-messages');
  var um = { who: 'user', text: txt };
  moltokHistory.push(um); appendMoltokNode(um, msgs);
  var typing = document.createElement('div');
  typing.className = 'moltok-msg bot moltok-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
  setTimeout(function () { typing.remove(); pushMoltok(blblbl(txt)); }, 650 + Math.random() * 900);
}

function pushMoltok(r) {
  var msgs = document.getElementById('moltok-messages');
  var m = r.gif ? { gif: true } : { who: 'bot', text: r.text };
  moltokHistory.push(m);
  appendMoltokNode(m, msgs);
  msgs.scrollTop = msgs.scrollHeight;
}

/* Legacy inline handler kept alive (anchor/close used to call this). */
function toggleMoltok() {
  if (moltokState === 'chat') closeChatbox();
}

/* ============================================================
   TRANSMISSION  —  movable / closable popup: bird.gif + ms clock
   Opening it glitches the rest of the page away; closing restores.
   ============================================================ */
var transmissionEls = null;
function pageChrome() {
  return Array.prototype.slice.call(
    document.querySelectorAll('.app-header, .app-body, .moltok, #ulbrine-wrap'));
}

function buildTransmission() {
  if (document.getElementById('tx-popup')) return;
  var pop = document.createElement('div');
  pop.className = 'xp-window tx-popup';
  pop.id = 'tx-popup';
  pop.hidden = true;
  pop.innerHTML =
    '<div class="xp-titlebar tx-drag" id="tx-drag">' +
      '<img src="' + asset('m_crabsign_detailed.png') + '" alt="" class="xp-titlebar-icon">' +
      '<span class="xp-titlebar-text">' + t('TRANSMISSION', 'ÉMISSION') + '</span>' +
      '<button class="xp-close" id="tx-close" aria-label="' + t('Close', 'Fermer') + '">×</button>' +
    '</div>' +
    '<div class="tx-body">' +
      '<div class="tx-screen">' +
        '<img class="tx-bird" src="' + asset('bird.gif') + '" alt="" ' +
             'onerror="this.onerror=null;this.src=\'' + asset('birt.gif') + '\'">' +
        '<div class="tx-noise" aria-hidden="true"></div>' +
        '<div class="tx-scan" aria-hidden="true"></div>' +
        '<div class="tx-fisheye" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="tx-clock" id="tx-clock">00:00:00:000</div>' +
    '</div>';
  document.body.appendChild(pop);
  document.getElementById('tx-close').addEventListener('click', closeTransmission);
  makeDraggable(pop, document.getElementById('tx-drag'));
  return pop;
}

var txClockTimer = null;
function toggleTransmission(btn) {
  var pop = document.getElementById('tx-popup') || buildTransmission();
  if (pop.hidden) openTransmission(pop); else closeTransmission();
}
function openTransmission(pop) {
  pop = pop || document.getElementById('tx-popup') || buildTransmission();
  transmissionEls = pageChrome();
  transmissionEls.forEach(function (el) {
    fineGlitch(el, 'out', function () { el.classList.add('tv-gone'); });
  });
  pop.hidden = false; pop.style.visibility = 'visible';
  fineGlitch(pop, 'in');
  var el = document.getElementById('tx-clock');
  function tick() {
    var n = new Date(), p = function (x, w) { return String(x).padStart(w || 2, '0'); };
    el.textContent = p(n.getHours()) + ':' + p(n.getMinutes()) + ':' +
                     p(n.getSeconds()) + ':' + p(n.getMilliseconds(), 3);
  }
  tick(); txClockTimer = setInterval(tick, 33);
}
function closeTransmission() {
  var pop = document.getElementById('tx-popup');
  if (txClockTimer) { clearInterval(txClockTimer); txClockTimer = null; }
  if (pop) fineGlitch(pop, 'out', function () { pop.hidden = true; });
  (transmissionEls || pageChrome()).forEach(function (el) {
    el.classList.remove('tv-gone');
    fineGlitch(el, 'in');
  });
  transmissionEls = null;
}

/* ============================================================
   ULBRINE  —  permanent slow-intense glitch at page end.
   Click -> a CRT/VHS window powers on with the biabop banner.
   Banner -> berylism.org. Rest of the page blurs and darkens.
   ============================================================ */
(function buildUlbrine() {
  var host = document.querySelector('.app-body');
  if (!host) return;                          // not on the landing screen

  var wrap = document.createElement('div');
  wrap.className = 'ulbrine-wrap';
  wrap.id = 'ulbrine-wrap';

  var btn = document.createElement('button');
  btn.className = 'ulbrine glitch-perm';
  btn.id = 'ulbrine';
  btn.setAttribute('aria-label', t('Open the biabop transmission', 'Ouvrir la transmission biabop'));

  var img = document.createElement('img');
  img.className = 'ulbrine-img';
  img.alt = 'ulbrine';
  img.src = asset('m_ulbrine.png');
  img.onerror = function () {                  // no sprite in repo -> draw one
    img.onerror = null;
    btn.removeChild(img);
    btn.insertAdjacentHTML('afterbegin',
      '<svg class="ulbrine-img" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<polygon points="42,2 78,2 60,40" fill="currentColor"/>' +
      '<polygon points="2,26 40,44 26,64" fill="currentColor"/>' +
      '<polygon points="118,26 80,44 94,64" fill="currentColor"/>' +
      '<polygon points="52,30 68,30 60,130" fill="currentColor"/></svg>');
  };
  btn.appendChild(img);

  /* glitch layers use the image as their content via data-driven ::before/::after */
  btn.addEventListener('click', openBiabop);
  wrap.appendChild(btn);
  host.parentNode.insertBefore(wrap, host.nextSibling);
})();

function buildBiabop() {
  if (document.getElementById('biabop-overlay')) return document.getElementById('biabop-overlay');
  var ov = document.createElement('div');
  ov.className = 'biabop-overlay';
  ov.id = 'biabop-overlay';
  ov.hidden = true;
  ov.innerHTML =
    '<div class="xp-window biabop-win crt" id="biabop-win">' +
      '<div class="xp-titlebar">' +
        '<span class="xp-titlebar-text">biabop.exe</span>' +
        '<button class="xp-close" id="biabop-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="biabop-screen">' +
        '<a class="biabop-link" href="https://www.berylism.org" target="_blank" rel="noopener">' +
          '<img class="biabop-banner" src="' + asset('biabop_banner_animated_redux.gif') + '" ' +
               'alt="berylism.org" data-alt="' + asset('biabop_banner_animated.gif') + '" ' +
               'onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.removeAttribute(\'data-alt\');}else{this.classList.add(\'missing\');this.alt=\'berylism.org →\';}">' +
        '</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);
  document.getElementById('biabop-close').addEventListener('click', closeBiabop);
  ov.addEventListener('click', function (e) { if (e.target === ov) closeBiabop(); });
  return ov;
}
function openBiabop() {
  var ov = buildBiabop();
  document.body.classList.add('biabop-blur');
  ov.hidden = false;
  var win = document.getElementById('biabop-win');
  win.classList.remove('crt-on'); void win.offsetWidth; win.classList.add('crt-on');
}
function closeBiabop() {
  var ov = document.getElementById('biabop-overlay');
  document.body.classList.remove('biabop-blur');
  if (ov) ov.hidden = true;
}

/* ============================================================
   Draggable windows (pointer based, titlebar as handle)
   ============================================================ */
function makeDraggable(win, handle) {
  if (!win || !handle) return;
  var sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
  handle.style.touchAction = 'none';
  handle.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.xp-close')) return;
    dragging = true;
    var r = win.getBoundingClientRect();
    win.style.left = r.left + 'px'; win.style.top = r.top + 'px';
    win.style.right = 'auto'; win.style.bottom = 'auto';
    win.style.transform = 'none'; win.classList.add('dragging');
    sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    win.style.left = (ox + e.clientX - sx) + 'px';
    win.style.top  = (oy + e.clientY - sy) + 'px';
  });
  handle.addEventListener('pointerup', function (e) {
    dragging = false; win.classList.remove('dragging');
    try { handle.releasePointerCapture(e.pointerId); } catch (x) {}
  });
}
