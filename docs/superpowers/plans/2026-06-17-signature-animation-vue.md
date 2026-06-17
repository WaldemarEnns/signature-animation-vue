# signature-animation-vue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the React package `signature-animation` to a publishable Vue 3 component library (`signature-animation-vue`) with a runnable demo playground, built with Vite 8 in library mode.

**Architecture:** A single Vue 3 SFC, `SignatureAnimation.vue`, reads its default-slot text, maps each character to a typed glyph (path `d` + width + kerning + fallback dash length), renders one `<svg><path>` per letter, and animates `stroke-dashoffset → 0` letter-by-letter via CSS transitions sequenced with a cancellable async loop. Glyph data is generated once from the original source into `src/glyphs.ts`. The library is built ES-only with `vue` externalized; a Vite demo app exercises it.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Vite 8 (library mode), `@vitejs/plugin-vue`, `vite-plugin-dts`, Vitest + `@vue/test-utils` (jsdom), `vue-tsc`, TypeScript.

**Conventions:** TDD (test first), frequent commits. Every commit message ends with the trailer:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
The repo already exists at `/Users/waldemarenns/wenns/signature-animation-vue` (git initialized, `.gitignore` and the design spec are committed). Run all commands from the repo root.

---

## File structure

| File | Responsibility |
| --- | --- |
| `package.json` | Library metadata, exports, scripts, deps |
| `tsconfig.json` | TypeScript config (bundler resolution, strict) |
| `vite.config.ts` | Demo dev/build + Vitest config |
| `vite.lib.config.ts` | Library build (ES, externalize vue, emit types) |
| `index.html` | Demo entry HTML |
| `src/index.ts` | Public entry — exports the component (named + default) |
| `src/glyphs.ts` | AUTO-GENERATED typed glyph map (52 letters) |
| `src/text.ts` | `slotText()` — plain string from default-slot vnodes |
| `src/SignatureAnimation.vue` | The component (render + animation) |
| `scripts/generate-glyphs.mjs` | One-off generator for `src/glyphs.ts` |
| `demo/main.ts` | Demo bootstrap |
| `demo/App.vue` | Playground UI |
| `test/smoke.spec.ts` | Temporary tooling smoke test (removed in Task 2) |
| `test/glyphs.spec.ts` | Glyph data integrity |
| `test/text.spec.ts` | `slotText()` unit tests |
| `test/component.spec.ts` | Rendering + animation behavior |
| `README.md` | Usage docs |

---

## Task 1: Scaffold project & tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `demo/main.ts`, `demo/App.vue`, `src/index.ts`, `test/smoke.spec.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "signature-animation-vue",
  "version": "0.1.0",
  "description": "A Vue 3 component that animates text as if it is being handwritten.",
  "type": "module",
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build --config vite.lib.config.ts",
    "build:demo": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "generate:glyphs": "node scripts/generate-glyphs.mjs"
  },
  "keywords": ["vue", "animation", "signature", "handwriting", "svg", "stroke"],
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install vue@^3
npm install -D vite@^8 @vitejs/plugin-vue@latest vite-plugin-dts@latest \
  vue-tsc@latest typescript@^5 vitest@latest @vue/test-utils@latest jsdom@latest
```
Expected: installs succeed and create `node_modules` + `package-lock.json`. If a peer-dependency conflict blocks install (vitest vs vite 8), retry the dev install with `--legacy-peer-deps`.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "preserve",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "demo", "test", "*.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts` (demo + Vitest)**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>signature-animation-vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/demo/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/index.ts` (placeholder export)**

```ts
// Public entry. The component is added in Task 4; keep a typed placeholder so
// the demo and library entry resolve.
export const name = 'signature-animation-vue'
```

- [ ] **Step 7: Create `demo/main.ts`**

```ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 8: Create `demo/App.vue` (placeholder)**

```vue
<script setup lang="ts">
import { name } from '../src/index'
</script>

<template>
  <main>{{ name }}</main>
</template>
```

- [ ] **Step 9: Create `test/smoke.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { name } from '../src/index'

describe('tooling', () => {
  it('runs vitest and resolves the package entry', () => {
    expect(name).toBe('signature-animation-vue')
  })
})
```

- [ ] **Step 10: Run the smoke test**

Run: `npm test`
Expected: PASS — 1 passed (`test/smoke.spec.ts`).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vue 3 + Vite 8 library and demo tooling" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Generate glyph data (`src/glyphs.ts`)

