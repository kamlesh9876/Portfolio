/**
 * KAMLESH PAWAR - PORTFOLIO CLIENT SCRIPTS
 * Interactive Navigation, Live GitHub Stats, Architecture Diagram Switcher,
 * Motion & Parallax Guards, and Yutsumi AI Assistant.
 *
 * SECTION → FUNCTIONS (order matches index.html + styles.css)
 *  00 GLOBAL   initSmoothScroll · initLoader · initCustomCursor ·
 *              initCursorSpotlight · initScrollReveal · initTiltAndMagneticEffects
 *  01 NAVBAR   initNavigation
 *  02 HERO     initSplitText · initHeroParallax · initGitHubStats
 *  06 ARCHITECTURE  initArchitectureSwitcher
 *  12 CONTACT  copyEmail
 *  13 CHAT     initChatbot · toggleChat · openYutsumi · appendMsg ·
 *              showTyping · removeTyping · sendMessage · escapeHtml
 */

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioIntro();          // 00 GLOBAL
  initSmoothScroll();            // 00 GLOBAL
  initSplitText();               // 02 HERO
  initCustomCursor();            // 00 GLOBAL
  initCursorSpotlight();         // 00 GLOBAL
  initNavigation();              // 01 NAVBAR
  initScrollReveal();            // 00 GLOBAL
  initTiltAndMagneticEffects();  // 00 GLOBAL
  initHeroParallax();            // 02 HERO
  initArchitectureSwitcher();    // 06 ARCHITECTURE
  initArchScramble();            // 06 ARCHITECTURE
  initGitHubStats();             // 02 HERO
  initCaseModal();               // 05 PROJECTS
  initDock();                    // 01 NAVBAR
  initSectionParallax();         // GLOBAL
  initChatbot();                 // 13 CHAT
});

// ══════ SECTION 00 · GLOBAL — initSmoothScroll ══════
let lenisInstance = null;
function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof Lenis === 'undefined') return;

  lenisInstance = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Forward Lenis scroll to native scroll events for existing listeners.
  // Re-entry guard: the synthetic scroll event re-triggers Lenis's own
  // onNativeScroll → emit('scroll') → this handler, which would recurse
  // until "Maximum call stack size exceeded" without the flag.
  let forwarding = false;
  lenisInstance.on('scroll', () => {
    if (forwarding) return;
    forwarding = true;
    window.dispatchEvent(new Event('scroll'));
    forwarding = false;
  });
}

// ══════ SECTION 02 · HERO — initSplitText ══════
function initSplitText() {
  // Split hero name into characters
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    heroName.classList.remove('reveal-text'); // split-text replaces clip-path reveal
    const text = heroName.textContent.trim();
    const words = text.split(/\s+/);
    heroName.innerHTML = ''; // clear
    heroName.setAttribute('aria-label', text);
    words.forEach(word => {
      const lineSpan = document.createElement('span');
      lineSpan.className = 'split-line';
      word.split('').forEach((char, i) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'split-char';
        charSpan.textContent = char;
        charSpan.setAttribute('aria-hidden', 'true');
        charSpan.style.transitionDelay = `${i * 35}ms`;
        lineSpan.appendChild(charSpan);
      });
      heroName.appendChild(lineSpan);
    });
  }

  // Split hero role into words
  const heroRole = document.querySelector('.hero-role');
  if (heroRole) {
    const strong = heroRole.querySelector('strong');
    const source = strong || heroRole;
    const text = source.textContent.trim();
    const words = text.split(/\s+/);
    source.innerHTML = '';
    words.forEach((word, i) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'split-word';
      wordSpan.textContent = word;
      wordSpan.style.transitionDelay = `${i * 60 + 200}ms`;
      source.appendChild(wordSpan);
      if (i < words.length - 1) {
        source.appendChild(document.createTextNode(' '));
      }
    });
  }

  // Trigger after loader hides
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.split-char, .split-word').forEach(el => {
        el.classList.add('visible');
      });
    }, 900);
  });
}

