// Mobile nav toggle
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

// Close the desktop Programs dropdown when clicking outside it
document.addEventListener('click', (e) => {
  document.querySelectorAll('details.nav__dropdown[open]').forEach(d => {
    if (!d.contains(e.target)) d.removeAttribute('open');
  });
});

// Apply-page tabs (Semester Track / Core Membership)
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('is-active'));
    const target = document.getElementById(tab.dataset.target);
    if (target) target.classList.add('is-active');
  });
});

// Floating scroll-to-top button — created here so every page gets it without editing each HTML file
const scrollBtn = document.createElement('button');
scrollBtn.className = 'scroll-top';
scrollBtn.setAttribute('aria-label', 'Scroll to top');
scrollBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
document.body.appendChild(scrollBtn);

function toggleScrollBtn() {
  if (window.scrollY > 400) scrollBtn.classList.add('is-visible');
  else scrollBtn.classList.remove('is-visible');
}
window.addEventListener('scroll', toggleScrollBtn, { passive: true });
toggleScrollBtn();

scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
