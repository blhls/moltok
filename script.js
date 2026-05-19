/* ============================================================
   MOULTLOOK v2.0 — script.js
   ============================================================ */
'use strict';

/* ── State ─────────────────────────────────────────────────── */
let currentLang        = 'en';
let currentSection     = 'home';
let currentCategory    = null;
let selectedEmailId    = null;
let consoleMinimized   = false;
let sidePanelOpen      = false;
let moltokOpen         = false;
let moltokGreeted      = false;
let middleRowVisible   = true;

/* ══════════════════════════════════════════════════════════
   HOLOGRAPHIC CANVAS — subtle, title-glitch only, no full-window
   ══════════════════════════════════════════════════════════ */
const canvasRegistry = {};

function initBgCanvas(id, mode, glitchMode) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (canvasRegistry[id]) cancelAnimationFrame(canvasRegistry[id].animId);

  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  // How frequently a glitch flash happens (in frames)
  const baseInterval = glitchMode === 'intense' ? 80 : glitchMode === 'login' ? 900 : 3600;
  let countdown = baseInterval + Math.random() * baseInterval;
  let holoActive = false, holoFrame = 0, holoSlices = [];

  function buildSlices(w, h) {
    holoSlices = [];
    let y = 0;
    while (y < h) { const sh = Math.random() * 20 + 3; holoSlices.push({ y, h: sh }); y += sh; }
  }

  function triggerTitleGlitch() {
    const el = document.getElementById('app-win-title') || document.querySelector('.app-header-logo');
    if (!el) return;
    el.style.animation = 'title-glitch 0.55s ease forwards';
    setTimeout(() => { if (el) el.style.animation = ''; }, 580);
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    countdown--;
    if (!holoActive && countdown <= 0) {
      holoActive = true; holoFrame = 0;
      countdown = baseInterval + Math.random() * baseInterval;
      buildSlices(w, h);
      triggerTitleGlitch();
    }
    if (holoActive) {
      const fade = Math.max(0, 1 - holoFrame / 10);
      const col = mode === 'fr' ? 'rgba(32,200,176,0.7)' : 'rgba(232,160,40,0.7)';
      ctx.save();
      ctx.globalAlpha = 0.07 * fade;
      for (const sl of holoSlices) {
        if (Math.random() < 0.55) continue;
        ctx.fillStyle = col;
        ctx.fillRect(0, sl.y, w, sl.h);
      }
      ctx.restore();
      holoFrame++;
      if (holoFrame > 10) holoActive = false;
    }
    canvasRegistry[id] = { ...canvasRegistry[id], animId: requestAnimationFrame(draw) };
  }
  canvasRegistry[id] = { animId: null };
  canvasRegistry[id].animId = requestAnimationFrame(draw);
}

function stopBgCanvas(id) {
  if (canvasRegistry[id]) cancelAnimationFrame(canvasRegistry[id].animId);
}

/* ══════════════════════════════════════════════════════════
   LANDING
   ══════════════════════════════════════════════════════════ */
function openLoginConsole() {
  const trigger = document.getElementById('login-trigger');
  const con     = document.getElementById('login-console');
  if (trigger) trigger.style.display = 'none';
  if (con) con.style.display = 'flex';
  burstSparkles(window.innerWidth / 2, window.innerHeight - 100, 14);
}

function startLoading(lang) {
  currentLang = lang;
  document.body.classList.toggle('mode-fr', lang === 'fr');
  document.getElementById('screen-login').style.display   = 'none';
  document.getElementById('screen-loading').style.display = 'flex';
  stopBgCanvas('bg-canvas');
  initBgCanvas('bg-canvas-loading', lang, 'intense');
  _clearLoadingUI();
  runLoadingSequence(lang, finishLoading);
}

function _clearLoadingUI() {
  const bar = document.getElementById('progress-bar');
  const log = document.getElementById('loading-log');
  if (bar) bar.style.width = '0%';
  if (log) log.innerHTML = '';
}

