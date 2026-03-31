import * as React from 'react'
import type { SnappingMode, Padding } from '@baseline-kit/core'
import { parsePadding, calculateSnappedSpacing } from '@baseline-kit/core'
import { useMeasure } from './useMeasure'

export interface BaselineOptions {
  base?: number
  snapping?: SnappingMode
  spacing?: Partial<Padding> | number
  /** @deprecated No longer emits warnings. Check `isAligned` in the result instead. */
  warnOnMisalignment?: boolean
}

export interface BaselineResult {
  padding: Padding
  isAligned: boolean
  height: number
}

/**
 * Hook for managing baseline grid alignment in components.
 */
export function useBaseline(
  ref: React.RefObject<HTMLElement | null>,
  { base = 8, snapping = 'none', spacing = {} }: BaselineOptions = {}
): BaselineResult {
  if (base < 1) {
    throw new Error('Base must be >= 1 for baseline alignment.')
  }

  const { height } = useMeasure(ref)
  const didSnapRef = React.useRef<boolean>(false)

  return React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const isAligned = height % base === 0

    if (snapping === 'none') {
      return { padding: initialPadding, isAligned, height }
    }

    if (didSnapRef.current) {
      return { padding: initialPadding, isAligned, height }
    }

    const finalPadding = calculateSnappedSpacing(
      height,
      base,
      initialPadding,
      snapping
    )
    didSnapRef.current = true

    return { padding: finalPadding, isAligned, height }
  }, [base, snapping, spacing, height])
}
