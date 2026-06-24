/* =============================================================
   ENTERACLOUD — editorial interactions
   Reference: lessestudio.com — mask reveals, accordion,
   smooth marquee, parallax. Vanilla JS, a11y-aware.
   ============================================================= */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FOOTER_SANDWICH = false;
  if (!FOOTER_SANDWICH) document.documentElement.classList.add('footer-sandwich-off');

  /* ---------- NAV + hero scroll effects ---------- */
  const nav = document.getElementById('nav');
  const pageCover = document.querySelector('.page-cover');
  const hero = document.querySelector('.has-dark-hero .hero');
  const mobileNavMq = window.matchMedia('(max-width: 900px)');
  let scrollRaf = 0;

  const updateScrollFx = () => {
    scrollRaf = 0;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    if (nav) {
      if (pageCover) {
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-total-h')) || 78;
        nav.classList.toggle('scrolled', pageCover.getBoundingClientRect().top <= navH + 1);
      } else {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      }
    }

    if (hero && pageCover && !reduce && !mobileNavMq.matches) {
      const progress = Math.min(1, Math.max(0, 1 - pageCover.getBoundingClientRect().top / vh));
      const scale = 1.045 - progress * 0.045;
      hero.style.transform = `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;
    } else if (hero) {
      hero.style.transform = '';
    }
  };

  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(updateScrollFx);
  };

  updateScrollFx();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.visualViewport?.addEventListener('resize', onScroll);

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  let menuScrollY = 0;
  const closeMobileMenu = () => {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    if (menuScrollY) {
      window.scrollTo(0, menuScrollY);
      menuScrollY = 0;
    }
  };
  const openMobileMenu = () => {
    if (!menu || !toggle) return;
    menuScrollY = window.scrollY;
    menu.classList.add('open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    document.body.style.top = `-${menuScrollY}px`;
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
    // expandable groups (Services, Industries) inside the mobile menu
    menu.querySelectorAll('.m-group__head').forEach(head => {
      const group = head.closest('.m-group');
      head.addEventListener('click', () => {
        const open = group.classList.toggle('open');
        head.setAttribute('aria-expanded', String(open));
      });
    });
  }

  const closeAllMega = () => {
    document.querySelectorAll('.nav-item--mega').forEach(m => {
      m.classList.remove('open');
      const trigger = m.querySelector('.nav-mega-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
    if (nav) nav.classList.remove('mega-open');
  };

  /* ---------- Hero videos (load only the clip for current viewport) ---------- */
  const desktopHeroVideo = document.querySelector('.hero__video--desktop');
  const mobileHeroVideo = document.querySelector('.hero__video--mobile');
  const loadHeroVideo = (video, active) => {
    if (!video) return;
    if (!active) {
      video.pause();
      if (video.getAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    const src = video.dataset.src;
    if (!src) return;
    if (video.getAttribute('src') !== src) {
      video.src = src;
      video.load();
    }
    video.play().catch(() => {});
  };
  const syncHeroVideos = () => {
    const isMobile = mobileNavMq.matches;
    loadHeroVideo(desktopHeroVideo, !isMobile);
    loadHeroVideo(mobileHeroVideo, isMobile);
  };
  syncHeroVideos();

  mobileNavMq.addEventListener('change', () => {
    closeAllMega();
    if (!mobileNavMq.matches) closeMobileMenu();
    syncHeroVideos();
    updateScrollFx();
  });

  /* ---------- Mega menus (Services, Industries) ---------- */
  const megaItems = Array.from(document.querySelectorAll('.nav-item--mega'));
  if (megaItems.length) {
    const syncNav = () => {
      const anyOpen = megaItems.some(m => m.classList.contains('open'));
      if (nav) nav.classList.toggle('mega-open', anyOpen);
    };
    megaItems.forEach(megaItem => {
      const trigger = megaItem.querySelector('.nav-mega-trigger');
      let closeTimer;
      const openMega = () => {
        if (mobileNavMq.matches) return;
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
        if (mobileNavMq.matches) return;
        megaItem.classList.contains('open') ? closeMega() : openMega();
      });
      trigger.addEventListener('focus', openMega);
      megaItem.addEventListener('focusout', (e) => {
        if (!megaItem.contains(e.relatedTarget)) closeMega();
      });
      megaItem.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', closeMega));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllMega();
        syncNav();
        closeMobileMenu();
      }
    });
  } else {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---------- Scroll-driven statement reveal ---------- */
  const scrollTypeEl = document.querySelector('[data-scroll-type]');
  if (scrollTypeEl) {
    const line = scrollTypeEl.querySelector('.statement-type__line');
    const source = scrollTypeEl.querySelector('.statement-type__source');
    const charEls = [];

    const buildChars = () => {
      if (!line || !source) return;
      const walk = (node, inEm) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const c of node.textContent) {
            const span = document.createElement('span');
            span.className = 'statement-type__char' + (inEm ? ' is-em' : '');
            span.textContent = c;
            line.appendChild(span);
            charEls.push(span);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const em = inEm || node.tagName === 'EM';
          node.childNodes.forEach(n => walk(n, em));
        }
      };
      source.childNodes.forEach(n => walk(n, false));
    };

    buildChars();

    const easeOutQuad = t => 1 - (1 - t) * (1 - t);

    const updateScrollType = () => {
      if (!charEls.length) return;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const rect = scrollTypeEl.getBoundingClientRect();
      const start = vh * 0.76;
      const end = vh * 0.08;
      const raw = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const progress = easeOutQuad(raw);
      const revealAt = progress * (charEls.length + 12);

      charEls.forEach((el, i) => {
        el.classList.toggle('is-revealed', revealAt > i + 2);
      });
    };

    if (reduce || !charEls.length) {
      charEls.forEach(el => el.classList.add('is-revealed'));
    } else {
      let typeRaf = 0;
      const scheduleScrollType = () => {
        if (typeRaf) return;
        typeRaf = requestAnimationFrame(() => {
          typeRaf = 0;
          updateScrollType();
        });
      };
      updateScrollType();
      window.addEventListener('scroll', scheduleScrollType, { passive: true });
      window.addEventListener('resize', scheduleScrollType);
      window.visualViewport?.addEventListener('resize', scheduleScrollType);
      window.visualViewport?.addEventListener('scroll', scheduleScrollType);
    }
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
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = parseFloat(el.getAttribute('data-count-duration')) || 1600;
    let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const value = Math.floor(easeOutCubic(p) * target);
      el.textContent = value.toLocaleString() + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const stats = document.getElementById('stats');
  const observeStatsCount = () => {
    if (!stats || !('IntersectionObserver' in window)) return;
    const so = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        stats.querySelectorAll('[data-count]').forEach(animateCount);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    so.observe(stats);
  };
  if (stats) {
    const startStatsCount = () => stats.querySelectorAll('[data-count]').forEach(animateCount);
    const triggerWhenVisible = () => {
      if (stats.classList.contains('is-in')) {
        startStatsCount();
        return true;
      }
      return false;
    };
    if (triggerWhenVisible()) {
      /* already revealed (e.g. reduced motion) */
    } else if ('MutationObserver' in window && !reduce) {
      const mo = new MutationObserver(() => {
        if (triggerWhenVisible()) mo.disconnect();
      });
      mo.observe(stats, { attributes: true, attributeFilter: ['class'] });
    } else if ('IntersectionObserver' in window) {
      observeStatsCount();
    } else {
      startStatsCount();
    }
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
      const vh = window.visualViewport?.height ?? window.innerHeight;
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
  document.querySelectorAll('.hero__video').forEach(video => {
    video.addEventListener('error', () => { video.style.display = 'none'; });
  });

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
      const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map(el => el.value);
      const interest = interests.join(', ');
      const msg = val('#msg');
      const payload = {
        name: val('#name'), email: val('#email'), company: val('#company'),
        message: [interest ? ('Interest: ' + interest) : '', msg].filter(Boolean).join(', '),
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
          form.querySelectorAll('input, textarea, select').forEach(i => {
            if (i.type === 'checkbox' || i.type === 'radio') { i.checked = false; }
            else { i.value = ''; i.classList.remove('filled'); }
          });
          reset(btn);
        })
        .catch(() => { btn.innerHTML = '<span class="dot"></span>Couldn\'t send. Email sales@enteracloud.com <span class="arrow">→</span>'; setTimeout(() => { btn.innerHTML = '<span class="dot"></span>Send message <span class="arrow">→</span>'; }, 4500); });
    });
  }

  /* ---------- Footer wordmark + sandwich reveal ---------- */
  const footerWordmark = document.querySelector('.footer__wordmark');
  const footerInner = document.querySelector('.footer__inner');
  const footerTrack = document.querySelector('.site-footer__track');
  const footerBar = document.querySelector('.site-footer__track > .footer__bar');
  const sandwichEnabled = FOOTER_SANDWICH && footerTrack && footerBar && !reduce;

  const getViewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

  const getWordmarkTargetWidth = () => {
    const ref = footerInner || footerWordmark?.closest('.wrap');
    if (!ref) return 0;
    const styles = getComputedStyle(ref);
    const contentW = ref.getBoundingClientRect().width
      - parseFloat(styles.paddingLeft)
      - parseFloat(styles.paddingRight);
    const buffer = window.innerWidth <= 460 ? 14 : window.innerWidth <= 680 ? 12 : 8;
    return Math.max(0, Math.floor(contentW) - buffer);
  };

  const fitFooterWordmark = () => {
    if (!footerWordmark) return;

    const targetW = getWordmarkTargetWidth();
    if (targetW < 1) return;

    footerWordmark.style.transform = '';
    footerWordmark.style.display = 'inline-block';
    footerWordmark.style.width = 'auto';
    footerWordmark.style.maxWidth = `${targetW}px`;
    footerWordmark.style.fontSize = '16px';

    let lo = 12;
    let hi = 600;
    let best = lo;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      footerWordmark.style.fontSize = `${mid}px`;
      if (footerWordmark.scrollWidth <= targetW) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    footerWordmark.style.fontSize = `${best}px`;
    document.documentElement.style.setProperty('--footer-wordmark-size', `${best}px`);

    const textW = footerWordmark.getBoundingClientRect().width;
    if (textW > targetW) {
      footerWordmark.style.transform = `scale(${targetW / textW})`;
    }

    const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-reveal-pad')) || 32;
    const textH = footerWordmark.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--footer-reveal-h', `${Math.ceil(textH + pad * 2)}px`);
  };

  let revealRange = 0;
  let anchorStart = 0;
  let layoutRaf = 0;
  let footerScrollRaf = 0;

  const measureRevealRange = () => {
    if (!footerTrack) return;
    footerTrack.style.setProperty('--footer-progress', '0');
    footerTrack.classList.remove('is-revealing');
    revealRange = parseFloat(getComputedStyle(footerTrack).paddingBottom) || 400;
  };

  const computeAnchors = () => {
    if (!footerBar) return;
    measureRevealRange();
    const barH = Math.ceil(footerBar.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--footer-bar-h', `${barH}px`);
    const barBottom = footerBar.getBoundingClientRect().bottom + window.scrollY;
    anchorStart = barBottom - getViewportHeight();
  };

  const updateFooterSandwich = () => {
    footerScrollRaf = 0;
    if (!sandwichEnabled) return;
    if (!revealRange) measureRevealRange();

    if (window.scrollY < anchorStart) {
      footerTrack.style.setProperty('--footer-progress', '0');
      footerTrack.classList.remove('is-revealing');
      return;
    }

    footerTrack.classList.add('is-revealing');
    const progress = Math.min(1, Math.max(0, (window.scrollY - anchorStart) / revealRange));
    footerTrack.style.setProperty('--footer-progress', String(progress));
  };

  const scheduleFooterSandwich = () => {
    if (footerScrollRaf) return;
    footerScrollRaf = requestAnimationFrame(updateFooterSandwich);
  };

  const syncFooterLayout = () => {
    layoutRaf = 0;
    fitFooterWordmark();
    if (sandwichEnabled) {
      computeAnchors();
      updateFooterSandwich();
    }
  };

  const scheduleFooterLayout = () => {
    if (layoutRaf) return;
    layoutRaf = requestAnimationFrame(syncFooterLayout);
  };

  if (FOOTER_SANDWICH && footerWordmark) {
    syncFooterLayout();
    window.addEventListener('resize', scheduleFooterLayout);
    window.addEventListener('orientationchange', scheduleFooterLayout);
    window.addEventListener('load', scheduleFooterLayout);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleFooterLayout);
    window.visualViewport?.addEventListener('resize', scheduleFooterLayout);
    window.visualViewport?.addEventListener('scroll', scheduleFooterLayout);

    if (sandwichEnabled) {
      window.addEventListener('scroll', scheduleFooterSandwich, { passive: true });
      window.visualViewport?.addEventListener('scroll', scheduleFooterSandwich);
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(scheduleFooterLayout);
      if (footerInner) ro.observe(footerInner);
      const revealWrap = footerWordmark.closest('.wrap');
      if (revealWrap) ro.observe(revealWrap);
      if (footerBar) ro.observe(footerBar);
    }
  }

  /* ---------- Smooth anchor scroll ---------- */
  const scrollHomeToTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (hero) hero.style.transform = '';
    if (nav) nav.classList.remove('scrolled');
    document.querySelectorAll('.statement-type__char').forEach(c => c.classList.remove('is-revealed'));
    if (stats) {
      stats.querySelectorAll('[data-count]').forEach(el => {
        delete el.dataset.counted;
        el.textContent = '0';
      });
      observeStatsCount();
    }
    requestAnimationFrame(updateScrollFx);
  };

  document.querySelectorAll('a[href="#top"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (!document.body.classList.contains('has-dark-hero')) return;
      e.preventDefault();
      scrollHomeToTop();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2 || id === '#top') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-total-h')) || 78;
      const y = el.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
