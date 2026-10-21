import assert from 'node:assert/strict';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { prepareFixture, syncTheme, runPHP, baseURL, qaRoot } from './wordpress-fixture.mjs';

const themeRoot = fileURLToPath(new URL('../wordpress/omega-komplekt/', import.meta.url));
for (const file of ['style.css', 'index.php', 'functions.php']) {
  await assert.doesNotReject(access(`${themeRoot}/${file}`), `Installable WordPress theme must contain ${file}`);
}
console.log('PASS installable WordPress theme source exists');

if (process.argv.includes('--source-only')) process.exit(0);

const install = await prepareFixture();
assert.equal(install.installed, true, 'Real WordPress must be installed');
assert.equal(install.mailBlocked, true, 'Disposable WordPress must block wp_mail');
const installedTheme = await syncTheme();
runPHP('remove-legal-pages');
runPHP('pretty');
runPHP('reset-front');
const beforeActivation = runPHP('content-snapshot');
const activation = runPHP('activate');
assert.equal(activation.valid, true, 'WordPress core must validate and activate the theme');
assert.equal(activation.postsUnchanged, true, 'Activation must not create/edit content');
const helpers = runPHP('contracts');
const screenshot = installedTheme.kind === 'zip' ? runPHP('screenshot') : undefined;
assert.deepEqual(runPHP('content-snapshot'), beforeActivation, 'Activation and a fresh theme bootstrap must not edit content or unrelated options');
console.log(`PASS real WordPress ${install.version} activation and subdirectory helper contracts`);

async function checkVirtualDocumentRouting() {
  try {
    for (const front of ['posts', 'page']) {
      if (front === 'page') runPHP('static-front');
      for (const prefix of ['', 'qa-generic/']) for (const slug of ['privacy', 'consent']) {
        const response = await fetch(new URL(`${prefix}?omega_document=${slug}`, baseURL));
        const html = await response.text();
        assert.equal(response.status, 200, 'Legal query route must work with either front page mode');
        const title = slug === 'privacy' ? 'Политика обработки персональных данных' : 'Согласие на обработку персональных данных';
        assert.ok(html.includes(`<h1>${title}</h1>`), `${front}: ${prefix || '/'}?omega_document=${slug} must show the legal document heading, not the native Page content`);
        assert.equal(html.includes('QA_STATIC_FRONT_CONTENT_MARKER'), false, 'Legal query must not leak static front Page content');
        assert.equal(html.includes('Штатный контент страницы WordPress.'), false, 'Legal query must not leak the ordinary Page content');
        const canonicals = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) || [];
        assert.equal(canonicals.length, 1, 'Virtual document has exactly one canonical link');
        const href = canonicals[0].match(/\bhref=["']([^"']+)/i)?.[1];
        assert.equal(href, new URL(`?omega_document=${slug}`, baseURL).href, 'Canonical uses the root document URL, independent of the underlying Page');
      }
    }
    for (const query of ['?omega_document=unknown', '?omega_document%5B%5D=privacy']) {
      const response = await fetch(new URL(query, baseURL));
      assert.equal(response.status, 404, 'Unknown or malformed document selectors are bounded to a 404');
      await response.arrayBuffer();
    }
    console.log('PASS legal query routing/canonicals for posts/static front and ordinary pages; malformed queries return 404');
  } finally { runPHP('reset-front'); }
}
await checkVirtualDocumentRouting();
if (process.argv.includes('--routing-regression')) process.exit(0);

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES || 'C:/Users/bahti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(resolve(modules, 'playwright'));
const base = new URL(baseURL);
let serverResponse;
try { serverResponse = await fetch(base); } catch { throw new Error('Start the QA server first: node scripts/wordpress-fixture.mjs serve'); }
assert.ok(serverResponse.status < 500, 'Real WordPress server must respond');
await serverResponse.arrayBuffer();
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const errors = [], resources = new Set(), evidence = [], blocked = [];
const guardRequest = async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (!['GET', 'HEAD'].includes(request.method()) || /\/(?:api|wp-json)\//.test(url.pathname)) {
    blocked.push({ method: request.method(), url: request.url() });
    return route.abort();
  }
  // External widgets/avatars are outside this local rendering contract; never contact them.
  if (url.origin !== base.origin) return route.fulfill({ status: 200, contentType: request.resourceType() === 'document' ? 'text/html' : 'text/plain', body: '' });
  return route.continue();
};
await context.route('**/*', guardRequest);
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text());
});
page.on('requestfailed', request => {
  if (new URL(request.url()).origin === base.origin) errors.push(`Failed local asset: ${request.url()}`);
});
page.on('response', response => {
  const url = new URL(response.url());
  if (url.origin !== base.origin) return;
  if (!url.pathname.startsWith(base.pathname)) errors.push(`Asset escaped subdirectory: ${url.pathname}`);
  if (response.request().resourceType() !== 'document' && response.status() >= 400) errors.push(`HTTP ${response.status()} asset: ${url.pathname}`);
  resources.add(url.pathname);
});

