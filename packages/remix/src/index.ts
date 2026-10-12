/**
 * baseline-kit/remix: React-free components for the Remix 3 UI runtime.
 * Styles ship separately as `baseline-kit/styles`, shared with React.
 */

export { Config } from './Config'
export { Baseline } from './Baseline'
export { Guide } from './Guide'
export { Box } from './Box'
export { Spacer } from './Spacer'
export { Padder } from './Padder'

// Keep this type list identical to the React entry's.
export type {
  ConfigSchema,
  DebuggingMode,
  GuideVariant,
  PaddingValue,
  Spacing,
  SpacingProps,
  Variant,
} from '@baseline-kit/core'
export type { ConfigProps } from './Config'
export type { BaselineProps, BaselineVariant } from './Baseline'
export type { BoxElement, BoxProps, SnapEdge, SnappingMode } from './Box'
export type { GuideProps } from './Guide'
export type { IndicatorNode, SpacerProps } from './Spacer'
export type { PadderProps } from './Padder'
