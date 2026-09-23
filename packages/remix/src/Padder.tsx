/** @jsxImportSource remix/ui */

import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  calculateSnappedSpacing,
  createPadderDescriptor,
  parsePadding,
  type ConfigSchema,
  type Padding,
  type Spacing,
} from '@baseline-kit/core'
import { Config } from './Config'
import { configuredClientEntry } from './shared'
import { Spacer, type SpacerProps } from './Spacer'
import {
  classNames,
  compactStyle,
  getDOMAttributes,
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  normalizeConfigSnapshot,
  queueNativeUpdate,
  resolveDebugging,
  type NativeComponent,
  type NativeDOMAttributes,
} from './shared'

export type PadderProps = NativeDOMAttributes & {
  width?: number | string
  height?: number | string
  debugging?: 'none' | 'hidden' | 'visible'
  className?: string
  style?: Record<string, string | number | null | undefined>
  block?: Spacing
  inline?: Spacing
  padding?: Parameters<typeof parsePadding>[0]['padding']
  indicatorNode?: (value: number, type: 'width' | 'height') => RemixNode
  children?: RemixNode
  ssrMode?: boolean
}

type RuntimePadderProps = PadderProps & {
  __baselineConfig?: ConfigSchema
  preserveContentHost?: boolean
}

const RuntimeSpacer = Spacer as unknown as NativeComponent<
  SpacerProps & { __baselineConfig?: ConfigSchema }
>

function PadderImpl(handle: Handle<RuntimePadderProps>) {
  let base = DEFAULT_CONFIG.base
  let initialPadding: Padding = parsePadding({})
  let snappedPadding: Padding | null = null
  const observer = createElementObserverBridge(({ height }) => {
    if (handle.props.ssrMode || snappedPadding || height === 0) return
    snappedPadding = calculateSnappedSpacing(
      height,
      base,
      initialPadding,
      'height'
    )
    queueNativeUpdate(handle)
  })

  return () => {
    const props = handle.props
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
    const debug = resolveDebugging(props.debugging, config.padder.debugging)
    base = config.base
    initialPadding = parsePadding({
      padding: props.padding,
      block: props.block,
      inline: props.inline,
    })
    const padding = props.ssrMode
      ? initialPadding
      : (snappedPadding ?? initialPadding)
    const mix =
      typeof window === 'undefined' || props.ssrMode
        ? undefined
        : observer.attach
    const descriptor = createPadderDescriptor({
      base: config.base,
      color: config.padder.color,
      width: props.width,
      height: props.height,
      padding,
      enableSpacers: !debug.isNone,
      isVisible: debug.isShown,
    })

    if (debug.isNone) {
      return (
        <div
          className={classNames(
            ...descriptor.classTokens.map((token) => `bk-${token}`),
            props.className
          )}
          data-testid={config.domDiagnostics ? 'padder' : undefined}
          mix={mix}
          style={mergeStyles(
            compactStyle(descriptor.containerStyle, {
              '--bkpd-w': 'auto',
              '--bkpd-h': 'auto',
              '--bkpd-b': '8px',
              '--bkpd-c': DEFAULT_CONFIG.padder.color,
            }),
            props.style
          )}
          {...getDOMAttributes(props)}
        >
          {props.preserveContentHost ? (
            <div
              key="content"
              className="bk-pad-content"
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
            >
              {props.children}
            </div>
          ) : (
            props.children
          )}
        </div>
      )
    }

    const spacerVariant = config.spacer.variant
    const renderSpacer = (width: number | string, height: number | string) => (
      <RuntimeSpacer
        __baselineConfig={config}
        width={width === '100%' ? undefined : width}
        height={height === '100%' ? undefined : height}
        variant={spacerVariant}
        debugging={debug.debugging}
        indicatorNode={props.indicatorNode}
      />
    )

    const children = [
      padding.top > 0 ? (
        <div key="top" className="bk-pad-top">
          {renderSpacer('100%', padding.top)}
        </div>
      ) : null,
      padding.left > 0 ? (
        <div key="left" className="bk-pad-left">
          {renderSpacer(padding.left, '100%')}
        </div>
      ) : null,
      <div
        key="content"
        className="bk-pad-content"
        data-testid={config.domDiagnostics ? 'padder-content' : undefined}
      >
        {props.children}
      </div>,
      padding.right > 0 ? (
        <div key="right" className="bk-pad-right">
          {renderSpacer(padding.right, '100%')}
        </div>
      ) : null,
      padding.bottom > 0 ? (
        <div key="bottom" className="bk-pad-bottom">
          {renderSpacer('100%', padding.bottom)}
        </div>
      ) : null,
    ]

    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'padder' : undefined}
        mix={mix}
        style={mergeStyles(
          compactStyle(descriptor.containerStyle, {
            '--bkpd-w': 'auto',
            '--bkpd-h': 'auto',
            '--bkpd-b': '8px',
            '--bkpd-c': DEFAULT_CONFIG.padder.color,
          }),
          props.style
        )}
        {...getDOMAttributes(props)}
      >
        {children}
      </div>
    )
  }
}

const RuntimePadder = configuredClientEntry<RuntimePadderProps>(
  `${import.meta.url}#Padder`,
  PadderImpl
) as unknown as NativeComponent<RuntimePadderProps>

export const Padder: NativeComponent<PadderProps> =
  RuntimePadder as unknown as NativeComponent<PadderProps>

/** @internal Used by Box to preserve its keyed content host across debug modes. */
export const PadderForBox = RuntimePadder
