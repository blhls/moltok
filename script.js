/* ============================================================
   MOULTLOOK v3.0 — script.js
   One state machine, one column, fewer moving parts.
   ============================================================ */
'use strict';

/* ── State ──────────────────────────────────────────────── */
let lang     = 'en';       // 'en' | 'fr'
let view     = 'feed';     // 'home' | 'feed' | 'article' | 'shell'
let category = 'all';      // 'all' | demiurge key
let query    = '';
let articleId = null;
let moltokOpen = false, moltokGreeted = false;

const signOf = {
  patriarchy:  'm_patsign.png',
  imperialism: 'm_impsign.png',
  capitalism:  'm_capisign.png',
  notes:       'm_selfsign.png',
};

const catLabel = k => (demiurges[k] ? demiurges[k].label[lang] : k);

/* ── Landing / loading ──────────────────────────────────── */
function openSelect() {
  document.getElementById('landing-trigger').hidden = true;
  document.getElementById('landing-select').hidden  = false;
}

function enter(l) {
  lang = l;
  document.body.classList.toggle('mode-fr', l === 'fr');
  show('screen-landing', false);
  show('screen-loading', true);
  runLoading(() => {
    show('screen-loading', false);
    document.body.classList.add('in-app');
    show('screen-app', true);
    view = 'feed'; category = 'all'; query = ''; articleId = null;
    syncChrome(); render();
  });
}

function runLoading(done) {
  const fill  = document.getElementById('loading-fill');
  const sub   = document.getElementById('loading-sub');
  const title = document.getElementById('loading-title');
  const isFr  = lang === 'fr';
  title.textContent = isFr ? 'DURCISSEMENT…' : 'HARDENING…';
  const steps = isFr
    ? [[30,'scan coquille…'],[65,'chargement des démiurges…'],[100,'prêt.']]
    : [[30,'scanning shell…'],[65,'loading demiurges…'],[100,'ready.']];
  fill.style.width = '0%';
  let i = 0;
  (function step() {
    if (i >= steps.length) { setTimeout(done, 350); return; }
    fill.style.width = steps[i][0] + '%';
    sub.textContent  = steps[i][1];
    i++; setTimeout(step, 520);
  })();
}

function show(id, on) {
  const el = document.getElementById(id);
  if (el) el.hidden = !on;
}

/* ── Chrome sync (header, rail, ticker) ─────────────────── */
function syncChrome() {
  const isFr = lang === 'fr';
  document.getElementById('wordmark-sub').textContent = isFr ? 'GASCOGNE OCCUPÉE' : 'INTERNATIONAL';
  document.getElementById('rail-home-label').textContent  = isFr ? 'ANEMOSTAU' : 'ANEMHOME';
  document.getElementById('rail-feed-label').textContent  = isFr ? 'CRABE*' : 'CRABS*';
  document.getElementById('rail-shell-label').textContent = isFr ? 'TA COQUILLE' : 'YOUR SHELL';
  document.getElementById('lang-btn-icon').src   = isFr ? 'm_world.png' : 'm_francogasconha.png';
  document.getElementById('lang-btn-label').textContent = isFr ? 'INT' : 'FR';
  const t = (bannerContent[lang] || '').repeat(2).replace(/★/g, '<span class="tk">★</span>');
  document.getElementById('ticker-track').innerHTML = t;
  ['home','feed','shell'].forEach(k => {
    document.getElementById('rail-' + k).classList.toggle('active',
      view === k || (k === 'feed' && view === 'article'));
  });
}

/* ── Router ─────────────────────────────────────────────── */
function go(v) {
  view = v;
  if (v !== 'article') articleId = null;
  syncChrome(); render();
  document.getElementById('main').focus({ preventScroll: false });
  window.scrollTo({ top: 0 });
}

function openArticle(id) {
  articleId = id; view = 'article';
  syncChrome(); render();
  window.scrollTo({ top: 0 });
}

function setCategory(c) { category = c; render(); }
function setQuery(q)    { query = q.toLowerCase(); renderFeedList(); }

/* ── Render ─────────────────────────────────────────────── */
function render() {
  const main = document.getElementById('main');
  if (view === 'home')    { main.innerHTML = tplHome();    return; }
  if (view === 'shell')   { main.innerHTML = tplShell();   return; }
  if (view === 'article') { main.innerHTML = tplArticle(); return; }
  main.innerHTML = tplFeed();
  renderFeedList();
}

