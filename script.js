/* ================================================================
   MOULTLOOK — script.js v6.0
   Canvas: oscilloscope sine waves, radar pings, petroleum twilight
   "retro, corny, overreacted, absurd, yet thrilling"
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
   CANVAS — Oscilloscope Twilight
   Sine waves scrolling across petroleum bg
   Radar pings, signal sparks, scan lines
   EN: orange-red/teal on deep petroleum blue
   FR: bixbite/amethyst on deep indigo
══════════════════════════════════════════════════════════ */
const PALETTES = {
    en: {
        bg:        ['#0A1420', '#0E1B2C', '#081020'],
        sine:      ['rgba(232,74,40,0.22)', 'rgba(0,200,176,0.14)', 'rgba(216,72,120,0.1)'],
        sineBright:['rgba(232,74,40,0.7)',  'rgba(0,200,176,0.5)',  'rgba(232,160,48,0.4)'],
        sparks:    ['#E84A28','#FF6040','#00C8B0','#D84878','#E8A030','#FF8060','#20E8D0','#ffffff'],
        lines:     ['rgba(232,74,40,0.5)','rgba(0,200,176,0.4)','rgba(216,72,120,0.3)','rgba(232,160,48,0.35)'],
        radar:     'rgba(0,200,176,0.6)',
        grid:      'rgba(30,50,72,0.45)',
    },
    fr: {
        bg:        ['#060A1C', '#0A0E28', '#050818'],
        sine:      ['rgba(232,24,72,0.22)', 'rgba(32,200,176,0.14)', 'rgba(128,80,200,0.14)'],
        sineBright:['rgba(232,24,72,0.7)',  'rgba(32,200,176,0.5)',  'rgba(160,112,232,0.5)'],
        sparks:    ['#E81848','#FF2860','#20C8B0','#8050C8','#A070E8','#FF5080','#40D8C0','#ffffff'],
        lines:     ['rgba(232,24,72,0.5)','rgba(32,200,176,0.4)','rgba(128,80,200,0.4)','rgba(160,112,232,0.3)'],
        radar:     'rgba(128,80,200,0.6)',
        grid:      'rgba(24,32,80,0.45)',
    },
};

const canvasRegistry = {};

