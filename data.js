/* ============================================================
   MOULTLOOK v2.0 — data.js
   ============================================================ */

const bannerContent = {
  en: "★ LATEST: MOULTLOOK.COM IS LIVE ★ EVOLVE OR DIE ★ CRAB EVOLUTION ACCELERATING ★ STAY PROTECTED ★ THE DEMIURGES ARE WATCHING ★ MOULT OR PERISH ★ CHITIN DENSITY AT CRITICAL LEVELS ★ B I A ★ NARCISSISM IS THE TOOL ★ BERYLISM.ORG ★ ON EST TOUJOURS DANS LE MOYEN-ÂGE DE QUELQUE-CHOSE ★ ",
  fr: "★ DERNIÈRES NOUVELLES : MOULTLOOK.COM EST EN LIGNE ★ ÉVOLUEZ OU MOUREZ ★ LA GASCOGNE VOUS OBSERVE ★ L'ÉVOLUTION EST INÉVITABLE ★ LA MUE A COMMENCÉ ★ DENSITÉ CHITINEUSE EN HAUSSE ★ ADISHATZ ★ LE NARCISSISME EST L'OUTIL ★ BERYLISM.ORG ★ ON EST TOUJOURS DANS LE MOYEN-ÂGE DE QUELQUE-CHOSE ★ "
};

const demiurges = {
  patriarchy: {
    name:        "The Father Figure",
    status:      "Online",
    catchphrase: "Obedience is the first step to evolution.",
    image:       "avatar_patriarchy.png",
    sign:        "m_patsign.png",
    description: "The architect of the room you're sitting in. The load-bearing wall you never questioned. Has been sending correspondence since before you were born. Opens with 'as per my last email'. Believes silence is consent and consent is mandatory."
  },
  imperialism: {
    name:        "The Map Drawer",
    status:      "Busy",
    catchphrase: "What's yours is mine, eventually.",
    image:       "avatar_imperialism.png",
    sign:        "m_impsign.png",
    description: "Always looking over your shoulder. Drew the borders. Lost the legend. Still insists the lines are natural. Currently reorganising someone else's inbox. Believes uniqueness is best when standardised."
  },
  capitalism: {
    name:        "The Invisible Hand",
    status:      "Idle",
    catchphrase: "I'll sell you the air if you've got the coin.",
    image:       "avatar_capitalism.png",
    sign:        "m_crabsign_detailed.png",
    description: "Constantly trying to monetise your shell. Currently processing your dopamine feed. Has never once been held accountable. Responds only to profit motives and vibes. Will let you moult, for a fee."
  },
  notes: {
    name:        "Inner Monologue / Nòtas",
    status:      "Active",
    catchphrase: "Digital chitin.",
    image:       "avatar_self.png",
    sign:        "m_selfsign.png",
    description: "A collection of thoughts and raw data. Unfiltered. Possibly dangerous. Possibly nothing. The only correspondent who doesn't need a reply. Often contradicts itself, which is the point."
  }
};

