/* ═══════════════════════════════════════════════════════════════════
   MOULTLOOK — script.js v3.0
   Canvas animation · Glitch scramble · Navigation · Language toggle
   ═══════════════════════════════════════════════════════════════════ */

let currentLang = 'en';
let currentSection = 'home';
let currentCategory = null;
let selectedEmailId = null;

/* Canvas state */
let loginAnim = null;
let loadingAnim = null;

/* ────────────────────────────────────────────────────────────────────
   CANVAS BACKGROUND ANIMATION
   Glitter particles + scan sweep + gradient mesh
   ──────────────────────────────────────────────────────────────────── */

const PALETTES = {
    en: {
        grad:  ['#1A0020', '#0D000E', '#060008', '#020004'],
        grid:  'rgba(89, 0, 27, 0.14)',
        sparks: ['#FF1868', '#FFCC00', '#7BBFBD', '#BF0030', '#FFB3CC', '#4A2FA0', '#E0A0B0']
    },
    fr: {
        grad:  ['#010C1A', '#020810', '#030D18', '#010408'],
        grid:  'rgba(0, 75, 73, 0.14)',
        sparks: ['#FF1868', '#7BBFBD', '#004B49', '#4A2FA0', '#B0D0F0', '#FFB3CC', '#FFCC00']
    }
};

function makeParticles(canvas, palette) {
    const particles = [];
    for (let i = 0; i < 220; i++) {
        const speed = Math.random() < 0.15 ? (Math.random() * 0.9 + 0.4) : (Math.random() * 0.25 + 0.03);
        particles.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            size:  Math.floor(Math.random() * 3) + 1,
            color: palette[Math.floor(Math.random() * palette.length)],
            vx:    (Math.random() - 0.5) * speed,
            vy:    (Math.random() - 0.5) * speed,
            alpha: Math.random(),
            dA:    (Math.random() - 0.5) * 0.025,
            spark: Math.random() < 0.08   /* fast-flicker sparkle */
        });
    }
    return particles;
}

function startCanvas(canvasId, lang) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx  = canvas.getContext('2d');
    const pal  = PALETTES[lang] || PALETTES.en;
    const pts  = makeParticles(canvas, pal.sparks);

    let scanY      = -40;
    let scanActive = false;
    let stopped    = false;

    function scheduleScan() {
        if (stopped) return;
        setTimeout(() => {
            if (stopped) return;
            scanActive = true;
            scanY = -40;
            animScan();
        }, 2800 + Math.random() * 5000);
    }

    function animScan() {
        if (stopped) return;
        scanY += 10;
        if (scanY > canvas.height + 40) { scanActive = false; scheduleScan(); return; }
        requestAnimationFrame(animScan);
    }

    scheduleScan();

    function draw() {
        if (stopped) return;

        /* Gradient background */
        const g = pal.grad;
        const gr = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.45, 0,
            canvas.width * 0.5, canvas.height * 0.5, Math.max(canvas.width, canvas.height) * 0.72
        );
        gr.addColorStop(0,   g[0]);
        gr.addColorStop(0.4, g[1]);
        gr.addColorStop(0.7, g[2]);
        gr.addColorStop(1,   g[3]);
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        /* Pixel grid */
        ctx.strokeStyle = pal.grid;
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        /* Glitter particles */
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.spark) {
                p.alpha = Math.random();
            } else {
                p.alpha += p.dA;
                if (p.alpha <= 0 || p.alpha >= 1) p.dA *= -1;
                p.alpha = Math.max(0, Math.min(1, p.alpha));
            }
            if (p.x < 0)              p.x = canvas.width;
            if (p.x > canvas.width)   p.x = 0;
            if (p.y < 0)              p.y = canvas.height;
            if (p.y > canvas.height)  p.y = 0;

            ctx.globalAlpha = p.alpha * 0.85;
            ctx.fillStyle   = p.color;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });

        /* Horizontal scan sweep */
        if (scanActive) {
            const sg = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
            sg.addColorStop(0,   'rgba(255,255,255,0)');
            sg.addColorStop(0.5, 'rgba(255,255,255,0.025)');
            sg.addColorStop(1,   'rgba(255,255,255,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle   = sg;
            ctx.fillRect(0, scanY - 20, canvas.width, 40);
        }

        ctx.globalAlpha = 1;
        if (!stopped) requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return { stop: () => { stopped = true; window.removeEventListener('resize', onResize); } };
}


