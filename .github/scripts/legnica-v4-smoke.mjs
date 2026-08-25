import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const url = process.env.SLOT_URL || 'http://127.0.0.1:4173/';
await fs.mkdir('qa-artifacts-v4', { recursive: true });
const browser = await chromium.launch({ headless: true });

async function run(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#reels .cell');
  const cells = await page.locator('#reels .cell').count();
  if (cells !== 15) throw new Error(`${name}: expected 15 cells, got ${cells}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 2 || document.documentElement.scrollWidth > innerWidth + 2);
  if (overflow) throw new Error(`${name}: viewport overflow`);
  const before = await page.locator('#balance').innerText();
  await page.click('#spin');
  await page.waitForTimeout(1200);
  const after = await page.locator('#balance').innerText();
  if (before === after) throw new Error(`${name}: spin did not change balance`);
  if (errors.length) throw new Error(`${name}: ${errors.join(' | ')}`);
  await page.screenshot({ path: `qa-artifacts-v4/${name}.png`, fullPage: true });
  await page.close();
}

await run('mobile-390x844', 390, 844);
await run('desktop-1280x800', 1280, 800);
await browser.close();
console.log('Legnica V4 cabinet browser QA OK');
