/* ================================================================
   MOULTLOOK — script.js
   All logic: routing, rendering, canvas animation, language switch
   ================================================================ */

'use strict';

/* ── State ─────────────────────────────────────────────────────── */
let currentLang    = 'en';
let currentSection = 'home';
let currentCategory = null;
let selectedEmailId = null;

/* ── Routing ────────────────────────────────────────────────────── */
window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const parts = hash.split('-');
    currentSection  = parts[0];
    currentCategory = parts[1] || null;
    updateUI();
}


/* ══════════════════════════════════════════════════════════════════
   CANVAS — animated background
   Runs on login, loading and app screens.
   Palette shifts automatically with mode-fr.
══════════════════════════════════════════════════════════════════ */

const BG_COLORS = {
    en: {
        bg:     ['#180610', '#220A18', '#0E0418'],
        sparks: ['#C0003A', '#5C1A48', '#E0608A', '#ffffff', '#7EC8C0', '#3D2B6E', '#FFD6E8', '#B8F0EC'],
        lines:  ['#59001B', '#C0003A', '#5C1A48', '#E0608A'],
    },
    fr: {
        bg:     ['#040E18', '#081820', '#040A18'],
        sparks: ['#1C6B7A', '#7EC8C0', '#3D2B6E', '#E8609A', '#ffffff', '#D01050', '#1A4A5A', '#A0DDD8'],
        lines:  ['#1A4A5A', '#3D2B6E', '#1C6B7A', '#D01050'],
    }
};

const canvasRegistry = {};  /* id → { canvas, ctx, particles, animId } */

function initBgCanvas(canvasId, mode) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    /* Stop any existing animation on this canvas */
    if (canvasRegistry[canvasId]) {
        cancelAnimationFrame(canvasRegistry[canvasId].animId);
    }

    const ctx = canvas.getContext('2d');
    const colors = BG_COLORS[mode] || BG_COLORS.en;
    const particles = [];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    /* Only add one resize listener total */
    if (!canvasRegistry[canvasId]) {
        window.addEventListener('resize', resize);
    }

    /* ── Sparkle particles ── */
    for (let i = 0; i < 90; i++) {
        particles.push({
            type:   'spark',
            x:      Math.random() * canvas.width,
            y:      Math.random() * canvas.height,
            size:   Math.random() * 3.5 + 1,
            color:  colors.sparks[Math.floor(Math.random() * colors.sparks.length)],
            vx:     (Math.random() - 0.5) * 0.25,
            vy:     (Math.random() - 0.5) * 0.25 - 0.08,
            phase:  Math.random() * Math.PI * 2,
            speed:  Math.random() * 0.018 + 0.006,
        });
    }

    /* ── Acceleration streaks ── */
    for (let i = 0; i < 18; i++) {
        particles.push({
            type:   'line',
            x:      Math.random() * canvas.width,
            y:      Math.random() * canvas.height,
            len:    Math.random() * 70 + 25,
            angle:  -0.75 + (Math.random() - 0.5) * 0.5,
            color:  colors.lines[Math.floor(Math.random() * colors.lines.length)],
            speed:  Math.random() * 2.5 + 1.5,
            alpha:  Math.random() * 0.35 + 0.08,
            width:  Math.random() * 1.5 + 0.4,
        });
    }

    /* ── Occasional glitch band state ── */
    let glitchTimer  = 0;
    let glitchActive = false;
    let glitchY = 0, glitchH = 0, glitchDur = 0;

    function draw() {
        const w = canvas.width, h = canvas.height;
        const c = BG_COLORS[currentLang] || BG_COLORS.en;

        /* Background gradient */
        const grad = ctx.createLinearGradient(0, 0, w * 0.7, h);
        grad.addColorStop(0,   c.bg[0]);
        grad.addColorStop(0.5, c.bg[1]);
        grad.addColorStop(1,   c.bg[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        /* Subtle pixel grid */
        ctx.strokeStyle = currentLang === 'en'
            ? 'rgba(89,0,27,0.07)'
            : 'rgba(28,107,122,0.07)';
        ctx.lineWidth = 0.5;
        const gs = 36;
        for (let x = 0; x < w; x += gs) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += gs) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        /* Particles */
        for (const p of particles) {
            if (p.type === 'spark') {
                p.phase += p.speed;
                const alpha = (Math.sin(p.phase) * 0.5 + 0.5) * 0.85;
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle   = p.color;
                const s  = Math.ceil(p.size);
                const fx = Math.floor(p.x);
                const fy = Math.floor(p.y);
                ctx.fillRect(fx, fy, s, s);
                if (p.size > 2.2) {
                    /* Cross sparkle arms */
                    ctx.fillRect(fx - s,               fy + Math.floor(s / 2), s * 3, 1);
                    ctx.fillRect(fx + Math.floor(s / 2), fy - s,               1, s * 3);
                }
                ctx.restore();

            } else if (p.type === 'line') {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                if (p.x > w + 120) { p.x = -100; p.y = Math.random() * h; }
                if (p.y > h + 120) { p.y = -100; p.x = Math.random() * w; }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.strokeStyle = p.color;
                ctx.lineWidth   = p.width;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - Math.cos(p.angle) * p.len,
                           p.y - Math.sin(p.angle) * p.len);
                ctx.stroke();
                ctx.restore();
            }
        }

        /* Glitch band flash */
        glitchTimer++;
        if (!glitchActive && glitchTimer > 180 && Math.random() < 0.008) {
            glitchActive = true;
            glitchY   = Math.random() * h;
            glitchH   = Math.random() * 28 + 4;
            glitchDur = 0;
        }
        if (glitchActive) {
            ctx.save();
            ctx.globalAlpha = 0.14;
            ctx.fillStyle   = currentLang === 'en' ? '#E0608A' : '#7EC8C0';
            ctx.fillRect(0, glitchY, w, glitchH);
            /* slight horizontal shift line */
            ctx.globalAlpha = 0.08;
            ctx.fillStyle   = '#ffffff';
            ctx.fillRect(0, glitchY + glitchH * 0.5, w, 1);
            ctx.restore();
            glitchDur++;
            if (glitchDur > 4) { glitchActive = false; glitchTimer = 0; }
        }

        const animId = requestAnimationFrame(draw);
        canvasRegistry[canvasId].animId = animId;
    }

    canvasRegistry[canvasId] = { canvas, ctx, particles, animId: null };
    const firstId = requestAnimationFrame(draw);
    canvasRegistry[canvasId].animId = firstId;
}

