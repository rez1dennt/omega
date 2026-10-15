/* Same-origin PHP endpoint. No external form services or client-side SMTP secrets. */
async function sendRequest(payload, endpointPath) {
  const endpoint = new URL(endpointPath, location.href);
  if (endpoint.origin !== location.origin) throw new Error('invalid_endpoint');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  const parse = async response => {
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('mail_not_configured');
    return response.json();
  };
  try {
    const ready = await fetch(endpoint, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal });
    const setup = await parse(ready);
    if (!ready.ok || !setup.available || typeof setup.csrfToken !== 'string') throw new Error('mail_not_configured');
    const response = await fetch(endpoint, {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': setup.csrfToken },
      body: JSON.stringify({ ...payload, consentVersion: '2026-10-15' }),
    });
    const result = await parse(response);
    if (!response.ok || result.ok !== true || result.status !== 'accepted' || result.requestId !== payload.requestId) {
      const error = new Error(result.code || 'delivery_failed');
      error.fieldErrors = result.fieldErrors;
      throw error;
    }
    return result;
  } finally { clearTimeout(timer); }
}

function collectOrderParameters(form) {
  const lines = [];
  const value = name => form.elements.namedItem(name).value.trim();
  if (value('width')) lines.push(`Ширина полотна: ${value('width')} мм`);
  if (value('length')) lines.push(`Длина полотна: ${value('length')} мм`);
  if (value('tpi')) lines.push(`Шаг зуба: ${value('tpi')}`);
  if (value('material')) lines.push(`Материал: ${value('material')}`);
  if (value('comment')) lines.push(value('comment'));
  return lines.join('\n');
}

function validateRequestPayload(payload) {
  const errors = {};
  if (!payload.parameters) errors.parameters = 'Укажите размеры или опишите задачу.';
  else if (payload.parameters.length > 3000) errors.parameters = 'Сократите описание до 3000 символов.';
  if (!payload.email) errors.email = 'Укажите e-mail для ответа.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 254) errors.email = 'Проверьте e-mail: например, name@example.ru.';
  const digits = payload.phone.replace(/\D/g, '');
  if (!digits || digits === '7') errors.phone = 'Укажите номер телефона.';
  else if (!/^[+\d\s()-]+$/.test(payload.phone) || !/^(?:[78]\d{10}|\d{10})$/.test(digits)) errors.phone = 'Введите номер полностью: +7 и 10 цифр.';
  if (payload.name.length > 160) errors.name = 'Имя или компания — до 160 символов.';
  if (payload.consent !== true) errors.consent = 'Отметьте согласие на обработку данных.';
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
    if (field && !field.validity.valid) errors[name] = 'Укажите число не меньше 1 мм.';
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
  title.textContent = 'Заявка пока не отправлена';
  const hint = document.createElement('span');
  hint.textContent = 'Исправьте поля:';
  const links = document.createElement('span');
  links.className = 'error-summary-links';
  const labels = { parameters:'Параметры заказа', width:'Ширина полотна', length:'Длина полотна', email:'E-mail', phone:'Телефон', name:'Имя / Компания', consent:'Согласие' };
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
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    controls.forEach(control => { control.disabled = true; });
    label.textContent = 'Отправляем…';
    const serverErrors = {};
    try {
      await sendRequest(payload, form.dataset.endpoint);
      status.textContent = 'Заявка отправлена. Спасибо! Свяжемся с вами по указанным контактам.';
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
        ? 'Слишком много попыток. Попробуйте через несколько минут или позвоните нам.'
        : 'Не удалось подтвердить отправку. Данные сохранены в форме. Свяжитесь с нами: +7 (8452) 52-93-50.';
    } finally {
      submitting = false;
      form.removeAttribute('aria-busy');
      controls.forEach((control, index) => { control.disabled = disabledStates[index]; });
      label.textContent = 'Отправить заявку';
      status.hidden = false;
      if (Object.keys(serverErrors).length) focusRequestField(form);
      else status.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  });
}
