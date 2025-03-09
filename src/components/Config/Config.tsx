import * as React from 'react'
import { BaselineVariant } from '@/components'
import { DEFAULT_CONFIG } from './defaults'
import type { GuideVariant, Variant } from '../types'

/**
 * Controls component debugging visibility and behavior.
 *
 * @remarks
 * - `none`: Debug features are fully disabled
 * - `hidden`: Debug elements exist in DOM but are not visible
 * - `visible`: Debug elements are fully rendered and visible
 */
export type DebuggingMode = 'none' | 'hidden' | 'visible'

/** Color configuration for component themes. */
type Colors = {
  /** Color for line-based visuals */
  line: string
  /** Color for flat surface visuals */
  flat: string
  /** Color for measurement indicators */
  text: string
}

/** Complete configuration schema for baseline-kit. */
export type ConfigSchema = {
  /** Base unit for spacing calculations */
  base: number
  /** Guide component configuration */
  guide: {
    variant: GuideVariant
    debugging: DebuggingMode
    colors: Record<GuideVariant, string>
  }
  /** Baseline component configuration */
  baseline: {
    variant: BaselineVariant
    debugging: DebuggingMode
    colors: Record<BaselineVariant, string>
  }
  /** Stack component configuration */
  stack: {
    colors: Colors
    debugging: DebuggingMode
  }
  /** Layout component configuration */
  layout: {
    colors: Colors
    debugging: DebuggingMode
  }
  /** Spacer component configuration */
  spacer: {
    variant: Variant
    debugging: DebuggingMode
    colors: Colors
  }
  /** Box component configuration */
  box: {
    colors: Colors
    debugging: DebuggingMode
  }
  /** Padder component configuration */
  padder: {
    color: string
    debugging: DebuggingMode
  }
}

// Create the context
const ConfigContext = React.createContext<ConfigSchema>(DEFAULT_CONFIG)
ConfigContext.displayName = 'ConfigContext'

// Update to use React 19's use hook instead of useContext
export const useDefaultConfig = () => React.use(ConfigContext)

type ConfigProps = {
  children: React.ReactNode
  /** Base unit for spacing calculations */
  base?: number
  /** Baseline component overrides */
  baseline?: Partial<ConfigSchema['baseline']>
  /** Flex component overrides */
  stack?: Partial<ConfigSchema['stack']>
  /** Layout component overrides */
  layout?: Partial<ConfigSchema['layout']>
  /** Guide component overrides */
  guide?: Partial<ConfigSchema['guide']>
  /** Spacer component overrides */
  spacer?: Partial<ConfigSchema['spacer']>
  /** Box component overrides */
  box?: Partial<ConfigSchema['box']>
  /** Padder component overrides */
  padder?: Partial<ConfigSchema['padder']>
}

// Utils -----------------------------------------------------------------------

/** Parameters for creating CSS variables */
type CSSVariablesParams = {
  /** Base unit for spacing calculations */
  base: number
  /** Baseline component configuration */
  baseline: ConfigSchema['baseline']
  /** Guide component configuration */
  guide: ConfigSchema['guide']
  /** Stack component configuration */
  stack: ConfigSchema['stack']
  /** Spacer component configuration */
  spacer: ConfigSchema['spacer']
  /** Layout component configuration */
  layout: ConfigSchema['layout']
  /** Box component configuration */
  box: ConfigSchema['box']
  /** Padder component configuration */
  padder: ConfigSchema['padder']
}

/**
 * Creates CSS variables from the configuration object.
 * These variables are used throughout the component library.
 */
