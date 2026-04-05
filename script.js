/* ================================================================
   MOULTLOOK — script.js v7.0 "HOLOGRAPHIC TWILIGHT"
   Canvas: warm oscilloscope over textured wallpaper
   Holographic glitch = the interface commenting on human chaos
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
   CANVAS — Oscilloscope Twilight over Wallpaper
   The canvas sits ON the wallpaper, adding warm holographic
   data layer: sine waves, amber sparks, teal radar pings.
   EN: amber/rose/teal glow over dusty burgundy wallpaper
   FR: amber/teal/duck-egg glow over petroleum wallpaper
══════════════════════════════════════════════════════════ */

const PALETTES = {
    en: {
        /* Warm amber twilight on rose-burgundy */
        sineFill:  ['rgba(232,160,40,0.18)',  'rgba(32,200,176,0.10)', 'rgba(216,80,64,0.08)'],
        sineBright:['rgba(232,160,40,0.65)',  'rgba(32,200,176,0.45)', 'rgba(255,192,64,0.4)'],
        sparks:    ['#E8A028','#FFC040','#20C8B0','#D84050','#E8D0A0','#80D0C0','#FFE080'],
        lines:     ['rgba(232,160,40,0.4)','rgba(32,200,176,0.28)','rgba(255,192,64,0.3)'],
        radar:     'rgba(232,160,40,0.55)',
        grid:      'rgba(232,160,40,0.06)',
        bloom:     ['rgba(232,160,40,0.09)','rgba(32,200,176,0.06)','rgba(216,64,80,0.05)'],
    },
    fr: {
        /* Amber + duck-egg teal on petroleum */
        sineFill:  ['rgba(232,160,40,0.15)',  'rgba(32,200,176,0.14)', 'rgba(100,180,180,0.1)'],
        sineBright:['rgba(232,160,40,0.6)',   'rgba(32,200,176,0.5)',  'rgba(140,220,200,0.4)'],
        sparks:    ['#E8A028','#20C8B0','#8AC8B8','#FFC040','#E8E0C0','#40D8C0','#C8E8E0'],
        lines:     ['rgba(232,160,40,0.38)','rgba(32,200,176,0.35)','rgba(140,220,200,0.22)'],
        radar:     'rgba(32,200,176,0.5)',
        grid:      'rgba(32,200,176,0.055)',
        bloom:     ['rgba(232,160,40,0.08)','rgba(32,200,176,0.09)','rgba(100,180,160,0.07)'],
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

    /* ── Sine waves — the oscilloscope layer ── */
    const sineWaves = [
        /* Main signal — amber, slow drift */
        { phase: 0,   speed: 0.009, freq: 1.2, amp: 0.10, y: 0.44, ci: 0, w: 1.4 },
        /* Teal interference */
        { phase: 1.6, speed: 0.006, freq: 2.1, amp: 0.055, y: 0.56, ci: 1, w: 0.9 },
        /* Background carrier — very wide, faint */
        { phase: 2.8, speed: 0.003, freq: 0.5, amp: 0.17, y: 0.5,  ci: 2, w: 0.6 },
        /* Rapid signal trace */
        { phase: 0.5, speed: 0.02,  freq: 3.8, amp: 0.022, y: 0.36, ci: 0, w: 0.5, bright: true },
        /* Slow glow wave */
        { phase: 1.1, speed: 0.0025,freq: 0.35, amp: 0.2, y: 0.67, ci: 1, w: 0.5 },
    ];

    /* ── Bloom glows — warm atmospheric halos ── */
    const blooms = [];
    for (let i = 0; i < 7; i++) {
        blooms.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 110 + 40,
            ci: Math.floor(Math.random() * 3),
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.003,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
        });
    }

    /* ── Spark pixels ── */
    const sparks = [];
    for (let i = 0; i < 90; i++) {
        sparks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size:  Math.random() * 2.2 + 0.6,
            ci:    Math.floor(Math.random() * pal.sparks.length),
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.022 + 0.008,
        });
    }

    /* ── Horizontal data streaks ── */
    const hStreaks = [];
    for (let i = 0; i < 10; i++) {
        hStreaks.push({
            y:     Math.random() * canvas.height,
            x:     Math.random() * canvas.width,
            width: Math.random() * 55 + 18,
            speed: Math.random() * 1.8 + 0.7,
            alpha: Math.random() * 0.2 + 0.04,
            ci:    Math.floor(Math.random() * pal.lines.length),
        });
    }

    /* ── Radar pings ── */
    let pings = [], pingTimer = 0;
    const addPing = () => pings.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0, maxR: Math.random() * 70 + 25, alpha: 0.65,
    });
    addPing();

    /* ── Signal burst ── */
    let burstTimer = 0, burstActive = false, burstFrame = 0, burstWave = null;

    /* ── Holographic panel glitch ── */
    let holoTimer = 0;

    /* ── Glitch band ── */
    let glitchTimer = 0, glitchOn = false, glitchY = 0, glitchH = 0, glitchDur = 0;

    function draw() {
        const w = canvas.width, h = canvas.height;
        const p = PALETTES[currentLang] || PALETTES.en;

        /* Clear — fully transparent so wallpaper shows through */
        ctx.clearRect(0, 0, w, h);

        /* Subtle vignette to deepen edges over wallpaper */
        const vig = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.85);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

        /* Grid — very faint amber/teal over wallpaper */
        ctx.strokeStyle = p.grid; ctx.lineWidth = 0.4;
        const gs = 40;
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

        /* Bloom glows */
        for (const b of blooms) {
            b.phase += b.speed;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -b.r) b.x = w + b.r; if (b.x > w + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = h + b.r; if (b.y > h + b.r) b.y = -b.r;
            const a = Math.sin(b.phase) * 0.4 + 0.6;
            const col = p.bloom[b.ci % p.bloom.length];
            ctx.save(); ctx.globalAlpha = a;
            const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill(); ctx.restore();
        }

        /* ── SINE WAVES ── */
        for (const sw of sineWaves) {
            sw.phase += sw.speed;
            const col = sw.bright ? p.sineBright[sw.ci % p.sineBright.length]
                                  : p.sineFill[sw.ci  % p.sineFill.length];
            ctx.save();
            ctx.strokeStyle = col; ctx.lineWidth = sw.w;
            if (sw.bright) { ctx.shadowBlur = 10; ctx.shadowColor = col; }
            const baseY = h * sw.y;
            const amp   = h * sw.amp;
            const fpx   = w / (sw.freq * 60);
            ctx.beginPath();
            ctx.moveTo(0, baseY + Math.sin(sw.phase) * amp);
            for (let x = 1; x < w; x += 1.5) {
                ctx.lineTo(x, baseY + Math.sin(sw.phase + x / fpx) * amp);
            }
            ctx.stroke(); ctx.restore();
        }

        /* Signal burst */
        burstTimer++;
        if (!burstActive && burstTimer > 240 && Math.random() < 0.015) {
            burstActive = true; burstFrame = 0; burstTimer = 0;
            burstWave = sineWaves[Math.floor(Math.random() * 2)];
        }
        if (burstActive && burstWave) {
            const bA = Math.max(0, 1 - burstFrame / 16);
            const col = p.sineBright[burstWave.ci % p.sineBright.length];
            ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = burstWave.w * 2.8;
            ctx.globalAlpha = bA; ctx.shadowBlur = 20; ctx.shadowColor = col;
            const by = h * burstWave.y, ba = h * burstWave.amp * (2 + burstFrame * 0.12);
            const bfp = w / (burstWave.freq * 60);
            ctx.beginPath(); ctx.moveTo(0, by + Math.sin(burstWave.phase) * ba);
            for (let x = 1; x < w; x += 2) ctx.lineTo(x, by + Math.sin(burstWave.phase + x / bfp) * ba);
            ctx.stroke(); ctx.restore();
            if (++burstFrame > 20) { burstActive = false; burstWave = null; }
        }

        /* Horizontal streaks */
        for (const st of hStreaks) {
            st.x += st.speed;
            if (st.x > w + 80) { st.x = -100; st.y = Math.random() * h; }
            const g = ctx.createLinearGradient(st.x - st.width, st.y, st.x, st.y);
            g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, p.lines[st.ci]); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.save(); ctx.globalAlpha = st.alpha; ctx.strokeStyle = g; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(st.x - st.width, st.y); ctx.lineTo(st.x, st.y);
            ctx.stroke(); ctx.restore();
        }

        /* Spark pixels */
        for (const s of sparks) {
            s.phase += s.speed;
            const alpha = Math.pow(Math.abs(Math.sin(s.phase)), 1.6) * 0.9;
            s.x += s.vx; s.y += s.vy;
            if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
            ctx.save(); ctx.globalAlpha = alpha;
            ctx.fillStyle = p.sparks[s.ci % p.sparks.length];
            const sz = Math.ceil(s.size), fx = Math.floor(s.x), fy = Math.floor(s.y);
            ctx.fillRect(fx, fy, sz, sz);
            if (s.size > 1.6) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillRect(fx - sz, fy + Math.floor(sz/2), sz*3, 1);
                ctx.fillRect(fx + Math.floor(sz/2), fy - sz, 1, sz*3);
            }
            ctx.restore();
        }

        /* Radar pings */
        pingTimer++;
        if (pingTimer > 220 && Math.random() < 0.018) { addPing(); pingTimer = 0; }
        pings = pings.filter(pg => pg.alpha > 0.01);
        for (const pg of pings) {
            pg.r += 1; pg.alpha -= 0.007;
            ctx.save(); ctx.globalAlpha = pg.alpha;
            ctx.strokeStyle = p.radar; ctx.lineWidth = 1;
            ctx.shadowBlur = 5; ctx.shadowColor = p.radar;
            ctx.beginPath(); ctx.arc(pg.x, pg.y, pg.r, 0, Math.PI * 2);
            ctx.stroke(); ctx.restore();
        }

        /* Holographic interface glitch — affects panels (CSS triggered separately) */
        holoTimer++;
        if (holoTimer > 280 && Math.random() < 0.012) {
            /* Flash a horizontal displacement strip over canvas */
            const gy = Math.random() * h;
            ctx.save(); ctx.globalAlpha = 0.1;
            ctx.fillStyle = p.sparks[0];
            ctx.fillRect(0, gy, w, Math.random() * 20 + 2);
            ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
            ctx.fillRect(0, gy, w, 1);
            ctx.restore();
            holoTimer = 0;

            /* Trigger CSS holo glitch on app window */
            const appWin = document.querySelector('.app-window');
            if (appWin) {
                appWin.style.animation = 'holo-shift 0.4s ease forwards';
                setTimeout(() => { if (appWin) appWin.style.animation = ''; }, 420);
            }
        }

        /* Glitch band */
        glitchTimer++;
        if (!glitchOn && glitchTimer > 200 && Math.random() < 0.008) {
            glitchOn = true; glitchTimer = 0;
            glitchY = Math.random() * h; glitchH = Math.random() * 18 + 2; glitchDur = 0;
        }
        if (glitchOn) {
            ctx.save(); ctx.globalAlpha = 0.12;
            ctx.fillStyle = p.sparks[0]; ctx.fillRect(0, glitchY, w, glitchH);
            ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff'; ctx.fillRect(0, glitchY, w, 1);
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
        handleRouting(); updateUI();
    }, isSwitching ? 3000 : 2800);
}

function animateProgress(lang) {
    const bar = document.getElementById('progress-bar');
    const sub = document.getElementById('loading-sub');
    const msgs = {
        en: ['initialising chitin protocols...','loading crustacean database...',
             'establishing shell integrity...','decoding demiurge signals...',
             'compiling subjective reality...','ready.'],
        fr: ['initialisation des protocoles chitineux...',
             'chargement de la base de données gasconne...',
             'vérification de l\'intégrité de la carapace...',
             'décodage des signaux démiurgiques...','prêt.'],
    }[lang] || [];
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
   UI RENDERING — identical logic
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
    if (['home','shell','search'].includes(currentSection)) {
        middleRow.style.display = 'none';
        if (currentSection === 'search') renderSearchView();
        else renderStaticContent();
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
            image: 'https://via.placeholder.com/44x44/1C2030/E8A028?text=?',
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
    const label  = currentLang === 'en' ? 'Search the Database' : 'Rechercher';
    const ph     = currentLang === 'en' ? 'enter keyword...' : 'entrer un mot-clé...';
    const btn    = currentLang === 'en' ? 'EXECUTE' : 'CHERCHER';
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
    const results = emails.filter(e => e.lang === currentLang &&
        (e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)));
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
