import * as React from 'react'
import type { DebuggingMode, SpacingProps } from '@baseline-kit/core'

// Re-export pure types from core for backwards compatibility
// Note: BaselineVariant, SnappingMode, and GuideConfig are exported
// from their respective component modules (Baseline, Box, Guide)
export type {
  Spacing,
  PaddingValue,
  Padding,
  SpacingProps,
  GuideVariant,
  GuideColumnValue,
  GuideColumnsPattern,
  GridAlignment,
  PaddedVariant,
  Variant,
  DebuggingMode,
  ConfigSchema,
} from '@baseline-kit/core'

export {
  GRID_ALIGNMENTS,
  PADD_VARIANTS,
} from '@baseline-kit/core'

/**
 * Common props shared across library components.
 */
export type ComponentsProps = {
  debugging?: DebuggingMode
  className?: string
  style?: React.CSSProperties
  height?: React.CSSProperties['height']
  width?: React.CSSProperties['width']
} & SpacingProps

/** Base configuration for components that support padding. */
export type PaddedBaseConfig = {
  base?: number
  color?: React.CSSProperties['color'] | React.CSSProperties['backgroundColor']
  zIndex?: React.CSSProperties['zIndex']
}

export type Gaps =
  | {
      gap?: React.CSSProperties['gap']
      rowGap?: never
      columnGap?: never
    }
  | {
      gap?: never
      rowGap?: React.CSSProperties['rowGap']
      columnGap?: React.CSSProperties['columnGap']
    }
