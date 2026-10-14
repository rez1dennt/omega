/* Same-origin PHP endpoint. No external form services or client-side SMTP secrets. */
async function sendRequest(payload) {
  const endpoint = new URL(document.querySelector('#request-form').dataset.endpoint, location.href);
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
      body: JSON.stringify({ ...payload, consentVersion: '2026-10-14' }),
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
