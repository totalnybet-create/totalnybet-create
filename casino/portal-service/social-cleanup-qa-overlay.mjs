import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cursor = obj;
  for (const key of parts.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts.at(-1)] = value;
}

function scrubText(text) {
  return text
    .replaceAll("SIEDLAR CASINO ROYALE", "PERSONE ROYALE CASINO")
    .replaceAll("Siedlar Casino Royale", "Persone Royale Casino")
    .replaceAll("SEDLAR CASINO", "PERSONE ROYALE CASINO")
    .replaceAll("Sedlar Casino", "Persone Royale Casino")
    .replaceAll("sedlar-casino", "persone-royale")
    .replaceAll("https://script.casino/", "https://personeroyale.pl/")
    .replaceAll("https://script.casino", "https://personeroyale.pl")
    .replaceAll("Script.Casino", "PERSONE ROYALE CASINO")
    .replaceAll("script.casino", "personeroyale.pl");
}

function walk(dir, visitor) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visitor);
    else visitor(full, entry.name);
  }
}

// Remove inherited vendor / legacy brand strings from shipped text sources.
for (const base of ["app", "components", "lib", "messages"]) {
  walk(path.join(root, base), (full, name) => {
    if (!/\.(tsx?|jsx?|json)$/.test(name)) return;
    const before = fs.readFileSync(full, "utf8");
    const after = scrubText(before);
    if (after !== before) fs.writeFileSync(full, after);
  });
}

// Persone Royale is the publisher of this build; do not emit upstream vendor attribution in SEO.
const publisherPath = path.join(root, "lib", "publisher.ts");
fs.writeFileSync(
  publisherPath,
  `export const PUBLISHER = {\n  name: "PERSONE ROYALE CASINO",\n  url: "https://personeroyale.pl/",\n  description: "PERSONE ROYALE CASINO — play-money social casino with virtual chips only.",\n  sameAs: ["https://personeroyale.pl/"] as const,\n} as const;\n`,
);

// Replace inherited SEO keywords with product-accurate social-casino metadata.
const rootLayoutPath = path.join(root, "app", "layout.tsx");
let rootLayout = fs.readFileSync(rootLayoutPath, "utf8");
rootLayout = rootLayout.replace(
  /keywords:\s*\[[\s\S]*?\],\n\s*other:/,
  `keywords: [\n    "Persone Royale",\n    "social casino",\n    "play money casino",\n    "virtual chips",\n    "Royal Arc",\n    "Texas Hold'em",\n    "European Roulette",\n  ],\n  other:`,
);
fs.writeFileSync(rootLayoutPath, rootLayout);

const schemaPath = path.join(root, "components", "seo", "SiteSchema.tsx");
let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema
  .replaceAll(`${SITE.url}/en/games/crash`, `${SITE.url}/en/games/royal-arc`)
  .replaceAll(`${SITE.url}/assets/brand/logo-full.png`, `${SITE.url}/assets/brand/persone-royale.svg`)
  .replace("      parentOrganization: publisherOrganization,\n", "");
fs.writeFileSync(schemaPath, schema);

