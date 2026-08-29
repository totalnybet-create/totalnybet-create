import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localeSource = process.argv[2];
if (!localeSource || !fs.existsSync(localeSource)) throw new Error("Full Polish locale JSON path is required.");

const pl = JSON.parse(fs.readFileSync(localeSource, "utf8"));
const enPath = path.join(root, "messages", "en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

function normalizeLocaleShapeKey(key) {
  return key
    .replaceAll("profile.deposit.virtual CHIPNetworksTitle", "profile.deposit.usdtNetworksTitle")
    .replaceAll("profile.deposit.virtual CHIPNetworksFootnote", "profile.deposit.usdtNetworksFootnote");
}

function collectShape(value, prefix = "", out = []) {
  if (Array.isArray(value)) { out.push(prefix); return out; }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) collectShape(value[key], prefix ? `${prefix}.${key}` : key, out);
    return out;
  }
  out.push(prefix);
  return out;
}

const enShape = new Set(collectShape(en).map(normalizeLocaleShapeKey));
const plShape = new Set(collectShape(pl));
const missing = [...enShape].filter((key) => !plShape.has(key));
if (missing.length) throw new Error(`Polish locale misses keys: ${missing.join(", ")}`);

fs.writeFileSync(path.join(root, "messages", "pl.json"), `${JSON.stringify(pl, null, 2)}\n`);
fs.writeFileSync(path.join(root, "i18n", "routing.ts"), `import { defineRouting } from "next-intl/routing";\n\nexport const routing = defineRouting({\n  locales: ["pl"],\n  defaultLocale: "pl",\n  localePrefix: "always",\n});\n\nexport type AppLocale = (typeof routing.locales)[number];\n`);

function patchFile(file, replacements) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of replacements) text = text.replaceAll(from, to);
  fs.writeFileSync(file, text);
}

function walkFiles(dir, extensions, callback) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkFiles(full, extensions, callback); continue; }
    if (extensions.some((ext) => entry.name.endsWith(ext))) callback(full);
  }
}

