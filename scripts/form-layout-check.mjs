import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(resolve(process.env.CODEX_NODE_MODULES, 'playwright'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const failures = [];
const evidence = [];
let nonGet = 0;
await page.route('**/*', route => {
  if (route.request().method() !== 'GET') { nonGet++; return route.abort(); }
  return route.continue();
});
page.on('pageerror', error => failures.push(error.message));
try {
  await mkdir('qa', { recursive: true });
  for (const width of [1440, 1280, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('#cookie-banner').isVisible()) {
      await page.locator('#cookie-banner [data-cookie-save]').click();
      await page.locator('#cookie-banner').waitFor({ state: 'hidden' });
    }
    const form = await page.locator('#order-form').evaluate(el => ({
      endpoint: el.dataset.endpoint,
      fields: ['email','phone','consent'].every(name => el.elements.namedItem(name)?.required),
      unchecked: el.elements.namedItem('consent')?.checked === false,
      appearance: getComputedStyle(el.elements.width).appearance,
      scrollWidth: el.scrollWidth, width: el.clientWidth,
      placeholders: [...el.querySelectorAll('input:not([type=hidden]):not([type=checkbox])')].filter(input => {
        if (!input.placeholder || input.closest('[aria-hidden="true"]')) return false;
        const css = getComputedStyle(input); const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d'); context.font = css.font;
        return context.measureText(input.placeholder).width > input.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) - 3;
      }).map(input => input.name),
    }));
    if (!form.fields || !form.unchecked || form.endpoint !== 'api/request.php') failures.push(`${width}: inline form needs its own contacts, unchecked consent and endpoint`);
    if (form.appearance !== 'textfield') failures.push(`${width}: native number spinner is present`);
    if (form.scrollWidth > form.width + 1 || form.placeholders.length) failures.push(`${width}: form text clipped: ${form.placeholders}`);
    evidence.push({ width, form });
    for (const name of ['AURA','OPTIMUM','PILOUS','PROMA','METAL MASTER','JET']) {
      await page.locator(`[data-machine="${name}"]`).click();
      const bounds = await page.locator('.machine-word text').evaluate(el => {
        const b=el.getBBox(); return { x:b.x, y:b.y, right:b.x+b.width, bottom:b.y+b.height };
      });
      if (bounds.x < 40 || bounds.right > 760 || bounds.y < 0 || bounds.bottom > 160) failures.push(`${width} ${name}: clipped SVG name ${JSON.stringify(bounds)}`);
      if ([1440,360].includes(width) && ['OPTIMUM','METAL MASTER'].includes(name)) await page.locator('.machine-detail').screenshot({ path: `qa/brand-${name.replaceAll(' ','-')}-${width}.png`, animations: 'disabled' });
    }
    assert.equal(await page.locator('#request-dialog').evaluate(el => el.open), false);
    if (width === 1280) {
      const markParametersMissing = async () => {
        await page.locator('#order-form').evaluate(form => {
          form.reset();
          setRequestFieldError(form,'parameters','Укажите параметры или опишите задачу.');
          form.querySelector('.request-error-summary').hidden = false;
        });
      };
      await markParametersMissing();
      await page.locator('#order-width').fill('27');
      assert.equal(await page.locator('#order-comment').getAttribute('aria-invalid'), null, 'a width value clears the combined-parameters error');
      await markParametersMissing();
      await page.getByRole('combobox').click();
      await page.getByRole('option',{name:'4/6 TPI',exact:true}).click();
      assert.equal(await page.locator('#order-comment').getAttribute('aria-invalid'), null, 'a selected TPI clears the combined-parameters error');
      await markParametersMissing();
      await page.locator('[data-machine="PILOUS"]').click();
      assert.equal(await page.locator('#order-comment').getAttribute('aria-invalid'), null, 'a selected machine clears the combined-parameters error');
    }
    await page.locator('#order').scrollIntoViewIfNeeded();
    if ([1440,768,360,320].includes(width)) await page.locator('#order').screenshot({ path: `qa/form-layout-${width}.png`, animations: 'disabled' });
  }
  const js = await readFile('dist/scripts/site.js','utf8');
  if (/orderForm\.addEventListener\('submit'[\s\S]{0,160}openDialog/.test(js)) failures.push('inline submit still opens the modal');
  assert.equal(nonGet, 0, 'do not submit applications or send mail during QA');
  await writeFile('qa/form-layout.json',JSON.stringify({evidence,failures,nonGet},null,2));
  assert.deepEqual(failures, []);
  console.log('PASS: inline form controls and consent; no native spinners; 6 full SVG brand names at 7 widths. No submissions or mail.');
} finally { await browser.close(); }
