import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
const { chromium } = modules ? require(resolve(modules, 'playwright')) : require('playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', request => errors.push(`Failed resource: ${request.url()}`));
const evidence = [];
const failures = [];
await mkdir('qa', { recursive: true });
try {
  for (const width of [1920, 1440, 1280, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      await Promise.all([...document.images].map(image => image.decode().catch(() => null)));
    });
    const result = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight,
      h1Count: document.querySelectorAll('h1').length,
      brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
      unloadedFonts: [...document.fonts].filter(font => font.status !== 'loaded').map(font => font.family),
      headerTop: document.querySelector('.site-header').getBoundingClientRect().top,
      contentOverflow: [...document.querySelectorAll('h1,h2,h3,p,a,input,select,textarea,button')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width && rect.right > document.documentElement.clientWidth + 1;
      }).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 55) })),
    }));
    evidence.push(result);
    if (result.scrollWidth > result.width || result.contentOverflow.length) failures.push(`${width}px: horizontal overflow ${result.scrollWidth}px ${JSON.stringify(result.contentOverflow)}`);
    if (result.brokenImages.length || result.unloadedFonts.length || result.h1Count !== 1 || result.headerTop !== 0) failures.push(`${width}px: resources or document structure failed`);
    if ([1440, 390, 320].includes(width)) await page.screenshot({ path: `qa/final-${width}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('http://127.0.0.1:4173');
  const menu = page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await menu.evaluate(element => element === document.activeElement), true);
  await menu.click();
  await page.locator('#main-nav a[href="#contacts"]').click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');

  await page.locator('[data-machine="PILOUS"]').click();
  assert.equal(await page.locator('textarea').inputValue(), 'Станок: PILOUS');
  await page.locator('textarea').fill('Станок: PILOUS\nМатериал: сталь');
  await page.locator('[data-machine="JET"]').click();
  assert.equal(await page.locator('textarea').inputValue(), 'Станок: JET\nМатериал: сталь');
  let outgoingSubmissions = 0;
  page.on('request', request => { if (request.method() !== 'GET') outgoingSubmissions++; });
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await page.getByRole('status').waitFor({ state: 'visible' });
  assert.match(await page.getByRole('status').textContent(), /Заявка не отправлена/);
  assert.equal(outgoingSubmissions, 0);

  const linkChecks = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.querySelector(link.getAttribute('href'))).map(link => link.getAttribute('href')));
  assert.deepEqual(linkChecks, []);
  assert.deepEqual(errors, []);
  await writeFile('qa/verification.json', JSON.stringify({ viewports: evidence, errors, failures, interactions: 'menu, Escape, menu anchors, machine selection, comment preservation, demo form without submission: PASS' }, null, 2));
  assert.deepEqual(failures, []);
  console.log(`PASS: ${evidence.length} viewports; local images/fonts, overflow, header, navigation, machine selection and demo form. No console errors or outgoing submissions.`);
} finally {
  await browser.close();
}
