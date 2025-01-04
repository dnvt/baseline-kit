import { CSSProperties, memo, useMemo, useRef } from 'react'
import { X_GRID as CONFIG, COMPONENTS } from '@config'
import { useGridCalculations, useGridDimensions } from '@hooks'
import { cx, cs, parseCSSValue, convertToPixels } from '@utils'
import type {
  AutoGridConfig,
  FixedGridConfig,
  LineGridConfig,
  PatternGridConfig,
} from '@types'

import type { XGProps, XGridVariant } from './types'
import styles from './styles.module.css'

const GridColumns = memo(function GridColumns({
  count,
  variant,
}: {
  count: number;
  variant?: XGridVariant;
}) {
  return (
    <div className={styles['columns-container']}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cx(
            styles.column,
            variant === 'line' && styles['line-column'],
          )}
          data-column-index={i}
          data-variant={variant}
        />
      ))}
    </div>
  )
})

/**
 * XGrid Component
 * A flexible column grid system with support for multiple layout variants:
 * 'auto', 'fixed', 'line' (default), and 'pattern'.
 *
 * @param config - Configuration object for the grid.
 * @param className - Additional class names for the container.
 * @param visibility - Visibility of the grid ('visible' or 'hidden').
 * @param style - Additional inline styles for the container.
 */
export const XGrid = memo(function XGrid({
  config = { variant: 'line' },
  className = '',
  visibility = CONFIG.visibility,
  style = {},
}: XGProps) {
  const {
    align = CONFIG.align,
    color = CONFIG.color,
    columns = CONFIG.columns,
    columnWidth = CONFIG.columnWidth,
    gap = CONFIG.gap,
    maxWidth = CONFIG.maxWidth,
    padding = CONFIG.padding,
    variant = CONFIG.variant,
    zIndex = CONFIG.zIndex,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useGridDimensions(containerRef)

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
      return {
        variant: 'pattern' as const,
        columns,
        gap: numGap,
        baseUnit: CONFIG.baseUnit,
      } satisfies PatternGridConfig

    case 'fixed':
      return {
        variant: 'fixed' as const,
        columns,
        columnWidth,
        gap: numGap,
        baseUnit: CONFIG.baseUnit,
      } satisfies FixedGridConfig
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

  const containerClassName = useMemo(() =>
    cx(
      styles['xgrid-container'],
      className,
      isShown ? styles.visible : styles.hidden,
    ),
  [className, isShown],
  )

  const containerStyles = useMemo(() =>
    cs({
      '--padd-gap': calculatedGap,
      '--padd-grid-color': color,
      '--padd-grid-justify': align,
      '--padd-grid-template-columns': gridTemplateColumns,
      '--padd-padding': typeof padding === 'string' ? padding : `${padding}px`,
      '--padd-width': parseCSSValue(maxWidth),
      '--padd-z-index': zIndex,
    } as CSSProperties, style),
  [calculatedGap, color, align, gridTemplateColumns, padding, maxWidth, zIndex, style])

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      data-testid="xgrid-container"
      data-variant={variant}
      style={containerStyles}
    >
      {isShown && <GridColumns count={columnsCount} variant={variant} />}
    </div>
  )
})
