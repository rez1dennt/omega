import {isolateYandexMap} from './map-fixture.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
const { chromium } = modules ? require(resolve(modules, 'playwright')) : require('playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const page = await browser.newPage();
await isolateYandexMap(page);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', request => errors.push(`Failed resource: ${request.url()}`));
const evidence = [];
const failures = [];
await mkdir('qa', { recursive: true });
try {
  for (const width of [1920, 1440, 1280, 1024, 926, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    if (await page.locator('#cookie-banner').isVisible()) {
      await page.locator('#cookie-banner [data-cookie-save]').click();
      await page.locator('#cookie-banner').waitFor({ state: 'hidden' });
    }
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
    if ([1440, 926, 390, 320].includes(width)) {
      await page.evaluate(() => document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-visible')));
      await page.screenshot({ path: `qa/final-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  }

  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('http://127.0.0.1:4173');
  const menu = page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await page.waitForFunction(() => document.querySelector('#main-nav').inert && !document.documentElement.classList.contains('scroll-locked'));
  assert.equal(await menu.evaluate(element => element === document.activeElement), true);
  await menu.click();
  const headerBefore = await page.locator('.site-header').boundingBox();
  await page.locator('#main-nav a[href="#contacts"]').click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('#contacts').evaluate(section => section.tagName), 'SECTION');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert.match(await page.locator('#contacts').textContent(), /6455054459/);
  assert.match(await page.locator('#contacts').textContent(), /1116455002916/);
  const headerDuring = await page.locator('.site-header').boundingBox();
  assert.equal(headerBefore.width, headerDuring.width);
  await page.waitForFunction(() => document.activeElement === document.querySelector('#contacts'));
  assert.equal(await page.locator('#contacts').evaluate(element => element === document.activeElement), true);

  assert.equal(await page.locator('#machines,[data-machine]').count(), 0, 'Brand section is removed');
  assert.equal(await page.locator('a[href="#machines"]').count(), 0, 'No navigation points to the removed section');
  await page.locator('#pitch-rod-diameter').fill('60');
  await page.locator('#pitch-panel-rod .pitch-find').click();
  await page.locator('#pitch-panel-rod .pitch-choice').first().click();
  await page.waitForFunction(() => document.querySelector('#selection-dialog').open);
  await page.locator('#order-form textarea').fill('Материал: сталь');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.documentElement.classList.contains('scroll-locked'));
  await page.locator('.delivery-terms').click();
  assert.equal(await page.locator('#delivery-details').evaluate(dialog => dialog.open), true);
  assert.match(await page.locator('#delivery-details').textContent(), /каждую среду/);
  await page.getByRole('button', { name: 'Закрыть условия доставки' }).click();
  await page.waitForFunction(() => !document.querySelector('#delivery-details').open);
  assert.equal(await page.locator('#delivery-details').evaluate(dialog => dialog.open), false);
  let outgoingSubmissions = 0;
  page.on('request', request => { if (request.method() !== 'GET') outgoingSubmissions++; });
  await page.locator('.hero-actions [data-dialog="request-dialog"]').click();
  assert.equal(await page.locator('#request-dialog').evaluate(dialog => dialog.open), true);
  assert.match(await page.locator('#request-parameters').inputValue(), /Материал: сталь/);
  await page.locator('#request-email').fill('test@example.com');
  await page.locator('#request-phone').fill('+7 (999) 123-45-67');
  await page.locator('#request-consent').check();
  // User prohibited submission/delivery testing. Validate UI only; never press send.
  assert.equal(await page.locator('#request-form').getAttribute('data-endpoint'), 'api/request.php');
  assert.doesNotMatch(await page.locator('#request-dialog').textContent(), /демонстрац/i);
  await page.getByRole('button', { name: 'Закрыть заявку' }).click();
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  assert.equal(outgoingSubmissions, 0);
  assert.doesNotMatch(await page.locator('body').textContent(), /metal-rez/i);

  const linkChecks = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.querySelector(link.getAttribute('href'))).map(link => link.getAttribute('href')));
  assert.deepEqual(linkChecks, []);
  assert.deepEqual(errors, []);
  await writeFile('qa/verification.json', JSON.stringify({ viewports: evidence, errors, failures, interactions: 'menu, Escape, permanent contacts anchor, delivery dialog, stable header, equipment cards, parameter preservation, request UI without submission, correct company identity: PASS; external map isolated and verified separately live' }, null, 2));
  assert.deepEqual(failures, []);
  console.log(`PASS: ${evidence.length} viewports; local assets, overflow, header, navigation, dialogs, equipment cards and request UI. No console errors or outgoing submissions. Delivery not tested.`);
} finally {
  await browser.close();
}
