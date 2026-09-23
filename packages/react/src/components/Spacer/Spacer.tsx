import * as React from 'react'
import { useConfig, useDebug, useIsClient } from '../../hooks'
import { DEFAULT_CONFIG, cx, createSpacerDescriptor } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { ComponentsProps, Variant } from '../types'
import { mergeStyles } from '../../utils/merge'
import { compactStyle } from '../../utils/dom'
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
        {h !== 0 && (
          <span key="height" className={styles.indicator} aria-hidden="true">
            {indicatorNode!(h, 'height')}
          </span>
        )}
        {w !== 0 && (
          <span key="width" className={styles.indicator} aria-hidden="true">
            {indicatorNode!(w, 'width')}
          </span>
        )}
      </>
    )
  }, [
    shouldShowMeasurements,
    indicatorNode,
    descriptor.normWidth,
    descriptor.normHeight,
  ])

  const baseStyles = React.useMemo(
    () =>
      mergeStyles(
        compactStyle(descriptor.style, {
          '--bksp-w': 'var(--bk-wf, 100%)',
          '--bksp-h': 'var(--bk-hf, auto)',
          '--bksp-b': '8px',
          '--bksp-cl': DEFAULT_CONFIG.spacer.colors.line,
          '--bksp-cf': DEFAULT_CONFIG.spacer.colors.flat,
          '--bksp-ct': DEFAULT_CONFIG.spacer.colors.text,
        }),
        style
      ),
    [descriptor.style, style]
  )

  return (
    <div
      ref={ref}
      data-testid={config.domDiagnostics ? 'spacer' : undefined}
      className={cx(...descriptor.classTokens.map((t) => styles[t]), className)}
      data-variant={config.domDiagnostics ? variant : undefined}
      data-height={
        config.domDiagnostics
          ? typeof descriptor.normHeight === 'number'
            ? `${descriptor.normHeight}px`
            : descriptor.normHeight
          : undefined
      }
      style={baseStyles}
      {...props}
    >
      {measurements}
      {children}
    </div>
  )
})
