import { clamp, round } from '@utils'

describe('Math Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('clamp', () => {
    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('clamps to minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('clamps to maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('handles equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10)
    })

    it('handles floating point numbers', () => {
      expect(clamp(1.5, 1, 2)).toBe(1.5)
      expect(clamp(0.5, 1, 2)).toBe(1)
      expect(clamp(2.5, 1, 2)).toBe(2)
    })
  })

  describe('round', () => {
    it('rounds to integer by default', () => {
      expect(round(1.234)).toBe(1)
      expect(round(1.567)).toBe(2)
    })

    it('rounds to specified decimal places', () => {
      expect(round(1.234, 2)).toBe(1.23)
      expect(round(1.235, 2)).toBe(1.24)
    })

    it('handles negative numbers', () => {
      expect(round(-1.234, 2)).toBe(-1.23)
      expect(round(-1.235, 2)).toBe(-1.24)
    })

    it('handles zero precision', () => {
      expect(round(1.234, 0)).toBe(1)
    })

    it('handles negative precision', () => {
      expect(round(123.456, -1)).toBe(120)
      expect(round(123.456, -2)).toBe(100)
    })
  })
})
