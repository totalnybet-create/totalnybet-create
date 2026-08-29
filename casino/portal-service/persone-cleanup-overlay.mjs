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

function sanitizeText(text) {
  return text
    .replaceAll("SIEDLAR CASINO ROYALE", "PERSONE ROYALE CASINO")
    .replaceAll("Siedlar Casino Royale", "Persone Royale Casino")
    .replaceAll("SEDLAR CASINO", "PERSONE ROYALE CASINO")
    .replaceAll("Sedlar Casino", "Persone Royale Casino")
    .replaceAll("sedlar-casino", "persone-royale")
    .replaceAll("CrashX", "PERSONE ROYALE CASINO")
    .replaceAll("crashx.cc", "personeroyale.pl")
    .replaceAll("Script.Casino", "PERSONE ROYALE CASINO")
    .replaceAll("script.casino", "personeroyale.pl");
}

function walkAndSanitize(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walkAndSanitize(fp);
    else if (/\.(tsx?|jsx?|json|html|md)$/.test(entry.name)) {
      const before = fs.readFileSync(fp, "utf8");
      const after = sanitizeText(before);
      if (after !== before) fs.writeFileSync(fp, after);
    }
  }
}

for (const base of ["app", "components", "lib", "messages"]) {
  walkAndSanitize(path.join(root, base));
}

const royalHtml = path.join(root, "public", "royal-arc", "index.html");
if (fs.existsSync(royalHtml)) {
  const before = fs.readFileSync(royalHtml, "utf8");
  fs.writeFileSync(royalHtml, sanitizeText(before).replace("Royal Arc — PERSONE ROYALE CASINO", "Royal Arc — PERSONE ROYALE CASINO"));
}

// Polish becomes the primary locale while all existing locales stay available.
const routingPath = path.join(root, "i18n", "routing.ts");
fs.writeFileSync(
  routingPath,
  `import { defineRouting } from "next-intl/routing";\n\nexport const routing = defineRouting({\n  locales: ["pl", "en", "es", "pt", "de", "fr", "tr", "ru", "ja", "fa"],\n  defaultLocale: "pl",\n  localePrefix: "always",\n});\n\nexport type AppLocale = (typeof routing.locales)[number];\n`,
);

const localesPath = path.join(root, "lib", "data", "locales.ts");
let locales = fs.readFileSync(localesPath, "utf8");
if (!locales.includes('pl: { label: "Polski"')) {
  locales = locales.replace(
    "const localeMeta: Record<string, Omit<Locale, \"code\">> = {",
    'const localeMeta: Record<string, Omit<Locale, "code">> = {\n  pl: { label: "Polski", flag: "🇵🇱" },',
  );
}
fs.writeFileSync(localesPath, locales);

