/* ===== VELORIX CUSTOMS - Premium JS V2 ===== */
/* Smooth animations, staggered reveals, premium interactions */

'use strict';

// ===== Loading Screen =====
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger initial reveals after loader hides
    setTimeout(revealOnScroll, 200);
  }, 1200);
});

// ===== Navbar Scroll Effect =====
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

const handleScroll = () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
};

window.addEventListener('scroll', handleScroll, { passive: true });

// ===== Hamburger Menu =====
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}


// ===== Scroll Reveal Animations (Staggered) =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  const triggerPoint = windowHeight * 0.88;

  revealElements.forEach((el, index) => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < triggerPoint) {
      // Add small stagger for siblings in same parent
      const parent = el.parentElement;
      const siblings = parent ? [...parent.children].filter(c => c.classList.contains('reveal') || c.classList.contains('reveal-left') || c.classList.contains('reveal-right')) : [];
      const siblingIndex = siblings.indexOf(el);
      const delay = siblingIndex * 80;

      setTimeout(() => {
        el.classList.add('active');
      }, delay);
    }
  });
};

window.addEventListener('scroll', revealOnScroll, { passive: true });

// ===== Counter Animation (Improved with easing) =====
const counters = document.querySelectorAll('.counter');
let counterStarted = false;

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const startCounter = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 2200;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(easedProgress * target);

      counter.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCounter);
  });
};

const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterStarted) {
        counterStarted = true;
        startCounter();
      }
    });
  }, { threshold: 0.2 });
  statsObserver.observe(statsSection);
}


// ===== FAQ Accordion =====
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isActive = item.classList.contains('active');

    // Close all others with smooth animation
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('active');
    });

    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ===== Gallery Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    galleryItems.forEach((item, index) => {
      const shouldShow = filter === 'all' || item.getAttribute('data-category') === filter;

      if (shouldShow) {
        item.style.display = 'block';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, index * 60);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Parallax effect on hero background =====
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1.08) translateY(${scrolled * 0.15}px)`;
    }
  }, { passive: true });
}

// ===== Subtle mouse interaction on service cards =====
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });
});

// ===== Lazy Loading Images =====
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.style.opacity = '0';
          img.onload = () => {
            img.style.transition = 'opacity 0.6s ease';
            img.style.opacity = '1';
          };
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imgObserver.observe(img);
  });
}