async function dismissCookies() {
  if (await page.locator('#cookie-banner').isVisible()) {
    await page.locator('#cookie-banner [data-cookie-save]').first().click();
    await page.locator('#cookie-banner').waitFor({ state: 'hidden' });
  }
}

async function checkClientRevisions() {
  await page.setViewportSize({width:1280,height:900});
  await page.goto(base.href, { waitUntil: 'networkidle' });
  await dismissCookies();
  assert.match(await page.locator('.hero-description').textContent(), /для резки металла\./);
  assert.doesNotMatch(await page.locator('.hero-description').textContent(), /алюмини|других материалов/);
  assert.equal(await page.locator('.hero-actions [data-dialog="request-dialog"]').count(), 1);
  assert.equal(await page.locator('.hero-actions [data-dialog="selection-dialog"]').count(), 1);
  assert.equal(await page.locator('.learn-link').getAttribute('href'), '#order');
  assert.match(await page.locator('.material-label').textContent(), /Пилы и станки/);
  assert.match(await page.locator('.production-media img').getAttribute('alt'), /IDEAL/);
  const magnetic = page.locator('[data-request-equipment*="LENZ Steyr-35"]');
  assert.equal(await magnetic.count(), 1, 'One magnetic drilling product with its own request context');
  await magnetic.click();
  assert.match(await page.locator('.request-brand').ariaSnapshot(), /О\s*МЕГА\s+КОМПЛЕКТ/, 'Request wordmark retains the first letter for screen readers');
  assert.match(await page.locator('#request-parameters').inputValue(), /LENZ Steyr-35/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  for (const [width,height] of [[1280,900],[768,900],[360,740],[320,568],[844,390]]) {
    await page.setViewportSize({width,height});
    const opener = page.locator('.hero-actions [data-dialog="selection-dialog"]');
    await opener.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await opener.click();
    const dialog = page.locator('#selection-dialog');
    await page.waitForFunction(() => document.querySelector('#selection-dialog').open);
    assert.match(await dialog.locator('#selection-title').textContent(), /Подобрать полотно/, 'Selection view model renders its heading');
    assert.match(await dialog.locator('.selection-guide > summary').textContent(), /Таблица подбора шага зуба/, 'Selection guide has its visible label');
    assert.equal(await dialog.locator('#order-form').count(), 1, 'Shared blade form lives inside selection');
    assert.equal(await page.locator('#order-form').count(), 1, 'No duplicate form identifiers');
    assert.equal(await dialog.locator('#order-email').isVisible(), true);
    await dialog.locator('#order-comment').fill('QA preserved selection comment');
    const tableDetails = dialog.locator('details').filter({has: page.locator('#pitch-tab-rod')}).first();
    await tableDetails.evaluate(element => { element.open = true; });
    await dialog.locator('#pitch-tab-rod').click();
    await dialog.locator('#pitch-rod-diameter').fill('60');
    await dialog.locator('#pitch-panel-rod .pitch-find').click();
    await dialog.locator('#pitch-panel-rod .pitch-choice').filter({hasText:'5/8'}).click();
    assert.equal(await dialog.locator('[name="tpi"]').inputValue(), '5/8 TPI');
    assert.match(await dialog.locator('#order-comment').inputValue(), /QA preserved selection comment/);
    assert.match(await dialog.locator('#order-comment').inputValue(), /Пруток.*60.*5\/8/);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), 'hidden');
    const geometry = await dialog.boundingBox();
    assert.ok(geometry.y >= -1 && geometry.y + geometry.height <= height + 1, `${width}x${height}: selection fits viewport`);
    assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'Selection has no horizontal overflow');
    await page.screenshot({path:resolve(qaRoot,`selection-${width}-${height}.png`),animations:'disabled'});
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.documentElement.classList.contains('scroll-locked'));
    assert.equal(await page.locator('#order #order-form').count(), 1, 'Form returns to inline section');
    assert.equal(await page.locator('#pitch-guide .pitch-card').count(), 1, 'Guide returns to standalone section');
    assert.ok(Math.abs(await page.evaluate(() => scrollY)-before) <= 1, 'Selection restores page position');
    assert.equal(await opener.evaluate(el => document.activeElement === el), true, 'Selection returns focus to opener');
  }
  console.log('PASS client revisions: hero, IDEAL, magnetic request, shared selection guide/TPI, drafts, scroll/focus at five viewport sizes; no submissions');
}

async function checkDelayedPitchModule() {
  let releaseModule;
  const gate = new Promise(resolve => { releaseModule = resolve; });
  const handler = async route => { await gate; await route.continue(); };
  await page.route('**/scripts/pitch-guide.js*', handler);
  try {
    await page.goto(base.href, {waitUntil:'commit'});
    // Core may queue footer classic scripts behind a deferred module. Exercise early
    // selection when available, otherwise release the module before the queued UI.
    const early = await page.waitForFunction(() => document.querySelectorAll('.selection-placeholder').length === 3, null, {timeout:1500}).then(() => true, () => false);
    if (early) {
      await page.locator('.hero-actions [data-dialog="selection-dialog"]').click();
      assert.equal(await page.locator('#selection-dialog .pitch-card').count(), 1);
    }
    releaseModule();
    await page.waitForLoadState('domcontentloaded');
    if (!early) await page.locator('.hero-actions [data-dialog="selection-dialog"]').click();
    await page.waitForFunction(() => document.querySelector('#pitch-guide').classList.contains('is-ready'));
    const dialog = page.locator('#selection-dialog');
    await dialog.locator('.selection-guide').evaluate(el => {el.open=true;});
    await dialog.locator('#pitch-tab-pipe').click();
    await dialog.locator('#pitch-pipe-diameter').fill('100');
    await dialog.locator('#pitch-pipe-wall').fill('4');
    await dialog.locator('#pitch-panel-pipe .pitch-find').click();
    await dialog.locator('#pitch-panel-pipe .pitch-choice').click();
    assert.equal(await dialog.locator('[name="tpi"]').inputValue(), '6/10 TPI', 'Delayed module initializes guide moved into selection');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.documentElement.classList.contains('scroll-locked'));
    console.log(`PASS delayed WordPress pitch module (${early ? 'early selection' : 'core deferred queue'}): pipe lookup and TPI transfer; no submissions`);
  } finally {
    releaseModule();
    await page.unroute('**/scripts/pitch-guide.js*', handler);
  }
}

async function checkNoJSForms() {
  const noJSContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  await noJSContext.route('**/*', guardRequest);
  const noJS = await noJSContext.newPage();
  try {
    await noJS.goto(base.href, { waitUntil: 'networkidle' });
    for (const id of ['order-form', 'request-form']) assert.equal(await noJS.locator(`#${id} button[type="submit"]`).isDisabled(), true, `${id}: submit must start disabled without JavaScript to prevent native GET/history leakage`);
  } finally { await noJSContext.close(); }
}

if (process.argv.includes('--client-regression')) {
  try { await checkClientRevisions(); }
  finally { await browser.close(); }
  process.exit(0);
}

if (process.argv.includes('--delayed-pitch-regression')) {
  try { await checkDelayedPitchModule(); }
  finally { await browser.close(); }
  process.exit(0);
}

if (process.argv.includes('--nojs-regression')) {
  try { await checkNoJSForms(); console.log('PASS no-JS form submit starts disabled; no submission performed'); }
  finally { await browser.close(); }
  process.exit(0);
}

async function renderRoute(route, width, expectedStatus, kind) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
  assert.equal(response.status(), expectedStatus, `${kind}/${width}: HTTP status`);
  assert.equal(await page.locator('h1').count(), 1, `${kind}/${width}: one primary heading`);
  await dismissCookies();
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await Promise.all([...document.images].map(image => image.decode().catch(() => null)));
  });
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    broken: [...document.images].filter(image => new URL(image.src).origin === location.origin && (!image.complete || !image.naturalWidth)).map(image => image.src),
    header: document.querySelector('.site-header')?.getBoundingClientRect().toJSON(),
    links: [...document.querySelectorAll('a[href]')].map(link => link.href),
  }));
  assert.equal(state.overflow, false, `${kind}/${width}: no horizontal overflow`);
  assert.deepEqual(state.broken, [], `${kind}/${width}: local images decode`);
  assert.ok(state.header, `${kind}/${width}: shared theme header`);
  for (const href of state.links) {
    const url = new URL(href);
    if (url.origin === base.origin) assert.ok(url.pathname.startsWith(base.pathname), `Internal link escaped subdirectory: ${href}`);
  }
  if (kind.startsWith('home')) {
    assert.equal(await page.locator('#products').count(), 1, 'Migrated home sections are rendered');
    await page.waitForFunction(() => document.querySelector('#pitch-guide')?.classList.contains('is-ready'));
    assert.match(await page.locator('body').innerText(), /Омега Комплект/);
    assert.ok(await page.locator('a[href="tel:+79172012100"]').count() > 0, 'Public primary telephone preserved');
  }
  if (kind === 'page') assert.match(await page.locator('main').innerText(), /Штатный контент страницы WordPress/);
  if (width === 360 || (width === 1280 && kind === 'home')) await page.screenshot({ path: resolve(qaRoot, `${kind}-${width}.png`), animations: 'disabled' });
  evidence.push({ kind, route, width, status: response.status() });
}

