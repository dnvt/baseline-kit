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
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  queueNativeUpdate,
  resolveDebugging,
  type NativeComponent,
} from './shared'

export type PadderProps = {
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
}

const RuntimeSpacer = Spacer as unknown as NativeComponent<
  SpacerProps & { __baselineConfig?: ConfigSchema }
>

const fullRow = { gridColumn: '1 / -1' }
const middleColumn = { gridRow: '2 / 3' }
const center = { gridRow: '2 / 3', gridColumn: '2 / 3' }

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
    const config =
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
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
          data-testid="padder"
          mix={mix}
          style={mergeStyles(descriptor.containerStyle, props.style)}
        >
          {props.children}
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
      padding.top >= 0 ? (
        <div key="top" style={fullRow}>
          {renderSpacer('100%', padding.top)}
        </div>
      ) : null,
      padding.left >= 0 ? (
        <div key="left" style={middleColumn}>
          {renderSpacer(padding.left, '100%')}
        </div>
      ) : null,
      <div
        key="content"
        className="bk-pad-content"
        data-testid="padder-content"
        style={center}
      >
        {props.children}
      </div>,
      padding.right >= 0 ? (
        <div key="right" style={middleColumn}>
          {renderSpacer(padding.right, '100%')}
        </div>
      ) : null,
      padding.bottom >= 0 ? (
        <div key="bottom" style={fullRow}>
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
        data-testid="padder"
        mix={mix}
        style={mergeStyles(descriptor.containerStyle, props.style)}
      >
        {children}
      </div>
    )
  }
}

export const Padder: NativeComponent<PadderProps> =
  configuredClientEntry<PadderProps>(
    `${import.meta.url}#Padder`,
    PadderImpl
  ) as unknown as NativeComponent<PadderProps>
