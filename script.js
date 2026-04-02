let currentLang = 'en'; 
let currentSection = 'home';
let currentCategory = null;
let selectedEmailId = null;

window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const parts = hash.split('-');
    currentSection = parts[0];
    currentCategory = parts[1] || null;
    updateUI();
}

function startLoading(lang) {
    currentLang = lang;
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('screen-loading').style.display = 'flex';
    document.getElementById('loading-title').innerText = lang === 'en' ? "Hardening chitin..." : "Mue en cours...";
    document.getElementById('banner-text').innerText = bannerContent[lang];
    document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';

    animateProgress(lang);

    setTimeout(() => {
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display = 'flex';
        window.location.hash = 'home';
        handleRouting();
    }, 2600);
}

function animateProgress(lang) {
    const bar = document.getElementById('progress-bar');
    const sub = document.getElementById('loading-sub');
    const messages = {
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
            "Chargement de la base de données gasconnes...",
            "Vérification de l'intégrité de la carapace...",
            "Décodage des signaux demiurgiques...",
            "Prêt."
        ]
    };
    const msgs = messages[lang] || messages.en;
    let progress = 0;
    let msgIdx = 0;
    if (bar) bar.style.width = '0%';
    if (sub) sub.innerText = msgs[0];

    const interval = setInterval(() => {
        const jump = Math.random() * 18 + 7;
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
    }, 400);
}

function updateUI() {
    renderSidebar();
    const middleRow = document.getElementById('email-list');
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.innerText = currentLang === 'en'
            ? "🇫🇷  CRABE M'A TUER"
            : "🌐  INTERNATIONAL";
    }

    // Update title bar
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
            shell:   '🐚 YOUR SHELL'
        },
        fr: {
            home:    '🏠 ADISHATZ',
            search:  '🔍 RECHERCHER',
            inbox:   '📥 REÇUS',
            sent:    '📤 ENVOYÉS',
            archive: '🗄️ ARCHIVE'
        }
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
                    `<div class="${currentCategory === c ? 'active' : ''}" onclick="navigate('inbox', '${c}')">
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
        container.innerHTML = `<div style="padding:16px; font-family:var(--font-vt); font-size:17px; color:#888; font-style:italic;">
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
        const demi = demiurges[email.category] || {
            name: email.from,
            catchphrase: "",
            image: "https://via.placeholder.com/52x52/808080/fff?text=?"
        };

        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') {
            bodyContent = `<iframe src="${email.url}" width="100%" height="500px"></iframe>`;
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
    const label = currentLang === 'en' ? '// SEARCH DATABASE //' : '// RECHERCHE //';
    const placeholder = currentLang === 'en' ? 'Enter keyword...' : 'Entrer un mot-clé...';
    const btnLabel = currentLang === 'en' ? 'EXECUTE' : 'CHERCHER';

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
        html += `<p style="font-family:var(--font-vt); color:#888; font-size:18px;">${noResultMsg}</p>`;
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

function toggleLanguage() {
    const msg = currentLang === 'en'
        ? "Switch to French mode? / Passer en mode français?"
        : "Switch to International mode? / Passer en mode international?";
    if (confirm(msg)) startLoading(currentLang === 'en' ? 'fr' : 'en');
}

function navigate(s, c = null) {
    selectedEmailId = null;
    window.location.hash = c ? `${s}-${c}` : s;
}
function selectEmail(id) { selectedEmailId = id; updateUI(); }
function closeEmail() { selectedEmailId = null; updateUI(); }
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

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});
