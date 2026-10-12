/**
 * baseline-kit: React 19 components. Styles ship separately as
 * `baseline-kit/styles`, shared with the Remix 3 entry.
 */

export { Config } from './components/Config'
export { Baseline } from './components/Baseline'
export { Guide } from './components/Guide'
export { Box } from './components/Box'
export { Spacer } from './components/Spacer'
export { Padder } from './components/Padder'

export type { DebuggingMode, ConfigSchema } from './components/Config/Config'
export type {
  GuideVariant,
  Spacing,
  SpacingProps,
  PaddingValue,
  Variant,
} from '@baseline-kit/core'
export type { BaselineProps, BaselineVariant } from './components/Baseline'
export type { BoxProps, SnapEdge, SnappingMode } from './components/Box'
export type { GuideProps } from './components/Guide'
export type { IndicatorNode, SpacerProps } from './components/Spacer'
export type { PadderProps } from './components/Padder'
