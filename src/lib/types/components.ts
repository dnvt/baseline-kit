import type { CSSProperties, ReactNode } from 'react'

// CSS Types
export const CSS_UNITS = ['px', 'rem', 'em', 'vh', 'vw', '%', 'fr'] as const
export type CSSFraction = `${number}fr`
export type CSSUnit = (typeof CSS_UNITS)[number]
export type CSSCompound<T extends number | string> = T | `${number}${CSSUnit}`

export type CSSValue = CSSCompound<number>
export type CSSPixelValue = number | `${number}px`

// Grid Types
export type GridColumnValue = CSSValue | CSSFraction | 'auto'
export type GridColumnsPattern = readonly GridColumnValue[]

// Grid Constants & Types
export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number]

export const PADD_VARIANTS = ['line', 'flat'] as const
export type PaddedVariant = typeof PADD_VARIANTS[number]

// Common Component Types
export interface ComponentsProps {
  'data-testid'?: string
  className?: string
  children?: ReactNode
  style?: CSSProperties
  visibility?: Visibility
}

export type Visibility = 'none' | 'hidden' | 'visible'

export interface PaddedCommonConfig {
  baseUnit?: number
  color?: CSSProperties['color']
  zIndex?: CSSProperties['zIndex']
}

export type ExclusiveProps<T, K extends keyof T> = {
  [P in K]: (
    { [Q in P]: T[Q] } &
    { [Q in Exclude<K, P>]?: undefined } &
    Omit<T, K>
    )
}[K]