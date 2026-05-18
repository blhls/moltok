/* ============================================================
   MOULTLOOK v2.0 — script.js
   Berylist console — single-page, vanilla JS.
   ============================================================ */
'use strict';

/* ── State ─────────────────────────────────────────────────── */
let currentLang     = 'en';
let currentSection  = 'home';
let currentCategory = null;
let selectedEmailId = null;
let consoleMinimized = false;
let sidePanelOpen    = false;
let moltokOpen       = false;
let moltokGreeted    = false;

/* ══════════════════════════════════════════════════════════
   ROUTING (hash-based)
   ══════════════════════════════════════════════════════════ */
window.addEventListener('hashchange', handleRouting);
function handleRouting() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  const parts = hash.split('-');
  currentSection  = parts[0];
  currentCategory = parts[1] || null;
  updateUI();
}

/* ══════════════════════════════════════════════════════════
   BACKGROUND CANVAS — holographic glitch
   ══════════════════════════════════════════════════════════ */
const canvasRegistry = {};

function initBgCanvas(canvasId, mode, glitchMode = 'normal') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (canvasRegistry[canvasId]) cancelAnimationFrame(canvasRegistry[canvasId].animId);

  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  if (!canvasRegistry[canvasId]) window.addEventListener('resize', resize);

  const baseFrames =
    glitchMode === 'intense' ? 60 + Math.random() * 120 :
    glitchMode === 'login'   ? 15 * 60 + Math.random() * 10 * 60 :
                                60 * 60 + Math.random() * 30 * 60;

  let holoCountdown = baseFrames;
  let holoFrame = 0, holoActive = false, holoSlices = [];

  function buildSlices(w, h) {
    holoSlices = [];
    let y = 0;
    while (y < h) {
      const sh = Math.random() * 28 + 4;
      holoSlices.push({ y, h: sh });
      y += sh;
    }
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    holoCountdown--;
    if (!holoActive && holoCountdown <= 0) {
      holoActive = true; holoFrame = 0;
      holoCountdown =
        glitchMode === 'intense' ? 60 + Math.random() * 120 :
        glitchMode === 'login'   ? 15 * 60 + Math.random() * 10 * 60 :
                                    60 * 60 + Math.random() * 30 * 60;
      buildSlices(w, h);

      const aw = document.querySelector('.app-window');
      if (aw && document.getElementById('screen-app').style.display !== 'none') {
        aw.style.animation = 'holo-shift 0.42s ease forwards';
        setTimeout(() => {
          if (aw) aw.style.animation = 'console-breathe 10s ease-in-out infinite';
        }, 460);
      }
    }

    if (holoActive) {
      const fade = Math.max(0, 1 - holoFrame / 14);
      ctx.save();
      ctx.globalAlpha = (glitchMode === 'intense' ? 0.18 : 0.10) * fade;
      const col = mode === 'fr' ? 'rgba(32,200,176,0.9)' : 'rgba(232,160,40,0.9)';
      for (const sl of holoSlices) {
        if (Math.random() < 0.6) continue;
        ctx.fillStyle = col;
        ctx.fillRect(0, sl.y, w, sl.h);
      }
      if (holoFrame < 7) {
        ctx.globalAlpha = (0.45 - holoFrame * 0.06) * fade;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        const gy = Math.random() * h;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      ctx.restore();
      holoFrame++;
      if (holoFrame > 14) holoActive = false;
    }
    canvasRegistry[canvasId].animId = requestAnimationFrame(draw);
  }
  canvasRegistry[canvasId] = { canvas, ctx, animId: null };
  canvasRegistry[canvasId].animId = requestAnimationFrame(draw);
}

function stopBgCanvas(id) {
  if (canvasRegistry[id]) cancelAnimationFrame(canvasRegistry[id].animId);
}

/* ══════════════════════════════════════════════════════════
   LANDING / LOGIN
   ══════════════════════════════════════════════════════════ */
