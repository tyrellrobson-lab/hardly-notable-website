const form = document.querySelector('#website-inquiry');
const preview = document.querySelector('#email-preview');
const status = document.querySelector('#inquiry-status');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const value = key => String(data.get(key) || '').trim() || 'Not provided';
  const subject = '$750 website package inquiry';
  const body = `Hi Ty,\n\nI'm interested in the $750 one-page website package.\n\nName: ${value('name')}\nEmail: ${value('email')}\nBusiness / existing website: ${value('business')}\n\nWhat I would like the page to do:\n${value('goal')}\n\nPlease let me know whether the scope and timing fit.\n\nPrepared at hardlynotable.com/websites/`;
  document.querySelector('#email-text').value = `To: hello@hardlynotable.com\nSubject: ${subject}\n\n${body}`;
  document.querySelector('#email-link').href = `mailto:hello@hardlynotable.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  preview.hidden = false;
  status.textContent = 'Your email is ready to review. Nothing has been sent.';
  document.querySelector('#email-text').focus();
});
form?.addEventListener('input', () => { preview.hidden = true; status.textContent = ''; });
document.querySelector('#copy-email')?.addEventListener('click', () => {
  const text = document.querySelector('#email-text'); text.focus(); text.select();
  status.textContent = 'Text selected. Copy it into an email when ready.';
});
