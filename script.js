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

    setTimeout(() => {
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display = 'block';
        window.location.hash = 'home';
        handleRouting();
    }, 1800);
}

function updateUI() {
    renderSidebar();
    const middleRow = document.getElementById('email-list-wrapper'); // Targeting the wrapper added in HTML
    document.getElementById('lang-toggle-btn').innerText = currentLang === 'en' ? "CRABE M'A TUER - GO TO FRENCH NEWS" : "ADIU! - GO TO INTERNATIONAL NEWS";

    if (['home', 'shell', 'search'].includes(currentSection)) {
        middleRow.style.display = 'none';
        if (currentSection === 'search') renderSearchView();
        else renderStaticContent();
    } else {
        middleRow.style.display = 'flex';
        renderEmailList();
        renderEmailContent();
    }
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const menus = {
        en: { home:'🏠 HOME', unread:'🆕 UNREAD', search:'🔍 SEARCH', inbox:'📥 INBOX', sent:'📤 SENT', drafts:'📝 DRAFTS', archive:'🗄️ ARCHIVE', shell:'🐚 YOUR SHELL' },
        fr: { home:'🏠 ADISHATZ', search:'🔍 RECHERCHER', inbox:'📥 REÇUS', sent:'📤 ENVOYÉS', archive:'🗄️ ARCHIVE' }
    };

    let html = '';
    for (const [key, label] of Object.entries(menus[currentLang])) {
        html += `<div class="nav-item ${currentSection === key ? 'active' : ''}" onclick="navigate('${key}')"><span class="txt">${label}</span></div>`;
        if (key === 'inbox' && currentLang === 'en') {
            const cats = ['patriarchy', 'imperialism', 'capitalism', 'notes'];
            html += `<div class="nav-sub">` + cats.map(c => `<div class="${currentCategory === c ? 'active' : ''}" onclick="navigate('inbox', '${c}')">↳ ${c}</div>`).join('') + `</div>`;
        }
    }
    nav.innerHTML = html;
}

function renderEmailList() {
    const container = document.getElementById('email-list');
    let list = emails.filter(e => e.lang === currentLang && e.section === (currentSection === 'unread' ? 'inbox' : currentSection));
    if (currentCategory && currentLang === 'en') list = list.filter(e => e.category === currentCategory);

    if (currentSection === 'unread' && !selectedEmailId && list.length > 0) selectedEmailId = list[0].id;

    container.innerHTML = list.map(e => `
        <div class="email-item ${selectedEmailId === e.id ? 'active' : ''}" onclick="selectEmail(${e.id})">
            <strong>${e.subject}</strong><br><small>${e.from} | ${e.date}</small>
        </div>`).join('');
}

function renderEmailContent() {
    const view = document.getElementById('content-view');
    if (selectedEmailId) {
        const email = emails.find(e => e.id === selectedEmailId);
        const demi = demiurges[email.category] || {name: email.from, catchphrase: "", image: ""};
        
        let bodyContent = `<div class="email-body">${email.body}</div>`;
        if (email.type === 'pdf') {
            bodyContent = `<iframe src="${email.url}" width="100%" height="500px" style="border:2px inset #888; margin-top:15px; background: white;"></iframe>`;
        }

        view.innerHTML = `
            <div class="mini-profile">
                <img src="${demi.image}" class="mini-img">
                <div><strong>${demi.name}</strong><br><small>${demi.catchphrase}</small></div>
            </div>
            <div class="email-container">
                <div class="close-btn" onclick="closeEmail()">X</div>
                <div class="email-header"><h2>${email.subject}</h2><p><strong>DATE:</strong> ${email.date}</p></div>
                <hr style="border-top: 1px dashed black;">${bodyContent}
            </div>`;
    } else if (currentCategory && currentLang === 'en') {
        const demi = demiurges[currentCategory];
        view.innerHTML = `<div class="email-container"><h2 style="font-family:'Impact'; color: var(--magenta); font-size: 2em;">${demi.name}</h2><hr><p>${demi.description}</p></div>`;
    } else {
        view.innerHTML = `<div class="empty-state" style="color: var(--text-bright); text-align: center; margin-top: 20%; font-family: monospace;">> AWAITING INPUT...</div>`;
    }
}

function renderSearchView() {
    document.getElementById('content-view').innerHTML = `
        <div class="search-hero">
            <h1>SEARCH DATABASE</h1>
            <div class="search-input-wrap">
                <input type="text" id="search-input" placeholder="Keyword..." onkeyup="if(event.key==='Enter') executeSearch()">
                <button class="retro-btn" onclick="executeSearch()">EXECUTE</button>
            </div>
            <div id="search-results-area"></div>
        </div>`;
}

function executeSearch() {
    const q = document.getElementById('search-input').value.toLowerCase();
    const results = emails.filter(e => e.lang === currentLang && (e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)));
    let html = `<div class="results-grid" style="position:relative; z-index:3;">`;
    results.forEach(res => {
        html += `<div class="search-card">
            <h3 style="margin-top:0;">${res.subject}</h3><p style="font-family: monospace;">${res.body.substring(0,100)}...</p>
            <button class="read-btn" onclick="jumpToEmail(${res.id})">READ.EXE</button>
        </div>`;
    });
    document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
    const view = document.getElementById('content-view');
    if (currentSection === 'home') view.innerHTML = `<div class="email-container"><h2>SYSTEM OVERVIEW</h2><hr style="border: 1px solid black;"><p>${homeContent[currentLang]}</p></div>`;
    else if (currentSection === 'shell') view.innerHTML = `<div class="email-container">${shellContent}</div>`;
}

function toggleLanguage() {
    if (confirm("WARNING: REALITY SHIFT DETECTED. PROCEED?")) startLoading(currentLang === 'en' ? 'fr' : 'en');
}

function navigate(s, c = null) { selectedEmailId = null; window.location.hash = c ? `${s}-${c}` : s; }
function selectEmail(id) { selectedEmailId = id; updateUI(); }
function closeEmail() { selectedEmailId = null; updateUI(); }
function jumpToEmail(id) { const e = emails.find(x => x.id === id); selectedEmailId = id; navigate(e.section, e.category); }
function moult() { if(confirm("CRITICAL WARNING: Discard current shell?")) location.reload(); }
document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));