function openLoginConsole() {
  const trigger = document.getElementById('login-trigger');
  const console_ = document.getElementById('login-console');
  if (trigger) trigger.style.display = 'none';
  if (console_) console_.style.display = 'flex';
  burstSparkles(window.innerWidth / 2, window.innerHeight - 100, 14);
}

function startLoading(lang) {
  currentLang = lang;
  document.body.classList.toggle('mode-fr', lang === 'fr');
  document.getElementById('screen-login').style.display   = 'none';
  document.getElementById('screen-loading').style.display = 'flex';
  initBgCanvas('bg-canvas-loading', lang, 'intense');
  runLoadingSequence();
}

function runLoadingSequence() {
  const bar      = document.getElementById('progress-bar');
  const title    = document.getElementById('loading-title');
  const sub      = document.getElementById('loading-sub');
  const log      = document.getElementById('loading-log');
  const tbar     = document.getElementById('loading-titlebar-text');

  const isFr = currentLang === 'fr';
  const stages = isFr ? [
    { p: 12, t: 'INITIALISATION',  s: 'connexion au système gascon...',     logs: ['boot...', 'chitin loader v3', 'init holo-bus'] },
    { p: 32, t: 'AUTHENTIFICATION', s: 'vérification du carapace...',        logs: ['scanning shell', 'crab signature ok'] },
    { p: 58, t: 'DURCISSEMENT',     s: 'chargement des modules...',          logs: ['load: inbox', 'load: demiurges', 'load: shell'] },
    { p: 80, t: 'CALIBRAGE',        s: 'synchronisation avec la rivière...', logs: ['sync gironde', 'sync occitan'] },
    { p: 100, t: 'PRÊT',            s: 'console opérationnelle.',            logs: ['ready.'] },
  ] : [
    { p: 12, t: 'INITIALISING',  s: 'establishing connection...',  logs: ['boot...', 'chitin loader v3', 'init holo-bus'] },
    { p: 32, t: 'AUTHENTICATING', s: 'verifying carapace...',       logs: ['scanning shell', 'crab signature ok'] },
    { p: 58, t: 'HARDENING',      s: 'loading modules...',          logs: ['load: inbox', 'load: demiurges', 'load: shell'] },
    { p: 80, t: 'CALIBRATING',    s: 'synchronising with hivemind...', logs: ['sync continental', 'sync moult-net'] },
    { p: 100, t: 'READY',         s: 'console operational.',        logs: ['ready.'] },
  ];

  if (tbar) tbar.textContent = isFr ? 'INITIALISATION SYSTÈME — MOULTLOOK v2.0' : 'SYSTEM INITIALISATION — MOULTLOOK v2.0';

  let i = 0;
  function step() {
    if (i >= stages.length) {
      finishLoading();
      return;
    }
    const s = stages[i];
    if (bar)   bar.style.width = s.p + '%';
    if (title) title.innerHTML = s.t + '<span class="dots">...</span>';
    if (sub)   sub.textContent = s.s;
    s.logs.forEach((logLine, idx) => {
      setTimeout(() => {
        const li = document.createElement('li');
        li.innerHTML = '<span class="log-mark">▸</span> ' + logLine;
        li.style.animationDelay = (idx * 0.08) + 's';
        log.appendChild(li);
        // keep log trimmed
        while (log.children.length > 6) log.removeChild(log.firstChild);
      }, idx * 120);
    });
    i++;
    setTimeout(step, 850 + Math.random() * 400);
  }
  step();
}

function finishLoading() {
  setTimeout(() => {
    document.getElementById('screen-loading').style.display = 'none';
    document.getElementById('screen-app').style.display = 'flex';
    stopBgCanvas('bg-canvas-loading');
    initBgCanvas('bg-canvas-app', currentLang, 'normal');
    initApp();
  }, 600);
}