function runLoadingSequence(lang, onDone) {
  const bar   = document.getElementById('progress-bar');
  const title = document.getElementById('loading-title');
  const sub   = document.getElementById('loading-sub');
  const log   = document.getElementById('loading-log');
  const tbar  = document.getElementById('loading-titlebar-text');

  const isFr = lang === 'fr';
  if (tbar) tbar.textContent = isFr
    ? 'INITIALISATION SYSTÈME — MOULTLOOK v2.0'
    : 'SYSTEM INITIALISATION — MOULTLOOK v2.0';

  const stages = isFr ? [
    { p: 12,  t: 'INITIALISATION',   s: 'connexion gasconha...', logs: ['boot...', 'chitin loader v3', 'init holo-bus'] },
    { p: 34,  t: 'AUTHENTIFICATION', s: 'vérification carapace...', logs: ['scan coquille', 'signature ok'] },
    { p: 58,  t: 'DURCISSEMENT',     s: 'chargement modules...', logs: ['load: inbox', 'load: démiurges', 'load: coquille'] },
    { p: 82,  t: 'CALIBRAGE',        s: 'sync rivière...', logs: ['sync gironde', 'sync occitan'] },
    { p: 100, t: 'PRÊT',             s: 'console opérationnelle.', logs: ['prêt.'] },
  ] : [
    { p: 12,  t: 'INITIALISING',    s: 'establishing connection...', logs: ['boot...', 'chitin loader v3', 'init holo-bus'] },
    { p: 34,  t: 'AUTHENTICATING',  s: 'verifying carapace...', logs: ['scan shell', 'crab signature ok'] },
    { p: 58,  t: 'HARDENING',       s: 'loading modules...', logs: ['load: inbox', 'load: demiurges', 'load: shell'] },
    { p: 82,  t: 'CALIBRATING',     s: 'sync hivemind...', logs: ['sync continental', 'sync moult-net'] },
    { p: 100, t: 'READY',           s: 'console operational.', logs: ['ready.'] },
  ];

  let i = 0;
  function step() {
    if (i >= stages.length) { if (onDone) setTimeout(onDone, 600); return; }
    const s = stages[i];
    if (bar)   bar.style.width = s.p + '%';
    if (title) title.innerHTML = s.t + '<span class="dots">...</span>';
    if (sub)   sub.textContent = s.s;
    if (log) {
      s.logs.forEach((ln, dx) => {
        setTimeout(() => {
          const li = document.createElement('li');
          li.innerHTML = '<span class="log-mark">▸</span> ' + ln;
          log.appendChild(li);
          while (log.children.length > 6) log.removeChild(log.firstChild);
        }, dx * 110);
      });
    }
    i++;
    setTimeout(step, 820 + Math.random() * 360);
  }
  step();
}

function finishLoading() {
  document.getElementById('screen-loading').style.display = 'none';
  document.getElementById('screen-app').style.display     = 'flex';
  stopBgCanvas('bg-canvas-loading');
  initBgCanvas('bg-canvas-app', currentLang, 'normal');
  initApp();
}

/* ══════════════════════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════════════════════ */
function initApp() {
  currentSection  = 'home';
  currentCategory = null;
  middleRowVisible = false; // home starts with list hidden
  updateBranding();
  buildTicker();
  buildSidebarNav();
  renderMiddleList();
  renderContentView();
  startClock();
  updateLangToggle();
}

function updateBranding() {
  const sidebarLogo = document.getElementById('sidebar-logo-img');
  if (sidebarLogo) sidebarLogo.src = logos[currentLang] || logos.main;
  const headerSub = document.getElementById('app-header-sub');
  if (headerSub) headerSub.textContent = currentLang === 'fr' ? 'GASCOGNE OCCUPÉE' : 'INTERNATIONAL';
  document.body.classList.toggle('mode-fr', currentLang === 'fr');
}

function buildTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const txt = (bannerContent && bannerContent[currentLang]) || bannerContent.en;
  track.innerHTML = (txt + ' ').repeat(2)
    .replace(/★/g, '<span class="tk-star">★</span>');
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR NAV
   ══════════════════════════════════════════════════════════ */
