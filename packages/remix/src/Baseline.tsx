/** @jsxImportSource remix/ui */

import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  canCompactBaselinePaint,
  createBaselineDescriptor,
  formatValue,
  type BaselineVariant,
  type ConfigSchema,
  type SpacingProps,
} from '@baseline-kit/core'
import {
  getConfig,
  classNames,
  compactStyle,
  getDOMAttributes,
  mergeStyles,
  normalizeConfigSnapshot,
  resolveDebugging,
  createElementObserverBridge,
  createVirtualBridge,
  queueNativeUpdate,
  type NativeComponent,
  type NativeDOMAttributes,
} from './shared'
import { Config } from './Config'
import { configuredClientEntry } from './shared'

export type { BaselineVariant }

export type BaselineProps = SpacingProps &
  NativeDOMAttributes & {
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
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
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
    const compactPaint = canCompactBaselinePaint({
      base,
      contentHeight: descriptor.contentHeight,
      domDiagnostics: config.domDiagnostics,
      className: props.className,
      style: props.style,
    })

    if (props.ssrMode) {
      return (
        <div
          className={classNames(
            'bk-bas',
            'bk-h',
            'bk-ssr',
            `bk-${variant}`,
            props.className
          )}
          data-testid={config.domDiagnostics ? 'baseline' : undefined}
          aria-hidden={true}
          style={mergeStyles(
            compactStyle(descriptor.containerStyle, {
              '--bkbl-w': '100%',
              '--bkbl-h': '100%',
              '--bkbl-cl': DEFAULT_CONFIG.baseline.colors.line,
              '--bkbl-cf': DEFAULT_CONFIG.baseline.colors.flat,
              '--bkbl-c':
                variant === 'line' ? 'var(--bkbl-cl)' : 'var(--bkbl-cf)',
            }),
            compactStyle(
              {
                width: formatValue(props.width ?? '100%'),
                height: formatValue(props.height ?? '100%'),
              },
              { width: '100%', height: '100%' }
            ),
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
      debugging.isShown && !compactPaint
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
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          `bk-${variant}`,
          compactPaint && 'bk-compact',
          props.className
        )}
        data-testid={config.domDiagnostics ? 'baseline' : undefined}
        aria-hidden={true}
        style={mergeStyles(
          compactStyle(
            {
              ...descriptor.containerStyle,
              ...(compactPaint ? { '--bkbl-b': `${base}px` } : {}),
            },
            {
              '--bkbl-w': '100%',
              '--bkbl-h': '100%',
              '--bkbl-b': '8px',
              '--bkbl-cl': DEFAULT_CONFIG.baseline.colors.line,
              '--bkbl-cf': DEFAULT_CONFIG.baseline.colors.flat,
              '--bkbl-c':
                variant === 'line' ? 'var(--bkbl-cl)' : 'var(--bkbl-cf)',
            }
          ),
          compactStyle(
            {
              width: formatValue(props.width ?? '100%'),
              height: formatValue(props.height ?? '100%'),
            },
            { width: '100%', height: '100%' }
          ),
          props.style
        )}
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
