import { clamp, round, moduloize } from '@utils'

describe('Math Utils', () => {
  describe('clamp', () => {
    it('constrains values within the given range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('round', () => {
    it('rounds decimal values to the specified precision', () => {
      expect(round(1.234, 2)).toBeCloseTo(1.23, 2)
      expect(round(1.235, 2)).toBeCloseTo(1.24, 2)
    })

    it('rounds numbers to the nearest multiple for negative precision', () => {
      expect(round(123.456, -1)).toBe(120)
    })
  })

  describe('moduloize', () => {
    it('calculates the remainder (in pixels) for numeric and string values', () => {
      expect(moduloize(14, 8)).toBe('6px')
      expect(moduloize('14px', 8)).toBe('6px')
      expect(moduloize(-2, 8)).toBe('-2px')
      expect(moduloize(undefined, 8)).toBe('0px')
    })

    it('does not round the input when round option is false', () => {
      const result = moduloize(14.3, 8, { round: false })
      // Extract the numeric portion from the returned string.
      const numericValue = parseFloat(result)
      expect(numericValue).toBeCloseTo(6.3, 5)
    })

    it('returns "0px" when the value is a non-convertible string', () => {
      expect(moduloize('non-number', 8)).toBe('0px')
    })
  })
})