// Only long/exact portal strings are patched in source. We deliberately avoid
// broad single-word substitutions here so component/import identifiers remain untouched.
const portalSafe = [
  ["Social Casino — Play Money", "Kasyno społecznościowe — Play Money"],
  ["Social Casino · Play Money", "Kasyno społecznościowe · Play Money"],
  ["PERSONE ROYALE CASINO is a play-money social casino with virtual chips only. No deposits, withdrawals or cash value.", "PERSONE ROYALE CASINO to kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej."],
  ["Play-money social casino with virtual chips only. No deposits, withdrawals or cash value.", "Kasyno społecznościowe z wirtualnymi żetonami. Bez wpłat, wypłat i wartości pieniężnej."],
  [">GAMES<", ">GRY<"],
  [">Play now<", ">Graj teraz<"],
  [">PLAY →<", ">GRAJ →<"],
  ["Three playable social-casino games. Virtual chips only — no deposits, withdrawals or cash value.", "Trzy gry w kasynie społecznościowym. Tylko wirtualne żetony — bez wpłat, wypłat i wartości pieniężnej."],
  ["Spin the reels with the shared virtual CHIP wallet.", "Kręć bębnami, korzystając ze wspólnego salda wirtualnych CHIP."],
  ["Real-time Texas Hold'em lobby and tables for 2–10 players.", "Lobby i stoły Texas Hold'em w czasie rzeczywistym dla 2–10 graczy."],
  ["ROULETTE · BETA", "RULETKA · BETA"],
  ["European Roulette", "Ruletka europejska"],
  ["Playable roulette preview while the final Persone skin is prepared.", "Grywalna ruletka w wersji PERSONE ROYALE."],
  ["Open Royal Arc", "Otwórz Royal Arc"],
  ["Royal Arc is connected to the shared CHIP wallet. Spins are settled by the server and the browser only animates the returned result.", "Royal Arc korzysta ze wspólnego salda CHIP. Wynik każdego obrotu rozlicza serwer, a przeglądarka wyświetla animację otrzymanego wyniku."],
  ["Log in to claim the bonus.", "Zaloguj się, aby odebrać bonus."],
  ["Bonus unavailable", "Bonus jest obecnie niedostępny"],
  ["Could not claim bonus.", "Nie udało się odebrać bonusu."],
  ["Claim free virtual chips once per day. The bonus has no cash value and is for gameplay only.", "Odbieraj raz dziennie darmowe wirtualne żetony. Bonus nie ma wartości pieniężnej i służy wyłącznie do gry."],
  ["Claimed for today", "Bonus odebrany na dziś"],
  ["Claim +500 CHIP", "Odbierz +500 CHIP"],
  ["Offers & rewards", "Oferty i nagrody"],
  ["SEDLAR CASINO", "PERSONE ROYALE CASINO"],
  ["Script.Casino", "PERSONE ROYALE CASINO"],
  ["script.casino", "personeroyale.pl"]
];
for (const dir of ["app", "components", "lib"]) {
  walkFiles(path.join(root, dir), [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"], (file) => patchFile(file, portalSafe));
}

// Replace exact user-facing string literals in already-built static games.
// Surrounding quotes prevent replacements from touching minified identifiers.
function replaceLiteral(text, from, to) {
  const pairs = [
    [JSON.stringify(from), JSON.stringify(to)],
    [`'${from.replaceAll("'", "\\'")}'`, `'${to.replaceAll("'", "\\'")}'`],
    [`\`${from.replaceAll("`", "\\`")}\``, `\`${to.replaceAll("`", "\\`")}\``],
  ];
  for (const [a, b] of pairs) text = text.replaceAll(a, b);
  return text;
}

const pokerStrings = [
  ["Elite Poker", "Persone Royale Poker"], ["Enter your username", "Wpisz nazwę użytkownika"], ["Enter Lobby", "Wejdź do lobby"],
  ["Connecting", "Łączenie"], ["Lobby is full. You have been added to the waiting list.", "Stół jest pełny. Dodano Cię do kolejki oczekujących."],
  ["Table Lobby", "Lobby stołów"], ["Logout", "Wyloguj"], ["Create Table", "Utwórz stół"],
  ["This lobby is password protected. Enter password:", "Ten stół jest chroniony hasłem. Wpisz hasło:"], ["Password protected", "Chronione hasłem"],
  ["Players:", "Gracze:"], ["Active:", "Aktywni:"], ["Blinds:", "Ciemne:"], ["Stack:", "Żetony:"], ["Pot:", "Pula:"], ["Queue:", "Kolejka:"], ["Top:", "Lider:"],
  ["No tables available. Create one!", "Brak dostępnych stołów. Utwórz pierwszy!"], ["General Chat", "Czat ogólny"], ["Type a message...", "Napisz wiadomość…"], ["Send", "Wyślij"],
  ["Online Players", "Gracze online"], ["No players online", "Brak graczy online"], ["Create New Table", "Utwórz nowy stół"], ["Table Name", "Nazwa stołu"],
  ["My Table", "Mój stół"], ["Description (optional)", "Opis (opcjonalnie)"], ["Fun cash game", "Luźna rozgrywka"], ["Password (optional)", "Hasło (opcjonalnie)"],
  ["Leave blank for public", "Zostaw puste, aby stół był publiczny"], ["Starting Chips", "Żetony na start"], ["Game Mode", "Tryb gry"], ["Tournament", "Turniej"],
  ["Cash Game (Coming Soon)", "Gra stolikowa (wkrótce)"], ["Small Blind", "Mała ciemna"], ["Big Blind", "Duża ciemna"], ["Cancel", "Anuluj"],
  ["Waiting", "Oczekiwanie"], ["Close chat", "Zamknij czat"], ["Open chat", "Otwórz czat"], ["Cancel Ready", "Anuluj gotowość"], ["Ready", "Gotowy"],
  ["Settings", "Ustawienia"], ["Show Cards", "Pokaż karty"], ["Min", "Min."], ["Pot", "Pula"], ["Max", "Maks."], ["Raise to", "Podbij do"], ["Confirm", "Potwierdź"],
  ["Fold", "Pas"], ["Check", "Czekaj"], ["Call", "Sprawdź"], ["Raise", "Podbij"], ["All-in", "All-in"],
  ["Theme", "Motyw"], ["Card Back", "Rewers kart"], ["Seat View", "Widok miejsca"], ["Fixed (My Seat Bottom)", "Stały (moje miejsce na dole)"],
  ["Dynamic (Rotating)", "Dynamiczny (obracany)"], ["Sound", "Dźwięk"], ["Sound effects on", "Efekty dźwiękowe włączone"], ["Sound effects off", "Efekty dźwiękowe wyłączone"],
  ["Performance Mode", "Tryb wydajności"], ["Fast (reduced animations)", "Szybki (mniej animacji)"], ["Full animations", "Pełne animacje"],
  ["Noob Mode", "Tryb początkujący"], ["Show win probability & hand tips", "Pokaż szansę wygranej i podpowiedzi"], ["Game Control", "Sterowanie grą"],
  ["Resume game", "Wznów grę"], ["Pause game", "Wstrzymaj grę"], ["Reset Lobby", "Zresetuj stół"], ["Hand History", "Historia rozdań"], ["Return to Lobby", "Wróć do lobby"],
  ["GAME PAUSED", "GRA WSTRZYMANA"], ["Spectator Mode", "Tryb obserwatora"], ["Wait for current hand to end", "Zaczekaj na zakończenie bieżącego rozdania"],
  ["Reset all scores and chips? This cannot be undone.", "Zresetować wszystkie wyniki i żetony? Tej operacji nie można cofnąć."], ["Yes, Reset", "Tak, zresetuj"], ["No hands played yet.", "Nie rozegrano jeszcze żadnych rozdań."],
  ["Table Chat", "Czat stołu"], ["Quick Chat", "Szybkie wiadomości"], ["To", "Do"], ["From", "Od"],
  ["Nice hand", "Dobre rozdanie"], ["Wow", "Wow"], ["Sorry", "Przepraszam"], ["Angry", "Złość"], ["Unlucky", "Pech"], ["Seriously?", "Serio?"],
  ["All in", "All-in"], ["Fold faster", "Pasuj szybciej"], ["What a bluff", "Co za blef"], ["Nice catch", "Dobre trafienie"], ["Take my chips", "Bierz moje żetony"],
  ["Good luck", "Powodzenia"], ["I saw that", "Widziałem to"], ["Same again", "Jeszcze raz"], ["Hello", "Cześć"], ["Good game", "Dobra gra"],
  ["Good luck all", "Powodzenia wszystkim"], ["Well played", "Dobrze zagrane"], ["Respect", "Szacunek"], ["Bring it on", "Dawaj"], ["On fire", "Ale seria"], ["Cold deck", "Zimna talia"],
  ["Select a player to bet on", "Wybierz gracza, na którego stawiasz"], ["Minimum bet is 10 chips", "Minimalna stawka to 10 CHIP"], ["Bet placed!", "Stawka przyjęta!"], ["Bet placed", "Stawka przyjęta"],
  ["Side Bet (50% profit)", "Zakład dodatkowy (+50%)"], ["Select player to win...", "Wybierz gracza do wygranej…"], ["Amount", "Kwota"], ["Bet", "Postaw"],
  ["You win 1.5x if your pick wins!", "Otrzymasz 1,5× stawki, jeśli wybrany gracz wygra!"], ["Leaderboard", "Ranking"], ["Round:", "Runda:"],
  ["Hands", "Rozdania"], ["Pots Won", "Wygrane pule"], ["Losses", "Przegrane"], ["Biggest Pot", "Największa pula"], ["Best Hand", "Najlepszy układ"], ["Win Rate", "Skuteczność"],
  ["N/A", "Brak"], ["No active players", "Brak aktywnych graczy"], ["Score = rounds won", "Wynik = wygrane rozdania"],
  ["Strength", "Siła"], ["Win", "Wygrana"],
  ["Midnight Gold", "Nocne Złoto"], ["Emerald Royale", "Szmaragdowa Korona"], ["Crimson Dynasty", "Karmazynowa Dynastia"], ["Arctic Frost", "Arktyczny Mróz"], ["Neon Circuit", "Neonowy Obwód"],
  ["Midnight", "Noc"], ["Royal", "Królewski"], ["Emerald", "Szmaragd"], ["Sapphire", "Szafir"], ["Onyx", "Onyks"], ["Pearl", "Perła"],
  ["Royal Flush", "Poker królewski"], ["Straight Flush", "Poker"], ["Four of a Kind", "Kareta"], ["Full House", "Full"], ["Flush", "Kolor"], ["Straight", "Strit"], ["Three of a Kind", "Trójka"], ["Two Pair", "Dwie pary"], ["One Pair", "Para"], ["High Card", "Wysoka karta"],
  ["کارت‌های خود را بررسی کنید.", "Sprawdź swoje karty."], ["📌 شما یک جفت دارید. قوی است!", "📌 Masz parę — to mocny start."], ["🔥 کارت‌های هم‌رنگ بالا، شانس فلاش دارید.", "🔥 Wysokie karty w kolorze — masz szansę na kolor."],
  ["💪 AK دست بسیار قوی، حتماً بریزید.", "💪 AK to bardzo mocny układ startowy."], ["🃏 تک آس، ارزش دیدن فلاپ را دارد.", "🃏 As może być wart zobaczenia flopa."], ["⚠️ دست ضعیف، فقط در موقعیت خوب بازی کنید.", "⚠️ Słaba ręka — graj ostrożnie."],
  ["چهارتایی!!! 🔥", "Kareta!!! 🔥"], ["ست (سه‌تایی) ✅", "Trójka ✅"], ["دو جفت 🟢", "Dwie pary 🟢"], ["یک جفت 🟡", "Para 🟡"], ["کارت بلند 🟠", "Wysoka karta 🟠"],
  ["✨ فلاش دراو دارید!", "✨ Masz draw do koloru!"], ["🌟 استریت دراو دارید!", "🌟 Masz draw do strita!"], ["🐣 نکته نوب سگم", "🐣 Podpowiedź"],
];

const pokerDir = path.join(root, "public", "poker");
walkFiles(pokerDir, [".js", ".html"], (file) => {
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of pokerStrings) text = replaceLiteral(text, from, to);
  // Long JSX strings compiled with interpolations are patched as safe fragments.
  text = text
    .replaceAll(" won ", " wygrał ")
    .replaceAll(" chips from side bet on ", " CHIP z zakładu dodatkowego na ")
    .replaceAll(" folded – your side bet stake of ", " spasował — zwrócono Twój zakład dodatkowy: ")
    .replaceAll(" has been refunded.", " CHIP.")
    .replaceAll("Maximum bet is 50% of your chips (", "Maksymalna stawka to 50% Twoich CHIP (")
    .replaceAll("دست فعلی: ", "Aktualny układ: ")
    .replaceAll(" شانس پات خوب (", " Dobre pot odds (")
    .replaceAll("٪ از پات)، ارزش کال دارد.", "% puli) — sprawdzenie może mieć sens.")
    .replaceAll(" مبلغ کال زیاد (", " Wysoki koszt sprawdzenia (")
    .replaceAll("٪ از پات)، فقط با دست قوی کال کنید.", "% puli) — sprawdzaj tylko z mocnym układem.");
  fs.writeFileSync(file, text);
});

const rouletteStrings = [
  ["React Casino Roulette", "PERSONE ROYALE · Ruletka"], ["Let's go", "Zakręć"], ["Total bet:", "Łączna stawka:"],
  ["Undo", "Cofnij"], ["Clean", "Wyczyść"], ["Debug", "Diagnostyka"], ["Show", "Pokaż"], ["Hide", "Ukryj"], ["data", "dane"], ["chip", "żeton"]
];
const rouletteDir = path.join(root, "public", "roulette");
walkFiles(rouletteDir, [".js", ".html"], (file) => {
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of rouletteStrings) text = replaceLiteral(text, from, to);
  fs.writeFileSync(file, text);
});

