import type { CSSProperties, ReactNode } from 'react'

// CSS Types
export const RELATIVE_UNITS = ['fr', '%', 'em', 'rem', 'vh', 'vw'] as const
export const ABSOLUTE_UNITS = ['px', 'pt', 'pc', 'cm', 'mm', 'in'] as const
export const CSS_UNITS = [...RELATIVE_UNITS, ...ABSOLUTE_UNITS] as const

export type RelativeUnit = typeof RELATIVE_UNITS[number]
export type AbsoluteUnit = typeof ABSOLUTE_UNITS[number]
export type CSSUnit = typeof CSS_UNITS[number]

export type RelativeCSSValue = `${number}${RelativeUnit}`
export type AbsoluteCSSValue = `${number}${AbsoluteUnit}`
export type CSSValue = RelativeCSSValue | AbsoluteCSSValue | number
export type CSSPixelValue = number | `${number}px`

/**
 * Valid values for grid columns
 * @todo Consider expanding to support additional CSS units (em, rem, vh, vw, etc.)
 */
export type GridColumnValue = CSSValue | `${number}fr` | 'auto'
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

export interface PaddedBaseConfig {
  baseUnit?: number
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  zIndex?: CSSProperties['zIndex']
}

export type ExclusiveProps<T, K extends keyof T> = {
  [P in K]: (
    { [Q in P]: T[Q] } &
    { [Q in Exclude<K, P>]?: undefined } &
    Omit<T, K>
    )
}[K]