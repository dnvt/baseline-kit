/** @jsxImportSource remix/component */

import { type Handle, type RemixNode } from 'remix/component'
import {
  createBaselineDescriptor,
  createBaselineFallbackStyle,
  type BaselineOptions,
  type BaselineVariant,
  type ConfigSchema,
  cx,
  getDOMAttributes,
  resolveDebugState,
} from '@baseline-kit/core'
import {
  createConfigReader,
  mergeStyles,
  createElementObserverBridge,
  createVirtualBridge,
  queueNativeUpdate,
  type NativeComponent,
  type NativeHostProps,
} from './shared'
import { configuredClientEntry } from './shared'

export type { BaselineVariant }

export type BaselineProps = BaselineOptions &
  NativeHostProps & {
    children?: RemixNode
  }

type RuntimeBaselineProps = BaselineProps & {
  __baselineConfig?: ConfigSchema
}

function BaselineImpl(handle: Handle<RuntimeBaselineProps>) {
  // Its rows or columns depend on the base: hydrate at the server's.
  const readConfig = createConfigReader(handle, { serverFirst: true })
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
    const config = readConfig()
    const base = props.base ?? config.base
    const variant = props.variant ?? config.baseline.variant
    const debugging = resolveDebugState(
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
      domDiagnostics: config.domDiagnostics,
      className: props.className,
      style: props.style,
    })

    if (props.ssrMode) {
      return (
        <div
          className={cx(
            'bk-bas',
            'bk-h',
            'bk-ssr',
            `bk-${variant}`,
            props.className
          )}
          data-testid={config.domDiagnostics ? 'baseline' : undefined}
          aria-hidden="true"
          style={mergeStyles(
            createBaselineFallbackStyle(props.width, props.height),
            props.style
          )}
          {...getDOMAttributes(props)}
        />
      )
    }

    if (debugging.isShown) {
      handle.queueTask(() => virtual.setConfig(descriptor.rowCount, base))
    }

    const range = virtual.getRange(descriptor.rowCount)
    const rows =
      debugging.isShown && !descriptor.compactPaint
        ? Array.from(
            { length: Math.max(0, range.end - range.start) },
            (_, index) => {
              const rowIndex = range.start + index
              return (
                <div
                  className="bk-row"
                  key={rowIndex}
                  data-row-index={config.domDiagnostics ? rowIndex : undefined}
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
        className={cx(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'baseline' : undefined}
        aria-hidden="true"
        style={mergeStyles(descriptor.containerStyle, props.style)}
        {...getDOMAttributes(props)}
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
