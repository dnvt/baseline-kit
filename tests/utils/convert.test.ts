import { convertValue } from '@utils'
import type { ConversionContext } from '@utils'

describe('convertValue', () => {
  it('returns the number itself if a number is provided', () => {
    expect(convertValue(42)).toBe(42)
  })

  describe('absolute units', () => {
    it('converts "px" values', () => {
      expect(convertValue('100px')).toBe(100)
    })

    it('converts "in" values', () => {
      // 1in should be 96
      expect(convertValue('1in')).toBeCloseTo(96)
    })

    it('converts "cm" values', () => {
      // 2cm should be 2 * 37.8 = 75.6
      expect(convertValue('2cm')).toBeCloseTo(75.6, 1)
    })

    it('converts "mm" values', () => {
      // 10mm should be 10 * 3.78 = 37.8
      expect(convertValue('10mm')).toBeCloseTo(37.8, 1)
    })

    it('converts "pt" values', () => {
      // 10pt should be 10 * 1.33 = 13.3
      expect(convertValue('10pt')).toBeCloseTo(13.3, 1)
    })

    it('converts "pc" values', () => {
      // 2pc should be 2 * 16 = 32
      expect(convertValue('2pc')).toBe(32)
    })
  })

  describe('relative units', () => {
    const customContext: ConversionContext = {
      parentSize: 200,
      viewportWidth: 1200,
      viewportHeight: 800,
      rootFontSize: 18,
      parentFontSize: 20,
    }

    it('converts "em" values using parentFontSize', () => {
      // 2em should be 2 * 20 = 40
      expect(convertValue('2em', customContext)).toBe(40)
    })

    it('converts "rem" values using rootFontSize', () => {
      // 2rem should be 2 * 18 = 36
      expect(convertValue('2rem', customContext)).toBe(36)
    })

    it('converts "vh" values using viewportHeight', () => {
      // 50vh should be 50% of 800 = 400
      expect(convertValue('50vh', customContext)).toBe(400)
    })

    it('converts "vw" values using viewportWidth', () => {
      // 25vw should be 25% of 1200 = 300
      expect(convertValue('25vw', customContext)).toBe(300)
    })

    it('converts "vmin" values using the minimum of viewport dimensions', () => {
      // For viewportWidth=1200, viewportHeight=800, vmin is 800 → 1vmin = 8 pixels.
      expect(convertValue('1vmin', customContext)).toBe(8)
    })

    it('converts "vmax" values using the maximum of viewport dimensions', () => {
      // vmax uses 1200 so 1vmax = 12 pixels.
      expect(convertValue('1vmax', customContext)).toBe(12)
    })

    it('converts "%" values using parentSize', () => {
      // 10% of 200 = 20
      expect(convertValue('10%', customContext)).toBe(20)
    })
  })

  describe('special cases', () => {
    it('returns null for "auto"', () => {
      expect(convertValue('auto')).toBeNull()
    })

    it('returns null for non-convertible strings', () => {
      expect(convertValue('foobar')).toBeNull()
    })

    it('returns null when the value is not a number or string', () => {
      expect(convertValue({} as never)).toBeNull()
    })
  })
})