function stopBgCanvas(canvasId) {
    if (canvasRegistry[canvasId]) {
        cancelAnimationFrame(canvasRegistry[canvasId].animId);
    }
}

/* ── Init all canvases on page load ── */
window.addEventListener('load', () => {
    initBgCanvas('bg-canvas',      currentLang);
});


/* ══════════════════════════════════════════════════════════════════
   LOADING & NAVIGATION
══════════════════════════════════════════════════════════════════ */

/**
 * startLoading(lang)
 * Called from login screen buttons AND from toggleLanguage().
 * Shows loading screen then transitions to app.
 */
function startLoading(lang) {
    currentLang = lang;
    const isSwitching = document.getElementById('screen-app').style.display !== 'none';

    /* Hide current screen */
    document.getElementById('screen-login').style.display   = 'none';
    document.getElementById('screen-app').style.display     = 'none';
    document.getElementById('screen-loading').style.display = 'flex';

    /* Update body class for theme */
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

    /* Update loading titlebar */
    const lTitlebar = document.getElementById('loading-titlebar-text');
    if (lTitlebar) {
        lTitlebar.innerText = lang === 'en'
            ? '⚙ System Initialisation — MOULTLOOK v1.0'
            : '⚙ Initialisation du système — MOULTLOOK v1.0';
    }

    /* Update loading h2 */
    const loadingTitle = document.getElementById('loading-title');
    if (loadingTitle) {
        loadingTitle.innerText = lang === 'en' ? 'Hardening chitin...' : 'Mue en cours...';
    }

    /* Set banner content */
    document.getElementById('banner-text').innerText = bannerContent[lang];

    /* Start canvas for loading bg */
    initBgCanvas('bg-canvas-loading', lang);

    /* Animate progress */
    animateProgress(lang);

    setTimeout(() => {
        stopBgCanvas('bg-canvas-loading');
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display     = 'flex';

        /* Start (or reinit) app canvas */
        initBgCanvas('bg-canvas-app', lang);

        if (!isSwitching) {
            window.location.hash = 'home';
        }
        handleRouting();
        updateUI();
    }, isSwitching ? 3000 : 2800);
}