function initBgCanvas(canvasId, mode) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (canvasRegistry[canvasId]) cancelAnimationFrame(canvasRegistry[canvasId].animId);

    const ctx = canvas.getContext('2d');
    const pal = PALETTES[mode] || PALETTES.en;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    if (!canvasRegistry[canvasId]) window.addEventListener('resize', resize);

    /* ── Sine wave layers ────────────────────────────────────
       Multiple sine waves at different frequencies, speeds, amplitudes
       This is the oscilloscope motif
    ─────────────────────────────────────────────────────── */
    const sineWaves = [
        /* Main signal wave */
        { phase: 0, speed: 0.012, freq: 1.4, amp: 0.12, y: 0.42, color: 0, width: 1.5 },
        /* Secondary interference */
        { phase: 1.4, speed: 0.007, freq: 2.3, amp: 0.06, y: 0.58, color: 1, width: 1 },
        /* Background carrier */
        { phase: 3.1, speed: 0.004, freq: 0.7, amp: 0.18, y: 0.5, color: 2, width: 0.7 },
        /* Tight rapid signal */
        { phase: 0.8, speed: 0.022, freq: 4.2, amp: 0.025, y: 0.35, color: 0, width: 0.6, bright: true },
        /* Slow drift */
        { phase: 2.2, speed: 0.003, freq: 0.4, amp: 0.22, y: 0.65, color: 1, width: 0.5 },
    ];

    /* ── Spark pixels ── */
    const sparks = [];
    for (let i = 0; i < 80; i++) {
        sparks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size:  Math.random() * 2.5 + 0.8,
            color: pal.sparks[Math.floor(Math.random() * pal.sparks.length)],
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.01,
        });
    }

    /* ── Radar pings ── */
    let pings = [];
    let pingTimer = 0;

    function addPing() {
        const p = PALETTES[currentLang] || PALETTES.en;
        pings.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 0, maxR: Math.random() * 80 + 30,
            alpha: 0.7,
            color: p.radar,
        });
    }
    addPing();

    /* ── Horizontal data streaks ── */
    const hStreaks = [];
    for (let i = 0; i < 8; i++) {
        hStreaks.push({
            y:      Math.random() * canvas.height,
            x:      Math.random() * canvas.width,
            width:  Math.random() * 60 + 20,
            speed:  Math.random() * 2 + 0.8,
            alpha:  Math.random() * 0.25 + 0.05,
            color:  pal.lines[Math.floor(Math.random() * pal.lines.length)],
        });
    }

    /* ── Signal burst state ── */
    let burstTimer = 0, burstActive = false, burstFrame = 0;
    let burstWave = null;

    /* ── Glitch band ── */
    let glitchTimer = 0, glitchOn = false, glitchY = 0, glitchH = 0, glitchDur = 0;

    let tick = 0;

    function draw() {
        const w = canvas.width, h = canvas.height;
        const p = PALETTES[currentLang] || PALETTES.en;
        tick++;

        /* Background */
        const grad = ctx.createLinearGradient(0, 0, w * 0.4, h);
        grad.addColorStop(0, p.bg[0]);
        grad.addColorStop(0.5, p.bg[1]);
        grad.addColorStop(1, p.bg[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        /* Grid */
        ctx.strokeStyle = p.grid; ctx.lineWidth = 0.4;
        const gs = 36;
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

        /* ── SINE WAVES — the oscilloscope ── */
        for (const sw of sineWaves) {
            sw.phase += sw.speed;
            const colorArr = sw.bright ? p.sineBright : p.sine;
            const col = colorArr[sw.color % colorArr.length];
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = col;
            ctx.lineWidth = sw.width;
            ctx.shadowBlur = sw.bright ? 8 : 3;
            ctx.shadowColor = col;

            const baseY = h * sw.y;
            const amp   = h * sw.amp;
            const freqPx = w / (sw.freq * 60);  /* wavelength in pixels */

            ctx.moveTo(0, baseY + Math.sin(sw.phase) * amp);
            for (let x = 1; x < w; x += 1.5) {
                const y = baseY + Math.sin(sw.phase + x / freqPx) * amp;
                ctx.lineTo(x, y);
            }
            ctx.stroke(); ctx.restore();
        }

        /* Signal burst — brief full-amplitude flash on a wave */
        burstTimer++;
        if (!burstActive && burstTimer > 220 && Math.random() < 0.018) {
            burstActive = true; burstFrame = 0; burstTimer = 0;
            burstWave = sineWaves[Math.floor(Math.random() * 2)]; /* one of the main waves */
        }
        if (burstActive && burstWave) {
            const bAlpha = Math.max(0, 1 - burstFrame / 18);
            const col = p.sineBright[burstWave.color % p.sineBright.length];
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = col;
            ctx.lineWidth = burstWave.width * 2.5;
            ctx.globalAlpha = bAlpha;
            ctx.shadowBlur = 18;
            ctx.shadowColor = col;
            const baseY = h * burstWave.y;
            const amp   = h * burstWave.amp * (2 + burstFrame * 0.1);
            const freqPx = w / (burstWave.freq * 60);
            ctx.moveTo(0, baseY + Math.sin(burstWave.phase) * amp);
            for (let x = 1; x < w; x += 2) {
                ctx.lineTo(x, baseY + Math.sin(burstWave.phase + x / freqPx) * amp);
            }
            ctx.stroke(); ctx.restore();
            if (++burstFrame > 22) { burstActive = false; burstWave = null; }
        }

        /* ── Horizontal data streaks ── */
        for (const st of hStreaks) {
            st.x += st.speed;
            if (st.x > w + 80) { st.x = -100; st.y = Math.random() * h; }
            const g = ctx.createLinearGradient(st.x - st.width, st.y, st.x, st.y);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(0.6, st.color);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.save();
            ctx.globalAlpha = st.alpha;
            ctx.strokeStyle = g; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(st.x - st.width, st.y); ctx.lineTo(st.x, st.y);
            ctx.stroke(); ctx.restore();
        }

        /* ── Spark pixels ── */
        for (const s of sparks) {
            s.phase += s.speed;
            const alpha = Math.pow(Math.abs(Math.sin(s.phase)), 1.8);
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
            ctx.save();
            ctx.globalAlpha = alpha * 0.85;
            ctx.fillStyle = s.color;
            const sz = Math.ceil(s.size);
            const fx = Math.floor(s.x), fy = Math.floor(s.y);
            ctx.fillRect(fx, fy, sz, sz);
            if (s.size > 1.8) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillRect(fx - sz, fy + Math.floor(sz/2), sz*3, 1);
                ctx.fillRect(fx + Math.floor(sz/2), fy - sz, 1, sz*3);
            }
            ctx.restore();
        }

        /* ── Radar pings ── */
        pingTimer++;
        if (pingTimer > 200 && Math.random() < 0.02) { addPing(); pingTimer = 0; }

        pings = pings.filter(pg => pg.alpha > 0);
        for (const pg of pings) {
            pg.r += 1.2;
            pg.alpha -= 0.008;
            if (pg.alpha <= 0) continue;
            ctx.save();
            ctx.globalAlpha = pg.alpha;
            ctx.strokeStyle = p.radar;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 6; ctx.shadowColor = p.radar;
            ctx.beginPath();
            ctx.arc(pg.x, pg.y, pg.r, 0, Math.PI * 2);
            ctx.stroke(); ctx.restore();
        }

        /* ── Glitch band ── */
        glitchTimer++;
        if (!glitchOn && glitchTimer > 180 && Math.random() < 0.01) {
            glitchOn = true; glitchTimer = 0;
            glitchY = Math.random() * h;
            glitchH = Math.random() * 22 + 2;
            glitchDur = 0;
        }
        if (glitchOn) {
            ctx.save(); ctx.globalAlpha = 0.14;
            ctx.fillStyle = p.sparks[0];
            ctx.fillRect(0, glitchY, w, glitchH);
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, glitchY, w, 1);
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
        en: ['initialising chitin protocols...','loading crustacean database...',
             'establishing shell integrity...','decoding demiurge signals...',
             'compiling subjective reality...','ready.'],
        fr: ['initialisation des protocoles chitineux...',
             'chargement de la base de données gasconne...',
             'vérification de l\'intégrité de la carapace...',
             'décodage des signaux démiurgiques...','prêt.'],
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
        container.innerHTML = `<div style="padding:16px;font-family:var(--font-mono);font-size:17px;color:var(--text-dimmer);letter-spacing:.08em;">[ empty ]</div>`;
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
            image: 'https://via.placeholder.com/44x44/0E1B2C/E84A28?text=?',
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
    const label       = currentLang === 'en' ? 'Search the Database' : 'Rechercher';
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
    if (results.length === 0) html += `<p style="font-family:var(--font-mono);color:var(--text-dim);font-size:17px;">${noResult}</p>`;
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
function jumpToEmail(id)  {
    const e = emails.find(x => x.id === id);
    if (!e) return;
    selectedEmailId = id; navigate(e.section, e.category);
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