// ══════ SECTION 00 · GLOBAL — initLoader ══════
// ══════ GLOBAL — section parallax (backdrops drift slower than content) ══════
function initSectionParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layers = [...document.querySelectorAll('[data-parallax]')];
  if (layers.length === 0) return;
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    layers.forEach(layer => {
      const section = layer.closest('section');
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return; // offscreen — skip
      // +1 when the section sits a full viewport below center, -1 above
      const progress = (r.top + r.height / 2 - vh / 2) / vh;
      const strength = parseFloat(layer.dataset.parallax) || 0.15;
      const y = progress * strength * vh;
      layer.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  }

  function request() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  // Lenis forwards its smooth scroll as window scroll events, so both work
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  update();
}

// ══════ SECTION 01 · NAVBAR — macOS-style dock magnification ══════
// ══════ SECTION 01 · NAVBAR — macOS dock engine ══════
function initDock() {
  const dock = document.getElementById('navbar');
  const dockItems = [...document.querySelectorAll('.dock-item')];
  if (!dock || dockItems.length === 0) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Launch bounce on click, like an opening macOS app (all pointer types)
  if (!reducedMotion) {
    dockItems.forEach((item) => {
      item.addEventListener('click', () => {
        item.classList.remove('bouncing');
        void item.offsetWidth; // force reflow so the animation restarts
        item.classList.add('bouncing');
      });
      item.addEventListener('animationend', () => {
        item.classList.remove('bouncing');
      });
    });
  }

  // Magnification — quadratic falloff around the cursor, like macOS
  if (finePointer && !reducedMotion) {
    const MAX_SCALE = 1.42;
    const INFLUENCE = 110; // px of cursor influence around each item
    let rafId = null;

    dock.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        dockItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const dist = Math.abs(e.clientX - center);
          if (dist > INFLUENCE) {
            item.style.removeProperty('--dock-scale');
            return;
          }
          const proximity = 1 - dist / INFLUENCE;
          const scale = 1 + (MAX_SCALE - 1) * proximity * proximity;
          // The var composes with the bounce keyframes, so hover scale survives the hop
          item.style.setProperty('--dock-scale', scale.toFixed(3));
        });
      });
    });

    dock.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      dockItems.forEach((item) => { item.style.removeProperty('--dock-scale'); });
    });
  }

  // Idle fade — the dock recedes slightly after 4s of inactivity
  let idleTimer;
  const wake = () => {
    dock.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => dock.classList.add('idle'), 4000);
  };
  document.addEventListener('mousemove', wake, { passive: true });
  document.addEventListener('scroll', wake, { passive: true });
  document.addEventListener('touchstart', wake, { passive: true });
  wake();

  // Active section — center-of-viewport spy so tall sections register too
  const sections = document.querySelectorAll('main section[id]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      dockItems.forEach((item) => {
        const href = item.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const active = href === `#${entry.target.id}`;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  sections.forEach((s) => spy.observe(s));
}

