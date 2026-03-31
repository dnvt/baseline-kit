/**
 * @baseline-kit/lit
 * Lit web components for baseline-kit.
 * Uses @baseline-kit/core descriptors and @baseline-kit/dom observers.
 */

// Config provider
export { BkConfig } from './components/bk-config.js'

// Components
export { BkBaseline } from './components/bk-baseline.js'
export { BkGuide } from './components/bk-guide.js'
export { BkBox } from './components/bk-box.js'
export { BkStack } from './components/bk-stack.js'
export { BkLayout } from './components/bk-layout.js'
export { BkPadder } from './components/bk-padder.js'
export { BkSpacer } from './components/bk-spacer.js'

// Context (for custom components that need config)
export { configContext } from './controllers/config-context.js'
