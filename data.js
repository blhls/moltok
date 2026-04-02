// All content can stay blank for now.
// Keep the structures: banner, demiurges, emails, and static views.

const bannerContent = {
  en: "MOULTLOOK.COM // SYSTEM ONLINE // ",
  fr: "MOULTLOOK.COM // SYSTÈME EN LIGNE // ",
};

// Used to render category mini-profiles (optional even if emails are empty)
const demiurges = {
  patriarchy: { name: "", status: "", catchphrase: "", image: "", description: "" },
  imperialism: { name: "", status: "", catchphrase: "", image: "", description: "" },
  capitalism: { name: "", status: "", catchphrase: "", image: "", description: "" },
  notes: { name: "", status: "", catchphrase: "", image: "", description: "" },
};

// Mail database (leave empty; the UI should still work)
const emails = [];

// Static content blocks (blank, but present)
const homeContent = {
  en: "",
  fr: "",
};

// Shell screen (blank, but present)
const shellContent = `
  <div class="window">
    <div class="window-titlebar">
      <span class="window-title">YOUR SHELL</span>
      <span class="window-controls" aria-hidden="true">▢ ✕</span>
    </div>
    <div class="window-body">
      <div class="empty-state">&nbsp;</div>
    </div>
  </div>
`;

// Contact screen (blank, but the form and interactions exist)
const contactContent = {
  en: {
    title: "CONTACT",
    addressLabel: "Mailbox",
    addressValue: "",
    note: "",
  },
  fr: {
    title: "CONTACT",
    addressLabel: "Boîte",
    addressValue: "",
    note: "",
  },
};
