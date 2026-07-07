/* ============================================================
   MOULTLOOK v3.0 — data.js
   Edit freely: articles, demiurges, ticker, shell (T&Cs).
   To add an article: copy a block, bump the id, set lang +
   category (patriarchy / imperialism / capitalism / notes).
   Paragraph breaks inside body = blank line (\n\n).
   ============================================================ */

const bannerContent = {
  en: "★ MOULTLOOK.COM IS LIVE ★ EVOLVE OR DIE ★ CRAB EVOLUTION ACCELERATING ★ THE DEMIURGES ARE WATCHING ★ MOULT OR PERISH ★ B I A ★ NARCISSISM IS THE TOOL ★ BERYLISM.ORG ★ ON EST TOUJOURS DANS LE MOYEN-ÂGE DE QUELQUE-CHOSE ★ ",
  fr: "★ MOULTLOOK.COM EST EN LIGNE ★ ÉVOLUEZ OU MOUREZ ★ LA GASCOGNE VOUS OBSERVE ★ LA MUE A COMMENCÉ ★ ADISHATZ ★ LE NARCISSISME EST L'OUTIL ★ BERYLISM.ORG ★ ON EST TOUJOURS DANS LE MOYEN-ÂGE DE QUELQUE-CHOSE ★ "
};

const demiurges = {
  patriarchy:  { label: { en: 'patriarchy',  fr: 'patriarcat' } },
  imperialism: { label: { en: 'imperialism', fr: 'impérialisme' } },
  capitalism:  { label: { en: 'capitalism',  fr: 'capitalisme' } },
  notes:       { label: { en: 'notes',       fr: 'nòtas' } },
};

const homeContent = {
  en: "Welcome to MOULTLOOK. If you are reading this, your carapace has reached the required density. The demiurges have been writing; the correspondence is public. Read, harden, moult.",
  fr: "Adishatz. Benvenguts a MOULTLOOK. Si vous lisez ceci, votre carapace a atteint la densité requise. Les démiurges écrivent ; la correspondance est publique. Lisez, durcissez, muez."
};

/* Shell = Terms & Conditions (parody, but structurally real) */
const shellContent = {
  en: `
    <h2>// TERMS OF THE SHELL //</h2>
    <p class="fine">1. This site is a publication, not a service. Nothing here constitutes advice, except the advice to moult.</p>
    <p class="fine">2. No account exists. No data is collected, stored, sold, or dreamt about. Your shell remains yours.</p>
    <p class="fine">3. MOLTOK is an AI assistant in the loosest defensible sense of all four words. Its outputs are non-binding blblbl.</p>
    <p class="fine">4. The demiurges depicted are structural, not personal. Any resemblance to actual load-bearing walls is intentional and regrettable.</p>
    <p class="fine">5. Content may be quoted with attribution to moultlook.com. Carcinisation is inevitable; citation is polite.</p>
    <hr class="panel-divider">
    <p class="fine">contact / complaints / declarations of love: via the anemone, bottom right. responses not guaranteed in any human language.</p>
  `,
  fr: `
    <h2>// CONDITIONS DE LA COQUILLE //</h2>
    <p class="fine">1. Ce site est une publication, pas un service. Rien ici ne constitue un conseil, sauf le conseil de muer.</p>
    <p class="fine">2. Aucun compte n'existe. Aucune donnée n'est collectée, stockée, vendue ni rêvée. Votre coquille reste vôtre.</p>
    <p class="fine">3. MOLTOK est un assistant IA au sens le plus vaguement défendable de ces trois mots. Ses réponses sont des blblbl non contractuels.</p>
    <p class="fine">4. Les démiurges représentés sont structurels, pas personnels. Toute ressemblance avec de véritables murs porteurs est intentionnelle et regrettable.</p>
    <p class="fine">5. Le contenu peut être cité avec attribution à moultlook.com. La carcinisation est inévitable ; la citation est polie.</p>
    <hr class="panel-divider">
    <p class="fine">contact / réclamations / déclarations d'amour : via l'anémone, en bas à droite. réponses non garanties dans une langue humaine.</p>
  `
};

