import { inquiryConfig } from './intake-config.mjs';

const form = document.querySelector('#project-form');
const es = document.documentElement.lang === 'es';
const msg = es ? {
  included: 'El resumen de Product Lens está incluido. No se ha enviado nada.',
  offline: 'El formulario en línea aún no está disponible. Puede escribirnos al correo que aparece abajo.',
  pending: 'Comprobando que es una persona y enviando su consulta…',
  accepted: 'Se envió su consulta. Le responderemos por correo electrónico.',
  unknown: 'No pudimos confirmar la entrega. Sus respuestas siguen aquí. Si lo intenta otra vez, use el mismo texto para evitar duplicados.',
  blocked: 'Corrija los campos indicados y vuelva a intentarlo.',
  retry: 'No se envió la consulta. Sus respuestas siguen aquí. Vuelva a intentarlo o use nuestro correo.',
  changed: 'La entrega anterior no está confirmada. Restaure el texto anterior para volver a comprobarla, o use nuestro correo.',
  limited: 'Hubo demasiados intentos. Espere un minuto e inténtelo de nuevo.',
  dailyLimited: 'El formulario alcanzó su límite de hoy. No se envió su consulta. Inténtelo mañana o escríbanos por correo.'
} : {
  included: 'Your Product Lens summary is included. Nothing has been sent.',
  offline: 'Online submission is not available yet. You can still email us below.',
  pending: 'Checking for spam and sending your inquiry…',
  accepted: 'Your inquiry was submitted. We’ll reply by email.',
  unknown: 'We couldn’t confirm delivery. Your answers are still here. If you try again, use the same text to avoid a duplicate.',
  blocked: 'Check the marked fields and try again.',
  retry: 'Your inquiry was not sent. Your answers are still here. Try again or use our email address.',
  changed: 'We couldn’t confirm the previous attempt. Restore the earlier text to retry it, or email us instead.',
  limited: 'Too many attempts. Wait a minute and try again.',
  dailyLimited: 'The form reached today’s limit. Your inquiry was not sent. Try tomorrow or email us instead.'
};

function configured() {
  try {
    const url = new URL(inquiryConfig.endpoint);
    return typeof crypto.randomUUID === 'function' && url.protocol === 'https:' &&
      ['inquiries.hardlynotable.com','hn-structured-inquiry.hardlynotablellc.workers.dev'].includes(url.hostname) &&
      !url.port && !url.username && !url.password && !url.search && !url.hash &&
      url.pathname === '/inquiry' && typeof inquiryConfig.siteKey === 'string' && inquiryConfig.siteKey.length > 0;
  } catch { return false; }
}

let widgetScript;
const loadChallenge = () => {
  if (!widgetScript) widgetScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const retry = () => { script.remove(); widgetScript = undefined; reject(new Error()); };
    const timer = setTimeout(retry, 10000);
    script.async = true;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload = () => { clearTimeout(timer); window.turnstile ? resolve(window.turnstile) : retry(); };
    script.onerror = () => { clearTimeout(timer); retry(); };
    document.head.append(script);
  });
  return widgetScript;
};
async function challengeToken(box) {
  const widget = await loadChallenge();
  let id;
  try {
    box.hidden = false;
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error()), 120000);
      const success = value => { clearTimeout(timer); resolve(value); };
      const failure = () => { clearTimeout(timer); reject(new Error()); };
      try {
        id = widget.render(box, {
          sitekey: inquiryConfig.siteKey, action: 'hn_inquiry', language: es ? 'es' : 'en',
          appearance: 'interaction-only', size: box.clientWidth < 300 ? 'compact' : 'flexible', 'response-field': false, retry: 'never',
          callback: success, 'error-callback': failure, 'expired-callback': failure, 'timeout-callback': failure
        });
      } catch { failure(); }
    });
  } finally {
    try { if (id !== undefined) widget.remove(id); } catch { /* Cleanup must not change the result. */ }
    box.hidden = true;
  }
}

if (form) {
  const online = configured();
  let pending = false, last = null;
  const button = form.querySelector('[type="submit"]');
  const box = document.querySelector('#inquiry-challenge');
  const status = document.querySelector('#form-status');
  const setStatus = (state, prompt) => { status.dataset.state = state; status.textContent = prompt; };
  button.disabled = !online;
  if (!online) setStatus('error', msg.offline);

  try {
    const handoff = JSON.parse(sessionStorage.getItem('hnProductLensHandoff') || 'null');
    sessionStorage.removeItem('hnProductLensHandoff');
    if (handoff?.expiresAt > Date.now() && typeof handoff?.idea === 'string' && handoff?.report) {
      form.elements.idea.value = [handoff.idea, '', 'PRODUCT LENS SUMMARY', 'Focused concept: ' + handoff.report.concept,
        'Smallest useful version: ' + handoff.report.suv, 'Recommended format: ' + handoff.report.format,
        'Recommended next move: ' + handoff.report.next].join('\n').slice(0, 4000);
      form.elements.audience.value = String(handoff.report.user || '').slice(0, 2500);
      form.elements.projectType.value = es ? 'Todavía no sé' : 'Not sure yet';
      if (online) setStatus('info', msg.included);
    }
  } catch { /* The form remains usable if storage is unavailable. */ }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!online || pending) return;
    if (!form.reportValidity()) { setStatus('error', msg.blocked); return; }
    const snapshot = Object.fromEntries(new FormData(form));
    const body = { language: es ? 'es' : 'en' };
    for (const name of ['name','email','company','projectType','idea','audience','timeline','budget','antiBot']) {
      body[name] = String(snapshot[name] ?? '').trim();
    }
    const fingerprint = JSON.stringify(body);
    if (last?.uncertain && last.fingerprint !== fingerprint) { setStatus('error', msg.changed); return; }
    if (last?.fingerprint !== fingerprint) last = { fingerprint, id: crypto.randomUUID(), uncertain: false };
    pending = true;
    button.disabled = true;
    form.dataset.pending = 'true';
    setStatus('pending', msg.pending);
    let dispatched = false;
    try {
      const token = await challengeToken(box);
      dispatched = true;
      const response = await fetch(inquiryConfig.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
        referrerPolicy: 'no-referrer', redirect: 'error', signal: AbortSignal.timeout(18000),
        body: JSON.stringify({ ...body, idempotencyKey: last.id, challenge: token })
      });
      const returned = await response.json();
      if (response.ok && returned.status === 'accepted') {
        form.reset();
        last = null;
        setStatus('success', msg.accepted);
      } else if (returned.status === 'daily_limited') {
        // A daily denial is recorded before any mail call for this exact key, so this retry is safe.
        last = null;
        setStatus('error', msg.dailyLimited);
      } else if (returned.status === 'unknown' || returned.status === 'conflict' ||
                 !['unavailable','invalid','challenge','limited','origin_denied'].includes(returned.status)) {
        last.uncertain = true;
        setStatus('error', msg.unknown);
      } else {
        setStatus('error', last.uncertain ? msg.unknown : returned.status === 'limited' ? msg.limited : msg.retry);
      }
    } catch {
      if (dispatched) last.uncertain = true;
      setStatus('error', last.uncertain ? msg.unknown : msg.retry);
    } finally {
      pending = false;
      button.disabled = false;
      delete form.dataset.pending;
      status.focus({ preventScroll: false });
    }
  });
}
