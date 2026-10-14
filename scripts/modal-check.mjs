import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
const { chromium } = modules ? require(resolve(modules, 'playwright')) : require('playwright');
// Keep the real Windows scrollbar: compensation must also work with a nonzero gutter.
const browser = await chromium.launch({ headless: true, channel: 'msedge', ignoreDefaultArgs: ['--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
let submissions = 0;
page.on('pageerror', error => errors.push(error.message));
page.on('requestfailed', request => errors.push(request.url()));
page.on('request', request => { if (request.method() !== 'GET') submissions++; });
const evidence = [];
const modal = page.locator('#request-dialog');
const fields = page.locator('#request-form');
const close = async () => {
  await modal.getByRole('button', { name: 'Закрыть заявку' }).click();
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
};
const geometry = () => page.evaluate(() => ({
  y: scrollY, gutter: innerWidth - document.documentElement.clientWidth,
  header: document.querySelector('.site-header').getBoundingClientRect().toJSON(),
  brand: document.querySelector('.site-header .brand').getBoundingClientRect().toJSON(),
  content: document.querySelector('.order-grid').getBoundingClientRect().toJSON(),
  overflow: getComputedStyle(document.body).overflow,
}));
function stable(before, during) {
  assert.ok(Math.abs(before.y - during.y) <= 1, `page scroll must stay unchanged: ${before.y} -> ${during.y}; widths ${before.header.width} -> ${during.header.width}`);
  for (const key of ['header', 'brand', 'content']) {
    for (const axis of ['x', 'y', 'width']) assert.ok(Math.abs(before[key][axis] - during[key][axis]) <= 1, `${key}.${axis} must not jump`);
  }
}

try {
  await mkdir('qa', { recursive: true });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#cookie-banner [data-cookie-save]').click();
  await page.locator('#cookie-banner').waitFor({ state: 'hidden' });
  await page.locator('.header-cta').click();
  assert.equal(await modal.count(), 1, 'application CTA must open the request modal');
  assert.equal(await modal.evaluate(dialog => dialog.open), true);
  assert.equal(await fields.locator('[name="parameters"]').evaluate(el => el === document.activeElement), true);
  await fields.getByRole('button', { name: 'Отправить заявку' }).click();
  assert.equal(await fields.locator('[aria-invalid="true"]').count(), 4, 'required parameters, email, phone and consent are validated');
  await fields.locator('[name="parameters"]').fill('Нужна помощь с подбором полотна');
  await fields.locator('[name="email"]').fill('wrong-address');
  await fields.locator('[name="phone"]').fill('+7 123');
  await fields.getByRole('button', { name: 'Отправить заявку' }).click();
  assert.equal(await fields.locator('[name="email"]').getAttribute('aria-invalid'), 'true');
  assert.equal(await fields.locator('[name="phone"]').getAttribute('aria-invalid'), 'true');
  await page.screenshot({ path: 'qa/modal-errors-1440.png', animations: 'disabled' });
  await fields.locator('[name="email"]').fill('test@example.com');
  await fields.locator('[name="phone"]').fill('8 (999) 227-83-80');
  await fields.locator('[name="consent"]').check();
  await fields.locator('.consent-details summary').click();
  assert.equal(await fields.locator('.consent-details').evaluate(el => el.open), true);
  assert.match(await fields.locator('.consent-details').textContent(), /не отправляются/);
  await fields.locator('.consent-details summary').click();
  await fields.getByRole('button', { name: 'Отправить заявку' }).click();
  assert.equal(await fields.locator('[aria-invalid="true"]').count(), 0, JSON.stringify(await fields.locator('[aria-invalid="true"]').evaluateAll(elements => elements.map(el => ({ name: el.name, value: el.value, checked: el.checked, error: document.getElementById(`request-${el.name}-error`).textContent })))));
  assert.match(await fields.getByRole('status').textContent(), /заявка не отправлена/i);
  assert.equal(submissions, 0, 'demo must not transmit personal data');
  await close();
  assert.equal(await page.locator('.header-cta').evaluate(el => el === document.activeElement), true);

  await page.locator('.hero-actions .button').click();
  assert.equal(await fields.locator('[name="parameters"]').inputValue(), 'Нужна помощь с подбором полотна');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
  await page.locator('.footer-top > .button').click();
  assert.equal(await modal.evaluate(dialog => dialog.open), true);
  await page.mouse.click(5, 5);
  await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));

  await page.locator('#order-form [name="width"]').fill('27');
  await page.locator('#order-form [name="length"]').fill('2450');
  await page.locator('#order-form [name="material"]').fill('Сталь');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '4/6 TPI', exact: true }).click();
  await page.locator('[data-machine="PILOUS"]').click();
  await page.locator('#order-form button[type="submit"]').scrollIntoViewIfNeeded();
  const before = await geometry();
  await page.locator('#order-form button[type="submit"]').click();
  const during = await geometry();
  assert.equal(during.overflow, 'hidden');
  assert.equal(during.gutter, 0, 'vertical page scrollbar must disappear');
  stable(before, during);
  const parameters = await fields.locator('[name="parameters"]').inputValue();
  for (const expected of ['27', '2450', 'Сталь', '4/6 TPI', 'PILOUS']) assert.ok(parameters.includes(expected), `transfer ${expected}`);
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await modal.evaluate(dialog => dialog.contains(document.activeElement)), true, `focus remains in modal at Tab ${i}: ${await page.evaluate(() => document.activeElement.outerHTML.slice(0, 200))}`);
  }
  await modal.getByRole('button', { name: 'Закрыть заявку' }).focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await fields.getByRole('button', { name: 'Отправить заявку' }).evaluate(el => el === document.activeElement), true);
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 700);
  stable(before, await geometry());
  await close();
  const after = await geometry();
  stable(before, after);
  assert.equal(before.gutter, after.gutter);
  evidence.push({ width: 1440, before, during, after });

  await page.locator('.production-copy [data-dialog]').click();
  const locked = await geometry();
  await page.locator('#production-details .button').click();
  assert.equal(await modal.evaluate(dialog => dialog.open), true);
  stable(locked, await geometry());
  await close();
  assert.equal(await page.locator('.production-copy [data-dialog]').evaluate(el => el === document.activeElement), true);

  for (const width of [1280, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 780 });
    await page.locator('.machine-description .text-link').scrollIntoViewIfNeeded();
    const start = await geometry();
    await page.locator('.machine-description .text-link').click();
    const open = await geometry();
    stable(start, open);
    assert.equal(await fields.locator('[name="parameters"]').evaluate(el => el.scrollTop), 0, `${width}: parameters should reopen from the first line`);
    const overflow = await modal.evaluate(dialog => ({ width: dialog.clientWidth, scrollWidth: dialog.scrollWidth, top: dialog.getBoundingClientRect().top, bottom: dialog.getBoundingClientRect().bottom, height: innerHeight }));
    assert.ok(overflow.scrollWidth <= overflow.width + 1, `${width}: no dialog horizontal overflow`);
    assert.ok(overflow.top >= 0 && overflow.bottom <= overflow.height, `${width}: dialog fits viewport`);
    await modal.evaluate(dialog => { dialog.scrollTop = 0; });
    if ([390, 320].includes(width)) await page.screenshot({ path: `qa/modal-${width}.png`, animations: 'disabled' });
    await fields.getByRole('button', { name: 'Отправить заявку' }).scrollIntoViewIfNeeded();
    assert.equal(await fields.getByRole('button', { name: 'Отправить заявку' }).isVisible(), true);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.body.classList.contains('dialog-open'));
    stable(start, await geometry());
    evidence.push({ width, before: start, during: open, after: await geometry() });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.header-cta').click();
  await page.screenshot({ path: 'qa/modal-1440.png', animations: 'disabled' });
  await close();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.hero-actions .button').click();
  await close();
  assert.deepEqual(errors, []);
  assert.equal(submissions, 0);
  await writeFile('qa/modal-verification.json', JSON.stringify({ evidence, errors, submissions, checks: 'CTA, transfer, validation, preservation, focus, Escape, backdrop, close, dialog transfer, real scrollbar compensation, reduced motion: PASS' }, null, 2));
  console.log(`PASS: request modal at ${evidence.length} widths; scrollbar gutter ${before.gutter}px, stable geometry/scroll, focus, validation and demo without transmission.`);
} finally {
  await browser.close();
}
