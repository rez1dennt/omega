/* Landing-page interactions and the PHP request workflow. */
const header = document.querySelector('.site-header');
function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const orderForm = document.querySelector('#order-form');
const comment = orderForm.elements.comment;
const status = orderForm.querySelector('.form-status');
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
  listbox.style.removeProperty('max-height');
  trigger.setAttribute('aria-expanded', 'true');
  const rect = trigger.getBoundingClientRect();
  const listRect = listbox.getBoundingClientRect();
  const scrollport = dropdown.closest('.selection-body')?.getBoundingClientRect();
  const top = Math.max(0, scrollport?.top ?? 0);
  const bottom = Math.min(window.innerHeight, scrollport?.bottom ?? window.innerHeight);
  const gap = Math.max(0, listRect.top - rect.bottom);
  const below = Math.max(0, bottom - rect.bottom - gap);
  const above = Math.max(0, rect.top - top - gap);
  const opensAbove = below < listRect.height && above > below;
  listbox.classList.toggle('is-above', opensAbove);
  listbox.style.maxHeight = `${Math.min(listRect.height, opensAbove ? above : below)}px`;
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

document.addEventListener('site:pitch-select',event=>{
  const {tpi,parameters}=event.detail;
  const inSelection=Boolean(orderForm.closest('#selection-dialog')?.open);
  const index=options.findIndex(option=>option.dataset.value===tpi);
  if(index<0){event.preventDefault();return;}
  const original=comment.value.split('\n').filter(line=>!line.startsWith('Подбор шага:')).join('\n').trim();
  const next=[original,`Подбор шага: ${parameters}`].filter(Boolean).join('\n');
  if(next.length>comment.maxLength) {
    event.preventDefault();
    status.textContent='Подбор не добавлен: сократите комментарий, чтобы в нём поместились размеры заготовки. Ваш текст и прежний шаг сохранены.';status.hidden=false;
    if(!inSelection)openDialog(document.querySelector('#selection-dialog'), event.detail.opener || document.activeElement);
    comment.focus({preventScroll:true});comment.scrollIntoView({block:'nearest',behavior:'instant'});return;
  }
  selectOption(index);
  comment.value=next;
  orderForm.dispatchEvent(new Event('input',{bubbles:true}));
  if(!inSelection)openDialog(document.querySelector('#selection-dialog'), event.detail.opener || document.activeElement);
});

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
let activeRequestContext = 'blades';
const requestDrafts = new Map();
const requestCopy = {
  title: document.querySelector('#request-title').firstChild.textContent,
  intro: document.querySelector('#request-intro').textContent,
  help: document.querySelector('#request-parameters-help').textContent,
  placeholder: requestForm.elements.parameters.placeholder,
};

function prepareRequest(opener, forceTransfer = false) {
  const equipment = opener?.dataset.requestEquipment;
  const context = equipment ? `equipment:${equipment}` : 'blades';
  if (context !== activeRequestContext) {
    requestDrafts.set(activeRequestContext, { value: requestForm.elements.parameters.value, summary: lastOrderSummary });
    const draft = requestDrafts.get(context);
    requestForm.elements.parameters.value = draft?.value || '';
    lastOrderSummary = draft?.summary || '';
    activeRequestContext = context;
  }
  const kind = opener?.dataset.requestKind;
  document.querySelector('#request-title').firstChild.textContent = equipment
    ? kind === 'roller' ? 'Подбор рольганга' : kind === 'machine' ? 'Подбор станка' : 'Подбор оборудования'
    : requestCopy.title;
  document.querySelector('#request-intro').textContent = equipment
    ? 'Расскажите о задаче и оставьте контакты — обсудим подходящее оборудование.' : requestCopy.intro;
  document.querySelector('#request-parameters-help').textContent = equipment
    ? kind === 'roller' ? 'Укажите длину и вес заготовок, нужную длину рольганга и модель станка, если он уже есть.' : 'Укажите материал, сечение заготовки и объём работ. Модель, комплектацию и стоимость уточним при подборе.'
    : requestCopy.help;
  requestForm.elements.parameters.placeholder = equipment
    ? 'Опишите заготовку и задачу для оборудования' : requestCopy.placeholder;
  const lines = [];
  if (equipment) lines.push(`Оборудование: ${equipment}`);
  const orderSummary = equipment ? '' : collectOrderParameters(orderForm);
  if (orderSummary) lines.push(orderSummary);
  const summary = lines.join('\n');
  if (summary && (forceTransfer || summary !== lastOrderSummary || !requestForm.elements.parameters.value.trim())) {
    requestForm.elements.parameters.value = summary;
    lastOrderSummary = summary;
    setRequestFieldError(requestForm, 'parameters', '');
  }
  if (requestForm.dataset.validationShown === 'true') checkRequestForm(requestForm, () => requestForm.elements.parameters.value.trim());
  requestStatus.hidden = true;
}

document.addEventListener('site:dialog-open', event => {
  closeDropdown();
  setMenu(false);
  if (event.detail.dialog === requestDialog) prepareRequest(event.detail.opener);
});

attachRequestWorkflow(requestForm, () => requestForm.elements.parameters.value.trim());
attachRequestWorkflow(orderForm, () => collectOrderParameters(orderForm));
requestForm.addEventListener('reset', () => { requestDrafts.delete(activeRequestContext); lastOrderSummary = ''; });
orderForm.addEventListener('reset', () => {
  selectedIndex = 0; activeIndex = 0;
  caption.textContent = options[0].textContent;
  options.forEach((option,index) => option.setAttribute('aria-selected', String(index === 0)));
  closeDropdown();
  if (activeRequestContext === 'blades') lastOrderSummary = '';
  requestDrafts.delete('blades');
});
