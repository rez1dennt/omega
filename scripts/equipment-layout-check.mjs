import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {isolateYandexMap} from './map-fixture.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES||'C:/Users/bahti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','playwright'));
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({reducedMotion:'reduce'});
const errors=[], evidence=[];let submissions=0;
await isolateYandexMap(page);
await page.route('**/*',route=>{
  const request=route.request();
  if(!['GET','HEAD'].includes(request.method())||/\/(api|wp-json)\//.test(new URL(request.url()).pathname)){submissions++;return route.abort();}
  return route.continue();
});
page.on('pageerror',error=>errors.push(error.message));
try {
  await mkdir('qa',{recursive:true});
  for(const width of [1440,1280,1024,768,599,360,320]) {
    await page.setViewportSize({width,height:900});
    await page.goto(process.env.OMEGA_LAYOUT_URL||'http://127.0.0.1:4174/omega/',{waitUntil:'networkidle'});
    if(await page.locator('#cookie-banner').isVisible()){await page.locator('#cookie-banner [data-cookie-save]').click();await page.locator('#cookie-banner').waitFor({state:'hidden'});}
    await page.evaluate(()=>document.fonts.ready);
    const cards=page.locator('.equipment-types > .equipment-card');
    assert.equal(await cards.count(),4,'All four machines belong to the same grid');
    assert.equal(await page.locator('.equipment-magnetic-heading').count(),0,'No separate magnetic category row');
    await page.locator('#equipment img,.production-media img').evaluateAll(images=>{images.forEach(image=>{image.loading='eager';});return Promise.all(images.map(image=>image.decode()));});
    const boxes=await cards.evaluateAll(items=>items.map(card=>({card:card.getBoundingClientRect().toJSON(),action:card.querySelector('[data-request-equipment]').getBoundingClientRect().toJSON(),photo:card.querySelector('.equipment-photo-frame').getBoundingClientRect().toJSON(),display:getComputedStyle(card).display,fit:getComputedStyle(card.querySelector('img')).objectFit})));
    for(const box of boxes){assert.equal(box.display,'flex','Every machine uses the common vertical card');assert.equal(box.fit,'contain');assert.ok(Math.abs(box.card.width-boxes[0].card.width)<=1);assert.ok(Math.abs(box.photo.height-boxes[0].photo.height)<=1);}
    if(width>=768){
      assert.ok(Math.abs(boxes[0].card.y-boxes[1].card.y)<=1,'First row has two cards');
      assert.ok(Math.abs(boxes[2].card.y-boxes[3].card.y)<=1,'Second row has two cards');
      assert.ok(boxes[1].card.x>boxes[0].card.x && boxes[2].card.y>boxes[0].card.bottom,'Actual 2 by 2 arrangement');
      assert.ok(Math.abs(boxes[0].action.y-boxes[1].action.y)<=1 && Math.abs(boxes[2].action.y-boxes[3].action.y)<=1,'Actions align within each row');
    } else assert.ok(boxes.every(box=>Math.abs(box.card.x-boxes[0].card.x)<=1),'Narrow screens use one column');
    const caption=await page.locator('.production-media figcaption').evaluate(el=>({box:el.getBoundingClientRect().toJSON(),parent:el.parentElement.getBoundingClientRect().toJSON(),icon:el.querySelector('svg').getBoundingClientRect().toJSON(),font:parseFloat(getComputedStyle(el).fontSize)}));
    assert.ok(caption.box.width<=369 && caption.box.height<=110,'IDEAL caption is a compact badge');
    assert.ok(caption.box.left>=caption.parent.left && caption.box.right<=caption.parent.right,'Caption stays inside photo');
    assert.ok(caption.icon.width<=28 && caption.font>=13,'Compact icon and readable caption');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page overflow');
    if([1440,768,320].includes(width)){
      await page.locator('#equipment').screenshot({path:`qa/equipment-grid-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
      await page.locator('.production-media').screenshot({path:`qa/ideal-badge-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
    }
    evidence.push({width,boxes,caption});
  }
  await page.locator('[data-request-equipment*="LENZ Steyr-35"]').click();
  assert.match(await page.locator('#request-parameters').inputValue(),/LENZ Steyr-35/);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.documentElement.classList.contains('scroll-locked'));
  assert.deepEqual(errors,[]);assert.equal(submissions,0);
  await writeFile('qa/equipment-layout.json',JSON.stringify({evidence,errors,submissions},null,2));
  console.log('PASS 2x2 machine cards, common appearance/action alignment, compact IDEAL badge and seven widths; magnetic request context; no submissions.');
} finally {await browser.close();}
