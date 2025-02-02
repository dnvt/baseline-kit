import { useMemo, RefObject } from 'react'
import { useMeasure } from './useMeasure'
import { SnappingMode } from '@components'
import { calculateSnappedSpacing } from '@utils'

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
  /** Initial spacing, either as a number (applied to all sides) or as a partial object. */
  spacing?: Partial<Spacing> | number;
  /** Logs a warning in dev mode if the final height isn’t aligned. */
  warnOnMisalignment?: boolean;
}

export interface BaselineResult {
  /** The final snapped/adjusted padding values for each side. */
  padding: Spacing;
  /** True if the measured height is currently a multiple of `base`. */
  isAligned: boolean;
  /** The raw measured height of the element (without any forced 2nd pass). */
  height: number;
}

/**
 * useBaseline
 *
 * This hook measures an element’s height and returns a padded spacing object
 * that is adjusted (snapped) according to the provided base unit and snapping mode.
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

  // Retrieve the element’s height via our consolidated measurement hook.
  const { height } = useMeasure(ref)

  return useMemo(() => {
    // Normalize the incoming spacing: if it's a number, turn it into an object.
    const pad: Spacing =
      typeof spacing === 'number'
        ? { top: spacing, right: spacing, bottom: spacing, left: spacing }
        : {
          top: spacing.top ?? 0,
          right: spacing.right ?? 0,
          bottom: spacing.bottom ?? 0,
          left: spacing.left ?? 0,
        }

    // Check whether the element's height is aligned with the base.
    const isAligned = height % base === 0

    // If snapping is "none", simply return the original spacing.
    if (snapping === 'none') {
      if (!isAligned && warnOnMisalignment && process.env.NODE_ENV === 'development') {
        console.warn(`Element height (${height}px) is not a multiple of base (${base}px).`)
      }
      return { padding: pad, isAligned, height }
    }

    // For snapping modes "height" and "clamp", use the extracted helper.
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