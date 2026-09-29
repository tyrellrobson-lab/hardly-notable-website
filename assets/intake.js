const form = document.querySelector('#project-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim() || 'Not provided';
    const subject = `Project inquiry — ${value('projectType')}`;
    const body = [
      'NEW PROJECT INQUIRY', '',
      `Name: ${value('name')}`,
      `Email: ${value('email')}`,
      `Company / organization: ${value('company')}`,
      `Project type: ${value('projectType')}`,
      `Ideal timeline: ${value('timeline')}`,
      `Budget range: ${value('budget')}`, '',
      'WHAT THEY WANT TO BUILD', value('idea'), '',
      'WHO IT IS FOR', value('audience'), '',
      'Prepared at hardlynotable.com/start-a-project/'
    ].join('\n');

    const status = document.querySelector('#form-status');
    if (status) status.textContent = 'Your project email is ready. Review it in your email app, then choose Send.';
    window.location.href = `mailto:hello@hardlynotable.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
