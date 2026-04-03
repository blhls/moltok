/* ═══════════════════════════════════════════════════════════════════
   MOULTLOOK — data.js v3.0
   Content, contacts, emails, gif slots
   ═══════════════════════════════════════════════════════════════════ */

/* ── Scrolling banner ─────────────────────────────────────────────── */
const bannerContent = {
    en: "★ LATEST NEWS: MOULTLOOK.COM IS LIVE ★ EVOLVE OR DIE ★ CRAB EVOLUTION ACCELERATING ★ STAY PROTECTED ★ THE DEMIURGES ARE WATCHING ★ MOULT OR PERISH ★ CHITIN DENSITY AT CRITICAL LEVELS ★ ",
    fr: "★ DERNIÈRES NOUVELLES : MOULTLOOK.COM EST EN LIGNE ★ ÉVOLUEZ OU MUREZ ★ LA GASCOGNE VOUS OBSERVE ★ L'INDIVIDUATION EST INÉVITABLE ★ LA MUE A COMMENCÉ ★ DENSITÉ CHITINEUSE EN HAUSSE ★ "
};

/* ── Gif slots (loading screen & future contact avatars)
      To add: replace src with path to a gif/png in the same folder
      e.g. { src: 'contacts/dad.gif', alt: 'The Father Figure' }
   ──────────────────────────────────────────────────────────────────── */
const gifSlots = [
    /* { src: 'contacts/patriarchy.gif', alt: 'The Father Figure' }, */
    /* { src: 'contacts/imperialism.gif', alt: 'The Map Drawer' }, */
    /* { src: 'contacts/capitalism.gif',  alt: 'The Hand' }, */
    /* { src: 'contacts/notes.gif',       alt: 'Moi' }, */
];
/* ↑ Leave empty — will use placeholder squares until you add files. */

/* ── Demiurge contacts ────────────────────────────────────────────── */
const demiurges = {
    patriarchy: {
        name:       "The Father Figure",
        status:     "Online",
        catchphrase:"Obedience is the first step to evolution.",
        image:      "https://via.placeholder.com/58x58/2A000D/F0DDD8?text=DAD",
        description:"The architect of the room you're sitting in. The load-bearing wall you never questioned."
    },
    imperialism: {
        name:       "The Map Drawer",
        status:     "Busy",
        catchphrase:"What's yours is mine, eventually.",
        image:      "https://via.placeholder.com/58x58/004B49/F0DDD8?text=MAP",
        description:"Always looking over your shoulder. Drew the borders. Lost the legend."
    },
    capitalism: {
        name:       "The Invisible Hand",
        status:     "Idle",
        catchphrase:"I'll sell you the air if you've got the coin.",
        image:      "https://via.placeholder.com/58x58/59001B/F0DDD8?text=CASH",
        description:"Constantly trying to monetize your shell. Currently processing your dopamine feed."
    },
    notes: {
        name:       "Inner Monologue / Nòtas",
        status:     "Active",
        catchphrase:"Digital chitin.",
        image:      "https://via.placeholder.com/58x58/2D1B6E/F0DDD8?text=ME",
        description:"A collection of thoughts and raw data. Unfiltered. Possibly dangerous. Possibly nothing."
    }
};

/* ── Emails (articles / dispatches) ──────────────────────────────── */
const emails = [
    {
        id: 1, lang: "en", section: "inbox", category: "capitalism",
        from: "The Hand", subject: "Your Debt in Chitin", date: "2026-03-01",
        tags: ["money", "debt"], type: "text",
        body: "You owe us three layers of moult. Pay up or stay soft."
    },
    {
        id: 2, lang: "fr", section: "inbox", category: "notes",
        from: "Moi-même", subject: "Manifeste de la Mue", date: "2026-03-02",
        tags: ["philosophie", "gascogne"], type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        body: "Voir le document PDF joint pour les détails de la décolonisation de l'esprit."
    }
];

/* ── Home panel copy ──────────────────────────────────────────────── */
const homeContent = {
    en: "Welcome to MOULTLOOK. This is a secure portal. If you are reading this, your carapace has reached the required density.",
    fr: "Adishatz. Benvenguts a MOULTLOOK. Espaci de trabalh segur de Gascogne. L'individuation es inevitabla."
};

/* ── Shell panel ──────────────────────────────────────────────────── */
const shellContent = `
    <div class="shell-panel">
        <h2>// YOUR SHELL //</h2>
        <hr>
        <p>This section is reserved for personal data. The carapace is forming. Content pending next moult cycle.</p>
    </div>`;
