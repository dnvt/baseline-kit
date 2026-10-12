import type { SnapEdge, SnappingMode, Padding, PaddingValue } from '../types'
import { parsePadding } from './padding'

export type SnappingOptions = {
  mode: SnappingMode
  snapEdge?: SnapEdge
}

type SnappingInput = SnappingMode | SnappingOptions

/** Browsers lay out in whole units of 1/64 CSS px. */
export const LAYOUT_UNIT = 1 / 64

/**
 * Largest distance from a grid line that still counts as on it, for distances
 * that are not whole layout units. Those only come from zoom or display
 * scaling (e.g. 120.028px for 120px at 110% zoom) and would otherwise add
 * almost a full base row.
 */
export const SNAP_TOLERANCE = 1 / 16

const isWholeLayoutUnits = (value: number) => {
  const units = value / LAYOUT_UNIT
  return Math.abs(units - Math.round(units)) < 1e-6
}

/**
 * Distance past the previous grid line, or 0 when on one. A distance made of
 * whole layout units is real geometry (a trimmed text height such as
 * 8.046875px) and is snapped however small it is. Any other distance up to
 * SNAP_TOLERANCE is scaling noise and counts as on the grid.
 */
export function getBaselineRemainder(height: number, base: number): number {
  const remainder = ((height % base) + base) % base
  const distance = Math.min(remainder, base - remainder)
  if (distance === 0) return 0
  if (!isWholeLayoutUnits(distance) && distance <= SNAP_TOLERANCE) return 0
  return remainder
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
