import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
const { chromium } = modules ? require(resolve(modules, 'playwright')) : require('playwright');
const browser = await chromium.launch({ headless: true, channel: 'msedge', ignoreDefaultArgs: ['--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const thirdParty = [];
page.on('pageerror', error => errors.push(error.message));
page.on('requestfailed', request => errors.push(request.url()));
page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173')) thirdParty.push(request.url()); });
const evidence = [];
try {
  await mkdir('qa', { recursive: true });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('.header-cta').click();
  const phone = page.locator('#request-phone');
  await phone.fill('8 (917) 206-21-00');
  assert.equal(await phone.inputValue(), '+7 (917) 206-21-00', 'first paste into an empty focused mask must not duplicate the country code');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await phone.focus();
  await page.keyboard.type('9991234567');
  assert.equal(await phone.inputValue(), '+7 (999) 123-45-67', 'phone is masked while typing');
  await phone.evaluate(el => el.setSelectionRange(8, 8)); // immediately after closing parenthesis
  await page.keyboard.press('Backspace');
  assert.equal(await phone.inputValue(), '+7 (991) 234-56-7', 'Backspace crosses the closing parenthesis and deletes a digit');
  await phone.fill('+7 (999) 123-45-67');
  await phone.evaluate(el => el.setSelectionRange(13, 13)); // immediately after first hyphen
  await page.keyboard.press('Backspace');
  assert.equal(await phone.inputValue(), '+7 (999) 124-56-7', 'Backspace crosses a hyphen');
  await phone.fill('8 (917) 206-21-00');
  assert.equal(await phone.inputValue(), '+7 (917) 206-21-00', 'paste and autofill normalize Russian prefix');
  await phone.evaluate(el => el.setSelectionRange(7, 7));
  await page.keyboard.press('Delete');
  assert.equal(await phone.inputValue(), '+7 (917) 062-10-0', 'Delete crosses closing formatting to the next digit');
  await phone.fill('+7 (999) 123-45-67');
  await phone.evaluate(el => el.setSelectionRange(4, 7));
  await page.keyboard.type('845');
  assert.equal(await phone.inputValue(), '+7 (845) 123-45-67', 'selection replacement retains other digits');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  assert.ok((await phone.inputValue()).replace(/\D/g, '').length <= 1, 'all editable digits can be erased');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));

  const banner = page.locator('#cookie-banner');
  await banner.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => localStorage.length), 0, 'no preferences stored before a choice');
  await banner.getByRole('button', { name: 'Настройки' }).click();
  assert.equal(await page.locator('#cookie-settings').evaluate(el => el.open), true);
  assert.match(await page.locator('#cookie-settings').textContent(), /Не используются/);
  await page.getByRole('button', { name: 'Сохранить настройки' }).click();
  await banner.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('omega-cookie-preferences')));
  assert.equal(stored.essential, true);
  assert.equal(stored.analytics, false);
  assert.equal(stored.advertising, false);
  assert.ok(stored.expiresAt > Date.now());
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await banner.isVisible(), false, 'remembered choice hides banner');
  await page.locator('.cookie-reopen').click();
  await page.getByRole('button', { name: 'Удалить сохранённый выбор' }).click();
  await banner.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => localStorage.getItem('omega-cookie-preferences')), null);
  await banner.getByRole('button', { name: 'Только необходимые' }).click();
  await banner.waitFor({ state: 'hidden' });

  for (const route of ['/', '/privacy/', '/consent/']) {
    for (const width of [1440, 1280, 768, 360, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        h1: document.querySelectorAll('h1').length,
        headerTop: document.querySelector('.site-header').getBoundingClientRect().top,
        brokenImages: [...document.images].filter(el => el.complete && !el.naturalWidth).map(el => el.src),
      }));
      assert.ok(result.scrollWidth <= result.width, `${route} ${width}: no overflow`);
      assert.equal(result.h1, 1);
      assert.equal(result.headerTop, 0);
      assert.deepEqual(result.brokenImages, []);
      evidence.push({ route, ...result });
      if (route === '/') {
        if (width <= 360) {
          const hero = await page.evaluate(() => ({ facts: document.querySelector('.hero-facts').getBoundingClientRect().bottom, label: document.querySelector('.material-label').getBoundingClientRect().top }));
          assert.ok(hero.label >= hero.facts + 12, `${width}: material card must not overlap delivery-time facts: ${JSON.stringify(hero)}`);
        }
        await page.locator('#delivery').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('.delivery-copy').classList.contains('is-visible'));
        const delivery = await page.locator('#delivery').evaluate(el => ({
          photoWidth: el.querySelector('.delivery-photo').getBoundingClientRect().width,
          photoHeight: el.querySelector('.delivery-photo').getBoundingClientRect().height,
          headingWidth: el.querySelector('h2').getBoundingClientRect().width,
        }));
        assert.ok(delivery.photoWidth > 200 && delivery.photoHeight > 180, 'delivery photograph has a real frame');
        if (width >= 1280) assert.ok(delivery.headingWidth > 260, 'delivery heading is not squeezed into a narrow column');
        if ([1440, 360, 320].includes(width)) await page.screenshot({ path: `qa/polish-delivery-${width}.png`, animations: 'disabled' });
      } else {
        assert.match(await page.locator('main').textContent(), /6455054459/);
        assert.match(await page.locator('main').textContent(), /omegakomplekt@mail.ru/);
        if ([1440, 320].includes(width)) await page.screenshot({ path: `qa/polish-${route.split('/')[1]}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
    }
  }
  await page.goto('http://127.0.0.1:4173');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.setViewportSize({ width: 320, height: 740 });
  await banner.waitFor({ state: 'visible' });
  await page.screenshot({ path: 'qa/polish-cookie-320.png', animations: 'disabled' });
  const box = await banner.boundingBox();
  assert.ok(box.height < 280, 'narrow cookie banner remains compact');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#delivery').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.delivery-copy').evaluate(el => getComputedStyle(el).transform), 'none');
  assert.equal(await page.locator('.delivery-copy').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.deepEqual(errors, []);
  assert.deepEqual(thirdParty, [], 'no third-party trackers or requests from the site code');
  await writeFile('qa/polish-verification.json', JSON.stringify({ evidence, errors, thirdParty, checks: 'phone editing and paste; Cookie settings/persistence/deletion; legal routes; delivery layout; reduced motion: PASS' }, null, 2));
  console.log(`PASS: mask deletion and paste, Cookie lifecycle, ${evidence.length} route/viewport checks, delivery and reduced motion.`);
} finally {
  await browser.close();
}
