import * as React from 'react'
import { useConfig, useDebug, useIsClient, useMeasure } from '../../hooks'
import {
  cx,
  createSpacerDescriptor,
  getDOMAttributes,
  isCSSLength,
  type SpacerOptions,
} from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import type { HostProps } from '../types'
import { mergeStyles } from '../../utils/merge'

export type IndicatorNode = (
  value: number,
  type: 'width' | 'height'
) => React.ReactNode

export type SpacerProps = SpacerOptions &
  HostProps & {
    children?: React.ReactNode
    indicatorNode?: IndicatorNode
  }

export const Spacer = React.memo(function Spacer({
  height: heightProp,
  width: widthProp,
  indicatorNode,
  debugging: debuggingProp,
  variant: variantProp,
  base: baseProp,
  color: colorProp,
  className,
  style,
  children,
  ssrMode = false,
  ...props
}: SpacerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const config = useConfig('spacer')
  const { isShown } = useDebug(debuggingProp, config.debugging)
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base
  // A base prop is in px; only the configured base can follow the root.
  const baseRem = baseProp === undefined ? config.baseRem : undefined

  const isHydrated = useIsClient()

  const descriptor = React.useMemo(
    () =>
      createSpacerDescriptor({
        base,
        baseRem,
        colors: config.colors,
        width: widthProp,
        height: heightProp,
        color: colorProp,
        variant,
        isVisible: isShown,
      }),
    [
      base,
      baseRem,
      config.colors,
      widthProp,
      heightProp,
      colorProp,
      variant,
      isShown,
    ]
  )

  const shouldShowMeasurements = hydratedValue(
    isHydrated && !ssrMode,
    false,
    isShown && indicatorNode !== undefined
  )

  // A CSS length string renders live, so its indicator shows the measured
  // size; the observer runs only while such an indicator is shown.
  const liveHeight = typeof heightProp === 'string' && isCSSLength(heightProp)
  const liveWidth = typeof widthProp === 'string' && isCSSLength(widthProp)
  const measureRef = React.useRef<HTMLDivElement | null>(null)
  React.useLayoutEffect(() => {
    measureRef.current =
      shouldShowMeasurements && (liveHeight || liveWidth) ? ref.current : null
  })
  const rendered = useMeasure(measureRef)

  const measurements = React.useMemo(() => {
    if (!shouldShowMeasurements) return null
    const w =
      liveWidth && rendered.width > 0 ? rendered.width : descriptor.normWidth
    const h =
      liveHeight && rendered.height > 0
        ? rendered.height
        : descriptor.normHeight
    return (
      <>
        {h !== 0 && (
          <span key="height" className="bk-indicator" aria-hidden="true">
            {indicatorNode!(h, 'height')}
          </span>
        )}
        {w !== 0 && (
          <span key="width" className="bk-indicator" aria-hidden="true">
            {indicatorNode!(w, 'width')}
          </span>
        )}
      </>
    )
  }, [
    shouldShowMeasurements,
    indicatorNode,
    liveWidth,
    liveHeight,
    rendered.width,
    rendered.height,
    descriptor.normWidth,
    descriptor.normHeight,
  ])

  return (
    <div
      ref={ref}
      data-testid={config.domDiagnostics ? 'spacer' : undefined}
      className={cx(...descriptor.classTokens.map((t) => `bk-${t}`), className)}
      data-variant={config.domDiagnostics ? variant : undefined}
      data-height={
        config.domDiagnostics ? `${descriptor.normHeight}px` : undefined
      }
      style={mergeStyles(descriptor.style, style)}
      {...getDOMAttributes(props)}
    >
      {measurements}
      {children}
    </div>
  )
})
