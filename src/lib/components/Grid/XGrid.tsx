import { memo, useMemo, useRef } from 'react'
import { X_GRID as CONFIG, COMPONENTS } from '@config'
import { useGridCalculations, useGridDimensions } from '@hooks'
import { cx, cs, parseCSSValue, extractCSSNumber } from '@utils'
import type { CSSCustomProperties, GridVariant } from '@types'

import type { XGProps } from './types'
import styles from './styles.module.css'

const GridColumns = memo(function GridColumns({
  count,
  variant,
}: {
  count: number;
  variant?: GridVariant;
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
        />
      ))}
    </div>
  )
})

export const XGrid = memo(function XGrid({
  config,
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
    if (variant === 'line') {
      return {
        variant: 'line' as const,
        gap: Math.max(0, numGap - 1),
      }
    }

    if (Array.isArray(columns)) {
      return {
        columns,
        gap: numGap,
        columnWidth: undefined,
      }
    }

    if (typeof columns === 'number') {
      return {
        columns,
        columnWidth,
        gap: numGap,
      }
    }

    return {
      columnWidth,
      gap: numGap,
    }
  }, [variant, columns, columnWidth, gap])

  const { gridTemplateColumns, columnsCount, calculatedGap } = useGridCalculations({
    containerWidth: width,
    config: gridConfig,
  })

  const containerStyles = useMemo(() =>
    cs({
      '--grid-template-columns': gridTemplateColumns,
      '--grid-gap': calculatedGap,
      '--grid-max-width': parseCSSValue(maxWidth),
      '--grid-columns': columnsCount,
      '--grid-justify': align,
      '--grid-padding': padding,
      '--grid-color': color,
      '--grid-z-index': zIndex,
      '--grid-column-width': variant === 'line' ? '1px' : undefined,
    } as CSSCustomProperties, style),
  [gridTemplateColumns, calculatedGap, maxWidth, columnsCount, align, padding, color, zIndex, variant, style])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles['xgrid-container'],
        className,
        visibility === 'visible' ? styles.visible : styles.hidden,
      )}
      data-testid="xgrid-container"
      data-variant={variant}
      style={containerStyles}
    >
      <GridColumns count={columnsCount} variant={variant} />
    </div>
  )
})
