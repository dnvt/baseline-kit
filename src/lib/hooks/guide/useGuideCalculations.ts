import { useMemo, useCallback } from 'react'
import { AutoConfig, GuideColumnsPattern, GuideConfig, LineConfig } from '@components'
import {
  isValidGuidePattern,
  parseCSSValue,
  convertToPixels,
  formatCSSValue,
  ABSOLUTE_UNITS,
  RELATIVE_UNITS,
} from '@utils'
import { useConfig } from '@hooks'

type Props = {
  containerWidth: number
  config: GuideConfig
}

type Result = {
  gridTemplateColumns: string
  columnsCount: number
  calculatedGap: string
  isValid: boolean
}

/**
 * Hook for calculating grid layout dimensions and properties.
 * Handles different grid variants (line, pattern, fixed, auto) and their specific calculations.
 *
 * @param containerWidth - The width of the grid container.
 * @param config - The configuration object for the grid.
 * @returns An object containing grid layout properties such as `gridTemplateColumns`, `columnsCount`, and `calculatedGap`.
 */
export function useGuideCalculations({
  containerWidth,
  config,
}: Props): Result {
  const { base } = useConfig('guide')

  // Helper Functions ----------------------------------------------------------

  /**
   * Calculates layout for line variant (single pixel columns).
   * Uses container width and gap to determine optimal number of 1px columns.
   */

  const calculateLineVariant = useMemo(() =>
    (config: LineConfig, width: number): Result => {
      const columns = Math.max(1, Math.floor(width / ((config.gap ?? 8) + 1)) + 1)

      return {
        gridTemplateColumns: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: `${config.gap}px`,
        isValid: true,
      }
    },
  [])

  /**
   * Handles custom column patterns with mixed units.
   * Currently supports: px, fr, %, em, rem, and auto.
   */
  const calculateColumnPattern = useMemo(() =>
    (config: GuideConfig & { columns: GuideColumnsPattern }): Result => {
      if (!isValidGuidePattern(config.columns)) {
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
        calculatedGap: `${config.gap}px`,
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
    (config: GuideConfig & { columns: number }): Result => ({
      gridTemplateColumns: `repeat(${config.columns}, ${
        config.columnWidth ? parseCSSValue(config.columnWidth) : '1fr'
      })`,
      columnsCount: config.columns,
      calculatedGap: `${config.gap}px`, // Gap already in pixels
      isValid: true,
    }),
    [],
  )

  /**
   * Calculates auto-grid layout based on container width and column width.
   */
  const calculateAutoGuide = useCallback(
    (config: AutoConfig, width: number): Result => {
      const gap = formatCSSValue(config.gap ?? base)
      const columnWidth = config.columnWidth
      const numericGap = parseInt(gap)

      // Handle special cases
      if (columnWidth === 'auto') {
        return {
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          columnsCount: 1,
          calculatedGap: `${numericGap}px`,
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
        calculatedGap: 1,
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
        return calculateAutoGuide(config, containerWidth)
      default: {
        // Fallback to line variant with theme defaults
        const defaultConfig: LineConfig = {
          variant: 'line',
          base: base,
          gap: 8,
        }
        return calculateLineVariant(defaultConfig, containerWidth)
      }
      }
    } catch (error) {
      console.warn('Error calculating grid layout:', error)
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: 8,
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
    calculateAutoGuide,
  ])
}