// Full message-key parity for Polish: clone the cleaned English catalogue and localize critical user journeys.
const messagesDir = path.join(root, "messages");
const enPath = path.join(messagesDir, "en.json");
const pl = JSON.parse(fs.readFileSync(enPath, "utf8"));
const plRewrites = {
  "language.label": "Język",
  "language.changeAria": "Zmień język",
  "common.close": "Zamknij",
  "a11y.skipToContent": "Przejdź do treści",
  "a11y.openLiveChat": "Otwórz czat pomocy",
  "a11y.loadingSite": "Ładowanie {siteName}",
  "a11y.loadingTagline": "Otwieranie lobby",
  "topbar.balanceLabel": "Saldo",
  "topbar.deposit": "Żetony",
  "topbar.notifications": "Powiadomienia",
  "topbar.login": "Zaloguj się",
  "topbar.signup": "Zarejestruj się",
  "topbar.logout": "Wyloguj się",
  "topbar.loggingOut": "Wylogowywanie…",
  "topbar.welcomeBack": "Witaj ponownie",
  "auth.loginTitle": "Witaj ponownie",
  "auth.loginSubtitle": "Zaloguj się, aby korzystać ze swojego salda wirtualnych żetonów.",
  "auth.signupTitle": "Utwórz konto",
  "auth.signupSubtitle": "Utwórz konto i zacznij z 2500 wirtualnych żetonów. Tylko gra rozrywkowa; 18+.",
  "auth.signupSectionAccountTitle": "Dane logowania",
  "auth.signupSectionAccountDesc": "Nazwa użytkownika i hasło — użyjesz ich przy każdym powrocie.",
  "auth.email": "E-mail",
  "auth.username": "Nazwa użytkownika",
  "auth.usernameHint": "3–24 znaki: litery, cyfry i podkreślenia",
  "auth.usernamePlaceholder": "twoja_nazwa",
  "auth.password": "Hasło",
  "auth.confirmPassword": "Powtórz hasło",
  "auth.submitLogin": "Zaloguj się",
  "auth.submitSignup": "Utwórz konto",
  "auth.forgotPassword": "Nie pamiętasz hasła?",
  "auth.noAccount": "Nie masz jeszcze konta?",
  "auth.hasAccount": "Masz już konto?",
  "auth.termsLabel": "Potwierdzam, że mam co najmniej 18 lat i akceptuję regulamin oraz zasady odpowiedzialnej gry.",
  "auth.sessionError": "Nie udało się uruchomić sesji. Spróbuj ponownie.",
  "auth.passwordMismatch": "Hasła nie są identyczne.",
  "auth.invalidCredentials": "Nazwa użytkownika lub hasło są nieprawidłowe.",
  "auth.registrationFailed": "Nie udało się utworzyć konta.",
  "auth.networkError": "Błąd połączenia. Spróbuj ponownie.",
  "auth.termsRequired": "Zaakceptuj warunki, aby kontynuować.",
  "auth.toastLoginTitle": "Zalogowano",
  "auth.toastLoginDescription": "Wczytywanie sesji…",
  "auth.toastSignupTitle": "Konto utworzone",
  "auth.toastSignupDescription": "Witaj w Persone Royale — kontynuujemy…",
  "auth.recoverySectionTitle": "Pytania bezpieczeństwa",
  "auth.recoverySectionSub": "Posłużą do odzyskania hasła bez wiadomości e-mail.",
  "auth.forgotPasswordTitle": "Odzyskiwanie hasła",
  "auth.forgotPasswordBody": "Zresetuj hasło za pomocą trzech odpowiedzi bezpieczeństwa ustawionych podczas rejestracji.",
  "auth.backToLogin": "Wróć do logowania",
  "auth.newPassword": "Nowe hasło",
  "auth.forgotPasswordContinue": "Dalej",
  "auth.forgotPasswordVerifyAnswers": "Sprawdź odpowiedzi",
  "auth.forgotPasswordResetSubmit": "Ustaw nowe hasło",
  "auth.forgotPasswordSuccessTitle": "Hasło zmienione",
  "auth.forgotPasswordSuccessBody": "Hasło zostało zaktualizowane. Możesz się teraz zalogować.",
  "nav.home": "Start",
  "nav.crash": "Royal Arc",
  "nav.profile": "Profil",
  "nav.bonuses": "Bonusy",
  "nav.vip": "Klub VIP",
  "nav.playCrash": "Graj w Royal Arc",
  "nav.support": "Pomoc",
  "nav.deposit": "Saldo",
  "nav.withdraw": "Aktywność",
  "nav.about": "O nas",
  "nav.promotions": "Promocje",
  "nav.licenses": "Bezpieczeństwo",
  "nav.feedback": "Opinie",
  "nav.news": "Aktualności",
  "nav.settings": "Ustawienia",
  "nav.transactions": "Historia",
  "nav.loginNav": "Zaloguj się",
  "nav.signupNav": "Zarejestruj się",
  "nav.crashSidebarTag": "Royal Arc · Slot",
  "nav.crashSidebarSub": "Spiny rozliczane przez serwer · tylko wirtualne CHIP",
  "hero.gameEyebrow": "Royal Arc · Slot premium",
  "hero.ctaTitle": "Graj w Royal Arc",
  "hero.ctaHint": "Wirtualne CHIP · wynik rozliczany przez serwer",
  "hero.playTableCta": "Otwórz Royal Arc",
  "hero.partnerShort": "Kasyno społecznościowe play-money",
  "hero.trustChips": ["Tylko wirtualne żetony", "Brak wypłat pieniędzy", "Konto play-money"],
  "home.crashCtaTitle": "Graj w Royal Arc",
  "home.crashCtaBody": "Slot premium 5×3 połączony ze wspólnym saldem wirtualnych CHIP.",
  "home.crashCtaButton": "Graj w Royal Arc",
  "home.gameSectionTitle": "Gry",
  "dashboard.leaderboardTitle": "Ranking",
  "dashboard.tournamentsTitle": "Turnieje",
  "dashboard.viewAll": "Zobacz wszystko",
  "dashboard.join": "Dołącz",
  "promotions.title": "Promocje",
  "promotions.body": "Nagrody w wirtualnych żetonach, misje i wydarzenia społecznościowe. Bez wpłat i nagród pieniężnych.",
  "vip.title": "Klub VIP",
  "vip.body": "Zdobywaj poziomy VIP dzięki aktywności i grze wirtualnymi żetonami.",
  "support.title": "Masz pytanie?",
  "support.body": "Napisz do nas w sprawie konta, salda CHIP lub gier.",
  "support.cta": "Pomoc na żywo",
  "liveChat.title": "Pomoc na żywo",
  "liveChat.subtitle": "Zwykle odpowiadamy w ciągu kilku minut.",
  "liveChat.online": "Online",
  "liveChat.placeholder": "Napisz wiadomość…",
  "liveChat.send": "Wyślij",
  "liveChat.greeting": "Cześć — tu pomoc PERSONE ROYALE CASINO. Napisz w sprawie konta, salda CHIP, Royal Arc lub nagród.",
  "liveChat.quickDeposit": "Pomoc z kontem",
  "liveChat.quickWithdraw": "Saldo żetonów",
  "liveChat.quickBonus": "Pytanie o bonus",
  "age.title": "Masz ukończone 18 lat?",
  "age.body": "PERSONE ROYALE CASINO jest przeznaczone dla dorosłych. Używamy wyłącznie wirtualnych żetonów.",
  "age.confirm": "Mam co najmniej 18 lat",
  "age.leave": "Opuść stronę",
  "ageBanner": "PERSONE ROYALE CASINO jest przeznaczone dla osób 18+. Wirtualne żetony nie mają wartości pieniężnej.",
  "faqSection.deposit-methods-q": "Czy mogę wpłacić prawdziwe pieniądze?",
  "faqSection.deposit-methods-a": "Nie. PERSONE ROYALE CASINO korzysta wyłącznie z wirtualnych żetonów CHIP i nie przyjmuje wpłat pieniężnych.",
  "faqSection.is-safe-q": "Czy to hazard na prawdziwe pieniądze?",
  "faqSection.is-safe-a": "Nie. To wersja play-money. Wirtualne CHIP nie mają wartości pieniężnej.",
  "faqSection.withdraw-q": "Czy mogę wypłacić lub wymienić żetony na pieniądze?",
  "faqSection.withdraw-a": "Nie. Wirtualnych CHIP nie można wypłacić, sprzedać ani wymienić na pieniądze.",
  "profile.index.metaTitle": "Profil",
  "profile.index.title": "Profil",
  "profile.index.walletBalance": "Saldo wirtualnych żetonów",
  "profile.index.playableNow": "Dostępne do gry",
  "profile.index.activeBonuses": "Aktywne bonusy",
  "profile.index.bonusCredits": "Bonusowe żetony",
  "profile.index.totalDeposits": "Wpłaty wyłączone",
  "profile.index.totalWithdrawals": "Wypłaty wyłączone",
  "profile.transactions.metaTitle": "Historia",
  "profile.transactions.title": "Historia",
  "profile.transactions.historyTitle": "Historia aktywności",
  "profile.transactions.historyCta": "Wróć do lobby",
  "profile.transactions.historyDescription": "Tutaj pojawi się historia wirtualnych żetonów, stawek, wygranych i nagród.",
  "profile.transactions.txSignupBonus": "Bonus powitalny",
  "profile.transactions.txDeposit": "Wpłaty wyłączone",
  "profile.transactions.txWithdrawal": "Wypłaty wyłączone",
  "profile.transactions.txWager": "Stawka",
  "profile.transactions.txPayout": "Wygrana",
  "profile.transactions.txOther": "Aktywność",
  "profile.transactions.emptyHint": "Brak aktywności do wyświetlenia.",
  "profile.transactions.sessionExpiredHeading": "Sesja wygasła",
  "profile.transactions.sessionExpiredDescription": "Zaloguj się ponownie, aby zobaczyć historię i gry czasu rzeczywistego.",
  "profile.transactions.sessionExpiredCta": "Zaloguj się",
  "pwa.footerLink": "Zainstaluj aplikację",
  "pwa.footerInstalled": "Korzystasz z zainstalowanej aplikacji",
  "pwa.dialogTitle": "Zainstaluj PERSONE ROYALE CASINO",
  "pwa.dialogSubtitle": "Dodaj kasyno społecznościowe do ekranu głównego i uruchamiaj je pełnoekranowo.",
  "pwa.installButton": "Zainstaluj",
  "pwa.close": "Zamknij",
  "footer.acceptedCryptos": "Tryb play-money",
  "responsibleGaming.title": "Odpowiedzialna gra",
  "responsibleGaming.body": "Korzystaj z przypomnień, przerw i własnych limitów czasu, aby gra pozostała rozrywką.",
  "crashGame.metaTitle": "Royal Arc · PERSONE ROYALE CASINO",
  "crashGame.metaDescription": "Royal Arc to slot play-money używający wyłącznie wirtualnych CHIP."
};
for (const [key, value] of Object.entries(plRewrites)) set(pl, key, value);
fs.writeFileSync(path.join(messagesDir, "pl.json"), `${JSON.stringify(pl, null, 2)}\n`);

