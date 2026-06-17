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
