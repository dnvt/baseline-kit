import { calculateSnappedSpacing } from '@utils'

describe('calculateSnappedSpacing', () => {
  const base = 8

  describe('when snapping is "none"', () => {
    it('returns the initial spacing unchanged when provided as an object', () => {
      const initial = { top: 10, right: 20, bottom: 30, left: 40 }
      const result = calculateSnappedSpacing(100, base, initial, 'none')
      expect(result).toEqual(initial)
    })

    it('returns the initial spacing unchanged when provided as a number', () => {
      const initial = 15
      const result = calculateSnappedSpacing(100, base, initial, 'none')
      expect(result).toEqual({ top: 15, right: 15, bottom: 15, left: 15 })
    })
  })

  describe('when snapping is "height"', () => {
    it('adjusts only the bottom padding if height is not a multiple of base', () => {
      // With base=8 and height=46: remainder = 46 % 8 = 6 → adjustment = 8 - 6 = 2.
      // Starting with initial spacing {top: 10, right: 10, bottom: 10, left: 10},
      // bottom becomes 10 + 2 = 12.
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, 'height')
      expect(result).toEqual({ top: 10, right: 10, bottom: 12, left: 10 })
    })

    it('leaves the spacing unchanged if the height is already a multiple of base', () => {
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(48, base, initial, 'height')
      expect(result).toEqual(initial)
    })

    it('adjusts only the top padding when snapEdge is "top"', () => {
      // With base=8 and height=46, the 2px complement is added to top.
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, {
        mode: 'height',
        snapEdge: 'top',
      })
      expect(result).toEqual({ top: 12, right: 10, bottom: 10, left: 10 })
    })

    it('keeps bottom as the default snap edge', () => {
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, 'height')
      expect(result).toEqual({ top: 10, right: 10, bottom: 12, left: 10 })
    })

    it('preserves fractional CSS pixels when closing a subpixel remainder', () => {
      const height = 6.123
      const result = calculateSnappedSpacing(height, base, 0, {
        mode: 'height',
        snapEdge: 'top',
      })

      expect(result.top).toBeCloseTo(1.877, 10)
      expect(height + result.top).toBeCloseTo(base, 10)
    })
  })

  describe('when snapping is "clamp"', () => {
    it('clamps top and adjusts bottom padding for non-multiple heights with object spacing', () => {
      // Example: initial = { top: 10, right: 0, bottom: 6, left: 0 }
      // For height=45: remainder = 45 % 8 = 5.
      // Bottom becomes: 6 + (8 - 5) = 6 + 3 = 9, then 9 % 8 = 1.
      // Top becomes: 10 % 8 = 2.
      const initial = { top: 10, right: 0, bottom: 6, left: 0 }
      const result = calculateSnappedSpacing(45, base, initial, 'clamp')
      expect(result).toEqual({ top: 2, right: 0, bottom: 1, left: 0 })
    })

    it('clamps top and adjusts bottom padding for non-multiple heights when initial spacing is a number', () => {
      // With initial = 15 (i.e. {top:15, right:15, bottom:15, left:15}) and height=45:
      // - Top becomes: 15 % 8 = 7.
      // - Bottom is adjusted: 15 + (8 - 5) = 18, then 18 % 8 = 2.
      const initial = 15
      const result = calculateSnappedSpacing(45, base, initial, 'clamp')
      expect(result).toEqual({ top: 7, right: 15, bottom: 2, left: 15 })
    })

    it('applies clamp even when height is a multiple of base', () => {
      // For height=48 (a multiple of 8) and initial = {top:10, right:20, bottom:30, left:40}:
      // - Top becomes 10 % 8 = 2.
      // - Bottom becomes 30 % 8 = 6.
      // Right and left remain unchanged.
      const initial = { top: 10, right: 20, bottom: 30, left: 40 }
      const result = calculateSnappedSpacing(48, base, initial, 'clamp')
      expect(result).toEqual({ top: 2, right: 20, bottom: 6, left: 40 })
    })
  })
})
