/* ================================================================
   MOULTLOOK — script.js v4.0
   Logic: routing, rendering, Aqua canvas animation, lang switch
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
   CANVAS — accelerated glitter animation
   Aqua meets GBA: sparkle pixels, speed streaks, bloom glows
══════════════════════════════════════════════════════════ */
const PALETTES = {
    en: {
        bg:     ['#120610', '#1C0A18', '#0E0418'],
        sparks: ['#C0003A','#E0608A','#FFD6E8','#7EC8C0','#5C1A48','#3D2B6E','#ffffff','#B8F0EC'],
        lines:  ['#59001B','#C0003A','#5C1A48','#E0608A','#7EC8C0'],
        blooms: ['rgba(192,0,58,0.12)','rgba(224,96,138,0.08)','rgba(92,26,72,0.1)','rgba(126,200,192,0.07)'],
    },
    fr: {
        bg:     ['#060A14','#081820','#04101C'],
        sparks: ['#1C6B7A','#7EC8C0','#C8F0EC','#E84080','#FFD6EC','#5A3D7A','#ffffff','#1A4A5A'],
        lines:  ['#1A4A5A','#5A3D7A','#1C6B7A','#E84080','#7EC8C0'],
        blooms: ['rgba(26,107,122,0.12)','rgba(126,200,192,0.09)','rgba(90,61,122,0.1)','rgba(232,64,128,0.07)'],
    }
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
        canvas.width  = canvas.parentElement ? canvas.parentElement.offsetWidth  : window.innerWidth;
        canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
        /* Also clamp to window */
        if (canvas.width  === 0) canvas.width  = window.innerWidth;
        if (canvas.height === 0) canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Sparkle pixels */
    const sparks = [];
    for (let i = 0; i < 100; i++) {
        sparks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size:  Math.random() * 3.5 + 1,
            color: pal.sparks[Math.floor(Math.random() * pal.sparks.length)],
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.22 - 0.06,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.007,
        });
    }

    /* Acceleration streaks */
    const streaks = [];
    for (let i = 0; i < 22; i++) {
        streaks.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            len:   Math.random() * 80 + 20,
            angle: -0.7 + (Math.random() - 0.5) * 0.6,
            color: pal.lines[Math.floor(Math.random() * pal.lines.length)],
            speed: Math.random() * 3 + 1.5,
            alpha: Math.random() * 0.3 + 0.07,
            width: Math.random() * 1.8 + 0.4,
        });
    }

    /* Bloom glows */
    const blooms = [];
    for (let i = 0; i < 6; i++) {
        blooms.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 90 + 35,
            color: pal.blooms[Math.floor(Math.random() * pal.blooms.length)],
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.006 + 0.003,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
        });
    }

    let glitchTimer = 0, glitchOn = false, glitchY = 0, glitchH = 0, glitchDur = 0;

    function draw() {
        const w = canvas.width, h = canvas.height;
        const p = PALETTES[currentLang] || PALETTES.en;

        /* Background gradient */
        const grad = ctx.createLinearGradient(0, 0, w * 0.6, h);
        grad.addColorStop(0, p.bg[0]);
        grad.addColorStop(0.5, p.bg[1]);
        grad.addColorStop(1, p.bg[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        /* Pixel grid (very faint) */
        const gc = currentLang === 'en' ? 'rgba(89,0,27,0.055)' : 'rgba(26,74,90,0.055)';
        ctx.strokeStyle = gc; ctx.lineWidth = 0.5;
        const gs = 32;
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

        /* Bloom glows */
        for (const b of blooms) {
            b.phase += b.speed;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -b.r) b.x = w + b.r;
            if (b.x > w + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = h + b.r;
            if (b.y > h + b.r) b.y = -b.r;
            const alpha = (Math.sin(b.phase) * 0.4 + 0.6);
            ctx.save();
            ctx.globalAlpha = alpha;
            const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            gr.addColorStop(0, b.color.replace(')', `, ${alpha * 1.2})`).replace('rgba(', 'rgba('));
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill(); ctx.restore();
        }

        /* Sparkle pixels */
        for (const s of sparks) {
            s.phase += s.speed;
            const alpha = Math.sin(s.phase) * 0.5 + 0.5;
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillStyle = s.color;
            const sz = Math.ceil(s.size);
            const fx = Math.floor(s.x), fy = Math.floor(s.y);
            ctx.fillRect(fx, fy, sz, sz);
            /* Cross sparkle arms for larger ones */
            if (s.size > 2.4) {
                ctx.globalAlpha = alpha * 0.45;
                ctx.fillRect(fx - sz, fy + Math.floor(sz/2), sz*3, 1);
                ctx.fillRect(fx + Math.floor(sz/2), fy - sz, 1, sz*3);
            }
            ctx.restore();
        }

        /* Acceleration streaks */
        for (const st of streaks) {
            st.x += Math.cos(st.angle) * st.speed;
            st.y += Math.sin(st.angle) * st.speed;
            if (st.x > w + 140) { st.x = -100; st.y = Math.random() * h; }
            if (st.y > h + 140) { st.y = -100; st.x = Math.random() * w; }
            ctx.save();
            /* Gradient streak: bright at tail, fades to transparent */
            const gst = ctx.createLinearGradient(
                st.x, st.y,
                st.x - Math.cos(st.angle) * st.len,
                st.y - Math.sin(st.angle) * st.len
            );
            gst.addColorStop(0, st.color + '00');
            gst.addColorStop(0.5, st.color);
            gst.addColorStop(1, st.color + '00');
            ctx.globalAlpha = st.alpha;
            ctx.strokeStyle = gst;
            ctx.lineWidth = st.width;
            ctx.beginPath();
            ctx.moveTo(st.x, st.y);
            ctx.lineTo(st.x - Math.cos(st.angle) * st.len, st.y - Math.sin(st.angle) * st.len);
            ctx.stroke(); ctx.restore();
        }

        /* Glitch band */
        glitchTimer++;
        if (!glitchOn && glitchTimer > 200 && Math.random() < 0.006) {
            glitchOn = true; glitchTimer = 0;
            glitchY = Math.random() * h;
            glitchH = Math.random() * 24 + 3;
            glitchDur = 0;
        }
        if (glitchOn) {
            ctx.save(); ctx.globalAlpha = 0.12;
            ctx.fillStyle = currentLang === 'en' ? '#E0608A' : '#7EC8C0';
            ctx.fillRect(0, glitchY, w, glitchH);
            ctx.globalAlpha = 0.06; ctx.fillStyle = '#fff';
            ctx.fillRect(0, glitchY + glitchH * 0.5, w, 1);
            ctx.restore();
            if (++glitchDur > 5) glitchOn = false;
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
        ? 'System Initialisation — MOULTLOOK v1.0'
        : 'Initialisation du système — MOULTLOOK v1.0';

    const lTitle = document.getElementById('loading-title');
    if (lTitle) lTitle.innerText = lang === 'en' ? 'Hardening chitin...' : 'Mue en cours...';

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
        en: ['Initialising chitin protocols...','Loading crustacean database...',
             'Establishing shell integrity...','Decoding demiurge signals...',
             'Compiling subjective reality...','Ready.'],
        fr: ['Initialisation des protocoles chitineux...',
             'Chargement de la base de données gasconne...',
             'Vérification de l\'intégrité de la carapace...',
             'Décodage des signaux démiurgiques...','Prêt.'],
    };
    const msgs = messages[lang] || messages.en;
    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0];

    const iv = setInterval(() => {
        const jump = Math.random() * 16 + 7;
        progress = Math.min(100, progress + jump);
        if (bar) bar.style.width = progress + '%';
        const ti = Math.min(Math.floor((progress / 100) * msgs.length), msgs.length - 1);
        if (ti > msgIdx) { msgIdx = ti; if (sub) sub.innerText = msgs[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length - 1]; clearInterval(iv); }
    }, 420);
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
        container.innerHTML = `<div style="padding:16px;font-family:var(--font-ui);font-size:13px;color:var(--text-dim);font-style:italic;">[ Empty. ]</div>`;
        return;
    }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId===e.id?'active':''}" onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} &nbsp;|&nbsp; ${e.date}</small>
        </div>`).join('');
}

function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id === selectedEmailId);
        const demi  = demiurges[email.category] || { name: email.from, catchphrase: '', image: 'https://via.placeholder.com/46x46/808080/fff?text=?' };
        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') bodyContent = `<iframe src="${email.url}" width="100%" height="520px"></iframe>`;
        view.innerHTML = `
            <div class="mini-profile">
                <img src="${demi.image}" class="mini-img" alt="${demi.name}">
                <div><strong>${demi.name}</strong><small>${demi.catchphrase}</small></div>
            </div>
            <div class="email-container">
                <div class="close-btn" onclick="closeEmail()">✕</div>
                <div class="email-header">
                    <h2>${email.subject}</h2>
                    <p>${email.date} &nbsp;&middot;&nbsp; ${email.from}</p>
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
        view.innerHTML = `<div class="empty-state">select an item to view</div>`;
    }
}

function renderSearchView() {
    const label       = currentLang === 'en' ? 'Search the Database' : 'Rechercher';
    const placeholder = currentLang === 'en' ? 'Enter keyword...' : 'Entrer un mot-clé...';
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
    const noResult = currentLang === 'en' ? `No results for "${q}".` : `Aucun résultat pour "${q}".`;
    let html = `<div class="results-grid">`;
    if (results.length === 0) html += `<p style="font-family:var(--font-ui);color:var(--text-dim);font-size:14px;font-style:italic;">${noResult}</p>`;
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
            <h2>// System //</h2><hr>
            <p>${homeContent[currentLang]}</p></div>`;
    } else if (currentSection === 'shell') {
        view.innerHTML = shellContent;
    }
}


/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
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
    startLoading(currentLang === 'en' ? 'fr' : 'en');
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
