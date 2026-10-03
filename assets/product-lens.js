import { analyzeIdea, getClarifyingQuestions, validateReport } from './product-lens-engine.mjs';
import { lensConfig } from './product-lens-config.mjs';
import { requestAnalysis } from './product-lens-api.mjs';

const stages = [...document.querySelectorAll('[data-stage]')];
const dumpForm = document.querySelector('#dump-form');
const dump = document.querySelector('#brain-dump');
const count = document.querySelector('#character-count');
const clarifyForm = document.querySelector('#clarify-form');
const clarifyFields = document.querySelector('#clarify-fields');
const output = document.querySelector('#report-output');
let questions = [];
let analysisTimer;
let activeRequest;
let requestGeneration = 0;
const live = lensConfig.mode === 'live';
const consent = document.querySelector('#ai-consent');
document.querySelector('#local-privacy').hidden = live;
document.querySelector('#live-privacy').hidden = !live;
consent.required = live;
if (live) document.querySelector('.kicker').textContent = 'HN Product Lens · AI analysis';
const status = document.querySelector("#lens-status");

const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const showStage = (name) => {
  stages.forEach((stage) => { const active = stage.dataset.stage === name; stage.hidden = !active; stage.classList.toggle('is-active', active); });
  document.querySelector(`[data-stage="${name}"]`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
};
const focusTitle = (name) => {
  const title = document.querySelector(`[data-stage="${name}"] h2`);
  title.tabIndex = -1; title.focus({preventScroll:true});
};
const list = (items) => `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
const section = (eyebrow, title, body, className = '') => `<section class="report-card ${className}"><p class="report-label">${escapeHTML(eyebrow)}</p><h3>${escapeHTML(title)}</h3>${body}</section>`;

function renderTest(test) {
  const labels = {real_problem:'Real human problem',focused_version:'Smallest useful version',technology_fit:'Technology earns its place',human_value:'Clear human value',simplification:'Can it be simpler?'};
  return Object.entries(labels).map(([key,label]) => `<article class="test-row"><div><h4>${escapeHTML(label)}</h4><p>${escapeHTML(test[key].explanation)}</p></div><span class="test-status status-${test[key].status.toLowerCase().replace(/\s+/g,'-')}">${escapeHTML(test[key].status)}</span></article>`).join('');
}

function renderReport(report) {
  const known = report.confidence.known_from_user.length;
  document.querySelector('#report-meta').textContent = `${known} direct input${known === 1 ? '' : 's'} · assumptions kept visible · no success prediction`;
  const aiRisks = report.ai.risks.length ? `<div class="inline-note"><strong>Risks to design around</strong>${list(report.ai.risks)}</div>` : '';
  const aiHelps = report.ai.useful_for.length
    ? section('04 · Where AI helps','Use it where it earns its place',`<p>${escapeHTML(report.ai.recommendation)}</p>${list(report.ai.useful_for)}${aiRisks}`)
    : section('04 · Where AI helps','Probably nowhere—yet',`<p>${escapeHTML(report.ai.recommendation)}</p><p class="plain-truth">That is a useful answer, not a missing feature.</p>${aiRisks}`,'accent-card');
  output.innerHTML = `
    <section class="report-focus"><p class="report-label">Your idea, in focus</p><span>${escapeHTML(report.idea.working_name)}</span><h3>${escapeHTML(report.idea.one_line_concept)}</h3></section>
    <div class="report-grid">
      ${section('01 · Human','The human problem',`<dl class="fact-list"><div><dt>Primary user</dt><dd>${escapeHTML(report.human.primary_user)}</dd></div><div><dt>Current situation</dt><dd>${escapeHTML(report.human.situation)}</dd></div><div><dt>Friction</dt><dd>${escapeHTML(report.human.friction)}</dd></div><div><dt>Desired outcome</dt><dd>${escapeHTML(report.human.desired_outcome)}</dd></div></dl>`,'wide-card')}
      ${section('02 · Useful','The smallest useful version',`<p class="lead-line">${escapeHTML(report.useful.smallest_useful_version)}</p><h4>Core capabilities</h4>${list(report.useful.core_capabilities)}<div class="defer-box"><h4>Not yet</h4>${list(report.useful.defer)}</div>`,'wide-card')}
      ${section('03 · Technology','Technology that earns its place',`<span class="format-chip">${escapeHTML(report.technology.recommended_format)}</span><p>${escapeHTML(report.technology.why)}</p><h4>Required</h4>${list(report.technology.required)}<h4>Unnecessary for V1</h4>${list(report.technology.unnecessary)}`)}
      ${aiHelps}
      ${section('05 · AI restraint','Where AI doesn’t help',`${list(report.ai.avoid_for)}`)}
      ${section('06 · Complexity','Complexity to respect',`${list(report.complexity.concerns)}`)}
      ${section('07 · Reality','What has to be true',`<h4>Critical assumptions</h4>${list(report.reality.assumptions)}<div class="danger-box"><span>Biggest unknown</span><strong>${escapeHTML(report.reality.biggest_unknown)}</strong></div>${report.reality.validation_needed.length ? `<h4>What to validate next</h4>${list(report.reality.validation_needed)}` : ''}`,'wide-card')}
    </div>
    <section class="hn-test"><div class="test-heading"><div><p class="report-label">The HN Test</p><h3>Does the idea deserve to become more complicated?</h3></div><p>The HN Test isn’t a prediction that a product will succeed. It’s a way of asking whether the idea deserves to become more complicated.</p></div><div class="test-list">${renderTest(report.hn_test)}</div></section>
    <section class="next-move"><div><p class="report-label">HN’s next move</p><h3>${escapeHTML(report.next_move.recommendation)}</h3><p>${escapeHTML(report.next_move.reasoning)}</p></div><ol>${report.next_move.actions.map((action,index) => `<li><span>0${index+1}</span>${escapeHTML(action)}</li>`).join('')}</ol></section>
    <details class="honesty-panel"><summary>What Product Lens knows—and what it does not</summary><div class="honesty-grid"><div><h4>Known from you</h4>${list(report.confidence.known_from_user)}</div><div><h4>Inferred</h4>${list(report.confidence.inferred)}</div><div><h4>Still unknown</h4>${list(report.confidence.unknown)}</div></div></details>
    <section class="bring-hn"><div><p class="report-label">Bring it to HN</p><h3>Want help turning it into something real?</h3><p>Hardly Notable helps thoughtful people turn messy ideas into focused products. Continuing temporarily saves your idea and summary in this tab to prefill a project email. You review and send that email yourself. Nothing is sent to HN by this link.</p></div><a class="bring-button" id="bring-button" href="/start-a-project/">Bring it to HN <span aria-hidden="true">↗</span></a></section>`;
  document.querySelector('#bring-button').addEventListener('click', (event) => {
    try { sessionStorage.setItem('hnProductLensHandoff', JSON.stringify({expiresAt:Date.now()+10*60*1000, idea:dump.value, report:{concept:report.idea.one_line_concept, user:report.human.primary_user, suv:report.useful.smallest_useful_version, format:report.technology.recommended_format, next:report.next_move.recommendation}})); }
    catch (_) { event.preventDefault(); status.textContent = 'Your browser could not prepare the handoff. Print or save your report, then open Start a project to enter your brief.'; status.focus(); }
  });
}

function finish(answers = {}) {
  if (live) return runRemote('report', answers);
  status.textContent = '';
  clearTimeout(analysisTimer);
  showStage('analysis'); focusTitle('analysis');
  const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1150;
  analysisTimer = window.setTimeout(() => {
    try { renderReport(validateReport(analyzeIdea(dump.value, answers))); showStage('report'); focusTitle('report'); }
    catch (_) { showStage('entry'); status.textContent = 'We could not prepare this report. Your idea is still here. Edit it or try again.'; dump.focus({preventScroll:true}); }
  }, delay);
}

dump.addEventListener('input', () => { count.textContent = dump.value.length; dump.setCustomValidity(''); });
document.querySelectorAll('[data-starter]').forEach((button) => button.addEventListener('click', () => { dump.value = button.dataset.starter; dump.dispatchEvent(new Event('input')); dump.focus(); dump.setSelectionRange(dump.value.length,dump.value.length); }));
function showQuestions() {
  if (!questions.length) return finish();
  clarifyFields.innerHTML = questions.map((question,index) => `<div class="clarify-field"><label for="${question.id}"><span>0${index+1}</span>${escapeHTML(question.label)}</label><p>${escapeHTML(question.hint)}</p><textarea id="${question.id}" name="${question.id}" maxlength="2000" required placeholder="${escapeHTML(question.placeholder)}"></textarea></div>`).join('');
  showStage('clarify'); document.querySelector(`#${questions[0].id}`)?.focus({preventScroll:true});
}
async function runRemote(action, answers = {}) {
  if (!consent.checked) { showStage('entry'); status.textContent = 'Choose whether to send your idea to HN and OpenAI before continuing.'; consent.focus(); return; }
  activeRequest?.abort(); const generation = ++requestGeneration;
  activeRequest = new AbortController(); status.textContent = '';
  showStage('analysis'); focusTitle('analysis');
  try {
    const result = await requestAnalysis(lensConfig,{action,idea:dump.value,answers,consent:consent.checked,signal:activeRequest.signal});
    if (generation !== requestGeneration) return;
    if (action === 'questions') { questions = result; showQuestions(); }
    else { renderReport(result); showStage('report'); focusTitle('report'); }
  } catch (_) {
    if (generation !== requestGeneration) return;
    showStage('entry'); status.textContent = 'Analysis could not complete. Your idea is still here. Try again later; retrying sends it again.'; dump.focus({preventScroll:true});
  }
}
dumpForm.addEventListener('submit', (event) => {
  event.preventDefault(); if (!dumpForm.reportValidity()) return;
  if (live) return runRemote('questions');
  questions = getClarifyingQuestions(dump.value); showQuestions();
});
clarifyForm.addEventListener('submit', (event) => { event.preventDefault(); if (!clarifyForm.reportValidity()) return; finish(Object.fromEntries(new FormData(clarifyForm))); });
document.querySelector('#clarify-back').addEventListener('click', () => { showStage('entry'); dump.focus({preventScroll:true}); });
document.querySelector('#print-report').addEventListener('click', () => window.print());
document.querySelector('#restart-lens').addEventListener('click', () => { clearTimeout(analysisTimer); activeRequest?.abort(); requestGeneration++; consent.checked=false; status.textContent=''; try { sessionStorage.removeItem('hnProductLensHandoff'); } catch (_) {} dump.value=''; count.textContent='0'; clarifyFields.innerHTML=''; output.innerHTML=''; showStage('entry'); dump.focus({preventScroll:true}); });

document.querySelector('#cancel-analysis').addEventListener('click', () => { clearTimeout(analysisTimer); activeRequest?.abort(); requestGeneration++; showStage('entry'); dump.focus({preventScroll:true}); });
