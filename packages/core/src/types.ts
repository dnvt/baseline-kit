/**
 * @baseline-kit/core - Pure type definitions
 * Framework-agnostic types for the baseline-kit system
 */

// Spacing Types
export type Spacing =
  | number
  | [number, number]
  | { start?: number; end?: number }

export type PaddingValue =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | { top?: number; bottom?: number; left?: number; right?: number }

export type Padding = {
  top: number
  right: number
  bottom: number
  left: number
}

export type SpacingProps = {
  padding?: PaddingValue
  block?: Spacing
  inline?: Spacing
}

// Grid Types
export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'
export type GuideColumnValue = string | number | undefined | 'auto'
export type GuideColumnsPattern = readonly GuideColumnValue[]

export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = (typeof GRID_ALIGNMENTS)[number]

export const PADD_VARIANTS = ['line', 'flat'] as const
export type PaddedVariant = (typeof PADD_VARIANTS)[number]

// Component Types
export type Variant = 'line' | 'flat' | 'pattern'
export type BaselineVariant = Exclude<Variant, 'pattern'>
export type SnappingMode = 'none' | 'height' | 'clamp'
export type DebuggingMode = 'none' | 'hidden' | 'visible'

// Guide Config Types (framework-agnostic)
type BaseGuideConfig = {
  gap?: number | string
  base?: number
}

export type PatternConfig = BaseGuideConfig & {
  variant: 'pattern'
  columns: GuideColumnsPattern
  columnWidth?: never
}

export type FixedConfig = BaseGuideConfig & {
  variant: 'fixed'
  columns: number
  columnWidth?: number | string
}

export type AutoConfig = BaseGuideConfig & {
  variant: 'auto'
  columnWidth: number | string
  columns?: never
}

export type LineConfig = BaseGuideConfig & {
  variant?: 'line'
  columns?: never
  columnWidth?: never
}

export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig
