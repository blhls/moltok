/* ═══════════════════════════════════════════════════════════════
   MOULTLOOK script.js v4
   Canvas glitter · Gascony palette · Language-switch loading
   ═══════════════════════════════════════════════════════════════ */

/* ── STATE ────────────────────────────────────────────────────── */
let currentLang     = 'en';
let currentSection  = 'home';
let currentCategory = null;
let selectedEmailId = null;

/* ═══════════════════════════════════════════════════════════════
   CANVAS — Acceleration Glitter
   ═══════════════════════════════════════════════════════════════ */
const canvas = document.getElementById('glitter-canvas');
const ctx    = canvas.getContext('2d');
let particles    = [];
let bokehCircles = [];
let bgTime       = 0;

/* Palette sets — swapped on language change */
const PALETTES = {
    en: [
        [192,  20,  60],   /* cherry */
        [141, 200, 197],   /* duck egg */
        [ 61,  26, 107],   /* indigo */
        [200, 168,  50],   /* gold */
        [232, 208, 208],   /* pale pink */
        [232,  50,  90],   /* cherry lit */
        [123,  82, 200],   /* indigo lit */
        [128,   0,  32],   /* burgundy */
        [  0,  75,  73],   /* duck */
    ],
    fr: [
        [ 26,  74,  90],   /* petroleum */
        [141, 200, 197],   /* duckegg */
        [ 61,  26, 107],   /* indigo */
        [255,  45, 120],   /* hot pink */
        [192,  16,  64],   /* bixbite */
        [ 42, 112, 144],   /* petrol lit */
        [224,  48,  90],   /* bixbite lit */
        [128,   0,  32],   /* burgundy */
        [184, 228, 226],   /* duckegg lit */
    ],
};

function getPalette() { return PALETTES[currentLang] || PALETTES.en; }

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

