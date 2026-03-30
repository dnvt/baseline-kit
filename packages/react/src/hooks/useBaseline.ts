import * as React from 'react'
import type { SnappingMode, Padding } from '@baseline-kit/core'
import { parsePadding, calculateSnappedSpacing } from '@baseline-kit/core'
import { useMeasure } from './useMeasure'

export interface BaselineOptions {
  base?: number
  snapping?: SnappingMode
  spacing?: Partial<Padding> | number
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
  {
    base = 8,
    snapping = 'none',
    spacing = {},
    warnOnMisalignment = false,
  }: BaselineOptions = {}
): BaselineResult {
  if (base < 1) {
    throw new Error('Base must be >= 1 for baseline alignment.')
  }

  const { height } = useMeasure(ref)
  const didSnapRef = React.useRef<boolean>(false)
  const hasWarnedRef = React.useRef<boolean>(false)

  return React.useMemo(() => {
    const initialPadding = parsePadding({ padding: spacing })
    const isAligned = height % base === 0

    if (
      !isAligned &&
      warnOnMisalignment &&
      process.env.NODE_ENV === 'development'
    ) {
      if (!hasWarnedRef.current) {
        console.warn(
          `[useBaseline] Element height (${height}px) is not aligned with base (${base}px).`
        )
        hasWarnedRef.current = true
      }
    }

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
  }, [base, snapping, spacing, warnOnMisalignment, height])
}
