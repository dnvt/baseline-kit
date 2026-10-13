import type { SnapEdge, SnappingMode, Padding, PaddingValue } from '../types'
import { parsePadding } from './padding'

export type SnappingOptions = {
  mode: SnappingMode
  snapEdge?: SnapEdge
}

type SnappingInput = SnappingMode | SnappingOptions

/**
 * Remainders under this many CSS px count as on the grid. Zoom, display
 * scaling, and floating-point bases leave residues that small (observed up to
 * about 0.028px), and treating them as real would add almost a full base row.
 * Real text heights differ by whole layout units (1/64px in Chromium and
 * WebKit, 1/60px in Firefox); from two units up they are snapped exactly, and
 * a one-unit remainder stays at most 1/32px off the grid.
 */
export const SNAP_TOLERANCE = 1 / 32

/**
 * How long (ms) after its first snap a Remix Box or Padder may re-snap while
 * nested client entries finish hydrating.
 */
export const SNAP_SETTLE_MS = 2000

/** Distance past the previous grid line, or 0 when within tolerance of one. */
export function getBaselineRemainder(height: number, base: number): number {
  const remainder = ((height % base) + base) % base
  return remainder < SNAP_TOLERANCE || base - remainder < SNAP_TOLERANCE
    ? 0
    : remainder
}

/**
 * Height an element would have without the snap correction it currently
 * renders. Snapping from this value is stable: applying the result does not
 * change the input.
 */
export function removeSnapCorrection(
  height: number,
  rendered: Padding,
  initial: Padding
): number {
  return (
    height - (rendered.top - initial.top) - (rendered.bottom - initial.bottom)
  )
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

  // A base of 1px or less is no grid to snap to. Box sets base 1 for its
  // content, so a nested Box or Padder leaves the snapping to the outer Box
  // instead of adding a sub-pixel correction after the outer one settled.
  if (snapping === 'none' || !(base > 1)) {
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
