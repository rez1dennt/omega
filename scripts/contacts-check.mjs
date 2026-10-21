import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {isolateYandexMap} from './map-fixture.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES,'playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page=await browser.newPage();
const live=process.argv.includes('--live-map');
if(!live)await isolateYandexMap(page);
const evidence=[],errors=[];
let leads=0;
page.on('request',r=>{if(r.url().includes('127.0.0.1:4173/api/')||r.url().includes('omegakomplekt@mail.ru'))leads++;});
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/request.php',r=>r.abort());
try{
 await mkdir('qa',{recursive:true});
 for(const width of live?[1440,390]:[1440,1280,1024,768,390,360,320]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
  const contacts=page.locator('#contacts');
  assert.equal(await contacts.evaluate(el=>el.tagName),'SECTION','contacts must be a permanent page section');
  assert.equal(await page.locator('dialog#contacts,[data-dialog="contacts"]').count(),0,'contacts must never open as a modal');
  assert.equal(await contacts.locator('h2').textContent(),'Контакты');
  for(const text of ['141','314','6455054459','1116455002916','omegakomplekt@mail.ru','9:00–17:00'])assert.ok((await contacts.textContent()).includes(text),`contact details include ${text}`);
  assert.equal(await contacts.locator('a[href="tel:+79172012100"]').count(),1);
  assert.equal(await contacts.locator('a[href="mailto:omegakomplekt@mail.ru"]').count(),1);
  const map=contacts.locator('iframe');
  assert.equal(await map.count(),1);
  const url=new URL(await map.getAttribute('src'));
  assert.equal(url.origin,'https://yandex.ru');assert.equal(url.pathname,'/map-widget/v1/');
  assert.equal(url.searchParams.get('ll'),'45.985011,51.535232');
  assert.equal(url.searchParams.get('ouri'),'ymapsbm1://geo?data=IgoNp_A3QhUUJE5C');
  assert.equal(await map.getAttribute('loading'),'lazy');
  assert.match(await map.getAttribute('title'),/Саратов.*141/);
  const route=new URL(await contacts.locator('[data-map-route]').getAttribute('href'));
  assert.equal(route.searchParams.get('rtext'),'~51.535232,45.985011');
  if(await page.locator('#cookie-banner').isVisible())await page.locator('#cookie-banner [data-cookie-save]').click();
  if(await page.locator('.menu-toggle').isVisible())await page.locator('.menu-toggle').click();
  await page.locator('#main-nav a[href="#contacts"]').click();
  await page.waitForFunction(()=>location.hash==='#contacts');
  await page.waitForFunction(()=>{
   const section=document.querySelector('#contacts').getBoundingClientRect();
   return section.top>=0&&section.top<200;
  });
  assert.equal(await page.locator('dialog[open]').count(),0);
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('dialog-open')),false);
  assert.equal(await contacts.evaluate(el=>el===document.activeElement),true,'anchor focus goes to the visible section');
  const geometry=await contacts.evaluate(el=>({
   scrollWidth:document.documentElement.scrollWidth,width:innerWidth,
   map:el.querySelector('iframe').getBoundingClientRect().toJSON(),
   clipped:[...el.querySelectorAll('h2,h3,p,a')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),
  }));
  assert.ok(geometry.scrollWidth<=width);assert.deepEqual(geometry.clipped,[]);
  assert.ok(geometry.map.height>=300&&geometry.map.width>200);
  if(live){
   await map.scrollIntoViewIfNeeded();
   const frame=await (await map.elementHandle()).contentFrame();
   await frame.waitForLoadState('load',{timeout:30000});
   await frame.locator('canvas').first().waitFor({state:'visible',timeout:30000});
   await frame.getByText('Большая Садовая улица, 141',{exact:false}).first().waitFor({state:'visible',timeout:30000});
   await frame.waitForFunction(()=>{
    const canvas=document.querySelector('canvas');
    return canvas&&canvas.width>=document.documentElement.clientWidth-1&&canvas.height>=innerHeight-1;
   });
   await frame.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await contacts.screenshot({path:`qa/contacts-live-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
  }else if([1440,768,360,320].includes(width))await contacts.screenshot({path:`qa/contacts-${width}.png`,animations:'disabled',style:'.site-header,.skip-link{visibility:hidden!important}'});
  evidence.push({width,geometry,live});
 }
 assert.match(await readFile('dist/privacy/index.html','utf8'),/Яндекс/);
 assert.equal(leads,0);
 if(!live)assert.deepEqual(errors,[]);
 await writeFile(`qa/contacts${live?'-live':''}.json`,JSON.stringify({evidence,errors,leads},null,2));
 console.log(`PASS: permanent contacts and exact Yandex address at ${evidence.length} widths; ${live?'LIVE map canvas and address verified':'layout, navigation, keyboard focus and links verified with isolated widget'}. No applications or SMTP.`);
}finally{await browser.close();}