/* ── Glitter Particle ──────────────────────────────────────────── */
class GlitterParticle {
    constructor(initial) { this.init(initial); }
    init(initial = false) {
        const PAL       = getPalette();
        const col       = PAL[Math.floor(Math.random() * PAL.length)];
        this.r = col[0]; this.g = col[1]; this.b = col[2];
        this.x          = Math.random() * canvas.width;
        this.y          = initial
            ? Math.random() * canvas.height
            : canvas.height + Math.random() * 80;
        this.baseSize   = Math.random() * 5.5 + 1;
        this.size       = this.baseSize;
        this.vx         = (Math.random() - 0.5) * 0.7;
        this.vy         = -(Math.random() * 0.9 + 0.3);
        this.ay         = -(Math.random() * 0.013 + 0.003);
        this.rotation   = Math.random() * Math.PI * 2;
        this.rotSpeed   = (Math.random() - 0.5) * 0.14;
        this.twinkle    = Math.random() * Math.PI * 2;
        this.twinkleSpd = Math.random() * 0.1 + 0.025;
        this.flashTimer = 0;
        this.type       = Math.floor(Math.random() * 5);
    }
    update() {
        this.vy      += this.ay;
        this.x       += this.vx;
        this.y       += this.vy;
        this.rotation += this.rotSpeed;
        this.twinkle  += this.twinkleSpd;
        this.size      = this.baseSize * (0.65 + 0.35 * Math.abs(Math.sin(this.twinkle)));
        if (Math.random() < 0.006) this.flashTimer = 4;
        if (this.flashTimer > 0)   this.flashTimer--;
        if (this.vy < -5) this.vy = -5;
        if (this.y < -40 || this.x < -60 || this.x > canvas.width + 60) this.init(false);
    }
    draw() {
        const alpha = this.flashTimer > 0
            ? 1.0
            : 0.35 + 0.65 * Math.abs(Math.sin(this.twinkle));
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha   = alpha;
        ctx.fillStyle     = `rgb(${this.r},${this.g},${this.b})`;
        ctx.shadowColor   = `rgba(${this.r},${this.g},${this.b},0.8)`;
        ctx.shadowBlur    = this.size * (this.flashTimer > 0 ? 8 : 3);
        const s = this.size;
        ctx.beginPath();
        switch (this.type) {
            case 0: /* diamond */
                ctx.moveTo(0,-s); ctx.lineTo(s*.55,0); ctx.lineTo(0,s); ctx.lineTo(-s*.55,0);
                break;
            case 1: /* 4-point star */
                for (let i = 0; i < 8; i++) {
                    const rr = i%2===0 ? s : s*0.28;
                    const a  = (i/8)*Math.PI*2 - Math.PI/2;
                    if (i===0) ctx.moveTo(rr*Math.cos(a), rr*Math.sin(a));
                    else       ctx.lineTo(rr*Math.cos(a), rr*Math.sin(a));
                }
                break;
            case 2: ctx.arc(0,0,s*.65,0,Math.PI*2); break;
            case 3:
                ctx.rect(-s*.14,-s,s*.28,s*2);
                ctx.rect(-s,-s*.14,s*2,s*.28);
                break;
            case 4: ctx.rect(-s*.5,-s*.5,s,s); break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

/* ── Bokeh ─────────────────────────────────────────────────────── */
function initBokeh() {
    const PAL = getPalette();
    bokehCircles = [];
    for (let i = 0; i < 11; i++) {
        const col = PAL[Math.floor(Math.random() * PAL.length)];
        bokehCircles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 180 + 60,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            cr: col[0], cg: col[1], cb: col[2],
            alpha: Math.random() * 0.08 + 0.03,
        });
    }
}

function drawBokeh() {
    bokehCircles.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r)                 b.x = canvas.width  + b.r;
        if (b.x > canvas.width  + b.r)  b.x = -b.r;
        if (b.y < -b.r)                 b.y = canvas.height + b.r;
        if (b.y > canvas.height + b.r)  b.y = -b.r;
        const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        g.addColorStop(0, `rgba(${b.cr},${b.cg},${b.cb},${b.alpha})`);
        g.addColorStop(1, `rgba(${b.cr},${b.cg},${b.cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.fill();
    });
}

/* ── Background gradient — different for EN / FR ───────────────── */
function drawBackground() {
    bgTime += 0.0007;
    const cx = canvas.width  * 0.5;
    const cy = canvas.height * (0.4 + Math.sin(bgTime) * 0.04);
    const r  = canvas.width  * 0.95;
    const g  = ctx.createRadialGradient(cx, cy, canvas.height * 0.04, cx, cy, r);

    if (currentLang === 'fr') {
        /* Gascony: cool mist → petroleum → indigo with bixbite/hotpink sparks implied */
        g.addColorStop(0,    '#e8f4f6');
        g.addColorStop(0.18, '#c8dce4');
        g.addColorStop(0.42, '#2a7090');
        g.addColorStop(0.65, '#1a4a5a');
        g.addColorStop(0.82, '#2a1a50');
        g.addColorStop(1,    '#070e20');
    } else {
        /* International: pale pink → cherry → mortuum → indigo */
        g.addColorStop(0,    '#f8e8e8');
        g.addColorStop(0.18, '#f0d0d0');
        g.addColorStop(0.42, '#c06080');
        g.addColorStop(0.68, '#3d1a6b');
        g.addColorStop(0.85, '#59001b');
        g.addColorStop(1,    '#180010');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* ── Animate ───────────────────────────────────────────────────── */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBokeh();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

function initParticles(count = 200) {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new GlitterParticle(true));
}

function refreshCanvasForLang() {
    /* Re-colour existing particles to new palette gradually */
    const PAL = getPalette();
    particles.forEach(p => {
        if (Math.random() < 0.6) {
            const col = PAL[Math.floor(Math.random() * PAL.length)];
            p.r = col[0]; p.g = col[1]; p.b = col[2];
        }
    });
    initBokeh();
}

window.addEventListener('resize', () => { resizeCanvas(); initBokeh(); });
resizeCanvas();
initBokeh();
initParticles();
animate();

/* ═══════════════════════════════════════════════════════════════
   ROUTING
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const parts     = hash.split('-');
    currentSection  = parts[0];
    currentCategory = parts[1] || null;
    updateUI();
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN — shared by initial load & language switch
   ═══════════════════════════════════════════════════════════════ */
function startLoading(lang) {
    currentLang = lang;

    /* Hide whichever screen is currently active */
    document.getElementById('screen-login').style.display  = 'none';
    document.getElementById('screen-app').style.display    = 'none';
    document.getElementById('screen-loading').style.display = 'flex';

    document.getElementById('loading-title').innerText =
        lang === 'en' ? "Hardening chitin…" : "Mue en cours…";
    document.getElementById('banner-text').innerText = bannerContent[lang];
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

    /* Switch canvas palette immediately */
    refreshCanvasForLang();

    animateProgress(lang);

    setTimeout(() => {
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display     = 'flex';
        window.location.hash = 'home';
        handleRouting();
    }, 2800);
}

function animateProgress(lang) {
    const bar  = document.getElementById('progress-bar');
    const sub  = document.getElementById('loading-sub');
    const msgs = {
        en: [
            "Initialising chitin protocols…",
            "Loading crustacean database…",
            "Establishing shell integrity…",
            "Decoding demiurge signals…",
            "Compiling subjective reality…",
            "Ready.",
        ],
        fr: [
            "Chargement des archives gasconnes…",
            "Vérification de la carapace chitineuse…",
            "Connexion à l'oc·ci·tan·ie profonde…",
            "Décodage des signaux demiurgiques…",
            "Compilation de la réalité subjective…",
            "Adishatz.",
        ],
    }[lang];

    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText   = msgs[0];

    const tick = setInterval(() => {
        progress = Math.min(100, progress + Math.random() * 16 + 6);
        if (bar) bar.style.width = progress + '%';
        const target = Math.min(Math.floor((progress/100)*msgs.length), msgs.length-1);
        if (target > msgIdx) { msgIdx = target; if (sub) sub.innerText = msgs[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length-1]; clearInterval(tick); }
    }, 420);
}

/* ═══════════════════════════════════════════════════════════════
   UI RENDER
   ═══════════════════════════════════════════════════════════════ */
function updateUI() {
    renderSidebar();

    const middle  = document.getElementById('email-list');
    const langBtn = document.getElementById('lang-toggle-btn');
    const titleEl = document.getElementById('app-win-title');

    if (langBtn) {
        langBtn.innerText = currentLang === 'en'
            ? "🏔  GASCOGNE"
            : "🌐  INTERNATIONAL";
    }
    if (titleEl) {
        let t = 'MOULTLOOK — ' + currentSection.toUpperCase();
        if (currentCategory) t += ' › ' + currentCategory.toUpperCase();
        titleEl.innerText = t;
    }

    if (['home', 'shell', 'search'].includes(currentSection)) {
        middle.style.display = 'none';
        if (currentSection === 'search') renderSearchView();
        else                             renderStaticContent();
    } else {
        middle.style.display = 'flex';
        middle.style.flexDirection = 'column';
        renderEmailList();
        renderEmailContent();
    }
}

/* ── Sidebar ──────────────────────────────────────────────────── */
function renderSidebar() {
    const nav  = document.getElementById('sidebar-nav');
    const menu = {
        en: {
            home:    '🏠 HOME',
            unread:  '🆕 UNREAD',
            search:  '🔍 SEARCH',
            inbox:   '📥 INBOX',
            sent:    '📤 SENT',
            drafts:  '📝 DRAFTS',
            archive: '🗄 ARCHIVE',
            shell:   '🐚 YOUR SHELL',
        },
        fr: {
            home:    '🏠 ADISHATZ',
            search:  '🔍 RECERCAR',
            inbox:   '📥 REÇUTS',
            sent:    '📤 ENVIATS',
            archive: '🗄 ARCHIU',
        },
    }[currentLang];

    let html = '';
    for (const [key, label] of Object.entries(menu)) {
        html += `<div class="nav-item ${currentSection === key ? 'active' : ''}"
                      onclick="navigate('${key}')">
                    <span class="txt">${label}</span>
                 </div>`;
        if (key === 'inbox' && currentLang === 'en') {
            const cats = ['patriarchy', 'imperialism', 'capitalism', 'notes'];
            html += `<div class="nav-sub">` +
                cats.map(c =>
                    `<div class="${currentCategory === c ? 'active' : ''}"
                          onclick="navigate('inbox','${c}')">↳ ${c}</div>`
                ).join('') +
            `</div>`;
        }
    }
    nav.innerHTML = html;
}

/* ── Email List ───────────────────────────────────────────────── */
function renderEmailList() {
    const container = document.getElementById('email-list');
    let list = emails.filter(e =>
        e.lang === currentLang &&
        e.section === (currentSection === 'unread' ? 'inbox' : currentSection)
    );
    if (currentCategory && currentLang === 'en')
        list = list.filter(e => e.category === currentCategory);

    if (currentSection === 'unread' && !selectedEmailId && list.length)
        selectedEmailId = list[0].id;

    if (!list.length) {
        container.innerHTML = `<div class="middle-empty">[ Empty ]</div>`;
        return;
    }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId === e.id ? 'active' : ''}"
             onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} &nbsp;·&nbsp; ${e.date}</small>
        </div>`
    ).join('');
}

