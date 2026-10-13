import * as React from 'react'
import type { SnapEdge, SnappingMode, Padding } from '@baseline-kit/core'
import {
  parsePadding,
  isOnBaseline,
  nextSnap,
  SNAP_SETTLE_MS,
  type SnapState,
} from '@baseline-kit/core'
import { isScaledLayout, onSnapSettleEvent } from '@baseline-kit/dom/measure'
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
 * measurement and when the inputs change, and while settling (two seconds
 * after a snap, or after a web font loads or the tab becomes visible) it
 * re-snaps whenever the natural height changes. Snapping from the natural
 * height is stable, so `clamp` cannot oscillate.
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
  const snapRef = React.useRef<SnapState | null>(null)
  // Padding committed to the DOM, which the latest measurement includes.
  const renderedPaddingRef = React.useRef<Padding | null>(null)
  const settlingRef = React.useRef(true)
  const [settleTick, reopenSettle] = React.useReducer((tick) => tick + 1, 0)

  const result = React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const scaled = isScaledLayout(ref.current)
    const isAligned = isOnBaseline(height, base, scaled)
    if (snapping === 'none') {
      return { padding: initialPadding, isAligned, height, snapKey: null }
    }

    const snap = nextSnap(
      snapRef.current,
      { base, mode: snapping, snapEdge, initial: initialPadding },
      {
        height,
        rendered: renderedPaddingRef.current ?? initialPadding,
        settling: settlingRef.current,
        scaled,
      }
    )
    snapRef.current = snap
    return {
      padding: snap?.padding ?? initialPadding,
      isAligned,
      height,
      snapKey: snap?.key ?? null,
    }
    // settleTick re-evaluates the current height after a settle event, which
    // reopens the window through settlingRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, base, snapping, snapEdge, spacing, height, settleTick])

  React.useLayoutEffect(() => {
    renderedPaddingRef.current = result.padding
  })

  // Each new snap (first measurement or new inputs) and each settle event
  // opens a SNAP_SETTLE_MS window.
  React.useLayoutEffect(() => {
    if (result.snapKey === null) return
    settlingRef.current = true
    const timer = setTimeout(() => {
      settlingRef.current = false
    }, SNAP_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [result.snapKey, settleTick])

  React.useEffect(
    () =>
      onSnapSettleEvent(() => {
        settlingRef.current = true
        reopenSettle()
      }),
    []
  )

  return {
    padding: result.padding,
    isAligned: result.isAligned,
    height: result.height,
  }
}
