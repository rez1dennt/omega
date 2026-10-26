(() => {
'use strict';
const {attachPhoneMask} = window.OmegaUI;
function requestText(key, fallback, values = {}) {
  const configured = window.OmegaTheme?.ui?.request?.[key];
  const text = typeof configured === 'string' ? configured : fallback;
  return text.replace(/\{(\w+)\}/g, (token, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : token);
}
/* Public transport boundary. A separate plugin owns delivery and server validation. */
async function sendRequest(payload, endpointPath) {
  const config = window.OmegaTheme?.request || {};
  const adapter = window.OmegaThemeRequest;
  const endpointValue = endpointPath || config.endpoint;
  if (typeof adapter !== 'function' && !endpointValue) throw new Error('mail_not_configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const data = { ...payload, consentVersion: config.consentVersion || '2026-10-15' };
    let result;
    if (typeof adapter === 'function') {
      result = await adapter(data, { ...config, signal: controller.signal });
    } else {
      const endpoint = new URL(endpointValue, location.href);
      if (endpoint.origin !== location.origin) throw new Error('invalid_endpoint');
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(config.nonce ? { 'X-WP-Nonce': config.nonce } : {}) },
        body: JSON.stringify(data),
      });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('delivery_failed');
      result = await response.json();
      if (!response.ok) {
        const error = new Error(result?.code || 'delivery_failed');
        error.fieldErrors = result?.fieldErrors;
        throw error;
      }
    }
    if (result?.ok !== true || result.status !== 'accepted' || result.requestId !== payload.requestId) {
      const error = new Error(result?.code || 'delivery_failed');
      error.fieldErrors = result?.fieldErrors;
      throw error;
    }
    return result;
  } finally { clearTimeout(timer); }
}

function collectOrderParameters(form) {
  const lines = [];
  const value = name => form.elements.namedItem(name).value.trim();
  if (value('width')) lines.push(requestText('order_width_template', 'Ширина полотна: {value} мм', { value: value('width') }));
  if (value('length')) lines.push(requestText('order_length_template', 'Длина полотна: {value} мм', { value: value('length') }));
  if (value('tpi')) lines.push(requestText('order_tpi_template', 'Шаг зуба: {value}', { value: value('tpi') }));
  if (value('material')) lines.push(requestText('order_material_template', 'Материал: {value}', { value: value('material') }));
  if (value('comment')) lines.push(value('comment'));
  return lines.join('\n');
}

