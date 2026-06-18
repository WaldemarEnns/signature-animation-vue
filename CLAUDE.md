# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # start demo playground (Vite dev server)
npm test               # run all tests (Vitest, jsdom)
npm run build          # type-check then build library to dist/
npm run build:demo     # build the demo app (not the library)
npm run generate:glyphs  # regenerate src/glyphs.ts from upstream source
```

Run a single test file:
```bash
npx vitest run test/component.spec.ts
```

## Architecture

This is a single-component Vue 3 library. There is no router, store, or build-time CSS framework — just `src/` and a separate `demo/` app.

### Core files

- **`src/SignatureAnimation.vue`** — the entire public API. Animates text by rendering each letter as an SVG with a single `<path>`, then progressively revealing it via CSS `stroke-dashoffset` transitions.
- **`src/glyphs.ts`** — auto-generated; do not edit by hand. Contains 52 entries (A–Z, a–z), each with: SVG path `d`, bounding `width`, pre-computed `len` (fallback for when `getTotalLength()` is unavailable, e.g. jsdom), and kerning margins `ml`/`mr`.
- **`src/text.ts`** — extracts plain text from Vue slot VNodes recursively.
- **`src/index.ts`** — re-exports `SignatureAnimation`.

### Two Vite configs

- `vite.config.ts` — dev server + test runner; mounts `demo/` as the entry point.
- `vite.lib.config.ts` — library build. Produces a single ES module at `dist/index.js` with inlined scoped CSS. Vue is `external`.

### Animation logic in `SignatureAnimation.vue`

The key patterns to understand:

**Stroke-dashoffset technique** — each `<path>` starts with `stroke-dasharray = stroke-dashoffset = pathLength`, making it invisible. Transitioning `stroke-dashoffset` to `0` draws it.

**`runToken` cancellation** — an incrementing integer. Any async `animateDiff` run checks `token !== runToken` at each `await` point and bails if superseded.

**`diffEdges(oldS, newS)`** — finds the common prefix length (`cp`) and the end of the new region (`newEnd`) by walking inward from both sides. Only characters at source indices `[cp, newEnd)` animate; everything else is snapped to `strokeDashoffset = 0` (already drawn). This avoids redrawing unchanged prefix/suffix letters when the slot text changes.

**`pathLen(p)`** — prefers `getTotalLength()` on the live SVG path; falls back to `data-len` (the pre-computed glyph `len`) for SSR and test environments where the DOM doesn't compute geometry.

### Glyph regeneration

`scripts/generate-glyphs.mjs` clones the upstream [`signature-animation`](https://github.com/Ayo-Osota/signature-animation) repo to `/tmp`, parses its TypeScript and CSS sources, and overwrites `src/glyphs.ts`. Run `npm run generate:glyphs` when pulling in upstream glyph updates.

### Testing notes

Tests use `vi.useFakeTimers()` to control animation timing and `@vue/test-utils`' `flushPromises()` to drain the `nextTick` + microtask queue before advancing timers. `window.matchMedia` is mocked per-test to simulate `prefers-reduced-motion`. The `data-len` attribute on each `<path>` is what `pathLen()` reads in jsdom (since jsdom doesn't implement `getTotalLength()`).
