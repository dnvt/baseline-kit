import { renderHook } from '@testing-library/react'
import { useGridCalculations } from '@hooks'

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

      // For line variant:
      // - gap becomes 8px (not 7px as previously thought)
      // - columns = Math.floor(100 / (8 + 1)) + 1 = 12
      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(12, 1px)',
        columnsCount: 12,
        calculatedGap: '8px',
        isValid: true,
      })
    })
  })

  describe('Pattern Variant', () => {
    it('handles fr units correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
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

    it('handles mixed units correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            columns: ['100px', '1fr', '20%'],
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: '100px 1fr 20%',
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
            columns: 12,
            columnWidth: '80px',
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
    it('calculates auto columns based on container width', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            columnWidth: '200px',
            gap: 16,
          },
        }),
      )

      // (1000 + 16) / (200 + 16) = 4.69, rounded down to 4
      expect(result.current).toEqual({
        gridTemplateColumns: 'repeat(4, 200px)',
        columnsCount: 4,
        calculatedGap: '16px',
        isValid: true,
      })
    })

    it('handles auto width correctly', () => {
      const { result } = renderHook(() =>
        useGridCalculations({
          containerWidth: 1000,
          config: {
            columnWidth: 'auto',
            gap: 16,
          },
        }),
      )

      expect(result.current).toEqual({
        gridTemplateColumns: 'auto',
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
})