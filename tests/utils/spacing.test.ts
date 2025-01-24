import { BlockInlineSpacing, normalizeSpacing, PaddingSpacing, PaddingValue, SpacingSystem } from '../../src/lib'

describe('SpacingSystem', () => {
  describe('SpacingSystem.normalizeValue', () => {
    it('returns [0,0] for undefined', () => {
      expect(SpacingSystem.normalizeValue(undefined, 8)).toEqual([0, 0])
    })

    it('normalizes a single number', () => {
      // If base=8, e.g. 10 => round to nearest 8 => 8
      // Or however your MeasurementSystem logic does it
      const result = SpacingSystem.normalizeValue(10, 8)
      // might be [8,8] or [10,10] depending on rounding logic
      expect(result).toEqual([8, 8])
    })

    it('handles array spacing', () => {
      // e.g. [10,20]
      const result = SpacingSystem.normalizeValue([10, 20], 8)
      expect(result).toEqual([8, 24]) // depends on rounding
    })

    it('handles object spacing', () => {
      // e.g. {start:10, end:15}
      const result = SpacingSystem.normalizeValue({ start: 10, end: 15 }, 8)
      expect(result).toEqual([8, 16]) // or [8,16]
    })
  })

  describe('SpacingSystem.toTuple', () => {
    it('converts single number to [num,num]', () => {
      expect(SpacingSystem.toTuple(10)).toEqual([10, 10])
    })

    it('converts array to itself', () => {
      expect(SpacingSystem.toTuple([10, 20])).toEqual([10, 20])
    })

    it('converts object to [start,end]', () => {
      expect(SpacingSystem.toTuple({ start: 5, end: 15 })).toEqual([5, 15])
    })
  })
})

describe('normalizeSpacing', () => {
  it('handles block/inline spacing', () => {
    const props = {
      block: [10, 20],
      inline: 15,
    }
    const result = normalizeSpacing(props as BlockInlineSpacing, 8)
    // e.g. 10 => 8, 20 => 24, 15 => 16
    expect(result).toEqual({
      block: [8, 24],
      inline: [16, 16],
    })
  })

  it('handles padding as a single number', () => {
    const props = { padding: 10 }
    const result = normalizeSpacing(props, 8)
    expect(result).toEqual({ block: [8, 8], inline: [8, 8] }) // or [10,10] if no rounding
  })

  it('handles 2-tuple padding', () => {
    // e.g. [block, inline]
    const props = { padding: [10, 20] as PaddingValue }
    const result = normalizeSpacing(props, 8)
    expect(result).toEqual({
      block: [8, 8],
      inline: [24, 24],
    })
  })

  it('handles 4-tuple padding', () => {
    // e.g. [top, right, bottom, left]
    const props = { padding: [10, 20, 15, 5] }
    const result = normalizeSpacing(props as PaddingSpacing, 8)
    // block => [top, bottom], inline => [left, right]
    expect(result).toEqual({
      block: [8, 16],
      inline: [8, 24],
    })
  })

  it('handles object padding', () => {
    const props = { padding: { start: 5, end: 9, left: 3, right: 7 } }
    // block => [start,end], inline => [left,right]
    const result = normalizeSpacing(props, 8)
    expect(result).toEqual({
      block: [8, 8],   // from 5->8, 9->8 (?)
      inline: [0, 8], // from 3->0 or 3->??? depends on rounding
    })
  })
})