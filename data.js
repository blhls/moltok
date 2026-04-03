/* ================================================================
   MOULTLOOK — data.js v4.0
   Content store: banners, demiurges, emails, static content
   ================================================================ */

const bannerContent = {
    en: "★ MOULTLOOK.COM IS LIVE ★ EVOLVE OR DIE ★ CRAB EVOLUTION ACCELERATING ★ THE DEMIURGES ARE WATCHING ★ MOULT OR PERISH ★ CHITIN DENSITY AT CRITICAL LEVELS ★ INDIVIDUATE OR DISSOLVE ★ THE CARAPACE IS FORMING ★ STAY PROTECTED ★ ",
    fr: "★ MOULTLOOK.COM EST EN LIGNE ★ ÉVOLUEZ OU MUREZ ★ LA GASCOGNE VOUS OBSERVE ★ L'ÉVOLUTION EST INÉVITABLE ★ LA MUE A COMMENCÉ ★ DENSITÉ CHITINEUSE EN HAUSSE ★ LES DÉMIURGES ÉCOUTENT ★ INDIVIDUEZ-VOUS OU DISPARAISSEZ ★ "
};

const demiurges = {
    patriarchy: {
        name: "The Father Figure",
        status: "Online",
        catchphrase: "Obedience is the first step to evolution.",
        image: "https://via.placeholder.com/46x46/59001B/FFD6E8?text=DAD",
        description: "The architect of the room you're sitting in. The load-bearing wall you never questioned."
    },
    imperialism: {
        name: "The Map Drawer",
        status: "Busy",
        catchphrase: "What's yours is mine, eventually.",
        image: "https://via.placeholder.com/46x46/3D2B6E/FFD6E8?text=MAP",
        description: "Always looking over your shoulder. Drew the borders. Lost the legend."
    },
    capitalism: {
        name: "The Invisible Hand",
        status: "Idle",
        catchphrase: "I'll sell you the air if you've got the coin.",
        image: "https://via.placeholder.com/46x46/1C6B7A/FFD6E8?text=CASH",
        description: "Constantly trying to monetise your shell. Currently processing your dopamine feed."
    },
    notes: {
        name: "Inner Monologue / Nòtas",
        status: "Active",
        catchphrase: "Digital chitin.",
        image: "https://via.placeholder.com/46x46/59001B/FFD6E8?text=ME",
        description: "A collection of thoughts and raw data. Unfiltered. Possibly dangerous. Possibly nothing."
    }
};

const emails = [
    {
        id: 1, lang: "en", section: "inbox", category: "capitalism",
        from: "The Invisible Hand", subject: "Your Debt in Chitin", date: "2026-03-01",
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

const homeContent = {
    en: "Welcome to MOULTLOOK. This is a secure portal. If you are reading this, your carapace has reached the required density.",
    fr: "Adishatz. Benvenguts a MOULTLOOK. Espaci de trabalh segur de Gascogne. L'evoluccion es inevitabla."
};

const shellContent = `
    <div class="shell-panel">
        <h2>// Your Shell //</h2>
        <hr>
        <p>This section is reserved for personal data. The carapace is forming. Content pending next moult cycle.</p>
    </div>`;

/* ── Asset paths — update on deploy ── */
const assetPaths = {
    sessionGif: "session.gif",
    character:  "character.png",
};
