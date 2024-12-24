import type { RefObject } from 'react'
import type { PGConfig, PGCustomProperties, PGState } from '@components'
import type {
  CSSValue,
  GridColumnsPattern,
  ResponsiveValue,
} from '@/types'

// Base interfaces
export interface VisibleRange {
  start: number
  end: number
}

export interface GridDimensions {
  width: number
  height: number
}

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

// Grid Configuration Types
export interface GridBaseConfig {
  gap?: ResponsiveValue<CSSValue | 'auto'>
  baseUnit?: number
}

export interface GridLineVariant extends GridBaseConfig {
  variant: 'line'
  columns?: never
  columnWidth?: never
}

export interface GridPatternVariant extends GridBaseConfig {
  variant?: never
  columns: GridColumnsPattern
  columnWidth?: never
}

export interface GridFixedVariant extends GridBaseConfig {
  variant?: never
  columns: number
  columnWidth?: ResponsiveValue<CSSValue | 'auto'>
}

export interface GridAutoVariant extends GridBaseConfig {
  variant?: never
  columns?: never
  columnWidth: ResponsiveValue<CSSValue | 'auto'>
}

export type GridConfig =
  | GridLineVariant
  | GridPatternVariant
  | GridFixedVariant
  | GridAutoVariant

// Type guards with better specificity
export const isLineVariant = (
  config: GridConfig,
): config is GridLineVariant => config.variant === 'line'

export const isPatternVariant = (
  config: GridConfig,
): config is GridPatternVariant =>
  Array.isArray(config.columns)

export const isFixedVariant = (
  config: GridConfig,
): config is GridFixedVariant =>
  typeof config.columns === 'number'

export const isAutoVariant = (
  config: GridConfig,
): config is GridAutoVariant =>
  !('variant' in config) &&
  !('columns' in config) &&
  'columnWidth' in config

// Other Grid Related Types
export interface UseVisibleGridLinesProps {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement>
  buffer?: number
}

export interface UseGridControlsProps {
  initialState: PGState
  validators?: {
    config?: (config: Partial<PGConfig>) => boolean
    styles?: (styles: Partial<PGCustomProperties>) => boolean
  }
}

export type UseGridControlsResult = {
  state: PGState
  actions: {
    updateConfig: (config: Partial<PGConfig>) => void
    updateStyles: (styles: Partial<PGCustomProperties>) => void
  }
}
