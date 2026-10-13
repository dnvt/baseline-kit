import type { SnapEdge, SnappingMode, Padding, PaddingValue } from '../types'
import { parsePadding } from './padding'

export type SnappingOptions = {
  mode: SnappingMode
  snapEdge?: SnapEdge
  /** The page is scaled by a fraction; see getBaselineRemainder. */
  scaled?: boolean
}

type SnappingInput = SnappingMode | SnappingOptions

/** Layout units browsers lay out in: 1/64px (Chromium, WebKit), 1/60px (Firefox). */
const LAYOUT_UNITS = [1 / 64, 1 / 60]

/** Below this, a difference is floating-point error (e.g. 46 % 9.2). */
export const SNAP_EPSILON = 1 / 128

/**
 * Largest remainder that can count as on the grid. Zoom, display scaling, and
 * CSS zoom leave residues up to about 0.028px; snapping them would add almost
 * a full base row.
 */
export const SNAP_TOLERANCE = 1 / 32

/**
 * How long (ms) 7.0 kept re-snapping after a snap.
 * @deprecated Since 7.1, Box and Padder re-snap on every size change.
 */
export const SNAP_SETTLE_MS = 2000

/**
 * Snapped block padding is kept to 1/1024px. Chromium and WebKit truncate
 * lengths to 1/64px, so padding a hair under a unit (from the rounding below)
 * would render a whole unit short; 1/1024 also holds Firefox's 1/60px units.
 * Inline padding is never snapped and passes through as given.
 */
const PADDING_STEP = 1 / 1024

const toPaddingStep = (value: number) =>
  Math.round(value / PADDING_STEP) * PADDING_STEP

const toBlockStep = (padding: Padding): Padding => ({
  ...padding,
  top: toPaddingStep(padding.top),
  bottom: toPaddingStep(padding.bottom),
})

/**
 * Computed styles round lengths to six significant digits, so padding read
 * back from the DOM is off by up to about 1e-5 of itself. Where it matches
 * the snapped padding to that precision, it is the snapped padding.
 */
const asSnapped = (read: number, snapped: number) =>
  Math.abs(read - snapped) <= Math.max(Math.abs(snapped), 1) * 1e-5
    ? snapped
    : read

// Firefox reports sizes at float32 precision, so allow 1% of a unit.
const isWholeLayoutUnits = (value: number) =>
  LAYOUT_UNITS.some((unit) => {
    const units = value / unit
    return Math.abs(units - Math.round(units)) < 0.01
  })

/**
 * Distance past the previous grid line, or 0 when it counts as on one.
 * Floating-point error always counts as on the grid. Up to SNAP_TOLERANCE:
 * when the page is known to be scaled by a fraction (`scaled`), every
 * remainder is a scaling residue; otherwise only remainders that are not
 * whole layout units are (Safari page zoom, for one, may not change
 * devicePixelRatio), and whole layout units are real geometry and snapped.
 */
