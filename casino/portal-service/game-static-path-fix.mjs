import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'app/[locale]/(shell)/page.tsx');
const royalPageDir = path.join(root, 'app/[locale]/games/royal-arc');
const royalPage = path.join(royalPageDir, 'page.tsx');
const pokerPage = path.join(root, 'app/[locale]/games/texas-holdem/page.tsx');
const roulettePage = path.join(root, 'app/[locale]/games/roulette/page.tsx');

// Royal Arc uses the shared CHIP wallet, so it must pass through an authenticated
// portal route before handing off to the static game bundle.
fs.mkdirSync(royalPageDir, { recursive: true });
fs.writeFileSync(
  royalPage,
  `import { redirect } from 'next/navigation';\nexport default function RoyalArcPage() { redirect('/royal-arc/index.html'); }\n`,
);

if (fs.existsSync(pokerPage)) {
  fs.writeFileSync(pokerPage, `import { redirect } from 'next/navigation';\nexport default function PokerPage() { redirect('/poker/index.html'); }\n`);
}

if (fs.existsSync(roulettePage)) {
  fs.writeFileSync(roulettePage, `import { redirect } from 'next/navigation';\nexport default function RoulettePage() { redirect('/roulette/index.html'); }\n`);
}

if (fs.existsSync(homePath)) {
  let home = fs.readFileSync(homePath, 'utf8');
  home = home
    .replaceAll('href="/royal-arc/"', 'href="/en/games/royal-arc"')
    .replaceAll('href="/poker/"', 'href="/poker/index.html"')
    .replaceAll('href="/roulette/"', 'href="/roulette/index.html"');
  fs.writeFileSync(homePath, home);
}

console.log('Fixed game launch paths; Royal Arc now passes through portal auth.');
