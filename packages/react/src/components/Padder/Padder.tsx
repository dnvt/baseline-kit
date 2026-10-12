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
import { hydratedValue } from '@baseline-kit/dom'
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
    <Spacer
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

    const baselinePadding = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
    })

    const stablePadding = {
      padding: {
        top: initialPadding.top || 0,
        right: initialPadding.right || 0,
        bottom: initialPadding.bottom || 0,
        left: initialPadding.left || 0,
      },
    }
    const { padding } = hydratedValue(
      isHydrated && !ssrMode,
      stablePadding,
      baselinePadding
    )

    const setRefs = mergeRefs(ref, internalRef)

    const descriptor = React.useMemo(
      () =>
        createPadderDescriptor({
          base: config.base,
          color: config.color,
          width,
          height,
          padding,
          enableSpacers,
          isVisible: isShown,
        }),
      [
        config.base,
        config.color,
        width,
        height,
        padding,
        enableSpacers,
        isShown,
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
            <div className="bk-pad-left">
              {renderSpacer(padding.left, '100%')}
            </div>
          )}
        </>
        <div
          key="content"
          data-testid={config.domDiagnostics ? 'padder-content' : undefined}
          className="bk-pad-content"
        >
          {children}
        </div>
        <>
          {padding.right > 0 && (
            <div className="bk-pad-right">
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