/* ══════════════════════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════════════════════ */
function initApp() {
  if (!window.location.hash) {
    currentSection = 'home';
    currentCategory = null;
  }
  updateBranding();
  buildTicker();
  buildSidebarNav();
  updateUI();
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
  // Repeat the content to ensure seamless scroll
  const repeated = (txt + ' ').repeat(2);
  track.innerHTML = repeated
    .replace(/★/g, '<span class="tk-star">★</span>');
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR NAV
   ══════════════════════════════════════════════════════════ */
function buildSidebarNav() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const items = [
    { key: 'home',    icon: 'm_home.png',    label: currentLang === 'fr' ? 'ACCUEIL' : 'HOME' },
    { key: 'inbox',   icon: 'm_inbox.png',   label: currentLang === 'fr' ? 'BOÎTE' : 'INBOX'  },
    { key: 'sent',    icon: 'm_sent.png',    label: currentLang === 'fr' ? 'ENVOYÉS' : 'SENT' },
    { key: 'drafts',  icon: 'm_drafts.png',  label: currentLang === 'fr' ? 'BROUILLONS' : 'DRAFTS' },
    { key: 'archive', icon: 'm_archive.png', label: currentLang === 'fr' ? 'ARCHIVES' : 'ARCHIVE' },
    { key: 'search',  icon: 'm_search.png',  label: currentLang === 'fr' ? 'CHERCHER' : 'SEARCH' },
    { key: 'shell',   icon: 'm_shell.png',   label: currentLang === 'fr' ? 'COQUILLE' : 'SHELL' },
    { key: 'world',   icon: 'm_world.png',   label: currentLang === 'fr' ? 'MONDE' : 'WORLD' },
  ];

  let html = '';
  for (const it of items) {
    const active = currentSection === it.key ? ' active' : '';
    html += `<div class="nav-item${active}" onclick="navigate('${it.key}')">
               <img src="${it.icon}" class="nav-icon" alt="${it.key}">
               <span class="nav-label">${it.label}</span>
             </div>`;

    // sub-categories under inbox
    if (it.key === 'inbox' && currentSection === 'inbox') {
      html += '<div class="nav-sub">';
      const cats = Object.keys(demiurges);
      for (const c of cats) {
        const a = currentCategory === c ? ' active' : '';
        const labelMap = {
          patriarchy:  currentLang === 'fr' ? 'patriarcat' : 'patriarchy',
          imperialism: currentLang === 'fr' ? 'impérialisme' : 'imperialism',
          capitalism:  currentLang === 'fr' ? 'capitalisme' : 'capitalism',
          notes:       currentLang === 'fr' ? 'notas' : 'notes',
        };
        html += `<div class="nav-sub-item${a}" onclick="navigate('inbox','${c}'); event.stopPropagation();">
                   <span class="nav-sub-mark">↳</span> ${labelMap[c] || c}
                 </div>`;
      }
      html += '</div>';
    }
  }
  nav.innerHTML = html;
}

function navigate(section, category = null) {
  currentSection  = section;
  currentCategory = category;
  selectedEmailId = null;
  const hash = category ? `${section}-${category}` : section;
  if (window.location.hash.replace('#','') !== hash) {
    window.location.hash = hash;
  } else {
    updateUI();
  }
}

/* ══════════════════════════════════════════════════════════
   UI UPDATE — renders sections + email list + content view
   ══════════════════════════════════════════════════════════ */
