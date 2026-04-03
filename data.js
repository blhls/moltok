/* ════════════════════════════════════════════════════════════════
   MOULTLOOK data.js v5 — content layer
   ════════════════════════════════════════════════════════════════ */

const bannerContent = {
    en: "★ STIRNER WAS RIGHT ★ PROPERTY IS A SPOOK ★ MOULTLOOK.COM IS LIVE ★ EVOLVE OR OSSIFY ★ THE DEMIURGES ARE LOSING ★ YOUR CARAPACE YOUR RULES ★ EGO AND ITS OWN ★ MOULT OR PERISH ★ THE VOID ANSWERS ★ CRABS BEYOND YOUR COMPREHENSION ★ ",
    fr: "★ LA GASCONHA SE DREÇA ★ L'ESTAT ES UN FANTOSME ★ MOULTLOOK.COM EN LINHA ★ L'INDIVIDU CONTRA TOT ★ LOS DEMIURGAS PERDON ★ MUDA O PERIS ★ ADISHATZ ALS ESPÒCS ★ LA MUDA A COMENZAT ★ ",
};

const demiurges = {
    patriarchy: {
        name:        "The Father Figure",
        status:      "Online",
        catchphrase: "Obedience is the first step to evolution.",
        image:       "https://via.placeholder.com/58x58/59001b/ffffff?text=DAD",
        description: "The architect of the room you're sitting in. The load-bearing wall you never thought to question. Structural. Unelected. Perpetually unimpressed with you."
    },
    imperialism: {
        name:        "The Map Drawer",
        status:      "Busy",
        catchphrase: "What's yours is mine, eventually.",
        image:       "https://via.placeholder.com/58x58/800020/ffffff?text=MAP",
        description: "Always looking over your shoulder. Drew the borders, lost the legend. Still billing for the cartography."
    },
    capitalism: {
        name:        "The Invisible Hand",
        status:      "Idle",
        catchphrase: "I'll sell you the air if you've got the coin.",
        image:       "https://via.placeholder.com/58x58/004b49/ffffff?text=CASH",
        description: "Constantly trying to monetize your shell. Currently processing your dopamine feed. Will invoice separately."
    },
    notes: {
        name:        "Inner Monologue / Nòtas",
        status:      "Active",
        catchphrase: "Digital chitin.",
        image:       "https://via.placeholder.com/58x58/3d1a6b/ffffff?text=ME",
        description: "A collection of thoughts and raw data. Unfiltered. Possibly dangerous. Possibly nothing. Definitely mine."
    },
};

const emails = [
    {
        id: 1, lang: "en", section: "inbox", category: "capitalism",
        from: "The Hand", subject: "Your Debt in Chitin", date: "2026-03-01",
        tags: ["money","debt"], type: "text",
        body: "You owe us three layers of moult. Pay up or stay soft."
    },
    {
        id: 2, lang: "fr", section: "inbox", category: "notes",
        from: "Moi-même", subject: "Manifeste de la Mue", date: "2026-03-02",
        tags: ["philosophie","gascogne"], type: "pdf",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        body: "Voir le document PDF joint pour les détails de la décolonisation de l'esprit."
    },
];

const homeContent = {
    en: "Welcome to MOULTLOOK. This is a secure portal. If you are reading this, your carapace has reached the required density. The demiurges have been notified. They are not happy about it.",
    fr: "Adishatz. Benvenguts a MOULTLOOK. Espaci de trabalh segur de Gasconha. L'individu davant tot. L'evolucion es inevitabla. Los demiurgas son avisat. Non son pas contents.",
};

const shellContent = `
    <div class="panel-base">
        <div class="panel-header"><h2>// YOUR SHELL //</h2></div>
        <div class="panel-body">
            This section is reserved for personal data.<br>
            The carapace is forming.<br>
            Content pending the next moult cycle. It will be worth the wait. Probably.
        </div>
    </div>`;
