/**
 * Guide-only entry point for consumers that only need the grid overlay.
 */

import './components/styles/core.css'

export { Config } from './components/Config'
export { Guide } from './components/Guide'

export type { DebuggingMode, ConfigSchema } from './components/Config/Config'
export type { GuideProps, GuideConfig } from './components/Guide'
export type { GuideVariant } from '@baseline-kit/core/types'
export { createCSSVariables, mergeConfig } from './components/Config/Config'
