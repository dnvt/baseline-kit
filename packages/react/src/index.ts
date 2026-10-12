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

// Keep this type list identical to the Remix entry's.
export type {
  ConfigSchema,
  DebuggingMode,
  GuideVariant,
  PaddingValue,
  Spacing,
  SpacingProps,
  Variant,
} from '@baseline-kit/core'
export type { ConfigProps } from './components/Config/Config'
export type { BaselineProps, BaselineVariant } from './components/Baseline'
export type {
  BoxElement,
  BoxProps,
  SnapEdge,
  SnappingMode,
} from './components/Box'
export type { GuideProps } from './components/Guide'
export type { IndicatorNode, SpacerProps } from './components/Spacer'
export type { PadderProps } from './components/Padder'
