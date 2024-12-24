import type { CSSProperties, RefObject } from 'react'
import { memo, useMemo, useRef, useCallback } from 'react'

import { useGridDimensions, useVisibleGridLines } from '@hooks'
import { clamp, combineClassNames, combineStyles, GRID } from '@utils'
import styles from '@styles/YGrid.module.css'

import type { YGProps, YGContainerStyles, YGStyles } from './types'

export const YGrid = memo(function YGrid({
  config,
  className = '',
  style = {},
}: YGProps) {
  const {
    show = false,
    color = GRID.DEFAULTS.COLORS.Y_GRID,
    height = '100%',
    variant = GRID.VARIANTS.LINE,
    baseUnit = GRID.DEFAULTS.BASE,
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
    () =>
      combineStyles<YGContainerStyles>({
        '--grid-height': typeof height === 'number' ? `${height}px` : height,
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
      },
      style ? {
        ...style,
        '--grid-height': typeof style['--grid-height'] === 'number'
          ? `${style['--grid-height']}px`
          : style['--grid-height'],
      } as YGContainerStyles : undefined,
      ),
    [height, style, show],
  )

  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties & YGStyles> => ({
      '--row-top': `${idx * baseUnit}px`,
      '--row-color': color,
      '--row-height': variant === 'line' ? '1px' : `${baseUnit}px`,
      '--row-opacity': variant === 'flat' && idx % 2 === 0 ? '0' : '1',
    }),
    [baseUnit, color, variant],
  )

  const visibleRows = useMemo(() => {
    const rows = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      rows.push(
        <div
          key={i}
          className={combineClassNames(
            styles.row,
            variant === 'flat' && styles.flatRow,
          )}
          style={getRowStyles(i)}
          data-row-index={i}
        />,
      )
    }
    return rows
  }, [visibleRange, variant, getRowStyles])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      className={combineClassNames(
        styles.container,
        className,
        show ? styles.visible : styles.hidden,
      )}
      style={containerStyles}
      data-variant={variant}
      data-testid="ygrid-container"
    >
      {visibleRows}
    </div>
  )
})
