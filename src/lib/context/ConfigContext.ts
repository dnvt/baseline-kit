import { createContext, use } from 'react'
import type { ComponentKeys, ThemeComponents } from './theme'
import { THEME } from './theme'

type ComponentConfigs = {
  [K in ComponentKeys]: Partial<ThemeComponents[K]>
}

export type ConfigOverride = Partial<{
  baseUnit: number
  zIndex: number
}> & Partial<ComponentConfigs>

export const ConfigContext = createContext<ConfigOverride | null>(null)

export function useConfig() {
  if (!ConfigContext) throw new Error('Cannot find the ConfigContext')
  return use(ConfigContext)
}

export function useComponentConfig<K extends ComponentKeys>(componentKey: K): ThemeComponents[K] {
  const parentConfig = useConfig()
  const themeConfig = THEME.components[componentKey] as Record<string, unknown>
  const componentConfig = parentConfig?.[componentKey] as Partial<ThemeComponents[K]> | undefined

  const config = {
    baseUnit: parentConfig?.baseUnit ?? THEME.baseUnit,
    zIndex: parentConfig?.zIndex ?? THEME.zIndex,
    ...(themeConfig as object),
    ...(componentConfig || {}),
  }

  return config as ThemeComponents[K]
}
