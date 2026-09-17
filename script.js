/* =========================================================
   PORTFOLIO — MAIN SCRIPT
   Sections:
   1. Preloader
   2. Custom Cursor
   3. Three.js 3D Hero Scene
   4. Typewriter Effect
   5. Navbar (scroll, mobile menu, active link)
   6. Scroll Progress + Back To Top
   7. Reveal on Scroll (IntersectionObserver)
   8. Skill Bars + Counters
   9. 3D Tilt Effect on Cards
   10. Contact Form
   11. Misc
   ========================================================= */

/* =========================================================
   1. PRELOADER
   ========================================================= */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('hidden'), 700);
});

/* =========================================================
   2. CUSTOM CURSOR
   ========================================================= */
(function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot || !outline) return;

  // Disable on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth trailing for the outline
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Grow on hoverable elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .project-card, .skill-card, .cert-card, .social-card, .coding-card, input, textarea'
  );
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('grow'));
    el.addEventListener('mouseleave', () => outline.classList.remove('grow'));
  });
})();

/* =========================================================
   3. THREE.JS 3D HERO SCENE
   ========================================================= */
(function initThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Skip heavy 3D on small screens / reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.018);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* ---------- Particle Sphere ---------- */
  const PARTICLE_COUNT = window.innerWidth < 768 ? 1200 : 2600;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const colorA = new THREE.Color(0x6366f1);
  const colorB = new THREE.Color(0xa855f7);
  const colorC = new THREE.Color(0x06b6d4);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Fibonacci-ish sphere distribution
    const radius = 16 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Gradient colour pick
    const t = Math.random();
    const mixed = t < 0.5
      ? colorA.clone().lerp(colorB, t * 2)
      : colorB.clone().lerp(colorC, (t - 0.5) * 2);

    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;

    sizes[i] = Math.random() * 0.35 + 0.08;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Circular soft point sprite
  function makeCircleTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const particleMat = new THREE.PointsMaterial({
    size: 0.42,
    map: makeCircleTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ---------- Wireframe Torus Knot ---------- */
  const knotGeo = new THREE.TorusKnotGeometry(7, 1.9, 140, 20, 2, 3);
  const knotMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.set(11, 3, -10);
  scene.add(knot);

  /* ---------- Wireframe Icosahedron ---------- */
  const icoGeo = new THREE.IcosahedronGeometry(5, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-13, -5, -6);
  scene.add(ico);

  /* ---------- Floating small shapes ---------- */
  const floaters = [];
  const shapes = [
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.TetrahedronGeometry(0.9, 0),
    new THREE.IcosahedronGeometry(0.7, 0),
  ];

  for (let i = 0; i < 14; i++) {
    const geo = shapes[Math.floor(Math.random() * shapes.length)];
    const mat = new THREE.MeshBasicMaterial({
      color: [0x6366f1, 0xa855f7, 0x06b6d4][Math.floor(Math.random() * 3)],
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 46,
      (Math.random() - 0.5) * 32,
      (Math.random() - 0.5) * 28 - 6
    );
    mesh.userData = {
      speed: 0.002 + Math.random() * 0.006,
      floatSpeed: 0.4 + Math.random() * 0.9,
      floatAmp: 0.4 + Math.random() * 0.9,
      baseY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    floaters.push(mesh);
  }

  /* ---------- Mouse Parallax ---------- */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    // subtle parallax scroll
    const s = window.scrollY;
    particles.rotation.z = s * 0.0004;
  });

  /* ---------- Animation Loop ---------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth camera parallax
    currentX += (targetX - currentX) * 0.045;
    currentY += (targetY - currentY) * 0.045;
    camera.position.x = currentX * 6;
    camera.position.y = -currentY * 6;
    camera.lookAt(0, 0, 0);

    // Rotate main particle field
    particles.rotation.y = t * 0.045;
    particles.rotation.x = Math.sin(t * 0.18) * 0.12;

    // Knot + ico
    knot.rotation.x = t * 0.16;
    knot.rotation.y = t * 0.22;
    ico.rotation.x = -t * 0.2;
    ico.rotation.z = t * 0.13;

    // Floaters
    floaters.forEach((m) => {
      const d = m.userData;
      m.rotation.x += d.speed;
      m.rotation.y += d.speed * 1.4;
      m.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
    });

    renderer.render(scene, camera);
  }
  animate();

  /* ---------- Resize ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 150);
  });
})();

/* =========================================================
   4. TYPEWRITER EFFECT
   ========================================================= */
(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'Full Stack Developer',
    'DSA Problem Solver',
    'React Enthusiast',
    'AI / ML Explorer',
    'Open Source Contributor',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
      setTimeout(tick, 75);
    } else {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        return setTimeout(tick, 350);
      }
      setTimeout(tick, 38);
    }
  }
  setTimeout(tick, 600);
})();

/* =========================================================
   5. NAVBAR
   ========================================================= */
(function navbar() {
  const navbarEl = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll style
  function onScroll() {
    navbarEl.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  links.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll (scroll-spy)
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          links.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`)
          );
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));
})();

/* =========================================================
   6. SCROLL PROGRESS + BACK TO TOP
   ========================================================= */
(function scrollUI() {
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progress.style.width = pct + '%';
    backToTop.classList.toggle('show', scrollTop > 500);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =========================================================
   7. REVEAL ON SCROLL
   ========================================================= */
(function revealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((item) => observer.observe(item));
})();

/* =========================================================
   8. SKILL BARS + COUNTERS
   ========================================================= */
(function animateSkills() {
  const bars = document.querySelectorAll('.skill-bar .bar i');
  if (bars.length) {
    const barObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            setTimeout(() => {
              el.style.width = el.dataset.width;
            }, 180);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => barObserver.observe(b));
  }
})();

(function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function runCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + (target >= 1000 ? '' : '');
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => obs.observe(c));
})();

/* =========================================================
   9. 3D TILT EFFECT
   ========================================================= */
(function tiltEffect() {
  if (window.matchMedia('(hover: none)').matches) return;

  const tiltEls = document.querySelectorAll('.tilt');

  tiltEls.forEach((el) => {
    let rafId = null;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 7;
      const rotateX = ((centerY - y) / centerY) * 7;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });
})();

/* =========================================================
   10. CONTACT FORM
   ========================================================= */
(function contactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Simple validation
    if (!name || !email || !subject || !message) {
      status.textContent = '⚠️ Please fill in all the fields.';
      status.className = 'form-status error';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      status.textContent = '⚠️ Please enter a valid email address.';
      status.className = 'form-status error';
      return;
    }

    // Simulated send
    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
      status.textContent = '✅ Thanks for reaching out! I\'ll reply within 24 hours.';
      status.className = 'form-status success';
      form.reset();

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        status.textContent = '';
      }, 3500);
    }, 1400);

    /* ---------------------------------------------------
       TO MAKE IT REAL: uncomment below & use your endpoint
       ---------------------------------------------------
       fetch('https://formspree.io/f/YOUR_FORM_ID', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, subject, message })
       });
    --------------------------------------------------- */
  });
})();

/* =========================================================
   11. MISC
   ========================================================= */
// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll fallback for browsers without CSS smooth-scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});