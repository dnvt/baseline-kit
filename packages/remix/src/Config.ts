import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  type ConfigOverrides,
  mergeConfig,
  type ConfigSchema,
} from '@baseline-kit/core'

export type { ConfigSchema } from '@baseline-kit/core'
export type { DebuggingMode } from '@baseline-kit/core'

export type ConfigProps = ConfigOverrides & {
  children?: RemixNode
}

type RuntimeConfigProps = ConfigProps & {
  /** Internal bridge for independent client-entry hydration boundaries. */
  __baselineConfig?: ConfigSchema
}

function ConfigImpl(handle: Handle<RuntimeConfigProps, ConfigSchema>) {
  return () => {
    const parentConfig =
      handle.props.__baselineConfig ??
      (handle.context.get(Config) as ConfigSchema | undefined) ??
      DEFAULT_CONFIG
    const value = mergeConfig({
      parentConfig,
      base: handle.props.base,
      domDiagnostics: handle.props.domDiagnostics,
      baseline: handle.props.baseline,
      guide: handle.props.guide,
      spacer: handle.props.spacer,
      box: handle.props.box,
      padder: handle.props.padder,
    })

    handle.context.set(value)
    return handle.props.children ?? null
  }
}

/**
 * Framework-native configuration scope. It is a zero-DOM component: the
 * resolved value travels through Remix context and is emitted by each
 * consuming component on its own host element.
 */
export const Config = ConfigImpl as unknown as (
  handle: Handle<ConfigProps, ConfigSchema>
) => () => RemixNode

export { mergeConfig }
