/** @jsxImportSource remix/ui */

import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  createSpacerDescriptor,
  type Variant,
  type ConfigSchema,
} from '@baseline-kit/core'
import { Config } from './Config'
import { configuredClientEntry } from './shared'
import {
  classNames,
  compactStyle,
  getDOMAttributes,
  getConfig,
  mergeStyles,
  normalizeConfigSnapshot,
  resolveDebugging,
  type NativeComponent,
  type NativeDOMAttributes,
} from './shared'

export type IndicatorNode = (
  value: number,
  type: 'width' | 'height'
) => RemixNode

export type SpacerProps = NativeDOMAttributes & {
  width?: number | string
  height?: number | string
  variant?: Variant
  color?: string
  base?: number
  debugging?: 'none' | 'hidden' | 'visible'
  className?: string
  style?: Record<string, string | number | null | undefined>
  children?: RemixNode
  indicatorNode?: IndicatorNode
  ssrMode?: boolean
}

type RuntimeSpacerProps = SpacerProps & {
  __baselineConfig?: ConfigSchema
}

function SpacerImpl(handle: Handle<RuntimeSpacerProps>) {
  return () => {
    const props = handle.props
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
    const base = props.base ?? config.base
    const variant = props.variant ?? config.spacer.variant
    const debugging = resolveDebugging(props.debugging, config.spacer.debugging)
    const descriptor = createSpacerDescriptor({
      base,
      colors: config.spacer.colors,
      width: props.width,
      height: props.height,
      color: props.color,
      variant,
      isVisible: debugging.isShown,
    })

    const measurements =
      debugging.isShown && props.indicatorNode
        ? [
            descriptor.normHeight !== 0 ? (
              <span key="height" className="bk-indicator" aria-hidden={true}>
                {props.indicatorNode(descriptor.normHeight, 'height')}
              </span>
            ) : null,
            descriptor.normWidth !== 0 ? (
              <span key="width" className="bk-indicator" aria-hidden={true}>
                {props.indicatorNode(descriptor.normWidth, 'width')}
              </span>
            ) : null,
          ]
        : null

    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'spacer' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        data-height={
          config.domDiagnostics ? `${descriptor.normHeight}px` : undefined
        }
        style={mergeStyles(
          compactStyle(descriptor.style, {
            '--bksp-w': 'var(--bk-wf, 100%)',
            '--bksp-h': 'var(--bk-hf, auto)',
            '--bksp-b': '8px',
            '--bksp-cl': DEFAULT_CONFIG.spacer.colors.line,
            '--bksp-cf': DEFAULT_CONFIG.spacer.colors.flat,
            '--bksp-ct': DEFAULT_CONFIG.spacer.colors.text,
          }),
          props.style
        )}
        {...getDOMAttributes(props)}
      >
        {measurements}
        {props.children}
      </div>
    )
  }
}

export const Spacer: NativeComponent<SpacerProps> =
  configuredClientEntry<SpacerProps>(
    `${import.meta.url}#Spacer`,
    SpacerImpl
  ) as unknown as NativeComponent<SpacerProps>
