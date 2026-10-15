/* Compact navigation shares the dialog scroll lock during menu → form transitions. */
const navHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('#main-nav');
const navBackdrop = document.querySelector('.nav-backdrop');
const mobileNavigation = matchMedia('(max-width: 1199px)');
let navState = 'closed';
let navTimer;
let navCloseReturnFocus = false;
let afterNavigationClose;
const navInert = new Map();
function setNavigationBackground(inert) {
  if (inert) {
    document.querySelectorAll('main,.site-footer,.cookie-banner,.header-inner > .brand,.header-phone,.skip-link').forEach(element => {
      navInert.set(element, element.inert); element.inert = true;
    });
  } else {
    navInert.forEach((value, element) => {element.inert = value;}); navInert.clear();
  }
}
function syncNavigationAvailability() {
  navPanel.inert = mobileNavigation.matches && navState === 'closed';
  if (navPanel.inert) navPanel.setAttribute('aria-hidden', 'true');
  else navPanel.removeAttribute('aria-hidden');
}
function finishNavigationClose(returnFocus) {
  if (navState !== 'closing') return;
  clearTimeout(navTimer);
  navState = 'closed';
  navPanel.classList.remove('is-closing');
  navHeader.classList.remove('navigation-open','navigation-closing'); document.body.classList.remove('navigation-open');
  setNavigationBackground(false); syncNavigationAvailability();
  releasePageScroll('navigation', returnFocus);
  const callback = afterNavigationClose; afterNavigationClose = null; callback?.();
}
function setMenu(open, returnFocus = false, afterClose = null) {
  if (open && !mobileNavigation.matches) return;
  if (open) {
    if (navState === 'open') return;
    clearTimeout(navTimer); afterNavigationClose = null;
    lockPageScroll('navigation', menuToggle);
    if (!navInert.size) setNavigationBackground(true);
    navState = 'open'; navPanel.inert = false; navPanel.removeAttribute('aria-hidden');
    navPanel.scrollTop = 0;
    navPanel.classList.remove('is-closing');
    navHeader.classList.remove('navigation-closing');
    navHeader.classList.add('navigation-open'); document.body.classList.add('navigation-open');
    menuToggle.setAttribute('aria-expanded','true'); menuToggle.setAttribute('aria-label','Закрыть меню');
    requestAnimationFrame(() => {
      if (navState !== 'open') return;
      navPanel.classList.add('is-open'); navPanel.querySelector('a')?.focus({preventScroll:true});
    });
    return;
  }
  if (afterClose) afterNavigationClose = afterClose;
  if (navState === 'closed') {afterNavigationClose?.(); afterNavigationClose = null; return;}
  if (navState === 'closing') return;
  navState = 'closing';
  navCloseReturnFocus = returnFocus;
  navHeader.classList.add('navigation-closing');
  menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Открыть меню');
  navPanel.classList.remove('is-open'); navPanel.classList.add('is-closing');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !mobileNavigation.matches) finishNavigationClose(returnFocus);
  else navTimer = setTimeout(()=>finishNavigationClose(returnFocus),parseFloat(getComputedStyle(navPanel).transitionDuration) * 1000 + 50);
}
menuToggle.addEventListener('click',()=>setMenu(navState !== 'open',true));
navBackdrop.addEventListener('click',()=>setMenu(false,true));
navPanel.addEventListener('transitionend',event=>{
  if (event.target===navPanel && event.propertyName==='transform') finishNavigationClose(navCloseReturnFocus);
});
navPanel.addEventListener('click',event=>{
  const link = event.target.closest('a');
  if (!link || !mobileNavigation.matches) return;
  const href = link.getAttribute('href');
  if (href.startsWith('#') && !link.hasAttribute('data-dialog')) {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    setMenu(false,false,()=>{
      history.pushState(null,'',href);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
      target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
  } else setMenu(false,false);
});
document.addEventListener('keydown',event=>{
  if (navState !== 'open' || activeDialog) return;
  if (event.key === 'Escape') {event.preventDefault();setMenu(false,true);}
  if (event.key !== 'Tab') return;
  const items = [...navPanel.querySelectorAll('a,button'),menuToggle].filter(element=>element.getClientRects().length);
  const first=items[0],last=items.at(-1);
  if (event.shiftKey && (document.activeElement===first || !items.includes(document.activeElement))) {event.preventDefault();last.focus();}
  else if (!event.shiftKey && (document.activeElement===last || !items.includes(document.activeElement))) {event.preventDefault();first.focus();}
});
mobileNavigation.addEventListener('change',event=>{
  if (!event.matches) {setMenu(false,false);finishNavigationClose(false);}
  syncNavigationAvailability();
});
syncNavigationAvailability();
