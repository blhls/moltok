/* ════════════════════════════════════════════════════════════════
   MOULTLOOK script.js v5
   Three-layer canvas: pixel stars · bokeh · constellation glitter
   Mouse repulsion · Occitan microcopy · Language-switch loading
   ════════════════════════════════════════════════════════════════ */

let currentLang     = 'en';
let currentSection  = 'home';
let currentCategory = null;
let selectedEmailId = null;

/* ══ CANVAS SETUP ═════════════════════════════════════════════════ */
const canvas = document.getElementById('glitter-canvas');
const ctx    = canvas.getContext('2d');

let pixelStars   = [];
let bokeh        = [];
let particles    = [];
let bgTime       = 0;
const mouse      = { x: -999, y: -999 };

const PALETTES = {
    en: [
        [192, 20,  60],   // cherry
        [141,200, 197],   // duckegg
        [ 61, 26, 107],   // indigo
        [200,168,  50],   // gold
        [232,208, 208],   // pale pink
        [232, 50,  90],   // cherry lit
        [123, 82, 200],   // indigo lit
        [128,  0,  32],   // burgundy
        [  0, 75,  73],   // duck
        [255,255, 255],   // white flash
    ],
    fr: [
        [212,168,  32],   // Occitan gold
        [  0,196, 176],   // electric teal
        [200, 24,  10],   // Occitan red
        [232, 48,  32],   // oc red lit
        [ 96,224, 212],   // teal lit
        [128,  0,  32],   // burgundy
        [240,204,  64],   // gold lit
        [  0,136, 120],   // teal deep
        [255,255, 255],   // white flash
        [255,180,  80],   // ochre light
    ],
};
function pal() { return PALETTES[currentLang] || PALETTES.en; }
function rndCol() { const c = pal()[Math.floor(Math.random()*pal().length)]; return c; }

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', () => { resize(); initBokeh(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize();

/* ── Layer 1: Pixel Star Field (TempleOS nod) ─────────────────── */
class PixelStar {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x    = Math.random() * canvas.width;
        this.y    = Math.random() * canvas.height;
        this.size = Math.random() < 0.75 ? 1 : 2;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.04 + 0.008;
        // mostly white, some palette-coloured
        if (Math.random() < 0.68) {
            this.r = 255; this.g = 255; this.b = 255;
        } else {
            const c = rndCol();
            this.r = c[0]; this.g = c[1]; this.b = c[2];
        }
        this.peak = Math.random() * 0.55 + 0.25;
    }
    update() { this.phase += this.speed; }
    draw() {
        const a = this.peak * Math.abs(Math.sin(this.phase));
        ctx.globalAlpha = a;
        ctx.fillStyle   = `rgb(${this.r},${this.g},${this.b})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function initPixelStars() {
    pixelStars = [];
    for (let i = 0; i < 420; i++) pixelStars.push(new PixelStar());
}

/* ── Layer 2: Bokeh Orbs ──────────────────────────────────────── */
function initBokeh() {
    bokeh = [];
    const P = pal();
    for (let i = 0; i < 10; i++) {
        const c = P[Math.floor(Math.random() * P.length)];
        bokeh.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 170 + 65,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            cr: c[0], cg: c[1], cb: c[2],
            alpha: Math.random() * 0.08 + 0.025,
        });
    }
}

function drawBokeh() {
    bokeh.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r) b.x = canvas.width  + b.r;
        if (b.x > canvas.width  + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = canvas.height + b.r;
        if (b.y > canvas.height + b.r) b.y = -b.r;
        const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        g.addColorStop(0, `rgba(${b.cr},${b.cg},${b.cb},${b.alpha})`);
        g.addColorStop(1, `rgba(${b.cr},${b.cg},${b.cb},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle   = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fill();
    });
}

