import { describe, it, expect } from 'vitest'
import { createTextVNode, h } from 'vue'
import { slotText } from '../src/text'

describe('slotText', () => {
  it('returns empty string for undefined', () => {
    expect(slotText(undefined)).toBe('')
  })

  it('reads a plain text vnode', () => {
    expect(slotText([createTextVNode('Make AY shine')])).toBe('Make AY shine')
  })

  it('concatenates multiple text vnodes', () => {
    expect(slotText([createTextVNode('AB'), createTextVNode('cd')])).toBe('ABcd')
  })

  it('recurses into array children', () => {
    expect(slotText([h('span', ['x', 'y'])])).toBe('xy')
  })
})
