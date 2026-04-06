/* ================================================================
   MOULTLOOK — script.js v10.0
   Canvas: holographic glitch only (no scan line)
           — fires on login/loading too, more frequently
   Custom popup replaces confirm() for language switch + moult
   ================================================================ */
'use strict';

let currentLang     = 'en';
let currentSection  = 'home';
let currentCategory = null;
let selectedEmailId = null;

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
   CANVAS — holographic glitch only
   isLoginScreen: fires more frequently (user is idle there)
   isApp:         fires rarely (reading experience)
══════════════════════════════════════════════════════════ */
const canvasRegistry = {};

/**
 * @param {string}  canvasId
 * @param {string}  mode          — 'en' | 'fr'
 * @param {boolean} isLoginScreen — shorter interval for login/loading
 */
function initBgCanvas(canvasId, mode, isLoginScreen = false) {
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

    /*  Holo glitch timing:
        login/loading  → every ~15–25 s  (user is waiting, good moment)
        app            → every ~60–90 s  (reading, should be rare)            */
    const baseCountdown = isLoginScreen
        ? 15 * 60 + Math.random() * 10 * 60
        : 60 * 60 + Math.random() * 30 * 60;

    let holoCountdown = baseCountdown;
    let holoFrame     = 0;
    let holoActive    = false;
    let holoSlices    = [];

    function buildHoloSlices(w, h) {
        holoSlices = [];
        let y = 0;
        while (y < h) {
            const sliceH = Math.random() * 28 + 4;
            holoSlices.push({
                y,
                h: sliceH,
                shift:  (Math.random() - 0.5) * 30,
                bright: 0.8 + Math.random() * 0.5,
            });
            y += sliceH;
        }
    }

    function draw() {
        const w = canvas.width, h = canvas.height;

        /* Transparent base — real background image shows through */
        ctx.clearRect(0, 0, w, h);

        /* ── Holographic glitch ── */
        holoCountdown--;

        if (!holoActive && holoCountdown <= 0) {
            holoActive    = true;
            holoFrame     = 0;
            holoCountdown = baseCountdown;
            buildHoloSlices(w, h);

            /* Animate app window via CSS (only if it exists / visible) */
            const aw = document.querySelector('.app-window');
            if (aw && document.getElementById('screen-app').style.display !== 'none') {
                aw.style.animation = 'holo-shift 0.42s ease forwards';
                setTimeout(() => {
                    if (aw) aw.style.animation = 'console-breathe 10s ease-in-out infinite';
                }, 460);
            }

            /* Also briefly jolt the login/loading window */
            const lw = document.querySelector('.login-window, .loading-window');
            if (lw) {
                lw.style.transition = 'transform 0.08s, filter 0.08s';
                lw.style.transform  = 'translateX(-3px)';
                lw.style.filter     = 'hue-rotate(20deg) brightness(1.2)';
                setTimeout(() => {
                    lw.style.transform  = 'translateX(3px)';
                    lw.style.filter     = 'hue-rotate(-12deg)';
                }, 80);
                setTimeout(() => {
                    lw.style.transform  = '';
                    lw.style.filter     = '';
                    lw.style.transition = '';
                }, 160);
            }
        }

        if (holoActive) {
            const fade = Math.max(0, 1 - holoFrame / 14);

            ctx.save();
            /* Colour aberration stripes */
            ctx.globalAlpha = 0.10 * fade;
            const glitchCol = mode === 'en'
                ? `rgba(232,160,40, 0.9)`
                : `rgba(32,200,176, 0.9)`;
            for (const sl of holoSlices) {
                if (Math.random() < 0.6) continue;
                ctx.fillStyle = glitchCol;
                ctx.fillRect(0, sl.y, w, sl.h);
            }

            /* Sharp bright line flashes */
            if (holoFrame < 7) {
                ctx.globalAlpha = (0.45 - holoFrame * 0.06) * fade;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth   = 1;
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

window.addEventListener('load', () => initBgCanvas('bg-canvas', currentLang, true));


/* ══════════════════════════════════════════════════════════
   CUSTOM POPUP — replaces native confirm()
   showPopup(options) → Promise<boolean>
   options: {
     title:       string  (titlebar text)
     question:    string  (main italic serif question)
     footnote:    string  (fine-print sub-text, the asterisk joke)
     translation: string  (French translation of question)
     transNote:   string  (French translation of footnote)
     confirmText: string
     cancelText:  string
   }
══════════════════════════════════════════════════════════ */
function showPopup(opts) {
    return new Promise(resolve => {
        /* Remove any existing popup */
        const existing = document.getElementById('moult-popup');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id        = 'moult-popup';
        overlay.className = 'popup-overlay';

        overlay.innerHTML = `
            <div class="popup-window">
                <div class="popup-titlebar">
                    <div class="win-btn-group">
                        <div class="win-btn" style="background:var(--tl-close);box-shadow:0 0 5px var(--tl-close);border-radius:50%;width:12px;height:12px;"></div>
                        <div class="win-btn" style="background:var(--tl-min);box-shadow:0 0 5px var(--tl-min);border-radius:50%;width:12px;height:12px;"></div>
                        <div class="win-btn" style="background:var(--tl-max);box-shadow:0 0 5px var(--tl-max);border-radius:50%;width:12px;height:12px;"></div>
                    </div>
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
                        <button class="popup-btn popup-btn-cancel" id="popup-cancel">${opts.cancelText || 'Non'}</button>
                        <button class="popup-btn popup-btn-confirm" id="popup-confirm">${opts.confirmText || 'Oui'}</button>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        /* Close on overlay click */
        overlay.addEventListener('click', e => {
            if (e.target === overlay) { overlay.remove(); resolve(false); }
        });
        document.getElementById('popup-cancel').addEventListener('click', () => {
            overlay.remove(); resolve(false);
        });
        document.getElementById('popup-confirm').addEventListener('click', () => {
            overlay.remove(); resolve(true);
        });
        /* Keyboard */
        const onKey = e => {
            if (e.key === 'Enter')  { document.removeEventListener('keydown', onKey); overlay.remove(); resolve(true);  }
            if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); overlay.remove(); resolve(false); }
        };
        document.addEventListener('keydown', onKey);
    });
}


/* ══════════════════════════════════════════════════════════
   LOADING / NAVIGATION
══════════════════════════════════════════════════════════ */
function startLoading(lang) {
    currentLang = lang;
    const isSwitching = document.getElementById('screen-app').style.display !== 'none';

    document.getElementById('screen-login').style.display   = 'none';
    document.getElementById('screen-app').style.display     = 'none';
    document.getElementById('screen-loading').style.display = 'flex';
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

    const lBar = document.getElementById('loading-titlebar-text');
    if (lBar) lBar.innerText = lang === 'en'
        ? 'system initialisation — moultlook v1.0'
        : 'initialisation du système — moultlook v1.0';
    const lTitle = document.getElementById('loading-title');
    if (lTitle) lTitle.innerText = lang === 'en' ? 'HARDENING CHITIN...' : 'MUE EN COURS...';
    document.getElementById('banner-text').innerText = bannerContent[lang];

    stopBgCanvas('bg-canvas');
    initBgCanvas('bg-canvas-loading', lang, true);
    animateProgress(lang);

    setTimeout(() => {
        stopBgCanvas('bg-canvas-loading');
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display     = 'flex';
        initBgCanvas('bg-canvas-app', lang, false);
        if (!isSwitching) window.location.hash = 'home';
        handleRouting(); updateUI();
    }, isSwitching ? 3000 : 2800);
}

function animateProgress(lang) {
    const bar  = document.getElementById('progress-bar');
    const sub  = document.getElementById('loading-sub');
    const msgs = ({
        en: ['initialising chitin protocols...', 'loading crustacean database...',
             'establishing shell integrity...', 'decoding demiurge signals...',
             'compiling subjective reality...', 'ready.'],
        fr: ['initialisation des protocoles chitineux...',
             'chargement de la base de données gasconne...',
             'vérification de l\'intégrité de la carapace...',
             'décodage des signaux démiurgiques...', 'prêt.'],
    })[lang] || [];
    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0] || '';
    const iv = setInterval(() => {
        progress = Math.min(100, progress + Math.random() * 18 + 8);
        if (bar) bar.style.width = progress + '%';
        const ti = Math.min(Math.floor((progress / 100) * msgs.length), msgs.length - 1);
        if (ti > msgIdx) { msgIdx = ti; if (sub) sub.innerText = msgs[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length - 1]; clearInterval(iv); }
    }, 400);
}


/* ══════════════════════════════════════════════════════════
   LANGUAGE SWITCH — custom popup, bilingual wit
══════════════════════════════════════════════════════════ */
async function toggleLanguage() {
    const goingToFr = currentLang === 'en';

    const opts = goingToFr
        ? {
            title:       'destination: gascogne',
            question:    'do you really want to go to France?',
            footnote:    '* france: free gascony',
            translation: 'veux-tu vraiment aller en France ?',
            transNote:   '* france : libérez la Gascogne',
            confirmText: 'oui, allons-y',
            cancelText:  'actually, no',
          }
        : {
            title:       'destination: civilisation',
            question:    'do you really want to leave civilisation?',
            footnote:    '* civilisation: free gascony',
            translation: 'veux-tu vraiment quitter la civilisation ?',
            transNote:   '* civilisation : libérez la Gascogne',
            confirmText: 'yes, sadly',
            cancelText:  'non, reste',
          };

    const confirmed = await showPopup(opts);
    if (confirmed) startLoading(goingToFr ? 'fr' : 'en');
}


/* ══════════════════════════════════════════════════════════
   MOULT — also gets a custom popup
══════════════════════════════════════════════════════════ */
async function moult() {
    const isFr = currentLang === 'fr';
    const opts = {
        title:       isFr ? 'muer' : 'moult',
        question:    isFr ? 'jeter la carapace ?' : 'discard shell?',
        footnote:    isFr ? '* cela rechargera la page' : '* this will reload the page',
        translation: isFr ? 'discard shell?' : 'jeter la carapace ?',
        transNote:   isFr ? '* this will reload' : '* cela rechargera',
        confirmText: isFr ? 'oui, mue !' : 'moult.',
        cancelText:  isFr ? 'non' : 'not yet',
    };
    const confirmed = await showPopup(opts);
    if (confirmed) location.reload();
}


/* ══════════════════════════════════════════════════════════
   UI RENDERING
══════════════════════════════════════════════════════════ */
function updateUI() {
    renderSidebar();
    const middleRow = document.getElementById('email-list');
    const langBtn   = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.innerText = currentLang === 'en' ? '🐟 CRABE M\'A TUER' : '🌐 INTERNATIONAL';
    const titleEl = document.getElementById('app-win-title');
    if (titleEl) {
        let t = 'MOULTLOOK — ' + currentSection.toUpperCase();
        if (currentCategory) t += ' › ' + currentCategory.toUpperCase();
        titleEl.innerText = t;
    }
    if (['home', 'shell', 'search'].includes(currentSection)) {
        middleRow.style.display = 'none';
        if (currentSection === 'search') renderSearchView(); else renderStaticContent();
    } else {
        middleRow.style.display = 'flex';
        middleRow.style.flexDirection = 'column';
        renderEmailList(); renderEmailContent();
    }
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const menus = {
        en: { home:'🏠 HOME', unread:'🆕 UNREAD', search:'🔍 SEARCH',
              inbox:'📥 INBOX', sent:'📤 SENT', drafts:'📝 DRAFTS',
              archive:'🗄️ ARCHIVE', shell:'🐚 YOUR SHELL' },
        fr: { home:'🏠 ADISHATZ', search:'🔍 RECHERCHER',
              inbox:'📥 REÇUS', sent:'📤 ENVOYÉS', archive:'🗄️ ARCHIVE' },
    };
    let html = '';
    for (const [key, label] of Object.entries(menus[currentLang])) {
        html += `<div class="nav-item ${currentSection===key?'active':''}" onclick="navigate('${key}')"><span class="txt">${label}</span></div>`;
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
        container.innerHTML = `<div style="padding:14px;font-family:var(--font-mono);font-size:16px;color:var(--text-dimmer);letter-spacing:.08em;">[ empty ]</div>`;
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
            name: email.from, catchphrase: '',
            image: 'https://via.placeholder.com/42x42/1C0C08/E8A028?text=?',
        };
        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') bodyContent = `<iframe src="${email.url}" width="100%" height="520px"></iframe>`;
        view.innerHTML = `
            <div class="mini-profile">
                <img src="${demi.image}" class="mini-img" alt="${demi.name}">
                <div><strong>${demi.name}</strong><small>${demi.catchphrase}</small></div>
            </div>
            <div class="email-container">
                <div class="close-btn" onclick="closeEmail()">[ × ]</div>
                <div class="email-header"><h2>${email.subject}</h2><p>${email.date} // ${email.from}</p></div>
                <hr>${bodyContent}
            </div>`;
    } else if (currentCategory && currentLang === 'en') {
        const demi = demiurges[currentCategory];
        view.innerHTML = `
            <div class="demiurge-profile">
                <h2>${demi.name}</h2>
                <p class="demi-quote">"${demi.catchphrase}"</p><hr>
                <p>${demi.description}</p>
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
    const nr = currentLang === 'en' ? `no results for "${q}".` : `aucun résultat pour "${q}".`;
    let html = `<div class="results-grid">`;
    if (!results.length) html += `<p style="font-family:var(--font-mono);color:var(--text-dim);font-size:17px;">${nr}</p>`;
    results.forEach(r => {
        html += `<div class="search-card"><h3>${r.subject}</h3>
            <p>${r.body.substring(0,110)}...</p>
            <button class="read-btn" onclick="jumpToEmail(${r.id})">READ →</button></div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
    const view = document.getElementById('content-view');
    if (currentSection === 'home') {
        view.innerHTML = `<div class="home-panel"><h2>// System //</h2><hr><p>${homeContent[currentLang]}</p></div>`;
    } else if (currentSection === 'shell') {
        view.innerHTML = shellContent;
    }
}

function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id)  { selectedEmailId = id;   updateUI(); }
function closeEmail()     { selectedEmailId = null; updateUI(); }
function jumpToEmail(id)  {
    const e = emails.find(x => x.id === id); if (!e) return;
    selectedEmailId = id; navigate(e.section, e.category);
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