/* ────────────────────────────────────────────────────────────────────
   TITLE TEXT SCRAMBLE — login mega-glitch
   ──────────────────────────────────────────────────────────────────── */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&░▒▓█';

function scrambleTitle() {
    const span = document.querySelector('.glitch-text');
    if (!span) return;
    const original = 'MOULTLOOK.COM';
    let iter = 0;
    const iv = setInterval(() => {
        span.textContent = original.split('').map((ch, i) => {
            if (ch === '.' || ch === ' ') return ch;
            if (i < iter) return ch;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('');
        iter += 0.45;
        if (iter >= original.length) {
            clearInterval(iv);
            span.textContent = original;
        }
    }, 45);
}

function initTitleScramble() {
    setTimeout(scrambleTitle, 600);
    setInterval(scrambleTitle, 8000);
}


/* ────────────────────────────────────────────────────────────────────
   INIT — runs on page load
   ──────────────────────────────────────────────────────────────────── */
(function init() {
    loginAnim = startCanvas('login-canvas', currentLang);
    initTitleScramble();
})();


/* ────────────────────────────────────────────────────────────────────
   NAVIGATION & ROUTING
   ──────────────────────────────────────────────────────────────────── */
window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const parts = hash.split('-');
    currentSection  = parts[0];
    currentCategory = parts[1] || null;
    updateUI();
}

function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id) { selectedEmailId = id; updateUI(); }
function closeEmail()    { selectedEmailId = null; updateUI(); }
function jumpToEmail(id) {
    const e = emails.find(x => x.id === id);
    if (!e) return;
    selectedEmailId = id;
    navigate(e.section, e.category);
}
function moult() {
    const msg = currentLang === 'en'
        ? "Discard shell? This will reload."
        : "Jeter la carapace? La page va se recharger.";
    if (confirm(msg)) location.reload();
}


/* ────────────────────────────────────────────────────────────────────
   LOADING + LANGUAGE SWITCH
   ──────────────────────────────────────────────────────────────────── */
function startLoading(lang) {
    currentLang = lang;

    /* Switch to loading screen */
    document.getElementById('screen-login').style.display    = 'none';
    document.getElementById('screen-app').style.display      = 'none';
    const loadingEl = document.getElementById('screen-loading');
    loadingEl.style.display = 'flex';

    /* Apply mode class so titlebar gradient switches immediately */
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

    /* Start loading canvas with correct palette */
    if (loadingAnim) { loadingAnim.stop(); loadingAnim = null; }
    loadingAnim = startCanvas('loading-canvas', lang);

    /* Loading text */
    document.getElementById('loading-title').innerText =
        lang === 'en' ? "Hardening chitin..." : "Mue en cours...";
    document.getElementById('banner-text').innerText = bannerContent[lang];

    /* Populate gif-space from data (future avatars) */
    populateGifSpace();

    animateProgress(lang);

    setTimeout(() => {
        if (loadingAnim) { loadingAnim.stop(); loadingAnim = null; }
        loadingEl.style.display = 'none';
        document.getElementById('screen-app').style.display = 'flex';
        window.location.hash = 'home';
        handleRouting();
    }, 2800);
}

/* ── Populate the gif-space row in loading ────────────────────────── */
function populateGifSpace() {
    const row = document.getElementById('gif-space');
    if (!row) return;
    /* gifSlots is optional in data.js — add an array of {src, alt} objects */
    if (typeof gifSlots !== 'undefined' && gifSlots.length) {
        row.innerHTML = gifSlots.map(g =>
            `<img src="${g.src}" alt="${g.alt || ''}" class="gif-slot" 
                  onerror="this.className='gif-slot gif-slot--empty'">`
        ).join('');
    }
    /* else keep the default empty slots from HTML */
}

