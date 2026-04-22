import type { GuideConfig, GuideColumnsPattern } from '../types'
import { isValidGuidePattern } from '../validation/guide'
import { normalizeValue } from './normalize'
import { formatValue } from './parse'
import { convertValue, type ConversionContext } from './convert'

export interface GuideResult {
  template: string
  columnsCount: number
  calculatedGap: number
  isValid: boolean
}

const INVALID_RESULT: GuideResult = {
  template: 'none',
  columnsCount: 0,
  calculatedGap: 0,
  isValid: false,
}

/**
 * Pure calculation of grid template from container width and guide config.
 * Framework-agnostic — can be used outside React.
 */
export function calculateGuideTemplate(
  width: number,
  config: GuideConfig,
  context?: ConversionContext
): GuideResult {
  const variant = config.variant ?? 'line'
  const base = config.base ?? 8
  const gap = normalizeValue(config.gap ?? 0, { base, context })

  if (!width) return INVALID_RESULT

  switch (variant) {
    case 'line': {
      const finalGap = gap === 0 ? 0 : gap - 1
      const actualGapWithLine = finalGap + 1

      const columns =
        finalGap === 0
          ? Math.max(1, Math.floor(width) + 1)
          : Math.max(1, Math.floor((width + 1) / actualGapWithLine) + 1)

      return {
        template: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: gap > 0 ? gap - 1 : gap,
        isValid: true,
      }
    }

    case 'pattern': {
      if (!config.columns || !Array.isArray(config.columns)) {
        return INVALID_RESULT
      }

      if (!isValidGuidePattern(config.columns)) {
        return INVALID_RESULT
      }

      const columnsArr = (config.columns as GuideColumnsPattern).map((col) =>
        typeof col === 'number' ? `${col}px` : col
      )

      if (columnsArr.some((c) => c === '0' || c === '0px')) {
        return INVALID_RESULT
      }

      return {
        template: columnsArr.join(' '),
        columnsCount: columnsArr.length,
        calculatedGap: gap,
        isValid: true,
      }
    }

    case 'fixed': {
      const colCount = typeof config.columns === 'number' ? config.columns : 0
      if (colCount < 1) return INVALID_RESULT

      const colWidth = config.columnWidth
        ? formatValue(config.columnWidth)
        : '1fr'

      return {
        template: `repeat(${colCount}, ${colWidth})`,
        columnsCount: colCount,
        calculatedGap: gap,
        isValid: true,
      }
    }

    case 'auto': {
      const colWidth = config.columnWidth ?? 'auto'
      if (colWidth === 'auto') {
        return {
          template: 'repeat(auto-fill, minmax(0, 1fr))',
          columnsCount: 1,
          calculatedGap: gap,
          isValid: true,
        }
      }

      const colWidthStr =
        typeof colWidth === 'number' ? `${colWidth}px` : colWidth.toString()
      const pxVal = convertValue(colWidthStr, context) ?? 0
      const columns =
        pxVal > 0 ? Math.max(1, Math.floor((width + gap) / (pxVal + gap))) : 1

      return {
        template: `repeat(auto-fill, ${colWidthStr})`,
        columnsCount: columns,
        calculatedGap: gap,
        isValid: true,
      }
    }

    default: {
      const columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)
      return {
        template: `repeat(${columns}, 1px)`,
        columnsCount: columns,
        calculatedGap: gap,
        isValid: true,
      }
    }
  }
}

export const createGridSpanStyles = (
  span?: number,
  colSpan?: number,
  rowSpan?: number
): Record<string, string> => {
  const gridStyles: Record<string, string> = {}

  if (span !== undefined) {
    gridStyles.gridColumn = `span ${span}`
    gridStyles.gridRow = `span ${span}`
  } else {
    if (colSpan !== undefined) {
      gridStyles.gridColumn = `span ${colSpan}`
    }
    if (rowSpan !== undefined) {
      gridStyles.gridRow = `span ${rowSpan}`
    }
  }

  return gridStyles
}
