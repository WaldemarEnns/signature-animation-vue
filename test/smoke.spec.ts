import { describe, it, expect } from 'vitest'
import { name } from '../src/index'

describe('tooling', () => {
  it('runs vitest and resolves the package entry', () => {
    expect(name).toBe('signature-animation-vue')
  })
})
