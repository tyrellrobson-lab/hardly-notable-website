const form = document.querySelector('#website-inquiry');
const preview = document.querySelector('#email-preview');
const status = document.querySelector('#inquiry-status');
const es = document.documentElement.lang === 'es';
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const value = key => String(data.get(key) || '').trim() || (es ? 'No indicado' : 'Not provided');
  const subject = es ? 'Consulta sobre el sitio web de una página' : 'One-page website inquiry';
  const body = es
    ? `Hola, Hardly Notable:\n\nMe interesa el paquete de sitio web de una página.\n\nNombre: ${value('name')}\nCorreo: ${value('email')}\nNegocio / sitio web actual: ${value('business')}\n\nQué me gustaría que hiciera la página:\n${value('goal')}\n\nPor favor díganme si el alcance y los tiempos funcionan. Prefiero hablar en español.\n\nPreparado en hardlynotable.com/es/websites/`
    : `Hello Hardly Notable,\n\nI'm interested in the one-page website package.\n\nName: ${value('name')}\nEmail: ${value('email')}\nBusiness / existing website: ${value('business')}\n\nWhat I would like the page to do:\n${value('goal')}\n\nPlease let me know whether the scope and timing fit.\n\nPrepared at hardlynotable.com/websites/`;
  document.querySelector('#email-text').value = `${es ? 'Para' : 'To'}: hello@hardlynotable.com\n${es ? 'Asunto' : 'Subject'}: ${subject}\n\n${body}`;
  document.querySelector('#email-link').href = `mailto:hello@hardlynotable.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  preview.hidden = false;
  status.textContent = es ? 'Su correo está listo para revisar. No se ha enviado nada.' : 'Your email is ready to review. Nothing has been sent.';
  document.querySelector('#email-text').focus();
});
form?.addEventListener('input', () => { preview.hidden = true; status.textContent = ''; });
document.querySelector('#copy-email')?.addEventListener('click', () => {
  const text = document.querySelector('#email-text'); text.focus(); text.select();
  status.textContent = es ? 'Texto seleccionado. Cópielo en un correo cuando esté listo.' : 'Text selected. Copy it into an email when ready.';
});
