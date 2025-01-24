import {
  parseCSSUnit,
  convertToPixels,
  formatCSSValue,
} from '@utils'

describe('CSS Units Utils', () => {
  describe('parseCSSUnit', () => {
    it('parses valid CSS values with units', () => {
      expect(parseCSSUnit('100px')).toEqual({ value: 100, unit: 'px' })
      expect(parseCSSUnit('1.5rem')).toEqual({ value: 1.5, unit: 'rem' })
      expect(parseCSSUnit('.8em')).toEqual({ value: 0.8, unit: 'em' })
      expect(parseCSSUnit('-50%')).toEqual({ value: -50, unit: '%' })
    })

    it('handles invalid inputs', () => {
      expect(parseCSSUnit('invalid')).toBeNull()
      expect(parseCSSUnit('px100')).toBeNull()
      expect(parseCSSUnit('100')).toBeNull()
      expect(parseCSSUnit('')).toBeNull()
    })
  })

  describe('convertToPixels', () => {
    const context = {
      parentSize: 1000,
      viewportWidth: 1024,
      viewportHeight: 768,
      rootFontSize: 16,
      parentFontSize: 16,
    }

    it('converts absolute units to pixels', () => {
      expect(convertToPixels('100px')).toBe(100)
      expect(convertToPixels('1in')).toBe(96)
      expect(convertToPixels('1cm')).toBe(37.8)
      expect(convertToPixels('1mm')).toBe(3.78)
      expect(convertToPixels('1pt')).toBe(1.33)
      expect(convertToPixels('1pc')).toBe(16)
    })

    it('converts relative units using context', () => {
      expect(convertToPixels('100%', context)).toBe(1000)
      expect(convertToPixels('1em', context)).toBe(16)
      expect(convertToPixels('1rem', context)).toBe(16)

      // Use toBeCloseTo for floating point comparisons
      expect(convertToPixels('10vh', context)).toBeCloseTo(76.8, 1)
      expect(convertToPixels('10vw', context)).toBeCloseTo(102.4, 1)
      expect(convertToPixels('10vmin', context)).toBeCloseTo(76.8, 1)
      expect(convertToPixels('10vmax', context)).toBeCloseTo(102.4, 1)
    })

    it('handles fr units and invalid inputs', () => {
      expect(convertToPixels('1fr')).toBeNull()
      expect(convertToPixels('invalid')).toBeNull()
      expect(convertToPixels('100')).toBeNull()
    })
  })

  describe('formatCSSValue', () => {
    it('formats numeric values', () => {
      expect(formatCSSValue(100)).toBe('100px')
      expect(formatCSSValue(0)).toBe('0px')
      expect(formatCSSValue(-100)).toBe('-100px')
    })

    it('handles special values', () => {
      expect(formatCSSValue('auto')).toBe('auto')
      expect(formatCSSValue('100%')).toBe('100%')
    })

    it('preserves fr units', () => {
      expect(formatCSSValue('1fr')).toBe('1fr')
      expect(formatCSSValue('2.5fr')).toBe('2.5fr')
    })

    it('handles undefined and default values', () => {
      expect(formatCSSValue(undefined, 10)).toBe('10px')
      expect(formatCSSValue(undefined)).toBe('0')
    })
  })
})
