/** @jsxImportSource remix/ui */

import { type Handle } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  calculateSnappedSpacing,
  createBoxDescriptor,
  parsePadding,
  type SnapEdge,
  type SnappingMode,
  type Padding,
  type ConfigSchema,
} from '@baseline-kit/core'
import { Config, type ConfigProps } from './Config'
import { configuredClientEntry } from './shared'
import { Padder } from './Padder'
import {
  classNames,
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  queueNativeUpdate,
  resolveDebugging,
  type NativeComponent,
} from './shared'
import type { RemixNode } from 'remix/ui'

export type { SnapEdge, SnappingMode }

export type BoxProps = {
  colSpan?: number
  rowSpan?: number
  span?: number
  snapping?: SnappingMode
  snapEdge?: SnapEdge
  width?: number | string
  height?: number | string
  debugging?: 'none' | 'hidden' | 'visible'
  className?: string
  style?: Record<string, string | number | null | undefined>
  padding?: Parameters<typeof parsePadding>[0]['padding']
  block?: Parameters<typeof parsePadding>[0]['block']
  inline?: Parameters<typeof parsePadding>[0]['inline']
  children?: RemixNode
  ssrMode?: boolean
}

type RuntimeBoxProps = BoxProps & {
  __baselineConfig?: ConfigSchema
}

const RuntimeConfig = Config as unknown as NativeComponent<
  ConfigProps & { __baselineConfig?: ConfigSchema }
>

function BoxImpl(handle: Handle<RuntimeBoxProps>) {
  let currentBase = DEFAULT_CONFIG.base
  let currentSnapping: SnappingMode = 'clamp'
  let currentSnapEdge: SnapEdge = 'bottom'
  let currentInitialPadding: Padding = parsePadding({})
  let snappedPadding: Padding | null = null

  const requestUpdate = () => {
    queueNativeUpdate(handle)
  }

  const observer = createElementObserverBridge((next) => {
    if (currentSnapping === 'none' || snappedPadding || next.height === 0) {
      return
    }

    snappedPadding = calculateSnappedSpacing(
      next.height,
      currentBase,
      currentInitialPadding,
      { mode: currentSnapping, snapEdge: currentSnapEdge }
    )
    requestUpdate()
  })

  return () => {
    const props = handle.props
    const config =
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    const snapping = props.snapping ?? 'clamp'
    const snapEdge = props.snapEdge ?? 'bottom'
    const debug = resolveDebugging(props.debugging, config.box.debugging)
    const initialPadding = parsePadding({
      padding: props.padding,
      block: props.block,
      inline: props.inline,
    })
    currentBase = config.base
    currentSnapping = snapping
    currentSnapEdge = snapEdge
    currentInitialPadding = initialPadding
    const padding =
      snapping === 'none' ? initialPadding : (snappedPadding ?? initialPadding)
    const descriptor = createBoxDescriptor({
      base: config.base,
      lineColor: config.box.colors.line,
      width: props.width,
      height: props.height,
      span: props.span,
      colSpan: props.colSpan,
      rowSpan: props.rowSpan,
      isVisible: debug.isShown,
    })

    const padder = (
      <Padder
        block={[padding.top, padding.bottom]}
        inline={[padding.left, padding.right]}
        width="fit-content"
        height={props.height}
        debugging={debug.debugging}
        // Box owns the measured snap; the inner Padder must honor each new
        // padding value instead of caching a second independent measurement.
        ssrMode={true}
      >
        {props.children}
      </Padder>
    )

    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid="box"
        style={mergeStyles(
          descriptor.boxStyle,
          descriptor.gridSpanStyle,
          props.style
        )}
        mix={
          typeof window === 'undefined' || props.ssrMode || snapping === 'none'
            ? undefined
            : observer.attach
        }
      >
        <RuntimeConfig
          __baselineConfig={config}
          base={1}
          spacer={{ variant: 'flat' }}
        >
          {padder}
        </RuntimeConfig>
      </div>
    )
  }
}

export const Box: NativeComponent<BoxProps> = configuredClientEntry<BoxProps>(
  `${import.meta.url}#Box`,
  BoxImpl
) as unknown as NativeComponent<BoxProps>
