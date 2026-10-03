const vagueWords = /^(an?\s+)?(app|game|website|idea|platform|thing|tool|business)$/i;
const hasAny = (text, words) => words.some((word) => text.includes(word));
const tidy = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const sentence = (value) => {
  const clean = tidy(value).replace(/^(this might be stupid,? but|i have an idea for an app that|i wish there were an easier way to|my business keeps struggling with)\s*/i, '');
  const first = clean.split(/[.!?]\s/)[0].slice(0, 180);
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'A clearer first version of the idea';
};
const unique = (items) => [...new Set(items.filter(Boolean))];
const matchingSentence = (text, pattern) => tidy(text).split(/(?<=[.!?])\s+/).find((part) => pattern.test(part)) || '';

export function getClarifyingQuestions(raw) {
  const text = tidy(raw).toLowerCase();
  const questions = [];
  const userSignals = ['for my', 'for people', 'customers', 'employees', 'parents', 'kids', 'players', 'users', 'teams', 'businesses', 'owners', 'students', 'drivers', 'patients'];
  const outcomeSignals = ['so that', 'help', 'save', 'reduce', 'avoid', 'make it', 'easier', 'faster', 'track', 'decide', 'remember', 'organize', 'sell', 'learn'];
  const workaroundSignals = ['currently', 'right now', 'instead', 'using', 'spreadsheet', 'paper', 'texting', 'email', 'manually', 'nothing'];
  if (text.length < 90 || !hasAny(text, userSignals)) questions.push({id:'primaryUser', label:'Who feels this problem most directly?', hint:'A specific person or group—not “everyone.”', placeholder:'For example: independent shop owners handling orders alone'});
  if (text.length < 120 || !hasAny(text, outcomeSignals)) questions.push({id:'desiredOutcome', label:'What should become easier, clearer, faster, or more enjoyable?', hint:'Describe the change for the person, not a feature.', placeholder:'For example: know what needs attention without checking three places'});
  if (text.length < 180 && !hasAny(text, workaroundSignals)) questions.push({id:'currentWorkaround', label:'What do people do now?', hint:'“Nothing” is a useful answer too.', placeholder:'For example: keep a spreadsheet and send reminder texts'});
  return questions.slice(0, 3);
}

function inferContext(text, answers) {
  const lower = text.toLowerCase();
  const marketplace = hasAny(lower, ['marketplace','buyers and sellers','connect people','providers','vendors','two-sided','two sided']);
  const game = hasAny(lower, ['game','player','levels','puzzle','score','play','critters','sorting']);
  const business = hasAny(lower, ['business','employee','workflow','client','customer','inventory','invoice','orders','team']);
  const sensitive = hasAny(lower, ['health','medical','patient','therapy','child','children','location','financial','bank','legal','private','personal data']);
  const payments = hasAny(lower, ['pay','payment','subscription','checkout','money','purchase','sell']);
  const social = hasAny(lower, ['social feed','profiles','chat','messaging','community','post']);
  const aiRequested = hasAny(lower, [' ai ','artificial intelligence','chatbot','gpt','predict','generate','summarize','recognize','recommend']);
  const automation = hasAny(lower, ['automate','automatically','repetitive','workflow','reminder','trigger']);
  const mobileSignal = hasAny(lower, ['phone','camera','gps','location','on the go','push notification','offline','mobile app']);
  const websiteSignal = hasAny(lower, ['website','landing page','book','portfolio','information site']);
  return {lower, marketplace, game, business, sensitive, payments, social, aiRequested, automation, mobileSignal, websiteSignal, answers};
}

function recommendFormat(ctx) {
  if (ctx.game) return {format:'Mobile-first game prototype', why:'The value is the interaction itself, so play feel and repeatability need to be proven on the device people will use.'};
  if (ctx.marketplace) return {format:'Manual concierge test before software', why:'The hardest problem is likely matching supply and demand—not building screens. Prove that useful matches can happen repeatedly first.'};
  if (ctx.automation) return {format:'Focused automation or lightweight web tool', why:'A narrow workflow can prove the time savings before a larger product or native app is justified.'};
  if (ctx.websiteSignal) return {format:'Responsive website', why:'The core value can be delivered through the web without installation, app-store review, or native-device complexity.'};
  if (ctx.mobileSignal) return {format:'Mobile prototype', why:'The idea depends on a phone-specific context or capability, so a small mobile test earns its place.'};
  return {format:'Responsive web prototype', why:'It is the fastest credible way to test the core value across devices without committing to native-app complexity.'};
}

