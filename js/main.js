/* =============================================================
   ENTERACLOUD — editorial interactions
   Reference: lessestudio.com — mask reveals, accordion,
   smooth marquee, parallax. Vanilla JS, a11y-aware.
   ============================================================= */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV background on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => { nav.classList.toggle('scrolled', window.scrollY > 60); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open'); toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    }));
    // expandable groups (Services, Industries) inside the mobile menu
    menu.querySelectorAll('.m-group__head').forEach(head => {
      const group = head.closest('.m-group');
      head.addEventListener('click', () => {
        const open = group.classList.toggle('open');
        head.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ---------- Mega menus (Services, Industries) ---------- */
  const megaItems = Array.from(document.querySelectorAll('.nav-item--mega'));
  if (megaItems.length) {
    const nav = document.getElementById('nav');
    const syncNav = () => {
      const anyOpen = megaItems.some(m => m.classList.contains('open'));
      if (nav) nav.classList.toggle('mega-open', anyOpen);
    };
    megaItems.forEach(megaItem => {
      const trigger = megaItem.querySelector('.nav-mega-trigger');
      let closeTimer;
      const openMega = () => {
        clearTimeout(closeTimer);
        megaItems.forEach(m => { if (m !== megaItem) { m.classList.remove('open'); m.querySelector('.nav-mega-trigger').setAttribute('aria-expanded', 'false'); } });
        megaItem.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        syncNav();
      };
      const closeMega = () => {
        megaItem.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        syncNav();
      };
      const closeSoon = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeMega, 140); };
      megaItem.addEventListener('mouseenter', openMega);
      megaItem.addEventListener('mouseleave', closeSoon);
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        megaItem.classList.contains('open') ? closeMega() : openMega();
      });
      trigger.addEventListener('focus', openMega);
      megaItem.addEventListener('focusout', (e) => {
        if (!megaItem.contains(e.relatedTarget)) closeMega();
      });
      megaItem.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', closeMega));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') megaItems.forEach(m => { m.classList.remove('open'); m.querySelector('.nav-mega-trigger').setAttribute('aria-expanded', 'false'); syncNav(); });
    });
  }

  /* ---------- Scroll reveals (mask + fade + stagger) ---------- */
  const revealEls = document.querySelectorAll('.reveal-mask, [data-fade], [data-stagger]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(e.target.classList.contains('reveal-mask') ? 'is-in' : 'is-in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Count-up stats ---------- */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1600; let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor(easeOutCubic(p) * target).toLocaleString() + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const stats = document.getElementById('stats');
  if (stats) {
    if ('IntersectionObserver' in window) {
      const so = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('[data-count]').forEach(animateCount); obs.unobserve(e.target); } });
      }, { threshold: 0.5 });
      so.observe(stats);
    } else { stats.querySelectorAll('[data-count]').forEach(animateCount); }
  }

  /* ---------- Services accordion ---------- */
  const list = document.getElementById('svcList');
  if (list) {
    const rows = Array.from(list.querySelectorAll('.svc-row'));
    rows.forEach(row => {
      const head = row.querySelector('.svc-row__head');
      head.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        rows.forEach(r => { r.classList.remove('open'); r.querySelector('.svc-row__head').setAttribute('aria-expanded', 'false'); });
        if (!isOpen) { row.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
      });
    });
    if (rows[0]) { rows[0].classList.add('open'); rows[0].querySelector('.svc-row__head').setAttribute('aria-expanded', 'true'); }
  }

  /* ---------- Parallax on media ---------- */
  const px = Array.from(document.querySelectorAll('[data-parallax]'));
  if (px.length && !reduce) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      px.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2) - vh / 2;
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const onS = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    window.addEventListener('scroll', onS, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Hero video graceful fallback ---------- */
  const video = document.getElementById('heroVideo');
  if (video) video.addEventListener('error', () => { video.style.display = 'none'; });

  /* ---------- Floating labels ---------- */
  document.querySelectorAll('.field input, .field textarea, .field select').forEach(input => {
    const sync = () => input.classList.toggle('filled', !!input.value);
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    sync();
  });

  /* ---------- Contact form -> Beacon lead intake (POST /leads) ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const reset = (btn) => setTimeout(() => { btn.innerHTML = '<span class="dot"></span>Send message <span class="arrow">→</span>'; }, 3600);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const consent = form.querySelector('#consent');
      if (consent && !consent.checked) {
        btn.innerHTML = '<span class="dot"></span>Please accept to continue <span class="arrow">→</span>'; reset(btn); return;
      }
      const val = (id) => { const el = form.querySelector(id); return el ? el.value.trim() : ''; };
      const interest = val('#interest'), msg = val('#msg');
      const payload = {
        name: val('#name'), email: val('#email'), company: val('#company'),
        message: [interest ? ('Interest: ' + interest) : '', msg].filter(Boolean).join(' — '),
        consent: true
      };
      btn.innerHTML = '<span class="dot"></span>Sending… <span class="arrow">→</span>';
      fetch('/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload), credentials: 'same-origin'
      }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => {
          btn.innerHTML = '<span class="dot"></span>Message sent <span class="arrow">✓</span>';
          form.querySelectorAll('input, textarea, select').forEach(i => { i.value = ''; i.classList.remove('filled'); });
          if (consent) consent.checked = false;
          reset(btn);
        })
        .catch(() => { btn.innerHTML = '<span class="dot"></span>Couldn\'t send — email sales@enteracloud.com <span class="arrow">→</span>'; setTimeout(() => { btn.innerHTML = '<span class="dot"></span>Send message <span class="arrow">→</span>'; }, 4500); });
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
