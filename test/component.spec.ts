import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { SignatureAnimation } from '../src/index'
import { vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

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

describe('SignatureAnimation incremental updates', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function mountWithText(initial: string) {
    const text = ref(initial)
    const Parent = defineComponent({
      components: { SignatureAnimation },
      setup: () => ({ text }),
      template: `<SignatureAnimation :duration="1" :delay="0">{{ text }}</SignatureAnimation>`,
    })
    const wrapper = mount(Parent)
    const sig = wrapper.findComponent(SignatureAnimation)
    return { wrapper, sig, text }
  }

  it('animates only appended letters (done after one duration, not two)', async () => {
    const { wrapper, sig, text } = mountWithText('A')
    await vi.advanceTimersByTimeAsync(1100) // draw "A"
    expect(sig.emitted('done')).toHaveLength(1)

    text.value = 'AB'
    await flushPromises() // let the diff run up to the draw timers
    await vi.advanceTimersByTimeAsync(1100) // only "B" animates (~1s)

    // If it had restarted the whole word, "done" #2 would need ~2s and not be here yet.
    expect(sig.emitted('done')).toHaveLength(2)
    const paths = wrapper.findAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].element.style.strokeDashoffset).toBe('0') // "A" stayed drawn
    expect(paths[1].element.style.strokeDashoffset).toBe('0') // "B" drawn
  })

  it('drops removed trailing letters without redrawing the rest', async () => {
    const { wrapper, sig, text } = mountWithText('AB')
    await vi.advanceTimersByTimeAsync(2100) // draw "A","B"
    expect(sig.emitted('done')).toHaveLength(1)

    text.value = 'A' // remove the last letter
    await flushPromises()
    await vi.advanceTimersByTimeAsync(50)

    expect(wrapper.findAll('path')).toHaveLength(1) // "B" gone
    expect(wrapper.find('path').element.style.strokeDashoffset).toBe('0') // "A" kept drawn
    expect(sig.emitted('done')).toHaveLength(2) // nothing new to draw -> done immediately
  })
})
