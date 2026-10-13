import { calculateSnappedSpacing, isOnBaseline } from '@baseline-kit/core'

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

  describe('measurement noise', () => {
    const initial = { top: 8, right: 0, bottom: 8, left: 0 }

    it('treats residues under 1/32px as aligned', () => {
      // Sub-unit noise, residues measured at 110%, 133% and 80% zoom, and
      // one-unit remainders in Chromium (1/64px) and Firefox (1/60px).
      for (const height of [
        40.0000076, 39.99, 40.005, 40.0057, 120.028, 72.017, 96.023, 288.017,
        96.0156, 40.015625, 40.0166667,
      ]) {
        expect(
          calculateSnappedSpacing(height, base, initial, {
            mode: 'height',
            snapEdge: 'top',
          })
        ).toEqual(initial)
        expect(calculateSnappedSpacing(height, base, initial, 'clamp')).toEqual(
          { top: 0, right: 0, bottom: 0, left: 0 }
        )
        expect(isOnBaseline(height, base)).toBe(true)
      }
    })

    it('snaps real heights two or more layout units off the grid', () => {
      // Times New Roman 18px trims to 8.046875; Firefox lays out in 1/60px.
      for (const height of [8.046875, 40.03125, 39.96875, 24.0625, 8.05]) {
        expect(isOnBaseline(height, base)).toBe(false)
        const { top } = calculateSnappedSpacing(
          height,
          base,
          { top: 0, right: 0, bottom: 0, left: 0 },
          { mode: 'height', snapEdge: 'top' }
        )
        expect((height + top) % base).toBe(0)
      }
    })

    it('snaps fractional text heights exactly onto the grid', () => {
      const result = calculateSnappedSpacing(
        8.734375,
        base,
        { top: 0, right: 0, bottom: 0, left: 0 },
        { mode: 'height', snapEdge: 'top' }
      )
      expect(8.734375 + result.top).toBe(16)
      expect(isOnBaseline(8.734375, base)).toBe(false)
    })
  })

  describe('tolerance boundary', () => {
    it('snaps remainders of 1/32px and more', () => {
      expect(isOnBaseline(40.03125, base)).toBe(false)
      expect(isOnBaseline(40.07, base)).toBe(false)
    })

    it('ignores floating-point error with non-binary bases', () => {
      // 46 % 9.2 is about 3.6e-15, not 0.
      for (const [height, gridBase] of [
        [46, 9.2],
        [48, 9.6],
        [43.8, 7.3],
        [24, 4.8],
      ] as const) {
        expect(isOnBaseline(height, gridBase)).toBe(true)
        expect(
          calculateSnappedSpacing(
            height,
            gridBase,
            { top: 0, right: 0, bottom: 0, left: 0 },
            'height'
          ).bottom
        ).toBe(0)
      }
    })
  })

  describe('bases of 1px or less', () => {
    it('leave the padding unchanged, so the outer Box does the snapping', () => {
      const initial = { top: 2, right: 0, bottom: 3, left: 0 }
      for (const mode of ['height', 'clamp'] as const) {
        expect(calculateSnappedSpacing(8.297, 1, initial, mode)).toEqual(
          initial
        )
        expect(calculateSnappedSpacing(8.297, 0.5, initial, mode)).toEqual(
          initial
        )
      }
    })
  })
})
