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

fs.writeFileSync(
  path.join(root, "i18n", "routing.ts"),
  `import { defineRouting } from "next-intl/routing";\n\nexport const routing = defineRouting({\n  locales: ["pl", "en", "es", "pt", "de", "fr", "tr", "ru", "ja", "fa"],\n  defaultLocale: "pl",\n  localePrefix: "always",\n});\n\nexport type AppLocale = (typeof routing.locales)[number];\n`,
);

const localesPath = path.join(root, "lib", "data", "locales.ts");
let locales = fs.readFileSync(localesPath, "utf8");
if (!locales.includes('pl: { label: "Polski"')) {
  locales = locales.replace(
    'const localeMeta: Record<string, Omit<Locale, "code">> = {',
    'const localeMeta: Record<string, Omit<Locale, "code">> = {\n  pl: { label: "Polski", flag: "🇵🇱" },',
  );
}
fs.writeFileSync(localesPath, locales);

const enPath = path.join(root, "messages", "en.json");
const pl = JSON.parse(fs.readFileSync(enPath, "utf8"));
const copy = {
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
  "auth.usernameHint": "3–24 znaki: małe litery, cyfry i podkreślenia",
  "auth.usernamePlaceholder": "twoja_nazwa",
  "auth.password": "Hasło",
  "auth.confirmPassword": "Powtórz hasło",
  "auth.submitLogin": "Zaloguj się",
  "auth.submitSignup": "Utwórz konto",
  "auth.forgotPassword": "Nie pamiętasz hasła?",
  "auth.noAccount": "Nie masz jeszcze konta?",
  "auth.hasAccount": "Masz już konto?",
  "auth.termsLabel": "Potwierdzam, że mam co najmniej 18 lat i akceptuję regulamin oraz zasady odpowiedzialnej gry.",
  "auth.readPolicy": "Przeczytaj zasady",
  "auth.sessionError": "Nie udało się uruchomić sesji. Spróbuj ponownie.",
  "auth.passwordMismatch": "Hasła nie są identyczne.",
  "auth.invalidCredentials": "Nazwa użytkownika lub hasło są nieprawidłowe.",
  "auth.registrationFailed": "Nie udało się utworzyć konta.",
  "auth.networkError": "Błąd połączenia. Spróbuj ponownie.",
  "auth.formErrorsHint": "Popraw zaznaczone pola.",
  "auth.termsRequired": "Zaakceptuj warunki, aby kontynuować.",
  "auth.toastLoginTitle": "Zalogowano",
  "auth.toastLoginDescription": "Wczytywanie sesji…",
  "auth.toastSignupTitle": "Konto utworzone",
  "auth.toastSignupDescription": "Witaj w Persone Royale — otwieramy lobby…",
  "auth.forgotPasswordTitle": "Odzyskiwanie hasła",
  "auth.forgotPasswordBody": "Odzyskaj dostęp do konta zgodnie z zapisanymi ustawieniami bezpieczeństwa.",
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
  "faqSection.deposit-methods-a": "Nie. PERSONE ROYALE CASINO korzysta wyłącznie z wirtualnych CHIP i nie przyjmuje wpłat pieniężnych.",
  "faqSection.is-safe-q": "Czy to hazard na prawdziwe pieniądze?",
  "faqSection.is-safe-a": "Nie. To wersja play-money. Wirtualne CHIP nie mają wartości pieniężnej.",
  "faqSection.withdraw-q": "Czy mogę wypłacić lub wymienić żetony na pieniądze?",
  "faqSection.withdraw-a": "Nie. Wirtualnych CHIP nie można wypłacić, sprzedać ani wymienić na pieniądze.",
  "promotions.title": "Promocje",
  "promotions.body": "Nagrody w wirtualnych żetonach, misje i wydarzenia społecznościowe. Bez wpłat i nagród pieniężnych.",
  "vip.title": "Klub VIP",
  "vip.body": "Zdobywaj poziomy VIP dzięki aktywności i grze wirtualnymi żetonami.",
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
for (const [key, value] of Object.entries(copy)) set(pl, key, value);
fs.writeFileSync(path.join(root, "messages", "pl.json"), `${JSON.stringify(pl, null, 2)}\n`);

const homePath = path.join(root, "app", "[locale]", "(shell)", "page.tsx");
fs.writeFileSync(homePath, `import type { Metadata } from "next";\nimport { Link } from "@/i18n/navigation";\nimport { ROUTES } from "@/lib/paths";\nimport { alternateLanguageUrls, canonicalUrl } from "@/lib/seo/alternates";\n\nexport async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {\n  const { locale } = await params;\n  const isPl = locale === "pl";\n  return {\n    title: isPl ? "PERSONE ROYALE CASINO — Kasyno społecznościowe" : "PERSONE ROYALE CASINO — Social Casino",\n    description: isPl ? "Kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej." : "Play-money social casino with virtual chips only. No deposits, withdrawals or cash value.",\n    alternates: { canonical: canonicalUrl(locale, ROUTES.home), languages: alternateLanguageUrls(ROUTES.home) },\n  };\n}\n\nexport default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;\n  const pl = locale === "pl";\n  const c = pl ? { badge: "Kasyno społecznościowe · Play Money", intro: "Premium portal rozrywkowy oparty wyłącznie na wirtualnych żetonach. Bez wpłat, wypłat i wymiany na pieniądze.", signup: "Zacznij z 2500 żetonów", login: "Zaloguj się", start: "START", startTitle: "2500 wirtualnych żetonów", startBody: "Każde nowe konto otrzymuje 2500 CHIP do gry.", reward: "BONUSY", rewardTitle: "+500 CHIP za reklamę", rewardBody: "Nagrody za obejrzenie filmu są przygotowane z limitami i ochroną przed wielokrotnym odbiorem.", safe: "BEZPIECZEŃSTWO", safeTitle: "Tylko play-money", safeBody: "Wirtualne CHIP nie mają wartości pieniężnej i nie można ich wypłacić.", games: "GRY", play: "Graj teraz", gamesBody: "Trzy gry społecznościowe na wirtualne żetony.", royal: "Slot premium 5×3 połączony ze wspólnym saldem CHIP.", poker: "Texas Hold'em czasu rzeczywistego dla 2–10 graczy.", roulette: "Europejska ruletka w wersji play-money.", cta: "GRAJ →" } : { badge: "Social Casino · Play Money", intro: "Premium social-casino portal built around virtual chips. No deposits, withdrawals or conversion to money.", signup: "Start with 2,500 chips", login: "Log in", start: "START", startTitle: "2,500 virtual chips", startBody: "Every new account starts with 2,500 CHIP for gameplay.", reward: "REWARDS", rewardTitle: "+500 CHIP from rewarded video", rewardBody: "Rewarded-video bonuses are prepared with limits and anti-abuse protection.", safe: "SAFETY", safeTitle: "Play-money only", safeBody: "Virtual CHIP has no cash value and cannot be withdrawn.", games: "GAMES", play: "Play now", gamesBody: "Three social-casino games using virtual chips only.", royal: "Premium 5×3 slot connected to the shared CHIP wallet.", poker: "Real-time Texas Hold'em tables for 2–10 players.", roulette: "European roulette in play-money mode.", cta: "PLAY →" };\n  const cards = [[c.start,c.startTitle,c.startBody],[c.reward,c.rewardTitle,c.rewardBody],[c.safe,c.safeTitle,c.safeBody]];\n  return <div className="space-y-4 sm:space-y-5">\n    <section className="dashboard-shell relative isolate overflow-hidden px-4 py-8 sm:px-7 sm:py-12 lg:px-10 lg:py-14">\n      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_10%,rgba(255,197,107,0.18),transparent_58%),radial-gradient(ellipse_65%_70%_at_85%_90%,rgba(255,100,120,0.12),transparent_60%),linear-gradient(145deg,#070708_0%,#15120d_48%,#070708_100%)]" />\n      <div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f7d77b]/20 bg-[#f7d77b]/[0.05] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f7d77b]/80">{c.badge}</div><h1 className="font-display text-[clamp(2.5rem,10vw,5.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-white">PERSONE ROYALE<span className="block bg-[linear-gradient(90deg,#fff2b6,#d7a337,#fff2b6)] bg-clip-text text-transparent">CASINO</span></h1><p className="mt-5 max-w-[58ch] text-sm font-semibold leading-relaxed text-white/65 sm:text-base">{c.intro}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={ROUTES.signup} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff0b0,#d8a63f)] px-6 text-sm font-black text-[#160f04] shadow-[0_16px_40px_-16px_rgba(216,166,63,0.7)] transition-transform hover:-translate-y-0.5">{c.signup}</Link><Link href={ROUTES.login} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-extrabold text-white transition-colors hover:bg-white/[0.08]">{c.login}</Link></div></div>\n    </section>\n    <section className="grid gap-3 md:grid-cols-3">{cards.map(([eyebrow,title,body]) => <article key={title} className="dashboard-card p-5 sm:p-6"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">{eyebrow}</div><h2 className="mt-2 font-display text-xl font-black tracking-[-0.03em] text-white">{title}</h2><p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">{body}</p></article>)}</section>\n    <section className="dashboard-shell overflow-hidden p-4 sm:p-6"><div className="mb-5"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{c.games}</div><h2 className="mt-1 font-display text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">{c.play}</h2><p className="mt-2 max-w-[60ch] text-sm font-semibold leading-relaxed text-white/55">{c.gamesBody}</p></div><div className="grid gap-3 md:grid-cols-3"><Link href={ROUTES.crash} className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">SLOT</div><h3 className="mt-2 font-display text-2xl font-black text-white">Royal Arc</h3><p className="mt-2 text-sm font-semibold text-white/55">{c.royal}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{c.cta}</div></Link><a href="/poker/index.html" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">TEXAS HOLD'EM · BETA</div><h3 className="mt-2 font-display text-2xl font-black text-white">Persone Royale Poker</h3><p className="mt-2 text-sm font-semibold text-white/55">{c.poker}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{c.cta}</div></a><a href="/roulette/index.html" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7d77b]">ROULETTE · BETA</div><h3 className="mt-2 font-display text-2xl font-black text-white">Persone Royale Roulette</h3><p className="mt-2 text-sm font-semibold text-white/55">{c.roulette}</p><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{c.cta}</div></a></div></section>\n  </div>;\n}\n`);

console.log("Applied Polish primary locale and Persone Royale lobby copy.");
