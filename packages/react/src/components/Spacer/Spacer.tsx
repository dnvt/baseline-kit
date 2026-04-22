import * as React from 'react'
import { useConfig, useDebug, useIsClient } from '../../hooks'
import { cx, createSpacerDescriptor } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { ComponentsProps, Variant } from '../types'
import { mergeStyles } from '../../utils/merge'
import styles from './styles.module.css'

export type IndicatorNode = (
  value: number,
  type: 'width' | 'height'
) => React.ReactNode

export type SpacerProps = {
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  variant?: Variant
  color?: string
  base?: number
  children?: React.ReactNode
  indicatorNode?: IndicatorNode
  ssrMode?: boolean
} & ComponentsProps

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

  const isHydrated = useIsClient()

  const descriptor = React.useMemo(
    () =>
      createSpacerDescriptor({
        base,
        colors: config.colors,
        width: widthProp as number | string | undefined,
        height: heightProp as number | string | undefined,
        color: colorProp,
        variant,
        isVisible: isShown,
      }),
    [base, config.colors, widthProp, heightProp, colorProp, variant, isShown]
  )

  const shouldShowMeasurements = hydratedValue(
    isHydrated && !ssrMode,
    false,
    isShown && indicatorNode !== undefined
  )

  const measurements = React.useMemo(() => {
    if (!shouldShowMeasurements) return null
    const w = descriptor.normWidth
    const h = descriptor.normHeight
    return (
      <>
        {h !== 0 && <span key="height">{indicatorNode!(h, 'height')}</span>}
        {w !== 0 && <span key="width">{indicatorNode!(w, 'width')}</span>}
      </>
    )
  }, [
    shouldShowMeasurements,
    indicatorNode,
    descriptor.normWidth,
    descriptor.normHeight,
  ])

  const baseStyles = React.useMemo(
    () => mergeStyles(descriptor.style, style),
    [descriptor.style, style]
  )

  return (
    <div
      ref={ref}
      data-testid="spacer"
      className={cx(...descriptor.classTokens.map((t) => styles[t]), className)}
      data-variant={variant}
      data-height={
        typeof descriptor.normHeight === 'number'
          ? `${descriptor.normHeight}px`
          : descriptor.normHeight
      }
      style={baseStyles}
      {...props}
    >
      {measurements}
      {children}
    </div>
  )
})
