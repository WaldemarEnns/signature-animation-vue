# Playground Landing Page Design

**Date:** 2026-06-18
**Status:** Approved

## Goal

Enhance `demo/App.vue` into a public-facing landing page hosted on GitHub Pages. It serves two purposes: showcase the component with a compelling first impression, and let visitors interactively explore every prop.

## Layout: Single Scroll (Option A)

One `App.vue` file, three stacked sections, no router. Mobile-friendly vertical flow.

---

## Section 1 — Hero

- Small all-caps label: `signature-animation-vue`
- A `<SignatureAnimation>` instance rendering a fixed showcase phrase (e.g. `"Hello World"`) with `autoplay: true`, `duration: 1.2`, `delay: 0.3` — runs once on page load as the first impression
- One-sentence description: "A Vue 3 component that draws text as handwritten SVG strokes."
- Two inline links: npm badge (`https://img.shields.io/npm/v/signature-animation-vue`) and a GitHub icon link to the repo

No replay button in the hero. The auto-animation on load is the hook.

---

## Section 2 — Playground

A single `<SignatureAnimation>` instance bound to all reactive control values.

**Stage:** rounded card with a light background; minimum height so the component has breathing room.

**Controls grid** (all five props + event feedback):

| Control | Type | Range / Values |
|---|---|---|
| Text | `<input type="text">` | free text |
| Duration | `<input type="range">` | 0.1–3, step 0.1; shows current value in label |
| Delay | `<input type="range">` | 0–1, step 0.05; shows current value in label |
| Color | `<input type="color">` | hex color |
| Stroke width | `<input type="range">` | 1–4, step 0.5; shows current value in label |
| Autoplay | toggle switch | boolean; when off, a Replay button appears inline |

**`done` event indicator:** a small pill (e.g. "✓ done") that becomes visible for 800ms each time the `done` event fires, then fades out. Implemented with a `ref<boolean>` and `setTimeout`.

When any prop changes and `autoplay` is true, the animation re-runs automatically (existing component behaviour via `onUpdated`). Duration/delay changes trigger `run()` via the existing `watch`.

---

## Section 3 — Install & Usage

Two code blocks rendered as styled `<pre>` elements (dark background, monospace font, no external syntax-highlight library):

1. `npm install signature-animation-vue`
2. A minimal Vue SFC usage example matching the README

Each block has a **Copy** button (top-right corner) using the Clipboard API. A small fallback message ("Copied!" replacing the button text for 1.5s) confirms the copy.

Footer line below the snippets: text links to GitHub repo and npm package page.

---

## Styling

- Continue the existing minimal aesthetic (`ui-sans-serif`, `#111` on white)
- Max-width `720px`, centered, `8vh` top margin — same as current
- Section spacing via `margin-bottom`; no CSS framework
- All styles remain in `<style scoped>` inside `App.vue`
- No new dependencies

---

## Files Changed

- `demo/App.vue` — full rewrite of script + template + styles
- No other files touched
