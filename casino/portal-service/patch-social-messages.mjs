import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "messages");
const files = fs.readdirSync(dir).filter((name) => name.endsWith(".json"));

function replaceBrand(value) {
  if (typeof value === "string") {
    return value
      .replaceAll("CrashX", "SEDLAR CASINO")
      .replaceAll("crashx.cc", "SEDLAR CASINO");
  }
  if (Array.isArray(value)) return value.map(replaceBrand);
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = replaceBrand(value[key]);
  }
  return value;
}

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cursor = obj;
  for (const key of parts.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts.at(-1)] = value;
}

for (const file of files) {
  const full = path.join(dir, file);
  const data = replaceBrand(JSON.parse(fs.readFileSync(full, "utf8")));

  if (file === "en.json") {
    const rewrites = {
      "a11y.loadingTagline": "Opening the lobby",
      "pwa.dialogTitle": "Install SEDLAR CASINO",
      "pwa.dialogSubtitle": "Open the social casino fullscreen from your home screen or desktop.",
      "pwa.browserOfferReady": "Your browser is ready to install SEDLAR CASINO.",
      "pwa.iosStep3": "Tap Add to confirm. SEDLAR CASINO will appear on your home screen.",
      "pwa.desktopStep2": "Open the browser menu and choose Install SEDLAR CASINO or the equivalent app-install option.",
      "pwa.whyBody": "Open SEDLAR CASINO from your home screen or taskbar with fewer browser bars.",
      "topbar.deposit": "Chips",
      "auth.loginSubtitle": "Log in to continue with your virtual-chip balance.",
      "auth.signupSubtitle": "Create an account and start with 2,500 virtual chips. Play-money only; 18+.",
      "auth.noAccount": "New to SEDLAR CASINO?",
      "auth.metaLoginDescription": "Log in to your SEDLAR CASINO social-casino account.",
      "auth.metaSignupDescription": "Create a SEDLAR CASINO account with virtual chips only. 18+.",
      "hero.trustChips": ["Virtual chips only", "No cash-out", "Play-money account"],
      "hero.guestVipHint": "Log in to track your social-casino progress and rewards.",
      "hero.partnerShort": "Play-money social casino",
      "hero.acceptsLabel": "Balance",
      "hero.acceptsAria": "Virtual chip balance",
      "dashboard.trustInstantTitle": "Instant virtual rewards",
      "dashboard.trustInstantBody": "Rewards stay in the game",
      "faqSection.deposit-methods-q": "Can I deposit money?",
      "faqSection.deposit-methods-a": "No. SEDLAR CASINO uses virtual CHIP only and does not accept deposits.",
      "faqSection.is-safe-q": "Is this real-money gambling?",
      "faqSection.is-safe-a": "No. This build is play-money only. Virtual CHIP has no cash value.",
      "faqSection.withdraw-q": "Can I withdraw or cash out chips?",
      "faqSection.withdraw-a": "No. Virtual CHIP cannot be withdrawn, redeemed or exchanged for money.",
      "promoStrip.rewardsTitle": "Start with 2,500 virtual chips",
      "promoStrip.rewardsBody": "Every new account receives a play-money balance for social-casino gameplay.",
      "about.short": "SEDLAR CASINO · social casino",
      "about.long": "SEDLAR CASINO is a play-money casino portal built around virtual chips, rewards and social gameplay. Deposits and withdrawals are disabled.",
      "age.body": "SEDLAR CASINO is intended for adults. This preview uses virtual chips only.",
      "ageBanner": "SEDLAR CASINO is for adults aged 18+. Virtual chips have no cash value.",
      "footer.acceptedCryptos": "Play-money mode",
      "footer.publisher.prefix": "Platform base by",
      "footer.publisher.suffix": ".",
      "crashGame.practiceModeLabel": "Virtual-chip mode",
      "crashGame.realMoneyModeLabel": "Real-money mode disabled",
      "profile.index.walletBalance": "Virtual chip balance",
      "profile.index.playableNow": "Available for gameplay",
      "profile.index.totalDeposits": "Deposits disabled",
      "profile.index.totalWithdrawals": "Withdrawals disabled",
      "profile.transactions.txDeposit": "Deposit disabled",
      "profile.transactions.txWithdrawal": "Withdrawal disabled"
    };

    for (const [key, value] of Object.entries(rewrites)) set(data, key, value);
  }

  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
}