The 52 glyph paths, widths, kerning margins, and fallback dash lengths come from the original repo. A generator clones the source, parses `letters.ts` + `App.css`, and writes a typed `src/glyphs.ts`. The generated file is committed; the clone is throwaway.

**Files:**
- Create: `scripts/generate-glyphs.mjs`, `src/glyphs.ts` (generated)
- Create: `test/glyphs.spec.ts`
- Delete: `test/smoke.spec.ts`

- [ ] **Step 1: Write the failing test `test/glyphs.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { glyphs, GLYPH_HEIGHT } from '../src/glyphs'

const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

describe('glyphs', () => {
  it('exposes GLYPH_HEIGHT of 51', () => {
    expect(GLYPH_HEIGHT).toBe(51)
  })

  it('contains all 52 letters', () => {
    expect(Object.keys(glyphs)).toHaveLength(52)
    for (const ch of ALL) expect(glyphs[ch]).toBeTruthy()
  })

  it('every glyph has valid fields', () => {
    for (const [key, g] of Object.entries(glyphs)) {
      expect(g.d.length, `${key}.d`).toBeGreaterThan(0)
      expect(g.width, `${key}.width`).toBeGreaterThan(0)
      expect(g.len, `${key}.len`).toBeGreaterThan(0)
      expect(typeof g.ml, `${key}.ml`).toBe('number')
      expect(typeof g.mr, `${key}.mr`).toBe('number')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- glyphs`
Expected: FAIL — cannot resolve `../src/glyphs` (file does not exist yet).

- [ ] **Step 3: Create the generator `scripts/generate-glyphs.mjs`**

```js
// Generates src/glyphs.ts from the original signature-animation source.
// Usage: node scripts/generate-glyphs.mjs [pathToSourceRepo]
// Defaults to cloning the upstream repo into /tmp.
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

let SRC = process.argv[2]
if (!SRC) {
  SRC = '/tmp/signature-animation-src'
  if (!existsSync(SRC)) {
    execSync(
      `git clone --depth 1 https://github.com/Ayo-Osota/signature-animation.git ${SRC}`,
      { stdio: 'inherit' },
    )
  }
}

const lettersSrc = readFileSync(`${SRC}/src/utils/letters.ts`, 'utf8')
const css = readFileSync(`${SRC}/src/App.css`, 'utf8')

const data = {}

// 1. path "d" + width from each glyph's inline SVG string
const glyphRe = /^\s+([A-Za-z]):\s*`([\s\S]*?)`,?\s*$/gm
let m
while ((m = glyphRe.exec(lettersSrc))) {
  const key = m[1]
  const svg = m[2]
  const d = (svg.match(/d="([^"]+)"/) || [])[1]
  const width = parseInt((svg.match(/width="(\d+)"/) || [])[1], 10)
  if (d && Number.isFinite(width)) data[key] = { d, width }
}

