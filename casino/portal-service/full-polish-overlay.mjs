import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localeSource = process.argv[2];
if (!localeSource || !fs.existsSync(localeSource)) {
  throw new Error("Full Polish locale JSON path is required.");
}

const pl = JSON.parse(fs.readFileSync(localeSource, "utf8"));
const enPath = path.join(root, "messages", "en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

function collectShape(value, prefix = "", out = []) {
  if (Array.isArray(value)) {
    out.push(prefix);
    return out;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) collectShape(value[key], prefix ? `${prefix}.${key}` : key, out);
    return out;
  }
  out.push(prefix);
  return out;
}

const enShape = new Set(collectShape(en));
const plShape = new Set(collectShape(pl));
const missing = [...enShape].filter((key) => !plShape.has(key));
if (missing.length) throw new Error(`Polish locale misses keys: ${missing.join(", ")}`);

fs.writeFileSync(path.join(root, "messages", "pl.json"), `${JSON.stringify(pl, null, 2)}\n`);

fs.writeFileSync(
  path.join(root, "i18n", "routing.ts"),
  `import { defineRouting } from "next-intl/routing";\n\nexport const routing = defineRouting({\n  locales: ["pl"],\n  defaultLocale: "pl",\n  localePrefix: "always",\n});\n\nexport type AppLocale = (typeof routing.locales)[number];\n`,
);

