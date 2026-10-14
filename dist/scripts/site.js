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
  prepareRequest(null, true);
  openDialog(requestDialog, orderForm.querySelector('button[type="submit"]'));
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

/* One scroll lock survives transitions between dialogs, retaining the page opener. */
const requestDialog = document.querySelector('#request-dialog');
const requestForm = document.querySelector('#request-form');
const requestStatus = requestForm.querySelector('.request-status');
const errorSummary = requestForm.querySelector('.request-error-summary');
let activeDialog = null;
let lockedPage = null;
let lastOrderSummary = '';

function fieldError(field, message) {
  const error = document.getElementById(`request-${field.name}-error`);
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  error.textContent = message;
  error.hidden = !message;
}

function prepareRequest(opener, forceTransfer = false) {
  const lines = [];
  if (opener?.hasAttribute('data-request-machine') && !/^Станок:/.test(comment.value)) {
    lines.push(`Станок: ${document.querySelector('.selected-machine-name').textContent}`);
  }
  if (orderForm.elements.width.value) lines.push(`Ширина полотна: ${orderForm.elements.width.value} мм`);
  const length = orderForm.elements.namedItem('length').value;
  if (length) lines.push(`Длина полотна: ${length} мм`);
  if (orderForm.elements.tpi.value) lines.push(`Шаг зуба: ${orderForm.elements.tpi.value}`);
  if (orderForm.elements.material.value.trim()) lines.push(`Материал: ${orderForm.elements.material.value.trim()}`);
  if (comment.value.trim()) lines.push(comment.value.trim());
  const summary = lines.join('\n');
  if (summary && (forceTransfer || summary !== lastOrderSummary)) {
    requestForm.elements.parameters.value = summary;
    lastOrderSummary = summary;
    fieldError(requestForm.elements.parameters, '');
  }
  requestStatus.hidden = true;
}

function openDialog(dialog, opener) {
  if (!dialog || dialog === activeDialog) return;
  closeDropdown();
  setMenu(false);
  if (!lockedPage) {
    lockedPage = { x: window.scrollX, y: window.scrollY, opener };
    const gutter = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--scrollbar-gap', `${gutter}px`);
    document.documentElement.classList.add('dialog-open');
    document.body.classList.add('dialog-open');
  }
  const previous = activeDialog;
  activeDialog = dialog;
  if (previous?.open) previous.close();
  dialog.showModal();
  dialog.scrollTop = 0;
  if (dialog === requestDialog) {
    requestForm.scrollTop = 0;
    const parameters = requestForm.elements.parameters;
    parameters.focus({ preventScroll: true });
    parameters.setSelectionRange(0, 0);
    parameters.scrollTop = 0;
  }
}

document.addEventListener('click', event => {
  const opener = event.target.closest('[data-dialog]');
  if (opener) {
    event.preventDefault();
    const dialog = document.getElementById(opener.dataset.dialog);
    if (opener.dataset.legalTitle) document.querySelector('#legal-dialog-title').textContent = opener.dataset.legalTitle;
    if (dialog === requestDialog) prepareRequest(opener);
    openDialog(dialog, opener);
    return;
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
    if (dialog !== activeDialog) return;
    activeDialog = null;
    const page = lockedPage;
    lockedPage = null;
    document.body.classList.remove('dialog-open');
    document.documentElement.classList.remove('dialog-open');
    document.documentElement.style.removeProperty('--scrollbar-gap');
    // Override smooth anchor scrolling for an exact, immediate restoration.
    window.scrollTo({ left: page.x, top: page.y, behavior: 'instant' });
    const opener = page.opener;
    if (opener?.closest('#main-nav') && window.innerWidth < 900) menuButton.focus({ preventScroll: true });
    else opener?.focus({ preventScroll: true });
  });
});

function validationMessage(field) {
  if (field.name === 'consent') return field.checked ? '' : 'Подтвердите согласие на обработку данных.';
  if (!field.value.trim()) return 'Заполните это поле.';
  if (field.name === 'email' && field.validity.typeMismatch) return 'Введите e-mail в формате name@example.ru.';
  if (field.name === 'phone' && (!/^[+\d\s()-]+$/.test(field.value) || !/^(?:[78]\d{10}|\d{10})$/.test(field.value.replace(/\D/g, '')))) {
    return 'Введите телефон: +7 и 10 цифр номера.';
  }
  return '';
}

const requiredFields = [...requestForm.querySelectorAll('[required]')];
requiredFields.forEach(field => {
  const recheck = () => {
    if (field.hasAttribute('aria-invalid')) fieldError(field, validationMessage(field));
    if (!requestForm.querySelector('[aria-invalid="true"]')) errorSummary.hidden = true;
    requestStatus.hidden = true;
  };
  field.addEventListener('input', recheck);
  field.addEventListener('change', recheck);
});
requestForm.elements.phone.addEventListener('blur', () => {
  const field = requestForm.elements.phone;
  if (!field.value.trim() || validationMessage(field)) return;
  let digits = field.value.replace(/\D/g, '');
  if (digits.length === 10) digits = `7${digits}`;
  else digits = `7${digits.slice(1)}`;
  field.value = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
});
requestForm.addEventListener('submit', event => {
  event.preventDefault();
  requestStatus.hidden = true;
  let firstInvalid = null;
  requiredFields.forEach(field => {
    const message = validationMessage(field);
    fieldError(field, message);
    if (message && !firstInvalid) firstInvalid = field;
  });
  errorSummary.hidden = !firstInvalid;
  if (firstInvalid) {
    errorSummary.textContent = 'Проверьте поля, отмеченные малиновым цветом.';
    firstInvalid.focus();
    return;
  }
  requestStatus.textContent = 'Поля заполнены корректно. Это демонстрация: заявка не отправлена. Приём заявок подключим после утверждения сайта.';
  requestStatus.hidden = false;
  requestStatus.scrollIntoView({ block: 'nearest', behavior: 'instant' });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Tab' && activeDialog) {
    const focusable = [...activeDialog.querySelectorAll('a[href],button,input:not([type="hidden"]),textarea,select,summary,[tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  }
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
