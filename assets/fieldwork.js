const form = document.querySelector('#demo-inquiry');
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  form.elements.service.value = link.dataset.service;
  document.querySelector('#result').hidden = true;
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const d = new FormData(form);
  document.querySelector('#summary').textContent = `${String(d.get('name')).trim()} is asking about ${d.get('service').toLowerCase()}. ${String(d.get('notes')).trim() || 'Job details can be discussed next.'}`;
  document.querySelector('#result').hidden = false;
  document.querySelector('#status').textContent = 'Example prepared. Nothing has been sent.';
});
form.addEventListener('input', () => { document.querySelector('#result').hidden = true; document.querySelector('#status').textContent = ''; });
