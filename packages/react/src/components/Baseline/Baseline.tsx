import * as React from 'react'
import { ComponentsProps } from '../types'
import { useConfig, useDebug, useVirtual, useMeasure } from '../../hooks'
import { cx, createBaselineDescriptor } from '@baseline-kit/core'
import type { BaselineVariant } from '@baseline-kit/core'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'
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
        variant: (variant as BaselineVariant) ?? config.variant,
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
      config.variant,
      variant,
      widthProp,
      heightProp,
      colorProp,
      containerWidth,
      containerHeight,
      spacingProps,
      isShown,
    ]
  )

  const { start, end } = useVirtual({
    totalLines: descriptor.rowCount,
    lineHeight: resolvedBase,
    containerRef,
    buffer: 160,
  })

  const containerStyles = React.useMemo(
    () => mergeStyles(descriptor.containerStyle, style),
    [descriptor.containerStyle, style]
  )

  return (
    <div
      ref={containerRef}
      data-testid="baseline"
      aria-hidden="true"
      className={cx(...descriptor.classTokens.map((t) => styles[t]), className)}
      style={containerStyles}
      {...spacingProps}
    >
      {isShown &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div
              className={styles.row}
              key={rowIndex}
              data-row-index={rowIndex}
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
        className={cx(styles.bas, styles.h, className)}
        style={style}
        data-testid="baseline"
        aria-hidden="true"
        {...spacingProps}
      />
    )
  }

  const ssrFallback = (
    <div
      className={cx(styles.bas, styles.h, styles.ssr, className)}
      style={{
        width: widthProp ?? '100%',
        height: heightProp ?? '100%',
        ...style,
      }}
      data-testid="baseline"
      aria-hidden="true"
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