export function getBaselineRemainder(
  height: number,
  base: number,
  scaled = false
): number {
  const remainder = ((height % base) + base) % base
  const distance = Math.min(remainder, base - remainder)
  if (distance < SNAP_EPSILON) return 0
  if (distance <= SNAP_TOLERANCE && (scaled || !isWholeLayoutUnits(distance))) {
    return 0
  }
  return remainder
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

export function isOnBaseline(
  height: number,
  base: number,
  scaled = false
): boolean {
  return getBaselineRemainder(height, base, scaled) === 0
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
  const scaled =
    typeof snappingInput === 'string' ? false : (snappingInput.scaled ?? false)

  // A base of 1px or less is no grid to snap to. Box sets base 1 for its
  // content, so a nested Box or Padder leaves the snapping to the outer Box
  // instead of adding a sub-pixel correction after the outer one settled.
  if (snapping === 'none' || !(base > 1)) {
    return pad
  }

  if (snapping === 'height') {
    const remainder = getBaselineRemainder(height, base, scaled)
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
    const remainder = getBaselineRemainder(height, base, scaled)
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
    pad.bottom = pad.bottom % base
  }

  return pad
}

/** The last snap of a Box or Padder. */
export interface SnapState {
  /** Inputs the snap was computed for (base, mode, edge, initial padding). */
  key: string
  padding: Padding
  /** Height without the rendered correction when the snap was computed. */
  natural: number
  /** Last measured height that was evaluated. */
  height: number
  /** The last measurement evaluated: height and the block padding in it. */
  measured?: SnapMeasured
  /** The measurement before it, to spot a host bouncing (see nextSnap). */
  earlier?: SnapMeasured
}

/** A measured height and the top and bottom padding it was taken with. */
export interface SnapMeasured {
  height: number
  top: number
  bottom: number
}

export interface SnapInput {
  base: number
  mode: SnappingMode
  snapEdge: SnapEdge
  initial: Padding
}

export const getSnapKey = ({ base, mode, snapEdge, initial }: SnapInput) =>
  `${base}|${mode}|${snapEdge}|${initial.top},${initial.right},${initial.bottom},${initial.left}`

/** A measurement of a Box or Padder host. */
export interface SnapMeasurement {
  /** Measured height, including the rendered padding. */
  height: number
  /** Padding rendered when the height was measured. */
  rendered: Padding
  /** Re-snap when the content changes (default). `false` keeps the snap. */
  settling?: boolean
  /** The page is scaled by a fraction (see getBaselineRemainder). */
  scaled?: boolean
}

/**
 * Snap state after a measurement, shared by the React and Remix entries.
 * It snaps on the first measurement and whenever the inputs change, and
 * returns null for `none`. It also re-snaps when the natural height (the
 * measured height without the rendered correction) changes and the Box is off
 * the grid. For a host whose height follows its content, snapping from the
 * natural height is stable, because applying the correction does not change
 * it. A host whose height is held from outside (min-height, a stretched flex
 * or grid item) bounces between two measurements instead; then the padding
 * grows toward the next grid line until the height lands on it or stops
 * moving. A measurement with an unchanged height (a fixed-height Box, a
 * width-only change) never re-snaps. Returns `prev` itself when nothing
 * changes.
 *
 * `rendered` should be the padding in the DOM when the height was measured
 * (see getRenderedBlockPadding in the dom package), not the target padding.
 */
export function nextSnap(
  prev: SnapState | null,
  input: SnapInput,
  { height, rendered: read, settling = true, scaled }: SnapMeasurement
): SnapState | null {
  // `none` clears the snap, so switching back snaps afresh.
  if (input.mode === 'none') return null
  if (height === 0) return prev
  const rendered = prev
    ? {
        ...read,
        top: asSnapped(read.top, prev.padding.top),
        bottom: asSnapped(read.bottom, prev.padding.bottom),
      }
    : read
  const key = getSnapKey(input)
  const natural = removeSnapCorrection(height, rendered, input.initial)
  const measured = { height, top: rendered.top, bottom: rendered.bottom }
  const fresh = (padding: Padding, earlier?: SnapMeasured): SnapState => ({
    key,
    natural,
    height,
    padding: toBlockStep(padding),
    measured,
    ...(earlier ? { earlier } : {}),
  })
  const snapNatural = () =>
    calculateSnappedSpacing(natural, input.base, input.initial, {
      mode: input.mode,
      snapEdge: input.snapEdge,
      scaled,
    })
  if (!prev || prev.key !== key) return fresh(snapNatural())

  // Float noise (Firefox reports 100.79999 for 100.8) is no change.
  if (Math.abs(height - prev.height) < SNAP_EPSILON || !settling) return prev
  // On a page scaled by a fraction, layout rounds to device pixels, so the
  // natural height moves by a residue after each correction; only a larger
  // change is new content. A natural height that the current padding already
  // puts on the grid needs no change.
  const threshold = scaled ? SNAP_TOLERANCE : SNAP_EPSILON
  const withCurrent =
    natural +
    (prev.padding.top - input.initial.top) +
    (prev.padding.bottom - input.initial.bottom)
  if (
    Math.abs(natural - prev.natural) < threshold ||
    isOnBaseline(withCurrent, input.base, scaled)
  ) {
    return { ...prev, height, measured, earlier: prev.measured }
  }
  // A host whose height doesn't follow its padding one to one (min-height, a
  // stretched flex or grid item) bounces: each correction brings back the
  // measurement from two snaps ago, height and padding alike. Then add to the
  // rendered padding instead, which only moves the height toward the next
  // grid line. (Content that changes back arrives with a different padding,
  // or already on the grid, where adding changes nothing.)
  const earlier = prev.earlier
  if (
    earlier &&
    Math.abs(earlier.height - height) < threshold &&
    Math.abs(earlier.top - rendered.top) < SNAP_EPSILON &&
    Math.abs(earlier.bottom - rendered.bottom) < SNAP_EPSILON
  ) {
    return fresh(
      calculateSnappedSpacing(height, input.base, rendered, {
        mode: 'height',
        snapEdge: input.mode === 'clamp' ? 'bottom' : input.snapEdge,
        scaled,
      }),
      prev.measured
    )
  }
  return fresh(snapNatural(), prev.measured)
}
