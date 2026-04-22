import * as React from 'react'
import type { SnappingMode, Padding } from '@baseline-kit/core'
import { parsePadding, calculateSnappedSpacing } from '@baseline-kit/core'
import { useMeasure } from './useMeasure'

export interface BaselineOptions {
  base?: number
  snapping?: SnappingMode
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
 * `clamp` mode would oscillate without a latch: each snap tweaks the
 * element's padding which changes its measured height, which would
 * trigger another snap, and so on. We snap exactly once per mount on
 * the *first non-zero* measurement, then keep returning the snapped
 * padding for the rest of the element's life. Resizes after the first
 * snap intentionally do not re-snap (avoids visual jitter and the
 * `clamp` oscillation).
 */
export function useBaseline(
  ref: React.RefObject<HTMLElement | null>,
  { base = 8, snapping = 'none', spacing = {} }: BaselineOptions = {}
): BaselineResult {
  if (base < 1) {
    throw new Error('Base must be >= 1 for baseline alignment.')
  }

  const { height } = useMeasure(ref)
  const snappedPaddingRef = React.useRef<Padding | null>(null)

  return React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const isAligned = height % base === 0

    if (snapping === 'none') {
      return { padding: initialPadding, isAligned, height }
    }

    // Reuse the cached snap on subsequent renders.
    if (snappedPaddingRef.current) {
      return { padding: snappedPaddingRef.current, isAligned, height }
    }

    // Wait for a real measurement before snapping. Without this guard
    // the very first render (height = 0, before useMeasure settles)
    // would compute a no-op snap and prematurely poison the cache,
    // making real measurements never get snapped.
    if (height === 0) {
      return { padding: initialPadding, isAligned, height }
    }

    const finalPadding = calculateSnappedSpacing(
      height,
      base,
      initialPadding,
      snapping
    )
    snappedPaddingRef.current = finalPadding

    return { padding: finalPadding, isAligned, height }
  }, [base, snapping, spacing, height])
}
