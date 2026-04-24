import { useMemo } from 'react'
import type { ConfigSchema } from '@baseline-kit/core/config/schema'
import { useDefaultConfig } from '../components/Config/Config'

/** Type helper that merges base configuration with component-specific settings. */
export type ComponentConfig<K extends keyof ConfigSchema> = ConfigSchema[K] & {
  base: number
}

/**
 * Hook for accessing component-specific theme configuration.
 */
export function useConfig<K extends keyof ConfigSchema>(
  component: K
): ComponentConfig<K> {
  const defaultConfig = useDefaultConfig()
  return useMemo(() => {
    return Object.assign(
      { base: defaultConfig.base },
      defaultConfig[component]
    ) as ComponentConfig<K>
  }, [defaultConfig, component])
}
