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
