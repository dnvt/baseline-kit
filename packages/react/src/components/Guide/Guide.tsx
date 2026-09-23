import * as React from 'react'
import type { ComponentsProps } from '../types'
import { useConfig } from '../../hooks/useConfig'
import { useDebug } from '../../hooks/useDebug'
import { useMeasure } from '../../hooks/useMeasure'
import { useGuide } from '../../hooks/useGuide'
import { cx } from '@baseline-kit/core/utils/merge'
import {
  canCompactFixedGuide,
  createGuideDescriptor,
  createGuideConfig,
} from '@baseline-kit/core/descriptors/guide'
import { DEFAULT_CONFIG, formatValue } from '@baseline-kit/core'
import type { GuideVariant, GuideConfig } from '@baseline-kit/core/types'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'
import { compactStyle } from '../../utils/dom'
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
        className={cx(styles.gde, styles.h, styles[variant], className)}
        style={style}
        data-testid={config.domDiagnostics ? 'guide' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        aria-hidden="true"
        {...props}
      >
        {children}
      </div>
    )
  }

  const ssrFallback = (
    <div
      className={cx(
        styles.gde,
        styles.h,
        styles.ssr,
        styles[variant],
        className
      )}
      style={mergeStyles(
        compactStyle(
          {
            width: formatValue(width ?? '100%'),
            height: formatValue(height ?? '100%'),
            maxWidth: formatValue(maxWidth ?? 'none'),
          },
          { width: '100%', height: '100%', maxWidth: 'none' }
        ),
        style
      )}
      data-testid={config.domDiagnostics ? 'guide' : undefined}
      data-variant={config.domDiagnostics ? variant : undefined}
      aria-hidden="true"
      {...props}
    >
      {children}
    </div>
  )

  if (ssrMode) {
    return ssrFallback
  }

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
  useMeasure(containerRef)

  const resolvedVariant = (variant ?? config.variant) as GuideVariant
  const resolvedGap = typeof gap === 'number' ? gap : 0

  const gridConfig = React.useMemo(
    () =>
      createGuideConfig({
        variant: resolvedVariant,
        base: config.base,
        gap: resolvedGap,
        columns,
        columnWidth: columnWidth as number | string | undefined,
      }),
    [resolvedVariant, config.base, resolvedGap, columns, columnWidth]
  )

  const { template, columnsCount, calculatedGap } = useGuide(
    containerRef,
    gridConfig
  )

  const compactFixedGuide = canCompactFixedGuide({
    variant: resolvedVariant,
    columns,
    columnWidth,
    gap: resolvedGap,
    align,
    domDiagnostics: config.domDiagnostics,
    className,
    style,
  })

  const descriptor = React.useMemo(
    () =>
      createGuideDescriptor({
        base: config.base,
        colors: config.colors,
        variant: resolvedVariant,
        align: align || 'center',
        width,
        height,
        columnWidth,
        maxWidth,
        color,
        template,
        columnsCount,
        calculatedGap,
        isVisible: isShown,
      }),
    [
      config.base,
      config.colors,
      resolvedVariant,
      align,
      width,
      height,
      columnWidth,
      maxWidth,
      color,
      template,
      columnsCount,
      calculatedGap,
      isShown,
    ]
  )

  const containerStyles = React.useMemo(
    () =>
      mergeStyles(
        compactStyle(descriptor.containerStyle, {
          '--bkgd-w': '100%',
          '--bkgd-h': '100%',
          '--bkgd-mw': 'none',
          '--bkgd-cw': '60px',
          '--bkgd-n': '12',
          '--bkgd-b': '0',
          '--bkgd-cl': DEFAULT_CONFIG.guide.colors.line,
          '--bkgd-cp': DEFAULT_CONFIG.guide.colors.pattern,
          '--bkgd-ca': DEFAULT_CONFIG.guide.colors.auto,
          '--bkgd-cf': DEFAULT_CONFIG.guide.colors.fixed,
          '--bkgd-g': '0px',
          '--bkgd-j': 'center',
          '--bkgd-t': 'none',
          '--bkgd-line-color': 'var(--bkgd-cl)',
        }),
        style
      ),
    [descriptor.containerStyle, style]
  )

  return (
    <div
      ref={containerRef}
      data-testid={config.domDiagnostics ? 'guide' : undefined}
      aria-hidden="true"
      className={cx(
        ...descriptor.classTokens.map((t) => styles[t]),
        !descriptor.classTokens.includes(resolvedVariant) &&
          styles[resolvedVariant],
        className
      )}
      data-variant={config.domDiagnostics ? resolvedVariant : undefined}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div
          className={cx(
            styles.cols,
            styles[resolvedVariant],
            compactFixedGuide && styles.compactFixed
          )}
          data-variant={config.domDiagnostics ? resolvedVariant : undefined}
        >
          {!descriptor.isLineVariant &&
            !compactFixedGuide &&
            Array.from({ length: descriptor.columnsCount }, (_, i) => (
              <div
                key={i}
                className={cx(styles.col, styles[resolvedVariant])}
                data-column-index={config.domDiagnostics ? i : undefined}
                data-variant={
                  config.domDiagnostics ? resolvedVariant : undefined
                }
              />
            ))}
        </div>
      )}
      {children}
    </div>
  )
})