const articles = [
  /* ── EN ─────────────────────────────────────────────── */
  {
    id: 1, lang: 'en', category: 'capitalism',
    from: 'The Invisible Hand', title: 'Your Debt in Chitin',
    date: '2026-04-15',
    body: "You owe us three layers of moult. Pay up or stay soft. Terms apply. Carapace is not collateral.\n\nYours in extraction, — The Hand."
  },
  {
    id: 2, lang: 'en', category: 'capitalism',
    from: 'The Invisible Hand', title: 'Limited time: SHELL PREMIUM™',
    date: '2026-03-12',
    body: "Upgrade to SHELL PREMIUM™ today and receive 10% off your next moult. Faster hardening times. Better optics.\n\nIncludes one (1) ad-free crab dream per quarter. Cancel anytime — terms apply."
  },
  {
    id: 3, lang: 'en', category: 'patriarchy',
    from: 'The Father Figure', title: 'Re: your recent behaviour',
    date: '2026-04-08',
    body: "As per my last email, your moulting schedule is not aligned with the architecture I designed for you.\n\nPlease reply confirming you've read this. Yours, the load-bearing wall."
  },
  {
    id: 4, lang: 'en', category: 'imperialism',
    from: 'The Map Drawer', title: 'Border adjustment notice',
    date: '2026-03-20',
    body: "We are adjusting the line you were standing on. Please relocate by Friday.\n\nThis is for your own good and has always been here. Sincerely, the Map Drawer."
  },
  {
    id: 5, lang: 'en', category: 'notes',
    from: 'Self', title: 'fragment 17',
    date: '2026-05-10',
    body: "if the union fails by being a union, then perhaps the only union is the one through division. each one of us a unique cunt, sharing only the fact that we are.\n\nunion through division. note to self: write this better."
  },
  {
    id: 6, lang: 'en', category: 'notes',
    from: 'Self', title: 'the cartographer god — bothering me again',
    date: '2026-04-28',
    body: "the only scenario where bia is useless is if god is just an employee of microsoft. and even then, we could just talk.\n\nor kill him. probably not kill him — feels rude given he's also a victim. hmm."
  },
  {
    id: 7, lang: 'en', category: 'notes',
    from: 'Self', title: 'Manifesto §3 — the neo-gladiator',
    date: '2026-05-02',
    body: "the panopticon's purpose is to ensure docile behaviour by way of unverifiable surveillance. the neo-gladiator inverts it by inflicting non-sensical punishment upon themselves, making the gaze of the guards meaningless — reclaiming sovereignty over the dynamic."
  },

  /* ── FR ─────────────────────────────────────────────── */
  {
    id: 101, lang: 'fr', category: 'notes',
    from: 'Moi-même', title: 'Manifeste de la Mue',
    date: '2026-05-08',
    pdf: 'BIAJulia_Refractions.pdf',
    body: "Voir le document PDF joint pour les détails de la décolonisation de l'esprit.\n\nL'évolution est inévitable. La mue a commencé."
  },
  {
    id: 102, lang: 'fr', category: 'capitalism',
    from: 'La Main Invisible', title: 'Votre dette en chitine',
    date: '2026-04-18',
    body: "Vous nous devez trois couches de mue. Payez ou restez mous. Les conditions s'appliquent. La carapace n'est pas un gage.\n\nCordialement, — La Main."
  },
  {
    id: 103, lang: 'fr', category: 'patriarchy',
    from: 'Figure Paternelle', title: 'Comme convenu dans mon précédent courriel…',
    date: '2026-04-12',
    body: "Vos cycles de mue ne correspondent pas à l'architecture que j'ai conçue pour vous.\n\nVeuillez accuser réception. Le mur porteur."
  },
  {
    id: 104, lang: 'fr', category: 'imperialism',
    from: 'Le Cartographe', title: 'Ajustement de frontière',
    date: '2026-04-01',
    body: "Nous ajustons la ligne sur laquelle vous vous tenez. Veuillez vous déplacer avant vendredi.\n\nC'est naturel et a toujours été ainsi. — Le Cartographe."
  },
  {
    id: 105, lang: 'fr', category: 'notes',
    from: 'Soi', title: 'fragment occitan',
    date: '2026-05-12',
    body: "adishatz à tout le monde. l'union par la division, sus aquò qu'arribarèm.\n\nnote : retravailler l'occitan."
  },
];
