# Sandwich Footer — Reference snippets

Canonical source: Enteracloud repo (`css/styles.css` footer block, `js/main.js` footer section, `index.html` footer markup).

## Key CSS (minimal)

```css
.site-footer {
  background: #0a0b10;
  border-top: 1px solid var(--d-line);
}

.site-footer__track {
  position: relative;
  background: #0a0b10;
  --footer-progress: 0;
  padding-bottom: calc((1 - var(--footer-progress, 0)) * var(--footer-reveal-h));
}

.footer.footer__main {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-bottom: 1px solid var(--d-line);
}

.footer__reveal {
  position: relative;
  z-index: 1;
  height: calc(var(--footer-progress, 0) * var(--footer-reveal-h));
  overflow: hidden;
  background: #08090d;
}

.footer__reveal-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  overflow: hidden;
}

.footer__wordmark {
  font-size: var(--footer-wordmark-size, clamp(2rem, 5vw, 3.75rem));
  white-space: nowrap;
  text-align: center;
  transform-origin: center center;
}

.footer__bar {
  position: relative;
  z-index: 3;
  background: #08090d;
}

.site-footer__track.is-revealing > .footer__bar {
  border-top: 1px solid var(--d-line);
  position: sticky;
  bottom: 0;
  min-height: var(--footer-bar-h);
  transform: translateZ(0);
}

@media (prefers-reduced-motion: reduce) {
  .site-footer__track { padding-bottom: 0; }
  .footer__reveal { height: var(--footer-reveal-h, clamp(140px, 28vh, 220px)); }
  .site-footer__track.is-revealing > .footer__bar,
  .site-footer__track > .footer__bar { position: relative; }
}
```

## Key JS (scroll progress)

```js
const footerTrack = document.querySelector('.site-footer__track');
const footerBar = document.querySelector('.site-footer__track > .footer__bar');
const footerWordmark = document.querySelector('.footer__wordmark');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sandwichEnabled = footerTrack && footerBar && !reduce;

let revealRange = 0;
let anchorStart = 0;

function measureRevealRange() {
  footerTrack.style.setProperty('--footer-progress', '0');
  footerTrack.classList.remove('is-revealing');
  revealRange = parseFloat(getComputedStyle(footerTrack).paddingBottom) || 400;
}

function computeAnchors() {
  measureRevealRange();
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const barBottom = footerBar.getBoundingClientRect().bottom + window.scrollY;
  anchorStart = barBottom - vh;
}

function updateFooterSandwich() {
  if (!sandwichEnabled) return;
  if (window.scrollY < anchorStart) {
    footerTrack.style.setProperty('--footer-progress', '0');
    footerTrack.classList.remove('is-revealing');
    return;
  }
  footerTrack.classList.add('is-revealing');
  const progress = Math.min(1, Math.max(0, (window.scrollY - anchorStart) / revealRange));
  footerTrack.style.setProperty('--footer-progress', String(progress));
}

window.addEventListener('scroll', () => requestAnimationFrame(updateFooterSandwich), { passive: true });
```

Wordmark sizing uses binary search on `fontSize` until `scrollWidth <= targetWidth`, then sets `--footer-reveal-h` from measured text height + pad. See full `fitFooterWordmark()` in `js/main.js`.

## Mental model (diagram)

```
Before scroll anchor:
┌─────────────────────────┐
│  .footer__main (links)  │
├─────────────────────────┤  ← reveal height = 0
│  .footer__bar (legal)   │
└─────────────────────────┘
     + padding-bottom reserve

During reveal (progress → 1):
┌─────────────────────────┐
│  .footer__main          │
├─────────────────────────┤
│                         │
│   WORDMARK (reveal)     │  ← height grows
│                         │
├─────────────────────────┤  ← sticky to viewport bottom
│  .footer__bar (legal)   │
└─────────────────────────┘
     padding-bottom → 0
```

The **total scroll distance** through the footer stays constant because padding-bottom shrinks as reveal height grows.
