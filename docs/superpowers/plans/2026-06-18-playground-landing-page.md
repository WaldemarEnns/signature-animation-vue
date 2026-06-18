# Playground Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `demo/App.vue` into a public-facing landing page with a hero animation, a full-prop interactive playground, and an install/usage section.

**Architecture:** Single `App.vue` file, three stacked `<section>` elements. The hero has its own `<SignatureAnimation>` instance (fixed phrase, autoplay on load). The playground has a second independent instance bound to all reactive controls. No router, no external dependencies.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, scoped CSS, Clipboard API, `setTimeout` for the done indicator.

## Global Constraints

- No new npm dependencies
- All styles in `<style scoped>` in `App.vue`
- Max-width `720px`, centered, `8vh` top margin — matches existing page
- `ui-sans-serif, system-ui, sans-serif` font stack, `#111` base color
- The only file changed is `demo/App.vue`

---

### Task 1: Hero section

**Files:**
- Modify: `demo/App.vue` (full rewrite — replace all existing content)

**Interfaces:**
- Produces: a working hero section; the playground and install sections are empty stubs ready to be filled in Tasks 2–4

- [ ] **Step 1: Replace `demo/App.vue` with the hero skeleton**

  Write the full file with the hero complete and two empty stub sections:

  ```vue
  <script setup lang="ts">
  import { SignatureAnimation } from '../src/index'
  </script>

  <template>
    <div class="page">
      <!-- HERO -->
      <section class="hero">
        <span class="pkg-name">signature-animation-vue</span>
        <div class="hero-stage">
          <SignatureAnimation :duration="1.2" :delay="0.3">
            Hello World
          </SignatureAnimation>
        </div>
        <p class="tagline">A Vue 3 component that draws text as handwritten SVG strokes.</p>
        <div class="hero-links">
          <a href="https://www.npmjs.com/package/signature-animation-vue" target="_blank" rel="noopener">
            <img src="https://img.shields.io/npm/v/signature-animation-vue" alt="npm version" />
          </a>
          <a class="gh-link" href="https://github.com/WaldemarEnns/signature-animation-vue" target="_blank" rel="noopener">
            GitHub →
          </a>
        </div>
      </section>

      <!-- PLAYGROUND stub -->
      <section class="playground"></section>

      <!-- INSTALL stub -->
      <section class="install"></section>
    </div>
  </template>

  <style scoped>
  .page {
    max-width: 720px;
    margin: 8vh auto 80px;
    padding: 0 24px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #111;
  }

  /* Hero */
  .hero {
    margin-bottom: 72px;
  }
  .pkg-name {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 24px;
  }
  .hero-stage {
    min-height: 80px;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .tagline {
    font-size: 15px;
    color: #555;
    margin: 0 0 16px;
  }
  .hero-links {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .hero-links img {
    display: block;
  }
  .gh-link {
    font-size: 13px;
    color: #111;
    text-decoration: none;
    font-weight: 500;
  }
  .gh-link:hover {
    text-decoration: underline;
  }
  </style>
  ```

