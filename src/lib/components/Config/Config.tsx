import { createContext, use, useMemo, type ReactNode } from 'react'
import { DEFAULT_CONFIG } from './defaults'
import type { SpacerVariant } from '../Spacer'
import type { GuideVariant } from '../types'

export type Visibility = 'visible' | 'hidden' | 'none'

type Colors = {
  line: string
  flat: string
  indice: string
}

export type Config = {
  base: number
  guide: {
    variant: GuideVariant
    visibility: Visibility
    colors: Record<GuideVariant, string>
  }
  spacer: {
    variant: SpacerVariant
    visibility: Visibility
    colors: Colors
  }
  box: {
    colors: Colors
    visibility: Visibility
  }
  padder: {
    color: string
    visibility: Visibility
  }
}

const ConfigContext = createContext<Config | null>(null)
ConfigContext.displayName = 'ConfigContext'

export const useDefaultConfig = () => use(ConfigContext) ?? DEFAULT_CONFIG

type ConfigProps = {
  children: ReactNode
  base?: number
  guide?: Partial<Config['guide']>
  spacer?: Partial<Config['spacer']>
  box?: Partial<Config['box']>
  padder?: Partial<Config['padder']>
}

const createCSSVariables = ({ base }: Config): Record<string, string> => ({
  '--pdd-base': `${base}px`,
})

export function Config({
  children,
  base,
  guide,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()

  const value = useMemo(() => {
    const newConfig: Config = {
      base: base ?? parentConfig.base,
      guide: { ...parentConfig.guide, ...guide },
      spacer: { ...parentConfig.spacer, ...spacer },
      box: { ...parentConfig.box, ...box },
      padder: { ...parentConfig.padder, ...padder },
    }

    return {
      ...newConfig,
      cssVariables: createCSSVariables(newConfig),
    }
  }, [parentConfig, base, guide, spacer, box, padder])

  return (
    <ConfigContext.Provider value={value}>
      <div style={value.cssVariables}>{children}</div>
    </ConfigContext.Provider>
  )
}