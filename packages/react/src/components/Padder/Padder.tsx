import * as React from 'react'
import { useConfig, useDebug, useBaseline, useIsClient } from '../../hooks'
import {
  cx,
  parsePadding,
  createPadderDescriptor,
  getDOMAttributes,
  type Variant,
  type DebuggingMode,
  type PadderOptions,
} from '@baseline-kit/core'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import type { HostProps } from '../types'
import { Spacer, IndicatorNode } from '../Spacer'

export type PadderProps = PadderOptions &
  HostProps & {
    children?: React.ReactNode
    indicatorNode?: IndicatorNode
  }

type RuntimePadderProps = PadderProps & {
  preserveContentHost?: boolean
}

const createRenderSpacerFn = (
  variant: Variant | undefined,
  debugging: DebuggingMode | undefined,
  indicatorNode?: IndicatorNode
) => {
  const safeVariant = variant || 'line'
  const safeDebugging = debugging || 'none'

  const SpacerElement = (
    widthVal: React.CSSProperties['width'],
    heightVal: React.CSSProperties['height']
  ) => (
    // Base 1 keeps the snapped padding exact instead of rounding it to the grid.
    <Spacer
      base={1}
      variant={safeVariant}
      debugging={heightVal === 0 || widthVal === 0 ? 'none' : safeDebugging}
      indicatorNode={indicatorNode}
      height={heightVal !== '100%' ? heightVal : undefined}
      width={widthVal !== '100%' ? widthVal : undefined}
    />
  )
  SpacerElement.displayName = 'PadderSpacer'
  return SpacerElement
}

const PadderComponent = React.memo(
  React.forwardRef<HTMLDivElement, RuntimePadderProps>(function Padder(
    {
      children,
      className,
      debugging: debuggingProp,
      height,
      indicatorNode,
      style,
      width,
      ssrMode = false,
      preserveContentHost = false,
      ...spacingProps
    },
    ref
  ) {
    const config = useConfig('padder')
    const { variant } = useConfig('spacer')
    const initialPadding = React.useMemo(
      () => parsePadding(spacingProps),
      [spacingProps]
    )
    const { isShown, isNone, debugging } = useDebug(
      debuggingProp,
      config.debugging
    )
    const enableSpacers = !isNone

    const isHydrated = useIsClient()
    const internalRef = React.useRef<HTMLDivElement | null>(null)

    // Before hydration and in ssrMode the explicit padding is rendered, so
    // the hook must not snap; it then knows exactly what is on screen.
    const { padding } = useBaseline(internalRef, {
      base: config.base,
      snapping: isHydrated && !ssrMode ? 'height' : 'none',
      spacing: initialPadding,
    })

    const setRefs = mergeRefs(ref, internalRef)

    const descriptor = React.useMemo(
      () =>
        createPadderDescriptor({
          color: config.color,
          width,
          height,
          padding,
          enableSpacers,
          isVisible: isShown,
          contentHost: preserveContentHost,
        }),
      [
        config.color,
        width,
        height,
        padding,
        enableSpacers,
        isShown,
        preserveContentHost,
      ]
    )

    const containerStyles = mergeStyles(descriptor.containerStyle, style)

    const renderSpacer = React.useMemo(
      () => createRenderSpacerFn(variant, debugging, indicatorNode),
      [variant, debugging, indicatorNode]
    )

    if (!enableSpacers) {
      return (
        <div
          ref={setRefs}
          data-testid={config.domDiagnostics ? 'padder' : undefined}
          className={cx(
            ...descriptor.classTokens.map((t) => `bk-${t}`),
            className
          )}
          style={containerStyles}
          {...getDOMAttributes(spacingProps)}
        >
          {preserveContentHost ? (
            <div
              key="content"
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
              className="bk-pad-content"
              style={descriptor.contentStyle}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      )
    }

    return (
      <div
        ref={setRefs}
        data-testid={config.domDiagnostics ? 'padder' : undefined}
        className={cx(
          ...descriptor.classTokens.map((t) => `bk-${t}`),
          className
        )}
        style={containerStyles}
        {...getDOMAttributes(spacingProps)}
      >
        <>
          {padding.top > 0 && (
            <div className="bk-pad-top">
              {renderSpacer('100%', padding.top)}
            </div>
          )}
          {padding.left > 0 && (
            <div className="bk-pad-left" style={descriptor.sideStyle}>
              {renderSpacer(padding.left, '100%')}
            </div>
          )}
        </>
        <div
          key="content"
          data-testid={config.domDiagnostics ? 'padder-content' : undefined}
          className="bk-pad-content"
          style={descriptor.contentStyle}
        >
          {children}
        </div>
        <>
          {padding.right > 0 && (
            <div className="bk-pad-right" style={descriptor.sideStyle}>
              {renderSpacer(padding.right, '100%')}
            </div>
          )}
          {padding.bottom > 0 && (
            <div className="bk-pad-bottom">
              {renderSpacer('100%', padding.bottom)}
            </div>
          )}
        </>
      </div>
    )
  })
)

export const Padder = PadderComponent as unknown as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    PadderProps & React.RefAttributes<HTMLDivElement>
  >
>

/** @internal Used by Box to preserve its keyed content host across debug modes. */
export const PadderForBox = PadderComponent
