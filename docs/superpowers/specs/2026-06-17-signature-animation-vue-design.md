# signature-animation-vue — Design

**Date:** 2026-06-17
**Status:** Approved (pending spec review)

## Summary

Port the React/TypeScript npm package [`signature-animation`](https://github.com/Ayo-Osota/signature-animation) to Vue 3. The output is a **publishable Vue component library plus a runnable demo playground** in one repo. The library exports a single component, `SignatureAnimation`, that animates text as if it is being handwritten by progressively drawing SVG letter glyphs.

The port keeps the original's visible result and glyph artwork, but uses idiomatic Vue internals (no `v-html`, typed glyph data, predictable sequencing) and adds modest quality-of-life features.

## Source recap (what we are porting)

- One React component, `SignatureAnimation`, props `children` (text string), `duration` (default `1`s), `delay` (default `0`s).
- A `letters` map of **52 glyphs** (A–Z, a–z); each value is an inline `<svg>` **string** with one handwriting `<path>`, injected via `dangerouslySetInnerHTML`. All glyphs are `height=51`; width varies per letter; `viewBox="0 0 <width> 51"`.
- `App.css` provides per-letter kerning (negative horizontal margins, keyed by letter + case via `.up.x` / `.lo.x`), stroke styling (`stroke:#000; stroke-width:1; round caps/joins`), and per-letter `stroke-dasharray` presets.
- Animation: on mount, walk each letter's `<path>`, set `stroke-dasharray`/`stroke-dashoffset` to the path length, then transition `dashoffset → 0`. The original's loop has a quirk: it resolves when each transition *starts* (after a leading wait equal to `duration`), so letters start one `duration` apart and their transitions overlap rather than running strictly one-at-a-time.

## Decisions (locked)

| Topic | Decision |
| --- | --- |
| Deliverable | Library **and** demo playground in one repo |
| Text input | Default **slot** (`<SignatureAnimation>Text</SignatureAnimation>`) |
| Animation engine | **Faithful CSS transitions** (`stroke-dashoffset`) + JS sequencing; no GSAP |
| Fidelity | Faithful *look*, cleaner Vue code, plus polish (replay, reduced-motion, restart-on-change) |
| Language | TypeScript throughout |
| Build tool | **Vite 8**, library mode; externalize `vue` as a peer dependency |

## Tech stack & repo layout

Vue 3 + `<script setup lang="ts">`, Vite 8, Vitest + `@vue/test-utils`, `vite-plugin-dts` for type declarations. New git repo at `/Users/waldemarenns/wenns/signature-animation-vue`.

```
signature-animation-vue/
  package.json            # library exports + peerDep vue; scripts: dev, build, test
  vite.config.ts          # demo dev/build (root index.html → demo/main.ts)
  vite.lib.config.ts      # library build (build.lib + vite-plugin-dts)
  tsconfig.json
  index.html              # demo entry
  src/
    index.ts              # public entry: export { default as SignatureAnimation }
    SignatureAnimation.vue
    glyphs.ts             # typed glyph data (ported from letters.ts + App.css)
    text.ts               # helper: extract plain string from default slot vnodes
  demo/
    main.ts
    App.vue               # playground
  test/
    component.spec.ts
    glyphs.spec.ts
  README.md
```

## Component units

Each unit has one purpose, a defined interface, and is testable in isolation.

### `glyphs.ts` — glyph data
Converts the 52 SVG strings + the kerning CSS into one typed map (one-off parse during implementation; no runtime `v-html`).

```ts
export interface Glyph {
  d: string      // the path's "d" attribute
  width: number  // svg width (viewBox is "0 0 width 51")
  len: number    // original CSS dash length; fallback when getTotalLength() is unavailable
  ml: number     // kerning margin-left (px, may be negative)
  mr: number     // kerning margin-right (px, may be negative)
}
export const GLYPH_HEIGHT = 51
export const glyphs: Record<string, Glyph> // keys "A".."Z","a".."z"
```
Depends on: nothing. Used by: `SignatureAnimation.vue`, tests.

### `text.ts` — slot text extraction
`slotText(nodes: VNode[] | undefined): string` — concatenates text from default-slot vnodes (handles string children and Text vnodes) so a plain-text slot becomes the source string. Depends on: `vue` types only.

### `SignatureAnimation.vue` — the component
- **Slot:** default slot text = string to animate.
- **Props:** `duration?: number = 1`, `delay?: number = 0`, `autoplay?: boolean = true`, `color?: string = '#000'`, `strokeWidth?: number = 1`.
- **Emits:** `done` — fired when the full sequence finishes.
- **Exposed (`defineExpose`):** `replay(): void`.
- **Render:** flex container; for each char of the slot text:
  - space → fixed-width spacer (`min-width: 12px`),
  - known glyph → inline-block wrapper with `margin: 0 {mr}px 0 {ml}px` containing `<svg :viewBox="`0 0 ${width} 51`" :width :height="51"><path :d :ref></svg>`,
  - unknown char → skipped (matches original).
- Stroke styling (`color`, `strokeWidth`, round caps/joins) applied via bound attributes / scoped CSS.

Depends on: `glyphs.ts`, `text.ts`.

## Animation logic (inside the component)

1. Collect path elements in document order (refs array).
2. On play: for each path set `strokeDasharray = strokeDashoffset = length`, with `length = path.getTotalLength?.() || glyph.len`, and clear any transition.
3. Cancellable async loop (guarded by an incrementing run-token): for each path in order — set `transition: stroke-dashoffset {duration}s ease-in-out`, set `strokeDashoffset = 0`, wait `duration`, then wait `delay`, advance. This makes letters draw strictly one at a time (the deliberate divergence from the original's overlap).
4. On completion emit `done`.
5. `replay()` increments the run-token (cancelling any in-flight run), resets all paths, and starts again.
6. Re-animate when the slot text, `duration`, or `delay` change (watch → `replay()` if `autoplay`).
7. **Reduced motion:** if `matchMedia('(prefers-reduced-motion: reduce)')` matches, skip animation — set every `strokeDashoffset = 0` immediately and emit `done`.
8. On unmount, bump the run-token so pending timeouts are ignored.

Sequencing uses timeouts (not `transitionend`) so it is deterministic and testable under fake timers; CSS still performs the visible draw.

## Demo playground (`demo/App.vue`)

Controls: text input, `duration` slider, `delay` slider, color picker, **Replay** button (calls the component's exposed `replay()`). Live `<SignatureAnimation>` below, reflecting the controls. Minimal, clean styling. Served by `npm run dev`.

## Packaging (Vite 8, library mode)

- `vite.lib.config.ts`: `build.lib` with entry `src/index.ts`, format `es` only (modern Vue 3 consumers; UMD omitted); `rollupOptions.external = ['vue']`; `vite-plugin-dts` emits `.d.ts`.
- `package.json`:
  - `"type": "module"`, `"main"`/`"module"` → `dist/`, `"types"` → `dist/index.d.ts`, `"exports"` map, `"files": ["dist"]`.
  - `"peerDependencies": { "vue": "^3.4.0" }`.
  - Scripts: `"dev": "vite"`, `"build": "vue-tsc -b && vite build --config vite.lib.config.ts"`, `"build:demo": "vite build"`, `"preview": "vite preview"`, `"test": "vitest run"`.
- `vite.config.ts`: default config for the demo (root `index.html` → `/demo/main.ts`).

## Testing (Vitest + @vue/test-utils)

- **Rendering:** `"AY"` → 2 glyph SVGs; spaces → spacers; an unknown char (e.g. `"@"`) → skipped. Kerning margins applied.
- **Glyph data integrity:** all 52 keys present; each `d` non-empty; `width`/`len` positive.
- **Sequencing:** with fake timers and a mocked `getTotalLength`, `done` emits after ~`n*(duration+delay)`; `autoplay=false` does not animate until `replay()`; reduced-motion path snaps to final and emits `done`.

## Out of scope (YAGNI)

- No new glyphs / fonts beyond the ported 52.
- No GSAP, no pause/scrub controls beyond `replay()`.
- No publishing to npm in this task (repo is publish-ready, but `npm publish` is not run).
- `className` prop from the original (it was marked "upcoming" and unused) is not ported.
