import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const shellRoot = path.join(root, 'app', '[locale]', '(shell)');
const homePath = path.join(shellRoot, 'page.tsx');
const royalArcPage = path.join(shellRoot, 'games', 'royal-arc', 'page.tsx');
const pokerPage = path.join(shellRoot, 'games', 'texas-holdem', 'page.tsx');
const roulettePage = path.join(shellRoot, 'games', 'roulette', 'page.tsx');

function writeRedirectIfPresent(filePath, destination, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Static game route not found: ${label} (${filePath})`);
    return;
  }
  fs.writeFileSync(
    filePath,
    `import { redirect } from 'next/navigation';\nexport default function GamePage() { redirect('${destination}'); }\n`,
  );
}

writeRedirectIfPresent(royalArcPage, '/royal-arc/index.html', 'Royal Arc');
writeRedirectIfPresent(pokerPage, '/poker/index.html', 'Poker');
writeRedirectIfPresent(roulettePage, '/roulette/index.html', 'Roulette');

if (fs.existsSync(homePath)) {
  let home = fs.readFileSync(homePath, 'utf8');
  home = home
    .replaceAll('href="/royal-arc/"', 'href="/royal-arc/index.html"')
    .replaceAll('href="/poker/"', 'href="/poker/index.html"')
    .replaceAll('href="/roulette/"', 'href="/roulette/index.html"');
  fs.writeFileSync(homePath, home);
}

console.log('Fixed all game launch routes to bypass locale middleware.');
