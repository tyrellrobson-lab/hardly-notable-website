const form = document.querySelector('#project-form');

if (form) {
  try {
    const handoff = JSON.parse(sessionStorage.getItem('hnProductLensHandoff') || 'null');
    sessionStorage.removeItem('hnProductLensHandoff');
    if (handoff?.expiresAt > Date.now() && typeof handoff?.idea === 'string' && handoff?.report) {
      form.elements.idea.value = [handoff.idea, '', 'PRODUCT LENS SUMMARY', `Focused concept: ${handoff.report.concept}`, `Smallest useful version: ${handoff.report.suv}`, `Recommended format: ${handoff.report.format}`, `Recommended next move: ${handoff.report.next}`].join('\n');
      form.elements.audience.value = handoff.report.user || '';
      form.elements.projectType.value = 'Not sure yet';
      const status = document.querySelector('#form-status');
      if (status) status.textContent = 'Your Product Lens summary is included. Nothing has been sent.';
      sessionStorage.removeItem('hnProductLensHandoff');
    }
  } catch (_) {
    // Storage can be disabled; the ordinary inquiry form must still work.
  }

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

    const brief = document.querySelector('#prepared-brief');
    brief.value = `To: hello@hardlynotable.com\nSubject: ${subject}\n\n${body}`;
    document.querySelector('#brief-preview').hidden = false;
    document.querySelector('#open-email').href = `mailto:hello@hardlynotable.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = document.querySelector('#form-status');
    if (status) status.textContent = 'Nothing has been sent. Review your brief below, then open your email app or select and copy the text.';
    brief.focus();
  });
}

document.querySelector('#select-brief')?.addEventListener('click', () => { const brief = document.querySelector('#prepared-brief'); brief.focus(); brief.select(); });
form?.addEventListener('input', () => { document.querySelector('#brief-preview').hidden = true; });
