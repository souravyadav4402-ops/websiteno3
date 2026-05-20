/* ===== VELORIX CUSTOMS - Main JavaScript ===== */

/* =====================================================
   ALLOY WHEEL — rotate, float, mouse-parallax tilt
   Pure vanilla JS, no dependencies.
===================================================== */
(function initWheelAnimation() {

  const wrapper = document.getElementById('wheelWrapper');
  const scene   = document.getElementById('wheelScene');
  if (!wrapper || !scene) return;

  /* ── State ──────────────────────────────────────── */
  let rotAngle   = 0;          // continuous spin (deg)
  let floatPhase = 0;          // sine clock for levitation
  let tiltX      = 0;          // current mouse-driven X tilt (deg)
  let tiltY      = 0;          // current mouse-driven Y tilt (deg)
  let targetTiltX = 0;         // mouse target
  let targetTiltY = 0;
  let raf;

  /* ── Config ─────────────────────────────────────── */
  const ROT_SPEED    = 0.28;   // degrees per frame at 60fps
  const FLOAT_SPEED  = 0.018;  // sine frequency
  const FLOAT_AMP    = 14;     // px amplitude of float
  const TILT_MAX     = 12;     // max perspective tilt degrees
  const TILT_EASE    = 0.055;  // lerp factor for mouse follow
  const PERSPECTIVE  = 900;    // CSS perspective px

  /* Apply perspective to the scene container once */
  scene.style.perspective       = PERSPECTIVE + 'px';
  scene.style.perspectiveOrigin = '50% 50%';

  /* ── Mouse tracking ─────────────────────────────── */
  function onMouseMove(e) {
    /* Bounds of the hero section */
    const hero = document.getElementById('hero') || document.body;
    const rect  = hero.getBoundingClientRect();
    /* Normalise to –1 … +1 within the hero */
    const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    targetTiltX = -ny * TILT_MAX;   /* tilt forward/back  */
    targetTiltY =  nx * TILT_MAX;   /* tilt left/right    */
  }

  function onMouseLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
  }

  /* Only listen while hero is in view */
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', onMouseMove, { passive: true });
    hero.addEventListener('mouseleave', onMouseLeave, { passive: true });
  }

  /* Touch: minimal tilt on mobile */
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const nx = (t.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (t.clientY / window.innerHeight - 0.5) * 2;
    targetTiltX = -ny * (TILT_MAX * 0.4);
    targetTiltY =  nx * (TILT_MAX * 0.4);
  }, { passive: true });

  /* ── Animation loop ─────────────────────────────── */
  let lastTime = 0;

  function tick(now) {
    raf = requestAnimationFrame(tick);

    /* Δt normalised to 60fps so speed is frame-rate independent */
    const dt = Math.min((now - lastTime) / 16.667, 3);
    lastTime = now;

    /* 1. Continuous wheel spin */
    rotAngle += ROT_SPEED * dt;

    /* 2. Vertical float */
    floatPhase += FLOAT_SPEED * dt;
    const floatY = Math.sin(floatPhase) * FLOAT_AMP;

    /* 3. Smooth mouse tilt (lerp) */
    tiltX += (targetTiltX - tiltX) * TILT_EASE;
    tiltY += (targetTiltY - tiltY) * TILT_EASE;

    /* 4. Compose transform
         - translateY: float
         - rotateX / rotateY: mouse parallax perspective tilt
         - rotateZ: the wheel spin (face-on = Z axis)
    */
    wrapper.style.transform =
      `translateY(${floatY}px) ` +
      `rotateX(${tiltX}deg) ` +
      `rotateY(${tiltY}deg) ` +
      `rotateZ(${rotAngle}deg)`;
  }

  /* Start after first paint */
  requestAnimationFrame((t) => {
    lastTime = t;
    raf = requestAnimationFrame(tick);
  });

  /* Pause when tab is hidden (battery save) */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  });

})();


/* =====================================================
   LOADING SCREEN
===================================================== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.add('hidden');
  }, 1200);
});


/* =====================================================
   NAVBAR — scroll state
===================================================== */
const navbar = document.querySelector('.navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}


/* =====================================================
   HAMBURGER MENU
===================================================== */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}


/* =====================================================
   SCROLL REVEAL
===================================================== */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealOnScroll = () => {
  const vh = window.innerHeight;
  revealEls.forEach(el => {
    if (el.getBoundingClientRect().top < vh - 100) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load',   revealOnScroll);


/* =====================================================
   COUNTER ANIMATION
===================================================== */
const counters = document.querySelectorAll('.counter');
let counterStarted = false;

function startCounters() {
  counters.forEach(counter => {
    const target   = +counter.getAttribute('data-target');
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;

    const tick = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target;
      }
    };
    tick();
  });
}

const statsSection = document.querySelector('.stats-grid');
if (statsSection && counters.length) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counterStarted) {
      counterStarted = true;
      startCounters();
    }
  }, { threshold: 0.3 }).observe(statsSection);
}


/* =====================================================
   FAQ ACCORDION
===================================================== */
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item   = q.parentElement;
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});


/* =====================================================
   GALLERY FILTER
===================================================== */
const filterBtns   = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    galleryItems.forEach(item => {
      const match = filter === 'all' || item.getAttribute('data-category') === filter;
      item.style.display   = match ? 'block' : 'none';
      item.style.animation = match ? 'fadeIn 0.45s ease forwards' : 'none';
    });
  });
});


/* =====================================================
   SMOOTH SCROLL — anchor links
===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* =====================================================
   LAZY LOAD IMAGES
===================================================== */
if ('IntersectionObserver' in window) {
  const imgObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObs.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imgObs.observe(img));
}


/* =====================================================
   UTILITY — fadeIn keyframe injection
===================================================== */
(function () {
  const s = document.createElement('style');
  s.textContent =
    '@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(s);
})();
