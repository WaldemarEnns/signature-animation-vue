import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { SignatureAnimation } from '../src/index'
import { vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

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
