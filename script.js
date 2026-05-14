/* ================================================================
MOULTLOOK — script.js v14.0
Shade system. Real avatars + signs. Contact cards. Banners & logos.
Session.gif dedup. Banner auto-retract. Claw cursor FX.
================================================================ */
'use strict';

/* ── State ─────────────────────────────────────────────────── */
let currentLang    = 'en';
let currentSection = 'home';
let currentCategory   = null;
let selectedEmailId   = null;
let loginConsoleOpen  = false;
let consoleMinimized  = false;
let sidePanelOpen     = false;
let clockRafId        = null;

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
CANVAS — holographic glitch
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

  const baseFrames = glitchMode === 'intense' ? 60 + Math.random() * 120
    : glitchMode === 'login'  ? 15 * 60 + Math.random() * 10 * 60
    : 60 * 60 + Math.random() * 30 * 60;

  let holoCountdown = baseFrames;
  let holoFrame = 0, holoActive = false, holoSlices = [];

  function buildSlices(w, h) {
    holoSlices = [];
    let y = 0;
    while (y < h) { const sh = Math.random() * 28 + 4; holoSlices.push({ y, h: sh }); y += sh; }
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    holoCountdown--;
    if (!holoActive && holoCountdown <= 0) {
      holoActive = true; holoFrame = 0;
      holoCountdown = glitchMode === 'intense' ? 60 + Math.random() * 120
        : glitchMode === 'login' ? 15 * 60 + Math.random() * 10 * 60
        : 60 * 60 + Math.random() * 30 * 60;
      buildSlices(w, h);

      const aw = document.querySelector('.app-window');
      if (aw && document.getElementById('screen-app').style.display !== 'none') {
        aw.style.animation = 'holo-shift 0.42s ease forwards';
        setTimeout(() => { if (aw) aw.style.animation = 'console-breathe 10s ease-in-out infinite'; }, 460);
      }
      const lw = document.querySelector('.login-window, .loading-window');
      if (lw) {
        lw.style.transition = 'transform 0.08s, filter 0.08s';
        lw.style.transform  = `translateX(${glitchMode === 'intense' ? -6 : -3}px)`;
        lw.style.filter     = 'hue-rotate(20deg) brightness(1.2)';
        setTimeout(() => {
          lw.style.transform = `translateX(${glitchMode === 'intense' ? 7 : 3}px)`;
          lw.style.filter    = 'hue-rotate(-12deg)';
        }, glitchMode === 'intense' ? 60 : 80);
        setTimeout(() => { lw.style.transform = lw.style.filter = lw.style.transition = ''; },
          glitchMode === 'intense' ? 130 : 165);
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

window.addEventListener('load', () => {
  initBgCanvas('bg-canvas', currentLang, 'login');
  updateBranding();
});

/* ══════════════════════════════════════════════════════════
BRANDING — banners + logos switch by lang
══════════════════════════════════════════════════════════ */
function updateBranding() {
  const landingBanner = document.getElementById('login-banner-img');
  if (landingBanner && typeof banners !== 'undefined')
    landingBanner.src = banners.main;

  const appBanner = document.getElementById('app-banner-img');
  if (appBanner && typeof banners !== 'undefined')
    appBanner.src = banners[currentLang] || banners.main;

  const sideLogo = document.getElementById('side-logo-img');
  if (sideLogo && typeof logos !== 'undefined')
    sideLogo.src = logos[currentLang] || logos.main;

  const sidebarLogo = document.getElementById('sidebar-logo-img');
  if (sidebarLogo && typeof logos !== 'undefined')
    sidebarLogo.src = logos[currentLang] || logos.main;
}

/* ══════════════════════════════════════════════════════════
BANNER AUTO-RETRACT
Shows full for 4.2s after load/lang switch, then collapses
to a glowing hairline. Hover or click to re-expand briefly.
══════════════════════════════════════════════════════════ */
function scheduleBannerRetract() {
  const strip = document.getElementById('app-banner-strip');
  if (!strip) return;
  strip.classList.remove('retracted');
  clearTimeout(strip._retractTimer);
  strip._retractTimer = setTimeout(() => strip.classList.add('retracted'), 4200);
}

/* ══════════════════════════════════════════════════════════
LOGIN GIF — hide floating trigger when console opens
══════════════════════════════════════════════════════════ */
function toggleLoginConsole() {
  loginConsoleOpen = !loginConsoleOpen;
  const cons = document.getElementById('login-console');
  const trig = document.getElementById('login-trigger');

  if (loginConsoleOpen) {
    if (trig) trig.style.display = 'none';
    cons.style.display    = 'flex';
    cons.style.animation  = 'glitch-manifest 0.58s ease forwards';
  } else {
    cons.style.animation = 'glitch-dismiss 0.38s ease forwards';
    setTimeout(() => {
      cons.style.display = 'none';
      if (trig) trig.style.display = 'block';
    }, 360);
  }
}

/* ══════════════════════════════════════════════════════════
TRAFFIC LIGHT BUTTONS (crab-coloured)
══════════════════════════════════════════════════════════ */
function minimizeConsole() {
  consoleMinimized = true;
  if (sidePanelOpen) _closeSidePanelImmediate();
  document.getElementById('btn-blue').classList.add('active');

  const appWin     = document.getElementById('app-window');
  const banner     = document.getElementById('scrolling-banner');
  const restore    = document.getElementById('app-minimized-gif');
  const layout     = document.getElementById('console-layout');
  const footer     = document.querySelector('.mirror-footer');
  const bannerStrip = document.getElementById('app-banner-strip');

  appWin.style.animation  = 'glitch-dismiss 0.38s ease forwards';
  banner.style.animation  = 'glitch-dismiss 0.28s ease forwards';
  if (footer) footer.style.opacity = '0';

  setTimeout(() => {
    appWin.style.display      = 'none';
    banner.style.display      = 'none';
    layout.style.display      = 'none';
    if (bannerStrip) bannerStrip.style.display = 'none';
    if (footer)      footer.style.display      = 'none';
    restore.style.display    = 'block';
    restore.style.animation  = 'gif-float 3.5s ease-in-out infinite, gif-glitch 8s infinite';
  }, 360);
}

function restoreConsole() {
  consoleMinimized = false;
  document.getElementById('btn-blue').classList.remove('active');

  const appWin     = document.getElementById('app-window');
  const banner     = document.getElementById('scrolling-banner');
  const restore    = document.getElementById('app-minimized-gif');
  const layout     = document.getElementById('console-layout');
  const footer     = document.querySelector('.mirror-footer');
  const bannerStrip = document.getElementById('app-banner-strip');

  restore.style.display  = 'none';
  layout.style.display   = 'flex';
  appWin.style.display   = 'flex';
  banner.style.display   = 'block';
  if (bannerStrip) bannerStrip.style.display = 'flex';
  if (footer)      { footer.style.display = 'block'; footer.style.opacity = '1'; }

  appWin.style.animation  = 'glitch-manifest 0.55s ease forwards';
  banner.style.animation  = '';
  banner.style.opacity    = '1';
}

function toggleSidePanel() {
  sidePanelOpen ? _closeSidePanel() : _openSidePanel();
}
function _openSidePanel() {
  sidePanelOpen = true;
  document.getElementById('btn-yellow').classList.add('active');
  document.getElementById('console-layout').classList.add('with-side-panel');
  const panel = document.getElementById('side-panel');
  panel.style.display   = 'flex';
  panel.style.animation = 'side-manifest 0.55s ease forwards';
  startClock();
}
function _closeSidePanel() {
  sidePanelOpen = false;
  document.getElementById('btn-yellow').classList.remove('active');
  const panel = document.getElementById('side-panel');
  panel.style.animation = 'side-dismiss 0.38s ease forwards';
  setTimeout(() => {
    panel.style.display = 'none';
    document.getElementById('console-layout').classList.remove('with-side-panel');
  }, 360);
  stopClock();
}
function _closeSidePanelImmediate() {
  sidePanelOpen = false;
  document.getElementById('btn-yellow').classList.remove('active');
  document.getElementById('side-panel').style.display = 'none';
  document.getElementById('console-layout').classList.remove('with-side-panel');
  stopClock();
}

/* ══════════════════════════════════════════════════════════
SIDE PANEL CLOCK
══════════════════════════════════════════════════════════ */
function startClock() {
  if (clockRafId) return;
  function tick() {
    if (!sidePanelOpen) { clockRafId = null; return; }
    const now = new Date();
    const pad = (n, d=2) => String(n).padStart(d, '0');
    const el = document.getElementById('side-clock');
    if (el) el.innerText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(),3)}`;
    const de = document.getElementById('side-date');
    if (de) de.innerText = now.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    clockRafId = requestAnimationFrame(tick);
  }
  clockRafId = requestAnimationFrame(tick);
}
function stopClock() { if (clockRafId) { cancelAnimationFrame(clockRafId); clockRafId = null; } }

/* ══════════════════════════════════════════════════════════
BERYLISM LINK
══════════════════════════════════════════════════════════ */
async function openBerylism() {
  const confirmed = await showPopup({
    title: 'transmission: berylism.org',
    question: 'open berylism.org?',
    footnote: 'you are about to leave moultlook',
    translation: 'ouvrir berylism.org ?',
    transNote: 'vous quittez moultlook',
    confirmText: 'transmit',
    cancelText: 'stay',
  });
  if (confirmed) window.open('https://berylism.org', '_blank');
}

/* ══════════════════════════════════════════════════════════
CUSTOM POPUP
══════════════════════════════════════════════════════════ */
function showPopup(opts) {
  return new Promise(resolve => {
    const existing = document.getElementById('moult-popup');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'moult-popup';
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
      <div class="popup-window">
        <div class="popup-titlebar">
          <span class="popup-title-text">${opts.title || 'system prompt'}</span>
        </div>
        <div class="popup-body">
          <p class="popup-main">${opts.question}</p>
          ${opts.footnote ? `<p class="popup-footnote">${opts.footnote}</p>` : ''}
          <div class="popup-hr"></div>
          <p class="popup-translation">
            ${opts.translation || ''}
            ${opts.transNote ? `<small>${opts.transNote}</small>` : ''}
          </p>
          <div class="popup-buttons">
            <button class="popup-btn popup-btn-cancel"  id="popup-cancel">${opts.cancelText  || 'non'}</button>
            <button class="popup-btn popup-btn-confirm" id="popup-confirm">${opts.confirmText || 'oui'}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const rr = val => { overlay.remove(); resolve(val); };
    overlay.addEventListener('click', e => { if (e.target === overlay) rr(false); });
    document.getElementById('popup-cancel').addEventListener('click',  () => rr(false));
    document.getElementById('popup-confirm').addEventListener('click', () => rr(true));
    const onKey = e => {
      if (e.key === 'Enter')  { document.removeEventListener('keydown', onKey); rr(true);  }
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); rr(false); }
    };
    document.addEventListener('keydown', onKey);
  });
}

/* ══════════════════════════════════════════════════════════
LOADING & LANGUAGE SWITCH
══════════════════════════════════════════════════════════ */
function startLoading(lang) {
  currentLang = lang;
  const isSwitching = document.getElementById('screen-app').style.display !== 'none';

  document.getElementById('screen-login').style.display   = 'none';
  document.getElementById('screen-app').style.display     = 'none';
  document.getElementById('screen-loading').style.display = 'flex';
  document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

  const lBar  = document.getElementById('loading-titlebar-text');
  const lTitle = document.getElementById('loading-title');
  if (lBar)   lBar.innerText   = lang === 'en' ? 'system initialisation — moultlook v1.0' : 'initialisation du système — moultlook v1.0';
  if (lTitle) lTitle.innerText = lang === 'en' ? 'HARDENING CHITIN...' : 'MUE EN COURS...';
  document.getElementById('banner-text').innerText = bannerContent[lang];

  stopBgCanvas('bg-canvas');
  const glitchMode = isSwitching ? 'intense' : 'login';
  initBgCanvas('bg-canvas-loading', lang, glitchMode);

  if (isSwitching) {
    const lw = document.querySelector('.loading-window');
    if (lw) { lw.classList.add('intense-glitching'); setTimeout(() => lw.classList.remove('intense-glitching'), 2800); }
  }

  animateProgress(lang);

  setTimeout(() => {
    stopBgCanvas('bg-canvas-loading');
    document.getElementById('screen-loading').style.display = 'none';
    document.getElementById('screen-app').style.display     = 'flex';

    consoleMinimized = false;
    sidePanelOpen    = false;

    const appWin     = document.getElementById('app-window');
    const banner     = document.getElementById('scrolling-banner');
    const layout     = document.getElementById('console-layout');
    const restore    = document.getElementById('app-minimized-gif');
    const footer     = document.querySelector('.mirror-footer');
    const bannerStrip = document.getElementById('app-banner-strip');
    const sp         = document.getElementById('side-panel');
    const btnBlue    = document.getElementById('btn-blue');
    const btnYellow  = document.getElementById('btn-yellow');

    if (appWin)      { appWin.style.display = 'flex'; appWin.style.animation = 'console-breathe 10s ease-in-out infinite'; }
    if (banner)      { banner.style.display = 'block'; banner.style.animation = ''; banner.style.opacity = '1'; }
    if (layout)      { layout.style.display = 'flex'; layout.classList.remove('with-side-panel'); }
    if (bannerStrip) bannerStrip.style.display = 'flex';
    if (restore)     restore.style.display = 'none';
    if (footer)      { footer.style.display = 'block'; footer.style.opacity = '1'; }
    if (sp)          sp.style.display = 'none';
    if (btnBlue)     btnBlue.classList.remove('active');
    if (btnYellow)   btnYellow.classList.remove('active');

    initBgCanvas('bg-canvas-app', lang, 'normal');
    updateBranding();
    scheduleBannerRetract();

    if (!isSwitching) window.location.hash = 'home';
    handleRouting();
    updateUI();
  }, isSwitching ? 3200 : 2800);
}

function animateProgress(lang) {
  const bar = document.getElementById('progress-bar');
  const sub = document.getElementById('loading-sub');
  const msgs = ({
    en: ['initialising chitin protocols...','loading crustacean database...','establishing shell integrity...','decoding demiurge signals...','compiling subjective reality...','ready.'],
    fr: ['initialisation des protocoles chitineux...','chargement de la base de données gasconne...','vérification de l\'intégrité de la carapace...','décodage des signaux démiurgiques...','prêt.'],
  })[lang] || [];
  let progress = 0, msgIdx = 0;
  if (bar) bar.style.width = '0%';
  if (sub) sub.innerText  = msgs[0] || '';
  const iv = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 18 + 8);
    if (bar) bar.style.width = progress + '%';
    const ti = Math.min(Math.floor((progress / 100) * msgs.length), msgs.length - 1);
    if (ti > msgIdx) { msgIdx = ti; if (sub) sub.innerText = msgs[msgIdx]; }
    if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length - 1]; clearInterval(iv); }
  }, 400);
}

/* ══════════════════════════════════════════════════════════
LANGUAGE TOGGLE
══════════════════════════════════════════════════════════ */
async function toggleLanguage() {
  const goingToFr = currentLang === 'en';
  const confirmed = await showPopup(goingToFr
    ? { title:'destination: gascogne', question:'do you really want to go to France?',
        footnote:'* france : gascogne libre', translation:'veux-tu vraiment aller en France ?',
        transNote:'* france : gascogne libre', confirmText:'oui, allons-y', cancelText:'actually, no' }
    : { title:'destination: civilisation', question:'do you really want to leave civilisation?',
        footnote:'* civilisation : gascogne libre', translation:'veux-tu vraiment quitter la civilisation ?',
        transNote:'* civilisation : gascogne libre', confirmText:'yes, sadly', cancelText:'non, reste' });
  if (confirmed) startLoading(goingToFr ? 'fr' : 'en');
}

/* ══════════════════════════════════════════════════════════
MOULT
══════════════════════════════════════════════════════════ */
async function moult() {
  const isFr = currentLang === 'fr';
  const confirmed = await showPopup({
    title:       isFr ? 'muer'              : 'moult',
    question:    isFr ? 'jeter la carapace ?' : 'discard shell?',
    footnote:    isFr ? '* rechargera la page' : '* this will reload',
    translation: isFr ? 'discard shell?'    : 'jeter la carapace ?',
    transNote:   isFr ? '* this will reload' : '* rechargera la page',
    confirmText: isFr ? 'oui, mue !'        : 'moult.',
    cancelText:  isFr ? 'non'               : 'not yet',
  });
  if (confirmed) location.reload();
}

/* ══════════════════════════════════════════════════════════
UI RENDERING
══════════════════════════════════════════════════════════ */
function updateUI() {
  renderSidebar();

  const middleRow = document.getElementById('email-list');
  const langBtn   = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.innerHTML = currentLang === 'en'
    ? '<img src="m_france.png" class="nav-icon" alt=""> CRABE M\'A TUER'
    : '<img src="m_world.png"  class="nav-icon" alt=""> INTERNATIONAL';

  const titleEl = document.getElementById('app-win-title');
  if (titleEl) {
    let t = 'MOULTLOOK — ' + currentSection.toUpperCase();
    if (currentCategory) t += ' › ' + currentCategory.toUpperCase();
    titleEl.innerText = t;
  }

  if (['home','shell','search'].includes(currentSection)) {
    middleRow.style.display = 'none';
    if (currentSection === 'search') renderSearchView();
    else renderStaticContent();
  } else {
    middleRow.style.display       = 'flex';
    middleRow.style.flexDirection = 'column';
    renderEmailList();
    renderEmailContent();
  }
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const menus = {
    en: {
      home:    '<img src="m_home.png"             class="nav-icon" alt=""> HOME',
      unread:  '<img src="m_unread_detailed.png"  class="nav-icon" alt=""> UNREAD',
      search:  '<img src="m_search.png"           class="nav-icon" alt=""> SEARCH',
      inbox:   '<img src="m_inbox.png"            class="nav-icon" alt=""> INBOX',
      sent:    '<img src="m_sent.png"             class="nav-icon" alt=""> SENT',
      drafts:  '<img src="m_drafts.png"           class="nav-icon" alt=""> DRAFTS',
      archive: '<img src="m_archive.png"          class="nav-icon" alt=""> ARCHIVE',
      shell:   '<img src="m_shell.png"            class="nav-icon" alt=""> YOUR SHELL',
    },
    fr: {
      home:    '<img src="m_gascony.png"  class="nav-icon" alt=""> ADISHATZ',
      search:  '<img src="m_search.png"  class="nav-icon" alt=""> RECHERCHER',
      inbox:   '<img src="m_inbox.png"   class="nav-icon" alt=""> REÇUS',
      sent:    '<img src="m_sent.png"    class="nav-icon" alt=""> ENVOYÉS',
      archive: '<img src="m_archive.png" class="nav-icon" alt=""> ARCHIVE',
    },
  };

  let html = '';
  for (const [key, label] of Object.entries(menus[currentLang])) {
    html += `<div class="nav-item ${currentSection===key?'active':''}" onclick="navigate('${key}')">
               <span class="txt">${label}</span>
             </div>`;
    if (key === 'inbox' && currentLang === 'en') {
      html += `<div class="nav-sub">` +
        ['patriarchy','imperialism','capitalism','notes'].map(c =>
          `<div class="${currentCategory===c?'active':''}" onclick="navigate('inbox','${c}')">↳ ${c}</div>`
        ).join('') + `</div>`;
    }
  }
  nav.innerHTML = html;
}

function renderEmailList() {
  const container = document.getElementById('email-list');
  let list = emails.filter(e =>
    e.lang === currentLang &&
    e.section === (currentSection === 'unread' ? 'inbox' : currentSection)
  );
  if (currentCategory && currentLang === 'en') list = list.filter(e => e.category === currentCategory);
  if (currentSection === 'unread' && !selectedEmailId && list.length > 0) selectedEmailId = list[0].id;

  if (!list.length) {
    container.innerHTML = `<div class="empty-list">[ empty ]</div>`;
    return;
  }
  container.innerHTML = list.map(e => `
    <div class="email-item ${selectedEmailId===e.id?'active':''}" onclick="selectEmail(${e.id})">
      <strong>${e.subject}</strong>
      <small>${e.from} | ${e.date}</small>
    </div>`).join('');
}

function renderEmailContent() {
  const view = document.getElementById('content-view');

  if (selectedEmailId) {
    const email = emails.find(e => e.id === selectedEmailId);
    const demi  = demiurges[email.category] || {
      name: email.from, catchphrase: '', status: 'Unknown',
      image: 'avatar_self.png', sign: 'm_selfsign.png',
    };
    let bodyContent = `<div class="email-body">${email.body}</div>`;
    if (email.type === 'pdf')
      bodyContent = `<div class="email-body"><iframe src="${email.url}" width="100%" height="520px" style="border:none;"></iframe></div>`;

    const signHtml = demi.sign ? `<img src="${demi.sign}" class="email-sign" alt="">` : '';

    view.innerHTML = `
      <div class="mini-profile">
        <img src="${demi.image}" class="mini-img" alt="${demi.name}">
        <div>
          <strong>${demi.name}</strong>
          <small>${demi.catchphrase}</small>
        </div>
      </div>
      <div class="email-container">
        <div class="email-header">
          ${signHtml}
          <div class="close-btn" onclick="closeEmail()">[ × ]</div>
          <h2>${email.subject}</h2>
          <p>${email.date} // ${email.from}</p>
        </div>
        ${bodyContent}
      </div>`;

  } else if (currentCategory && currentLang === 'en') {
    const demi = demiurges[currentCategory];
    // Proper contact card
    view.innerHTML = `
      <div class="demiurge-profile">
        <div class="contact-card">
          <div class="contact-card-header">
            <img src="${demi.image}" class="contact-avatar" alt="${demi.name}">
            <div class="contact-header-text">
              <p class="contact-status">${demi.status || 'Online'}</p>
              <h2 class="contact-name">${demi.name}</h2>
              <p class="contact-quote">"${demi.catchphrase}"</p>
            </div>
          </div>
          <div class="contact-card-body">
            <p class="contact-description">${demi.description}</p>
          </div>
        </div>
      </div>`;

  } else {
    view.innerHTML = `<div class="empty-state">[ select an item to view ]</div>`;
  }
}

function renderSearchView() {
  const label = currentLang === 'en' ? 'Search the Database' : 'Rechercher';
  const ph    = currentLang === 'en' ? 'enter keyword...' : 'entrer un mot-clé...';
  const btn   = currentLang === 'en' ? 'EXECUTE' : 'CHERCHER';
  document.getElementById('content-view').innerHTML = `
    <div class="search-hero">
      <h1>${label}</h1>
      <div class="search-input-wrap">
        <input type="text" id="search-input" placeholder="${ph}"
          onkeyup="if(event.key==='Enter') executeSearch()">
        <button onclick="executeSearch()">${btn}</button>
      </div>
      <div id="search-results-area"></div>
    </div>`;
}

function executeSearch() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  if (!q) return;
  const results = emails.filter(e =>
    e.lang === currentLang &&
    (e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q))
  );
  const nr = currentLang === 'en'
    ? `no results for "${q}".`
    : `aucun résultat pour "${q}".`;

  let html = `<div class="results-grid">`;
  if (!results.length) {
    html += `<p class="search-empty">${nr}</p>`;
  } else {
    html += `<div class="search-results-header">
      <img src="m_searchresults.png" class="search-result-icon" alt="">
      <span>${results.length} ${results.length > 1 ? 'DISPATCHES' : 'DISPATCH'} FOUND</span>
    </div>`;
    results.forEach(r => {
      html += `<div class="search-card">
        <h3>${r.subject}</h3>
        <p>${r.body.substring(0,110)}...</p>
        <button class="read-btn" onclick="jumpToEmail(${r.id})">READ →</button>
      </div>`;
    });
  }
  document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
  const view = document.getElementById('content-view');
  if (currentSection === 'home') {
    if (currentLang === 'fr' && typeof homeAvatar !== 'undefined' && homeAvatar.fr) {
      view.innerHTML = `
        <div class="home-panel mode-fr-home">
          <img src="${homeAvatar.fr}" class="home-avatar" alt="">
          <div>
            <h2>// Adishatz //</h2>
            <hr>
            <p>${homeContent.fr}</p>
          </div>
        </div>`;
    } else {
      view.innerHTML = `
        <div class="home-panel">
          <h2>// System //</h2>
          <hr>
          <p>${homeContent[currentLang]}</p>
        </div>`;
    }
  } else if (currentSection === 'shell') {
    view.innerHTML = shellContent;
  }
}

/* ── Navigation helpers ─────────────────────────────────── */
function navigate(s, c = null) {
  selectedEmailId = null;
  window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id) { selectedEmailId = id; updateUI(); }
function closeEmail()    { selectedEmailId = null; updateUI(); }
function jumpToEmail(id) {
  const e = emails.find(x => x.id === id);
  if (!e) return;
  selectedEmailId = id;
  navigate(e.section, e.category);
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
});

/* ══════════════════════════════════════════════════════════
CLAW CURSOR CLICK FX
Spawns a tiny claw that pops and fades wherever you click
══════════════════════════════════════════════════════════ */
(function () {
  document.addEventListener('mousedown', function (e) {
    const fx = document.createElement('div');
    fx.className  = 'cursor-click-fx';
    fx.style.left = e.clientX + 'px';
    fx.style.top  = e.clientY + 'px';
    document.body.appendChild(fx);
    setTimeout(function () { if (fx.parentNode) fx.remove(); }, 500);
  });
})();

/* ══════════════════════════════════════════════════════════
BANNER STRIP — click on hairline to re-expand
══════════════════════════════════════════════════════════ */
(function () {
  const strip = document.getElementById('app-banner-strip');
  if (!strip) return;
  strip.addEventListener('click', function () {
    if (!strip.classList.contains('retracted')) return;
    strip.classList.remove('retracted');
    clearTimeout(strip._retractTimer);
    strip._retractTimer = setTimeout(() => strip.classList.add('retracted'), 5000);
  });
})();
