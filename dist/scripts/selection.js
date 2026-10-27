/* The blade form stays in its dialog; the live reference table keeps one owner. */
(() => {
  const dialog = document.querySelector('#selection-dialog');
  const form = document.querySelector('#order-form');
  const guide = document.querySelector('#pitch-guide');
  if (!dialog || !form || !guide) return;
  const pitchSlot = dialog.querySelector('#selection-pitch-slot');
  const details = dialog.querySelector('.selection-guide');
  const pieces = [guide.querySelector('.pitch-card'), guide.querySelector('.pitch-break-in')];
  const anchors = pieces.map(piece => {
    const placeholder = document.createElement('div');
    placeholder.className = 'selection-placeholder';
    placeholder.hidden = true;
    placeholder.setAttribute('aria-hidden', 'true');
    piece.before(placeholder);
    return placeholder;
  });
  let mounted = false;

  function mount(opener) {
    // Capture page position before moving content, including openers near the footer.
    lockPageScroll('dialog', opener);
    pieces.forEach((piece, index) => {
      const style = getComputedStyle(piece);
      anchors[index].style.height = `${piece.getBoundingClientRect().height}px`;
      anchors[index].style.marginTop = style.marginTop;
      anchors[index].style.marginBottom = style.marginBottom;
      anchors[index].hidden = false;
      pitchSlot.append(piece);
    });
    details.open = false;
    mounted = true;
  }

  function restore() {
    if (!mounted) return;
    pieces.forEach((piece, index) => {
      anchors[index].after(piece);
      anchors[index].hidden = true;
    });
    details.open = false;
    mounted = false;
  }

  document.addEventListener('site:dialog-open', event => {
    if (event.detail.dialog === dialog) mount(event.detail.opener);
    else restore();
  });
  // Restore the choice to the page before the shared close handler returns focus.
  dialog.addEventListener('close', restore, {capture:true});
  document.addEventListener('site:pitch-select', event => {
    if (!dialog.open || event.defaultPrevented) return;
    details.open = false;
    const trigger = form.querySelector('.tpi-trigger');
    trigger.focus({ preventScroll: true });
    trigger.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
})();
