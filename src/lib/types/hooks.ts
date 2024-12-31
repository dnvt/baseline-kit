import type { CSSValue, GridColumnsPattern } from '@/types'
import type { RefObject } from 'react'

// Base interfaces
export interface VisibleRange {
  start: number
  end: number
}

export interface GridDimensions {
  width: number
  height: number
}

// Grid Configuration Types
interface GridCommonConfig {
  gap?: CSSValue
}

export interface GridLineVariant extends GridCommonConfig {
  variant: 'line'
  columns?: never
  columnWidth?: never
}

export interface GridPatternVariant extends GridCommonConfig {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
}

export interface GridFixedVariant extends GridCommonConfig {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
}

export interface GridAutoVariant extends GridCommonConfig {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
}

export type GridConfig =
  | GridLineVariant
  | GridPatternVariant
  | GridFixedVariant
  | GridAutoVariant


// Grid Calculation Types
export interface UseGridCalculationsProps {
  containerWidth: number
  config: GridConfig
}

export interface UseGridCalculationsResult {
  gridTemplateColumns: string
  columnsCount: number
  calculatedGap: string
  isValid: boolean
}

export interface UseVisibleGridLinesProps {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement>
  buffer?: number
}

// Type guards
export const isLineVariant = (config: GridConfig): config is GridLineVariant =>
  'variant' in config && config.variant === 'line'

export const isAutoVariant = (config: GridConfig): config is GridAutoVariant =>
  config.variant === 'auto'

export const isPatternVariant = (
  config: GridConfig,
): config is GridPatternVariant => Array.isArray(config.columns)

export const isFixedVariant = (
  config: GridConfig,
): config is GridFixedVariant =>
  typeof config.columns === 'number'