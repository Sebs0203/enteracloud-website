/* =============================================================
   Beacon session replay (rrweb) — self-hosted, first-party.
   Chunks of rrweb events POST to the same-origin /r endpoint
   (nginx proxies to the Beacon app; data lands in our own
   Postgres — no third party). Landing resolved by Host header.

   Privacy-first: every input is masked, password/email/tel are
   hard-masked, .bcn-block nodes are dropped and .bcn-mask text is
   masked. Honours Do Not Track. One recording per page load.
   ============================================================= */
(function () {
  'use strict';
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  var rrweb = window.rrweb;
  if (!rrweb || typeof rrweb.record !== 'function') return;

  var rid = (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

  var FLUSH_MS = 5000, MAX_BATCH = 120;
  var buffer = [], seq = 0;

  function post(payload, useBeacon) {
    var body = JSON.stringify(payload);
    // sendBeacon/keepalive cap the body ~64KB, so only use them for the final
    // pagehide flush; periodic flushes use a plain fetch with no size cap.
    if (useBeacon && navigator.sendBeacon) {
      if (navigator.sendBeacon('/r', new Blob([body], { type: 'application/json' }))) return;
    }
    fetch('/r', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: body, keepalive: useBeacon, credentials: 'same-origin'
    }).catch(function () {});
  }

  function flush(useBeacon) {
    if (!buffer.length) return;
    var events = buffer; buffer = [];
    post({ rid: rid, seq: seq++, events: events, w: window.innerWidth, h: window.innerHeight }, !!useBeacon);
  }

  rrweb.record({
    emit: function (event) {
      buffer.push(event);
      // Flush the FullSnapshot (type 2) immediately — it's the large event.
      if (event.type === 2 || buffer.length >= MAX_BATCH) flush(false);
    },
    maskAllInputs: true,
    maskInputOptions: { password: true, email: true, tel: true },
    blockClass: 'bcn-block',
    maskTextClass: 'bcn-mask',
    recordCanvas: false,
    collectFonts: false,
    sampling: { mousemove: 50, scroll: 150, media: 800, input: 'last' },
    slimDOMOptions: { comment: true, headFavicon: true, headMetaSocial: true }
  });

  setInterval(function () { flush(false); }, FLUSH_MS);
  window.addEventListener('pagehide', function () { flush(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });
})();