const replacements = [
  ["Social Casino — Play Money", "Kasyno społecznościowe — Play Money"],
  ["Social Casino · Play Money", "Kasyno społecznościowe · Play Money"],
  ["PERSONE ROYALE CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value.", "PERSONE ROYALE CASINO to kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej."],
  ["Play-money social casino with virtual chips only. No deposits, withdrawals or cash value.", "Kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej."],
  ["GAMES", "GRY"],
  ["Play now", "Graj teraz"],
  ["Three playable social-casino games. Virtual chips only — no deposits, withdrawals or cash value.", "Trzy gry w kasynie społecznościowym. Tylko wirtualne żetony — bez wpłat, wypłat i wartości pieniężnej."],
  ["Spin the reels with the shared virtual CHIP wallet.", "Kręć bębnami, korzystając ze wspólnego salda wirtualnych CHIP."],
  ["PLAY →", "GRAJ →"],
  ["Real-time Texas Hold'em lobby and tables for 2–10 players.", "Lobby i stoły Texas Hold'em w czasie rzeczywistym dla 2–10 graczy."],
  ["ROULETTE · BETA", "RULETKA · BETA"],
  ["European Roulette", "Ruletka europejska"],
  ["Playable roulette preview while the final Persone skin is prepared.", "Grywalna ruletka w wersji PERSONE ROYALE."],
  ["Open Royal Arc", "Otwórz Royal Arc"],
  ["Royal Arc is connected to the shared CHIP wallet. Spins are settled by the server and the browser only animates the returned result.", "Royal Arc korzysta ze wspólnego salda CHIP. Wynik każdego obrotu rozlicza serwer, a przeglądarka wyświetla animację otrzymanego wyniku."],
  ["DAILY BONUS", "BONUS DZIENNY"],
  ["Log in to claim the bonus.", "Zaloguj się, aby odebrać bonus."],
  ["Bonus unavailable", "Bonus jest obecnie niedostępny"],
  ["Could not claim bonus.", "Nie udało się odebrać bonusu."],
  ["Claim free virtual chips once per day. The bonus has no cash value and is for gameplay only.", "Odbieraj raz dziennie darmowe wirtualne żetony. Bonus nie ma wartości pieniężnej i służy wyłącznie do gry."],
  ["Current balance", "Aktualne saldo"],
  ["Checking…", "Sprawdzanie…"],
  ["Claiming…", "Odbieranie…"],
  ["Claimed for today", "Bonus odebrany na dziś"],
  ["Claim +500 CHIP", "Odbierz +500 CHIP"],
  ["Bonuses", "Bonusy"],
  ["Offers & rewards", "Oferty i nagrody"],

  ["Elite Poker", "Persone Royale Poker"],
  ["Enter your username", "Wpisz nazwę użytkownika"],
  ["Enter Lobby", "Wejdź do lobby"],
  ["Connecting", "Łączenie"],
  ["Lobby is full. You have been added to the waiting list.", "Stół jest pełny. Dodano Cię do kolejki oczekujących."],
  ["Table Lobby", "Lobby stołów"],
  ["Logout", "Wyloguj"],
  ["Create Table", "Utwórz stół"],
  ["This lobby is password protected. Enter password:", "Ten stół jest chroniony hasłem. Wpisz hasło:"],
  ["Password protected", "Chronione hasłem"],
  ["Players:", "Gracze:"],
  ["Active:", "Aktywni:"],
  ["Blinds:", "Ciemne:"],
  ["Stack:", "Żetony:"],
  ["Pot:", "Pula:"],
  ["Queue:", "Kolejka:"],
  ["Top:", "Lider:"],
  ["No tables available. Create one!", "Brak dostępnych stołów. Utwórz pierwszy!"],
  ["General Chat", "Czat ogólny"],
  ["Type a message...", "Napisz wiadomość…"],
  ["Send", "Wyślij"],
  ["Online Players", "Gracze online"],
  ["No players online", "Brak graczy online"],
  ["Create New Table", "Utwórz nowy stół"],
  ["Table Name", "Nazwa stołu"],
  ["My Table", "Mój stół"],
  ["Description (optional)", "Opis (opcjonalnie)"],
  ["Fun cash game", "Luźna rozgrywka"],
  ["Password (optional)", "Hasło (opcjonalnie)"],
  ["Leave blank for public", "Zostaw puste, aby stół był publiczny"],
  ["Starting Chips", "Żetony na start"],
  ["Game Mode", "Tryb gry"],
  ["Tournament", "Turniej"],
  ["Cash Game (Coming Soon)", "Gra stolikowa (wkrótce)"],
  ["Small Blind", "Mała ciemna"],
  ["Big Blind", "Duża ciemna"],
  ["Cancel", "Anuluj"],
  ["Waiting", "Oczekiwanie"],
  ["Close chat", "Zamknij czat"],
  ["Open chat", "Otwórz czat"],
  ["Cancel Ready", "Anuluj gotowość"],
  ["Ready", "Gotowy"],
  ["Settings", "Ustawienia"],
  ["Fold", "Pas"],
  ["Check", "Czekaj"],
  ["Call", "Sprawdź"],
  ["Raise", "Podbij"],
  ["All In", "All-in"],
  ["All-in", "All-in"],
  ["Reveal Cards", "Pokaż karty"],
  ["Leaderboard", "Ranking"],
  ["Hand History", "Historia rozdań"],
  ["Return to Lobby", "Wróć do lobby"],
  ["Leave Table", "Opuść stół"],
  ["Sound", "Dźwięk"],
  ["Beginner", "Tryb początkujący"],
  ["Beginner Tips", "Podpowiedzi dla początkujących"],
  ["Pause", "Pauza"],
  ["Resume", "Wznów"],
  ["Reset Table", "Zresetuj stół"],
  ["Reset", "Resetuj"],
  ["Theme", "Motyw"],
  ["Card Back", "Rewers kart"],
  ["Performance Mode", "Tryb wydajności"],
  ["Fixed Seat View", "Stałe położenie miejsca"],
  ["Chat", "Czat"],
  ["History", "Historia"],
  ["Winner", "Zwycięzca"],
  ["Wins", "Wygrywa"],
  ["Spectator", "Obserwator"],
  ["Sit In", "Usiądź do gry"],

  ["React Casino Roulette", "PERSONE ROYALE · Ruletka"],
  ["Let's go", "Zakręć"],
  ["Let&apos;s go", "Zakręć"],
  ["Total bet:", "Łączna stawka:"],
  ["Undo", "Cofnij"],
  ["Clean", "Wyczyść"],
  ["Debug", "Diagnostyka"],
  ["Show", "Pokaż"],
  ["Hide", "Ukryj"],
  [" data", " dane"],
  ["alt=\"chip\"", "alt=\"żeton\""],

  ["Royal Arc — SEDLAR CASINO", "Royal Arc — PERSONE ROYALE CASINO"],
  ["Royal Arc — Premium Slot Prototype", "Royal Arc — PERSONE ROYALE CASINO"],
  ["THE CROWN VAULT", "SKARBIEC KORONY"],
  ["BALANCE", "SALDO"],
  ["WIN", "WYGRANA"],
  [">SPIN<", ">ZAKRĘĆ<"],
  ["aria-label=\"Royal Arc premium slot\"", "aria-label=\"Royal Arc — slot premium\""],

  ["SEDLAR CASINO", "PERSONE ROYALE CASINO"],
  ["SEDLAR", "PERSONE ROYALE"],
  ["Script.Casino", "PERSONE ROYALE CASINO"],
  ["script.casino", "personeroyale.pl"]
];

function patchTextFile(file) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return; }
  let next = text;
  for (const [from, to] of replacements) next = next.replaceAll(from, to);
  if (next !== text) fs.writeFileSync(file, next);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next"].includes(entry.name)) continue;
      walk(full);
      continue;
    }
    if (/\.(?:ts|tsx|js|jsx|mjs|json|html|txt|md|webmanifest)$/i.test(entry.name)) patchTextFile(full);
  }
}

for (const dir of ["app", "components", "lib", "public"]) walk(path.join(root, dir));

