import * as React from 'react'
import type { ConfigSchema } from '@baseline-kit/core/config/schema'
import { DEFAULT_CONFIG } from '@baseline-kit/core/config/defaults'
import {
  type ConfigOverrides,
  mergeConfig,
  createCSSVariables,
} from '@baseline-kit/core/config/merge'
import {
  DEFAULT_ROOT_FONT_SIZE,
  parseRemBase,
} from '@baseline-kit/core/config/base'
import { getRootFontSize, subscribeRootFontSize } from '@baseline-kit/dom'

// Re-export types that consumers need
export type { DebuggingMode } from '@baseline-kit/core/types'
export type { ConfigSchema } from '@baseline-kit/core/config/schema'

// Root and guide are published as separate bundles. Keep their context
// identity shared when an application imports both entry points.
const CONFIG_CONTEXT_KEY = '__baseline_kit_config_context__'
const contextStore = globalThis as typeof globalThis & {
  [CONFIG_CONTEXT_KEY]?: React.Context<ConfigSchema>
}
const ConfigContext =
  contextStore[CONFIG_CONTEXT_KEY] ??
  (contextStore[CONFIG_CONTEXT_KEY] = React.createContext(DEFAULT_CONFIG))
ConfigContext.displayName = 'ConfigContext'

// Update to use React 19's use hook instead of useContext
export const useDefaultConfig = () => React.use(ConfigContext)

export type ConfigProps = ConfigOverrides & {
  children: React.ReactNode
}

const subscribeNothing = () => () => {}
const serverRootFontSize = () => DEFAULT_ROOT_FONT_SIZE

/**
 * The live root font size while `enabled`. Server renders and hydration use
 * 16px, so a rem base hydrates without a mismatch and re-resolves after.
 */
function useRootFontSize(enabled: boolean): number {
  return React.useSyncExternalStore(
    enabled ? subscribeRootFontSize : subscribeNothing,
    enabled ? getRootFontSize : serverRootFontSize,
    serverRootFontSize
  )
}

/**
 * Configuration provider for baseline-kit components.
 */
export function Config({
  children,
  base,
  domDiagnostics,
  baseline,
  guide,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()
  // Only a scope that sets a rem base watches the root; nested scopes inherit
  // its resolved value.
  const rootFontSize = useRootFontSize(parseRemBase(base) !== undefined)

  const value = React.useMemo(() => {
    return mergeConfig({
      parentConfig,
      base,
      rootFontSize,
      domDiagnostics,
      baseline,
      guide,
      spacer,
      box,
      padder,
    })
  }, [
    parentConfig,
    base,
    rootFontSize,
    domDiagnostics,
    baseline,
    guide,
    spacer,
    box,
    padder,
  ])

  return <ConfigContext value={value}>{children}</ConfigContext>
}

// Re-export createCSSVariables and mergeConfig for consumers
export { createCSSVariables, mergeConfig }
