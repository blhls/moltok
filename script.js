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

  // screen swaps
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('screen-loading').style.display = 'flex';

  // copy
  document.getElementById('loading-title').innerText = lang === 'en' ? 'Hardening chitin…' : 'Mue en cours…';
  document.getElementById('loading-hint').innerText = lang === 'en' ? 'Indexing mailbox…' : 'Indexation de la boîte…';

  // banner + theme
  document.getElementById('banner-text').innerText = bannerContent?.[lang] ?? '';
  document.body.className = lang === 'fr' ? 'mode-fr' : 'theme-default';
  document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';

  // cute fake progress
  const fill = document.querySelector('.loader-bar-fill');
  if (fill) {
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      fill.style.width = '100%';
    });
  }

  setTimeout(() => {
    document.getElementById('screen-loading').style.display = 'none';
    document.getElementById('screen-app').style.display = 'block';
    window.location.hash = 'home';
    handleRouting();
  }, 1400);
}

function updateUI() {
  renderSidebar();

  const middleRow = document.getElementById('email-list');
  const langBtn = document.getElementById('lang-toggle-btn');

  langBtn.innerText =
    currentLang === 'en'
      ? "CRABE M'A TUER — basculer vers FR"
      : 'CHECK MY CRABS — switch to EN';

  // hide list on static pages
  const isStatic = ['home', 'shell', 'search', 'contact'].includes(currentSection);
  middleRow.style.display = isStatic ? 'none' : 'block';

  if (currentSection === 'search') {
    renderSearchView();
    return;
  }

  if (currentSection === 'contact') {
    renderContactView();
    return;
  }

  if (isStatic) {
    renderStaticContent();
    return;
  }

  renderEmailList();
  renderEmailContent();
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');

  const menus = {
    en: {
      home: '🏠 HOME',
      unread: '🆕 UNREAD',
      search: '🔍 SEARCH',
      inbox: '📥 INBOX',
      sent: '📤 SENT',
      drafts: '📝 DRAFTS',
      archive: '🗄️ ARCHIVE',
      contact: '✉️ CONTACT',
      shell: '🐚 YOUR SHELL',
    },
    fr: {
      home: '🏠 ADISHATZ',
      search: '🔍 RECHERCHER',
      inbox: '📥 REÇUS',
      sent: '📤 ENVOYÉS',
      archive: '🗄️ ARCHIVE',
      contact: '✉️ CONTACT',
      shell: '🐚 COQUILLE',
    },
  };

  let html = '';
  for (const [key, label] of Object.entries(menus[currentLang])) {
    html += `
      <div class="nav-item ${currentSection === key ? 'active' : ''}" onclick="navigate('${key}')">
        <span class="txt">${label}</span>
      </div>
    `;

    // Only show subsections for English Inbox
    if (key === 'inbox' && currentLang === 'en') {
      const cats = ['patriarchy', 'imperialism', 'capitalism', 'notes'];
      html +=
        `<div class="nav-sub">` +
        cats
          .map(
            (c) =>
              `<div class="${currentCategory === c ? 'active' : ''}" onclick="navigate('inbox', '${c}')">↳ ${c}</div>`
          )
          .join('') +
        `</div>`;
    }
  }
  nav.innerHTML = html;
}

