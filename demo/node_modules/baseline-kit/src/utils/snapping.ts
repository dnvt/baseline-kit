/**
 * @file snapping.ts
 * @description Baseline grid snapping utilities
 * @module utils
 */

import { SnappingMode, Padding, PaddingValue } from '@components'
import { parsePadding } from '@utils/padding'

/**
 * Calculates spacing adjustments to maintain baseline grid alignment.
 *
 * @remarks
 * Provides different snapping behaviors:
 * - none: No adjustments
 * - height: Adjusts bottom padding only
 * - clamp: Adjusts both top and bottom padding
 *
 * @param height - Measured element height
 * @param base - Grid base unit
 * @param initial - Initial spacing values
 * @param snapping - Snapping mode to apply
 * @returns Adjusted spacing values
 *
 * @example
 * ```ts
 * // Height snapping mode
 * calculateSnappedSpacing(46, 8, { top: 10, bottom: 10 }, 'height')
 * // => { top: 10, right: 0, bottom: 12, left: 0 }
 *
 * // Clamp mode
 * calculateSnappedSpacing(45, 8, { top: 10, bottom: 6 }, 'clamp')
 * // => { top: 2, right: 0, bottom: 1, left: 0 }
 * ```
 */
export function calculateSnappedSpacing(
  height: number,
  base: number,
  initial: PaddingValue,
  snapping: SnappingMode,
): Padding {
  const pad: Padding = parsePadding({ padding: initial })

  if (snapping === 'none') {
    return pad
  }

  if (snapping === 'height') {
    const remainder = height % base
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
  }

  if (snapping === 'clamp') {
    pad.top = pad.top % base
    const remainder = height % base
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
    pad.bottom = pad.bottom % base
  }

  return pad
}