/** @jsxImportSource remix/component */

import { type Handle, type RemixNode } from 'remix/component'
import {
  createSpacerDescriptor,
  type ConfigSchema,
  type SpacerOptions,
  cx,
  getDOMAttributes,
  isCSSLength,
  resolveDebugState,
} from '@baseline-kit/core'
import { configuredClientEntry } from './shared'
import {
  createConfigReader,
  createElementObserverBridge,
  mergeStyles,
  queueNativeUpdate,
  type NativeComponent,
  type NativeHostProps,
} from './shared'

export type IndicatorNode = (
  value: number,
  type: 'width' | 'height'
) => RemixNode

export type SpacerProps = SpacerOptions &
  NativeHostProps & {
    children?: RemixNode
    indicatorNode?: IndicatorNode
  }

type RuntimeSpacerProps = SpacerProps & {
  __baselineConfig?: ConfigSchema
}

function SpacerImpl(handle: Handle<RuntimeSpacerProps>) {
  const readConfig = createConfigReader(handle)
  // A CSS length string renders live, so its indicator shows the measured
  // size; the observer is attached only while such an indicator is shown.
  let rendered = { width: 0, height: 0 }
  const observer = createElementObserverBridge(({ width, height }) => {
    if (width === rendered.width && height === rendered.height) return
    rendered = { width, height }
    queueNativeUpdate(handle)
  })
  return () => {
    const props = handle.props
    const config = readConfig()
    const base = props.base ?? config.base
    // A base prop is in px; only the configured base can follow the root.
    const baseRem = props.base === undefined ? config.baseRem : undefined
    const variant = props.variant ?? config.spacer.variant
    const debugging = resolveDebugState(
      props.debugging,
      config.spacer.debugging
    )
    const descriptor = createSpacerDescriptor({
      base,
      baseRem,
      colors: config.spacer.colors,
      width: props.width,
      height: props.height,
      color: props.color,
      variant,
      isVisible: debugging.isShown,
    })

    const showIndicators = debugging.isShown && props.indicatorNode
    const liveHeight =
      typeof props.height === 'string' && isCSSLength(props.height)
    const liveWidth =
      typeof props.width === 'string' && isCSSLength(props.width)
    const measured =
      showIndicators &&
      (liveHeight || liveWidth) &&
      typeof window !== 'undefined'
    // The server and the first client render show the px values.
    const height =
      liveHeight && rendered.height > 0
        ? rendered.height
        : descriptor.normHeight
    const width =
      liveWidth && rendered.width > 0 ? rendered.width : descriptor.normWidth
    const measurements = showIndicators
      ? [
          height !== 0 ? (
            <span key="height" className="bk-indicator" aria-hidden="true">
              {props.indicatorNode!(height, 'height')}
            </span>
          ) : null,
          width !== 0 ? (
            <span key="width" className="bk-indicator" aria-hidden="true">
              {props.indicatorNode!(width, 'width')}
            </span>
          ) : null,
        ]
      : null

    return (
      <div
        className={cx(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'spacer' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        data-height={
          config.domDiagnostics ? `${descriptor.normHeight}px` : undefined
        }
        style={mergeStyles(descriptor.style, props.style)}
        {...getDOMAttributes(props)}
        mix={measured ? observer.attach : undefined}
      >
        {measurements}
        {props.children}
      </div>
    )
  }
}

export const Spacer: NativeComponent<SpacerProps> =
  configuredClientEntry<SpacerProps>(
    `${import.meta.url}#Spacer`,
    SpacerImpl
  ) as unknown as NativeComponent<SpacerProps>