patchFile(path.join(root, "public", "royal-arc", "index.html"), [
  ["Royal Arc — SEDLAR CASINO", "Royal Arc — PERSONE ROYALE CASINO"],
  ["Royal Arc — Premium Slot Prototype", "Royal Arc — PERSONE ROYALE CASINO"],
  ["THE CROWN VAULT", "SKARBIEC KORONY"], ["<span>BALANCE</span>", "<span>SALDO</span>"], ["<span>WIN</span>", "<span>WYGRANA</span>"], ["<span>SPIN</span>", "<span>ZAKRĘĆ</span>"],
  ["aria-label=\"Royal Arc premium slot\"", "aria-label=\"Royal Arc — slot premium\""]
]);

const dealerMessagesPath = path.join(root, "lib", "poker-engine", "game", "dealerMessages.js");
if (fs.existsSync(dealerMessagesPath)) {
  fs.writeFileSync(dealerMessagesPath, `const messages = {\n  playerJoined: [(p) => \`${"${p.name}"} dołącza do stołu. Powodzenia!\`, (p) => \`Witamy przy stole, ${"${p.name}"}.\`],\n  playerLeft: [(p) => \`${"${p.name}"} opuszcza stół.\`, (p) => \`${"${p.name}"} zakończył rozgrywkę.\`],\n  playerKicked: [(p) => \`${"${p.name}"} został usunięty ze stołu przez administratora.\`],\n  lobbyCreated: [(p) => \`${"${p.name}"} utworzył nowy stół.\`],\n  gameStarted: [() => \`Karty rozdane. Zaczynamy!\`],\n  handComplete: [(p) => \`${"${p.names}"} wygrywa ${"${p.winnings.toLocaleString()}"} CHIP.\`],\n  fold: [(p) => \`${"${p.name}"} pasuje.\`], check: [(p) => \`${"${p.name}"} czeka.\`], call: [(p) => \`${"${p.name}"} sprawdza za ${"${p.amount.toLocaleString()}"}.\`],\n  raise: [(p) => \`${"${p.name}"} podbija do ${"${p.amount.toLocaleString()}"}.\`], allin: [(p) => \`${"${p.name}"} gra all-in za ${"${p.amount.toLocaleString()}"}!\`],\n  sideBetPlaced: [(p) => \`${"${p.bettor}"} stawia ${"${p.amount.toLocaleString()}"} na ${"${p.target}"}.\`], sideBetWin: [(p) => \`${"${p.bettor}"} wygrywa zakład dodatkowy.\`],\n  sideBetRefund: [(p) => \`Zakład dodatkowy ${"${p.bettor}"} został zwrócony.\`], achievementEarned: [(p) => \`🏆 ${"${p.player}"} zdobywa osiągnięcie „${"${p.name}"}”.\`],\n  pause: [(p) => \`${"${p.name}"} wstrzymał grę.\`], resume: [(p) => \`${"${p.name}"} wznowił grę.\`], reset: [(p) => \`${"${p.name}"} zresetował stół.\`], sitIn: [(p) => \`${"${p.name}"} siada do gry.\`],\n  communityFlop: [() => \`Flop — trzy karty na stole.\`], communityTurn: [() => \`Turn — czwarta karta na stole.\`], communityRiver: [() => \`River — ostatnia karta na stole.\`],\n};\nexport function getDealerMessage(event, params = {}) { const pool = messages[event]; if (!pool?.length) return null; const fn = pool[Math.floor(Math.random()*pool.length)]; try { return typeof fn === 'function' ? fn(params) : null; } catch { return null; } }\n`);
}

const localeMetaPath = path.join(root, "lib", "data", "locales.ts");
if (fs.existsSync(localeMetaPath)) {
  let text = fs.readFileSync(localeMetaPath, "utf8");
  if (!text.includes('pl: { label: "Polski"')) text = text.replace('const localeMeta: Record<string, Omit<Locale, "code">> = {', 'const localeMeta: Record<string, Omit<Locale, "code">> = {\n  pl: { label: "Polski", flag: "🇵🇱" },');
  fs.writeFileSync(localeMetaPath, text);
}

const forbidden = ["Welcome back", "Log in", "Sign up", "Forgot password", "Latest News", "Live Support", "Responsible Gaming", "SEDLAR CASINO", "Script.Casino"];
const serialized = JSON.stringify(pl);
for (const phrase of forbidden) if (serialized.includes(phrase)) throw new Error(`Non-Polish phrase remains in Polish locale: ${phrase}`);

console.log("Applied safe complete Polish locale and localized static game UI without changing code identifiers.");
