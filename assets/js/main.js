/* =====================================================
   VELORIX CUSTOMS — main.js
   Refined. Lightweight. Premium motion only.
===================================================== */

/* LOADER */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('out'), 700);

  /* Hero image: trigger slow zoom-out once loaded */
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    const activate = () => heroImg.classList.add('hero-img-loaded');
    heroImg.complete ? activate() : heroImg.addEventListener('load', activate, { once: true });
  }
});

/* NAVBAR */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* MOBILE MENU */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMenu()  {
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

/* SCROLL REVEAL */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* COUNTER ANIMATION */
const counters = document.querySelectorAll('.counter');
let countersStarted = false;

function runCounters() {
  counters.forEach(el => {
    const target = +el.dataset.target;
    const step   = target / (2000 / 16);
    let cur = 0;
    const tick = () => {
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

/* HERO SUBTLE PARALLAX — respects reduced-motion */
(function () {
  const img = document.getElementById('heroImg');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!img || reducedMotion || window.innerWidth <= 768) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * 0.16, 70);
        img.style.transform = `scale(1.02) translateY(${y}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* FAQ ACCORDION */
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.parentElement;
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

/* GALLERY FILTER */
const filterBtns   = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
    });
  });
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* LAZY IMAGES */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
}
