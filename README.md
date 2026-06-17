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

| Prop          | Type      | Default  | Description                       |
| ------------- | --------- | -------- | --------------------------------- |
| `duration`    | `number`  | `1`      | Seconds to draw each letter.      |
| `delay`       | `number`  | `0`      | Seconds to pause between letters. |
| `autoplay`    | `boolean` | `true`   | Start animating on mount.         |
| `color`       | `string`  | `'#000'` | Stroke color.                     |
| `strokeWidth` | `number`  | `1`      | Stroke width.                     |

The text to animate is passed via the **default slot**. Only `A–Z` and `a–z` are drawn; spaces add spacing and other characters are skipped. Honors `prefers-reduced-motion`.

## Events & methods

- Emits **`done`** when the full sequence finishes.
- Exposes **`replay()`** (via template ref) to re-run the animation.

## Development

```bash
npm run dev      # demo playground
npm test         # unit tests (Vitest)
npm run build    # build the library to dist/
```

Glyph data lives in `src/glyphs.ts` and is generated from the upstream source with `npm run generate:glyphs`.

## Credits

Glyph artwork and concept from [`signature-animation`](https://github.com/Ayo-Osota/signature-animation) by Ayo Osota, inspired by a [CodePen by kiranpate1](https://codepen.io/kiranpate1/pen/ExBpaeW). MIT licensed.