const dealerMessagesPath = path.join(root, "lib", "poker-engine", "game", "dealerMessages.js");
if (fs.existsSync(dealerMessagesPath)) {
  fs.writeFileSync(dealerMessagesPath, `const messages = {\n  playerJoined: [(p) => \`${"${p.name}"} dołącza do stołu. Powodzenia!\`, (p) => \`Witamy przy stole, ${"${p.name}"}.\`],\n  playerLeft: [(p) => \`${"${p.name}"} opuszcza stół.\`, (p) => \`${"${p.name}"} zakończył rozgrywkę.\`],\n  playerKicked: [(p) => \`${"${p.name}"} został usunięty ze stołu przez administratora.\`],\n  lobbyCreated: [(p) => \`${"${p.name}"} utworzył nowy stół.\`, (p) => \`Nowy stół jest gotowy. Gospodarz: ${"${p.name}"}.\`],\n  gameStarted: [() => \`Karty rozdane. Zaczynamy!\`, () => \`Rozpoczyna się pierwsze rozdanie.\`],\n  handComplete: [(p) => \`${"${p.names}"} wygrywa ${"${p.winnings.toLocaleString()}"} CHIP układem ${"${p.hand}"}.\`, (p) => \`Pula trafia do ${"${p.names}"}: ${"${p.winnings.toLocaleString()}"} CHIP.\`],\n  fold: [(p) => \`${"${p.name}"} pasuje.\`],\n  check: [(p) => \`${"${p.name}"} czeka.\`],\n  call: [(p) => \`${"${p.name}"} sprawdza za ${"${p.amount.toLocaleString()}"}.\`],\n  raise: [(p) => \`${"${p.name}"} podbija do ${"${p.amount.toLocaleString()}"}.\`],\n  allin: [(p) => \`${"${p.name}"} gra all-in za ${"${p.amount.toLocaleString()}"}!\`],\n  sideBetPlaced: [(p) => \`${"${p.bettor}"} stawia ${"${p.amount.toLocaleString()}"} na ${"${p.target}"}.\`],\n  sideBetWin: [(p) => \`${"${p.bettor}"} wygrywa zakład dodatkowy: ${"${(p.amount + p.profit).toLocaleString()}"} CHIP.\`],\n  sideBetRefund: [(p) => \`Zakład dodatkowy ${"${p.bettor}"} został zwrócony: ${"${p.amount.toLocaleString()}"} CHIP.\`],\n  achievementEarned: [(p) => \`🏆 ${"${p.player}"} zdobywa osiągnięcie „${"${p.name}"}”.\`],\n  pause: [(p) => \`${"${p.name}"} wstrzymał grę.\`],\n  resume: [(p) => \`${"${p.name}"} wznowił grę.\`],\n  reset: [(p) => \`${"${p.name}"} zresetował stół.\`],\n  sitIn: [(p) => \`${"${p.name}"} siada do gry.\`],\n  communityFlop: [() => \`Flop — trzy karty na stole.\`],\n  communityTurn: [() => \`Turn — czwarta karta na stole.\`],\n  communityRiver: [() => \`River — ostatnia karta na stole.\`],\n};\n\nexport function getDealerMessage(event, params = {}) {\n  const pool = messages[event];\n  if (!pool || pool.length === 0) return null;\n  const fn = pool[Math.floor(Math.random() * pool.length)];\n  if (typeof fn !== 'function') return null;\n  try { return fn(params); } catch { return null; }\n}\n`);
}

const royalHtml = path.join(root, "public", "royal-arc", "index.html");
if (fs.existsSync(royalHtml)) {
  let html = fs.readFileSync(royalHtml, "utf8");
  html = html
    .replaceAll("THE CROWN VAULT", "SKARBIEC KORONY")
    .replaceAll("<span>CHIP</span>", "<span>SALDO</span>")
    .replaceAll("<span>WIN</span>", "<span>WYGRANA</span>")
    .replaceAll("<span>SPIN</span>", "<span>ZAKRĘĆ</span>")
    .replaceAll("Royal Arc — SEDLAR CASINO", "Royal Arc — PERSONE ROYALE CASINO");
  fs.writeFileSync(royalHtml, html);
}

const localeMetaPath = path.join(root, "lib", "data", "locales.ts");
if (fs.existsSync(localeMetaPath)) {
  let text = fs.readFileSync(localeMetaPath, "utf8");
  if (!text.includes('pl: { label: "Polski"')) {
    text = text.replace('const localeMeta: Record<string, Omit<Locale, "code">> = {', 'const localeMeta: Record<string, Omit<Locale, "code">> = {\n  pl: { label: "Polski", flag: "🇵🇱" },');
  }
  fs.writeFileSync(localeMetaPath, text);
}

const forbiddenInPolish = [
  "Welcome back", "Log in", "Sign up", "Forgot password", "Back to site", "Install app",
  "Latest News", "Live Support", "Responsible Gaming", "Create Table", "Enter Lobby",
  "General Chat", "Online Players", "Total bet:", "Let's go", "React Casino Roulette",
  "THE CROWN VAULT", "SEDLAR CASINO", "Script.Casino"
];

const plSerialized = JSON.stringify(pl);
for (const phrase of forbiddenInPolish) {
  if (plSerialized.includes(phrase)) throw new Error(`English phrase remains in Polish locale: ${phrase}`);
}

console.log("Applied complete Polish locale and Polish UI patches across portal, Royal Arc, Poker and Roulette.");
