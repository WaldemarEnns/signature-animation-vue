import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { SignatureAnimation } from '../src/index'

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
