/* Landing-page interactions and the PHP request workflow. */
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
  if (returnFocus) menuButton.focus({ preventScroll: true });
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });
window.matchMedia('(min-width: 1200px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const orderForm = document.querySelector('#order-form');
const comment = orderForm.elements.comment;
const status = orderForm.querySelector('.form-status');
const machines = [...document.querySelectorAll('[data-machine]')];
machines.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const name = link.dataset.machine;
    const text = comment.value.replace(/^Станок: [^\n]*(\n|$)/, '');
    comment.value = `Станок: ${name}${text ? `\n${text}` : ''}`;
    orderForm.dispatchEvent(new Event('input', { bubbles: true }));
    machines.forEach(machine => machine.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    document.querySelector('.selected-machine-name').textContent = name;
    document.querySelector('.machine-word text').textContent = name;
    fitMachineWord();
    status.hidden = true;
  });
});

/* Accessible single-select combobox with keyboard and pointer navigation. */
const dropdown = document.querySelector('.tpi-dropdown');
const trigger = dropdown.querySelector('.tpi-trigger');
const listbox = dropdown.querySelector('.tpi-options');
const options = [...listbox.querySelectorAll('[role="option"]')];
const caption = dropdown.querySelector('.tpi-caption');
let selectedIndex = 0;
let activeIndex = 0;

function setActive(index) {
  activeIndex = Math.max(0, Math.min(options.length - 1, index));
  options.forEach((option, item) => option.classList.toggle('is-active', item === activeIndex));
  trigger.setAttribute('aria-activedescendant', options[activeIndex].id);
  const option = options[activeIndex];
  if (option.offsetTop < listbox.scrollTop) listbox.scrollTop = option.offsetTop;
  if (option.offsetTop + option.offsetHeight > listbox.scrollTop + listbox.clientHeight) {
    listbox.scrollTop = option.offsetTop + option.offsetHeight - listbox.clientHeight;
  }
}

function openDropdown() {
  listbox.hidden = false;
  listbox.classList.remove('is-above');
  trigger.setAttribute('aria-expanded', 'true');
  const rect = trigger.getBoundingClientRect();
  const height = listbox.getBoundingClientRect().height;
  if (window.innerHeight - rect.bottom < height + 12 && rect.top > height + 12) listbox.classList.add('is-above');
  setActive(selectedIndex);
}

function closeDropdown(returnFocus = false) {
  listbox.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.removeAttribute('aria-activedescendant');
  if (returnFocus) trigger.focus({ preventScroll: true });
}

function selectOption(index) {
  selectedIndex = index;
  orderForm.elements.tpi.value = options[index].dataset.value;
  caption.textContent = options[index].textContent;
  options.forEach((option, item) => option.setAttribute('aria-selected', String(item === index)));
  closeDropdown(true);
  orderForm.dispatchEvent(new Event('input', { bubbles: true }));
}

trigger.addEventListener('click', () => listbox.hidden ? openDropdown() : closeDropdown());
options.forEach((option, index) => {
  option.addEventListener('click', () => selectOption(index));
  option.addEventListener('pointermove', () => setActive(index));
});
trigger.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !listbox.hidden) {
    event.preventDefault(); event.stopPropagation(); closeDropdown(true); return;
  }
  if (event.key === 'Tab') { closeDropdown(); return; }
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const wasClosed = listbox.hidden;
    if (wasClosed) openDropdown();
    if (event.key === 'Home') setActive(0);
    else if (event.key === 'End') setActive(options.length - 1);
    else if (!wasClosed) setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    return;
  }
  if (['Enter', ' '].includes(event.key) && !listbox.hidden) {
    event.preventDefault(); selectOption(activeIndex); return;
  }
  if (event.key.length === 1 && !listbox.hidden) {
    const match = options.findIndex(option => option.textContent.toLocaleLowerCase('ru').startsWith(event.key.toLocaleLowerCase('ru')));
    if (match >= 0) { event.preventDefault(); setActive(match); }
  }
});
document.addEventListener('pointerdown', event => { if (!dropdown.contains(event.target)) closeDropdown(); });
window.addEventListener('resize', () => closeDropdown());

/* One scroll lock survives transitions between dialogs, retaining the page opener. */
const requestDialog = document.querySelector('#request-dialog');
const requestForm = document.querySelector('#request-form');
const requestStatus = requestForm.querySelector('.request-status');
let lastOrderSummary = '';

function prepareRequest(opener, forceTransfer = false) {
  const lines = [];
  if (opener?.hasAttribute('data-request-machine') && !/^Станок:/.test(comment.value)) {
    lines.push(`Станок: ${document.querySelector('.selected-machine-name').textContent}`);
  }
  const orderSummary = collectOrderParameters(orderForm);
  if (orderSummary) lines.push(orderSummary);
  const summary = lines.join('\n');
  if (summary && (forceTransfer || summary !== lastOrderSummary || !requestForm.elements.parameters.value.trim())) {
    requestForm.elements.parameters.value = summary;
    lastOrderSummary = summary;
    setRequestFieldError(requestForm, 'parameters', '');
  }
  requestStatus.hidden = true;
}

document.addEventListener('site:dialog-open', event => {
  closeDropdown();
  setMenu(false);
  if (event.detail.dialog === requestDialog) prepareRequest(event.detail.opener);
});

attachRequestWorkflow(requestForm, () => requestForm.elements.parameters.value.trim());
attachRequestWorkflow(orderForm, () => collectOrderParameters(orderForm));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});

/* Keep every brand inside the SVG frame, including the long names. */
function fitMachineWord() {
  const text = document.querySelector('.machine-word text');
  const view = text.ownerSVGElement.viewBox.baseVal;
  let size = 170;
  text.setAttribute('font-size', String(size));
  text.setAttribute('y', String(view.height / 2));
  for (let attempt = 0; attempt < 4; attempt++) {
    const box = text.getBBox();
    const scale = Math.min(1, view.width * .84 / box.width, view.height * .8 / box.height);
    if (scale >= .999) break;
    size *= scale;
    text.setAttribute('font-size', String(size));
  }
  const box = text.getBBox();
  text.setAttribute('y', String(view.height - box.y - box.height / 2));
}
fitMachineWord();
document.fonts.ready.then(fitMachineWord);
orderForm.addEventListener('reset', () => {
  selectedIndex = 0; activeIndex = 0;
  caption.textContent = options[0].textContent;
  options.forEach((option,index) => option.setAttribute('aria-selected', String(index === 0)));
  closeDropdown();
  lastOrderSummary = '';
});
