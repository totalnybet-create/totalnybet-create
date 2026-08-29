import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const layoutPath = path.join(root, 'app/[locale]/layout.tsx');
const componentDir = path.join(root, 'components/analytics');
const componentPath = path.join(componentDir, 'VisitPing.tsx');
const sourcePath = '/tmp/VisitPing.tsx';

if (!fs.existsSync(layoutPath)) throw new Error('Locale layout not found');
if (!fs.existsSync(sourcePath)) throw new Error('VisitPing source not found');

fs.mkdirSync(componentDir, { recursive: true });
fs.copyFileSync(sourcePath, componentPath);

let layout = fs.readFileSync(layoutPath, 'utf8');

if (!layout.includes('from "@/components/analytics/VisitPing"')) {
  const anchor = 'import { PwaServiceWorkerRegister } from "@/components/pwa/PwaServiceWorkerRegister";';
  if (!layout.includes(anchor)) throw new Error('VisitPing import anchor not found');
  layout = layout.replace(anchor, `${anchor}\nimport { VisitPing } from "@/components/analytics/VisitPing";`);
}

if (!layout.includes('<VisitPing />')) {
  const anchor = '      <AppToaster />';
  if (!layout.includes(anchor)) throw new Error('VisitPing render anchor not found');
  layout = layout.replace(anchor, `      <VisitPing />\n${anchor}`);
}

fs.writeFileSync(layoutPath, layout);
console.log('Visit counter wired into locale layout.');