// Remove upstream publisher/template metadata from the rendered product.
fs.writeFileSync(
  path.join(root, "lib", "publisher.ts"),
  `export const PUBLISHER = {\n  name: "PERSONE ROYALE CASINO",\n  url: "https://personeroyale.pl/",\n  description: "Kasyno społecznościowe play-money z wirtualnymi żetonami.",\n  sameAs: ["https://personeroyale.pl/"],\n} as const;\n`,
);

fs.writeFileSync(
  path.join(root, "app", "layout.tsx"),
  `import type { Metadata, Viewport } from "next";\nimport { Bricolage_Grotesque, Geist_Mono, Manrope } from "next/font/google";\nimport { SITE } from "@/lib/site";\nimport { routing } from "@/i18n/routing";\nimport "./globals.css";\n\nconst sans = Manrope({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "600", "800"], display: "swap", preload: true, adjustFontFallback: true });\nconst display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap", preload: false, adjustFontFallback: true });\nconst mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "700"], display: "swap", preload: false, adjustFontFallback: true });\n\nexport const viewport: Viewport = { themeColor: "#08090d", width: "device-width", initialScale: 1, viewportFit: "cover" };\nconst ogAlt = \`${'${SITE.name}'} — ${'${SITE.tagline}'}\`;\n\nexport const metadata: Metadata = {\n  metadataBase: new URL(SITE.url),\n  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },\n  title: { default: \`${'${SITE.name}'} — ${'${SITE.tagline}'}\`, template: \`%s · ${'${SITE.name}'}\` },\n  description: SITE.description,\n  applicationName: SITE.name,\n  keywords: ["Persone Royale Casino", "kasyno społecznościowe", "social casino", "play money", "wirtualne żetony", "Royal Arc", "Texas Hold'em", "ruletka europejska"],\n  icons: {\n    icon: [\n      { url: "/favicon.ico", sizes: "48x48" },\n      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },\n      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },\n      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },\n      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }\n    ],\n    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]\n  },\n  openGraph: { type: "website", siteName: SITE.name, title: \`${'${SITE.name}'} — ${'${SITE.tagline}'}\`, description: SITE.description, url: SITE.url, locale: "pl_PL", images: [{ url: "/og-default.png", width: 512, height: 512, alt: ogAlt }] },\n  twitter: { card: "summary_large_image", title: \`${'${SITE.name}'} — ${'${SITE.tagline}'}\`, description: SITE.description, images: [{ url: "/og-default.png", alt: ogAlt }] },\n  robots: { index: true, follow: true }\n};\n\nexport default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {\n  return <html lang={routing.defaultLocale} className={\`${'${sans.variable}'} ${'${display.variable}'} ${'${mono.variable}'}\`} data-scroll-behavior="smooth" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>;\n}\n`,
);