function tplHome() {
  const isFr = lang === 'fr';
  return `<section class="xp-window">
    <div class="xp-titlebar">
      <img src="m_anemhome.png" alt="" class="xp-titlebar-icon">
      <span class="xp-titlebar-text">${isFr ? 'ANEMOSTAU' : 'ANEMHOME'}</span>
    </div>
    <div class="panel-body">
      <div class="home-hero"><img src="m_anemhome.png" alt="" class="icon-tint"></div>
      <h2>${isFr ? 'BENVENGUTS' : 'WELCOME'}</h2>
      <p>${homeContent[lang]}</p>
      <hr class="panel-divider">
      <p class="fine">${isFr
        ? 'moultlook est un client mail fictif. les démiurges écrivent, nous répondons. commencez par CRABE*.'
        : 'moultlook is a fictional mail client. the demiurges write, we reply. start with CRABS*.'}</p>
    </div>
  </section>`;
}

function tplShell() {
  return `<section class="xp-window">
    <div class="xp-titlebar">
      <img src="m_shell.png" alt="" class="xp-titlebar-icon">
      <span class="xp-titlebar-text">${lang === 'fr' ? 'TA COQUILLE — CONDITIONS' : 'YOUR SHELL — TERMS'}</span>
    </div>
    <div class="panel-body">${shellContent[lang]}</div>
  </section>`;
}

function tplFeed() {
  const isFr = lang === 'fr';
  const chips = ['all', ...Object.keys(demiurges)].map(k => {
    const active = category === k ? ' active' : '';
    const icon = k === 'all' ? '' : `<img src="${signOf[k]}" alt="">`;
    const label = k === 'all' ? (isFr ? 'tout' : 'all') : catLabel(k);
    return `<button class="chip${active}" onclick="setCategory('${k}')">${icon}${label}</button>`;
  }).join('');
  return `
    <div class="feed-controls">
      <div class="feed-search">
        <label class="visually-hidden" for="feed-q">${isFr ? 'Rechercher' : 'Search'}</label>
        <input id="feed-q" type="search" placeholder="${isFr ? 'rechercher dans le carapace…' : 'search the carapace…'}"
               value="${query}" oninput="setQuery(this.value)">
        <span class="search-glyph"><img src="m_search.png" alt=""></span>
      </div>
      <div class="chips" role="group" aria-label="${isFr ? 'Filtrer par démiurge' : 'Filter by demiurge'}">${chips}</div>
    </div>
    <div id="feed-list" class="feed-list" style="display:flex; flex-direction:column; gap:18px;"></div>`;
}

function renderFeedList() {
  const box = document.getElementById('feed-list');
  if (!box) return;
  let pool = articles
    .filter(a => a.lang === lang)
    .filter(a => category === 'all' || a.category === category)
    .filter(a => !query
      || a.title.toLowerCase().includes(query)
      || a.body.toLowerCase().includes(query)
      || a.from.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!pool.length) {
    box.innerHTML = `<div class="xp-window"><div class="feed-empty">${lang === 'fr' ? '— calme plat —' : '— quiet here —'}</div></div>`;
    return;
  }
  box.innerHTML = pool.map(a => `
    <button class="xp-window card" onclick="openArticle(${a.id})">
      <span class="xp-titlebar">
        <img src="${signOf[a.category] || 'm_unknown.png'}" alt="" class="xp-titlebar-icon">
        <span class="xp-titlebar-text">${a.from}</span>
      </span>
      <span class="card-body">
        <span class="card-text">
          <span class="card-title">${a.title}</span>
          <span class="card-snippet">${a.body.replace(/<[^>]+>/g,'').slice(0, 110)}…</span>
          <span class="card-meta">
            <span class="m-ink">${catLabel(a.category)}</span>
            <span>${a.date}</span>
          </span>
        </span>
      </span>
    </button>`).join('');
}

function tplArticle() {
  const a = articles.find(x => x.id === articleId);
  if (!a) { view = 'feed'; return tplFeed(); }
  const isFr = lang === 'fr';
  const pdf = a.pdf
    ? `<div class="article-pdf">📎 <a href="${a.pdf}" target="_blank" rel="noopener">${isFr ? 'ouvrir la pièce jointe' : 'open attachment'}</a></div>`
    : '';
  const paragraphs = a.body.split('\n\n').map(p => `<p>${p}</p>`).join('');
  return `
    <button class="back-btn" onclick="go('feed')">← ${isFr ? 'retour' : 'back'}</button>
    <article class="xp-window article">
      <div class="xp-titlebar">
        <img src="${signOf[a.category] || 'm_unknown.png'}" alt="" class="xp-titlebar-icon">
        <span class="xp-titlebar-text">${a.from}</span>
      </div>
      <div class="article-body-wrap">
        <header class="article-head">
          <div class="article-cat"><img src="${signOf[a.category]}" alt="">${catLabel(a.category)}</div>
          <h1 class="article-title">${a.title}</h1>
          <div class="article-date">${a.date}</div>
        </header>
        <div class="article-body">${paragraphs}</div>
        ${pdf}
      </div>
    </article>`;
}

