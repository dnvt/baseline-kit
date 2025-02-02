import { clamp, round } from '@utils'

describe('Math Utils', () => {
  describe('clamp', () => {
    it('constrains values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  it('rounds decimal values', () => {
    expect(round(1.234, 2)).toBeCloseTo(1.23, 2)
    expect(round(1.235, 2)).toBeCloseTo(1.24, 2)
    expect(round(123.456, -1)).toBe(120)
  })
})
