import { SnappingMode, Padding, PaddingValue } from '@components'
import { parsePadding } from '@/utils/padding'

/**
 * Calculates the snapped spacing for an element given its measured height,
 * a base unit, the initial spacing, and a snapping mode.
 *
 * @param height - The measured height of the element (in pixels).
 * @param base - The base grid unit (must be >= 1).
 * @param initial - The initial spacing values (either a number or an object).
 * @param snapping - The snapping mode:
 *   - 'none': No snapping.
 *   - 'height': Adjusts only the bottom padding.
 *   - 'clamp': Clamps both top and bottom padding.
 * @returns The adjusted spacing.
 */
export function calculateSnappedSpacing(
  height: number,
  base: number,
  initial: PaddingValue,
  snapping: SnappingMode,
): Padding {
  // Convert the incoming initial spacing to a complete Padding object.
  const pad: Padding = parsePadding({ padding: initial })

  // If no snapping, simply return the initial spacing.
  if (snapping === 'none') {
    return pad
  }

  // For 'height' snapping, adjust only the bottom padding.
  if (snapping === 'height') {
    const remainder = height % base
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
  }

  // For 'clamp' snapping, clamp the top padding and adjust bottom accordingly.
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