import * as React from 'react'
import type { SnapEdge, SnappingMode, Padding } from '@baseline-kit/core'
import {
  parsePadding,
  calculateSnappedSpacing,
  isOnBaseline,
  removeSnapCorrection,
  SNAP_SETTLE_MS,
} from '@baseline-kit/core'
import { getSnapTolerance } from '@baseline-kit/dom/measure'
import { useMeasure } from './useMeasure'

export interface BaselineOptions {
  base?: number
  snapping?: SnappingMode
  snapEdge?: SnapEdge
  spacing?: Partial<Padding> | number
}

export interface BaselineResult {
  padding: Padding
  isAligned: boolean
  height: number
}

/**
 * Hook for managing baseline grid alignment in components.
 *
 * Snapping notes
 * --------------
 * The hook snaps the measured height to the grid, then, for SNAP_SETTLE_MS,
 * re-snaps whenever the natural height (measured height without the
 * correction it rendered) changes, for example when a web font or nested
 * content settles. Snapping from the natural height is stable: applying the
 * correction does not change the input, so `clamp` cannot oscillate. After
 * that window the snap stays fixed and later resizes do not re-snap.
 */
export function useBaseline(
  ref: React.RefObject<HTMLElement | null>,
  {
    base = 8,
    snapping = 'none',
    snapEdge = 'bottom',
    spacing = {},
  }: BaselineOptions = {}
): BaselineResult {
  if (base < 1) {
    throw new Error('Base must be >= 1 for baseline alignment.')
  }

  const { height } = useMeasure(ref)
  const snapRef = React.useRef<{ padding: Padding; natural: number } | null>(
    null
  )
  // Set SNAP_SETTLE_MS after the first snap; from then on the snap is fixed.
  const settledRef = React.useRef(false)
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  // Padding committed to the DOM, which the latest measurement includes.
  const renderedPaddingRef = React.useRef<Padding | null>(null)

  const result = React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const tolerance = getSnapTolerance(ref.current)
    const isAligned = isOnBaseline(height, base, tolerance)

    // Wait for a real measurement before snapping; the first render has
    // height 0 before useMeasure settles.
    if (snapping === 'none' || height === 0) {
      return {
        padding: snapRef.current?.padding ?? initialPadding,
        isAligned,
        height,
      }
    }

    const natural = removeSnapCorrection(
      height,
      renderedPaddingRef.current ?? initialPadding,
      initialPadding
    )
    const snapped = snapRef.current
    if (
      snapped &&
      (settledRef.current || Math.abs(natural - snapped.natural) < tolerance)
    ) {
      return { padding: snapped.padding, isAligned, height }
    }

    const padding = calculateSnappedSpacing(natural, base, initialPadding, {
      mode: snapping,
      snapEdge,
      tolerance,
    })
    snapRef.current = { padding, natural }
    return { padding, isAligned, height }
  }, [ref, base, snapping, snapEdge, spacing, height])

  React.useLayoutEffect(() => {
    renderedPaddingRef.current = result.padding
    if (snapRef.current && settleTimerRef.current === null) {
      settleTimerRef.current = setTimeout(() => {
        settledRef.current = true
      }, SNAP_SETTLE_MS)
    }
  }, [result.padding])

  React.useEffect(
    () => () => {
      if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current)
    },
    []
  )

  return result
}