function validateRequestPayload(payload) {
  const errors = {};
  if (!payload.parameters) errors.parameters = requestText('error_parameters_required', 'Укажите размеры или опишите задачу.');
  else if (payload.parameters.length > 3000) errors.parameters = requestText('error_parameters_length', 'Сократите описание до 3000 символов.');
  if (!payload.email) errors.email = requestText('error_email_required', 'Укажите e-mail для ответа.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254) errors.email = requestText('error_email_invalid', 'Проверьте e-mail: например, name@example.ru.');
  const digits = payload.phone.replace(/\D/g, '');
  if (!digits || digits === '7') errors.phone = requestText('error_phone_required', 'Укажите номер телефона.');
  else if (!/^[+\d\s()-]+$/.test(payload.phone) || !/^(?:[78]\d{10}|\d{10})$/.test(digits)) errors.phone = requestText('error_phone_invalid', 'Введите номер полностью: +7 и 10 цифр.');
  if (payload.name.length > 160) errors.name = requestText('error_name_length', 'Имя или компания — до 160 символов.');
  if (payload.consent !== true) errors.consent = requestText('error_consent', 'Отметьте согласие на обработку данных.');
  return errors;
}

function setRequestFieldError(form, name, message) {
  const field = form.elements.namedItem(name === 'parameters' && form.id === 'order-form' ? 'comment' : name);
  if (field) {
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    field.closest('.order-field,.request-field,.order-consent,.request-consent')?.classList.toggle('has-error', Boolean(message));
  }
  const error = form.querySelector(`[data-error-for="${name}"]`) || document.getElementById(`${form.id === 'order-form' ? 'order' : 'request'}-${name}-error`);
  if (error) { error.textContent = message; error.hidden = !message; }
  return field;
}

function requestPayloadForForm(form, parameters) {
  return {
    parameters: parameters(), email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(), name: form.elements.name.value.trim(),
    consent: form.elements.consent.checked, website: form.elements.website.value,
  };
}

function requestErrorsForForm(form, payload) {
  const errors = validateRequestPayload(payload);
  for (const name of ['width','length']) {
    const field = form.elements.namedItem(name);
    if (field && !field.validity.valid) errors[name] = requestText('error_dimension', 'Укажите число не меньше 1 мм.');
  }
  return errors;
}

function focusRequestField(form, name) {
  const field = name ? form.elements.namedItem(name === 'parameters' && form.id === 'order-form' ? 'comment' : name) : form.querySelector('[aria-invalid="true"]');
  if (!field) return;
  const details = field.closest('details');
  if (details) details.open = true;
  field.focus({ preventScroll: true });
  field.scrollIntoView({ block: 'center', behavior: 'instant' });
}

function renderRequestErrorSummary(form, errors) {
  const summary = form.querySelector('.request-error-summary');
  const names = Object.keys(errors);
  summary.hidden = names.length === 0;
  const key = names.join('|');
  if (summary.dataset.errorKeys === key) return;
  summary.dataset.errorKeys = key;
  summary.replaceChildren();
  if (!names.length) return;
  const title = document.createElement('strong');
  title.textContent = requestText('summary_title', 'Заявка пока не отправлена');
  const hint = document.createElement('span');
  hint.textContent = requestText('summary_hint', 'Исправьте поля:');
  const links = document.createElement('span');
  links.className = 'error-summary-links';
  const labels = {
    parameters: requestText('field_parameters', 'Параметры заказа'),
    width: requestText('field_width', 'Ширина полотна'),
    length: requestText('field_length', 'Длина полотна'),
    email: requestText('field_email', 'E-mail'),
    phone: requestText('field_phone', 'Телефон'),
    name: requestText('field_name', 'Имя / Компания'),
    consent: requestText('field_consent', 'Согласие'),
  };
  for (const name of names) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'error-jump';
    button.textContent = labels[name];
    button.addEventListener('click', () => focusRequestField(form,name));
    links.append(button);
  }
  summary.append(title,hint,links);
}

/* Local validation only: this routine never submits a form or calls the API. */
function checkRequestForm(form, parameters, { focusFirst = false } = {}) {
  const payload = requestPayloadForForm(form,parameters);
  const errors = requestErrorsForForm(form,payload);
  for (const name of ['parameters','width','length','email','phone','name','consent']) setRequestFieldError(form,name,errors[name] || '');
  form.dataset.validationShown = 'true';
  renderRequestErrorSummary(form,errors);
  if (focusFirst && Object.keys(errors).length) focusRequestField(form);
  return { payload, errors };
}

