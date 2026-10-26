(() => {
  'use strict';
  const config = window.OmegaSiteSettingsAdmin;
  const button = document.querySelector('#omega-settings-seed');
  if (!config || !button) return;
  const status = document.querySelector('#omega-settings-seed-status');
  const progress = document.querySelector('#omega-settings-seed-progress');
  const form = document.querySelector('#post');
  let dirty = false;
  let running = false;
  const message = (key, values = {}) => String(config.strings[key] || '').replace(/\{(\w+)\}/g, (token, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : token);
  const updateIconPreview = preview => {
    const select = preview.closest('.acf-field')?.querySelector('select');
    const name = select?.value;
    if (!name || !Object.prototype.hasOwnProperty.call(config.icons || {}, name)) return;
    preview.querySelector('use')?.setAttribute('href', `#i-${name}`);
    const caption = preview.querySelector('span');
    if (caption) caption.textContent = message('iconPreview', { name: config.icons[name] });
  };
  document.querySelectorAll('[data-omega-icon-preview]').forEach(updateIconPreview);
  document.addEventListener('change', event => {
    if (event.target.tagName !== 'SELECT') return;
    const preview = event.target.closest('.acf-field')?.querySelector('[data-omega-icon-preview]');
    if (preview) updateIconPreview(preview);
  });
  const search = document.querySelector('#omega-settings-search');
  const results = document.querySelector('#omega-settings-search-results');
  const searchStatus = document.querySelector('#omega-settings-search-status');
  if (search && results && searchStatus && form) {
    const labelFor = field => field.querySelector(':scope > .acf-label > label')?.textContent.trim() || '';
    const searchableFields = () => [...form.querySelectorAll('.acf-field[data-key]')].map(field => {
      const ownLabel = labelFor(field);
      if (!ownLabel || field.dataset.type === 'accordion' || field.closest('.acf-clone')) return null;
      const labels = [ownLabel];
      let parent = field.parentElement.closest('.acf-field');
      while (parent && form.contains(parent)) {
        const label = labelFor(parent);
        if (label) labels.unshift(label);
        parent = parent.parentElement.closest('.acf-field');
      }
      return { field, title: labels.join(' → ') };
    }).filter(Boolean);
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('ru');
      results.replaceChildren();
      results.hidden = !query;
      if (!query) { searchStatus.textContent = message('searchHint'); return; }
      const matches = searchableFields().filter(item => item.title.toLocaleLowerCase('ru').includes(query));
      searchStatus.textContent = matches.length ? message(matches.length > 20 ? 'searchLimited' : 'searchCount', { count: matches.length, shown: 20 }) : message('searchEmpty');
      matches.slice(0, 20).forEach(({ field, title }) => {
        const item = document.createElement('li');
        const jump = document.createElement('button');
        jump.type = 'button'; jump.className = 'button-link'; jump.textContent = title;
        jump.addEventListener('click', () => {
          const accordions = [];
          let accordion = field.closest('.acf-field-accordion');
          while (accordion) { accordions.unshift(accordion); accordion = accordion.parentElement.closest('.acf-field-accordion'); }
          accordions.forEach(element => { if (!element.classList.contains('-open')) element.querySelector(':scope > .acf-accordion-title')?.click(); });
          let details = field.closest('details');
          while (details) { details.open = true; details = details.parentElement.closest('details'); }
          field.classList.add('omega-settings-search-target');
          field.scrollIntoView({ block: 'center', behavior: 'instant' });
          const input = field.querySelector('input:not([type="hidden"]),textarea,select,button');
          input?.focus({ preventScroll: true });
          setTimeout(() => field.classList.remove('omega-settings-search-target'), 3000);
        });
        item.append(jump); results.append(item);
      });
    });
  }
  form?.addEventListener('change', () => { if (!running) dirty = true; });
  form?.addEventListener('input', () => { if (!running) dirty = true; });
  button.addEventListener('click', async () => {
    if (running) return;
    status.dataset.state = '';
    if (dirty) { status.textContent = message('unsaved'); return; }
    running = true;
    button.disabled = true;
    progress.hidden = false;
    progress.value = 0;
    document.body.classList.add('omega-settings-seeding');
    if (form) { form.inert = true; form.setAttribute('aria-busy', 'true'); }
    try {
      const endpoint = new URL(config.ajaxUrl, location.href);
      if (endpoint.origin !== location.origin) throw new Error(message('network'));
      for (const [index, section] of config.sections.entries()) {
        status.textContent = message('working', { current: index + 1, total: config.sections.length, title: section.title });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 120000);
        let result;
        try {
          const response = await fetch(endpoint, {
            method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
            headers: { Accept: 'application/json' },
            body: new URLSearchParams({ action: 'omega_site_settings_seed_section', nonce: config.nonce, section: section.id }),
          });
          if (!response.headers.get('content-type')?.includes('application/json')) throw new Error(message('network'));
          result = await response.json();
          if (!response.ok || result.success !== true) throw new Error(result?.data?.message || message('network'));
        } finally { clearTimeout(timer); }
        progress.value = index + 1;
      }
      status.dataset.state = 'success';
      status.textContent = message('complete');
      location.reload();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = `${error.name === 'AbortError' || error instanceof TypeError ? message('network') : error.message} ${message('failed')}`;
    } finally {
      running = false;
      button.disabled = false;
      document.body.classList.remove('omega-settings-seeding');
      if (form) { form.inert = false; form.removeAttribute('aria-busy'); }
    }
  });
})();
