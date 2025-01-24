import { CSSValue, MeasurementSystem } from '@utils'

describe('MeasurementSystem', () => {
  beforeEach(() => {
    // Mock out console.* so we can test warnings / errors
    vi.spyOn(console, 'warn').mockImplementation(() => {
    })
    vi.spyOn(console, 'error').mockImplementation(() => {
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('normalize', () => {
    it('returns unit if value is "auto"', () => {
      // If base = 8, "auto" => 8
      expect(MeasurementSystem.normalize('auto')).toBe(8)
    })

    it('rounds numeric values to nearest multiple of unit by default', () => {
      // base=8 => 10 => nearest multiple is 8
      expect(MeasurementSystem.normalize(10, { unit: 8 })).toBe(8)
      expect(MeasurementSystem.normalize(12)).toBe(16)
      expect(MeasurementSystem.normalize(13)).toBe(16)
    })

    it('suppresses rounding if round=false', () => {
      // With round=false, we get the raw number
      expect(MeasurementSystem.normalize(10, { round: false })).toBe(10)
    })

    it('clamps numeric values if clamp is provided', () => {
      // clamp between 0 and 10
      expect(MeasurementSystem.normalize(12, {
        clamp: { min: 0, max: 10 },
      })).toBe(10)

      expect(MeasurementSystem.normalize(-2, {
        clamp: { min: 0, max: 10 },
      })).toBe(0)
    })

    it('logs a warning if value changed and suppressWarnings is false', () => {
      MeasurementSystem.normalize(14) // base=8 => 16
      expect(console.warn).toHaveBeenCalled()
    })

    it('does not log warning if value is the same', () => {
      // e.g. 16 => 16 => no warning
      MeasurementSystem.normalize(16)
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('does not log warning if suppressWarnings=true', () => {
      MeasurementSystem.normalize(14, { suppressWarnings: true })
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('parses string values and normalizes them', () => {
      // e.g. "12px" => 12 => nearest 8 => 8
      expect(MeasurementSystem.normalize('12px')).toBe(16)

      // e.g. "1rem" => 16 => nearest multiple => 16
      expect(MeasurementSystem.normalize('1rem')).toBe(16)
    })

    it('throws error for invalid strings, then returns default unit', () => {
      // triggers the "PARSING_ERROR" path
      const result = MeasurementSystem.normalize('invalid' as CSSValue)
      // it logs an error internally and returns the unit (8)
      expect(result).toBe(8)
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('normalizeDimension', () => {
    it('uses defaultValue if value is undefined', () => {
      expect(MeasurementSystem.normalizeDimension(undefined, 50)).toBe(50)
    })

    it('otherwise normalizes the provided value', () => {
      expect(MeasurementSystem.normalizeDimension(14, 50)).toBe(16) // base=8 => nearest multiple is 16
    })
  })

  describe('normalizeDimensionPair', () => {
    it('returns defaults if pair is undefined', () => {
      const result = MeasurementSystem.normalizeDimensionPair(undefined, [10, 20])
      expect(result).toEqual([10, 20])
    })

    it('normalizes each value in the pair', () => {
      // e.g. base=8 => 15 => 16, 1 => 0 or 8
      const result = MeasurementSystem.normalizeDimensionPair([15, 1], [10, 10])
      // 15 => nearest multiple is 16, 1 => nearest multiple is 0 or 0
      expect(result).toEqual([16, 0])
    })
  })

  describe('normalizeRect', () => {
    it('normalizes rect dimensions', () => {
      const rect = {
        width: 14,
        height: 22,
        top: 5,
        left: 3,
      } as DOMRect
      // e.g. 14 =>16, 22 =>24, 5=>8, 3=>0
      const result = MeasurementSystem.normalizeRect(rect)
      expect(result).toEqual({ width: 16, height: 24, top: 8, left: 0 })
    })
  })

  describe('isNormalized', () => {
    it('returns true if numeric value is already multiple of base', () => {
      expect(MeasurementSystem.isNormalized(16)).toBe(true)
      expect(MeasurementSystem.isNormalized(14)).toBe(false)
    })

    it('handles string values', () => {
      // '16px' => 16 => multiple
      // '14px' => 14 => not multiple
      expect(MeasurementSystem.isNormalized('16px')).toBe(true)
      expect(MeasurementSystem.isNormalized('14px')).toBe(false)
    })

    it('returns true for "auto"', () => {
      // "auto" => base => 8 => multiple => true
      expect(MeasurementSystem.isNormalized('auto')).toBe(true)
    })
  })

  describe('convert', () => {
    const ctx = {
      parentSize: 1000,
      viewportWidth: 1024,
      viewportHeight: 768,
      rootFontSize: 16,
      parentFontSize: 16,
    }

    it('converts from absolute units to px', () => {
      expect(MeasurementSystem.convert(1, 'in', 'px', ctx)).toBe(96)
      expect(MeasurementSystem.convert(1, 'cm', 'px', ctx)).toBe(37.8)
      expect(MeasurementSystem.convert(1, 'mm', 'px', ctx)).toBe(3.78)
      expect(MeasurementSystem.convert(1, 'pt', 'px', ctx)).toBe(1.33)
      expect(MeasurementSystem.convert(1, 'pc', 'px', ctx)).toBe(16)
    })

    it('converts from px to other absolute units', () => {
      expect(MeasurementSystem.convert(96, 'px', 'in', ctx)).toBe(1)
      expect(MeasurementSystem.convert(37.8, 'px', 'cm', ctx)).toBeCloseTo(1, 2)
      expect(MeasurementSystem.convert(3.78, 'px', 'mm', ctx)).toBeCloseTo(1, 2)
    })

    it('handles relative units to px', () => {
      // 1em => parentFontSize=16 => 16px
      expect(MeasurementSystem.convert(1, 'em', 'px', ctx)).toBe(16)
      // 1rem => rootFontSize=16 =>16px
      expect(MeasurementSystem.convert(1, 'rem', 'px', ctx)).toBe(16)
      // 10vh => (10/100) * 768 => 76.8
      expect(MeasurementSystem.convert(10, 'vh', 'px', ctx)).toBeCloseTo(76.8, 3)
      // 10% => (10/100) * parentSize=1000 => 100
      expect(MeasurementSystem.convert(10, '%', 'px', ctx)).toBe(100)
    })

    it('converts from px to relative units', () => {
      // e.g. 16 px => 1 em
      expect(MeasurementSystem.convert(16, 'px', 'em', ctx)).toBe(1)
      expect(MeasurementSystem.convert(16, 'px', 'rem', ctx)).toBe(1)
      expect(MeasurementSystem.convert(76.8, 'px', 'vh', ctx)).toBeCloseTo(10, 1)
      expect(MeasurementSystem.convert(100, 'px', '%', ctx)).toBe(10)
    })

    it('handles vmin and vmax', () => {
      // e.g. 10 vmin => (10/100)*min(1024,768)=76.8 => px
      // fromUnit = 'vmin' => => px
      expect(MeasurementSystem.convert(10, 'vmin', 'px', ctx)).toBeCloseTo(76.8, 1)
      // e.g. 10 vmax =>102.4 => px
      expect(MeasurementSystem.convert(10, 'vmax', 'px', ctx)).toBeCloseTo(102.4, 1)

      // px => vmin
      // 76.8 px => 10 vmin
      expect(MeasurementSystem.convert(76.8, 'px', 'vmin', ctx)).toBeCloseTo(10, 1)
      // px => vmax
      expect(MeasurementSystem.convert(102.4, 'px', 'vmax', ctx)).toBeCloseTo(10, 1)
    })

    it('throws error for unsupported fromUnit', () => {
      expect(() => MeasurementSystem.convert(1, 'xyz' as never, 'px')).toThrowError('Unsupported source unit')
    })

    it('throws error for unsupported toUnit', () => {
      expect(() => MeasurementSystem.convert(1, 'px', 'xyz' as never)).toThrowError('Unsupported target unit')
    })
  })
})