fs.writeFileSync(
  path.join(root, "components", "seo", "SiteSchema.tsx"),
  `import Script from "next/script";\nimport { routing } from "@/i18n/routing";\nimport { SITE } from "@/lib/site";\n\nconst organization = { "@type": "Organization", name: SITE.name, url: SITE.url, description: SITE.description, sameAs: [SITE.url] } as const;\n\nexport function SiteSchema({ kind, faqEntities }: { kind: "site" | "faq" | "organization" | "software"; faqEntities?: readonly { question: string; answer: string }[] }) {\n  if (kind === "faq") {\n    const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: (faqEntities ?? []).map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };\n    return <Script id="schema-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;\n  }\n  if (kind === "software") {\n    const data = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE.name, applicationCategory: "GameApplication", operatingSystem: "Web", url: \`${'${SITE.url}'}/pl/games/royal-arc\`, description: SITE.description, offers: { "@type": "Offer", price: "0", priceCurrency: "PLN", availability: "https://schema.org/InStock" }, author: organization, provider: organization, publisher: organization };\n    return <Script id="schema-software" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;\n  }\n  if (kind === "organization") {\n    const data = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: \`${'${SITE.url}'}/assets/brand/persone-royale.svg\`, description: SITE.description, sameAs: [SITE.url] };\n    return <Script id="schema-organization" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;\n  }\n  const data = { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, description: SITE.description, inLanguage: routing.locales, publisher: organization };\n  return <Script id="schema-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;\n}\n`,
);

