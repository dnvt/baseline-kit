import type { RefObject } from 'react'
import type { CSSValue } from '@types'
import { SpacerConfig } from '@/components/Spacer/types'

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
  baseUnit?: number
}

export interface LineGridConfig extends GridCommonConfig {
  variant: 'line'
  columns?: never
  columnWidth?: never
}

export interface PatternGridConfig extends GridCommonConfig {
  variant: 'pattern'
  columns: CSSValue[]
  columnWidth?: never
}

export interface FixedGridConfig extends GridCommonConfig {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
}

export interface AutoGridConfig extends GridCommonConfig {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
}

export type GridConfig =
  | LineGridConfig
  | PatternGridConfig
  | FixedGridConfig
  | AutoGridConfig


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
export const isLineVariant = (
  config: GridConfig | SpacerConfig,
): config is LineGridConfig | SpacerConfig =>
  'variant' in config && config.variant === 'line'

export const isFlatVariant = (
  config: SpacerConfig,
): config is SpacerConfig =>
  'variant' in config && config.variant === 'flat'

export const isAutoVariant = (config: GridConfig): config is AutoGridConfig =>
  'variant' in config && config.variant === 'auto'

export const isPatternVariant = (
  config: GridConfig,
): config is PatternGridConfig => Array.isArray(config.columns)

export const isFixedVariant = (
  config: GridConfig,
): config is FixedGridConfig =>
  typeof config.columns === 'number'