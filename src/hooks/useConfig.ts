import { useMemo } from 'react'
import { Config, useDefaultConfig } from '@components'

/** Type helper that merges base configuration with component-specific settings. */
export type ComponentConfig<K extends keyof Config> = Config[K] & {
  /** Base unit for spacing calculations */
  base: number
}

/**
 * Hook for accessing component-specific theme configuration.
 *
 * @remarks
 * This hook provides:
 * - Access to component-specific theme settings
 * - Automatic base unit inheritance
 * - Memoized configuration to prevent unnecessary updates
 * - Type-safe configuration access
 *
 * It merges:
 * - Global base unit settings
 * - Component-specific configurations
 * - Theme-based color schemes
 *
 * @param component - Name of the component requesting configuration
 * @returns Merged configuration for the specific component
 *
 * @example
 * ```tsx
 * function Box() {
 *   const config = useConfig('box');
 *
 *   return (
 *     <div style={{
 *       '--box-base': `${config.base}px`,
 *       '--box-color': config.colors.line
 *     }}>
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useConfig<K extends keyof Config>(
  component: K
): ComponentConfig<K> {
  const defaultConfig = useDefaultConfig()
  return useMemo(() => {
    return Object.assign(
      { base: defaultConfig.base },
      defaultConfig[component]
    ) as ComponentConfig<K>
  }, [defaultConfig, component])
}
