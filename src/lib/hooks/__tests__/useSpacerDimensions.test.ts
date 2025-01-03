import { renderHook } from '@testing-library/react'
import { useSpacerDimensions } from '@hooks'
import { cssTestUtils } from '@/__tests__/matchers/cssTestUtils'

beforeEach(() => {
  vi.clearAllMocks()
  console.log = vi.fn()
})

describe('useSpacerDimensions', () => {
  const baseUnit = 8

  beforeEach(() => {
    cssTestUtils.createTestContext({
      viewportHeight: 800,
      viewportWidth: 1024,
      rootFontSize: '16px',
    })
  })

  describe('Line Variant', () => {
    it('returns 100% dimensions for line variant regardless of input', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: 42,
          baseUnit,
          config: {
            variant: 'line' as const,
          },
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: '40px', // Should be normalized to baseUnit multiple
          width: '100%',
        },
        normalizedHeight: 40,
        normalizedWidth: null,
      })
    })
  })

  describe('Flat Variant', () => {
    it('normalizes height to base unit multiple', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: 42,
          baseUnit,
          config: {
            variant: 'flat',
          },
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: '40px', // Normalized to baseUnit multiple
          width: '100%',
        },
        normalizedHeight: 40,
        normalizedWidth: null,
      })
    })

    it('normalizes width to base unit multiple', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          width: 50,
          baseUnit,
          config: {
            variant: 'flat',
          },
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: '100%',
          width: '48px', // Normalized to baseUnit multiple
        },
        normalizedHeight: null,
        normalizedWidth: 48,
      })
    })
  })

  describe('Default Variant', () => {
    it('handles default variant with height', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: 40,
          baseUnit,
          config: {},
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: '40px',
          width: '100%',
        },
        normalizedHeight: 40,
        normalizedWidth: null,
      })
    })

    it('returns 100% dimensions when no size provided', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          baseUnit,
          config: {},
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: '100%',
          width: '100%',
        },
        normalizedHeight: null,
        normalizedWidth: null,
      })
    })
  })

  describe('CSS Unit Handling', () => {
    beforeEach(() => {
      cssTestUtils.createTestContext({
        viewportHeight: 800,
        viewportWidth: 1024,
        rootFontSize: '16px',
      })
    })

    it('handles absolute units correctly', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: '1in',
          baseUnit: 8,
        }),
      )

      expect(result.current.dimensions.height).toBe('1in')
      expect(result.current.normalizedHeight).toBe(96) // 1in = 96px, rounded to nearest 8
    })

    it('handles relative units correctly', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          width: '10vh',
          baseUnit: 8,
        }),
      )

      expect(result.current.dimensions.width).toBe('10vh')
      expect(result.current.normalizedWidth).toBe(80) // 10% of 800px = 80px
    })

    it('handles rem units correctly', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: '2rem',
          baseUnit: 8,
        }),
      )

      expect(result.current.dimensions.height).toBe('2rem')
      expect(result.current.normalizedHeight).toBe(32) // 2 * 16px = 32px
    })
  })
})