function animateProgress(lang) {
    const bar = document.getElementById('progress-bar');
    const sub = document.getElementById('loading-sub');

    const messages = {
        en: [
            'Initialising chitin protocols...',
            'Loading crustacean database...',
            'Establishing shell integrity...',
            'Decoding demiurge signals...',
            'Compiling subjective reality...',
            'Ready.',
        ],
        fr: [
            'Initialisation des protocoles chitineux...',
            'Chargement de la base de données gasconne...',
            'Vérification de l\'intégrité de la carapace...',
            'Décodage des signaux démiurgiques...',
            'Prêt.',
        ],
    };

    const msgs = messages[lang] || messages.en;
    let progress = 0;
    let msgIdx   = 0;

    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0];

    const interval = setInterval(() => {
        const jump = Math.random() * 16 + 7;
        progress = Math.min(100, progress + jump);
        if (bar) bar.style.width = progress + '%';

        const targetIdx = Math.min(
            Math.floor((progress / 100) * msgs.length),
            msgs.length - 1
        );
        if (targetIdx > msgIdx) {
            msgIdx = targetIdx;
            if (sub) sub.innerText = msgs[msgIdx];
        }
        if (progress >= 100) {
            if (sub) sub.innerText = msgs[msgs.length - 1];
            clearInterval(interval);
        }
    }, 420);
}


/* ══════════════════════════════════════════════════════════════════
   UI RENDERING
══════════════════════════════════════════════════════════════════ */

