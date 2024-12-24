import { memo, useMemo, useRef } from 'react'
import { useGridCalculations, useGridDimensions } from '@hooks'
import {
  combineClassNames,
  combineStyles,
  parseResponsiveGridValue,
  GRID,
} from '@utils'

import type { XGProps, XGStyles } from './types'
import styles from '@styles/XGrid.module.css'

export const XGrid = memo(function XGrid({
  config,
  className = '',
  style = {},
}: XGProps) {
  const {
    show = false,
    align = GRID.DEFAULTS.ALIGN,
    color = GRID.DEFAULTS.COLORS.X_GRID,
    columns = GRID.DEFAULTS.COLUMNS,
    columnWidth = GRID.DEFAULTS.COLUMN_WIDTH,
    gap,
    maxWidth = GRID.DEFAULTS.MAX_WIDTH,
    padding,
    variant,
    baseUnit = GRID.DEFAULTS.BASE,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useGridDimensions(containerRef)

  const adjustedGap = useMemo(() => {
    if (variant === 'line') {
      const baseGap = typeof gap === 'number' ? gap : baseUnit
      return Math.max(0, baseGap - 1)
    }
    return gap
  }, [variant, gap, baseUnit])

  const gridConfig = useMemo(() => {
    if (variant === 'line') {
      return {
        variant: 'line' as const,
        gap: adjustedGap,
        baseUnit,
      }
    }

    if (Array.isArray(columns)) {
      return {
        columns,
        gap: adjustedGap,
        baseUnit,
      }
    }

    if (typeof columns === 'number') {
      return {
        columns,
        columnWidth,
        gap: adjustedGap,
        baseUnit,
      }
    }

    return {
      columnWidth: columnWidth,
      gap: adjustedGap,
      baseUnit,
    }
  }, [variant, columns, columnWidth, adjustedGap, baseUnit])


  const { gridTemplateColumns, columnsCount, calculatedGap } =
    useGridCalculations({
      containerWidth: width,
      config: gridConfig,
    })

  const containerStyles = useMemo(() => {
    const styles: Partial<XGStyles> = {
      '--grid-template-columns': gridTemplateColumns,
      '--grid-gap': calculatedGap,
      '--grid-max-width': parseResponsiveGridValue(maxWidth),
      '--grid-columns': columnsCount,
      '--grid-justify': align,
      '--grid-padding': padding,
      '--column-color': color,
    }

    if (variant === 'line') {
      styles['--column-width'] = '1px'
    }

    return combineStyles(styles, style)
  }, [
    gridTemplateColumns,
    calculatedGap,
    maxWidth,
    columnsCount,
    align,
    padding,
    color,
    style,
    variant,
  ])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      className={combineClassNames(styles.container, className)}
      style={containerStyles}
      data-testid="xgrid-container"
      data-variant={variant}
    >
      <div className={styles.columnsContainer}>
        {Array.from({ length: columnsCount }).map((_, i) => (
          <div
            key={i}
            className={combineClassNames(
              styles.column,
              variant === 'line' && styles.lineColumn,
            )}
            data-column-index={i}
          />
        ))}
      </div>
    </div>
  )
})
