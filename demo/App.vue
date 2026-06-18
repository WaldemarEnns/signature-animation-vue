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
