import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const url = process.env.SLOT_URL || 'http://127.0.0.1:4173/';
await fs.mkdir('qa-artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function run(name, viewport) {
  const page = await browser.newPage({ viewportSize: viewport });
  page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name} console: ${m.text()}`); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.portalPhoto');
  await page.waitForSelector('#spin');
  const count = await page.locator('.symbol').count();
  if (count !== 15) throw new Error(`${name}: expected 15 symbols, got ${count}`);
  const before = await page.locator('#balance').innerText();
  await page.locator('#spin').click();
  await page.waitForTimeout(1000);
  const after = await page.locator('#balance').innerText();
  if (before === after) throw new Error(`${name}: balance did not change after spin`);
  await page.screenshot({ path: `qa-artifacts/${name}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 2 || document.documentElement.scrollWidth > innerWidth + 2);
  if (overflow) throw new Error(`${name}: viewport overflow detected`);
  await page.close();
}

await run('mobile-390x844', { width: 390, height: 844 });
await run('desktop-1280x800', { width: 1280, height: 800 });
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log('Legnica V3 browser smoke OK');