/* ── Progress bar ─────────────────────────────────────────────────── */
function animateProgress(lang) {
    const bar  = document.getElementById('progress-bar');
    const sub  = document.getElementById('loading-sub');
    const msgs = {
        en: [
            "Initialising chitin protocols...",
            "Loading crustacean database...",
            "Establishing shell integrity...",
            "Decoding demiurge signals...",
            "Compiling subjective reality...",
            "Ready."
        ],
        fr: [
            "Initialisation des protocoles chitineux...",
            "Chargement de la base gasconne...",
            "Vérification de l'intégrité de la carapace...",
            "Décodage des signaux démiurgiques...",
            "Compilation de la réalité subjective...",
            "Prêt."
        ]
    };
    const list = msgs[lang] || msgs.en;
    let progress = 0, msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = list[0];

    const iv = setInterval(() => {
        const jump = Math.random() * 16 + 6;
        progress = Math.min(100, progress + jump);
        if (bar) bar.style.width = progress + '%';
        const ti = Math.min(Math.floor((progress / 100) * list.length), list.length - 1);
        if (ti > msgIdx) { msgIdx = ti; if (sub) sub.innerText = list[msgIdx]; }
        if (progress >= 100) { if (sub) sub.innerText = list[list.length - 1]; clearInterval(iv); }
    }, 420);
}

/* ── Language toggle (in-app) ─────────────────────────────────────── */
function toggleLanguage() {
    const msg = currentLang === 'en'
        ? "Switch to Gascony mode? / Passer en mode gascogne?"
        : "Switch to International mode? / Passer en mode international?";
    if (confirm(msg)) startLoading(currentLang === 'en' ? 'fr' : 'en');
}


/* ────────────────────────────────────────────────────────────────────
   UI RENDER
   ──────────────────────────────────────────────────────────────────── */
function updateUI() {
    renderSidebar();
    const middleRow = document.getElementById('email-list');
    const langBtn   = document.getElementById('lang-toggle-btn');

    if (langBtn) {
        langBtn.innerText = currentLang === 'en'
            ? "🌾  GASCOGNE OCCUPÉE"
            : "🌐  INTERNATIONAL";
    }

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

/* ── Sidebar ─────────────────────────────────────────────────────── */
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
            shell:   '🐚 YOUR SHELL'
        },
        fr: {
            home:    '🏠 ADISHATZ',
            search:  '🔍 CERCAR',
            inbox:   '📥 RECEBUTS',
            sent:    '📤 ENVIATS',
            archive: '🗄️ ARCHIU'
        }
    };

    let html = '';
    for (const [key, label] of Object.entries(menus[currentLang])) {
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

/* ── Email list ─────────────────────────────────────────────────── */
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
        container.innerHTML = `<div style="padding:16px; font-family:var(--font-vt); font-size:17px; color:#9A7070; font-style:italic;">[ Empty. ]</div>`;
        return;
    }
    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId === e.id ? 'active' : ''}" onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong>
            <small>${e.from} &nbsp;|&nbsp; ${e.date}</small>
        </div>`
    ).join('');
}

/* ── Email content ─────────────────────────────────────────────── */
function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id === selectedEmailId);
        const demi  = demiurges[email.category] || {
            name:       email.from,
            catchphrase: "",
            image:      "https://via.placeholder.com/58x58/808080/fff?text=?"
        };

        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') {
            bodyContent = `<iframe src="${email.url}" width="100%" height="520px"></iframe>`;
        }

        /* mini-img: swap demi.image for an animated gif src per contact in data.js */
        view.innerHTML = `
            <div class="mini-profile">
                <img src="${demi.image}" class="mini-img" alt="${demi.name}"
                     onerror="this.src='https://via.placeholder.com/58x58/59001B/fff?text=?'">
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

/* ── Search ────────────────────────────────────────────────────── */
function renderSearchView() {
    const label       = currentLang === 'en' ? '// SEARCH DATABASE //' : '// CERCAR //';
    const placeholder = currentLang === 'en' ? 'Enter keyword...' : 'Mot clau...';
    const btnLabel    = currentLang === 'en' ? 'EXECUTE' : 'CERCAR';
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
    const noMsg = currentLang === 'en' ? `No results for "${q}".` : `Cap resultat per "${q}".`;
    let html = `<div class="results-grid">`;
    if (!results.length) html += `<p style="font-family:var(--font-vt);color:#888;font-size:18px;">${noMsg}</p>`;
    results.forEach(res => {
        html += `<div class="search-card">
            <h3>${res.subject}</h3>
            <p>${res.body.substring(0, 110)}...</p>
            <button class="read-btn" onclick="jumpToEmail(${res.id})">READ →</button>
        </div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

/* ── Static content ─────────────────────────────────────────────── */
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

/* ── Sidebar toggle ─────────────────────────────────────────────── */
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
