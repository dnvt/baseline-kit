import { type Handle } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import {
  DEFAULT_CONFIG,
  calculateSnappedSpacing,
  createBoxDescriptor,
  parsePadding,
  type SnappingMode,
  type Padding,
  type ConfigSchema,
} from '@baseline-kit/core'
import { Config } from './Config'
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

export type { SnappingMode }

export type BoxProps = {
  colSpan?: number
  rowSpan?: number
  span?: number
  snapping?: SnappingMode
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

function BoxImpl(handle: Handle<RuntimeBoxProps>) {
  let currentBase = DEFAULT_CONFIG.base
  let currentSnapping: SnappingMode = 'clamp'
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
      currentSnapping
    )
    requestUpdate()
  })

  return () => {
    const props = handle.props
    const config =
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    const snapping = props.snapping ?? 'clamp'
    const debug = resolveDebugging(props.debugging, config.box.debugging)
    const initialPadding = parsePadding({
      padding: props.padding,
      block: props.block,
      inline: props.inline,
    })
    currentBase = config.base
    currentSnapping = snapping
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

    const padder = jsx(Padder, {
      block: [padding.top, padding.bottom],
      inline: [padding.left, padding.right],
      width: 'fit-content',
      height: props.height,
      debugging: debug.debugging,
      // Box owns the measured snap; the inner Padder must honor each new
      // padding value instead of caching a second independent measurement.
      ssrMode: true,
      children: props.children,
    })

    return jsx('div', {
      className: classNames(
        ...descriptor.classTokens.map((token) => `bk-${token}`),
        props.className
      ),
      'data-testid': 'box',
      style: mergeStyles(
        descriptor.boxStyle,
        descriptor.gridSpanStyle,
        props.style
      ),
      mix:
        typeof window === 'undefined' || props.ssrMode || snapping === 'none'
          ? undefined
          : observer.attach,
      children: jsx(Config, {
        __baselineConfig: config,
        base: 1,
        spacer: { variant: 'flat' },
        children: padder,
      }),
    })
  }
}

export const Box: NativeComponent<BoxProps> = configuredClientEntry<BoxProps>(
  `${import.meta.url}#Box`,
  BoxImpl
) as unknown as NativeComponent<BoxProps>
