/* ================================================================
   MOULTLOOK — script.js v8.0
   Canvas: transparent amber oscilloscope over CSS sunset
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
   CANVAS — Amber oscilloscope over transparent sunset
   Clears to transparent — CSS gradient is the real bg.
   Adds: sine waves, bloom glows, radar pings, sparks.
══════════════════════════════════════════════════════════ */
const PALETTES = {
    en: {
        sineFill:   ['rgba(232,160,40,0.16)', 'rgba(32,200,176,0.09)', 'rgba(220,100,60,0.07)'],
        sineBright: ['rgba(232,160,40,0.60)', 'rgba(32,200,176,0.42)', 'rgba(255,185,64,0.38)'],
        sparks:     ['#E8A028','#FFB840','#20C8B0','#D04040','#FFD888','#80D0C0','#FFE8A0'],
        lines:      ['rgba(232,160,40,0.32)','rgba(32,200,176,0.22)','rgba(255,185,64,0.24)'],
        radar:      'rgba(232,160,40,0.5)',
        bloom:      ['rgba(232,160,40,0.08)','rgba(32,200,176,0.05)','rgba(210,100,50,0.05)'],
        grid:       'rgba(232,160,40,0.04)',
    },
    fr: {
        sineFill:   ['rgba(232,160,40,0.14)', 'rgba(32,200,176,0.12)', 'rgba(90,170,170,0.08)'],
        sineBright: ['rgba(232,160,40,0.55)', 'rgba(32,200,176,0.48)', 'rgba(130,215,200,0.38)'],
        sparks:     ['#E8A028','#20C8B0','#80C8B8','#FFB840','#E8E0C0','#40D8C0'],
        lines:      ['rgba(232,160,40,0.3)','rgba(32,200,176,0.28)','rgba(130,215,200,0.2)'],
        radar:      'rgba(32,200,176,0.48)',
        bloom:      ['rgba(232,160,40,0.07)','rgba(32,200,176,0.08)','rgba(90,170,160,0.06)'],
        grid:       'rgba(32,200,176,0.04)',
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

    /* Sine waves */
    const sines = [
        { phase: 0,   speed: 0.008, freq: 1.2,  amp: 0.09,  y: 0.44, ci: 0, w: 1.3 },
        { phase: 1.6, speed: 0.005, freq: 2.0,  amp: 0.05,  y: 0.57, ci: 1, w: 0.9 },
        { phase: 2.8, speed: 0.003, freq: 0.45, amp: 0.15,  y: 0.50, ci: 2, w: 0.5 },
        { phase: 0.4, speed: 0.019, freq: 3.8,  amp: 0.018, y: 0.35, ci: 0, w: 0.45, bright: true },
        { phase: 1.0, speed: 0.002, freq: 0.32, amp: 0.19,  y: 0.68, ci: 1, w: 0.45 },
    ];

    /* Bloom glows */
    const blooms = Array.from({length:7}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 120 + 40,
        ci: Math.floor(Math.random() * 3),
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.007 + 0.003,
        vx: (Math.random()-.5)*.12, vy: (Math.random()-.5)*.12,
    }));

    /* Sparks */
    const sparks = Array.from({length:80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.6,
        ci: Math.floor(Math.random() * 7),
        vx: (Math.random()-.5)*.1, vy: (Math.random()-.5)*.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
    }));

    /* Streaks */
    const streaks = Array.from({length:9}, () => ({
        y: Math.random() * canvas.width,
        x: Math.random() * canvas.width,
        w: Math.random() * 50 + 15,
        speed: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.18 + 0.04,
        ci: Math.floor(Math.random() * 3),
    }));

    /* Radar */
    let pings = [], pingTimer = 0;
    const addPing = () => pings.push({
        x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        r: 0, alpha: 0.6,
    });
    addPing();

    /* Burst */
    let burstTimer = 0, burstActive = false, burstFrame = 0, burstSine = null;

    /* Holographic glitch */
    let holoTimer = 0;

    /* Glitch band */
    let glitchTimer = 0, glitchOn = false, glitchY = 0, glitchH = 0, glitchDur = 0;

    function draw() {
        const w = canvas.width, h = canvas.height;
        const p = PALETTES[currentLang] || PALETTES.en;

        /* Fully transparent — CSS sunset is the real background */
        ctx.clearRect(0, 0, w, h);

        /* Edge vignette — subtle darkening at periphery */
        const vig = ctx.createRadialGradient(w/2, h*.45, h*.15, w/2, h*.45, h*.9);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

        /* Very subtle grid */
        ctx.strokeStyle = p.grid; ctx.lineWidth = 0.3;
        const gs = 44;
        for (let x=0; x<w; x+=gs){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
        for (let y=0; y<h; y+=gs){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

        /* Bloom glows */
        for (const b of blooms) {
            b.phase += b.speed; b.x += b.vx; b.y += b.vy;
            if (b.x < -b.r) b.x = w+b.r; if (b.x > w+b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = h+b.r; if (b.y > h+b.r) b.y = -b.r;
            const a = Math.sin(b.phase)*.4+.6;
            ctx.save(); ctx.globalAlpha = a;
            const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            gr.addColorStop(0, p.bloom[b.ci]); gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill(); ctx.restore();
        }

        /* Sine waves */
        for (const sw of sines) {
            sw.phase += sw.speed;
            const col = sw.bright ? p.sineBright[sw.ci % p.sineBright.length] : p.sineFill[sw.ci % p.sineFill.length];
            ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = sw.w;
            if (sw.bright) { ctx.shadowBlur = 10; ctx.shadowColor = col; }
            const by = h*sw.y, amp = h*sw.amp, fpx = w/(sw.freq*60);
            ctx.beginPath(); ctx.moveTo(0, by + Math.sin(sw.phase)*amp);
            for (let x=1; x<w; x+=1.5) ctx.lineTo(x, by + Math.sin(sw.phase + x/fpx)*amp);
            ctx.stroke(); ctx.restore();
        }

        /* Signal burst */
        burstTimer++;
        if (!burstActive && burstTimer > 260 && Math.random() < 0.014) {
            burstActive = true; burstFrame = 0; burstTimer = 0;
            burstSine = sines[Math.floor(Math.random()*2)];
        }
        if (burstActive && burstSine) {
            const bA = Math.max(0, 1-burstFrame/18);
            const col = p.sineBright[burstSine.ci % p.sineBright.length];
            ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = burstSine.w*2.6;
            ctx.globalAlpha = bA; ctx.shadowBlur = 22; ctx.shadowColor = col;
            const by = h*burstSine.y, amp = h*burstSine.amp*(2+burstFrame*.1), fpx = w/(burstSine.freq*60);
            ctx.beginPath(); ctx.moveTo(0, by+Math.sin(burstSine.phase)*amp);
            for (let x=1; x<w; x+=2) ctx.lineTo(x, by+Math.sin(burstSine.phase+x/fpx)*amp);
            ctx.stroke(); ctx.restore();
            if (++burstFrame > 20) { burstActive = false; burstSine = null; }
        }

        /* Horizontal streaks */
        for (const st of streaks) {
            st.x += st.speed;
            if (st.x > w+80) { st.x=-100; st.y = Math.random()*h; }
            const g = ctx.createLinearGradient(st.x-st.w, st.y, st.x, st.y);
            g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.6, p.lines[st.ci]); g.addColorStop(1,'rgba(0,0,0,0)');
            ctx.save(); ctx.globalAlpha=st.alpha; ctx.strokeStyle=g; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(st.x-st.w, st.y); ctx.lineTo(st.x, st.y); ctx.stroke(); ctx.restore();
        }

        /* Sparks */
        for (const s of sparks) {
            s.phase += s.speed;
            const alpha = Math.pow(Math.abs(Math.sin(s.phase)),1.7)*.88;
            s.x += s.vx; s.y += s.vy;
            if (s.x<0) s.x=w; if (s.x>w) s.x=0;
            if (s.y<0) s.y=h; if (s.y>h) s.y=0;
            ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=p.sparks[s.ci%p.sparks.length];
            const sz=Math.ceil(s.size), fx=Math.floor(s.x), fy=Math.floor(s.y);
            ctx.fillRect(fx, fy, sz, sz);
            if (s.size>1.5) {
                ctx.globalAlpha=alpha*.28;
                ctx.fillRect(fx-sz, fy+Math.floor(sz/2), sz*3, 1);
                ctx.fillRect(fx+Math.floor(sz/2), fy-sz, 1, sz*3);
            }
            ctx.restore();
        }

        /* Radar pings */
        pingTimer++;
        if (pingTimer > 240 && Math.random() < 0.016) { addPing(); pingTimer=0; }
        pings = pings.filter(pg => pg.alpha > 0.01);
        for (const pg of pings) {
            pg.r += 0.9; pg.alpha -= 0.006;
            ctx.save(); ctx.globalAlpha=pg.alpha;
            ctx.strokeStyle=p.radar; ctx.lineWidth=1;
            ctx.shadowBlur=5; ctx.shadowColor=p.radar;
            ctx.beginPath(); ctx.arc(pg.x, pg.y, pg.r, 0, Math.PI*2); ctx.stroke(); ctx.restore();
        }

        /* Holographic panel glitch — JS triggers CSS animation */
        holoTimer++;
        if (holoTimer > 320 && Math.random() < 0.01) {
            holoTimer = 0;
            ctx.save(); ctx.globalAlpha=0.08;
            ctx.fillStyle = p.sparks[0];
            ctx.fillRect(0, Math.random()*h, w, Math.random()*18+2);
            ctx.globalAlpha=0.18; ctx.fillStyle='#fff';
            ctx.fillRect(0, Math.random()*h, w, 1);
            ctx.restore();
            const aw = document.querySelector('.app-window');
            if (aw) {
                aw.style.animation = 'holo-shift 0.38s ease forwards';
                setTimeout(() => { if(aw) aw.style.animation = 'console-breathe 8s ease-in-out infinite'; }, 400);
            }
        }

        /* Glitch band */
        glitchTimer++;
        if (!glitchOn && glitchTimer > 210 && Math.random() < 0.008) {
            glitchOn=true; glitchTimer=0;
            glitchY=Math.random()*h; glitchH=Math.random()*16+2; glitchDur=0;
        }
        if (glitchOn) {
            ctx.save(); ctx.globalAlpha=0.1; ctx.fillStyle=p.sparks[0];
            ctx.fillRect(0, glitchY, w, glitchH);
            ctx.globalAlpha=0.18; ctx.fillStyle='#fff'; ctx.fillRect(0, glitchY, w, 1);
            ctx.restore();
            if (++glitchDur > 5) glitchOn=false;
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
    if (lBar) lBar.innerText = lang === 'en' ? 'system initialisation — moultlook v1.0' : 'initialisation du système — moultlook v1.0';
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
    const msgs = ({
        en: ['initialising chitin protocols...','loading crustacean database...',
             'establishing shell integrity...','decoding demiurge signals...',
             'compiling subjective reality...','ready.'],
        fr: ['initialisation des protocoles chitineux...',
             'chargement de la base de données gasconne...',
             'vérification de l\'intégrité de la carapace...',
             'décodage des signaux démiurgiques...','prêt.'],
    })[lang] || [];
    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0]||'';
    const iv = setInterval(() => {
        progress = Math.min(100, progress + Math.random()*18+8);
        if (bar) bar.style.width = progress+'%';
        const ti = Math.min(Math.floor((progress/100)*msgs.length), msgs.length-1);
        if (ti > msgIdx) { msgIdx=ti; if(sub) sub.innerText=msgs[msgIdx]; }
        if (progress >= 100) { if(sub) sub.innerText=msgs[msgs.length-1]; clearInterval(iv); }
    }, 400);
}


/* ══════════════════════════════════════════════════════════
   UI RENDERING
══════════════════════════════════════════════════════════ */
function updateUI() {
    renderSidebar();
    const middleRow = document.getElementById('email-list');
    const langBtn   = document.getElementById('lang-toggle-btn');
    if (langBtn) langBtn.innerText = currentLang==='en' ? '🐟 CRABE M\'A TUER' : '🌐 INTERNATIONAL';
    const titleEl = document.getElementById('app-win-title');
    if (titleEl) {
        let t = 'MOULTLOOK — ' + currentSection.toUpperCase();
        if (currentCategory) t += ' › ' + currentCategory.toUpperCase();
        titleEl.innerText = t;
    }
    if (['home','shell','search'].includes(currentSection)) {
        middleRow.style.display = 'none';
        if (currentSection==='search') renderSearchView(); else renderStaticContent();
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
        if (key==='inbox' && currentLang==='en') {
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
    let list = emails.filter(e => e.lang===currentLang && e.section===(currentSection==='unread'?'inbox':currentSection));
    if (currentCategory && currentLang==='en') list = list.filter(e => e.category===currentCategory);
    if (currentSection==='unread' && !selectedEmailId && list.length>0) selectedEmailId=list[0].id;
    if (!list.length) { container.innerHTML=`<div style="padding:14px;font-family:var(--font-mono);font-size:16px;color:var(--text-dimmer);letter-spacing:.08em;">[ empty ]</div>`; return; }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId===e.id?'active':''}" onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} | ${e.date}</small>
        </div>`).join('');
}

function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id===selectedEmailId);
        const demi  = demiurges[email.category] || { name:email.from, catchphrase:'', image:'https://via.placeholder.com/42x42/1C1008/E8A028?text=?' };
        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type==='pdf') bodyContent = `<iframe src="${email.url}" width="100%" height="520px"></iframe>`;
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
    } else if (currentCategory && currentLang==='en') {
        const demi = demiurges[currentCategory];
        view.innerHTML = `<div class="demiurge-profile"><h2>${demi.name}</h2><p class="demi-quote">"${demi.catchphrase}"</p><hr><p>${demi.description}</p></div>`;
    } else {
        view.innerHTML = `<div class="empty-state">[ select an item to view ]</div>`;
    }
}

function renderSearchView() {
    const label = currentLang==='en' ? 'Search the Database' : 'Rechercher';
    const ph = currentLang==='en' ? 'enter keyword...' : 'entrer un mot-clé...';
    const btn = currentLang==='en' ? 'EXECUTE' : 'CHERCHER';
    document.getElementById('content-view').innerHTML = `
        <div class="search-hero">
            <h1>${label}</h1>
            <div class="search-input-wrap">
                <input type="text" id="search-input" placeholder="${ph}" onkeyup="if(event.key==='Enter') executeSearch()">
                <button onclick="executeSearch()">${btn}</button>
            </div>
            <div id="search-results-area"></div>
        </div>`;
}

function executeSearch() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    if (!q) return;
    const results = emails.filter(e => e.lang===currentLang && (e.subject.toLowerCase().includes(q)||e.body.toLowerCase().includes(q)));
    const nr = currentLang==='en' ? `no results for "${q}".` : `aucun résultat pour "${q}".`;
    let html = `<div class="results-grid">`;
    if (!results.length) html += `<p style="font-family:var(--font-mono);color:var(--text-dim);font-size:17px;">${nr}</p>`;
    results.forEach(r => { html += `<div class="search-card"><h3>${r.subject}</h3><p>${r.body.substring(0,110)}...</p><button class="read-btn" onclick="jumpToEmail(${r.id})">READ →</button></div>`; });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
    const view = document.getElementById('content-view');
    if (currentSection==='home') view.innerHTML = `<div class="home-panel"><h2>// System //</h2><hr><p>${homeContent[currentLang]}</p></div>`;
    else if (currentSection==='shell') view.innerHTML = shellContent;
}

function navigate(s, c=null) { selectedEmailId=null; window.location.hash = c ? `${s}-${c}` : s; }
function selectEmail(id)  { selectedEmailId=id; updateUI(); }
function closeEmail()     { selectedEmailId=null; updateUI(); }
function jumpToEmail(id)  { const e=emails.find(x=>x.id===id); if(!e) return; selectedEmailId=id; navigate(e.section,e.category); }
function moult() { if(confirm(currentLang==='en'?'Discard shell? This will reload.':'Jeter la carapace ? La page va se recharger.')) location.reload(); }
function toggleLanguage() { startLoading(currentLang==='en'?'fr':'en'); }

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
