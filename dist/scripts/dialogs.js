/* Shared dialog lifecycle for the landing page, legal pages and Cookie settings. */
let activeDialog = null;
let lockedPage = null;
const dialogClosures = new WeakMap();
function openDialog(dialog, opener) {
  if (!dialog || dialog === activeDialog) return;
  document.dispatchEvent(new CustomEvent('site:dialog-open', { detail: { dialog, opener } }));
  if (!lockedPage) {
    lockedPage = { x: scrollX, y: scrollY, opener };
    document.documentElement.style.setProperty('--scrollbar-gap', `${Math.max(0, innerWidth - document.documentElement.clientWidth)}px`);
    document.documentElement.classList.add('dialog-open');
    document.body.classList.add('dialog-open');
  }
  const previous = activeDialog;
  activeDialog = dialog;
  if (previous?.open) {
    dialogClosures.get(previous)?.();
    previous.close();
  }
  dialog.classList.remove('is-closing');
  dialog.showModal();
  dialog.scrollTop = 0;
  const form = dialog.querySelector('form');
  if (form) form.scrollTop = 0;
  const initial = dialog.querySelector('[autofocus]');
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
    const page = lockedPage;
    lockedPage = null;
    document.body.classList.remove('dialog-open');
    document.documentElement.classList.remove('dialog-open');
    document.documentElement.style.removeProperty('--scrollbar-gap');
    scrollTo({ left: page.x, top: page.y, behavior: 'instant' });
    if (page.opener?.closest('#main-nav') && innerWidth < 900) document.querySelector('.menu-toggle')?.focus({ preventScroll: true });
    else page.opener?.focus({ preventScroll: true });
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
