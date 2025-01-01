import { renderHook } from '@testing-library/react'
import { useSpacerDimensions } from '@hooks'

describe('useSpacerDimensions', () => {
  const baseUnit = 8

  describe('Line Variant', () => {
    it('returns 100% dimensions for line variant regardless of input', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: 42,
          baseUnit,
          config: {
            variant: 'line',
          },
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
          height: 40, // 42 rounded down to nearest multiple of 8
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
          width: 48, // 50 rounded down to nearest multiple of 8
        },
        normalizedHeight: null,
        normalizedWidth: 48,
      })
    })

    it('warns when value is not a multiple of base unit', () => {
      const consoleSpy = vi.spyOn(console, 'warn')

      renderHook(() =>
        useSpacerDimensions({
          height: 45,
          baseUnit,
          config: {
            variant: 'flat',
          },
        }),
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Converted: 45 to 40'),
      )
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
          height: 40,
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

  describe('Base Unit Changes', () => {
    it('recalculates dimensions when base unit changes', () => {
      const { result, rerender } = renderHook(
        ({ baseUnit }) =>
          useSpacerDimensions({
            height: 42,
            baseUnit,
            config: {
              variant: 'flat',
            },
          }),
        {
          initialProps: { baseUnit: 8 },
        },
      )

      expect(result.current.dimensions.height).toBe(40) // 42 rounded to 40 with base 8

      // Change base unit to 4
      rerender({ baseUnit: 4 })

      expect(result.current.dimensions.height).toBe(40) // 42 rounded to 40 with base 4
    })
  })

  describe('Error Handling', () => {
    it('handles invalid size values', () => {
      const { result } = renderHook(() =>
        useSpacerDimensions({
          height: 'invalid' as any,
          baseUnit,
          config: {
            variant: 'flat',
          },
        }),
      )

      expect(result.current).toEqual({
        dimensions: {
          height: 0,
          width: '100%',
        },
        normalizedHeight: 0,
        normalizedWidth: null,
      })
    })
  })
})
