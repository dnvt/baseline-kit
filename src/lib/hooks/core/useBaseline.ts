import { RefObject, useMemo } from 'react'
import { useMeasurement } from './useMeasurement'
import { SnappingMode } from '@components'

interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BaselineOptions {
  /** The base multiple for alignment. Defaults to 8. */
  base?: number;
  /** The snapping strategy. Defaults to 'none'. */
  snapping?: SnappingMode;
  /** Initial spacing object. Defaults to 0 on all sides. */
  spacing?: Partial<Spacing>;
  /** Logs a warning in dev mode if the final height isn’t aligned. */
  warnOnMisalignment?: boolean;
}

interface BaselineResult {
  /** The final snapped/adjusted padding values for each side. */
  padding: Spacing;
  /** True if the measured height is currently a multiple of `base`. */
  isAligned: boolean;
  /** The raw measured height of the element (without any forced 2nd pass). */
  height: number;
}

/**
 * Hook for baseline grid alignment & snapping.
 * Uses `useMeasurement` to get the element’s height, then adjusts
 * the spacing (padding) according to the chosen snapping mode.
 */
export function useBaseline(
  ref: RefObject<HTMLElement>,
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

  // 1) measure element’s height
  const { height } = useMeasurement(ref)

  // 2) compute final spacing
  return useMemo(() => {
    const pad = {
      top: spacing.top ?? 0,
      right: spacing.right ?? 0,
      bottom: spacing.bottom ?? 0,
      left: spacing.left ?? 0,
    }

    // The immediate alignment of the measured height
    const isAligned = height % base === 0

    // If no snapping, we just return the original spacing
    if (snapping === 'none') {
      if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
        console.warn(
          `Element height (${height}px) is not multiple of base (${base}px).`,
        )
      }
      return { padding: pad, isAligned, height }
    }

    // If snapping is 'height', we only adjust bottom padding so the final container height
    // (original + additional) is a multiple of base.
    if (snapping === 'height') {
      const remainder = height % base
      if (remainder !== 0) {
        pad.bottom += base - remainder // add enough to make it aligned
      }
    }

    // If snapping is 'clamp', we do a "clamp" mod on top (and optionally left/right),
    // then also fix bottom to align the final height. The element height itself
    // changes on next layout pass, so `isAligned` might remain false until then.
    if (snapping === 'clamp') {
      pad.top = pad.top % base || base

      const remainder = height % base
      if (remainder !== 0) {
        pad.bottom += base - remainder
        // Then clamp that as well
        pad.bottom = pad.bottom % base || base
      }
    }

    // Dev warning if still not aligned
    if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
      console.warn(
        `[useBaseline] Element height (${height}px) is not aligned with base (${base}px).`,
      )
    }

    return { padding: pad, isAligned, height }
  }, [base, snapping, spacing, height, warnOnMisalignment])
}