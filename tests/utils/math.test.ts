import { clamp, calculateRowCount } from '@utils'

describe('Math Utils', () => {
  describe('clamp', () => {
    it('constrains values within the given range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('calculateRowCount', () => {
    it('calculates row count based on height and base', () => {
      expect(calculateRowCount({ height: 80, top: 0, bottom: 0, base: 8 })).toBe(10)
      expect(calculateRowCount({ height: 100, top: 10, bottom: 10, base: 8 })).toBe(10)
    })

    it('returns at least 1 row', () => {
      expect(calculateRowCount({ height: 0, top: 0, bottom: 0, base: 8 })).toBe(1)
    })
  })
})
