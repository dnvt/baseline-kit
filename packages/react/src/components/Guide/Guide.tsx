import * as React from 'react'
import { ComponentsProps } from '../types'
import { useConfig, useDebug, useMeasure, useGuide } from '../../hooks'
import { cx,  createGuideDescriptor, createGuideConfig } from '@baseline-kit/core'
import type { GuideVariant, GuideConfig } from '@baseline-kit/core'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'
import styles from './styles.module.css'

export type { GuideConfig }

export type GuideProps = {
  align?: React.CSSProperties['justifyContent']
  variant?: GuideVariant
  columns?: number | readonly (string | number | undefined | 'auto')[]
  columnWidth?: React.CSSProperties['width']
  maxWidth?: React.CSSProperties['maxWidth']
  color?: React.CSSProperties['color']
  children?: React.ReactNode
  gap?: number
  ssrMode?: boolean
} & ComponentsProps &
  Omit<GuideConfig, 'columns' | 'columnWidth' | 'gap'>

export const Guide = React.memo(function Guide({
  className,
  debugging,
  style,
  variant: variantProp,
  align = 'center',
  gap: gapProp,
  height,
  width,
  columns,
  columnWidth,
  maxWidth,
  color,
  children,
  ssrMode = false,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant
  const gap = typeof gapProp === 'number' ? gapProp : 0
  const { isShown } = useDebug(debugging, config.debugging)

  if (!isShown) {
    return (
      <div
        className={cx(styles.g, styles.h, className)}
        style={style}
        data-testid="guide"
        data-variant={variant}
        aria-hidden="true"
        {...props}
      >
        {children}
      </div>
    )
  }

  const ssrFallback = (
    <div
      className={cx(styles.g, styles.h, styles.ssr, className)}
      style={{ width: width || '100%', height: height || '100%', maxWidth: maxWidth || 'none', ...style }}
      data-testid="guide"
      data-variant={variant}
      aria-hidden="true"
    >
      {children}
    </div>
  )

  return (
    <ClientOnly fallback={ssrFallback}>
      <GuideImpl
        className={className}
        debugging={debugging}
        style={style}
        variant={variant}
        align={align}
        gap={gap}
        height={height}
        width={width}
        columns={columns}
        columnWidth={columnWidth}
        maxWidth={maxWidth}
        color={color}
        ssrMode={ssrMode}
        {...props}
      >
        {children}
      </GuideImpl>
    </ClientOnly>
  )
})

const GuideImpl = React.memo(function GuideImpl({
  className,
  debugging,
  style,
  variant,
  align = 'center',
  gap,
  height,
  width,
  columns,
  columnWidth,
  maxWidth,
  color,
  children,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { height: containerHeight } = useMeasure(containerRef)

  const resolvedVariant = (variant ?? config.variant) as GuideVariant
  const resolvedGap = typeof gap === 'number' ? gap : 0

  const gridConfig = React.useMemo(
    () => createGuideConfig(resolvedVariant, config.base, resolvedGap, columns, columnWidth as number | string | undefined),
    [resolvedVariant, config.base, resolvedGap, columns, columnWidth]
  )

  const { template, columnsCount, calculatedGap } = useGuide(containerRef, gridConfig)

  const descriptor = React.useMemo(
    () => createGuideDescriptor({
      base: config.base,
      colors: config.colors,
      variant: resolvedVariant,
      align: align || 'center',
      width, height, columnWidth, maxWidth, color,
      containerWidth: 0, containerHeight,
      template, columnsCount, calculatedGap,
      isVisible: isShown,
    }),
    [config, resolvedVariant, align, width, height, columnWidth, maxWidth, color, containerHeight, template, columnsCount, calculatedGap, isShown]
  )

  const containerStyles = React.useMemo(
    () => mergeStyles(descriptor.containerStyle, style),
    [descriptor.containerStyle, style]
  )

  return (
    <div
      ref={containerRef}
      data-testid="guide"
      aria-hidden="true"
      className={cx(...descriptor.classTokens.map(t => styles[t]), className)}
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div className={styles.cols} data-variant={variant}>
          {Array.from({ length: descriptor.columnsCount }, (_, i) => (
            <div
              key={i}
              className={styles.col}
              data-column-index={i}
              data-variant={variant}
              style={{ backgroundColor: descriptor.columnColor }}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  )
})
