/**
 * @file Component Exports (components/index.ts)
 * @description Main entry point for baseline-kit components
 * @module baseline-kit/components
 */

// Style imports - these generate CSS files in the dist folder
import './styles/core.css'
import './styles/theme.css'

// Layout Components
export * from './Layout'
export * from './Box'
export * from './Stack'

// Grid Components
export * from './Guide'
export * from './Baseline'

// Spacing Components
export * from './Spacer'
export * from './Padder'

// Configuration
export * from './Config'

// Types
export * from './types'

// Other component exports...

// DON'T export ClientOnly from here anymore as it's been moved to utils/ssr
