import * as React from 'react'
import type { ConfigSchema } from '@baseline-kit/core/config/schema'
import {
  DEFAULT_CONFIG,
} from '@baseline-kit/core/config/defaults'
import {
  mergeConfig,
  createCSSVariables,
} from '@baseline-kit/core/config/merge'

// Re-export types that consumers need
export type { DebuggingMode } from '@baseline-kit/core/types'
export type { ConfigSchema } from '@baseline-kit/core/config/schema'

// Create the context
const ConfigContext = React.createContext<ConfigSchema>(DEFAULT_CONFIG)
ConfigContext.displayName = 'ConfigContext'

// Update to use React 19's use hook instead of useContext
export const useDefaultConfig = () => React.use(ConfigContext)

type ConfigProps = {
  children: React.ReactNode
  base?: number
  baseline?: Partial<ConfigSchema['baseline']>
  guide?: Partial<ConfigSchema['guide']>
  spacer?: Partial<ConfigSchema['spacer']>
  box?: Partial<ConfigSchema['box']>
  padder?: Partial<ConfigSchema['padder']>
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
