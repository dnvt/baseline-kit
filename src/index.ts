/**
 * Baseline Kit
 * Lightweight development tool for visualizing and debugging grid systems and spacing in React
 * applications. It provides configurable overlays for both column-based and baseline grids, flexible spacing components,
 * and theme-aware configuration—all optimized for performance and built with TypeScript.
 *
 * Export Strategy:
 * - Only components and types required by consumers are exported
 * - Components are directly imported from their respective directories rather than through the components/index.ts barrel
 * - SSR utilities (isSSR, safeClientValue) are exported for advanced consumer use cases
 * - Internal utilities, helper functions, and implementation details are kept private
 *
 * @module baseline-kit
 */

// Public API Components
export { Config } from './components/Config'
export { Baseline } from './components/Baseline'
export { Guide } from './components/Guide'
export { Box } from './components/Box'
export { Stack } from './components/Stack'
export { Layout } from './components/Layout'
export { Spacer } from './components/Spacer'
export { Padder } from './components/Padder'

// Public API Types
export type { DebuggingMode, ConfigSchema } from './components/Config/Config'
export type { GuideVariant, Spacing, SpacingProps } from './components/types'
export type { BaselineProps } from './components/Baseline'
export type { BoxProps } from './components/Box'
export type { GuideProps } from './components/Guide'
export type { LayoutProps } from './components/Layout'
export type { StackProps } from './components/Stack'
export type { IndicatorNode, SpacerProps } from './components/Spacer'
export type { PadderProps } from './components/Padder'

// Public API Utilities
export { isSSR, safeClientValue } from './utils/ssr'
