/* ================================================================
MOULTLOOK — data.js v14.0
================================================================ */

const bannerContent = {
  en: "★ LATEST NEWS: MOULTLOOK.COM IS LIVE ★ EVOLVE OR DIE ★ CRAB EVOLUTION ACCELERATING ★ STAY PROTECTED ★ THE DEMIURGES ARE WATCHING ★ MOULT OR PERISH ★ CHITIN DENSITY AT CRITICAL LEVELS ★ ",
  fr: "★ DERNIÈRES NOUVELLES : MOULTLOOK.COM EST EN LIGNE ★ ÉVOLUEZ OU MUREZ ★ LA GASCOGNE VOUS OBSERVE ★ L'ÉVOLUTION EST INÉVITABLE ★ LA MUE A COMMENCÉ ★ DENSITÉ CHITINEUSE EN HAUSSE ★ "
};

const demiurges = {
  patriarchy: {
    name: "The Father Figure",
    status: "Online",
    catchphrase: "Obedience is the first step to evolution.",
    image: "avatar_patriarchy.png",
    sign:  "m_patsign.png",
    description: "The architect of the room you're sitting in. The load-bearing wall you never questioned. Has been sending correspondence since before you were born. Opens with 'as per my last email'."
  },
  imperialism: {
    name: "The Map Drawer",
    status: "Busy",
    catchphrase: "What's yours is mine, eventually.",
    image: "avatar_imperialism.png",
    sign:  "m_impsign.png",
    description: "Always looking over your shoulder. Drew the borders. Lost the legend. Still insists the lines are natural. Currently reorganising someone else's inbox."
  },
  capitalism: {
    name: "The Invisible Hand",
    status: "Idle",
    catchphrase: "I'll sell you the air if you've got the coin.",
    image: "avatar_capitalism.png",
    sign:  "m_crabsign_detailed.png",
    description: "Constantly trying to monetise your shell. Currently processing your dopamine feed. Has never once been held accountable. Responds only to profit motives and vibes."
  },
  notes: {
    name: "Inner Monologue / Nòtas",
    status: "Active",
    catchphrase: "Digital chitin.",
    image: "avatar_self.png",
    sign:  "m_selfsign.png",
    description: "A collection of thoughts and raw data. Unfiltered. Possibly dangerous. Possibly nothing. The only correspondent who doesn't need a reply."
  }
};

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

const homeContent = {
  en: "Welcome to MOULTLOOK. This is a secure portal. If you are reading this, your carapace has reached the required density.",
  fr: "Adishatz. Benvenguts a MOULTLOOK. Espaci de trabalh segur de Gascogne. L'evoluccion es inevitabla."
};

const homeAvatar = {
  fr: "avatar_frenchgascony.png"
};

const logos = {
  main: "m_mltlklogo_mainfinal.png",
  en:   "m_mltlklogo_int.png",
  fr:   "m_mltlklogo_gascony.png"
};

const banners = {
  main: "mltlkbanner_main.png",
  en:   "mltlkbanner_int.png",
  fr:   "mltlkbanner_gascony.png"
};

const shellContent = `
<div class="shell-panel">
  <h2>// YOUR SHELL //</h2>
  <hr>
  <p>This section is reserved for personal data. The carapace is forming. Content pending next moult cycle.</p>
</div>`;
