/**
 * @baseline-kit/remix
 * React-free Baseline Kit adapter for the Remix 3 UI runtime.
 */

import './styles.css'

export { Config } from './Config'
export { Baseline } from './Baseline'
export { Guide } from './Guide'
export { Box } from './Box'
export { Spacer } from './Spacer'
export { Padder } from './Padder'

export type { ConfigProps } from './Config'
export type { BaselineProps, BaselineVariant } from './Baseline'
export type { GuideProps } from './Guide'
export type { BoxProps, SnapEdge, SnappingMode } from './Box'
export type { IndicatorNode, SpacerProps } from './Spacer'
export type { PadderProps } from './Padder'
export type { ConfigSchema, DebuggingMode } from '@baseline-kit/core'
