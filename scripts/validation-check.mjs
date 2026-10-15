import {isolateYandexMap} from './map-fixture.mjs';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page=await browser.newPage();
await isolateYandexMap(page);
const failures=[],evidence=[];
let apiRequests=0,nonGet=0;
page.on('request',request=>{if(request.url().includes('/api/'))apiRequests++;if(request.method()!=='GET')nonGet++;});
await page.route('**/api/**',route=>route.abort());
page.on('pageerror',error=>failures.push(error.message));
try {
 await mkdir('qa',{recursive:true});
 for(const width of [1440,768,360,320]) {
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('#cookie-banner').isVisible()){await page.locator('#cookie-banner [data-cookie-save]').click();await page.locator('#cookie-banner').waitFor({state:'hidden'});}
  if(width===1440) {
   await page.locator('#order-email').fill('bad');
   await page.locator('.order-extra summary').scrollIntoViewIfNeeded();
   const target=await page.locator('.order-extra summary').boundingBox();
   await page.mouse.click(target.x+target.width/2,target.y+target.height/2);
   assert.equal(await page.locator('.order-extra').evaluate(el=>el.open),true,'blur errors must not move the optional-name control before its click completes');
   await page.locator('.order-extra summary').click();
   await page.locator('#order-form').evaluate(form=>form.reset());
  }
  const height=await page.locator('#order').evaluate(el=>el.getBoundingClientRect().height);
  const limit=width===1440?800:width===768?1150:1500;
  if(height>limit)failures.push(`${width}: section ${height}px exceeds compact target ${limit}px`);
  evidence.push({width,height});
  const available=await page.evaluate(()=>typeof checkRequestForm==='function');
  if(!available){failures.push(`${width}: separate local validation routine missing`);continue;}
  await page.locator('#order-email').focus();
  await page.locator('#order-phone').focus();
  assert.match(await page.locator('#order-email-error').textContent(),/Укажите e-mail/,'missing email has a specific instruction on blur');
  await page.locator('#order-email').fill('broken');
  await page.locator('#order-phone').focus();
  assert.match(await page.locator('#order-email-error').textContent(),/name@example.ru/,'invalid format includes an example');
  await page.locator('#order-email').fill('person@example.test');
  assert.equal(await page.locator('#order-email-error').isVisible(),false);
  // Validate locally through the same routine as submit, without a submit event or network.
  const names=await page.locator('#order-form').evaluate(form=>Object.keys(checkRequestForm(form,()=>collectOrderParameters(form),{focusFirst:true}).errors));
  assert.deepEqual(names,['parameters','phone','consent']);
  const summary=page.locator('#order-form .request-error-summary');
  assert.match(await summary.textContent(),/Заявка пока не отправлена/);
  assert.equal(await summary.getByRole('button').count(),3);
  assert.equal(await page.locator('#order-comment').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('#order-comment').evaluate(el=>el.closest('.order-field').classList.contains('has-error')),true);
  await summary.getByRole('button',{name:'Телефон',exact:true}).click();
  assert.equal(await page.locator('#order-phone').evaluate(el=>el===document.activeElement),true);
  await page.locator('#order-phone').fill('8 (999) 123-45-67');
  assert.equal(await page.locator('#order-phone').inputValue(),'+7 (999) 123-45-67');
  await page.locator('#order-consent').check();
  await page.locator('#order-form').screenshot({path:`qa/validation-${width}.png`,animations:'disabled'});
  await page.locator('#order-comment').fill('Нужна помощь с подбором');
  assert.equal(await summary.isVisible(),false,'summary clears when all errors are corrected');
  assert.equal(await page.locator('#order-form [aria-invalid=true]').count(),0);
  const clean=await page.locator('#order-form').evaluate(form=>Object.keys(checkRequestForm(form,()=>collectOrderParameters(form)).errors));
  assert.deepEqual(clean,[]);
  assert.equal(await page.locator('#request-dialog').evaluate(el=>el.open),false);
  await page.locator('.order-extra summary').click();
  await page.locator('#order-name').fill('Компания');
  assert.equal(await page.locator('#order-name').isVisible(),true);
  await page.locator('.order-extra summary').click();
  assert.equal(await page.locator('#order-name').isVisible(),false);
  await page.locator('#order').screenshot({path:`qa/compact-${width}.png`,animations:'disabled'});
 }
 assert.equal(apiRequests,0);assert.equal(nonGet,0);
 await writeFile('qa/validation.json',JSON.stringify({evidence,failures,apiRequests,nonGet},null,2));
 assert.deepEqual(failures,[]);
 console.log('PASS: compact form at 4 widths; blur validation, missing/format errors, field highlights, linked summary, focus and correction. No submit events, API requests or mail.');
} finally {await browser.close();}
