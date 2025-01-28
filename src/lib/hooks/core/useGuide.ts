import { useMemo, RefObject } from 'react'
import { useMeasurement } from './useMeasurement'
import type { GuideConfig, GuideColumnsPattern } from '@components'
import {
  isValidGuidePattern,
  parseCSSValue,
  convertToPixels,
} from '@utils'

/**
 * The result of a guide calculation.
 */
export interface GuideResult {
  template: string;          // e.g. "repeat(12, 1px)" or "1fr 2fr auto"
  columnsCount: number;      // number of columns we derived
  calculatedGap: number;     // the gap used (in px)
  isValid: boolean;          // whether the config was valid
}

/**
 * Hook for calculating grid layouts (line/pattern/fixed/auto)
 * based on measured container width (from `useMeasurement`).
 */
export function useGuide(
  ref: RefObject<HTMLElement>,
  config: GuideConfig,
): GuideResult {
  const { width } = useMeasurement(ref)

  return useMemo(() => {
    // Defaults
    const variant = config.variant ?? 'line'
    const base = config.base ?? 8
    const gap = config.gap ?? base

    // If width=0 => not valid
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
        // line => columns of 1px repeated
        // columns = floor(width / (gap+1))+1
        const columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)
        return {
          template: `repeat(${columns}, 1px)`,
          columnsCount: columns,
          calculatedGap: gap,
          isValid: true,
        }
      }

      case 'pattern': {
        if (!isValidGuidePattern(config.columns)) {
          throw new Error('Invalid "pattern" columns array')
        }
        const columnsArr = (config.columns as GuideColumnsPattern).map(col => {
          if (typeof col === 'number') return `${col}px`
          return col
        })

        // Validate none is '0' or invalid
        if (columnsArr.some(c => c === '0' || c === '0px')) {
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
        const colCount = config.columns ?? 0
        if (colCount < 1) {
          throw new Error(`Invalid columns count: ${colCount}`)
        }
        const colWidth = config.columnWidth
          ? parseCSSValue(config.columnWidth)
          : '1fr'

        return {
          template: `repeat(${colCount}, ${colWidth})`,
          columnsCount: colCount,
          calculatedGap: gap,
          isValid: true,
        }
      }

      case 'auto': {
        // e.g. auto-fitting columns of a given colWidth, with fallback
        const colWidth = config.columnWidth ?? 'auto'
        if (colWidth === 'auto') {
          return {
            template: 'repeat(auto-fit, minmax(0, 1fr))',
            columnsCount: 1,
            calculatedGap: gap,
            isValid: true,
          }
        }
        const colWidthStr =
          typeof colWidth === 'number' ? `${colWidth}px` : colWidth.toString()

        const pxVal = convertToPixels(colWidthStr) ?? 0
        const columns = pxVal > 0
          ? Math.max(1, Math.floor((width + gap) / (pxVal + gap)))
          : 1

        return {
          template: `repeat(auto-fit, minmax(${colWidthStr}, 1fr))`,
          columnsCount: columns,
          calculatedGap: gap,
          isValid: true,
        }
      }

      default: {
        // If unknown variant => fallback to 'line'
        console.warn(
          `[useGuide] Unknown variant "${variant}". Falling back to "line".`,
        )
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