- [ ] **Step 2: Start the dev server and verify the hero**

  ```bash
  npm run dev
  ```

  Open `http://localhost:5173`. Confirm:
  - Package name label appears in small grey caps
  - `"Hello World"` animates on load
  - Tagline text is visible below
  - npm badge image loads (may be slow/cached — that's fine)
  - GitHub link is present

- [ ] **Step 3: Commit**

  ```bash
  git add demo/App.vue
  git commit -m "feat(demo): hero section with live animation and links"
  ```

---

### Task 2: Playground controls

**Files:**
- Modify: `demo/App.vue`

**Interfaces:**
- Consumes: `SignatureAnimation` component (props: `duration`, `delay`, `color`, `strokeWidth`, `autoplay`; event: `done`; exposed method: `replay()`)
- Produces: fully wired playground section; the `done` indicator is a stub `ref<boolean>` (wired up fully in Task 3)

- [ ] **Step 1: Add reactive state and the playground template**

  Replace the `<script setup>` block and the `<!-- PLAYGROUND stub -->` section with:

  ```vue
  <script setup lang="ts">
  import { ref } from 'vue'
  import { SignatureAnimation } from '../src/index'

  // Playground state
  const text = ref('Make it shine')
  const duration = ref(1)
  const delay = ref(0.2)
  const color = ref('#111111')
  const strokeWidth = ref(1)
  const autoplay = ref(true)
  const doneVisible = ref(false) // wired in Task 3

  const sig = ref<{ replay: () => void } | null>(null)
  function replay() {
    sig.value?.replay()
  }
  </script>
  ```

  Replace `<section class="playground"></section>` with:

  ```html
  <section class="playground">
    <h2 class="section-title">Playground</h2>

    <div class="stage">
      <SignatureAnimation
        ref="sig"
        :duration="duration"
        :delay="delay"
        :color="color"
        :stroke-width="strokeWidth"
        :autoplay="autoplay"
        @done="doneVisible = false"
      >{{ text }}</SignatureAnimation>
    </div>

    <div class="controls">
      <label class="ctrl">
        <span class="ctrl-label">Text</span>
        <input v-model="text" type="text" class="input-text" />
      </label>

      <label class="ctrl">
        <span class="ctrl-label">Duration <span class="ctrl-value">{{ duration }}s</span></span>
        <input v-model.number="duration" type="range" min="0.1" max="3" step="0.1" />
      </label>

      <label class="ctrl">
        <span class="ctrl-label">Delay <span class="ctrl-value">{{ delay }}s</span></span>
        <input v-model.number="delay" type="range" min="0" max="1" step="0.05" />
      </label>

      <label class="ctrl">
        <span class="ctrl-label">Stroke width <span class="ctrl-value">{{ strokeWidth }}</span></span>
        <input v-model.number="strokeWidth" type="range" min="1" max="4" step="0.5" />
      </label>

      <label class="ctrl">
        <span class="ctrl-label">Color</span>
        <input v-model="color" type="color" class="input-color" />
      </label>

      <div class="ctrl ctrl-row">
        <label class="toggle-label">
          <span class="ctrl-label">Autoplay</span>
          <button
            type="button"
            class="toggle"
            :class="{ on: autoplay }"
            :aria-pressed="autoplay"
            @click="autoplay = !autoplay"
          >
            <span class="toggle-thumb" />
          </button>
        </label>
        <button v-if="!autoplay" type="button" class="btn-replay" @click="replay">
          Replay
        </button>
        <span v-if="doneVisible" class="done-pill">✓ done</span>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: Add playground styles**

  Append to the `<style scoped>` block:

  ```css
  /* Playground */
  .playground {
    margin-bottom: 72px;
  }
  .section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #999;
    margin: 0 0 16px;
  }
  .stage {
    min-height: 100px;
    display: flex;
    align-items: center;
    padding: 24px;
    background: #f8f8f8;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    margin-bottom: 24px;
  }
  .controls {
    display: grid;
    gap: 16px;
    max-width: 360px;
  }
  .ctrl {
    display: grid;
    gap: 6px;
  }
  .ctrl-label {
    font-size: 13px;
    color: #555;
    display: flex;
    justify-content: space-between;
  }
  .ctrl-value {
    color: #999;
    font-variant-numeric: tabular-nums;
  }
  .input-text {
    padding: 8px 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
  }
  .input-color {
    width: 40px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
  }
  .ctrl-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .toggle {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 999px;
    border: none;
    background: #ddd;
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
    flex-shrink: 0;
  }
  .toggle.on {
    background: #111;
  }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .toggle.on .toggle-thumb {
    transform: translateX(16px);
  }
  .btn-replay {
    padding: 6px 14px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 999px;
    background: #fff;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
  }
  .btn-replay:hover {
    background: #f5f5f5;
  }
  .done-pill {
    font-size: 12px;
    color: #fff;
    background: #22c55e;
    padding: 3px 10px;
    border-radius: 999px;
  }
  ```

- [ ] **Step 3: Verify in browser**

  With dev server running, confirm:
  - All five prop controls render and are interactive
  - Changing text causes the animation to re-run (autoplay on)
  - Duration/delay sliders show their current value next to the label
  - Color picker changes the stroke color
  - Stroke width slider changes line thickness
  - Autoplay toggle switches between on/off states (thumb moves)
  - When autoplay is off, the Replay button appears

- [ ] **Step 4: Commit**

  ```bash
  git add demo/App.vue
  git commit -m "feat(demo): playground section with all five prop controls"
  ```

---

### Task 3: `done` event indicator

**Files:**
- Modify: `demo/App.vue`

**Interfaces:**
- Consumes: `doneVisible` ref and the `@done` binding from Task 2
- Produces: pill that appears for 800ms on each `done` event then disappears

- [ ] **Step 1: Wire up the done handler**

  In `<script setup>`, the `@done` handler currently sets `doneVisible = false`. Replace the inline binding and add a proper handler. Update the `<script setup>` block — add the handler function and a timer ref:

  ```ts
  let doneTimer: ReturnType<typeof setTimeout> | null = null

  function onDone() {
    if (doneTimer) clearTimeout(doneTimer)
    doneVisible.value = true
    doneTimer = setTimeout(() => {
      doneVisible.value = false
    }, 800)
  }
  ```

  Update the `@done` binding on `<SignatureAnimation>` in the playground section:

  ```html
  @done="onDone"
  ```

- [ ] **Step 2: Verify in browser**

  Run an animation to completion (short text, duration ~0.5s). The green "✓ done" pill should appear briefly then fade out. Replay and confirm it reappears each time.

- [ ] **Step 3: Commit**

  ```bash
  git add demo/App.vue
  git commit -m "feat(demo): done event indicator pill"
  ```

---

### Task 4: Install & Usage section

**Files:**
- Modify: `demo/App.vue`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: install and usage code blocks with copy buttons; page footer

- [ ] **Step 1: Add copy state and handler to script**

  Add to `<script setup>`:

  ```ts
  const copiedIndex = ref<number | null>(null)
  let copyTimer: ReturnType<typeof setTimeout> | null = null

  const snippets = [
    `npm install signature-animation-vue`,
    `<script setup>
import { SignatureAnimation } from 'signature-animation-vue'
<\/script>

<template>
  <SignatureAnimation :duration="1" :delay="0.3">
    Hello World
  </SignatureAnimation>
</template>`,
  ]

  function copy(index: number) {
    navigator.clipboard.writeText(snippets[index])
    if (copyTimer) clearTimeout(copyTimer)
    copiedIndex.value = index
    copyTimer = setTimeout(() => {
      copiedIndex.value = null
    }, 1500)
  }
  ```

- [ ] **Step 2: Replace the install stub section with full content**

  Replace `<section class="install"></section>` with:

  ```html
  <section class="install">
    <h2 class="section-title">Install &amp; Usage</h2>

    <div v-for="(snippet, i) in snippets" :key="i" class="code-block">
      <pre class="code-pre">{{ snippet }}</pre>
      <button type="button" class="copy-btn" @click="copy(i)">
        {{ copiedIndex === i ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <footer class="footer">
      <a href="https://github.com/WaldemarEnns/signature-animation-vue" target="_blank" rel="noopener">GitHub</a>
      <span class="footer-sep">·</span>
      <a href="https://www.npmjs.com/package/signature-animation-vue" target="_blank" rel="noopener">npm</a>
    </footer>
  </section>
  ```

- [ ] **Step 3: Add install section styles**

  Append to `<style scoped>`:

  ```css
  /* Install & Usage */
  .install {
    margin-bottom: 80px;
  }
  .code-block {
    position: relative;
    margin-bottom: 16px;
  }
  .code-pre {
    background: #1a1a1a;
    color: #e5e5e5;
    border-radius: 10px;
    padding: 16px 20px;
    font-size: 13px;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
    line-height: 1.6;
    margin: 0;
    overflow-x: auto;
    white-space: pre;
  }
  .copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.12);
    color: #ccc;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }
  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Footer */
  .footer {
    margin-top: 40px;
    font-size: 13px;
    color: #999;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .footer a {
    color: #555;
    text-decoration: none;
  }
  .footer a:hover {
    text-decoration: underline;
  }
  .footer-sep {
    color: #ddd;
  }
  ```

- [ ] **Step 4: Verify in browser**

  Confirm:
  - Both code blocks render with dark background
  - The install snippet shows on one line; the Vue SFC snippet shows multi-line with correct indentation
  - Copy button switches to "Copied!" for ~1.5s then resets
  - Footer links are present

- [ ] **Step 5: Commit**

  ```bash
  git add demo/App.vue
  git commit -m "feat(demo): install & usage section with copy buttons and footer"
  ```

---

### Task 5: Final polish and deploy

**Files:**
- Modify: `demo/App.vue` (minor tweaks only if needed after full-page review)

- [ ] **Step 1: Full-page visual review**

  With dev server running, scroll through the complete page and check:
  - Hero animation plays on load, phrase is legible at default size
  - Playground: all controls work; done pill appears and fades; autoplay toggle, replay button, and stroke width all behave correctly
  - Install section: both snippets copy correctly; no layout overflow on a narrow window (~375px)
  - No console errors

- [ ] **Step 2: Build the demo and check for errors**

  ```bash
  npm run build:demo
  ```

  Expected: exits with no errors. The `dist/` folder is populated.

- [ ] **Step 3: Run the library tests to confirm nothing is broken**

  ```bash
  npm test
  ```

  Expected: all tests pass.

- [ ] **Step 4: Commit and push**

  If any minor fixes were made in Step 1, stage them:

  ```bash
  git add demo/App.vue
  git commit -m "feat(demo): enhanced playground landing page"
  git push
  ```

  The GitHub Pages workflow deploys automatically on push to `main`. The live URL is `https://waldemarenns.github.io/signature-animation-vue/`.
