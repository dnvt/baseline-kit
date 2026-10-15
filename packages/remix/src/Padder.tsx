/** @jsxImportSource remix/component */

import { type Handle, type RemixNode } from 'remix/component'
import {
  DEFAULT_CONFIG,
  nextSnap,
  type SnapMeasurement,
  type SnapState,
  createPadderDescriptor,
  mergeConfig,
  parsePadding,
  type ConfigSchema,
  type Padding,
  type PadderOptions,
  cx,
  getDOMAttributes,
  resolveDebugState,
} from '@baseline-kit/core'
import { configuredClientEntry } from './shared'
import { isScaledLayout } from '@baseline-kit/dom/measure'
import { Spacer, type IndicatorNode, type SpacerProps } from './Spacer'
import {
  createElementObserverBridge,
  createConfigReader,
  mergeStyles,
  queueNativeUpdate,
  snapChanged,
  type NativeComponent,
  type NativeHostProps,
} from './shared'

export type PadderProps = PadderOptions &
  NativeHostProps & {
    children?: RemixNode
    indicatorNode?: IndicatorNode
  }

type RuntimePadderProps = PadderProps & {
  __baselineConfig?: ConfigSchema
  preserveContentHost?: boolean
}

const RuntimeSpacer = Spacer as unknown as NativeComponent<
  SpacerProps & { __baselineConfig?: ConfigSchema }
>

function PadderImpl(handle: Handle<RuntimePadderProps>) {
  const readConfig = createConfigReader(handle)
  let base = DEFAULT_CONFIG.base
  let initialPadding: Padding = parsePadding({})
  // Same snapping rules as Box (see nextSnap), always in height mode.
  let snap: SnapState | null = null
  let renderedPadding: Padding = initialPadding
  let lastMeasure: SnapMeasurement | null = null

  const applySnap = (measure: SnapMeasurement) => {
    const next = nextSnap(
      snap,
      { base, mode: 'height', snapEdge: 'bottom', initial: initialPadding },
      measure
    )
    const changed = snapChanged(snap, next)
    snap = next
    return changed
  }

  const observer = createElementObserverBridge(
    ({ height }, host, rendered) => {
      if (handle.props.ssrMode || height === 0) return
      lastMeasure = {
        height,
        // The padding in the DOM at measurement time (mid-transition values
        // included), else the last committed padding.
        rendered: { ...renderedPadding, ...rendered },
        scaled: isScaledLayout(host),
      }
      if (applySnap(lastMeasure)) queueNativeUpdate(handle)
    },
    { readPadding: true }
  )

  return () => {
    const props = handle.props
    const config = readConfig()
    const debug = resolveDebugState(props.debugging, config.padder.debugging)
    base = config.base
    initialPadding = parsePadding({
      padding: props.padding,
      block: props.block,
      inline: props.inline,
    })
    if (props.ssrMode) {
      snap = null
      lastMeasure = null
    } else if (lastMeasure) {
      applySnap(lastMeasure)
    }
    const padding = props.ssrMode
      ? initialPadding
      : (snap?.padding ?? initialPadding)
    renderedPadding = padding
    const mix =
      typeof window === 'undefined' || props.ssrMode
        ? undefined
        : observer.attach
    const descriptor = createPadderDescriptor({
      color: config.padder.color,
      width: props.width,
      height: props.height,
      padding,
      enableSpacers: !debug.isNone,
      isVisible: debug.isShown,
      contentHost: props.preserveContentHost,
    })

    if (debug.isNone) {
      return (
        <div
          className={cx(
            ...descriptor.classTokens.map((token) => `bk-${token}`),
            props.className
          )}
          data-testid={config.domDiagnostics ? 'padder' : undefined}
          mix={mix}
          style={mergeStyles(descriptor.containerStyle, props.style)}
          {...getDOMAttributes(props)}
        >
          {props.preserveContentHost ? (
            <div
              key="content"
              className="bk-pad-content"
              style={descriptor.contentStyle}
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
    // Spacers draw at base 1, so they needn't follow a rem base.
    const spacerConfig =
      config.baseRem === undefined
        ? config
        : mergeConfig({ parentConfig: config, base: config.base })
    // Base 1 keeps the snapped padding exact instead of rounding it to the grid.
    const renderSpacer = (width: number | string, height: number | string) => (
      <RuntimeSpacer
        __baselineConfig={spacerConfig}
        base={1}
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
        <div key="left" className="bk-pad-left" style={descriptor.sideStyle}>
          {renderSpacer(padding.left, '100%')}
        </div>
      ) : null,
      <div
        key="content"
        className="bk-pad-content"
        style={descriptor.contentStyle}
        data-testid={config.domDiagnostics ? 'padder-content' : undefined}
      >
        {props.children}
      </div>,
      padding.right > 0 ? (
        <div key="right" className="bk-pad-right" style={descriptor.sideStyle}>
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
        className={cx(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'padder' : undefined}
        mix={mix}
        style={mergeStyles(descriptor.containerStyle, props.style)}
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
