---
name: sandwich-footer
description: >-
  Implements the Sandwich Footer scroll pattern: a three-layer footer where a
  legal bar sticks to the viewport bottom while a middle reveal zone expands to
  show a full-width wordmark. Use when the user mentions sandwich footer, footer
  reveal, footer wordmark scroll, sticky legal bar, or wants this Enteracloud-style
  footer on a new page or site.
---

# Sandwich Footer

A scroll-driven footer made of **three layers** (top → middle → bottom), like bread–filling–bread. As the user reaches the end of the page, the **legal bar pins to the bottom of the viewport** while a **reveal zone grows** between the main footer content and that bar, exposing a large brand wordmark.

Reference implementation: this repo (`index.html`, `css/styles.css`, `js/main.js`).

## What makes it a sandwich

| Layer | Class | Role |
|-------|-------|------|
| **Top slice** | `.footer__main` | Full footer content (brand, links, social). Normal document flow. |
| **Filling** | `.footer__reveal` | Middle zone whose height animates with scroll. Holds the wordmark. |
| **Bottom slice** | `.footer__bar` | Compact legal row (©, Privacy, Terms). Becomes `sticky; bottom: 0` during reveal. |

Wrapper: `.site-footer` > `.site-footer__track` contains all three layers in order.

## Scroll mechanics

1. **At rest** — `--footer-progress: 0`. Reveal height is 0. Track has `padding-bottom: var(--footer-reveal-h)` to reserve scroll room.
2. **User scrolls past anchor** — When the legal bar would reach the viewport bottom, JS sets `--footer-progress` from `0` → `1` proportionally over that scroll range.
3. **During reveal** — Reveal height grows: `height: calc(var(--footer-progress) * var(--footer-reveal-h))`. Track padding shrinks by the same amount so total footer height stays constant (no layout jump).
4. **Legal bar sticks** — `.site-footer__track.is-revealing > .footer__bar` gets `position: sticky; bottom: 0` so the bottom slice stays pinned while the filling expands above it.

Core CSS variables:

```css
.site-footer__track {
  --footer-progress: 0;
  padding-bottom: calc((1 - var(--footer-progress, 0)) * var(--footer-reveal-h));
}
.footer__reveal {
  height: calc(var(--footer-progress, 0) * var(--footer-reveal-h));
}
```

## HTML structure

```html
<footer class="site-footer">
  <div class="site-footer__track">
    <div class="footer footer__main">
      <div class="footer__bg" aria-hidden="true"></div>
      <div class="wrap footer__inner">
        <!-- brand, columns, social -->
      </div>
    </div>
    <div class="footer__reveal" aria-hidden="true">
      <div class="footer__reveal-inner">
        <div class="footer__reveal-bg" aria-hidden="true"></div>
        <div class="wrap">
          <p class="footer__wordmark">Brand</p>
        </div>
      </div>
    </div>
    <div class="footer__bar">
      <div class="wrap">
        <div class="footer__bottom">
          <span>© …</span>
          <nav class="footer__legal">…</nav>
          <span>Location</span>
        </div>
      </div>
    </div>
  </div>
</footer>
```

## JavaScript requirements

1. **Binary-search wordmark sizing** — Fit `.footer__wordmark` to container width; set `--footer-wordmark-size` and `--footer-reveal-h` (text height + vertical pad).
2. **Anchor computation** — `anchorStart = footerBar.bottom + scrollY - viewportHeight`.
3. **Scroll handler** — Map `scrollY` from `anchorStart` to `anchorStart + revealRange` → `--footer-progress`. Toggle `.is-revealing` on the track when progress > 0.
4. **Re-measure on** — `resize`, `orientationchange`, `load`, `fonts.ready`, `visualViewport` resize/scroll, `ResizeObserver` on inner/bar/wrap.
5. **Reduced motion** — If `prefers-reduced-motion: reduce`, skip scroll binding; show reveal at full height via CSS fallback.

Selectors must be exact:

```js
const footerTrack = document.querySelector('.site-footer__track');
const footerBar = document.querySelector('.site-footer__track > .footer__bar');
const footerWordmark = document.querySelector('.footer__wordmark');
```

## Homepage overlay (optional)

When paired with a **sticky hero + scrolling page cover**:

- Wrap post-hero content in `.page-cover`.
- Give `.page-cover` and `.site-footer` `position: relative; z-index: 2` under `.has-dark-hero`.
- Hero stays `position: sticky` behind the cover. Footer sandwich works the same; it is not inside `.page-cover`.

Subpages without a hero use the same footer markup; only the hero/cover wrapper is omitted.

## Subpage variant

Pages without enough content still work: the sandwich activates when scroll reaches the footer anchor. Use the **full three-layer markup** on every page (not a stripped legal-only bar).

Adapt link paths per depth (`../index.html`, `../services/…`, etc.) but keep class names and structure identical.

## Styling notes

- Dark footer palette: `#0a0b10` main, `#08090d` reveal/bar.
- Top border on `.site-footer`: `1px solid var(--d-line)`.
- Divider between main and reveal: `border-bottom` on `.footer__main`.
- Divider above bar during reveal: `border-top` on sticky `.footer__bar`.
- Wordmark: display font, `white-space: nowrap`, centered in reveal zone.

## Implementation checklist

When adding or fixing a sandwich footer:

- [ ] Three layers inside `.site-footer__track` in correct order
- [ ] `--footer-progress` driven by scroll (or static for reduced motion)
- [ ] `--footer-reveal-h` set by JS after wordmark fit
- [ ] `.footer__bar` sticky only when `.is-revealing` is active
- [ ] `aria-hidden="true"` on decorative reveal/wordmark
- [ ] Mobile: wordmark binary-search + optional `scale()` fallback for narrow viewports
- [ ] Cache-bust or version `main.js` after JS changes

## Do not confuse with

- **Simple sticky footer** — bar always at bottom; no middle reveal zone.
- **Parallax footer** — background moves at different speed; no progress variable.
- **Accordion footer** — click to expand; not scroll-driven.
- **Curtain/reveal footer** — whole footer slides up; here only the **middle filling** grows while the **bar stays pinned**.

## Additional reference

For copy-paste snippets from the canonical implementation, see [reference.md](reference.md).
