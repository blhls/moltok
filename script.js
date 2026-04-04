/* ================================================================
   MOULTLOOK — script.js v5.0
   Canvas: fast, aggressive, accelerationist particle system
   Logic: identical to v4.0
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
   CANVAS — BERYLIST ACCELERATIONISM
   Fast streaks, neon sparks, data-burst glitch, radar sweeps
   EN: cherry/duckegg on void-black
   FR: bixbite/amethyst/petroleum on deep navy
══════════════════════════════════════════════════════════ */

const PALETTES = {
    en: {
        bg:       ['#060008', '#0E0408', '#060010'],
        sparks:   ['#FF0040','#FF3880','#00FFD0','#4A0A38','#FFD6E8','#FF7090','#00D0A8','#ffffff'],
        lines:    ['#FF0040','#FF3880','#00FFD0','#780060','#FF7090','#4A0A38'],
        blooms:   ['rgba(255,0,64,0.1)','rgba(255,56,128,0.07)','rgba(0,255,208,0.07)','rgba(74,10,56,0.12)'],
        grid:     'rgba(255,0,64,0.04)',
    },
    fr: {
        bg:       ['#02040E', '#060C1C', '#020810'],
        sparks:   ['#FF1848','#FF4080','#20D8C0','#6030A8','#C090FF','#FF80A0','#8050C8','#ffffff'],
        lines:    ['#FF1848','#6030A8','#20D8C0','#8050C8','#FF4080','#082840'],
        blooms:   ['rgba(255,24,72,0.1)','rgba(96,48,168,0.1)','rgba(32,216,192,0.07)','rgba(128,80,200,0.08)'],
        grid:     'rgba(32,216,192,0.04)',
    },
};

const canvasRegistry = {};