// Tighten visible copy across all locale bundles. We keep the existing locale structure,
// but force critical product/legal/account strings to describe the actual play-money build.
const messagesDir = path.join(root, "messages");
for (const file of fs.readdirSync(messagesDir).filter((name) => name.endsWith(".json"))) {
  const full = path.join(messagesDir, file);
  const data = JSON.parse(scrubText(fs.readFileSync(full, "utf8")));
  const copy = {
    "pwa.dialogTitle": "Install PERSONE ROYALE CASINO",
    "pwa.dialogSubtitle": "Open Persone Royale fullscreen from your home screen or desktop.",
    "pwa.browserOfferReady": "Your browser is ready to install PERSONE ROYALE CASINO.",
    "pwa.iosStep3": "Tap Add to confirm. PERSONE ROYALE CASINO will appear on your home screen.",
    "pwa.desktopStep2": "Open the browser menu and choose Install PERSONE ROYALE CASINO or the equivalent app-install option.",
    "pwa.whyBody": "Open PERSONE ROYALE CASINO from your home screen or taskbar with fewer browser bars.",

    "auth.noAccount": "New to PERSONE ROYALE CASINO?",
    "auth.hasAccount": "Already have an account?",
    "auth.metaLoginDescription": "Log in to your PERSONE ROYALE CASINO social-casino account.",
    "auth.metaSignupDescription": "Create a PERSONE ROYALE CASINO account with virtual chips only. 18+.",

    "about.short": "PERSONE ROYALE CASINO · social casino",
    "about.long": "PERSONE ROYALE CASINO is a play-money social casino built around virtual chips, rewards and social gameplay. No deposits, withdrawals or cash conversion.",
    "about.sectionTitle": "About PERSONE ROYALE CASINO",

    "faqSection.deposit-methods-q": "Can I deposit real money?",
    "faqSection.deposit-methods-a": "No. PERSONE ROYALE CASINO uses virtual CHIP only and does not accept real-money deposits.",
    "faqSection.claim-bonus-q": "How do virtual-chip bonuses work?",
    "faqSection.claim-bonus-a": "Eligible bonuses add virtual CHIP to your play-money balance. Virtual chips cannot be redeemed or withdrawn as money.",
    "faqSection.verify-account-q": "How do I secure my account?",
    "faqSection.verify-account-a": "Use a strong password and keep your login private. Account and session protections are enforced server-side.",
    "faqSection.is-safe-q": "Is this real-money gambling?",
    "faqSection.is-safe-a": "No. PERSONE ROYALE CASINO is play-money only. Virtual CHIP has no cash value.",
    "faqSection.withdraw-q": "Can I cash out virtual chips?",
    "faqSection.withdraw-a": "No. Virtual CHIP cannot be withdrawn, redeemed or exchanged for money.",
    "faqSection.support-a": "Use Live Support on the site for account, virtual-chip or game questions.",

    "liveChat.greeting": "Hi — PERSONE ROYALE CASINO support here. Ask us about your account, virtual CHIP balance, Royal Arc or rewards.",
    "liveChat.quickDeposit": "Account help",
    "liveChat.quickWithdraw": "Chip balance",
    "liveChat.quickBonus": "Reward question",
    "liveChat.agentReplyDeposit": "Got it — tell us what happened with your account or virtual CHIP balance and we will check it.",
    "liveChat.agentReplyWithdraw": "Thanks — tell us which game or balance entry you are asking about and we will review it.",
    "liveChat.agentReplyBonus": "Thanks — mention the reward or promo name and we will check the virtual-chip eligibility.",
    "liveChat.agentReplies": [
      "Thanks — we are checking the account details now.",
      "Got it. Tell us which game or virtual-chip entry you mean.",
      "We can resolve most balance issues from the transaction history.",
      "For rewards, mention the promo name or approximate claim time."
    ],

    "responsibleGaming.depositLimitsTitle": "Play limits",
    "responsibleGaming.depositLimitsBody": "Set personal limits for your play-money sessions and take breaks whenever you want.",
    "responsibleGaming.lossLimitsTitle": "Session limits",
    "responsibleGaming.lossLimitsBody": "Use personal limits to keep social-casino play controlled and recreational.",
    "responsibleGaming.timeoutBody": "Pause your account for a selected period and return later.",
    "responsibleGaming.selfExclusionBody": "Close your social-casino account if you no longer want to use it.",
    "responsibleGaming.helpIntro": "If play stops feeling recreational, take a break and seek independent support in your country.",

    "profile.deposit.metaTitle": "Virtual chip balance",
    "profile.deposit.metaDescription": "Real-money deposits are disabled. This build uses virtual CHIP only.",
    "profile.deposit.title": "Virtual chip balance",
    "profile.withdraw.metaTitle": "Activity",
    "profile.withdraw.metaDescription": "Real-money withdrawals are disabled. Virtual CHIP has no cash value.",
    "profile.withdraw.title": "Activity",

    "newsArticles.editorialAuthor": "PERSONE ROYALE Editorial",
    "newsArticles.items.trust-wallet-deposit.title": "Getting started with virtual CHIP",
    "newsArticles.items.trust-wallet-deposit.excerpt": "Create an account, receive your starting virtual-chip balance and open a game.",
    "newsArticles.items.trust-wallet-deposit.body": "Every new PERSONE ROYALE CASINO account starts with a virtual CHIP balance for play-money games. There are no real-money deposits or withdrawals in this build.",
    "newsArticles.items.trust-wallet-deposit.category": "Guide",
    "newsArticles.items.bank-card-deposit.title": "How the shared virtual-chip wallet works",
    "newsArticles.items.bank-card-deposit.excerpt": "Royal Arc and account activity use the same server-settled virtual CHIP balance.",
    "newsArticles.items.bank-card-deposit.body": "The shared wallet records virtual-chip rewards, wagers and payouts. Virtual CHIP is for gameplay only and cannot be converted to money.",
    "newsArticles.items.bank-card-deposit.category": "Product",

    "crashGame.metaTitle": "Royal Arc · PERSONE ROYALE CASINO",
    "crashGame.metaDescription": "Royal Arc is a play-money slot using virtual CHIP only.",
  };

  for (const [key, value] of Object.entries(copy)) set(data, key, value);
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
}

// Static game shells should carry Persone branding too.
for (const rel of ["public/royal-arc/index.html", "public/poker/index.html", "public/roulette/index.html"]) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  let html = scrubText(fs.readFileSync(full, "utf8"));
  if (rel.includes("royal-arc")) {
    html = html.replace(/<title>[^<]*<\/title>/i, "<title>Royal Arc — PERSONE ROYALE CASINO</title>");
  } else if (rel.includes("poker")) {
    html = html.replace(/<title>[^<]*<\/title>/i, "<title>Persone Royale Poker</title>");
  } else if (rel.includes("roulette")) {
    html = html.replace(/<title>[^<]*<\/title>/i, "<title>Persone Royale Roulette</title>");
  }
  fs.writeFileSync(full, html);
}

console.log("Applied Persone Royale cleanup and QA copy overlay.");
