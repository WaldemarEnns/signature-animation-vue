# signature-animation-vue

Vue 3 component that draws text as handwritten SVG strokes.

[![npm](https://img.shields.io/npm/v/signature-animation-vue)](https://www.npmjs.com/package/signature-animation-vue)
[![license](https://img.shields.io/npm/l/signature-animation-vue)](./LICENSE)

## Install

```bash
npm install signature-animation-vue
```

`vue` ^3.4 is a peer dependency.

## Usage

```vue
<script setup lang="ts">
import { SignatureAnimation } from 'signature-animation-vue'
</script>

<template>
  <SignatureAnimation :duration="1" :delay="0.3">Hello World</SignatureAnimation>
</template>
```

Pass text via the default slot. Each letter renders as an SVG path that draws itself with a CSS stroke transition.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `duration` | `number` | `1` | Seconds to draw each letter |
| `delay` | `number` | `0` | Seconds to pause between letters |
| `autoplay` | `boolean` | `true` | Start animating on mount |
| `color` | `string` | `'#000'` | Stroke color |
| `strokeWidth` | `number` | `1` | Stroke width |

## Events and methods

**`done` event** — fires when the full sequence finishes.

**`replay()` method** — re-runs the animation from the start. Access it via a template ref.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SignatureAnimation } from 'signature-animation-vue'

const sig = ref()
</script>

<template>
  <SignatureAnimation ref="sig" :autoplay="false">Sign here</SignatureAnimation>
  <button @click="sig.replay()">Play</button>
</template>
```

## Notes

**Characters:** A–Z and a–z render as glyphs. Spaces add spacing. All other characters are skipped.

**Incremental updates:** When the slot text changes while `autoplay` is true, only the added or removed letters animate. The rest stay drawn.

**Reduced motion:** When `prefers-reduced-motion: reduce` is active, all letters snap to their final state immediately and `done` fires right away.

## Development

```bash
npm run dev              # demo playground
npm test                 # unit tests (Vitest + jsdom)
npm run build            # type-check and build library to dist/
npm run generate:glyphs  # regenerate src/glyphs.ts from upstream source
```

## Credits

Glyph artwork and concept from [`signature-animation`](https://github.com/Ayo-Osota/signature-animation) by Ayo Osota, inspired by a [CodePen by kiranpate1](https://codepen.io/kiranpate1/pen/ExBpaeW). MIT licensed.
