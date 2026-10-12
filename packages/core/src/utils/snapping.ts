import type { SnapEdge, SnappingMode, Padding, PaddingValue } from '../types'
import { parsePadding } from './padding'

export type SnappingOptions = {
  mode: SnappingMode
  snapEdge?: SnapEdge
}

type SnappingInput = SnappingMode | SnappingOptions

/**
 * Browsers report layout sizes in 1/64 px units, and zoom or display scaling
 * stretches those units and can stack a few of them. Treat anything within
 * four units (1/16 px) of a grid line as on the grid instead of adding almost
 * a full base row. The difference is below one device pixel.
 */
export const SNAP_TOLERANCE = 1 / 16

/** Distance past the previous grid line, or 0 when within tolerance of one. */
export function getBaselineRemainder(height: number, base: number): number {
  const remainder = ((height % base) + base) % base
  return remainder <= SNAP_TOLERANCE || base - remainder <= SNAP_TOLERANCE
    ? 0
    : remainder
}

export function isOnBaseline(height: number, base: number): boolean {
  return getBaselineRemainder(height, base) === 0
}

export function calculateSnappedSpacing(
  height: number,
  base: number,
  initial: PaddingValue,
  snappingInput: SnappingInput
): Padding {
  const pad: Padding = parsePadding({ padding: initial })
  const snapping =
    typeof snappingInput === 'string' ? snappingInput : snappingInput.mode
  const snapEdge =
    typeof snappingInput === 'string'
      ? 'bottom'
      : (snappingInput.snapEdge ?? 'bottom')

  if (snapping === 'none') {
    return pad
  }

  if (snapping === 'height') {
    const remainder = getBaselineRemainder(height, base)
    if (remainder !== 0) {
      const adjustment = base - remainder
      if (snapEdge === 'top') {
        pad.top += adjustment
      } else {
        pad.bottom += adjustment
      }
    }
  }

  if (snapping === 'clamp') {
    pad.top = pad.top % base
    const remainder = getBaselineRemainder(height, base)
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
    pad.bottom = pad.bottom % base
  }

  return pad
}
