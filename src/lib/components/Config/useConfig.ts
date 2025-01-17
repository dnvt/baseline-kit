import { useMemo } from 'react'
import { Config, useDefaultConfig } from './Config'

export type ComponentConfig<K extends keyof Config> = Config[K] & {
  base: number
}

export function useConfig<K extends keyof Config>(
  component: K,
): ComponentConfig<K> {
  const defaultConfig = useDefaultConfig()

  return useMemo(() => {
    const componentConfig = defaultConfig[component]
    return Object.assign(
      { base: defaultConfig.base },
      componentConfig,
    ) as ComponentConfig<K>
  }, [defaultConfig, component])
}
