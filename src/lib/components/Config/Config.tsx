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

const createCSSVariables = ({
  base,
  guide,
  spacer,
  box,
  padder,
}: Config): Record<string, string> => ({
  // Always set your base unit
  '--pdd-base': `${base}px`,

  // Guide Colors (matching the variant keys in your config)
  '--pdd-guide-color-line': guide.colors.line,
  '--pdd-guide-color-pattern': guide.colors.pattern,
  '--pdd-guide-color-auto': guide.colors.auto,
  '--pdd-guide-color-fixed': guide.colors.fixed,

  // Spacer Colors
  '--pdd-spacer-color-line': spacer.colors.line,
  '--pdd-spacer-color-flat': spacer.colors.flat,
  '--pdd-spacer-color-indice': spacer.colors.indice,

  // Box Colors
  '--pdd-box-color-line': box.colors.line,
  '--pdd-box-color-flat': box.colors.flat,
  '--pdd-box-color-indice': box.colors.indice,

  // Padder Color
  '--pdd-padder-color': padder.color,
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
      {/*
        Apply the dynamically generated custom properties,
        which override the same variables declared in your .css
      */}
      <div style={value.cssVariables}>{children}</div>
    </ConfigContext.Provider>
  )
}