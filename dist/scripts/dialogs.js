/* Shared dialog lifecycle for the landing page, legal pages and Cookie settings. */
let activeDialog = null;
let lockedPage = null;
const scrollOwners = new Set();
const dialogClosures = new WeakMap();
function lockPageScroll(owner, opener) {
  scrollOwners.add(owner);
  if (lockedPage) return;
  lockedPage = { x: scrollX, y: scrollY, opener };
  document.documentElement.style.setProperty('--scrollbar-gap', `${Math.max(0, innerWidth - document.documentElement.clientWidth)}px`);
  document.documentElement.classList.add('scroll-locked');
  document.body.classList.add('scroll-locked');
  scrollTo({ left: lockedPage.x, top: lockedPage.y, behavior: 'instant' });
}
function releasePageScroll(owner, returnFocus = true) {
  scrollOwners.delete(owner);
  if (scrollOwners.size || !lockedPage) return;
  const page = lockedPage;
  lockedPage = null;
  document.body.classList.remove('scroll-locked');
  document.documentElement.classList.remove('scroll-locked');
  document.documentElement.style.removeProperty('--scrollbar-gap');
  scrollTo({ left: page.x, top: page.y, behavior: 'instant' });
  if (!returnFocus) return;
  if (page.opener?.closest('#main-nav') && innerWidth < 1200) document.querySelector('.menu-toggle')?.focus({ preventScroll: true });
  else page.opener?.focus({ preventScroll: true });
}
function updateOverlayViewport() {
  const viewport = window.visualViewport;
  document.documentElement.style.setProperty('--overlay-viewport-height', `${viewport?.height || innerHeight}px`);
  document.documentElement.style.setProperty('--overlay-viewport-top', `${viewport?.offsetTop || 0}px`);
}
window.visualViewport?.addEventListener('resize', updateOverlayViewport);
window.visualViewport?.addEventListener('scroll', updateOverlayViewport);
window.addEventListener('resize', updateOverlayViewport);
updateOverlayViewport();
function openDialog(dialog, opener) {
  if (!dialog || dialog === activeDialog) return;
  document.dispatchEvent(new CustomEvent('site:dialog-open', { detail: { dialog, opener } }));
  lockPageScroll('dialog', opener);
  document.documentElement.classList.add('dialog-open');
  document.body.classList.add('dialog-open');
  const previous = activeDialog;
  activeDialog = dialog;
  if (previous?.open) {
    dialogClosures.get(previous)?.();
    previous.close();
  }
  dialog.classList.remove('is-closing');
  const autofocus = dialog.querySelector('[autofocus]');
  const compact = matchMedia('(max-width: 599px), (max-height: 599px)').matches;
  if (compact) autofocus?.removeAttribute('autofocus');
  dialog.showModal();
  if (compact) autofocus?.setAttribute('autofocus', '');
  dialog.scrollTop = 0;
  const form = dialog.querySelector('form');
  if (form) form.scrollTop = 0;
  const initial = compact ? dialog.querySelector('[data-close-dialog]') : autofocus;
  initial?.focus({ preventScroll: true });
  if (initial?.tagName === 'TEXTAREA') { initial.setSelectionRange(0, 0); initial.scrollTop = 0; }
}
function closeDialog(dialog) {
  if (!dialog?.open || dialogClosures.has(dialog)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  let timer;
  const clean = () => {
    clearTimeout(timer);
    dialog.removeEventListener('animationend', onEnd);
    dialogClosures.delete(dialog);
    dialog.classList.remove('is-closing');
  };
  const finish = () => { clean(); if (dialog.open) dialog.close(); };
  const onEnd = event => { if (event.target === dialog && event.animationName === 'dialog-out') finish(); };
  dialogClosures.set(dialog, clean);
  dialog.addEventListener('animationend', onEnd);
  dialog.classList.add('is-closing');
  timer = setTimeout(finish, 240);
}
document.addEventListener('click', event => {
  const opener = event.target.closest('[data-dialog]');
  if (opener) {
    event.preventDefault();
    const dialog = document.getElementById(opener.dataset.dialog);
    if (opener.dataset.legalTitle) document.querySelector('#legal-dialog-title').textContent = opener.dataset.legalTitle;
    openDialog(dialog, opener);
    return;
  }
  const closer = event.target.closest('[data-close-dialog]');
  if (closer) closeDialog(closer.closest('dialog'));
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    dialogClosures.get(dialog)?.();
    if (dialog !== activeDialog) return;
    activeDialog = null;
    document.body.classList.remove('dialog-open');
    document.documentElement.classList.remove('dialog-open');
    releasePageScroll('dialog');
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !activeDialog) return;
  const items = [...activeDialog.querySelectorAll('a[href],button,input:not([type="hidden"]),textarea,select,summary,[tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.disabled && element.tabIndex !== -1 && !element.closest('[aria-hidden="true"]') && element.getClientRects().length);
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
});