function renderEmailList() {
  const container = document.getElementById('email-list');

  let list = (emails || []).filter(
    (e) => e.lang === currentLang && e.section === (currentSection === 'unread' ? 'inbox' : currentSection)
  );

  if (currentCategory && currentLang === 'en') list = list.filter((e) => e.category === currentCategory);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="email-item empty">
        <strong>${currentLang === 'en' ? 'No messages here.' : 'Aucun message.'}</strong><br>
        <small>${currentLang === 'en' ? 'Content intentionally blank for now.' : 'Contenu volontairement vide.'}</small>
      </div>
    `;
    return;
  }

  if (currentSection === 'unread' && !selectedEmailId) selectedEmailId = list[0].id;

  container.innerHTML = list
    .map(
      (e) => `
        <div class="email-item ${selectedEmailId === e.id ? 'active' : ''}" onclick="selectEmail(${e.id})">
          <strong>${escapeHTML(e.subject || '') || '&nbsp;'}</strong><br>
          <small>${escapeHTML(e.from || '')} | ${escapeHTML(e.date || '')}</small>
        </div>`
    )
    .join('');
}

function renderEmailContent() {
  const view = document.getElementById('content-view');

  if (!selectedEmailId) {
    // Category profiles (English inbox)
    if (currentCategory && currentLang === 'en') {
      const demi = demiurges?.[currentCategory] || { name: '', description: '' };
      view.innerHTML = `
        <div class="window">
          <div class="window-titlebar">
            <span class="window-title">PROFILE</span>
            <span class="window-controls" aria-hidden="true">▢ ✕</span>
          </div>
          <div class="window-body">
            <h2 class="mono-title">${escapeHTML(demi.name) || '&nbsp;'}</h2>
            <div class="rule"></div>
            <p class="muted">${escapeHTML(demi.description) || '&nbsp;'}</p>
          </div>
        </div>
      `;
      return;
    }

    view.innerHTML = `
      <div class="window">
        <div class="window-titlebar">
          <span class="window-title">VIEWER</span>
          <span class="window-controls" aria-hidden="true">▢ ✕</span>
        </div>
        <div class="window-body">
          <div class="empty-state">${currentLang === 'en' ? 'Select a message.' : 'Sélectionnez un message.'}</div>
        </div>
      </div>
    `;
    return;
  }

  const email = (emails || []).find((e) => e.id === selectedEmailId);
  if (!email) {
    selectedEmailId = null;
    updateUI();
    return;
  }

  const demi = demiurges?.[email.category] || { name: email.from || '', catchphrase: '', image: '' };

  let bodyContent = `<div class="email-body">${escapeHTML(email.body || '').replace(/\n/g, '<br>') || '&nbsp;'}</div>`;
  if (email.type === 'pdf' && email.url) {
    bodyContent = `<iframe src="${email.url}" width="100%" height="520" class="pdf-frame" title="PDF"></iframe>`;
  }

  view.innerHTML = `
    <div class="mini-profile">
      ${demi.image ? `<img src="${demi.image}" class="mini-img" alt="">` : `<div class="mini-img placeholder" aria-hidden="true"></div>`}
      <div>
        <strong>${escapeHTML(demi.name) || '&nbsp;'}</strong><br>
        <small class="muted">${escapeHTML(demi.catchphrase) || '&nbsp;'}</small>
      </div>
    </div>

    <div class="window email-window">
      <div class="window-titlebar">
        <span class="window-title">MESSAGE</span>
        <div class="window-actions">
          <button class="win-btn" onclick="closeEmail()" title="Close">✕</button>
        </div>
      </div>

      <div class="window-body">
        <div class="email-header">
          <h2 class="mono-title">${escapeHTML(email.subject || '') || '&nbsp;'}</h2>
          <p class="muted">${escapeHTML(email.date || '')}</p>
        </div>
        <div class="rule"></div>
        ${bodyContent}
      </div>
    </div>
  `;
}

function renderSearchView() {
  document.getElementById('content-view').innerHTML = `
    <div class="window">
      <div class="window-titlebar">
        <span class="window-title">SEARCH DATABASE</span>
        <span class="window-controls" aria-hidden="true">▢ ✕</span>
      </div>
      <div class="window-body">
        <div class="search-input-wrap">
          <input type="text" id="search-input" placeholder="Keyword…" autocomplete="off"
            onkeyup="if(event.key==='Enter') executeSearch()">
          <button class="win-btn" onclick="executeSearch()">EXECUTE</button>
        </div>
        <div id="search-results-area"></div>
      </div>
    </div>
  `;
}

function executeSearch() {
  const input = document.getElementById('search-input');
  const q = (input?.value || '').toLowerCase().trim();

  if (!q) {
    document.getElementById('search-results-area').innerHTML = `
      <div class="empty-state">${currentLang === 'en' ? 'Type something.' : 'Écrivez quelque chose.'}</div>
    `;
    return;
  }

  const results = (emails || []).filter(
    (e) =>
      e.lang === currentLang &&
      ((e.subject || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q))
  );

  if (results.length === 0) {
    document.getElementById('search-results-area').innerHTML = `
      <div class="empty-state">${currentLang === 'en' ? 'No matches.' : 'Aucun résultat.'}</div>
    `;
    return;
  }

  let html = `<div class="results-grid">`;
  results.forEach((res) => {
    const preview = (res.body || '').slice(0, 120);
    html += `
      <div class="search-card">
        <h3>${escapeHTML(res.subject || '') || '&nbsp;'}</h3>
        <p class="muted">${escapeHTML(preview)}${preview.length >= 120 ? '…' : ''}</p>
        <button class="win-btn" onclick="jumpToEmail(${res.id})">READ</button>
      </div>
    `;
  });
  document.getElementById('search-results-area').innerHTML = html + `</div>`;
}

function renderStaticContent() {
  const view = document.getElementById('content-view');

  if (currentSection === 'home') {
    view.innerHTML = `
      <div class="window">
        <div class="window-titlebar">
          <span class="window-title">SYSTEM</span>
          <span class="window-controls" aria-hidden="true">▢ ✕</span>
        </div>
        <div class="window-body">
          <div class="empty-state">${homeContent?.[currentLang] ? homeContent[currentLang] : '&nbsp;'}</div>
        </div>
      </div>
    `;
    return;
  }

  if (currentSection === 'shell') {
    view.innerHTML = shellContent || '<div class="empty-state">&nbsp;</div>';
    return;
  }

  view.innerHTML = '<div class="empty-state">&nbsp;</div>';
}

function renderContactView() {
  const view = document.getElementById('content-view');
  const cfg = contactContent?.[currentLang] || { title: 'CONTACT', addressLabel: 'Mailbox', addressValue: '', note: '' };

  view.innerHTML = `
    <div class="window">
      <div class="window-titlebar">
        <span class="window-title">${escapeHTML(cfg.title)}</span>
        <span class="window-controls" aria-hidden="true">▢ ✕</span>
      </div>
      <div class="window-body">
        <div class="contact-grid">
          <div class="contact-panel">
            <div class="label">${escapeHTML(cfg.addressLabel)}</div>
            <div class="mailbox-row">
              <input id="mailbox" class="mailbox" value="${escapeAttr(cfg.addressValue)}" placeholder="" readonly>
              <button class="win-btn" onclick="copyMailbox()">COPY</button>
            </div>
            <p class="muted">${escapeHTML(cfg.note) || '&nbsp;'}</p>
          </div>

          <form class="contact-panel" onsubmit="event.preventDefault(); toast('${currentLang === 'en' ? 'Draft saved (not really).' : 'Brouillon enregistré (pas vraiment).'}');">
            <div class="label">${currentLang === 'en' ? 'Compose' : 'Écrire'}</div>
            <input class="field" type="text" placeholder="${currentLang === 'en' ? 'Subject' : 'Objet'}" />
            <textarea class="field" rows="8" placeholder="${currentLang === 'en' ? 'Message' : 'Message'}"></textarea>
            <div class="btn-row">
              <button class="win-btn" type="submit">SAVE DRAFT</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function copyMailbox() {
  const el = document.getElementById('mailbox');
  if (!el) return;
  const value = el.value || '';

  if (!value) {
    toast(currentLang === 'en' ? 'No address set yet.' : 'Aucune adresse pour l’instant.');
    return;
  }

  navigator.clipboard
    .writeText(value)
    .then(() => toast(currentLang === 'en' ? 'Copied.' : 'Copié.'))
    .catch(() => toast(currentLang === 'en' ? 'Could not copy.' : 'Copie impossible.'));
}

function toggleLanguage() {
  if (confirm(currentLang === 'en' ? 'Switch reality?' : 'Changer de réalité ?')) {
    startLoading(currentLang === 'en' ? 'fr' : 'en');
  }
}

function navigate(s, c = null) {
  selectedEmailId = null;
  window.location.hash = c ? `${s}-${c}` : s;
}

function selectEmail(id) {
  selectedEmailId = id;
  updateUI();
}

function closeEmail() {
  selectedEmailId = null;
  updateUI();
}

function jumpToEmail(id) {
  const e = (emails || []).find((x) => x.id === id);
  if (!e) {
    toast(currentLang === 'en' ? 'Message missing.' : 'Message introuvable.');
    return;
  }
  selectedEmailId = id;
  navigate(e.section, e.category);
}

function moult() {
  if (confirm(currentLang === 'en' ? 'Discard shell?' : 'Abandonner la coquille ?')) location.reload();
}

// Sidebar toggle
const sidebarToggle = document.getElementById('sidebar-toggle');
if (sidebarToggle) {
  const toggle = () => document.getElementById('sidebar')?.classList.toggle('collapsed');
  sidebarToggle.addEventListener('click', toggle);
  sidebarToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}

// Utils
function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(str) {
  // for attribute values
  return escapeHTML(str).replaceAll('\n', ' ');
}

function toast(msg) {
  const id = 'toast';
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement('div');
    node.id = id;
    node.className = 'toast';
    document.body.appendChild(node);
  }
  node.textContent = msg;
  node.classList.add('show');
  clearTimeout(node._t);
  node._t = setTimeout(() => node.classList.remove('show'), 1400);
}
