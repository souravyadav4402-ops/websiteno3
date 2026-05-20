/* ===== VELORIX CUSTOMS - Main JavaScript ===== */

/* ===== THREE.JS HERO 3D ANIMATION ===== */
(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x050508, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  /* --- Fog for depth --- */
  scene.fog = new THREE.FogExp2(0x050508, 0.018);

  /* --- Ambient + accent lights --- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const blueLight = new THREE.PointLight(0x1e90ff, 3, 40);
  blueLight.position.set(-8, 5, 5);
  scene.add(blueLight);

  const rimLight = new THREE.PointLight(0x4466ff, 2, 30);
  rimLight.position.set(8, -3, 3);
  scene.add(rimLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
  topLight.position.set(0, 10, 5);
  scene.add(topLight);

  /* -------------------------------------------------------
     CAR WIREFRAME  — built from geometric primitives
     (body shell, roof, wheels, spoiler)
  ------------------------------------------------------- */
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1e90ff, wireframe: true, transparent: true, opacity: 0.18 });
  const solidMat = new THREE.MeshPhongMaterial({ color: 0x0a1a2e, transparent: true, opacity: 0.55, shininess: 120 });

  const carGroup = new THREE.Group();

  // — Main body (flattened box)
  const bodyGeo  = new THREE.BoxGeometry(7, 1.3, 3);
  carGroup.add(new THREE.Mesh(bodyGeo, solidMat));
  carGroup.add(new THREE.Mesh(bodyGeo, wireMat));

  // — Cabin (smaller box on top, offset forward)
  const cabinGeo = new THREE.BoxGeometry(3.8, 1.1, 2.8);
  const cabinSolid = new THREE.Mesh(cabinGeo, solidMat);
  const cabinWire  = new THREE.Mesh(cabinGeo, wireMat);
  cabinSolid.position.set(-0.3, 1.15, 0);
  cabinWire.position.set(-0.3, 1.15, 0);
  carGroup.add(cabinSolid, cabinWire);

  // — Hood slope (tapered box at front)
  const hoodGeo = new THREE.BoxGeometry(2.2, 0.6, 2.9);
  const hoodS = new THREE.Mesh(hoodGeo, solidMat);
  const hoodW = new THREE.Mesh(hoodGeo, wireMat);
  hoodS.position.set(2.6, 0.3, 0);
  hoodW.position.set(2.6, 0.3, 0);
  carGroup.add(hoodS, hoodW);

  // — Boot / trunk
  const trunkGeo = new THREE.BoxGeometry(1.8, 0.5, 2.9);
  const trunkS = new THREE.Mesh(trunkGeo, solidMat);
  const trunkW = new THREE.Mesh(trunkGeo, wireMat);
  trunkS.position.set(-3.0, 0.25, 0);
  trunkW.position.set(-3.0, 0.25, 0);
  carGroup.add(trunkS, trunkW);

  // — Spoiler
  const spoilerGeo = new THREE.BoxGeometry(0.15, 0.6, 2.5);
  const spoilerS = new THREE.Mesh(spoilerGeo, solidMat);
  const spoilerW = new THREE.Mesh(spoilerGeo, wireMat);
  spoilerS.position.set(-3.7, 0.8, 0);
  spoilerW.position.set(-3.7, 0.8, 0);
  carGroup.add(spoilerS, spoilerW);

  // — Wheels (4 tori)
  const wheelPositions = [
    [ 2.4, -0.85,  1.7],
    [ 2.4, -0.85, -1.7],
    [-2.4, -0.85,  1.7],
    [-2.4, -0.85, -1.7],
  ];
  const wheelWire = new THREE.MeshBasicMaterial({ color: 0x1e90ff, wireframe: true, transparent: true, opacity: 0.35 });
  wheelPositions.forEach(([x, y, z]) => {
    const geo = new THREE.TorusGeometry(0.85, 0.3, 12, 24);
    const mesh = new THREE.Mesh(geo, wheelWire);
    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.PI / 2;
    carGroup.add(mesh);
  });

  // — Rim spokes (cylinder per wheel)
  wheelPositions.forEach(([x, y, z]) => {
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.6, 4),
        wheelWire
      );
      spoke.position.set(x, y, z);
      spoke.rotation.set(i * Math.PI / 2.5, 0, Math.PI / 2);
      carGroup.add(spoke);
    }
  });

  carGroup.position.set(0, 0.3, 0);
  scene.add(carGroup);

  /* --- Glowing edge lines on car --- */
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.55 });
  [bodyGeo, cabinGeo].forEach((geo, i) => {
    const edges = new THREE.EdgesGeometry(geo);
    const line  = new THREE.LineSegments(edges, edgeMat);
    if (i === 1) { line.position.set(-0.3, 1.15, 0); }
    carGroup.add(line);
  });

  /* -------------------------------------------------------
     PARTICLE FIELD  — two layers: fine dust + mid stars
  ------------------------------------------------------- */
  function makeParticles(count, spread, size, color, opacity) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }

  const dustField  = makeParticles(1800, 60, 0.06, 0xaaccff, 0.4);
  const starField  = makeParticles(400,  80, 0.14, 0x1e90ff, 0.7);
  scene.add(dustField, starField);

  /* -------------------------------------------------------
     GRID PLANE  — subtle ground grid
  ------------------------------------------------------- */
  const gridHelper = new THREE.GridHelper(40, 30, 0x1e3a5f, 0x0d1f30);
  gridHelper.position.y = -2.2;
  scene.add(gridHelper);

  /* -------------------------------------------------------
     FLOATING RINGS  — decorative orbital rings
  ------------------------------------------------------- */
  function makeRing(radius, tube, color, opacity) {
    const geo  = new THREE.TorusGeometry(radius, tube, 8, 60);
    const mat  = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity });
    return new THREE.Mesh(geo, mat);
  }
  const ring1 = makeRing(6, 0.04, 0x1e90ff, 0.15);
  ring1.rotation.x = Math.PI / 2.5;
  scene.add(ring1);

  const ring2 = makeRing(9, 0.03, 0x4466ff, 0.08);
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = 0.4;
  scene.add(ring2);

  /* -------------------------------------------------------
     MOUSE PARALLAX
  ------------------------------------------------------- */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* -------------------------------------------------------
     RESIZE HANDLER
  ------------------------------------------------------- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* -------------------------------------------------------
     ANIMATION LOOP
  ------------------------------------------------------- */
  let clock = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.008;

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    // Car: slow float + gentle tilt on mouse
    carGroup.rotation.y  = clock * 0.25 + targetX * 0.3;
    carGroup.rotation.x  = targetY * 0.12;
    carGroup.position.y  = 0.3 + Math.sin(clock * 1.2) * 0.25;

    // Rings spin
    ring1.rotation.z = clock * 0.18;
    ring2.rotation.y = clock * 0.12;

    // Particles drift
    dustField.rotation.y = clock * 0.04;
    starField.rotation.y = -clock * 0.03;
    dustField.rotation.x = clock * 0.015;

    // Light pulse (blue shimmer)
    blueLight.intensity = 3 + Math.sin(clock * 2.5) * 1.2;
    rimLight.intensity  = 2 + Math.cos(clock * 1.8) * 0.8;

    // Camera subtle sway
    camera.position.x = targetX * 1.5;
    camera.position.y = -targetY * 0.8;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();

// Loading Screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('.loader').classList.add('hidden');
  }, 1500);
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});


// Scroll Reveal Animations
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealOnScroll = () => {
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if (elementTop < windowHeight - 100) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Counter Animation
const counters = document.querySelectorAll('.counter');
let counterStarted = false;

const startCounter = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    updateCounter();
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
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isActive = item.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// Gallery Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.getAttribute('data-filter');
    
    galleryItems.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-category') === filter) {
        item.style.display = 'block';
        item.style.animation = 'fadeIn 0.5s ease forwards';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imgObserver.observe(img);
  });
}

// Add fade-in keyframe
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
document.head.appendChild(style);
