import * as React from 'react'
import type { ConfigSchema } from '@baseline-kit/core/config/schema'
import { DEFAULT_CONFIG } from '@baseline-kit/core/config/defaults'
import {
  type ConfigOverrides,
  mergeConfig,
  createCSSVariables,
} from '@baseline-kit/core/config/merge'

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

type ConfigProps = ConfigOverrides & {
  children: React.ReactNode
}

/**
 * Configuration provider for baseline-kit components.
 */
export function Config({
  children,
  base,
  baseline,
  guide,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()

  const value = React.useMemo(() => {
    return mergeConfig({
      parentConfig,
      base,
      baseline,
      guide,
      spacer,
      box,
      padder,
    })
  }, [parentConfig, base, baseline, guide, spacer, box, padder])

  return <ConfigContext value={value}>{children}</ConfigContext>
}

// Re-export createCSSVariables and mergeConfig for consumers
export { createCSSVariables, mergeConfig }
