<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
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

let doneTimer: ReturnType<typeof setTimeout> | null = null

function onDone() {
  if (doneTimer) clearTimeout(doneTimer)
  doneVisible.value = true
  doneTimer = setTimeout(() => {
    doneVisible.value = false
  }, 800)
}

onUnmounted(() => {
  if (doneTimer) clearTimeout(doneTimer)
  if (copyTimer) clearTimeout(copyTimer)
})

// Copy state and handler
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

async function copy(index: number) {
  try {
    await navigator.clipboard.writeText(snippets[index])
  } catch {
    return
  }
  if (copyTimer) clearTimeout(copyTimer)
  copiedIndex.value = index
  copyTimer = setTimeout(() => {
    copiedIndex.value = null
  }, 1500)
}
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

    <!-- PLAYGROUND -->
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
          @done="onDone"
        >{{ text }}</SignatureAnimation>
      </div>

      <div class="controls">
        <label class="ctrl">
          <span class="ctrl-label">Text</span>
          <input v-model="text" type="text" class="input-text" />
        </label>

        <label class="ctrl">
          <span class="ctrl-label">Duration <span class="ctrl-value">{{ duration }}s</span></span>
          <input v-model.number="duration" type="range" min="0.2" max="3" step="0.1" />
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
          <button type="button" class="btn-replay" @click="replay">
            Replay
          </button>
          <span v-if="doneVisible" class="done-pill">✓ done</span>
        </div>
      </div>
    </section>

    <!-- INSTALL & USAGE -->
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
  padding-right: 72px;
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
</style>
