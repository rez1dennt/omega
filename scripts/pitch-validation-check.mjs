import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {isolateYandexMap} from './map-fixture.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await isolateYandexMap(page);
let api=0;await page.route('**/api/**',route=>{api++;return route.abort();});
try {
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.locator('#cookie-banner [data-cookie-save]').click();
 await page.locator('#cookie-banner').waitFor({state:'hidden'});
 await page.locator('#pitch-tab-pipe').click();
 await page.locator('#pitch-pipe-diameter').fill('89');
 const cases=[
  ['pitch-pipe-wall','pitch-panel-pipe','толщину стенки','4 или 2,5'],
  ['pitch-pipe-diameter','pitch-panel-pipe','наружный диаметр','89 или 108'],
  ['pitch-rod-diameter','pitch-panel-rod','диаметр прутка','60'],
 ];
 for(const [id,panel,dimension,example] of cases) {
  await page.locator(panel==='pitch-panel-rod'?'#pitch-tab-rod':'#pitch-tab-pipe').click();
  const input=page.locator(`#${id}`),error=page.locator(`#${id}-error`);
  if(panel==='pitch-panel-pipe') {
   await page.locator('#pitch-pipe-diameter').fill('89');
   await page.locator('#pitch-pipe-wall').fill('4');
  }
  for(const value of ['','  ','0','-2','abc']) {
   await input.fill(value);
   await page.locator(`#${panel} .pitch-find`).click();
   assert.equal(await error.textContent(),value.trim()?`Введите ${dimension} больше нуля, например ${example} мм.`:`Укажите ${dimension} в миллиметрах.`);
   assert.equal(await input.getAttribute('aria-invalid'),'true');
   assert.equal(await error.isVisible(),true);
   assert.equal(await input.evaluate(el=>el===document.activeElement),true,'focus returns to invalid field');
   assert.equal(await input.getAttribute('aria-describedby'),`${id}-error`);
   await input.fill('2,5');
   assert.equal(await input.getAttribute('aria-invalid'),null,'typing clears invalid state');
   assert.equal(await error.isVisible(),false,'typing clears error');
  }
  await page.locator(`#${panel} .pitch-find`).click();
  assert.equal(await input.getAttribute('aria-invalid'),null,'decimal comma is accepted');
 }
 assert.equal(api,0,'validation must not send API requests');
 console.log('Pitch field validation: PASS (empty, invalid, focus, clear-on-type, decimal comma).');
} finally {await browser.close();}
