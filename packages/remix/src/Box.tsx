/** @jsxImportSource remix/component */

import { type Handle } from 'remix/component'
import {
  DEFAULT_CONFIG,
  nextSnap,
  type SnapMeasurement,
  type SnapState,
  mergeConfig,
  createBoxDescriptor,
  requiresSeparatePadder,
  parsePadding,
  type BoxElement,
  type BoxOptions,
  type SnapEdge,
  type SnappingMode,
  type Padding,
  type ConfigSchema,
  cx,
  getDOMAttributes,
  resolveDebugState,
} from '@baseline-kit/core'
import { Config, type ConfigProps } from './Config'
import { configuredClientEntry } from './shared'
import { isScaledLayout } from '@baseline-kit/dom/measure'
import { PadderForBox } from './Padder'
import {
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  normalizeConfigSnapshot,
  queueNativeUpdate,
  snapChanged,
  type NativeComponent,
  type NativeHostProps,
} from './shared'
import type { RemixNode } from 'remix/component'

export type { BoxElement, SnapEdge, SnappingMode }

export type BoxProps = BoxOptions &
  NativeHostProps & {
    children?: RemixNode
  }

type RuntimeBoxProps = BoxProps & {
  __baselineConfig?: ConfigSchema
}

const RuntimeConfig = Config as unknown as NativeComponent<
  ConfigProps & { __baselineConfig?: ConfigSchema }
>
// 6.x took `for`; 7.0 takes `htmlFor` like React. jsx() callers get no type
// error, so say once that the label is no longer associated.
let warnedLegacyFor = false

function warnLegacyFor(props: object) {
  if (warnedLegacyFor || (props as { for?: unknown }).for === undefined) return
  warnedLegacyFor = true
  console.warn(
    'baseline-kit: Box no longer reads `for`; pass `htmlFor` instead. The label is not associated with its control.'
  )
}

function BoxImpl(handle: Handle<RuntimeBoxProps>) {
  let currentBase = DEFAULT_CONFIG.base
  let currentSnapping: SnappingMode = 'clamp'
  let currentSnapEdge: SnapEdge = 'bottom'
  let currentInitialPadding: Padding = parsePadding({})
  // Snap with the shared rules (see nextSnap): on the first measurement, on
  // input changes, and whenever the natural height changes.
  let snap: SnapState | null = null
  let renderedPadding: Padding = currentInitialPadding
  let lastMeasure: SnapMeasurement | null = null

  const requestUpdate = () => {
    queueNativeUpdate(handle)
  }

  const applySnap = (measure: SnapMeasurement) => {
    const next = nextSnap(
      snap,
      {
        base: currentBase,
        mode: currentSnapping,
        snapEdge: currentSnapEdge,
        initial: currentInitialPadding,
      },
      measure
    )
    const changed = snapChanged(snap, next)
    snap = next
    return changed
  }

  // Measure the host so its own border and padding count toward the snap.
  const observer = createElementObserverBridge(
    (next, host, rendered) => {
      if (next.height === 0) return
      lastMeasure = {
        height: next.height,
        // The padding in the DOM at measurement time (mid-transition values
        // included), else the last committed padding.
        rendered: { ...renderedPadding, ...rendered },
        scaled: isScaledLayout(host),
      }
      if (applySnap(lastMeasure)) requestUpdate()
    },
    { readPadding: true }
  )

  return () => {
    const props = handle.props
    warnLegacyFor(props)
    const Element = (props.as ?? 'div') as 'label'
    const ContentElement = props.as && props.as !== 'div' ? 'span' : 'div'
    const semanticHost = props.as !== undefined
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
    const snapping = props.snapping ?? 'clamp'
    const snapEdge = props.snapEdge ?? 'bottom'
    const debug = resolveDebugState(props.debugging, config.box.debugging)
    const initialPadding = parsePadding({
      padding: props.padding,
      block: props.block,
      inline: props.inline,
    })
    currentBase = config.base
    currentSnapping = snapping
    currentSnapEdge = snapEdge
    currentInitialPadding = initialPadding
    // New inputs re-snap from the last measurement right away.
    if (snapping === 'none' || props.ssrMode) {
      // Not measured in these modes: forget the old snap and measurement.
      snap = null
      lastMeasure = null
    } else if (lastMeasure) {
      applySnap(lastMeasure)
    }
    const padding =
      snapping === 'none' ? initialPadding : (snap?.padding ?? initialPadding)
    renderedPadding = padding
    const separatePadder = semanticHost
      ? false
      : requiresSeparatePadder({
          className: props.className,
          style: props.style,
          width: props.width,
        })
    const observerMix =
      typeof window === 'undefined' || props.ssrMode || snapping === 'none'
        ? undefined
        : observer.attach
    const descriptor = createBoxDescriptor({
      base: config.base,
      lineColor: config.box.colors.line,
      flatColor: config.box.colors.flat,
      width: props.width,
      height: props.height,
      span: props.span,
      colSpan: props.colSpan,
      rowSpan: props.rowSpan,
      isVisible: debug.isShown,
      padding,
      paddingColor: config.padder.color,
    })
    const hostSpacingStyle = semanticHost
      ? descriptor.paddingDebugStyle
      : separatePadder
        ? undefined
        : mergeStyles(descriptor.spacingStyle, descriptor.paddingDebugStyle)

    return (
      <Element
        className={cx(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          semanticHost && 'bk-box-semantic-host',
          separatePadder && 'bk-box-separate-padder',
          debug.isShown && !separatePadder && 'bk-box-pad-visible',
          props.className
        )}
        data-testid={config.domDiagnostics ? 'box' : undefined}
        style={mergeStyles(
          descriptor.boxStyle,
          hostSpacingStyle,
          descriptor.gridSpanStyle,
          props.style
        )}
        {...getDOMAttributes(props)}
        htmlFor={props.as === 'label' ? props.htmlFor : undefined}
        data-bk-snap-state={
          config.domDiagnostics && snapping !== 'none' && !props.ssrMode
            ? snap
              ? 'measured'
              : 'pending'
            : undefined
        }
        mix={observerMix}
      >
        {/* Carry the config into this island. Box spacing is drawn in plain
            pixels, so content inside a Box snaps to whole pixels. */}
        <RuntimeConfig
          __baselineConfig={config}
          base={1}
          spacer={{ variant: 'flat' }}
        >
          {semanticHost ? (
            <ContentElement
              className="bk-box__grid"
              style={descriptor.spacingStyle}
            >
              <ContentElement
                className="bk-pad-content"
                data-testid={
                  config.domDiagnostics ? 'padder-content' : undefined
                }
              >
                {props.children}
              </ContentElement>
            </ContentElement>
          ) : separatePadder ? (
            <PadderForBox
              __baselineConfig={mergeConfig({
                parentConfig: config,
                base: 1,
                spacer: { variant: 'flat' },
              })}
              block={[padding.top, padding.bottom]}
              inline={[padding.left, padding.right]}
              width="fit-content"
              height={props.height}
              debugging={debug.debugging}
              preserveContentHost
              ssrMode
            >
              {props.children}
            </PadderForBox>
          ) : (
            <ContentElement
              className="bk-pad-content"
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
            >
              {props.children}
            </ContentElement>
          )}
        </RuntimeConfig>
      </Element>
    )
  }
}

export const Box: NativeComponent<BoxProps> = configuredClientEntry<BoxProps>(
  `${import.meta.url}#Box`,
  BoxImpl
) as unknown as NativeComponent<BoxProps>