try {
  await mkdir(qaRoot, { recursive: true });
  await checkNoJSForms();
  const routes = [['', 200, 'home'], ['?omega_document=privacy', 200, 'privacy'], ['?omega_document=consent', 200, 'consent'], ['qa-generic/', 200, 'page'], ['qa-missing-page/', 404, '404']];
  for (const [route, status, kind] of routes) for (const width of [1280, 768, 360, 320]) await renderRoute(route, width, status, kind);
  for (const [route, kind] of [['qa-entry/', 'single'], ['?cat=1', 'archive'], ['?s=WordPress', 'search']]) {
    for (const width of [1280, 320]) await renderRoute(route, width, 200, kind);
  }

  await checkClientRevisions();
  await checkDelayedPitchModule();

  // Only local field validation: no submit event and no final valid form.
  await page.goto(base.href, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 360, height: 900 });
  assert.equal(await page.evaluate(() => window.OmegaTheme?.request?.endpoint), '', 'Default transport endpoint is explicitly disabled');
  await page.locator('#order-email').fill('invalid');
  await page.locator('#order-phone').focus();
  assert.equal(await page.locator('#order-email').getAttribute('aria-invalid'), 'true');
  assert.match(await page.locator('#order-email-error').textContent(), /name@example.ru/);
  await page.locator('#order-phone').fill('8 (999) 123-45-67');
  assert.equal(await page.locator('#order-phone').inputValue(), '+7 (999) 123-45-67');
  assert.equal(await page.locator('#order-consent').isChecked(), false);

  await page.evaluate(() => scrollTo({ top: 500, behavior: 'instant' }));
  const before = await page.evaluate(() => ({ y: scrollY, header: document.querySelector('.site-header').getBoundingClientRect().toJSON() }));
  await page.locator('.menu-toggle').click();
  await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflow), 'hidden');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.documentElement.classList.contains('scroll-locked'));
  assert.ok(Math.abs((await page.evaluate(() => scrollY)) - before.y) <= 1, 'Menu preserves scroll');
  await page.locator('.menu-toggle').click();
  await page.locator('#main-nav [data-dialog="request-dialog"]').click();
  await page.waitForFunction(() => document.querySelector('#request-dialog').open);
  const bounds = await page.locator('#request-dialog').boundingBox();
  assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 901, 'Request dialog fits phone viewport');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  await page.locator('#order-width').fill('27');
  await page.locator('#order-comment').fill('QA local context only');
  await page.locator('[data-request-equipment="Автоматический ленточнопильный станок"]').click();
  await page.waitForFunction(() => document.querySelector('#request-dialog').open);
  assert.match(await page.locator('#request-title').textContent(), /Подбор станка/);
  assert.match(await page.locator('#request-parameters').inputValue(), /Автоматический/);
  assert.doesNotMatch(await page.locator('#request-parameters').inputValue(), /Ширина полотна/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  assert.equal(await page.locator('.equipment-rollers [data-request-equipment]').count(), 0);
  assert.match(await page.locator('.equipment-rollers').innerText(), /Неприводные рольганги[\s\S]*Производство — Россия/);
  await page.locator('[data-request-equipment="Магнитный сверлильный станок LENZ Steyr-35"]').click();
  await page.waitForFunction(() => document.querySelector('#request-dialog').open);
  assert.match(await page.locator('#request-title').textContent(), /Подбор станка/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  await page.locator('.cookie-reopen').click();
  await page.waitForFunction(() => document.querySelector('#cookie-settings').open);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  await page.locator('#pitch-rod-diameter').fill('60');
  await page.locator('#pitch-panel-rod .pitch-find').click();
  assert.equal(await page.locator('#pitch-panel-rod .pitch-choice').count(), 3, 'Imported TPI data works through WordPress module URLs');
  await page.locator('#pitch-tab-pipe').click();
  await page.locator('#pitch-pipe-diameter').fill('90');
  await page.locator('#pitch-pipe-wall').fill('4');
  await page.locator('#pitch-panel-pipe .pitch-find').click();
  assert.match(await page.locator('#pitch-panel-pipe .pitch-status').innerText(), /LENOX/);
  assert.equal(await page.locator('#pitch-panel-pipe .pitch-choice strong').innerText(), '6/10');
  await page.locator('#pitch-pipe-wall').fill('2');
  await page.locator('#pitch-panel-pipe .pitch-find').click();
  await page.locator('#pitch-panel-pipe .pitch-choice').click();
  assert.equal(await page.locator('#order-form [name="tpi"]').inputValue(), '10/14 TPI');
  assert.match(await page.locator('#order-comment').inputValue(), /Труба Ø 90 мм, стенка 2 мм; диаграмма LENOX/);
  assert.equal(await page.locator('.pitch-bahco-table tbody td').count(), 350);

  const legalPages = runPHP('legal-pages');
  runPHP('contracts');
  for (const slug of ['privacy', 'consent']) {
    await renderRoute(`${slug}/`, 360, 200, `${slug}-native`);
    assert.match(await page.locator('main').innerText(), /Native legal page content/, 'Published native legal content is preserved');
  }
  runPHP('plain');
  const plainHelpers = runPHP('contracts');
  assert.ok(plainHelpers.privacy.includes(`page_id=${legalPages.privacy}`), 'Plain permalink uses published page ID');
  await renderRoute(`?page_id=${legalPages.privacy}`, 320, 200, 'privacy-plain');
  runPHP('remove-legal-pages');
  runPHP('contracts');
  await renderRoute('?omega_document=privacy', 320, 200, 'privacy-plain-fallback');
  runPHP('pretty');

  // Authenticate by a local generated core cookie, never a login POST; keep it in memory.
  const auth = runPHP('auth');
  await context.addCookies([{ name: auth.name, value: auth.value, url: auth.url }]);
  for (const width of [1280, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base.href, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#wpadminbar').count(), 1, 'wp_footer renders the real WordPress admin bar');
    const geometry = await page.evaluate(() => ({ header: document.querySelector('.site-header').getBoundingClientRect().toJSON(), bar: document.querySelector('#wpadminbar').getBoundingClientRect().toJSON() }));
    assert.ok(geometry.header.top >= geometry.bar.bottom - 1, `${width}: fixed header clears admin bar`);
    evidence.push({ kind: 'adminbar', width, top: geometry.header.top });
  }
  await context.clearCookies();
  runPHP('activate-child');
  const child = runPHP('child-contracts');
  assert.equal(child.childOverride, true);
  for (const width of [1280, 320]) await renderRoute('', width, 200, 'home-child');
  assert.equal(await page.evaluate(() => window.__omegaQaChildPitchDataLoaded), true, 'Native module dependency must load the child-only pitch-data override while pitch-guide falls back to parent');
  runPHP('activate');
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(base.href, { waitUntil: 'networkidle' });
  await dismissCookies();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(qaRoot, 'theme-screenshot.png'), animations: 'disabled' });
  assert.ok([...resources].some(path => path.endsWith('/scripts/pitch-data.js')), 'Imported JS data loaded');
  assert.ok([...resources].some(path => path.includes('/assets/fonts/')), 'Local WordPress font loaded');
  assert.deepEqual(errors, [], 'No console errors or failed local assets');
  assert.deepEqual(blocked, [], 'No form/API/POST attempts were made');
  await writeFile(resolve(qaRoot, 'verification.json'), JSON.stringify({ install, installedTheme, activation, screenshot, helpers, evidence, resources: [...resources], errors, blocked }, null, 2));
  console.log(`PASS ${evidence.length} WordPress route/viewport checks; query/native/plain legal pages, overlays, local validation, TPI, admin bar, assets. No submissions.`);
} catch (error) {
  await page.screenshot({ path: resolve(qaRoot, 'failure.png'), animations: 'disabled' }).catch(() => {});
  await writeFile(resolve(qaRoot, 'verification-failure.json'), JSON.stringify({ message: error.message, url: page.url(), evidence, errors, blocked, resources: [...resources] }, null, 2));
  throw error;
} finally {
  runPHP('activate');
  runPHP('pretty');
  runPHP('remove-legal-pages');
  await browser.close();
}
