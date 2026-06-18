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
  /** index of the source character in the current text */
  srcIndex: number
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
    if (ch === ' ') out.push({ type: 'space', glyph: null, srcIndex: i, key: `s${i}` })
    else if (glyphs[ch]) out.push({ type: 'glyph', glyph: glyphs[ch], srcIndex: i, key: `g${i}` })
    // unknown characters are skipped
  })
  return out
}

// Glyph items only, in render (and therefore <path>) order.
function glyphItems(): Item[] {
  return buildItems().filter((it) => it.type === 'glyph')
}

// Compare two strings and locate the single changed region between the common
// prefix and common suffix. Characters of the new string at index [cp, newEnd)
// are "new" (need drawing); everything else is unchanged and stays drawn.
// This covers additions/removals at the start, the end, or both.
function diffEdges(oldS: string, newS: string): { cp: number; newEnd: number } {
  const a = [...oldS]
  const b = [...newS]
  let cp = 0
  while (cp < a.length && cp < b.length && a[cp] === b[cp]) cp++
  let cs = 0
  while (cs < a.length - cp && cs < b.length - cp && a[a.length - 1 - cs] === b[b.length - 1 - cs]) cs++
  return { cp, newEnd: b.length - cs }
}

const root = ref<HTMLElement | null>(null)
let runToken = 0
let lastText = ''

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const allPaths = (): SVGPathElement[] =>
  root.value ? Array.from(root.value.querySelectorAll('path')) : []

function reset(): void {
  for (const p of allPaths()) {
    const len = pathLen(p)
    p.style.transition = 'none'
    p.style.strokeDasharray = String(len)
    p.style.strokeDashoffset = String(len)
  }
}

const prefersReduced = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const pathLen = (p: SVGPathElement): number =>
  p.getTotalLength?.() || Number(p.dataset.len) || 0

// Draw only the letters whose source-character index falls in [cp, newEnd);
// every other letter is snapped to its finished (drawn) state. Unchanged
// prefix/suffix letters therefore stay put while just the new ones animate in.
async function animateDiff(cp: number, newEnd: number): Promise<void> {
  const token = ++runToken
  await nextTick()
  if (token !== runToken) return // superseded during nextTick
  const items = glyphItems()
  const ps = allPaths()
  const fresh: SVGPathElement[] = []
  for (let k = 0; k < ps.length; k++) {
    const p = ps[k]
    const len = pathLen(p)
    const idx = items[k]?.srcIndex ?? -1
    const isNew = idx >= cp && idx < newEnd
    p.style.transition = 'none'
    p.style.strokeDasharray = String(len)
    if (isNew) {
      p.style.strokeDashoffset = String(len) // hidden, about to be drawn
      fresh.push(p)
    } else {
      p.style.strokeDashoffset = '0' // unchanged letter: keep it drawn
    }
  }
  if (prefersReduced()) {
    for (const p of fresh) p.style.strokeDashoffset = '0'
    if (token === runToken) emit('done')
    return
  }
  void root.value?.offsetWidth // flush "transition: none" before enabling it
  for (let i = 0; i < fresh.length; i++) {
    if (token !== runToken) return // a newer run cancelled this one
    const p = fresh[i]
    p.style.transition = `stroke-dashoffset ${props.duration}s ease-in-out`
    p.style.strokeDashoffset = '0'
    await sleep(props.duration * 1000)
    if (props.delay > 0 && i < fresh.length - 1) await sleep(props.delay * 1000)
  }
  if (token === runToken) emit('done')
}

// Full (re)draw: every letter is treated as new.
function run(): Promise<void> {
  return animateDiff(0, [...currentText()].length)
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
  if (t === lastText) return
  const prev = lastText
  lastText = t
  if (!props.autoplay) return
  const { cp, newEnd } = diffEdges(prev, t)
  void animateDiff(cp, newEnd)
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
