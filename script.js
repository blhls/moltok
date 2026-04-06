/* ================================================================
   MOULTLOOK — script.js v9.0
   Canvas: scan line only (alters wallpaper as it passes)
           + very rare holographic console glitch
   No sine waves. No particles.
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
   CANVAS — Scan line + rare holo glitch
   The canvas is transparent. It only draws:
   1. A horizontal line that slides top→bottom, leaving a
      brief brightness/colour-shift stripe on the wallpaper
   2. Occasional full-canvas glitch flash (very rare)
══════════════════════════════════════════════════════════ */

const canvasRegistry = {};

function initBgCanvas(canvasId, mode) {
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

    /* ── Scan line state ── */
    let scanY    = -10;
    const scanSpeed = 0.6;          /* pixels per frame — slow, deliberate */
    const trailH    = 60;           /* height of the brightening trail behind line */

    /* ── Holo glitch state — triggers every ~60–90s ── */
    let holoCountdown = 60 * 60 + Math.random() * 30 * 60;  /* ~60–90s at 60fps */
    let holoFrame     = 0;
    let holoActive    = false;
    /* Glitch line positions (random horizontal slices that shift) */
    let holoSlices    = [];

    function buildHoloSlices(w, h) {
        holoSlices = [];
        let y = 0;
        while (y < h) {
            const sliceH = Math.random() * 30 + 4;
            holoSlices.push({
                y, h: sliceH,
                shift: (Math.random() - 0.5) * 28,
                bright: 0.8 + Math.random() * 0.5,
            });
            y += sliceH;
        }
    }

    function draw() {
        const w = canvas.width, h = canvas.height;

        /* Fully transparent base */
        ctx.clearRect(0, 0, w, h);

        /* ── Scan line ── */
        scanY += scanSpeed;
        if (scanY > h + trailH) scanY = -trailH;

        /* Trail above the line — subtle brightness wash */
        if (scanY > 0) {
            const trailTop    = Math.max(0, scanY - trailH);
            const trailBottom = Math.min(h, scanY);
            const trailGrad   = ctx.createLinearGradient(0, trailTop, 0, trailBottom);
            trailGrad.addColorStop(0, 'rgba(255,255,255,0)');
            trailGrad.addColorStop(0.6, 'rgba(232,160,40,0.04)');
            trailGrad.addColorStop(1, 'rgba(232,160,40,0.09)');
            ctx.fillStyle = trailGrad;
            ctx.fillRect(0, trailTop, w, trailBottom - trailTop);
        }

        /* The line itself — amber glow */
        if (scanY >= 0 && scanY <= h) {
            /* Diffuse glow band */
            const lineGrad = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6);
            lineGrad.addColorStop(0, 'rgba(232,160,40,0)');
            lineGrad.addColorStop(0.4, 'rgba(232,160,40,0.35)');
            lineGrad.addColorStop(0.5, 'rgba(255,220,130,0.65)');
            lineGrad.addColorStop(0.6, 'rgba(232,160,40,0.35)');
            lineGrad.addColorStop(1, 'rgba(232,160,40,0)');
            ctx.fillStyle = lineGrad;
            ctx.fillRect(0, scanY - 6, w, 12);

            /* Sharp bright core */
            ctx.strokeStyle = 'rgba(255,240,180,0.55)';
            ctx.lineWidth   = 1;
            ctx.shadowBlur  = 8;
            ctx.shadowColor = 'rgba(232,160,40,0.6)';
            ctx.beginPath();
            ctx.moveTo(0, Math.round(scanY));
            ctx.lineTo(w, Math.round(scanY));
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        /* ── Holographic glitch — very rare ── */
        holoCountdown--;
        if (!holoActive && holoCountdown <= 0) {
            holoActive    = true;
            holoFrame     = 0;
            holoCountdown = 60 * 60 + Math.random() * 30 * 60; /* reset */
            buildHoloSlices(w, h);

            /* Also animate the app window via CSS */
            const aw = document.querySelector('.app-window');
            if (aw) {
                aw.style.animation = 'holo-shift 0.42s ease forwards';
                setTimeout(() => {
                    if (aw) aw.style.animation = 'console-breathe 10s ease-in-out infinite';
                }, 450);
            }
        }

        if (holoActive) {
            /* Draw shifted/brightened horizontal slices over canvas */
            const progress = holoFrame / 12;
            const fade     = Math.max(0, 1 - holoFrame / 12);

            ctx.save();
            ctx.globalAlpha = 0.12 * fade;
            for (const sl of holoSlices) {
                if (Math.random() < 0.35) continue; /* only some slices glitch */
                /* Colour aberration stripe */
                const col = currentLang === 'en'
                    ? `rgba(232,160,40, ${0.2 * fade})`
                    : `rgba(32,200,176, ${0.2 * fade})`;
                ctx.fillStyle = col;
                ctx.fillRect(0, sl.y, w, sl.h);
            }

            /* Occasional sharp bright line at random position */
            if (holoFrame < 6) {
                ctx.globalAlpha = (0.5 - holoFrame * 0.08) * fade;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth   = 1;
                const gy = Math.random() * h;
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
            }
            ctx.restore();

            holoFrame++;
            if (holoFrame > 12) holoActive = false;
        }

        canvasRegistry[canvasId].animId = requestAnimationFrame(draw);
    }

    canvasRegistry[canvasId] = { canvas, ctx, animId: null };
    canvasRegistry[canvasId].animId = requestAnimationFrame(draw);
}

function stopBgCanvas(id) {
    if (canvasRegistry[id]) cancelAnimationFrame(canvasRegistry[id].animId);
}

window.addEventListener('load', () => initBgCanvas('bg-canvas', currentLang));


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

    initBgCanvas('bg-canvas-loading', lang);
    animateProgress(lang);

    setTimeout(() => {
        stopBgCanvas('bg-canvas-loading');
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display     = 'flex';
        initBgCanvas('bg-canvas-app', lang);
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
function moult() {
    const msg = currentLang === 'en'
        ? 'Discard shell? This will reload.'
        : 'Jeter la carapace ? La page va se recharger.';
    if (confirm(msg)) location.reload();
}
function toggleLanguage() { startLoading(currentLang === 'en' ? 'fr' : 'en'); }

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