function initBgCanvas(canvasId, mode) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (canvasRegistry[canvasId]) {
        cancelAnimationFrame(canvasRegistry[canvasId].animId);
    }

    const ctx = canvas.getContext('2d');
    const pal = PALETTES[mode] || PALETTES.en;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    if (!canvasRegistry[canvasId]) {
        window.addEventListener('resize', resize);
    }

    /* Neon spark pixels — fast pulse */
    const sparks = [];
    for (let i = 0; i < 120; i++) {
        sparks.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            size:  Math.random() * 3 + 1,
            color: pal.sparks[Math.floor(Math.random() * pal.sparks.length)],
            vx:    (Math.random() - 0.5) * 0.4,
            vy:    (Math.random() - 0.5) * 0.4 - 0.1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.05 + 0.02,    /* faster than before */
        });
    }

    /* Acceleration streaks — diagonal, fast */
    const streaks = [];
    for (let i = 0; i < 30; i++) {
        streaks.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            len:   Math.random() * 100 + 30,
            angle: -0.65 + (Math.random() - 0.5) * 0.7,
            color: pal.lines[Math.floor(Math.random() * pal.lines.length)],
            speed: Math.random() * 5 + 2.5,         /* fast */
            alpha: Math.random() * 0.35 + 0.06,
            width: Math.random() * 1.5 + 0.3,
        });
    }

    /* Bloom glows — larger, pulsing */
    const blooms = [];
    for (let i = 0; i < 8; i++) {
        blooms.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 120 + 40,
            color: pal.blooms[Math.floor(Math.random() * pal.blooms.length)],
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.012 + 0.005,
            vx:    (Math.random() - 0.5) * 0.2,
            vy:    (Math.random() - 0.5) * 0.2,
        });
    }

    /* Data burst events — occasional column of sparks */
    let burstTimer = 0;
    let burstX = 0, burstActive = false, burstParticles = [];

    /* Horizontal scan flash */
    let flashTimer = 0, flashY = -1, flashAlpha = 0, flashDir = 1;

    /* Glitch band state */
    let glitchTimer = 0, glitchOn = false;
    let glitchY = 0, glitchH = 0, glitchDur = 0;
    let glitchShift = 0;

    function triggerDataBurst() {
        burstActive = true;
        burstX = Math.random() * canvas.width;
        burstParticles = [];
        for (let i = 0; i < 22; i++) {
            burstParticles.push({
                x: burstX, y: canvas.height * 0.5,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 1.5) * 5,
                alpha: 1,
                color: pal.sparks[Math.floor(Math.random() * pal.sparks.length)],
                size: Math.random() * 4 + 1,
            });
        }
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        const p = PALETTES[currentLang] || PALETTES.en;

        /* Background */
        const grad = ctx.createLinearGradient(0, 0, w * 0.5, h);
        grad.addColorStop(0, p.bg[0]);
        grad.addColorStop(0.5, p.bg[1]);
        grad.addColorStop(1, p.bg[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        /* Pixel grid */
        ctx.strokeStyle = p.grid; ctx.lineWidth = 0.5;
        const gs = 24;
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        /* Bloom glows */
        for (const b of blooms) {
            b.phase += b.speed;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -b.r) b.x = w + b.r;
            if (b.x > w + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = h + b.r;
            if (b.y > h + b.r) b.y = -b.r;
            const a = Math.sin(b.phase) * 0.45 + 0.55;
            ctx.save(); ctx.globalAlpha = a;
            const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            gr.addColorStop(0, b.color);
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill(); ctx.restore();
        }

        /* Spark pixels — cross sparkle */
        for (const s of sparks) {
            s.phase += s.speed;
            const alpha = Math.pow(Math.abs(Math.sin(s.phase)), 1.5);
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
            ctx.save();
            ctx.globalAlpha = alpha * 0.95;
            ctx.fillStyle = s.color;
            const sz = Math.ceil(s.size);
            const fx = Math.floor(s.x), fy = Math.floor(s.y);
            ctx.fillRect(fx, fy, sz, sz);
            if (s.size > 2) {
                ctx.globalAlpha = alpha * 0.4;
                ctx.fillRect(fx - sz - 1, fy + Math.floor(sz/2), sz * 3 + 2, 1);
                ctx.fillRect(fx + Math.floor(sz/2), fy - sz - 1, 1, sz * 3 + 2);
                /* glow */
                if (s.size > 2.8) {
                    ctx.globalAlpha = alpha * 0.15;
                    ctx.fillRect(fx - 2, fy - 2, sz + 4, sz + 4);
                }
            }
            ctx.restore();
        }

        /* Streaks — gradient fade */
        for (const st of streaks) {
            st.x += Math.cos(st.angle) * st.speed;
            st.y += Math.sin(st.angle) * st.speed;
            if (st.x > w + 150) { st.x = -80; st.y = Math.random() * h; }
            if (st.y > h + 150) { st.y = -80; st.x = Math.random() * w; }
            if (st.x < -150)    { st.x = w + 80; st.y = Math.random() * h; }

            ctx.save();
            const gst = ctx.createLinearGradient(
                st.x, st.y,
                st.x - Math.cos(st.angle) * st.len,
                st.y - Math.sin(st.angle) * st.len
            );
            gst.addColorStop(0, st.color + '00');
            gst.addColorStop(0.4, st.color);
            gst.addColorStop(0.6, st.color);
            gst.addColorStop(1, st.color + '00');
            ctx.globalAlpha = st.alpha;
            ctx.strokeStyle = gst;
            ctx.lineWidth = st.width;
            ctx.shadowBlur = st.width > 1 ? 4 : 0;
            ctx.shadowColor = st.color;
            ctx.beginPath();
            ctx.moveTo(st.x, st.y);
            ctx.lineTo(st.x - Math.cos(st.angle) * st.len, st.y - Math.sin(st.angle) * st.len);
            ctx.stroke(); ctx.restore();
        }

        /* Data burst */
        burstTimer++;
        if (!burstActive && burstTimer > 280 && Math.random() < 0.015) {
            triggerDataBurst(); burstTimer = 0;
        }
        if (burstActive) {
            let alive = false;
            for (const bp of burstParticles) {
                bp.x += bp.vx; bp.y += bp.vy; bp.vy += 0.12; bp.alpha -= 0.035;
                if (bp.alpha > 0) {
                    alive = true;
                    ctx.save(); ctx.globalAlpha = bp.alpha;
                    ctx.fillStyle = bp.color;
                    ctx.fillRect(Math.floor(bp.x), Math.floor(bp.y), Math.ceil(bp.size), Math.ceil(bp.size));
                    ctx.restore();
                }
            }
            if (!alive) burstActive = false;
        }

        /* Horizontal flash scan */
        flashTimer++;
        if (flashTimer > 140 && Math.random() < 0.01) {
            flashY = Math.random() * h;
            flashAlpha = 0.5;
            flashTimer = 0;
        }
        if (flashAlpha > 0) {
            const fc = p.lines[Math.floor(Math.random() * p.lines.length)];
            ctx.save(); ctx.globalAlpha = flashAlpha;
            ctx.strokeStyle = fc; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, flashY); ctx.lineTo(w, flashY); ctx.stroke();
            ctx.restore();
            flashAlpha -= 0.04;
        }

        /* Glitch band — full row displacement */
        glitchTimer++;
        if (!glitchOn && glitchTimer > 160 && Math.random() < 0.012) {
            glitchOn = true; glitchTimer = 0;
            glitchY = Math.random() * h;
            glitchH = Math.random() * 30 + 4;
            glitchDur = 0;
            glitchShift = (Math.random() - 0.5) * 40;
        }
        if (glitchOn) {
            ctx.save();
            /* Horizontal shift strip */
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = p.lines[0];
            ctx.fillRect(0, glitchY, w, glitchH);
            /* White noise line */
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, glitchY, w, 1);
            ctx.restore();
            if (++glitchDur > 4) { glitchOn = false; }
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
   LOADING / NAVIGATION — identical logic to v4
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
        handleRouting();
        updateUI();
    }, isSwitching ? 3000 : 2800);
}

