import { renderHook } from '@testing-library/react'
import { useGridCalculations } from '@hooks'
import type { CSSValue } from '@/types'
import { cssTestUtils } from '@/__tests__/matchers/cssTestUtils'

describe('useGridCalculations', () => {
  describe('Line Variant', () => {
    it('calculates line variant layout correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 100,
          config: {
            variant: 'line',
            gap: 8,
          },
        }),
      )

      // Gap becomes 7px (8px - 1px for line width)
      // columns = Math.floor(100 / (7 + 1)) + 1 = 13
      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(13, 1px)',
        columnsCount: 13,
        calculatedGap: '7px',
        isValid: true,
      })
    })
  })

  describe('Pattern Variant', () => {
    it('handles pixel values correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: ['100px', '200px', '100px'],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: '100px 200px 100px',
        columnsCount: 3,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles basic supported types correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: [
              '100px',      // Pixels
              100,          // Number (converted to px)
              'auto',       // Auto value
            ],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: '100px 100px auto',
        columnsCount: 3,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles numeric values correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: [100, 200, 300],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: '100px 200px 300px',
        columnsCount: 3,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles invalid values appropriately', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: ['invalid-unit' as never], // Using truly invalid value instead of '1fr'
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      })
    })

    it('handles fr units correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: ['1fr', '2fr', '1fr'],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: '1fr 2fr 1fr',
        columnsCount: 3,
        calculatedGap: '16px',
        isValid: true,
      })
    })

  })

  describe('Fixed Columns', () => {
    it('calculates fixed columns with default width', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'fixed',
            columns: 12,
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(12, 1fr)',
        columnsCount: 12,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('calculates fixed columns with custom width', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'fixed',
            columns: 12,
            columnWidth: '80px' as CSSValue,
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(12, 80px)',
        columnsCount: 12,
        calculatedGap: '16px',
        isValid: true,
      })
    })
  })

  describe('Auto Grid', () => {
    it('handles auto value correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: 'auto',
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
        columnsCount: 1,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles pixel values correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: '100px',
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        columnsCount: 8,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles numeric values correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: 100,
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        columnsCount: 8,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles unsupported units appropriately', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: '2em',
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(2em, 1fr))',
        columnsCount: 1,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles percentage values correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: '20%',
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(20%, 1fr))',
        columnsCount: 1,
        calculatedGap: '16px',
        isValid: true,
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing container width', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 0,
          config: {
            variant: 'fixed',
            columns: 12,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      })
    })

    it('handles invalid pattern', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'pattern',
            columns: ['invalid' as never],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      })
    })
  })

  describe('Unit Handling', () => {
    beforeEach(() => {
      cssTestUtils.createTestContext({
        viewportWidth: 1000,
        viewportHeight: 800,
        rootFontSize: '16px',
      })
    })

    it('handles absolute units correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            variant: 'auto',
            columnWidth: '1in',
            gap: 16,
          },
        }),
      )

      // Debug the actual result
      console.log('Actual result:', result.current)

      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(auto-fit, minmax(1in, 1fr))',
        columnsCount: 9,  // Updated to match actual calculation
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('calculates columns correctly for absolute units', () => {
      const containerWidth = 1000
      const gapWidth = 16
      const inchInPixels = 96 // 1in = 96px

      // Using the same formula as calculateFlatGrid
      const expectedColumns = Math.floor(
        (containerWidth + gapWidth) / (inchInPixels + gapWidth),
      )

      // Debug the calculation
      console.log('Column calculation:', {
        containerWidth,
        gapWidth,
        inchInPixels,
        formula: `(${containerWidth} + ${gapWidth}) / (${inchInPixels} + ${gapWidth})`,
        result: (containerWidth + gapWidth) / (inchInPixels + gapWidth),
        rounded: Math.floor((containerWidth + gapWidth) / (inchInPixels + gapWidth)),
      })

      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth,
          config: {
            variant: 'auto',
            columnWidth: '1in',
            gap: gapWidth,
          },
        }),
      )

      expect(result.current.columnsCount).toBe(9) // Updated to match actual calculation
      expect(expectedColumns).toBe(9) // Updated expectation

      // Let's verify the math:
      // (1000 + 16) / (96 + 16) = 1016 / 112 ≈ 9.07...
      // Math.floor(9.07...) = 9
    })
  })

})