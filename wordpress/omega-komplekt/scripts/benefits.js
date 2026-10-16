/* Manual, accessible benefit tabs with a restrained photographic interaction. */
(() => {
  const root=document.querySelector('#benefit-showcase');
  if(!root)return;
  const tablist=root.querySelector('.benefit-tablist');
  const tabs=[...tablist.querySelectorAll('button')];
  const panels=tabs.map(tab=>document.getElementById(tab.getAttribute('aria-controls')));
  const stage=root.querySelector('.benefit-panels');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  let active=0,gesture=null,frame=0;
  tablist.setAttribute('role','tablist');
  tabs.forEach((tab,index)=>{
    tab.setAttribute('role','tab');
    panels[index].setAttribute('role','tabpanel');
    panels[index].setAttribute('aria-labelledby',tab.id);
    tab.addEventListener('click',()=>select(index));
    const preload=()=>{panels[index].querySelector('img').loading='eager';};
    tab.addEventListener('pointerenter',preload,{once:true});
    tab.addEventListener('focus',preload,{once:true});
  });
  function select(index,focus=false){
    const next=(index+tabs.length)%tabs.length;
    const focusedPanel=panels[active].contains(document.activeElement);
    active=next;
    tabs.forEach((tab,i)=>{
      const selected=i===active;
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected?0:-1;
      panels[i].classList.toggle('is-active',selected);
      panels[i].setAttribute('aria-hidden',String(!selected));
      panels[i].inert=!selected;
    });
    panels[active].querySelector('img').loading='eager';
    if(focus)tabs[active].focus({preventScroll:true});
    else if(focusedPanel)panels[active].querySelector('a').focus({preventScroll:true});
  }
  tablist.addEventListener('keydown',event=>{
    const tab=event.target.closest('[role="tab"]');
    if(!tab)return;
    const current=tabs.indexOf(tab);
    let next;
    if(event.key==='ArrowRight')next=current+1;
    else if(event.key==='ArrowLeft')next=current-1;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();select(next,true);
  });
  stage.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch'||event.target.closest('a,button,input,summary'))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now()};
  });
  stage.addEventListener('pointerup',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    const elapsed=performance.now()-gesture.time;gesture=null;
    if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4&&elapsed<1200)select(active+(dx<0?1:-1));
  });
  stage.addEventListener('pointercancel',()=>{gesture=null;});
  function resetPointer(){
    cancelAnimationFrame(frame);frame=0;
    for(const name of ['--benefit-shift-x','--benefit-shift-y','--benefit-spot-x','--benefit-spot-y'])root.style.removeProperty(name);
  }
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||reduced.matches||!fine.matches)return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      const rect=stage.getBoundingClientRect();
      const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
      const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
      root.style.setProperty('--benefit-shift-x',`${(x-.5)*12}px`);
      root.style.setProperty('--benefit-shift-y',`${(y-.5)*8}px`);
      root.style.setProperty('--benefit-spot-x',`${x*100}%`);
      root.style.setProperty('--benefit-spot-y',`${y*100}%`);
      frame=0;
    });
  });
  stage.addEventListener('pointerleave',()=>{gesture=null;resetPointer();});
  reduced.addEventListener('change',resetPointer);
  fine.addEventListener('change',resetPointer);
  select(0);root.classList.add('is-ready');
})();
