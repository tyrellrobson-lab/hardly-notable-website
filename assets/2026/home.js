document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Image slots: if a screenshot isn't there yet, show the branded placeholder
document.querySelectorAll('img[data-slot]').forEach(img => {
  const fail = () => {
    const shot = img.closest('.shot'); shot?.classList.add('noimg');
    const url = shot?.parentElement.querySelector('[data-fallback-url]');
    if (url && shot.querySelector('.shot-fallback')) url.textContent = url.dataset.fallbackUrl;
    img.remove();
  };
  if (img.complete && !img.naturalWidth) fail(); else img.addEventListener('error', fail);
});

// Nav
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.menu-btn');
const links = document.getElementById('nav-links');
const setMenu = open => {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  links.classList.toggle('open', open);
};
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && links?.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

// Hero stage: tilts flat as you scroll
const stage = document.getElementById('stage');
let ticking = false;
const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 24);
  if (stage && !reduce) {
    const p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.55), 0), 1);
    stage.style.setProperty('--tilt', `${22 * (1 - p)}deg`);
    stage.style.setProperty('--sc', `${0.94 + 0.06 * p}`);
  }
  ticking = false;
};
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

// Cursor spotlight on cards
document.querySelectorAll('.spot').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
});

// Count-up numbers
const countUp = el => {
  const end = Number(el.dataset.count);
  if (reduce || !end) return;
  const t0 = performance.now(), dur = 1100;
  const step = t => {
    const k = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Scroll reveal
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 70}ms`;
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add('in'));
}

const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();