// ══════ SECTION 00 · GLOBAL — initPortfolioIntro ══════
function initPortfolioIntro() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    document.body.classList.add('intro-complete');
    document.getElementById('intro')?.style.setProperty('display', 'none');
    document.getElementById('navbar')?.style.setProperty('opacity', '1');
    return;
  }

  const INTRO_STAGES = [0, 0.25, 0.45, 0.55, 0.65, 0.85, 1];
  const BOOT_LINES = ['initializing environment', 'loading profile', 'connecting backend', 'ready'];

  const intro = document.getElementById('intro');
  const navbar = document.getElementById('navbar');
  const introSticky = document.querySelector('.intro-sticky');
  const introContent = document.querySelector('.intro-content');
  const introGlow1 = document.querySelector('.intro-glow-1');
  const introGlow2 = document.querySelector('.intro-glow-2');
  const introCorners = document.querySelectorAll('.intro-corner');
  const helloMac = document.getElementById('helloMac');
  const emailText = document.getElementById('emailText');
  const macSubtext = document.querySelector('.mac-subtext');
  const introProgress = document.getElementById('introProgress');
  const introSkip = document.getElementById('introSkip');
  const promptCommand = document.querySelector('.mac-prompt .prompt-command');
  const stageDots = document.getElementById('introStageDots');

  if (!intro || !helloMac || !emailText) return;

  const email = 'kamleshsharadpawar@gmail.com';
  let emailIndex = 0;
  let emailTypingStarted = false;

  function typeEmail() {
    if (emailIndex < email.length) {
      emailText.textContent += email.charAt(emailIndex);
      emailIndex++;
      setTimeout(typeEmail, 50);
    }
  }

  function animateTechIcons() {
    const techIcons = document.querySelectorAll('.tech-icon');
    const techStack = document.querySelector('.mac-tech-stack');
    
    if (!techStack || techIcons.length === 0) return;

    techStack.style.opacity = '1';

    techIcons.forEach((icon, index) => {
      setTimeout(() => {
        icon.classList.add('visible');
      }, index * 70);
    });
  }

  function updateIntro() {
    const rect = intro.getBoundingClientRect();
    const introHeight = intro.offsetHeight;
    const progressValue = Math.max(0, Math.min(1, -rect.top / (introHeight - window.innerHeight)));

    // Update progress bar
    if (introProgress) {
      introProgress.style.width = `${progressValue * 100}%`;
    }

    // Update stage dots
    if (stageDots) {
      const dots = stageDots.querySelectorAll('span');
      const active = INTRO_STAGES.findIndex((s, i) => progressValue < (INTRO_STAGES[i + 1] ?? 1.01));
      dots.forEach((d, i) => d.classList.toggle('active', i <= active));
    }

    // Boot log line cycling
    if (promptCommand) {
      const idx = Math.min(BOOT_LINES.length - 1, Math.floor(progressValue * BOOT_LINES.length / 0.55));
      const label = progressValue < 0.55 ? BOOT_LINES[idx] : 'whoami';
      if (promptCommand.textContent !== label) promptCommand.textContent = label;
    }

    // Stage 1: Ambient lighting (0-25%)
    if (progressValue < 0.25) {
      const p = progressValue / 0.25;
      if (introGlow1) introGlow1.style.opacity = `${p * 0.5}`;
      if (introGlow2) introGlow2.style.opacity = `${p * 0.35}`;

      // Fade in corner brackets
      introCorners.forEach(corner => {
        corner.style.opacity = `${Math.min(1, p * 1.8)}`;
      });
    }

    // Stage 2: Mac window appears (25-45%)
    if (progressValue >= 0.25 && progressValue < 0.45) {
      const p = (progressValue - 0.25) / 0.2;
      helloMac.style.opacity = `${p}`;
      helloMac.style.transform = `translateY(${60 - p * 60}px) scale(${0.75 + p * 0.25})`;

      // Start email typing when Mac is visible
      if (!emailTypingStarted && p > 0.4) {
        emailTypingStarted = true;
        typeEmail();
      }
    }

    // Stage 3: Subtext appears (45-55%)
    if (progressValue >= 0.45 && progressValue < 0.55) {
      const p = (progressValue - 0.45) / 0.1;
      if (macSubtext) macSubtext.style.opacity = `${p}`;

      // Animate tech icons when subtext starts appearing
      if (!window.techIconsAnimated && p > 0.2) {
        window.techIconsAnimated = true;
        animateTechIcons();
      }
    }

    // Stage 4: Fade intro content (55-65%)
    if (progressValue >= 0.55 && progressValue < 0.65) {
      const p = (progressValue - 0.55) / 0.1;
      if (introContent) {
        introContent.style.opacity = `${1 - p}`;
        introContent.style.transform = `scale(${1 - p * 0.08}) translateY(${-p * 25}px)`;
      }
    }

    // Stage 5: Mac window expands and fades (65-85%)
    if (progressValue >= 0.65 && progressValue < 0.85) {
      const p = (progressValue - 0.65) / 0.2;
      const targetWidth = Math.min(window.innerWidth * 0.9, 850);
      const targetHeight = Math.min(window.innerHeight * 0.68, 480);
      const currentWidth = 700 + (targetWidth - 700) * p;
      const currentHeight = 400 + (targetHeight - 400) * p;
      const currentRadius = 16 - (16 - 8) * p;

      helloMac.style.width = `${currentWidth}px`;
      helloMac.style.height = `${currentHeight}px`;
      helloMac.style.borderRadius = `${currentRadius}px`;
      helloMac.style.opacity = `${1 - p * 0.65}`;
    }

    // Stage 6: Reveal navbar (75-100%)
    if (progressValue >= 0.75) {
      const p = Math.min(1, (progressValue - 0.75) / 0.15);
      navbar.style.opacity = `${p}`;
      navbar.style.transform = `translateX(-50%) translateY(${30 - p * 30}px)`;
      navbar.style.pointerEvents = p > 0.8 ? 'auto' : 'none';
    }

    // Crossfade to hero (82-100%)
    if (progressValue >= 0.82) {
      document.body.classList.add('intro-handoff');
    } else {
      document.body.classList.remove('intro-handoff');
    }

    // Stage 6: Mac window fades out (88-100%)
    if (progressValue >= 0.88) {
      const p = (progressValue - 0.88) / 0.12;
      helloMac.style.opacity = `${1 - p}`;

      // Show navbar when intro is complete
      if (progressValue > 0.94) {
        document.body.classList.add('intro-complete');
      } else {
        document.body.classList.remove('intro-complete');
      }
    } else {
      document.body.classList.remove('intro-complete');
    }
  }

  // Performance optimization
  let ticking = false;
  let lastScrollY = 0;
  let scrollTimeout;

  function requestUpdate() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateIntro();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Snap-to-stage settling
  let idleTimer;
  function settleToStage() {
    const rect = intro.getBoundingClientRect();
    const introHeight = intro.offsetHeight;
    const total = introHeight - window.innerHeight;
    if (total <= 0) return;
    
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    if (progress <= 0 || progress >= 1) return;

    const nearest = INTRO_STAGES.reduce((a, b) =>
      Math.abs(b - progress) < Math.abs(a - progress) ? b : a
    );
    if (Math.abs(nearest - progress) < 0.001) return;

    const targetY = window.scrollY - rect.top - (progress - nearest) * total;
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(targetY, { duration: 0.5 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  
  window.addEventListener('scroll', () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(settleToStage, 180);
  }, { passive: true });
  
  // Debounced resize handler
  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(requestUpdate, 100);
  });
  
  // Skip button handler
  introSkip?.addEventListener('click', () => {
    const target = document.getElementById('hero');
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(target, { duration: 0.4 });
    } else {
      target.scrollIntoView();
    }
    document.body.classList.add('intro-complete');
  });

  updateIntro();
}

