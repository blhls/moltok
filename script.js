let currentLang = 'en'; 
let currentSection = 'home';
let currentCategory = null;
let selectedEmailId = null;

function startLoading(lang) {
    currentLang = lang;
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('screen-app').style.display = 'none'; // Hide app during re-moult
    document.getElementById('screen-loading').style.display = 'flex';
    
    document.getElementById('loading-title').innerText = lang === 'en' ? "CALCIFYING..." : "CALCIFICATION...";
    
    animateProgress(lang);

    setTimeout(() => {
        document.getElementById('screen-loading').style.display = 'none';
        document.getElementById('screen-app').style.display = 'flex';
        window.location.hash = 'home';
        updateUI();
    }, 2000);
}

function animateProgress(lang) {
    const sub = document.getElementById('loading-sub');
    const msgs = lang === 'en' ? ["Loading Chitin...", "Checking Carapace...", "Ready."] : ["Chargement...", "Vérification...", "Prêt."];
    let i = 0;
    const interval = setInterval(() => {
        sub.innerText = msgs[i];
        i++;
        if (i >= msgs.length) clearInterval(interval);
    }, 600);
}

function updateUI() {
    renderSidebar();
    renderEmailList();
    renderEmailContent();
    renderStaticContent();
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const menus = {
        en: { home: '🏠 HOME', inbox: '📥 INBOX', shell: '🐚 SHELL' },
        fr: { home: '🏠 ACCUEIL', inbox: '📥 REÇUS', shell: '🐚 CARAPACE' }
    };

    nav.innerHTML = Object.entries(menus[currentLang]).map(([key, label]) => `
        <div class="nav-item ${currentSection === key ? 'active' : ''}" onclick="navigate('${key}')">
            ${label}
        </div>
    `).join('') + `<div class="nav-item" style="margin-top:20px; color:var(--cherry)" onclick="toggleLanguage()">🌐 SWITCH</div>`;
}

function navigate(s) {
    currentSection = s;
    updateUI();
}

function toggleLanguage() {
    startLoading(currentLang === 'en' ? 'fr' : 'en');
}

function moult() {
    location.reload();
}

// Initial UI setup logic remains consistent with your previous build
