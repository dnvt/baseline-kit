import * as React from 'react'
import type { HostProps } from '../types'
import { useConfig, useDebug, useVirtual, useMeasure } from '../../hooks'
import {
  cx,
  createBaselineDescriptor,
  createBaselineFallbackStyle,
  getDOMAttributes,
} from '@baseline-kit/core'
import type { BaselineOptions, BaselineVariant } from '@baseline-kit/core'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'

export type { BaselineVariant }

export type BaselineProps = BaselineOptions & HostProps

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
        domDiagnostics: config.domDiagnostics,
        className,
        style,
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
      config.domDiagnostics,
      className,
      style,
    ]
  )

  const { start, end } = useVirtual({
    totalLines: descriptor.rowCount,
    lineHeight: resolvedBase,
    containerRef,
    buffer: 160,
  })

  return (
    <div
      ref={containerRef}
      data-testid={config.domDiagnostics ? 'baseline' : undefined}
      aria-hidden="true"
      className={cx(...descriptor.classTokens.map((t) => `bk-${t}`), className)}
      style={mergeStyles(descriptor.containerStyle, style)}
      {...getDOMAttributes(spacingProps)}
    >
      {isShown &&
        !descriptor.compactPaint &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div
              className="bk-row"
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
        className={cx('bk-bas', 'bk-h', `bk-${variant}`, className)}
        style={style}
        data-testid={config.domDiagnostics ? 'baseline' : undefined}
        aria-hidden="true"
        {...getDOMAttributes(spacingProps)}
      />
    )
  }

  const ssrFallback = (
    <div
      className={cx('bk-bas', 'bk-h', 'bk-ssr', `bk-${variant}`, className)}
      style={mergeStyles(
        createBaselineFallbackStyle(widthProp, heightProp),
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
