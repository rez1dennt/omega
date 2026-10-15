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
let lastOrderSummary = '';

function fieldError(field, message) {
  const error = document.getElementById(`request-${field.name}-error`);
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  if (error) { error.textContent = message; error.hidden = !message; }
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
  if (summary && (forceTransfer || summary !== lastOrderSummary || !requestForm.elements.parameters.value.trim())) {
    requestForm.elements.parameters.value = summary;
    lastOrderSummary = summary;
    fieldError(requestForm.elements.parameters, '');
  }
  requestStatus.hidden = true;
}

document.addEventListener('site:dialog-open', event => {
  closeDropdown();
  setMenu(false);
  if (event.detail.dialog === requestDialog) prepareRequest(event.detail.opener);
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
attachPhoneMask(requestForm.elements.phone);
let submitting = false;
let submissionId = '';
let submissionSignature = '';
requestForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting) return;
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
  const payload = {
    parameters: requestForm.elements.parameters.value.trim(),
    email: requestForm.elements.email.value.trim(),
    phone: requestForm.elements.phone.value.trim(),
    name: requestForm.elements.name.value.trim(),
    consent: requestForm.elements.consent.checked,
    website: requestForm.elements.website.value,
  };
  const signature = JSON.stringify(payload);
  if (signature !== submissionSignature) {
    submissionSignature = signature;
    submissionId = crypto.randomUUID();
  }
  payload.requestId = submissionId;
  const button = requestForm.querySelector('button[type="submit"]');
  const label = button.querySelector('.request-submit-label');
  const controls = [...requestForm.querySelectorAll('input,textarea,button')];
  submitting = true;
  requestForm.setAttribute('aria-busy', 'true');
  controls.forEach(control => { control.disabled = true; });
  label.textContent = 'Отправляем…';
  try {
    await sendRequest(payload);
    requestStatus.textContent = 'Заявка отправлена. Спасибо! Свяжемся с вами по указанным контактам.';
    requestStatus.dataset.state = 'success';
    requestForm.reset();
    submissionId = '';
    submissionSignature = '';
  } catch (error) {
    for (const [name, message] of Object.entries(error.fieldErrors || {})) {
      const field = requestForm.elements.namedItem(name);
      if (field && typeof message === 'string' && message.length < 200) fieldError(field, message);
    }
    requestStatus.dataset.state = 'error';
    requestStatus.textContent = error.message === 'rate_limited'
      ? 'Слишком много попыток. Попробуйте через несколько минут или позвоните нам.'
      : 'Не удалось подтвердить отправку. Данные сохранены в форме. Свяжитесь с нами: +7 (8452) 52-93-50.';
  } finally {
    submitting = false;
    requestForm.removeAttribute('aria-busy');
    controls.forEach(control => { control.disabled = false; });
    label.textContent = 'Отправить заявку';
    requestStatus.hidden = false;
    requestStatus.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
