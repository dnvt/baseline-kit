/** @jsxImportSource remix/ui */

import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  createBaselineDescriptor,
  formatValue,
  type BaselineVariant,
  type ConfigSchema,
  type SpacingProps,
} from '@baseline-kit/core'
import {
  getConfig,
  classNames,
  mergeStyles,
  resolveDebugging,
  createElementObserverBridge,
  createVirtualBridge,
  queueNativeUpdate,
  type NativeComponent,
} from './shared'
import { Config } from './Config'
import { configuredClientEntry } from './shared'

export type { BaselineVariant }

export type BaselineProps = SpacingProps & {
  variant?: BaselineVariant
  width?: number | string
  height?: number | string
  base?: number
  color?: string
  debugging?: 'none' | 'hidden' | 'visible'
  className?: string
  style?: Record<string, string | number | null | undefined>
  children?: RemixNode
  ssrMode?: boolean
}

type RuntimeBaselineProps = BaselineProps & {
  __baselineConfig?: ConfigSchema
}

function BaselineImpl(handle: Handle<RuntimeBaselineProps>) {
  let dimensions = { width: 0, height: 0 }
  const requestUpdate = () => {
    queueNativeUpdate(handle)
  }
  const observer = createElementObserverBridge((next) => {
    if (next.width === dimensions.width && next.height === dimensions.height)
      return
    dimensions = next
    requestUpdate()
  })
  const virtual = createVirtualBridge(
    handle,
    observer.getElement,
    requestUpdate
  )

  return () => {
    const props = handle.props
    const config =
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    const base = props.base ?? config.base
    const variant = props.variant ?? config.baseline.variant
    const debugging = resolveDebugging(
      props.debugging,
      config.baseline.debugging
    )
    const descriptor = createBaselineDescriptor({
      base,
      colors: config.baseline.colors,
      variant,
      width: props.width,
      height: props.height,
      color: props.color,
      containerWidth: dimensions.width,
      containerHeight: dimensions.height,
      spacing: {
        padding: props.padding,
        block: props.block,
        inline: props.inline,
      },
      isVisible: debugging.isShown,
    })

    if (props.ssrMode) {
      return (
        <div
          className={classNames('bk-bas', 'bk-h', 'bk-ssr', props.className)}
          data-testid="baseline"
          aria-hidden={true}
          style={mergeStyles(
            descriptor.containerStyle,
            {
              width: formatValue(props.width ?? '100%'),
              height: formatValue(props.height ?? '100%'),
            },
            props.style
          )}
        />
      )
    }

    if (debugging.isShown) {
      handle.queueTask(() => virtual.setConfig(descriptor.rowCount, base))
    }

    const range = virtual.getRange(descriptor.rowCount)
    const rows = debugging.isShown
      ? Array.from(
          { length: Math.max(0, range.end - range.start) },
          (_, index) => {
            const rowIndex = range.start + index
            return (
              <div
                className="bk-row"
                key={rowIndex}
                data-row-index={rowIndex}
                style={descriptor.getRowStyle(rowIndex)}
              />
            )
          }
        )
      : []

    // Runtime mixins contain callbacks and must not be serialized into a
    // parent client entry's props during SSR. The client entry recreates
    // the descriptor while hydrating.
    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid="baseline"
        aria-hidden={true}
        style={mergeStyles(
          descriptor.containerStyle,
          {
            // Keep the SSR document useful even before the package stylesheet
            // is loaded. The CSS variables remain the canonical runtime path.
            width: formatValue(props.width ?? '100%'),
            height: formatValue(props.height ?? '100%'),
          },
          props.style
        )}
        mix={
          typeof window === 'undefined' || props.ssrMode
            ? undefined
            : observer.attach
        }
      >
        {rows}
      </div>
    )
  }
}

export const Baseline: NativeComponent<BaselineProps> =
  configuredClientEntry<BaselineProps>(
    `${import.meta.url}#Baseline`,
    BaselineImpl
  ) as unknown as NativeComponent<BaselineProps>