function buildSidebarNav() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  const isFr = currentLang === 'fr';

  const items = [
    { key: 'home',    icon: 'm_anemhome.png',  label: isFr ? 'ANEMOSTAU' : 'ANEMHOME', search: false },
    { key: 'unread',  icon: 'm_unread.png',     label: isFr ? 'NOUVEAU'   : 'UNREAD',   search: false },
    { key: 'inbox',   icon: 'm_inbox.png',      label: isFr ? 'BOÎTE'     : 'INBOX',    search: false },
    { key: 'sent',    icon: 'm_sent.png',       label: isFr ? 'ENVOYÉS'   : 'SENT',     search: false },
    { key: 'drafts',  icon: 'm_drafts.png',     label: isFr ? 'BROUILLONS': 'DRAFTS',   search: false },
    { key: 'archive', icon: 'm_archive.png',    label: isFr ? 'ARCHIVES'  : 'ARCHIVE',  search: false },
    { key: 'world',   icon: 'm_world.png',      label: isFr ? 'VORTEX'    : 'WORLD',    search: false },
    { key: 'shell',   icon: 'm_shell.png',      label: isFr ? 'COQUILLE'  : 'SHELL',    search: false },
    { key: 'search',  icon: 'm_search.png',     label: isFr ? 'RECHERCHE' : 'SEARCH',   search: true  },
  ];

  let html = '';
  for (const it of items) {
    if (it.search) {
      html += `<div class="nav-item nav-search" onclick="openSearchOverlay()">
                 <img src="${it.icon}" class="nav-icon" alt="${it.key}">
                 <span class="nav-label">${it.label}</span>
               </div>`;
      continue;
    }
    const active = currentSection === it.key ? ' active' : '';
    html += `<div class="nav-item${active}" onclick="navigate('${it.key}')">
               <img src="${it.icon}" class="nav-icon" alt="${it.key}">
               <span class="nav-label">${it.label}</span>
             </div>`;

    if (it.key === 'inbox' && currentSection === 'inbox') {
      html += '<div class="nav-sub">';
      const cats = Object.keys(demiurges);
      const labelMap = {
        patriarchy:  isFr ? 'patriarcat' : 'patriarchy',
        imperialism: isFr ? 'impérialisme' : 'imperialism',
        capitalism:  isFr ? 'capitalisme' : 'capitalism',
        notes:       isFr ? 'notas' : 'notes',
      };
      for (const c of cats) {
        const a = currentCategory === c ? ' active' : '';
        html += `<div class="nav-sub-item${a}" onclick="navigate('inbox','${c}'); event.stopPropagation();">
                   <span class="nav-sub-mark">↳</span> ${labelMap[c] || c}
                 </div>`;
      }
      html += '</div>';
    }
  }
  nav.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
function navigate(section, category) {
  currentSection  = section;
  currentCategory = category || null;
  selectedEmailId = null;

  // Home: hide middle row automatically
  if (section === 'home') {
    middleRowVisible = false;
  } else if (!middleRowVisible) {
    middleRowVisible = true;
  }
  // Unread: always show middle row (for see-also)
  if (section === 'unread') middleRowVisible = true;

  _applyMiddleRowVisibility();
  buildSidebarNav();
  updateTitlebar();
  renderMiddleList();
  renderContentView();
}

function toggleMiddleRow() {
  middleRowVisible = !middleRowVisible;
  _applyMiddleRowVisibility();
  burstSparkles(60, window.innerHeight / 2, 6);
}

function _applyMiddleRowVisibility() {
  const mr = document.getElementById('email-list');
  if (!mr) return;
  if (middleRowVisible) {
    mr.classList.remove('hidden');
  } else {
    mr.classList.add('hidden');
  }
}

function updateTitlebar() {
  const winTitle = document.getElementById('app-win-title');
  if (winTitle) {
    if (currentSection === 'inbox' && currentCategory) {
      winTitle.textContent = 'MOULTLOOK / INBOX / ' + currentCategory.toUpperCase();
    } else {
      winTitle.textContent = 'MOULTLOOK / ' + currentSection.toUpperCase();
    }
  }
  const meta = document.getElementById('app-titlebar-meta');
  if (meta) meta.textContent = '// ' + (currentLang === 'fr' ? 'PRÊT' : 'READY') + ' //';
}

/* ══════════════════════════════════════════════════════════
   MIDDLE LIST
   ══════════════════════════════════════════════════════════ */
