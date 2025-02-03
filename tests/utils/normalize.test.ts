import {
  normalizeValue,
  normalizeValuePair,
  normalizeRect,
  isNormalized,
  convertValue,
} from '@utils'

describe('Normalization Utils', () => {
  describe('normalizeValue', () => {
    it('rounds numeric values to the nearest multiple of the base', () => {
      expect(normalizeValue(14, { base: 8 })).toBe(16)
      expect(normalizeValue('14px', { base: 8 })).toBe(16)
    })

    it('returns the base when the value is "auto"', () => {
      expect(normalizeValue('auto', { base: 8 })).toBe(8)
    })

    it('returns the non-rounded value when round is false', () => {
      expect(normalizeValue(14, { base: 8, round: false })).toBe(14)
      expect(normalizeValue('14px', { base: 8, round: false })).toBe(14)
    })

    it('clamps the normalized value when clamp options are provided', () => {
      // With base 8: 14 rounds to 16 but then is clamped to max 12.
      expect(normalizeValue(14, { base: 8, clamp: { max: 12 } })).toBe(12)
      // If the value is below the clamp minimum.
      expect(normalizeValue(6, { base: 8, clamp: { min: 8 } })).toBe(8)
    })

    it('suppresses warnings when suppressWarnings is true', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      })
      normalizeValue(14, { base: 8, clamp: { max: 12 }, suppressWarnings: true })
      expect(warnSpy).not.toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('logs a warning when the normalized value is clamped and warnings are not suppressed', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      })
      normalizeValue(14, { base: 8, clamp: { max: 12 }, suppressWarnings: false })
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('normalizeValuePair', () => {
    it('returns default values when the input tuple is undefined', () => {
      expect(normalizeValuePair(undefined, [10, 20])).toEqual([10, 20])
    })

    it('normalizes each value in the pair', () => {
      // Both 14 and "14px" should normalize to 16 when base is 8.
      expect(normalizeValuePair([14, '14px'], [0, 0], { base: 8 })).toEqual([16, 16])
    })
  })

  describe('normalizeRect', () => {
    it('normalizes all properties of a DOMRect', () => {
      // Create a fake DOMRect. With base 8:
      // width: 14 -> 16, height: 13 -> 16, top: 6 -> 8, left: 7 -> 8.
      const fakeRect = {
        width: 14,
        height: 13,
        top: 6,
        left: 7,
      } as DOMRect

      expect(normalizeRect(fakeRect, { base: 8 })).toEqual({
        width: 16,
        height: 16,
        top: 8,
        left: 8,
      })
    })
  })

  describe('isNormalized', () => {
    it('returns true for values that are already normalized', () => {
      expect(isNormalized(16, 8)).toBe(true)
      expect(isNormalized('16px', 8)).toBe(true)
    })

    it('returns false for values that are not normalized', () => {
      expect(isNormalized(14, 8)).toBe(false)
      expect(isNormalized('14px', 8)).toBe(false)
    })

    it('returns true for "auto"', () => {
      expect(isNormalized('auto', 8)).toBe(true)
    })
  })

  describe('convertValue', () => {
    const ctx = {
      viewportHeight: 768,
      viewportWidth: 1024,
      rootFontSize: 16,
      parentSize: 1000,
    }

    it('handles viewport units (vh and vw)', () => {
      // 10vh: 10% of 768 = 76.8
      expect(convertValue('10vh', ctx)).toBeCloseTo(76.8, 1)
      // 10vw: 10% of 1024 = 102.4
      expect(convertValue('10vw', ctx)).toBeCloseTo(102.4, 1)
    })

    it('handles percentages based on parentSize', () => {
      expect(convertValue('10%', { parentSize: 1000 })).toBeCloseTo(100, 0)
    })

    it('converts rem units based on rootFontSize', () => {
      expect(convertValue('2.4rem', { rootFontSize: 10 })).toBeCloseTo(24, 0)
    })

    it('returns null for non-convertible strings', () => {
      expect(convertValue('non-number', ctx)).toBeNull()
    })
  })
})