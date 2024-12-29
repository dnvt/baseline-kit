import type { CSSProperties, RefObject } from 'react'
import { memo, useMemo, useRef, useCallback } from 'react'
import { GRID } from '@config'
import { useGridDimensions, useVisibleGridLines } from '@hooks'
import { CSSCustomProperties } from '@types'
import { clamp, cx, cs } from '@utils'

import type { YGProps, GridLineStyles, GridFlatStyles } from './types'
import styles from './styles.module.css'

export const YGrid = memo(function YGrid({
  visibility = 'hidden',
  config,
  className = '',
  style = {},
}: YGProps) {
  const {
    color = GRID.defaults.colors.yGrid,
    height = GRID.defaults.height,
    variant = GRID.variants.line,
    baseUnit = GRID.defaults.baseUnit,
    zIndex = GRID.defaults.zIndex,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { height: containerHeight } = useGridDimensions(containerRef)

  const rowCount = useMemo(() => {
    const totalHeight = typeof height === 'number' ? height : containerHeight
    return clamp(Math.ceil(totalHeight / baseUnit), 1, 1000)
  }, [height, containerHeight, baseUnit])

  const visibleRange = useVisibleGridLines({
    totalLines: rowCount,
    lineHeight: baseUnit,
    containerRef: containerRef as RefObject<HTMLDivElement>,
  })

  const containerStyles = useMemo(
    () => {
      const baseStyles = {
        '--grid-height': typeof height === 'number' ? `${height}px` : height,
        '--grid-z-index': zIndex,
        '--grid-row-color': color,
      } as Partial<CSSCustomProperties>

      return cs(baseStyles, style)
    },
    [height, zIndex, color, style],
  )

  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties & (GridLineStyles | GridFlatStyles)> => ({
      '--grid-row-top': `${idx * baseUnit}px`,
      '--grid-row-color': color,
      '--grid-row-height': variant === 'line' ? '1px' : `${baseUnit}px`,
      '--grid-row-opacity': variant === 'flat' && idx % 2 === 0 ? '0' : '1',
    }),
    [baseUnit, color, variant],
  )


  const visibleRows = useMemo(() => {
    const rows = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      rows.push(
        <div
          key={i}
          className={cx(
            styles.row,
            variant === 'flat' && styles['flat-row'],
          )}
          style={getRowStyles(i)}
          data-row-index={i}
        />,
      )
    }
    return rows
  }, [visibleRange, variant, getRowStyles])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles['ygrid-container'],
        className,
        visibility === 'visible' ? styles.visible : styles.hidden,
      )}
      style={containerStyles}
      data-testid="ygrid-container"
      data-variant={variant}
    >
      {visibleRows}
    </div>
  )
})