export const createCSSVariables = (
  params: CSSVariablesParams
): Record<string, string> => {
  const { base, baseline, guide, stack, spacer, layout, box, padder } = params

  return {
    '--bkb': `${base}px`,

    // Baseline Colors
    '--bkbcl': baseline.colors.line,
    '--bkbcf': baseline.colors.flat,

    // Guide Colors
    '--bkgcl': guide.colors.line,
    '--bkgcp': guide.colors.pattern,
    '--bkgca': guide.colors.auto,
    '--bkgcf': guide.colors.fixed,

    // Spacer Colors
    '--bkscl': spacer.colors.line,
    '--bkscf': spacer.colors.flat,
    '--bksci': spacer.colors.text,

    // Box Colors
    '--bkxcl': box.colors.line,
    '--bkxcf': box.colors.flat,
    '--bkxci': box.colors.text,

    // Flex Colors
    '--bkkcl': stack.colors.line,
    '--bkkcf': stack.colors.flat,
    '--bkkci': stack.colors.text,

    // Layout Colors
    '--bklcl': layout.colors.line,
    '--bklcf': layout.colors.flat,
    '--bklci': layout.colors.text,

    // Padder Color
    '--bkpc': padder.color,
  }
}

/** Parameters for merging configuration */
type MergeConfigParams = {
  /** Parent configuration to extend */
  parentConfig: ConfigSchema
  /** Base unit override */
  base?: number
  /** Baseline component overrides */
  baseline?: Partial<ConfigSchema['baseline']>
  /** Guide component overrides */
  guide?: Partial<ConfigSchema['guide']>
  /** Spacer component overrides */
  spacer?: Partial<ConfigSchema['spacer']>
  /** Box component overrides */
  box?: Partial<ConfigSchema['box']>
  /** Stack component overrides */
  stack?: Partial<ConfigSchema['stack']>
  /** Layout component overrides */
  layout?: Partial<ConfigSchema['layout']>
  /** Padder component overrides */
  padder?: Partial<ConfigSchema['padder']>
}

/**
 * Merges parent config with overrides.
 * Creates a new config object without mutating the parent.
 */
export const mergeConfig = (params: MergeConfigParams): ConfigSchema => {
  const {
    parentConfig,
    base,
    baseline,
    guide,
    spacer,
    box,
    stack,
    layout,
    padder,
  } = params

  return {
    base: base ?? parentConfig.base,
    baseline: { ...parentConfig.baseline, ...baseline },
    guide: { ...parentConfig.guide, ...guide },
    spacer: { ...parentConfig.spacer, ...spacer },
    box: { ...parentConfig.box, ...box },
    stack: { ...parentConfig.stack, ...stack },
    layout: { ...parentConfig.layout, ...layout },
    padder: { ...parentConfig.padder, ...padder },
  }
}

/**
 * Configuration provider for baseline-kit components.
 *
 * @remarks
 * Config provides theme and debugging settings to all nested components.
 * It allows for:
 * - Global base unit configuration
 * - Component-specific color themes
 * - Debug mode control
 * - Visual style customization
 *
 * Configs can be nested to override settings for specific sections.
 *
 * @example
 * ```tsx
 * // Basic global configuration
 * <Config base={8}>
 *   <App />
 * </Config>
 *
 * // Component-specific overrides
 * <Config
 *   base={8}
 *   guide={{
 *     debugging: "visible",
 *     colors: {
 *       line: "rgba(255,0,0,0.2)",
 *       pattern: "rgba(0,0,255,0.2)"
 *     }
 *   }}
 * >
 *   <Layout>...</Layout>
 * </Config>
 *
 * // Nested configurations
 * <Config base={8}>
 *   <div>Uses 8px base</div>
 *   <Config base={4}>
 *     <div>Uses 4px base</div>
 *   </Config>
 * </Config>
 * ```
 */
export function Config({
  children,
  base,
  stack,
  baseline,
  guide,
  layout,
  spacer,
  box,
  padder,
}: ConfigProps) {
  const parentConfig = useDefaultConfig()

  const value = React.useMemo(() => {
    return mergeConfig({
      parentConfig,
      base,
      baseline,
      guide,
      spacer,
      box,
      stack,
      layout,
      padder,
    })
  }, [parentConfig, base, baseline, guide, spacer, box, stack, layout, padder])

  return <ConfigContext value={value}>{children}</ConfigContext>
}