// ══════ SECTION 00 · GLOBAL — initCustomCursor ══════
function initCustomCursor() {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .chip, .arch-btn, .contact-link').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
      });
    });
  } else {
    document.getElementById('custom-cursor')?.remove();
  }
}

// ══════ SECTION 02 · HERO — initHeroParallax ══════
function initHeroParallax() {
  if (window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');
    const heroName = document.querySelector('.hero-name');

    if (heroLeft && heroRight) {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          const progress = scrollY / window.innerHeight;
          heroLeft.style.transform = `translateY(${progress * 60}px)`;
          heroRight.style.transform = `translateY(${progress * 30}px)`;
          if (heroName) {
            heroName.style.transform = `translateY(${progress * 20}px) scale(${1 - progress * 0.1})`;
            heroName.style.opacity = 1 - progress * 0.5;
          }
        }
      }, { passive: true });
    }
  }
}

// ══════ SECTION 00 · GLOBAL — initCursorSpotlight ══════
function initCursorSpotlight() {
  const root = document.documentElement;
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    root.style.setProperty('--mx', `${x}%`);
    root.style.setProperty('--my', `${y}%`);
  }, { passive: true });
}

// ══════ SECTION 01 · NAVBAR — initNavigation ══════
function initNavigation() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Dock scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Smooth scroll links
  document.querySelectorAll('a.dock-item').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
          const offsetTop = targetEl.offsetTop - 20;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// ══════ SECTION 00 · GLOBAL — initScrollReveal ══════
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .reveal-text, .reveal-chip, .stagger, [data-reveal]').forEach(el => observer.observe(el));
}

