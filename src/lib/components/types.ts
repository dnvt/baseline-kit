import type { CSSProperties, ReactNode } from 'react'
import { Visibility } from '@components'
import { CSSValue } from '@utils'

// Grid Column
export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'
export type GuideColumnValue = CSSValue | 'auto'
export type GuideColumnsPattern = readonly GuideColumnValue[]

// Grid Constants & Types
export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number]

export const PADD_VARIANTS = ['line', 'flat'] as const
export type PaddedVariant = typeof PADD_VARIANTS[number]

// Common Component Types
export type ComponentsProps = {
  'data-testid'?: string
  className?: string
  children?: ReactNode
  style?: CSSProperties
  visibility?: Visibility
}

export type PaddedBaseConfig = {
  base?: number
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  zIndex?: CSSProperties['zIndex']
}

// This utility type ensures that exactly one property
// from the specified keys (K) of a given type (T) is required,
// while all others remain optional or undefined.
export type ExclusiveProps<T, K extends keyof T> = {
  [P in K]: (
    { [Q in P]: T[Q] } & // Require the selected property
    { [Q in Exclude<K, P>]?: undefined } & // Others must be undefined
    Omit<T, K> // Include all remaining properties of T, excluding K
    )
}[K]
