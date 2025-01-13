import type { RefObject } from 'react'
import type { CSSValue, GridColumnsPattern } from '@types'
import { SpacerConfig } from '@/components/Spacer/types'

// Base interfaces -------------------------------------------------------------

export type VisibleRange = {
  start: number
  end: number
}

export type GridDimensions = {
  width: number
  height: number
}

// Grid Configuration Types ----------------------------------------------------

interface GridCommonConfig {
  gap?: CSSValue
  baseUnit?: number
}

export type LineGridConfig = {
  variant: 'line'
  columns?: never
  columnWidth?: never
} & GridCommonConfig

export type PatternGridConfig = {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
} & GridCommonConfig

export type FixedGridConfig = {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
} & GridCommonConfig

export type AutoGridConfig = {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
} & GridCommonConfig

export type GridConfig =
  | LineGridConfig
  | PatternGridConfig
  | FixedGridConfig
  | AutoGridConfig


// Grid Calculation Types ------------------------------------------------------

export type UseGridCalculationsProps = {
  containerWidth: number
  config: GridConfig
}

export type UseGridCalculationsResult = {
  gridTemplateColumns: string
  columnsCount: number
  calculatedGap: string
  isValid: boolean
}

export type UseVisibleGridLinesProps = {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement>
  buffer?: number
}

// Type guards -----------------------------------------------------------------

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
): config is PatternGridConfig =>
  config.variant === 'pattern' && Array.isArray(config.columns)

export const isFixedVariant = (
  config: GridConfig,
): config is FixedGridConfig =>
  typeof config.columns === 'number'