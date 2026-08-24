import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = process.env.SLOT_URL || 'http://127.0.0.1:4173/';
const outDir = 'qa-artifacts';
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { baseURL, runs: [], startedAt: new Date().toISOString() };

async function runViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const requestFailures = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`[browser:${name}:console] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    const text = String(err?.stack || err);
    consoleErrors.push(text);
    console.error(`[browser:${name}:pageerror] ${text}`);
  });
  page.on('requestfailed', (req) => {
    const item = { url: req.url(), error: req.failure()?.errorText || 'failed' };
    requestFailures.push(item);
    console.error(`[browser:${name}:requestfailed] ${JSON.stringify(item)}`);
  });

  console.log(`[qa:${name}] navigation`);
  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('#spin', { state: 'visible', timeout: 20_000 });
  await page.waitForSelector('.loading-screen.done', { timeout: 25_000 });
  await page.waitForSelector('#canvas-host canvas', { timeout: 20_000 });

  const before = await page.evaluate(() => ({
    title: document.title,
    status: document.querySelector('#status')?.textContent?.trim(),
    balance: document.querySelector('#balance')?.textContent?.trim(),
    win: document.querySelector('#win')?.textContent?.trim(),
    innerWidth,
    innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    canvas: document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
    machine: document.querySelector('.machine-shell')?.getBoundingClientRect().toJSON(),
    controls: document.querySelector('.control-deck')?.getBoundingClientRect().toJSON(),
    loadingDone: document.querySelector('#loading-screen')?.classList.contains('done') || false
  }));

  if (!before.loadingDone) throw new Error(`${name}: loading screen did not complete`);
  if (!before.canvas || before.canvas.width < 100 || before.canvas.height < 100) throw new Error(`${name}: canvas is not rendered`);
  if (before.scrollWidth > before.innerWidth + 2) throw new Error(`${name}: horizontal overflow ${before.scrollWidth} > ${before.innerWidth}`);
  console.log(`[qa:${name}] ready canvas=${Math.round(before.canvas.width)}x${Math.round(before.canvas.height)}`);
  await page.screenshot({ path: `${outDir}/${name}-ready.png`, fullPage: true });

  await page.locator('#spin').click();
  await page.waitForFunction(() => document.querySelector('#spin')?.disabled === true, null, { timeout: 3_000 });
  try {
    await page.waitForFunction(() => document.querySelector('#spin')?.disabled === false, null, { timeout: 8_000 });
  } catch (error) {
    await page.screenshot({ path: `${outDir}/${name}-spin-stuck.png`, fullPage: true });
    const debug = await page.evaluate(() => ({
      status: document.querySelector('#status')?.textContent?.trim(),
      balance: document.querySelector('#balance')?.textContent?.trim(),
      win: document.querySelector('#win')?.textContent?.trim(),
      spinDisabled: document.querySelector('#spin')?.disabled,
      loadingDone: document.querySelector('#loading-screen')?.classList.contains('done') || false
    }));
    console.error(`[browser:${name}:spin-stuck] ${JSON.stringify({ debug, consoleErrors, requestFailures })}`);
    throw error;
  }
  console.log(`[qa:${name}] normal-spin complete`);

  const afterSpin = await page.evaluate(() => ({
    status: document.querySelector('#status')?.textContent?.trim(),
    balance: document.querySelector('#balance')?.textContent?.trim(),
    win: document.querySelector('#win')?.textContent?.trim()
  }));
  await page.screenshot({ path: `${outDir}/${name}-after-spin.png`, fullPage: true });

  await page.locator('#turbo').click();
  if ((await page.locator('#turbo').getAttribute('aria-pressed')) !== 'true') throw new Error(`${name}: turbo toggle failed`);
  for (let i = 0; i < 3; i += 1) {
    await page.locator('#spin').click();
    await page.waitForFunction(() => document.querySelector('#spin')?.disabled === true, null, { timeout: 3_000 });
    await page.waitForFunction(() => document.querySelector('#spin')?.disabled === false, null, { timeout: 6_000 });
    console.log(`[qa:${name}] turbo-spin ${i + 1}/3 complete`);
  }

  const fps = await page.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const watchdog = setTimeout(() => finish(null), 3000);
    function tick(now) {
      if (settled) return;
      frames += 1;
      if (now - start >= 1200) {
        clearTimeout(watchdog);
        finish(Math.round((frames * 1000 / (now - start)) * 10) / 10);
      } else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }));
  console.log(`[qa:${name}] fps=${fps ?? 'unavailable-headless'}`);

  const hardFailures = requestFailures.filter((f) => !f.url.includes('favicon'));
  if (consoleErrors.length) throw new Error(`${name}: console errors: ${consoleErrors.join(' | ')}`);
  if (hardFailures.length) throw new Error(`${name}: request failures: ${JSON.stringify(hardFailures)}`);

  const record = { name, httpStatus: response?.status() || null, before, afterSpin, fps, consoleErrors, requestFailures };
  report.runs.push(record);
  await page.close();
}

try {
  await runViewport('mobile-390x844', { width: 390, height: 844 });
  await runViewport('desktop-1366x768', { width: 1366, height: 768 });
  report.ok = true;
} catch (error) {
  report.ok = false;
  report.error = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