function renderMiddleList() {
  const list = document.getElementById('email-list');
  if (!list) return;

  // UNREAD — latest article + see also 2 more
  if (currentSection === 'unread') {
    const pool = emails
      .filter(e => e.lang === currentLang)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const latest    = pool[0];
    const seeAlso   = pool.slice(1, 3);
    let html = `<div class="list-header">
                  <span class="list-header-title">${currentLang === 'fr' ? 'NOUVEAU' : 'UNREAD'}</span>
                </div>`;
    if (latest) {
      const a = selectedEmailId === latest.id ? ' active' : '';
      html += `<div class="email-item${a}" onclick="selectEmail(${latest.id})">
                 <div class="email-from">${latest.from}</div>
                 <div class="email-subject">${latest.subject}</div>
                 <div class="email-meta"><span class="email-date">${latest.date}</span></div>
               </div>`;
    }
    if (seeAlso.length) {
      html += `<div class="list-sep">// see also</div>`;
      for (const e of seeAlso) {
        const a = selectedEmailId === e.id ? ' active' : '';
        html += `<div class="email-item${a}" onclick="selectEmail(${e.id})">
                   <div class="email-from">${e.from}</div>
                   <div class="email-subject">${e.subject}</div>
                   <div class="email-meta"><span class="email-date">${e.date}</span></div>
                 </div>`;
      }
    }
    list.innerHTML = html;
    return;
  }

  // Email sections
  if (['inbox','sent','drafts','archive'].includes(currentSection)) {
    let pool = emails.filter(e => e.lang === currentLang && e.section === currentSection);
    if (currentSection === 'inbox' && currentCategory) {
      pool = pool.filter(e => e.category === currentCategory);
    }
    const sectionLabel = currentSection.toUpperCase() + (currentCategory ? ' / ' + currentCategory.toUpperCase() : '');
    let html = `<div class="list-header">
                  <span class="list-header-title">${sectionLabel}</span>
                  <span class="list-header-count">${pool.length}</span>
                </div>`;
    if (!pool.length) {
      html += `<div class="list-empty">${currentLang === 'fr' ? '— rien ici —' : '— nothing here —'}</div>`;
    } else {
      for (const e of pool) {
        const a = selectedEmailId === e.id ? ' active' : '';
        html += `<div class="email-item${a}" onclick="selectEmail(${e.id})">
                   <div class="email-from">${e.from}</div>
                   <div class="email-subject">${e.subject}</div>
                   <div class="email-snippet">${(e.body || '').slice(0, 65)}</div>
                   <div class="email-meta">
                     <span class="email-date">${e.date}</span>
                     ${(e.tags||[]).slice(0,1).map(t=>`<span class="email-tag">#${t}</span>`).join('')}
                   </div>
                 </div>`;
      }
    }
    list.innerHTML = html;
    return;
  }

  // Other sections — no middle row content needed
  list.innerHTML = `<div class="list-header">
                      <span class="list-header-title">${currentSection.toUpperCase()}</span>
                    </div>
                    <div class="list-empty">${currentLang === 'fr' ? '— calme plat —' : '— quiet here —'}</div>`;
}

function selectEmail(id) {
  selectedEmailId = id;
  renderMiddleList();
  renderContentView();
}

/* ══════════════════════════════════════════════════════════
   CONTENT VIEW
   ══════════════════════════════════════════════════════════ */
function renderContentView() {
  const cv = document.getElementById('content-view');
  if (!cv) return;

  // Open email
  if (selectedEmailId) {
    const e = emails.find(x => x.id === selectedEmailId);
    if (e) { cv.innerHTML = renderEmailView(e); return; }
  }

  switch (currentSection) {
    case 'home':    cv.innerHTML = renderHome();    break;
    case 'unread':
      const latest = emails.filter(e=>e.lang===currentLang).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
      if (latest) {
        selectedEmailId = latest.id;
        renderMiddleList();
        cv.innerHTML = renderEmailView(latest);
      } else {
        cv.innerHTML = `<div class="home-panel"><p class="home-body">${currentLang==='fr' ? '— rien à lire —' : '— nothing to read —'}</p></div>`;
      }
      break;
    case 'inbox':
      if (currentCategory && demiurges[currentCategory]) {
        cv.innerHTML = renderDemiurge(currentCategory);
      } else {
        cv.innerHTML = renderInboxLanding();
      }
      break;
    case 'world':   cv.innerHTML = renderWorld();   break;
    case 'shell':   cv.innerHTML = renderShell();   break;
    default:        cv.innerHTML = renderSectionPlaceholder(currentSection); break;
  }
}

function renderHome() {
  const txt = homeContent[currentLang] || homeContent.en;
  const isFr = currentLang === 'fr';
  return `<div class="home-panel">
            <h1 class="home-headline">${isFr ? 'BENVENGUTS' : 'WELCOME'}</h1>
            <p class="home-body">${txt}</p>
            <div class="home-divider"></div>
            <div class="home-meta">
              <div class="home-meta-item">${isFr ? 'cycles écoulés' : 'cycles elapsed'}: <span class="hm-val">${(Math.floor(Math.random()*9000)+1000)}</span></div>
              <div class="home-meta-item">${isFr ? 'densité chitineuse' : 'chitin density'}: <span class="hm-val">${(Math.random()*30+70).toFixed(1)}%</span></div>
              <div class="home-meta-item">status: <span class="hm-val">ACTIVE</span></div>
            </div>
          </div>`;
}

function renderInboxLanding() {
  const isFr = currentLang === 'fr';
  let html = `<div class="demiurge-panel">
                <h2 class="home-headline">${isFr ? 'CORRESPONDANTS' : 'CORRESPONDENTS'}</h2>
                <p class="home-body" style="text-align:left; font-size:0.95rem;">${isFr ? 'choisissez un démiurge pour filtrer.' : 'select a demiurge to filter.'}</p>`;
  for (const [k, d] of Object.entries(demiurges)) {
    const sc = d.status === 'Idle' ? ' idle' : d.status === 'Busy' ? ' busy' : '';
    html += `<div class="demiurge-header" onclick="navigate('inbox','${k}')">
               <img src="${d.image}" class="demiurge-avatar" alt="${d.name}">
               <div class="demiurge-info">
                 <div class="demiurge-status"><span class="status-dot${sc}"></span>${d.status}</div>
                 <div class="demiurge-name">${d.name}</div>
                 <div class="demiurge-catchphrase">"${d.catchphrase}"</div>
               </div>
               <img src="${d.sign}" class="demiurge-sign" alt="">
               <div class="demiurge-hint">→ click to filter</div>
             </div>`;
  }
  html += '</div>';
  return html;
}

function renderDemiurge(cat) {
  const d = demiurges[cat];
  if (!d) return renderInboxLanding();
  const sc = d.status === 'Idle' ? ' idle' : d.status === 'Busy' ? ' busy' : '';
  return `<div class="demiurge-panel">
            <div class="demiurge-header" style="cursor:default; pointer-events:none;">
              <img src="${d.image}" class="demiurge-avatar" alt="${d.name}">
              <div class="demiurge-info">
                <div class="demiurge-status"><span class="status-dot${sc}"></span>${d.status}</div>
                <div class="demiurge-name">${d.name}</div>
                <div class="demiurge-catchphrase">"${d.catchphrase}"</div>
              </div>
              <img src="${d.sign}" class="demiurge-sign" alt="">
            </div>
            <div class="demiurge-description">${d.description}</div>
            <p class="home-body" style="text-align:left; font-size:0.9rem; margin-top:6px;">
              ← ${currentLang==='fr' ? 'sélectionnez un message.' : 'select a message from the list.'}
            </p>
          </div>`;
}

function renderEmailView(e) {
  let body = `<div class="email-view-body">${e.body || ''}</div>`;
  if (e.type === 'pdf' && e.url) {
    body += `<div class="email-view-pdf">📎 <a href="${e.url}" target="_blank" rel="noopener">${currentLang==='fr' ? 'ouvrir la pièce jointe' : 'open attachment'}</a></div>`;
  }
  return `<div class="email-view">
            <div class="email-view-header">
              <div>
                <div class="email-view-from">${e.from}</div>
                <h1 class="email-view-subject">${e.subject}</h1>
                <div class="email-view-date">${e.date} · #${(e.tags||[]).join(' #')}</div>
              </div>
              <button class="close-btn" onclick="closeEmail()">[ × ]</button>
            </div>
            ${body}
          </div>`;
}

function closeEmail() {
  selectedEmailId = null;
  renderMiddleList();
  renderContentView();
}

function renderWorld() {
  const isFr = currentLang === 'fr';
  const targetLang = isFr ? 'en' : 'fr';
  const targetLabel = isFr ? 'INTERNATIONAL' : 'GASCOGNE OCCUPÉE (*France : Gascogne occupée)';
  const targetFlag  = isFr ? 'm_world.png' : 'm_francogasconha.png';
  return `<div class="world-panel">
            <img src="${isFr ? 'm_world.png' : 'm_france.png'}" class="world-flag" alt="">
            <h1 class="home-headline">${isFr ? 'LE VORTEX' : 'THE VORTEX'}</h1>
            <p class="home-body" style="max-width:480px;">
              ${isFr
                ? 'MOULTLOOK opère également en France (*France : Gascogne occupée). Voulez-vous traverser le vortex ?'
                : 'MOULTLOOK also has activities in France (*France : occupied Gascony). Do you wish to cross the vortex?'
              }
            </p>
            <div class="home-divider"></div>
            <div style="display:flex; align-items:center; gap:14px;">
              <img src="${targetFlag}" style="width:36px;image-rendering:pixelated;">
              <button class="world-vortex-btn" onclick="confirmLangSwitch('${targetLang}')">
                ${targetLabel} →
              </button>
            </div>
            <p class="home-body" style="font-size:0.8rem; opacity:0.55; margin-top:8px;">
              ${isFr ? '// chargement de session complet inclus' : '// full session reload included'}
            </p>
          </div>`;
}

function renderShell() {
  return shellContent;
}

function renderSectionPlaceholder(sec) {
  const isFr = currentLang === 'fr';
  const map = { sent: ['OUTGOING', 'TRANSMISSIONS ENVOYÉES'], drafts: ['FRAGMENTS', 'FRAGMENTS NON DURCIS'], archive: ['BURIED', 'CORRESPONDANCE ENTERRÉE'] };
  const title = (map[sec] || [sec.toUpperCase(), sec.toUpperCase()])[isFr ? 1 : 0];
  return `<div class="home-panel">
            <h1 class="home-headline">${title}</h1>
            <p class="home-body">← ${isFr ? 'choisissez un message.' : 'pick a message from the list.'}</p>
          </div>`;
}

/* ══════════════════════════════════════════════════════════
   TITLEBAR BUTTONS — moult, minimize, transmission
   ══════════════════════════════════════════════════════════ */
function moult() {
  // Visual: flash the titlebar + rebuild UI
  const aw = document.getElementById('app-window');
  if (aw) {
    aw.style.transition = 'none';
    aw.style.filter = 'brightness(1.8) hue-rotate(25deg)';
    setTimeout(() => {
      if (aw) { aw.style.filter = ''; aw.style.transition = ''; }
    }, 160);
  }
  const titleEl = document.getElementById('app-win-title');
  if (titleEl) {
    titleEl.style.animation = 'title-glitch 0.55s ease forwards';
    setTimeout(() => { if (titleEl) titleEl.style.animation = ''; }, 580);
  }
  burstSparkles(55, 30, 12);
  setTimeout(() => { buildSidebarNav(); renderMiddleList(); renderContentView(); buildTicker(); }, 200);
}

function minimizeConsole() {
  const layout     = document.getElementById('console-layout');
  const restoreGif = document.getElementById('app-minimized-gif');
  if (!layout) return;
  consoleMinimized = !consoleMinimized;
  layout.classList.toggle('minimized', consoleMinimized);
  if (restoreGif) restoreGif.style.display = consoleMinimized ? 'flex' : 'none';
}

function restoreConsole() {
  const layout     = document.getElementById('console-layout');
  const restoreGif = document.getElementById('app-minimized-gif');
  consoleMinimized = false;
  if (layout) layout.classList.remove('minimized');
  if (restoreGif) restoreGif.style.display = 'none';
}

function toggleSidePanel() {
  const sp = document.getElementById('side-panel');
  if (!sp) return;
  sidePanelOpen = !sidePanelOpen;
  sp.style.display = sidePanelOpen ? 'flex' : 'none';
}

/* ══════════════════════════════════════════════════════════
   LANGUAGE — popup + loading screen
   ══════════════════════════════════════════════════════════ */
function openLangPopup() {
  const popup = document.getElementById('lang-popup');
  if (!popup) return;
  // Highlight current lang card
  const en = document.getElementById('lang-popup-en');
  const fr = document.getElementById('lang-popup-fr');
  if (en) en.style.borderColor = currentLang === 'en' ? 'var(--amber)' : '';
  if (fr) fr.style.borderColor = currentLang === 'fr' ? 'var(--teal)'  : '';
  popup.style.display = 'flex';
  burstSparkles(window.innerWidth - 40, 22, 8);
}

function closeLangPopup() {
  const popup = document.getElementById('lang-popup');
  if (popup) popup.style.display = 'none';
}

function closeLangPopupOutside(e) {
  if (e.target.id === 'lang-popup') closeLangPopup();
}

function confirmLangSwitch(targetLang) {
  if (targetLang === currentLang) { closeLangPopup(); return; }
  closeLangPopup();
  // Show loading screen for the switch
  document.getElementById('screen-app').style.display     = 'none';
  document.getElementById('screen-loading').style.display = 'flex';
  currentLang = targetLang;
  document.body.classList.toggle('mode-fr', targetLang === 'fr');
  stopBgCanvas('bg-canvas-app');
  _clearLoadingUI();
  initBgCanvas('bg-canvas-loading', targetLang, 'intense');
  runLoadingSequence(targetLang, function() {
    document.getElementById('screen-loading').style.display = 'none';
    document.getElementById('screen-app').style.display     = 'flex';
    stopBgCanvas('bg-canvas-loading');
    initBgCanvas('bg-canvas-app', targetLang, 'normal');
    currentSection  = 'home';
    currentCategory = null;
    selectedEmailId = null;
    middleRowVisible = false;
    moltokGreeted = false;
    updateBranding();
    buildTicker();
    buildSidebarNav();
    _applyMiddleRowVisibility();
    renderMiddleList();
    renderContentView();
    updateLangToggle();
    burstSparkles(window.innerWidth/2, window.innerHeight/2, 22);
  });
}

function updateLangToggle() {
  const icon  = document.getElementById('lang-toggle-icon');
  const label = document.getElementById('lang-toggle-label');
  if (!icon || !label) return;
  if (currentLang === 'en') {
    icon.src         = 'm_francogasconha.png';
    label.textContent = 'FR';
  } else {
    icon.src         = 'm_world.png';
    label.textContent = 'INT';
  }
}

/* ══════════════════════════════════════════════════════════
   SEARCH OVERLAY — supersection
   ══════════════════════════════════════════════════════════ */
function openSearchOverlay() {
  const ov = document.getElementById('search-overlay');
  if (!ov) return;
  ov.style.display = 'flex';
  const inp = document.getElementById('search-ov-input');
  if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 60); }
  const res = document.getElementById('search-ov-results');
  if (res) res.innerHTML = `<p class="search-ov-prompt" id="search-ov-prompt">${currentLang==='fr' ? 'tapez une requête...' : 'type a query...'}</p>`;
  const title = document.getElementById('search-ov-title');
  if (title) title.textContent = currentLang==='fr' ? '// RECHERCHE DANS LE CARAPACE //' : '// SEARCH THE CARAPACE //';
  burstSparkles(window.innerWidth/2, 80, 10);
}

function closeSearchOverlay() {
  const ov = document.getElementById('search-overlay');
  if (ov) ov.style.display = 'none';
}

function closeSearchOutside(e) {
  if (e.target.id === 'search-overlay') closeSearchOverlay();
}

function executeSearchOverlay() {
  const inp = document.getElementById('search-ov-input');
  const out = document.getElementById('search-ov-results');
  if (!inp || !out) return;
  const q = inp.value.trim().toLowerCase();
  if (!q) return;

  const hits = emails.filter(e =>
    e.lang === currentLang && (
      (e.subject||'').toLowerCase().includes(q) ||
      (e.body||'').toLowerCase().includes(q)    ||
      (e.from||'').toLowerCase().includes(q)    ||
      (e.tags||[]).some(t => t.toLowerCase().includes(q))
    )
  );

  if (!hits.length) {
    out.innerHTML = `<p class="search-no-results">${currentLang==='fr' ? '— aucun résultat —' : '— no results found —'}</p>`;
    return;
  }
  out.innerHTML = hits.map(r =>
    `<div class="search-result">
       <div class="search-result-info">
         <div class="email-from">${r.from}</div>
         <div class="email-subject">${r.subject}</div>
         <div class="email-snippet">${(r.body||'').slice(0,90)}</div>
       </div>
       <button class="read-btn" onclick="jumpToEmail(${r.id})">${currentLang==='fr' ? 'LIRE →' : 'READ →'}</button>
     </div>`
  ).join('');
}

function jumpToEmail(id) {
  const e = emails.find(x => x.id === id);
  if (!e) return;
  closeSearchOverlay();
  currentSection  = e.section;
  currentCategory = e.category || null;
  selectedEmailId = id;
  middleRowVisible = true;
  _applyMiddleRowVisibility();
  buildSidebarNav();
  updateTitlebar();
  renderMiddleList();
  renderContentView();
}

/* ══════════════════════════════════════════════════════════
   CLOCKS
   ══════════════════════════════════════════════════════════ */
function startClock() {
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const ms = String(now.getMilliseconds()).padStart(3,'0');
    const ah = document.getElementById('app-header-clock');
    if (ah) ah.textContent = `${hh}:${mm}:${ss}`;
    const sc = document.getElementById('side-clock');
    if (sc) sc.textContent = `${hh}:${mm}:${ss}.${ms}`;
    const sd = document.getElementById('side-date');
    if (sd) sd.textContent = now.toDateString().toUpperCase();
    requestAnimationFrame(tick);
  }
  tick();
}

function updateLoginClock() {
  const el = document.getElementById('login-clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateLoginClock, 1000);
updateLoginClock();

/* ══════════════════════════════════════════════════════════
   MOLTOK ASSISTANT
   ══════════════════════════════════════════════════════════ */
const moltokPresets = [
  'blblblbllbbb :)',
  'bll...blbllb.',
  'blbl bl blblb~',
  'blblblblblbl !!',
  'b...bl...blblb.',
  'blbllblbll :)',
  'BLBLBLBLBL :)',
  'bl bl. blblbl...',
  'bllbllbllbll~',
  'blb. blb. bl. :)',
  'blblblblbl ??',
  'bl... bl... :3',
];

function generateBlblbl(input) {
  // Keyword triggers for koolkrab
  const lowered = (input || '').toLowerCase();
  if (['koolkrab','kool krab','krab','koolkrab.gif'].some(k => lowered.includes(k))) {
    return { type: 'gif' };
  }
  // ~22% chance of koolkrab
  if (Math.random() < 0.22) return { type: 'gif' };
  // ~40% chance of preset
  if (Math.random() < 0.4) return { type: 'text', content: moltokPresets[Math.floor(Math.random() * moltokPresets.length)] };
  // Generate fresh
  const parts = ['bl','blb','bll','lb','blbl','bllb','lbl','b','bl'];
  const ends  = [' :)', '.', '..', '...', '~', ' !!', ' (:)', '', ' ?', ' :3'];
  let s = '';
  const n = Math.floor(Math.random() * 7) + 2;
  for (let i = 0; i < n; i++) {
    s += parts[Math.floor(Math.random() * parts.length)];
    if (Math.random() < 0.12) s += '...';
  }
  s += ends[Math.floor(Math.random() * ends.length)];
  return { type: 'text', content: s };
}

function toggleMoltok() {
  const widget = document.getElementById('moltok-widget');
  const panel  = document.getElementById('moltok-panel');
  if (!widget || !panel) return;
  moltokOpen = !moltokOpen;
  widget.classList.toggle('open', moltokOpen);
  panel.style.display = moltokOpen ? 'flex' : 'none';

  if (moltokOpen) {
    burstSparkles(window.innerWidth - 100, window.innerHeight - 80, 18);
    if (!moltokGreeted) {
      moltokGreeted = true;
      setTimeout(() => addMoltokMsg({ type: 'text', content: 'blblbl :)' }), 480);
    }
    const inp = document.getElementById('moltok-input');
    if (inp) setTimeout(() => inp.focus(), 100);
  }
}

function moltokRespond() {
  const inp = document.getElementById('moltok-input');
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  inp.value = '';
  _addUserMsg(text);
  const typing = _addTypingIndicator();
  const delay = 720 + Math.random() * 1100;
  setTimeout(() => {
    if (typing && typing.parentNode) typing.remove();
    addMoltokMsg(generateBlblbl(text));
  }, delay);
}

function _addUserMsg(text) {
  const msgs = document.getElementById('moltok-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className = 'moltok-msg user'; d.textContent = text;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

function addMoltokMsg(response) {
  const msgs = document.getElementById('moltok-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  if (response.type === 'gif') {
    d.className = 'moltok-msg moltok gif';
    const img = document.createElement('img');
    img.src = 'koolkrab.gif'; img.alt = ''; img.className = 'moltok-koolkrab';
    d.appendChild(img);
  } else {
    d.className = 'moltok-msg moltok'; d.textContent = response.content;
  }
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

function _addTypingIndicator() {
  const msgs = document.getElementById('moltok-messages');
  if (!msgs) return null;
  const d = document.createElement('div');
  d.className = 'moltok-msg moltok moltok-typing';
  d.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  return d;
}

/* ══════════════════════════════════════════════════════════
   CLICK FX — sparkles + claw echo
   ══════════════════════════════════════════════════════════ */
document.addEventListener('mousedown', function(e) {
  if (e.target.matches('input, textarea')) return;
  // claw echo at cursor
  const fx = document.createElement('div');
  fx.className = 'cursor-click-fx';
  fx.style.left = e.clientX + 'px';
  fx.style.top  = e.clientY + 'px';
  document.body.appendChild(fx);
  setTimeout(() => { if (fx.parentNode) fx.remove(); }, 520);
  // sparkles on interactive elements
  if (e.target.closest('button, .nav-item, .nav-sub-item, .email-item, .char-card, .search-result, .moltok-anchor, .demiurge-header, .lang-toggle, .moult-btn, .win-btn-sprite-wrap, .close-btn, .lang-popup-card, .world-vortex-btn')) {
    burstSparkles(e.clientX, e.clientY, 8);
  }
});

function burstSparkles(x, y, n) {
  const types = ['', 'hot', 'cool'];
  for (let i = 0; i < n; i++) {
    const sp = document.createElement('div');
    const t  = types[Math.floor(Math.random() * types.length)];
    sp.className = 'sparkle' + (t ? ' ' + t : '');
    sp.style.left = x + 'px'; sp.style.top = y + 'px';
    const angle = (Math.PI * 2) * (i / n) + Math.random() * 0.6;
    const dist  = 30 + Math.random() * 52;
    sp.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
    sp.style.setProperty('--dy', (Math.sin(angle) * dist) + 'px');
    document.body.appendChild(sp);
    setTimeout(() => { if (sp.parentNode) sp.remove(); }, 640);
  }
}

/* ══════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  initBgCanvas('bg-canvas', 'en', 'login');
});