// 2. fallback dash length: ".up.a path { stroke-dasharray: 190 }"
const lenRe = /\.(up|lo)\.([a-z])\s+path\s*\{\s*stroke-dasharray:\s*([\d.]+)/g
while ((m = lenRe.exec(css))) {
  const key = m[1] === 'up' ? m[2].toUpperCase() : m[2]
  if (data[key]) data[key].len = parseFloat(m[3])
}

// 3. kerning margins: ".up.a { margin: 0 -10px 0 -7px }" (supports grouped
//    selectors and bare "0" values)
const marRe =
  /((?:\.(?:up|lo)\.[a-z]\s*,?\s*)+)\{[^}]*?margin:\s*0\s+(-?[\d.]+px|0)\s+0\s+(-?[\d.]+px|0)/g
while ((m = marRe.exec(css))) {
  const sels = m[1].match(/\.(up|lo)\.([a-z])/g) || []
  const mr = parseFloat(m[2])
  const ml = parseFloat(m[3])
  for (const s of sels) {
    const mm = s.match(/\.(up|lo)\.([a-z])/)
    const key = mm[1] === 'up' ? mm[2].toUpperCase() : mm[2]
    if (data[key]) {
      data[key].ml = ml
      data[key].mr = mr
    }
  }
}

// 4. validate completeness
const keys = Object.keys(data).sort()
const incomplete = keys.filter(
  (k) =>
    data[k].d == null ||
    data[k].width == null ||
    data[k].len == null ||
    data[k].ml == null ||
    data[k].mr == null,
)
if (keys.length !== 52 || incomplete.length) {
  throw new Error(
    `glyph generation incomplete: ${keys.length} keys, missing fields on [${incomplete}]`,
  )
}

// 5. emit src/glyphs.ts
let out = '// AUTO-GENERATED by scripts/generate-glyphs.mjs — do not edit by hand.\n'
out += 'export interface Glyph {\n'
out += '  /** path "d" attribute */\n  d: string\n'
out += '  /** svg width; viewBox is "0 0 width 51" */\n  width: number\n'
out += '  /** original CSS dash length; fallback when getTotalLength() is unavailable */\n  len: number\n'
out += '  /** kerning margin-left in px (may be negative) */\n  ml: number\n'
out += '  /** kerning margin-right in px (may be negative) */\n  mr: number\n'
out += '}\n\n'
out += 'export const GLYPH_HEIGHT = 51\n\n'
out += 'export const glyphs: Record<string, Glyph> = {\n'
for (const k of keys) {
  const g = data[k]
  out += `  ${JSON.stringify(k)}: { d: ${JSON.stringify(g.d)}, width: ${g.width}, len: ${g.len}, ml: ${g.ml}, mr: ${g.mr} },\n`
}
out += '}\n'

writeFileSync(new URL('../src/glyphs.ts', import.meta.url), out)
console.log(`wrote src/glyphs.ts with ${keys.length} glyphs`)
```

- [ ] **Step 4: Run the generator**

Run: `npm run generate:glyphs`
Expected: prints `wrote src/glyphs.ts with 52 glyphs` and creates `src/glyphs.ts`.

- [ ] **Step 5: Delete the temporary smoke test**

Run: `git rm test/smoke.spec.ts`
(Removes the placeholder; `glyphs.spec.ts` now provides real coverage.)

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- glyphs`
Expected: PASS — 3 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: generate typed glyph data from upstream source" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Slot-text helper (`src/text.ts`)

**Files:**
- Create: `src/text.ts`
- Create: `test/text.spec.ts`

- [ ] **Step 1: Write the failing test `test/text.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { createTextVNode, h } from 'vue'
import { slotText } from '../src/text'

describe('slotText', () => {
  it('returns empty string for undefined', () => {
    expect(slotText(undefined)).toBe('')
  })

  it('reads a plain text vnode', () => {
    expect(slotText([createTextVNode('Make AY shine')])).toBe('Make AY shine')
  })

  it('concatenates multiple text vnodes', () => {
    expect(slotText([createTextVNode('AB'), createTextVNode('cd')])).toBe('ABcd')
  })

  it('recurses into array children', () => {
    expect(slotText([h('span', ['x', 'y'])])).toBe('xy')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- text`
Expected: FAIL — cannot resolve `../src/text`.

- [ ] **Step 3: Implement `src/text.ts`**

```ts
import type { VNode } from 'vue'

/**
 * Flatten the text content of default-slot vnodes into a plain string.
 * Handles string children and nested arrays of vnodes.
 */
export function slotText(nodes: VNode[] | undefined): string {
  if (!nodes) return ''
  let out = ''
  for (const node of nodes) {
    const children = node.children
    if (typeof children === 'string') out += children
    else if (Array.isArray(children)) out += slotText(children as VNode[])
  }
  return out
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- text`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add slot-text extraction helper" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Component rendering (`src/SignatureAnimation.vue`)

Render one `<svg><path>` per known letter, a spacer per space, skip unknown characters, and apply kerning margins. No animation yet (`autoplay=false` in these tests).

**Files:**
- Create: `src/SignatureAnimation.vue`
- Modify: `src/index.ts`
- Create: `test/component.spec.ts`

- [ ] **Step 1: Write the failing test `test/component.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { SignatureAnimation } from '../src/index'

describe('SignatureAnimation rendering', () => {
  it('renders one svg per known glyph', () => {
    const w = mount(SignatureAnimation, {
      props: { autoplay: false },
      slots: { default: 'AY' },
    })
    expect(w.findAll('svg')).toHaveLength(2)
  })

  it('renders a spacer for spaces and skips unknown characters', () => {
    const w = mount(SignatureAnimation, {
      props: { autoplay: false },
      slots: { default: 'A @Y' }, // space + unknown "@"
    })
    expect(w.findAll('svg')).toHaveLength(2) // A and Y only
    expect(w.findAll('.sa-space')).toHaveLength(1)
  })

  it('applies kerning margin to letters', () => {
    const w = mount(SignatureAnimation, {
      props: { autoplay: false },
      slots: { default: 'A' },
    })
    expect(w.find('.sa-letter').attributes('style')).toContain('margin')
  })

  it('binds color and stroke width to the path', () => {
    const w = mount(SignatureAnimation, {
      props: { autoplay: false, color: '#ff0000', strokeWidth: 2 },
      slots: { default: 'A' },
    })
    const path = w.find('path')
    expect(path.attributes('stroke')).toBe('#ff0000')
    expect(path.attributes('stroke-width')).toBe('2')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- component`
Expected: FAIL — `SignatureAnimation` is not exported from `../src/index` / SFC does not exist.

- [ ] **Step 3: Create `src/SignatureAnimation.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, onUpdated, onBeforeUnmount, useSlots, watch, nextTick } from 'vue'
import { glyphs, GLYPH_HEIGHT, type Glyph } from './glyphs'
import { slotText } from './text'

const props = withDefaults(
  defineProps<{
    /** seconds to draw each letter */
    duration?: number
    /** seconds to pause between letters */
    delay?: number
    /** start animating on mount */
    autoplay?: boolean
    /** stroke color */
    color?: string
    /** stroke width */
    strokeWidth?: number
  }>(),
  { duration: 1, delay: 0, autoplay: true, color: '#000', strokeWidth: 1 },
)

const emit = defineEmits<{ done: [] }>()
const slots = useSlots()

interface Item {
  type: 'space' | 'glyph'
  glyph: Glyph | null
  key: string
}

function currentText(): string {
  return slotText(slots.default?.())
}

// Called directly in the template so it re-evaluates on every render and always
// reflects the current slot content.
function buildItems(): Item[] {
  const out: Item[] = []
  ;[...currentText()].forEach((ch, i) => {
    if (ch === ' ') out.push({ type: 'space', glyph: null, key: `s${i}` })
    else if (glyphs[ch]) out.push({ type: 'glyph', glyph: glyphs[ch], key: `g${i}` })
    // unknown characters are skipped
  })
  return out
}

const root = ref<HTMLElement | null>(null)
let runToken = 0
let lastText = ''

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const allPaths = (): SVGPathElement[] =>
  root.value ? Array.from(root.value.querySelectorAll('path')) : []

function reset(): void {
  for (const p of allPaths()) {
    const len = p.getTotalLength?.() || Number(p.dataset.len) || 0
    p.style.transition = 'none'
    p.style.strokeDasharray = String(len)
    p.style.strokeDashoffset = String(len)
  }
}

const prefersReduced = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

async function run(): Promise<void> {
  const token = ++runToken
  await nextTick()
  reset()
  const ps = allPaths()
  if (prefersReduced()) {
    for (const p of ps) p.style.strokeDashoffset = '0'
    emit('done')
    return
  }
  void root.value?.offsetWidth // flush "transition: none" before enabling it
  for (const p of ps) {
    if (token !== runToken) return // a newer run cancelled this one
    p.style.transition = `stroke-dashoffset ${props.duration}s ease-in-out`
    p.style.strokeDashoffset = '0'
    await sleep(props.duration * 1000)
    if (props.delay > 0) await sleep(props.delay * 1000)
  }
  if (token === runToken) emit('done')
}

function replay(): void {
  void run()
}

onMounted(() => {
  lastText = currentText()
  if (props.autoplay) void run()
  else reset()
})

onUpdated(() => {
  const t = currentText()
  if (t !== lastText) {
    lastText = t
    if (props.autoplay) void run()
  }
})

watch(
  () => [props.duration, props.delay],
  () => {
    if (props.autoplay) void run()
  },
)

onBeforeUnmount(() => {
  runToken++ // cancel any in-flight run
})

defineExpose({ replay })
</script>

<template>
  <div ref="root" class="signature-main">
    <template v-for="it in buildItems()" :key="it.key">
      <span v-if="it.type === 'space'" class="sa-space" />
      <span
        v-else
        class="sa-letter"
        :style="{ margin: `0 ${it.glyph!.mr}px 0 ${it.glyph!.ml}px` }"
      >
        <svg
          :viewBox="`0 0 ${it.glyph!.width} ${GLYPH_HEIGHT}`"
          :width="it.glyph!.width"
          :height="GLYPH_HEIGHT"
          fill="none"
        >
          <path
            :d="it.glyph!.d"
            :data-len="it.glyph!.len"
            :stroke="color"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </template>
  </div>
</template>

<style scoped>
.signature-main {
  display: flex;
  min-height: 51px;
  flex-flow: wrap;
  justify-content: start;
  align-items: flex-start;
}
.sa-letter {
  display: inline-block;
}
.sa-space {
  display: inline-block;
  min-width: 12px;
}
</style>
```

- [ ] **Step 4: Update `src/index.ts` to export the component**

```ts
import SignatureAnimation from './SignatureAnimation.vue'

export { SignatureAnimation }
export default SignatureAnimation
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- component`
Expected: PASS — 4 passed (rendering block). (Animation tests are added next.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: render handwritten letters from slot text" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Animation behavior tests

The animation code already exists (Task 4). This task adds tests that pin down sequencing, the `autoplay=false` gate, reduced-motion, and `replay()`.

**Files:**
- Modify: `test/component.spec.ts`

- [ ] **Step 1: Add the failing animation tests to `test/component.spec.ts`**

Append this block after the existing `describe('SignatureAnimation rendering', ...)`:

```ts
import { vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

describe('SignatureAnimation animation', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    // @ts-expect-error allow removing the mock between tests
    delete window.matchMedia
  })

  it('emits "done" after every letter has drawn', async () => {
    const w = mount(SignatureAnimation, {
      props: { duration: 1, delay: 0 },
      slots: { default: 'AY' }, // 2 letters
    })
    await vi.advanceTimersByTimeAsync(2100) // 2 × (1s draw + 0s delay)
    expect(w.emitted('done')).toBeTruthy()
  })

  it('does not animate or emit "done" when autoplay is false', async () => {
    const w = mount(SignatureAnimation, {
      props: { duration: 1, delay: 0, autoplay: false },
      slots: { default: 'AY' },
    })
    await vi.advanceTimersByTimeAsync(5000)
    expect(w.emitted('done')).toBeFalsy()
  })

  it('replay() runs and emits "done" when autoplay is false', async () => {
    const w = mount(SignatureAnimation, {
      props: { duration: 1, delay: 0, autoplay: false },
      slots: { default: 'AY' },
    })
    ;(w.vm as unknown as { replay: () => void }).replay()
    await vi.advanceTimersByTimeAsync(2100)
    expect(w.emitted('done')).toBeTruthy()
  })

  it('snaps to final state and emits "done" under reduced motion', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const w = mount(SignatureAnimation, {
      props: { duration: 1, delay: 0 },
      slots: { default: 'A' },
    })
    await flushPromises()
    expect(w.emitted('done')).toBeTruthy()
    expect(w.find('path').element.style.strokeDashoffset).toBe('0')
  })
})
```

- [ ] **Step 2: Run the test to verify the new tests pass**

Run: `npm test -- component`
Expected: PASS — 8 passed total (4 rendering + 4 animation). If the "done" test times out, confirm `reset()` uses the `data-len` fallback (jsdom has no `getTotalLength`) and that fake timers advance microtasks via `advanceTimersByTimeAsync`.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — `glyphs.spec.ts`, `text.spec.ts`, `component.spec.ts` all green.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: cover sequencing, autoplay, replay, reduced motion" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Demo playground (`demo/App.vue`)

Replace the placeholder demo with an interactive playground. Verified manually in the browser.

**Files:**
- Modify: `demo/App.vue`

- [ ] **Step 1: Replace `demo/App.vue`**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SignatureAnimation } from '../src/index'

const text = ref('Make AY shine')
const duration = ref(1)
const delay = ref(0.2)
const color = ref('#111111')

const sig = ref<{ replay: () => void } | null>(null)
function replay() {
  sig.value?.replay()
}
</script>

<template>
  <main class="wrap">
    <h1>signature-animation-vue</h1>

    <section class="stage">
      <SignatureAnimation
        ref="sig"
        :duration="duration"
        :delay="delay"
        :color="color"
      >{{ text }}</SignatureAnimation>
    </section>

    <section class="controls">
      <label>Text<input v-model="text" type="text" /></label>
      <label>
        Duration: {{ duration }}s
        <input v-model.number="duration" type="range" min="0.2" max="3" step="0.1" />
      </label>
      <label>
        Delay: {{ delay }}s
        <input v-model.number="delay" type="range" min="0" max="1" step="0.05" />
      </label>
      <label>Color<input v-model="color" type="color" /></label>
      <button type="button" @click="replay">Replay</button>
    </section>
  </main>
</template>

<style scoped>
.wrap {
  max-width: 720px;
  margin: 8vh auto;
  padding: 0 24px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #111;
}
h1 {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #888;
}
.stage {
  min-height: 120px;
  display: flex;
  align-items: center;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  margin: 16px 0 28px;
}
.controls {
  display: grid;
  gap: 14px;
  max-width: 360px;
}
.controls label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #555;
}
.controls input[type='text'] {
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
}
.controls button {
  justify-self: start;
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
```

- [ ] **Step 2: Start the demo and verify in the browser**

Run: `npm run dev`
Expected: Vite serves on a local URL (e.g. `http://localhost:5173`). Open it and confirm:
- "Make AY shine" draws letter-by-letter on load.
- Editing the text re-animates with the new text.
- Duration/Delay sliders change the speed; the color picker changes stroke color.
- The Replay button re-runs the animation.

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add interactive demo playground" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Library build + README

Add the library build config, verify it emits ES + types, and document usage.

**Files:**
- Create: `vite.lib.config.ts`, `README.md`

- [ ] **Step 1: Create `vite.lib.config.ts`**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true, include: ['src'], tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
```

- [ ] **Step 2: Run the library build**

Run: `npm run build`
Expected: `vue-tsc --noEmit` reports no type errors, then Vite writes `dist/index.js` and `dist/index.d.ts`. The build log should show `vue` treated as external.

- [ ] **Step 3: Verify the build artifacts**

Run: `ls dist && grep -c "export" dist/index.d.ts`
Expected: `dist/` contains `index.js` and `index.d.ts`; the `.d.ts` contains exports (count ≥ 1). Confirm `import 'vue'` is not bundled (the component imports Vue as a peer).

- [ ] **Step 4: Create `README.md`**

````markdown
# signature-animation-vue

A Vue 3 component that animates text as if it is being handwritten, by progressively drawing SVG letter glyphs. A Vue port of [`signature-animation`](https://github.com/Ayo-Osota/signature-animation).

## Install

```bash
npm install signature-animation-vue
```

`vue` (^3.4) is a peer dependency.

## Usage

```vue
<script setup lang="ts">
import { SignatureAnimation } from 'signature-animation-vue'
</script>

<template>
  <SignatureAnimation :duration="1" :delay="0.3">Make AY shine</SignatureAnimation>
</template>
```

## Props

| Prop          | Type      | Default  | Description                              |
| ------------- | --------- | -------- | ---------------------------------------- |
| `duration`    | `number`  | `1`      | Seconds to draw each letter.             |
| `delay`       | `number`  | `0`      | Seconds to pause between letters.        |
| `autoplay`    | `boolean` | `true`   | Start animating on mount.                |
| `color`       | `string`  | `'#000'` | Stroke color.                            |
| `strokeWidth` | `number`  | `1`      | Stroke width.                            |

The text to animate is passed via the **default slot**. Only `A–Z` and `a–z` are drawn; spaces add spacing and other characters are skipped. Honors `prefers-reduced-motion`.

## Events & methods

- Emits **`done`** when the full sequence finishes.
- Exposes **`replay()`** (via template ref) to re-run the animation.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SignatureAnimation } from 'signature-animation-vue'
const sig = ref<{ replay: () => void } | null>(null)
</script>

<template>
  <SignatureAnimation ref="sig" @done="() => console.log('done')">Hello</SignatureAnimation>
  <button @click="sig?.replay()">Replay</button>
</template>
```

## Development

```bash
npm run dev      # demo playground
npm test         # unit tests (Vitest)
npm run build    # build the library to dist/
```

Glyph data lives in `src/glyphs.ts` and is generated from the upstream source with `npm run generate:glyphs`.

## Credits

Glyph artwork and concept from [`signature-animation`](https://github.com/Ayo-Osota/signature-animation) by Ayo Osota, inspired by a [CodePen by kiranpate1](https://codepen.io/kiranpate1/pen/ExBpaeW). MIT licensed.
````

- [ ] **Step 5: Run the full test suite once more**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Vite 8 library build and README" \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Done criteria

- `npm test` passes (glyphs, text, component suites).
- `npm run dev` shows the playground animating "WE"/any text letter-by-letter, with working text/duration/delay/color controls and Replay.
- `npm run build` emits `dist/index.js` (ES) + `dist/index.d.ts`, with `vue` externalized.
- The component is importable as both a named (`{ SignatureAnimation }`) and default export.