/* ── Email Content ────────────────────────────────────────────── */
function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id === selectedEmailId);
        const demi  = demiurges[email.category] || {
            name: email.from,
            catchphrase: '',
            image: 'https://via.placeholder.com/58x58/59001b/ffffff?text=?',
        };

        const bodyHTML = email.type === 'pdf'
            ? `<iframe src="${email.url}" width="100%" height="500px"></iframe>`
            : `<div class="email-body">${email.body}</div>`;

        view.innerHTML = `
            <div class="email-panel">
                <div class="mini-profile">
                    <img src="${demi.image}" class="mini-img" alt="${demi.name}">
                    <div>
                        <strong>${demi.name}</strong>
                        <small>${demi.catchphrase}</small>
                    </div>
                </div>
                <div class="email-container">
                    <div class="close-btn" onclick="closeEmail()">✕ CLOSE</div>
                    <div class="email-container-header">
                        <h2>${email.subject}</h2>
                        <p>${email.date} &nbsp;·&nbsp; ${email.from}</p>
                    </div>
                    <hr>
                    ${bodyHTML}
                </div>
            </div>`;
    } else if (currentCategory && currentLang === 'en') {
        const demi = demiurges[currentCategory];
        view.innerHTML = `
            <div class="demiurge-panel">
                <div class="demiurge-panel-inner">
                    <h2 class="glitch-subtle">${demi.name}</h2>
                    <p class="demiurge-quote">"${demi.catchphrase}"</p>
                    <hr style="border-color:rgba(200,168,50,0.2); margin:0 0 20px;">
                    <p class="demiurge-desc">${demi.description}</p>
                </div>
            </div>`;
    } else {
        view.innerHTML = `<div class="empty-state">[ Select an item to view. ]<br><br>🦀</div>`;
    }
}

