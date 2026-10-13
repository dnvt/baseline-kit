/** @jsxImportSource remix/component */

import { type Handle, type RemixNode } from 'remix/component'
import {
  createSpacerDescriptor,
  type ConfigSchema,
  type SpacerOptions,
  cx,
  getDOMAttributes,
  resolveDebugState,
} from '@baseline-kit/core'
import { configuredClientEntry } from './shared'
import {
  createConfigReader,
  mergeStyles,
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
  return () => {
    const props = handle.props
    const config = readConfig()
    const base = props.base ?? config.base
    const variant = props.variant ?? config.spacer.variant
    const debugging = resolveDebugState(
      props.debugging,
      config.spacer.debugging
    )
    const descriptor = createSpacerDescriptor({
      base,
      colors: config.spacer.colors,
      width: props.width,
      height: props.height,
      color: props.color,
      variant,
      isVisible: debugging.isShown,
    })

    const measurements =
      debugging.isShown && props.indicatorNode
        ? [
            descriptor.normHeight !== 0 ? (
              <span key="height" className="bk-indicator" aria-hidden="true">
                {props.indicatorNode(descriptor.normHeight, 'height')}
              </span>
            ) : null,
            descriptor.normWidth !== 0 ? (
              <span key="width" className="bk-indicator" aria-hidden="true">
                {props.indicatorNode(descriptor.normWidth, 'width')}
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
