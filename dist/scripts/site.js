/* Demonstration only: form data is never transmitted or stored. */
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
window.matchMedia('(min-width: 900px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
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
    machines.forEach(machine => machine.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    document.querySelector('.selected-machine-name').textContent = name;
    document.querySelector('.machine-word text').textContent = name;
    status.hidden = true;
  });
});
orderForm.addEventListener('submit', event => {
  event.preventDefault();
  closeDropdown();
  status.textContent = 'Это демонстрационная форма. Заявка не отправлена. Рабочий прием заказов подключим после утверждения сайта.';
  status.hidden = false;
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

/* Native dialogs retain the contact and delivery content without extra bands. */
const dialogOpeners = new Map();
function openDialog(dialog, opener) {
  closeDropdown();
  setMenu(false);
  dialogOpeners.set(dialog, opener);
  document.documentElement.style.setProperty('--scrollbar-gap', `${window.innerWidth - document.documentElement.clientWidth}px`);
  document.body.classList.add('dialog-open');
  dialog.showModal();
}

document.addEventListener('click', event => {
  const opener = event.target.closest('[data-dialog]');
  if (opener) {
    event.preventDefault();
    const dialog = document.getElementById(opener.dataset.dialog);
    if (opener.dataset.legalTitle) document.querySelector('#legal-dialog-title').textContent = opener.dataset.legalTitle;
    openDialog(dialog, opener);
  }
  const closer = event.target.closest('[data-close-dialog]');
  if (closer) closer.closest('dialog').close();
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    document.documentElement.style.removeProperty('--scrollbar-gap');
    const opener = dialogOpeners.get(dialog);
    if (opener?.closest('#main-nav') && window.innerWidth < 900) menuButton.focus({ preventScroll: true });
    else opener?.focus({ preventScroll: true });
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
