/**
 * @baseline-kit/react
 * React adapter for baseline-kit: components, hooks, and React-specific utilities
 *
 * Re-exports from @baseline-kit/core and @baseline-kit/dom for convenience.
 */

// Component styles and base variables. Reset is opt-in via baseline-kit/reset.
import './components/styles/core.css'

// Public API Components
export { Config } from './components/Config'
export { Baseline } from './components/Baseline'
export { Guide } from './components/Guide'
export { Box } from './components/Box'
export { Spacer } from './components/Spacer'
export { Padder } from './components/Padder'

// Public API Types
export type { DebuggingMode, ConfigSchema } from './components/Config/Config'
export type {
  GuideVariant,
  Spacing,
  SpacingProps,
  PaddingValue,
  Variant,
} from '@baseline-kit/core'
export type { BaselineProps, BaselineVariant } from './components/Baseline'
export type { BoxProps, SnappingMode } from './components/Box'
export type { GuideProps } from './components/Guide'
export type { IndicatorNode, SpacerProps } from './components/Spacer'
export type { PadderProps } from './components/Padder'

// Public API Utilities
export { isSSR, safeClientValue } from '@baseline-kit/dom'