/* ── Search ───────────────────────────────────────────────────── */
function renderSearchView() {
    const lbl = currentLang === 'en' ? '// SEARCH DATABASE //' : '// RECERCAR //';
    const ph  = currentLang === 'en' ? 'Enter keyword…' : 'Paraula-clau…';
    const btn = currentLang === 'en' ? 'EXECUTE' : 'CERCAR';
    document.getElementById('content-view').innerHTML = `
        <div class="search-hero">
            <h1>${lbl}</h1>
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
    const none = currentLang === 'en'
        ? `No results for "${q}".`
        : `Cap resultat per "${q}".`;
    let html = `<div class="results-grid">`;
    if (!results.length) html += `<p style="font-family:var(--font-ui);color:var(--pink-deep);font-size:15px;">${none}</p>`;
    results.forEach(r => {
        html += `<div class="search-card">
            <h3>${r.subject}</h3>
            <p>${r.body.substring(0, 120)}…</p>
            <button class="read-btn" onclick="jumpToEmail(${r.id})">READ →</button>
        </div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

/* ── Static content ───────────────────────────────────────────── */
function renderStaticContent() {
    const view = document.getElementById('content-view');
    if (currentSection === 'home') {
        view.innerHTML = `
            <div class="panel-base">
                <div class="panel-header"><h2>// SYSTEM //</h2></div>
                <div class="panel-body">${homeContent[currentLang]}</div>
            </div>`;
    } else if (currentSection === 'shell') {
        view.innerHTML = shellContent;
    }
}

/* ═══════════════════════════════════════════════════════════════
   CONTROLS
   ═══════════════════════════════════════════════════════════════ */
function toggleLanguage() {
    const msg = currentLang === 'en'
        ? "Switch to Gascony mode? / Bascular en mòde gascon?"
        : "Switch to International? / Bascular en mòde international?";
    if (confirm(msg)) startLoading(currentLang === 'en' ? 'fr' : 'en');
}

function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id)   { selectedEmailId = id; updateUI(); }
function closeEmail()       { selectedEmailId = null; updateUI(); }
function jumpToEmail(id)   {
    const e = emails.find(x => x.id === id);
    if (!e) return;
    selectedEmailId = id;
    navigate(e.section, e.category);
}
function moult() {
    const msg = currentLang === 'en'
        ? "Discard shell? This will reload."
        : "Jucar la carapaca? La pagina se recargara.";
    if (confirm(msg)) location.reload();
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