function updateUI() {
  buildSidebarNav();
  updateTitlebar();
  renderMiddleList();
  renderContentView();
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

/* ── Middle list (emails or section pickers) ────────────────── */
function renderMiddleList() {
  const list = document.getElementById('email-list');
  if (!list) return;

  // Sections that show emails
  if (['inbox', 'sent', 'drafts', 'archive'].includes(currentSection)) {
    let pool = emails.filter(e => e.lang === currentLang && e.section === currentSection);
    if (currentSection === 'inbox' && currentCategory) {
      pool = pool.filter(e => e.category === currentCategory);
    }
    const title = currentSection.toUpperCase()
                + (currentCategory ? ' / ' + currentCategory.toUpperCase() : '');
    let html = `<div class="list-header">
                  <span class="list-header-title">${title}</span>
                  <span class="list-header-count">${pool.length} ${currentLang === 'fr' ? 'msgs' : 'msgs'}</span>
                </div>`;
    if (pool.length === 0) {
      html += `<div class="list-empty">${currentLang === 'fr' ? '— pas de correspondance —' : '— no correspondence —'}</div>`;
    } else {
      for (const e of pool) {
        const active = selectedEmailId === e.id ? ' active' : '';
        const snippet = (e.body || '').slice(0, 70);
        html += `<div class="email-item${active}" onclick="selectEmail(${e.id})">
                   <div class="email-from">${e.from}</div>
                   <div class="email-subject">${e.subject}</div>
                   <div class="email-snippet">${snippet}</div>
                   <div class="email-meta">
                     <span class="email-date">${e.date}</span>
                     ${(e.tags || []).slice(0,1).map(t => `<span class="email-tag">#${t}</span>`).join('')}
                   </div>
                 </div>`;
      }
    }
    list.innerHTML = html;
    return;
  }

  // Search section — middle list shows a quick prompt
  if (currentSection === 'search') {
    list.innerHTML = `<div class="list-header"><span class="list-header-title">${currentLang === 'fr' ? 'RECHERCHE' : 'SEARCH'}</span></div>
                      <div class="list-empty">${currentLang === 'fr' ? 'tapez une requête dans le panneau principal →' : 'type a query in the main panel →'}</div>`;
    return;
  }

  // Home / shell / world — empty middle list, decorative
  list.innerHTML = `<div class="list-header"><span class="list-header-title">${currentSection.toUpperCase()}</span></div>
                    <div class="list-empty">${currentLang === 'fr' ? '— calme plat —' : '— quiet here —'}</div>`;
}

function selectEmail(id) {
  selectedEmailId = id;
  renderMiddleList();
  renderContentView();
}

/* ── Content view (main panel) ─────────────────────────────── */
function renderContentView() {
  const cv = document.getElementById('content-view');
  if (!cv) return;

  // Email open?
  if (selectedEmailId) {
    const e = emails.find(x => x.id === selectedEmailId);
    if (e) {
      cv.innerHTML = renderEmailView(e);
      return;
    }
  }

  switch (currentSection) {
    case 'home':    cv.innerHTML = renderHome();    break;
    case 'shell':   cv.innerHTML = renderShell();   break;
    case 'world':   cv.innerHTML = renderWorld();   break;
    case 'search':  cv.innerHTML = renderSearch();  break;
    case 'inbox':
      if (currentCategory && demiurges[currentCategory]) {
        cv.innerHTML = renderDemiurge(currentCategory);
      } else {
        cv.innerHTML = renderInboxLanding();
      }
      break;
    case 'sent':
    case 'drafts':
    case 'archive':
      cv.innerHTML = renderSectionPlaceholder(currentSection);
      break;
    default:
      cv.innerHTML = renderHome();
  }
}

function renderHome() {
  const txt = homeContent[currentLang] || homeContent.en;
  return `<div class="home-panel">
            <img src="${logos[currentLang] || logos.main}" class="home-logo" alt="">
            <h1 class="home-headline">${currentLang === 'fr' ? 'BENVENGUTS' : 'WELCOME'}</h1>
            <p class="home-body">${txt}</p>
            <div class="home-divider"></div>
            <img src="m_anemhome.png" class="home-anem" alt="anemone">
            <div class="home-meta">
              <div class="home-meta-item">${currentLang === 'fr' ? 'cycles écoulés' : 'cycles elapsed'}: <span class="hm-val">${Math.floor(Math.random()*9000)+1000}</span></div>
              <div class="home-meta-item">${currentLang === 'fr' ? 'densité chitineuse' : 'chitin density'}: <span class="hm-val">${(Math.random()*30+70).toFixed(1)}%</span></div>
              <div class="home-meta-item">${currentLang === 'fr' ? 'présence' : 'presence'}: <span class="hm-val">ACTIVE</span></div>
            </div>
          </div>`;
}

function renderInboxLanding() {
  const cats = Object.entries(demiurges);
  let html = `<div class="demiurge-panel">
                <h2 class="home-headline">${currentLang === 'fr' ? 'CORRESPONDANTS' : 'CORRESPONDENTS'}</h2>
                <p class="home-body" style="text-align:left;">${currentLang === 'fr' ? 'choisissez un démiurge.' : 'select a demiurge.'}</p>`;
  for (const [k, d] of cats) {
    const statusClass = d.status === 'Idle' ? ' idle' : d.status === 'Busy' ? ' busy' : '';
    html += `<div class="demiurge-header" onclick="navigate('inbox','${k}')" style="cursor: url('m_clawpointer.png') 4 0, pointer;">
               <img src="${d.image}" class="demiurge-avatar" alt="${d.name}">
               <div class="demiurge-info">
                 <div class="demiurge-status"><span class="status-dot${statusClass}"></span>${d.status}</div>
                 <div class="demiurge-name">${d.name}</div>
                 <div class="demiurge-catchphrase">"${d.catchphrase}"</div>
               </div>
               <img src="${d.sign}" class="demiurge-sign" alt="">
             </div>`;
  }
  html += `</div>`;
  return html;
}

function renderDemiurge(cat) {
  const d = demiurges[cat];
  if (!d) return renderInboxLanding();
  const statusClass = d.status === 'Idle' ? ' idle' : d.status === 'Busy' ? ' busy' : '';
  return `<div class="demiurge-panel">
            <div class="demiurge-header">
              <img src="${d.image}" class="demiurge-avatar" alt="${d.name}">
              <div class="demiurge-info">
                <div class="demiurge-status"><span class="status-dot${statusClass}"></span>${d.status}</div>
                <div class="demiurge-name">${d.name}</div>
                <div class="demiurge-catchphrase">"${d.catchphrase}"</div>
              </div>
              <img src="${d.sign}" class="demiurge-sign" alt="">
            </div>
            <div class="demiurge-description">${d.description}</div>
            <p class="home-body" style="text-align:left; font-size:0.95rem;">
              ${currentLang === 'fr' ? '← sélectionnez un message dans la liste pour ouvrir.' : '← select a message from the list to open.'}
            </p>
          </div>`;
}

function renderEmailView(e) {
  let body = `<div class="email-view-body">${e.body || ''}</div>`;
  if (e.type === 'pdf' && e.url) {
    body += `<div class="email-view-pdf">
               📎 <a href="${e.url}" target="_blank" rel="noopener">${currentLang === 'fr' ? 'ouvrir la pièce jointe' : 'open attachment'}</a>
             </div>`;
  }
  return `<div class="email-view">
            <div class="email-view-header">
              <div>
                <div class="email-view-from">${e.from}</div>
                <h1 class="email-view-subject">${e.subject}</h1>
                <div class="email-view-date">${e.date} · #${(e.tags || []).join(' #')}</div>
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

function renderShell() {
  return shellContent;
}

function renderWorld() {
  return `<div class="home-panel">
            <img src="m_world.png" class="home-logo" alt="">
            <h1 class="home-headline">${currentLang === 'fr' ? 'LE MONDE' : 'THE WORLD'}</h1>
            <p class="home-body">${currentLang === 'fr'
              ? 'au-delà des coquilles, il y a encore des coquilles. l\'évolution est inévitable, mais lente. revenez plus tard.'
              : 'beyond the shells, there are still shells. evolution is inevitable, but slow. check back later.'}
            </p>
            <div class="home-divider"></div>
          </div>`;
}

function renderSearch() {
  const txt = currentLang === 'fr' ? 'rechercher dans le carapace...' : 'search within the carapace...';
  const btn = currentLang === 'fr' ? 'CHERCHER' : 'SEARCH';
  return `<div class="search-panel">
            <div class="search-header">
              <img src="m_search.png" class="search-icon" alt="">
              <h2 class="search-title">${currentLang === 'fr' ? 'RECHERCHE' : 'SEARCH'}</h2>
            </div>
            <div class="search-input-row">
              <input type="text" id="search-input" class="search-input" placeholder="${txt}" onkeydown="if(event.key==='Enter') executeSearch()">
              <button class="search-btn" onclick="executeSearch()">${btn}</button>
            </div>
            <div id="search-results" class="search-results"></div>
          </div>`;
}

function executeSearch() {
  const input = document.getElementById('search-input');
  const out = document.getElementById('search-results');
  if (!input || !out) return;
  const q = input.value.trim().toLowerCase();
  if (!q) { out.innerHTML = ''; return; }
  const hits = emails.filter(e =>
    e.lang === currentLang && (
      (e.subject || '').toLowerCase().includes(q) ||
      (e.body || '').toLowerCase().includes(q)    ||
      (e.from || '').toLowerCase().includes(q)    ||
      (e.tags || []).some(t => t.toLowerCase().includes(q))
    )
  );
  if (hits.length === 0) {
    out.innerHTML = `<div class="list-empty">${currentLang === 'fr' ? 'aucun résultat' : 'no results'}</div>`;
    return;
  }
  out.innerHTML = hits.map(r =>
    `<div class="search-result">
       <div class="search-result-info">
         <div class="email-from">${r.from}</div>
         <div class="email-subject">${r.subject}</div>
         <div class="email-snippet">${(r.body || '').slice(0, 90)}</div>
       </div>
       <button class="read-btn" onclick="jumpToEmail(${r.id})">${currentLang === 'fr' ? 'LIRE →' : 'READ →'}</button>
     </div>`
  ).join('');
}

function jumpToEmail(id) {
  const e = emails.find(x => x.id === id);
  if (!e) return;
  currentSection  = e.section;
  currentCategory = e.category || null;
  selectedEmailId = id;
  const hash = e.category ? `${e.section}-${e.category}` : e.section;
  window.location.hash = hash;
}

function renderSectionPlaceholder(sec) {
  const map = {
    sent:    { en: 'OUTGOING TRANSMISSIONS',  fr: 'TRANSMISSIONS ENVOYÉES' },
    drafts:  { en: 'UNHARDENED FRAGMENTS',    fr: 'FRAGMENTS NON DURCIS'   },
    archive: { en: 'BURIED CORRESPONDENCE',   fr: 'CORRESPONDANCE ENTERRÉE' },
  };
  const title = (map[sec] || { en: sec, fr: sec })[currentLang] || sec.toUpperCase();
  return `<div class="home-panel">
            <img src="m_${sec}.png" class="home-logo" alt="" onerror="this.style.display='none'">
            <h1 class="home-headline">${title}</h1>
            <p class="home-body">← ${currentLang === 'fr' ? 'choisissez un message dans la liste.' : 'pick a message from the list.'}</p>
          </div>`;
}

/* ══════════════════════════════════════════════════════════
   TITLEBAR BUTTONS — moult, minimize, side panel
   ══════════════════════════════════════════════════════════ */
function moult() {
  const aw = document.querySelector('.app-window');
  if (aw) {
    aw.style.animation = 'holo-shift 0.42s ease forwards';
    setTimeout(() => {
      if (aw) aw.style.animation = 'console-breathe 10s ease-in-out infinite';
    }, 460);
  }
  burstSparkles(window.innerWidth / 2, window.innerHeight / 2, 22);
  // visual reload — re-render
  setTimeout(() => { updateUI(); buildTicker(); }, 240);
}

function minimizeConsole() {
  const layout = document.getElementById('console-layout');
  const restoreGif = document.getElementById('app-minimized-gif');
  if (!layout) return;
  consoleMinimized = !consoleMinimized;
  layout.classList.toggle('minimized', consoleMinimized);
  if (restoreGif) restoreGif.style.display = consoleMinimized ? 'flex' : 'none';
}
function restoreConsole() {
  const layout = document.getElementById('console-layout');
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

function openBerylism() {
  window.open('https://berylism.org', '_blank');
}

/* ══════════════════════════════════════════════════════════
   LANGUAGE TOGGLE
   ══════════════════════════════════════════════════════════ */
function updateLangToggle() {
  const icon  = document.getElementById('lang-toggle-icon');
  const label = document.getElementById('lang-toggle-label');
  if (!icon || !label) return;
  if (currentLang === 'en') {
    // Show franco-gascon flag → click to go FR
    icon.src = 'm_francogasconha.png';
    label.textContent = 'FR';
  } else {
    // Show world → click to go EN
    icon.src = 'm_world.png';
    label.textContent = 'INT';
  }
}

function toggleLanguage() {
  currentLang = (currentLang === 'en') ? 'fr' : 'en';
  document.body.classList.toggle('mode-fr', currentLang === 'fr');
  selectedEmailId = null;
  updateBranding();
  buildTicker();
  updateLangToggle();
  updateUI();
  // change app background by re-rendering — bg via .mode-fr class on body
  // refresh canvas mode
  stopBgCanvas('bg-canvas-app');
  initBgCanvas('bg-canvas-app', currentLang, 'normal');
  burstSparkles(window.innerWidth - 60, 22, 14);
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
   MOLTOK ASSISTANT — anemone hide, emerging crab, blblbl chat
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
  'blbl ... bl :)',
];

function generateBlblbl() {
  if (Math.random() < 0.14) return { type: 'gif' };
  if (Math.random() < 0.4) {
    return { type: 'text', content: moltokPresets[Math.floor(Math.random() * moltokPresets.length)] };
  }
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
  addUserMsg(text);
  const typing = addTypingIndicator();
  const delay = 720 + Math.random() * 1100;
  setTimeout(() => {
    if (typing.parentNode) typing.remove();
    addMoltokMsg(generateBlblbl());
  }, delay);
}

function addUserMsg(text) {
  const msgs = document.getElementById('moltok-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className   = 'moltok-msg user';
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function addMoltokMsg(response) {
  const msgs = document.getElementById('moltok-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  if (response.type === 'gif') {
    d.className = 'moltok-msg moltok gif';
    const img   = document.createElement('img');
    img.src       = 'koolkrab.gif';
    img.alt       = '';
    img.className = 'moltok-koolkrab';
    d.appendChild(img);
  } else {
    d.className   = 'moltok-msg moltok';
    d.textContent = response.content;
  }
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTypingIndicator() {
  const msgs = document.getElementById('moltok-messages');
  const d    = document.createElement('div');
  d.className = 'moltok-msg moltok moltok-typing';
  d.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

/* ══════════════════════════════════════════════════════════
   CLICK FX — claw echo + sparkle bursts
   ══════════════════════════════════════════════════════════ */
document.addEventListener('mousedown', function (e) {
  // ignore inputs and the anemone (handled separately)
  if (e.target.matches('input, textarea')) return;
  // claw echo
  const fx = document.createElement('div');
  fx.className  = 'cursor-click-fx';
  fx.style.left = e.clientX + 'px';
  fx.style.top  = e.clientY + 'px';
  document.body.appendChild(fx);
  setTimeout(() => { if (fx.parentNode) fx.remove(); }, 520);
  // sparkles on certain clicks
  if (e.target.closest('button, .nav-item, .nav-sub-item, .email-item, .char-card, .search-result, .moltok-anchor, .demiurge-header, .lang-toggle, .moult-btn, .side-borg-btn, .win-btn, .close-btn')) {
    burstSparkles(e.clientX, e.clientY, 7);
  }
});

function burstSparkles(x, y, n = 8) {
  const types = ['', 'hot', 'cool'];
  for (let i = 0; i < n; i++) {
    const sp = document.createElement('div');
    const t = types[Math.floor(Math.random() * types.length)];
    sp.className = 'sparkle' + (t ? ' ' + t : '');
    sp.style.left = x + 'px';
    sp.style.top  = y + 'px';
    const angle = (Math.PI * 2) * (i / n) + Math.random() * 0.6;
    const dist  = 28 + Math.random() * 48;
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
  initBgCanvas('bg-canvas', currentLang, 'login');
});