// ══════ SECTION 00 · GLOBAL — initTiltAndMagneticEffects ══════
function initTiltAndMagneticEffects() {
  if (window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    // Enhanced 3D tilt for cards (about story column excluded — it's a borderless page column, not a card)
    const cards = document.querySelectorAll('.bento-card, .skill-group, .why-card, .cert-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
        card.style.transform = `translateY(-4px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
        card.style.transition = 'transform 0.1s ease-out';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });

    // Magnetic button effect (dock items are excluded — magnification owns their transform)
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 100;
        const force = Math.max(0, 1 - distance / maxDistance);
        
        btn.style.transform = `translate(${x * 0.3 * force}px, ${y * 0.3 * force}px) translateY(-2px)`;
        btn.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });

    // Cursor-follow spotlight effect on interactive elements
    const cardsWithSpotlight = document.querySelectorAll('.bento-card, .skill-group, .why-card, .cert-card');
    cardsWithSpotlight.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--cursor-x', `${x}px`);
        card.style.setProperty('--cursor-y', `${y}px`);
        
        // Update spotlight position
        const spotlight = card.querySelector('.card-spotlight');
        if (spotlight) {
          spotlight.style.left = `${x}px`;
          spotlight.style.top = `${y}px`;
        }
      });
    });
  }
}

// ══════ SECTION 06 · ARCHITECTURE — initArchitectureSwitcher ══════
function initArchitectureSwitcher() {
  const buttons = document.querySelectorAll('.arch-btn');
  const views = document.querySelectorAll('.arch-view');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetState = btn.dataset.arch;
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      views.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetView = document.getElementById(`arch-${targetState}`);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });
}

// ══════ SECTION 06 · ARCHITECTURE — initArchScramble ══════
// Diagram labels decode with a random letter-swap on view activation,
// matching the terminal vocabulary of the rest of the site.
function initArchScramble() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const views = document.querySelectorAll('.arch-view');
  if (!views.length) return;

  const CHARS = '!<>-_\\/[]{}=+*^?#';

  const scrambleNode = (el) => {
    const original = el.dataset.original || (el.dataset.original = el.textContent);
    const len = original.length;
    const duration = 500 + len * 18;
    const start = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * len);
      let out = original.slice(0, settled);
      for (let i = settled; i < len; i++) {
        out += original[i] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
      }
      el.textContent = p < 1 ? out : original;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const scrambleView = (view) => {
    if (!view) return;
    view.querySelectorAll('.arch-svg text').forEach(t => {
      const spans = t.querySelectorAll('tspan');
      (spans.length ? spans : [t]).forEach(scrambleNode);
    });
  };

  // Decode on every tab switch
  document.querySelectorAll('.arch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      scrambleView(document.getElementById(`arch-${btn.dataset.arch}`));
    });
  });

  // Decode the default view once the sheet scrolls into view
  const sheet = document.querySelector('.arch-container');
  if (!sheet) return;
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      scrambleView(document.querySelector('.arch-view.active'));
      io.disconnect();
    }
  }, { threshold: 0.25 });
  io.observe(sheet);
}

// ══════ SECTION 02 · HERO — initGitHubStats ══════
// ══════ SECTION 05 · PROJECTS — click-to-open case study modal ══════
const CASE_STUDIES = {
  'doc-analyser': {
    num: '01',
    title: 'DOC Analyser',
    badge: 'System / RAG + Vector DB',
    question: 'Can I make an LLM answer questions from a document without simply making things up?',
    overview: 'A document Q&A system built on retrieval-augmented generation. Documents are split into overlapping chunks, embedded and indexed into a FAISS vector store. When a question arrives, the most relevant passages are retrieved and assembled as the model\'s context — so answers are grounded in the source material instead of the model\'s memory.',
    blocks: [
      { label: 'The interesting part', text: "The difficult part wasn't calling an LLM. It was deciding what information the model should actually see." },
      { label: 'What it taught me', text: 'Retrieval quality matters just as much as generation quality. A smarter model cannot magically fix bad context.' }
    ],
    hood: [
      'Chunking strategy: overlapping windows so answers never get cut mid-sentence at a chunk boundary',
      'Top-k retrieval with FAISS similarity search decides the context window the model is allowed to see',
      'Provider-agnostic generation — swap between Gemini and Groq without touching the retrieval layer',
      'The real tuning happened in retrieval parameters, not in prompts'
    ],
    stack: ['Python', 'RAG', 'FAISS', 'LangChain', 'Gemini', 'Groq'],
    links: [
      { label: 'View Code on GitHub ↗', href: 'https://github.com/kamlesh9876/DOC-Analyser-Using-LLM', primary: true }
    ]
  },
  'code-editor': {
    num: '02',
    title: 'Online Code Editor',
    badge: 'System / WebSockets + Full Stack',
    question: 'What if a browser could become a tiny development environment?',
    overview: 'A browser-based code editor with real-time communication over WebSockets, syntax highlighting via CodeMirror, session persistence and code execution. The Node.js/Express backend keeps editor state synchronized and relays it to every connected client.',
    blocks: [
      { label: 'The rabbit hole', text: 'Building the editor was one problem. Keeping state synchronized while multiple things happen at the same time was another.' },
      { label: 'What I learned', text: 'Real-time applications force you to think differently about state. You stop asking only "what is the value?" and start asking "who changed it, when, and what does everyone else know?"' }
    ],
    hood: [
      'WebSocket channel carries edits, cursor events and execution results as separate message types',
      'Session persistence means a dropped connection restores the exact working state',
      'Code execution is isolated from the editor UI — a hung run never freezes the interface',
      'The hard bugs were ordering bugs: two changes arriving in different order on different clients'
    ],
    stack: ['JavaScript', 'WebSockets', 'Node.js', 'CodeMirror', 'Express'],
    links: [
      { label: 'Live Demo ↗', href: 'https://kamlesh9876.github.io/Online-Code-Editor-/', primary: true },
      { label: 'Source Code ↗', href: 'https://github.com/kamlesh9876/Online-Code-Editor-' }
    ]
  },
  'vedaz': {
    num: '03',
    title: 'Vedaz — Real-Time Chat',
    badge: 'System / WebSockets + React',
    question: 'Build a chat application where messages don\'t disappear just because the server restarted.',
    overview: 'React + Node.js + Express + Socket.IO + SQLite. Handles authentication, persistent messages, timestamps, typing indicators, online/offline presence, delivery states and real-time communication — everything a chat app needs to feel trustworthy rather than demo-grade.',
    blocks: [
      { label: 'The part I actually cared about', text: 'Real-time UI is easy to fake. Making the state reliable is harder.' },
      { label: 'What I learned', text: "WebSockets make communication instant. They don't automatically make your application correct." }
    ],
    hood: [
      'Messages persist to SQLite before they are acknowledged as delivered',
      'Presence is derived from socket lifecycle events, not polling',
      'Delivery states (sent / delivered / seen) survive disconnects and reconnections',
      'Typing indicators are throttled events, not a firehose of socket traffic'
    ],
    stack: ['React', 'Node.js', 'Socket.IO', 'SQLite', 'Express'],
    links: [
      { label: 'View Code ↗', href: 'https://github.com/kamlesh9876/W-people-', primary: true }
    ]
  },
  'digital-id': {
    num: '04',
    title: 'Digital ID Management System',
    badge: 'System / Full Deployment',
    question: 'A university needed a practical way to generate and manage digital student IDs. So I built one.',
    overview: 'The system handles student information, digital ID generation, QR/barcode integration, PIN protection, print-ready output and administrative workflows — and, more importantly, it actually runs on a real server for real users.',
    blocks: [
      { label: 'The interesting part', text: "This wasn't just about writing code. It involved deployment, Apache/PHP configuration, database changes, file handling, environment issues and figuring out what breaks when software leaves your laptop." },
      { label: 'What it taught me', text: "Real software doesn't live inside VS Code. It lives in messy environments, with real users, real data and real problems." }
    ],
    hood: [
      'Apache + PHP + MySQL stack configured and maintained on the deployment server',
      'QR/barcode generation wired into print-ready ID layouts',
      'PIN protection gates administrative workflows',
      'Database schema changes applied against live data — with no undo button'
    ],
    stack: ['PHP', 'Apache', 'MySQL', 'Deployment', 'System Admin'],
    links: [
      { label: 'View on GitHub ↗', href: 'https://github.com/kamlesh9876', primary: true }
    ]
  },
  'emo': {
    num: '05',
    title: 'EMO — AI Persona System',
    badge: 'System / Python + LLM Modes',
    question: 'What happens when one model has to argue, research, code, and small-talk — without sounding the same?',
    overview: 'A cyberpunk-inspired AI persona system with dynamic modes for casual chat, deep research, code generation, and structured debates — tuned for high-signal, zero-fluff interactions.',
    blocks: [
      { label: 'The interesting part', text: 'Each mode changes what the model prioritizes — depth, structure, or speed — instead of treating every prompt the same way.' },
      { label: 'What it taught me', text: 'Prompt architecture is real architecture. Constraints and context shape behavior more than model size does.' }
    ],
    hood: [
      'Every mode carries its own system contract: tone, depth, structure and what counts as a good answer',
      'Mode switching swaps context, not just a label — the model behaves differently because it was told different rules',
      'Debate mode forces the model to argue a position and defend it',
      'Constraints are features: limiting what the persona may do makes the output more reliable'
    ],
    stack: ['Python', 'LLM APIs', 'Prompt Design', 'Persona Modes'],
    links: [
      { label: 'View Code on GitHub ↗', href: 'https://github.com/kamlesh9876/Emo', primary: true }
    ]
  }
};

function initCaseModal() {
  const modal = document.getElementById('case-modal');
  if (!modal) return;
  const els = {
    num: document.getElementById('case-modal-num'),
    title: document.getElementById('case-modal-title'),
    badge: document.getElementById('case-modal-badge'),
    question: document.getElementById('case-modal-question'),
    main: document.getElementById('case-modal-main'),
    side: document.getElementById('case-modal-side'),
    actions: document.getElementById('case-modal-actions')
  };
  let lastTrigger = null;

  function buildHTML(d) {
    els.num.textContent = d.num;
    els.title.textContent = d.title;
    els.badge.textContent = d.badge;
    els.question.textContent = d.question;
    els.main.innerHTML =
      `<div class="case-modal-block"><span class="case-modal-label">Overview</span><p>${d.overview}</p></div>` +
      d.blocks.map(b => `<div class="case-modal-block"><span class="case-modal-label">${b.label}</span><p>${b.text}</p></div>`).join('') +
      `<div class="case-modal-block"><span class="case-modal-label">Under the hood</span><ul>` +
      d.hood.map(h => `<li>${h}</li>`).join('') + `</ul></div>`;
    els.side.innerHTML =
      `<div class="case-modal-block"><span class="case-modal-label">Stack</span><div class="case-modal-tags">` +
      d.stack.map(t => `<span class="tag">${t}</span>`).join('') + `</div></div>`;
    els.actions.innerHTML = d.links.map(l =>
      `<a href="${l.href}" target="_blank" rel="noopener noreferrer" class="btn-sm ${l.primary ? 'btn-sm-primary' : 'btn-sm-secondary'}">${l.label}</a>`
    ).join('');
  }

  function lockScroll(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
    if (typeof lenisInstance !== 'undefined' && lenisInstance) {
      locked ? lenisInstance.stop() : lenisInstance.start();
    }
  }

  function openCase(key) {
    const d = CASE_STUDIES[key];
    if (!d) return;
    buildHTML(d);
    modal.hidden = false;
    setTimeout(() => modal.classList.add('open'), 20);
    lockScroll(true);
    modal.querySelector('.case-modal-close').focus();
  }

  function closeCase() {
    modal.classList.remove('open');
    lockScroll(false);
    setTimeout(() => { modal.hidden = true; }, 260);
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.bento-card[data-project]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // real links keep their behavior
      lastTrigger = e.target.closest('button') || card;
      openCase(card.dataset.project);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-case-close]')) closeCase();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeCase();
  });
}

async function initGitHubStats() {
  const repoGrid = document.getElementById('github-repos-grid');
  const repoCountBadge = document.getElementById('github-repo-count');
  if (!repoGrid) return;

  try {
    // Fetch user profile for total public repo count
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/kamlesh9876'),
      fetch('https://api.github.com/users/kamlesh9876/repos?sort=pushed&per_page=6')
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API response not ok');

    const userData = await userRes.json();
    const repos = await reposRes.json();
    if (!Array.isArray(repos) || repos.length === 0) return;

    // Skip the GitHub profile-config repo (name === username) — it isn't a project
    const shown = repos.filter(r => r.name !== 'kamlesh9876').slice(0, 6);
    if (shown.length === 0) return;

    if (repoCountBadge) {
      repoCountBadge.textContent = `${userData.public_repos || '40'}+ repos`;
    }

    repoGrid.innerHTML = '';
    shown.forEach(repo => {
      const card = document.createElement('a');
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'github-repo-card';
      card.innerHTML = `
        <div>
          <div class="repo-name">📁 ${repo.name}</div>
          <div class="repo-desc">${repo.description || 'Full-stack & AI software project.'}</div>
        </div>
        <div class="repo-meta">
          <span>${repo.language ? `● ${repo.language}` : '● Code'}</span>
          <span>★ ${repo.stargazers_count}</span>
          <span>Updated ${new Date(repo.pushed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      `;
      repoGrid.appendChild(card);
    });
  } catch (err) {
    console.warn('Could not load live GitHub repos, maintaining static showcase:', err);
  }
}

// ══════ SECTION 12 · CONTACT — copyEmail ══════
function copyEmail() {
  const email = 'kamleshsharadpawar@gmail.com';
  const label = document.getElementById('email-label');
  const announce = () => {
    if (!label) return;
    const orig = label.textContent;
    label.textContent = 'Copied to clipboard!';
    setTimeout(() => { label.textContent = orig; }, 2200);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(email).then(announce).catch(() => announce());
  } else {
    announce();
  }
}

// ══════ SECTION 13 · CHAT — initChatbot & helpers ══════
// System prompt and knowledge base are hardcoded in server.js (never exposed to client)

let chatOpen = false;
let chatHistory = [];
let isTyping = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chat-window');
  const toggle = document.getElementById('chat-toggle');
  if (win) win.classList.toggle('open', chatOpen);
  if (toggle) toggle.classList.toggle('open', chatOpen);
  if (chatOpen) {
    setTimeout(() => {
      const input = document.getElementById('chat-input');
      if (input) input.focus();
    }, 200);
  }
}

function openYutsumi() {
  if (!chatOpen) {
    toggleChat();
  }
}

function initChatbot() {
  const toggle = document.getElementById('chat-toggle');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  if (toggle) toggle.addEventListener('click', toggleChat);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }
}

function appendMsg(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div><div class="msg-time">${time}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-bubble';
  div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-bubble');
  if (el) el.remove();
}

function askChip(el) {
  sendMessage(el.textContent.trim());
}

function resetChat() {
  chatHistory = [];
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = `
      <div class="msg bot">
        <div class="msg-bubble">Ask a question about Kamlesh's work, Python backends, skills, or projects.</div>
        <div class="msg-time">just now</div>
      </div>
    `;
  }
  const suggestions = document.getElementById('chat-suggestions');
  if (suggestions) suggestions.style.display = 'flex';
  const input = document.getElementById('chat-input');
  if (input) input.focus();
}

async function sendMessage(overrideText) {
  const input = document.getElementById('chat-input');
  const userMsg = overrideText || (input ? input.value.trim() : '');
  if (!userMsg || isTyping) return;

  if (input) input.value = '';
  const suggestions = document.getElementById('chat-suggestions');
  if (suggestions) suggestions.style.display = 'none';

  appendMsg('user', userMsg);
  isTyping = true;
  const sendBtn = document.getElementById('chat-send');
  if (sendBtn) sendBtn.disabled = true;
  showTyping();

  chatHistory.push({ role: 'user', content: userMsg });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I couldn't get a response. Please try again.";

    removeTyping();
    chatHistory.push({ role: 'assistant', content: reply });
    appendMsg('bot', reply);
  } catch (err) {
    removeTyping();
    appendMsg('bot', "I'm having trouble connecting right now. Feel free to email Kamlesh directly at kamleshsharadpawar@gmail.com!");
  }

  isTyping = false;
  if (sendBtn) sendBtn.disabled = false;
  if (input) input.focus();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
