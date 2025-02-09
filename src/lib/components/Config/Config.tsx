/**
 * @file Config Component
 * @description Theme and configuration provider for baseline-kit components
 * @module components
 */

import * as React from 'react'
import { BaselineVariant } from '@components'
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
  line: string;
  /** Color for flat surface visuals */
  flat: string;
  /** Color for measurement indicators */
  indice: string;
}

/** Complete configuration schema for baseline-kit. */
export type Config = {
  /** Base unit for spacing calculations */
  base: number;
  /** Guide component configuration */
  guide: {
    variant: GuideVariant;
    debugging: DebuggingMode;
    colors: Record<GuideVariant, string>;
  };
  /** Baseline component configuration */
  baseline: {
    variant: BaselineVariant;
    debugging: DebuggingMode;
    colors: Record<BaselineVariant, string>;
  };
  /** Stack component configuration */
  flex: {
    colors: Colors;
    debugging: DebuggingMode;
  };
  /** Layout component configuration */
  layout: {
    colors: Colors;
    debugging: DebuggingMode;
  };
  /** Spacer component configuration */
  spacer: {
    variant: Variant;
    debugging: DebuggingMode;
    colors: Colors;
  };
  /** Box component configuration */
  box: {
    colors: Colors;
    debugging: DebuggingMode;
  };
  /** Padder component configuration */
  padder: {
    color: string;
    debugging: DebuggingMode;
  };
}

const ConfigContext = React.createContext<Config | null>(null)
ConfigContext.displayName = 'ConfigContext'

export const useDefaultConfig = () => React.use(ConfigContext) ?? DEFAULT_CONFIG

type ConfigProps = {
  children: React.ReactNode;
  /** Base unit for spacing calculations */
  base?: number;
  /** Baseline component overrides */
  baseline?: Partial<Config['baseline']>;
  /** Flex component overrides */
  flex?: Partial<Config['flex']>;
  /** Layout component overrides */
  layout?: Partial<Config['layout']>;
  /** Guide component overrides */
  guide?: Partial<Config['guide']>;
  /** Spacer component overrides */
  spacer?: Partial<Config['spacer']>;
  /** Box component overrides */
  box?: Partial<Config['box']>;
  /** Padder component overrides */
  padder?: Partial<Config['padder']>;
}

/** Creates CSS variables from the configuration object. */
export const createCSSVariables = ({
  base,
  baseline,
  guide,
  flex,
  spacer,
  layout,
  box,
  padder,
}: Config): Record<string, string> => ({
  '--bk-base': `${base}px`,

  // Baseline Colors
  '--bk-baseline-color-line': baseline.colors.line,
  '--bk-baseline-color-flat': baseline.colors.flat,

  // Guide Colors
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
  '--bk-stack-color-line': flex.colors.line,
  '--bk-stack-color-flat': flex.colors.flat,
  '--bk-stack-color-indice': flex.colors.indice,

  // Layout Colors
  '--bk-layout-color-line': layout.colors.line,
  '--bk-layout-color-flat': layout.colors.flat,
  '--bk-layout-color-indice': layout.colors.indice,

  // Padder Color
  '--bk-padder-color': padder.color,
})

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
  }, [
    base,
    parentConfig.base,
    parentConfig.baseline,
    parentConfig.guide,
    parentConfig.spacer,
    parentConfig.box,
    parentConfig.flex,
    parentConfig.layout,
    parentConfig.padder,
    baseline,
    guide,
    spacer,
    box,
    flex,
    layout,
    padder
  ])

  return (
    <ConfigContext value={value}>
      {children}
    </ConfigContext>
  )
}