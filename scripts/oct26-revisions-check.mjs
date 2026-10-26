import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {isolateYandexMap} from './map-fixture.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(resolve(process.env.CODEX_NODE_MODULES||'C:/Users/bahti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','playwright'));
const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
const page=await browser.newPage({reducedMotion:'reduce'});
const base=process.env.OMEGA_REVISIONS_URL||'http://127.0.0.1:4173/';
const baseline=process.argv.includes('--baseline');
const errors=[],evidence=[];let submissions=0;
await isolateYandexMap(page);
await page.route('**/*',route=>{
 const request=route.request();
 if(!['GET','HEAD'].includes(request.method())||/\/(api|wp-json)\//.test(new URL(request.url()).pathname)){submissions++;return route.abort();}
 return route.continue();
});
page.on('pageerror',e=>errors.push(e.message));
async function headingGeometry(selector){
 return page.locator(selector).evaluate(header=>{
  const close=header.querySelector('.dialog-close').getBoundingClientRect();
  const text=[];
  for(const el of header.querySelectorAll('h2,[id$="intro"]')){
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){
    const range=document.createRange();range.selectNodeContents(walker.currentNode);
    for(const box of range.getClientRects())if(box.width&&box.height)text.push(box.toJSON());
   }
  }
  return {close:close.toJSON(),overlap:text.filter(r=>r.left<close.right&&r.right>close.left&&r.top<close.bottom&&r.bottom>close.top),text};
 });
}
try{
 await mkdir('qa',{recursive:true});
 for(const [width,height] of (baseline?[[320,900],[390,844]]:[[1440,1000],[1200,900],[768,900],[599,900],[390,844],[360,800],[320,900],[320,568],[844,390]])){
  await page.setViewportSize({width,height});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('#cookie-banner').isVisible())await page.locator('#cookie-banner [data-cookie-save]').click();
  const headerControls=await page.locator('.header-inner').evaluate(el=>({box:el.getBoundingClientRect().toJSON(),items:[...el.children].filter(c=>!c.matches('nav')&&getComputedStyle(c).display!=='none'&&getComputedStyle(c).visibility==='visible').map(c=>c.getBoundingClientRect().toJSON())}));
  for(const item of headerControls.items)assert.ok(item.left>=headerControls.box.left-1&&item.right<=headerControls.box.right+1,`${width}: header controls fit even with a native scrollbar`);
  for(let i=1;i<headerControls.items.length;i++)assert.ok(headerControls.items[i].left>=headerControls.items[i-1].right,'header controls do not overlap');
  const actions=await page.locator('.hero-actions .button').evaluateAll(links=>links.map(link=>{
   const range=document.createRange();range.selectNodeContents(link.firstChild);
   return {box:link.getBoundingClientRect().toJSON(),lines:[...range.getClientRects()].length};
  }));
  if(!baseline&&[320,390].includes(width)&&height>600)await page.locator('.hero-actions').screenshot({path:`qa/oct26-actions-${width}.png`});
  if(baseline)await page.locator('.hero-actions').screenshot({path:`qa/oct26-before-buttons-${width}.png`});
  await page.locator('.hero-actions [data-dialog="selection-dialog"]').click();
  const heading=await headingGeometry('.selection-heading');
  if(baseline)await page.screenshot({path:`qa/oct26-before-selection-${width}.png`});
  if(!baseline){
   assert.deepEqual(heading.overlap,[],`${width}: close button must never cover title/intro`);
   assert.ok(heading.close.width>=44&&heading.close.height>=44,'usable close target');
   if(width<=599){
    assert.ok(actions[1].box.top>=actions[0].box.bottom,'mobile main actions stack vertically');
    assert.ok(Math.abs(actions[0].box.width-actions[1].box.width)<=1,'equal action widths');
    assert.ok(actions.every(a=>a.lines===1),'main action labels stay on one line');
    const tpi=await page.locator('#selection-dialog .tpi-trigger').boundingBox();
    const body=await page.locator('.selection-body').boundingBox();
    assert.ok(tpi.width>=body.width*.8,'TPI field uses a full mobile row');
    const caption=await page.locator('#selection-dialog .tpi-caption').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));
    assert.ok(caption.height<=caption.line+1,'TPI caption does not wrap');
   }
   const geometry=await page.locator('#selection-dialog').evaluate(el=>({box:el.getBoundingClientRect().toJSON(),overflow:el.scrollWidth>el.clientWidth+1,body:el.querySelector('.selection-body').getBoundingClientRect().toJSON(),pageWidth:document.documentElement.scrollWidth}));
   assert.ok(geometry.box.y>=0&&geometry.box.bottom<=height+1,'selection dialog fits viewport');
   assert.equal(geometry.overflow,false);assert.ok(geometry.pageWidth<=width);
   assert.ok(geometry.body.height>=100,'form has a useful scroll area on short screens');
   await page.locator('#selection-dialog .tpi-trigger').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
   await page.locator('#selection-dialog .tpi-trigger').click();
   const popup=await page.locator('#selection-dialog .tpi-options').boundingBox();
   const scrollport=await page.locator('.selection-body').boundingBox();
   assert.ok(popup.y>=scrollport.y-1&&popup.y+popup.height<=scrollport.y+scrollport.height+1,`${width}x${height}: TPI popup stays within modal scroll area ${JSON.stringify({popup,scrollport})}`);
   assert.ok(popup.x>=scrollport.x-1&&popup.x+popup.width<=scrollport.x+scrollport.width+1,'TPI popup stays within modal width');
   assert.ok(popup.height>=44,'TPI choices remain usable');
   await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
   assert.equal(await page.locator('#order-form [name="tpi"]').inputValue(),'3/4 TPI');
   await page.locator('#order-material').fill('Сталь');
   await page.locator('#order-email').fill('person@example.test');
   await page.locator('#selection-dialog .form-bottom').scrollIntoViewIfNeeded();
   assert.equal(await page.locator('#selection-dialog [type="submit"]').isVisible(),true);
   await page.locator('.selection-body').evaluate(el=>el.scrollTop=0);
   if([320,390,768].includes(width)&&height>600)await page.screenshot({path:`qa/oct26-selection-${width}.png`});
   evidence.push({width,height,actions,heading,geometry});
  }
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.classList.contains('scroll-locked'));
  if(baseline){console.log(JSON.stringify({actions,heading},null,2));continue;}
  assert.equal(await page.locator('#order #order-form').count(),1,'shared form returns to page');
  assert.equal(await page.locator('#order-material').inputValue(),'Сталь','selection draft survives close');
  assert.equal(await page.locator('#machines,[data-machine]').count(),0,'removed brand section');
  assert.equal(await page.locator('a[href="#machines"]').count(),0,'no dead brand links');
  assert.doesNotMatch(await page.locator('main').innerText(),/инженерн/i);
  assert.match(await page.locator('.production-copy').innerText(),/автоматизированном высокоточном оборудовании/);
  assert.match(await page.locator('.production-copy').innerText(),/максимальный ресурс и надёжность/);
  assert.equal(await page.locator('.equipment-types > .equipment-card').count(),5);
  const roller=page.locator('.equipment-types > #roller-conveyors.equipment-card');
  assert.equal(await roller.count(),1,'rollers use the same card grid');
  assert.match(await roller.innerText(),/Неприводные рольганги[\s\S]*Россия/);
  assert.equal(await roller.locator('a,button').count(),0,'no selection action for rollers');
  const rollerImage=await roller.locator('img').evaluate(async image=>{image.loading='eager';await image.decode();return image.naturalWidth;});
  assert.ok(rollerImage>=300,'roller product photograph loads at full useful resolution');
  if([320,390,1440].includes(width)&&height>600)await roller.screenshot({path:`qa/oct26-roller-${width}.png`,animations:'disabled'});
  assert.doesNotMatch(await page.locator('.equipment-magnetic').innerText(),/LENZ|Steyr|Модель/);
  assert.match(await page.locator('.equipment-magnetic .equipment-feed').innerText(),/Назначение[\s\S]*Сверление металла/);
  await page.locator('.equipment-magnetic [data-request-equipment]').click();
  assert.doesNotMatch(await page.locator('#request-parameters').inputValue(),/LENZ|Steyr/);
  const requestHeading=await headingGeometry('.request-heading');assert.deepEqual(requestHeading.overlap,[],'request header also keeps clear of its close button');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.documentElement.classList.contains('scroll-locked'));
 }
 if(baseline){console.log('Baseline screenshots captured.');}else{
 assert.deepEqual(errors,[]);assert.equal(submissions,0);
 await writeFile('qa/oct26-revisions.json',JSON.stringify({base,evidence,errors,submissions},null,2));
 console.log(`PASS: October 26 content/catalog and mobile conversion/selection UX at ${evidence.length} sizes. No applications/API/SMTP.`);
 }
}finally{await browser.close();}
