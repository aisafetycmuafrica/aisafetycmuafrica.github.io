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
