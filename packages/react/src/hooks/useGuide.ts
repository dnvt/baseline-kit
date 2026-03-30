import * as React from 'react'
import type { GuideConfig, GuideColumnsPattern } from '@baseline-kit/core'
import { isValidGuidePattern, normalizeValue, formatValue, convertValue } from '@baseline-kit/core'
import { useMeasure } from './useMeasure'

export interface GuideResult {
  template: string
  columnsCount: number
  calculatedGap: number
  isValid: boolean
}

/**
 * Hook for calculating grid layout parameters based on container dimensions.
 */
export function useGuide(
  ref: React.RefObject<HTMLElement | null>,
  config: GuideConfig
): GuideResult {
  const { width } = useMeasure(ref)
  const hasWarnedRef = React.useRef<boolean>(false)

  return React.useMemo(() => {
    const variant = config.variant ?? 'line'
    const base = config.base ?? 8
    const gap = normalizeValue(config.gap ?? 0, { base })

    if (!width) {
      return {
        template: 'none',
        columnsCount: 0,
        calculatedGap: 0,
        isValid: false,
      }
    }

    try {
      switch (variant) {
        case 'line': {
          const finalGap = gap === 0 ? 0 : gap - 1
          const actualGapWithLine = finalGap + 1

          let columns: number

          if (finalGap === 0) {
            columns = Math.max(1, Math.floor(width) + 1)
          } else {
            columns = Math.max(
              1,
              Math.floor((width + 1) / actualGapWithLine) + 1
            )
          }

          return {
            template: `repeat(${columns}, 1px)`,
            columnsCount: columns,
            calculatedGap: gap > 0 ? gap - 1 : gap,
            isValid: true,
          }
        }

        case 'pattern': {
          if (!config.columns || !Array.isArray(config.columns)) {
            throw new Error('Missing or invalid pattern columns')
          }

          if (!isValidGuidePattern(config.columns)) {
            throw new Error('Invalid "pattern" columns array')
          }

          const columnsArr = (config.columns as GuideColumnsPattern).map(
            (col) => {
              if (typeof col === 'number') return `${col}px`
              return col
            }
          )

          if (columnsArr.some((c) => c === '0' || c === '0px')) {
            return {
              template: 'none',
              columnsCount: 0,
              calculatedGap: 0,
              isValid: false,
            }
          }

          return {
            template: columnsArr.join(' '),
            columnsCount: columnsArr.length,
            calculatedGap: gap,
            isValid: true,
          }
        }

        case 'fixed': {
          const colCount =
            typeof config.columns === 'number' ? config.columns : 0
          if (colCount < 1) {
            throw new Error(`Invalid columns count: ${colCount}`)
          }
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

          const pxVal = convertValue(colWidthStr) ?? 0
          const columns =
            pxVal > 0
              ? Math.max(1, Math.floor((width + gap) / (pxVal + gap)))
              : 1

          return {
            template: `repeat(auto-fill, ${colWidthStr})`,
            columnsCount: columns,
            calculatedGap: gap,
            isValid: true,
          }
        }

        default: {
          if (!hasWarnedRef.current) {
            console.warn(
              `[useGuide] Unknown variant "${variant}". Falling back to "line".`
            )
            hasWarnedRef.current = true
          }
          const columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)
          return {
            template: `repeat(${columns}, 1px)`,
            columnsCount: columns,
            calculatedGap: gap,
            isValid: true,
          }
        }
      }
    } catch (error) {
      console.warn('Error in useGuide:', error)
      return {
        template: 'none',
        columnsCount: 0,
        calculatedGap: 0,
        isValid: false,
      }
    }
  }, [config, width])
}