/* Both forms own their contacts, consent, validation and direct submission. */
function attachRequestWorkflow(form, parameters) {
  const status = form.querySelector('[role="status"]');
  const summary = form.querySelector('.request-error-summary');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('.request-submit-label');
  let submitting = false;
  let submissionId = '';
  let submissionSignature = '';
  let pointerActive = false;
  let pendingBlurField = null;
  // Let a click finish before a new error message moves the clicked control.
  document.addEventListener('pointerdown', () => { pointerActive = true; }, { passive: true });
  const finishPointer = () => setTimeout(() => {
    pointerActive = false;
    const field = pendingBlurField;
    pendingBlurField = null;
    if (field) renderBlurError(field);
  }, 0);
  document.addEventListener('pointerup', finishPointer, { passive: true });
  document.addEventListener('pointercancel', finishPointer, { passive: true });
  function renderBlurError(field) {
    if (!field.isConnected || (form.closest('dialog') && !form.closest('dialog').open)) return;
    const name = field.name === 'comment' ? 'parameters' : field.name;
    const errors = requestErrorsForForm(form,requestPayloadForForm(form,parameters));
    setRequestFieldError(form,name,errors[name] || '');
    if (form.dataset.validationShown === 'true') renderRequestErrorSummary(form,errors);
  }
  form.addEventListener('input', event => {
    if (form.dataset.validationShown === 'true') {
      checkRequestForm(form,parameters);
      status.hidden = true;
      return;
    }
    const errors = requestErrorsForForm(form,requestPayloadForForm(form,parameters));
    const field = event.target;
    if (field.hasAttribute('aria-invalid')) {
      const name = field.name === 'comment' ? 'parameters' : field.name;
      setRequestFieldError(form, name, errors[name] || '');
    }
    const combinedField = form.elements.namedItem(form.id === 'order-form' ? 'comment' : 'parameters');
    if (combinedField.hasAttribute('aria-invalid')) setRequestFieldError(form, 'parameters', errors.parameters || '');
    if (!form.querySelector('[aria-invalid="true"]')) summary.hidden = true;
    status.hidden = true;
  });
  form.addEventListener('focusout', event => {
    const field = event.target;
    if (form.closest('dialog') && !form.contains(event.relatedTarget)) return;
    if (!['parameters','comment','width','length','email','phone','name','consent'].includes(field.name)) return;
    if (pointerActive) pendingBlurField = field;
    else renderBlurError(field);
  });
  form.addEventListener('reset', () => {
    pendingBlurField = null;
    delete form.dataset.validationShown;
    for (const name of ['parameters','width','length','email','phone','name','consent']) setRequestFieldError(form,name,'');
    renderRequestErrorSummary(form,{});
  });
  attachPhoneMask(form.elements.phone);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    status.hidden = true;
    const {payload,errors} = checkRequestForm(form,parameters,{focusFirst:true});
    if (Object.keys(errors).length) return;
    const signature = JSON.stringify(payload);
    if (signature !== submissionSignature) { submissionSignature = signature; submissionId = crypto.randomUUID(); }
    payload.requestId = submissionId;
    const controls = [...form.querySelectorAll('input,textarea,button')];
    const disabledStates = controls.map(control => control.disabled);
    const originalSubmitLabel = label.textContent;
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    controls.forEach(control => { control.disabled = true; });
    label.textContent = requestText('submitting', 'Отправляем…');
    const serverErrors = {};
    try {
      await sendRequest(payload, form.dataset.endpoint);
      status.textContent = requestText('success', 'Заявка отправлена. Спасибо! Свяжемся с вами по указанным контактам.');
      status.dataset.state = 'success';
      form.reset();
      submissionId = ''; submissionSignature = '';
    } catch (error) {
      for (const [name, message] of Object.entries(error.fieldErrors || {})) {
        if (['parameters','email','phone','name','consent'].includes(name) && typeof message === 'string' && message.length < 200) {
          serverErrors[name] = message;
          setRequestFieldError(form,name,message);
        }
      }
      if (Object.keys(serverErrors).length) renderRequestErrorSummary(form,serverErrors);
      status.dataset.state = 'error';
      status.textContent = error.message === 'rate_limited'
        ? requestText('rate_limited', 'Слишком много попыток. Попробуйте через несколько минут или позвоните нам.')
        : requestText('delivery_failed', 'Заявка не отправлена. Данные сохранены в форме. Свяжитесь с нами: {phone}.', {
          phone: window.OmegaTheme?.contactPhone || requestText('fallback_phone', '+7 (917) 201-21-00'),
        });
    } finally {
      submitting = false;
      form.removeAttribute('aria-busy');
      controls.forEach((control, index) => { control.disabled = disabledStates[index]; });
      label.textContent = originalSubmitLabel;
      status.hidden = false;
      if (Object.keys(serverErrors).length) focusRequestField(form);
      else status.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  });
  // Fail closed until the submit handler is attached; no native GET with personal data.
  form.querySelectorAll('[data-workflow-submit]').forEach(button => { button.disabled = false; });
}

Object.assign(window.OmegaUI, {sendRequest,collectOrderParameters,validateRequestPayload,setRequestFieldError,checkRequestForm,attachRequestWorkflow});
})();