/* ── Popups ─────────────────────────────────────────────── */
function openMoultPopup()  {
  document.getElementById('moult-popup-text').textContent = lang === 'fr'
    ? 'Quitter la carapace et revenir à l\u2019écran d\u2019accueil ?'
    : 'Shed your shell and return to the landing screen?';
  show('moult-popup', true);
}
function closeMoultPopup() { show('moult-popup', false); }
function confirmMoult() {
  closeMoultPopup();
  moltokOpen = false; moltokGreeted = false;
  const mp = document.getElementById('moltok-panel');
  if (mp) mp.hidden = true;
  document.getElementById('moltok-anchor').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('in-app');
  show('screen-app', false);
  document.getElementById('landing-trigger').hidden = false;
  document.getElementById('landing-select').hidden  = true;
  show('screen-landing', true);
  window.scrollTo({ top: 0 });
}

function openLangPopup()  { show('lang-popup', true); }
function closeLangPopup() { show('lang-popup', false); }
function confirmLang(l) {
  closeLangPopup();
  if (l === lang) return;
  lang = l;
  document.body.classList.toggle('mode-fr', l === 'fr');
  show('screen-app', false);
  show('screen-loading', true);
  runLoading(() => {
    show('screen-loading', false);
    show('screen-app', true);
    view = 'feed'; category = 'all'; query = ''; articleId = null;
    moltokGreeted = false;
    syncChrome(); render();
  });
}

/* ── Moltok ─────────────────────────────────────────────── */
const blPresets = [
  'blblblbllbbb :)', 'bll…blbllb.', 'blbl bl blblb~', 'blblblblblbl !!',
  'b…bl…blblb.', 'BLBLBLBLBL :)', 'bl bl. blblbl…', 'bllbllbllbll~',
  'blb. blb. bl. :)', 'blblblblbl ??', 'bl… bl… :3',
];

function blblbl(input) {
  const low = (input || '').toLowerCase();
  if (['koolkrab', 'kool krab', 'krab'].some(k => low.includes(k))) return { gif: true };
  if (Math.random() < 0.2) return { gif: true };
  if (Math.random() < 0.45) return { text: blPresets[Math.floor(Math.random() * blPresets.length)] };
  const parts = ['bl','blb','bll','lb','blbl','bllb','lbl','b'];
  const ends  = [' :)', '.', '…', '~', ' !!', '', ' ?', ' :3'];
  let s = '';
  for (let i = 0, n = 2 + Math.floor(Math.random() * 6); i < n; i++) s += parts[Math.floor(Math.random() * parts.length)];
  return { text: s + ends[Math.floor(Math.random() * ends.length)] };
}

function toggleMoltok() {
  moltokOpen = !moltokOpen;
  const panel  = document.getElementById('moltok-panel');
  const anchor = document.getElementById('moltok-anchor');
  panel.hidden = !moltokOpen;
  anchor.setAttribute('aria-expanded', String(moltokOpen));
  if (moltokOpen) {
    if (!moltokGreeted) {
      moltokGreeted = true;
      setTimeout(() => pushMoltok({ text: 'blblbl :)' }), 420);
    }
    setTimeout(() => document.getElementById('moltok-input').focus(), 80);
  }
}

function moltokRespond() {
  const inp = document.getElementById('moltok-input');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  const msgs = document.getElementById('moltok-messages');
  const u = document.createElement('div');
  u.className = 'moltok-msg user'; u.textContent = txt;
  msgs.appendChild(u);
  const typing = document.createElement('div');
  typing.className = 'moltok-msg bot moltok-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    typing.remove();
    pushMoltok(blblbl(txt));
  }, 650 + Math.random() * 900);
}

function pushMoltok(r) {
  const msgs = document.getElementById('moltok-messages');
  const d = document.createElement('div');
  if (r.gif) {
    d.className = 'moltok-msg bot gif';
    const img = document.createElement('img');
    img.src = 'koolkrab.gif'; img.alt = 'kool krab';
    d.appendChild(img);
  } else {
    d.className = 'moltok-msg bot';
    d.textContent = r.text;
  }
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}
