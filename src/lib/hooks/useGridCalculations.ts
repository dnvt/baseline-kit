import { useMemo, useCallback } from 'react'
import type {
  CSSValue,
  GridColumnsPattern,
  GridConfig,
  UseGridCalculationsProps,
  UseGridCalculationsResult,
} from '@types'
import {
  isLineVariant,
  isPatternVariant,
  isAutoVariant,
  isFixedVariant,
} from '@types'
import { isValidGridPattern } from '@utils'
import { X_GRID as CONFIG } from '@config'

const DEFAULT_GAP = 8

/**
 * Hook for calculating grid layout dimensions and properties.
 * Handles different grid variants (line, pattern, fixed, auto) and their specific calculations.
 */
export function useGridCalculations({
  containerWidth,
  config,
}: UseGridCalculationsProps): UseGridCalculationsResult {
  /**
   * Unified parser for CSS values that handles both direct values and defaults.
   * Consolidates gap and column width parsing to ensure consistent CSS value generation.
   */
  const parseCSSValue = useCallback((value: CSSValue | undefined, defaultValue?: number): string => {
    if (!value && defaultValue !== undefined) return `${defaultValue}px`
    return typeof value === 'number' ? `${value}px` : value || '0'
  }, [])

  /**
   * Calculates layout for line variant (single pixel columns).
   * Uses container width and gap to determine optimal number of 1px columns.
   */
  const calculateLineVariant = useCallback(
    (config: GridConfig & { variant: 'line' }, width: number): UseGridCalculationsResult => {
      const gap = parseCSSValue(config.gap, DEFAULT_GAP)
      // Add 1 to ensure we cover the entire width with columns
      const numericGap = parseInt(gap, 10)
      const columns = Math.max(1, Math.floor(width / (numericGap + 1)) + 1)

      return {
        gridTemplateColumns: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: gap,
        isValid: true,
      }
    },
    [parseCSSValue],
  )

  /**
   * Handles custom column patterns with mixed units (px, fr, etc.).
   * Preserves fr units while converting other values to appropriate CSS.
   */
  const calculateColumnPattern = useCallback(
    (config: GridConfig & { columns: GridColumnsPattern }): UseGridCalculationsResult => {
      if (!isValidGridPattern(config.columns)) {
        throw new Error('Invalid grid column pattern')
      }

      const columns = config.columns.map(col => {
        // Preserve fr units and other valid CSS values
        if (typeof col === 'string') return /^\d+fr$/.test(col) ? col : col
        return parseCSSValue(col)
      })

      return {
        gridTemplateColumns: columns.join(' '),
        columnsCount: columns.length,
        calculatedGap: parseCSSValue(config.gap, DEFAULT_GAP),
        isValid: columns.every(Boolean),
      }
    },
    [parseCSSValue],
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
      calculatedGap: parseCSSValue(config.gap, DEFAULT_GAP),
      isValid: true,
    }),
    [parseCSSValue],
  )

  /**
   * Calculates auto-grid layout based on container width and column width.
   * Handles special cases like 'auto' width and non-numeric values.
   */
  const calculateAutoGrid = useCallback(
    (config: GridConfig & { columnWidth: CSSValue }, width: number): UseGridCalculationsResult => {
      const gap = parseCSSValue(config.gap, DEFAULT_GAP)
      const columnWidth = parseCSSValue(config.columnWidth)

      // Handle special 'auto' case
      if (columnWidth === 'auto') {
        return {
          gridTemplateColumns: 'auto',
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      // Handle non-numeric values (like percentages or other units)
      const numericGap = parseInt(gap, 10)
      const numericWidth = parseInt(columnWidth, 10)

      if (isNaN(numericWidth)) {
        return {
          gridTemplateColumns: columnWidth,
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      // Calculate maximum number of columns that fit in the container
      const columns = Math.max(1, Math.floor((width + numericGap) / (numericWidth + numericGap)))

      return {
        gridTemplateColumns: `repeat(${columns}, ${columnWidth})`,
        columnsCount: columns,
        calculatedGap: gap,
        isValid: true,
      }
    },
    [parseCSSValue],
  )

  /**
   * Memoized final calculation that determines which variant to use
   * and handles error cases with fallback values.
   */
  return useMemo(() => {
    // Early return if container width is not available
    if (!containerWidth) {
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    }

    try {
      // Determine grid variant and calculate appropriate layout
      if (isLineVariant(config)) return calculateLineVariant(config, containerWidth)
      if (isPatternVariant(config)) return calculateColumnPattern(config)
      if (isFixedVariant(config)) return calculateFixedColumns(config)
      if (isAutoVariant(config)) return calculateAutoGrid(config, containerWidth)

      // Fallback to default grid configuration
      return {
        gridTemplateColumns: `repeat(${CONFIG.columns}, 1fr)`,
        columnsCount: CONFIG.columns,
        calculatedGap: `${CONFIG.gap}px`,
        isValid: true,
      }
    } catch (error) {
      console.error('Error calculating grid layout:', error)
      // Return safe fallback values on error
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    }
  }, [containerWidth, config, calculateLineVariant, calculateColumnPattern, calculateFixedColumns, calculateAutoGrid])
}
