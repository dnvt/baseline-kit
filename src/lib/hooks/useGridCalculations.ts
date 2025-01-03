import { useMemo, useCallback } from 'react'
import { X_GRID as CONFIG } from '@config'
import {
  ABSOLUTE_UNITS, AutoGridConfig,
  GridColumnsPattern,
  GridConfig, RELATIVE_UNITS,
  UseGridCalculationsProps,
  UseGridCalculationsResult,
} from '@types'
import {
  isLineVariant,
  isPatternVariant,
  isAutoVariant,
  isFixedVariant,
} from '@types'
import {
  isValidGridPattern,
  MeasurementSystem,
  parseCSSValue,
  convertToPixels,
  formatCSSValue,
} from '@utils'

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
   * Calculates layout for line variant (single pixel columns).
   * Uses container width and gap to determine optimal number of 1px columns.
   */
  const calculateLineVariant = useCallback(
    (config: GridConfig & { variant: 'line' }, width: number): UseGridCalculationsResult => {
      const numericGap = MeasurementSystem.normalize(config.gap ?? DEFAULT_GAP, {
        unit: config.baseUnit,
        suppressWarnings: true,
      })
      const adjustedGap = numericGap - 1
      const columns = Math.max(1, Math.floor(width / (adjustedGap + 1)) + 1)

      return {
        gridTemplateColumns: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: `${adjustedGap}px`,
        isValid: true,
      }
    },
    [],
  )

  /**
   * Handles custom column patterns with mixed units.
   * @todo Consider expanding support for additional CSS units (em, rem, vh, vw, etc.)
   * Currently only supports: px, fr, auto, and numeric values
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
        calculatedGap: parseCSSValue(config.gap ?? DEFAULT_GAP),
        isValid,
      }
    },
    [],
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
      calculatedGap: parseCSSValue(config.gap ?? DEFAULT_GAP),
      isValid: true,
    }),
    [],
  )

  /**
   * Calculates auto-grid layout based on container width and column width.
   * Supports:
   * - Numbers (converted to pixels)
   * - Pixel values (e.g., "100px")
   * - Auto keyword
   * - Other CSS units (em, rem, etc.)
   */
  const calculateFlatGrid = useCallback(
    (config: AutoGridConfig, width: number): UseGridCalculationsResult => {
      const gap = formatCSSValue(config.gap ?? DEFAULT_GAP)
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
      if (typeof columnWidthStr === 'string') {
        // Handle fr units
        if (columnWidthStr.endsWith('fr')) {
          return {
            gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
            columnsCount: 1,
            calculatedGap: gap,
            isValid: true,
          }
        }

        // Handle absolute units
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

        // Handle relative units
        if (RELATIVE_UNITS.some(unit => columnWidthStr.endsWith(unit))) {
          return {
            gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidthStr}, 1fr))`,
            columnsCount: 1,
            calculatedGap: gap,
            isValid: true,
          }
        }
      }

      // Fallback for invalid values
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
        isValid: false,
      }
    },
    [],
  )


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
      if (isLineVariant(config)) return calculateLineVariant(config, containerWidth)
      if (isPatternVariant(config)) return calculateColumnPattern(config)
      if (isFixedVariant(config)) return calculateFixedColumns(config)
      if (isAutoVariant(config)) return calculateFlatGrid(config, containerWidth)

      // Fallback to default grid configuration
      return {
        gridTemplateColumns: `repeat(${CONFIG.columns}, 1fr)`,
        columnsCount: CONFIG.columns,
        calculatedGap: `${CONFIG.gap}px`,
        isValid: true,
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
  }, [containerWidth, config, calculateLineVariant, calculateColumnPattern, calculateFixedColumns, calculateFlatGrid])
}