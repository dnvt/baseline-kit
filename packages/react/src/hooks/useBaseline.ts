import * as React from 'react'
import type { SnapEdge, SnappingMode, Padding } from '@baseline-kit/core'
import {
  parsePadding,
  isOnBaseline,
  nextSnap,
  type SnapState,
} from '@baseline-kit/core'
import {
  getRenderedBlockPadding,
  isScaledLayout,
} from '@baseline-kit/dom/measure'
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
 * Snapping follows the shared rules in `nextSnap`: it snaps on the first
 * measurement, when the inputs change, and whenever the natural height
 * changes (a font, size, wrap, or root font size change). Snapping from the
 * natural height is stable, and a host whose height is held from outside
 * settles within a few updates instead of oscillating.
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

  const snapRef = React.useRef<SnapState | null>(null)
  // Padding committed to the DOM, and the padding each measurement included.
  // The first render commits the initial padding, and the first measurement
  // runs before the effect below records it.
  const renderedPaddingRef = React.useRef<Padding | null>(
    parsePadding({ padding: spacing })
  )
  const measuredRef = React.useRef<{
    height: number
    rendered: Padding | null
  }>({ height: 0, rendered: null })
  const { height } = useMeasure(ref, (rect) => {
    // Pair the height with the padding in the DOM at this moment (mid-
    // transition values included), else with the last committed padding.
    const committed = renderedPaddingRef.current
    const live = ref.current ? getRenderedBlockPadding(ref.current) : null
    measuredRef.current = {
      height: rect.height,
      rendered: committed && live ? { ...committed, ...live } : committed,
    }
  })
  const result = React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const scaled = isScaledLayout(ref.current)
    const isAligned = isOnBaseline(height, base, scaled)
    if (snapping === 'none') {
      // Clear the snap, so switching back snaps afresh.
      snapRef.current = null
      return { padding: initialPadding, isAligned, height }
    }

    const snap = nextSnap(
      snapRef.current,
      { base, mode: snapping, snapEdge, initial: initialPadding },
      {
        height,
        // Pair the height with the padding it was measured with; a prop
        // change can commit new padding before the next measurement.
        rendered:
          (measuredRef.current.height === height
            ? measuredRef.current.rendered
            : renderedPaddingRef.current) ?? initialPadding,
        scaled,
      }
    )
    snapRef.current = snap
    return { padding: snap?.padding ?? initialPadding, isAligned, height }
  }, [ref, base, snapping, snapEdge, spacing, height])

  React.useLayoutEffect(() => {
    renderedPaddingRef.current = result.padding
  })

  return {
    padding: result.padding,
    isAligned: result.isAligned,
    height: result.height,
  }
}
