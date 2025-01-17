import { useMemo, useCallback } from 'react'
import {
  AutoGridConfig,
  GridColumnsPattern,
  GridConfig,
  UseGridCalculationsProps,
  UseGridCalculationsResult,
} from '@types'
import {
  isValidGridPattern,
  MeasurementSystem,
  parseCSSValue,
  convertToPixels,
  formatCSSValue,
  ABSOLUTE_UNITS,
  RELATIVE_UNITS,
} from '@utils'
import { useConfig } from '@components'
import { LineConfig } from '@/components/Guide/types'

/**
 * Hook for calculating grid layout dimensions and properties.
 * Handles different grid variants (line, pattern, fixed, auto) and their specific calculations.
 *
 * @param containerWidth - The width of the grid container.
 * @param config - The configuration object for the grid.
 * @returns An object containing grid layout properties such as `gridTemplateColumns`, `columnsCount`, and `calculatedGap`.
 */
export function useGridCalculations({
  containerWidth,
  config,
}: UseGridCalculationsProps): UseGridCalculationsResult {
  const { base } = useConfig('guide')

  // Helper Functions ----------------------------------------------------------

  /**
   * Calculates layout for line variant (single pixel columns).
   * Uses container width and gap to determine optimal number of 1px columns.
   */
  const calculateLineVariant = useCallback(
    (config: LineConfig, width: number): UseGridCalculationsResult => {
      const numericGap = MeasurementSystem.normalize(config.gap ?? base, {
        unit: config.base,
        suppressWarnings: true,
      })
      const adjustedGap = Math.max(0, numericGap - 1)
      const columns = Math.max(1, Math.floor(width / (adjustedGap + 1)) + 1)

      return {
        gridTemplateColumns: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: `${adjustedGap}px`,
        isValid: true,
      }
    },
    [base],
  )

  /**
   * Handles custom column patterns with mixed units.
   * Currently supports: px, fr, %, em, rem, and auto.
   */
  const calculateColumnPattern = useCallback(
    (config: GridConfig & { columns: GridColumnsPattern }): UseGridCalculationsResult => {
      if (!isValidGridPattern(config.columns)) {
        throw new Error('Invalid grid column pattern')
      }

      const columns = config.columns.map(col => {
        if (typeof col === 'number') return `${col}px`
        if (typeof col === 'string') {
          // Handle all valid CSS grid units including fr
          if (col === 'auto' || /^\d+(?:fr|px|%|em|rem)$/.test(col)) {
            return col
          }
          // Handle plain numbers with px
          if (/^\d+$/.test(col)) {
            return `${col}px`
          }
        }
        return '0'
      })

      const isValid = columns.every(col => col !== '0')

      return {
        gridTemplateColumns: columns.join(' '),
        columnsCount: columns.length,
        calculatedGap: parseCSSValue(config.gap ?? base),
        isValid,
      }
    },
    [base],
  )

  /**
   * Handles fixed-column layouts with equal column widths.
   * Uses 1fr as default column width if none specified for equal distribution.
   */
  const calculateFixedColumns = useCallback(
    (config: GridConfig & { columns: number }): UseGridCalculationsResult => ({
      gridTemplateColumns: `repeat(${config.columns}, ${
        config.columnWidth ? parseCSSValue(config.columnWidth) : '1fr'
      })`,
      columnsCount: config.columns,
      calculatedGap: parseCSSValue(config.gap ?? base),
      isValid: true,
    }),
    [base],
  )

  /**
   * Calculates auto-grid layout based on container width and column width.
   */
  const calculateAutoGrid = useCallback(
    (config: AutoGridConfig, width: number): UseGridCalculationsResult => {
      const gap = formatCSSValue(config.gap ?? base)
      const columnWidth = config.columnWidth
      const numericGap = parseInt(gap)

      // Handle special cases
      if (columnWidth === 'auto') {
        return {
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      // Convert to string if number
      const columnWidthStr = typeof columnWidth === 'number'
        ? `${columnWidth}px`
        : columnWidth as string

      // Handle different unit types
      if (columnWidthStr.endsWith('fr')) {
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }
      if (ABSOLUTE_UNITS.some(unit => columnWidthStr.endsWith(unit))) {
        const pixels = convertToPixels(columnWidthStr) ?? 0
        const columns = Math.max(1, Math.floor((width + numericGap) / (pixels + numericGap)))
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: columns,
          calculatedGap: gap,
          isValid: true,
        }
      }
      if (RELATIVE_UNITS.some(unit => columnWidthStr.endsWith(unit))) {
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    },
    [base],
  )

  // Main Hook Logic -----------------------------------------------------------

  return useMemo(() => {
    if (!containerWidth) {
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    }

    try {
      switch (config.variant) {
      case 'line':
        return calculateLineVariant(config, containerWidth)
      case 'pattern':
        return calculateColumnPattern(config)
      case 'fixed':
        return calculateFixedColumns(config)
      case 'auto':
        return calculateAutoGrid(config, containerWidth)
      default: {
        // Fallback to line variant with theme defaults
        const defaultConfig: LineConfig = {
          variant: 'line',
          base: base,
          gap: base,
        }
        return calculateLineVariant(defaultConfig, containerWidth)
      }
      }
    } catch (error) {
      console.warn('Error calculating grid layout:', error)
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    }
  }, [
    containerWidth,
    config,
    base,
    calculateLineVariant,
    calculateColumnPattern,
    calculateFixedColumns,
    calculateAutoGrid,
  ])
}