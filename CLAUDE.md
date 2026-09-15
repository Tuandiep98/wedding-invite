# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static Vietnamese wedding invitation website for "Tuấn Điệp & Thu Thảo" (wedding date: October 13, 2026). No build system — pure HTML/CSS/JS served directly in the browser.

## Development

No build step required. Open `index.html` directly in a browser or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

## Architecture

Single-page static site with three core files:

- `index.html` — All content and structure; sections: Ring intro gate, Hero, Story (proposal moment), Rings, Invitation, Countdown, Event Info, Gallery, Gift, RSVP, Footer
- `css/style.css` — CSS custom properties design system + all styling (1100+ lines)
- `js/main.js` — Vanilla JS IIFE module; all interactivity (376 lines)

**Key JS modules (all inside one IIFE in `main.js`):**

- Countdown timer targeting `WEDDING_ISO` constant (line 5)
- Ring intro gate — opening animation (ring box float → tap to open → crossfade from closed-box photo to open-box photo + a real ring lifts up → hand appears and the ring flies into it → proposal photo and message reveal → fade into Hero; includes sparkle burst + `open.mp3`/`whoosh.mp3` SFX and auto-plays background music), gated via native `<dialog>`, shown once per browser session (`sessionStorage`)
- `setupRingFlyScroll()` — scroll-linked "flying ring" effect: the small ring icon between the names in Hero (`.hero__ring`) travels (with a gentle arc + fade) toward the real ring's position in the Story section's proposal photo (`#story-ring-target`) as the user scrolls between the two sections; progress is derived purely from live `getBoundingClientRect()` deltas each scroll tick (rAF-throttled, same pattern as `setupGalleryStoryEffects()`), no cached scroll anchors
- IntersectionObserver-based scroll reveal
- Gallery parallax + lightbox via native `<dialog>`
- Background music toggle

**CSS design tokens (CSS custom properties in `:root`):**

- Colors: `--color-dark`, `--color-paper`, `--color-ink`, `--color-gold`, `--color-rose`
- Fonts: `--font-display` (Cormorant Garamond), `--font-serif` (Playfair Display), `--font-body` (Be Vietnam Pro)

## Customization Points

| What                         | Where                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wedding date/time            | `js/main.js` line 5 — `WEDDING_ISO` constant                                                                                                                                                                                                     |
| Ring intro gate — box photos | `assets/ring-box.webp` (closed) and `assets/ring-box-open.webp` (open) — both real photos with transparent backgrounds, cropped to the same frame so they crossfade via `.ring-gate__photo--closed`/`--open` without "jumping"                   |
| Ring intro gate — ring + SFX | `assets/ring-fly.webp` (real photo, transparent, lifts via `.ring-gate__ring-lift`), `assets/open.mp3`, `assets/whoosh.mp3`                                                                                                                      |
| Hero — ring between names    | `assets/ring-fly.webp` (same asset reused), `.hero__ring` in `index.html`; source anchor for the Story scroll-fly effect                                                                                                                         |
| Story — proposal photo       | `assets/proposal-ring.webp` (real photo, transparent background, confirmed via alpha check) — replace with the couple's real photo, then re-check `.story__ring-target`'s `left`/`top` % in `css/style.css` against the new ring position by eye |
| Story — mockup photos + text | `index.html` `.story__mockup--a`/`--b` (Unsplash placeholders) and `.story__paragraph` (placeholder proposal story copy) — both are placeholders to replace with real content                                                                    |
| RSVP form                    | `index.html` — replace `YOUR_FORM_ID` in Formspree action URL                                                                                                                                                                                    |
| Gallery images               | `index.html` — swap Unsplash URLs in `.gallery__story`                                                                                                                                                                                           |
| Background music             | `index.html` — replace Mixkit URL in `<audio id="bg-music">` source                                                                                                                                                                              |
| Names & text content         | `index.html` — edit directly in HTML                                                                                                                                                                                                             |

## External Dependencies

All loaded via CDN — no npm install needed:

- **Google Fonts**: Be Vietnam Pro, Pattaya, Playfair Display
- **Formspree**: RSVP form submission (requires account + form ID)
- **Unsplash**: Placeholder gallery images
- **Mixkit**: Background music

## Conventions

- All animations respect `prefers-reduced-motion` media query
- Mobile-first responsive; breakpoints at `480px` and `768px`
- `clamp()` used for fluid typography
- Lightbox uses native `<dialog>` element (no library)
- No JS framework — keep it vanilla
