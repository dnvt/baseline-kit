import { useMemo } from 'react'
import { Config, useDefaultConfig } from '@components'

export type ComponentConfig<K extends keyof Config> = Config[K] & {
  base: number
}

export function useConfig<K extends keyof Config>(
  component: K,
): ComponentConfig<K> {
  const defaultConfig = useDefaultConfig()

  return useMemo(() => {
    return Object.assign(
      { base: defaultConfig.base },
      defaultConfig[component],
    ) as ComponentConfig<K>
  }, [defaultConfig, component])
}
