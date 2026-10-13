import * as React from 'react'
import type { HostProps } from '../types'
import { useConfig } from '../../hooks/useConfig'
import { useDebug } from '../../hooks/useDebug'
import { useGuide } from '../../hooks/useGuide'
import {
  cx,
  canCompactFixedGuide,
  createGuideConfig,
  createGuideDescriptor,
  createGuideFallbackStyle,
  getDOMAttributes,
  type GuideConfig,
  type GuideOptions,
} from '@baseline-kit/core'
import { ClientOnly } from '../../utils/ssr'
import { mergeStyles } from '../../utils/merge'

export type { GuideConfig }

export type GuideProps = GuideOptions &
  HostProps & {
    children?: React.ReactNode
  }

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
  const gap = gapProp ?? 0
  const { isShown } = useDebug(debugging, config.debugging)

  if (!isShown) {
    return (
      <div
        className={cx('bk-gde', 'bk-h', `bk-${variant}`, className)}
        style={style}
        data-testid={config.domDiagnostics ? 'guide' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        aria-hidden="true"
        {...getDOMAttributes(props)}
      >
        {children}
      </div>
    )
  }

  const ssrFallback = (
    <div
      className={cx('bk-gde', 'bk-h', 'bk-ssr', `bk-${variant}`, className)}
      style={mergeStyles(
        createGuideFallbackStyle(width, height, maxWidth),
        style
      )}
      data-testid={config.domDiagnostics ? 'guide' : undefined}
      data-variant={config.domDiagnostics ? variant : undefined}
      aria-hidden="true"
      {...getDOMAttributes(props)}
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
        {...getDOMAttributes(props)}
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

  const resolvedVariant = variant ?? config.variant
  const resolvedGap = gap ?? 0

  const gridConfig = React.useMemo(
    () =>
      createGuideConfig({
        variant: resolvedVariant,
        base: config.base,
        gap: resolvedGap,
        columns,
        columnWidth,
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

  return (
    <div
      ref={containerRef}
      data-testid={config.domDiagnostics ? 'guide' : undefined}
      aria-hidden="true"
      className={cx(...descriptor.classTokens.map((t) => `bk-${t}`), className)}
      data-variant={config.domDiagnostics ? resolvedVariant : undefined}
      style={mergeStyles(descriptor.containerStyle, style)}
      {...getDOMAttributes(props)}
    >
      {isShown && (
        <div
          className={cx(
            'bk-cols',
            `bk-${resolvedVariant}`,
            compactFixedGuide && 'bk-cols-compact-fixed'
          )}
          data-variant={config.domDiagnostics ? resolvedVariant : undefined}
        >
          {!descriptor.isLineVariant &&
            !compactFixedGuide &&
            Array.from({ length: descriptor.columnsCount }, (_, i) => (
              <div
                key={i}
                className={cx('bk-col', `bk-${resolvedVariant}`)}
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
