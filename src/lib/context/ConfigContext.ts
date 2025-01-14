import { createContext, use } from 'react'
import type { ComponentKey, ThemeComponents } from './theme'
import { THEME } from './theme'

type ComponentConfigs = {
  [K in ComponentKey]: Partial<
    ThemeComponents[K] & {
    baseUnit?: number
    zIndex?: number
  }
  >
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

export function useComponentConfig<K extends ComponentKey>(
  componentKey: K,
): ThemeComponents[K] {
  const parentConfig = useConfig()
  const themeConfig = THEME.components[componentKey]
  const componentConfig = parentConfig?.[componentKey] as Partial<ThemeComponents[K]> | undefined

  const config = {
    baseUnit: parentConfig?.baseUnit ?? THEME.baseUnit,
    zIndex: parentConfig?.zIndex ?? THEME.zIndex,
    ...themeConfig,
    ...(componentConfig || {}),
  } as ThemeComponents[K]

  return config
}
