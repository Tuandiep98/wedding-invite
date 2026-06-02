# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static Vietnamese wedding invitation website for "Tuấn Điệp & Thu Thảo" (wedding date: June 15, 2026). No build system — pure HTML/CSS/JS served directly in the browser.

## Development

No build step required. Open `index.html` directly in a browser or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

## Architecture

Single-page static site with three core files:

- `index.html` — All content and structure; sections: Hero, Countdown, Story, Event Info, Gallery, Video, RSVP, Footer
- `css/style.css` — CSS custom properties design system + all styling (1100+ lines)
- `js/main.js` — Vanilla JS IIFE module; all interactivity (307 lines)

**Key JS modules (all inside one IIFE in `main.js`):**
- Countdown timer targeting `WEDDING_ISO` constant (line 5)
- Invite card open animation using Web Audio API chime
- IntersectionObserver-based scroll reveal
- Gallery parallax + lightbox via native `<dialog>`
- Background music toggle

**CSS design tokens (CSS custom properties in `:root`):**
- Colors: `--color-paper`, `--color-ink`, `--color-gold`, `--color-accent-rose`
- Fonts: `--font-display` (Playfair Display), `--font-body` (Be Vietnam Pro), `--font-seal` (Pattaya)

## Customization Points

| What | Where |
|------|-------|
| Wedding date/time | `js/main.js` line 5 — `WEDDING_ISO` constant |
| RSVP form | `index.html` — replace `YOUR_FORM_ID` in Formspree action URL |
| Gallery images | `index.html` — swap Unsplash URLs in `.gallery-grid` |
| Background music | `js/main.js` — replace Mixkit URL in `MUSIC_SRC` |
| Names & text content | `index.html` — edit directly in HTML |

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
