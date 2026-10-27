const form = document.querySelector('#pilot-inquiry');
const preview = document.querySelector('#email-preview');
const status = document.querySelector('#inquiry-status');
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const value = key => String(data.get(key) || '').trim() || 'Not provided';
  const subject = '$300 inquiry-to-quote pilot';
  const body = `Hello Hardly Notable,\n\nI'm interested in the $300 inquiry-to-quote setup pilot.\n\nName: ${value('name')}\nEmail: ${value('email')}\nBusiness: ${value('business')}\n\nHow inquiries reach me and the tools I use:\n${value('current')}\n\nDetails usually missing before I can quote:\n${value('missing')}\n\nPlease let me know whether this fits the pilot scope.\n\nPrepared at hardlynotable.com/inquiry-to-quote/`;
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