function updateUI() {
    renderSidebar();

    const middleRow = document.getElementById('email-list');
    const langBtn   = document.getElementById('lang-toggle-btn');

    if (langBtn) {
        langBtn.innerText = currentLang === 'en'
            ? '🐟  CRABE M\'A TUER'
            : '🌐  INTERNATIONAL';
    }

    /* Title bar */
    const titleEl = document.getElementById('app-win-title');
    if (titleEl) {
        let title = 'MOULTLOOK — ' + currentSection.toUpperCase();
        if (currentCategory) title += ' › ' + currentCategory.toUpperCase();
        titleEl.innerText = title;
    }

    if (['home', 'shell', 'search'].includes(currentSection)) {
        middleRow.style.display = 'none';
        if (currentSection === 'search') renderSearchView();
        else renderStaticContent();
    } else {
        middleRow.style.display = 'flex';
        middleRow.style.flexDirection = 'column';
        renderEmailList();
        renderEmailContent();
    }
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const menus = {
        en: {
            home:    '🏠 HOME',
            unread:  '🆕 UNREAD',
            search:  '🔍 SEARCH',
            inbox:   '📥 INBOX',
            sent:    '📤 SENT',
            drafts:  '📝 DRAFTS',
            archive: '🗄️ ARCHIVE',
            shell:   '🐚 YOUR SHELL',
        },
        fr: {
            home:    '🏠 ADISHATZ',
            search:  '🔍 RECHERCHER',
            inbox:   '📥 REÇUS',
            sent:    '📤 ENVOYÉS',
            archive: '🗄️ ARCHIVE',
        },
    };

    let html = '';
    for (const [key, label] of Object.entries(menus[currentLang])) {
        html += `<div class="nav-item ${currentSection === key ? 'active' : ''}" onclick="navigate('${key}')">
            <span class="txt">${label}</span>
        </div>`;
        if (key === 'inbox' && currentLang === 'en') {
            const cats = ['patriarchy', 'imperialism', 'capitalism', 'notes'];
            html += `<div class="nav-sub">` +
                cats.map(c =>
                    `<div class="${currentCategory === c ? 'active' : ''}" onclick="navigate('inbox','${c}')">
                        ↳ ${c}
                    </div>`
                ).join('') +
            `</div>`;
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
    if (currentCategory && currentLang === 'en') {
        list = list.filter(e => e.category === currentCategory);
    }
    if (currentSection === 'unread' && !selectedEmailId && list.length > 0) {
        selectedEmailId = list[0].id;
    }
    if (list.length === 0) {
        container.innerHTML = `<div style="padding:16px;font-family:var(--font-vt);font-size:17px;color:var(--text-dim);font-style:italic;">
            [ Empty. ]
        </div>`;
        return;
    }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId === e.id ? 'active' : ''}" onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} &nbsp;|&nbsp; ${e.date}</small>
        </div>`
    ).join('');
}

function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id === selectedEmailId);
        const demi  = demiurges[email.category] || {
            name:       email.from,
            catchphrase: '',
            image:      'https://via.placeholder.com/52x52/808080/fff?text=?',
        };

        /* ── GIF profile slot ─────────────────────────── */
        const gifSlotHtml = `
            <div class="gif-profile-slot">
                <img src="" alt="${demi.name}" class="gif-profile-img gif-placeholder"
                     style="display:none"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                <img src="${demi.image}" class="mini-img-fallback" alt="${demi.name}">
            </div>`;

        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') {
            bodyContent = `<iframe src="${email.url}" width="100%" height="520px"></iframe>`;
        }

        view.innerHTML = `
            <div class="mini-profile">
                <img src="${demi.image}" class="mini-img" alt="${demi.name}">
                <div>
                    <strong>${demi.name}</strong>
                    <small>${demi.catchphrase}</small>
                </div>
            </div>
            <div class="email-container">
                <div class="close-btn" onclick="closeEmail()">✕</div>
                <div class="email-header">
                    <h2>${email.subject}</h2>
                    <p>${email.date} &nbsp;&middot;&nbsp; ${email.from}</p>
                </div>
                <hr>
                ${bodyContent}
            </div>`;

    } else if (currentCategory && currentLang === 'en') {
        const demi = demiurges[currentCategory];
        view.innerHTML = `
            <div class="demiurge-profile">
                <h2>${demi.name}</h2>
                <p class="demi-quote">"${demi.catchphrase}"</p>
                <hr>
                <p>${demi.description}</p>
            </div>`;
    } else {
        view.innerHTML = `<div class="empty-state">[ Select an item to view. ]</div>`;
    }
}

function renderSearchView() {
    const label       = currentLang === 'en' ? '// SEARCH DATABASE //'  : '// RECHERCHE //';
    const placeholder = currentLang === 'en' ? 'Enter keyword...'       : 'Entrer un mot-clé...';
    const btnLabel    = currentLang === 'en' ? 'EXECUTE'                 : 'CHERCHER';

    document.getElementById('content-view').innerHTML = `
        <div class="search-hero">
            <h1>${label}</h1>
            <div class="search-input-wrap">
                <input type="text" id="search-input" placeholder="${placeholder}"
                       onkeyup="if(event.key==='Enter') executeSearch()">
                <button onclick="executeSearch()">${btnLabel}</button>
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
    const noResultMsg = currentLang === 'en'
        ? `No results for "${q}".`
        : `Aucun résultat pour "${q}".`;

    let html = `<div class="results-grid">`;
    if (results.length === 0) {
        html += `<p style="font-family:var(--font-vt);color:var(--text-dim);font-size:18px;">${noResultMsg}</p>`;
    }
    results.forEach(res => {
        html += `<div class="search-card">
            <h3>${res.subject}</h3>
            <p>${res.body.substring(0, 110)}...</p>
            <button class="read-btn" onclick="jumpToEmail(${res.id})">READ →</button>
        </div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
    const view = document.getElementById('content-view');
    if (currentSection === 'home') {
        view.innerHTML = `
            <div class="home-panel">
                <h2>// SYSTEM //</h2>
                <hr>
                <p>${homeContent[currentLang]}</p>
            </div>`;
    } else if (currentSection === 'shell') {
        view.innerHTML = shellContent;
    }
}


/* ══════════════════════════════════════════════════════════════════
   NAVIGATION HELPERS
══════════════════════════════════════════════════════════════════ */

function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}

function selectEmail(id)  { selectedEmailId = id;   updateUI(); }
function closeEmail()     { selectedEmailId = null; updateUI(); }

function jumpToEmail(id) {
    const e = emails.find(x => x.id === id);
    if (!e) return;
    selectedEmailId = id;
    navigate(e.section, e.category);
}

function moult() {
    const msg = currentLang === 'en'
        ? 'Discard shell? This will reload.'
        : 'Jeter la carapace ? La page va se recharger.';
    if (confirm(msg)) location.reload();
}

function toggleLanguage() {
    /* Show loading screen between language modes */
    startLoading(currentLang === 'en' ? 'fr' : 'en');
}


/* ══════════════════════════════════════════════════════════════════
   SIDEBAR TOGGLE
══════════════════════════════════════════════════════════════════ */
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
