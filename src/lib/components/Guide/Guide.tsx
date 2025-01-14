import { CSSProperties, memo, RefObject, useCallback, useMemo, useRef } from 'react'
import { X_GRID as CONFIG, COMPONENTS } from '@config'
import { useGridCalculations, useGridDimensions, useVisibleGridLines } from '@hooks'
import { cx, cs, convertToPixels, MeasurementSystem, clamp } from '@utils'
import type {
  AutoGridConfig,
  FixedGridConfig,
  LineGridConfig,
  PatternGridConfig,
} from '@types'

import type { GuideProps, GuideVariant } from './types'
import styles from './styles.module.css'

const GridRows = memo(function GridRows({
  count,
  baseUnit,
  color,
  containerRef,
}: {
  count: number;
  baseUnit: number;
  color: string;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const visibleRange = useVisibleGridLines({
    totalLines: count,
    lineHeight: baseUnit,
    containerRef,
  })

  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties> => ({
      '--padd-grid-top': `${idx * baseUnit}px`,
      '--padd-grid-color': color,
      '--padd-grid-line-stroke': '1px',
    }),
    [baseUnit, color],
  )

  const rows = useMemo(() => {
    const elements = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      elements.push(
        <div
          key={i}
          className={styles.row}
          style={getRowStyles(i)}
          data-row-index={i}
        />,
      )
    }
    return elements
  }, [visibleRange.start, visibleRange.end, getRowStyles])

  return <>{rows}</>
})

const GridColumns = memo(function GridColumns({
  count,
  variant,
}: {
  count: number;
  variant?: GuideVariant;
}) {
  return (
    <div className={styles['columns-container']}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={styles.column}
          data-column-index={i}
          data-variant={variant}
        />
      ))}
    </div>
  )
})

/**
 * Guide Component
 * A flexible column grid system with support for multiple layout variants:
 * 'auto', 'fixed', 'line' (default), and 'pattern'.
 *
 * @param config - Configuration object for the grid.
 * @param className - Additional class names for the container.
 * @param visibility - Visibility of the grid ('visible' or 'hidden').
 * @param style - Additional inline styles for the container.
 */
export const Guide = memo(function Guide({
  config = { variant: 'line' },
  className = '',
  visibility = CONFIG.visibility,
  style = {},
}: GuideProps) {
  const {
    align = CONFIG.align,
    color = CONFIG.color,
    columns = CONFIG.columns,
    columnWidth = CONFIG.columnWidth,
    direction = 'vertical',
    gap = CONFIG.gap,
    height,
    maxWidth = CONFIG.maxWidth,
    padding = CONFIG.padding,
    variant = CONFIG.variant,
    zIndex = CONFIG.zIndex,
    baseUnit = CONFIG.baseUnit,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height: containerHeight } = useGridDimensions(containerRef)

  // Calculate row count for horizontal direction
  const rowCount = useMemo(() => {
    if (direction !== 'horizontal') return 0

    const totalHeight = typeof height === 'number' ? height : containerHeight
    const normalizedHeight = MeasurementSystem.normalize(totalHeight, {
      unit: baseUnit,
      suppressWarnings: true,
    })

    return clamp(Math.ceil(normalizedHeight / baseUnit), 1, 1000)
  }, [direction, height, containerHeight, baseUnit])

  // Memoized grid configuration based on the variant
  const gridConfig = useMemo(() => {
    const gapValue = typeof gap === 'string' ? convertToPixels(gap) ?? COMPONENTS.baseUnit : gap
    const numGap = gapValue ?? COMPONENTS.baseUnit ?? 8

    switch (variant) {
    case 'line':
      return {
        variant: 'line' as const,
        gap: Math.max(0, numGap - 1),
        baseUnit: CONFIG.baseUnit,
      } satisfies LineGridConfig

    case 'auto':
      return {
        variant: 'auto' as const,
        columnWidth,
        gap: numGap,
        baseUnit: CONFIG.baseUnit,
      } satisfies AutoGridConfig

    case 'pattern':
      if (Array.isArray(columns)) {
        return {
          variant: 'pattern' as const,
          columns,
          gap: numGap,
          baseUnit: CONFIG.baseUnit,
        } satisfies PatternGridConfig
      }
      break

    case 'fixed':
      if (typeof columns === 'number') {
        return {
          variant: 'fixed' as const,
          columns,
          columnWidth,
          gap: numGap,
          baseUnit: CONFIG.baseUnit,
        } satisfies FixedGridConfig
      }
      break
    }

    // Default to 'line' variant
    return {
      variant: 'line' as const,
      gap: Math.max(0, numGap - 1),
      baseUnit: CONFIG.baseUnit,
    } satisfies LineGridConfig
  }, [variant, columns, columnWidth, gap])

  const { gridTemplateColumns, columnsCount, calculatedGap } = useGridCalculations({
    containerWidth: width,
    config: gridConfig,
  })

  const isShown = visibility === 'visible'

  const containerStyles = useMemo(() => {
    const baseStyles: CSSProperties = {
      '--padd-gap': calculatedGap,
      '--padd-grid-color': color,
      '--padd-grid-justify': align,
      '--padd-padding': typeof padding === 'string' ? padding : `${padding}px`,
      '--padd-z-index': zIndex,
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
    color,
    align,
    padding,
    zIndex,
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
    >
      {isShown && direction === 'horizontal' ? (
        <GridRows
          count={rowCount}
          baseUnit={baseUnit}
          color={color}
          containerRef={containerRef}
        />
      ) : (
        isShown && <GridColumns count={columnsCount} variant={variant} />
      )}
    </div>
  )
})
