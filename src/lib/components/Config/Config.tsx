import { createContext, use, useMemo, type ReactNode } from 'react'
import { DEFAULT_CONFIG } from './defaults'
import { GuideVariant } from '../Guide/types'
import { SpacerVariant } from '../Spacer'

export type Visibility = 'visible' | 'hidden' | 'none'
export type Config = {
  // System base unit
  base: number

  // Component configs
  guide: {
    variant: GuideVariant
    visibility: Visibility
    colors: Record<GuideVariant, string>
  }

  spacer: {
    variant: SpacerVariant
    visibility: Visibility
    colors: {
      line: string
      flat: string
      indice: string
    }
  }

  box: {
    colors: {
      line: string
      flat: string
      indice: string
    }
    visibility: Visibility
  }

  padder: {
    color: string
    visibility: Visibility
  }
}

const ConfigContext = createContext<Config | null>(null)
ConfigContext.displayName = 'ConfigContext'

export function useDefaultConfig() {
  return use(ConfigContext) ?? DEFAULT_CONFIG
}

type ConfigProps = {
  children: ReactNode
  base?: number
  guide?: Partial<Config['guide']>
  spacer?: Partial<Config['spacer']>
  box?: Partial<Config['box']>
  padder?: Partial<Config['padder']>
}

function createCSSVariables(config: Config): Record<string, string> {
  return {
    '--padd-base': `${config.base}px`,
    // Guide colors
    '--padd-guide-line': config.guide.colors.line,
    '--padd-guide-pattern': config.guide.colors.pattern,
    '--padd-guide-auto': config.guide.colors.auto,
    '--padd-guide-fixed': config.guide.colors.fixed,
    // Spacer colors
    '--padd-spacer-line': config.spacer.colors.line,
    '--padd-spacer-flat': config.spacer.colors.flat,
    '--padd-spacer-indice': config.spacer.colors.indice,
    // Box color
    '--padd-box-line': config.box.colors.line,
    '--padd-box-flat': config.box.colors.flat,
    '--padd-box-indice': config.box.colors.indice,
    // Padder color
    '--padd-padder-color': config.padder.color,
  }
}

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
      guide: {
        ...parentConfig.guide,
        ...guide,
      },
      spacer: {
        ...parentConfig.spacer,
        ...spacer,
      },
      box: {
        ...parentConfig.box,
        ...box,
      },
      padder: {
        ...parentConfig.padder,
        ...padder,
      },
    }

    return {
      ...newConfig,
      cssVariables: createCSSVariables(newConfig),
    }
  }, [parentConfig, base, guide, spacer, box, padder])

  return (
    <ConfigContext value={value}>
      <div style={value.cssVariables}>
        {children}
      </div>
    </ConfigContext>
  )
}