const emails = [
  /* ── EN / INBOX / CAPITALISM ─────────────────────────────── */
  {
    id: 1, lang: "en", section: "inbox", category: "capitalism",
    from: "The Hand", subject: "Your Debt in Chitin", date: "2026-04-15",
    tags: ["money","debt"], type: "text",
    body: "You owe us three layers of moult. Pay up or stay soft. Terms apply. Carapace is not collateral. Yours in extraction, — The Hand."
  },
  {
    id: 11, lang: "en", section: "inbox", category: "capitalism",
    from: "The Hand", subject: "Limited time: SHELL PREMIUM™", date: "2026-03-12",
    tags: ["promo","shell"], type: "text",
    body: "Upgrade to SHELL PREMIUM™ today and receive 10% off your next moult. Faster hardening times. Better optics. Includes one (1) ad-free crab dream per quarter. Cancel anytime — terms apply."
  },
  /* ── EN / INBOX / PATRIARCHY ─────────────────────────────── */
  {
    id: 2, lang: "en", section: "inbox", category: "patriarchy",
    from: "Father Figure", subject: "Re: your recent behaviour", date: "2026-04-08",
    tags: ["discipline"], type: "text",
    body: "As per my last email, your moulting schedule is not aligned with the architecture I designed for you. Please reply confirming you've read this. Yours, the load-bearing wall."
  },
  /* ── EN / INBOX / IMPERIALISM ────────────────────────────── */
  {
    id: 3, lang: "en", section: "inbox", category: "imperialism",
    from: "Map Drawer", subject: "Border adjustment notice", date: "2026-03-20",
    tags: ["territory","natural"], type: "text",
    body: "We are adjusting the line you were standing on. Please relocate by Friday. This is for your own good and has always been here. Sincerely, the Map Drawer."
  },
  /* ── EN / INBOX / NOTES ──────────────────────────────────── */
  {
    id: 4, lang: "en", section: "inbox", category: "notes",
    from: "Self", subject: "fragment 17", date: "2026-05-10",
    tags: ["bia","draft"], type: "text",
    body: "if the union fails by being a union, then perhaps the only union is the one through division. each one of us a unique cunt, sharing only the fact that we are. union through division. note to self: write this better."
  },
  {
    id: 5, lang: "en", section: "inbox", category: "notes",
    from: "Self", subject: "the cartographer god — bothering me again", date: "2026-04-28",
    tags: ["theology","bia"], type: "text",
    body: "the only scenario where bia is useless is if god is just an employee of microsoft. and even then, we could just talk. or kill him. probably not kill him — feels rude given he's also a victim. hmm."
  },
  /* ── EN / SENT ───────────────────────────────────────────── */
  {
    id: 6, lang: "en", section: "sent",
    from: "You", subject: "Re: your recent behaviour", date: "2026-04-09",
    tags: ["reply"], type: "text",
    body: "no."
  },
  /* ── EN / DRAFTS ─────────────────────────────────────────── */
  {
    id: 7, lang: "en", section: "drafts",
    from: "You (draft)", subject: "Manifesto §3 — the neo-gladiator", date: "2026-05-02",
    tags: ["draft","bia"], type: "text",
    body: "draft: the panopticon's purpose is to ensure docile behaviour by way of unverifiable surveillance. the neo-gladiator inverts it by inflicting non-sensical punishment upon themselves, making the gaze of the guards meaningless — reclaiming sovereignty over the dynamic. ..."
  },
  /* ── EN / ARCHIVE ────────────────────────────────────────── */
  {
    id: 8, lang: "en", section: "archive",
    from: "Self", subject: "old note — pre-bia", date: "2025-11-12",
    tags: ["archive"], type: "text",
    body: "before all this. before the manifesto, before the crabs. an old note about wanting to write something. now look at us."
  },

  /* ══ FR / GASCOGNE ══════════════════════════════════════════ */
  {
    id: 101, lang: "fr", section: "inbox", category: "notes",
    from: "Moi-même", subject: "Manifeste de la Mue", date: "2026-05-08",
    tags: ["philosophie","gascogne"], type: "pdf",
    url: "BIAJulia_Refractions.pdf",
    body: "Voir le document PDF joint pour les détails de la décolonisation de l'esprit. L'évolution est inévitable. La mue a commencé."
  },
  {
    id: 102, lang: "fr", section: "inbox", category: "capitalism",
    from: "La Main", subject: "Votre dette en chitine", date: "2026-04-18",
    tags: ["argent","dette"], type: "text",
    body: "Vous nous devez trois couches de mue. Payez ou restez mous. Les conditions s'appliquent. La carapace n'est pas un gage. Cordialement, — La Main."
  },
  {
    id: 103, lang: "fr", section: "inbox", category: "patriarchy",
    from: "Figure Paternelle", subject: "Comme convenu dans mon précédent courriel...", date: "2026-04-12",
    tags: ["discipline"], type: "text",
    body: "Vos cycles de mue ne correspondent pas à l'architecture que j'ai conçue pour vous. Veuillez accuser réception. Le mur porteur."
  },
  {
    id: 104, lang: "fr", section: "inbox", category: "imperialism",
    from: "Le Cartographe", subject: "Ajustement de frontière", date: "2026-04-01",
    tags: ["territoire"], type: "text",
    body: "Nous ajustons la ligne sur laquelle vous vous tenez. Veuillez vous déplacer avant vendredi. C'est naturel et a toujours été ainsi. — Le Cartographe."
  },
  {
    id: 105, lang: "fr", section: "inbox", category: "notes",
    from: "Soi", subject: "fragment occitan", date: "2026-05-12",
    tags: ["bia","occitan"], type: "text",
    body: "adishatz à tout le monde. l'union par la division, sus aquò qu'arribarèm. note : retravailler l'occitan."
  },
  {
    id: 106, lang: "fr", section: "sent",
    from: "Vous", subject: "Re: Comme convenu...", date: "2026-04-13",
    tags: ["réponse"], type: "text",
    body: "non."
  },
  {
    id: 107, lang: "fr", section: "drafts",
    from: "Vous (brouillon)", subject: "Manifeste §3 — le néo-gladiateur", date: "2026-05-04",
    tags: ["brouillon","bia"], type: "text",
    body: "brouillon : le panoptique sert à garantir un comportement docile par la surveillance non-vérifiable. le néo-gladiateur l'inverse en s'infligeant une punition absurde, rendant le regard des gardiens sans objet — reprenant ainsi la souveraineté. ..."
  },
  {
    id: 108, lang: "fr", section: "archive",
    from: "Soi", subject: "vieille note — avant la mue", date: "2025-11-12",
    tags: ["archives"], type: "text",
    body: "avant tout ça. avant le manifeste, avant les crabes. une vieille note où je voulais écrire quelque chose. et nous voilà."
  },
];

const homeContent = {
  en: "Welcome to MOULTLOOK. This is a secure portal. If you are reading this, your carapace has reached the required density. Begin by checking your correspondence — the demiurges have been busy.",
  fr: "Adishatz. Benvenguts a MOULTLOOK. Espaci de trabalh segur de Gascogne. L'evoluccion es inevitabla. Comencez par consulter votre correspondance — les démiurges ont été occupés."
};

const logos = {
  main: "m_mltlklogo_mainfinal.png",
  en:   "m_mltlklogo_int.png",
  fr:   "m_mltlklogo_gascony.png"
};

const shellContent = `
<div class="shell-panel">
  <img src="m_shell.png" class="shell-icon" alt="">
  <h2>// YOUR SHELL //</h2>
  <hr>
  <p>This section is reserved for personal data. The carapace is forming. Content pending next moult cycle. Come back when you've hardened.</p>
</div>`;
