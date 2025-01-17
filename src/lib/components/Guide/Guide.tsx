import { CSSProperties, memo, RefObject, useCallback, useMemo, useRef } from 'react'
import { useGridCalculations, useGridDimensions, useVisibleGridLines } from '@hooks'
import { cx, cs, convertToPixels, MeasurementSystem, clamp } from '@utils'
import type { AutoConfig, FixedConfig, GuideProps, GuideVariant, LineConfig, PatternConfig } from './types'
import styles from './styles.module.css'
import { useConfig } from '../Config'

const GridRows = memo(function GridRows({
  count,
  base,
  color,
  containerRef,
  variant,
}: {
  count: number
  base: number
  color: string
  containerRef: RefObject<HTMLDivElement | null>
  variant: GuideVariant
}) {

  const visibleRange = useVisibleGridLines({
    totalLines: count,
    lineHeight: base,
    containerRef,
  })

  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties> => ({
      '--padd-grid-top': `${idx * base}px`,
      '--padd-grid-color': color,
      '--padd-grid-line-stroke': variant === 'line' ? '1px' : `${base}px`,
    }),
    [base, color, variant],
  )

  return (
    <>
      {Array.from(
        { length: visibleRange.end - visibleRange.start },
        (_, i) => {
          const idx = i + visibleRange.start
          return (
            <div
              key={idx}
              className={styles.row}
              style={getRowStyles(idx)}
              data-row-index={idx}
              data-variant={variant}
            />
          )
        },
      )}
    </>
  )
})

const GridColumns = memo(function GridColumns({
  count,
  variant,
  colors,
}: {
  count: number
  variant: GuideVariant
  colors: Record<GuideVariant, string>
}) {
  return (
    <div className={styles['columns-container']}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={styles.column}
          data-column-index={i}
          data-variant={variant}
          style={{ '--padd-grid-color': colors[variant] }}
        />
      ))}
    </div>
  )
})

/**
 * Guide Component
 * A flexible column grid system with support for multiple layout variants.
 * Integrates with theme context for consistent styling and behavior.
 */
export const Guide = memo(function Guide({
  className,
  visibility: visibilityProp,
  style,
  variant: variantProp,
  align = 'start',
  direction = 'vertical',
  gap,
  height,
  maxWidth,
  padding = 0,
  columns,
  columnWidth,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height: containerHeight } = useGridDimensions(containerRef)

  // Use variant from props or fallback to config
  const variant = variantProp ?? config.variant
  const isShown = (visibilityProp ?? config.visibility) === 'visible'

  // Calculate row count for horizontal direction
  const rowCount = useMemo(() => {
    if (direction !== 'horizontal') return 0

    const totalHeight = typeof height === 'number' ? height : containerHeight
    const normalizedHeight = MeasurementSystem.normalize(totalHeight, {
      unit: config.base,
      suppressWarnings: true,
    })

    return clamp(Math.ceil(normalizedHeight / config.base), 1, 1000)
  }, [direction, height, containerHeight, config.base])

  // Memoized grid configuration based on the variant
  const gridConfig = useMemo(() => {
    const normalizedGap = typeof gap === 'string'
      ? convertToPixels(gap)
      : (gap ?? config.base)
    const numGap = typeof normalizedGap === 'number' ? normalizedGap : config.base

    const configs = {
      line: {
        variant: 'line' as const,
        gap: Math.max(0, numGap - 1),
        base: config.base,
      } satisfies LineConfig,

      auto: columnWidth ? {
        variant: 'auto' as const,
        columnWidth,
        gap: numGap,
        base: config.base,
      } satisfies AutoConfig : null,

      pattern: Array.isArray(columns) ? {
        variant: 'pattern' as const,
        columns,
        gap: numGap,
        base: config.base,
      } satisfies PatternConfig : null,

      fixed: typeof columns === 'number' ? {
        variant: 'fixed' as const,
        columns,
        columnWidth,
        gap: numGap,
        base: config.base,
      } satisfies FixedConfig : null,
    }

    return configs[variant] ?? configs.line
  }, [variant, columns, columnWidth, gap, config.base])

  const { gridTemplateColumns, columnsCount, calculatedGap } = useGridCalculations({
    containerWidth: width,
    config: gridConfig,
  })

  const containerStyles = useMemo(() => {
    const baseStyles: CSSProperties = {
      '--padd-gap': calculatedGap,
      '--padd-grid-justify': align,
      '--padd-padding': typeof padding === 'string' ? padding : `${padding}px`,
    }

    if (direction === 'horizontal') {
      return cs({
        ...baseStyles,
        '--padd-height': height ? `${height}px` : '100%',
        '--padd-width': '100%',
      } as CSSProperties, style)
    }

    return cs({
      ...baseStyles,
      '--padd-grid-template-columns': gridTemplateColumns,
      '--padd-width': maxWidth ? `${maxWidth}px` : '100%',
      '--padd-height': '100%',
    } as CSSProperties, style)
  }, [
    calculatedGap,
    align,
    padding,
    direction,
    height,
    gridTemplateColumns,
    maxWidth,
    style,
  ])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles['guide-container'],
        direction === 'horizontal' && styles['horizontal-guide'],
        className,
        isShown ? styles.visible : styles.hidden,
      )}
      data-testid="guide-container"
      data-variant={variant}
      data-direction={direction}
      style={containerStyles}
      {...props}
    >
      {isShown && direction === 'horizontal' ? (
        <GridRows
          count={rowCount}
          base={config.base}
          color={config.colors[variant]}
          containerRef={containerRef}
          variant={variant}
        />
      ) : (
        isShown &&
        <GridColumns
          count={columnsCount}
          variant={variant}
          colors={config.colors}
        />
      )}
    </div>
  )
})