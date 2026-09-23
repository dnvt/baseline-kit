/** @jsxImportSource remix/ui */

import { type Handle } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  calculateSnappedSpacing,
  mergeConfig,
  createBoxDescriptor,
  requiresSeparatePadder,
  parsePadding,
  type SnapEdge,
  type SnappingMode,
  type Padding,
  type ConfigSchema,
} from '@baseline-kit/core'
import { Config, type ConfigProps } from './Config'
import { configuredClientEntry } from './shared'
import { Padder, type PadderProps } from './Padder'
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
import type { RemixNode } from 'remix/ui'

export type { SnapEdge, SnappingMode }

export type BoxProps = NativeDOMAttributes & {
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
const RuntimePadder = Padder as unknown as NativeComponent<
  PadderProps & { __baselineConfig?: ConfigSchema }
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
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
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
    const paddedConfig = mergeConfig({
      parentConfig: config,
      base: 1,
      spacer: { variant: 'flat' },
    })
    const separatePadder = requiresSeparatePadder({
      className: props.className,
      style: props.style,
      width: props.width,
      debugging: debug.debugging,
    })
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

    const mergedSpacingStyle = separatePadder
      ? undefined
      : compactStyle(
          {
            ...(padding.top > 0 || padding.bottom > 0
              ? {
                  gridTemplateRows: `${padding.top}px 1fr ${padding.bottom}px`,
                }
              : {}),
            ...(padding.left > 0 || padding.right > 0
              ? {
                  gridTemplateColumns: `${padding.left}px 1fr ${padding.right}px`,
                }
              : {}),
          },
          {
            gridTemplateRows: 'auto 1fr auto',
            gridTemplateColumns: 'auto 1fr auto',
          }
        )

    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          separatePadder && 'bk-box-separate-padder',
          debug.isShown && !debug.isNone && 'bk-box-pad-visible',
          props.className
        )}
        data-testid={config.domDiagnostics ? 'box' : undefined}
        style={mergeStyles(
          compactStyle(descriptor.boxStyle, {
            '--bkbx-w': 'fit-content',
            '--bkbx-h': 'fit-content',
            '--bkbx-cl': DEFAULT_CONFIG.box.colors.line,
          }),
          separatePadder
            ? debug.isShown && !debug.isNone
              ? compactStyle(
                  { '--bkpd-c': config.padder.color },
                  { '--bkpd-c': DEFAULT_CONFIG.padder.color }
                )
              : undefined
            : mergedSpacingStyle,
          descriptor.gridSpanStyle,
          props.style
        )}
        {...getDOMAttributes(props)}
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
          {separatePadder ? (
            <RuntimePadder
              __baselineConfig={paddedConfig}
              block={[padding.top, padding.bottom]}
              inline={[padding.left, padding.right]}
              width="fit-content"
              height={props.height}
              debugging={debug.debugging}
              ssrMode
            >
              {props.children}
            </RuntimePadder>
          ) : (
            <div
              className="bk-pad-content"
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
            >
              {props.children}
            </div>
          )}
        </RuntimeConfig>
      </div>
    )
  }
}

export const Box: NativeComponent<BoxProps> = configuredClientEntry<BoxProps>(
  `${import.meta.url}#Box`,
  BoxImpl
) as unknown as NativeComponent<BoxProps>
