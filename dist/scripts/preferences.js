/* Only a local preference record is stored. No analytics or advertising runs. */
(() => {
  const key = 'omega-cookie-preferences';
  const banner = document.querySelector('#cookie-banner');
  const settings = document.querySelector('#cookie-settings');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let hiding = false;
  function getChoice() {
    try {
      const choice = JSON.parse(localStorage.getItem(key));
      return choice?.version === 1 && choice.expiresAt > Date.now() ? choice : null;
    } catch { return null; }
  }
  function showBanner() { hiding = false; banner.classList.remove('is-closing'); banner.hidden = false; }
  function hideBanner() {
    if (banner.hidden || hiding) return;
    hiding = true;
    const finish = () => { banner.hidden = true; banner.classList.remove('is-closing'); hiding = false; };
    if (reducedMotion.matches) finish();
    else {
      banner.classList.add('is-closing');
      banner.addEventListener('animationend', finish, { once: true });
      setTimeout(() => { if (hiding) finish(); }, 250);
    }
  }
  function saveChoice() {
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, essential: true, analytics: false, advertising: false, savedAt: Date.now(), expiresAt: Date.now() + 180 * 24 * 60 * 60 * 1000 }));
    } catch { /* The site still works when browser storage is unavailable. */ }
    hideBanner();
  }
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    if (typeof openDialog === 'function') openDialog(settings, button);
    else settings.showModal();
  }));
  document.querySelectorAll('[data-cookie-save]').forEach(button => button.addEventListener('click', () => {
    saveChoice();
    if (settings.open) {
      if (typeof closeDialog === 'function') closeDialog(settings);
      else settings.close();
    }
  }));
  document.querySelector('[data-cookie-clear]').addEventListener('click', () => {
    try { localStorage.removeItem(key); } catch { /* Storage may be blocked. */ }
    showBanner();
    if (typeof closeDialog === 'function') closeDialog(settings);
    else settings.close();
  });
  settings.addEventListener('close', () => {
    // The original banner button may have disappeared after saving.
    if (banner.hidden) document.querySelector('.cookie-reopen')?.focus({ preventScroll: true });
  });
  if (!getChoice()) {
    try { localStorage.removeItem(key); } catch { /* Storage may be blocked. */ }
    showBanner();
  }
})();
