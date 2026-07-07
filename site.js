/* ============================================================
   MOULTLOOK v3.1 — site.js (shared)
   Moltok · rail clock · feed search · demiurge flip cards.
   No state to lose: every page is its own page.
   ============================================================ */
'use strict';

var IS_FR = document.documentElement.lang === 'fr';

/* ── Rail clock ─────────────────────────────────────────── */
(function clock() {
  var el = document.getElementById('rail-clock');
  if (!el) return;
  function tick() {
    var n = new Date();
    var p = function (x) { return String(x).padStart(2, '0'); };
    el.textContent = p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
  }
  tick(); setInterval(tick, 1000);
})();

/* ── Feed search: filters the cards already on the page ─── */
function feedFilter(q) {
  q = q.toLowerCase();
  var cards = document.querySelectorAll('.feed-grid .card');
  var any = false;
  cards.forEach(function (c) {
    var hit = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
    c.hidden = !hit;
    if (hit) any = true;
  });
  var empty = document.getElementById('feed-empty');
  if (empty) empty.hidden = any;
}

/* ── Demiurge flip cards (WinXP solitaire salute) ───────── */
function flipDemi(btn) {
  var card = btn.closest('.demi-card');
  if (card) card.classList.toggle('flipped');
}

/* ── Moltok ─────────────────────────────────────────────── */
var moltokOpen = false, moltokGreeted = false;
var blPresets = [
  'blblblbllbbb :)', 'bll\u2026blbllb.', 'blbl bl blblb~', 'blblblblblbl !!',
  'b\u2026bl\u2026blblb.', 'BLBLBLBLBL :)', 'bl bl. blblbl\u2026', 'bllbllbllbll~',
  'blb. blb. bl. :)', 'blblblblbl ??', 'bl\u2026 bl\u2026 :3'
];

function blblbl(input) {
  var low = (input || '').toLowerCase();
  if (['koolkrab', 'kool krab', 'krab'].some(function (k) { return low.indexOf(k) !== -1; })) return { gif: true };
  if (Math.random() < 0.2) return { gif: true };
  if (Math.random() < 0.45) return { text: blPresets[Math.floor(Math.random() * blPresets.length)] };
  var parts = ['bl', 'blb', 'bll', 'lb', 'blbl', 'bllb', 'lbl', 'b'];
  var ends = [' :)', '.', '\u2026', '~', ' !!', '', ' ?', ' :3'];
  var s = '';
  for (var i = 0, n = 2 + Math.floor(Math.random() * 6); i < n; i++) s += parts[Math.floor(Math.random() * parts.length)];
  return { text: s + ends[Math.floor(Math.random() * ends.length)] };
}

function toggleMoltok() {
  moltokOpen = !moltokOpen;
  var panel = document.getElementById('moltok-panel');
  var anchor = document.getElementById('moltok-anchor');
  if (!panel || !anchor) return;
  panel.hidden = !moltokOpen;
  anchor.setAttribute('aria-expanded', String(moltokOpen));
  if (moltokOpen) {
    if (!moltokGreeted) {
      moltokGreeted = true;
      setTimeout(function () { pushMoltok({ text: 'blblbl :)' }); }, 420);
    }
    setTimeout(function () {
      var i = document.getElementById('moltok-input');
      if (i) i.focus();
    }, 80);
  }
}

function moltokRespond() {
  var inp = document.getElementById('moltok-input');
  if (!inp) return;
  var txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  var msgs = document.getElementById('moltok-messages');
  var u = document.createElement('div');
  u.className = 'moltok-msg user'; u.textContent = txt;
  msgs.appendChild(u);
  var typing = document.createElement('div');
  typing.className = 'moltok-msg bot moltok-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(function () {
    typing.remove();
    pushMoltok(blblbl(txt));
  }, 650 + Math.random() * 900);
}

function pushMoltok(r) {
  var msgs = document.getElementById('moltok-messages');
  var d = document.createElement('div');
  if (r.gif) {
    d.className = 'moltok-msg bot gif';
    var img = document.createElement('img');
    img.src = document.body.dataset.root + 'koolkrab.gif';
    img.alt = 'kool krab';
    d.appendChild(img);
  } else {
    d.className = 'moltok-msg bot';
    d.textContent = r.text;
  }
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}