export function analyzeIdea(raw, answers = {}) {
  const text = tidy(raw);
  if (text.length < 12 || vagueWords.test(text)) throw new Error('Please give Product Lens a little more to work with.');
  const ctx = inferContext(text, answers);
  const format = recommendFormat(ctx);
  const statedOutcome = matchingSentence(text, /\b(want|needs?|so that|help|reduce|avoid|easier|faster|clearer)\b/i).replace(/^.*?\b(?:want(?:s)? to|so that|help(?:s|ing)?(?: them| people| users)? to?)\s+/i, '');
  const statedWorkaround = matchingSentence(text, /\b(currently|right now|using|spreadsheet|paper|texting|email|manually|copies?|keeps?)\b/i);
  const primaryUser = tidy(answers.primaryUser) || (ctx.business ? 'The employee or operator responsible for this workflow' : ctx.game ? 'Players who enjoy short, repeatable challenges' : 'The person experiencing this problem most often');
  const outcome = tidy(answers.desiredOutcome) || tidy(statedOutcome).replace(/[.]$/, '') || (ctx.game ? 'Feel an immediate sense of progress, mastery, and “one more round” momentum' : 'Complete the important task with less friction and more confidence');
  const workaround = tidy(answers.currentWorkaround) || statedWorkaround || 'The current workaround is not yet known and needs to be observed.';
  const core = [];
  if (ctx.game) core.push('One complete, replayable core game loop', 'Clear feedback for every valid and invalid action', 'A short progression that introduces meaningful variation', 'A restart and continuation flow that never interrupts play');
  else if (ctx.marketplace) core.push('A tightly defined request from one side', 'A curated set of potential matches', 'A manual matching and follow-up process', 'A simple way to record whether the match created value');
  else if (ctx.automation) core.push('One clearly defined trigger', 'One repeatable automated action', 'A review step before anything consequential happens', 'A visible history with correction or retry');
  else core.push('A focused way to enter the essential information', 'One primary workflow that produces the promised outcome', 'A clear result the user can understand and act on', 'A simple correction, retry, or next-step path');
  if (ctx.sensitive) core.push('Clear consent and minimal-data handling at the point of use');

  const defer = ['Accounts and profiles until repeat use requires them', 'Analytics beyond a few useful product signals'];
  if (!ctx.payments) defer.push('Payments or subscriptions before value is proven');
  if (!ctx.social) defer.push('Social feeds, messaging, and community features');
  if (!ctx.mobileSignal && !ctx.game) defer.push('Native mobile apps before the web version proves insufficient');

  const required = ctx.game ? ['A responsive game surface', 'Reliable state and progression', 'Accessible input and feedback'] : ctx.automation ? ['A small rules engine', 'A reviewable activity history', 'Secure connection only to the systems the workflow needs'] : ['A responsive interface', 'Clear state and validation', 'Only enough persistence to complete the core task'];
  const unnecessary = unique([!ctx.mobileSignal && !ctx.game && 'A separate iOS and Android build for V1', !ctx.social && 'Real-time messaging infrastructure', !ctx.payments && 'Payment processing', !ctx.aiRequested && 'A general-purpose AI assistant']);
  const aiUseful = [];
  if (hasAny(ctx.lower, ['summarize','messy text','classify','categorize','extract','draft','translate'])) aiUseful.push('Turning unstructured input into a reviewable first draft');
  if (hasAny(ctx.lower, ['recommend','many options','compare','match']) && !ctx.marketplace) aiUseful.push('Narrowing a large option set when the user can inspect and correct the result');
  const aiRecommendation = aiUseful.length ? 'Use AI narrowly, with visible output and a human correction path.' : 'AI probably isn’t necessary for the first useful version.';
  const aiAvoid = unique(['Making irreversible decisions for the user', 'Presenting uncertain output as fact', !ctx.aiRequested && 'Adding a chatbot merely to make the product sound current']);
  const aiRisks = aiUseful.length ? ['Incorrect or inconsistent output', 'Input privacy and provider retention', 'Per-use cost, latency, and provider dependency'] : [];

  const concerns = [];
  if (ctx.marketplace) concerns.push('A marketplace adds supply, demand, trust, verification, and local-density problems before it adds software problems.');
  if (ctx.payments) concerns.push('Payments bring refunds, disputes, fraud, records, and customer-support obligations.');
  if (ctx.social) concerns.push('Messaging or user content brings moderation, reporting, blocking, abuse, notification, and storage work.');
  if (ctx.sensitive) concerns.push('Sensitive information requires data minimization, clear consent, security, deletion, and careful claims.');
  if (ctx.aiRequested || aiUseful.length) concerns.push('AI adds reliability, privacy, latency, cost, correction, and provider-dependency burdens.');
  if (!concerns.length) concerns.push('The main risk is expanding the feature list before the core behavior has proven useful.');

  let biggest = 'Whether the intended user experiences this problem often enough to change what they do.';
  if (ctx.marketplace) biggest = 'Whether enough useful supply and demand can be concentrated at the same time and place.';
  else if (ctx.game) biggest = 'Whether the core interaction stays satisfying after the novelty of the first few rounds wears off.';
  else if (ctx.automation) biggest = 'Whether the workflow is consistent enough to automate without creating more checking work.';

  const recommendation = ctx.marketplace ? 'Test it manually' : ctx.game ? 'Prototype the core loop' : ctx.sensitive ? 'Research the privacy constraint' : ctx.automation ? 'Prototype one workflow' : 'Build a focused web prototype';
  const actions = ctx.marketplace
    ? ['Choose one narrow location or community.', 'Complete 10 matches manually and record where each one breaks.', 'Only design software around the repeated friction you actually observe.']
    : ctx.game
      ? ['Build one polished 60-second loop before adding a level map.', 'Watch five target players without explaining the controls.', 'Measure replay, confusion, and drop-off—then tune the interaction before adding content.']
      : ['Interview five people who experience this problem recently and repeatedly.', `Prototype the core outcome as a ${format.format.toLowerCase()}.`, 'Remove any feature that does not strengthen the first useful result.'];

  const realStatus = text.length > 120 || tidy(answers.currentWorkaround) ? 'Clear' : 'Needs validation';
  const valueStatus = tidy(answers.desiredOutcome) || hasAny(ctx.lower, ['save','avoid','faster','easier','clear','fun','enjoy']) ? 'Clear' : 'Needs validation';
  const simplifyStatus = ctx.marketplace || ctx.payments || ctx.social || (text.match(/,| and /g) || []).length > 5 ? 'Needs simplification' : 'Clear';
  return {
    idea:{working_name:'Working concept', one_line_concept:ctx.game ? `${sentence(text)}—shaped around one polished, replayable loop.` : `${format.format} for ${primaryUser.toLowerCase()} to ${outcome.charAt(0).toLowerCase()}${outcome.slice(1)}.`},
    human:{primary_user:primaryUser, situation:workaround, friction:`The current situation makes it harder to ${outcome.charAt(0).toLowerCase()}${outcome.slice(1)}.`, desired_outcome:outcome},
    useful:{smallest_useful_version:`A ${format.format.toLowerCase()} that delivers one complete outcome for ${primaryUser.toLowerCase()}, without requiring the larger ecosystem first.`, core_capabilities:core.slice(0,6), defer:defer.slice(0,5)},
    technology:{recommended_format:format.format, required, unnecessary, why:format.why},
    ai:{recommendation:aiRecommendation, useful_for:aiUseful, avoid_for:aiAvoid, risks:aiRisks},
    complexity:{concerns},
    reality:{assumptions:[`The problem occurs often enough for ${primaryUser.toLowerCase()} to adopt a new behavior.`, 'The smallest version creates value before the deferred features exist.', 'The proposed experience is meaningfully better than the current workaround.'], biggest_unknown:biggest, validation_needed:['Observe the current behavior rather than relying only on stated interest.', 'Test the core outcome with a deliberately small prototype.', 'Define what evidence would justify the next layer of complexity.']},
    hn_test:{real_problem:{status:realStatus, explanation:realStatus === 'Clear' ? 'A person, situation, and meaningful friction are visible.' : 'The problem sounds plausible, but recent real behavior still needs evidence.'}, focused_version:{status:simplifyStatus, explanation:simplifyStatus === 'Clear' ? 'A compact first version can deliver the central value.' : 'Several systems are bundled together. Prove the smallest risky part first.'}, technology_fit:{status:'Clear', explanation:`${format.format} is the least complicated credible way to test the value.`}, human_value:{status:valueStatus, explanation:valueStatus === 'Clear' ? 'The intended improvement for the user is understandable.' : 'The output is described more clearly than the benefit to the person.'}, simplification:{status:simplifyStatus, explanation:simplifyStatus === 'Clear' ? 'No major platform layer is required before the core test.' : 'The concept earns a smaller test before it earns its full feature set.'}},
    next_move:{recommendation, reasoning:`The most useful next investment is evidence about ${biggest.charAt(0).toLowerCase()}${biggest.slice(1)}`, actions},
    confidence:{known_from_user:unique([text, ...Object.values(answers).map(tidy)]).filter(Boolean), inferred:[`The likely first format is ${format.format.toLowerCase()}.`, `The primary user is currently interpreted as: ${primaryUser}.`], unknown:['Observed user behavior', 'Willingness to change from the current workaround', 'Build cost and timing', 'Market size, pricing, and commercial demand']}
  };
}

export function validateReport(report) {
  const required = ['idea','human','useful','technology','ai','complexity','reality','hn_test','next_move','confidence'];
  const missing = required.filter((key) => !report?.[key]);
  if (missing.length) throw new Error(`Invalid Product Lens report: missing ${missing.join(', ')}`);
  if (!Array.isArray(report.useful.core_capabilities) || report.useful.core_capabilities.length < 3) throw new Error('Invalid Product Lens report: core capabilities');
  if (!['Clear','Needs validation','Needs simplification'].includes(report.hn_test.real_problem.status)) throw new Error('Invalid Product Lens report: HN Test status');
  return report;
}
