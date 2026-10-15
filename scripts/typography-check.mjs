import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.CODEX_NODE_MODULES, 'playwright'));
const browser = await chromium.launch({ headless: true, channel: 'msedge', ignoreDefaultArgs: ['--hide-scrollbars'] });
const page = await browser.newPage();
const failures = [];
const evidence = [];
const stage = process.env.TYPOGRAPHY_STAGE || 'after';
page.on('pageerror', error => failures.push(error.message));
await page.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
await mkdir('qa', { recursive: true });
try {
  await page.setViewportSize({ width: 899, height: 900 });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('.menu-toggle').click();
  await page.setViewportSize({ width: 900, height: 900 });
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true', 'menu remains open inside the same navigation layout');
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false', 'desktop navigation clears the mobile open state');
  for (const width of [1440, 1280, 1024, 900, 899, 768, 600, 599, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    if (await page.locator('#cookie-banner').isVisible()) {
      await page.locator('#cookie-banner [data-cookie-save]').click();
      await page.locator('#cookie-banner').waitFor({ state: 'hidden' });
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-visible'));
      document.querySelectorAll('img').forEach(el => { el.loading = 'eager'; });
      await Promise.all([...document.images].map(el => el.decode().catch(() => null)));
    });
    const result = await page.evaluate(() => {
      const size = selector => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
      const copies = [...document.querySelectorAll('.hero-description,.advantage p,.production-copy > p:not(.eyebrow),.order-copy > p:not(.eyebrow),.machines-copy > p,.machine-description > p,.delivery-copy > p:not(.eyebrow)')];
      const clipped = [...document.querySelectorAll('h1,h2,h3,.button,.machine')].filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && (el.scrollWidth > el.clientWidth + 2 || rect.right > document.documentElement.clientWidth + 1);
      }).map(el => ({ class: el.className, text: el.textContent.trim().slice(0, 60), width: el.clientWidth, scroll: el.scrollWidth }));
      const label = document.querySelector('.material-label').getBoundingClientRect();
      const materialOverlap = [...document.querySelectorAll('.hero-facts p')].some(el => {
        const fact = el.getBoundingClientRect();
        return fact.left < label.right && fact.right > label.left && fact.top < label.bottom && fact.bottom > label.top;
      });
      return { width: innerWidth, font: getComputedStyle(document.body).fontFamily,
        bodyMin: Math.min(...copies.map(el => parseFloat(getComputedStyle(el).fontSize))),
        field: size('.order-form input[name=width]'), button: size('.hero-actions .button'),
        h1: size('.hero h1'), h2: size('.section-heading h2'),
        scrollWidth: document.documentElement.scrollWidth, clipped, materialOverlap };
    });
    evidence.push(result);
    if (result.bodyMin < 16) failures.push(`${width}: body text ${result.bodyMin}px < 16px`);
    if (result.field < 16) failures.push(`${width}: form text ${result.field}px < 16px`);
    if (result.button < 15) failures.push(`${width}: button text ${result.button}px < 15px`);
    if (!result.font.includes('Golos Text')) failures.push(`${width}: Golos Text is not active`);
    if (result.clipped.length || result.scrollWidth > width) failures.push(`${width}: clipped text ${JSON.stringify(result.clipped)}`);
    if (result.materialOverlap) failures.push(`${width}: materials card overlaps manufacturing-time facts`);
    if ([1440, 768, 360, 320].includes(width)) await page.screenshot({ path: `qa/type-${stage}-${width}.png`, fullPage: true, animations: 'disabled' });
  }
  for (const width of [1280, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.locator('.hero-actions [data-dialog="request-dialog"]').click();
    await page.waitForFunction(() => document.querySelector('#request-dialog').getAnimations().every(animation => animation.playState !== 'running'));
    await page.evaluate(() => document.fonts.ready);
    const modal = await page.locator('#request-dialog').evaluate(el => ({
      width: el.clientWidth, scroll: el.scrollWidth,
      field: parseFloat(getComputedStyle(el.querySelector('#request-phone')).fontSize),
      label: parseFloat(getComputedStyle(el.querySelector('.request-field label')).fontSize),
      consent: parseFloat(getComputedStyle(el.querySelector('.request-consent')).fontSize),
      formScrollable: el.querySelector('form').scrollHeight >= el.querySelector('form').clientHeight,
    }));
    evidence.push({ modal: width, ...modal });
    if (modal.field < 16 || modal.label < 14 || modal.consent < 13 || modal.scroll > modal.width + 1) failures.push(`${width}: modal text or overflow ${JSON.stringify(modal)}`);
    await page.screenshot({ path: `qa/type-${stage}-modal-${width}.png`, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  }
  await writeFile(`qa/type-${stage}.json`, JSON.stringify({ evidence, failures }, null, 2));
  assert.deepEqual(failures, []);
  console.log(`PASS: 11 typography widths and 4 modal widths; readable copy, controls and unclipped text. No submissions.`);
} finally {
  await browser.close();
}
