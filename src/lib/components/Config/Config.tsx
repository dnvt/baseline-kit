import { createContext, use, useMemo, type ReactNode } from 'react'
import { BaselineVariant } from '@components'
import { DEFAULT_CONFIG } from './defaults'
import type { SpacerVariant } from '../Spacer'
import type { GuideVariant } from '../types'

/**
 * Controls the visual debugging features of this component or layout.
 *
 * - **"none"**: Debug features are fully disabled (no Padders or debug outlines).
 * - **"hidden"**: Debug features are present in the DOM but not visibly shown.
 * - **"visible"**: Debug features are fully rendered and visible for inspection.
 */
export type DebuggingMode = 'none' | 'hidden' | 'visible'

type Colors = {
  line: string
  flat: string
  indice: string
}

export type Config = {
  base: number
  guide: {
    variant: GuideVariant
    debugging: DebuggingMode
    colors: Record<GuideVariant, string>
  }
  baseline: {
    variant: BaselineVariant
    debugging: DebuggingMode
    colors: Record<BaselineVariant, string>
  }
  spacer: {
    variant: SpacerVariant
    debugging: DebuggingMode
    colors: Colors
  }
  box: {
    colors: Colors
    debugging: DebuggingMode
  }
  padder: {
    color: string
    debugging: DebuggingMode
  }
}

const ConfigContext = createContext<Config | null>(null)
ConfigContext.displayName = 'ConfigContext'

export const useDefaultConfig = () => use(ConfigContext) ?? DEFAULT_CONFIG

type ConfigProps = {
  children: ReactNode
  base?: number
  baseline?: Partial<Config['baseline']>
  guide?: Partial<Config['guide']>
  spacer?: Partial<Config['spacer']>
  box?: Partial<Config['box']>
  padder?: Partial<Config['padder']>
}

const createCSSVariables = ({
  base,
  baseline,
  guide,
  spacer,
  box,
  padder,
}: Config): Record<string, string> => ({
  // Always set your base unit
  '--pdd-base': `${base}px`,

  // Baseline Colors
  '--pdd-baseline-color-line': baseline.colors.line,
  '--pdd-baseline-color-flat': baseline.colors.flat,

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
  baseline,
  guide,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()

  const value = useMemo(() => {
    const newConfig: Config = {
      base: base ?? parentConfig.base,
      baseline: { ...parentConfig.baseline, ...baseline },
      guide: { ...parentConfig.guide, ...guide },
      spacer: { ...parentConfig.spacer, ...spacer },
      box: { ...parentConfig.box, ...box },
      padder: { ...parentConfig.padder, ...padder },
    }

    return {
      ...newConfig,
      cssVariables: createCSSVariables(newConfig),
    }
  }, [base, parentConfig.base, parentConfig.baseline, parentConfig.guide, parentConfig.spacer, parentConfig.box, parentConfig.padder, baseline, guide, spacer, box, padder])

  return (
    <ConfigContext.Provider value={value}>
      <div style={value.cssVariables}>{children}</div>
    </ConfigContext.Provider>
  )
}