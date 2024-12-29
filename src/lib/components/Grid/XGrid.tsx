import { memo, useMemo, useRef } from 'react'
import { GRID } from '@config'
import { useGridCalculations, useGridDimensions } from '@hooks'
import { cx, cs } from '@utils'
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
  visibility = 'hidden',
  config,
  className = '',
  style = {},
}: XGProps) {

  const {
    align = GRID.defaults.align,
    color = GRID.defaults.colors.xGrid,
    columns = GRID.defaults.columns,
    columnWidth = GRID.defaults.columnWidth,
    gap,
    maxWidth,
    padding,
    variant,
    zIndex = GRID.defaults.zIndex,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useGridDimensions(containerRef)

  const gridConfig = useMemo(() => {
    if (variant === 'line') {
      return {
        variant: 'line' as const,
        gap: Math.max(0, (typeof gap === 'number' ? gap : 8) - 1),
      }
    }

    if (Array.isArray(columns)) {
      return {
        columns,
        gap,
        columnWidth: undefined,
      }
    }

    if (typeof columns === 'number') {
      return {
        columns,
        columnWidth,
        gap,
      }
    }

    return {
      columnWidth,
      gap,
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
      '--grid-max-width': maxWidth,
      '--grid-columns': columnsCount,
      '--grid-justify': align,
      '--grid-padding': padding,
      '--grid-column-color': color,
      '--grid-z-index': zIndex,
      '--grid-column-width': variant === 'line' ? '1px' : undefined,
    } as Partial<CSSCustomProperties>, style),
  [gridTemplateColumns, calculatedGap, maxWidth, columnsCount, align, padding, color, zIndex, variant, style],
  )


  return (
    <div
      ref={containerRef}
      className={cx(
        styles['xgrid-container'],
        className,
        visibility === 'visible' ? styles.visible : styles.hidden,
      )}
      style={containerStyles}
      data-testid="xgrid-container"
      data-variant={variant}
    >
      <GridColumns count={columnsCount} variant={variant} />
    </div>
  )
})
