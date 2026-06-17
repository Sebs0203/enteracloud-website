/* =============================================================
   Beacon analytics — first-party tracking for www.enteracloud.com
   Posts to same-origin /t (nginx proxies it to the Beacon app).
   The landing is resolved server-side by the Host header. No third
   parties, no client-side cookies, respects Do-Not-Track.
   ============================================================= */
(function () {
  'use strict';
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  var ENDPOINT = '/t';

  function send(type, meta) {
    try {
      var body = JSON.stringify({ type: type, meta: meta || {} });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body, keepalive: true, credentials: 'same-origin'
        });
      }
    } catch (e) { /* never break the page for analytics */ }
  }

  /* ---------- pageview (+ UTM, referrer) ---------- */
  var q = new URLSearchParams(location.search);
  send('pageview', {
    path: location.pathname,
    referrer: document.referrer || '',
    utm_source: q.get('utm_source') || '',
    utm_medium: q.get('utm_medium') || '',
    utm_campaign: q.get('utm_campaign') || ''
  });

  /* ---------- scroll depth 25 / 50 / 75 / 100 ---------- */
  var marks = [25, 50, 75, 100], hit = {};
  function onScroll() {
    var h = document.documentElement;
    var top = h.scrollTop || document.body.scrollTop || 0;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    var pct = Math.min(100, Math.round((top / max) * 100));
    for (var i = 0; i < marks.length; i++) {
      if (pct >= marks[i] && !hit[marks[i]]) { hit[marks[i]] = 1; send('scroll_depth', { depth: marks[i] }); }
    }
    if (hit[100]) window.removeEventListener('scroll', onScroll);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- CTA clicks ([data-cta], .btn) ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta], a.btn, button.btn');
    if (!el) return;
    send('cta_click', {
      label: (el.getAttribute('data-cta') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      href: el.getAttribute('href') || ''
    });
  }, true);

  /* ---------- form_open — first interaction with the contact form ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var opened = false;
    form.addEventListener('focusin', function () {
      if (opened) return; opened = true; send('form_open', {});
    });
  }
})();