function animateProgress(lang) {
    const bar = document.getElementById('progress-bar');
    const sub = document.getElementById('loading-sub');
    const messages = {
        en: [
            'initialising chitin protocols...',
            'loading crustacean database...',
            'establishing shell integrity...',
            'decoding demiurge signals...',
            'compiling subjective reality...',
            'ready.',
        ],
        fr: [
            'initialisation des protocoles chitineux...',
            'chargement de la base de données gasconne...',
            'vérification de l\'intégrité de la carapace...',
            'décodage des signaux démiurgiques...',
            'prêt.',
        ],
    };
    const msgs = messages[lang] || messages.en;
    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0];

    const iv = setInterval(() => {
        const jump = Math.random() * 18 + 8;
        progress = Math.min(100, progress + jump);
        if (bar) bar.style.width = progress + '%';
        const ti = Math.min(Math.floor((progress / 100) * msgs.length), msgs.length - 1);
        if (ti > msgIdx) { msgIdx = ti; if (sub) sub.innerText = msgs[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length - 1]; clearInterval(iv); }
    }, 400);
}


/* ══════════════════════════════════════════════════════════
   UI RENDERING — identical logic to v4
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
        en: { home:'🏠 HOME', unread:'🆕 UNREAD', search:'🔍 SEARCH',
              inbox:'📥 INBOX', sent:'📤 SENT', drafts:'📝 DRAFTS',
              archive:'🗄️ ARCHIVE', shell:'🐚 YOUR SHELL' },
        fr: { home:'🏠 ADISHATZ', search:'🔍 RECHERCHER',
              inbox:'📥 REÇUS', sent:'📤 ENVOYÉS', archive:'🗄️ ARCHIVE' },
    };
    let html = '';
    for (const [key, label] of Object.entries(menus[currentLang])) {
        html += `<div class="nav-item ${currentSection===key?'active':''}" onclick="navigate('${key}')">
            <span class="txt">${label}</span></div>`;
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
    if (list.length === 0) {
        container.innerHTML = `<div style="padding:16px;font-family:var(--font-mono);font-size:16px;color:var(--text-dim);letter-spacing:.08em;">[ empty ]</div>`;
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
            image: 'https://via.placeholder.com/44x44/1A0810/FF0040?text=?',
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
                <div class="email-header">
                    <h2>${email.subject}</h2>
                    <p>${email.date} // ${email.from}</p>
                </div>
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
    const label       = currentLang === 'en' ? '// SEARCH DATABASE //' : '// RECHERCHER //';
    const placeholder = currentLang === 'en' ? 'enter keyword...' : 'entrer un mot-clé...';
    const btnLabel    = currentLang === 'en' ? 'EXECUTE' : 'CHERCHER';
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
    const results = emails.filter(e => e.lang === currentLang &&
        (e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)));
    const noResult = currentLang === 'en' ? `no results for "${q}".` : `aucun résultat pour "${q}".`;
    let html = `<div class="results-grid">`;
    if (results.length === 0) html += `<p style="font-family:var(--font-mono);color:var(--text-dim);font-size:16px;">${noResult}</p>`;
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
        view.innerHTML = `<div class="home-panel">
            <h2>// SYSTEM //</h2><hr>
            <p>${homeContent[currentLang]}</p></div>`;
    } else if (currentSection === 'shell') {
        view.innerHTML = shellContent;
    }
}

/* ══════════════════════════════════════════════════════════
   HELPERS — identical to v4
══════════════════════════════════════════════════════════ */
function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id)  { selectedEmailId = id;   updateUI(); }
function closeEmail()     { selectedEmailId = null; updateUI(); }
function jumpToEmail(id)  {
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
    startLoading(currentLang === 'en' ? 'fr' : 'en');
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
