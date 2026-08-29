import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function patch(rel, pairs) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) text = text.replaceAll(from, to);
  fs.writeFileSync(file, text);
}

patch("components/layout/Sidebar.tsx", [
  ['{showUserCard ? "Navigate" : "Account"}', '{showUserCard ? "Nawigacja" : "Konto"}'],
  ['aria-label="Main"', 'aria-label="Główne"'],
  ['>\n          Discover\n        </p>', '>\n          Odkrywaj\n        </p>'],
  ['<span>Discover</span>', '<span>Odkrywaj</span>'],
  ['aria-label="Information"', 'aria-label="Informacje"'],
]);

patch("components/layout/MobileDrawer.tsx", [
  ['aria-label="Open menu"', 'aria-label="Otwórz menu"'],
  ['<SheetTitle className="sr-only">Navigation</SheetTitle>', '<SheetTitle className="sr-only">Nawigacja</SheetTitle>'],
  ['Main menu with links to games, profile, deposits and support.', 'Menu główne z odnośnikami do gier, profilu, salda i pomocy.'],
]);

patch("components/layout/Topbar.tsx", [
  ['aria-label="Support"', 'aria-label="Pomoc"'],
  ['user.name || user.username || "Player"', 'user.name || user.username || "Gracz"'],
  ['aria-label="Top"', 'aria-label="Górne menu"'],
]);

patch("app/layout.tsx", [
  ['"social casino"', '"kasyno społecznościowe"'],
  ['"play money casino"', '"kasyno play-money"'],
  ['"virtual chips"', '"wirtualne żetony"'],
  ['locale: "en_US"', 'locale: "pl_PL"'],
]);

patch("lib/publisher.ts", [
  ['PERSONE ROYALE CASINO — play-money social casino with virtual chips only.', 'PERSONE ROYALE CASINO — kasyno społecznościowe play-money z wirtualnymi żetonami.'],
  ['PERSONE ROYALE CASINO — turnkey casino scripts, crash game script source code, and crypto casino platforms.', 'PERSONE ROYALE CASINO — kasyno społecznościowe play-money z wirtualnymi żetonami.'],
]);

// Catch exact remaining UI/a11y/metadata English that should never ship in the Polish-only build.
const checks = [
  ["components/layout/Sidebar.tsx", ['"Account"', '>Discover<', 'aria-label="Main"', 'aria-label="Information"']],
  ["components/layout/MobileDrawer.tsx", ['aria-label="Open menu"', '>Navigation<', 'Main menu with links']],
  ["components/layout/Topbar.tsx", ['aria-label="Support"', 'aria-label="Top"', '|| "Player"']],
  ["app/layout.tsx", ['"social casino"', '"play money casino"', '"virtual chips"', 'locale: "en_US"']],
  ["lib/publisher.ts", ['turnkey casino scripts', 'social casino with virtual chips only']],
];
for (const [rel, forbidden] of checks) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const phrase of forbidden) {
    if (text.includes(phrase)) throw new Error(`English copy remains in ${rel}: ${phrase}`);
  }
}

console.log("Finished Polish accessibility labels, navigation copy, SEO, OpenGraph and structured metadata.");
