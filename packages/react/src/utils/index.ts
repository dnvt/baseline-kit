/**
 * @baseline-kit/react utilities
 * Re-exports from core and dom for backwards compatibility,
 * plus React-specific merge and SSR utilities.
 */

// Re-export everything from core (types, pure utils, config, validation)
export * from '@baseline-kit/core'

// Re-export everything from dom (timing, SSR detection)
export * from '@baseline-kit/dom'

// React-specific utilities
export * from './merge'
export * from './ssr'
