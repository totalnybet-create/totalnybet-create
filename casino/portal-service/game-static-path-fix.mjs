import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const homePath = path.join(root, 'app/[locale]/(shell)/page.tsx');
const pokerPage = path.join(root, 'app/[locale]/games/texas-holdem/page.tsx');
const roulettePage = path.join(root, 'app/[locale]/games/roulette/page.tsx');

// Royal Arc already has an authenticated locale-aware route created by
// portal-polish-overlay.mjs at app/[locale]/(shell)/games/royal-arc/page.tsx.
// Keep that route as the single source of truth and route the lobby through
// the portal's locale-aware Link + ROUTES.crash mapping.
if (fs.existsSync(pokerPage)) {
  fs.writeFileSync(pokerPage, `import { redirect } from 'next/navigation';\nexport default function PokerPage() { redirect('/poker/index.html'); }\n`);
}

if (fs.existsSync(roulettePage)) {
  fs.writeFileSync(roulettePage, `import { redirect } from 'next/navigation';\nexport default function RoulettePage() { redirect('/roulette/index.html'); }\n`);
}

if (fs.existsSync(homePath)) {
  let home = fs.readFileSync(homePath, 'utf8');

  const royalOpen = '<a href="/royal-arc/" className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1">';
  const royalLinkOpen = '<Link href={ROUTES.crash} className="dashboard-card group p-5 sm:p-6 transition-transform hover:-translate-y-1">';
  if (!home.includes(royalOpen)) throw new Error('Royal Arc lobby card anchor not found');
  const royalStart = home.indexOf(royalOpen);
  home = home.slice(0, royalStart) + royalLinkOpen + home.slice(royalStart + royalOpen.length);
  const royalClose = home.indexOf('</a>', royalStart + royalLinkOpen.length);
  if (royalClose === -1) throw new Error('Royal Arc lobby card closing anchor not found');
  home = home.slice(0, royalClose) + '</Link>' + home.slice(royalClose + 4);

  home = home
    .replaceAll('href="/poker/"', 'href="/poker/index.html"')
    .replaceAll('href="/roulette/"', 'href="/roulette/index.html"');
  fs.writeFileSync(homePath, home);
}

console.log('Fixed game launch paths; Royal Arc uses the existing locale-aware authenticated portal route.');
