import {isolateYandexMap} from './map-fixture.mjs';
import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page=await browser.newPage();
await isolateYandexMap(page);
let requests=0;
const errors=[],evidence=[];
page.on('request',r=>{if(r.method()!=='GET'||r.url().includes('/api/'))requests++;});
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',route=>route.abort());
try {
 await mkdir('qa',{recursive:true});
 for(const width of [1440,1280,1200,1024,768,390,360,320]) {
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#equipment').count(),1,'dedicated equipment sales section exists');
  if(await page.locator('#cookie-banner').isVisible()){await page.locator('#cookie-banner [data-cookie-save]').click();await page.locator('#cookie-banner').waitFor({state:'hidden'});}
  await page.mouse.move(0,0);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#equipment').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.querySelectorAll('#equipment .motion-reveal').forEach(el=>el.classList.add('is-visible')));
  assert.equal(await page.locator('#equipment .equipment-card').count(),3);
  assert.equal(await page.locator('#equipment .equipment-rollers').count(),1);
  assert.equal(await page.locator('#equipment .equipment-photo').count(),4,'all four equipment categories have real product photographs');
  await page.locator('#equipment .equipment-photo').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  const photos=await page.locator('#equipment .equipment-photo').evaluateAll(images=>images.map(image=>({
   src:image.getAttribute('src'),alt:image.alt,naturalWidth:image.naturalWidth,
   fit:getComputedStyle(image).objectFit,
   width:image.getBoundingClientRect().width,height:image.getBoundingClientRect().height,
   frameHeight:image.parentElement.clientHeight,
  })));
  for(const photo of photos){
   assert.match(photo.src,/^assets\/images\/equipment\//);assert.ok(photo.alt.length>15);
   assert.ok(photo.naturalWidth>=300);assert.equal(photo.fit,'contain');
   assert.ok(photo.width>=160&&photo.height>=160,`${width}: product photograph is large enough to recognise`);
   assert.ok(Math.abs(photo.height-photo.frameHeight)<=1,`photograph fills its intentional frame: ${JSON.stringify(photo)}`);
  }
  assert.equal(await page.locator('#equipment .equipment-sketch,.equipment-roller-visual svg').count(),0,'schematic illustrations are replaced');
  assert.equal(await page.locator('#equipment [data-request-equipment]').count(),5);
  assert.equal(await page.locator('.main-nav a[href="#equipment"],.footer-nav a[href="#equipment"]').count(),2);
  const geometry=await page.locator('#equipment').evaluate(el=>({
   width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
   clipped:[...el.querySelectorAll('h2,h3,h4,p,a,button')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent),
   headerOverflow:document.querySelector('.header-inner').scrollWidth>document.querySelector('.header-inner').clientWidth+1,
   actionOverflow:[...el.querySelectorAll('.equipment-card,.equipment-rollers')].filter(card=>{
    const action=card.querySelector('a[data-request-equipment]').getBoundingClientRect();
    const bounds=card.getBoundingClientRect();const css=getComputedStyle(card);
    return action.right>bounds.right-parseFloat(css.paddingRight)+1;
   }).map(card=>card.className),
  }));
  assert.ok(geometry.scrollWidth<=width);assert.deepEqual(geometry.clipped,[]);assert.equal(geometry.headerOverflow,false);
  assert.deepEqual(geometry.actionOverflow,[],`${width}: equipment actions stay inside their content column`);
  evidence.push({...geometry,photos});
  if([1440,768,360,320].includes(width))await page.locator('#equipment').screenshot({path:`qa/equipment-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
 }
 await page.setViewportSize({width:1280,height:900});
 await page.locator('#order-width').fill('27');
 await page.locator('#order-comment').fill('Материал: сталь');
 const automatic=page.locator('[data-request-equipment="Автоматический ленточнопильный станок"]');
 const rollers=page.locator('[data-request-equipment="Рольганг"]');
 const close=async()=>{await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('dialog-open'));};
 await automatic.click();
 assert.match(await page.locator('#request-title').textContent(),/Подбор станка/);
 assert.match(await page.locator('#request-parameters').inputValue(),/Автоматический/);
 assert.doesNotMatch(await page.locator('#request-parameters').inputValue(),/Ширина полотна/);
 await page.locator('#request-parameters').fill('Автоматический станок. Заготовка 100 × 100 мм.');
 await page.locator('#request-email').fill('person@example.test');
 await page.locator('#request-phone').fill('8 (999) 123-45-67');
 await close();
 await rollers.click();
 assert.match(await page.locator('#request-title').textContent(),/Подбор рольганга/);
 await page.locator('#request-parameters').fill('Рольганг для заготовок длиной 3 м.');
 await close();
 await automatic.click();
 assert.equal(await page.locator('#request-parameters').inputValue(),'Автоматический станок. Заготовка 100 × 100 мм.');
 assert.equal(await page.locator('#request-email').inputValue(),'person@example.test');
 await close();
 await page.locator('.hero-actions [data-dialog="request-dialog"]').click();
 assert.match(await page.locator('#request-title').textContent(),/Заявка на изготовление/);
 assert.match(await page.locator('#request-parameters').inputValue(),/Ширина полотна: 27 мм/);
 await close();
 await rollers.click();
 assert.equal(await page.locator('#request-parameters').inputValue(),'Рольганг для заготовок длиной 3 м.');
 // Completing/resetting one category must preserve another category's unsent draft.
 await page.locator('#request-form').evaluate(form=>form.reset());
 await close();
 await automatic.click();
 assert.equal(await page.locator('#request-parameters').inputValue(),'Автоматический станок. Заготовка 100 × 100 мм.');
 await close();
 for(const route of ['privacy','consent'])assert.match(await readFile(`dist/${route}/index.html`,'utf8'),/оборудован/);
 assert.doesNotMatch(await readFile('php/private/request-handler.php','utf8'),/Subject\s*=\s*'Заявка на изготовление полотна/,'email subject must cover blades and equipment');
 assert.equal(requests,0);assert.deepEqual(errors,[]);
 await writeFile('qa/equipment.json',JSON.stringify({evidence,errors,requests},null,2));
 console.log('PASS: 4 equipment categories, 8 widths, navigation, category-specific modal copy, separate drafts and shared contacts. No submissions/API requests/mail.');
} finally {await browser.close();}
