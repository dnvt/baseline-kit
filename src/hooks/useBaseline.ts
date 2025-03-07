import * as React from 'react'
import { useMeasure } from './useMeasure'
import { calculateSnappedSpacing } from '@utils'
import type { SnappingMode, Padding } from '@components'
import { parsePadding } from '@utils'

export interface BaselineOptions {
  /* Base unit for alignment (default 8). */
  base?: number
  /** Snapping strategy: 'none' | 'height' | 'clamp'. */
  snapping?: SnappingMode
  /** Initial padding config.  e.g. { top: 10, bottom: 20 } or just 8, etc. */
  spacing?: Partial<Padding> | number
  /** Whether to warn in the console if the measured height is not a multiple of base. */
  warnOnMisalignment?: boolean
}

export interface BaselineResult {
  padding: Padding
  isAligned: boolean
  height: number
}

/**
 *  Hook for managing baseline grid alignment in components.
 *
 *  @remarks
 *  This hook handles the complex calculations needed to maintain baseline grid
 *  alignment, including:
 *    ▪	Measuring element dimensions
 *    ▪	Calculating padding adjustments
 *    ▪	Potentially snapping values to ensure multiples of the base
 *    ▪	Warning about misalignments in development
 *
 *  Different snapping modes affect how spacing is adjusted:
 *    ▪	'none': Uses raw spacing values without adjustment
 *    ▪	'height': Adjusts only the final (bottom) padding to align
 *    ▪	'clamp': Adjusts top and bottom to align
 *
 *  @param ref Reference to the DOM element
 *  @param options Configuration options for alignment behavior
 *  @returns Object with adjusted padding, alignment status, and height
 *
 * @example
 * ```tsx
 * export function MyComponent() {
 *   const ref = useRef<HTMLDivElement>(null)
 *   const { padding } = useBaseline(ref, {
 *     base: 8,
 *     snapping: 'height',
 *     spacing: {
 *       top: 16,
 *       bottom: 16
 *     }
 *    }}
 *  >
 *    Content
 *  </div>
 *  )
 *  }
 */
export function useBaseline(
  ref: React.RefObject<HTMLElement | null>,
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
  // Track whether we've already snapped once for this component.
  const didSnapRef = React.useRef<boolean>(false)
  const hasWarnedRef = React.useRef<boolean>(false)

  return React.useMemo(() => {
    // Convert the spacing prop into { top, right, bottom, left } numeric values.
    const initialPadding = parsePadding({ padding: spacing })
    const isAligned = height % base === 0

    // Log the warning only once
    if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
      if (!hasWarnedRef.current) {
        console.warn(
          `[useBaseline] Element height (${height}px) is not aligned with base (${base}px).`,
        )
        hasWarnedRef.current = true // Mark warning as logged
      }
    }

    // If snapping is disabled, just return the original padding.
    if (snapping === 'none') {
      return { padding: initialPadding, isAligned, height }
    }

    // If we've already snapped once, just reuse the original (or store the
    // snapped result in a ref if you prefer).
    if (didSnapRef.current) {
      return { padding: initialPadding, isAligned, height }
    }

    // Snap exactly once.
    const finalPadding = calculateSnappedSpacing(height, base, initialPadding, snapping)
    didSnapRef.current = true

    return { padding: finalPadding, isAligned, height }
  }, [base, snapping, spacing, warnOnMisalignment, height])
}
