import * as React from 'react'
import { ComponentsProps } from '../types'
import { useConfig, useDebug, useVirtual, useMeasure } from '../../hooks'
import {
  DEFAULT_CONFIG,
  canCompactBaselinePaint,
  cx,
  createBaselineDescriptor,
} from '@baseline-kit/core'
import type { BaselineVariant } from '@baseline-kit/core'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'
import { compactStyle, getDOMAttributes } from '../../utils/dom'
import styles from './styles.module.css'

export type { BaselineVariant }

export type BaselineProps = {
  variant?: BaselineVariant
  width?: number | string
  height?: number | string
  base?: number
  color?: string
  ssrMode?: boolean
} & ComponentsProps

const BaselineImpl = React.memo(function BaselineImpl({
  className,
  debugging,
  style,
  variant,
  height: heightProp,
  width: widthProp,
  base,
  color: colorProp,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const resolvedVariant = (variant as BaselineVariant) ?? config.variant
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } =
    useMeasure(containerRef)

  const resolvedBase = base || config.base
  const descriptor = React.useMemo(
    () =>
      createBaselineDescriptor({
        base: resolvedBase,
        colors: config.colors,
        variant: resolvedVariant,
        width: widthProp,
        height: heightProp,
        color: colorProp,
        containerWidth,
        containerHeight,
        spacing: spacingProps,
        isVisible: isShown,
      }),
    [
      resolvedBase,
      config.colors,
      resolvedVariant,
      widthProp,
      heightProp,
      colorProp,
      containerWidth,
      containerHeight,
      spacingProps,
      isShown,
    ]
  )

  const compactPaint = canCompactBaselinePaint({
    base: resolvedBase,
    contentHeight: descriptor.contentHeight,
    domDiagnostics: config.domDiagnostics,
    className,
    style,
  })

  const { start, end } = useVirtual({
    totalLines: descriptor.rowCount,
    lineHeight: resolvedBase,
    containerRef,
    buffer: 160,
  })

  const containerStyles = React.useMemo(
    () =>
      mergeStyles(
        compactStyle(
          {
            ...descriptor.containerStyle,
            ...(compactPaint ? { '--bkbl-b': `${resolvedBase}px` } : {}),
          },
          {
            '--bkbl-w': '100%',
            '--bkbl-h': '100%',
            '--bkbl-b': '8px',
            '--bkbl-cl': DEFAULT_CONFIG.baseline.colors.line,
            '--bkbl-cf': DEFAULT_CONFIG.baseline.colors.flat,
            '--bkbl-c':
              resolvedVariant === 'line' ? 'var(--bkbl-cl)' : 'var(--bkbl-cf)',
          }
        ),
        style
      ),
    [
      descriptor.containerStyle,
      style,
      resolvedVariant,
      resolvedBase,
      compactPaint,
    ]
  )

  return (
    <div
      ref={containerRef}
      data-testid={config.domDiagnostics ? 'baseline' : undefined}
      aria-hidden="true"
      className={cx(
        ...descriptor.classTokens.map((t) => styles[t]),
        styles[resolvedVariant],
        compactPaint && styles.compact,
        className
      )}
      style={containerStyles}
      {...getDOMAttributes(spacingProps)}
    >
      {isShown &&
        !compactPaint &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div
              className={styles.row}
              key={rowIndex}
              data-row-index={config.domDiagnostics ? rowIndex : undefined}
              style={descriptor.getRowStyle(rowIndex)}
            />
          )
        })}
    </div>
  )
})

export const Baseline = React.memo(function Baseline({
  className,
  debugging,
  style,
  variant: variantProp,
  height: heightProp,
  width: widthProp,
  base: baseProp,
  color: colorProp,
  ssrMode = false,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base
  const { isShown } = useDebug(debugging, config.debugging)

  if (!isShown) {
    return (
      <div
        className={cx(styles.bas, styles.h, styles[variant], className)}
        style={style}
        data-testid={config.domDiagnostics ? 'baseline' : undefined}
        aria-hidden="true"
        {...getDOMAttributes(spacingProps)}
      />
    )
  }

  const ssrFallback = (
    <div
      className={cx(
        styles.bas,
        styles.h,
        styles.ssr,
        styles[variant],
        className
      )}
      style={mergeStyles(
        compactStyle(
          {
            width: String(widthProp ?? '100%'),
            height: String(heightProp ?? '100%'),
          },
          { width: '100%', height: '100%' }
        ),
        style
      )}
      data-testid={config.domDiagnostics ? 'baseline' : undefined}
      aria-hidden="true"
      {...getDOMAttributes(spacingProps)}
    />
  )

  if (ssrMode) {
    return ssrFallback
  }

  return (
    <ClientOnly fallback={ssrFallback}>
      <BaselineImpl
        className={className}
        debugging={debugging}
        style={style}
        variant={variant}
        height={heightProp}
        width={widthProp}
        base={base}
        color={colorProp}
        {...spacingProps}
      />
    </ClientOnly>
  )
})
