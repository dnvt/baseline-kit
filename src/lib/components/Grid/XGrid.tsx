import { CSSProperties, memo, useMemo, useRef } from 'react'
import { X_GRID as CONFIG, COMPONENTS } from '@config'
import { useGridCalculations, useGridDimensions } from '@hooks'
import { cx, cs, parseCSSValue, extractCSSNumber } from '@utils'
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

  const gridConfig = useMemo(() => {
    const numGap = extractCSSNumber(gap) ?? COMPONENTS.baseUnit ?? 8

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

    // Default to fixed variant
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
      '--padd-padding': padding,
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
