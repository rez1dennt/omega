import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {isolateYandexMap} from './map-fixture.mjs';
const require = createRequire(import.meta.url);
const {chromium} = require(resolve(process.env.CODEX_NODE_MODULES, 'playwright'));
const browser = await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page = await browser.newPage({viewport:{width:390,height:844}});
await isolateYandexMap(page);
let submissions=0;
await page.route('**/api/**', route => {submissions++;return route.abort();});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const reports=[];
const closed=()=>page.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false' && !document.documentElement.classList.contains('scroll-locked'));
const geometry=()=>page.evaluate(()=>({y:scrollY,header:document.querySelector('.site-header').getBoundingClientRect().toJSON(),button:document.querySelector('.menu-toggle').getBoundingClientRect().toJSON()}));
const stable=(a,b)=>{assert.ok(Math.abs(a.y-b.y)<=1,'overlay must retain page scroll');for(const key of ['header','button'])for(const axis of ['x','y','width'])assert.ok(Math.abs(a[key][axis]-b[key][axis])<=1,`${key}.${axis} shifts`);};
try {
  await mkdir('qa',{recursive:true});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.locator('[data-cookie-save]').first().click();
  await page.locator('#cookie-banner').waitFor({state:'hidden'});
  await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));
  await page.locator('.menu-toggle').click();
  if(process.argv.includes('--baseline')) await page.screenshot({path:'qa/mobile-menu-before.png',animations:'disabled'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow),'hidden','mobile navigation must lock the background');
  await page.keyboard.press('Escape');await closed();
  for(const [width,height] of [[320,740],[360,780],[390,844],[480,800],[768,900],[1024,800],[390,480],[740,320],[844,220]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));
    const before=await geometry();
    await page.locator('.menu-toggle').click();
    try { await page.waitForFunction(()=>document.querySelector('#main-nav').contains(document.activeElement)); }
    catch (error) {
      console.error('Menu focus diagnostic', {width,height,...await page.evaluate(()=>({active:document.activeElement?.outerHTML,header:document.querySelector('.site-header').className,expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),inert:document.querySelector('#main-nav').inert,navState}))});
      throw error;
    }
    await page.locator('#main-nav').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
    stable(before,await geometry());
    const menu=await page.locator('#main-nav').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),scroll:el.scrollWidth,client:el.clientWidth}));
    assert.ok(menu.rect.top>=before.header.bottom+4 && menu.rect.bottom<=height-6,`menu fits below fixed header: ${JSON.stringify({width,height,menu:menu.rect,header:before.header})}`);
    assert.ok(menu.scroll<=menu.client+1,'menu has no sideways overflow');
    assert.ok(menu.rect.height<=540,`five-link menu should remain compact: ${JSON.stringify(menu)}`);
    for(let i=0;i<15;i++) {await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.querySelector('#main-nav').contains(document.activeElement)||document.activeElement.matches('.menu-toggle')),true,'menu focus remains in the active layer');}
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#main-nav').evaluate(el=>el.classList.contains('is-closing')),true,'menu stays rendered during closing');
    await closed();stable(before,await geometry());
    assert.equal(await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement),true);
    await page.locator('.menu-toggle').click();
    await page.locator('#main-nav [data-dialog="request-dialog"]').click();
    await page.waitForFunction(()=>document.querySelector('#request-dialog').open);
    const dialog=page.locator('#request-dialog');
    await dialog.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));
    const heading=await page.locator('.request-heading').boundingBox();
    if(width<600||height<600) {
      assert.ok(heading.height<=175,`${width}: request header should not consume the phone viewport (${heading.height})`);
      assert.equal(await dialog.locator('[data-close-dialog]').evaluate(el=>el===document.activeElement),true,'opening mobile modal must not summon the keyboard');
      assert.equal(await page.locator('.request-name-details').evaluate(el=>el.open),false);
      const textarea=await page.locator('#request-parameters').boundingBox();assert.ok(textarea.height<=86,'compact initial textarea');
    }
    const bounds=await dialog.boundingBox();assert.ok(bounds.y>=0&&bounds.y+bounds.height<=height+1,'request modal fits available screen');
    await page.locator('#request-form .request-submit').scrollIntoViewIfNeeded();
    const closeBounds=await dialog.locator('[data-close-dialog]').boundingBox();
    assert.ok(closeBounds.y>=0&&closeBounds.y+closeBounds.height<=height,'close stays reachable after form scrolling');
    if([320,390].includes(width)&&height>600)await page.screenshot({path:`qa/mobile-modal-${width}.png`,animations:'disabled'});
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));stable(before,await geometry());
    await page.locator('.menu-toggle').click();
    await page.locator('#main-nav a[href="#contacts"]').click();
    await page.waitForFunction(()=>document.activeElement.id==='contacts'&&!document.documentElement.classList.contains('scroll-locked'));
    assert.equal(await page.locator('#contacts').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom),true,'anchor heading is below header');
    reports.push({width,height,menu:menu.rect,heading:heading.height,dialog:bounds});
  }
  await page.setViewportSize({width:390,height:844});
  await page.setViewportSize({width:390,height:480});
  await page.locator('.menu-toggle').click();
  await page.locator('#main-nav').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await page.keyboard.press('Escape');await closed();
  await page.locator('.menu-toggle').click();
  await page.waitForFunction(()=>document.querySelector('#main-nav').contains(document.activeElement));
  assert.equal(await page.locator('#main-nav').evaluate(el=>el.scrollTop),0,'reopening a scrolled menu returns to the first section');
  await page.keyboard.press('Escape');await closed();
  await page.setViewportSize({width:390,height:844});
  await page.locator('.menu-toggle').click();
  await page.screenshot({path:'qa/mobile-menu-after.png',animations:'disabled'});
  await page.locator('.nav-backdrop').click({position:{x:5,y:5}});
  await closed();
  for(const id of ['production-details','delivery-details','legal-dialog','cookie-settings']) {
    const opener=id==='cookie-settings'?page.locator('.cookie-reopen'):page.locator(`[data-dialog="${id}"]:visible`).first();
    await opener.click();
    const info=page.locator(`#${id}`);
    await info.evaluate(el=>{el.scrollTop=el.scrollHeight;});
    const close=await info.locator('[data-close-dialog]').boundingBox();
    assert.ok(close.y>=0&&close.y+close.height<=844,`${id}: sticky close remains visible`);
    await info.locator('[data-close-dialog]').click();await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));
  }
  await page.locator('.hero-actions [data-dialog="request-dialog"]').click();
  await page.setViewportSize({width:390,height:420});
  await page.locator('#request-email').focus();
  const shortBounds=await page.locator('#request-dialog').boundingBox();
  assert.ok(shortBounds.y+shortBounds.height<=420,'modal adapts to reduced available viewport');
  await page.locator('#request-form .request-submit').scrollIntoViewIfNeeded();
  const shortClose=await page.locator('#request-dialog [data-close-dialog]').boundingBox();assert.ok(shortClose.y>=0&&shortClose.y+shortClose.height<=420);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');await closed();
  await page.locator('.menu-toggle').click();await page.setViewportSize({width:1280,height:900});await closed();
  assert.equal(await page.locator('#main-nav').evaluate(el=>el.inert),false,'desktop links remain accessible');
  assert.deepEqual(errors,[]);assert.equal(submissions,0);
  await writeFile('qa/mobile-overlays-report.json',JSON.stringify(reports,null,2));
  console.log('PASS: mobile menu/modal at 9 sizes; lock, no jumps, focus, close animation, anchors, menu-to-modal, compact header, landscape, reduced motion and breakpoint. No applications/API/SMTP.');
} finally {await browser.close();}
