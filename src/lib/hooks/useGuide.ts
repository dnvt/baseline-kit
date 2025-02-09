/**
 * @file useGuide Hook
 * @description Manages grid layout calculations for guide overlays
 * @module hooks
 */

import { useMemo, RefObject } from 'react'
import { GuideConfig, GuideColumnsPattern, isValidGuidePattern } from '@components'
import { formatValue, convertValue } from '@utils'
import { useMeasure } from './useMeasure'

export interface GuideResult {
  /** CSS grid template string */
  template: string;
  /** Total number of columns */
  columnsCount: number;
  /** Final gap size in pixels */
  calculatedGap: number;
  /** Whether the configuration is valid */
  isValid: boolean;
}

/**
 * Hook for calculating grid layout parameters based on container dimensions.
 *
 * @remarks
 * This hook handles complex grid calculations for different layout variants:
 * - 'line': Evenly spaced vertical lines
 * - 'pattern': Custom repeating column patterns
 * - 'fixed': Set number of columns with optional width
 * - 'auto': Dynamic columns based on available space
 *
 * Key features:
 * - Responsive grid calculations
 * - Pattern validation
 * - Gap management
 * - Error handling
 *
 * @param ref - Reference to container element
 * @param config - Grid configuration object
 * @returns Grid calculation results
 *
 * @example
 * ```tsx
 * function GridOverlay() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { template, columnsCount } = useGuide(ref, {
 *     variant: 'fixed',
 *     columns: 12,
 *     gap: 16,
 *     base: 8
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       style={{
 *         display: 'grid',
 *         gridTemplateColumns: template,
 *         gap: calculatedGap
 *       }}
 *     >
 *       {Array(columnsCount).fill(null).map((_, i) => (
 *         <div key={i} className="grid-line" />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGuide(
  ref: RefObject<HTMLElement | null>,
  config: GuideConfig,
): GuideResult {
  const { width } = useMeasure(ref)

  return useMemo(() => {
    // Default values
    const variant = config.variant ?? 'line'
    const base = config.base ?? 8
    const gap = config.gap ?? base

    // Return invalid result if no width
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
        // Simple vertical lines
        const columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)
        return {
          template: `repeat(${columns}, 1px)`,
          columnsCount: columns,
          calculatedGap: gap,
          isValid: true,
        }
      }

      case 'pattern': {
        // Custom column pattern
        if (!isValidGuidePattern(config.columns)) {
          throw new Error('Invalid "pattern" columns array')
        }
        const columnsArr = (config.columns as GuideColumnsPattern).map(col => {
          if (typeof col === 'number') return `${col}px`
          return col
        })

        // Validate no zero widths
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
        // Fixed number of columns
        const colCount = typeof config.columns === 'number' ? config.columns : 0
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
        // Auto-fitting columns
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

        const pxVal = convertValue(colWidthStr) ?? 0
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
        // Fallback to line variant
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