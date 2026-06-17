import { describe, it, expect } from 'vitest'
import { glyphs, GLYPH_HEIGHT } from '../src/glyphs'

const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

describe('glyphs', () => {
  it('exposes GLYPH_HEIGHT of 51', () => {
    expect(GLYPH_HEIGHT).toBe(51)
  })

  it('contains all 52 letters', () => {
    expect(Object.keys(glyphs)).toHaveLength(52)
    for (const ch of ALL) expect(glyphs[ch]).toBeTruthy()
  })

  it('every glyph has valid fields', () => {
    for (const [key, g] of Object.entries(glyphs)) {
      expect(g.d.length, `${key}.d`).toBeGreaterThan(0)
      expect(g.width, `${key}.width`).toBeGreaterThan(0)
      expect(g.len, `${key}.len`).toBeGreaterThan(0)
      expect(typeof g.ml, `${key}.ml`).toBe('number')
      expect(typeof g.mr, `${key}.mr`).toBe('number')
    }
  })
})
