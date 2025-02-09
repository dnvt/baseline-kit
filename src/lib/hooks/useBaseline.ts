/**
 * @file useBaseline Hook
 * @description Manages baseline grid alignment calculations
 * @module hooks
 */

import { useMemo, RefObject } from 'react'
import { SnappingMode, Padding } from '@components'
import { calculateSnappedSpacing } from '@utils'
import { useMeasure } from './useMeasure'

export interface BaselineOptions {
  /** Base unit for alignment calculations (default: 8) */
  base?: number;
  /** Alignment strategy to apply (default: 'none') */
  snapping?: SnappingMode;
  /** Initial spacing configuration */
  spacing?: Partial<Padding> | number;
  /** Enable console warnings for misalignments */
  warnOnMisalignment?: boolean;
}

export interface BaselineResult {
  /** Final adjusted padding values */
  padding: Padding;
  /** Whether the measured height is a multiple of base */
  isAligned: boolean;
  /** Raw measured height in pixels */
  height: number;
}

/**
 * Hook for managing baseline grid alignment in components.
 *
 * @remarks
 * This hook handles the complex calculations needed to maintain baseline grid
 * alignment, including:
 * - Measuring element dimensions
 * - Calculating padding adjustments
 * - Snapping values to the grid
 * - Warning about misalignments
 *
 * Different snapping modes affect how spacing is adjusted:
 * - 'none': Uses raw spacing values without adjustment
 * - 'height': Adjusts only the final height to align
 * - 'clamp': Adjusts both height and spacing values
 *
 * @param ref - Reference to the DOM element to measure
 * @param options - Configuration options for alignment behavior
 * @returns Object containing adjusted padding, alignment status, and height
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { padding, isAligned } = useBaseline(ref, {
 *     base: 8,
 *     snapping: 'height',
 *     spacing: { top: 10, bottom: 20 }
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       style={{
 *         paddingTop: padding.top,
 *         paddingBottom: padding.bottom
 *       }}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {Error} if base is less than 1
 */
export function useBaseline(
  ref: RefObject<HTMLElement | null>,
  {
    base = 8,
    snapping = 'none',
    spacing = {},
    warnOnMisalignment = false,
  }: BaselineOptions = {},
): BaselineResult {
  if (base < 1) {
    throw new Error('Base must be >= 1 for baseline alignment.')
  }

  const { height } = useMeasure(ref)

  return useMemo(() => {
    // Normalize spacing input to object form
    const pad: Padding =
      typeof spacing === 'number'
        ? { top: spacing, right: spacing, bottom: spacing, left: spacing }
        : {
          top: spacing.top ?? 0,
          right: spacing.right ?? 0,
          bottom: spacing.bottom ?? 0,
          left: spacing.left ?? 0,
        }

    // Check baseline alignment
    const isAligned = height % base === 0

    // Handle non-snapping case
    if (snapping === 'none') {
      if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
        console.warn(`Element height (${height}px) is not a multiple of base (${base}px).`)
      }
      return { padding: pad, isAligned, height }
    }

    // Calculate adjusted padding for height/clamp modes
    const finalPadding =
      (snapping === 'height' || snapping === 'clamp')
        ? calculateSnappedSpacing(height, base, pad, snapping)
        : pad

    if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
      console.warn(`[useBaseline] Element height (${height}px) is not aligned with base (${base}px).`)
    }

    return { padding: finalPadding, isAligned, height }
  }, [base, snapping, spacing, height, warnOnMisalignment])
}