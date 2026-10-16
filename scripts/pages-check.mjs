import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {isolateYandexMap} from './map-fixture.mjs';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
const {chromium} = modules ? require(resolve(modules, 'playwright')) : require('playwright');
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4174/omega/');
assert.ok(base.pathname.endsWith('/'), 'BASE_URL must end with /');
const browser = await chromium.launch({headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
const page = await browser.newPage();
const errors = [], resources = new Set(), evidence = [];
let blockedRequests = 0;
await page.route('**/*', route => {
  const request = route.request();
  // A deployment check must never send a lead or probe the mail endpoint.
  if (!['GET', 'HEAD'].includes(request.method()) || new URL(request.url()).pathname.includes('/api/')) {
    blockedRequests++;
    return route.abort();
  }
  return route.continue();
});
await isolateYandexMap(page);
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', request => {
  if (new URL(request.url()).origin === base.origin) errors.push(`Failed: ${request.url()}`);
});
page.on('response', response => {
  const url = new URL(response.url());
  if (url.origin !== base.origin) return;
  if (!url.pathname.startsWith(base.pathname)) errors.push(`Outside project path: ${url.pathname}`);
  if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${url.pathname}`);
  resources.add(url.pathname);
});

try {
  await mkdir('qa', {recursive: true});
  for (const route of ['', 'privacy/', 'consent/']) {
    for (const width of [1280, 768, 360, 320]) {
      await page.setViewportSize({width, height: 900});
      const response = await page.goto(new URL(route, base).href, {waitUntil: 'networkidle'});
      assert.equal(response.status(), 200, `${route || '/'}: site document must exist`);
      assert.equal(await page.locator('h1').count(), 1);
      assert.match(await page.title(), /Омега Комплект/);
      if (await page.locator('#cookie-banner').isVisible()) {
        await page.locator('#cookie-banner [data-cookie-save]').click();
        await page.locator('#cookie-banner').waitFor({state: 'hidden'});
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
        await Promise.all([...document.images].map(image => image.decode().catch(() => null)));
      });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
        headerTop: document.querySelector('.site-header').getBoundingClientRect().top,
        links: [...document.querySelectorAll('a[href]')].map(link => link.href),
      }));
      assert.equal(state.overflow, false, `${route} at ${width}px: no horizontal overflow`);
      assert.deepEqual(state.brokenImages, []);
      assert.equal(state.headerTop, 0);
      for (const link of state.links) {
        const url = new URL(link);
        if (url.origin === base.origin) assert.ok(url.pathname.startsWith(base.pathname), `Link escapes project: ${link}`);
      }
      if (!route) {
        assert.equal(await page.locator('#products').count(), 1, 'Actual website, not README');
        assert.equal(await page.locator('#pitch-guide').evaluate(el => el.classList.contains('is-ready')), true, 'ES modules loaded below project path');
      }
      if (width === 360) {
        await page.screenshot({path: `qa/pages-${route ? route.replace('/', '') : 'home'}-${width}.png`, animations: 'disabled'});
      }
      evidence.push({route: route || '/', width, status: response.status()});
    }
  }
  await page.goto(base.href, {waitUntil: 'networkidle'});
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('.hero [data-dialog="request-dialog"]').first().click();
  assert.equal(await page.locator('#request-dialog').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  await page.locator('#pitch-rod-diameter').fill('60');
  await page.locator('#pitch-panel-rod .pitch-find').click();
  assert.equal(await page.locator('#pitch-panel-rod .pitch-choice').count(), 3);
  assert.ok([...resources].some(path => path.endsWith('/scripts/pitch-data.js')), 'Imported module loaded');
  assert.ok([...resources].some(path => path.endsWith('/assets/fonts/golos-text-variable.ttf')), 'Local font loaded');
  assert.deepEqual(errors, []);
  assert.equal(blockedRequests, 0, 'No API requests, form submissions or email checks');
  await writeFile('qa/pages-verification.json', JSON.stringify({base: base.href, evidence, resources: [...resources], errors, blockedRequests}, null, 2));
  console.log(`PASS: ${evidence.length} route/viewport checks under ${base.pathname}; assets, imports, legal links, menu, modal and pitch guide. No submissions.`);
} finally {
  await browser.close();
}
