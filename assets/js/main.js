/* ═══════════════════════════════════════════════════════
   VELORIX CUSTOMS — main.js
   Clean, lightweight, no gimmicks.
═══════════════════════════════════════════════════════ */

/* ── LOADER ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('out'), 900);
});

/* ── NAVBAR SCROLL ──────────────────────────────────── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── HAMBURGER / MOBILE MENU ────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMenu() {
  hamburger?.classList.add('open');
  mobileMenu?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger?.classList.remove('open');
  mobileMenu?.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

/* ── SCROLL REVEAL ───────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ───────────────────────────────── */
const counters = document.querySelectorAll('.counter');
let countersStarted = false;

function runCounters() {
  counters.forEach(el => {
    const target = +el.dataset.target;
    const dur    = 1800;
    const step   = target / (dur / 16);
    let cur      = 0;
    const tick   = () => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur);
      if (cur < target) requestAnimationFrame(tick);
    };
    tick();
  });
}

if (counters.length) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      runCounters();
    }
  }, { threshold: 0.3 }).observe(counters[0]);
}


/* ── HERO PARALLAX — very subtle, CSS only preferred ── */
const heroImg = document.getElementById('heroImg');
if (heroImg && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.25;
    heroImg.style.transform = `scale(1.04) translateY(${y}px)`;
  }, { passive: true });
}

/* ── FAQ ACCORDION ───────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.parentElement;
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

/* ── GALLERY FILTER ──────────────────────────────────── */
const filterBtns   = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.display    = match ? 'block' : 'none';
      item.style.opacity    = match ? '1' : '0';
    });
  });
});

/* ── SMOOTH SCROLL (anchor links) ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── LAZY IMAGES ─────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const imgObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; }
        imgObs.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imgObs.observe(img));
}
