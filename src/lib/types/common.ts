import type { CSSProperties, ReactNode } from 'react'

export type CSSUnit = 'px' | 'rem' | 'em' | '%' | 'fr' | 'vh' | 'vw'
export type CSSCompound<T extends number | string> = T | `${number}${CSSUnit}`
export type CSSValue = CSSCompound<number | string>

// Add fr-specific type for grid columns
export type GridFrValue = `${number}fr`
export type GridColumnValue = CSSValue | GridFrValue | 'auto'

// Update GridColumnsPattern to be more specific
export type GridColumnsPattern = readonly (GridColumnValue | ResponsiveValue<GridColumnValue>)[]

// Rest of common.ts remains the same
export const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', 'xxl'] as const
export type BreakpointKey = typeof BREAKPOINTS[number]

export type ResponsiveValue<T> = T | Record<BreakpointKey, T>

export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number]

export const GRID_VARIANTS = ['line', 'flat'] as const
export type GridVariant = typeof GRID_VARIANTS[number]

export interface BaseComponentProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  'data-testid'?: string
}

export interface BaseGridConfig {
  show?: boolean
  baseUnit?: number
}