import { useMemo, useCallback } from 'react'
import type {
  CSSValue,
  ResponsiveValue,
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
import {

  parseResponsiveGridValue,
  GRID,
  isResponsiveValue,
  isValidGridPattern,
} from '@utils'

export function useGridCalculations
({
  containerWidth,
  config,
}: UseGridCalculationsProps): UseGridCalculationsResult {
  const parseGapValue = useCallback((
    gap: ResponsiveValue<CSSValue | 'auto'> | undefined,
    defaultValue: number = config.baseUnit || 8,
  ): string => {
    if (!gap) return `${defaultValue}px`
    if (gap === 'auto') return 'auto'
    return parseResponsiveGridValue(gap)
  }, [config.baseUnit])

  const parseColumnWidth = useCallback((
    width: ResponsiveValue<CSSValue | 'auto'>,
  ): string => {
    if (width === 'auto') return 'auto'
    return parseResponsiveGridValue(width)
  }, [])

  const calculateLineVariant = useCallback((
    gridConfig: GridConfig & { variant: 'line' },
    width: number,
  ): UseGridCalculationsResult => {
    const gap = parseGapValue(gridConfig.gap)
    const numericGap = parseInt(gap, 10)
    const columns = Math.max(1, Math.floor(width / (numericGap + 1)) + 1)

    return {
      gridTemplateColumns: `repeat(${columns}, 1px)`,
      columnsCount: columns,
      calculatedGap: gap,
      isValid: true,
    }
  }, [parseGapValue])

  const calculateColumnPattern = useCallback((
    gridConfig: GridConfig & { columns: GridColumnsPattern },
  ): UseGridCalculationsResult => {
    if (!isValidGridPattern(gridConfig.columns)) {
      throw new Error('Invalid grid column pattern')
    }

    const columns = gridConfig.columns.map(col => {
      if (typeof col === 'string') {
        if (/^\d+fr$/.test(col)) return col
        return col
      }
      if (isResponsiveValue(col)) {
        return parseResponsiveGridValue(col)
      }
      return parseResponsiveGridValue(String(col))
    })
    const gap = parseGapValue(gridConfig.gap)

    return {
      gridTemplateColumns: columns.join(' '),
      columnsCount: columns.length,
      calculatedGap: gap,
      isValid: columns.every(Boolean),
    }
  }, [parseGapValue])

  const calculateFixedColumns = useCallback((
    gridConfig: GridConfig & { columns: number },
  ): UseGridCalculationsResult => {
    const gap = parseGapValue(gridConfig.gap)
    const columnWidth = gridConfig.columnWidth
      ? parseColumnWidth(gridConfig.columnWidth)
      : '1fr'

    return {
      gridTemplateColumns: `repeat(${gridConfig.columns}, ${columnWidth})`,
      columnsCount: gridConfig.columns,
      calculatedGap: gap,
      isValid: true,
    }
  }, [parseGapValue, parseColumnWidth])


  const calculateAutoGrid = useCallback((
    gridConfig: GridConfig & { columnWidth: ResponsiveValue<CSSValue | 'auto'> },
    width: number,
  ): UseGridCalculationsResult => {
    const gap = parseGapValue(gridConfig.gap)
    const columnWidth = parseColumnWidth(gridConfig.columnWidth)

    if (columnWidth === 'auto') {
      return {
        gridTemplateColumns: 'auto',
        columnsCount: 1,
        calculatedGap: gap,
        isValid: true,
      }
    }

    const numericGap = gap === 'auto' ? 0 : parseInt(gap, 10)
    const numericWidth = parseInt(columnWidth, 10)

    if (isNaN(numericWidth)) {
      return {
        gridTemplateColumns: columnWidth,
        columnsCount: 1,
        calculatedGap: gap,
        isValid: true,
      }
    }

    const columns = Math.max(1, Math.floor(
      (width + numericGap) / (numericWidth + numericGap),
    ))

    return {
      gridTemplateColumns: `repeat(${columns}, ${columnWidth})`,
      columnsCount: columns,
      calculatedGap: gap,
      isValid: true,
    }
  }, [parseGapValue, parseColumnWidth])

  return useMemo(() => {
    try {
      if (!containerWidth) {
        return {
          gridTemplateColumns: 'none',
          columnsCount: 0,
          calculatedGap: '0px',
          isValid: false,
        }
      }

      if (isLineVariant(config)) {
        return calculateLineVariant(config, containerWidth)
      }

      if (isPatternVariant(config)) {
        return calculateColumnPattern(config)
      }

      if (isFixedVariant(config)) {
        return calculateFixedColumns(config)
      }

      if (isAutoVariant(config)) {
        return calculateAutoGrid(config, containerWidth)
      }

      return {
        gridTemplateColumns: `repeat(${GRID.DEFAULTS.COLUMNS}, 1fr)`,
        columnsCount: GRID.DEFAULTS.COLUMNS,
        calculatedGap: `${GRID.DEFAULTS.GAP}px`,
        isValid: true,
      }
    } catch (error) {
      console.error('Error calculating grid layout:', error)
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
    calculateLineVariant,
    calculateColumnPattern,
    calculateFixedColumns,
    calculateAutoGrid,
  ])
}