/* ── Layer 3: Constellation Glitter (mouse-interactive) ───────── */
class GlitterParticle {
    constructor(init) {
        this.init(init);
    }
    init(initial = false) {
        const c       = rndCol();
        this.r = c[0]; this.g = c[1]; this.b = c[2];
        this.x        = Math.random() * canvas.width;
        this.y        = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 60;
        this.baseSize = Math.random() * 5 + 1;
        this.size     = this.baseSize;
        this.vx       = (Math.random() - 0.5) * 0.65;
        this.vy       = -(Math.random() * 0.85 + 0.3);
        this.ay       = -(Math.random() * 0.012 + 0.003);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.13;
        this.twinkle  = Math.random() * Math.PI * 2;
        this.tSpeed   = Math.random() * 0.09 + 0.022;
        this.flash    = 0;
        this.type     = Math.floor(Math.random() * 5);
    }
    update() {
        // Mouse repulsion
        const dx   = this.x - mouse.x;
        const dy   = this.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 90 && dist > 0) {
            const f = (90 - dist) / 90;
            this.vx += (dx / dist) * f * 0.38;
            this.vy += (dy / dist) * f * 0.38;
        }
        // Acceleration
        this.vy        += this.ay;
        this.x         += this.vx;
        this.y         += this.vy;
        this.rotation  += this.rotSpeed;
        this.twinkle   += this.tSpeed;
        this.size       = this.baseSize * (0.65 + 0.35 * Math.abs(Math.sin(this.twinkle)));
        if (Math.random() < 0.005) this.flash = 5;
        if (this.flash > 0)        this.flash--;
        // Speed cap
        const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (speed > 5) { this.vx *= 5/speed; this.vy *= 5/speed; }
        // Friction when fast (prevent runaway)
        if (speed > 2) { this.vx *= 0.96; this.vy *= 0.96; }
        if (this.y < -50 || this.x < -70 || this.x > canvas.width + 70) this.init(false);
    }
    draw() {
        const a = this.flash > 0 ? 1 : 0.32 + 0.68 * Math.abs(Math.sin(this.twinkle));
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = a;
        ctx.fillStyle   = `rgb(${this.r},${this.g},${this.b})`;
        ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.8)`;
        ctx.shadowBlur  = this.size * (this.flash > 0 ? 9 : 3);
        const s = this.size;
        ctx.beginPath();
        switch (this.type) {
            case 0: // diamond
                ctx.moveTo(0,-s); ctx.lineTo(s*.55,0); ctx.lineTo(0,s); ctx.lineTo(-s*.55,0);
                break;
            case 1: // 4-point star
                for (let i = 0; i < 8; i++) {
                    const rr = i%2===0 ? s : s*0.28;
                    const a  = (i/8)*Math.PI*2 - Math.PI/2;
                    i===0 ? ctx.moveTo(rr*Math.cos(a),rr*Math.sin(a)) : ctx.lineTo(rr*Math.cos(a),rr*Math.sin(a));
                }
                break;
            case 2: ctx.arc(0,0,s*.65,0,Math.PI*2); break;
            case 3:
                ctx.rect(-s*.13,-s,s*.26,s*2);
                ctx.rect(-s,-s*.13,s*2,s*.26);
                break;
            case 4: ctx.rect(-s*.5,-s*.5,s,s); break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function drawConstellations() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx   = particles[i].x - particles[j].x;
            const dy   = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 110) {
                ctx.globalAlpha = (1 - dist/110) * 0.18;
                ctx.strokeStyle = `rgb(${particles[i].r},${particles[i].g},${particles[i].b})`;
                ctx.lineWidth   = 0.6;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1;
}

/* ── Background Gradient ──────────────────────────────────────── */
function drawBackground() {
    bgTime += 0.0007;
    const cx = canvas.width  * 0.5;
    const cy = canvas.height * (0.42 + Math.sin(bgTime) * 0.04);
    const r  = canvas.width  * 0.95;
    const g  = ctx.createRadialGradient(cx, cy, canvas.height * 0.04, cx, cy, r);

    if (currentLang === 'fr') {
        // Occitan / Gascon: warm cream → ochre → wine → near-black
        g.addColorStop(0,    '#faf0e0');
        g.addColorStop(0.2,  '#ecd8a0');
        g.addColorStop(0.44, '#8a3800');
        g.addColorStop(0.66, '#4a0e20');
        g.addColorStop(0.84, '#1a0808');
        g.addColorStop(1,    '#080304');
    } else {
        // International: pale pink → cherry → mortuum → indigo
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

/* ── Main Loop ────────────────────────────────────────────────── */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    // Star field
    pixelStars.forEach(s => { s.update(); s.draw(); });
    ctx.globalAlpha = 1;
    // Bokeh
    drawBokeh();
    // Constellation lines first (behind particles)
    drawConstellations();
    // Particles on top
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

function initParticles(n = 150) {
    particles = [];
    for (let i = 0; i < n; i++) particles.push(new GlitterParticle(true));
}

function refreshCanvasForLang() {
    const P = pal();
    particles.forEach(p => {
        if (Math.random() < 0.65) {
            const c = P[Math.floor(Math.random()*P.length)];
            p.r = c[0]; p.g = c[1]; p.b = c[2];
        }
    });
    pixelStars.forEach(s => {
        if (Math.random() < 0.3) {
            const c = rndCol();
            s.r = c[0]; s.g = c[1]; s.b = c[2];
        }
    });
    initBokeh();
}

initBokeh();
initPixelStars();
initParticles();
animate();

/* ════════════════════════════════════════════════════════════════
   ROUTING
   ════════════════════════════════════════════════════════════════ */
window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const parts     = hash.split('-');
    currentSection  = parts[0];
    currentCategory = parts[1] || null;
    updateUI();
}

/* ════════════════════════════════════════════════════════════════
   LOADING — shared by initial login AND language switch
   ════════════════════════════════════════════════════════════════ */
function startLoading(lang) {
    currentLang = lang;
    document.getElementById('screen-login').style.display   = 'none';
    document.getElementById('screen-app').style.display     = 'none';
    document.getElementById('screen-loading').style.display = 'flex';

    document.getElementById('loading-title').innerText =
        lang === 'en' ? "Hardening chitin…" : "Mua en cors…";
    document.getElementById('banner-text').innerText = bannerContent[lang];
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

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
            "Dissolving the social contract…",
            "Loading ego and its own…",
            "Bypassing the demiurges…",
            "Assembling your phantoms…",
            "Resolving property spooks…",
            "Chitin density: sufficient.",
        ],
        fr: [
            "Destruccion del contracte social…",
            "Cargament de l'Ego e lo sieu ben…",
            "Contornament dels demiurgas…",
            "Assemblatge dels fantosmes…",
            "Còsas de la Gasconha en linha…",
            "Adishatz, trahidor.",
        ],
    }[lang];

    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText   = msgs[0];

    const tick = setInterval(() => {
        progress = Math.min(100, progress + Math.random()*16 + 6);
        if (bar) bar.style.width = progress + '%';
        const target = Math.min(Math.floor((progress/100)*msgs.length), msgs.length-1);
        if (target > msgIdx) { msgIdx = target; if (sub) sub.innerText = msgs[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = msgs[msgs.length-1]; clearInterval(tick); }
    }, 420);
}

/* ════════════════════════════════════════════════════════════════
   UI
   ════════════════════════════════════════════════════════════════ */
function updateUI() {
    renderSidebar();
    const middle  = document.getElementById('email-list');
    const langBtn = document.getElementById('lang-toggle-btn');
    const titleEl = document.getElementById('app-win-title');

    if (langBtn) {
        langBtn.innerText = currentLang === 'en'
            ? "🏔 GASCONHA"
            : "🌐 INTERNATIONAL";
    }
    if (titleEl) {
        let t = 'MOULTLOOK — ' + currentSection.toUpperCase();
        if (currentCategory) t += ' › ' + currentCategory.toUpperCase();
        titleEl.innerText = t;
    }

    if (['home','shell','search'].includes(currentSection)) {
        middle.style.display = 'none';
        if (currentSection === 'search') renderSearchView();
        else                             renderStaticContent();
    } else {
        middle.style.display    = 'flex';
        middle.style.flexDirection = 'column';
        renderEmailList();
        renderEmailContent();
    }
}

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
        html += `<div class="nav-item ${currentSection===key?'active':''}"
                      onclick="navigate('${key}')">
                    <span class="txt">${label}</span>
                 </div>`;
        if (key === 'inbox' && currentLang === 'en') {
            const cats = ['patriarchy','imperialism','capitalism','notes'];
            html += '<div class="nav-sub">' +
                cats.map(c =>
                    `<div class="${currentCategory===c?'active':''}"
                          onclick="navigate('inbox','${c}')">↳ ${c}</div>`
                ).join('') +
            '</div>';
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
    if (currentCategory && currentLang === 'en')
        list = list.filter(e => e.category === currentCategory);
    if (currentSection === 'unread' && !selectedEmailId && list.length)
        selectedEmailId = list[0].id;

    if (!list.length) {
        const emptyMsg = currentLang === 'en'
            ? '[ nothing here. suspiciously empty. ]'
            : '[ ren aquí. sus·pi·ci·ós. ]';
        container.innerHTML = `<div class="middle-empty">${emptyMsg}</div>`;
        return;
    }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId===e.id?'active':''}"
             onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} &nbsp;·&nbsp; ${e.date}</small>
        </div>`
    ).join('');
}

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
                    <hr class="demi-sep">
                    <p class="demiurge-desc">${demi.description}</p>
                </div>
            </div>`;
    } else {
        const msg = currentLang === 'en'
            ? '[ Select an item to view. ]<br><br>🦀'
            : '[ Seleccionar un element. ]<br><br>🦀';
        view.innerHTML = `<div class="empty-state">${msg}</div>`;
    }
}

function renderSearchView() {
    const lbl = currentLang === 'en' ? '// SEARCH DATABASE //' : '// RECERCAR //';
    const ph  = currentLang === 'en' ? 'search for a spook…' : 'cercar un fantosme…';
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
        ? `No results for "${q}". The void answers.`
        : `Cap resultat per "${q}". Lo void respon.`;
    let html = '<div class="results-grid">';
    if (!results.length) html += `<p style="font-family:var(--font-ui);color:var(--bg-deep-border);font-size:15px;font-style:italic;">${none}</p>`;
    results.forEach(r => {
        html += `<div class="search-card">
            <h3>${r.subject}</h3>
            <p>${r.body.substring(0,120)}…</p>
            <button class="read-btn" onclick="jumpToEmail(${r.id})">READ →</button>
        </div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + '</div>';
}

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

/* ════════════════════════════════════════════════════════════════
   CONTROLS
   ════════════════════════════════════════════════════════════════ */
function toggleLanguage() {
    const msg = currentLang === 'en'
        ? "Switch to Gascony? The landlord stays behind."
        : "Switch to International? La Gasconha resta.";
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
        ? "Shed the shell? Very Stirner of you. Page reloads."
        : "Mudar la carapaca? Molt stirnerien. La pagina se recarga.";
    if (confirm(msg)) location.reload();
}
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
