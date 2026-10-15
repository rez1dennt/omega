import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page=await browser.newPage();
const errors=[],evidence=[];
let outgoing=0;
page.on('pageerror',e=>errors.push(e.message));
page.on('requestfailed',r=>errors.push(r.url()));
page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('/api/'))outgoing++;});
await page.route('**/api/**',r=>r.abort());
try {
 await mkdir('qa',{recursive:true});
 for(const width of [1440,1280,1024,768,390,360,320]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  if(await page.locator('#cookie-banner').isVisible())await page.locator('#cookie-banner [data-cookie-save]').click();
  const root=page.locator('#benefit-showcase');
  assert.equal(await root.count(),1,'advantages become an interactive showcase');
  const pictures=await root.locator('.benefit-photo').evaluateAll(images=>images.map(image=>image.getAttribute('src')));
  assert.equal(new Set(pictures).size,4,'each advantage has a different photograph');
  const hashes=await Promise.all(pictures.map(async src=>createHash('sha256').update(await readFile(`dist/${src}`)).digest('hex')));
  assert.equal(new Set(hashes).size,4,'photograph files must have different contents, not just names');
  for(const src of pictures)assert.match(src,/^assets\/images\/benefits\//,'benefit photos are separate from the rest of the website');
  const repeated=await page.locator('img:not(.benefit-photo)').evaluateAll((images,pictures)=>images.filter(image=>pictures.includes(image.getAttribute('src'))).map(image=>image.getAttribute('src')),pictures);
  assert.deepEqual(repeated,[],'benefits must not repeat photos used in other sections');
  await root.scrollIntoViewIfNeeded();
  const tabs=root.getByRole('tab');
  assert.equal(await tabs.count(),4);
  const heights=[];
  for(let i=0;i<4;i++){
   await tabs.nth(i).click();
   assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');
   assert.equal(await root.getByRole('tab',{selected:true}).count(),1);
   const active=root.getByRole('tabpanel');
   assert.equal(await active.count(),1,'only the selected panel is accessible');
   assert.equal(await active.getAttribute('aria-labelledby'),await tabs.nth(i).getAttribute('id'));
   assert.equal(await active.evaluate(el=>el.inert),false);
   assert.equal(await root.locator('.benefit-panel[inert]').count(),3);
   await active.locator('img').evaluate(img=>img.decode());
   if([1440,320].includes(width))await active.screenshot({path:`qa/benefit-photo-${i+1}-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
   heights.push((await root.locator('.benefit-panels').boundingBox()).height);
   const geometry=await active.evaluate(el=>({
    overflow:document.documentElement.scrollWidth>innerWidth,
    clipped:[...el.querySelectorAll('h3,p,a')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),
    panel:el.getBoundingClientRect().toJSON(),
    action:el.querySelector('[data-dialog]').getBoundingClientRect().toJSON(),
   }));
   assert.equal(geometry.overflow,false,`${width}: no page overflow`);
   assert.deepEqual(geometry.clipped,[],`${width}: readable copy`);
   assert.ok(geometry.action.bottom<=geometry.panel.bottom&&geometry.action.right<=geometry.panel.right,`${width}: action stays in panel`);
   if(width===1440){
    const target=i===3?'delivery-details':'request-dialog';
    await page.evaluate(()=>document.addEventListener('site:dialog-open',()=>{window.__benefitOpenY=scrollY;},{once:true}));
    await active.locator('[data-dialog]').click();
    assert.equal(await page.locator(`#${target}`).evaluate(el=>el.open),true);
    const y=await page.evaluate(()=>window.__benefitOpenY);
    assert.ok(Math.abs((await page.evaluate(()=>scrollY))-y)<=1,'dialog opening must not shift page');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));
    assert.ok(Math.abs((await page.evaluate(()=>scrollY))-y)<=1,'dialog restores scroll');
   }
  }
  assert.ok(Math.max(...heights)-Math.min(...heights)<=1,`${width}: switching panels must not change section height`);
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
  assert.equal(await tabs.nth(1).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('End');assert.equal(await tabs.nth(3).getAttribute('aria-selected'),'true');
  await page.keyboard.press('Home');assert.equal(await tabs.nth(0).getAttribute('aria-selected'),'true');
  await page.keyboard.press('ArrowLeft');assert.equal(await tabs.nth(3).getAttribute('aria-selected'),'true');
  await tabs.nth(2).click();
  if([1440,768,360,320].includes(width))await page.locator('.advantages').screenshot({path:`qa/benefits-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
  evidence.push({width,heights});
 }
 await page.setViewportSize({width:390,height:844});
 const root=page.locator('#benefit-showcase');
 await page.setViewportSize({width:1280,height:900});
 const stage=root.locator('.benefit-panels');
 await stage.scrollIntoViewIfNeeded();
 const box=await stage.boundingBox();
 await page.mouse.move(box.x+box.width*.8,box.y+box.height*.25);
 await page.waitForFunction(()=>document.querySelector('#benefit-showcase').style.getPropertyValue('--benefit-shift-x')!=='');
 const offset=await root.evaluate(el=>({x:parseFloat(el.style.getPropertyValue('--benefit-shift-x')),y:parseFloat(el.style.getPropertyValue('--benefit-shift-y'))}));
 assert.ok(Math.abs(offset.x)>0&&Math.abs(offset.x)<=6&&Math.abs(offset.y)<=4,'pointer response stays within a small, bounded range');
 assert.equal((await stage.boundingBox()).width,box.width,'pointer response does not resize the section');
 await page.mouse.move(0,0);
 await page.setViewportSize({width:390,height:844});
 await root.getByRole('tab').nth(0).click();
 // Dispatch touch pointer gestures locally. Never dispatch a form submit.
 await root.locator('.benefit-panels').evaluate(el=>{
  el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:7,pointerType:'touch',clientX:300,clientY:180,bubbles:true}));
  el.dispatchEvent(new PointerEvent('pointerup',{pointerId:7,pointerType:'touch',clientX:190,clientY:186,bubbles:true}));
 });
 assert.equal(await root.getByRole('tab').nth(1).getAttribute('aria-selected'),'true','horizontal swipe changes advantage');
 await root.locator('.benefit-panels').evaluate(el=>{
  el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:8,pointerType:'touch',clientX:300,clientY:180,bubbles:true}));
  el.dispatchEvent(new PointerEvent('pointerup',{pointerId:8,pointerType:'touch',clientX:190,clientY:330,bubbles:true}));
 });
 assert.equal(await root.getByRole('tab').nth(1).getAttribute('aria-selected'),'true','vertical scrolling does not change advantage');
 await page.emulateMedia({reducedMotion:'reduce'});
 await root.getByRole('tab').nth(0).click();
 assert.equal(await root.getByRole('tabpanel').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:780}});
 await fallback.goto('http://127.0.0.1:4173');
 assert.equal(await fallback.locator('.benefit-panel:visible').count(),4,'all benefits remain readable without JavaScript');
 await fallback.close();
 assert.equal(outgoing,0);assert.deepEqual(errors,[]);
 await writeFile('qa/benefits.json',JSON.stringify({evidence,errors,outgoing},null,2));
 console.log('PASS: interactive benefits at 7 widths, all four panels, keyboard, stable heights, modal CTAs, swipe, reduced motion and no-JS fallback. No submissions/API/mail.');
}finally{await browser.close();}
