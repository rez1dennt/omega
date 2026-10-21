import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {isolateYandexMap} from './map-fixture.mjs';
const require=createRequire(import.meta.url),{chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();
await isolateYandexMap(page);let requests=0;const errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/**',r=>{requests++;return r.abort();});
try {
 for(const width of [1280,768,360,320]) {
  await page.setViewportSize({width,height:780});await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  if(await page.locator('#cookie-banner').isVisible())await page.locator('#cookie-banner [data-cookie-save]').click();
  await page.locator('.hero [data-dialog="selection-dialog"]').click();
  const dialog=page.locator('#selection-dialog');
  await dialog.locator('.selection-guide>summary').click();await dialog.locator('#pitch-tab-pipe').click();
  await dialog.locator('#pitch-pipe-diameter').fill('108');await dialog.locator('#pitch-pipe-wall').fill('5');
  await dialog.locator('#pitch-panel-pipe .pitch-find').click();
  assert.deepEqual(await dialog.locator('#pitch-panel-pipe .pitch-choice strong').allTextContents(),['6/10','6/8','5/8']);
  await dialog.getByRole('button',{name:'Добавить 6/8 TPI в заявку',exact:true}).click();
  assert.equal(await dialog.locator('[name="tpi"]').inputValue(),'6/8 TPI');
  assert.match(await dialog.locator('#order-comment').inputValue(),/108.*5.*LENOX/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('#pitch-pipe-wall').count(),1);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));
  assert.equal(await page.locator('#pitch-guide .pitch-card').count(),1);
 }
 assert.deepEqual(errors,[]);assert.equal(requests,0);
 console.log('PASS continuous pipe guide inside selection modal at 4 widths; all boundary choices, dimensions/TPI transfer, unique IDs and restore. No submissions.');
}finally{await browser.close();}
