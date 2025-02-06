import * as React from 'react'
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
  flex: {
    colors: Colors
    debugging: DebuggingMode
  },
  layout: {
    colors: Colors
    debugging: DebuggingMode
  },
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

const ConfigContext = React.createContext<Config | null>(null)
ConfigContext.displayName = 'ConfigContext'

export const useDefaultConfig = () => React.use(ConfigContext) ?? DEFAULT_CONFIG

type ConfigProps = {
  children: React.ReactNode
  base?: number
  baseline?: Partial<Config['baseline']>
  flex?: Partial<Config['flex']>
  layout?: Partial<Config['layout']>
  guide?: Partial<Config['guide']>
  spacer?: Partial<Config['spacer']>
  box?: Partial<Config['box']>
  padder?: Partial<Config['padder']>
}

const createCSSVariables = ({
  base,
  baseline,
  guide,
  flex,
  spacer,
  layout,
  box,
  padder,
}: Config): Record<string, string> => ({
  // Always set your base unit
  '--bk-base': `${base}px`,

  // Baseline Colors
  '--bk-baseline-color-line': baseline.colors.line,
  '--bk-baseline-color-flat': baseline.colors.flat,

  // Guide Colors (matching the variant keys in your config)
  '--bk-guide-color-line': guide.colors.line,
  '--bk-guide-color-pattern': guide.colors.pattern,
  '--bk-guide-color-auto': guide.colors.auto,
  '--bk-guide-color-fixed': guide.colors.fixed,

  // Spacer Colors
  '--bk-spacer-color-line': spacer.colors.line,
  '--bk-spacer-color-flat': spacer.colors.flat,
  '--bk-spacer-color-indice': spacer.colors.indice,

  // Box Colors
  '--bk-box-color-line': box.colors.line,
  '--bk-box-color-flat': box.colors.flat,
  '--bk-box-color-indice': box.colors.indice,

  // Flex Colors
  '--bk-flex-color-line': flex.colors.line,
  '--bk-flex-color-flat': flex.colors.flat,
  '--bk-flex-color-indice': flex.colors.indice,

  // Layout Colors
  '--bk-layout-color-line': layout.colors.line,
  '--bk-layout-color-flat': layout.colors.flat,
  '--bk-layout-color-indice': layout.colors.indice,

  // Padder Color
  '--bk-padder-color': padder.color,
})

export function Config({
  children,
  base,
  flex,
  baseline,
  guide,
  layout,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()

  const value = React.useMemo(() => {
    const newConfig: Config = {
      base: base ?? parentConfig.base,
      baseline: { ...parentConfig.baseline, ...baseline },
      guide: { ...parentConfig.guide, ...guide },
      spacer: { ...parentConfig.spacer, ...spacer },
      box: { ...parentConfig.box, ...box },
      flex: { ...parentConfig.flex, ...flex },
      layout: { ...parentConfig.layout, ...layout },
      padder: { ...parentConfig.padder, ...padder },
    }

    return {
      ...newConfig,
      cssVariables: createCSSVariables(newConfig),
    }
  }, [base, parentConfig.base, parentConfig.baseline, parentConfig.guide, parentConfig.spacer, parentConfig.box, parentConfig.flex, parentConfig.layout, parentConfig.padder, baseline, guide, spacer, box, flex, layout, padder])

  return (
    <ConfigContext.Provider value={value}>
      <div style={value.cssVariables}>{children}</div>
    </ConfigContext.Provider>
  )
}