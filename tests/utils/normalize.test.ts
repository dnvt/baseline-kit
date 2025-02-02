import { normalizeValue, isNormalized, convertValue } from '@utils'

describe('Normalization Utils', () => {
  describe('normalizeValue', () => {
    it('rounds to base unit', () => {
      expect(normalizeValue(14, { base: 8 })).toBe(16)
      expect(normalizeValue('14px', { base: 8 })).toBe(16)
    })
  })

  describe('convert', () => {
    const ctx = {
      viewportHeight: 768,
      viewportWidth: 1024,
      rootFontSize: 16,
    }

    it('handles viewport units', () => {
      // 10vh = 10% of 768 = 76.8
      expect(convertValue('10vh', ctx)).toBeCloseTo(76.8, 1) // 1 decimal place
      // 10vw = 10% of 1024 = 102.4
      expect(convertValue('10vw', ctx)).toBeCloseTo(102.4, 1)
    })

    it('handles percentages', () => {
      expect(convertValue('10%', { parentSize: 1000 })).toBeCloseTo(100, 0)
    })

    it('converts rem units', () => {
      expect(convertValue('2.4rem', { rootFontSize: 10 })).toBeCloseTo(24, 0)
    })
  })


  describe('isNormalized', () => {
    it('checks base alignment', () => {
      expect(isNormalized(16, 8)).toBe(true)
      expect(isNormalized('16px', 8)).toBe(true)
    })
  })
})