// Final lobby copy: Polish on the primary locale, English remains available on /en.
const homePath = path.join(root, "app", "[locale]", "(shell)", "page.tsx");
fs.writeFileSync(homePath, `import type { Metadata } from "next";\nimport { Link } from "@/i18n/navigation";\nimport { ROUTES } from "@/lib/paths";\nimport { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";\n\nexport async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {\n  const { locale } = await params;\n  const pl = locale === "pl";\n  return { title: pl ? "PERSONE ROYALE CASINO — Kasyno społecznościowe" : "PERSONE ROYALE CASINO — Social Casino", description: pl ? "Kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej." : "Play-money social casino with virtual chips only. No deposits, withdrawals or cash value.", alternates: { canonical: canonicalUrl(locale, ROUTES.home), languages: alternateLanguageUrls(ROUTES.home) } };\n}\n\nexport default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;\n  const pl = locale === "pl";\n  const copy = pl ? {\n    badge: "Kasyno społecznościowe · Play Money",\n    intro: "Premium portal rozrywkowy oparty wyłącznie na wirtualnych żetonach. Bez wpłat, wypłat i wymiany na pieniądze.",\n    signup: "Zacznij z 2500 żetonów", login: "Zaloguj się",\n    f1e: "START", f1t: "2500 wirtualnych żetonów", f1b: "Każde nowe konto otrzymuje 2500 CHIP do gry.",\n    f2e: "BONUSY", f2t: "+500 CHIP za reklamę", f2b: "Nagrody za obejrzenie filmu są przygotowane z limitami i ochroną przed wielokrotnym odbiorem.",\n    f3e: "BEZPIECZEŃSTWO", f3t: "Tylko play-money", f3b: "Wirtualne CHIP nie mają wartości pieniężnej i nie można ich wypłacić.",\n    games: "GRY", play: "Graj teraz", gamesBody: "Trzy gry w wersji społecznościowej. Wirtualne żetony, bez prawdziwych wpłat i wypłat.",\n    royal: "Slot premium 5×3 połączony ze wspólnym saldem CHIP.", poker: "Texas Hold'em czasu rzeczywistego dla 2–10 graczy.", roulette: "Europejska ruletka w wersji play-money.", cta: "GRAJ →"\n  } : {\n    badge: "Social Casino · Play Money", intro: "Premium social-casino portal built around virtual chips. No deposits, withdrawals or conversion to money.",\n    signup: "Start with 2,500 chips", login: "Log in",\n    f1e: "START", f1t: "2,500 virtual chips", f1b: "Every new account starts with 2,500 CHIP for gameplay.",\n    f2e: "REWARDS", f2t: "+500 CHIP from rewarded video", f2b: "Rewarded-video bonuses are prepared with limits and anti-abuse protection.",\n    f3e: "SAFETY", f3t: "Play-money only", f3b: "Virtual CHIP has no cash value and cannot be withdrawn.",\n    games: "GAMES", play: "Play now", gamesBody: "Three social-casino games using virtual chips only.",\n    royal: "Premium 5×3 slot connected to the shared CHIP wallet.", poker: "Real-time Texas Hold'em tables for 2–10 players.", roulette: "European roulette in play-money mode.", cta: "PLAY →"\n  };\n  const cards = [[copy.f1e,copy.f1t,copy.f1b],[copy.f2e,copy.f2t,copy.f2b],[copy.f3e,copy.f3t,copy.f3b]];\n  return <div className="space-y-4 sm:space-y-5">\n    <section className="dashboard-shell relative isolate overflow-hidden px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-14">\n      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_10%,rgba(255,197,107,0.18),transparent_58%),radial-gradient(ellipse_65%_70%_at_85%_90%,rgba(255,100,120,0.12),transparent_60%),linear-gradient(145deg,#070708_0%,#15120d_48%,#070708_100%)]" />\n      <div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f7d77b]/20 bg-[#f7d77b]/[0.05] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f7d77b]/80">{copy.badge}</div>\n      <h1 className="font-display text-[clamp(2.5rem,10vw,5.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-white">PERSONE ROYALE<span className="block bg-[linear-gradient(90deg,#fff2b6,#d7a337,#fff2b6)] bg-clip-text text-transparent">CASINO</span></h1>\n      <p className="mt-5 max-w-[58ch] text-sm font-semibold leading-relaxed text-white/65 sm:text-base">{copy.intro}</p>\n      <div className="mt-7 flex flex-wrap gap-3"><Link href={ROUTES.signup} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff0b0,#d8a63f)] px-6 text-sm font-black text-[#160f04] shadow-[0_16px_40px_-16px_rgba(216,166,63,0.7)] transition-transform hover:-translate-y-0.5">{copy.signup}</Link><Link href={ROUTES.login} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-extrabold text-white transition-colors hover:bg-white/[0.08]">{copy.login}</Link></div></div>\n    </section>\n    <section className="grid gap-3 md:grid-cols-3">{cards.map(([eyebrow,title,body]) => <article key={title} className="dashboard-card p-5 sm:p-6"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">{eyebrow}</div><h2 className="mt-2 font-display text-xl font-black tracking-[-0.03em] text-white">{title}</h2><p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">{body}</p></article>)}</section>\n    <section className="dashboard-shell overflow-hidden p-4 sm:p-6"><div className="mb-5"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{copy.games}</div><h2 className="mt-1 font-display text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">{copy.play}</h2><p className="mt-2 max-w-[60ch] text-sm font-semibold leading-relaxed text-white/55">{copy.gamesBody}</p></div>\n      <div className="grid gap-3 md:grid-cols-3"><Link href={ROUTES.crash} className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">SLOT</div><h3 className="mt-2 font-display text-2xl font-black text-white">Royal Arc</h3><p className="mt-2 text-sm font-semibold text-white/55">{copy.royal}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{copy.cta}</div></Link>\n      <a href="/poker/index.html" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">TEXAS HOLD'EM · BETA</div><h3 className="mt-2 font-display text-2xl font-black text-white">Persone Royale Poker</h3><p className="mt-2 text-sm font-semibold text-white/55">{copy.poker}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{copy.cta}</div></a>\n      <a href="/roulette/index.html" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">ROULETTE · BETA</div><h3 className="mt-2 font-display text-2xl font-black text-white">European Roulette</h3><p className="mt-2 text-sm font-semibold text-white/55">{copy.roulette}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{copy.cta}</div></a></div>\n    </section>\n  </div>;\n}\n`);

console.log("Applied PERSONE ROYALE cleanup, Polish primary locale and product metadata cleanup.");
